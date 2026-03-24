import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ArrowLeft, CheckCircle, AlertCircle, CreditCard } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/utils/formatters'

type Invoice = {
  id: number
  ref: string
  desc: string
  amount: number
  due: string
  status: 'Pending' | 'Paid' | 'Overdue'
}

const INVOICES: Invoice[] = [
  { id: 1, ref: 'REG-2025-001', desc: 'Annual telecom regulatory fee', amount: 48500, due: '2025-04-30', status: 'Pending' },
  { id: 2, ref: 'REG-2025-002', desc: 'Spectrum usage fee', amount: 22000, due: '2025-06-15', status: 'Pending' },
  { id: 3, ref: 'REG-2024-010', desc: 'Other regulatory charges', amount: 15000, due: '2024-12-31', status: 'Paid' },
  { id: 4, ref: 'REG-2025-003', desc: 'Broadcast licence renewal', amount: 18000, due: '2025-03-15', status: 'Overdue' },
]

const STATUS_TABS = ['All', 'Pending', 'Paid', 'Overdue']

export default function RegulatoryFeesPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('All')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const filteredInvoices = tab === 'All' ? INVOICES : INVOICES.filter(i => i.status === tab)
  const toggleSelect = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const total = INVOICES.filter(i => selectedIds.includes(i.id)).reduce((acc, i) => acc + i.amount, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Regulatory fees & invoices</span>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Regulatory fees & invoices</h1>
              <p className="mt-1 text-slate-400">View your pending and paid fees, and complete payments securely.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* Main card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {STATUS_TABS.map(s => (
              <button key={s} onClick={() => setTab(s)} className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === s ? 'border-b-2 border-bocra-teal text-bocra-teal' : 'text-slate-500 hover:text-slate-700'}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {filteredInvoices.map(inv => {
                const selected = selectedIds.includes(inv.id)
                const statusColor = inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'

                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex items-center justify-between px-6 py-4 cursor-pointer ${selected ? 'bg-bocra-teal/10' : 'hover:bg-slate-50'}`}
                    onClick={() => inv.status === 'Pending' && toggleSelect(inv.id)}
                  >
                    <div className="flex flex-col">
                      <p className="text-sm text-slate-800">{inv.desc}</p>
                      <p className="text-xs text-slate-400">Ref: {inv.ref} | Due: {formatDate(inv.due)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`}>{inv.status}</span>
                      {inv.status === 'Pending' && <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amount)}</span>}
                      {inv.status !== 'Pending' && <span className="text-sm font-semibold text-slate-500">{formatCurrency(inv.amount)}</span>}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Total & Pay button */}
          {selectedIds.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-900">Total: {formatCurrency(total)}</span>
              <button className="rounded-xl bg-bocra-teal px-6 py-3 text-white font-bold hover:bg-teal-600">
                Pay Now
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-2"><Info className="h-4 w-4 text-bocra-teal" />Need assistance?</p>
            <p className="text-xs text-slate-500">Mon–Fri, 07:30–17:00 CAT</p>
            <a href="tel:+26739570000" className="block text-xs text-bocra-teal hover:underline">+267 395 7755</a>
            <a href="mailto:licensing@bocra.org.bw" className="block text-xs text-bocra-teal hover:underline">licensing@bocra.org.bw</a>
          </div>
        </div>
      </div>
    </div>
  )
}