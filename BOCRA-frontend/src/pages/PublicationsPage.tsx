import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Search, Download, ExternalLink, BookOpen, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
// IMPORT THE API SERVICE HERE
import api from '@/services/api' 

type PubCategory = 'all' | 'consultation' | 'regulation' | 'report' | 'gazette' | 'advisory'

interface Publication {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  fileSize: string;
  summary: string;
  fileUrl: string;
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

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<PubCategory>('all')

  // --- FIXED: Using 'api' service instead of 'fetch' ---
  useEffect(() => {
    async function fetchDocs() {
      try {
        setLoading(true);
        // This request now automatically includes the Authorization header
        const response = await api.get('/documents'); 
        // Axios puts the response body in .data
        setPublications(response.data.data || []);
      } catch (err: any) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

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
      <section className="relative overflow-hidden bg-bocra-navy py-16">
        <div className="container-page relative">
          <h1 className="font-heading text-4xl font-bold text-white">Publications</h1>
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
          <div className="space-y-4">
            {filtered.map(pub => {
              const style = CAT_STYLE[pub.category] ?? CAT_STYLE.report
              return (
                <motion.article key={pub.id} variants={fadeUp} initial="hidden" animate="show" className="flex items-center justify-between p-4 bg-white border rounded-xl hover:shadow-md transition-all">
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
            {filtered.length === 0 && <p className="text-center py-10 text-slate-500">No documents found.</p>}
          </div>
        )}
      </div>
    </div>
  )
}