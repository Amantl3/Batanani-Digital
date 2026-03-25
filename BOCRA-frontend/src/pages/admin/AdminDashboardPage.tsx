import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'
import {
  Users, FileText, AlertCircle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Activity, RefreshCw, Download, Eye,
} from 'lucide-react'
import toast from 'react-hot-toast'

import * as analyticsService from '@/services/analytics'
import * as adminService     from '@/services/admin'
import { exportToCSV, exportToPDF } from '@/utils/exportUtils'
import { formatNumber, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

// ── Mock / placeholder data used until backend responds ──────────────────────
const MONTHLY_APPS = [
  { month: 'Oct', applications: 18, approved: 14, rejected: 4 },
  { month: 'Nov', applications: 23, approved: 19, rejected: 4 },
  { month: 'Dec', applications: 12, approved: 10, rejected: 2 },
  { month: 'Jan', applications: 27, approved: 22, rejected: 5 },
  { month: 'Feb', applications: 31, approved: 26, rejected: 5 },
  { month: 'Mar', applications: 29, approved: 24, rejected: 5 },
]
const COMPLAINTS_TREND = [
  { month: 'Oct', filed: 112, resolved: 98  },
  { month: 'Nov', filed: 134, resolved: 121 },
  { month: 'Dec', filed: 89,  resolved: 103 },
  { month: 'Jan', filed: 156, resolved: 134 },
  { month: 'Feb', filed: 143, resolved: 149 },
  { month: 'Mar', filed: 128, resolved: 141 },
]
const SECTOR_PIE = [
  { name: 'Telecom',   value: 499, fill: '#1A7F79' },
  { name: 'Internet',  value: 312, fill: '#2D6A2D' },
  { name: 'Broadcast', value: 250, fill: '#F0B429' },
  { name: 'Postal',    value: 187, fill: '#7A1E2E' },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="mb-1.5 font-bold text-slate-700">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>)}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [exporting, setExporting] = useState(false)

  // ── Real data from backend ─────────────────────────────────────────────────
  // BACKEND: GET /api/v1/analytics/dashboard
  const { data: kpis, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['analytics', 'dashboard', 'admin'],
    queryFn:  () => analyticsService.getDashboardKPIs({}),
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      activeLicences: 1248,       activeLicencesDelta: 42,
      complaintsYTD:  87,         complaintsYTDDelta: -12,
      broadbandPenetration: 34,   broadbandDelta: 8,
      mobileSubscribers: 2841,    mobileSubscribersDelta: 156,
    },
  })

  // BACKEND: GET /api/v1/admin/applications?limit=5&sort=submitted_desc
  const { data: recentApps } = useQuery({
    queryKey: ['admin', 'applications', 'recent'],
    queryFn:  () => adminService.getAllApplications({ limit: 5 }),
    placeholderData: {
      total: 34, totalPages: 7,
      data: [
        { id:'1', reference:'APP-2025-0312', companyName:'Kalahari Fibre Ltd',       category:'telecom'   as const, status:'submitted'    as const, stage:'Pending docs',  submittedAt:'2025-03-20', updatedAt:'2025-03-20' },
        { id:'2', reference:'APP-2025-0309', companyName:'Savanna Broadcasting Co.', category:'broadcast' as const, status:'under_review'  as const, stage:'Officer review',submittedAt:'2025-03-18', updatedAt:'2025-03-18' },
        { id:'3', reference:'APP-2025-0301', companyName:'Delta ISP Services',       category:'internet'  as const, status:'approved'       as const, stage:'Approved',      submittedAt:'2025-03-15', updatedAt:'2025-03-15' },
        { id:'4', reference:'APP-2025-0298', companyName:'Moremi Telecoms (Pty)',    category:'telecom'   as const, status:'rejected'       as const, stage:'Rejected',      submittedAt:'2025-03-14', updatedAt:'2025-03-14' },
        { id:'5', reference:'APP-2025-0291', companyName:'Chobe Rural Networks',     category:'internet'  as const, status:'under_review'  as const, stage:'Officer review',submittedAt:'2025-03-12', updatedAt:'2025-03-12' },
      ],
    },
  })

  // BACKEND: GET /api/v1/admin/complaints?status=in_review,escalated&limit=5
  const { data: recentComplaints } = useQuery({
    queryKey: ['admin', 'complaints', 'recent'],
    queryFn:  () => adminService.getAllComplaints({ limit: 5 }),
    placeholderData: {
      total: 87,
      data: [
        { id:'1', referenceNumber:'CMP-2025-1021', providerName:'Mascom', category:'billing'  as const, status:'in_review' as const, description:'', submittedAt:'2025-03-21', resolvedAt:null, daysOpen:3  },
        { id:'2', referenceNumber:'CMP-2025-1018', providerName:'Orange', category:'coverage' as const, status:'escalated' as const, description:'', submittedAt:'2025-03-18', resolvedAt:null, daysOpen:7  },
        { id:'3', referenceNumber:'CMP-2025-1015', providerName:'BTC',    category:'quality'  as const, status:'in_review' as const, description:'', submittedAt:'2025-03-19', resolvedAt:null, daysOpen:5  },
        { id:'4', referenceNumber:'CMP-2025-1009', providerName:'Mascom', category:'data'     as const, status:'resolved'  as const, description:'', submittedAt:'2025-03-12', resolvedAt:'2025-03-24', daysOpen:12 },
      ],
    },
  })

  const kpiCards = [
    { label: 'Total licences',       value: kpis?.activeLicences     ?? 0, delta: kpis?.activeLicencesDelta  ?? 0, icon: FileText,    color: 'bocra-teal'  },
    { label: 'Active complaints',    value: kpis?.complaintsYTD      ?? 0, delta: kpis?.complaintsYTDDelta   ?? 0, icon: AlertCircle, color: 'bocra-red'   },
    { label: 'Pending applications', value: kpis?.broadbandPenetration?? 0, delta: kpis?.broadbandDelta      ?? 0, icon: Clock,       color: 'bocra-gold'  },
    { label: 'Registered users',     value: kpis?.mobileSubscribers  ?? 0, delta: kpis?.mobileSubscribersDelta??0, icon: Users,       color: 'bocra-green' },
  ]

  // ── Export full dashboard report ───────────────────────────────────────────
  // Fetches full dataset then generates CSV + opens print PDF
  const handleExport = async () => {
    setExporting(true)
    const toastId = toast.loading('Preparing export…')
    try {
      // Export applications
      const appsData = await adminService.getAllApplications({ limit: 1000 })
      exportToCSV(
        appsData.data.map(a => ({
          Reference:    a.reference,
          Company:      a.companyName,
          Category:     a.category,
          Status:       a.status,
          Stage:        a.stage,
          Submitted:    a.submittedAt,
          'Last update':a.updatedAt,
        })),
        'BOCRA-applications-export'
      )
      // Export complaints
      const cmpData = await adminService.getAllComplaints({ limit: 1000 })
      exportToCSV(
        cmpData.data.map(c => ({
          Reference: c.referenceNumber,
          Provider:  c.providerName,
          Category:  c.category,
          Status:    c.status,
          'Days open':c.daysOpen,
          Submitted: c.submittedAt,
          Resolved:  c.resolvedAt ?? 'N/A',
        })),
        'BOCRA-complaints-export'
      )
      toast.success('Export downloaded — 2 CSV files', { id: toastId })
    } catch {
      // Fallback: export whatever is loaded in state
      exportToCSV(
        (recentApps?.data ?? []).map(a => ({
          Reference: a.reference, Company: a.companyName,
          Category: a.category,  Status: a.status, Submitted: a.submittedAt,
        })),
        'BOCRA-applications-partial'
      )
      toast.success('Partial export downloaded', { id: toastId })
    } finally {
      setExporting(false)
    }
  }

  const APP_STATUS: Record<string, string> = {
    submitted: 'badge-muted', under_review: 'badge-info', approved: 'badge-success', rejected: 'badge-danger',
  }
  const CMP_STATUS: Record<string, string> = {
    in_review: 'badge-info', escalated: 'badge-warning', resolved: 'badge-success', closed: 'badge-muted',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-bocra-navy py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bocra-teal/10 via-transparent to-transparent" />
        <div className="container-page relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-red/20 px-3 py-1">
                <Activity className="h-3.5 w-3.5 text-bocra-red" />
                <span className="text-xs font-semibold text-bocra-red">Admin — restricted access</span>
              </div>
              <h1 className="font-heading text-3xl font-bold text-white">Regulatory dashboard</h1>
              <p className="mt-1 text-slate-400">Live overview of all regulatory activity</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => refetch()} className="rounded-xl border border-white/15 p-2.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </button>
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors disabled:opacity-60">
                {exporting
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Download className="h-4 w-4" />}
                Export all data
              </button>
              <Link to="/admin/applications" className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                Applications →
              </Link>
              <Link to="/admin/complaints" className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                Complaints →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 space-y-8">
        <InView>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />)
              : kpiCards.map((k) => (
                <motion.div key={k.label} variants={fadeUp}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:shadow-card-md transition-all hover:-translate-y-0.5">
                  <div className={`absolute right-0 top-0 h-1 w-full bg-${k.color}`} />
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-${k.color}/10`}>
                    <k.icon className={`h-5 w-5 text-${k.color}`} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k.label}</p>
                  <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{formatNumber(k.value)}</p>
                  <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-semibold', k.delta >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                    {k.delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {k.delta >= 0 ? '+' : ''}{k.delta} this month
                  </div>
                </motion.div>
              ))
            }
          </div>
        </InView>

        {/* Charts */}
        <InView>
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Licence applications — 6 month trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_APPS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applications" name="Received"  fill="#1A7F79" radius={[4,4,0,0]} />
                  <Bar dataKey="approved"     name="Approved"  fill="#2D6A2D" radius={[4,4,0,0]} />
                  <Bar dataKey="rejected"     name="Rejected"  fill="#7A1E2E" radius={[4,4,0,0]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Licences by sector</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={SECTOR_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {SECTOR_PIE.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </InView>

        <InView>
          <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Complaints filed vs resolved</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={COMPLAINTS_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="filedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7A1E2E" stopOpacity={0.15} /><stop offset="95%" stopColor="#7A1E2E" stopOpacity={0} /></linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A7F79" stopOpacity={0.15} /><stop offset="95%" stopColor="#1A7F79" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="filed"    name="Filed"    stroke="#7A1E2E" strokeWidth={2} fill="url(#filedGrad)"    dot={{ r: 3 }} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#1A7F79" strokeWidth={2} fill="url(#resolvedGrad)" dot={{ r: 3 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </InView>

        {/* Tables */}
        <InView>
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="font-heading text-base font-bold text-slate-900">Recent applications</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                    exportToCSV(
                      (recentApps?.data ?? []).map(a => ({ Reference: a.reference, Company: a.companyName, Category: a.category, Status: a.status, Submitted: a.submittedAt })),
                      'applications'
                    )
                    toast.success('Applications CSV downloaded')
                  }} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                    <Download className="h-3 w-3" /> CSV
                  </button>
                  <Link to="/admin/applications" className="text-xs font-semibold text-bocra-teal hover:underline">View all →</Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Reference</th><th>Company</th><th className="hidden sm:table-cell">Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {(recentApps?.data ?? []).map(app => (
                      <tr key={app.id}>
                        <td><span className="font-mono text-xs font-bold text-bocra-teal">{app.reference}</span></td>
                        <td><p className="text-sm font-medium truncate max-w-[140px]">{app.companyName}</p></td>
                        <td className="hidden sm:table-cell"><span className={cn('badge', APP_STATUS[app.status] ?? 'badge-muted')}>{app.status.replace('_', ' ')}</span></td>
                        <td><Link to="/admin/applications" className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline"><Eye className="h-3 w-3" />Review</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="font-heading text-base font-bold text-slate-900">Active complaints</h3>
                <div className="flex items-center gap-3">
                  <button onClick={() => {
                    exportToCSV(
                      (recentComplaints?.data ?? []).map(c => ({ Reference: c.referenceNumber, Provider: c.providerName, Category: c.category, Status: c.status, Days: c.daysOpen })),
                      'complaints'
                    )
                    toast.success('Complaints CSV downloaded')
                  }} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline">
                    <Download className="h-3 w-3" /> CSV
                  </button>
                  <Link to="/admin/complaints" className="text-xs font-semibold text-bocra-teal hover:underline">View all →</Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Reference</th><th>Provider</th><th className="hidden sm:table-cell">Status</th><th>Days</th></tr></thead>
                  <tbody>
                    {(recentComplaints?.data ?? []).map(c => (
                      <tr key={c.id}>
                        <td><span className="font-mono text-xs font-bold text-bocra-teal">{c.referenceNumber}</span></td>
                        <td><p className="text-sm font-medium">{c.providerName}</p><p className="text-xs text-slate-400">{c.category}</p></td>
                        <td className="hidden sm:table-cell"><span className={cn('badge', CMP_STATUS[c.status] ?? 'badge-muted')}>{c.status.replace('_', ' ')}</span></td>
                        <td><span className={cn('text-sm font-bold', c.daysOpen > 7 ? 'text-red-500' : 'text-slate-600')}>{c.daysOpen}d</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </InView>
      </div>
    </div>
  )
}