'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login, signInWithGoogle } from '../actions'
import { motion } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  // Allowlist known messages to prevent social engineering via crafted URLs
  const knownMessages: Record<string, string> = {
    'Check your email to confirm your account': 'Check your email to confirm your account',
    'Password updated successfully': 'Password updated successfully',
  }
  const knownErrors: Record<string, string> = {
    'Authentication failed': 'Authentication failed',
    'Session expired': 'Session expired',
  }
  const message = knownMessages[searchParams.get('message') || ''] || null
  const authError = knownErrors[searchParams.get('error') || ''] || null

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
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-20 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-6xl font-light tracking-[-0.02em] text-[#1c1c1c] mb-4">
              Welcome <br />
              <span className="italic">Back</span>
            </h1>
            <p className="font-sans text-[11px] font-light uppercase tracking-[0.4em] text-[#1c1c1c]/30">
              The Official Resale Destination
            </p>
          </div>

          <div className="p-10 md:p-12 border border-[#1c1c1c]/5">
            {/* Status Messages */}
            {(message || authError || error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8"
              >
                {message && (
                  <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-sans font-light tracking-wide text-center">
                    {message}
                  </div>
                )}
                {(authError || error) && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-[11px] font-sans font-light tracking-wide text-center">
                    {authError || error}
                  </div>
                )}
              </motion.div>
            )}

            <form action={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="email" className="block font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c]/40">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-white border border-[#1c1c1c]/10 px-5 py-4 font-sans text-sm text-[#1c1c1c] font-light focus:border-[#1c1c1c]/30 focus:outline-none transition-all placeholder:text-[#1c1c1c]/20"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block font-sans text-[11px] font-light uppercase tracking-[0.15em] text-[#1c1c1c]/40">
                    Password
                  </label>
                  <a href="mailto:hello@regalia.com" className="font-sans text-[10px] font-light uppercase tracking-[0.1em] text-[#1c1c1c]/25 hover:text-[#1c1c1c]/60 transition-colors">
                    Forgot?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white border border-[#1c1c1c]/10 px-5 py-4 font-sans text-sm text-[#1c1c1c] font-light focus:border-[#1c1c1c]/30 focus:outline-none transition-all placeholder:text-[#1c1c1c]/20"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#1c1c1c] text-white font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:bg-[#333] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center my-10">
              <div className="flex-1 h-[1px] bg-[#1c1c1c]/5" />
              <span className="px-6 font-sans text-[9px] font-light text-[#1c1c1c]/30 uppercase tracking-[0.15em]">or</span>
              <div className="flex-1 h-[1px] bg-[#1c1c1c]/5" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-5 border border-[#1c1c1c]/10 text-[#1c1c1c] font-sans text-[11px] font-light uppercase tracking-[0.15em] hover:border-[#1c1c1c]/30 transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          <p className="text-center font-sans text-[11px] text-[#1c1c1c]/30 mt-10 tracking-[0.15em] uppercase font-light">
            New here? <Link href="/auth/signup" className="text-[#1c1c1c]/60 hover:text-[#1c1c1c] transition-colors ml-2">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="font-sans text-[11px] font-light text-[#1c1c1c]/30 uppercase tracking-[0.15em]">
            Loading...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
