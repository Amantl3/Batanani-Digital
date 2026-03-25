import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import {
  FileText, RefreshCw, CreditCard, BarChart2, Globe, CheckSquare,
  Bell, ChevronRight, AlertCircle, Clock, TrendingUp, Download,
  ShieldCheck, Activity, ArrowRight, Eye, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth }           from '@/hooks/useAuth'
import { useMyApplications } from '@/hooks/useLicences'
import { useMyComplaints }   from '@/hooks/useComplaints'
import * as notificationService from '@/services/notifications'
import StatusBadge           from '@/components/shared/StatusBadge'
import { formatDate, formatRelative, formatCurrency, formatCategory } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { LicenceStatus, ComplaintStatus, UserRole } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

const SERVICES = [
  { icon: FileText,    key: 'apply',         to: '/portal/apply',        title: 'Apply for licence',    desc: 'Start a new licence application',                  accent: 'bocra-teal',  bg: 'bg-bocra-teal/10'  },
  { icon: RefreshCw,   key: 'renew',         to: '/portal/renew',        title: 'Renew licence',        desc: 'Renew an existing or expiring licence',             accent: 'bocra-green', bg: 'bg-bocra-green/10' },
  { icon: CreditCard,  key: 'pay',           to: '/portal/pay',          title: 'Pay regulatory fees',  desc: 'View invoices and pay via card or mobile money',   accent: 'bocra-gold',  bg: 'bg-bocra-gold/10'  },
  { icon: BarChart2,   key: 'compliance',    to: '/portal/compliance',   title: 'Submit compliance',    desc: 'Upload QoS, coverage maps and audit reports',       accent: 'bocra-navy',  bg: 'bg-bocra-navy/10'  },
  { icon: Globe,       key: 'domain',        to: '/portal/domain',       title: 'Register .bw domain',  desc: 'Search availability and register your domain',     accent: 'bocra-teal',  bg: 'bg-bocra-teal/10'  },
  { icon: CheckSquare, key: 'type_approval', to: '/portal/type-approval',title: 'Type approval',        desc: 'Apply for approval before importing equipment',    accent: 'bocra-red',   bg: 'bg-bocra-red/10'   },
]

const PAYMENTS = [
  { desc: 'Licence renewal fee',  amount: 48500, date: '2025-01-15' },
  { desc: 'Type approval fee',    amount: 2200,  date: '2024-11-20' },
  { desc: 'Annual spectrum fee',  amount: 15000, date: '2024-09-01' },
]

const ROLE_LABELS: Record<UserRole, { label: string; badge: string }> = {
  admin:    { label: 'System administrator', badge: 'bg-bocra-red/20 text-bocra-red'   },
  officer:  { label: 'BOCRA officer',        badge: 'bg-bocra-gold/20 text-bocra-gold' },
  licensee: { label: 'Licensed operator',    badge: 'bg-bocra-teal/20 text-bocra-teal' },
  public:   { label: 'Registered member',    badge: 'bg-bocra-green/20 text-bocra-green'},
}

