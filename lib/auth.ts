/**
 * RE:GALIA — Auth Utilities
 * =========================
 * Server-side auth helpers for route protection and role checks.
 * These functions should ONLY be called from Server Components,
 * Server Actions, or Route Handlers.
 */
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

/**
 * Get the currently authenticated user.
 * Returns null if not authenticated (does NOT redirect).
 */
export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

/**
 * Require authentication — redirects to login if not authenticated.
 * Use this in Server Components that need a logged-in user.
 */
export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

/**
 * Get the user's profile from the profiles table.
 */
export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

/**
 * Get the user's roles from the user_roles table.
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  // Use admin client to bypass RLS on user_roles table
  const supabase = createAdminClient()
  const { data, error } = await (supabase as any)
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  if (error || !data) return ['user']
  return data.map((r: { role: UserRole }) => r.role)
}

/**
 * Check if a user has a specific role.
 * Queries the user_roles table directly.
 * The RLS policies + SECURITY DEFINER functions in the DB provide tamper-proof checks.
 */
export async function hasRole(userId: string, role: 'admin' | 'moderator'): Promise<boolean> {
  const roles = await getUserRoles(userId)

  if (role === 'admin') {
    return roles.includes('admin')
  }

  // Moderator check includes admin (admins have all moderator permissions)
  return roles.includes('admin') || roles.includes('moderator')
}

/**
 * Require admin role — redirects to dashboard if not admin.
 * Use this at the top of admin page Server Components.
 */
export async function requireAdmin() {
  const user = await requireAuth()
  const isAdmin = await hasRole(user.id, 'admin')

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return user
}

/**
 * Require moderator or admin role.
 */
export async function requireModerator() {
  const user = await requireAuth()
  const isMod = await hasRole(user.id, 'moderator')

  if (!isMod) {
    redirect('/dashboard')
  }

  return user
}
