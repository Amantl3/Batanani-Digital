import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, RefreshCw, CreditCard, BarChart2, Globe, CheckSquare, ChevronRight,
  Bell, AlertCircle, Clock, X, ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useMyApplications } from '@/hooks/useLicences'
import { useMyComplaints } from '@/hooks/useComplaints'
import StatusBadge from '@/components/shared/StatusBadge'
import AccountSettingsPage from '@/pages/portal/AccountSettingsPage'
import { formatDate, formatRelative, formatCurrency, formatCategory } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { LicenceStatus, ComplaintStatus, UserRole, Licence } from '@/types'

const SERVICES = [
  { icon: FileText, key: 'apply', to: '/portal/apply', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: RefreshCw, key: 'renew', to: '/portal/renew', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: CreditCard, key: 'pay', to: '/portal/pay', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { icon: BarChart2, key: 'compliance', to: '/portal/compliance', bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { icon: Globe, key: 'domain', to: '/portal/DomainRegistration', bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { icon: CheckSquare, key: 'type_approval', to: '/portal/type-approval', bg: 'bg-red-50', iconColor: 'text-red-600' },
]

const PAYMENT_HISTORY = [
  { desc: 'Licence renewal fee', amount: 48500, date: '2025-01-15' },
  { desc: 'Type approval fee',   amount: 2200,  date: '2024-11-20' },
  { desc: 'Annual spectrum fee', amount: 15000, date: '2024-09-01' },
]

const ROLE_LABELS: Record<UserRole, { label: string; badge: string }> = {
  admin:    { label: 'System administrator', badge: 'bg-red-100 text-red-700' },
  officer:  { label: 'BOCRA officer',        badge: 'bg-amber-100 text-amber-700' },
  licensee: { label: 'Licensed operator',    badge: 'bg-teal-100 text-teal-700' },
  public:   { label: 'Registered member',    badge: 'bg-emerald-100 text-emerald-700' },
}



export default function PortalPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [showAllApps, setShowAllApps] = useState(false)

  // Data fetching
  const { data: applicationsPage, isLoading: appsLoading } = useMyApplications()
  const { data: complaintsPage } = useMyComplaints()

  // Safe data extraction – prevents "filter is not a function" error
  const appList: Licence[] = useMemo(() => {
    const page = applicationsPage as any
    if (Array.isArray(page)) return page
    if (Array.isArray(page?.data)) return page.data
    if (Array.isArray(page?.applications)) return page.applications
    return []
  }, [applicationsPage])

  const complaints = Array.isArray(complaintsPage?.data) ? complaintsPage.data : []

  // Role info
  const role = (user?.role as UserRole) ?? 'public'
  const roleInfo = ROLE_LABELS[role] ?? ROLE_LABELS.public

  // Stats (safe)
  const activeLicences = appList.filter(a => (a.status as string) === 'active' || (a.status as string) === 'approved').length
  const pendingApps = appList.filter(a => 
    (a.status as string) === 'pending' || (a.status as string) === 'submitted' || (a.status as string) === 'under_review'
  ).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section with Role Badge */}
      <section className="bg-bocra-navy px-6 py-8">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">Self-service portal</p>
              <h1 className="font-heading text-2xl font-bold text-white">
                {t('portal.welcome', { name: user?.fullName?.split(' ')[0] ?? 'there' })}
              </h1>

              {/* Role badge under the name – as you requested */}
              <div className="mt-1 flex items-center gap-3">
                <span className={cn('rounded-full px-3 py-1 text-xs font-bold', roleInfo.badge)}>
                  {roleInfo.label}
                </span>
                <span className="text-sm text-slate-400">{user?.email}</span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {t('portal.account_no', { no: 'ACC-2024-0091' })}
              </p>
            </div>

            <div className="flex gap-3">
              <Link to="/portal/apply" className="btn-cyan btn-sm">
                {t('portal.start_app')}
              </Link>
              <button
                onClick={() => setShowAccountSettings(true)}
                className="btn-sm rounded-lg border border-white/20 px-4 text-white/80 hover:border-white/40"
              >
                {t('portal.account_settings')}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t('portal.cards.licences'), value: String(activeLicences), delta: activeLicences > 0 ? 'Next renewal: Jan 2029' : 'No active licences', deltaColor: 'text-slate-400' },
              { label: t('portal.cards.pending'), value: String(pendingApps), delta: pendingApps > 0 ? 'Action required' : 'None pending', deltaColor: pendingApps > 0 ? 'text-red-400' : 'text-slate-400' },
              { label: t('portal.cards.fees'), value: 'BWP 0', delta: 'All paid', deltaColor: 'text-emerald-400' },
              { label: t('portal.cards.compliance'), value: '3 / 4', delta: '1 overdue', deltaColor: 'text-red-400' },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{c.label}</p>
                <p className="mt-1.5 font-heading text-2xl font-bold text-white">{c.value}</p>
                <p className={cn('mt-0.5 text-xs', c.deltaColor)}>{c.delta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main + Sidebar */}
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Service tiles */}
          <div>
            <p className="section-label">Available services</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map(s => (
                <Link
                  key={s.key}
                  to={s.to}
                  className="card group flex items-start gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', s.bg)}>
                    <s.icon className={cn('h-5 w-5', s.iconColor)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-bocra-blue">
                      {t(`portal.services.${s.key}`)}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {t(`portal.services.${s.key}_sub`)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-bocra-blue" />
                </Link>
              ))}
            </div>
          </div>

          {/* Applications table – KEPT EXACTLY AS IN YOUR WORKING CODE */}
          <div className="card">
            {/*<div className="card-header flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{t('portal.apps_table.title')}</h2>
              <Link to="/portal/applications" className="text-xs text-bocra-blue hover:underline">View all →</Link>
            </div>*/}
            <div className="card-header flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{t('portal.apps_table.title')}</h2>
              <button
                onClick={() => setShowAllApps(true)}
                className="text-xs text-bocra-blue hover:underline flex items-center gap-1"
              >
                View all →
              </button>
            </div>            
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('portal.apps_table.ref')}</th>
                    <th className="hidden sm:table-cell">{t('portal.apps_table.type')}</th>
                    <th className="hidden md:table-cell">{t('portal.apps_table.submitted')}</th>
                    <th className="hidden lg:table-cell">{t('portal.apps_table.stage')}</th>
                    <th>{t('portal.apps_table.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {appsLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j}><div className="h-4 w-full animate-pulse rounded bg-slate-100" /></td>
                          ))}
                        </tr>
                      ))
                    : appList.length === 0
                      ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-slate-400">
                            No applications yet.{' '}
                            <Link to="/portal/apply" className="text-bocra-blue hover:underline">
                              Start your first application →
                            </Link>
                          </td>
                        </tr>
                      )
                      : appList.map(app => (
                          <tr key={app.id}>
                            <td className="font-mono text-xs font-semibold text-bocra-blue">
                              {app.licenceNumber ?? app.id}
                            </td>
                            <td className="hidden sm:table-cell">{formatCategory(app.category as any)}</td>
                            <td className="hidden md:table-cell text-slate-500">{formatDate(app.issuedAt)}</td>
                            <td className="hidden lg:table-cell text-slate-600">{app.status}</td>
                            <td><StatusBadge status={app.status as LicenceStatus} /></td>
                          </tr>
                        ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Complaints – kept as is */}
          {complaints.length > 0 && (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">My complaints</h2>
                <Link to="/complaints" className="text-xs text-bocra-blue hover:underline">File new →</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {complaints.slice(0, 3).map(c => (
                  <div key={c.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-bocra-blue">{c.referenceNumber}</p>
                      <p className="text-sm text-slate-700">{c.providerName} · {formatCategory(c.category as any)}</p>
                      <p className="text-xs text-slate-400">{formatRelative(c.submittedAt)}</p>
                    </div>
                    <StatusBadge status={c.status as ComplaintStatus} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Notifications */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">{t('portal.notifications')}</h3>
              </div>
            </div>
            <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
              {/* You can enhance this later with real API data */}
              <div className="px-4 py-8 text-center text-sm text-slate-400">No new notifications at the moment</div>
            </div>
          </div>

          {/* Payment history */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('portal.payment_history')}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {PAYMENT_HISTORY.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-800">{p.desc}</p>
                    <p className="text-xs text-slate-400">{formatDate(p.date)}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="card-footer text-center">
              <Link to="/portal/payment-history" className="text-xs text-bocra-blue hover:underline">
                {t('portal.view_payments')}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-900">{t('portal.support_title')}</h3>
              <p className="mt-1 text-xs text-slate-500">{t('portal.support_hours')}</p>
            </div>
            <div className="card-body space-y-2 text-sm">
              <a href="tel:+26739570000" className="flex items-center gap-2 text-bocra-blue hover:underline">
                +267 395 7755
              </a>
              <a href="mailto:licensing@bocra.org.bw" className="flex items-center gap-2 text-bocra-blue hover:underline">
                ✉️ licensing@bocra.org.bw
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
              <button
                onClick={() => setShowAccountSettings(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <AccountSettingsPage />
            </div>
          </div>
        </div>
      )}
      {/* All Applications Modal */}
      {showAllApps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('portal.apps_table.title')} 
                  <span className="ml-2 text-sm font-normal text-slate-500">({appList.length} total)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">All your licence applications</p>
              </div>
              <button
                onClick={() => setShowAllApps(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-auto max-h-[calc(90vh-130px)] p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>{t('portal.apps_table.ref')}</th>
                      <th className="hidden sm:table-cell">{t('portal.apps_table.type')}</th>
                      <th className="hidden md:table-cell">{t('portal.apps_table.submitted')}</th>
                      <th className="hidden lg:table-cell">{t('portal.apps_table.stage')}</th>
                      <th>{t('portal.apps_table.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                          No applications found.
                        </td>
                      </tr>
                    ) : (
                      appList.map((app: any) => (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="font-mono text-xs font-semibold text-bocra-blue">
                            {app.licenceNumber ?? app.reference ?? app.id}
                          </td>
                          <td className="hidden sm:table-cell">{formatCategory(app.category as any)}</td>
                          <td className="hidden md:table-cell text-slate-500">
                            {formatDate(app.issuedAt || app.submittedAt)}
                          </td>
                          <td className="hidden lg:table-cell text-slate-600">{app.stage || app.status}</td>
                          <td>
                            <StatusBadge status={app.status as LicenceStatus} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowAllApps(false)}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}