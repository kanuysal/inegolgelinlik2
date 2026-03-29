/**
 * Kustomer API Key Diagnostic Endpoint
 * =====================================
 * GET /api/kustomer/test — tests whether the API key can reach Kustomer.
 * Returns status + first 6 chars of the key for debugging.
 *
 * DELETE THIS ROUTE once Kustomer is confirmed working.
 */
import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.KUSTOMER_API_KEY
  const base = process.env.KUSTOMER_API_BASE || 'https://api.kustomerapp.com/v1'
  const webhookSecret = process.env.KUSTOMER_WEBHOOK_SECRET

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'KUSTOMER_API_KEY is NOT set in this environment',
      env: process.env.VERCEL_ENV || 'unknown',
      allKustomerVars: {
        KUSTOMER_API_KEY: '❌ missing',
        KUSTOMER_WEBHOOK_SECRET: webhookSecret ? '✅ set' : '❌ missing',
        KUSTOMER_API_BASE: process.env.KUSTOMER_API_BASE || '(default: api.kustomerapp.com)',
      },
    })
  }

  // Try to hit Kustomer API
  try {
    const res = await fetch(`${base}/customers?page=1&pageSize=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const text = await res.text()

    if (res.ok) {
      return NextResponse.json({
        status: 'ok',
        message: 'Kustomer API connection successful!',
        env: process.env.VERCEL_ENV || 'unknown',
        apiKeyPrefix: apiKey.slice(0, 6) + '…',
        baseUrl: base,
        webhookSecret: webhookSecret ? '✅ set' : '❌ missing',
        apiResponse: res.status,
      })
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Kustomer API returned an error — check your API key',
        env: process.env.VERCEL_ENV || 'unknown',
        apiKeyPrefix: apiKey.slice(0, 6) + '…',
        baseUrl: base,
        httpStatus: res.status,
        apiError: text.slice(0, 500),
      })
    }
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to reach Kustomer API',
      env: process.env.VERCEL_ENV || 'unknown',
      apiKeyPrefix: apiKey.slice(0, 6) + '…',
      baseUrl: base,
      error: err.message,
    })
  }
}
