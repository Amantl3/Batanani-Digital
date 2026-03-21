import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'

interface AuthStore {
  user:        User | null
  accessToken: string | null

  setUser:         (user: User) => void
  setAccessToken:  (token: string) => void
  clearAuth:       () => void
  isAuthenticated: () => boolean
  hasRole:         (role: User['role'] | User['role'][]) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,

      setUser: (user) => set({ user }),

      setAccessToken: (accessToken) => {
        set({ accessToken })
        sessionStorage.setItem('access_token', accessToken)
      },

      clearAuth: () => {
        set({ user: null, accessToken: null })
        sessionStorage.removeItem('access_token')
      },

      isAuthenticated: () => {
        const { user, accessToken } = get()
        return Boolean(user && accessToken)
      },

      hasRole: (role) => {
        const { user } = get()
        if (!user) return false
        const roles = Array.isArray(role) ? role : [role]
        return roles.includes(user.role)
      },
    }),
    {
      name:       'bocra-auth',
      storage:    createJSONStorage(() => localStorage),
      // Only persist the user object — never the token
      partialize: (state) => ({ user: state.user }),
    }
  )
)
