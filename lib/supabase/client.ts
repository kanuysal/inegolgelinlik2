/**
 * Supabase Browser Client
 * -----------------------
 * Used in Client Components (hooks, event handlers, etc.)
 * This client uses the ANON key — all queries are restricted by RLS policies.
 * NEVER use the service role key on the client side.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
