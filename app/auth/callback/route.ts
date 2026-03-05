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
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  // Prevent open redirect: only allow internal paths starting with /
  const next = (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Google Identity Bridge: stamp google_id on first Google sign-in
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const providers = user.app_metadata?.providers || []
          if (providers.includes('google')) {
            const googleIdentity = user.identities?.find(i => i.provider === 'google')
            const googleSub = googleIdentity?.identity_data?.sub
            if (googleSub) {
              const admin = createAdminClient() as any
              await admin
                .from('profiles')
                .update({ google_id: googleSub })
                .eq('id', user.id)
                .is('google_id', null)
            }
          }
        }
      } catch {
        // Non-blocking — don't fail the auth flow
      }

      // Successful auth — redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
