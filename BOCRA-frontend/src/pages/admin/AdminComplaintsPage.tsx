import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, CheckCircle, AlertCircle, Clock,
  X, Download, MessageSquare, User, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

import * as adminService from '@/services/admin'
import { exportToCSV, exportToPDF } from '@/utils/exportUtils'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { Complaint } from '@/types'

type CmpStatus = 'all' | 'submitted' | 'in_review' | 'escalated' | 'resolved' | 'closed'

const MOCK_COMPLAINTS = [
  { id:'1', referenceNumber:'CMP-2025-1021', providerName:'Mascom', category:'billing'  as const, status:'in_review' as const, description:'Customer was charged twice for data bundle.', submittedAt:'2025-03-21', resolvedAt:null, daysOpen:3  },
  { id:'2', referenceNumber:'CMP-2025-1018', providerName:'Orange', category:'coverage' as const, status:'escalated' as const, description:'No signal for 3 weeks in Kanye.',              submittedAt:'2025-03-18', resolvedAt:null, daysOpen:7  },
  { id:'3', referenceNumber:'CMP-2025-1015', providerName:'BTC',    category:'quality'  as const, status:'in_review' as const, description:'Broadband speeds below contracted rate.',      submittedAt:'2025-03-19', resolvedAt:null, daysOpen:5  },
  { id:'4', referenceNumber:'CMP-2025-1009', providerName:'Mascom', category:'data'     as const, status:'resolved'  as const, description:'Data used without consent.',                  submittedAt:'2025-03-12', resolvedAt:'2025-03-24', daysOpen:12 },
  { id:'5', referenceNumber:'CMP-2025-1001', providerName:'Orange', category:'fraud'    as const, status:'submitted' as const, description:'Unknown charges on prepaid account.',          submittedAt:'2025-03-20', resolvedAt:null, daysOpen:4  },
  { id:'6', referenceNumber:'CMP-2025-0994', providerName:'BTC',    category:'billing'  as const, status:'closed'    as const, description:'Dispute over international roaming charges.', submittedAt:'2025-03-10', resolvedAt:'2025-03-24', daysOpen:14 },
  { id:'7', referenceNumber:'CMP-2025-0988', providerName:'Mascom', category:'coverage' as const, status:'escalated' as const, description:'Tower outage affecting entire village.',       submittedAt:'2025-03-08', resolvedAt:null, daysOpen:16 },
]

const STATUS_INFO: Record<string, { badge: string; label: string }> = {
  submitted:  { badge: 'badge-muted',    label: 'Submitted'     },
  in_review:  { badge: 'badge-info',     label: 'Under review'  },
  escalated:  { badge: 'badge-warning',  label: 'Escalated'     },
  resolved:   { badge: 'badge-success',  label: 'Resolved'      },
  closed:     { badge: 'badge-muted',    label: 'Closed'        },
}

const OFFICERS = ['Officer K. Motse', 'Officer B. Kelesitse', 'Sr. Officer B. Tau', 'Sr. Officer L. Nkwe']

