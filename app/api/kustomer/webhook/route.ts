/**
 * Kustomer → RE:GALIA Webhook
 * ============================
 * Receives outbound messages from Kustomer (CS agent replies)
 * and inserts them into the Supabase conversation thread so
 * buyers see them on the website.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyNewMessage } from '@/lib/notify'
import { verifyWebhookSignature } from '@/lib/kustomer'
import { rateLimit } from '@/lib/rate-limit'

/** Strip HTML tags from webhook message content to prevent stored XSS */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit BEFORE reading body to prevent resource exhaustion
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    const allowed = await rateLimit({
      key: `kustomer-webhook:${ip}`,
      limit: 60,
      windowSeconds: 60,
    })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many webhook requests' }, { status: 429 })
    }

    // Validate content type
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
    }

    // Reject oversized payloads (legitimate Kustomer webhooks are < 10KB)
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10)
    if (contentLength > 64 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    const body = await req.text()
    if (body.length > 64 * 1024) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    // Verify webhook authenticity – fail closed if secret is not configured
    const secret = process.env.KUSTOMER_WEBHOOK_SECRET
    if (!secret) {
      console.error('[Kustomer Webhook] Missing KUSTOMER_WEBHOOK_SECRET – refusing request')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Reject missing signatures before doing any crypto work
    const signature = req.headers.get('x-kustomer-signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    if (!verifyWebhookSignature(body, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    // Kustomer webhook payload structure:
    // payload.data.type — event type
    // payload.data.attributes.meta.body — message body
    // payload.data.relationships.conversation.data.id — Kustomer conversation ID
    // payload.data.attributes.direction — "out" for agent replies
    const attributes = payload?.data?.attributes
    const direction = attributes?.direction

    // Only process outbound messages (agent → customer)
    if (direction !== 'out') {
      return NextResponse.json({ ok: true, skipped: 'not outbound' })
    }

    const messageBody =
      attributes?.meta?.body ||
      attributes?.preview ||
      ''

    if (!messageBody.trim()) {
      return NextResponse.json({ ok: true, skipped: 'empty message' })
    }

    const kustomerConvId =
      payload?.data?.relationships?.conversation?.data?.id

    if (!kustomerConvId) {
      return NextResponse.json({ error: 'No conversation ID' }, { status: 400 })
    }

    // Look up the matching Supabase conversation
    const supabase = createAdminClient() as any

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, buyer_id, seller_id, listings(title)')
      .eq('kustomer_conversation_id', kustomerConvId)
      .single()

    if (convError || !conv) {
      console.error('[Kustomer Webhook] Conversation not found for:', kustomerConvId)
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Insert the CS agent's message as the seller side
    // Strip HTML to prevent stored XSS from webhook content
    const sanitizedMessage = stripHtml(messageBody)
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: conv.seller_id,
        content: sanitizedMessage,
      })

    if (msgError) {
      console.error('[Kustomer Webhook] Message insert failed:', msgError.message)
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conv.id)

    // Notify the buyer about the new reply (non-blocking)
    notifyNewMessage({
      recipientId: conv.buyer_id,
      senderName: 'RE:GALIA Support',
      listingTitle: conv.listings?.title || 'your gown',
      messagePreview: sanitizedMessage,
      conversationLink: '/dashboard?tab=messages',
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Kustomer Webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
