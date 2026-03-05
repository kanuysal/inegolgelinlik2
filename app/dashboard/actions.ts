'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { notifyNewMessage } from '@/lib/notify'

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

  // Change status from archived to pending_review (requires re-approval)
  const { error } = await supabase
    .from('listings')
    .update({
      status: 'pending_review',
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
  const admin = await adminDb()

  // Fetch conversations with listings and messages (no profile FK join — it doesn't exist)
  const { data, error } = await admin
    .from('conversations')
    .select(`
      *,
      listings(title, images, price),
      messages(content, sender_id, created_at, is_read)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error || !data) return []

  // Collect all unique user IDs we need profiles for
  const userIds = Array.from(new Set(data.flatMap((c: any) => [c.buyer_id, c.seller_id])))

  // Fetch profiles separately
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds)

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  // Add otherPerson field for easier UI access
  return data.map((conv: any) => {
    const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
    return {
      ...conv,
      otherPerson: profileMap.get(otherId) || null,
    }
  })
}

export async function getConversationMessages(conversationId: string) {
  const user = await requireAuth()
  const admin = await adminDb()

  // Verify user is participant
  const { data: conv } = await admin
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return []
  }

  // Mark unread messages as read (admin client to bypass RLS)
  await admin
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  const { data, error } = await admin
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
  const admin = await adminDb()

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

  // Use admin client to insert message (bypasses RLS trigger issues)
  const { error: msgError } = await admin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })

  if (msgError) return { error: msgError.message }

  // Update conversation timestamp (admin client to bypass missing UPDATE policy)
  await admin
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

  revalidatePath('/dashboard')
  return { success: true }
}

// ── Unread Message Count (for navbar badge) ────────────────
export async function getUnreadMessageCount() {
  try {
    const supabase = await db()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    // Get all conversations this user is part of
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

    if (!conversations || conversations.length === 0) return 0

    const convIds = conversations.map((c: any) => c.id)

    // Count unread messages not sent by this user
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    return count || 0
  } catch {
    return 0
  }
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

  // First, cleanup notifications for deleted/expired listings
  await cleanupExpiredNotifications(user.id, supabase)

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data || []
}

async function cleanupExpiredNotifications(userId: string, supabase: any) {
  try {
    // Get all notifications for this user that reference a listing
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, listing_id')
      .eq('user_id', userId)
      .not('listing_id', 'is', null)

    if (!notifications || notifications.length === 0) return

    // Get all listing IDs from notifications
    const listingIds = Array.from(new Set(notifications.map((n: any) => n.listing_id).filter(Boolean)))

    // Check which listings still exist and are approved
    const { data: validListings } = await supabase
      .from('listings')
      .select('id')
      .in('id', listingIds)
      .eq('status', 'approved')

    const validListingIds = new Set(validListings?.map((l: any) => l.id) || [])

    // Find notifications for expired/deleted listings
    const expiredNotificationIds = notifications
      .filter((n: any) => n.listing_id && !validListingIds.has(n.listing_id))
      .map((n: any) => n.id)

    // Delete expired notifications
    if (expiredNotificationIds.length > 0) {
      await supabase
        .from('notifications')
        .delete()
        .in('id', expiredNotificationIds)

      console.log(`Cleaned up ${expiredNotificationIds.length} expired notifications`)
    }
  } catch (error) {
    console.error('Error cleaning up notifications:', error)
  }
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
