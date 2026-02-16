'use server'

import { createClient } from '@/lib/supabase/server'

async function db() {
  return (await createClient()) as any
}

export async function getApprovedListings() {
  try {
    const supabase = await db()

    const { data, error } = await supabase
      .from('listings')
      .select('*, products(style_name, sku, images, msrp)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return null
    return data
  } catch {
    return null
  }
}

export async function getListingById(id: string) {
  try {
    const supabase = await db()

    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        products(style_name, sku, images, msrp, silhouette, train_style, category),
        profiles(display_name, full_name)
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
    const supabase = await db()

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Please sign in to contact the seller' }

    if (user.id === sellerId) return { error: 'You cannot message yourself' }

    // Check for existing conversation
    const { data: existing } = await supabase
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
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select('id')
        .single()

      if (convError || !conv) return { error: 'Failed to create conversation' }
      conversationId = conv.id
    }

    // Send the message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: message.trim(),
      })

    if (msgError) return { error: msgError.message }

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return { success: true, conversationId }
  } catch {
    return { error: 'Something went wrong' }
  }
}
