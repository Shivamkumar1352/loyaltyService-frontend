import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { authSlice } from './slices/authSlice'
import { notificationSlice } from './slices/notificationSlice'
import { themeSlice } from './slices/themeSlice'
import { appStore, type AppDispatch, type RootState } from './store'
import type { AppNotification, AuthState, AuthUser, NotificationState, ThemeState } from './types'

const useAppDispatch = () => useDispatch<AppDispatch>()
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

type ThemeFacade = ThemeState & {
  toggle: () => void
  init: () => void
}

type AuthFacade = AuthState & {
  setAuth: (user: AuthUser | null, accessToken: string | null, refreshToken: string | null) => void
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void
  logout: () => void
  updateToken: (accessToken: string | null) => void
}

type NotificationFacade = NotificationState & {
  add: (n: Omit<AppNotification, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => void
  remove: (id: string) => void
  clear: () => void
}

export function useThemeStore<T = ThemeFacade>(selector?: (state: ThemeFacade) => T): T {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme)
  const facade: ThemeFacade = {
    ...theme,
    toggle: () => dispatch(themeSlice.actions.toggleTheme()),
    init: () => dispatch(themeSlice.actions.initTheme()),
  }
  return selector ? selector(facade) : (facade as T)
}

export function useAuthStore<T = AuthFacade>(selector?: (state: AuthFacade) => T): T {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const facade: AuthFacade = {
    ...auth,
    setAuth: (user, accessToken, refreshToken) =>
      dispatch(authSlice.actions.setAuthState({ user, accessToken, refreshToken })),
    setTokens: (accessToken, refreshToken) =>
      dispatch(authSlice.actions.setTokens({ accessToken, refreshToken })),
    logout: () => dispatch(authSlice.actions.logoutAuth()),
    updateToken: (accessToken) => dispatch(authSlice.actions.updateAccessToken(accessToken)),
  }
  return selector ? selector(facade) : (facade as T)
}

export function useNotificationStore<T = NotificationFacade>(selector?: (state: NotificationFacade) => T): T {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((state) => state.notifications)
  const facade: NotificationFacade = {
    ...notifications,
    add: (notification) => dispatch(notificationSlice.actions.addNotification(notification)),
    remove: (id) => dispatch(notificationSlice.actions.removeNotification(id)),
    clear: () => dispatch(notificationSlice.actions.clearNotifications()),
  }
  return selector ? selector(facade) : (facade as T)
}

export function getAuthStoreState(): AuthFacade {
  const auth = appStore.getState().auth
  return {
    ...auth,
    setAuth: (user, accessToken, refreshToken) =>
      appStore.dispatch(authSlice.actions.setAuthState({ user, accessToken, refreshToken })),
    setTokens: (accessToken, refreshToken) =>
      appStore.dispatch(authSlice.actions.setTokens({ accessToken, refreshToken })),
    logout: () => appStore.dispatch(authSlice.actions.logoutAuth()),
    updateToken: (accessToken) => appStore.dispatch(authSlice.actions.updateAccessToken(accessToken)),
  }
}
