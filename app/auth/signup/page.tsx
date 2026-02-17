'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup, signInWithGoogle } from '../actions'
import { motion } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await signup(formData)
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

      <div className="flex-1 flex items-center justify-center px-6 py-24 relative overflow-hidden">
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
              Join the <br />
              <span className="italic">Legacy</span>
            </h1>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">
              The Official Galia Lahav Community
            </p>
          </div>

          <div className="resonance-panel p-10 md:p-12">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400/90 text-[11px] font-sans tracking-wide text-center rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="displayName" className="block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 ml-4">
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-3.5 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="Your Name"
                />
              </div>

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
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-3.5 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 ml-4">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-3.5 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="Min 8 characters"
                />
              </div>

              <div className="space-y-2 pb-2">
                <label htmlFor="confirmPassword" className="block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 ml-4">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full px-8 py-3.5 font-sans text-[13px] focus:border-resonance-amber/50 focus:outline-none transition-all placeholder:text-white/10"
                  placeholder="Repeat Password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-obsidian font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-resonance-amber transition-all duration-500 disabled:opacity-50 shadow-[0_0_50px_rgba(255,255,255,0.05)]"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center my-8 px-4">
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
              <span className="px-6 font-sans text-[9px] font-bold text-white/15 uppercase tracking-[0.3em]">or</span>
              <div className="flex-1 h-[1px] bg-white/[0.05]" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 border border-white/10 text-white font-sans text-[11px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-white/5 hover:border-white/20 transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50"
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
            Already registered? <Link href="/auth/login" className="text-white/60 hover:text-resonance-amber transition-colors ml-2">Sign In</Link>
          </p>

          <p className="text-center font-sans text-[9px] text-white/10 mt-12 tracking-widest leading-relaxed uppercase max-w-xs mx-auto">
            By joining, you agree to our <span className="text-white/20">Terms</span> and <span className="text-white/20">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
