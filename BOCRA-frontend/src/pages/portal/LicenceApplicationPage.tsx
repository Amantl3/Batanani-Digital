import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Building2, Upload, CheckCircle, ChevronRight,
  X, AlertCircle, Info, ArrowLeft,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import * as licenceService from '@/services/licences'
import { cn } from '@/utils/cn'
import { formatFileSize } from '@/utils/formatters'
import { LICENCE_CATEGORIES, FILE_UPLOAD } from '@/utils/constants'

const step1Schema = z.object({ category: z.string().min(1, 'Please select a licence category') })
const step2Schema = z.object({
  companyName:        z.string().min(2,  'Required'),
  registrationNumber: z.string().min(3,  'Required'),
  physicalAddress:    z.string().min(10, 'Required'),
  postalAddress:      z.string().optional(),
  contactPerson:      z.string().min(2,  'Required'),
  contactEmail:       z.string().email('Valid email required'),
  contactPhone:       z.string().min(7,  'Required'),
  website:            z.string().url('Must be a valid URL').optional().or(z.literal('')),
})
const step3Schema = z.object({
  serviceDescription: z.string().min(100, 'At least 100 characters required'),
  coverageArea:       z.string().min(5,   'Required'),
  expectedLaunch:     z.string().min(1,   'Required'),
  declaration:        z.literal(true, { errorMap: () => ({ message: 'You must accept the declaration' }) }),
})
type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>

const STEPS = ['Licence type', 'Business details', 'Service details', 'Documents', 'Review & submit']

const CATEGORY_INFO: Record<string, { desc: string; fee: string; duration: string; docs: string[] }> = {
  telecom:       { desc: 'For voice, SMS, or data services over telecoms networks.', fee: 'BWP 50,000 – 200,000', duration: '30–60 working days', docs: ['Certificate of incorporation','Audited financials (last 2 years)','Technical capability statement','Bank guarantee / financial bond','Network architecture diagram'] },
  internet:      { desc: 'For Internet Service Providers offering broadband access.', fee: 'BWP 20,000 – 80,000',  duration: '21–45 working days', docs: ['Certificate of incorporation','ISP business plan','Technical infrastructure plan','Peering / transit agreements'] },
  broadcast:     { desc: 'For TV and radio broadcasters — free-to-air, pay TV, or community.', fee: 'BWP 15,000 – 120,000', duration: '30–90 working days', docs: ['Certificate of incorporation','Editorial policy document','Ownership and control declaration','Studio / transmission site plans'] },
  postal:        { desc: 'For courier, logistics, and postal service operators.', fee: 'BWP 5,000 – 30,000',   duration: '14–30 working days', docs: ['Certificate of incorporation','Route / service area map','Fleet and facilities inventory'] },
  type_approval: { desc: 'For importers or manufacturers of telecoms terminal equipment.', fee: 'BWP 2,500 per device', duration: '14–21 working days', docs: ['Device technical specification sheet','Test lab report (ICASA / FCC / CE equivalent)','Import permit or manufacturer authorisation'] },
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center overflow-x-auto bg-slate-50 px-6 py-5 border-b border-slate-100">
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-1 items-center min-w-0">
          <div className="flex shrink-0 items-center gap-2">
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all', i < current && 'bg-bocra-teal text-white', i === current && 'bg-bocra-navy text-white ring-4 ring-bocra-navy/20', i > current && 'bg-slate-200 text-slate-400')}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={cn('hidden text-xs font-semibold whitespace-nowrap sm:block', i === current ? 'text-bocra-navy' : i < current ? 'text-bocra-teal' : 'text-slate-400')}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={cn('mx-2 h-0.5 flex-1', i < current ? 'bg-bocra-teal' : 'bg-slate-200')} />}
        </div>
      ))}
    </div>
  )
}

