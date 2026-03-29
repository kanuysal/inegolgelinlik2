/**
 * RE:GALIA — Kustomer CRM Integration
 * ====================================
 * Forwards buyer inquiries and messages to Kustomer so customer
 * support agents can manage conversations from the CRM.
 *
 * All calls are best-effort: if KUSTOMER_API_KEY is not set or
 * the API is unreachable, the app continues working normally.
 */

// US: api.kustomerapp.com | EU: api.prod2.kustomerapp.com
const KUSTOMER_BASE = process.env.KUSTOMER_API_BASE || 'https://api.kustomerapp.com/v1'

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

  // Look up by email using the direct endpoint
  const lookup = await kustomerFetch(`/customers/email=${encodeURIComponent(email)}`)
  if (lookup?.data?.id) {
    // Update the customer name if we have one and it differs
    if (name && lookup.data.attributes?.name !== name) {
      await kustomerFetch(`/customers/${lookup.data.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      })
    }
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
      channel: 'chat',
      app: 'custom',
      preview: message.slice(0, 200),
    }),
  })

  return result !== null
}