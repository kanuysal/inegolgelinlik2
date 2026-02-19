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
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validators/auth'

export async function login(formData: FormData) {
  const supabase = createClient()

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

  const redirectTo = formData.get('redirect') as string
  revalidatePath('/', 'layout')
  redirect(redirectTo || '/dashboard')
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
    // Don't reveal if email is already registered
    return { error: 'Unable to create account. Please try again.' }
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
