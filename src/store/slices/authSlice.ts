import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { AUTH_KEY } from '../constants'
import { readPersistedState } from '../persistence'
import type { AuthState, AuthUser } from '../types'

const persistedAuth = readPersistedState<AuthState>(AUTH_KEY)

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedAuth?.user ?? null,
    accessToken: persistedAuth?.accessToken ?? null,
    refreshToken: persistedAuth?.refreshToken ?? null,
    isAuthenticated: persistedAuth?.isAuthenticated ?? Boolean(persistedAuth?.accessToken && persistedAuth?.refreshToken),
  } satisfies AuthState,
  reducers: {
    setAuthState(
      state,
      action: PayloadAction<{ user: AuthUser | null; accessToken: string | null; refreshToken: string | null }>
    ) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = Boolean(action.payload.accessToken && action.payload.refreshToken)
    },
    setTokens(
      state,
      action: PayloadAction<{ accessToken: string | null; refreshToken?: string | null }>
    ) {
      state.accessToken = action.payload.accessToken
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken
      }
      state.isAuthenticated = Boolean(state.accessToken && state.refreshToken)
    },
    logoutAuth(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
    updateAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload
      state.isAuthenticated = Boolean(state.accessToken && state.refreshToken)
    },
  },
})
