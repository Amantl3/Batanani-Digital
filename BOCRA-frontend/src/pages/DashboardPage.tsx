import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts'
import { TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import * as analyticsService from '@/services/analytics'
import { formatNumber, formatPercent } from '@/utils/formatters'
import { cn } from '@/utils/cn'

type Period = 'q1' | 'q2' | 'q3' | 'q4' | 'ytd'

// ── Placeholder data (used until real API is connected) ───────────────────────
const MOCK_KPIS = {
  activeLicences: 1248, activeLicencesDelta: 42,
  complaintsYTD: 3891,  complaintsYTDDelta: -8,
  broadbandPenetration: 62.4, broadbandDelta: 3.1,
  mobileSubscribers: 3800000, mobileSubscribersDelta: 5.2,
}

const MOCK_COMPLAINTS_BY_CAT = [
  { category: 'billing',  count: 312 },
  { category: 'quality',  count: 244 },
  { category: 'coverage', count: 172 },
  { category: 'data',     count: 127 },
  { category: 'fraud',    count: 84  },
  { category: 'other',    count: 66  },
]

const MOCK_SECTORS = [
  { sector: 'telecom',   count: 499, pct: 40 },
  { sector: 'internet',  count: 312, pct: 25 },
  { sector: 'broadcast', count: 250, pct: 20 },
  { sector: 'postal',    count: 187, pct: 15 },
]

const MOCK_MONTHLY = [
  { month: 'Oct', count: 18 },
  { month: 'Nov', count: 21 },
  { month: 'Dec', count: 13 },
  { month: 'Jan', count: 24 },
  { month: 'Feb', count: 26 },
  { month: 'Mar', count: 29 },
]

const RESOLUTION_RATES = [
  { label: 'Resolved within 30 days', value: 87, color: '#10B981' },
  { label: 'Escalated cases closed',  value: 71, color: '#3B82F6' },
  { label: 'Customer satisfaction',   value: 79, color: '#F59E0B' },
]

const PIE_COLORS = ['#1A56DB', '#06B6D4', '#6366F1', '#0D9488']

const PERIOD_LABELS: Record<Period, string> = {
  q1: 'Q1 2025', q2: 'Q2 2025', q3: 'Q3 2025', q4: 'Q4 2025', ytd: 'Year to date',
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({
  label, value, delta, unit = '',
  format = (v: number) => formatNumber(v),
}: {
  label:    string
  value:    number
  delta:    number
  unit?:    string
  format?:  (v: number) => string
}) {
  const isPositive = delta >= 0
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-slate-900">
        {format(value)}{unit}
      </p>
      <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-500')}>
        {isPositive
          ? <TrendingUp className="h-3.5 w-3.5" />
          : <TrendingDown className="h-3.5 w-3.5" />
        }
        {isPositive ? '+' : ''}{delta}{unit} {isPositive ? 'increase' : 'decrease'}
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<Period>('ytd')

  const { data: kpis, isLoading: kpisLoading, refetch, isFetching } = useQuery({
    queryKey: ['analytics', 'dashboard', period],
    queryFn:  () => analyticsService.getDashboardKPIs({ period }),
    placeholderData: MOCK_KPIS,
    staleTime: 1000 * 60 * 15,
  })

  const { data: complaintsByCat } = useQuery({
    queryKey: ['analytics', 'complaints-by-cat', period],
    queryFn:  () => analyticsService.getComplaintsByCategory({ period }),
    placeholderData: MOCK_COMPLAINTS_BY_CAT,
  })

  const { data: sectors } = useQuery({
    queryKey: ['analytics', 'sectors'],
    queryFn:  analyticsService.getLicencesBySector,
    placeholderData: MOCK_SECTORS,
  })

  const { data: monthly } = useQuery({
    queryKey: ['analytics', 'monthly'],
    queryFn:  analyticsService.getMonthlyApplications,
    placeholderData: MOCK_MONTHLY,
  })

  const kpiData = kpis ?? MOCK_KPIS
  const catData  = (complaintsByCat ?? MOCK_COMPLAINTS_BY_CAT).map(d => ({
    name: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    count: d.count,
  }))
  const sectorData = (sectors ?? MOCK_SECTORS).map(d => ({
    name: d.sector.charAt(0).toUpperCase() + d.sector.slice(1),
    value: d.count,
  }))
  const monthlyData = monthly ?? MOCK_MONTHLY

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="page-hero">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Dashboard</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1>{t('dashboard.title')}</h1>
              <p>{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Period picker */}
              <div className="flex overflow-hidden rounded-lg border border-white/20">
                {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium transition-colors',
                      period === p
                        ? 'bg-bocra-cyan text-bocra-navy'
                        : 'text-white/70 hover:bg-white/10'
                    )}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => refetch()}
                className="btn-icon rounded-lg border border-white/20 text-white/70 hover:bg-white/10"
                title="Refresh data"
              >
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </button>
              <button className="btn-cyan btn-sm">
                <Download className="h-3.5 w-3.5" /> {t('dashboard.export')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 space-y-8">
        {/* KPI row */}
        <div>
          <p className="section-label">{PERIOD_LABELS[period]} — key metrics</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpisLoading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-slate-100" />
            )) : (
              <>
                <KPICard label={t('dashboard.kpis.licences')}  value={kpiData.activeLicences}       delta={kpiData.activeLicencesDelta} />
                <KPICard label={t('dashboard.kpis.complaints')} value={kpiData.complaintsYTD}        delta={kpiData.complaintsYTDDelta} />
                <KPICard label={t('dashboard.kpis.broadband')}  value={kpiData.broadbandPenetration} delta={kpiData.broadbandDelta} unit="%" format={v => `${v.toFixed(1)}`} />
                <KPICard
                  label={t('dashboard.kpis.mobile')}
                  value={kpiData.mobileSubscribers}
                  delta={kpiData.mobileSubscribersDelta}
                  format={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : formatNumber(v)}
                />
              </>
            )}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Complaints by category */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.charts.complaints_by_cat')}</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={catData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                    cursor={{ fill: '#F8FAFC' }}
                  />
                  <Bar dataKey="count" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Licences by sector */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.charts.licences_by_sector')}</h3>
            </div>
            <div className="card-body flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorData.map((_entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly applications */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.charts.monthly_apps')}</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    dot={{ fill: '#06B6D4', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resolution rates */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.charts.resolution_rates')}</h3>
            </div>
            <div className="card-body space-y-5">
              {RESOLUTION_RATES.map(r => (
                <div key={r.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-600">{r.label}</span>
                    <span className="font-semibold text-slate-900">{r.value}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${r.value}%`, background: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open data notice */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
          <strong>Open data commitment:</strong> All dashboard data is publicly available for download. Complaint logs are fully anonymised — no personal information is published.{' '}
          <button className="underline hover:no-underline">Download full dataset →</button>
        </div>
      </div>
    </div>
  )
}
