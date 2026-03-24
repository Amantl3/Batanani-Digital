import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  BarChart2, Upload, FileText, CheckCircle, AlertCircle,
  Clock, ChevronRight, X, ArrowLeft, Calendar, Info,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { formatFileSize } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

const REPORT_TYPES = [
  { value: 'qos_q1',       label: 'Quality of Service Report — Q1 2025',         due: '2025-04-30', status: 'overdue'   },
  { value: 'qos_q2',       label: 'Quality of Service Report — Q2 2025',         due: '2025-07-31', status: 'upcoming'  },
  { value: 'coverage_map', label: 'Annual Network Coverage Map 2025',             due: '2025-06-30', status: 'upcoming'  },
  { value: 'audit_2024',   label: 'Annual Compliance Audit Report 2024/25',       due: '2025-05-31', status: 'submitted' },
  { value: 'spectrum',     label: 'Spectrum Utilisation Report — H1 2025',        due: '2025-07-15', status: 'upcoming'  },
]

const schema = z.object({
  reportType:    z.string().min(1, 'Please select a report type'),
  reportingPeriod: z.string().min(1, 'Required'),
  submitterName: z.string().min(2, 'Required'),
  submitterRole: z.string().min(2, 'Required'),
  notes:         z.string().optional(),
  declaration:   z.literal(true, { errorMap: () => ({ message: 'You must confirm the declaration' }) }),
})
type FormData = z.infer<typeof schema>

const STATUS_STYLE: Record<string, { badge: string; icon: React.ElementType; label: string }> = {
  overdue:   { badge: 'badge-danger',  icon: AlertCircle,  label: 'Overdue'   },
  upcoming:  { badge: 'badge-warning', icon: Clock,        label: 'Upcoming'  },
  submitted: { badge: 'badge-success', icon: CheckCircle,  label: 'Submitted' },
  draft:     { badge: 'badge-muted',   icon: FileText,     label: 'Draft'     },
}

