import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, CheckCircle, XCircle, Eye, Download, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

import * as adminService from '@/services/admin'
import { exportToCSV, exportToPDF } from '@/utils/exportUtils'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

type AppStatus = 'pending' | 'active' | 'rejected'
type LicenceApplication = {
  id: string
  holderName: string
  category: string
  status: AppStatus
  submittedAt: string
  daysOpen: number
  description?: string
}

const STATUS_INFO: Record<AppStatus, { badge: string; label: string }> = {
  pending: { badge: 'bg-amber-100 text-amber-700', label: 'Pending' },
  active:  { badge: 'bg-green-100 text-green-700', label: 'Active' },
  rejected:{ badge: 'bg-red-100 text-red-700', label: 'Rejected' },
}

const OFFICERS = ['Officer K. Motse', 'Officer B. Kelesitse', 'Sr. Officer B. Tau', 'Sr. Officer L. Nkwe']

function ApplicationDrawer({
  app,
  onClose,
  onSave
}: {
  app: LicenceApplication
  onClose: () => void
  onSave: (id: string, status: AppStatus, note: string, officer: string) => Promise<void>
}) {
  const [newStatus, setNewStatus] = useState<AppStatus>(app.status)
  const [note, setNote] = useState('')
  const [officer, setOfficer] = useState(OFFICERS[0])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(app.id, newStatus, note, officer)
    setSaving(false)
    onClose()
  }

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col bg-white shadow-[−20px_0_60px_rgb(0_0_0/0.15)]"
    >
      <div className="bg-bocra-navy px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-bold text-bocra-teal">{app.id}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">{app.holderName}</h2>
            <div className="mt-2 flex gap-2">
              <span className={cn('badge', STATUS_INFO[app.status]?.badge)}>{STATUS_INFO[app.status]?.label}</span>
              <span className="badge badge-muted capitalize">{app.category}</span>
              <span className={cn('badge', app.daysOpen > 10 ? 'badge-danger' : app.daysOpen > 5 ? 'badge-warning' : 'badge-muted')}>
                {app.daysOpen}d open
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status update */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="form-label">Update status</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_INFO).map(([k, v]) => (
                <button key={k} onClick={() => setNewStatus(k as AppStatus)}
                  className={cn('rounded-xl px-3 py-2.5 text-xs font-semibold transition-all border-2',
                    newStatus === k ? `bg-bocra-teal text-white border-bocra-teal` : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300')}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Assign officer</label>
            <select className="form-select" value={officer} onChange={e => setOfficer(e.target.value)}>
              {OFFICERS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea rows={4} value={note} onChange={e => setNote(e.target.value)} className="form-textarea text-sm" placeholder="Add notes…"/>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy py-2.5 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Save & notify'}
        </button>
      </div>
    </motion.aside>
  )
}

export default function AdminApplicationsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AppStatus | 'all'>('all')
  const [selected, setSelected] = useState<LicenceApplication | null>(null)
  const [exporting, setExporting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'applications', { search, status }],
    queryFn: () => adminService.getAllApplications({ q: search || undefined }),
    placeholderData: { data: [] as LicenceApplication[] },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note, officer }: { id: string; status: AppStatus; note: string; officer: string }) =>
      adminService.updateApplicationStatus(id, status, note, officer),
    onSuccess: () => {
      toast.success('Application updated')
      qc.invalidateQueries({ queryKey: ['admin', 'applications'] })
    },
    onError: () => toast.error('Update failed'),
  })

  const handleSave = async (id: string, status: AppStatus, note: string, officer: string) => {
    await updateMutation.mutateAsync({ id, status, note, officer })
  }

  const apps = (data?.data ?? []) as LicenceApplication[]
  const filtered = apps.filter(a => (status === 'all' || a.status === status) &&
    (!search || a.holderName.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()))
  )

  const allStatuses: (AppStatus | 'all')[] = ['all', 'pending', 'active', 'rejected']

  const handleExportCSV = () => {
    setExporting(true)
    exportToCSV(filtered.map(a => ({
      Company: a.holderName, Category: a.category, Status: a.status, 'Days Open': a.daysOpen, Submitted: a.submittedAt
    })), 'BOCRA-applications')
    toast.success('CSV downloaded')
    setExporting(false)
  }

  const handleExportPDF = () => {
    setExporting(true)
    exportToPDF(
      'Licence Applications',
      ['Company', 'Category', 'Status', 'Days Open', 'Submitted'],
      filtered.map(a => [a.holderName, a.category, a.status, a.daysOpen, a.submittedAt]),
      'BOCRA-applications'
    )
    toast.success('PDF opened — use browser print')
    setExporting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header with Breadcrumb */}
      <section className="bg-bocra-navy py-10">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/admin/dashboard" className="breadcrumb-link text-white/60 hover:underline">Admin</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Licence Applications</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Licence Applications</h1>
              <p className="mt-1 text-slate-400">Manage and approve licence applications — updates auto-notify applicants</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportCSV} disabled={exporting} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                <Download className="h-4 w-4" /> CSV
              </button>
              <button onClick={handleExportPDF} disabled={exporting} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                <Download className="h-4 w-4" /> PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Status Filters */}
      <div className="container-page py-6 space-y-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search company or category…" className="form-input pl-9 text-sm" />
          </div>
          <div className="flex overflow-x-auto overflow-hidden rounded-xl border border-slate-200 bg-white">
            {allStatuses.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={cn('px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap',
                  status === s ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
                {s === 'all' ? 'All' : s} ({s === 'all' ? apps.length : apps.filter(a => a.status === s).length})
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
                  <th>Company</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Days Open</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No applications found</td></tr>
                ) : filtered.map(app => (
                  <tr key={app.id} className={cn('cursor-pointer', selected?.id === app.id && 'bg-bocra-teal/5')}>
                    <td>{app.holderName}</td>
                    <td>{app.category}</td>
                    <td><span className={cn('badge', STATUS_INFO[app.status]?.badge)}>{STATUS_INFO[app.status]?.label}</span></td>
                    <td className="text-sm text-slate-500">{formatDate(app.submittedAt)}</td>
                    <td className={cn('text-sm font-bold', app.daysOpen > 10 ? 'text-red-500' : app.daysOpen > 5 ? 'text-amber-500' : 'text-slate-600')}>
                      {app.daysOpen}d
                    </td>
                    <td>
                      <button onClick={() => setSelected(app)} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                        <Eye className="h-3.5 w-3.5" /> Update
                      </button>
                    </td>
                  </tr>
                ))}
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
            <ApplicationDrawer app={selected} onClose={() => setSelected(null)} onSave={handleSave} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}