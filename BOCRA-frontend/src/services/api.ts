/// <reference types="vite/client" />
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                   BACKEND CONNECTION GUIDE                          ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║ Your Railway backend URL goes in .env:                               ║
 * ║   VITE_API_BASE_URL=https://your-app.up.railway.app/api/v1          ║
 * ║                                                                      ║
 * ║ Every service file (auth.ts, licences.ts, complaints.ts,            ║
 * ║ analytics.ts) uses this axios instance which automatically:          ║
 * ║   1. Prepends VITE_API_BASE_URL to every request                    ║
 * ║   2. Attaches JWT access token from sessionStorage                  ║
 * ║   3. Silently refreshes token on 401 (using HttpOnly refresh cookie) ║
 * ║   4. Redirects to /login if refresh also fails                      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://batanani-digital-production.up.railway.app/api'

export const api = axios.create({
  baseURL:         BASE_URL,
  withCredentials: false, // sends HttpOnly refresh cookie automatically
  timeout:         15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
})

// ── Attach JWT to every request ───────────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ── Auto-refresh token on 401 ─────────────────────────────────────────────────
let isRefreshing = false
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = []

function drain(error: unknown, token: string | null) {
  queue.forEach(p => token ? p.resolve(token) : p.reject(error))
  queue = []
}

api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const orig = err.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (err.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
          .then(token => { orig.headers['Authorization'] = `Bearer ${token}`; return api(orig) })
      }
      orig._retry  = true
      isRefreshing = true
      try {
        const { data } = await api.post<{ accessToken: string }>('/auth/refresh')
        sessionStorage.setItem('access_token', data.accessToken)
        drain(null, data.accessToken)
        orig.headers['Authorization'] = `Bearer ${data.accessToken}`
        return api(orig)
      } catch (refreshErr) {
        drain(refreshErr, null)
        sessionStorage.removeItem('access_token')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // Normalise to RFC 9457 Problem Details format
    const apiError: ApiError = {
      type:     'about:blank',
      title:    'An error occurred',
      status:   err.response?.status ?? 0,
      detail:   'Something went wrong. Please try again.',
      instance: orig?.url ?? '',
      ...(err.response?.data as Partial<ApiError>),
    }
    return Promise.reject(apiError)
  }
)

export default api