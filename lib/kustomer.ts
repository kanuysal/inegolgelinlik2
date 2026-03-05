/**
 * RE:GALIA — Kustomer CRM Integration
 * ====================================
 * Forwards buyer inquiries and messages to Kustomer so customer
 * support agents can manage conversations from the CRM.
 *
 * All calls are best-effort: if KUSTOMER_API_KEY is not set or
 * the API is unreachable, the app continues working normally.
 */

import { createHmac, timingSafeEqual } from 'crypto'

const KUSTOMER_BASE = 'https://api.kustomerapp.com/v1'

function getApiKey(): string | undefined {
  return process.env.KUSTOMER_API_KEY
}

async function kustomerFetch(path: string, options: RequestInit = {}) {
  const apiKey = getApiKey()
  if (!apiKey) return null

  const res = await fetch(`${KUSTOMER_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[Kustomer] ${options.method || 'GET'} ${path} failed: ${res.status} ${text}`)
    return null
  }

  return res.json()
}

/**
 * Find a Kustomer customer by email, or create one if not found.
 */
export async function findOrCreateCustomer(email: string, name?: string): Promise<string | null> {
  if (!getApiKey()) return null

  // Search by email
  const search = await kustomerFetch(`/customers/search`, {
    method: 'POST',
    body: JSON.stringify({
      and: [{ emails: { value: email } }],
    }),
  })

  const existing = search?.data?.[0]
  if (existing) return existing.id

  // Create new customer
  const created = await kustomerFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: name || email.split('@')[0],
      emails: [{ email }],
    }),
  })

  return created?.data?.id || null
}

/**
 * Create a new conversation for a customer in Kustomer.
 * Returns the Kustomer conversation ID.
 */
export async function createConversation({
  customerId,
  subject,
  message,
  senderName,
  listingUrl,
}: {
  customerId: string
  subject: string
  message: string
  senderName?: string
  listingUrl?: string
}): Promise<string | null> {
  if (!getApiKey()) return null

  const body: Record<string, any> = {
    name: subject,
    message: {
      direction: 'in',
      channel: 'chat',
      preview: message.slice(0, 200),
      meta: {
        subject,
        body: message,
      },
    },
    custom: {
      ...(listingUrl && { listingUrlStr: listingUrl }),
      ...(senderName && { senderNameStr: senderName }),
      sourceStr: 'RE:GALIA Website',
    },
    tags: ['regalia', 'inquiry'],
  }

  const result = await kustomerFetch(`/customers/${customerId}/conversations`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return result?.data?.id || null
}

/**
 * Append a message to an existing Kustomer conversation.
 */
export async function sendMessage({
  conversationId,
  message,
  direction = 'in',
}: {
  conversationId: string
  message: string
  direction?: 'in' | 'out'
}): Promise<boolean> {
  if (!getApiKey()) return false

  const result = await kustomerFetch(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      direction,
      channel: 'chat',
      preview: message.slice(0, 200),
      meta: {
        body: message,
      },
    }),
  })

  return result !== null
}

/**
 * Verify a Kustomer webhook signature.
 * Kustomer signs webhooks with HMAC-SHA256 using the shared secret.
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  if (signature.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'))
}
