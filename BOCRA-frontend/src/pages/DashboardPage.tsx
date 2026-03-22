import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { TrendingUp, TrendingDown, Download, RefreshCw, Activity } from 'lucide-react'

import * as analyticsService from '@/services/analytics'
import { formatNumber } from '@/utils/formatters'
import { cn } from '@/utils/cn'

type Period = 'q1' | 'q2' | 'q3' | 'q4' | 'ytd'

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_KPIS = {
  activeLicences: 1248, activeLicencesDelta: 42,
  complaintsYTD: 3891, complaintsYTDDelta: -8,
  broadbandPenetration: 62.4, broadbandDelta: 3.1,
  mobileSubscribers: 3800000, mobileSubscribersDelta: 5.2,
}
const MOCK_COMPLAINTS = [
  { category: 'Billing',   count: 312, fill: '#1A7F79' },
  { category: 'Quality',   count: 244, fill: '#2D6A2D' },
  { category: 'Coverage',  count: 172, fill: '#7A1E2E' },
  { category: 'Data',      count: 127, fill: '#F0B429' },
  { category: 'Fraud',     count: 84,  fill: '#0D9488' },
  { category: 'Other',     count: 66,  fill: '#64748B' },
]
const MOCK_SECTORS = [
  { name: 'Telecom',    value: 499, fill: '#1A7F79' },
  { name: 'Internet',   value: 312, fill: '#2D6A2D' },
  { name: 'Broadcast',  value: 250, fill: '#F0B429' },
  { name: 'Postal',     value: 187, fill: '#7A1E2E' },
]
const MOCK_MONTHLY = [
  { month: 'Oct', applications: 18, resolutions: 42 },
  { month: 'Nov', applications: 21, resolutions: 38 },
  { month: 'Dec', applications: 13, resolutions: 29 },
  { month: 'Jan', applications: 24, resolutions: 51 },
  { month: 'Feb', applications: 26, resolutions: 47 },
  { month: 'Mar', applications: 29, resolutions: 63 },
]
const RESOLUTION_RATES = [
  { label: 'Resolved within 30 days', value: 87, color: '#1A7F79' },
  { label: 'Escalated cases closed',  value: 71, color: '#2D6A2D' },
  { label: 'Customer satisfaction',   value: 79, color: '#F0B429' },
]
const PERIOD_LABELS: Record<Period, string> = {
  q1: 'Q1 2025', q2: 'Q2 2025', q3: 'Q3 2025', q4: 'Q4 2025', ytd: 'Year to date',
}
const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, delta, unit = '', format = (v: number) => formatNumber(v), accentColor = 'bocra-teal' }: {
  label: string; value: number; delta: number; unit?: string; format?: (v: number) => string; accentColor?: string
}) {
  const up = delta >= 0
  return (
    <motion.div variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:shadow-card-md hover:-translate-y-0.5">
      <div className={`absolute right-0 top-0 h-1 w-full bg-${accentColor}`} />
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-heading text-3xl font-bold text-slate-900">{format(value)}{unit}</p>
      <div className={cn('mt-2 flex items-center gap-1 text-xs font-semibold', up ? 'text-emerald-600' : 'text-red-500')}>
        {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {up ? '+' : ''}{delta}{unit} vs last period
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="mb-1 font-bold text-slate-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-600">{p.name}: <span className="font-semibold">{p.value}</span></p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('ytd')

  const { data: kpis, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn: () => analyticsService.getDashboardKPIs({ period }),
    placeholderData: MOCK_KPIS,
    staleTime: 1000 * 60 * 15,
  })
  const { data: complaintsByCat } = useQuery({ queryKey: ['analytics', 'complaints-cat', period], queryFn: () => analyticsService.getComplaintsByCategory({ period }), placeholderData: MOCK_COMPLAINTS.map(d => ({ category: d.category.toLowerCase() as never, count: d.count })) })
  const { data: sectors }        = useQuery({ queryKey: ['analytics', 'sectors'], queryFn: analyticsService.getLicencesBySector, placeholderData: MOCK_SECTORS.map(d => ({ sector: d.name.toLowerCase() as never, count: d.value, pct: Math.round(d.value / 12.48) })) })
  const { data: monthly }        = useQuery({ queryKey: ['analytics', 'monthly'], queryFn: analyticsService.getMonthlyApplications, placeholderData: MOCK_MONTHLY.map(d => ({ month: d.month, count: d.applications })) })

  const kpiData     = kpis     ?? MOCK_KPIS
  const catData     = MOCK_COMPLAINTS
  const sectorData  = MOCK_SECTORS
  const monthlyData = MOCK_MONTHLY

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bocra-teal/10 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-4">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Dashboard</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-bocra-teal/20 px-3 py-1">
                <Activity className="h-3.5 w-3.5 text-bocra-teal" />
                <span className="text-xs font-semibold text-bocra-teal">Live regulatory data</span>
              </div>
              <h1 className="font-heading text-4xl font-bold text-white">Regulatory intelligence</h1>
              <p className="mt-2 text-slate-400">Real-time overview of Botswana's communications sector</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Period picker */}
              <div className="flex overflow-hidden rounded-xl border border-white/15">
                {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={cn('px-4 py-2 text-xs font-semibold transition-colors',
                      period === p ? 'bg-bocra-teal text-white' : 'text-white/60 hover:bg-white/10'
                    )}>
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
              <button onClick={() => refetch()} title="Refresh"
                className="rounded-xl border border-white/15 p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <RefreshCw className={cn('h-5 w-5', isFetching && 'animate-spin')} />
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 space-y-8">
        {/* KPI row */}
        <InView>
          <motion.p variants={fadeUp} className="section-label">{PERIOD_LABELS[period]} — key metrics</motion.p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
            )) : <>
              <KPICard label="Active licences"       value={kpiData.activeLicences}       delta={kpiData.activeLicencesDelta}    accentColor="bocra-teal"  />
              <KPICard label="Complaints YTD"         value={kpiData.complaintsYTD}         delta={kpiData.complaintsYTDDelta}     accentColor="bocra-red"   />
              <KPICard label="Broadband penetration"  value={kpiData.broadbandPenetration}  delta={kpiData.broadbandDelta}         unit="%" format={v => v.toFixed(1)} accentColor="bocra-green" />
              <KPICard label="Mobile subscribers"     value={kpiData.mobileSubscribers}     delta={kpiData.mobileSubscribersDelta} format={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : formatNumber(v)} accentColor="bocra-gold" />
            </>}
          </div>
        </InView>

        {/* Charts row 1 */}
        <InView>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Complaints by category */}
            <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Complaints by category</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={catData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {catData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Licences by sector */}
            <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Licences by sector</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={sectorData} cx="45%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value">
                    {sectorData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </InView>

        {/* Charts row 2 */}
        <InView>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly trend */}
            <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Monthly applications & resolutions</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1A7F79" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1A7F79" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2D6A2D" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2D6A2D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="#1A7F79" strokeWidth={2.5} fill="url(#appGrad)" dot={{ r: 4, fill: '#1A7F79' }} />
                  <Area type="monotone" dataKey="resolutions"  name="Resolutions"  stroke="#2D6A2D" strokeWidth={2.5} fill="url(#resGrad)"  dot={{ r: 4, fill: '#2D6A2D' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Resolution rates */}
            <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Complaint resolution rates</h3>
              <div className="space-y-6 mt-2">
                {RESOLUTION_RATES.map(r => (
                  <div key={r.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-600">{r.label}</span>
                      <span className="font-heading text-lg font-bold text-slate-900">{r.value}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${r.value}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: r.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs leading-relaxed text-slate-500">
                  <strong className="text-slate-700">Target:</strong> BOCRA aims to resolve 90% of complaints within 30 days. Current performance is tracking at 87%.
                </p>
              </div>
            </motion.div>
          </div>
        </InView>

        {/* Open data notice */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-4 rounded-2xl border border-bocra-teal/20 bg-bocra-teal/5 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bocra-teal/10">
            <Download className="h-5 w-5 text-bocra-teal" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Open data commitment</p>
            <p className="mt-1 text-sm text-slate-600">
              All dashboard data is publicly available for download. Complaint logs are fully anonymised — no personal data is published.{' '}
              <button className="font-semibold text-bocra-teal hover:underline">Download full dataset →</button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}