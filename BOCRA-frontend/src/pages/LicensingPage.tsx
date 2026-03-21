import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Download, ChevronUp, ChevronDown, ExternalLink, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

import { useLicences } from '@/hooks/useLicences'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatCategory } from '@/utils/formatters'
import { LICENCE_CATEGORIES, LICENCE_STATUSES } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { Licence, LicenceCategory, LicenceStatus } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────
type SortKey   = 'licenceNumber' | 'holderName' | 'category' | 'issuedAt' | 'expiresAt' | 'status'
type SortDir   = 'asc' | 'desc'

interface Filters {
  q:        string
  category: string
  status:   string
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronUp className="h-3 w-3 opacity-20" />
  return sortDir === 'asc'
    ? <ChevronUp   className="h-3 w-3 text-bocra-blue" />
    : <ChevronDown className="h-3 w-3 text-bocra-blue" />
}

function DetailDrawer({ licence, onClose }: { licence: Licence; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0,       opacity: 1 }}
      exit={{    x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-card-lg"
    >
      {/* Drawer header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <p className="font-mono text-xs font-semibold tracking-wide text-bocra-blue">
            {licence.licenceNumber}
          </p>
          <h2 className="mt-1 font-heading text-lg font-bold text-slate-900">
            {licence.holderName}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="btn-icon btn-ghost ml-4 shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drawer body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mb-4 flex items-center gap-2">
          <StatusBadge status={licence.status} />
          <span className="badge badge-info">{formatCategory(licence.category)}</span>
        </div>

        <dl className="space-y-4">
          {[
            { label: 'Licence number', value: licence.licenceNumber },
            { label: 'Licence holder',  value: licence.holderName },
            { label: 'Category',        value: formatCategory(licence.category) },
            { label: 'Date issued',     value: formatDate(licence.issuedAt) },
            { label: 'Expiry date',     value: formatDate(licence.expiresAt) ?? 'Perpetual' },
            { label: 'Status',          value: <StatusBadge status={licence.status} /> },
          ].map(({ label, value }) => (
            <div key={label} className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-3 last:border-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
              <dd className="text-sm text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Conditions preview */}
        {Object.keys(licence.conditions ?? {}).length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Licence conditions
            </p>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              {JSON.stringify(licence.conditions, null, 2)}
            </div>
          </div>
        )}
      </div>

      {/* Drawer footer */}
      <div className="flex gap-2 border-t border-slate-100 px-6 py-4">
        {licence.documentUrl ? (
          <a
            href={licence.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 justify-center text-sm"
          >
            <Download className="h-4 w-4" /> Download certificate
          </a>
        ) : (
          <button disabled className="btn-primary flex-1 justify-center text-sm opacity-50">
            <Download className="h-4 w-4" /> No certificate
          </button>
        )}
        <Link
          to={`/licensing/${licence.id}`}
          className="btn-secondary px-4 text-sm"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </motion.aside>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15

export default function LicensingPage() {
  const { t } = useTranslation()

  const [filters,  setFilters]  = useState<Filters>({ q: '', category: '', status: '' })
  const [draft,    setDraft]    = useState<Filters>({ q: '', category: '', status: '' })
  const [page,     setPage]     = useState(1)
  const [sortKey,  setSortKey]  = useState<SortKey>('issuedAt')
  const [sortDir,  setSortDir]  = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Licence | null>(null)

  const { data, isLoading, isError, isFetching } = useLicences({
    q:        filters.q        || undefined,
    category: filters.category || undefined,
    status:   filters.status   || undefined,
    page,
    limit:    PAGE_SIZE,
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const applyFilters = useCallback(() => {
    setFilters(draft)
    setPage(1)
  }, [draft])

  const clearFilters = () => {
    const empty = { q: '', category: '', status: '' }
    setDraft(empty)
    setFilters(empty)
    setPage(1)
  }

  const hasActiveFilters = filters.q || filters.category || filters.status
  const total      = data?.total      ?? 0
  const totalPages = data?.totalPages ?? 1
  const from       = (page - 1) * PAGE_SIZE + 1
  const to         = Math.min(page * PAGE_SIZE, total)

  const COLS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'licenceNumber', label: 'Licence no.'  },
    { key: 'holderName',    label: 'Licensee',   className: 'hidden sm:table-cell' },
    { key: 'category',      label: 'Category',   className: 'hidden md:table-cell' },
    { key: 'issuedAt',      label: 'Issued',     className: 'hidden lg:table-cell' },
    { key: 'expiresAt',     label: 'Expires',    className: 'hidden lg:table-cell' },
    { key: 'status',        label: 'Status' },
  ]

  return (
    <div className="min-h-screen">
      {/* ── Page hero ─────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Licensing</span>
          </nav>
          <h1>{t('licensing.title')}</h1>
          <p>{t('licensing.subtitle')}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/portal" className="btn-cyan btn-sm">
              {t('licensing.apply_btn')}
            </Link>
            <button className="btn-sm rounded-lg border border-white/20 bg-transparent px-4 text-white/80 hover:border-white/40">
              <Download className="h-3.5 w-3.5" /> {t('licensing.download_btn')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Filter bar ────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="container-page">
          <div className="flex flex-wrap items-end gap-3 py-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="form-label text-xs">{t('licensing.title')}</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={draft.q}
                  onChange={e => setDraft(d => ({ ...d, q: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && applyFilters()}
                  placeholder={t('licensing.search_placeholder')}
                  className="form-input pl-9 text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div className="min-w-[150px]">
              <label className="form-label text-xs">Category</label>
              <select
                value={draft.category}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                className="form-select text-sm"
              >
                <option value="">{t('licensing.all_types')}</option>
                {LICENCE_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="min-w-[130px]">
              <label className="form-label text-xs">Status</label>
              <select
                value={draft.status}
                onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
                className="form-select text-sm"
              >
                <option value="">{t('licensing.all_statuses')}</option>
                {LICENCE_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={applyFilters} className="btn-primary btn-sm gap-1.5">
                <Filter className="h-3.5 w-3.5" /> {t('licensing.apply_filters')}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary btn-sm">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Table area ────────────────────────────────────────── */}
      <section className="container-page py-6">
        {/* Results bar */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isLoading
              ? 'Loading…'
              : total === 0
                ? 'No results found'
                : `Showing ${from}–${to} of ${total.toLocaleString()} results`
            }
            {isFetching && !isLoading && (
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-bocra-blue" />
            )}
          </p>
          <div className="flex gap-3">
            <button className="flex items-center gap-1.5 text-xs text-bocra-blue hover:underline">
              <Download className="h-3.5 w-3.5" /> {t('licensing.export_csv')}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-bocra-blue hover:underline">
              <Download className="h-3.5 w-3.5" /> {t('licensing.export_pdf')}
            </button>
          </div>
        </div>

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-red-700">Failed to load licences.</p>
            <p className="mt-1 text-xs text-red-500">Please check your connection and try again.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && total === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No licences found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn-secondary btn-sm mt-4">Clear filters</button>
          </div>
        )}

        {/* Table */}
        {(isLoading || (!isError && total > 0)) && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    {COLS.map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={cn(
                          'cursor-pointer select-none whitespace-nowrap',
                          col.className
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {col.label}
                          <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
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
                          {COLS.map((c, j) => (
                            <td key={j} className={c.className}>
                              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                            </td>
                          ))}
                          <td><div className="h-4 w-12 animate-pulse rounded bg-slate-100" /></td>
                        </tr>
                      ))
                    : data?.data.map(lic => (
                        <tr
                          key={lic.id}
                          onClick={() => setSelected(lic)}
                          className={cn(
                            'cursor-pointer',
                            selected?.id === lic.id && 'bg-blue-50/60'
                          )}
                        >
                          <td>
                            <span className="font-mono text-xs font-semibold text-bocra-blue">
                              {lic.licenceNumber}
                            </span>
                          </td>
                          <td className="hidden font-medium sm:table-cell">{lic.holderName}</td>
                          <td className="hidden md:table-cell">
                            <span className="badge badge-muted">{formatCategory(lic.category as LicenceCategory)}</span>
                          </td>
                          <td className="hidden lg:table-cell text-slate-500">{formatDate(lic.issuedAt)}</td>
                          <td className="hidden lg:table-cell text-slate-500">{formatDate(lic.expiresAt)}</td>
                          <td><StatusBadge status={lic.status as LicenceStatus} /></td>
                          <td>
                            <button
                              onClick={e => { e.stopPropagation(); setSelected(lic) }}
                              className="text-xs font-medium text-bocra-blue hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary btn-sm"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-primary btn-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Detail drawer overlay ─────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
              onClick={() => setSelected(null)}
            />
            <DetailDrawer licence={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}