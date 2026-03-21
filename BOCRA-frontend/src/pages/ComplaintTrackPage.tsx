import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Search, Clock, CheckCircle, AlertCircle, XCircle, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useTrackComplaint } from '@/hooks/useComplaints'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatRelative, formatCategory } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { ComplaintStatus } from '@/types'

const STATUS_STEPS: { key: ComplaintStatus; label: string; desc: string }[] = [
  { key: 'submitted',  label: 'Submitted',     desc: 'Complaint received by BOCRA'           },
  { key: 'in_review',  label: 'Under review',  desc: 'BOCRA officer is reviewing your case'  },
  { key: 'escalated',  label: 'Escalated',     desc: 'Case escalated to senior officer'       },
  { key: 'resolved',   label: 'Resolved',      desc: 'Resolution communicated to all parties' },
  { key: 'closed',     label: 'Closed',        desc: 'Case formally closed'                   },
]

const STATUS_ORDER: Record<ComplaintStatus, number> = {
  submitted: 0, in_review: 1, escalated: 2, resolved: 3, closed: 4,
}

const STATUS_ICON: Record<ComplaintStatus, React.ElementType> = {
  submitted: Clock, in_review: Clock, escalated: AlertCircle,
  resolved: CheckCircle, closed: XCircle,
}

function TrackForm({ defaultRef }: { defaultRef?: string }) {
  const navigate = useNavigate()
  const [ref, setRef] = useState(defaultRef ?? '')
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <Search className="mx-auto mb-4 h-10 w-10 text-slate-300" />
      <h2 className="mb-1 font-heading text-xl font-bold text-slate-900">Track your complaint</h2>
      <p className="mb-6 text-sm text-slate-500">Enter your reference number to see the current status of your complaint.</p>
      <div className="flex gap-2">
        <input
          value={ref}
          onChange={e => setRef(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && ref && navigate(`/complaints/track/${ref}`)}
          placeholder="e.g. CMP-2025-04821"
          className="form-input flex-1 font-mono text-sm"
        />
        <button
          onClick={() => ref && navigate(`/complaints/track/${ref}`)}
          className="btn-primary px-5"
        >
          Track
        </button>
      </div>
    </div>
  )
}

export default function ComplaintTrackPage() {
  const { t } = useTranslation()
  const { ref } = useParams<{ ref: string }>()
  const { data: complaint, isLoading, isError } = useTrackComplaint(ref ?? '')

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="page-hero">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/complaints" className="breadcrumb-link">Complaints</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Track</span>
          </nav>
          <h1>Complaint tracker</h1>
          <p>Check the real-time status of your complaint using your reference number.</p>
        </div>
      </section>

      <div className="container-page py-8">
        {/* No ref yet */}
        {!ref && <TrackForm />}

        {/* Loading */}
        {ref && isLoading && (
          <div className="card mx-auto max-w-2xl p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 rounded bg-slate-100" />
              <div className="h-4 w-64 rounded bg-slate-100" />
              <div className="mt-6 flex gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error / not found */}
        {ref && isError && (
          <div className="card mx-auto max-w-lg p-10 text-center">
            <XCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />
            <h2 className="mb-2 font-heading text-xl font-bold text-slate-900">Reference not found</h2>
            <p className="mb-6 text-sm text-slate-500">
              No complaint found for reference <span className="font-mono font-semibold">{ref}</span>. Please check the number and try again.
            </p>
            <TrackForm defaultRef={ref} />
          </div>
        )}

        {/* Result */}
        {ref && complaint && (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Header card */}
            <div className="card">
              <div className="card-header flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-bocra-blue">{complaint.referenceNumber}</p>
                  <h2 className="mt-1 font-heading text-xl font-bold text-slate-900">{complaint.providerName}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCategory(complaint.category)} · Submitted {formatRelative(complaint.submittedAt)}
                  </p>
                </div>
                <StatusBadge status={complaint.status as ComplaintStatus} />
              </div>

              {/* Progress tracker */}
              <div className="border-t border-slate-100 px-6 py-6">
                <div className="flex items-start">
                  {STATUS_STEPS.map((s, i) => {
                    const currentIdx = STATUS_ORDER[complaint.status as ComplaintStatus] ?? 0
                    const done   = i < currentIdx
                    const active = i === currentIdx
                    const Icon   = STATUS_ICON[s.key]
                    return (
                      <div key={s.key} className="flex flex-1 flex-col items-center">
                        {/* Connector line + circle row */}
                        <div className="flex w-full items-center">
                          <div className={cn('h-px flex-1', i === 0 ? 'invisible' : done || active ? 'bg-bocra-blue' : 'bg-slate-200')} />
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                            done   && 'border-bocra-blue bg-bocra-blue text-white',
                            active && 'border-bocra-blue bg-white text-bocra-blue',
                            !done && !active && 'border-slate-200 bg-white text-slate-300',
                          )}>
                            {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </div>
                          <div className={cn('h-px flex-1', i === STATUS_STEPS.length - 1 ? 'invisible' : done ? 'bg-bocra-blue' : 'bg-slate-200')} />
                        </div>
                        {/* Label */}
                        <p className={cn('mt-2 text-center text-xs font-medium', active ? 'text-bocra-blue' : done ? 'text-slate-600' : 'text-slate-300')}>
                          {s.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Detail card */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-slate-900">Complaint details</h3>
              </div>
              <div className="card-body">
                <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</dt>
                    <dd className="mt-1 font-medium text-slate-800">{formatCategory(complaint.category)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</dt>
                    <dd className="mt-1"><StatusBadge status={complaint.status as ComplaintStatus} /></dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submitted</dt>
                    <dd className="mt-1 font-medium text-slate-800">{formatDate(complaint.submittedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Days open</dt>
                    <dd className="mt-1 font-medium text-slate-800">{complaint.daysOpen} days</dd>
                  </div>
                  {complaint.resolvedAt && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Resolved on</dt>
                      <dd className="mt-1 font-medium text-slate-800">{formatDate(complaint.resolvedAt)}</dd>
                    </div>
                  )}
                </dl>
                {complaint.description && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
                    <p className="text-sm leading-relaxed text-slate-700">{complaint.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <TrackForm defaultRef={ref} />
              <Link to="/complaints" className="btn-secondary inline-flex items-center gap-1.5 text-sm">
                <ArrowUpRight className="h-4 w-4" /> File another complaint
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
