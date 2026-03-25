import { useState, useRef, useEffect } from 'react' // Added useEffect
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Search, Download, ExternalLink, Calendar, Tag, BookOpen, ChevronRight, Filter, X, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type PubCategory = 'all' | 'consultation' | 'regulation' | 'report' | 'gazette' | 'advisory'

interface Publication {
  id: string;
  title: string;
  category: Omit<PubCategory, 'all'>;
  publishedAt: string; // Match backend
  fileSize: string;    // Match backend
  summary: string;
  fileUrl: string;     // Match backend
  featured?: boolean;
}

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

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<PubCategory>('all')

  // --- Fetch Data from Backend ---
  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch('https://batanani-digital-production.up.railway.app/api/documents')
        const json = await res.json()
        setPublications(json.data || [])
      } catch (err) {
        console.error("Failed to load documents:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const filtered = publications.filter(p => {
    const matchCat  = active === 'all' || p.category === active
    const matchText = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  const featured = filtered.filter(p => p.featured)
  const rest     = filtered.filter(p => !p.featured)

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
          <h1 className="font-heading text-4xl font-bold text-white">Publications</h1>
          <p className="mt-2 max-w-lg text-slate-400">Official reports, regulatory notices, and consultations.</p>

          <div className="mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-card-lg">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search publications..."
                className="flex-1 border-none bg-transparent py-4 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setActive(c.value)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all',
                active === c.value ? `${c.bg} ${c.color} ring-2 ring-current` : 'bg-white text-slate-600 border'
              )}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-bocra-teal" />
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <InView className="mb-12">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Featured</p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {featured.map(pub => {
                    const style = CAT_STYLE[pub.category as string] ?? CAT_STYLE.report
                    return (
                      <motion.article key={pub.id} variants={fadeUp} className="rounded-2xl border bg-white p-6 shadow-card hover:shadow-card-lg transition-all">
                        <div className="mb-4 flex items-center justify-between">
                           <span className={cn('px-3 py-1 rounded-full text-xs font-bold', style.bg, style.color)}>{pub.category}</span>
                           <span className="text-xs text-slate-400">{fmtDate(pub.publishedAt)}</span>
                        </div>
                        <h2 className="text-xl font-bold mb-2">{pub.title}</h2>
                        <p className="text-sm text-slate-500 mb-6">{pub.summary}</p>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-xs text-slate-400">{pub.fileSize}</span>
                          <div className="flex gap-4">
                            <a href={pub.fileUrl} target="_blank" rel="noreferrer" className={cn("text-xs font-bold flex items-center gap-1", style.color)}>
                              <ExternalLink className="h-3 w-3" /> View
                            </a>
                            <a href={pub.fileUrl} download className={cn("text-xs font-bold flex items-center gap-1", style.color)}>
                              <Download className="h-3 w-3" /> Download
                            </a>
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              </InView>
            )}

            {/* List View for the rest */}
            <div className="space-y-4">
              {rest.map(pub => {
                const style = CAT_STYLE[pub.category as string] ?? CAT_STYLE.report
                return (
                  <motion.article key={pub.id} variants={fadeUp} className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg", style.bg)}>
                        <BookOpen className={cn("h-5 w-5", style.color)} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{pub.title}</h3>
                        <p className="text-xs text-slate-500">{pub.fileSize} • {fmtDate(pub.publishedAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={pub.fileUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 rounded-lg"><ExternalLink className="h-4 w-4 text-slate-400" /></a>
                      <a href={pub.fileUrl} download className="p-2 hover:bg-slate-100 rounded-lg"><Download className="h-4 w-4 text-slate-400" /></a>
                    </div>
                  </motion.article>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No documents found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}