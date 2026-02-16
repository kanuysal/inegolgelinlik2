/**
 * Supabase Server Client
 * ----------------------
 * Used in Server Components, Server Actions, and Route Handlers.
 * Creates a client that reads/writes cookies for session management.
 * All queries still go through RLS — the user's JWT is attached automatically.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

/**
 * Supabase Admin Client
 * ---------------------
 * DANGER: Bypasses ALL RLS policies. Only use for:
 * - Admin operations (user management, role assignment)
 * - Background jobs / cron tasks
 * - Database seeding
 * NEVER expose this to the client or use in client-accessible routes without
 * first verifying the user is an admin.
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
