import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const schema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useTranslation()
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
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bocra-navy">
          <ShieldCheck className="h-7 w-7 text-bocra-cyan" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">{t('auth.login_title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('auth.login_sub')}</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="form-label mb-0">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs text-bocra-blue hover:underline">
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" placeholder="••••••••••••"
                  className={cn('form-input pl-10 pr-10', errors.password && 'border-red-400 focus:ring-red-200')}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {/* MFA — revealed only when server returns 403 */}
            {showMFA && (
              <div className="animate-fade-in rounded-lg border border-blue-200 bg-blue-50 p-4">
                <label htmlFor="totpCode" className="form-label text-blue-800">{t('auth.mfa_code')}</label>
                <input
                  id="totpCode" type="text" inputMode="numeric" maxLength={6}
                  placeholder="000000" autoComplete="one-time-code"
                  className="form-input tracking-[0.3em]"
                  {...register('totpCode')}
                />
                <p className="form-hint text-blue-700">{t('auth.mfa_hint')}</p>
              </div>
            )}

            <button type="submit" disabled={isLoggingIn} className="btn-primary w-full justify-center">
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : t('auth.login_btn')}
            </button>
          </form>
        </div>

        <div className="card-footer text-center text-sm text-slate-500">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="font-medium text-bocra-blue hover:underline">
            {t('auth.sign_up')}
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> TLS 1.3 encrypted</span>
        <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Data Protection Act compliant</span>
      </div>
    </div>
  )
}