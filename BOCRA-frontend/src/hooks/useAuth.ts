import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import * as authService from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials, RegisterPayload } from '@/types'

export function useAuth() {
  const store = useAuthStore()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn:  authService.getMe,
    enabled:  Boolean(sessionStorage.getItem('access_token')) && !store.user,
    retry:    false,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (meQuery.data) {
      store.setUser(meQuery.data)
    }
  }, [meQuery.data])

  const loginMutation = useMutation({
    mutationFn: (creds: LoginCredentials) => authService.login(creds),
    onSuccess: ({ user, accessToken }) => {
      store.setUser(user)
      store.setAccessToken(accessToken)
      qc.setQueryData(['auth', 'me'], user)
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`)
      navigate(user.role === 'public' ? '/' : '/portal', { replace: true })
    },
    onError: (err: { detail?: string }) => {
      toast.error(err?.detail ?? 'Login failed. Please check your credentials.')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify.')
      navigate('/login')
    },
    onError: (err: { detail?: string }) => {
      toast.error(err?.detail ?? 'Registration failed. Please try again.')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      store.clearAuth()
      qc.clear()
      navigate('/login', { replace: true })
    },
  })

  return {
    user:            store.user,
    isAuthenticated: store.isAuthenticated(),
    hasRole:         store.hasRole,
    login:           loginMutation.mutate,
    register:        registerMutation.mutate,
    logout:          logoutMutation.mutate,
    isLoggingIn:     loginMutation.isPending,
    isRegistering:   registerMutation.isPending,
  }
}