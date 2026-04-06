export type ThemeState = {
  isDark: boolean
}

export type AuthUser = {
  id?: string | number
  role?: string
  email?: string
  fullName?: string
  name?: string
  phone?: string
}

export type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

export type AppNotification = {
  id: string
  title: string
  message?: string
  createdAt: number
  severity?: 'success' | 'info' | 'warning' | 'error'
  href?: string
}

export type NotificationState = {
  items: AppNotification[]
}

export type PersistEnvelope<T> = {
  state?: T
}
