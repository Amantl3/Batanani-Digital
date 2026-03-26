import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, CreditCard, ShieldCheck, ArrowRight, CheckCircle, Building2 } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const schema = z.object({
  fullName:          z.string().min(2, 'Full name must be at least 2 characters'),
  email:             z.string().email('Please enter a valid email address'),
  password:          z.string()
    .min(12,          'Must be at least 12 characters')
    .regex(/[A-Z]/,  'Must include an uppercase letter')
    .regex(/[0-9]/,  'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a symbol'),
  confirmPassword:   z.string(),
  omangNumber:       z.string().optional(),
  preferredLanguage: z.enum(['en', 'tn']),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

const STEPS_INFO = [
  { icon: Building2,   title: 'Business or individual', desc: 'Register as a licensee, stakeholder, or individual citizen' },
  { icon: ShieldCheck, title: 'Verified & secure',      desc: 'Omang verification keeps your account protected' },
  { icon: CheckCircle, title: 'Instant access',         desc: 'Start applying for licences and filing complaints right away' },
]

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '12+ characters',   ok: password.length >= 12 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number',           ok: /[0-9]/.test(password) },
    { label: 'Symbol',           ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const bars  = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-bocra-teal']
  const label = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score * 25}%` }}
            transition={{ duration: 0.3 }}
            className={cn('h-full rounded-full transition-colors', bars[score - 1] ?? 'bg-slate-200')}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 w-10">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <span key={c.label} className={cn('flex items-center gap-1.5 text-xs', c.ok ? 'text-bocra-teal' : 'text-slate-400')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', c.ok ? 'bg-bocra-teal' : 'bg-slate-200')} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth()
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<ReCAPTCHA>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredLanguage: 'en' },
  })

  const passwordValue = watch('password', '')
  const onSubmit = (data: FormData) => registerUser(data)

  return (
    <div className="flex min-h-screen overflow-hidden">

      {/* ── Left panel ───────────────────────────────────────── */}
      <div className="relative hidden w-[40%] flex-col justify-between overflow-hidden bg-bocra-navy p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-bocra-gold/15 via-transparent to-transparent" />

        <div className="relative">
          <Link to="/">
            <img src="/bocra-logo-white.png" alt="BOCRA" className="h-10 w-auto" />
          </Link>
        </div>

        <motion.div variants={stagger} initial="hidden" animate="show" className="relative">
          <motion.p variants={fadeUp} className="mb-4 inline-block rounded-full bg-bocra-gold/20 px-3 py-1 text-xs font-semibold text-bocra-gold">
            Create your account
          </motion.p>
          <motion.h2 variants={fadeUp} className="mb-6 font-heading text-4xl font-bold leading-tight text-white">
            Join Botswana's<br />
            <span className="text-bocra-gold">digital platform</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mb-10 text-slate-400">
            Free accounts for all citizens, businesses, and licensees in Botswana.
          </motion.p>
          <motion.div variants={stagger} className="space-y-5">
            {STEPS_INFO.map(s => (
              <motion.div key={s.title} variants={fadeUp} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bocra-gold/15">
                  <s.icon className="h-5 w-5 text-bocra-gold" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{s.title}</p>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-bocra-teal hover:underline">Sign in →</Link>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 bg-bocra-navy px-6 py-4 lg:hidden">
          <Link to="/"><img src="/bocra-logo-white.png" alt="BOCRA" className="h-8 w-auto" /></Link>
          <div className="flex gap-1">
            {['bg-bocra-teal','bg-bocra-green','bg-bocra-red','bg-bocra-gold'].map(c => (
              <div key={c} className={`h-2 w-2 rounded-full ${c}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto w-full max-w-lg px-6 py-10">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="mb-8">
                <h1 className="font-heading text-3xl font-bold text-slate-900">Create your account</h1>
                <p className="mt-2 text-slate-500">Free for all citizens and businesses in Botswana.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-2xl bg-white p-8 shadow-card-md">
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                  {/* Full name */}
                  <div>
                    <label htmlFor="fullName" className="form-label">Full name *</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input id="fullName" type="text" autoComplete="name" placeholder="Thabo Mokoena"
                        className={cn('form-input pl-10', errors.fullName && 'border-red-400')}
                        {...register('fullName')} />
                    </div>
                    {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className="form-label">Email address *</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com"
                        className={cn('form-input pl-10', errors.email && 'border-red-400')}
                        {...register('email')} />
                    </div>
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className="form-label">Password *</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input id="reg-password" type={showPass ? 'text' : 'password'}
                        autoComplete="new-password" placeholder="••••••••••••"
                        className={cn('form-input pl-10 pr-11', errors.password && 'border-red-400')}
                        {...register('password')} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPass ? 'Hide' : 'Show'}>
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password.message}</p>}
                    <PasswordStrength password={passwordValue} />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirm password *</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password" placeholder="••••••••••••"
                        className={cn('form-input pl-10 pr-11', errors.confirmPassword && 'border-red-400')}
                        {...register('confirmPassword')} />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showConfirm ? 'Hide' : 'Show'}>
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
                  </div>

                  {/* Omang */}
                  <div>
                    <label htmlFor="omangNumber" className="form-label">National ID / Omang <span className="font-normal text-slate-400">(optional)</span></label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input id="omangNumber" type="text" placeholder="123456789"
                        className="form-input pl-10"
                        {...register('omangNumber')} />
                    </div>
                    <p className="form-hint">Required for licensee accounts. Used for identity verification only — never shared.</p>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="form-label">Preferred language for communications</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ val:'en', label:'English' }, { val:'tn', label:'Setswana' }].map(opt => (
                        <label key={opt.val} className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all',
                          watch('preferredLanguage') === opt.val
                            ? 'border-bocra-teal bg-bocra-teal/5'
                            : 'border-slate-200 hover:border-slate-300'
                        )}>
                          <input type="radio" value={opt.val} className="accent-bocra-teal" {...register('preferredLanguage')} />
                          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={captchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''}
                      onChange={token => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                    />
                  </div>

                  <button type="submit" disabled={isRegistering || !captchaToken}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-bocra-navy py-3.5 text-sm font-bold text-white transition-all hover:bg-bocra-navy/90 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed">
                    {isRegistering
                      ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account…</>
                      : <>Create account <ArrowRight className="h-4 w-4" /></>
                    }
                  </button>
                </form>
              </motion.div>

              <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-bocra-teal hover:underline">Sign in →</Link>
              </motion.p>

              <motion.p variants={fadeUp} className="mt-4 text-center text-xs leading-relaxed text-slate-400">
                By creating an account you agree to BOCRA's{' '}
                <a href="https://www.bocra.org.bw/sites/default/files/documents/Annexure_3.3.1A_ccTLD_BW_Acceptable_User_Policy_Feb_2022.pdf" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Privacy Policy</a>
                {' '}and{' '}
                <Link to="/terms" className="underline hover:no-underline">Terms of Use</Link>.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}