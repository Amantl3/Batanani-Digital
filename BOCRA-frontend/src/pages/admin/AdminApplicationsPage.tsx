import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, CheckCircle, XCircle, Clock,
  Download, X, FileText, AlertCircle, ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

import * as adminService from '@/services/admin'
import { exportToCSV, exportToPDF } from '@/utils/exportUtils'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { LicenceApplication } from '@/types'

type AppStatus = 'all' | 'pending_docs' | 'under_review' | 'approved' | 'rejected' | 'submitted'

// Mock data — replaced by real API data when backend is ready
const MOCK_APPS: LicenceApplication[] = [
  { id:'1', reference:'APP-2025-0312', companyName:'Kalahari Fibre Ltd',         category:'telecom'   as const, status:'submitted'    as const, stage:'Pending docs',   submittedAt:'2025-03-20', updatedAt:'2025-03-21' },
  { id:'2', reference:'APP-2025-0309', companyName:'Savanna Broadcasting Co.',   category:'broadcast' as const, status:'under_review'  as const, stage:'Officer review', submittedAt:'2025-03-18', updatedAt:'2025-03-20' },
  { id:'3', reference:'APP-2025-0301', companyName:'Delta ISP Services',         category:'internet'  as const, status:'approved'       as const, stage:'Approved',       submittedAt:'2025-03-15', updatedAt:'2025-03-19' },
  { id:'4', reference:'APP-2025-0298', companyName:'Moremi Telecoms (Pty)',      category:'telecom'   as const, status:'rejected'       as const, stage:'Rejected',       submittedAt:'2025-03-14', updatedAt:'2025-03-18' },
  { id:'5', reference:'APP-2025-0291', companyName:'Chobe Rural Networks',       category:'internet'  as const, status:'under_review'  as const, stage:'Officer review', submittedAt:'2025-03-12', updatedAt:'2025-03-15' },
  { id:'6', reference:'APP-2025-0285', companyName:'Jwaneng Courier Services',   category:'postal'    as const, status:'approved'       as const, stage:'Approved',       submittedAt:'2025-03-10', updatedAt:'2025-03-14' },
  { id:'7', reference:'APP-2025-0274', companyName:'Northern Radio Network',     category:'broadcast' as const, status:'submitted'    as const, stage:'Pending docs',   submittedAt:'2025-03-08', updatedAt:'2025-03-09' },
  { id:'8', reference:'APP-2025-0268', companyName:'Orapa Technology Group',     category:'telecom'   as const, status:'under_review'  as const, stage:'Officer review', submittedAt:'2025-03-05', updatedAt:'2025-03-12' },
]

const STATUS_INFO: Record<string, { badge: string; label: string; icon: React.ElementType }> = {
  submitted:    { badge: 'badge-muted',    label: 'Submitted',     icon: FileText    },
  pending_docs: { badge: 'badge-warning',  label: 'Pending docs',  icon: Clock       },
  under_review: { badge: 'badge-info',     label: 'Under review',  icon: Eye         },
  approved:     { badge: 'badge-success',  label: 'Approved',      icon: CheckCircle },
  rejected:     { badge: 'badge-danger',   label: 'Rejected',      icon: XCircle     },
}

