import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import * as authService from '@/services/auth'
import { cn } from '@/utils/cn'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
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

  // ── Success state ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="animate-fade-in">
        <div className="card p-10 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mb-2 font-heading text-xl font-bold text-slate-900">Check your email</h1>
          <p className="mb-1 text-sm text-slate-600">
            We've sent a password reset link to:
          </p>
          <p className="mb-6 font-medium text-slate-900">{submittedEmail}</p>
          <p className="mb-6 text-xs leading-relaxed text-slate-500">
            The link expires in 30 minutes. If you don't see the email, check your spam folder or{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-bocra-blue hover:underline"
            >
              try a different email address
            </button>.
          </p>
          <Link to="/login" className="btn-secondary w-full justify-center">
            <ArrowLeft className="h-4 w-4" /> {t('auth.back_to_login')}
          </Link>
        </div>
      </div>
    )
  }

  // ── Request form ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bocra-navy">
          <ShieldCheck className="h-7 w-7 text-bocra-cyan" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">{t('auth.reset_title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('auth.reset_sub')}</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="form-label">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email" type="email" autoComplete="email" placeholder="you@example.com"
                  className={cn('form-input pl-10', errors.email && 'border-red-400 focus:ring-red-200')}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full justify-center">
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending…
                </span>
              ) : t('auth.reset_btn')}
            </button>
          </form>
        </div>

        <div className="card-footer text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-bocra-blue">
            <ArrowLeft className="h-3.5 w-3.5" /> {t('auth.back_to_login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