function FileZone({ files, onAdd, onRemove }: { files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAdd, maxSize: FILE_UPLOAD.maxSizeBytes, maxFiles: 10 - files.length, disabled: files.length >= 10,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
  })
  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={cn('cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all', isDragActive ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-bocra-teal hover:bg-bocra-teal/5', files.length >= 10 && 'cursor-not-allowed opacity-50')}>
        <input {...getInputProps()} />
        <Upload className={cn('mx-auto mb-3 h-7 w-7', isDragActive ? 'text-bocra-teal' : 'text-slate-300')} />
        <p className="text-sm font-semibold text-slate-700">{isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}</p>
        <p className="mt-1 text-xs text-slate-400">PDF, JPG or PNG · max 5 MB · up to 10 files</p>
      </div>
      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div key={f.name + i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bocra-teal/10"><FileText className="h-4 w-4 text-bocra-teal" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{f.name}</p><p className="text-xs text-slate-400">{formatFileSize(f.size)}</p></div>
            <button type="button" onClick={() => onRemove(i)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"><X className="h-4 w-4" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function LicenceApplicationPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [step1Data, setStep1] = useState<Partial<Step1Data>>({})
  const [step2Data, setStep2] = useState<Partial<Step2Data>>({})
  const [step3Data, setStep3] = useState<Partial<Step3Data>>({})
  const [refNumber, setRefNumber] = useState('')

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })
  const form3 = useForm<Step3Data>({ resolver: zodResolver(step3Schema) })

  const selectedCategory = form1.watch('category') || step1Data.category || ''
  const catInfo = CATEGORY_INFO[selectedCategory]

  // ── BACKEND INTEGRATION POINT ────────────────────────────────────────────
  // Calls POST /api/v1/licences/apply  (see src/services/licences.ts)
  // Your Railway backend receives: { category, companyName, documents[], declaration }
  // and stores to PostgreSQL licences + licence_applications tables
  // Returns: { id, reference: "APP-2025-XXXXX", status: "submitted" }
  const applyMutation = useMutation({
    mutationFn: (payload: Parameters<typeof licenceService.applyForLicence>[0]) =>
      licenceService.applyForLicence(payload),
    onSuccess: (data) => {
      setRefNumber(data.reference)
      qc.invalidateQueries({ queryKey: ['licences', 'my-applications'] })
      setStep(5)
    },
  })

  const onStep1 = (d: Step1Data) => { setStep1(d); setStep(1) }
  const onStep2 = (d: Step2Data) => { setStep2(d); setStep(2) }
  const onStep3 = (d: Step3Data) => { setStep3(d); setStep(3) }

  const onSubmit = () => {
    applyMutation.mutate({
      category:    step1Data.category ?? '',
      companyName: step2Data.companyName ?? '',
      documents:   files.map(f => f.name),
      declaration: true,
    })
  }

  if (step === 5) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg text-center">
          <div className="bg-bocra-teal p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20"><CheckCircle className="h-8 w-8 text-white" /></div>
            <h1 className="font-heading text-2xl font-bold text-white">Application submitted!</h1>
            <p className="mt-2 text-sm text-white/80">We will review and be in touch shortly</p>
          </div>
          <div className="p-8">
            <p className="mb-1 text-sm text-slate-500">Your application reference</p>
            <p className="mb-6 font-mono text-2xl font-bold tracking-wider text-bocra-navy">{refNumber || 'APP-2025-00001'}</p>
            <ul className="mb-6 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
              {['Confirmation email sent to you', `Processing: ${catInfo?.duration ?? '21–60 working days'}`, 'You will be contacted if documents are missing', 'Track progress in your portal'].map(t => (
                <li key={t} className="flex items-start gap-2"><CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-bocra-teal" />{t}</li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <Link to="/portal" className="flex items-center justify-center gap-2 rounded-xl bg-bocra-navy px-6 py-3 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors">Go to my portal</Link>
              <Link to="/licensing" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">View licence registry</Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-green/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Apply for licence</span>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></button>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Apply for a licence</h1>
              <p className="mt-1 text-slate-400">Complete all steps to submit your application to BOCRA</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <StepBar current={step} />
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form1.handleSubmit(onStep1)} className="p-8 space-y-5">
                  <div><h2 className="font-heading text-xl font-bold text-slate-900">Select licence category</h2><p className="mt-1 text-sm text-slate-500">Choose the type of licence. Different categories have different requirements and fees.</p></div>
                  <div className="space-y-3">
                    {LICENCE_CATEGORIES.map(cat => {
                      const info = CATEGORY_INFO[cat.value]
                      const selected = form1.watch('category') === cat.value
                      return (
                        <label key={cat.value} className={cn('flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all', selected ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300')}>
                          <input type="radio" value={cat.value} className="mt-1 accent-bocra-teal" {...form1.register('category')} />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{cat.label}</p>
                            {info && <p className="mt-0.5 text-xs text-slate-500">{info.desc}</p>}
                            {info && selected && <div className="mt-2 flex flex-wrap gap-4 text-xs"><span className="text-bocra-teal"><strong>Fee:</strong> {info.fee}</span><span className="text-slate-500"><strong>Processing:</strong> {info.duration}</span></div>}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                  {form1.formState.errors.category && <p className="form-error">{form1.formState.errors.category.message}</p>}
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">Continue <ChevronRight className="h-4 w-4" /></button>
                  </div>
                </form>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form2.handleSubmit(onStep2)} className="p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Business details</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><label className="form-label">Company / trading name *</label><input type="text" placeholder="Kalahari Fibre Networks Ltd" className={cn('form-input', form2.formState.errors.companyName && 'border-red-400')} {...form2.register('companyName')} />{form2.formState.errors.companyName && <p className="form-error">{form2.formState.errors.companyName.message}</p>}</div>
                    <div><label className="form-label">CIPA registration number *</label><input type="text" placeholder="BW-12345678" className={cn('form-input', form2.formState.errors.registrationNumber && 'border-red-400')} {...form2.register('registrationNumber')} />{form2.formState.errors.registrationNumber && <p className="form-error">{form2.formState.errors.registrationNumber.message}</p>}</div>
                    <div><label className="form-label">Company website</label><input type="url" placeholder="https://yourcompany.co.bw" className="form-input" {...form2.register('website')} /></div>
                    <div className="sm:col-span-2"><label className="form-label">Physical address *</label><textarea rows={2} placeholder="Plot number, street, city, district" className={cn('form-textarea', form2.formState.errors.physicalAddress && 'border-red-400')} {...form2.register('physicalAddress')} />{form2.formState.errors.physicalAddress && <p className="form-error">{form2.formState.errors.physicalAddress.message}</p>}</div>
                    <div className="sm:col-span-2"><label className="form-label">Postal address <span className="font-normal text-slate-400">(if different)</span></label><input type="text" placeholder="P.O. Box 1234, Gaborone" className="form-input" {...form2.register('postalAddress')} /></div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Primary contact person</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className="form-label">Full name *</label><input type="text" placeholder="Thabo Mokoena" className={cn('form-input', form2.formState.errors.contactPerson && 'border-red-400')} {...form2.register('contactPerson')} />{form2.formState.errors.contactPerson && <p className="form-error">{form2.formState.errors.contactPerson.message}</p>}</div>
                      <div><label className="form-label">Phone number *</label><input type="tel" placeholder="+267 7X XXX XXX" className={cn('form-input', form2.formState.errors.contactPhone && 'border-red-400')} {...form2.register('contactPhone')} />{form2.formState.errors.contactPhone && <p className="form-error">{form2.formState.errors.contactPhone.message}</p>}</div>
                      <div className="sm:col-span-2"><label className="form-label">Email address *</label><input type="email" placeholder="contact@yourcompany.co.bw" className={cn('form-input', form2.formState.errors.contactEmail && 'border-red-400')} {...form2.register('contactEmail')} />{form2.formState.errors.contactEmail && <p className="form-error">{form2.formState.errors.contactEmail.message}</p>}</div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">Continue <ChevronRight className="h-4 w-4" /></button>
                  </div>
                </form>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form3.handleSubmit(onStep3)} className="p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Service details</h2>
                  <div><label className="form-label">Description of proposed service *</label><textarea rows={5} placeholder="Describe the service you intend to provide, technology used, target market, and compliance approach…" className={cn('form-textarea', form3.formState.errors.serviceDescription && 'border-red-400')} {...form3.register('serviceDescription')} />{form3.formState.errors.serviceDescription ? <p className="form-error">{form3.formState.errors.serviceDescription.message}</p> : <p className="form-hint">Minimum 100 characters</p>}</div>
                  <div><label className="form-label">Intended coverage area *</label><input type="text" placeholder="e.g. Gaborone and Francistown initially, expanding nationally within 2 years" className={cn('form-input', form3.formState.errors.coverageArea && 'border-red-400')} {...form3.register('coverageArea')} />{form3.formState.errors.coverageArea && <p className="form-error">{form3.formState.errors.coverageArea.message}</p>}</div>
                  <div><label className="form-label">Expected service launch date *</label><input type="date" className={cn('form-input', form3.formState.errors.expectedLaunch && 'border-red-400')} {...form3.register('expectedLaunch')} />{form3.formState.errors.expectedLaunch && <p className="form-error">{form3.formState.errors.expectedLaunch.message}</p>}</div>
                  <div className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-5"><label className="flex cursor-pointer gap-4"><input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded accent-bocra-teal" {...form3.register('declaration')} /><span className="text-sm leading-relaxed text-slate-700">I declare that all information provided is true and accurate. I understand that false information is an offence under the Communications Regulatory Authority Act.</span></label>{form3.formState.errors.declaration && <p className="form-error mt-2">{form3.formState.errors.declaration.message}</p>}</div>
                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">Continue <ChevronRight className="h-4 w-4" /></button>
                  </div>
                </form>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="p-8 space-y-6">
                  <div><h2 className="font-heading text-xl font-bold text-slate-900">Upload documents</h2><p className="mt-1 text-sm text-slate-500">Upload all required documents. Clear scans or digital originals only.</p></div>
                  {catInfo && <div className="rounded-xl border border-bocra-navy/20 bg-bocra-navy/5 p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-bocra-navy">Required for {LICENCE_CATEGORIES.find(c => c.value === step1Data.category)?.label}</p><ul className="space-y-1">{catInfo.docs.map(d => <li key={d} className="flex items-center gap-2 text-xs text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-bocra-navy/40" />{d}</li>)}</ul></div>}
                  <FileZone files={files} onAdd={f => setFiles(p => [...p, ...f].slice(0, 10))} onRemove={i => setFiles(p => p.filter((_, idx) => idx !== i))} />
                  <div className="flex justify-between pt-2">
                    <button onClick={() => setStep(2)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button onClick={() => setStep(4)} className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">Review application <ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Review & submit</h2>
                  {[
                    { title: 'Licence type', editStep: 0, rows: [['Category', LICENCE_CATEGORIES.find(c => c.value === step1Data.category)?.label], ['Fee range', catInfo?.fee], ['Processing', catInfo?.duration]] },
                    { title: 'Business details', editStep: 1, rows: [['Company name', step2Data.companyName], ['Reg. number', step2Data.registrationNumber], ['Contact', step2Data.contactPerson], ['Email', step2Data.contactEmail], ['Phone', step2Data.contactPhone]] },
                    { title: 'Service details', editStep: 2, rows: [['Coverage area', step3Data.coverageArea], ['Launch date', step3Data.expectedLaunch]] },
                  ].map(section => (
                    <div key={section.title} className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.title}</p><button onClick={() => setStep(section.editStep)} className="text-xs font-semibold text-bocra-teal hover:underline">Edit</button></div>
                      <dl className="grid grid-cols-2 gap-px bg-slate-100">{section.rows.map(([k, v]) => <div key={String(k)} className="bg-white px-5 py-3"><dt className="text-xs text-slate-400">{k}</dt><dd className="mt-0.5 text-sm font-medium text-slate-900">{v || '—'}</dd></div>)}</dl>
                    </div>
                  ))}
                  <div className="rounded-xl border border-slate-200 p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Documents ({files.length} attached)</p>{files.length === 0 ? <p className="text-sm text-amber-600">⚠ No documents — you can still submit but may be asked later.</p> : <div className="flex flex-wrap gap-2">{files.map(f => <span key={f.name} className="rounded-lg bg-bocra-teal/10 px-2 py-1 text-xs font-medium text-bocra-teal">{f.name}</span>)}</div>}</div>
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /><p className="text-xs leading-relaxed text-amber-800">Submitting confirms your declaration. False information is an offence under the CRA Act.</p></div>
                  <div className="flex justify-between pt-2">
                    <button onClick={() => setStep(3)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button onClick={onSubmit} disabled={applyMutation.isPending} className="flex items-center gap-2 rounded-xl bg-bocra-teal px-8 py-3 text-sm font-bold text-white hover:bg-teal-600 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                      {applyMutation.isPending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting…</> : <><CheckCircle className="h-4 w-4" />Submit application</>}
                    </button>
                  </div>
                  {applyMutation.isError && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4"><AlertCircle className="h-4 w-4 text-red-500 shrink-0" /><p className="text-sm text-red-700">Submission failed. Please try again.</p></div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          {catInfo && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="bg-bocra-navy px-5 py-4"><div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-bocra-teal" /><h3 className="text-sm font-bold text-white">{LICENCE_CATEGORIES.find(c => c.value === step1Data.category)?.label ?? 'Licence info'}</h3></div></div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Estimated fee</span><span className="font-semibold text-bocra-teal">{catInfo.fee}</span></div>
                <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Processing time</span><span className="font-semibold">{catInfo.duration}</span></div>
                <div><p className="mb-2 text-xs font-bold text-slate-400">Required documents</p><ul className="space-y-1.5">{catInfo.docs.map(d => <li key={d} className="flex items-start gap-2 text-xs text-slate-600"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-bocra-teal" />{d}</li>)}</ul></div>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-2"><Info className="h-4 w-4 text-bocra-teal" />Need assistance?</p>
            <p className="text-xs text-slate-500">Mon–Fri, 07:30–17:00 CAT</p>
            <a href="tel:+26739570000" className="block text-xs text-bocra-teal hover:underline">+267 395 7755</a>
            <a href="mailto:licensing@bocra.org.bw" className="block text-xs text-bocra-teal hover:underline">licensing@bocra.org.bw</a>
          </div>
        </div>
      </div>
    </div>
  )
}