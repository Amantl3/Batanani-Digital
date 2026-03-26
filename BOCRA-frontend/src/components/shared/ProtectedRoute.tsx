import { Navigate, Outlet, useLocation } from 'react-router-dom';
// Fixed the import path below to resolve the "Failed to resolve import" error
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const location = useLocation();
  const user = useAuthStore((s: any) => s.user); 
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated());

  if (!isAuthenticated) {
    // Not logged in → redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role === 'admin') {
    // Admin logged in → block portal, redirect to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Normal authenticated user → allow access
  return <Outlet />;
}