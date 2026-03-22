import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth }    from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { cn }         from '@/utils/cn'

// Nav links defined locally so we control labels exactly
const NAV = [
  { label: 'Home',         path: '/',            requiresAuth: false },
  { label: 'Licensing',    path: '/licensing',   requiresAuth: false },
  { label: 'Complaints',   path: '/complaints',  requiresAuth: false },
  { label: 'Dashboard',    path: '/dashboard',   requiresAuth: false },
  { label: 'Publications', path: '/publications',requiresAuth: false },
  { label: 'My Portal',    path: '/portal',      requiresAuth: true  },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { navOpen, toggleNav } = useUIStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const visibleLinks = NAV.filter(l => !l.requiresAuth || isAuthenticated)

  const initials = user?.fullName
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-bocra-navy shadow-lg">

      {/* ── Top utility bar ─────────────────────────────────── */}
      <div className="hidden border-b border-white/5 lg:block">
        <div className="container-page flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bocra-teal" />
            All systems operational
          </div>
          <div className="flex items-center gap-5 text-xs text-white/40">
            <a href="tel:0800600125" className="transition-colors hover:text-white">
              📞 0800 600 125 (toll-free)
            </a>
            <a href="mailto:info@bocra.org.bw" className="transition-colors hover:text-white">
              ✉ info@bocra.org.bw
            </a>
            <div className="flex overflow-hidden rounded border border-white/10">
              <button className="bg-bocra-teal px-2.5 py-0.5 text-xs font-semibold text-white">EN</button>
              <button className="px-2.5 py-0.5 text-xs text-white/40 transition-colors hover:text-white">TN</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main nav bar ────────────────────────────────────── */}
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo — uses transparent PNG on dark background */}
          <Link to="/" className="flex shrink-0 items-center gap-3">
            {/*
              bocra-logo-white.png = transparent background, white/coloured text
              This looks correct on the dark navy navbar
            */}
            <img
              src="/bocra-logo-white.png"
              alt="BOCRA"
              className="h-9 w-auto"
            />
            {/* Four brand dots matching the logo */}
            {/*<div className="hidden items-center gap-1 sm:flex">
              <div className="h-2 w-2 rounded-full bg-bocra-teal" />
              <div className="h-2 w-2 rounded-full bg-bocra-green" />
              <div className="h-2 w-2 rounded-full bg-bocra-red" />
              <div className="h-2 w-2 rounded-full bg-bocra-gold" />
            </div>*/}
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {visibleLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) => cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-bocra-teal/15 text-bocra-teal'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <button
                  className="relative rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bocra-red" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bocra-teal text-[11px] font-bold text-white">
                      {initials}
                    </div>
                    <span className="hidden sm:block">{user.fullName.split(' ')[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full z-20 mt-2 w-56 animate-slide-down overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-lg">
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/portal') }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <User className="h-4 w-4 text-slate-400" /> My Portal
                        </button>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/settings') }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 text-slate-400" /> Settings
                        </button>
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => { setProfileOpen(false); logout() }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" /> {t('nav.logout')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:border-white/40 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-bocra-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleNav}
              className="ml-1 rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Expandable search bar ────────────────────────────── */}
      {searchOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-bocra-navy/95 backdrop-blur-md">
          <div className="container-page flex items-center gap-3 py-3">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              autoFocus
              type="search"
              placeholder="Search licences, regulations, publications, FAQs…"
              className="flex-1 border-none bg-transparent py-1 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="text-white/40 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile drawer ────────────────────────────────────── */}
      {navOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-bocra-navy px-4 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {visibleLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={toggleNav}
                className={({ isActive }) => cn(
                  'rounded-lg px-4 py-2.5 text-sm font-medium',
                  isActive
                    ? 'bg-bocra-teal/10 text-bocra-teal'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-xs text-white/40">
            <p>0800 600 125 (toll-free)</p>
            <p>info@bocra.org.bw</p>
          </div>
        </div>
      )}
    </header>
  )
}