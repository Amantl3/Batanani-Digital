import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { CheckCircle, Upload, X, FileText, Phone, MessageCircle, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSubmitComplaint, useUploadAttachment } from '@/hooks/useComplaints'
import { cn } from '@/utils/cn'
import { COMPLAINT_CATEGORIES, SERVICE_PROVIDERS, FILE_UPLOAD } from '@/utils/constants'
import { formatFileSize } from '@/utils/formatters'

// ── Schemas ───────────────────────────────────────────────────────────────────
const step1Schema = z.object({
  contactedProvider: z.literal(true, { errorMap: () => ({ message: 'You must confirm you have contacted your provider first' }) }),
  daysWaited:        z.enum(['yes', 'no'], { required_error: 'Please select an option' }),
})

const step2Schema = z.object({
  firstName:         z.string().min(2, 'First name is required'),
  surname:           z.string().min(2, 'Surname is required'),
  email:             z.string().email('Valid email required'),
  phone:             z.string().min(7, 'Phone number is required'),
  omang:             z.string().optional(),
  preferredContact:  z.enum(['email', 'phone', 'sms']),
  preferredLanguage: z.enum(['en', 'tn']),
})

const step3Schema = z.object({
  provider:    z.string().min(1, 'Please select a provider'),
  serviceType: z.string().min(1, 'Please select a service type'),
  category:    z.string().min(1, 'Please select a complaint type'),
  dateStarted: z.string().min(1, 'Please select a date'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ['Provider contact', 'Your details', 'Complaint info', 'Review & submit']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center bg-slate-50 px-6 py-4">
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-1 items-center gap-0">
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
              i < current  && 'bg-emerald-500 text-white',
              i === current && 'bg-bocra-blue text-white',
              i > current  && 'bg-slate-200 text-slate-500',
            )}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={cn(
              'hidden text-xs font-medium sm:block',
              i === current ? 'text-slate-900' : i < current ? 'text-emerald-600' : 'text-slate-400',
            )}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('mx-3 h-px flex-1', i < current ? 'bg-emerald-300' : 'bg-slate-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── File upload zone ──────────────────────────────────────────────────────────
function FileUploadZone({ files, onAdd, onRemove }: {
  files: File[]
  onAdd: (f: File[]) => void
  onRemove: (i: number) => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAdd,
    accept: FILE_UPLOAD.acceptedTypes as Record<string, string[]>,
    maxSize: FILE_UPLOAD.maxSizeBytes,
    maxFiles: FILE_UPLOAD.maxFiles - files.length,
    disabled: files.length >= FILE_UPLOAD.maxFiles,
  })

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          isDragActive
            ? 'border-bocra-blue bg-blue-50'
            : files.length >= FILE_UPLOAD.maxFiles
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
              : 'border-slate-200 hover:border-bocra-blue hover:bg-blue-50/30',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">
          {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG · max 5 MB · up to 5 files</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-bocra-blue" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ComplaintsPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [referenceNumber, setReferenceNumber] = useState('')

  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({})
  const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({})

  const { mutate: submit, isPending: isSubmitting } = useSubmitComplaint()
  const { mutate: uploadFile } = useUploadAttachment()

  // Step forms
  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: { preferredContact: 'email', preferredLanguage: 'en' } })
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) })

  const onStep1 = () => setStep(1)
  const onStep2 = (data: Step2Data) => { setStep2Data(data); setStep(2) }
  const onStep3 = (data: Step3Data) => { setStep3Data(data); setStep(3) }

  const onSubmit = async () => {
    const attachmentKeys: string[] = []
    for (const file of files) {
      await new Promise<void>((resolve) => {
        uploadFile(file, {
          onSuccess: (res) => { attachmentKeys.push(res.key); resolve() },
          onError:   () => resolve(),
        })
      })
    }

    submit(
      {
        providerLicenceId: step3Data.provider ?? '',
        category:          step3Data.category as never,
        description:       step3Data.description ?? '',
        contact: {
          name:  `${step2Data.firstName} ${step2Data.surname}`,
          email: step2Data.email ?? '',
          phone: step2Data.phone ?? '',
        },
        attachments: attachmentKeys,
      },
      {
        onSuccess: ({ referenceNumber: ref }) => {
          setReferenceNumber(ref)
          setStep(4)
        },
      }
    )
  }

  // ── Success screen ───────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <div className="card w-full max-w-md p-10 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mb-2 font-heading text-xl font-bold text-slate-900">
            {t('complaints.success.title')}
          </h1>
          <p className="mb-1 text-sm text-slate-600">Your reference number:</p>
          <p className="mb-6 font-mono text-lg font-bold text-bocra-blue">{referenceNumber || 'CMP-2025-00001'}</p>
          <p className="mb-8 text-sm leading-relaxed text-slate-500">
            A confirmation has been sent to <strong>{step2Data.email}</strong>. You can track your complaint status at any time using your reference number.
          </p>
          <div className="flex flex-col gap-2">
            <Link to={`/complaints/track/${referenceNumber}`} className="btn-primary w-full justify-center">
              Track complaint status
            </Link>
            <Link to="/" className="btn-secondary w-full justify-center">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="page-hero">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Complaints</span>
          </nav>
          <h1>{t('complaints.title')}</h1>
          <p>{t('complaints.subtitle')}</p>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* ── Multi-step form ─────────────────────────────────── */}
        <div className="card overflow-hidden">
          <StepBar current={step} />

          {/* Step 0 — Provider contact confirmation */}
          {step === 0 && (
            <form onSubmit={form1.handleSubmit(onStep1)} className="card-body space-y-6">
              <div>
                <h2 className="mb-1 font-heading text-lg font-bold text-slate-900">Have you contacted your provider?</h2>
                <p className="text-sm text-slate-500">
                  BOCRA regulations require you to first contact your service provider and allow them at least <strong>14 days</strong> to resolve the issue before escalating to BOCRA.
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded accent-bocra-blue"
                    {...form1.register('contactedProvider')}
                  />
                  <span className="text-sm text-blue-800">
                    I confirm that I have contacted my service provider about this issue and either received an unsatisfactory response or received no response within 14 days.
                  </span>
                </label>
                {form1.formState.errors.contactedProvider && (
                  <p className="form-error mt-2">{form1.formState.errors.contactedProvider.message}</p>
                )}
              </div>

              <div>
                <p className="form-label">Has it been more than 14 days since you contacted your provider?</p>
                <div className="mt-2 flex gap-4">
                  {['yes', 'no'].map(val => (
                    <label key={val} className="flex cursor-pointer items-center gap-2">
                      <input type="radio" value={val} className="accent-bocra-blue" {...form1.register('daysWaited')} />
                      <span className="text-sm capitalize text-slate-700">{val === 'yes' ? 'Yes, more than 14 days' : 'No, less than 14 days'}</span>
                    </label>
                  ))}
                </div>
                {form1.formState.errors.daysWaited && (
                  <p className="form-error">{form1.formState.errors.daysWaited.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn-primary">Continue →</button>
              </div>
            </form>
          )}

          {/* Step 1 — Your details */}
          {step === 1 && (
            <form onSubmit={form2.handleSubmit(onStep2)} className="card-body space-y-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">Your contact details</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">{t('complaints.form.first_name')} *</label>
                  <input type="text" placeholder="Thabo" className={cn('form-input', form2.formState.errors.firstName && 'border-red-400')} {...form2.register('firstName')} />
                  {form2.formState.errors.firstName && <p className="form-error">{form2.formState.errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="form-label">{t('complaints.form.surname')} *</label>
                  <input type="text" placeholder="Mokoena" className={cn('form-input', form2.formState.errors.surname && 'border-red-400')} {...form2.register('surname')} />
                  {form2.formState.errors.surname && <p className="form-error">{form2.formState.errors.surname.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">{t('complaints.form.email')} *</label>
                <input type="email" placeholder="you@example.com" className={cn('form-input', form2.formState.errors.email && 'border-red-400')} {...form2.register('email')} />
                {form2.formState.errors.email && <p className="form-error">{form2.formState.errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">{t('complaints.form.phone')} *</label>
                  <input type="tel" placeholder="+267 7X XXX XXX" className={cn('form-input', form2.formState.errors.phone && 'border-red-400')} {...form2.register('phone')} />
                  {form2.formState.errors.phone && <p className="form-error">{form2.formState.errors.phone.message}</p>}
                </div>
                <div>
                  <label className="form-label">{t('complaints.form.omang')}</label>
                  <input type="text" placeholder="For verification only" className="form-input" {...form2.register('omang')} />
                  <p className="form-hint">{t('complaints.form.omang_hint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">{t('complaints.form.contact_method')}</label>
                  <select className="form-select" {...form2.register('preferredContact')}>
                    <option value="email">Email</option>
                    <option value="phone">Phone call</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">{t('complaints.form.language')}</label>
                  <select className="form-select" {...form2.register('preferredLanguage')}>
                    <option value="en">English</option>
                    <option value="tn">Setswana</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary">← Back</button>
                <button type="submit" className="btn-primary">Continue →</button>
              </div>
            </form>
          )}

          {/* Step 2 — Complaint information */}
          {step === 2 && (
            <form onSubmit={form3.handleSubmit(onStep3)} className="card-body space-y-5">
              <h2 className="font-heading text-lg font-bold text-slate-900">Complaint information</h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">{t('complaints.form.provider')} *</label>
                  <select className={cn('form-select', form3.formState.errors.provider && 'border-red-400')} {...form3.register('provider')}>
                    <option value="">Select provider…</option>
                    {SERVICE_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  {form3.formState.errors.provider && <p className="form-error">{form3.formState.errors.provider.message}</p>}
                </div>
                <div>
                  <label className="form-label">{t('complaints.form.service_type')} *</label>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">{t('complaints.form.category')} *</label>
                  <select className={cn('form-select', form3.formState.errors.category && 'border-red-400')} {...form3.register('category')}>
                    <option value="">Select type…</option>
                    {COMPLAINT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {form3.formState.errors.category && <p className="form-error">{form3.formState.errors.category.message}</p>}
                </div>
                <div>
                  <label className="form-label">{t('complaints.form.date_started')} *</label>
                  <input type="date" className={cn('form-input', form3.formState.errors.dateStarted && 'border-red-400')} {...form3.register('dateStarted')} />
                  {form3.formState.errors.dateStarted && <p className="form-error">{form3.formState.errors.dateStarted.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">{t('complaints.form.description')} *</label>
                <textarea
                  rows={5}
                  placeholder="Describe what happened, when it started, and what the provider told you when you complained…"
                  className={cn('form-textarea', form3.formState.errors.description && 'border-red-400')}
                  {...form3.register('description')}
                />
                <div className="flex items-center justify-between">
                  {form3.formState.errors.description
                    ? <p className="form-error">{form3.formState.errors.description.message}</p>
                    : <p className="form-hint">{t('complaints.form.description_hint')}</p>
                  }
                </div>
              </div>

              <div>
                <label className="form-label">{t('complaints.form.attachments')}</label>
                <FileUploadZone
                  files={files}
                  onAdd={(f) => setFiles(prev => [...prev, ...f].slice(0, FILE_UPLOAD.maxFiles))}
                  onRemove={(i) => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                />
                <p className="form-hint">{t('complaints.form.attachments_hint')}</p>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">← Back</button>
                <button type="submit" className="btn-primary">Continue →</button>
              </div>
            </form>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="card-body space-y-6">
              <h2 className="font-heading text-lg font-bold text-slate-900">Review your complaint</h2>

              <div className="space-y-4">
                {/* Contact summary */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your details</p>
                    <button onClick={() => setStep(1)} className="text-xs text-bocra-blue hover:underline">Edit</button>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium">{step2Data.firstName} {step2Data.surname}</dd>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-medium">{step2Data.email}</dd>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium">{step2Data.phone}</dd>
                  </dl>
                </div>

                {/* Complaint summary */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Complaint details</p>
                    <button onClick={() => setStep(2)} className="text-xs text-bocra-blue hover:underline">Edit</button>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <dt className="text-slate-500">Provider</dt>
                    <dd className="font-medium capitalize">{step3Data.provider}</dd>
                    <dt className="text-slate-500">Category</dt>
                    <dd className="font-medium capitalize">{step3Data.category}</dd>
                    <dt className="text-slate-500">Service type</dt>
                    <dd className="font-medium capitalize">{step3Data.serviceType}</dd>
                    <dt className="text-slate-500">Date started</dt>
                    <dd className="font-medium">{step3Data.dateStarted}</dd>
                  </dl>
                  <p className="mt-3 text-sm text-slate-700">{step3Data.description}</p>
                  {files.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">{files.length} attachment{files.length > 1 ? 's' : ''} attached</p>
                  )}
                </div>
              </div>

              {/* DPA notice */}
              <p className="text-xs leading-relaxed text-slate-500">
                {t('complaints.dpa_notice')}
              </p>

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="btn-secondary">← Edit details</button>
                <button
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting
                    ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting…</span>
                    : t('complaints.form.submit')
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('complaints.before_title')}</h3>
            </div>
            <div className="card-body space-y-3 text-sm text-slate-600">
              <p>{t('complaints.before_body')}</p>
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-semibold text-slate-500">{t('complaints.help_title')}</p>
                <div className="space-y-2">
                  <a href="#faq" className="flex items-center gap-2 text-bocra-blue hover:underline text-sm">
                    <MessageCircle className="h-3.5 w-3.5" /> {t('complaints.faq')}
                  </a>
                  <a href="tel:0800600125" className="flex items-center gap-2 text-bocra-blue hover:underline text-sm">
                    <Phone className="h-3.5 w-3.5" /> {t('complaints.tollfree')}
                  </a>
                  <a href="https://wa.me/26774000000" className="flex items-center gap-2 text-bocra-blue hover:underline text-sm">
                    <MessageCircle className="h-3.5 w-3.5" /> {t('complaints.whatsapp')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Track existing complaint */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('complaints.track_title')}</h3>
              <p className="mt-1 text-xs text-slate-500">{t('complaints.track_sub')}</p>
            </div>
            <div className="card-body">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('complaints.track_placeholder')}
                  className="form-input flex-1 text-sm font-mono"
                  id="track-ref"
                />
                <Link
                  to={`/complaints/track/`}
                  className="btn-secondary px-3"
                >
                  <Search className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs leading-relaxed text-slate-500">{t('complaints.dpa_notice')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
