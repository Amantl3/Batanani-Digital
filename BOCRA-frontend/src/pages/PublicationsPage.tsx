import { useState, useRef, useEffect } from 'react' // Added useEffect
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Search, Download, ExternalLink, Calendar, Tag, BookOpen, ChevronRight, Filter, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import api from '@/services/api'

type PubCategory = 'all' | 'consultation' | 'regulation' | 'report' | 'gazette' | 'advisory'

interface Publication {
  id: string; title: string; category: Omit<PubCategory, 'all'>
  date: string; size: string; summary: string; url: string; featured?: boolean
}

const PUBS: Publication[] = [
  { id:'1', title:'Draft Cybersecurity Policy for Electronic Communications Networks', category:'consultation', date:'2025-03-18', size:'1.2 MB', featured:true, url:'#', summary:'BOCRA invites public comment on the draft cybersecurity policy framework for electronic communications network operators in Botswana.' },
  { id:'2', title:'Q4 2024 Market Monitoring and Competition Report',                  category:'report',       date:'2025-02-28', size:'3.4 MB', featured:true, url:'#', summary:'Quarterly analysis of market trends, subscriber statistics, and competition indicators across all communications sectors.' },
  { id:'3', title:'Telecommunications (Amendment) Regulations 2025 — Draft',         category:'consultation', date:'2025-02-14', size:'890 KB', url:'#', summary:'Proposed amendments to the existing telecommunications regulations to address emerging digital services and OTT providers.' },
  { id:'4', title:'Revised Type Approval Guidelines for Mobile Devices',              category:'regulation',   date:'2025-03-12', size:'560 KB', url:'#', summary:'Updated technical requirements and submission procedures for type approval of mobile handsets and accessories.' },
  { id:'5', title:'Government Gazette — BOCRA Licence Fee Schedule 2025/26',         category:'gazette',      date:'2025-01-06', size:'440 KB', url:'#', summary:'Official gazette notice setting out the annual licence fees for all categories of communications licences.' },
  { id:'6', title:'CSIRT Advisory: Phishing Campaign Targeting Mobile Banking Users', category:'advisory',     date:'2025-03-05', size:'210 KB', url:'#', summary:'Security alert regarding active phishing campaigns impersonating major Botswana banks via SMS and WhatsApp.' },
  { id:'7', title:'Annual Report 2023/24',                                            category:'report',       date:'2024-12-15', size:'8.7 MB', url:'#', summary:"BOCRA's comprehensive annual report covering regulatory activities, financial statements, and strategic priorities." },
  { id:'8', title:'Broadband Strategy for Botswana 2025–2030',                       category:'regulation',   date:'2024-11-20', size:'2.1 MB', url:'#', summary:'National strategy document outlining targets for broadband penetration, infrastructure investment, and digital inclusion.' },
]

const CATEGORIES: { value: PubCategory; label: string; color: string; bg: string }[] = [
  { value:'all',          label:'All',            color:'text-slate-700',    bg:'bg-slate-100'        },
  { value:'consultation', label:'Consultations',  color:'text-bocra-teal',   bg:'bg-bocra-teal/10'    },
  { value:'regulation',   label:'Regulations',    color:'text-bocra-green',  bg:'bg-bocra-green/10'   },
  { value:'report',       label:'Reports',        color:'text-bocra-navy',   bg:'bg-bocra-navy/10'    },
  { value:'gazette',      label:'Gazettes',       color:'text-bocra-gold',   bg:'bg-bocra-gold/10'    },
  { value:'advisory',     label:'Advisories',     color:'text-bocra-red',    bg:'bg-bocra-red/10'     },
]

const CAT_STYLE: Record<string, { color: string; bg: string }> = {
  consultation: { color:'text-bocra-teal',  bg:'bg-bocra-teal/10'  },
  regulation:   { color:'text-bocra-green', bg:'bg-bocra-green/10' },
  report:       { color:'text-bocra-navy',  bg:'bg-bocra-navy/10'  },
  gazette:      { color:'text-bocra-gold',  bg:'bg-bocra-gold/10'  },
  advisory:     { color:'text-bocra-red',   bg:'bg-bocra-red/10'   },
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
function InView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>{children}</motion.div>
}

