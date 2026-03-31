/**
 * RE:GALIA — Stripe Webhook Handler
 * ==================================
 * POST /api/stripe/webhooks
 *
 * Handles payment lifecycle events from Stripe:
 *   - checkout.session.completed  → confirm order, update listing to sold
 *   - checkout.session.expired    → cancel pending order
 *   - charge.refunded             → mark order as refunded
 *
 * Security:
 *   - Validates webhook signature (STRIPE_WEBHOOK_SECRET)
 *   - Idempotent via stripe_webhook_events table
 *   - Uses admin client (bypasses RLS)
 */
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { notifyOrderConfirmed, notifyNewSale, notifyOrderRefunded } from '@/lib/notify-orders'
import type Stripe from 'stripe'

function adminDb() {
  return createAdminClient() as any
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // Verify webhook signature
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = adminDb()

  // Idempotency check — skip if we already processed this event
  const { data: existing } = await admin
    .from('stripe_webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Log the event for idempotency
  await admin.from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event.data.object as any,
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        console.log(`[stripe-webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[stripe-webhook] Error handling ${event.type}:`, err)
    // Still return 200 to prevent Stripe from retrying
    // The error is logged and can be investigated
  }

  return NextResponse.json({ received: true })
}

/**
 * Handle successful checkout — confirm order and mark listing as sold.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const admin = adminDb()
  const orderId = session.metadata?.order_id
  const listingId = session.metadata?.listing_id

  if (!orderId || !listingId) {
    console.error('[stripe-webhook] Missing metadata in checkout session:', session.id)
    return
  }

  // M2: Validate UUID format from metadata
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(orderId) || !UUID_RE.test(listingId)) {
    console.error('[stripe-webhook] Invalid UUID in metadata:', { orderId, listingId })
    return
  }

  // Extract shipping details from collected_information
  const shippingDetails = (session as any).collected_information?.shipping_details
    || (session as any).shipping_details

  // Update order to confirmed with payment details
  const { error: orderError } = await admin
    .from('orders')
    .update({
      status: 'confirmed',
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
      shipping_address: shippingDetails?.address
        ? {
            name: shippingDetails.name,
            line1: shippingDetails.address.line1,
            line2: shippingDetails.address.line2,
            city: shippingDetails.address.city,
            state: shippingDetails.address.state,
            postal_code: shippingDetails.address.postal_code,
            country: shippingDetails.address.country,
          }
        : null,
    })
    .eq('id', orderId)
    .eq('status', 'pending')

  if (orderError) {
    console.error('[stripe-webhook] Failed to update order:', orderError)
    return
  }

  // Mark listing as sold
  await admin
    .from('listings')
    .update({ status: 'sold', updated_at: new Date().toISOString() })
    .eq('id', listingId)

  // Fetch order details for notifications
  const { data: order } = await admin
    .from('orders')
    .select('*, listings(title)')
    .eq('id', orderId)
    .single()

  if (order) {
    // Notify buyer (order confirmed)
    notifyOrderConfirmed({
      buyerId: order.buyer_id,
      orderId: order.id,
      listingTitle: order.listings?.title || 'Galia Lahav Gown',
      total: order.total,
    }).catch(() => {})

    // Notify seller (new sale!)
    notifyNewSale({
      sellerId: order.seller_id,
      orderId: order.id,
      listingTitle: order.listings?.title || 'Galia Lahav Gown',
      sellerPayout: order.seller_payout,
      shippingAddress: order.shipping_address,
    }).catch(() => {})
  }

  console.log(`[stripe-webhook] Order ${orderId} confirmed, listing ${listingId} marked sold`)
}

/**
 * Handle expired checkout — cancel the pending order.
 */
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const admin = adminDb()
  const orderId = session.metadata?.order_id

  if (!orderId) return

  // Cancel the pending order
  await admin
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)
    .eq('status', 'pending')

  console.log(`[stripe-webhook] Order ${orderId} cancelled (checkout expired)`)
}

/**
 * Handle refund — update order status.
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const admin = adminDb()
  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) return

  // Find the order by payment intent
  const { data: order } = await admin
    .from('orders')
    .select('id, listing_id, buyer_id, seller_id, listings(title)')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!order) {
    console.error('[stripe-webhook] No order found for payment intent:', paymentIntentId)
    return
  }

  // Update order to refunded
  await admin
    .from('orders')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      stripe_charge_id: charge.id,
      payout_status: 'failed',
    })
    .eq('id', order.id)

  // Re-open the listing (make it available again)
  await admin
    .from('listings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', order.listing_id)

  // Notify buyer about refund
  notifyOrderRefunded({
    buyerId: order.buyer_id,
    orderId: order.id,
    listingTitle: order.listings?.title || 'Galia Lahav Gown',
  }).catch(() => {})

  console.log(`[stripe-webhook] Order ${order.id} refunded, listing ${order.listing_id} re-listed`)
}
