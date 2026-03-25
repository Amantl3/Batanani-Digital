import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Info, Search, ArrowLeft } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'

const PAYMENT_HISTORY = [
  { desc: 'Licence renewal fee',  amount: 48500, date: '2025-01-15' },
  { desc: 'Type approval fee',    amount: 2200,  date: '2024-11-20' },
  { desc: 'Annual spectrum fee',  amount: 15000, date: '2024-09-01' },
]

export default function PaymentHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filteredPayments = PAYMENT_HISTORY.filter(p =>
    p.desc.toLowerCase().includes(search.toLowerCase()) ||
    formatDate(p.date).includes(search)
  )

  const total = filteredPayments.reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header with back arrow */}
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="container-page relative">
          {/* Breadcrumb */}
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Payment history</span>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-3xl font-bold text-white">Payment history</h1>
              <p className="mt-1 text-slate-400">All payments made to BOCRA</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        {/* Payment Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {/* Search */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border-none bg-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bocra-blue text-sm"
            />
          </div>

          {/* Payments List */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            <AnimatePresence>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                  >
                    <div>
                      <p className="text-sm text-slate-800">{p.desc}</p>
                      <p className="text-xs text-slate-400">{formatDate(p.date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">{formatCurrency(p.amount)}</span>
                  </motion.div>
                ))
              ) : (
                <p className="p-6 text-sm text-slate-500">No payments found.</p>
              )}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="card-header flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Bell className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            </div>
            <div className="p-4 text-sm text-slate-500">
              <p>No new notifications</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <Info className="h-4 w-4 text-bocra-teal" />
              Need assistance?
            </p>
            <p className="text-xs text-slate-500">Mon–Fri, 07:30–17:00 CAT</p>
            <a href="tel:+26739570000" className="block text-xs text-bocra-teal hover:underline">+267 395 7755</a>
            <a href="mailto:licensing@bocra.org.bw" className="block text-xs text-bocra-teal hover:underline">licensing@bocra.org.bw</a>
          </div>
        </div>
      </div>
    </div>
  )
}