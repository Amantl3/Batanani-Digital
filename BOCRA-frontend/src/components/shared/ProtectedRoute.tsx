import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function ProtectedRoute() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user) // assuming user object is stored
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  if (!isAuthenticated) {
    // Not logged in → redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role === 'admin') {
    // Admin logged in → block portal, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />
  }

  // Normal authenticated user → allow access
  return <Outlet />
}