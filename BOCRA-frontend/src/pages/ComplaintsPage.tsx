import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, Upload, X, FileText, Phone, MessageCircle,
  Search, Shield, Clock, ChevronRight, AlertTriangle, Info,
} from 'lucide-react'

import { useSubmitComplaint, useUploadAttachment } from '@/hooks/useComplaints'
import { cn } from '@/utils/cn'
import { COMPLAINT_CATEGORIES, SERVICE_PROVIDERS, FILE_UPLOAD } from '@/utils/constants'
import { formatFileSize } from '@/utils/formatters'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

// ── Schemas ────────────────────────────────────────────────────────────────────
const step1Schema = z.object({
  contactedProvider: z.literal(true, { errorMap: () => ({ message: 'You must confirm you have contacted your provider' }) }),
  daysWaited: z.enum(['yes', 'no'], { required_error: 'Please select an option' }),
})
const step2Schema = z.object({
  firstName: z.string().min(2, 'Required'),
  surname: z.string().min(2, 'Required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Required'),
  omang: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'sms']),
  preferredLanguage: z.enum(['en', 'tn']),
})
const step3Schema = z.object({
  provider: z.string().min(1, 'Please select a provider'),
  serviceType: z.string().min(1, 'Please select a service type'),
  category: z.string().min(1, 'Please select a complaint type'),
  dateStarted: z.string().min(1, 'Required'),
  description: z.string().min(50, 'At least 50 characters required'),
})
type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

