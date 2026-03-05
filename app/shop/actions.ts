'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notifyNewMessage } from '@/lib/notify'

async function db() {
  return (await createClient()) as any
}

async function publicDb() {
  return (await createAdminClient()) as any
}

export async function getApprovedListings() {
  try {
    const supabase = await publicDb()

    const { data, error } = await supabase
      .from('listings')
      .select('*, products(style_name, sku, images, msrp, stockist_data)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(500)

    if (error || !data || data.length === 0) return null
    return data
  } catch {
    return null
  }
}

export async function getListingById(id: string) {
  try {
    const supabase = await publicDb()

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        products(style_name, sku, images, msrp, silhouette, train_style, category, description, stockist_id, stockist_data)
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function getRelatedListings(listingId: string, category: string, limit = 4) {
  try {
    const supabase = await publicDb()

    const { data } = await supabase
      .from('listings')
      .select('id, title, price, msrp, images, category, condition, size_us')
      .eq('status', 'approved')
      .eq('category', category)
      .neq('id', listingId)
      .limit(limit)

    return data || []
  } catch {
    return []
  }
}

export async function startConversation(listingId: string, sellerId: string, message: string) {
  try {
    const supabase = await db()
    const admin = await publicDb()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Please sign in to contact the seller' }

    if (user.id === sellerId) return { error: 'You cannot message yourself' }

    // Validate UUID format
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(listingId) || !UUID_RE.test(sellerId)) {
      return { error: 'Invalid parameters' }
    }

    // Validate message length
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return { error: 'Message cannot be empty' }
    if (trimmedMessage.length > 5000) return { error: 'Message too long' }

    // Verify the sellerId actually owns this listing (prevents IDOR)
    const { data: verifiedListing } = await admin
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .eq('status', 'approved')
      .single()

    if (!verifiedListing || verifiedListing.seller_id !== sellerId) {
      return { error: 'Invalid listing or seller' }
    }

    // Check for existing conversation (use admin to avoid RLS issues)
    const { data: existing } = await admin
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .single()

    let conversationId: string

    if (existing) {
      conversationId = existing.id
    } else {
      const { data: conv, error: convError } = await admin
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (convError || !conv) {
        console.error('Conversation insert failed:', convError?.message, convError?.code)
        return { error: 'Failed to create conversation. Please try again.' }
      }
      conversationId = conv.id
    }

    // Send the message (use admin client to bypass RLS trigger issues)
    const { error: msgError } = await admin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimmedMessage,
      })

    if (msgError) {
      console.error('Message insert failed:', msgError.message, msgError.code)
      return { error: 'Failed to send message. Please try again.' }
    }

    // Update conversation timestamp
    await admin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Notify seller about the inquiry (non-blocking)
    const { data: listing } = await admin
      .from('listings')
      .select('title')
      .eq('id', listingId)
      .single()
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    notifyNewMessage({
      recipientId: sellerId,
      senderName: buyerProfile?.display_name || 'A buyer',
      listingTitle: listing?.title || 'your gown',
      messagePreview: trimmedMessage,
      conversationLink: '/dashboard?tab=messages',
    }).catch(() => {})

    return { success: true, conversationId }
  } catch (err) {
    console.error('startConversation threw:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
