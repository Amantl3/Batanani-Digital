import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Search, CheckCircle, XCircle, ChevronRight, ArrowLeft, Info, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'

const TLDS = [
  { ext: '.co.bw',  desc: 'Commercial businesses',        fee: 'BWP 200/year'  },
  { ext: '.org.bw', desc: 'Non-profit organisations',     fee: 'BWP 150/year'  },
  { ext: '.net.bw', desc: 'Network / ISP providers',      fee: 'BWP 200/year'  },
  { ext: '.edu.bw', desc: 'Educational institutions',     fee: 'BWP 100/year'  },
  { ext: '.gov.bw', desc: 'Government entities only',     fee: 'BWP 0 (free)'  },
  { ext: '.ac.bw',  desc: 'Academic institutions',        fee: 'BWP 100/year'  },
]

const schema = z.object({
  domainName:       z.string().min(3, 'Minimum 3 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  tld:              z.string().min(1, 'Please select a domain extension'),
  years:            z.string().min(1, 'Select registration period'),
  registrantName:   z.string().min(2, 'Required'),
  registrantEmail:  z.string().email('Valid email required'),
  registrantPhone:  z.string().min(7, 'Required'),
  organisation:     z.string().min(2, 'Required'),
  orgReg:           z.string().min(3, 'Required'),
  adminContact:     z.string().min(2, 'Required'),
  adminEmail:       z.string().email('Valid email required'),
  ns1:              z.string().optional(),
  ns2:              z.string().optional(),
  declaration:      z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
})
type FormData = z.infer<typeof schema>

const STEPS = ['Domain choice', 'Contact details', 'DNS settings', 'Review & pay']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center overflow-x-auto bg-slate-50 px-6 py-4 border-b border-slate-100">
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-1 items-center min-w-0">
          <div className="flex shrink-0 items-center gap-2">
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all', i < current && 'bg-bocra-teal text-white', i === current && 'bg-bocra-navy text-white ring-4 ring-bocra-navy/20', i > current && 'bg-slate-200 text-slate-400')}>{i < current ? '✓' : i + 1}</div>
            <span className={cn('hidden text-xs font-semibold whitespace-nowrap sm:block', i === current ? 'text-bocra-navy' : i < current ? 'text-bocra-teal' : 'text-slate-400')}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={cn('mx-2 h-0.5 flex-1', i < current ? 'bg-bocra-teal' : 'bg-slate-200')} />}
        </div>
      ))}
    </div>
  )
}

