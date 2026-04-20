import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import App from './App'
import './styles/index.css'
import ErrorBoundary from './shared/components/ErrorBoundary'
import { appStore } from './store'
import { registerServiceWorker } from './pwa/registerServiceWorker'

registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={appStore}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Syne, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
            },
            success: { iconTheme: { primary: '#16b36e', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