function ReviewDrawer({ app, onClose, onSave }: {
  app: LicenceApplication
  onClose: () => void
  onSave: (ref: string, action: string, note: string) => Promise<void>
}) {
  const [action, setAction] = useState<'approved' | 'rejected' | 'submitted' | 'under_review' | null>(null)
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!action) { toast.error('Please select a decision'); return }
    setSaving(true)
    await onSave(app.reference, action, note)
    setSaving(false)
    onClose()
  }

  const ACTIONS = [
    { key: 'approved'     as const, label: 'Approve',       color: 'bg-bocra-teal text-white border-bocra-teal' },
    { key: 'rejected'     as const, label: 'Reject',        color: 'bg-bocra-red text-white border-bocra-red'   },
    { key: 'submitted'    as const, label: 'Request docs',  color: 'bg-amber-500 text-white border-amber-500'   },
    { key: 'under_review' as const, label: 'Assign review', color: 'bg-blue-500 text-white border-blue-500'     },
  ]

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col bg-white shadow-[−20px_0_60px_rgb(0_0_0/0.15)]">
      <div className="bg-bocra-navy px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-bold text-bocra-teal">{app.reference}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">{app.companyName}</h2>
            <div className="mt-2 flex gap-2">
              <span className={cn('badge', STATUS_INFO[app.status]?.badge)}>{STATUS_INFO[app.status]?.label}</span>
              <span className="badge badge-muted capitalize">{app.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <dl className="divide-y divide-slate-100">
          {[
            ['Application reference', app.reference],
            ['Applicant company',     app.companyName],
            ['Licence category',      app.category],
            ['Current stage',         app.stage],
            ['Submitted',             formatDate(app.submittedAt)],
            ['Last updated',          formatDate(app.updatedAt)],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-4 px-6 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0">{k}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right capitalize">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Documents */}
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded documents</p>
          <div className="space-y-2">
            {['Certificate of incorporation.pdf', 'Audited financials 2024.pdf', 'Technical capability statement.pdf'].map(d => (
              <div key={d} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <FileText className="h-4 w-4 text-bocra-teal shrink-0" />
                <span className="flex-1 truncate text-xs font-medium text-slate-700">{d}</span>
                <button className="text-xs font-semibold text-bocra-teal hover:underline">View</button>
              </div>
            ))}
          </div>
        </div>

        {/* Officer decision */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Officer decision</p>
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map(a => (
              <button key={a.key} type="button" onClick={() => setAction(a.key)}
                className={cn('rounded-xl px-3 py-2.5 text-xs font-bold transition-all border-2',
                  action === a.key ? a.color : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
                {a.label}
              </button>
            ))}
          </div>
          <div>
            <label className="form-label">
              {action === 'approved' ? 'Approval notes (optional)' : action === 'rejected' ? 'Rejection reason *' : 'Notes'}
            </label>
            <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
              placeholder={action === 'approved' ? 'Any conditions to attach…' : action === 'rejected' ? 'State the reason for rejection clearly…' : 'Add notes…'}
              className="form-textarea text-sm" />
          </div>
          {action === 'rejected' && !note.trim() && (
            <p className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle className="h-3.5 w-3.5" />Rejection reason is required</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || !action || (action === 'rejected' && !note.trim())}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy py-2.5 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors disabled:opacity-50">
          {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</> : 'Submit decision'}
        </button>
      </div>
    </motion.aside>
  )
}

export default function AdminApplicationsPage() {
  const qc = useQueryClient()
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState<AppStatus>('all')
  const [selected,  setSelected]  = useState<LicenceApplication | null>(null)
  const [exporting, setExporting] = useState(false)

  // BACKEND: GET /api/v1/admin/applications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'applications', { search, status }],
    queryFn:  () => adminService.getAllApplications({ q: search || undefined, status: status === 'all' ? undefined : status, limit: 100 }),
    placeholderData: { data: MOCK_APPS, total: MOCK_APPS.length, totalPages: 1 },
  })

  // BACKEND: PATCH /api/v1/admin/applications/:ref  { status, officerNote }
  // On approval   → backend sets licence.status = 'active' in licences table
  //               → sends notification to applicant's portal
  // On rejection  → backend sets application.status = 'rejected'
  //               → sends notification with reason
  // On pending    → backend sends notification requesting specific documents
  const updateMutation = useMutation({
    mutationFn: ({ ref, action, note }: { ref: string; action: string; note: string }) =>
      adminService.updateApplication(ref, { status: action as 'approved' | 'rejected' | 'pending_docs' | 'under_review', officerNote: note }),
    onSuccess: (_, vars) => {
      toast.success(`Application ${vars.ref} ${vars.action}`)
      qc.invalidateQueries({ queryKey: ['admin', 'applications'] })
      qc.invalidateQueries({ queryKey: ['licences'] }) // refresh public licence registry
    },
    onError: () => toast.error('Failed to update application'),
  })

  const handleSave = async (ref: string, action: string, note: string) => {
    await updateMutation.mutateAsync({ ref, action, note })
  }

  const apps = data?.data ?? MOCK_APPS
  const filtered = apps.filter(a => {
    const matchStatus = status === 'all' || a.status === status
    const matchSearch = !search || a.companyName.toLowerCase().includes(search.toLowerCase()) || a.reference.includes(search)
    return matchStatus && matchSearch
  })

  const handleExportCSV = async () => {
    setExporting(true)
    const toastId = toast.loading('Generating CSV…')
    try {
      exportToCSV(
        filtered.map(a => ({
          Reference: a.reference, Company: a.companyName, Category: a.category,
          Status: a.status, Stage: a.stage, Submitted: a.submittedAt, Updated: a.updatedAt,
        })),
        'BOCRA-applications'
      )
      toast.success('CSV downloaded', { id: toastId })
    } finally { setExporting(false) }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    const toastId = toast.loading('Generating PDF…')
    try {
      exportToPDF(
        'Licence Applications Register',
        ['Reference', 'Company', 'Category', 'Status', 'Submitted'],
        filtered.map(a => [a.reference, a.companyName, a.category, a.status, a.submittedAt]),
        'BOCRA-applications'
      )
      toast.success('PDF opened — use browser print dialog', { id: toastId })
    } finally { setExporting(false) }
  }

  const statuses: AppStatus[] = ['all', 'submitted', 'pending_docs', 'under_review', 'approved', 'rejected']
  const counts = Object.fromEntries(statuses.map(s => [s, s === 'all' ? apps.length : apps.filter(a => a.status === s).length]))

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-bocra-navy py-10">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/admin/dashboard" className="breadcrumb-link">Admin</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Applications</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Licence applications</h1>
              <p className="mt-1 text-slate-400">Review, approve, and manage all submitted licence applications</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} disabled={exporting}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                <Download className="h-4 w-4" /> CSV
              </button>
              <button onClick={handleExportPDF} disabled={exporting}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                <Download className="h-4 w-4" /> PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-6 space-y-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search company or reference…" className="form-input pl-9 text-sm" />
          </div>
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn('px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap',
                  status === s ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
                {s === 'all' ? 'All' : s.replace('_', ' ')} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th><th>Company</th>
                  <th className="hidden sm:table-cell">Category</th>
                  <th className="hidden md:table-cell">Submitted</th>
                  <th className="hidden lg:table-cell">Stage</th>
                  <th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>
                    ))
                  : filtered.length === 0
                    ? <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">No applications found</td></tr>
                    : filtered.map(app => {
                        const s = STATUS_INFO[app.status] ?? STATUS_INFO['submitted']
                        return (
                          <tr key={app.id} className={cn('cursor-pointer', selected?.id === app.id && 'bg-bocra-teal/5')}>
                            <td><span className="font-mono text-xs font-bold text-bocra-teal">{app.reference}</span></td>
                            <td><p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{app.companyName}</p></td>
                            <td className="hidden sm:table-cell"><span className="badge badge-muted capitalize">{app.category}</span></td>
                            <td className="hidden md:table-cell text-slate-500 text-sm">{formatDate(app.submittedAt)}</td>
                            <td className="hidden lg:table-cell text-slate-500 text-sm">{app.stage}</td>
                            <td><span className={cn('badge', s.badge)}>{s.label}</span></td>
                            <td>
                              <button onClick={() => setSelected(app)} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                                <Eye className="h-3.5 w-3.5" /> Review
                              </button>
                            </td>
                          </tr>
                        )
                      })
                }
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-6 py-3">
            <p className="text-xs text-slate-400">{filtered.length} application{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
            <ReviewDrawer app={selected} onClose={() => setSelected(null)} onSave={handleSave} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}