'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { notifyNewMessage } from '@/lib/notify'
import * as kustomer from '@/lib/kustomer'

async function db() {
  return (await createClient()) as any
}

async function adminDb() {
  return createAdminClient() as any
}

// ── My Listings ──────────────────────────────────────────────
export async function getMyListings() {
  const user = await requireAuth()
  const supabase = await db()

  const { data, error } = await supabase
    .from('listings')
    .select('*, products(style_name, sku)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function deleteListing(listingId: string) {
  const user = await requireAuth()
  const supabase = await adminDb() // Use admin client to bypass RLS

  // Only allow deleting drafts, rejected, or archived listings
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .in('status', ['draft', 'rejected', 'archived'])

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

export async function unpublishListing(listingId: string) {
  const user = await requireAuth()
  const supabase = await adminDb() // Use admin client to bypass RLS

  // Change status from approved to archived (hidden from shop)
  const { error } = await supabase
    .from('listings')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString()
    })
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .eq('status', 'approved')

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

export async function republishListing(listingId: string) {
  const user = await requireAuth()
  const supabase = await adminDb() // Use admin client to bypass RLS

  // Change status from archived back to approved
  const { error } = await supabase
    .from('listings')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString()
    })
    .eq('id', listingId)
    .eq('seller_id', user.id)
    .eq('status', 'archived')

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

// ── My Purchases (Orders as buyer) ──────────────────────────
export async function getMyPurchases() {
  const user = await requireAuth()
  const supabase = await db()

  const { data, error } = await supabase
    .from('orders')
    .select('*, listings(title, images, category)')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ── My Sales (Orders as seller) ─────────────────────────────
export async function getMySales() {
  const user = await requireAuth()
  const supabase = await db()

  const { data, error } = await supabase
    .from('orders')
    .select('*, listings(title, images, category)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// ── Messages / Conversations ────────────────────────────────
export async function getMyConversations() {
  const user = await requireAuth()
  const supabase = await db()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listings(title, images, price),
      messages(content, sender_id, created_at, is_read),
      buyer:profiles!conversations_buyer_id_fkey(id, display_name, avatar_url),
      seller:profiles!conversations_seller_id_fkey(id, display_name, avatar_url)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })

  if (error) return []

  // Add otherPerson field for easier UI access
  return data.map((conv: any) => ({
    ...conv,
    otherPerson: conv.buyer_id === user.id ? conv.seller : conv.buyer
  }))
}

export async function getConversationMessages(conversationId: string) {
  const user = await requireAuth()
  const supabase = await db()

  // Verify user is participant
  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return []
  }

  // Mark unread messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) return []
  return data
}

export async function sendMessage(conversationId: string, content: string) {
  const user = await requireAuth()
  const supabase = await db()

  const trimmed = content.trim()
  if (!trimmed) return { error: 'Message cannot be empty' }
  if (trimmed.length > 5000) return { error: 'Message too long' }

  // Verify participant
  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return { error: 'Unauthorized' }
  }

  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })

  if (msgError) return { error: msgError.message }

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  // Notify the other participant (non-blocking)
  const recipientId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
  const { data: listing } = await supabase
    .from('conversations')
    .select('listings(title)')
    .eq('id', conversationId)
    .single()
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  notifyNewMessage({
    recipientId,
    senderName: senderProfile?.display_name || 'Someone',
    listingTitle: listing?.listings?.title || 'a gown',
    messagePreview: trimmed,
    conversationLink: '/dashboard?tab=messages',
  }).catch(() => {}) // Best-effort

  // Forward to Kustomer CRM (non-blocking)
  ;(async () => {
    const { data: convData } = await supabase
      .from('conversations')
      .select('kustomer_conversation_id')
      .eq('id', conversationId)
      .single()
    const kConvId = convData?.kustomer_conversation_id
    if (kConvId) {
      await kustomer.sendMessage({
        conversationId: kConvId,
        message: trimmed,
      })
    }
  })().catch(() => {})

  revalidatePath('/dashboard')
  return { success: true }
}

// ── Profile ─────────────────────────────────────────────────
export async function getMyProfile() {
  const user = await requireAuth()
  const supabase = await db()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...data, email: user.email }
}

export async function updateProfile(formData: FormData) {
  const user = await requireAuth()
  const supabase = await db()

  const updates: Record<string, any> = {}
  const displayName = (formData.get('display_name') as string)?.trim()?.slice(0, 50)
  const fullName = (formData.get('full_name') as string)?.trim()?.slice(0, 100)
  const phone = (formData.get('phone') as string)?.trim()?.slice(0, 20)

  if (displayName !== undefined) updates.display_name = displayName || null
  if (fullName !== undefined) updates.full_name = fullName || null
  if (phone !== undefined) updates.phone = phone || null
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

// ── Notifications ───────────────────────────────────────────
export async function getMyNotifications() {
  const user = await requireAuth()
  const supabase = await db()

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data || []
}

export async function markNotificationRead(notificationId: string) {
  const user = await requireAuth()
  const supabase = await db()

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}
