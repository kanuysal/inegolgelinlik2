/**
 * Test endpoint — simulates a Kustomer webhook locally.
 *
 * Usage: GET /api/kustomer/webhook/test?conv_id=YOUR_KUSTOMER_CONV_ID&message=Hello+from+support
 *
 * This sends a fake Kustomer-style webhook payload to the main
 * webhook handler so you can verify the full flow without Kustomer.
 *
 * ⚠️  Remove or protect this route before going to production.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Disable this helper endpoint in production to avoid exposing
  // an unauthenticated test surface that can trigger internal flows.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const convId = req.nextUrl.searchParams.get('conv_id')
  const message = req.nextUrl.searchParams.get('message') || 'Test reply from CS agent'

  if (!convId) {
    return NextResponse.json(
      { error: 'Pass ?conv_id=KUSTOMER_CONVERSATION_ID&message=Hello' },
      { status: 400 },
    )
  }

  // Build a payload that mimics the Kustomer webhook structure
  const payload = {
    data: {
      type: 'message',
      attributes: {
        direction: 'out',
        preview: message,
        meta: {
          body: message,
        },
      },
      relationships: {
        conversation: {
          data: { id: convId },
        },
      },
    },
  }

  // Call our own webhook handler
  const baseUrl = req.nextUrl.origin
  const res = await fetch(`${baseUrl}/api/kustomer/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const result = await res.json()

  return NextResponse.json({
    status: res.status,
    result,
    note: 'This simulated a Kustomer outbound message webhook. Check the conversation in the dashboard.',
  })
}