function ComplaintDrawer({ cmp, onClose, onSave }: {
  cmp:     Complaint
  onClose: () => void
  onSave:  (ref: string, status: string, note: string, officer: string) => Promise<void>
}) {
  const [newStatus, setNewStatus] = useState(cmp.status)
  const [note,      setNote]      = useState('')
  const [officer,   setOfficer]   = useState(OFFICERS[0])
  const [saving,    setSaving]    = useState(false)
  const [tab,       setTab]       = useState<'details' | 'update' | 'history'>('details')

  const handleSave = async () => {
    setSaving(true)
    await onSave(cmp.referenceNumber, newStatus, note, officer)
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
            <p className="font-mono text-xs font-bold text-bocra-teal">{cmp.referenceNumber}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">vs {cmp.providerName}</h2>
            <div className="mt-2 flex gap-2">
              <span className={cn('badge', STATUS_INFO[cmp.status]?.badge ?? 'badge-muted')}>{STATUS_INFO[cmp.status]?.label}</span>
              <span className="badge badge-muted capitalize">{cmp.category}</span>
              <span className={cn('badge', cmp.daysOpen > 10 ? 'badge-danger' : cmp.daysOpen > 5 ? 'badge-warning' : 'badge-muted')}>
                {cmp.daysOpen}d open
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Tabs */}
        <div className="mt-4 flex gap-1">
          {(['details', 'update', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                tab === t ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Details tab */}
        {tab === 'details' && (
          <div>
            <dl className="divide-y divide-slate-100">
              {[
                ['Reference',    cmp.referenceNumber],
                ['Provider',     cmp.providerName],
                ['Category',     cmp.category],
                ['Status',       STATUS_INFO[cmp.status]?.label],
                ['Submitted',    formatDate(cmp.submittedAt)],
                ['Days open',    `${cmp.daysOpen} days`],
                ['Resolved',     cmp.resolvedAt ? formatDate(cmp.resolvedAt) : 'Not yet resolved'],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-4 px-6 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0">{k}</dt>
                  <dd className="text-sm font-medium text-slate-900 text-right capitalize">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Description</p>
              <p className="text-sm leading-relaxed text-slate-700">{cmp.description || 'No description provided.'}</p>
            </div>
          </div>
        )}

        {/* Update tab */}
        {tab === 'update' && (
          <div className="p-6 space-y-5">
            <div>
              <label className="form-label">Update status</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_INFO).map(([k, v]) => (
                  <button key={k} onClick={() => setNewStatus(k as Complaint['status'])}
                    className={cn('rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border-2',
                      newStatus === k
                        ? k === 'resolved' || k === 'closed' ? 'bg-bocra-teal text-white border-bocra-teal'
                          : k === 'escalated' ? 'bg-amber-500 text-white border-amber-500'
                          : k === 'in_review' ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-slate-700 text-white border-slate-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Assign to officer</label>
              <select className="form-select" value={officer} onChange={e => setOfficer(e.target.value)}>
                {OFFICERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Officer notes *</label>
              <textarea rows={5} value={note} onChange={e => setNote(e.target.value)}
                placeholder={
                  newStatus === 'resolved' ? 'Describe how the complaint was resolved and what action was taken against the provider…'
                  : newStatus === 'escalated' ? 'Explain why this case is being escalated and to whom…'
                  : 'Add investigation notes, findings, or follow-up actions…'
                }
                className="form-textarea text-sm" />
            </div>
            {newStatus === 'resolved' && !note.trim() && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />Resolution details are required when closing a complaint
              </p>
            )}
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className="p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Audit trail</p>
            <ol className="space-y-4">
              {[
                { event: 'Complaint submitted by complainant',                  time: formatDate(cmp.submittedAt), by: 'System'         },
                { event: 'Assigned to Officer K. Motse for initial review',     time: '2025-03-22',                by: 'System'         },
                { event: 'Provider contacted and given 5 days to respond',      time: '2025-03-22',                by: 'Officer K. Motse'},
                { event: 'Provider response received — billing dispute logged',  time: '2025-03-23',                by: 'Officer K. Motse'},
              ].map((h, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-bocra-teal mt-1.5 shrink-0" />
                    {i < 3 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-slate-800">{h.event}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{h.time} · {h.by}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        {tab === 'update' && (
          <button onClick={handleSave} disabled={saving || (newStatus === 'resolved' && !note.trim())}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy py-2.5 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors disabled:opacity-50">
            {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</> : 'Save & notify'}
          </button>
        )}
      </div>
    </motion.aside>
  )
}

export default function AdminComplaintsPage() {
  const qc = useQueryClient()
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState<CmpStatus>('all')
  const [selected,  setSelected]  = useState<Complaint | null>(null)
  const [exporting, setExporting] = useState(false)

  // BACKEND: GET /api/v1/admin/complaints
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'complaints', { search, status }],
    queryFn:  () => adminService.getAllComplaints({ q: search || undefined, status: status === 'all' ? undefined : status, limit: 100 }),
    placeholderData: { data: MOCK_COMPLAINTS as unknown as Complaint[], total: MOCK_COMPLAINTS.length },
  })

  // BACKEND: PATCH /api/v1/admin/complaints/:ref  { status, officerNote }
  // After saving → backend creates notification record for the complainant
  // Portal polls GET /api/v1/notifications → shows "your complaint status updated"
  const updateMutation = useMutation({
    mutationFn: ({ ref, update }: { ref: string; update: any }) =>
      (adminService as any).updateComplaint(ref, update),
    onSuccess: (_, vars) => {
      toast.success(`Complaint ${vars.ref} updated — complainant notified`)
      qc.invalidateQueries({ queryKey: ['admin', 'complaints'] })
      qc.invalidateQueries({ queryKey: ['complaints'] }) // refresh public tracker
    },
    onError: () => toast.error('Update failed — please try again'),
  })

  const handleSave = async (ref: string, newStatus: string, note: string, officer: string) => {
    await updateMutation.mutateAsync({
      ref,
      update: { status: newStatus, officerNote: `[${officer}] ${note}` },
    })
  }

  const complaints = (data?.data ?? []) as Complaint[]
  const filtered = complaints.filter(c => {
    const matchStatus = status === 'all' || c.status === status
    const matchSearch = !search || c.providerName.toLowerCase().includes(search.toLowerCase())
      || c.referenceNumber.includes(search) || c.category.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleExportCSV = () => {
    setExporting(true)
    exportToCSV(
      filtered.map(c => ({
        Reference: c.referenceNumber, Provider: c.providerName, Category: c.category,
        Status: c.status, 'Days open': c.daysOpen, Submitted: c.submittedAt,
        Resolved: c.resolvedAt ?? 'N/A',
      })),
      'BOCRA-complaints'
    )
    toast.success('CSV downloaded')
    setExporting(false)
  }

  const handleExportPDF = () => {
    setExporting(true)
    exportToPDF(
      'Consumer Complaints Register',
      ['Reference', 'Provider', 'Category', 'Status', 'Days open', 'Submitted'],
      filtered.map(c => [c.referenceNumber, c.providerName, c.category, c.status, c.daysOpen, c.submittedAt]),
      'BOCRA-complaints'
    )
    toast.success('PDF opened — use browser print')
    setExporting(false)
  }

  const allStatuses: CmpStatus[] = ['all', 'submitted', 'in_review', 'escalated', 'resolved', 'closed']

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
              <p className="mt-1 text-slate-400">Manage, assign, and resolve all BOCRA complaints — updates auto-notify complainants</p>
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
              placeholder="Search reference, provider, category…" className="form-input pl-9 text-sm" />
          </div>
          <div className="flex overflow-x-auto overflow-hidden rounded-xl border border-slate-200 bg-white">
            {allStatuses.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn('px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap',
                  status === s ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
                {s === 'all' ? 'All' : s.replace('_', ' ')} ({s === 'all' ? complaints.length : complaints.filter(c => c.status === s).length})
              </button>
            ))}
          </div>
        </div>

        {/* Escalated alert */}
        {complaints.filter(c => c.status === 'escalated').length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              {complaints.filter(c => c.status === 'escalated').length} escalated complaint{complaints.filter(c => c.status === 'escalated').length > 1 ? 's' : ''} require senior officer attention
            </p>
            <button onClick={() => setStatus('escalated')} className="ml-auto text-xs font-bold text-amber-700 hover:underline">
              Filter →
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th><th>Provider</th>
                  <th className="hidden sm:table-cell">Category</th>
                  <th className="hidden md:table-cell">Submitted</th>
                  <th>Status</th>
                  <th className="hidden lg:table-cell">Days open</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>
                    ))
                  : filtered.length === 0
                    ? <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400">No complaints found</td></tr>
                    : filtered.map(c => (
                        <tr key={c.id} className={cn('cursor-pointer', selected?.id === c.id && 'bg-bocra-teal/5')}>
                          <td><span className="font-mono text-xs font-bold text-bocra-teal">{c.referenceNumber}</span></td>
                          <td><p className="text-sm font-medium">{c.providerName}</p></td>
                          <td className="hidden sm:table-cell"><span className="badge badge-muted capitalize">{c.category}</span></td>
                          <td className="hidden md:table-cell text-slate-500 text-sm">{formatDate(c.submittedAt)}</td>
                          <td><span className={cn('badge', STATUS_INFO[c.status]?.badge ?? 'badge-muted')}>{STATUS_INFO[c.status]?.label}</span></td>
                          <td className="hidden lg:table-cell">
                            <span className={cn('text-sm font-bold', (c as typeof MOCK_COMPLAINTS[0]).daysOpen > 10 ? 'text-red-500' : (c as typeof MOCK_COMPLAINTS[0]).daysOpen > 5 ? 'text-amber-500' : 'text-slate-600')}>
                              {(c as typeof MOCK_COMPLAINTS[0]).daysOpen}d
                            </span>
                          </td>
                          <td>
                            <button onClick={() => setSelected(c)} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                              <Eye className="h-3.5 w-3.5" /> Update
                            </button>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-6 py-3">
            <p className="text-xs text-slate-400">{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} shown</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
            <ComplaintDrawer cmp={selected} onClose={() => setSelected(null)} onSave={handleSave} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}