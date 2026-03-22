import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, CheckCircle, Clock, AlertTriangle, FileText, ExternalLink } from 'lucide-react'

import { useLicence } from '@/hooks/useLicences'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatCategory } from '@/utils/formatters'
import type { LicenceCategory, LicenceStatus } from '@/types'

const TIMELINE = [
  { label: 'Application submitted',   date: '2023-11-14', done: true  },
  { label: 'Documents verified',      date: '2023-11-28', done: true  },
  { label: 'Fee payment confirmed',   date: '2023-12-05', done: true  },
  { label: 'Licence issued',          date: '2024-01-15', done: true  },
  { label: 'First annual review due', date: '2025-01-15', done: false },
]
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

export default function LicenceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: licence, isLoading, isError } = useLicence(id ?? '')

  if (isLoading) return (
    <div className="container-page py-10 space-y-4">
      {[60, 40, 100, 60].map((w, i) => (
        <div key={i} className={`h-5 w-${w} animate-pulse rounded-full bg-slate-200`} />
      ))}
    </div>
  )

  if (isError || !licence) return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="mb-2 font-heading text-2xl font-bold text-slate-900">Licence not found</h1>
      <p className="mb-6 max-w-sm text-sm text-slate-500">The licence you're looking for doesn't exist or may have been removed from the registry.</p>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Go back
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-bocra-green/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-4">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/licensing" className="breadcrumb-link">Licensing</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="font-mono text-white/60">{licence.licenceNumber}</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="mb-2 font-mono text-sm font-bold tracking-wider text-bocra-teal">{licence.licenceNumber}</p>
              <h1 className="font-heading text-4xl font-bold text-white">{licence.holderName}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={licence.status as LicenceStatus} />
                <span className="badge badge-info">{formatCategory(licence.category as LicenceCategory)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {licence.documentUrl && (
                <a href={licence.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
                  <Download className="h-4 w-4" /> Download certificate
                </a>
              )}
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

          {/* Licence details card */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-heading text-base font-bold text-slate-900">Licence details</h2>
            </div>
            <dl className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-2">
              {[
                { label: 'Licence number', value: <span className="font-mono font-bold text-bocra-teal">{licence.licenceNumber}</span> },
                { label: 'Status',         value: <StatusBadge status={licence.status as LicenceStatus} /> },
                { label: 'Licence holder', value: licence.holderName },
                { label: 'Category',       value: formatCategory(licence.category as LicenceCategory) },
                { label: 'Date issued',    value: formatDate(licence.issuedAt) },
                { label: 'Expiry date',    value: licence.expiresAt ? formatDate(licence.expiresAt) : 'Perpetual licence' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white px-6 py-4">
                  <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="text-sm font-semibold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Conditions */}
          {Object.keys(licence.conditions ?? {}).length > 0 && (
            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-heading text-base font-bold text-slate-900">Licence conditions</h2>
              </div>
              <div className="p-6">
                <pre className="overflow-x-auto rounded-xl bg-slate-50 p-5 text-xs leading-relaxed text-slate-700">
                  {JSON.stringify(licence.conditions, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Related actions */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-bocra-navy/5 border border-bocra-navy/10 p-6">
            <h3 className="mb-4 font-heading text-sm font-bold text-slate-900">Related actions</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: FileText,    label: 'Renew this licence',           to: '/portal'    },
                { icon: AlertTriangle, label: 'File complaint vs holder',   to: '/complaints'},
                { icon: ExternalLink, label: 'Report unlicensed operation', to: '/complaints'},
              ].map(a => (
                <Link key={a.label} to={a.to}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-card hover:border-bocra-teal hover:text-bocra-teal transition-all">
                  <a.icon className="h-4 w-4 shrink-0" /> {a.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          {/* Timeline */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="font-heading text-sm font-bold text-slate-900">Application timeline</h3>
            </div>
            <div className="p-6">
              <ol className="space-y-0">
                {TIMELINE.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                        ${step.done ? 'bg-bocra-teal text-white' : 'border-2 border-slate-200 bg-white text-slate-400'}`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className={`my-1 w-0.5 flex-1 rounded-full ${step.done ? 'bg-bocra-teal/40' : 'bg-slate-200'}`} style={{ minHeight: 24 }} />
                      )}
                    </div>
                    <div className="pb-5 min-w-0">
                      <p className={`text-sm font-semibold ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(step.date)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>

          {/* Certificate download */}
          {licence.documentUrl && (
            <motion.div variants={fadeUp} className="rounded-2xl bg-bocra-teal p-6 text-center">
              <CheckCircle className="mx-auto mb-3 h-8 w-8 text-white/80" />
              <p className="mb-1 font-heading text-sm font-bold text-white">Certificate available</p>
              <p className="mb-4 text-xs text-white/70">Official BOCRA licence certificate with QR verification</p>
              <a href={licence.documentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-bocra-teal hover:bg-slate-50 transition-colors">
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}