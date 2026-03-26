import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

const ADMIN_CREDENTIALS = {
  email: 'admin@bocra.gov.bw',
  password: 'Admin#1234',
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore(state => state.setUser)
  const setAccessToken = useAuthStore(state => state.setAccessToken)

  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email)
  const [password, setPassword] = useState(ADMIN_CREDENTIALS.password)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setUser({
        id: 'admin',
        email: ADMIN_CREDENTIALS.email,
        fullName: 'BOCRA Admin',
        role: 'admin',
        omangVerified: true,
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      })
      setAccessToken('admin-login-token')
      toast.success('Admin login successful')
      navigate('/admin/dashboard', { replace: true })
    } else {
      toast.error('Invalid admin credentials.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-bocra-navy p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-bocra-teal/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-bocra-green/10 via-transparent to-transparent" />
        <div className="relative">
          <Link to="/">
            <img src="/bocra-logo-white.png" alt="BOCRA" className="h-10 w-auto" />
          </Link>
        </div>
        <div className="relative">
          <h2 className="mb-4 font-heading text-3xl font-bold text-white">Admin access</h2>
          <p className="text-slate-300">Use the dedicated admin credentials to enter the regulatory admin console.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• Email: admin@bocra.gov.bw</li>
            <li>• Password: Admin#1234</li>
            <li>• Access to applications, complaints, and dashboard analytics</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-slate-50">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card-md">
            <h1 className="mb-2 text-3xl font-bold text-slate-900">Admin sign in</h1>
            <p className="mb-6 text-sm text-slate-500">Enter admin credentials to continue to the admin portal.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="form-label">Email address</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="form-label">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-xl py-3 text-sm font-bold text-white',
                  isSubmitting ? 'bg-slate-400' : 'bg-bocra-navy hover:bg-bocra-navy/90'
                )}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in as admin'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">
              Back to{' '}
              <Link to="/login" className="font-semibold text-bocra-teal hover:underline">
                user login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