export default function PortalPage() {
  const { user } = useAuth()
  const [showAllApps, setShowAllApps] = useState(false)

  // ── Real data fetches ────────────────────────────────────────────────────────
  // BACKEND: GET /api/v1/licences/my-applications
  const { data: applications, isLoading: appsLoading } = useMyApplications()

  // BACKEND: GET /api/v1/complaints/mine
  const { data: complaintsPage } = useMyComplaints()

  // BACKEND: GET /api/v1/notifications  (polled every 30s)
  // When admin updates application/complaint → backend creates notification → this fetch picks it up
  const { data: notifications, refetch: refetchNotif } = useQuery({
    queryKey: ['notifications'],
    queryFn:  notificationService.getNotifications,
    refetchInterval: 30_000, // poll every 30 seconds
    placeholderData: [
      { id:'1', kind:'application_update' as const, title:'Application update',      body:'APP-2025-0312: Additional documents required by BOCRA officer.', read:false, urgent:true,  link:'/portal', createdAt:'2025-03-23T10:00:00Z' },
      { id:'2', kind:'compliance_due'    as const, title:'Compliance deadline',      body:'Q1 2025 QoS compliance report due in 7 days.',                  read:false, urgent:true,  link:'/portal/compliance', createdAt:'2025-03-22T08:00:00Z' },
      { id:'3', kind:'fee_due'           as const, title:'Invoice issued',           body:'Annual licence fee invoice issued — BWP 48,500.',               read:true,  urgent:false, link:'/portal/fees', createdAt:'2025-03-18T09:00:00Z' },
      { id:'4', kind:'application_update'as const, title:'Application approved!',    body:'APP-2024-0091: Your renewal application has been approved.',     read:true,  urgent:false, link:'/portal', createdAt:'2025-03-10T14:00:00Z' },
    ],
  })

  const complaints = complaintsPage?.data ?? []
  // const apps       = applications ?? []
  // This safely grabs the array regardless of the wrapper
  const apps = Array.isArray(applications) ? applications : (applications?.data ?? []);
  const notifs     = notifications ?? []
  const unread     = notifs.filter(n => !n.read).length

  // Dynamic stat cards
  const activeLicences  = apps.filter(a => a.status === 'approved').length
  const pendingApps     = apps.filter(a => a.status === 'submitted' || a.status === 'under_review').length
  const outstandingFees = PAYMENTS.length > 0 ? 'BWP 0' : 'BWP 0'
  const role = user?.role ?? 'public'
  const roleInfo = ROLE_LABELS[role] ?? ROLE_LABELS['public']

  const markRead = async (id: string) => {
    await notificationService.markRead(id).catch(() => {})
    refetchNotif()
  }

  const markAllRead = async () => {
    await notificationService.markAllRead().catch(() => {})
    toast.success('All notifications marked as read')
    refetchNotif()
  }

  const displayedApps = showAllApps ? apps : apps.slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-teal/15 via-transparent to-transparent" />
        <div className="container-page relative py-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={fadeUp} className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-teal/20 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-bocra-teal" />
                <span className="text-xs font-semibold text-bocra-teal">Verified account</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-heading text-3xl font-bold text-white">
                Welcome, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
              </motion.h1>
              <motion.div variants={fadeUp} className="mt-2 flex flex-wrap items-center gap-3">
                <span className={cn('rounded-full px-3 py-1 text-xs font-bold', roleInfo.badge)}>
                  {roleInfo.label}
                </span>
                <span className="text-sm text-slate-400">
                  {user?.email}
                </span>
              </motion.div>
            </motion.div>
            <div className="flex gap-3">
              <Link to="/portal/apply" className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
                <FileText className="h-4 w-4" /> New application
              </Link>
            </div>
          </div>

          {/* Account stat cards — dynamic */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Active licences',       value: activeLicences > 0 ? String(activeLicences) : '0',      sub: activeLicences > 0 ? 'Next renewal: Jan 2026' : 'No active licences', trend: activeLicences > 0 ? 'good' : null },
              { label: 'Pending applications',   value: String(pendingApps),                                    sub: pendingApps > 0 ? 'Under review' : 'None pending',                   trend: pendingApps > 0 ? 'urgent' : null },
              { label: 'Outstanding fees',       value: outstandingFees,                                        sub: 'All paid',                                                           trend: 'good'  },
              { label: 'Notifications',          value: String(unread),                                         sub: unread > 0 ? `${unread} unread` : 'All read',                        trend: unread > 0 ? 'urgent' : null },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                  {s.trend === 'urgent' && <span className="h-2 w-2 rounded-full bg-bocra-red animate-pulse" />}
                  {s.trend === 'good'   && <span className="h-2 w-2 rounded-full bg-bocra-teal" />}
                </div>
                <p className="font-heading text-2xl font-bold text-white">{s.value}</p>
                <p className={cn('mt-0.5 text-xs', s.trend === 'urgent' ? 'text-bocra-red' : s.trend === 'good' ? 'text-bocra-teal' : 'text-slate-400')}>
                  {s.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">

          {/* Services */}
          <InView>
            <motion.p variants={fadeUp} className="section-label">Available services</motion.p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map(s => (
                <motion.div key={s.key} variants={fadeUp}>
                  <Link to={s.to} className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-md">
                    <div className={cn('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl', s.bg)}>
                      <s.icon className={`h-5 w-5 text-${s.accent}`} />
                    </div>
                    <p className={`mb-1 text-sm font-bold text-slate-900 group-hover:text-${s.accent}`}>{s.title}</p>
                    <p className="flex-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
                    <div className={`mt-3 flex items-center gap-1 text-xs font-semibold text-${s.accent}`}>
                      Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </InView>

          {/* All my applications */}
          <InView>
            <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h2 className="font-heading text-base font-bold text-slate-900">My applications</h2>
                <span className="badge badge-muted">{apps.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Reference</th><th className="hidden sm:table-cell">Type</th><th className="hidden md:table-cell">Submitted</th><th className="hidden lg:table-cell">Stage</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {appsLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>
                        ))
                      : displayedApps.length === 0
                        ? (
                          <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                            No applications yet.{' '}
                            <Link to="/portal/apply" className="font-semibold text-bocra-teal hover:underline">Start your first →</Link>
                          </td></tr>
                        )
                        : displayedApps.map(app => (
                          <tr key={app.id}>
                            <td><span className="font-mono text-xs font-bold text-bocra-teal">{app.reference}</span></td>
                            <td className="hidden sm:table-cell capitalize">{app.category}</td>
                            <td className="hidden md:table-cell text-slate-500">{formatDate(app.submittedAt)}</td>
                            <td className="hidden lg:table-cell text-slate-600">{app.stage}</td>
                            <td><StatusBadge status={app.status as LicenceStatus} /></td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              {apps.length > 5 && (
                <div className="border-t border-slate-100 px-6 py-3 text-center">
                  <button onClick={() => setShowAllApps(v => !v)} className="text-xs font-semibold text-bocra-teal hover:underline">
                    {showAllApps ? 'Show less ↑' : `Show all ${apps.length} applications ↓`}
                  </button>
                </div>
              )}
            </motion.div>
          </InView>

          {/* My complaints */}
          {complaints.length > 0 && (
            <InView>
              <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h2 className="font-heading text-base font-bold text-slate-900">My complaints</h2>
                  <Link to="/complaints" className="text-xs font-semibold text-bocra-teal hover:underline">File new →</Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {complaints.slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-mono text-xs font-bold text-bocra-teal">{c.referenceNumber}</p>
                        <p className="text-sm font-medium text-slate-800">{c.providerName} · {formatCategory(c.category)}</p>
                        <p className="text-xs text-slate-400">{formatRelative(c.submittedAt)}</p>
                      </div>
                      <StatusBadge status={c.status as ComplaintStatus} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </InView>
          )}
        </div>

        {/* Sidebar */}
        <InView className="space-y-4">
          {/* Notifications — live from backend */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && <span className="badge badge-danger">{unread}</span>}
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-bocra-teal hover:underline">Mark all read</button>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {notifs.length === 0
                ? <p className="py-8 text-center text-sm text-slate-400">No notifications</p>
                : notifs.map(n => (
                  <div key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={cn('px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors', !n.read && 'bg-blue-50/40')}>
                    <div className="flex gap-3">
                      {n.urgent
                        ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-bocra-red" />
                        : <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-bocra-teal" />
                      }
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-xs font-bold', n.read ? 'text-slate-500' : 'text-slate-800')}>{n.title}</p>
                        <p className="text-xs leading-relaxed text-slate-600 mt-0.5">{n.body}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatRelative(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-bocra-teal shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))
              }
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div variants={fadeUp} className="rounded-2xl bg-bocra-navy p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-bocra-teal" />
              <h3 className="text-sm font-bold text-white">Account activity</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Active licences',   value: activeLicences > 0 ? String(activeLicences) : '0', icon: TrendingUp, color: 'text-bocra-teal'  },
                { label: 'Total applications',value: String(apps.length),                               icon: FileText,   color: 'text-bocra-gold'  },
                { label: 'Fees paid (2025)',  value: 'BWP 50,700',                                      icon: CreditCard, color: 'text-bocra-green' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon className={cn('h-3.5 w-3.5', s.color)} />
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                  <span className={cn('text-xs font-bold', s.color)}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment history */}
          <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-bold text-slate-900">Recent payments</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {PAYMENTS.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.desc}</p>
                    <p className="text-xs text-slate-400">{formatDate(p.date)}</p>
                  </div>
                  <span className="text-sm font-bold text-bocra-teal">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <Link to="/portal/fees" className="flex items-center gap-1.5 text-xs font-semibold text-bocra-teal hover:underline">
                <Download className="h-3.5 w-3.5" /> View all invoices
              </Link>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-bocra-teal/20 bg-bocra-teal/5 p-5">
            <h3 className="mb-1 text-sm font-bold text-slate-900">Dedicated support</h3>
            <p className="mb-3 text-xs text-slate-500">Mon–Fri, 07:30–17:00 CAT</p>
            <div className="space-y-1.5 text-sm">
              <a href="tel:+26739570000" className="flex items-center gap-2 text-bocra-teal hover:underline text-xs">📞 +267 395 7755</a>
              <a href="mailto:licensing@bocra.org.bw" className="flex items-center gap-2 text-bocra-teal hover:underline text-xs">✉ licensing@bocra.org.bw</a>
            </div>
          </motion.div>
        </InView>
      </div>
    </div>
  )
}