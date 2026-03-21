import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, ExternalLink, Calendar, Tag } from 'lucide-react'
import { cn } from '@/utils/cn'

type PubCategory = 'all' | 'consultation' | 'regulation' | 'report' | 'gazette' | 'advisory'

interface Publication {
  id:       string
  title:    string
  category: Omit<PubCategory, 'all'>
  date:     string
  size:     string
  summary:  string
  url:      string
}

const PUBS: Publication[] = [
  { id: '1', title: 'Draft Cybersecurity Policy for Electronic Communications Networks', category: 'consultation', date: '2025-03-18', size: '1.2 MB', summary: 'BOCRA invites public comment on the draft cybersecurity policy framework for electronic communications network operators.', url: '#' },
  { id: '2', title: 'Q4 2024 Market Monitoring and Competition Report', category: 'report', date: '2025-02-28', size: '3.4 MB', summary: 'Quarterly analysis of market trends, subscriber statistics, and competition indicators across all communications sectors.', url: '#' },
  { id: '3', title: 'Telecommunications (Amendment) Regulations 2025 — Draft', category: 'consultation', date: '2025-02-14', size: '890 KB', summary: 'Proposed amendments to the existing telecommunications regulations to address emerging digital services and OTT providers.', url: '#' },
  { id: '4', title: 'Revised Type Approval Guidelines for Mobile Devices', category: 'regulation', date: '2025-03-12', size: '560 KB', summary: 'Updated technical requirements and submission procedures for type approval of mobile handsets and accessories.', url: '#' },
  { id: '5', title: 'Government Gazette — BOCRA Licence Fee Schedule 2025/26', category: 'gazette', date: '2025-01-06', size: '440 KB', summary: 'Official gazette notice setting out the annual licence fees for all categories of communications licences.', url: '#' },
  { id: '6', title: 'CSIRT Advisory: Phishing Campaign Targeting Mobile Banking Users', category: 'advisory', date: '2025-03-05', size: '210 KB', summary: 'Security alert regarding active phishing campaigns impersonating major Botswana banks via SMS and WhatsApp.', url: '#' },
  { id: '7', title: 'Annual Report 2023/24', category: 'report', date: '2024-12-15', size: '8.7 MB', summary: 'BOCRA\'s comprehensive annual report covering regulatory activities, financial statements, and strategic priorities.', url: '#' },
  { id: '8', title: 'Broadband Strategy for Botswana 2025–2030', category: 'regulation', date: '2024-11-20', size: '2.1 MB', summary: 'National strategy document outlining targets for broadband penetration, infrastructure investment, and digital inclusion.', url: '#' },
]

const CATEGORIES: { value: PubCategory; label: string; badge: string }[] = [
  { value: 'all',          label: 'All publications', badge: 'badge-muted'   },
  { value: 'consultation', label: 'Consultations',    badge: 'badge-info'    },
  { value: 'regulation',   label: 'Regulations',      badge: 'badge-purple'  },
  { value: 'report',       label: 'Reports',          badge: 'badge-success' },
  { value: 'gazette',      label: 'Gazettes',         badge: 'badge-warning' },
  { value: 'advisory',     label: 'Advisories',       badge: 'badge-danger'  },
]

const CAT_BADGE: Record<string, string> = {
  consultation: 'badge-info',
  regulation:   'badge-purple',
  report:       'badge-success',
  gazette:      'badge-warning',
  advisory:     'badge-danger',
}

export default function PublicationsPage() {
  const [search, setSearch]  = useState('')
  const [active, setActive]  = useState<PubCategory>('all')

  const filtered = PUBS.filter(p => {
    const matchCat  = active === 'all' || p.category === active
    const matchText = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchText
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="page-hero">
        <div className="container-page">
          <nav className="breadcrumb mb-3">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Publications</span>
          </nav>
          <h1>Publications & consultations</h1>
          <p>Reports, regulatory notices, gazettes, public consultations, and CSIRT advisories.</p>
          <div className="mt-5 flex max-w-lg overflow-hidden rounded-xl bg-white">
            <div className="flex flex-1 items-center gap-2 px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search publications…"
                className="flex-1 border-none bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Category filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setActive(c.value)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                active === c.value
                  ? 'border-bocra-blue bg-bocra-blue text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-bocra-blue hover:text-bocra-blue'
              )}
            >
              {c.label}
              <span className={cn('ml-1.5 rounded-full px-1.5 py-0.5 text-xs', active === c.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                {c.value === 'all' ? PUBS.length : PUBS.filter(p => p.category === c.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-slate-500">
          {filtered.length === 0 ? 'No publications found' : `${filtered.length} publication${filtered.length !== 1 ? 's' : ''}`}
          {search && <> matching "<strong>{search}</strong>"</>}
        </p>

        {/* Publication list */}
        {filtered.length === 0 ? (
          <div className="card py-16 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No publications found</p>
            <button onClick={() => { setSearch(''); setActive('all') }} className="btn-secondary btn-sm mt-4">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map(pub => (
              <article key={pub.id} className="card flex flex-col gap-0 overflow-hidden transition-all hover:shadow-card-md">
                <div className="flex-1 p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={cn('badge', CAT_BADGE[pub.category] ?? 'badge-muted')}>
                      <Tag className="h-2.5 w-2.5" />
                      {pub.category.charAt(0).toUpperCase() + pub.category.slice(1)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(pub.date).toLocaleDateString('en-BW', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="mb-2 font-heading text-base font-semibold leading-snug text-slate-900 hover:text-bocra-blue">
                    <a href={pub.url}>{pub.title}</a>
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">{pub.summary}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                  <span className="text-xs text-slate-400">{pub.size}</span>
                  <div className="flex gap-3">
                    <a href={pub.url} className="flex items-center gap-1.5 text-xs font-medium text-bocra-blue hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                    <a href={pub.url} download className="flex items-center gap-1.5 text-xs font-medium text-bocra-blue hover:underline">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
