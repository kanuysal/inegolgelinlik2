/**
 * RE:GALIA — Stripe Integration
 * ==============================
 * Server-side Stripe client and helpers.
 * Uses Stripe Checkout for payments (hosted page, full PCI compliance).
 *
 * Environment Variables:
 *   STRIPE_SECRET_KEY       — Stripe secret key (sk_test_... or sk_live_...)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Stripe publishable key (pk_test_... or pk_live_...)
 *   STRIPE_WEBHOOK_SECRET   — Webhook endpoint signing secret (whsec_...)
 */
import Stripe from 'stripe'

// H3: Lazy Stripe initialization — throws at usage time if key is missing
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('[stripe] STRIPE_SECRET_KEY is not set — cannot process payments. Set this env var.')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
      appInfo: {
        name: 'RE:GALIA',
        version: '1.0.0',
        url: 'https://regalia-scroll.vercel.app',
      },
    })
  }
  return _stripe
}

/** Stripe client — throws if STRIPE_SECRET_KEY is not configured */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})

/** Commission rate (15%) */
export const COMMISSION_RATE = 15.00

/**
 * Calculate commission breakdown for an order.
 */
export function calculateCommission(price: number) {
  const total = price
  const commissionAmount = Math.round(total * (COMMISSION_RATE / 100) * 100) / 100
  const sellerPayout = Math.round((total - commissionAmount) * 100) / 100
  return {
    total,
    commissionRate: COMMISSION_RATE,
    commissionAmount,
    sellerPayout,
  }
}

/**
 * Convert dollars to Stripe cents (integer).
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}
