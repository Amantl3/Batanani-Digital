import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'

import MainLayout      from '@components/layout/MainLayout'
import AuthLayout      from '@components/layout/AuthLayout'
import ProtectedRoute  from '@components/shared/ProtectedRoute'
import PageLoader      from '@components/shared/PageLoader'

/* Lazy-load all pages for automatic code-splitting */
const HomePage           = lazy(() => import('@pages/HomePage'))
const LicensingPage      = lazy(() => import('@pages/LicensingPage'))
const LicenceDetailPage  = lazy(() => import('@pages/LicenceDetailPage'))
const ComplaintsPage     = lazy(() => import('@pages/ComplaintsPage'))
const ComplaintTrackPage = lazy(() => import('@pages/ComplaintTrackPage'))
const DashboardPage      = lazy(() => import('@pages/DashboardPage'))
const PortalPage         = lazy(() => import('@pages/PortalPage'))
const PublicationsPage   = lazy(() => import('@pages/PublicationsPage'))
const LoginPage          = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('@pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'))
const NotFoundPage       = lazy(() => import('@pages/NotFoundPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4500,
          style: {
            background: '#0B2545',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#06B6D4', secondary: '#0B2545' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff'    } },
        }}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public pages — full nav layout ──────────────────────── */}
          <Route element={<MainLayout />}>
            <Route path="/"                        element={<HomePage />} />
            <Route path="/licensing"               element={<LicensingPage />} />
            <Route path="/licensing/:id"           element={<LicenceDetailPage />} />
            <Route path="/complaints"              element={<ComplaintsPage />} />
            <Route path="/complaints/track/:ref"   element={<ComplaintTrackPage />} />
            <Route path="/dashboard"               element={<DashboardPage />} />
            <Route path="/publications"            element={<PublicationsPage />} />

            {/* ── Protected — requires auth ────────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/portal"  element={<PortalPage />} />
            </Route>
          </Route>

          {/* ── Auth pages — minimal layout ─────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Fallbacks ────────────────────────────────────────────── */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
