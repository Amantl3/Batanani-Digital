import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'
import {
  Users, FileText, AlertCircle, CheckCircle, Clock,
  TrendingUp, TrendingDown, Activity, RefreshCw, Download,
  Bell, ChevronRight, Eye, MoreHorizontal,
  Check, X
} from 'lucide-react'
import { formatNumber, formatDate, formatRelative } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const KPI_CARDS = [
  { label: 'Total licences',        value: 1248, delta: 42,   up: true,  icon: FileText,    color: 'bocra-teal',  unit: '' },
  { label: 'Active complaints',     value: 87,   delta: -12,  up: false, icon: AlertCircle, color: 'bocra-red',   unit: '' },
  { label: 'Pending applications',  value: 34,   delta: 8,    up: true,  icon: Clock,       color: 'bocra-gold',  unit: '' },
  { label: 'Registered users',      value: 2841, delta: 156,  up: true,  icon: Users,       color: 'bocra-green', unit: '' },
]

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

const RECENT_APPS = [
  { ref: 'APP-2025-0312', company: 'Kalahari Fibre Ltd',       type: 'Telecom',   submitted: '2025-03-20', status: 'pending_docs' },
  { ref: 'APP-2025-0309', company: 'Savanna Broadcasting Co.', type: 'Broadcast', submitted: '2025-03-18', status: 'under_review' },
  { ref: 'APP-2025-0301', company: 'Delta ISP Services',       type: 'Internet',  submitted: '2025-03-15', status: 'approved'     },
  { ref: 'APP-2025-0298', company: 'Moremi Telecoms (Pty)',    type: 'Telecom',   submitted: '2025-03-14', status: 'rejected'     },
  { ref: 'APP-2025-0291', company: 'Chobe Rural Networks',     type: 'Internet',  submitted: '2025-03-12', status: 'under_review' },
]

const RECENT_COMPLAINTS = [
  { ref: 'CMP-2025-1021', name: 'T. Mokoena',   provider: 'Mascom',    category: 'Billing',   status: 'in_review',  daysOpen: 3  },
  { ref: 'CMP-2025-1018', name: 'B. Sechele',   provider: 'Orange',    category: 'Coverage',  status: 'escalated',  daysOpen: 7  },
  { ref: 'CMP-2025-1015', name: 'M. Kgosidintsi',provider: 'BTC',      category: 'Quality',   status: 'in_review',  daysOpen: 5  },
  { ref: 'CMP-2025-1009', name: 'K. Pheto',     provider: 'Mascom',    category: 'Data',      status: 'resolved',   daysOpen: 12 },
]

