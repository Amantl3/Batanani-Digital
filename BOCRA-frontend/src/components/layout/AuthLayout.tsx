import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Minimal header */}
      <header className="bg-bocra-navy px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bocra-cyan">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-bocra-navy">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-heading text-[15px] font-bold text-white">
            BOCRA <span className="text-bocra-cyan">Digital</span>
          </span>
        </Link>
      </header>

      {/* Centred card area */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Botswana Communications Regulatory Authority
      </footer>
    </div>
  )
}
