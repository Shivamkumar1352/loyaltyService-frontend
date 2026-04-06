import { createSlice } from '@reduxjs/toolkit'
import { THEME_KEY } from '../constants'
import { applyThemeClass, readPersistedState } from '../persistence'
import type { ThemeState } from '../types'

const persistedTheme = readPersistedState<ThemeState>(THEME_KEY)

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: persistedTheme?.isDark ?? false,
  } satisfies ThemeState,
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark
      applyThemeClass(state.isDark)
    },
    initTheme(state) {
      const next =
        persistedTheme?.isDark ??
        (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      state.isDark = Boolean(next)
      applyThemeClass(state.isDark)
    },
  },
})