const APP_STATUS_STYLE: Record<string, string> = {
  pending_docs: 'badge-warning',
  under_review: 'badge-info',
  approved:     'badge-success',
  rejected:     'badge-danger',
}
const CMP_STATUS_STYLE: Record<string, string> = {
  in_review: 'badge-info',
  escalated: 'badge-warning',
  resolved:  'badge-success',
  closed:    'badge-muted',
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="mb-1.5 font-bold text-slate-700">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [isFetching, setIsFetching] = useState(false)
  const refresh = () => { setIsFetching(true); setTimeout(() => setIsFetching(false), 800) }

  // Mock mutation for demonstration
  // In a real app, you'd use: const { mutate } = useUpdateApplicationStatus()
  const handleUpdateStatus = async (ref: string, status: 'approved' | 'rejected') => {
    try {
      setIsFetching(true)
      // Simulate API call to update database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Application ${ref} has been ${status}. User notified.`, {
        icon: status === 'approved' ? '✅' : '❌',
      })
      
      // refresh() would usually trigger a React Query invalidation here
    } catch (err) {
      toast.error("Failed to update licence")
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bocra-teal/10 via-transparent to-transparent" />
        <div className="container-page relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-red/20 px-3 py-1">
                <Activity className="h-3.5 w-3.5 text-bocra-red" />
                <span className="text-xs font-semibold text-bocra-red">Admin portal — restricted access</span>
              </div>
              <h1 className="font-heading text-3xl font-bold text-white">Regulatory dashboard</h1>
              <p className="mt-1 text-slate-400">Overview of all regulatory activity across BOCRA's mandate</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} className="rounded-xl border border-white/15 p-2.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
                <Download className="h-4 w-4" /> Export report
              </button>
              <Link to="/admin/applications" className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                Applications <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8 space-y-8">

        {/* KPI cards */}
        <InView>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {KPI_CARDS.map((k, i) => (
              <motion.div key={k.label} variants={fadeUp}
                className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:shadow-card-md transition-all hover:-translate-y-0.5`}>
                <div className={`absolute right-0 top-0 h-1 w-full bg-${k.color}`} />
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-${k.color}/10`}>
                  <k.icon className={`h-5 w-5 text-${k.color}`} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k.label}</p>
                <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{formatNumber(k.value)}{k.unit}</p>
                <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-semibold', k.up ? 'text-emerald-600' : 'text-red-500')}>
                  {k.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {k.up ? '+' : ''}{k.delta} this month
                </div>
              </motion.div>
            ))}
          </div>
        </InView>

        {/* Charts row 1 */}
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

        {/* Charts row 2 */}
        <InView>
          <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-card">
            <h3 className="mb-5 font-heading text-base font-bold text-slate-900">Complaints filed vs resolved</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={COMPLAINTS_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="filedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7A1E2E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7A1E2E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A7F79" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A7F79" stopOpacity={0} />
                  </linearGradient>
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

        {/* Tables row */}
        <InView>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent applications */}
            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="font-heading text-base font-bold text-slate-900">Recent applications</h3>
                <Link to="/admin/applications" className="text-xs font-semibold text-bocra-teal hover:underline">View all →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Reference</th><th>Company</th><th className="hidden md:table-cell">Type</th><th>Status</th><th>Action</th></tr></thead>
                  <thead><tr><th>Reference</th><th>Company</th><th className="hidden md:table-cell">Type</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                  <tbody>
                    {RECENT_APPS.map(app => (
                      <tr key={app.ref}>
                        <td><span className="font-mono text-xs font-bold text-bocra-teal">{app.ref}</span></td>
                        <td><p className="text-sm font-medium text-slate-800 max-w-[140px] truncate">{app.company}</p></td>
                        <td className="hidden md:table-cell"><span className="badge badge-muted">{app.type}</span></td>
                        <td><span className={cn('badge', APP_STATUS_STYLE[app.status])}>{app.status.replace('_', ' ')}</span></td>
                        <td><Link to={`/admin/applications/${app.ref}`} className="flex items-center gap-1 text-xs font-semibold text-bocra-teal hover:underline"><Eye className="h-3 w-3" />Review</Link></td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(app.ref, 'approved')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(app.ref, 'rejected')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <X className="h-4 w-4" />
                            </button>
                            <Link to={`/admin/applications/${app.ref}`} className="p-1.5 text-bocra-teal hover:bg-bocra-teal/5 rounded-lg transition-colors">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Recent complaints */}
            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="font-heading text-base font-bold text-slate-900">Active complaints</h3>
                <Link to="/admin/complaints" className="text-xs font-semibold text-bocra-teal hover:underline">View all →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Reference</th><th>Provider</th><th className="hidden md:table-cell">Category</th><th>Status</th><th>Days</th></tr></thead>
                  <tbody>
                    {RECENT_COMPLAINTS.map(c => (
                      <tr key={c.ref}>
                        <td><span className="font-mono text-xs font-bold text-bocra-teal">{c.ref}</span></td>
                        <td><p className="text-sm font-medium text-slate-800">{c.provider}</p><p className="text-xs text-slate-400">{c.name}</p></td>
                        <td className="hidden md:table-cell"><span className="badge badge-muted">{c.category}</span></td>
                        <td><span className={cn('badge', CMP_STATUS_STYLE[c.status])}>{c.status.replace('_', ' ')}</span></td>
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