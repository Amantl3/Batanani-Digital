import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, CheckCircle, AlertCircle, Clock, X, MessageSquare, Download } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

type CmpStatus = 'all' | 'submitted' | 'in_review' | 'escalated' | 'resolved' | 'closed'

const ALL_COMPLAINTS = [
  { ref: 'CMP-2025-1021', name: 'Thabo Mokoena',    provider: 'Mascom',   category: 'Billing',   submitted: '2025-03-21', status: 'in_review',  daysOpen: 3,  assigned: 'Officer K. Motse' },
  { ref: 'CMP-2025-1018', name: 'Boitumelo Sechele', provider: 'Orange',  category: 'Coverage',  submitted: '2025-03-18', status: 'escalated',  daysOpen: 7,  assigned: 'Sr. Officer B. Tau' },
  { ref: 'CMP-2025-1015', name: 'M. Kgosidintsi',   provider: 'BTC',      category: 'Quality',   submitted: '2025-03-19', status: 'in_review',  daysOpen: 5,  assigned: 'Officer K. Motse' },
  { ref: 'CMP-2025-1009', name: 'K. Pheto',         provider: 'Mascom',   category: 'Data',      submitted: '2025-03-12', status: 'resolved',   daysOpen: 12, assigned: 'Officer B. Kelesitse' },
  { ref: 'CMP-2025-1001', name: 'R. Moseki',        provider: 'Orange',   category: 'Fraud',     submitted: '2025-03-20', status: 'submitted',  daysOpen: 4,  assigned: 'Unassigned' },
  { ref: 'CMP-2025-0994', name: 'L. Sithole',       provider: 'BTC',      category: 'Billing',   submitted: '2025-03-10', status: 'closed',     daysOpen: 14, assigned: 'Officer B. Kelesitse' },
  { ref: 'CMP-2025-0988', name: 'T. Nthebe',        provider: 'Mascom',   category: 'Coverage',  submitted: '2025-03-08', status: 'escalated',  daysOpen: 16, assigned: 'Sr. Officer B. Tau' },
]

const STATUS_INFO: Record<string, { badge: string; label: string }> = {
  submitted:  { badge: 'badge-muted',    label: 'Submitted'    },
  in_review:  { badge: 'badge-info',     label: 'Under review' },
  escalated:  { badge: 'badge-warning',  label: 'Escalated'    },
  resolved:   { badge: 'badge-success',  label: 'Resolved'     },
  closed:     { badge: 'badge-muted',    label: 'Closed'       },
}

type Complaint = typeof ALL_COMPLAINTS[number]

function ComplaintDrawer({ cmp, onClose }: { cmp: Complaint; onClose: () => void }) {
  const [newStatus, setNewStatus] = useState(cmp.status)
  const [note,      setNote]      = useState('')
  const [saving,    setSaving]    = useState(false)

  // BACKEND: PATCH /api/v1/complaints/:ref  { status, officerNote }
  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
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
            <p className="font-mono text-xs font-bold text-bocra-teal">{cmp.ref}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">{cmp.name}</h2>
            <p className="mt-1 text-sm text-slate-400">vs {cmp.provider} · {cmp.category}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <dl className="divide-y divide-slate-100">
          {[
            ['Reference',    cmp.ref],
            ['Complainant',  cmp.name],
            ['Provider',     cmp.provider],
            ['Category',     cmp.category],
            ['Submitted',    formatDate(cmp.submitted)],
            ['Days open',    `${cmp.daysOpen} days`],
            ['Assigned to',  cmp.assigned],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-4 px-6 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0">{k}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="px-6 py-4 border-t border-slate-100 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Update status</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_INFO).map(([k, v]) => (
              <button key={k} onClick={() => setNewStatus(k)}
                className={cn('rounded-xl px-3 py-2 text-xs font-semibold transition-all border',
                  newStatus === k ? `${v.badge === 'badge-success' ? 'bg-bocra-teal text-white border-bocra-teal' : v.badge === 'badge-warning' ? 'bg-amber-500 text-white border-amber-500' : v.badge === 'badge-danger' ? 'bg-bocra-red text-white border-bocra-red' : v.badge === 'badge-info' ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-700 text-white border-slate-700'}` : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
                {v.label}
              </button>
            ))}
          </div>
          <div>
            <label className="form-label">Officer notes</label>
            <textarea rows={4} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add investigation notes, findings, or resolution details…" className="form-textarea text-sm" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
        <button onClick={save} disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy py-2.5 text-sm font-bold text-white hover:bg-bocra-navy/90 disabled:opacity-50">
          {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</> : 'Save update'}
        </button>
      </div>
    </motion.aside>
  )
}

export default function AdminComplaintsPage() {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<CmpStatus>('all')
  const [selected, setSelected] = useState<Complaint | null>(null)

  const filtered = ALL_COMPLAINTS.filter(c => {
    const matchStatus = status === 'all' || c.status === status
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.ref.includes(search) || c.provider.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-bocra-navy py-10">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/admin/dashboard" className="breadcrumb-link">Admin</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Complaints</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Consumer complaints</h1>
              <p className="mt-1 text-slate-400">Manage and resolve all complaints filed with BOCRA</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
      </section>

      <div className="container-page py-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ref, provider…" className="form-input pl-9 text-sm" />
          </div>
          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
            {(['all', 'submitted', 'in_review', 'escalated', 'resolved', 'closed'] as CmpStatus[]).map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn('px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap',
                  status === s ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
                {s === 'all' ? `All (${ALL_COMPLAINTS.length})` : `${s.replace('_',' ')} (${ALL_COMPLAINTS.filter(c => c.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Reference</th><th>Complainant</th><th className="hidden sm:table-cell">Provider</th><th className="hidden md:table-cell">Category</th><th>Status</th><th className="hidden lg:table-cell">Days open</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">No complaints found</td></tr>
                  : filtered.map(c => (
                    <tr key={c.ref} className={cn('cursor-pointer', selected?.ref === c.ref && 'bg-bocra-teal/5')}>
                      <td><span className="font-mono text-xs font-bold text-bocra-teal">{c.ref}</span></td>
                      <td><p className="text-sm font-medium">{c.name}</p></td>
                      <td className="hidden sm:table-cell"><span className="badge badge-muted">{c.provider}</span></td>
                      <td className="hidden md:table-cell text-slate-500">{c.category}</td>
                      <td><span className={cn('badge', STATUS_INFO[c.status].badge)}>{STATUS_INFO[c.status].label}</span></td>
                      <td className="hidden lg:table-cell"><span className={cn('text-sm font-bold', c.daysOpen > 10 ? 'text-red-500' : c.daysOpen > 5 ? 'text-amber-500' : 'text-slate-600')}>{c.daysOpen}d</span></td>
                      <td><button onClick={() => setSelected(c)} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline"><Eye className="h-3.5 w-3.5" />Update</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
            <ComplaintDrawer cmp={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}