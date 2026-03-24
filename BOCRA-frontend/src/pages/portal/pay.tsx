import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Smartphone, Building2, CheckCircle,
  Lock, ArrowLeft, ChevronRight, Info, ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

// ── Payment methods ───────────────────────────────────────────────────────────
type PayMethod = 'card' | 'mobile_money' | 'eft'

const PAY_METHODS: { key: PayMethod; label: string; sub: string; icon: React.ElementType; badge?: string }[] = [
  { key: 'card',         label: 'Debit / credit card',   sub: 'Visa, Mastercard',              icon: CreditCard, badge: 'Instant' },
  { key: 'mobile_money', label: 'Mobile money',           sub: 'Orange Money · MyZaka · Smega', icon: Smartphone, badge: 'Instant' },
  { key: 'eft',          label: 'EFT / bank transfer',    sub: 'FNB, Stanbic, BancABC, ABSA',   icon: Building2   },
]

// ── Outstanding invoices (would come from API in production) ──────────────────
const OUTSTANDING = [
  { id: 'INV-2025-0041', desc: 'Annual licence fee 2025/26', amount: 48500 },
  { id: 'INV-2025-0028', desc: 'Spectrum utilisation fee H1 2025', amount: 12400 },
]

// ── Card form schema ──────────────────────────────────────────────────────────
const cardSchema = z.object({
  cardName:   z.string().min(2, 'Name as on card is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Must be 16 digits'),
  expiry:     z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY'),
  cvv:        z.string().regex(/^\d{3,4}$/, '3 or 4 digits'),
})

// ── Mobile money schema ───────────────────────────────────────────────────────
const mobileSchema = z.object({
  mobileProvider: z.string().min(1, 'Select a provider'),
  mobileNumber:   z.string().min(7, 'Valid mobile number required'),
})

type CardData   = z.infer<typeof cardSchema>
type MobileData = z.infer<typeof mobileSchema>

const MOBILE_PROVIDERS = ['Orange Money', 'MyZaka (FNB)', 'Smega (BancABC)']

