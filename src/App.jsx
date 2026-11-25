import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { FlowProvider } from './components/Flows'
import Layout from './components/Layout'
import { Spinner } from './components/ui'
import SplashScreen from './components/SplashScreen'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Stations from './pages/Stations'
import Simulators from './pages/Simulators'
import History from './pages/History'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('vora_splash_shown'))
  const { session, profile, loading, isAdmin, signOut } = useAuth()

  const handleSplashFinish = () => {
    sessionStorage.setItem('vora_splash_shown', 'true')
    setShowSplash(false)
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  if (loading) return <Spinner />
  if (!session) return <Login />
  if (!profile?.active) {
    return (
      <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-xl font-bold">Waiting for approval</h1>
        <p className="mt-2 text-sm text-slate-500">Your account is created but not active yet. Ask the administrator to activate it in Admin Settings → Staff.</p>
        <button onClick={signOut} className="mt-5 text-sm font-semibold text-brand-700">Sign out</button>
      </div>
    )
  }
  return (
    <DataProvider>
      <FlowProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stations" element={<Stations />} />
            <Route path="/simulators" element={<Simulators />} />
            <Route path="/history" element={<History />} />
            <Route path="/reports" element={isAdmin ? <Reports /> : <Navigate to="/" />} />
            <Route path="/settings" element={isAdmin ? <Settings /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </FlowProvider>
    </DataProvider>
  )
}
