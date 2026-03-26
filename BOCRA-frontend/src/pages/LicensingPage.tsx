import { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, ChevronUp, ChevronDown,
  ExternalLink, X, FileText, Building2, AlertCircle,
} from 'lucide-react'

import { useLicences } from '@/hooks/useLicences'
import { exportToCSV, exportToPDF, exportFeeSchedulePDF } from '@/utils/exportUtils'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatCategory } from '@/utils/formatters'
import { LICENCE_CATEGORIES, LICENCE_STATUSES } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { Licence, LicenceCategory, LicenceStatus } from '@/types'

type SortKey = 'licenceNumber' | 'holderName' | 'category' | 'issuedAt' | 'expiresAt' | 'status'
type SortDir = 'asc' | 'desc'
interface Filters { q: string; category: string; status: string }

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return <ChevronUp className="h-3 w-3 opacity-20" />
  return dir === 'asc' ? <ChevronUp className="h-3 w-3 text-bocra-teal" /> : <ChevronDown className="h-3 w-3 text-bocra-teal" />
}

function DetailDrawer({ licence, onClose }: { licence: Licence; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 260 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col bg-white shadow-[−20px_0_60px_rgb(0_0_0/0.15)]"
    >
      <div className="bg-bocra-navy px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs font-bold tracking-wider text-bocra-teal">{licence.licenceNumber}</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-white">{licence.holderName}</h2>
            <div className="mt-2 flex gap-2">
              <StatusBadge status={licence.status as LicenceStatus} />
              <span className="badge badge-info text-xs">{formatCategory(licence.category as LicenceCategory)}</span>
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
            { label: 'Licence number', value: <span className="font-mono font-bold text-bocra-teal">{licence.licenceNumber}</span> },
            { label: 'Licence holder',  value: licence.holderName },
            { label: 'Category',        value: formatCategory(licence.category as LicenceCategory) },
            { label: 'Status',          value: <StatusBadge status={licence.status as LicenceStatus} /> },
            { label: 'Date issued',     value: formatDate(licence.issuedAt) },
            { label: 'Expiry date',     value: formatDate(licence.expiresAt) || 'Perpetual' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 px-6 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 shrink-0">{label}</dt>
              <dd className="text-sm font-medium text-slate-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>

        {Object.keys(licence.conditions ?? {}).length > 0 && (
          <div className="px-6 pb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Licence conditions</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
              {JSON.stringify(licence.conditions, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        {licence.documentUrl ? (
          <a href={licence.documentUrl} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
            <Download className="h-4 w-4" /> Download certificate
          </a>
        ) : (
          <button disabled className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400">
            <Download className="h-4 w-4" /> No certificate
          </button>
        )}
        <Link to={`/licensing/${licence.id}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <ExternalLink className="h-4 w-4" /> Full detail
        </Link>
      </div>
    </motion.aside>
  )
}

const PAGE_SIZE = 15

export default function LicensingPage() {
  const [filters, setFilters]   = useState<Filters>({ q: '', category: '', status: '' })
  const [draft,   setDraft]     = useState<Filters>({ q: '', category: '', status: '' })
  const [page,    setPage]      = useState(1)
  const [sortKey, setSortKey]   = useState<SortKey>('issuedAt')
  const [sortDir, setSortDir]   = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Licence | null>(null)

  const { data, isLoading, isError, isFetching } = useLicences({
    q: filters.q || undefined, category: filters.category || undefined,
    status: filters.status || undefined, page, limit: PAGE_SIZE,
  })

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }
  const applyFilters = useCallback(() => { setFilters(draft); setPage(1) }, [draft])
  const clearFilters = () => { const e = { q: '', category: '', status: '' }; setDraft(e); setFilters(e); setPage(1) }
  const hasFilters = filters.q || filters.category || filters.status

  // Live search effect with 400ms debounce to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft.q !== filters.q) {
        setFilters(f => ({ ...f, q: draft.q }))
        setPage(1)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [draft.q, filters.q])

  const total = data?.total ?? 0; const totalPages = data?.totalPages ?? 1
  const from = (page - 1) * PAGE_SIZE + 1; const to = Math.min(page * PAGE_SIZE, total)

  const COLS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'licenceNumber', label: 'Licence no.' },
    { key: 'holderName',    label: 'Licensee',  className: 'hidden sm:table-cell' },
    { key: 'category',      label: 'Category',  className: 'hidden md:table-cell' },
    { key: 'issuedAt',      label: 'Issued',    className: 'hidden lg:table-cell' },
    { key: 'expiresAt',     label: 'Expires',   className: 'hidden lg:table-cell' },
    { key: 'status',        label: 'Status' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-bocra-green/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-4">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Licensing</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-bocra-green/20 px-3 py-1">
                <Building2 className="h-3.5 w-3.5 text-bocra-green" />
                <span className="text-xs font-semibold text-bocra-green">Public licence registry</span>
              </div>
              <h1 className="font-heading text-4xl font-bold text-white">Licence registry</h1>
              <p className="mt-2 max-w-lg text-slate-400">Search and verify all BOCRA-issued licences across telecommunications, broadcasting, postal, and internet services.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/portal" className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
                Apply for new licence
              </Link>
              <button onClick={() => exportFeeSchedulePDF()} className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                <Download className="h-4 w-4" /> Fee schedule
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="container-page py-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="form-label text-xs">Search licences</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={draft.q}
                  onChange={e => setDraft(d => ({ ...d, q: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                  placeholder="Company name or licence number…"
                  className="form-input pl-9 text-sm" />
              </div>
            </div>
            <div className="min-w-[140px]">
              <label className="form-label text-xs">Category</label>
              <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} className="form-select text-sm">
                <option value="">All types</option>
                {LICENCE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="min-w-[130px]">
              <label className="form-label text-xs">Status</label>
              <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))} className="form-select text-sm">
                <option value="">All statuses</option>
                {LICENCE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={applyFilters} className="flex items-center gap-1.5 rounded-lg bg-bocra-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-bocra-navy/90 transition-colors">
                <Filter className="h-3.5 w-3.5" /> Apply
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-6">
        {/* Results bar */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading…' : total === 0 ? 'No results found' : `Showing ${from}–${to} of ${total.toLocaleString()} results`}
            {isFetching && !isLoading && <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-bocra-teal" />}
          </p>
          <div className="flex gap-3">
            <button onClick={() => exportToCSV(
              (data?.data ?? []).map(l => ({ 'Licence no': l.licenceNumber, 'Holder': l.holderName, 'Category': l.category, 'Status': l.status, 'Issued': l.issuedAt, 'Expires': l.expiresAt ?? 'N/A' })),
              'BOCRA-licences'
            )} className="flex items-center gap-1.5 text-xs font-medium text-bocra-teal hover:underline">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button onClick={() => exportToPDF(
              'Licence Registry',
              ['Licence no.', 'Holder', 'Category', 'Status', 'Expires'],
              (data?.data ?? []).map(l => [l.licenceNumber, l.holderName, l.category, l.status, l.expiresAt ?? 'N/A']),
              'BOCRA-licences'
            )} className="flex items-center gap-1.5 text-xs font-medium text-bocra-teal hover:underline">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
            <AlertCircle className="h-8 w-8 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Failed to load licences</p>
              <p className="text-sm text-red-500 mt-1">Please check your connection and try again.</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && total === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-card">
            <Search className="mb-4 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-700">No licences found</p>
            <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="mt-5 rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium hover:bg-slate-50">Clear filters</button>
          </div>
        )}

        {/* Table */}
        {(isLoading || (!isError && total > 0)) && (
          <InView>
            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      {COLS.map(col => (
                        <th key={col.key} onClick={() => handleSort(col.key)}
                          className={cn('cursor-pointer select-none whitespace-nowrap', col.className)}>
                          <span className="inline-flex items-center gap-1.5">
                            {col.label}
                            <SortIcon col={col.key} sortKey={sortKey} dir={sortDir} />
                          </span>
                        </th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {[...COLS, { key: 'a', className: '' }].map((_, j) => (
                            <td key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></td>
                          ))}
                        </tr>
                      ))
                      : data?.data.map(lic => (
                        <tr key={lic.id} onClick={() => setSelected(lic)} className={cn('cursor-pointer', selected?.id === lic.id && 'bg-bocra-teal/5')}>
                          <td><span className="font-mono text-xs font-bold text-bocra-teal">{lic.licenceNumber}</span></td>
                          <td className="hidden font-medium sm:table-cell">{lic.holderName}</td>
                          <td className="hidden md:table-cell">
                            <span className="badge badge-muted text-xs">{formatCategory(lic.category as LicenceCategory)}</span>
                          </td>
                          <td className="hidden lg:table-cell text-slate-500">{formatDate(lic.issuedAt)}</td>
                          <td className="hidden lg:table-cell text-slate-500">{formatDate(lic.expiresAt)}</td>
                          <td><StatusBadge status={lic.status as LicenceStatus} /></td>
                          <td>
                            <button onClick={e => { e.stopPropagation(); setSelected(lic) }}
                              className="text-xs font-semibold text-bocra-teal hover:underline">View</button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors">← Previous</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="rounded-lg bg-bocra-navy px-4 py-2 text-sm font-semibold text-white hover:bg-bocra-navy/90 disabled:opacity-40 transition-colors">Next →</button>
                </div>
              </div>
            </motion.div>
          </InView>
        )}
      </section>

      {/* Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]"
              onClick={() => setSelected(null)} />
            <DetailDrawer licence={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}