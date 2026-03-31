'use server'

/**
 * RE:GALIA — Checkout Server Actions
 * ===================================
 * Handles Stripe Checkout session creation and order management.
 * Flow: Buyer clicks "Buy Now" → createCheckoutSession → Stripe hosted page
 *       → Stripe webhook confirms payment → order status updated
 */
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe, calculateCommission, toCents } from '@/lib/stripe'
import { rateLimit } from '@/lib/rate-limit'

async function db() {
  return (await createClient()) as any
}

function adminDb() {
  return createAdminClient() as any
}

/**
 * Create a Stripe Checkout session for purchasing a listing.
 * Returns the Stripe Checkout URL to redirect the buyer to.
 */
export async function createCheckoutSession(listingId: string) {
  try {
    const supabase = await db()
    const admin = adminDb()

    // 1. Authenticate buyer
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Please sign in to make a purchase' }

    // Rate limit: 5 checkout attempts per minute
    const allowed = await rateLimit({ key: `checkout:${user.id}`, limit: 5, windowSeconds: 60 })
    if (!allowed) return { error: 'Too many attempts. Please wait a moment.' }

    // 2. Validate UUID
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_RE.test(listingId)) return { error: 'Invalid listing' }

    // 3. Fetch the listing (must be approved and not sold)
    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, title, description, price, images, seller_id, status, category, listing_type, products(style_name)')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) return { error: 'Listing not found' }
    if (listing.status !== 'approved') return { error: 'This gown is no longer available' }
    if (listing.listing_type !== 'brand_direct') return { error: 'Online checkout is only available for Galia Lahav direct listings' }
    if (listing.seller_id === user.id) return { error: 'You cannot purchase your own listing' }

    // M5: Validate price is within expected range ($50-$50,000)
    if (typeof listing.price !== 'number' || listing.price < 50 || listing.price > 50000) {
      return { error: 'Listing price is outside the allowed range' }
    }

    // 4. Check for existing pending orders on this listing (M3: idempotency)
    const { data: existingOrder } = await admin
      .from('orders')
      .select('id, status')
      .eq('listing_id', listingId)
      .in('status', ['pending', 'confirmed', 'shipped'])
      .single()

    if (existingOrder) return { error: 'This gown already has a pending order' }

    // 5. Calculate commission
    const { total, commissionRate, commissionAmount, sellerPayout } = calculateCommission(listing.price)

    // 6. Create the order in 'pending' status
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        status: 'pending',
        total,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        seller_payout: sellerPayout,
        payout_status: 'pending',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      console.error('[checkout] Order creation failed:', orderError)
      return { error: 'Failed to create order. Please try again.' }
    }

    // 7. Get the first listing image for Stripe
    const imageUrl = listing.images?.[0] || undefined
    const productName = listing.products?.style_name
      ? `${listing.products.style_name} — ${listing.title}`
      : listing.title

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://regalia-scroll.vercel.app'

    // 8. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: toCents(total),
            product_data: {
              name: productName,
              description: listing.description?.slice(0, 500) || `Pre-loved Galia Lahav ${listing.category} gown`,
              images: imageUrl ? [imageUrl] : [],
            },
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: [
          'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE',
          'AT', 'CH', 'SE', 'DK', 'NO', 'FI', 'IE', 'PT', 'IL', 'AE',
        ],
      },
      metadata: {
        order_id: order.id,
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: listing.seller_id,
      },
      success_url: `${siteUrl}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop/${listingId}?checkout=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
    })

    // 9. Store the checkout session ID on the order
    await admin
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id)

    return { url: session.url }
  } catch (err) {
    console.error('[checkout] Unexpected error:', err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/**
 * Get order details after successful checkout.
 * Called from the success page with the Stripe session ID.
 */
export async function getOrderBySession(sessionId: string) {
  try {
    const supabase = await db()
    const admin = adminDb()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: order } = await admin
      .from('orders')
      .select('*, listings(title, images, category, products(style_name))')
      .eq('stripe_checkout_session_id', sessionId)
      .eq('buyer_id', user.id)
      .single()

    return order || null
  } catch {
    return null
  }
}
