import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { FlowProvider } from './components/Flows'
import Layout from './components/Layout'
import { Spinner } from './components/ui'
import SplashScreen from './components/SplashScreen'
import WelcomeScreen from './components/WelcomeScreen'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Stations from './pages/Stations'
import Simulators from './pages/Simulators'
import History from './pages/History'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import SuperAdmin from './pages/SuperAdmin'

export default function App() {
  // Check if user has already seen the welcome intro in this session
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('vora_intro_seen')
  })
  const [showWelcome, setShowWelcome] = useState(false)
  const [authView, setAuthView] = useState(null) // null (shows Landing) | 'signin' | 'register_cafe'
  const { session, profile, loading, isAdmin, isSuperAdmin, signOut } = useAuth()

  const handleSplashFinish = () => {
    setShowSplash(false)
    setShowWelcome(true)
  }

  const handleWelcomeFinish = () => {
    setShowWelcome(false)
    sessionStorage.setItem('vora_intro_seen', 'true')
  }

  return (
    <ThemeProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && showWelcome && <WelcomeScreen onFinish={handleWelcomeFinish} />}
      {!showSplash && !showWelcome && (
        <div className="animate-in fade-in duration-700">
          {loading ? (
            <Spinner />
          ) : !session ? (
            authView ? (
              <Login initialMode={authView} onBackToLanding={() => setAuthView(null)} />
            ) : (
              <Landing 
                onOpenLogin={() => setAuthView('signin')} 
                onOpenRegister={() => setAuthView('register_cafe')} 
              />
            )
          ) : !profile?.active ? (
            <div className="mx-auto mt-24 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h1 className="font-display text-xl font-bold">Waiting for approval</h1>
              <p className="mt-2 text-sm text-slate-500">Your account is created but not active yet. Ask the administrator to activate it in Admin Settings → Staff.</p>
              <button onClick={signOut} className="mt-5 text-sm font-semibold text-brand-700">Sign out</button>
            </div>
          ) : isSuperAdmin ? (
            /* Dedicated Super Admin Master Portal - clean, focused, no cafe snacks or gaming stations */
            <SuperAdmin />
          ) : (
            /* Regular Gaming Cafe Operator / Admin View */
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
          )}
        </div>
      )}
    </ThemeProvider>
  )
}
