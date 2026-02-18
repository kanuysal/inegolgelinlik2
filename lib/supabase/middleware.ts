/**
 * Supabase Middleware Client
 * --------------------------
 * Used exclusively in Next.js middleware to refresh auth sessions.
 * This ensures the user's JWT stays valid across requests.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    // Guard: if Supabase env vars aren't set, skip auth (allows site to load)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return supabaseResponse
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Do NOT add any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // auth issues in production.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // =========================================================================
    // ROUTE PROTECTION
    // =========================================================================

    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/sell/submit', '/admin']
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    )

    // Admin-only routes
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    // Redirect unauthenticated users to login
    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Admin route protection — check role via user metadata or database
    if (user && isAdminRoute) {
      // We check admin role server-side in the page component for full security.
    }

    // Redirect authenticated users away from auth pages
    if (user && pathname.startsWith('/auth/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (e) {
    console.error('Middleware crash:', e)
    return NextResponse.next({
      request,
    })
  }
}