// ── Publication viewer modal ──────────────────────────────────────────────────
function PubViewerModal({ pub, onClose }: { pub: Publication; onClose: () => void }) {
  const style = CAT_STYLE[pub.category] ?? { color: 'text-slate-600', bg: 'bg-slate-100' }
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-BW', { day:'numeric', month:'long', year:'numeric' })

  // For real PDFs: open in iframe/new tab
  const handleOpen = () => {
    if (pub.url && pub.url !== '#') {
      window.open(pub.url, '_blank', 'noopener')
    } else {
      toast.error('Document not yet available — contact BOCRA for a copy')
    }
  }

  const handleDownload = () => {
    if (pub.url && pub.url !== '#') {
      const a = document.createElement('a')
      a.href = pub.url; a.download = `${pub.title}.pdf`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } else {
      // For demo: generate a dummy downloadable info sheet
      const content = `BOCRA Publication\n${'='.repeat(60)}\n\n${pub.title}\n\nPublished: ${fmtDate(pub.date)}\nCategory: ${pub.category.charAt(0).toUpperCase() + pub.category.slice(1)}\nFile size: ${pub.size}\n\nSummary:\n${pub.summary}\n\n${'='.repeat(60)}\nBotswana Communications Regulatory Authority\nPlot 50671, Segkoma Road, Gaborone, Botswana\nwww.bocra.org.bw | info@bocra.org.bw`
      const blob = new Blob([content], { type: 'text/plain' })
      const url  = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${pub.title.slice(0, 50)}.txt`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
      toast.success('Document info sheet downloaded')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-card-lg">

        {/* Header */}
        <div className="flex items-start gap-4 bg-bocra-navy px-6 py-5">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5', style.bg.replace('/10', '/20'))}>
            <FileText className={cn('h-5 w-5', style.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <span className={cn('mb-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold', style.bg, style.color)}>
              {pub.category.charAt(0).toUpperCase() + pub.category.slice(1)}
            </span>
            <h2 className="font-heading text-base font-bold text-white leading-snug">{pub.title}</h2>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(pub.date)}</span>
              <span>{pub.size}</span>
              <span className="uppercase font-mono">{pub.fileType ?? 'PDF'}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Summary</p>
            <p className="text-sm leading-relaxed text-slate-700">{pub.summary}</p>
          </div>

          {/* Preview area — shows iframe for real PDFs, placeholder for demo */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {pub.url && pub.url !== '#' ? (
              <iframe src={pub.url} title={pub.title} className="h-64 w-full border-none" />
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Document preview</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click "Open document" to view the full file</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleOpen}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bocra-navy px-5 py-3 text-sm font-bold text-white hover:bg-bocra-navy/90 transition-colors">
              <ExternalLink className="h-4 w-4" /> Open document
            </button>
            <button onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
          <p className="text-center text-xs text-slate-400">
            This document is published by BOCRA. For questions contact{' '}
            <a href="mailto:info@bocra.org.bw" className="text-bocra-teal hover:underline">info@bocra.org.bw</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PublicationsPage() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<PubCategory>('all')

  const filtered = PUBS.filter(p => {
    const matchCat  = active === 'all' || p.category === active
    const matchText = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  const featured = filtered.filter(p => p.featured)
  const rest      = filtered.filter(p => !p.featured)

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-BW', { day:'numeric', month:'short', year:'numeric' })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-bocra-navy py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-bocra-gold/10 via-transparent to-transparent" />
        <div className="container-page relative">
          <nav className="breadcrumb mb-4">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="text-white/60">Publications</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-bocra-gold/20 px-3 py-1">
                <BookOpen className="h-3.5 w-3.5 text-bocra-gold" />
                <span className="text-xs font-semibold text-bocra-gold">Regulatory documents</span>
              </div>
              <h1 className="font-heading text-4xl font-bold text-white">Publications</h1>
              <p className="mt-2 max-w-lg text-slate-400">Reports, regulatory notices, gazettes, public consultations, and CSIRT security advisories.</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-card-lg">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search publications, regulations, reports…"
                className="flex-1 border-none bg-transparent py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none" />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {CATEGORIES.map(c => {
            const count = c.value === 'all' ? PUBS.length : PUBS.filter(p => p.category === c.value).length
            return (
              <button key={c.value} onClick={() => setActive(c.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                  active === c.value
                    ? `${c.bg} ${c.color} ring-2 ring-current ring-offset-1`
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}>
                {c.label}
                <span className={cn('rounded-full px-1.5 py-0.5 text-xs', active === c.value ? 'bg-white/40' : 'bg-slate-100')}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Results info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length === 0 ? 'No publications found' : `${filtered.length} publication${filtered.length !== 1 ? 's' : ''}`}
            {search && <> matching "<strong className="text-slate-800">{search}</strong>"</>}
          </p>
          {(search || active !== 'all') && (
            <button onClick={() => { setSearch(''); setActive('all') }}
              className="flex items-center gap-1 text-xs font-medium text-bocra-teal hover:underline">
              <X className="h-3 w-3" /> Clear filters
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-card">
            <Search className="mb-4 h-10 w-10 text-slate-300" />
            <p className="font-semibold text-slate-700">No publications found</p>
            <button onClick={() => { setSearch(''); setActive('all') }}
              className="mt-4 rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium hover:bg-slate-50">Clear filters</button>
          </div>
        )}

        {/* Featured publications */}
        {featured.length > 0 && (
          <InView className="mb-8">
            <motion.p variants={fadeUp} className="section-label mb-4">Featured</motion.p>
            <div className="grid gap-5 sm:grid-cols-2">
              {featured.map(pub => {
                const style = CAT_STYLE[pub.category as string] ?? { color: 'text-slate-600', bg: 'bg-slate-100' }
                return (
                  <motion.article key={pub.id} variants={fadeUp}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-lg">
                    <div className={`h-1.5 w-full ${style.bg.replace('/10', '')}`} />
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', style.bg, style.color)}>
                          <Tag className="h-3 w-3" />
                          {pub.category.charAt(0).toUpperCase() + pub.category.slice(1)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" /> {fmtDate(pub.date)}
                        </span>
                      </div>
                      <h2 className={cn('mb-2 font-heading text-lg font-bold leading-snug text-slate-900', `group-hover:${style.color}`)}>
                        <a href={pub.url}>{pub.title}</a>
                      </h2>
                      <p className="mb-4 text-sm leading-relaxed text-slate-500">{pub.summary}</p>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs text-slate-400">{pub.size}</span>
                        <div className="flex gap-3">
                          <a href={pub.url} className={cn('flex items-center gap-1.5 text-xs font-semibold hover:underline', style.color)}>
                            <ExternalLink className="h-3.5 w-3.5" /> View
                          </a>
                          <a href={pub.url} download className={cn('flex items-center gap-1.5 text-xs font-semibold hover:underline', style.color)}>
                            <Download className="h-3.5 w-3.5" /> Download
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </InView>
        )}

        {/* All other publications */}
        {rest.length > 0 && (
          <InView>
            {featured.length > 0 && <motion.p variants={fadeUp} className="section-label mb-4">All publications</motion.p>}
            <div className="space-y-3">
              <AnimatePresence>
                {rest.map(pub => {
                  const style = CAT_STYLE[pub.category as string] ?? { color: 'text-slate-600', bg: 'bg-slate-100' }
                  return (
                    <motion.article key={pub.id} variants={fadeUp}
                      layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-slate-300 hover:shadow-card-md">
                      <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', style.bg)}>
                        <BookOpen className={cn('h-5 w-5', style.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', style.bg, style.color)}>
                            {pub.category.charAt(0).toUpperCase() + pub.category.slice(1)}
                          </span>
                          <span className="text-xs text-slate-400">{fmtDate(pub.date)}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{pub.size}</span>
                        </div>
                        <h3 className={cn('font-heading text-sm font-bold text-slate-900 leading-snug', `group-hover:${style.color}`)}>
                          <a href={pub.url}>{pub.title}</a>
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">{pub.summary}</p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <a href={pub.url} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                          <ExternalLink className="h-3 w-3" /> View
                        </a>
                        <a href={pub.url} download className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors', style.bg.replace('/10', '').replace('bg-', 'bg-'), `hover:opacity-90`)}>
                          <Download className="h-3 w-3" /> Save
                        </a>
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
          </InView>
        )}

        {/* Subscribe CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-2xl bg-bocra-navy">
          <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-8">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Stay informed</h3>
              <p className="mt-1 text-sm text-slate-400">Get notified when new publications and consultations are released.</p>
            </div>
            <div className="flex gap-3">
              <input type="email" placeholder="your@email.com"
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-bocra-teal focus:outline-none" />
              <button className="flex items-center gap-2 rounded-xl bg-bocra-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600 transition-colors">
                Subscribe <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* View modal */}
      <AnimatePresence>
        {viewing && <PubViewerModal pub={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  )
}