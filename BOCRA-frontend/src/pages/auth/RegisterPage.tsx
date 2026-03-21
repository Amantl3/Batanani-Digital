import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, User, CreditCard, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const schema = z.object({
  fullName:          z.string().min(2, 'Full name must be at least 2 characters'),
  email:             z.string().email('Please enter a valid email address'),
  password:          z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one symbol'),
  confirmPassword:   z.string(),
  omangNumber:       z.string().optional(),
  preferredLanguage: z.enum(['en', 'tn']),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '12+ characters',  ok: password.length >= 12 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number',           ok: /[0-9]/.test(password) },
    { label: 'Symbol',           ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const bar = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'][score - 1] ?? 'bg-slate-200'
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]

  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-slate-200">
          <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${score * 25}%` }} />
        </div>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <span key={c.label} className={cn('flex items-center gap-1 text-xs', c.ok ? 'text-emerald-600' : 'text-slate-400')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', c.ok ? 'bg-emerald-500' : 'bg-slate-300')} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register: registerUser, isRegistering } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLanguage: 'en' },
  })

  const passwordValue = watch('password', '')
  const onSubmit = (data: FormData) => registerUser(data)

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bocra-navy">
          <ShieldCheck className="h-7 w-7 text-bocra-cyan" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">{t('auth.register_title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('auth.register_sub')}</p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="form-label">{t('auth.full_name')}</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="fullName" type="text" autoComplete="name" placeholder="Thabo Mokoena"
                  className={cn('form-input pl-10', errors.fullName && 'border-red-400 focus:ring-red-200')}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
            </div>

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
              <label htmlFor="password" className="form-label">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                  placeholder="••••••••••••"
                  className={cn('form-input pl-10 pr-10', errors.password && 'border-red-400 focus:ring-red-200')}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
              <PasswordStrength password={passwordValue} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">{t('auth.confirm_password')}</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password" placeholder="••••••••••••"
                  className={cn('form-input pl-10 pr-10', errors.confirmPassword && 'border-red-400 focus:ring-red-200')}
                  {...register('confirmPassword')}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirm ? 'Hide' : 'Show'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>

            {/* Omang (optional) */}
            <div>
              <label htmlFor="omangNumber" className="form-label">{t('auth.omang')}</label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="omangNumber" type="text" placeholder="123456789"
                  className="form-input pl-10"
                  {...register('omangNumber')}
                />
              </div>
              <p className="form-hint">{t('auth.omang_hint')}</p>
            </div>

            {/* Language preference */}
            <div>
              <label htmlFor="preferredLanguage" className="form-label">{t('auth.language')}</label>
              <select id="preferredLanguage" className="form-select" {...register('preferredLanguage')}>
                <option value="en">English</option>
                <option value="tn">Setswana</option>
              </select>
            </div>

            <button type="submit" disabled={isRegistering} className="btn-primary w-full justify-center">
              {isRegistering ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : t('auth.register_btn')}
            </button>
          </form>
        </div>

        <div className="card-footer text-center text-sm text-slate-500">
          {t('auth.have_account')}{' '}
          <Link to="/login" className="font-medium text-bocra-blue hover:underline">
            {t('auth.sign_in')}
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
        By creating an account you agree to BOCRA's{' '}
        <Link to="/privacy" className="underline hover:no-underline">Privacy Policy</Link>
        {' '}and the{' '}
        <Link to="/terms" className="underline hover:no-underline">Terms of Use</Link>.
      </p>
    </div>
  )
}