export default function DomainRegistrationPage() {
  const [step, setStep]               = useState(0)
  const [checkResult, setCheckResult] = useState<'available' | 'taken' | null>(null)
  const [checking, setChecking]       = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tld: '.co.bw', years: '1' },
  })

  const domainName = watch('domainName', '')
  const tld        = watch('tld', '.co.bw')
  const years      = watch('years', '1')
  const selectedTld = TLDS.find(t => t.ext === tld)

  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
  // GET /api/v1/domains/check?name=<domainName>&tld=<tld>
  // Response: { available: boolean, domain: string }
  const checkAvailability = async () => {
    if (!domainName || domainName.length < 3) return
    setChecking(true)
    await new Promise(r => setTimeout(r, 900))
    setCheckResult(Math.random() > 0.4 ? 'available' : 'taken')
    setChecking(false)
  }

  // POST /api/v1/domains/register
  // Body: { domainName, tld, years, registrantName, registrantEmail, ... }
  const onSubmit = async (_data: FormData) => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg text-center">
          <div className="bg-bocra-teal p-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20"><CheckCircle className="h-7 w-7 text-white" /></div>
            <h1 className="font-heading text-xl font-bold text-white">Domain registered!</h1>
            <p className="mt-1 text-sm text-white/80">Your .bw domain is being processed</p>
          </div>
          <div className="p-6">
            <div className="mb-4 rounded-xl bg-slate-50 p-4">
              <p className="font-mono text-xl font-bold text-bocra-navy">{domainName}{tld}</p>
              <p className="mt-1 text-sm text-slate-500">Registration period: {years} year{Number(years) > 1 ? 's' : ''}</p>
            </div>
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Clock className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800">DNS propagation takes 24–48 hours after payment is confirmed.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/portal" className="flex items-center justify-center gap-2 rounded-xl bg-bocra-navy px-6 py-3 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors">Go to my portal</Link>
              <Link to="/portal/pay" className="flex items-center justify-center gap-2 rounded-xl bg-bocra-teal px-6 py-3 text-sm font-bold text-white hover:bg-teal-600 transition-colors">Pay registration fee →</Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-teal/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Domain registration</span>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/portal" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-teal/20 px-3 py-1"><Globe className="h-3.5 w-3.5 text-bocra-teal" /><span className="text-xs font-semibold text-bocra-teal">.bw domain registry</span></div>
              <h1 className="font-heading text-3xl font-bold text-white">Register a .bw domain</h1>
              <p className="mt-1 text-slate-400">Register and manage your Botswana ccTLD domain name</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <StepBar current={step} />
            <AnimatePresence mode="wait">

              {/* Step 0 — Domain choice */}
              {step === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="p-8 space-y-6">
                    <h2 className="font-heading text-xl font-bold text-slate-900">Choose your domain</h2>
                    {/* Domain search */}
                    <div>
                      <label className="form-label">Domain name *</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input type="text" placeholder="yourcompany" className={cn('form-input lowercase', errors.domainName && 'border-red-400')}
                            {...register('domainName', { onChange: () => setCheckResult(null) })} />
                        </div>
                        <select className="form-select w-36" {...register('tld', { onChange: () => setCheckResult(null) })}>
                          {TLDS.map(t => <option key={t.ext} value={t.ext}>{t.ext}</option>)}
                        </select>
                        <button type="button" onClick={checkAvailability}
                          className="flex items-center gap-2 rounded-lg bg-bocra-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-bocra-navy/90 transition-colors whitespace-nowrap">
                          {checking ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Search className="h-4 w-4" />}
                          Check
                        </button>
                      </div>
                      {errors.domainName && <p className="form-error">{errors.domainName.message}</p>}

                      {/* Availability result */}
                      <AnimatePresence>
                        {checkResult && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className={cn('mt-3 flex items-center gap-3 rounded-xl p-4', checkResult === 'available' ? 'border border-bocra-teal/30 bg-bocra-teal/5' : 'border border-red-200 bg-red-50')}>
                            {checkResult === 'available'
                              ? <><CheckCircle className="h-5 w-5 text-bocra-teal shrink-0" /><div><p className="text-sm font-bold text-bocra-teal">{domainName}{tld} is available!</p><p className="text-xs text-slate-500">You can register this domain for {selectedTld?.fee}</p></div></>
                              : <><XCircle className="h-5 w-5 text-red-500 shrink-0" /><div><p className="text-sm font-bold text-red-700">{domainName}{tld} is taken</p><p className="text-xs text-slate-500">Try a different name or extension</p></div></>
                            }
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* TLD options */}
                    <div>
                      <p className="form-label">Available extensions</p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {TLDS.map(t => (
                          <label key={t.ext} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all', watch('tld') === t.ext ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300')}>
                            <input type="radio" value={t.ext} className="mt-0.5 accent-bocra-teal" {...register('tld', { onChange: () => setCheckResult(null) })} />
                            <div>
                              <p className="font-mono text-sm font-bold text-bocra-navy">{t.ext}</p>
                              <p className="text-xs text-slate-500">{t.desc}</p>
                              <p className="text-xs font-semibold text-bocra-teal">{t.fee}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Registration period */}
                    <div>
                      <label className="form-label">Registration period *</label>
                      <div className="flex gap-3">
                        {['1', '2', '3', '5'].map(y => (
                          <label key={y} className={cn('flex cursor-pointer flex-col items-center rounded-xl border-2 px-5 py-3 transition-all', watch('years') === y ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300')}>
                            <input type="radio" value={y} className="sr-only" {...register('years')} />
                            <span className="font-heading text-xl font-bold text-slate-900">{y}</span>
                            <span className="text-xs text-slate-500">year{Number(y) > 1 ? 's' : ''}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button type="button" onClick={() => { if (checkResult === 'available' || !domainName) setStep(1) }}
                        disabled={checkResult !== 'available' && !!domainName}
                        className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                        Continue <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1 — Contact details */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="p-8 space-y-5">
                    <h2 className="font-heading text-xl font-bold text-slate-900">Registrant details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2"><label className="form-label">Organisation / company *</label><input type="text" placeholder="Legal entity name" className={cn('form-input', errors.organisation && 'border-red-400')} {...register('organisation')} />{errors.organisation && <p className="form-error">{errors.organisation.message}</p>}</div>
                      <div><label className="form-label">CIPA registration no. *</label><input type="text" placeholder="BW-XXXXXXXX" className={cn('form-input', errors.orgReg && 'border-red-400')} {...register('orgReg')} />{errors.orgReg && <p className="form-error">{errors.orgReg.message}</p>}</div>
                      <div><label className="form-label">Registrant name *</label><input type="text" placeholder="Full name" className={cn('form-input', errors.registrantName && 'border-red-400')} {...register('registrantName')} />{errors.registrantName && <p className="form-error">{errors.registrantName.message}</p>}</div>
                      <div><label className="form-label">Registrant email *</label><input type="email" className={cn('form-input', errors.registrantEmail && 'border-red-400')} {...register('registrantEmail')} />{errors.registrantEmail && <p className="form-error">{errors.registrantEmail.message}</p>}</div>
                      <div><label className="form-label">Phone *</label><input type="tel" placeholder="+267 7X XXX XXX" className={cn('form-input', errors.registrantPhone && 'border-red-400')} {...register('registrantPhone')} />{errors.registrantPhone && <p className="form-error">{errors.registrantPhone.message}</p>}</div>
                    </div>
                    <div className="border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Administrative contact</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div><label className="form-label">Name *</label><input type="text" className={cn('form-input', errors.adminContact && 'border-red-400')} {...register('adminContact')} />{errors.adminContact && <p className="form-error">{errors.adminContact.message}</p>}</div>
                        <div><label className="form-label">Email *</label><input type="email" className={cn('form-input', errors.adminEmail && 'border-red-400')} {...register('adminEmail')} />{errors.adminEmail && <p className="form-error">{errors.adminEmail.message}</p>}</div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                      <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">Continue <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2 — DNS */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="p-8 space-y-5">
                    <h2 className="font-heading text-xl font-bold text-slate-900">DNS nameservers <span className="font-normal text-slate-400 text-base">(optional)</span></h2>
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3"><Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" /><p className="text-xs text-blue-800">You can configure nameservers now or manage them later from your portal dashboard. If left blank, BOCRA's default nameservers will be used.</p></div>
                    <div className="space-y-3">
                      <div><label className="form-label">Primary nameserver (NS1)</label><input type="text" placeholder="ns1.yourprovider.com" className="form-input" {...register('ns1')} /></div>
                      <div><label className="form-label">Secondary nameserver (NS2)</label><input type="text" placeholder="ns2.yourprovider.com" className="form-input" {...register('ns2')} /></div>
                    </div>
                    <div className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-4">
                      <label className="flex cursor-pointer gap-3">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-bocra-teal" {...register('declaration')} />
                        <span className="text-sm leading-relaxed text-slate-700">I confirm that I am authorised to register this domain on behalf of the organisation and that the domain will be used for lawful purposes in accordance with BOCRA's domain name policy.</span>
                      </label>
                      {errors.declaration && <p className="form-error mt-2">{errors.declaration.message}</p>}
                    </div>
                    <div className="flex justify-between pt-2">
                      <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                      <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">Review <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 — Review & pay */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="p-8 space-y-5">
                    <h2 className="font-heading text-xl font-bold text-slate-900">Review & confirm</h2>
                    <div className="overflow-hidden rounded-xl border border-bocra-teal/30 bg-bocra-teal/5">
                      <div className="px-5 py-4 border-b border-bocra-teal/20">
                        <p className="text-xs font-bold uppercase tracking-wider text-bocra-teal">Your domain</p>
                        <p className="font-mono text-2xl font-bold text-bocra-navy mt-1">{domainName}{tld}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-px bg-bocra-teal/20">
                        <div className="bg-white/80 px-4 py-3"><p className="text-xs text-slate-400">Extension</p><p className="font-semibold">{tld}</p></div>
                        <div className="bg-white/80 px-4 py-3"><p className="text-xs text-slate-400">Period</p><p className="font-semibold">{years} year{Number(years) > 1 ? 's' : ''}</p></div>
                        <div className="bg-white/80 px-4 py-3"><p className="text-xs text-slate-400">Fee</p><p className="font-semibold text-bocra-teal">{selectedTld?.fee}</p></div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3"><Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /><p className="text-xs text-amber-800">After submission you will be redirected to pay the registration fee. Your domain will be activated within 24 hours of payment confirmation.</p></div>
                    <div className="flex justify-between pt-2">
                      <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                      <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-bocra-teal px-8 py-3 text-sm font-bold text-white hover:bg-teal-600 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                        {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Registering…</> : <><Globe className="h-4 w-4" />Register domain</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="bg-bocra-navy px-5 py-4"><h3 className="text-sm font-bold text-white">Domain pricing</h3></div>
            <div className="divide-y divide-slate-100">
              {TLDS.map(t => (
                <div key={t.ext} className="flex items-center justify-between px-5 py-3">
                  <div><p className="font-mono text-sm font-bold text-bocra-navy">{t.ext}</p><p className="text-xs text-slate-500">{t.desc}</p></div>
                  <span className="text-sm font-semibold text-bocra-teal">{t.fee}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card space-y-2">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-2"><Info className="h-4 w-4 text-bocra-teal" />Domain policy</p>
            <p className="text-xs text-slate-500">.bw domains are restricted to registered entities in Botswana. .gov.bw is reserved for government use only.</p>
            <button className="text-xs font-semibold text-bocra-teal hover:underline">Read domain name policy →</button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"><p className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-bocra-teal" />Need help?</p><a href="mailto:domains@bocra.org.bw" className="block text-xs text-bocra-teal hover:underline">✉ domains@bocra.org.bw</a></div>
        </div>
      </div>
    </div>
  )
}