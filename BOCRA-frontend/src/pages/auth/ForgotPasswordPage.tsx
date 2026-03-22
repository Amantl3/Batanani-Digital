import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, ShieldCheck, RefreshCw } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

import * as authService from '@/services/auth'
import { cn } from '@/utils/cn'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type FormData = z.infer<typeof schema>

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => authService.forgotPassword(data.email),
    onSuccess: (_data, variables) => {
      setSubmittedEmail(variables.email)
      setSubmitted(true)
    },
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left decorative panel */}
      <div className="relative hidden w-[45%] flex-col items-center justify-center overflow-hidden bg-bocra-navy lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-bocra-teal/20 via-transparent to-transparent" />
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="relative z-10 max-w-xs text-center"
        >
          <Link to="/" className="mb-8 inline-block">
            <img src="/bocra-logo-white.png" alt="BOCRA" className="mx-auto h-10 w-auto" />
          </Link>
          <div className="mb-6 flex justify-center gap-1.5">
            {['bg-bocra-teal','bg-bocra-green','bg-bocra-red','bg-bocra-gold'].map(c => (
              <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
            ))}
          </div>
          <motion.div variants={fadeUp}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-bocra-teal/20">
            <ShieldCheck className="h-10 w-10 text-bocra-teal" />
          </motion.div>
          <motion.h2 variants={fadeUp} className="mb-3 font-heading text-2xl font-bold text-white">
            Account security
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm leading-relaxed text-slate-400">
            We take security seriously. Password reset links expire after 30 minutes and can only be used once.
          </motion.p>
        </motion.div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-bocra-navy px-6 py-4 lg:hidden">
          <Link to="/"><img src="/bocra-logo-white.png" alt="BOCRA" className="h-8 w-auto" /></Link>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12">
          <div className="w-full max-w-md">

            {/* ── Success state ─────────────────────────────── */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-2xl bg-white shadow-card-md text-center"
              >
                <div className="bg-bocra-teal p-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-white">Check your email</h1>
                  <p className="mt-2 text-sm text-white/80">Reset link sent successfully</p>
                </div>
                <div className="p-8">
                  <p className="mb-1 text-sm text-slate-500">We've sent a reset link to:</p>
                  <p className="mb-6 font-semibold text-slate-900">{submittedEmail}</p>
                  <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-bocra-teal shrink-0" />Link expires in 30 minutes</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-bocra-teal shrink-0" />Check your spam folder too</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-bocra-teal shrink-0" />Link can only be used once</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setSubmitted(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                      <RefreshCw className="h-4 w-4" /> Try a different email
                    </button>
                    <Link to="/login"
                      className="flex items-center justify-center gap-2 rounded-xl bg-bocra-navy px-5 py-3 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors">
                      <ArrowLeft className="h-4 w-4" /> Back to login
                    </Link>
                  </div>
                </div>
              </motion.div>

            ) : (
              /* ── Request form ──────────────────────────────── */
              <motion.div variants={stagger} initial="hidden" animate="show">
                <motion.div variants={fadeUp} className="mb-8">
                  <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-bocra-teal transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to login
                  </Link>
                  <h1 className="font-heading text-3xl font-bold text-slate-900">Reset your password</h1>
                  <p className="mt-2 text-slate-500">Enter your email address and we'll send you a secure reset link.</p>
                </motion.div>

                <motion.div variants={fadeUp} className="rounded-2xl bg-white p-8 shadow-card-md">
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <div>
                      <label htmlFor="fp-email" className="form-label">Email address</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input id="fp-email" type="email" autoComplete="email" placeholder="you@example.com"
                          className={cn('form-input pl-10', errors.email && 'border-red-400 focus:ring-red-200')}
                          {...register('email')} />
                      </div>
                      {errors.email && <p className="form-error">{errors.email.message}</p>}
                    </div>

                    <button type="submit" disabled={mutation.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-bocra-navy py-3.5 text-sm font-bold text-white transition-all hover:bg-bocra-navy/90 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                      {mutation.isPending
                        ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sending…</>
                        : <>Send reset link <Mail className="h-4 w-4" /></>
                      }
                    </button>
                  </form>
                </motion.div>

                <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-slate-500">
                  Remember your password?{' '}
                  <Link to="/login" className="font-bold text-bocra-teal hover:underline">Sign in →</Link>
                </motion.p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}