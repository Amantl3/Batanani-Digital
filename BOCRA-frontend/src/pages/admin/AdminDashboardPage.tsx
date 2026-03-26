import { useState, useRef, useMemo } from 'react'
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
import { exportToCSV } from '@/utils/exportUtils'
import { formatNumber } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import ComplaintsMap from '@/components/ComplaintsMap' //

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="mb-1.5 font-bold text-slate-700">{label}</p>
      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>)}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [exporting, setExporting] = useState(false)

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: kpis, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['analytics', 'dashboard', 'admin'],
    queryFn:  () => analyticsService.getDashboardKPIs({}),
  })

  const { data: allApps } = useQuery({
    queryKey: ['admin', 'applications', 'all'],
    queryFn: () => adminService.getAllApplications({ limit: 1000 }),
  })

  const { data: allComplaints } = useQuery({
    queryKey: ['admin', 'complaints', 'all'],
    queryFn: () => adminService.getAllComplaints({ limit: 1000 }),
  })

  // ── DATA TRANSFORMATIONS FOR CHARTS/MAP ───────────────────────────────────
  
  // 1. Map Data: Group complaints by region
  const mapData = useMemo(() => {
    if (!allComplaints?.data) return []
    const counts: Record<string, number> = {}
    allComplaints.data.forEach((c: any) => {
      const reg = c.region || 'Gaborone' // Default for demo
      counts[reg] = (counts[reg] || 0) + 1
    })
    return Object.entries(counts).map(([region, count]) => ({
      region,
      complaints: count,
    }))
  }, [allComplaints])

  // 2. Pie Chart Data: Group by sector
  const sectorData = useMemo(() => {
    if (!allApps?.data) return []
    const sectors: Record<string, number> = {}
    allApps.data.forEach((a: any) => {
      sectors[a.category] = (sectors[a.category] || 0) + 1
    })
    const colors = ['#1A7F79', '#2D6A2D', '#F0B429', '#7A1E2E']
    return Object.entries(sectors).map(([name, value], i) => ({
      name, value, fill: colors[i % colors.length]
    }))
  }, [allApps])

  const kpiCards = [
    { label: 'Total licences', value: kpis?.activeLicences ?? 0, icon: FileText, color: 'emerald-600' },
    { label: 'Active complaints', value: allComplaints?.total ?? 0, icon: AlertCircle, color: 'red-600' },
    { label: 'Pending apps', value: allApps?.total ?? 0, icon: Clock, color: 'amber-500' },
    { label: 'Portal Users', value: kpis?.mobileSubscribers ?? 0, icon: Users, color: 'blue-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-slate-900 py-10 text-white">
        <div className="container-page flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Analytics</h1>
            <p className="text-slate-400">Real-time regulatory oversight</p>
          </div>
          <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2">
            <RefreshCw className={cn(isFetching && "animate-spin")} size={16}/> Refresh
          </button>
        </div>
      </section>

      <div className="container-page -mt-8 space-y-8 pb-12">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {kpiCards.map((k) => (
            <div key={k.label} className="rounded-2xl border bg-white p-6 shadow-sm">
              <k.icon className="mb-2" size={24} style={{ color: k.color }} />
              <p className="text-sm font-medium text-slate-500">{k.label}</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(k.value)}</p>
            </div>
          ))}
        </div>

        {/* Map & Pie Chart Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">National Distribution of Complaints</h3>
            <div className="h-[400px]">
               <ComplaintsMap data={mapData} /> 
            </div>
          </div>
          
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold">Market Share by Sector</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sectorData} innerRadius={60} outerRadius={80} dataKey="value" nameKey="name" label>
                   {sectorData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}