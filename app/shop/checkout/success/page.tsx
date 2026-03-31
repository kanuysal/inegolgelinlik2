'use client'

/**
 * Checkout Success Page
 * /shop/checkout/success?session_id=...
 *
 * Shown after a successful Stripe Checkout payment.
 * Fetches order details and displays confirmation.
 */
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { getOrderBySession } from '../../checkout-actions'
import { thumb } from '@/lib/image'

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }
    getOrderBySession(sessionId).then((data) => {
      setOrder(data)
      setLoading(false)
    })
  }, [sessionId])

  return (
    <div className="min-h-screen bg-white text-[#1c1c1c]">
      <Navbar />

      <div className="max-w-[600px] mx-auto px-6 pt-40 pb-32">
        {loading ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1c1c1c]/10 border-t-[#1c1c1c] rounded-full animate-spin mx-auto" />
            <p className="mt-6 font-sans text-sm text-[#1c1c1c]/50">Loading your order...</p>
          </div>
        ) : !order ? (
          <div className="text-center">
            <h1 className="font-serif text-3xl mb-4">Order Not Found</h1>
            <p className="font-sans text-sm text-[#1c1c1c]/60 mb-8">
              We couldn't find your order. If you just completed checkout, please allow a moment for processing.
            </p>
            <Link
              href="/dashboard?tab=purchases"
              className="inline-block py-4 px-8 bg-[#1c1c1c] text-white font-sans text-[11px] uppercase tracking-[0.15em] hover:bg-[#333] transition-colors"
            >
              View My Purchases
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Success icon */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#D4AF37]">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="font-serif text-3xl mb-3">Order Confirmed</h1>
              <p className="font-sans text-sm text-[#1c1c1c]/60">
                Thank you for your purchase. The seller has been notified and will ship your gown soon.
              </p>
            </div>

            {/* Order summary */}
            <div className="border border-[#1c1c1c]/5 p-8 mb-8">
              <div className="flex gap-6">
                {order.listings?.images?.[0] && (
                  <div className="w-24 h-32 flex-shrink-0 bg-[#FAF9F6] overflow-hidden">
                    <Image
                      src={thumb(order.listings.images[0])}
                      alt={order.listings.title}
                      width={96}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/40 mb-1">
                    {order.listings?.products?.style_name || order.listings?.category || 'Gown'}
                  </p>
                  <h2 className="font-serif text-lg mb-3">{order.listings?.title || 'Galia Lahav Gown'}</h2>
                  <p className="font-sans text-xl font-light">{fmt(order.total)}</p>
                </div>
              </div>

              {order.shipping_address && (
                <div className="mt-6 pt-6 border-t border-[#1c1c1c]/5">
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#1c1c1c]/40 mb-2">Ships To</p>
                  <p className="font-sans text-sm text-[#1c1c1c]/70 leading-relaxed">
                    {[
                      order.shipping_address.name,
                      order.shipping_address.line1,
                      order.shipping_address.line2,
                      `${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`,
                      order.shipping_address.country,
                    ]
                      .filter(Boolean)
                      .join('\n')
                      .split('\n')
                      .map((line: string, i: number) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[#1c1c1c]/5">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-[#1c1c1c]/50">Status</span>
                  <span className="uppercase tracking-[0.1em] text-[11px] text-[#D4AF37] font-medium">
                    {order.status === 'confirmed' ? 'Confirmed' : order.status === 'pending' ? 'Processing' : order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/dashboard?tab=purchases"
                className="block w-full py-4 bg-[#1c1c1c] text-white font-sans text-[11px] text-center uppercase tracking-[0.15em] hover:bg-[#333] transition-colors"
              >
                View My Purchases
              </Link>
              <Link
                href="/shop"
                className="block w-full py-4 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[11px] text-center uppercase tracking-[0.15em] hover:border-[#1c1c1c]/30 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
