import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Search,
  Info,
  AlertCircle,
  CheckCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Relative paths to ensure Vite resolves them correctly
import { useAuth } from '../../hooks/useAuth'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'
import { formatRelative } from '../../utils/formatters'

const NAV = [
  { label: 'Home', path: '/', requiresAuth: false },
  { label: 'Licensing', path: '/licensing', requiresAuth: false },
  { label: 'Complaints', path: '/complaints', requiresAuth: false },
  { label: 'Publications', path: '/publications', requiresAuth: false },
  { label: 'Dashboard', path: '/admin/dashboard', requiresAuth: true, requiresAdmin: true },
  { label: 'My Portal', path: '/portal', requiresAuth: true },
  { label: 'Analytics Map', path: '/map', requiresAuth: true, requiresAdmin: true },
  { label: 'Contact', path: '/contact', requiresAuth: false },
]
export default function Navbar() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { navOpen, toggleNav } = useUIStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  
  // Safe data handling for notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useNotifications()
  const notifications = Array.isArray(notificationsData) ? notificationsData : []
  
  const markNotificationRead = useMarkNotificationRead()
  const markAllNotificationsRead = useMarkAllNotificationsRead()

  const unreadNotifications = notifications.filter((n: any) => !n.read)

  const visibleLinks = NAV.filter((link) => {
    if (link.requiresAdmin && !isAdmin) return false
    if (link.requiresAuth && !isAuthenticated) return false
    if (link.path === '/portal' && isAdmin) return false
    return true
  })

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header className="sticky top-0 z-50 bg-bocra-navy shadow-lg">
      <div className="hidden border-b border-white/5 lg:block">
        <div className="container-page flex items-center justify-between py-1.5 text-white/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bocra-teal" />
            All systems operational
          </div>
          <div className="flex items-center gap-5">
            <span>+ 267 395 7755</span>
            <span>info@bocra.org.bw</span>
          </div>
        </div>
      </div>

      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src="/bocra-logo-white.png" alt="BOCRA" className="h-9 w-auto" />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-bocra-teal/15 text-bocra-teal' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-white/60 hover:text-white">
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated && user ? (
              <>
                <div className="relative">
                  <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative p-2 text-white/60 hover:text-white">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bocra-red" />}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl bg-white shadow-xl overflow-hidden text-slate-900 border border-slate-200">
                      <div className="p-3 border-b flex justify-between items-center bg-slate-50">
                        <span className="font-bold text-sm">Notifications</span>
                        {/* FIXED: Wrapped in arrow function to fix TS error 2322 */}
                        <button 
                          onClick={() => { markAllNotificationsRead.mutate() }} 
                          className="text-[10px] text-bocra-teal uppercase font-bold hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                        ) : (
                          notifications.map((n: any) => (
                            <button 
                              key={n.id} 
                              onClick={() => { if(!n.read) markNotificationRead.mutate(n.id) }}
                              className={cn("w-full text-left p-3 border-b text-xs transition hover:bg-slate-50", !n.read && "bg-bocra-teal/5")}
                            >
                               <p className="font-bold">{n.title}</p>
                               <p className="text-slate-500 line-clamp-2">{n.body}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 hover:bg-white/10 rounded-lg text-white">
                    <div className="h-7 w-7 rounded-full bg-bocra-teal flex items-center justify-center text-[10px] font-bold">{initials}</div>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border p-1 text-slate-800">
                      <button 
                        onClick={() => { logout() }} 
                        className="flex w-full items-center gap-2 p-2 hover:bg-red-50 text-red-600 rounded text-sm transition"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm text-white/80 hover:text-white">Login</Link>
                <Link to="/register" className="bg-bocra-teal px-4 py-2 rounded-lg text-sm text-white font-bold">Register</Link>
              </div>
            )}
            <button onClick={toggleNav} className="lg:hidden text-white p-2"><Menu /></button>
          </div>
        </div>
      </div>
    </header>
  )
}
