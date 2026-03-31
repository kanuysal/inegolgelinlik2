'use server'

/**
 * RE:GALIA — Order Management Actions
 * ====================================
 * Seller: update tracking, mark shipped
 * Admin: refund orders, mark payouts complete
 */
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireAuth, hasRole } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import { rateLimit } from '@/lib/rate-limit'

async function db() {
  return (await createClient()) as any
}

function adminDb() {
  return createAdminClient() as any
}

// ── Seller: Add Tracking Number ────────────────────────────────

export async function updateTrackingNumber(orderId: string, trackingNumber: string) {
  const user = await requireAuth()
  const admin = adminDb()

  // Rate limit
  const allowed = await rateLimit({ key: `tracking:${user.id}`, limit: 10, windowSeconds: 60 })
  if (!allowed) return { error: 'Too many attempts. Please wait.' }

  const trimmed = trackingNumber.trim()
  if (!trimmed) return { error: 'Please enter a tracking number' }
  if (trimmed.length > 100) return { error: 'Tracking number too long' }

  // Verify seller owns this order and it's in confirmed status
  const { data: order } = await admin
    .from('orders')
    .select('id, seller_id, status')
    .eq('id', orderId)
    .eq('seller_id', user.id)
    .single()

  if (!order) return { error: 'Order not found' }
  if (order.status !== 'confirmed' && order.status !== 'shipped') {
    return { error: 'Order cannot be updated in its current status' }
  }

  const { error } = await admin
    .from('orders')
    .update({
      tracking_number: trimmed,
      status: 'shipped',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) {
    console.error('[order-actions] Failed to update tracking:', error)
    return { error: 'Failed to update. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

// ── Seller: Mark as Delivered ──────────────────────────────────

export async function markOrderDelivered(orderId: string) {
  const user = await requireAuth()
  const admin = adminDb()

  const { data: order } = await admin
    .from('orders')
    .select('id, seller_id, status')
    .eq('id', orderId)
    .eq('seller_id', user.id)
    .single()

  if (!order) return { error: 'Order not found' }
  if (order.status !== 'shipped') return { error: 'Order must be shipped first' }

  const { error } = await admin
    .from('orders')
    .update({
      status: 'delivered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) return { error: 'Failed to update. Please try again.' }

  revalidatePath('/dashboard')
  return { success: true }
}

// ── Admin: Issue Refund via Stripe ─────────────────────────────

export async function adminRefundOrder(orderId: string, reason: string) {
  const user = await requireAuth()
  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) return { error: 'Unauthorized' }

  const admin = adminDb()

  const { data: order } = await admin
    .from('orders')
    .select('id, stripe_payment_intent_id, status, listing_id')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Order not found' }
  if (order.status === 'refunded') return { error: 'Order is already refunded' }
  if (order.status === 'cancelled') return { error: 'Order is already cancelled' }

  if (!order.stripe_payment_intent_id) {
    return { error: 'No payment found for this order (manual cancellation needed)' }
  }

  try {
    // Issue refund via Stripe
    await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      reason: 'requested_by_customer',
    })

    // The webhook will handle status updates, but also update directly for immediate feedback
    await admin
      .from('orders')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_reason: reason.slice(0, 500),
        payout_status: 'failed',
      })
      .eq('id', orderId)

    // Re-list the gown
    await admin
      .from('listings')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', order.listing_id)

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error('[order-actions] Stripe refund failed:', err)
    return { error: 'Refund failed. Please try via Stripe Dashboard.' }
  }
}

// ── Admin: Mark Payout Complete ────────────────────────────────

export async function adminMarkPayoutComplete(orderId: string) {
  const user = await requireAuth()
  const isAdmin = await hasRole(user.id, 'admin')
  if (!isAdmin) return { error: 'Unauthorized' }

  const admin = adminDb()

  const { error } = await admin
    .from('orders')
    .update({
      payout_status: 'paid',
      payout_completed_at: new Date().toISOString(),
      status: 'completed',
    })
    .eq('id', orderId)
    .in('status', ['delivered', 'shipped', 'confirmed'])

  if (error) return { error: 'Failed to update payout status' }

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  return { success: true }
}
