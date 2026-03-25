import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw, CheckCircle, ChevronRight, ArrowLeft,
  Calendar, AlertCircle, FileText, Upload, X, Info, CreditCard,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { formatFileSize, formatDate, formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

// Mock licences due for renewal — in production comes from GET /api/v1/licences/my
const MY_LICENCES = [
  { id: 'lic-001', number: 'BW-TEL-2021-0091', name: 'Telecommunications Licence',  category: 'telecom',   expires: '2026-01-15', fee: 48500, status: 'active',    daysLeft: 297 },
  { id: 'lic-002', number: 'BW-ISP-2023-0044', name: 'Internet Service Provider',    category: 'internet',  expires: '2025-08-30', fee: 22000, status: 'expiring',  daysLeft: 68  },
  { id: 'lic-003', number: 'BW-DOM-2024-0210', name: '.bw Domain — kafibres.co.bw',  category: 'domain',    expires: '2025-05-01', fee: 200,   status: 'critical',  daysLeft: 8   },
]

const STEPS = ['Select licence', 'Compliance documents', 'Review & pay']

const step2Schema = z.object({
  confirmedDetails: z.literal(true, { errorMap: () => ({ message: 'Please confirm your details are current' }) }),
  noChanges:        z.boolean().optional(),
  changesDesc:      z.string().optional(),
  declaration:      z.literal(true, { errorMap: () => ({ message: 'You must accept the declaration' }) }),
})
type Step2Data = z.infer<typeof step2Schema>

const STATUS_STYLE: Record<string, { badge: string; label: string; color: string }> = {
  active:   { badge: 'badge-success', label: 'Active',      color: 'text-bocra-teal' },
  expiring: { badge: 'badge-warning', label: 'Expiring soon',color: 'text-amber-600' },
  critical: { badge: 'badge-danger',  label: 'Urgent',       color: 'text-red-600'   },
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center overflow-x-auto bg-slate-50 px-6 py-4 border-b border-slate-100">
      {STEPS.map((label, i) => (
        <div key={i} className="flex flex-1 items-center min-w-0">
          <div className="flex shrink-0 items-center gap-2">
            <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
              i < current && 'bg-bocra-teal text-white',
              i === current && 'bg-bocra-navy text-white ring-4 ring-bocra-navy/20',
              i > current && 'bg-slate-200 text-slate-400')}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={cn('hidden text-xs font-semibold whitespace-nowrap sm:block',
              i === current ? 'text-bocra-navy' : i < current ? 'text-bocra-teal' : 'text-slate-400')}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('mx-2 h-0.5 flex-1', i < current ? 'bg-bocra-teal' : 'bg-slate-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

function FileZone({ files, onAdd, onRemove }: { files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAdd,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg'], 'image/png': ['.png'] },
    maxSize: 10 * 1024 * 1024,
  })
  return (
    <div className="space-y-2">
      <div {...getRootProps()} className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed px-6 py-6 text-center transition-all',
        isDragActive ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-bocra-teal hover:bg-bocra-teal/5',
      )}>
        <input {...getInputProps()} />
        <Upload className={cn('mx-auto mb-2 h-6 w-6', isDragActive ? 'text-bocra-teal' : 'text-slate-300')} />
        <p className="text-sm font-semibold text-slate-700">{isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}</p>
        <p className="mt-0.5 text-xs text-slate-400">PDF, JPG or PNG · max 10 MB</p>
      </div>
      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div key={f.name + i}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bocra-teal/10">
              <FileText className="h-3.5 w-3.5 text-bocra-teal" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
            </div>
            <button type="button" onClick={() => onRemove(i)}
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function RenewalLicencePage() {
  const navigate = useNavigate()
  const [step, setStep]               = useState(0)
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [files, setFiles]             = useState<File[]>([])
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })
  const selected = MY_LICENCES.find(l => l.id === selectedId)

  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
  // POST /api/v1/licences/renew
  // Body: { licenceId, documents: string[], declaration: true }
  // Returns: { reference: "REN-2025-XXXXX", invoiceId, amount }
  // After this → redirect to /portal/pay with the invoice pre-selected
  const onSubmit = async () => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted && selected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg text-center">
          <div className="bg-bocra-teal p-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-heading text-xl font-bold text-white">Renewal submitted!</h1>
            <p className="mt-1 text-sm text-white/80">Your application is under review</p>
          </div>
          <div className="p-8">
            <div className="mb-5 rounded-xl bg-slate-50 p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Licence</span><span className="font-mono font-bold text-bocra-teal">{selected.number}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Renewal fee</span><span className="font-bold">{formatCurrency(selected.fee)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">New expiry</span><span className="font-medium">1 year from approval</span></div>
            </div>
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">Renewal is not confirmed until the fee is paid. Please complete payment to activate your renewal.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/portal/pay" className="flex items-center justify-center gap-2 rounded-xl bg-bocra-teal px-6 py-3 text-sm font-bold text-white hover:bg-teal-600 transition-colors">
                <CreditCard className="h-4 w-4" /> Pay renewal fee now
              </Link>
              <Link to="/portal" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Back to portal
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
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-green/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Renew licence</span>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-green/20 px-3 py-1">
                <RefreshCw className="h-3.5 w-3.5 text-bocra-green" />
                <span className="text-xs font-semibold text-bocra-green">Licence renewal</span>
              </div>
              <h1 className="font-heading text-3xl font-bold text-white">Renew your licence</h1>
              <p className="mt-1 text-slate-400">Submit your renewal application and compliance documents</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <StepBar current={step} />

          <AnimatePresence mode="wait">

            {/* ── Step 0 — Select licence ──────────────────────── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="p-8 space-y-5">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900">Select licence to renew</h2>
                    <p className="mt-1 text-sm text-slate-500">Choose which licence you want to renew. You can submit one renewal at a time.</p>
                  </div>

                  <div className="space-y-3">
                    {MY_LICENCES.map(lic => {
                      const s = STATUS_STYLE[lic.status]
                      const isSelected = selectedId === lic.id
                      return (
                        <button key={lic.id} type="button" onClick={() => setSelectedId(lic.id)}
                          className={cn(
                            'w-full rounded-xl border-2 p-5 text-left transition-all',
                            isSelected ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300',
                            lic.status === 'critical' && !isSelected && 'border-red-200 bg-red-50/40',
                          )}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-mono text-xs font-bold text-bocra-teal">{lic.number}</p>
                                <span className={cn('badge', s.badge)}>{s.label}</span>
                              </div>
                              <p className="font-semibold text-slate-900">{lic.name}</p>
                              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Expires: {formatDate(lic.expires)}
                                </span>
                                <span className={cn('font-semibold', s.color)}>
                                  {lic.daysLeft} days remaining
                                </span>
                                <span>Renewal fee: <strong>{formatCurrency(lic.fee)}</strong></span>
                              </div>
                            </div>
                            <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                              isSelected ? 'border-bocra-teal bg-bocra-teal' : 'border-slate-300')}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {!selectedId && (
                    <p className="text-xs text-slate-400">Select a licence above to continue</p>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={!selectedId}
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:translate-y-0">
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 1 — Compliance documents ───────────────── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form onSubmit={form2.handleSubmit(() => setStep(2))} className="p-8 space-y-5">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900">Compliance & documents</h2>
                    <p className="mt-1 text-sm text-slate-500">Confirm your compliance status and upload any required renewal documents.</p>
                  </div>

                  {/* Renewing licence summary */}
                  {selected && (
                    <div className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-4 flex items-start gap-3">
                      <RefreshCw className="h-4 w-4 text-bocra-teal mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Renewing: {selected.name}</p>
                        <p className="font-mono text-xs text-bocra-teal">{selected.number}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Current expiry: {formatDate(selected.expires)}</p>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 p-5 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance confirmation</p>

                    <label className="flex cursor-pointer gap-3">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-bocra-teal" {...form2.register('confirmedDetails')} />
                      <span className="text-sm text-slate-700">I confirm that the company details, contact information, and ownership structure on file with BOCRA remain accurate and current.</span>
                    </label>
                    {form2.formState.errors.confirmedDetails && <p className="form-error">{form2.formState.errors.confirmedDetails.message}</p>}

                    <label className="flex cursor-pointer gap-3">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-bocra-teal" {...form2.register('noChanges')} />
                      <span className="text-sm text-slate-700">There have been no material changes to our operations, ownership, or network infrastructure during the licence period.</span>
                    </label>
                  </div>

                  <div>
                    <label className="form-label">If changes occurred, describe them below</label>
                    <textarea rows={3} placeholder="e.g. Change of ownership, new network infrastructure, expanded service area…"
                      className="form-textarea" {...form2.register('changesDesc')} />
                    <p className="form-hint">BOCRA may require additional information for significant operational changes.</p>
                  </div>

                  <div>
                    <label className="form-label">Supporting documents <span className="font-normal text-slate-400">(optional but recommended)</span></label>
                    <div className="mb-3 rounded-xl border border-bocra-navy/15 bg-bocra-navy/5 p-3">
                      <p className="text-xs font-semibold text-bocra-navy mb-1">Commonly required for renewal:</p>
                      <ul className="space-y-0.5 text-xs text-slate-600">
                        {['Updated certificate of incorporation (if changed)', 'Most recent audited financial statements', 'Latest QoS compliance report', 'Updated network diagram (if infrastructure changed)'].map(d => (
                          <li key={d} className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-bocra-navy/40" />{d}</li>
                        ))}
                      </ul>
                    </div>
                    <FileZone files={files}
                      onAdd={f => setFiles(p => [...p, ...f])}
                      onRemove={i => setFiles(p => p.filter((_, idx) => idx !== i))} />
                  </div>

                  <div className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-4">
                    <label className="flex cursor-pointer gap-3">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-bocra-teal" {...form2.register('declaration')} />
                      <span className="text-sm leading-relaxed text-slate-700">
                        I declare that all information provided in this renewal application is true, accurate, and complete. I understand that the licence will not be renewed until the renewal fee is paid in full.
                      </span>
                    </label>
                    {form2.formState.errors.declaration && <p className="form-error mt-2">{form2.formState.errors.declaration.message}</p>}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button type="submit" className="flex items-center gap-2 rounded-xl bg-bocra-navy px-8 py-3 text-sm font-semibold text-white hover:bg-bocra-navy/90 hover:-translate-y-0.5 transition-all">
                      Review application <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Step 2 — Review & pay ─────────────────────────── */}
            {step === 2 && selected && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-slate-900">Review & submit</h2>

                  {/* Licence being renewed */}
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between bg-slate-50 px-5 py-3 border-b border-slate-200">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Licence being renewed</p>
                      <button onClick={() => setStep(0)} className="text-xs font-semibold text-bocra-teal hover:underline">Change</button>
                    </div>
                    <dl className="grid grid-cols-2 gap-px bg-slate-100">
                      {[
                        ['Licence number', selected.number],
                        ['Licence type',   selected.name],
                        ['Current expiry', formatDate(selected.expires)],
                        ['Renewal fee',    formatCurrency(selected.fee)],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="bg-white px-5 py-3">
                          <dt className="text-xs text-slate-400">{k}</dt>
                          <dd className="mt-0.5 text-sm font-semibold text-slate-900">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Documents */}
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Documents ({files.length} attached)
                    </p>
                    {files.length === 0
                      ? <p className="text-sm text-slate-400">No documents attached — you can still proceed.</p>
                      : <div className="flex flex-wrap gap-2">
                          {files.map(f => (
                            <span key={f.name} className="rounded-lg bg-bocra-teal/10 px-2 py-1 text-xs font-medium text-bocra-teal">{f.name}</span>
                          ))}
                        </div>
                    }
                  </div>

                  {/* Fee notice */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-800">
                      <p className="font-bold mb-1">Payment required to complete renewal</p>
                      <p>After submitting this application you will be directed to pay the renewal fee of <strong>{formatCurrency(selected.fee)}</strong>. Your licence will only be renewed upon receipt of payment.</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button onClick={() => setStep(1)} className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">← Back</button>
                    <button onClick={onSubmit} disabled={submitting}
                      className="flex items-center gap-2 rounded-xl bg-bocra-teal px-8 py-3 text-sm font-bold text-white hover:bg-teal-600 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                      {submitting
                        ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting…</>
                        : <><RefreshCw className="h-4 w-4" />Submit renewal</>
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {selected && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="bg-bocra-navy px-5 py-4">
                <h3 className="text-sm font-bold text-white">Renewal summary</h3>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Renewal fee</span>
                  <span className="font-bold text-bocra-teal">{formatCurrency(selected.fee)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Processing time</span>
                  <span className="font-semibold">5–10 working days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">New duration</span>
                  <span className="font-semibold">1 year from approval</span>
                </div>
              </div>
            </div>
          )}

          {/* Expiry urgency cards */}
          {MY_LICENCES.filter(l => l.status !== 'active').map(l => (
            <div key={l.id} className={cn('rounded-xl border p-4',
              l.status === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50')}>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle className={cn('h-4 w-4 shrink-0', l.status === 'critical' ? 'text-red-500' : 'text-amber-500')} />
                <p className={cn('text-xs font-bold', l.status === 'critical' ? 'text-red-800' : 'text-amber-800')}>
                  {l.status === 'critical' ? 'Expires in 8 days!' : 'Expires in 68 days'}
                </p>
              </div>
              <p className={cn('text-xs', l.status === 'critical' ? 'text-red-700' : 'text-amber-700')}>
                {l.name} — <span className="font-mono">{l.number}</span>
              </p>
            </div>
          ))}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-bocra-teal" /> Renewal tips
            </p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Apply at least 90 days before expiry</li>
              <li>• Late renewals may incur a penalty fee</li>
              <li>• Ensure all compliance reports are submitted</li>
              <li>• Outstanding fees must be cleared first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}