import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Info, CheckCircle, X, CreditCard } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/formatters'

const MOCK_INVOICES = [
  { ref: 'INV-2025-001', desc: 'Licence renewal fee', amount: 48500, date: '2025-01-15', status: 'Unpaid' },
  { ref: 'INV-2025-002', desc: 'Type approval fee', amount: 2200, date: '2024-11-20', status: 'Paid' },
  { ref: 'INV-2025-003', desc: 'Annual spectrum fee', amount: 15000, date: '2024-09-01', status: 'Unpaid' },
]

export default function RegulatoryFeesPage() {
  const [search, setSearch] = useState('')
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null)
  const [paidInvoices, setPaidInvoices] = useState<string[]>(MOCK_INVOICES.filter(i => i.status === 'Paid').map(i => i.ref))
  const [modalInvoice, setModalInvoice] = useState<typeof MOCK_INVOICES[0] | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const filteredInvoices = MOCK_INVOICES.filter(
    i =>
      i.ref.toLowerCase().includes(search.toLowerCase()) ||
      i.desc.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(i.date).includes(search)
  )

  const totalUnpaid = filteredInvoices
    .filter(i => !paidInvoices.includes(i.ref))
    .reduce((acc, i) => acc + i.amount, 0)

  const openPaymentModal = (inv: typeof MOCK_INVOICES[0]) => {
    setModalInvoice(inv)
    setPaymentSuccess(false)
  }

  const handlePayment = () => {
    if (!modalInvoice) return
    setProcessingPayment(true)
    setTimeout(() => {
      setPaidInvoices(prev => [...prev, modalInvoice.ref])
      setProcessingPayment(false)
      setPaymentSuccess(true)
    }, 2000) // simulate async gateway payment
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="container-page relative">
          <h1 className="font-heading text-3xl font-bold text-white">Regulatory fees & invoices</h1>
          <p className="mt-1 text-slate-400">View and pay your BOCRA invoices</p>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border-none bg-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bocra-blue text-sm"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map(inv => (
                <div key={inv.ref} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50">
                  <div>
                    <p className="text-sm text-slate-800">{inv.desc}</p>
                    <p className="text-xs text-slate-400">{formatDate(inv.date)} — {inv.ref}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${paidInvoices.includes(inv.ref) ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {formatCurrency(inv.amount)}
                    </span>
                    {!paidInvoices.includes(inv.ref) && (
                      <button
                        onClick={() => openPaymentModal(inv)}
                        className="rounded-xl bg-bocra-teal px-4 py-2 text-xs font-semibold text-white hover:bg-teal-600 transition-all"
                      >
                        Pay now
                      </button>
                    )}
                    {paidInvoices.includes(inv.ref) && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-500">No invoices found.</p>
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex justify-between font-semibold text-slate-900">
            <span>Total unpaid</span>
            <span>{formatCurrency(totalUnpaid)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <Info className="h-4 w-4 text-bocra-teal" />Need assistance?
            </p>
            <p className="text-xs text-slate-500">Mon–Fri, 07:30–17:00 CAT</p>
            <a href="tel:+26739570000" className="block text-xs text-bocra-teal hover:underline">+267 395 7755</a>
            <a href="mailto:licensing@bocra.org.bw" className="block text-xs text-bocra-teal hover:underline">licensing@bocra.org.bw</a>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {modalInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
            >
              {!paymentSuccess ? (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Pay Invoice</h2>
                  <p className="text-sm text-slate-700 mb-2">{modalInvoice.desc}</p>
                  <p className="text-sm text-slate-500 mb-4">{modalInvoice.ref} — {formatDate(modalInvoice.date)}</p>
                  <div className="mb-4 flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-200">
                    <span className="font-semibold text-slate-800">Amount</span>
                    <span className="font-bold text-bocra-teal">{formatCurrency(modalInvoice.amount)}</span>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={processingPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-bocra-teal px-6 py-3 text-white font-semibold hover:bg-teal-600 transition-all disabled:opacity-60"
                  >
                    {processingPayment ? 'Processing…' : <><CreditCard className="h-4 w-4" /> Confirm Payment</>}
                  </button>
                  <button
                    onClick={() => setModalInvoice(null)}
                    className="w-full mt-3 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-600" />
                  <p className="text-slate-900 font-semibold">Payment successful!</p>
                  <button
                    onClick={() => setModalInvoice(null)}
                    className="mt-2 w-full rounded-xl bg-bocra-teal px-6 py-3 text-white font-semibold hover:bg-teal-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}