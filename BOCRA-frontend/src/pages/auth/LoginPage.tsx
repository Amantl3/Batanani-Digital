import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const schema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const FEATURES = [
  'Apply for and manage licences online',
  'File and track consumer complaints',
  'Pay regulatory fees securely',
  'Submit compliance reports',
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showMFA, setShowMFA] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    login(data, {
      onError: (err: { status?: number }) => {
        if (err?.status === 403) setShowMFA(true)
      },
    })
  }

  return (
    <div className="flex min-h-screen overflow-hidden">

      {/* ── Left panel — brand ───────────────────────────────── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-bocra-navy p-12 lg:flex">
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-teal/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-bocra-green/10 via-transparent to-transparent" />

        {/* Top — logo */}
        <div className="relative">
          <Link to="/">
            <img src="/bocra-logo-white.png" alt="BOCRA" className="h-10 w-auto" />
          </Link>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-bocra-teal" />
            <div className="h-2 w-2 rounded-full bg-bocra-green" />
            <div className="h-2 w-2 rounded-full bg-bocra-red" />
            <div className="h-2 w-2 rounded-full bg-bocra-gold" />
          </div>
        </div>

        {/* Middle — headline */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="relative"
        >
          <motion.p variants={fadeUp} className="mb-4 inline-block rounded-full bg-bocra-teal/20 px-3 py-1 text-xs font-semibold text-bocra-teal">
            Secure regulatory portal
          </motion.p>
          <motion.h2 variants={fadeUp} className="mb-6 font-heading text-4xl font-bold leading-tight text-white">
            Your gateway to<br />
            <span className="text-bocra-teal">digital regulation</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-8 text-base leading-relaxed text-slate-400">
            Access BOCRA's full suite of online services — from licensing to compliance — all in one secure place.
          </motion.p>
          <motion.ul variants={stagger} className="space-y-3">
            {FEATURES.map(f => (
              <motion.li key={f} variants={fadeUp} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bocra-teal/20">
                  <CheckCircle className="h-3 w-3 text-bocra-teal" />
                </div>
                <span className="text-sm text-slate-300">{f}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Bottom — trust */}
        <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <ShieldCheck className="h-8 w-8 shrink-0 text-bocra-teal" />
          <div>
            <p className="text-xs font-bold text-white">Government-grade security</p>
            <p className="text-xs text-slate-400">TLS 1.3 · AES-256 · Data Protection Act compliant</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-bocra-navy px-6 py-4 lg:hidden">
          <Link to="/">
            <img src="/bocra-logo-white.png" alt="BOCRA" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-1">
            {['bg-bocra-teal','bg-bocra-green','bg-bocra-red','bg-bocra-gold'].map(c => (
              <div key={c} className={`h-2 w-2 rounded-full ${c}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
          <motion.div
            variants={stagger} initial="hidden" animate="show"
            className="w-full max-w-md"
          >
            <motion.div variants={fadeUp} className="mb-8">
              <h1 className="font-heading text-3xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-2 text-slate-500">Sign in to your BOCRA account to continue.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-2xl bg-white p-8 shadow-card-md">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="form-label">Email address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="email" type="email" autoComplete="email" placeholder="you@example.com"
                      className={cn('form-input pl-10', errors.email && 'border-red-400 focus:ring-red-200')}
                      {...register('email')} />
                  </div>
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="form-label mb-0">Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-bocra-teal hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="password" type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password" placeholder="••••••••••••"
                      className={cn('form-input pl-10 pr-11', errors.password && 'border-red-400 focus:ring-red-200')}
                      {...register('password')} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password.message}</p>}
                </div>

                {/* MFA */}
                {showMFA && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-4">
                    <label htmlFor="totpCode" className="form-label text-bocra-teal">Authenticator code</label>
                    <input id="totpCode" type="text" inputMode="numeric" maxLength={6}
                      placeholder="000000" autoComplete="one-time-code"
                      className="form-input text-center font-mono text-lg tracking-[0.5em]"
                      {...register('totpCode')} />
                    <p className="form-hint text-bocra-teal">Enter the 6-digit code from your authenticator app</p>
                  </motion.div>
                )}

                {/* Submit */}
                <button type="submit" disabled={isLoggingIn}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-bocra-navy py-3.5 text-sm font-bold text-white transition-all hover:bg-bocra-navy/90 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                  {isLoggingIn
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing in…</>
                    : <>Sign in <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
              </form>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-bocra-teal hover:underline">
                Create one free →
              </Link>
            </motion.p>

            {/* Trust strip */}
            <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> TLS 1.3</span>
              <span className="h-3 w-px bg-slate-200" />
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> DPA compliant</span>
              <span className="h-3 w-px bg-slate-200" />
              <span>🇧🇼 Gov. of Botswana</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}