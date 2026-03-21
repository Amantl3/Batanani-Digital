import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Clock, FileText, AlertTriangle } from 'lucide-react'

import { useLicence } from '@/hooks/useLicences'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatCategory, formatStatus } from '@/utils/formatters'
import type { LicenceCategory, LicenceStatus } from '@/types'

const TIMELINE = [
  { label: 'Application submitted',     date: '2023-11-14', done: true },
  { label: 'Documents verified',        date: '2023-11-28', done: true },
  { label: 'Fee payment confirmed',     date: '2023-12-05', done: true },
  { label: 'Licence issued',            date: '2024-01-15', done: true },
  { label: 'First annual review due',   date: '2025-01-15', done: false },
]

export default function LicenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: licence, isLoading, isError } = useLicence(id ?? '')

  if (isLoading) {
    return (
      <div className="container-page py-10">
        <div className="card p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-48 rounded bg-slate-100" />
            <div className="h-4 w-64 rounded bg-slate-100" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !licence) {
    return (
      <div className="container-page py-16 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <h1 className="font-heading text-xl font-bold text-slate-900">Licence not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The licence you're looking for does not exist or has been removed.
        </p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-6">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="page-hero">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/licensing" className="breadcrumb-link">Licensing</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="font-mono">{licence.licenceNumber}</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-1 font-mono text-sm font-semibold text-bocra-cyan">
                {licence.licenceNumber}
              </p>
              <h1 className="text-3xl">{licence.holderName}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={licence.status as LicenceStatus} />
                <span className="badge badge-info">{formatCategory(licence.category as LicenceCategory)}</span>
              </div>
            </div>
            {licence.documentUrl && (
              <a
                href={licence.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyan"
              >
                <Download className="h-4 w-4" /> Download certificate
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        {/* Main details card */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-base font-semibold text-slate-900">Licence details</h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  { label: 'Licence number', value: licence.licenceNumber },
                  { label: 'Status',         value: <StatusBadge status={licence.status as LicenceStatus} /> },
                  { label: 'Licence holder', value: licence.holderName },
                  { label: 'Category',       value: formatCategory(licence.category as LicenceCategory) },
                  { label: 'Date issued',    value: formatDate(licence.issuedAt) },
                  { label: 'Expiry date',    value: licence.expiresAt ? formatDate(licence.expiresAt) : 'Perpetual' },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-slate-100 pb-4 last:border-0">
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="text-sm font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Conditions */}
          {Object.keys(licence.conditions ?? {}).length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-base font-semibold text-slate-900">Licence conditions</h2>
              </div>
              <div className="card-body">
                <pre className="overflow-x-auto rounded-lg bg-slate-50 p-4 text-xs text-slate-700">
                  {JSON.stringify(licence.conditions, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Application timeline</h3>
            </div>
            <div className="card-body">
              <ol className="space-y-4">
                {TIMELINE.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        step.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 bg-white text-slate-400'
                      }`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={`mt-1 h-full w-px ${step.done ? 'bg-emerald-300' : 'bg-slate-200'}`} style={{ minHeight: '20px' }} />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className={`text-sm font-medium ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(step.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Related actions */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Related actions</h3>
            </div>
            <div className="card-body space-y-2">
              <Link to="/portal" className="btn-secondary w-full justify-center text-sm">
                Renew this licence
              </Link>
              <Link to="/complaints" className="btn-ghost w-full justify-center text-sm">
                File a complaint against holder
              </Link>
              <button className="btn-ghost w-full justify-center text-sm">
                Report unlicensed operation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}