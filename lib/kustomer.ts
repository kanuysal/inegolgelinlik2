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

// US: api.kustomerapp.com | EU: api.prod2.kustomerapp.com
const KUSTOMER_BASE = process.env.KUSTOMER_API_BASE || 'https://api.kustomerapp.com/v1'

function getApiKey(): string | undefined {
  return process.env.KUSTOMER_API_KEY
}

async function kustomerFetch(path: string, options: RequestInit = {}) {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.warn('[Kustomer] KUSTOMER_API_KEY is not set — skipping')
    return null
  }
  const url = `${KUSTOMER_BASE}${path}`
  console.log(`[Kustomer] ${options.method || 'GET'} ${url} (key: ${apiKey.slice(0, 6)}…)`)

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[Kustomer] ${options.method || 'GET'} ${url} failed: ${res.status} ${text}`)
    return null
  }

  const json = await res.json()
  console.log(`[Kustomer] ${options.method || 'GET'} ${path} → OK`)
  return json
}

/**
 * Find a Kustomer customer by email, or create one if not found.
 */
export async function findOrCreateCustomer(email: string, name?: string): Promise<string | null> {
  if (!getApiKey()) {
    console.warn('[Kustomer] findOrCreateCustomer skipped — no API key')
    return null
  }
  console.log(`[Kustomer] findOrCreateCustomer for ${email}`)

  // Look up by email using the direct endpoint
  const lookup = await kustomerFetch(`/customers/email=${encodeURIComponent(email)}`)
  if (lookup?.data?.id) {
    console.log(`[Kustomer] Found existing customer ${lookup.data.id}`)
    return lookup.data.id
  }

  // Create new customer
  const created = await kustomerFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: name || email.split('@')[0],
      emails: [{ email }],
    }),
  })

  if (created?.data?.id) return created.data.id

  // Handle race condition: if create failed with 409 duplicate, look up again
  console.log('[Kustomer] Create failed — retrying lookup')
  const retry = await kustomerFetch(`/customers/email=${encodeURIComponent(email)}`)
  return retry?.data?.id || null
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
  console.log(`[Kustomer] createConversation for customer ${customerId}: ${subject}`)

  // Step 1: Create the conversation (no inline message — Kustomer rejects extra fields)
  const convBody: Record<string, any> = {
    name: subject,
    custom: {
      ...(listingUrl && { listingUrlStr: listingUrl }),
      ...(senderName && { senderNameStr: senderName }),
      sourceStr: 'RE:GALIA Website',
    },
    tags: ['regalia', 'inquiry'],
  }

  const result = await kustomerFetch(`/customers/${customerId}/conversations`, {
    method: 'POST',
    body: JSON.stringify(convBody),
  })

  const convId = result?.data?.id
  if (!convId) return null

  // Step 2: Send the first message separately
  await sendMessage({ conversationId: convId, message, direction: 'in' })

  return convId
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
      preview: message.slice(0, 200),
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
