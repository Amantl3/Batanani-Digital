import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useAuth }    from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { cn }         from '@/utils/cn'
import { NAV_LINKS }  from '@/utils/constants'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { navOpen, toggleNav } = useUIStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const visibleLinks = NAV_LINKS.filter(
    (l) => !l.requiresAuth || isAuthenticated
  )

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-bocra-navy">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Logo ────────────────────────────────────────────── */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bocra-cyan">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-bocra-navy">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-heading text-[15px] font-bold tracking-tight text-white">
              BOCRA <span className="text-bocra-cyan">Digital</span>
            </span>
          </Link>

          {/* ── Desktop nav links ────────────────────────────────── */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-bocra-cyan'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {t(`nav.${link.label.toLowerCase().replace(' ', '_')}`, link.label)}
              </NavLink>
            ))}
          </nav>

          {/* ── Right actions ────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                {/* Notification bell */}
                <button
                  className="relative rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bocra-cyan text-[11px] font-semibold text-bocra-navy">
                      {initials}
                    </div>
                    <span className="hidden sm:block">
                      {user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>

                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full z-20 mt-2 w-52 animate-slide-down rounded-xl border border-slate-200 bg-white py-1 shadow-card-lg">
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-sm font-medium text-slate-900">
                            {user.fullName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/portal') }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <User className="h-4 w-4 text-slate-400" /> My Portal
                        </button>
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/settings') }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Settings className="h-4 w-4 text-slate-400" /> Settings
                        </button>
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => { setProfileOpen(false); logout() }}
                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            {t('nav.logout')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border border-white/20 px-3.5 py-2 text-sm font-medium text-white/85 transition-colors hover:border-white/40 hover:text-white"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-bocra-cyan px-3.5 py-2 text-sm font-semibold text-bocra-navy transition-colors hover:bg-cyan-300"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={toggleNav}
              className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {navOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-bocra-navy px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={toggleNav}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-white/10 text-bocra-cyan'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {t(`nav.${link.label.toLowerCase().replace(' ', '_')}`, link.label)}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
