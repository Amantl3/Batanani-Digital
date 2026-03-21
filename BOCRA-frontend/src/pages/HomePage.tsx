import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Search, Shield, FileText, Globe, Lock, Zap, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const STATS = [
  { key: 'licensees',    value: '1,248' },
  { key: 'resolved',     value: '3,891' },
  { key: 'uptime',       value: '98.2%' },
  { key: 'consultations',value: '14'    },
]

const TILES = [
  { icon: FileText, key: 'apply_licence',   to: '/licensing',   bg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
  { icon: Shield,   key: 'file_complaint',  to: '/complaints',  bg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { icon: FileText, key: 'publications',    to: '/publications',bg: 'bg-emerald-50',iconColor: 'text-emerald-600'},
  { icon: Globe,    key: 'domain',          to: '/portal',      bg: 'bg-purple-50', iconColor: 'text-purple-600' },
  { icon: Lock,     key: 'cyber',           to: '/publications',bg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
  { icon: Zap,      key: 'portal',          to: '/portal',      bg: 'bg-cyan-50',   iconColor: 'text-cyan-600'   },
]

const NEWS = [
  { tag: 'Consultation open', tagClass: 'badge-info',    headline: 'Draft Cybersecurity Policy for Electronic Communications Networks — call for comments', date: '18 Mar 2025 · Closes 15 Apr 2025' },
  { tag: 'Consumer alert',    tagClass: 'badge-warning', headline: 'Warning issued against unlicensed VOIP providers operating in Botswana', date: '15 Mar 2025' },
  { tag: 'Announcement',      tagClass: 'badge-success', headline: 'BOCRA publishes revised Type Approval guidelines for mobile devices and accessories', date: '12 Mar 2025' },
  { tag: 'Announcement',      tagClass: 'badge-success', headline: 'Q4 2024 market monitoring and competition report now available', date: '28 Feb 2025' },
]

const SERVICES = [
  { name: 'Licensing portal',     status: 'operational' },
  { name: 'Complaints system',    status: 'operational' },
  { name: 'Domain registry (.bw)',status: 'maintenance' },
  { name: 'e-Payment gateway',    status: 'operational' },
  { name: 'CSIRT advisory feed',  status: 'operational' },
]

const statusDot: Record<string, string> = {
  operational: 'status-dot-up',
  maintenance: 'status-dot-maint',
  degraded:    'status-dot-degraded',
  down:        'status-dot-down',
}
const statusBadge: Record<string, string> = {
  operational: 'badge-success',
  maintenance: 'badge-info',
  degraded:    'badge-warning',
  down:        'badge-danger',
}

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-bocra-navy pb-0 pt-12">
        <div className="bg-grid absolute inset-0" />
        <div className="container-page relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-bocra-cyan/30 bg-bocra-cyan/10 px-3 py-1 text-xs font-medium text-bocra-cyan">
              <span className="status-dot-up" /> {t('home.badge')}
            </span>
            <h1 className="mb-4 font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {t('home.hero_title_1')}<br />
              <span className="text-bocra-cyan">{t('home.hero_title_2')}</span>
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300">
              {t('home.hero_sub')}
            </p>

            {/* Search */}
            <div className="mb-10 flex max-w-lg overflow-hidden rounded-xl bg-white">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="search"
                  placeholder={t('home.search_placeholder')}
                  className="flex-1 border-none bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button className="btn-primary m-1.5 rounded-lg px-5">
                {t('home.search_btn')}
              </button>
            </div>
          </motion.div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.key} className="border-r border-white/10 px-0 py-5 pr-6 last:border-r-0">
                <p className="font-heading text-2xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-xs text-white/50">{t(`home.stats.${s.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick access tiles ────────────────────────────────────── */}
      <section className="bg-white py-8">
        <div className="container-page">
          <p className="section-label">{t('home.quick_access')}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {TILES.map((tile, i) => (
              <motion.div
                key={tile.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={tile.to}
                  className="card group flex flex-col items-center p-4 text-center transition-all hover:-translate-y-1 hover:border-bocra-blue/30"
                >
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tile.bg}`}>
                    <tile.icon className={`h-5 w-5 ${tile.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-800">{t(`home.tiles.${tile.key}`)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t(`home.tiles.${tile.key}_sub`)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── News + Sidebar ────────────────────────────────────────── */}
      <section className="py-8">
        <div className="container-page grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* News feed */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{t('home.latest_news')}</h2>
              <Link to="/publications" className="text-sm text-bocra-blue hover:underline">
                {t('home.view_all')}
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {NEWS.map((n, i) => (
                <div key={i} className="flex gap-3 px-6 py-4">
                  <span className={`badge mt-0.5 shrink-0 ${n.tagClass}`}>{n.tag}</span>
                  <div>
                    <p className="cursor-pointer text-sm font-medium text-slate-800 hover:text-bocra-blue">
                      {n.headline}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{n.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* System status */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-slate-900">{t('home.system_status')}</h3>
              </div>
              <div className="divide-y divide-slate-100 px-6">
                {SERVICES.map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-700">{s.name}</span>
                    <span className={`badge ${statusBadge[s.status]}`}>
                      <span className={statusDot[s.status]} />
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaint guide */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-slate-900">{t('home.how_to_complain')}</h3>
              </div>
              <div className="card-body space-y-3">
                {[
                  'Contact your service provider first and allow 14 days to resolve.',
                  'If unresolved, submit your complaint via our online form.',
                  'Track your complaint status with your reference number.',
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bocra-blue text-xs font-semibold text-white">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{step}</p>
                  </div>
                ))}
                <Link to="/complaints" className="btn-primary mt-2 w-full justify-center">
                  {t('home.file_complaint')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
