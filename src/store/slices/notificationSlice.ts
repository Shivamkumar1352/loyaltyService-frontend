import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { NOTIFICATION_KEY } from '../constants'
import { readPersistedState } from '../persistence'
import type { AppNotification, NotificationState } from '../types'

const persistedNotifications = readPersistedState<NotificationState>(NOTIFICATION_KEY)

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: persistedNotifications?.items ?? [],
  } satisfies NotificationState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<Omit<AppNotification, 'id' | 'createdAt'> & { id?: string; createdAt?: number }>
    ) {
      const id = action.payload.id ?? `ntf-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const createdAt = action.payload.createdAt ?? Date.now()
      state.items = [
        {
          id,
          createdAt,
          title: action.payload.title,
          message: action.payload.message,
          severity: action.payload.severity ?? 'info',
          href: action.payload.href,
        },
        ...state.items,
      ].slice(0, 50)
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearNotifications(state) {
      state.items = []
    },
  },
})
