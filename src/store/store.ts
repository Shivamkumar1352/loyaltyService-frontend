import { configureStore } from '@reduxjs/toolkit'
import { AUTH_KEY, NOTIFICATION_KEY, THEME_KEY } from './constants'
import { writePersistedState } from './persistence'
import { authSlice } from './slices/authSlice'
import { notificationSlice } from './slices/notificationSlice'
import { themeSlice } from './slices/themeSlice'

export const appStore = configureStore({
  reducer: {
    theme: themeSlice.reducer,
    auth: authSlice.reducer,
    notifications: notificationSlice.reducer,
  },
})

appStore.subscribe(() => {
  const state = appStore.getState()
  writePersistedState(THEME_KEY, state.theme)
  writePersistedState(AUTH_KEY, state.auth)
  writePersistedState(NOTIFICATION_KEY, state.notifications)
})

export type RootState = ReturnType<typeof appStore.getState>
export type AppDispatch = typeof appStore.dispatch
