import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeState = {
  isDark: boolean
  toggle: () => void
  init: () => void
}

type AuthUser = {
  id?: string | number
  role?: string
  email?: string
  fullName?: string
  name?: string
  phone?: string
}

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser | null, accessToken: string | null, refreshToken: string | null) => void
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void
  logout: () => void
  updateToken: (accessToken: string | null) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => {
        const next = !s.isDark
        if (next) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
        return { isDark: next }
      }),
      init: () => {
        const stored = JSON.parse(localStorage.getItem('theme-storage') || '{}')
        const isDark = stored?.state?.isDark ?? window.matchMedia('(prefers-color-scheme: dark)').matches
        if (isDark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      },
    }),
    { name: 'theme-storage' }
  )
)

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
          isAuthenticated: Boolean(accessToken && (refreshToken === undefined ? state.refreshToken : refreshToken)),
        })),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateToken: (accessToken) => set({ accessToken }),
    }),
    { name: 'auth-storage' }
  )
)
