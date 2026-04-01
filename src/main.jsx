import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
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
  </React.StrictMode>,
)
