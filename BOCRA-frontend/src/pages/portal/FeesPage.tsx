import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, Download, CheckCircle, Clock, AlertCircle, ArrowLeft, FileText, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

const INVOICES = [
  { id: 'INV-2025-0041', desc: 'Annual licence fee — Telecom Category',   amount: 48500, due: '2025-04-01', issued: '2025-03-01', status: 'outstanding', period: '2025/26' },
  { id: 'INV-2025-0028', desc: 'Spectrum utilisation fee — H1 2025',      amount: 12400, due: '2025-04-15', issued: '2025-03-10', status: 'outstanding', period: 'H1 2025' },
  { id: 'INV-2024-0187', desc: 'Annual licence fee — Telecom Category',   amount: 46000, due: '2024-04-01', issued: '2024-03-01', status: 'paid',        period: '2024/25' },
  { id: 'INV-2024-0153', desc: 'Type approval fee — 3 device types',      amount: 7500,  due: '2024-02-28', issued: '2024-02-01', status: 'paid',        period: 'FY 2024' },
  { id: 'INV-2024-0092', desc: 'Licence amendment fee',                   amount: 2200,  due: '2024-01-15', issued: '2023-12-20', status: 'paid',        period: 'FY 2024' },
  { id: 'INV-2023-0311', desc: 'Annual licence fee — Telecom Category',   amount: 44000, due: '2023-04-01', issued: '2023-03-01', status: 'paid',        period: '2023/24' },
]

const FEE_SCHEDULE = [
  { category: 'Telecommunications licence',   annual: 'BWP 44,000 – 200,000',  note: 'Based on revenue tier' },
  { category: 'Internet service provider',    annual: 'BWP 20,000 – 80,000',   note: 'Based on subscriber base' },
  { category: 'Broadcasting licence',         annual: 'BWP 15,000 – 120,000',  note: 'Free-to-air vs pay TV' },
  { category: 'Postal / courier service',     annual: 'BWP 5,000 – 30,000',    note: 'Based on coverage area' },
  { category: 'Type approval (per device)',   annual: 'BWP 2,500',             note: 'One-time per device model' },
  { category: 'Spectrum utilisation fee',     annual: 'BWP 8,000 – 50,000',    note: 'Based on bandwidth & region' },
  { category: 'Domain registration (.co.bw)', annual: 'BWP 200',               note: 'Per domain per year' },
  { category: 'Licence amendment fee',        annual: 'BWP 2,200',             note: 'Per amendment request' },
]

const STATUS_STYLE: Record<string, { badge: string; icon: React.ElementType }> = {
  outstanding: { badge: 'badge-warning', icon: Clock        },
  paid:        { badge: 'badge-success', icon: CheckCircle  },
  overdue:     { badge: 'badge-danger',  icon: AlertCircle  },
}

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'schedule'>('invoices')

  const outstanding = INVOICES.filter(i => i.status === 'outstanding')
  const totalOwed   = outstanding.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-gold/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Regulatory fees</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link to="/portal" className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-gold/20 px-3 py-1"><CreditCard className="h-3.5 w-3.5 text-bocra-gold" /><span className="text-xs font-semibold text-bocra-gold">Regulatory fees</span></div>
                <h1 className="font-heading text-3xl font-bold text-white">Fees & invoices</h1>
                <p className="mt-1 text-slate-400">View your invoices, payment history, and the BOCRA fee schedule</p>
              </div>
            </div>
            {totalOwed > 0 && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-xs font-semibold text-amber-300">Total outstanding</p>
                <p className="font-heading text-2xl font-bold text-white">{formatCurrency(totalOwed)}</p>
                <Link to="/portal/pay" className="mt-2 flex items-center gap-1.5 text-xs font-bold text-bocra-gold hover:underline">Pay now <ChevronRight className="h-3 w-3" /></Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Outstanding alert */}
        {outstanding.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">{outstanding.length} outstanding invoice{outstanding.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-amber-700">Total due: {formatCurrency(totalOwed)}</p>
              </div>
            </div>
            <Link to="/portal/pay" className="flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors">
              <CreditCard className="h-4 w-4" /> Pay outstanding fees
            </Link>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-card w-fit">
          {[{ key: 'invoices', label: 'My invoices' }, { key: 'schedule', label: 'Fee schedule' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as 'invoices' | 'schedule')}
              className={cn('rounded-lg px-5 py-2 text-sm font-semibold transition-all', activeTab === t.key ? 'bg-bocra-navy text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Invoices tab */}
        {activeTab === 'invoices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-heading text-base font-bold text-slate-900">Invoice history</h2>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-bocra-teal hover:underline">
                <Download className="h-3.5 w-3.5" /> Download all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Invoice no.</th><th>Description</th><th className="hidden md:table-cell">Period</th><th className="hidden lg:table-cell">Due date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {INVOICES.map(inv => {
                    const s = STATUS_STYLE[inv.status]
                    const Icon = s.icon
                    return (
                      <tr key={inv.id}>
                        <td><span className="font-mono text-xs font-bold text-bocra-teal">{inv.id}</span></td>
                        <td className="max-w-[200px]"><p className="truncate text-sm text-slate-800">{inv.desc}</p></td>
                        <td className="hidden md:table-cell text-slate-500 text-xs">{inv.period}</td>
                        <td className="hidden lg:table-cell text-slate-500">{formatDate(inv.due)}</td>
                        <td><span className="font-semibold text-slate-900">{formatCurrency(inv.amount)}</span></td>
                        <td>
                          <span className={cn('badge', s.badge)}>
                            <Icon className="h-3 w-3" /> {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 text-xs font-medium text-bocra-teal hover:underline">
                              <FileText className="h-3 w-3" /> PDF
                            </button>
                            {inv.status === 'outstanding' && (
                              <Link to="/portal/pay" className="flex items-center gap-1 text-xs font-bold text-bocra-navy hover:underline">
                                Pay <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Fee schedule tab */}
        {activeTab === 'schedule' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-heading text-base font-bold text-slate-900">BOCRA fee schedule 2025/26</h2>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-bocra-teal hover:underline"><Download className="h-3.5 w-3.5" /> Download gazette</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Licence / service category</th><th>Annual fee</th><th className="hidden md:table-cell">Notes</th></tr></thead>
                <tbody>
                  {FEE_SCHEDULE.map(f => (
                    <tr key={f.category}>
                      <td className="font-medium">{f.category}</td>
                      <td><span className="font-semibold text-bocra-teal">{f.annual}</span></td>
                      <td className="hidden md:table-cell text-slate-500 text-xs">{f.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-500">Fees are gazetted annually. The above rates are effective from 1 April 2025. Fees are subject to revision by BOCRA with 30 days' notice.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}