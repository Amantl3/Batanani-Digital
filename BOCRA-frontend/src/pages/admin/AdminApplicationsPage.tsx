import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, CheckCircle, AlertCircle, Loader2,
  Download, X, FileText, ChevronDown, Pause, Play, Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import * as adminService from '@/services/admin'
import api from '@/services/api'
import { exportToCSV, exportToPDF } from '@/utils/exportUtils'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { Licence, PaginatedResponse } from '@/types'

type LicenceStatusFilter = 'all' | 'active' | 'pending' | 'suspended' | 'expired' | 'rejected'

const STATUS_STYLE: Record<string, { badge: string; icon: React.ElementType }> = {
  active:    { badge: 'badge-success',   icon: CheckCircle   },
  pending:   { badge: 'badge-warning',   icon: AlertCircle   },
  suspended: { badge: 'badge-danger',    icon: Pause         },
  expired:   { badge: 'badge-muted',     icon: FileText      },
  rejected:  { badge: 'badge-danger',    icon: X             },
}

const CATEGORY_STYLE: Record<string, string> = {
  telecom:       'bg-bocra-teal/10 text-bocra-teal',
  broadcast:     'bg-bocra-green/10 text-bocra-green',
  postal:        'bg-bocra-gold/10 text-bocra-gold',
  internet:      'bg-bocra-red/10 text-bocra-red',
  type_approval: 'bg-slate-100 text-slate-600',
}

function LicenceActionDrawer({ licence, onClose, onSave }: {
  licence: Licence
  onClose: () => void
  onSave: (licenceId: string, status: string, reason: string) => Promise<void>
}) {
  const [action, setAction] = useState<'activate' | 'suspend' | 'expire' | 'pending' | 'reject' | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!action) { toast.error('Please select an action'); return }
    if (!reason.trim()) { toast.error('Reason is required'); return }
    setSaving(true)
    await onSave(licence.id, 
      action === 'activate' ? 'active' : 
      action === 'suspend' ? 'suspended' : 
      action === 'expire' ? 'expired' : 
      action === 'reject' ? 'rejected' : 
      'pending', 
      reason)
    setSaving(false)
    onClose()
  }

  const ACTIONS = [
    { key: 'activate' as const,  label: 'Activate',   color: 'bg-bocra-teal text-white border-bocra-teal' },
    { key: 'pending' as const,   label: 'Pend',       color: 'bg-amber-500 text-white border-amber-500' },
    { key: 'suspend' as const,   label: 'Suspend',    color: 'bg-bocra-red text-white border-bocra-red' },
    { key: 'reject' as const,    label: 'Reject',     color: 'bg-red-600 text-white border-red-600' },
    { key: 'expire' as const,    label: 'Expire',     color: 'bg-slate-600 text-white border-slate-600' },
  ]

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-lg flex-col bg-white shadow-[−20px_0_60px_rgb(0_0_0/0.15)]">
      <div className="bg-bocra-navy px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-bold text-bocra-teal">{licence.licenceNumber}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">{licence.holderName}</h2>
            <div className="mt-2 flex gap-2">
              <span className={cn('badge', STATUS_STYLE[licence.status]?.badge)}>{licence.status}</span>
              <span className="badge badge-muted capitalize">{licence.category}</span>
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
            ['Licence number', licence.licenceNumber],
            ['Holder name',    licence.holderName],
            ['Category',       licence.category],
            ['Status',         licence.status],
            ['Issued',         formatDate(licence.issuedAt)],
            ['Expires',        licence.expiresAt ? formatDate(licence.expiresAt) : 'Perpetual'],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between gap-4 px-6 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0">{k}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right capitalize">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Licence management */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Change licence status</p>
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
            <label className="form-label">Reason for change *</label>
            <textarea rows={4} value={reason} onChange={e => setReason(e.target.value)}
              placeholder={
                action === 'activate' ? 'Reason for activation…'
                : action === 'suspend' ? 'Reason for suspension…'
                : action === 'expire' ? 'Reason for expiration…'
                : 'Reason for pending status…'
              }
              className="form-textarea text-sm" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving || !action || !reason.trim()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy py-2.5 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors disabled:opacity-50">
          {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</> : 'Update licence'}
        </button>
      </div>
    </motion.aside>
  )
}

