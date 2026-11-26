import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import { configured } from './lib/supabase'
import './index.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e1422] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#182035] border border-rose-500/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-rose-400 mb-2">Display Re-sync Required</h2>
            <p className="text-xs text-slate-300 mb-4">
              A temporary DOM synchronization issue occurred. Click the button below to reload cleanly.
            </p>
            <p className="text-[11px] font-mono bg-black/40 text-rose-300 p-2.5 rounded-lg mb-4 text-left overflow-x-auto">
              {this.state.error?.message || 'NotFoundError'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D9184B] to-[#73142D] text-white font-bold text-sm shadow-lg hover:opacity-95"
            >
              Reload VORA
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function Missing() {
  return (
    <div className="mx-auto mt-24 max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h1 className="font-display text-xl font-bold">Supabase is not connected</h1>
      <p className="mt-2 text-sm">Copy <code>.env.example</code> to <code>.env</code>, fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart the app. See README.md.</p>
    </div>
  )
}

const rootEl = document.getElementById('root')
if (!window.__vora_root) {
  window.__vora_root = createRoot(rootEl)
}

window.__vora_root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {configured ? (
        <HashRouter><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></HashRouter>
      ) : <Missing />}
    </ErrorBoundary>
  </React.StrictMode>
)