function FileZone({ files, onAdd, onRemove }: { files: File[]; onAdd: (f: File[]) => void; onRemove: (i: number) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onAdd,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'image/jpeg': ['.jpg'], 'image/png': ['.png'] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 5 - files.length,
    disabled: files.length >= 5,
  })
  return (
    <div className="space-y-2">
      <div {...getRootProps()} className={cn('cursor-pointer rounded-xl border-2 border-dashed px-6 py-6 text-center transition-all', isDragActive ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-bocra-teal hover:bg-bocra-teal/5', files.length >= 5 && 'cursor-not-allowed opacity-50')}>
        <input {...getInputProps()} />
        <Upload className={cn('mx-auto mb-2 h-6 w-6', isDragActive ? 'text-bocra-teal' : 'text-slate-300')} />
        <p className="text-sm font-semibold text-slate-700">{isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}</p>
        <p className="mt-0.5 text-xs text-slate-400">PDF, Excel, JPG or PNG · max 20 MB · up to 5 files</p>
      </div>
      <AnimatePresence>
        {files.map((f, i) => (
          <motion.div key={f.name + i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bocra-teal/10">
              <FileText className="h-3.5 w-3.5 text-bocra-teal" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(f.size)}</p>
            </div>
            <button type="button" onClick={() => onRemove(i)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function CompliancePage() {
  const [files, setFiles] = useState<File[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
  // POST /api/v1/licences/compliance
  // Body: { reportType, reportingPeriod, submitterName, submitterRole, notes, documents: string[] }
  // Upload files to S3 first, then submit keys
  const onSubmit = async (_data: FormData) => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500)) // replace with real API call
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg text-center">
          <div className="bg-bocra-teal p-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-heading text-xl font-bold text-white">Report submitted!</h1>
            <p className="mt-1 text-sm text-white/80">Your compliance report has been received by BOCRA</p>
          </div>
          <div className="p-6">
            <p className="mb-5 text-sm text-slate-500">Your report has been logged and will be reviewed by the compliance team. You will be notified if any clarification is needed.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => setSubmitted(false)} className="flex items-center justify-center gap-2 rounded-xl bg-bocra-navy px-6 py-3 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors">
                Submit another report
              </button>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-navy/50 via-transparent to-bocra-teal/10" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Compliance reports</span>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/portal" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-teal/20 px-3 py-1">
                <BarChart2 className="h-3.5 w-3.5 text-bocra-teal" />
                <span className="text-xs font-semibold text-bocra-teal">Regulatory compliance</span>
              </div>
              <h1 className="font-heading text-3xl font-bold text-white">Submit compliance report</h1>
              <p className="mt-1 text-slate-400">Upload your QoS reports, coverage maps, audit submissions, and spectrum utilisation data</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* Form */}
        <div className="space-y-5">
          {/* Obligation summary */}
          <InView>
            <motion.p variants={fadeUp} className="section-label">Your reporting obligations</motion.p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {REPORT_TYPES.map(r => {
                const s = STATUS_STYLE[r.status]
                const Icon = s.icon
                return (
                  <motion.div key={r.value} variants={fadeUp}
                    className={cn('rounded-xl border bg-white p-4 shadow-card', r.status === 'overdue' && 'border-red-200 bg-red-50/40')}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', r.status === 'overdue' ? 'text-red-500' : r.status === 'submitted' ? 'text-bocra-teal' : 'text-amber-500')} />
                      <span className={cn('badge', s.badge)}>{s.label}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-snug">{r.label}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(r.due).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </InView>

          {/* Submission form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="border-b border-slate-100 bg-bocra-navy px-6 py-4">
              <h2 className="font-heading text-base font-bold text-white">New submission</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="form-label">Report type *</label>
                  <select className={cn('form-select', errors.reportType && 'border-red-400')} {...register('reportType')}>
                    <option value="">Select report type…</option>
                    {REPORT_TYPES.filter(r => r.status !== 'submitted').map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {errors.reportType && <p className="form-error">{errors.reportType.message}</p>}
                </div>
                <div>
                  <label className="form-label">Reporting period *</label>
                  <input type="text" placeholder="e.g. Q1 2025 (Jan–Mar)" className={cn('form-input', errors.reportingPeriod && 'border-red-400')} {...register('reportingPeriod')} />
                  {errors.reportingPeriod && <p className="form-error">{errors.reportingPeriod.message}</p>}
                </div>
                <div>
                  <label className="form-label">Submitted by *</label>
                  <input type="text" placeholder="Full name of authorised person" className={cn('form-input', errors.submitterName && 'border-red-400')} {...register('submitterName')} />
                  {errors.submitterName && <p className="form-error">{errors.submitterName.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Role / designation *</label>
                  <input type="text" placeholder="e.g. Chief Technical Officer" className={cn('form-input', errors.submitterRole && 'border-red-400')} {...register('submitterRole')} />
                  {errors.submitterRole && <p className="form-error">{errors.submitterRole.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Notes / cover letter <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea rows={3} placeholder="Any explanatory notes or context for this submission…" className="form-textarea" {...register('notes')} />
                </div>
              </div>

              <div>
                <label className="form-label">Report documents *</label>
                <FileZone files={files} onAdd={f => setFiles(p => [...p, ...f].slice(0, 5))} onRemove={i => setFiles(p => p.filter((_, idx) => idx !== i))} />
              </div>

              <div className="rounded-xl border border-bocra-teal/30 bg-bocra-teal/5 p-4">
                <label className="flex cursor-pointer gap-3">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-bocra-teal" {...register('declaration')} />
                  <span className="text-sm leading-relaxed text-slate-700">
                    I declare that the information and data contained in this report are accurate, complete, and have been prepared in accordance with BOCRA's reporting guidelines and the relevant licence conditions.
                  </span>
                </label>
                {errors.declaration && <p className="form-error mt-2">{errors.declaration.message}</p>}
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-bocra-teal px-8 py-3 text-sm font-bold text-white hover:bg-teal-600 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {submitting
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Submitting…</>
                    : <><Upload className="h-4 w-4" />Submit report</>
                  }
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar */}
        <InView className="space-y-4">
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="bg-bocra-navy px-5 py-4"><h3 className="text-sm font-bold text-white">Reporting schedule</h3></div>
            <div className="divide-y divide-slate-100">
              {REPORT_TYPES.map(r => {
                const s = STATUS_STYLE[r.status]
                return (
                  <div key={r.value} className="flex items-center justify-between px-5 py-3">
                    <p className="text-xs font-medium text-slate-700 leading-snug flex-1 mr-2">{r.label.split('—')[0]}</p>
                    <span className={cn('badge shrink-0', s.badge)}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-2 mb-2"><AlertCircle className="h-4 w-4 text-amber-600 shrink-0" /><p className="text-xs font-bold text-amber-800">Q1 2025 QoS report overdue</p></div>
            <p className="text-xs text-amber-700">Late submission may result in a penalty. Please upload immediately or contact your compliance officer.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-xl border border-slate-200 bg-white p-4 shadow-card space-y-2">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-2"><Info className="h-4 w-4 text-bocra-teal" />Reporting guidelines</p>
            <p className="text-xs text-slate-500">Download BOCRA's reporting templates and guidelines to ensure your submission meets the required format.</p>
            <button className="text-xs font-semibold text-bocra-teal hover:underline flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> Download templates
            </button>
          </motion.div>
        </InView>
      </div>
    </div>
  )
}