export default function AdminApplicationsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LicenceStatusFilter>('all')
  const [selected, setSelected] = useState<Licence | null>(null)
  const [exporting, setExporting] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 15

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Licence>, Error>({
    queryKey: ['licences', { q: search?.trim() || '', status: statusFilter === 'all' ? undefined : statusFilter, page, limit: pageSize }],
    queryFn: () => adminService.getAllLicences({
      q: search?.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      limit: pageSize,
    }),
    staleTime: 1000 * 60 * 5,
  })

  const licences: Licence[] = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  useEffect(() => {
    if (isError) toast.error('Failed to load licences from backend')
  }, [isError])

  const updateMutation = useMutation({
    mutationFn: ({ licenceId, status, reason }: { licenceId: string; status: string; reason: string }) =>
      adminService.updateLicenceStatus(licenceId, { status: status as any, reason }),
    onSuccess: () => {
      toast.success('Licence status updated')
      setSelected(null)
      qc.invalidateQueries({ queryKey: ['licences'] })
    },
    onError: () => toast.error('Failed to update licence'),
  })

  const handleSave = async (licenceId: string, status: string, reason: string) => {
    await updateMutation.mutateAsync({ licenceId, status, reason })
  }

  const statuses: LicenceStatusFilter[] = ['all', 'active', 'pending', 'suspended', 'expired', 'rejected']
  // For server-side pagination, we show total count, individual status counts would need separate queries
  const counts = Object.fromEntries(statuses.map(s => [s, s === 'all' ? total : 0]))

  const handleExportCSV = () => {
    setExporting(true)
    exportToCSV(
      licences.map(l => ({
        'Licence Number': l.licenceNumber,
        'Holder': l.holderName,
        'Category': l.category,
        'Status': l.status,
        'Issued': l.issuedAt,
        'Expires': l.expiresAt ?? 'Perpetual',
      })),
      'BOCRA-licences'
    )
    toast.success('CSV downloaded')
    setExporting(false)
  }

  const handleExportPDF = () => {
    setExporting(true)
    exportToPDF(
      'Licence Register',
      ['Licence Number', 'Holder', 'Category', 'Status', 'Expires'],
      licences.map(l => [l.licenceNumber, l.holderName, l.category, l.status, l.expiresAt ?? 'Perpetual']),
      'BOCRA-licences'
    )
    toast.success('PDF opened — use browser print dialog')
    setExporting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-bocra-navy py-10">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/admin/dashboard" className="breadcrumb-link">Admin</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Licences</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Licence management</h1>
              <p className="mt-1 text-slate-400">Manage all issued licences, update status, and handle renewals</p>
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
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-bocra-teal" />
          </div>
        ) : isError ? (
          <div className="flex justify-center py-20 text-red-500 font-semibold">Unable to load licences from server.</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search licence or holder…" className="form-input pl-9 text-sm" />
              </div>
              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                {statuses.map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                    className={cn('px-3 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap',
                      statusFilter === s ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
                    {s === 'all' ? 'All' : s} ({counts[s]})
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Licence Number</th>
                      <th className="hidden sm:table-cell">Holder</th>
                      <th className="hidden sm:table-cell">Category</th>
                      <th>Status</th>
                      <th className="hidden md:table-cell">Expires</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licences.length === 0
                      ? <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No licences found</td></tr>
                      : licences.map(licence => {
                          const st = STATUS_STYLE[licence.status] ?? STATUS_STYLE.active
                          return (
                            <tr key={licence.id} className={cn('cursor-pointer', selected?.id === licence.id && 'bg-bocra-teal/5')}>
                              <td><span className="font-mono text-xs font-bold text-bocra-teal">{licence.licenceNumber}</span></td>
                              <td className="hidden sm:table-cell"><p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{licence.holderName}</p></td>
                              <td className="hidden sm:table-cell"><span className={cn('badge', CATEGORY_STYLE[licence.category] ?? 'bg-slate-100 text-slate-600')}>{licence.category}</span></td>
                              <td><span className={cn('badge', st.badge)}>{licence.status}</span></td>
                              <td className="hidden md:table-cell text-slate-500 text-sm">{licence.expiresAt ? formatDate(licence.expiresAt) : 'Perpetual'}</td>
                              <td>
                                <button onClick={() => setSelected(licence)} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                                  <Eye className="h-3.5 w-3.5" /> Manage
                                </button>
                              </td>
                            </tr>
                          )
                        })
                    }
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">Page {page} of {totalPages} ({total} total licences)</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1 || isLoading}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    ← Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages || isLoading}
                    className="rounded-lg bg-bocra-navy px-4 py-2 text-sm font-semibold text-white hover:bg-bocra-navy/90 disabled:opacity-40 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
            <LicenceActionDrawer licence={selected} onClose={() => setSelected(null)} onSave={handleSave} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}