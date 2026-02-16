'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login, signInWithGoogle } from '../actions'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const authError = searchParams.get('error')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set('redirect', redirectTo)

    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <h1 className="font-serif text-3xl tracking-[0.3em] text-white">
              RE:GALIA
            </h1>
          </Link>
          <p className="text-white/40 text-sm mt-2 tracking-widest uppercase">
            The Official Galia Lahav Resale Destination
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 border border-gold-muted/30 bg-gold-muted/5 text-champagne text-sm text-center">
            {message}
          </div>
        )}
        {authError && (
          <div className="mb-6 p-4 border border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
            {authError}
          </div>
        )}

        {/* Login Form */}
        <div className="border border-white/10 bg-white/[0.02] p-8">
          <h2 className="font-serif text-2xl text-white mb-8 text-center">
            Sign In
          </h2>

          {error && (
            <div className="mb-6 p-3 border border-red-500/30 bg-red-500/5 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-white/60 text-xs tracking-widest uppercase mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm
                         focus:outline-none focus:border-gold-muted/50 transition-colors
                         placeholder:text-white/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-white/60 text-xs tracking-widest uppercase mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 text-sm
                         focus:outline-none focus:border-gold-muted/50 transition-colors
                         placeholder:text-white/20"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-muted text-obsidian py-3 text-sm tracking-widest uppercase
                       hover:bg-champagne transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 text-white/30 text-xs tracking-widest uppercase">
              or
            </span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-white/10 text-white py-3 text-sm tracking-widest uppercase
                     hover:border-white/30 hover:bg-white/5 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-white/40 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-gold-muted hover:text-champagne transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <div className="text-white/40 text-sm tracking-widest uppercase">
            Loading...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
