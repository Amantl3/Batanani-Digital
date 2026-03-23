import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'

import MainLayout     from '@components/layout/MainLayout'
import AuthLayout     from '@components/layout/AuthLayout'
import ProtectedRoute from '@components/shared/ProtectedRoute'
import AdminRoute     from '@components/shared/AdminRoute'
import PageLoader     from '@components/shared/PageLoader'

const HomePage               = lazy(() => import('@pages/HomePage'))
const LicensingPage          = lazy(() => import('@pages/LicensingPage'))
const LicenceDetailPage      = lazy(() => import('@pages/LicenceDetailPage'))
const ComplaintsPage         = lazy(() => import('@pages/ComplaintsPage'))
const ComplaintTrackPage     = lazy(() => import('@pages/ComplaintTrackPage'))
const DashboardPage          = lazy(() => import('@pages/DashboardPage'))
const PortalPage             = lazy(() => import('@pages/PortalPage'))
const PublicationsPage       = lazy(() => import('@pages/PublicationsPage'))
const LicenceApplicationPage = lazy(() => import('@pages/portal/LicenceApplicationPage'))
const LoginPage              = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage           = lazy(() => import('@pages/auth/RegisterPage'))
const ForgotPasswordPage     = lazy(() => import('@pages/auth/ForgotPasswordPage'))
const NotFoundPage           = lazy(() => import('@pages/NotFoundPage'))
const DomainRegistrationPage = lazy(() => import('@pages/portal/DomainRegistrationPage'))
const CompliancePage         = lazy(() => import('@pages/portal/CompliancePage'))
const FeesPage                = lazy(() => import('@pages/portal/FeesPage'))
const RenewLicensePage        = lazy(() => import('@pages/portal/RenewLicensePage'))
const ApprovalApplicationPage = lazy(() => import('@pages/portal/ApprovalApplicationPage'))




export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 4500,
        style: { background:'#0D1F3C', color:'#fff', fontSize:'14px', borderRadius:'10px', padding:'12px 16px' },
        success: { iconTheme: { primary:'#1A7F79', secondary:'#0D1F3C' } },
        error:   { iconTheme: { primary:'#EF4444', secondary:'#fff' } },
      }}/>

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public pages ──────────────────────────────── */}
          <Route element={<MainLayout />}>
            <Route path="/"                      element={<HomePage />} />
            <Route path="/licensing"             element={<LicensingPage />} />
            <Route path="/licensing/:id"         element={<LicenceDetailPage />} />
            <Route path="/complaints"            element={<ComplaintsPage />} />
            <Route path="/complaints/track/:ref" element={<ComplaintTrackPage />} />
            <Route path="/complaints/track"      element={<ComplaintTrackPage />} />
            <Route path="/publications"          element={<PublicationsPage />} />
            <Route path="/portal/apply"        element={<LicenceApplicationPage />} />
            <Route path="/portal/DomainRegistration" element={<DomainRegistrationPage/>} />
            <Route path="/admin/dashboard"     element={<DashboardPage />} />
            <Route path="/portal"              element={<PortalPage />} />
            <Route path="/portal/compliance" element={<CompliancePage/>} />
            <Route path="/portal/pay" element={<FeesPage/>} />
            <Route path="/portal/renew" element={<RenewLicensePage/>} />
            <Route path="/portal/type-approval" element={<ApprovalApplicationPage/>} />


            {/* ── Auth-protected ────────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/portal"              element={<PortalPage />} />
              <Route path="/portal/apply"        element={<LicenceApplicationPage />} />
            </Route>

            {/* ── Admin-only — dashboard hidden from nav ── */}
            {/* Access via /admin/dashboard — not shown in nav */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard"     element={<DashboardPage />} />
            </Route>
          </Route>

          {/* ── Auth pages ────────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Redirect old /dashboard path to 404 for non-admins */}
          <Route path="/dashboard" element={<Navigate to="/404" replace />} />

          {/* Fallbacks */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}