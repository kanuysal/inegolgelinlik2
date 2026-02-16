/**
 * Auth Callback Route Handler
 * ----------------------------
 * Handles the OAuth redirect from Supabase after:
 * - Email confirmation
 * - Google/Apple OAuth sign-in
 *
 * Exchanges the auth code for a session, then redirects to dashboard.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful auth — redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
