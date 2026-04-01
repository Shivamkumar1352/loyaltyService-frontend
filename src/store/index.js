import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
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

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      updateToken: (accessToken) => set({ accessToken }),
    }),
    { name: 'auth-storage' }
  )
)
