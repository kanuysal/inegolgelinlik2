/**
 * RE:GALIA — Notification Helpers
 * ================================
 * Creates in-app notifications and sends email alerts.
 * Uses Resend REST API for email (no npm package needed).
 */
import { createAdminClient } from '@/lib/supabase/server'

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
    title: `New message about ${listingTitle}`,
    message: `${senderName}: ${messagePreview.slice(0, 200)}`,
    link: conversationLink,
  })

  // 2. Send email if Resend API key is configured
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  // Look up recipient email
  const { data: { user } } = await supabase.auth.admin.getUserById(recipientId)
  if (!user?.email) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RE:GALIA <notifications@regalia-scroll.vercel.app>',
        to: user.email,
        subject: `New message about ${listingTitle} — RE:GALIA`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: #999; margin-bottom: 24px;">RE:GALIA — Private Message</p>
            <h2 style="font-size: 24px; font-weight: normal; color: #1a1818; margin-bottom: 8px;">${listingTitle}</h2>
            <p style="font-size: 14px; color: #666; margin-bottom: 24px;"><strong>${senderName}</strong> sent you a message:</p>
            <div style="background: #FAF9F6; border-left: 3px solid #D4AF37; padding: 16px 20px; margin-bottom: 32px;">
              <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 0;">${messagePreview.slice(0, 500)}</p>
            </div>
            <a href="https://regalia-scroll.vercel.app${conversationLink}" style="display: inline-block; background: #1a1818; color: white; text-decoration: none; padding: 14px 32px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em;">
              View Conversation
            </a>
            <p style="font-size: 11px; color: #ccc; margin-top: 40px;">You received this because someone messaged you on RE:GALIA.</p>
          </div>
        `,
      }),
    })
  } catch {
    // Email sending is best-effort; don't block the message flow
  }
}
