import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function AdminRoute() {
  const store    = useAuthStore()
  const location = useLocation()

  if (!store.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!store.hasRole(['admin', 'officer'])) {
    return <Navigate to="/404" replace />
  }
  return <Outlet />
}