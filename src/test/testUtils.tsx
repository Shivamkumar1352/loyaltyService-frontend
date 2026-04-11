import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { render, type RenderOptions } from '@testing-library/react'
import { appStore } from '../store'
import { authSlice } from '../store/slices/authSlice'
import { notificationSlice } from '../store/slices/notificationSlice'

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'>

export function resetStoreState() {
  appStore.dispatch(authSlice.actions.setAuthState({ user: null, accessToken: null, refreshToken: null }))
  appStore.dispatch(notificationSlice.actions.clearNotifications())
}

export function renderWithProviders(ui: ReactElement, options?: ExtendedRenderOptions) {
  return render(<Provider store={appStore}>{ui}</Provider>, options)
}
