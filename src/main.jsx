import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import { configured } from './lib/supabase'
import './index.css'

function Missing() {
  return (
    <div className="mx-auto mt-24 max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h1 className="font-display text-xl font-bold">Supabase is not connected</h1>
      <p className="mt-2 text-sm">Copy <code>.env.example</code> to <code>.env</code>, fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart the app. See README.md.</p>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {configured ? (
      <HashRouter><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></HashRouter>
    ) : <Missing />}
  </React.StrictMode>
)
