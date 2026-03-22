import { Outlet } from 'react-router-dom'

/**
 * Auth pages (Login, Register, ForgotPassword) each manage their own
 * full-screen split layout internally — no wrapper needed here.
 */
export default function AuthLayout() {
  return <Outlet />
}