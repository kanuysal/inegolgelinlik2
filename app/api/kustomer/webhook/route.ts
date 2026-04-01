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
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/** Strip HTML tags and dangerous protocols from webhook message content to prevent stored XSS (M2 fix) */
function stripHtml(str: string): string {
  let cleaned = str
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities BEFORE checking for dangerous protocols
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/gi, '&')
    // Remove null bytes and control characters that can break regex matching
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
  // Now strip dangerous protocols (after entity decoding)
  cleaned = cleaned
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
  return cleaned.trim()
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit BEFORE reading body to prevent resource exhaustion (H3 fix: use trusted IP source)
    const ip = getClientIp(req)
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

    // Verify webhook authenticity via secret token in URL query param,
    // custom header, or Bearer token (whichever Kustomer sends).
    const secret = process.env.KUSTOMER_WEBHOOK_SECRET
    if (!secret) {
      console.error('[Kustomer Webhook] Missing KUSTOMER_WEBHOOK_SECRET – refusing request')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Only accept token from headers — never from URL params (prevents leaking in logs/referrer)
    const token =
      req.headers.get('x-webhook-secret') ||
      req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token || token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    // H2 fix: Idempotency — deduplicate by Kustomer message ID to prevent replay attacks
    const kustomerMessageId = payload?.data?.id
    if (kustomerMessageId) {
      const supabaseCheck = createAdminClient() as any
      // Check if we've already processed this webhook message
      const { data: existing } = await supabaseCheck
        .from('messages')
        .select('id')
        .eq('kustomer_message_id', kustomerMessageId)
        .maybeSingle()
      if (existing) {
        return NextResponse.json({ ok: true, duplicate: true })
      }
    }

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
      // Return 200 to acknowledge receipt — prevents Kustomer from retrying endlessly
      return NextResponse.json({ ok: true, skipped: 'conversation not linked' })
    }

    // Insert the CS agent's message as the seller side
    // Strip HTML to prevent stored XSS from webhook content + truncate to 5000 chars (M1)
    const sanitizedMessage = stripHtml(messageBody).slice(0, 5000)
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_id: conv.seller_id,
        content: sanitizedMessage,
        ...(kustomerMessageId ? { kustomer_message_id: kustomerMessageId } : {}),
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