// ── Step bar ───────────────────────────────────────────────────────────────────
const STEPS = ['Provider contact', 'Your details', 'Complaint info', 'Review & submit']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center bg-slate-50 px-6 py-5 border-b border-slate-100">
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-1 items-center">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
              i < current  && 'bg-bocra-teal text-white shadow-sm',
              i === current && 'bg-bocra-navy text-white shadow-md ring-4 ring-bocra-navy/20',
              i > current  && 'bg-slate-200 text-slate-400',
            )}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={cn(
              'hidden text-xs font-semibold sm:block transition-colors',
              i === current ? 'text-bocra-navy' : i < current ? 'text-bocra-teal' : 'text-slate-400',
            )}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'mx-3 h-0.5 flex-1 rounded-full transition-colors duration-500',
              i < current ? 'bg-bocra-teal' : 'bg-slate-200'
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── File upload zone ───────────────────────────────────────────────────────────
function FileUploadZone({ files, onAdd, onRemove }: {
  files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAdd,
    accept: FILE_UPLOAD.acceptedTypes as unknown as Record<string, string[]>,
    maxSize: FILE_UPLOAD.maxSizeBytes,
    maxFiles: FILE_UPLOAD.maxFiles - files.length,
    disabled: files.length >= FILE_UPLOAD.maxFiles,
  })
  return (
    <div className="space-y-2">
      <div {...getRootProps()} className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200',
        isDragActive ? 'border-bocra-teal bg-bocra-teal/5 scale-[1.01]'
          : files.length >= FILE_UPLOAD.maxFiles ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
          : 'border-slate-200 hover:border-bocra-teal hover:bg-bocra-teal/5',
      )}>
        <input {...getInputProps()} />
        <Upload className={cn('mx-auto mb-3 h-8 w-8 transition-colors', isDragActive ? 'text-bocra-teal' : 'text-slate-300')} />
        <p className="text-sm font-semibold text-slate-700">
          {isDragActive ? 'Drop your files here' : 'Drag & drop or click to upload'}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, JPG or PNG · max 5 MB each · up to 5 files</p>
      </div>
      <AnimatePresence>
        {files.map((f, i) => (
          <motion.li
            key={f.name + i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 list-none"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bocra-teal/10">
              <FileText className="h-4 w-4 text-bocra-teal" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
            </div>
            <button type="button" onClick={() => onRemove(i)}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ComplaintsPage() {
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [referenceNumber, setReferenceNumber] = useState('')
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({})
  const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({})

  const { mutate: submit, isPending: isSubmitting } = useSubmitComplaint()
  const { mutate: uploadFile } = useUploadAttachment()

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: { preferredContact: 'email', preferredLanguage: 'en' } })
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) })

  const onStep1 = () => setStep(1)
  const onStep2 = (d: Step2Data) => { setStep2Data(d); setStep(2) }
  const onStep3 = (d: Step3Data) => { setStep3Data(d); setStep(3) }

  const onSubmit = async () => {
    const keys: string[] = []
    for (const file of files) {
      await new Promise<void>(res => uploadFile(file, { onSuccess: r => { keys.push(r.key); res() }, onError: () => res() }))
    }
    submit({
      providerLicenceId: step3Data.provider ?? '',
      category: step3Data.category as never,
      description: step3Data.description ?? '',
      contact: { name: `${step2Data.firstName} ${step2Data.surname}`, email: step2Data.email ?? '', phone: step2Data.phone ?? '' },
      attachments: keys,
    }, { onSuccess: ({ referenceNumber: ref }) => { setReferenceNumber(ref); setStep(4) } })
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg text-center">
          <div className="bg-gradient-to-br from-bocra-teal to-teal-600 p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Complaint submitted!</h1>
            <p className="mt-2 text-sm text-white/80">We've received your complaint and will be in touch</p>
          </div>
          <div className="p-8">
            <p className="mb-1 text-sm text-slate-500">Your reference number</p>
            <p className="mb-6 font-mono text-2xl font-bold tracking-wider text-bocra-navy">
              {referenceNumber || 'CMP-2025-00001'}
            </p>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              A confirmation has been sent to <strong>{step2Data.email}</strong>. You can track your complaint status at any time using this reference number.
            </p>
            <div className="flex flex-col gap-3">
              <Link to={`/complaints/track/${referenceNumber}`} className="flex items-center justify-center gap-2 rounded-xl bg-bocra-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-bocra-navy/90">
                <Search className="h-4 w-4" /> Track complaint status
              </Link>
              <Link to="/" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50">
                Return to homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-teal/20 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-4">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Consumer complaints</span>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-bocra-teal/20 px-3 py-1">
                <Shield className="h-3.5 w-3.5 text-bocra-teal" />
                <span className="text-xs font-semibold text-bocra-teal">Consumer protection</span>
              </div>
              <h1 className="font-heading text-4xl font-bold text-white">File a complaint</h1>
              <p className="mt-2 max-w-lg text-slate-400">Submit a complaint about a licensed telecommunications, broadcasting, postal or internet service provider in Botswana.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Phone, label: '0800 600 125', sub: 'Toll-free' },
                { icon: Clock, label: '14 days', sub: 'Provider wait time' },
                { icon: CheckCircle, label: 'Free service', sub: 'No charge to complain' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <s.icon className="h-5 w-5 text-bocra-teal" />
                  <div>
                    <p className="text-sm font-bold text-white">{s.label}</p>
                    <p className="text-xs text-white/50">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* ── Form card ─────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <StepBar current={step} />

          <AnimatePresence mode="wait">
            {/* Step 0 — Provider contact */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form1.handleSubmit(onStep1)} className="p-8 space-y-6">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900">Before you file</h2>
                    <p className="mt-1 text-sm text-slate-500">BOCRA regulations require you to first contact your service provider and allow at least <strong>14 days</strong> for resolution.</p>
                  </div>
                  <div className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-5">
                    <label className="flex cursor-pointer gap-4">
                      <input type="checkbox" className="mt-0.5 h-5 w-5 rounded accent-bocra-teal shrink-0"
                        {...form1.register('contactedProvider')} />
                      <span className="text-sm leading-relaxed text-slate-700">
                        I confirm that I have contacted my service provider about this issue and either received an unsatisfactory response or received no response within 14 days.
                      </span>
                    </label>
                    {form1.formState.errors.contactedProvider && (
                      <p className="form-error mt-2">{form1.formState.errors.contactedProvider.message}</p>
                    )}
                  </div>
                  <div>
                    <p className="form-label">Has it been more than 14 days since you contacted your provider?</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[{ val: 'yes', label: 'Yes — more than 14 days' }, { val: 'no', label: 'No — less than 14 days' }].map(opt => (
                        <label key={opt.val} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all',
                          form1.watch('daysWaited') === opt.val ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300')}>
                          <input type="radio" value={opt.val} className="accent-bocra-teal" {...form1.register('daysWaited')} />
                          <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    {form1.formState.errors.daysWaited && (
                      <p className="form-error mt-2">{form1.formState.errors.daysWaited.message}</p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-bocra-navy/90 hover:-translate-y-0.5">
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 1 — Your details */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form2.handleSubmit(onStep2)} className="p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Your contact details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First name *</label>
                      <input type="text" placeholder="Thabo" className={cn('form-input', form2.formState.errors.firstName && 'border-red-400')} {...form2.register('firstName')} />
                      {form2.formState.errors.firstName && <p className="form-error">{form2.formState.errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Surname *</label>
                      <input type="text" placeholder="Mokoena" className={cn('form-input', form2.formState.errors.surname && 'border-red-400')} {...form2.register('surname')} />
                      {form2.formState.errors.surname && <p className="form-error">{form2.formState.errors.surname.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Email address *</label>
                    <input type="email" placeholder="you@example.com" className={cn('form-input', form2.formState.errors.email && 'border-red-400')} {...form2.register('email')} />
                    {form2.formState.errors.email && <p className="form-error">{form2.formState.errors.email.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Mobile number *</label>
                      <input type="tel" placeholder="+267 7X XXX XXX" className={cn('form-input', form2.formState.errors.phone && 'border-red-400')} {...form2.register('phone')} />
                      {form2.formState.errors.phone && <p className="form-error">{form2.formState.errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">National ID / Omang</label>
                      <input type="text" placeholder="Verification only" className="form-input" {...form2.register('omang')} />
                      <p className="form-hint">Not stored in complaint record</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Preferred contact</label>
                      <select className="form-select" {...form2.register('preferredContact')}>
                        <option value="email">Email</option>
                        <option value="phone">Phone call</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Preferred language</label>
                      <select className="form-select" {...form2.register('preferredLanguage')}>
                        <option value="en">English</option>
                        <option value="tn">Setswana</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 2 — Complaint info */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form3.handleSubmit(onStep3)} className="p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Complaint information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Service provider *</label>
                      <select className={cn('form-select', form3.formState.errors.provider && 'border-red-400')} {...form3.register('provider')}>
                        <option value="">Select provider…</option>
                        {SERVICE_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                      {form3.formState.errors.provider && <p className="form-error">{form3.formState.errors.provider.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Type of service *</label>
                      <select className={cn('form-select', form3.formState.errors.serviceType && 'border-red-400')} {...form3.register('serviceType')}>
                        <option value="">Select service…</option>
                        <option value="mobile">Mobile / Voice</option>
                        <option value="data">Mobile data / Internet</option>
                        <option value="fixed">Fixed broadband</option>
                        <option value="tv">Pay TV / Satellite</option>
                        <option value="postal">Postal services</option>
                      </select>
                      {form3.formState.errors.serviceType && <p className="form-error">{form3.formState.errors.serviceType.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Nature of complaint *</label>
                      <select className={cn('form-select', form3.formState.errors.category && 'border-red-400')} {...form3.register('category')}>
                        <option value="">Select type…</option>
                        {COMPLAINT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                      {form3.formState.errors.category && <p className="form-error">{form3.formState.errors.category.message}</p>}
                    </div>
                    <div>
                      <label className="form-label">Date issue began *</label>
                      <input type="date" className={cn('form-input', form3.formState.errors.dateStarted && 'border-red-400')} {...form3.register('dateStarted')} />
                      {form3.formState.errors.dateStarted && <p className="form-error">{form3.formState.errors.dateStarted.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Description of complaint *</label>
                    <textarea rows={5} placeholder="Describe what happened, when it started, and what the provider told you when you reported the issue…"
                      className={cn('form-textarea', form3.formState.errors.description && 'border-red-400')}
                      {...form3.register('description')} />
                    {form3.formState.errors.description
                      ? <p className="form-error">{form3.formState.errors.description.message}</p>
                      : <p className="form-hint">Minimum 50 characters</p>}
                  </div>
                  <div>
                    <label className="form-label">Supporting documents (optional)</label>
                    <FileUploadZone files={files}
                      onAdd={f => setFiles(p => [...p, ...f].slice(0, FILE_UPLOAD.maxFiles))}
                      onRemove={i => setFiles(p => p.filter((_, idx) => idx !== i))} />
                  </div>
                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="p-8 space-y-6">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Review your complaint</h2>
                  {[
                    {
                      title: 'Your details', step: 1,
                      rows: [
                        ['Name', `${step2Data.firstName} ${step2Data.surname}`],
                        ['Email', step2Data.email],
                        ['Phone', step2Data.phone],
                        ['Preferred contact', step2Data.preferredContact],
                      ]
                    },
                    {
                      title: 'Complaint details', step: 2,
                      rows: [
                        ['Provider', step3Data.provider],
                        ['Service type', step3Data.serviceType],
                        ['Category', step3Data.category],
                        ['Date started', step3Data.dateStarted],
                      ]
                    },
                  ].map(section => (
                    <div key={section.title} className="rounded-xl border border-slate-200 overflow-hidden">
                      <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-200">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.title}</p>
                        <button onClick={() => setStep(section.step)} className="text-xs font-semibold text-bocra-teal hover:underline">Edit</button>
                      </div>
                      <dl className="grid grid-cols-2 gap-px bg-slate-100">
                        {section.rows.map(([k, v]) => (
                          <div key={String(k)} className="bg-white px-5 py-3">
                            <dt className="text-xs text-slate-400">{k}</dt>
                            <dd className="mt-0.5 text-sm font-medium capitalize text-slate-900">{v || '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                  {step3Data.description && (
                    <div className="rounded-xl border border-slate-200 p-5">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Description</p>
                      <p className="text-sm leading-relaxed text-slate-700">{step3Data.description}</p>
                      {files.length > 0 && <p className="mt-2 text-xs text-slate-400">{files.length} attachment{files.length > 1 ? 's' : ''} attached</p>}
                    </div>
                  )}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed text-amber-800">Your personal information is collected under the Data Protection Act (Cap. 19:02) and used solely for complaint processing.</p>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button onClick={() => setStep(2)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Edit details</button>
                    <button onClick={onSubmit} disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-xl bg-bocra-teal px-8 py-3 text-sm font-bold text-white hover:bg-teal-600 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                      {isSubmitting
                        ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting…</>
                        : <><Shield className="h-4 w-4" />Submit complaint</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar ───────────────────────────────────────── */}
        <InView className="space-y-4">
          <motion.div variants={fadeUp} className="card overflow-hidden">
            <div className="bg-bocra-navy px-5 py-4">
              <h3 className="text-sm font-bold text-white">Before you submit</h3>
            </div>
            <div className="p-5 space-y-3 text-sm text-slate-600">
              <p>BOCRA can only investigate complaints against <strong>licensed</strong> service providers. You must have contacted your provider and allowed 14 days.</p>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Need help?</p>
                <a href="tel:0800600125" className="flex items-center gap-2 text-bocra-teal hover:underline">
                  <Phone className="h-4 w-4" /> 0800 600 125 (toll-free)
                </a>
                <a href="#" className="flex items-center gap-2 text-bocra-teal hover:underline">
                  <MessageCircle className="h-4 w-4" /> WhatsApp support
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="card overflow-hidden">
            <div className="bg-bocra-navy px-5 py-4">
              <h3 className="text-sm font-bold text-white">Track existing complaint</h3>
            </div>
            <div className="p-5">
              <p className="mb-3 text-xs text-slate-500">Already submitted? Enter your reference number.</p>
              <div className="flex gap-2">
                <input type="text" placeholder="CMP-2025-00123" className="form-input flex-1 font-mono text-sm" id="track-ref" />
                <Link to="/complaints/track/" className="rounded-lg bg-bocra-navy px-3 py-2 text-white hover:bg-bocra-navy/90 transition-colors">
                  <Search className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-amber-800">Important notice</p>
            </div>
            <p className="text-xs leading-relaxed text-amber-700">Filing a false complaint is an offence under the Communications Regulatory Authority Act.</p>
          </motion.div>
        </InView>
      </div>
    </div>
  )
}