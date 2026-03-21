import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, Search } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Licence registry',  to: '/licensing'   },
  { label: 'File a complaint',  to: '/complaints'  },
  { label: 'Dashboard',         to: '/dashboard'   },
  { label: 'Publications',      to: '/publications'},
]

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-slate-50 px-4 py-16 text-center">
      {/* Big 404 */}
      <div className="relative mb-8 select-none">
        <p className="font-heading text-[120px] font-bold leading-none text-slate-100 sm:text-[160px]">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bocra-navy">
            <svg viewBox="0 0 24 24" className="h-8 w-8 fill-bocra-cyan">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="mb-3 font-heading text-2xl font-bold text-slate-900 sm:text-3xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-base leading-relaxed text-slate-500">
        The page you're looking for doesn't exist or may have moved. Try searching for what you need, or use one of the links below.
      </p>

      {/* Search */}
      <div className="mb-8 flex w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-1 items-center gap-2 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            placeholder="Search BOCRA…"
            className="flex-1 border-none bg-transparent py-3 text-sm focus:outline-none"
          />
        </div>
        <button className="btn-primary m-1.5 rounded-lg px-4 text-sm">Search</button>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUICK_LINKS.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-bocra-blue hover:text-bocra-blue"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
        <Link to="/" className="btn-primary">
          <Home className="h-4 w-4" /> Homepage
        </Link>
      </div>
    </div>
  )
}
