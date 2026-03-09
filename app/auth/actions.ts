'use server'

/**
 * RE:GALIA — Auth Server Actions
 * ===============================
 * All auth operations happen server-side for security.
 * - Passwords never exposed to client-side code
 * - Input validated with Zod before processing
 * - Rate limiting handled by Supabase
 */
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validators/auth'
import { checkEmailExists, normalizeEmail } from '@/lib/email-normalization'
import { rateLimit } from '@/lib/rate-limit'

function sanitizeRedirect(raw: string | null): string {
  if (!raw) return '/dashboard'

  // Disallow absolute and protocol-relative URLs
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//')) {
    return '/dashboard'
  }

  // Only allow internal paths
  if (!raw.startsWith('/')) {
    return '/dashboard'
  }

  // Optionally tighten further with an allowlist if needed
  return raw
}

export async function login(formData: FormData) {
  const supabase = createClient()

  // Rate limit login attempts per IP (e.g., 5 per 15 minutes)
  const headersList = await headers()
  const ip = headersList.get('x-real-ip') || headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const allowed = await rateLimit({
    key: `login:${ip}`,
    limit: 5,
    windowSeconds: 15 * 60,
  })
  if (!allowed) {
    return { error: 'Too many login attempts. Please try again later.' }
  }

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Server-side validation
  const result = loginSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    // Generic error message to prevent email enumeration
    return { error: 'Invalid email or password' }
  }

  const redirectTo = sanitizeRedirect(formData.get('redirect') as string | null)
  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    displayName: formData.get('displayName') as string,
  }

  // Server-side validation
  const result = signupSchema.safeParse(rawData)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // Rate limit signups per IP BEFORE expensive DB operations
  const headersList = await headers()
  const ip = headersList.get('x-real-ip') || headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const allowed = await rateLimit({
    key: `signup:${ip}`,
    limit: 3,
    windowSeconds: 60 * 60,
  })
  if (!allowed) {
    return { error: 'Too many sign-up attempts. Please try again later.' }
  }

  // Check for existing account with normalized email (prevents +tag bypasses)
  const adminClient = createAdminClient()
  const existingCheck = await checkEmailExists(result.data.email, adminClient)

  if (existingCheck.exists) {
    // Generic message to prevent email/provider enumeration
    return {
      error: 'Unable to create account. If you already have an account, please try logging in instead.'
    }
  }

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.displayName,
        name: result.data.displayName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    // Provide helpful error messages while maintaining security
    if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
      return { error: 'This email is already registered. Try logging in instead.' }
    }
    if (error.message?.includes('email')) {
      return { error: 'Invalid email address. Please check and try again.' }
    }
    if (error.message?.includes('password')) {
      return { error: 'Password must be at least 8 characters long.' }
    }
    // Generic fallback
    return { error: 'Unable to create account. Please try again or contact support.' }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login?message=Check your email to confirm your account')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Check if the currently logged-in user has admin/moderator role.
 * Uses admin client to bypass RLS on user_roles table.
 */
export async function checkIsStaff(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { createAdminClient } = await import('@/lib/supabase/server')
  const admin = createAdminClient()
  const { data: roles } = await (admin as any)
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  return (roles || []).some((r: any) => r.role === 'admin' || r.role === 'moderator')
}

export async function signInWithGoogle() {
  // Rate limit: 10 OAuth attempts per 15 minutes per IP
  const ip = (await headers()).get('x-real-ip') || (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const allowed = await rateLimit({ key: `google-oauth:${ip}`, limit: 10, windowSeconds: 15 * 60 })
  if (!allowed) {
    return { error: 'Too many sign-in attempts. Please try again later.' }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    return { error: 'Failed to initiate Google sign-in' }
  }

  if (data.url) {
    redirect(data.url)
  }
}
