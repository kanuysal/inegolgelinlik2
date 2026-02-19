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
    <div className="min-h-screen bg-obsidian flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-resonance-amber/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tighter text-white/95 mb-4">
              Welcome <br />
              <span className="italic">Back</span>
            </h1>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
              The Official Resale Destination
            </p>
          </div>

          <div className="resonance-panel p-10 md:p-12">
            {/* Status Messages */}
            {(message || authError || error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8"
              >
                {message && (
                  <div className="p-4 bg-resonance-blue/5 border border-resonance-blue/20 text-resonance-blue text-[11px] font-sans tracking-wide text-center rounded-xl">
                    {message}
                  </div>
                )}
                {(authError || error) && (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-400/90 text-[11px] font-sans tracking-wide text-center rounded-xl">
                    {authError || error}
                  </div>
                )}
              </motion.div>
            )}

            <form action={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="email" className="block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 ml-4">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4">
                  <label htmlFor="password" className="block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                    Password
                  </label>
                  <a href="mailto:hello@regalia.com" className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 hover:text-resonance-amber transition-colors mr-4">
                    Forgot?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-4 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-resonance-amber transition-all duration-500 disabled:opacity-50 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center my-10 px-4">
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
              <span className="px-6 font-sans text-[9px] font-bold text-white/15 uppercase tracking-[0.3em]">or</span>
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-5 border border-white/10 text-white font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-white/5 hover:border-white/20 transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50"
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

          <p className="text-center font-sans text-[11px] text-white/20 mt-10 tracking-[0.2em] uppercase">
            New here? <Link href="/auth/signup" className="text-white/60 hover:text-resonance-amber transition-colors ml-2">Create Account</Link>
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
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
          <div className="font-sans text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] animate-pulse">
            Loading...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
