/**
 * RE:GALIA — Order Notification Helpers
 * ======================================
 * Email + in-app notifications for the purchase flow.
 * Follows the same pattern as notify.ts (Resend REST API, non-blocking).
 */
import { createAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/types/database'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

async function sendEmail(recipientId: string, subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  const supabase = createAdminClient() as any
  const { data: { user } } = await supabase.auth.admin.getUserById(recipientId)
  if (!user?.email) return

  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!fromEmail) {
    console.error('[notify-orders] RESEND_FROM_EMAIL not configured — skipping email send')
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: user.email,
        subject,
        html,
      }),
    })
    if (!res.ok) {
      console.error('[notify-orders] Resend error:', res.status, await res.text())
    }
  } catch (err) {
    console.error('[notify-orders] Email failed:', err)
  }
}

function emailWrapper(content: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: #999; margin-bottom: 24px;">RE:GALIA</p>
      ${content}
      <p style="font-size: 11px; color: #ccc; margin-top: 40px;">This is an automated message from RE:GALIA.</p>
    </div>
  `
}

// ── Order Confirmed (Buyer) ────────────────────────────────────

export async function notifyOrderConfirmed({
  buyerId,
  orderId,
  listingTitle,
  total,
}: {
  buyerId: string
  orderId: string
  listingTitle: string
  total: number
}) {
  const supabase = createAdminClient() as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://regalia-scroll.vercel.app'

  // In-app notification
  await supabase.from('notifications').insert({
    user_id: buyerId,
    type: 'order_update',
    title: 'Order Confirmed',
    message: `Your purchase of ${listingTitle.slice(0, 100)} has been confirmed. ${fmt(total)} charged.`,
    link: '/dashboard?tab=purchases',
  })

  // Email
  const safeTitle = escapeHtml(listingTitle)
  await sendEmail(
    buyerId,
    `Order Confirmed — ${listingTitle.slice(0, 80)} — RE:GALIA`,
    emailWrapper(`
      <h2 style="font-size: 24px; font-weight: normal; color: #1a1818; margin-bottom: 8px;">Order Confirmed</h2>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Thank you for your purchase!</p>
      <div style="background: #FAF9F6; border-left: 3px solid #D4AF37; padding: 16px 20px; margin-bottom: 24px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 8px 0; font-weight: 600;">${safeTitle}</p>
        <p style="font-size: 14px; color: #666; margin: 0;">Total: <strong>${fmt(total)}</strong></p>
      </div>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">The seller has been notified and will ship your gown soon. You can track your order from your dashboard.</p>
      <a href="${siteUrl}/dashboard?tab=purchases" style="display: inline-block; background: #1a1818; color: white; text-decoration: none; padding: 14px 32px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em;">
        View Order
      </a>
    `)
  )
}

// ── New Sale (Seller) ──────────────────────────────────────────

export async function notifyNewSale({
  sellerId,
  orderId,
  listingTitle,
  sellerPayout,
  shippingAddress,
}: {
  sellerId: string
  orderId: string
  listingTitle: string
  sellerPayout: number
  shippingAddress: Json | null
}) {
  const supabase = createAdminClient() as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://regalia-scroll.vercel.app'

  // In-app notification
  await supabase.from('notifications').insert({
    user_id: sellerId,
    type: 'order_update',
    title: 'You Made a Sale!',
    message: `Your gown "${listingTitle.slice(0, 80)}" has been purchased. Payout: ${fmt(sellerPayout)}.`,
    link: '/dashboard?tab=sales',
  })

  // Build shipping address string
  const addr = shippingAddress as Record<string, string> | null
  const addressLines = addr
    ? [addr.name, addr.line1, addr.line2, `${addr.city}, ${addr.state} ${addr.postal_code}`, addr.country]
        .filter(Boolean)
        .map(escapeHtml)
        .join('<br/>')
    : 'Shipping address will be provided shortly.'

  const safeTitle = escapeHtml(listingTitle)
  await sendEmail(
    sellerId,
    `Congratulations! Your gown sold — RE:GALIA`,
    emailWrapper(`
      <h2 style="font-size: 24px; font-weight: normal; color: #1a1818; margin-bottom: 8px;">You Made a Sale!</h2>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">A buyer has purchased your gown. Please ship it as soon as possible.</p>
      <div style="background: #FAF9F6; border-left: 3px solid #D4AF37; padding: 16px 20px; margin-bottom: 24px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 8px 0; font-weight: 600;">${safeTitle}</p>
        <p style="font-size: 14px; color: #666; margin: 0 0 12px 0;">Your payout: <strong>${fmt(sellerPayout)}</strong></p>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin: 0 0 4px 0;">Ship To:</p>
        <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0;">${addressLines}</p>
      </div>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Once shipped, please update the tracking number in your dashboard.</p>
      <a href="${siteUrl}/dashboard?tab=sales" style="display: inline-block; background: #1a1818; color: white; text-decoration: none; padding: 14px 32px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em;">
        Manage Sale
      </a>
    `)
  )
}

// ── Order Refunded (Buyer) ─────────────────────────────────────

export async function notifyOrderRefunded({
  buyerId,
  orderId,
  listingTitle,
}: {
  buyerId: string
  orderId: string
  listingTitle: string
}) {
  const supabase = createAdminClient() as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://regalia-scroll.vercel.app'

  // In-app notification
  await supabase.from('notifications').insert({
    user_id: buyerId,
    type: 'order_update',
    title: 'Order Refunded',
    message: `Your order for "${listingTitle.slice(0, 80)}" has been refunded. The amount will appear in your account within 5-10 business days.`,
    link: '/dashboard?tab=purchases',
  })

  const safeTitle = escapeHtml(listingTitle)
  await sendEmail(
    buyerId,
    `Order Refunded — RE:GALIA`,
    emailWrapper(`
      <h2 style="font-size: 24px; font-weight: normal; color: #1a1818; margin-bottom: 8px;">Order Refunded</h2>
      <div style="background: #FAF9F6; border-left: 3px solid #D4AF37; padding: 16px 20px; margin-bottom: 24px;">
        <p style="font-size: 16px; color: #333; margin: 0;">${safeTitle}</p>
      </div>
      <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Your refund has been processed. The amount will appear in your account within 5-10 business days.</p>
      <a href="${siteUrl}/dashboard?tab=purchases" style="display: inline-block; background: #1a1818; color: white; text-decoration: none; padding: 14px 32px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em;">
        View Details
      </a>
    `)
  )
}
