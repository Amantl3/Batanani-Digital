import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CheckCircle, Clock, AlertCircle, XCircle,
  ArrowRight, Phone, MessageCircle, FileText, RefreshCw, Loader2
} from 'lucide-react'

import { useTrackComplaint } from '@/hooks/useComplaints'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatRelative, formatCategory } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { ComplaintStatus } from '@/types'

const STATUS_STEPS: { key: ComplaintStatus; label: string; desc: string; icon: React.ElementType }[] = [
  { key: 'submitted',  label: 'Submitted',     desc: 'Complaint received by BOCRA',                icon: FileText     },
  { key: 'in_review',  label: 'Under review',  desc: 'Assigned to a BOCRA officer for assessment', icon: Clock        },
  { key: 'escalated',  label: 'Escalated',     desc: 'Referred to senior regulatory officer',      icon: AlertCircle  },
  { key: 'resolved',   label: 'Resolved',      desc: 'Resolution reached and communicated',         icon: CheckCircle  },
  { key: 'closed',     label: 'Closed',        desc: 'Case formally closed',                       icon: XCircle      },
]
const STATUS_ORDER: Record<ComplaintStatus, number> = {
  submitted: 0, in_review: 1, escalated: 2, resolved: 3, closed: 4,
}

function TrackForm({ defaultRef = '' }: { defaultRef?: string }) {
  const navigate = useNavigate()
  const [val, setVal] = useState(defaultRef)
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && val && navigate(`/complaints/track/${val}`)}
        placeholder="e.g. CMP-2025-04821"
        className="form-input flex-1 font-mono" />
      <button onClick={() => val && navigate(`/complaints/track/${val}`)}
        className="flex items-center gap-2 rounded-lg bg-bocra-navy px-5 py-2 text-sm font-semibold text-white hover:bg-bocra-navy/90 transition-colors">
        <Search className="h-4 w-4" /> Track
      </button>
    </div>
  )
}

export default function ComplaintTrackPage() {
  const { ref } = useParams<{ ref: string }>()
  const { data: complaint, isLoading, isError, refetch, isFetching } = useTrackComplaint(ref ?? '')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-bocra-teal/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-4">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/complaints" className="breadcrumb-link">Complaints</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Track</span>
          </nav>
          <h1 className="mb-2 font-heading text-4xl font-bold text-white">Complaint tracker</h1>
          <p className="mb-8 text-slate-400">Track the real-time status of your complaint using your reference number.</p>
          <div className="max-w-lg">
            <TrackForm defaultRef={ref} />
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {/* No ref */}
        {!ref && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-xl rounded-2xl bg-white p-12 text-center shadow-card">
            <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-bocra-navy/5">
              <Search className="h-8 w-8 text-bocra-navy" />
            </div>
            <h2 className="mb-2 font-heading text-xl font-bold text-slate-900">Enter your reference number</h2>
            <p className="mb-6 text-sm text-slate-500">Your reference number was provided when you submitted your complaint.</p>
            <TrackForm />
          </motion.div>
        )}

        {/* Loading */}
        {ref && isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-bocra-teal" />
            <p className="mt-4 text-slate-500 font-medium">Retrieving complaint details...</p>
          </div>
        )}

        {/* Error */}
        {ref && isError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mx-auto max-w-lg rounded-2xl bg-white p-10 text-center shadow-card">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="mb-2 font-heading text-xl font-bold text-slate-900">Reference not found</h2>
            <p className="mb-6 text-sm text-slate-500">No complaint found for {ref}.</p>
            <TrackForm defaultRef={ref} />
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {ref && !isLoading && complaint && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-5">

              {/* Status header card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                <div className="bg-bocra-navy px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-bold text-bocra-teal">{complaint.referenceNumber}</p>
                      <h2 className="mt-1 font-heading text-xl font-bold text-white">{complaint.providerName}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatCategory(complaint.category)} · 
                        {complaint.submittedAt ? ` Submitted ${formatRelative(complaint.submittedAt)}` : ' Date unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={complaint.status as ComplaintStatus} />
                      <button onClick={() => refetch()} className="rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors">
                        <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress tracker */}
                <div className="px-6 py-8">
                  <div className="flex items-start">
                    {STATUS_STEPS.map((s, i) => {
                      const curr = STATUS_ORDER[complaint.status as ComplaintStatus] ?? 0
                      const done = i < curr
                      const active = i === curr
                      const Icon = s.icon
                      return (
                        <div key={s.key} className="flex flex-1 flex-col items-center">
                          <div className="flex w-full items-center">
                            <div className={cn('h-0.5 flex-1', i === 0 ? 'invisible' : done || active ? 'bg-bocra-teal' : 'bg-slate-200')} />
                            <div className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                              done   && 'border-bocra-teal bg-bocra-teal text-white',
                              active && 'border-bocra-teal bg-white text-bocra-teal ring-4 ring-bocra-teal/20',
                              !done && !active && 'border-slate-200 bg-white text-slate-300',
                            )}>
                              {done ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <div className={cn('h-0.5 flex-1', i === STATUS_STEPS.length - 1 ? 'invisible' : done ? 'bg-bocra-teal' : 'bg-slate-200')} />
                          </div>
                          <p className={cn('mt-2 text-center text-xs font-semibold leading-tight', active ? 'text-bocra-teal' : done ? 'text-slate-600' : 'text-slate-300')}>
                            {s.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Details card */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="font-heading text-base font-bold text-slate-900">Complaint details</h3>
                </div>
                <dl className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-3">
                  {[
                    { label: 'Category',    value: formatCategory(complaint.category)  },
                    { label: 'Status',      value: <StatusBadge status={complaint.status as ComplaintStatus} /> },
                    { label: 'Days open',   value: `${complaint.daysOpen ?? 0} days` },
                    { label: 'Submitted',   value: complaint.submittedAt ? formatDate(complaint.submittedAt) : '—' },
                    { label: 'Provider',    value: complaint.providerName },
                    { label: 'Resolved on', value: complaint.resolvedAt ? formatDate(complaint.resolvedAt) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white px-5 py-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Actions */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Link to="/complaints" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card hover:border-bocra-teal transition-all">
                  <FileText className="h-4 w-4" /> New complaint
                </Link>
                <a href="tel:0800600125" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card hover:border-bocra-teal transition-all">
                  <Phone className="h-4 w-4" /> Call helpline
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}