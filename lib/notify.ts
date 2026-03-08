/**
 * RE:GALIA — Notification Helpers
 * ================================
 * Creates in-app notifications and sends email alerts.
 * Uses Resend REST API for email (no npm package needed).
 */
import { createAdminClient } from '@/lib/supabase/server'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Notify a user about a new message.
 * Creates an in-app notification + sends email if RESEND_API_KEY is set.
 */
export async function notifyNewMessage({
  recipientId,
  senderName,
  listingTitle,
  messagePreview,
  conversationLink,
}: {
  recipientId: string
  senderName: string
  listingTitle: string
  messagePreview: string
  conversationLink: string
}) {
  const supabase = createAdminClient() as any

  // 1. Create in-app notification
  await supabase.from('notifications').insert({
    user_id: recipientId,
    type: 'new_message',
    title: `New message about ${listingTitle.replace(/[<>"'&\n\r]/g, '').slice(0, 100)}`,
    message: `${senderName.replace(/[<>"'&\n\r]/g, '').slice(0, 50)}: ${messagePreview.replace(/[<>"'&]/g, '').slice(0, 200)}`,
    link: conversationLink,
  })

  // 2. Send email if Resend API key is configured
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log('[notify] No RESEND_API_KEY — skipping email')
    return
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (!fromEmail) {
    console.warn('[notify] RESEND_FROM_EMAIL not set — emails will only reach the Resend account owner (test mode). Set RESEND_FROM_EMAIL to a verified sender to send emails to all users.')
  }

  // Look up recipient email
  const { data: { user } } = await supabase.auth.admin.getUserById(recipientId)
  if (!user?.email) {
    console.log('[notify] No email found for recipient', recipientId)
    return
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://regalia-scroll.vercel.app'

  const safeListingTitle = escapeHtml(listingTitle)
  const safeSenderName = escapeHtml(senderName)
  const safePreview = escapeHtml(messagePreview.slice(0, 500))

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail || 'RE:GALIA <onboarding@resend.dev>',
        to: user.email,
        subject: `New message about ${listingTitle.replace(/[<>"'&\n\r]/g, '').slice(0, 100)} — RE:GALIA`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: #999; margin-bottom: 24px;">RE:GALIA — Private Message</p>
            <h2 style="font-size: 24px; font-weight: normal; color: #1a1818; margin-bottom: 8px;">${safeListingTitle}</h2>
            <p style="font-size: 14px; color: #666; margin-bottom: 24px;"><strong>${safeSenderName}</strong> sent you a message:</p>
            <div style="background: #FAF9F6; border-left: 3px solid #D4AF37; padding: 16px 20px; margin-bottom: 32px;">
              <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0;">${safePreview}</p>
            </div>
            <a href="${siteUrl}${escapeHtml(conversationLink)}" style="display: inline-block; background: #1a1818; color: white; text-decoration: none; padding: 14px 32px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em;">
              View Conversation
            </a>
            <p style="font-size: 11px; color: #ccc; margin-top: 40px;">You received this because someone messaged you on RE:GALIA.</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[notify] Resend API error:', res.status, body)
    } else {
      console.log('[notify] Email sent to', user.email)
    }
  } catch (err) {
    console.error('[notify] Email send failed:', err)
  }
}