export default function PaymentPage() {
  const navigate = useNavigate()
  const [method,    setMethod]    = useState<PayMethod>('card')
  const [selected,  setSelected]  = useState<string[]>(OUTSTANDING.map(i => i.id))
  const [step,      setStep]      = useState<'select' | 'pay' | 'success'>('select')
  const [processing,setProcessing]= useState(false)

  const cardForm   = useForm<CardData>({   resolver: zodResolver(cardSchema)   })
  const mobileForm = useForm<MobileData>({ resolver: zodResolver(mobileSchema) })

  const total = OUTSTANDING.filter(i => selected.includes(i.id)).reduce((s, i) => s + i.amount, 0)
  const toggleInvoice = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  // ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
  // POST /api/v1/payments/initiate
  // Body: { method, invoiceIds: string[], amount: number, ...paymentDetails }
  //
  // For card payments → integrates with FNB DPO / Stanbic payment gateway
  //   Response: { redirectUrl } — redirect user to 3D Secure page
  //
  // For mobile money → sends USSD push to customer's phone
  //   Response: { transactionId, message: "Check your phone for payment prompt" }
  //
  // For EFT → returns bank account details for manual transfer
  //   Response: { accountName, accountNumber, branchCode, reference }
  //
  // After payment gateway callback:
  // POST /api/v1/payments/verify  { transactionId }
  // → backend verifies with payment provider, updates invoice status to 'paid'
  const handlePay = async (_data: CardData | MobileData | object) => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 2000)) // replace with real gateway call
    setProcessing(false)
    setStep('success')
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg text-center">
          <div className="bg-bocra-teal p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">Payment successful!</h1>
            <p className="mt-2 text-sm text-white/80">Your regulatory fees have been paid</p>
          </div>
          <div className="p-8">
            <div className="mb-6 rounded-xl bg-slate-50 p-4 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Amount paid</span><span className="font-bold text-bocra-teal">{formatCurrency(total)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Method</span><span className="font-medium capitalize">{method.replace('_', ' ')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Reference</span><span className="font-mono font-medium">PAY-{Date.now().toString().slice(-8)}</span></div>
            </div>
            <p className="mb-6 text-sm text-slate-500">A receipt has been emailed to you. Your licence status has been updated.</p>
            <div className="flex flex-col gap-2">
              <Link to="/portal" className="flex items-center justify-center gap-2 rounded-xl bg-bocra-navy px-6 py-3 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors">Go to my portal</Link>
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Print receipt</button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-teal/15 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link><span className="breadcrumb-sep">/</span>
            <Link to="/portal" className="breadcrumb-link">My Portal</Link><span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Pay fees</span>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"><ArrowLeft className="h-5 w-5" /></button>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bocra-teal/20 px-3 py-1"><Lock className="h-3.5 w-3.5 text-bocra-teal" /><span className="text-xs font-semibold text-bocra-teal">Secure payment</span></div>
              <h1 className="font-heading text-3xl font-bold text-white">Pay regulatory fees</h1>
              <p className="mt-1 text-slate-400">Pay your outstanding BOCRA invoices securely online</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <AnimatePresence mode="wait">

            {/* Step 1 — Select invoices */}
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
                <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="border-b border-slate-100 bg-bocra-navy px-6 py-4"><h2 className="font-heading text-base font-bold text-white">Select invoices to pay</h2></div>
                  <div className="divide-y divide-slate-100">
                    {OUTSTANDING.map(inv => (
                      <label key={inv.id} className="flex cursor-pointer items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                        <input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleInvoice(inv.id)} className="h-5 w-5 rounded accent-bocra-teal" />
                        <div className="flex-1">
                          <p className="font-mono text-xs font-bold text-bocra-teal">{inv.id}</p>
                          <p className="text-sm font-medium text-slate-800">{inv.desc}</p>
                        </div>
                        <span className="font-heading text-lg font-bold text-slate-900">{formatCurrency(inv.amount)}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <span className="text-sm font-semibold text-slate-600">Total selected</span>
                    <span className="font-heading text-2xl font-bold text-bocra-navy">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Payment method selector */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="border-b border-slate-100 bg-bocra-navy px-6 py-4"><h2 className="font-heading text-base font-bold text-white">Choose payment method</h2></div>
                  <div className="p-5 space-y-3">
                    {PAY_METHODS.map(pm => (
                      <button key={pm.key} type="button" onClick={() => setMethod(pm.key)}
                        className={cn('flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all', method === pm.key ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300')}>
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', method === pm.key ? 'bg-bocra-teal text-white' : 'bg-slate-100 text-slate-600')}>
                          <pm.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{pm.label}</p>
                          <p className="text-xs text-slate-500">{pm.sub}</p>
                        </div>
                        {pm.badge && <span className="badge badge-success">{pm.badge}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button disabled={selected.length === 0 || total === 0} onClick={() => setStep('pay')}
                    className="flex items-center gap-2 rounded-xl bg-bocra-teal px-8 py-3.5 text-sm font-bold text-white hover:bg-teal-600 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                    Proceed to payment <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Enter payment details */}
            {step === 'pay' && (
              <motion.div key="pay" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
                <button onClick={() => setStep('select')} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-bocra-teal transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Back to invoice selection
                </button>

                <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                  <div className="flex items-center gap-3 border-b border-slate-100 bg-bocra-navy px-6 py-4">
                    {(() => { const m = PAY_METHODS.find(p => p.key === method); return m ? <m.icon className="h-5 w-5 text-bocra-teal" /> : null })()}
                    <h2 className="font-heading text-base font-bold text-white">
                      {PAY_METHODS.find(p => p.key === method)?.label} payment
                    </h2>
                  </div>
                  <div className="p-6">

                    {/* Card payment form */}
                    {method === 'card' && (
                      <form onSubmit={cardForm.handleSubmit(handlePay)} className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                          <Lock className="h-4 w-4 text-blue-600 shrink-0" />
                          <p className="text-xs text-blue-800">Your card details are encrypted with TLS 1.3. BOCRA does not store card numbers.</p>
                        </div>
                        <div><label className="form-label">Name on card *</label><input type="text" autoComplete="cc-name" placeholder="As printed on your card" className={cn('form-input', cardForm.formState.errors.cardName && 'border-red-400')} {...cardForm.register('cardName')} />{cardForm.formState.errors.cardName && <p className="form-error">{cardForm.formState.errors.cardName.message}</p>}</div>
                        <div><label className="form-label">Card number *</label><input type="text" inputMode="numeric" maxLength={16} autoComplete="cc-number" placeholder="1234 5678 9012 3456" className={cn('form-input font-mono tracking-wider', cardForm.formState.errors.cardNumber && 'border-red-400')} {...cardForm.register('cardNumber')} />{cardForm.formState.errors.cardNumber && <p className="form-error">{cardForm.formState.errors.cardNumber.message}</p>}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="form-label">Expiry date *</label><input type="text" placeholder="MM/YY" maxLength={5} autoComplete="cc-exp" className={cn('form-input font-mono', cardForm.formState.errors.expiry && 'border-red-400')} {...cardForm.register('expiry')} />{cardForm.formState.errors.expiry && <p className="form-error">{cardForm.formState.errors.expiry.message}</p>}</div>
                          <div><label className="form-label">CVV *</label><input type="text" inputMode="numeric" maxLength={4} autoComplete="cc-csc" placeholder="•••" className={cn('form-input font-mono tracking-widest', cardForm.formState.errors.cvv && 'border-red-400')} {...cardForm.register('cvv')} />{cardForm.formState.errors.cvv && <p className="form-error">{cardForm.formState.errors.cvv.message}</p>}</div>
                        </div>
                        <button type="submit" disabled={processing}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-bocra-teal py-4 text-sm font-bold text-white hover:bg-teal-600 transition-all disabled:opacity-60">
                          {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Processing…</> : <><Lock className="h-4 w-4" />Pay {formatCurrency(total)} securely</>}
                        </button>
                      </form>
                    )}

                    {/* Mobile money form */}
                    {method === 'mobile_money' && (
                      <form onSubmit={mobileForm.handleSubmit(handlePay)} className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3"><Info className="h-4 w-4 text-blue-600 shrink-0" /><p className="text-xs text-blue-800">You will receive a payment prompt on your phone. Approve it within 2 minutes to complete payment.</p></div>
                        <div><label className="form-label">Mobile money provider *</label>
                          <div className="space-y-2">{MOBILE_PROVIDERS.map(p => (
                            <label key={p} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all', mobileForm.watch('mobileProvider') === p ? 'border-bocra-teal bg-bocra-teal/5' : 'border-slate-200 hover:border-slate-300')}>
                              <input type="radio" value={p} className="accent-bocra-teal" {...mobileForm.register('mobileProvider')} />
                              <span className="text-sm font-medium text-slate-700">{p}</span>
                            </label>
                          ))}</div>
                          {mobileForm.formState.errors.mobileProvider && <p className="form-error">{mobileForm.formState.errors.mobileProvider.message}</p>}
                        </div>
                        <div><label className="form-label">Mobile number *</label><input type="tel" placeholder="+267 7X XXX XXX" className={cn('form-input', mobileForm.formState.errors.mobileNumber && 'border-red-400')} {...mobileForm.register('mobileNumber')} />{mobileForm.formState.errors.mobileNumber && <p className="form-error">{mobileForm.formState.errors.mobileNumber.message}</p>}</div>
                        <button type="submit" disabled={processing}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-bocra-teal py-4 text-sm font-bold text-white hover:bg-teal-600 transition-all disabled:opacity-60">
                          {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sending prompt…</> : <><Smartphone className="h-4 w-4" />Send payment prompt — {formatCurrency(total)}</>}
                        </button>
                      </form>
                    )}

                    {/* EFT */}
                    {method === 'eft' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"><Info className="h-4 w-4 text-amber-600 shrink-0" /><p className="text-xs text-amber-800">EFT payments are manually reconciled. Allow 2–3 business days for confirmation. Use your invoice number as the payment reference.</p></div>
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">BOCRA bank account details</p></div>
                          <dl className="grid grid-cols-2 gap-px bg-slate-100">
                            {[['Bank', 'First National Bank (FNB)'], ['Account name', 'Botswana Comms Regulatory Authority'], ['Account number', '62XXXXXXXXX'], ['Branch code', '282772'], ['Account type', 'Business cheque'], ['Reference', OUTSTANDING.filter(i => selected.includes(i.id)).map(i => i.id).join(' | ')]].map(([k, v]) => (
                              <div key={String(k)} className="bg-white px-5 py-3"><dt className="text-xs text-slate-400">{k}</dt><dd className="mt-0.5 text-sm font-semibold text-slate-900 font-mono">{v}</dd></div>
                            ))}
                          </dl>
                        </div>
                        <button onClick={() => handlePay({})} disabled={processing}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-bocra-navy py-4 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-all disabled:opacity-60">
                          {processing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Confirming…</> : <><Building2 className="h-4 w-4" />I have made the transfer</>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order summary sidebar */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="bg-bocra-navy px-5 py-4"><h3 className="text-sm font-bold text-white">Payment summary</h3></div>
            <div className="divide-y divide-slate-100">
              {OUTSTANDING.filter(i => selected.includes(i.id)).map(inv => (
                <div key={inv.id} className="px-5 py-3">
                  <p className="font-mono text-xs font-bold text-bocra-teal">{inv.id}</p>
                  <div className="flex justify-between mt-0.5"><p className="text-xs text-slate-600">{inv.desc}</p><p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p></div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex justify-between text-base font-bold"><span className="text-slate-700">Total</span><span className="text-bocra-teal">{formatCurrency(total)}</span></div>
            </div>
          </div>

          <div className="rounded-xl border border-bocra-teal/20 bg-bocra-teal/5 p-4">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4 text-bocra-teal" /><p className="text-xs font-bold text-slate-800">Secure payment</p></div>
            <p className="text-xs text-slate-500">All payments are processed through BOCRA's certified payment gateway with 256-bit encryption. Your financial data is never stored on our servers.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
            <p className="text-xs font-bold text-slate-800 mb-1">Payment queries?</p>
            <a href="tel:+26739570000" className="block text-xs text-bocra-teal hover:underline">📞 +267 395 7755</a>
            <a href="mailto:fees@bocra.org.bw" className="block text-xs text-bocra-teal hover:underline mt-1">✉ fees@bocra.org.bw</a>
          </div>
        </div>
      </div>
    </div>
  )
}