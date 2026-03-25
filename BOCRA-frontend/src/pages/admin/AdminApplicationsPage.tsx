import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Eye, CheckCircle, XCircle, Clock,
  ChevronDown, Download, AlertCircle, X, FileText,
  MessageSquare, ChevronRight,
} from 'lucide-react'
import { formatDate, formatRelative } from '@/utils/formatters'
import { cn } from '@/utils/cn'

type AppStatus = 'all' | 'pending_docs' | 'under_review' | 'approved' | 'rejected'

const ALL_APPS = [
  { ref: 'APP-2025-0312', company: 'Kalahari Fibre Ltd',         type: 'Telecom',   submitted: '2025-03-20', officer: 'T. Kgosi',    status: 'pending_docs', fee: 50000 },
  { ref: 'APP-2025-0309', company: 'Savanna Broadcasting Co.',   type: 'Broadcast', submitted: '2025-03-18', officer: 'M. Seretse',  status: 'under_review', fee: 45000 },
  { ref: 'APP-2025-0301', company: 'Delta ISP Services',         type: 'Internet',  submitted: '2025-03-15', officer: 'T. Kgosi',    status: 'approved',     fee: 25000 },
  { ref: 'APP-2025-0298', company: 'Moremi Telecoms (Pty)',      type: 'Telecom',   submitted: '2025-03-14', officer: 'B. Modise',   status: 'rejected',     fee: 55000 },
  { ref: 'APP-2025-0291', company: 'Chobe Rural Networks',       type: 'Internet',  submitted: '2025-03-12', officer: 'M. Seretse',  status: 'under_review', fee: 20000 },
  { ref: 'APP-2025-0285', company: 'Jwaneng Courier Services',   type: 'Postal',    submitted: '2025-03-10', officer: 'T. Kgosi',    status: 'approved',     fee: 8000  },
  { ref: 'APP-2025-0274', company: 'Northern Radio Network',     type: 'Broadcast', submitted: '2025-03-08', officer: 'B. Modise',   status: 'pending_docs', fee: 30000 },
  { ref: 'APP-2025-0268', company: 'Orapa Technology Group',     type: 'Telecom',   submitted: '2025-03-05', officer: 'T. Kgosi',    status: 'under_review', fee: 75000 },
]

const STATUS_INFO: Record<string, { badge: string; label: string; icon: React.ElementType }> = {
  pending_docs: { badge: 'badge-warning', label: 'Pending docs',  icon: Clock        },
  under_review: { badge: 'badge-info',    label: 'Under review',  icon: Eye          },
  approved:     { badge: 'badge-success', label: 'Approved',      icon: CheckCircle  },
  rejected:     { badge: 'badge-danger',  label: 'Rejected',      icon: XCircle      },
}

type App = typeof ALL_APPS[number]

function ReviewDrawer({ app, onClose }: { app: App; onClose: () => void }) {
  const [action, setAction]   = useState<'approve' | 'reject' | 'request_docs' | null>(null)
  const [note,   setNote]     = useState('')
  const [saving, setSaving]   = useState(false)

  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
  // PATCH /api/v1/licences/applications/:ref
  // Body: { status: 'approved' | 'rejected' | 'pending_docs', officerNote: string }
  const handleAction = async () => {
    if (!action) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    onClose()
  }

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col bg-white shadow-[−20px_0_60px_rgb(0_0_0/0.15)]">
      <div className="bg-bocra-navy px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-bold text-bocra-teal">{app.ref}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">{app.company}</h2>
            <div className="mt-2 flex gap-2">
              <span className={cn('badge', STATUS_INFO[app.status].badge)}>
                {STATUS_INFO[app.status].label}
              </span>
              <span className="badge badge-muted">{app.type}</span>
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
            ['Application reference', app.ref],
            ['Applicant company',     app.company],
            ['Licence category',      app.type],
            ['Submitted',             formatDate(app.submitted)],
            ['Assigned officer',      app.officer],
            ['Application fee',       `BWP ${app.fee.toLocaleString()}`],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-4 px-6 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0">{k}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Documents list */}
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded documents</p>
          <div className="space-y-2">
            {['Certificate of incorporation.pdf', 'Audited financials 2024.pdf', 'Technical capability statement.pdf'].map(d => (
              <div key={d} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <FileText className="h-4 w-4 text-bocra-teal shrink-0" />
                <span className="flex-1 truncate text-xs font-medium text-slate-700">{d}</span>
                <button className="text-xs text-bocra-teal hover:underline">View</button>
              </div>
            ))}
          </div>
        </div>

        {/* Officer action */}
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Officer decision</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { key: 'approve'     as const, label: 'Approve',      color: 'bg-bocra-teal text-white' },
              { key: 'reject'      as const, label: 'Reject',       color: 'bg-bocra-red text-white'  },
              { key: 'request_docs'as const, label: 'Request docs', color: 'bg-amber-500 text-white'  },
            ].map(a => (
              <button key={a.key} type="button" onClick={() => setAction(a.key)}
                className={cn('rounded-xl px-3 py-2.5 text-xs font-bold transition-all', action === a.key ? a.color : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
                {a.label}
              </button>
            ))}
          </div>
          <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
            placeholder={action === 'approve' ? 'Approval notes (optional)…' : action === 'reject' ? 'Reason for rejection (required)…' : 'Specify which documents are required…'}
            className="form-textarea text-sm" />
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={handleAction} disabled={!action || saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy py-2.5 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors disabled:opacity-50">
          {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</> : <>Submit decision</>}
        </button>
      </div>
    </motion.aside>
  )
}

export default function AdminApplicationsPage() {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<AppStatus>('all')
  const [selected, setSelected] = useState<App | null>(null)

  const filtered = ALL_APPS.filter(a => {
    const matchStatus = status === 'all' || a.status === status
    const matchSearch = !search || a.company.toLowerCase().includes(search.toLowerCase()) || a.ref.includes(search)
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-bocra-navy py-10">
        <div className="container-page relative">
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
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
      </section>

      <div className="container-page py-6 space-y-5">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search company or reference…" className="form-input pl-9 text-sm" />
            </div>
          </div>
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            {(['all', 'pending_docs', 'under_review', 'approved', 'rejected'] as AppStatus[]).map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn('px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap',
                  status === s ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
                {s === 'all' ? `All (${ALL_APPS.length})` : `${s.replace('_', ' ')} (${ALL_APPS.filter(a => a.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Company</th>
                  <th className="hidden sm:table-cell">Type</th>
                  <th className="hidden md:table-cell">Submitted</th>
                  <th className="hidden lg:table-cell">Officer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">No applications found</td></tr>
                ) : filtered.map(app => {
                  const s = STATUS_INFO[app.status]
                  return (
                    <tr key={app.ref} className={cn('cursor-pointer', selected?.ref === app.ref && 'bg-bocra-teal/5')}>
                      <td><span className="font-mono text-xs font-bold text-bocra-teal">{app.ref}</span></td>
                      <td><p className="text-sm font-medium text-slate-900">{app.company}</p></td>
                      <td className="hidden sm:table-cell"><span className="badge badge-muted">{app.type}</span></td>
                      <td className="hidden md:table-cell text-slate-500">{formatDate(app.submitted)}</td>
                      <td className="hidden lg:table-cell text-slate-500">{app.officer}</td>
                      <td><span className={cn('badge', s.badge)}>{s.label}</span></td>
                      <td>
                        <button onClick={() => setSelected(app)}
                          className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                          <Eye className="h-3.5 w-3.5" /> Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
            <ReviewDrawer app={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}