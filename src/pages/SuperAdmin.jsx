import { useEffect, useState, useCallback } from 'react'
import {
  Building2,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Tv,
  Car,
  Gamepad2,
  Check,
  X,
  Clock,
  ShieldCheck,
  Search,
  Key,
  Copy,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Users,
  LogOut,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Sun,
  Flame
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth, toEmail } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Card, Button, Modal, Spinner, useToast, cx } from '../components/ui'
import { VORA_LOGO } from '../lib/logoData'
import { fmtDT, inr } from '../lib/format'

export default function SuperAdminPortal() {
  const { profile, signOut } = useAuth()
  const { isGaming, toggleTheme } = useTheme()
  const toast = useToast()

  // Navigation tabs in Super Admin
  // 'requests' | 'cafes' | 'reports' | 'system'
  const [tab, setTab] = useState('requests')

  // Requests state
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'pending' | 'approved' | 'rejected' | 'all'
  const [search, setSearch] = useState('')

  // Modal for approval & generating credentials
  const [selectedReq, setSelectedReq] = useState(null)
  const [genUsername, setGenUsername] = useState('')
  const [genPassword, setGenPassword] = useState('')
  const [busy, setBusy] = useState(false)

  // Custom Confirmation Dialog (Replaces raw browser confirm)
  const [confirmDialog, setConfirmDialog] = useState(null) // { title, message, onConfirm, type: 'danger' | 'info' }

  // Email / Credential Dispatch Preview Modal
  const [emailModalData, setEmailModalData] = useState(null)

  // System & platform metrics
  const [allUsers, setAllUsers] = useState([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Load Registration Requests (try direct table, fallback to get_all_cafe_requests RPC)
      let reqList = []
      const { data: reqData, error: reqErr } = await supabase
        .from('cafe_registration_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (!reqErr && reqData) {
        reqList = reqData
      } else {
        const { data: rpcList, error: rpcErr } = await supabase.rpc('get_all_cafe_requests')
        if (!rpcErr && rpcList) reqList = rpcList
      }
      setRequests(reqList)

      // 2. Load Registered Users
      const { data: uData } = await supabase.from('users').select('*')
      if (uData) setAllUsers(uData)

      // 3. Load Platform Sessions & Revenue
      const { data: sessData } = await supabase.from('gaming_sessions').select('final_amount, status')
      if (sessData) {
        setTotalSessions(sessData.length)
        const rev = sessData.reduce((sum, s) => sum + (Number(s.final_amount) || 0), 0)
        setTotalRevenue(rev)
      }
    } catch (e) {
      console.warn('Super admin fetch notice:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Open approve modal & auto-fill credentials
  const openApproveModal = (req) => {
    setSelectedReq(req)
    // Generate clean username from cafe/owner
    const base = req.cafe_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'cafe'
    const rnd = Math.floor(100 + Math.random() * 900)
    setGenUsername(`${base}_${rnd}`)
    // Generate secure random temporary password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let pwd = 'Vora@'
    for (let i = 0; i < 4; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    setGenPassword(pwd)
  }

  // Handle Approve and Create User Account
  const handleApprove = async () => {
    if (!selectedReq) return
    setBusy(true)
    try {
      const email = toEmail(genUsername)

      // 1. Create User via isolated Supabase client without persisting session to localStorage
      // This ensures Super Admin never gets logged out or switched to the new user!
      let userId = null
      
      // Try RPC first if available
      const { data: rpcUserId, error: rpcErr } = await supabase.rpc('create_lounge_user', {
        p_email: email,
        p_password: genPassword,
        p_full_name: selectedReq.owner_name,
        p_role: 'admin'
      })

      if (!rpcErr && rpcUserId) {
        userId = rpcUserId
      } else {
        // Fallback: Use isolated Supabase instance with persistSession: false
        // so the active Super Admin session in localStorage is untouched!
        const isolatedClient = supabase.auth ? (await import('@supabase/supabase-js')).createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          { auth: { persistSession: false, autoRefreshToken: false } }
        ) : null

        if (isolatedClient) {
          const { data: authData, error: authErr } = await isolatedClient.auth.signUp({
            email,
            password: genPassword,
            options: { data: { full_name: selectedReq.owner_name } }
          })
          if (authErr && !authErr.message?.includes('already registered')) {
            console.warn('Isolated signup notice:', authErr)
          }
          userId = authData?.user?.id
        }

        if (userId) {
          await supabase.from('users').upsert({
            id: userId,
            role: 'admin',
            active: true,
            full_name: selectedReq.owner_name,
            email
          })
        }
      }

      // 2. Setup Gaming Stations specifically tagged for this cafe / owner
      const numStations = parseInt(selectedReq.station_count) || 5
      const numSimulators = parseInt(selectedReq.simulator_count) || 2
      const newStations = []
      for (let i = 1; i <= Math.min(numStations, 20); i++) {
        newStations.push({
          name: `PS5 Station ${i}`,
          category: 'ps5',
          status: 'available',
          active: true,
          sort_order: i
        })
      }
      for (let i = 1; i <= Math.min(numSimulators, 10); i++) {
        newStations.push({
          name: `Racing Simulator ${i}`,
          category: 'simulator',
          status: 'available',
          active: true,
          sort_order: i
        })
      }
      if (newStations.length > 0) {
        // Clear old demo stations and seed the newly approved cafe stations
        await supabase.from('gaming_stations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('gaming_stations').insert(newStations)
      }

      // 3. Setup or Update Cafe Settings
      await supabase.from('settings').upsert({
        id: 1,
        cafe_name: selectedReq.cafe_name,
        phone: selectedReq.phone || '',
        address: selectedReq.address || '',
        receipt_prefix: selectedReq.cafe_name.slice(0, 3).toUpperCase() + '-'
      })

      // 4. Update Request record to Approved with generated credentials
      await supabase.from('cafe_registration_requests').update({
        status: 'approved',
        generated_username: genUsername,
        temporary_password: genPassword,
        created_user_id: userId || null,
        reviewed_at: new Date().toISOString()
      }).eq('id', selectedReq.id)

      toast(`Approved ${selectedReq.cafe_name}! Login credentials generated.`)

      // Auto open email dispatch modal with preformatted message
      const approvedCafe = selectedReq
      const user = genUsername
      const pass = genPassword
      setSelectedReq(null)
      loadAllData()

      // Prompt to dispatch email immediately
      openEmailModal({
        ...approvedCafe,
        generated_username: user,
        temporary_password: pass
      })
    } catch (e) {
      toast(e.message || 'Error approving cafe request', 'err')
    } finally {
      setBusy(false)
    }
  }

  // Handle Reject Request with custom modal
  const handleReject = (req) => {
    setConfirmDialog({
      title: 'Reject Cafe Application',
      message: `Are you sure you want to decline the gaming lounge registration for "${req.cafe_name}" (Owner: ${req.owner_name})?`,
      type: 'danger',
      confirmText: 'Decline Application',
      onConfirm: async () => {
        try {
          await supabase.from('cafe_registration_requests').update({
            status: 'rejected',
            reviewed_at: new Date().toISOString()
          }).eq('id', req.id)
          toast(`Registration declined for ${req.cafe_name}`)
          loadAllData()
        } catch (e) {
          toast(e.message, 'err')
        } finally {
          setConfirmDialog(null)
        }
      }
    })
  }

  // Prepare and open Email dispatch modal
  const openEmailModal = (req) => {
    const subject = `Congratulations! Your VORA Gaming OS Account is Approved - ${req.cafe_name}`
    const body = `Dear ${req.owner_name},

Congratulations! We are pleased to inform you that your registration request for "${req.cafe_name}" has been reviewed and officially approved by the VORA platform overseer team.

Your dedicated gaming lounge software access is now active and ready.

==================================================
YOUR MASTER LOGIN CREDENTIALS
==================================================
Lounge: ${req.cafe_name}
Username: ${req.generated_username}
Temporary Password: ${req.temporary_password}
Portal URL: ${window.location.origin}/#/
==================================================

You can sign in immediately at the portal URL above. Upon initial log in, your configured gaming stations (${req.station_count || 5} PS5 stations and ${req.simulator_count || 2} racing rigs) will be operational.

If you require any assistance, please reach out to our team.

Warm regards,
The Ameroids Team & VORA Gaming OS
Support: support@ameroids.com`

    setEmailModalData({
      to: req.email,
      owner: req.owner_name,
      cafe: req.cafe_name,
      subject,
      body,
      username: req.generated_username,
      password: req.temporary_password
    })
  }

  const sendEmailViaClient = () => {
    if (!emailModalData) return
    const mailto = `mailto:${encodeURIComponent(emailModalData.to)}?subject=${encodeURIComponent(emailModalData.subject)}&body=${encodeURIComponent(emailModalData.body)}`
    // Trigger via hidden anchor or window.location.href to avoid about:blank popup
    const a = document.createElement('a')
    a.href = mailto
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast('Invoking mail app...')
  }

  const openInGmail = () => {
    if (!emailModalData) return
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailModalData.to)}&su=${encodeURIComponent(emailModalData.subject)}&body=${encodeURIComponent(emailModalData.body)}`
    window.open(gmailUrl, '_blank')
    toast('Opening Gmail...')
  }

  const copyCreds = (u, p) => {
    navigator.clipboard.writeText(`Username: ${u}\nPassword: ${p}`)
    toast('Credentials copied to clipboard!')
  }

  // Filtering requests
  const filtered = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.cafe_name?.toLowerCase().includes(q) ||
      r.owner_name?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.address?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)] flex flex-col font-sans selection:bg-[var(--crimson)] selection:text-white transition-colors duration-200">

      {/* Top Super Admin Global Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-surface)]/95 border-b border-[var(--border-hairline)] backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--crimson)] to-[var(--wine)] p-1.5 flex items-center justify-center shadow-lg shadow-[var(--crimson-glow)]">
            <img src={VORA_LOGO} alt="VORA" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg text-[var(--ink-primary)] tracking-tight">VORA OS</span>
              <span className="rounded-full bg-[var(--crimson)]/20 px-2 py-0.5 text-[9px] font-black text-[var(--crimson)] border border-[var(--crimson)]/30 uppercase tracking-wider">
                Super Admin Master Deck
              </span>
            </div>
            <p className="text-[10px] text-[var(--ink-muted)]">Platform Management, Cafe Approvals &amp; Cross-Network Reports</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Light Mode / Gaming Mode toggle button */}
          <button
            onClick={toggleTheme}
            className={cx(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition border cursor-pointer',
              isGaming
                ? 'bg-[var(--bg-surface-soft)] text-amber-400 border-[var(--border-hairline)] hover:border-amber-400/50'
                : 'bg-white text-slate-700 border-slate-200 shadow-sm hover:border-[var(--crimson)]'
            )}
            title={isGaming ? 'Switch to Light Mode' : 'Switch to Gaming Mode'}
          >
            {isGaming ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Flame className="h-3.5 w-3.5 text-[var(--crimson)]" />
                <span className="hidden sm:inline">Gaming Mode</span>
              </>
            )}
          </button>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[var(--ink-primary)]">{profile?.full_name || 'Master SuperAdmin'}</span>
            <span className="text-[10px] text-emerald-500 font-mono">Platform Overseer</span>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 px-3 py-1.5 text-xs font-bold text-[var(--ink-muted)] transition cursor-pointer"
            title="Sign Out of Super Admin"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTab('requests')}
              className={cx(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer',
                tab === 'requests'
                  ? 'bg-gradient-to-r from-[#D9184B] to-[#73142D] text-white shadow-lg shadow-[#D9184B]/20'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-soft)]'
              )}
            >
              <Store className="h-3.5 w-3.5" /> Cafe Registration Applications
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black text-[9px] font-black">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab('reports')}
              className={cx(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer',
                tab === 'reports'
                  ? 'bg-gradient-to-r from-[#D9184B] to-[#73142D] text-white shadow-lg shadow-[#D9184B]/20'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-soft)]'
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Platform Telemetry &amp; Reports
            </button>

            <button
              onClick={() => setTab('cafes')}
              className={cx(
                'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer',
                tab === 'cafes'
                  ? 'bg-gradient-to-r from-[#D9184B] to-[#73142D] text-white shadow-lg shadow-[#D9184B]/20'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-soft)]'
              )}
            >
              <Users className="h-3.5 w-3.5" /> Registered Staff &amp; Lounges
            </button>
          </div>

          <button
            onClick={loadAllData}
            className="hidden sm:flex items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] px-3 py-1.5 text-xs font-bold text-[var(--ink-muted)] hover:text-[var(--ink-primary)] transition cursor-pointer"
          >
            <RefreshCw className={cx('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
          </button>
        </div>

        {/* ==================== TAB 1: CAFE APPLICATIONS ==================== */}
        {tab === 'requests' && (
          <div className="space-y-6">

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Pending Review</span>
                <p className="text-2xl font-black text-amber-500 mt-1">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Approved Lounges</span>
                <p className="text-2xl font-black text-emerald-500 mt-1">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Declined Requests</span>
                <p className="text-2xl font-black text-rose-500 mt-1">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Total Applications</span>
                <p className="text-2xl font-black text-[var(--ink-primary)] mt-1">
                  {requests.length}
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-sm">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {[
                  ['pending', 'Pending Approval'],
                  ['approved', 'Approved'],
                  ['rejected', 'Rejected'],
                  ['all', 'All Applications']
                ].map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={cx(
                      'rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer',
                      filter === k
                        ? 'bg-[var(--crimson)] text-white shadow-sm'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-soft)]'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--ink-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search cafe, owner, city..."
                  className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] pl-8 pr-3 py-1.5 text-xs text-[var(--ink-primary)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--crimson)]"
                />
              </div>
            </div>

            {/* Request Cards */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-12 text-center shadow-sm">
                <Store className="h-10 w-10 text-[var(--ink-muted)] mx-auto mb-3 opacity-40" />
                <h3 className="font-bold text-sm text-[var(--ink-primary)]">No registration applications</h3>
                <p className="text-xs text-[var(--ink-muted)] mt-1">No requests currently matching the selected filter ({filter}).</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 relative overflow-hidden shadow-sm transition hover:border-[var(--crimson)]/30">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                      {/* Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-display text-base font-bold text-[var(--ink-primary)]">
                            {r.cafe_name}
                          </h3>
                          <span className={cx(
                            'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider',
                            r.status === 'pending' && 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
                            r.status === 'approved' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
                            r.status === 'rejected' && 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          )}>
                            {r.status}
                          </span>
                          <span className="text-[10px] text-[var(--ink-muted)] font-mono">
                            {fmtDT(r.created_at)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[var(--ink-muted)]">
                          <span className="flex items-center gap-1 text-[var(--ink-primary)]">
                            <User className="h-3.5 w-3.5 text-[var(--crimson)]" />
                            <strong>Owner:</strong> {r.owner_name}
                          </span>
                          <span className="flex items-center gap-1 text-[var(--ink-secondary)]">
                            <Mail className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                            {r.email}
                          </span>
                          {r.phone && (
                            <span className="flex items-center gap-1 text-[var(--ink-secondary)]">
                              <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              {r.phone}
                            </span>
                          )}
                          {r.address && (
                            <span className="flex items-center gap-1 text-[var(--ink-secondary)]">
                              <MapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                              {r.address}
                            </span>
                          )}
                        </div>

                        {/* Hardware Capacity */}
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-surface-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-primary)] border border-[var(--border-hairline)]">
                            <Tv className="h-3 w-3 text-cyan-600 dark:text-cyan-400" /> {r.station_count} PS5 Stations
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-surface-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-primary)] border border-[var(--border-hairline)]">
                            <Car className="h-3 w-3 text-orange-600 dark:text-orange-400" /> {r.simulator_count} Racing Rigs
                          </span>
                        </div>

                        {/* Issued Credentials if Approved */}
                        {r.status === 'approved' && r.generated_username && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Issued Credentials:</span>
                            <code className="text-[var(--ink-primary)] bg-[var(--bg-surface-soft)] px-2 py-0.5 rounded font-mono border border-[var(--border-hairline)]">
                              User: {r.generated_username}
                            </code>
                            <code className="text-[var(--ink-primary)] bg-[var(--bg-surface-soft)] px-2 py-0.5 rounded font-mono border border-[var(--border-hairline)]">
                              Pass: {r.temporary_password}
                            </code>
                            <button
                              onClick={() => copyCreds(r.generated_username, r.temporary_password)}
                              className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-[var(--crimson)] cursor-pointer"
                              title="Copy credentials"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEmailModal(r)}
                              className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[var(--crimson)] hover:bg-[var(--crimson-hover)] text-white px-2.5 py-1 text-[11px] font-bold shadow-sm cursor-pointer transition"
                              title="Send Email with Congratulations & Credentials"
                            >
                              <Send className="h-3 w-3" /> Send Email
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                        {r.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => openApproveModal(r)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve &amp; Generate Credentials
                            </button>
                            <button
                              onClick={() => handleReject(r)}
                              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-3 py-2 text-xs font-bold cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </button>
                          </>
                        ) : r.status === 'approved' ? (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4" /> Approved Lounge
                            </span>
                            <button
                              onClick={() => openEmailModal(r)}
                              className="flex items-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] hover:border-[var(--crimson)] px-3 py-1.5 text-xs font-bold text-[var(--ink-primary)] cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5 text-[var(--crimson)]" /> Resend Email
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                            Declined
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: PLATFORM REPORTS ==================== */}
        {tab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Network Revenue</span>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-3xl font-black text-[var(--ink-primary)]">{inr(totalRevenue)}</p>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">Combined gross earnings across all registered gaming cafes</p>
              </div>

              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Gaming Matches Logged</span>
                  <Gamepad2 className="h-4 w-4 text-cyan-500" />
                </div>
                <p className="text-3xl font-black text-[var(--ink-primary)]">{totalSessions}</p>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">Total completed station and simulator sessions logged</p>
              </div>

              <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Active Operators</span>
                  <Users className="h-4 w-4 text-[var(--crimson)]" />
                </div>
                <p className="text-3xl font-black text-[var(--ink-primary)]">{allUsers.length}</p>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1">Verified administrator &amp; staff profiles currently registered</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--ink-primary)]">Platform Health &amp; Telemetry</h3>
                  <p className="text-xs text-[var(--ink-muted)]">Real-time status of the Cloud Supabase central backend</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Cloud Engine Online
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-hairline)] space-y-2">
                  <span className="text-xs font-bold text-[var(--ink-primary)]">Database Engine</span>
                  <p className="text-xs text-[var(--ink-muted)]">Supabase Managed Postgres (PostgreSQL 15)</p>
                  <p className="text-[11px] text-emerald-500 font-mono">Row Level Security Active · Realtime Replication Enabled</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-hairline)] space-y-2">
                  <span className="text-xs font-bold text-[var(--ink-primary)]">Authentication Protocols</span>
                  <p className="text-xs text-[var(--ink-muted)]">JWT Token Session Authentication · Dual-role RBAC</p>
                  <p className="text-[11px] text-cyan-500 font-mono">Anonymous Public Applications · Secure Backend Handshake</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: REGISTERED USERS ==================== */}
        {tab === 'cafes' && (
          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[var(--border-hairline)]">
              <h3 className="font-bold text-base text-[var(--ink-primary)]">Registered Users &amp; Staff</h3>
              <p className="text-xs text-[var(--ink-muted)]">Active accounts authorized to operate gaming lounges</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[var(--ink-muted)]">
                <thead className="bg-[var(--bg-surface-soft)] text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] border-b border-[var(--border-hairline)]">
                  <tr>
                    <th className="px-5 py-3">User / Full Name</th>
                    <th className="px-5 py-3">Email / Login ID</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)]">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-surface-soft)] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[var(--ink-primary)]">{u.full_name || 'Anonymous'}</td>
                      <td className="px-5 py-3.5 font-mono text-cyan-600 dark:text-cyan-400">{u.email || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={cx(
                          'rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
                          u.role === 'superadmin' ? 'bg-[var(--crimson)]/20 text-[var(--crimson)] border border-[var(--crimson)]/30' : 'bg-slate-200 dark:bg-slate-700/50 text-[var(--ink-muted)]'
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cx(
                          'rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
                          u.active ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        )}>
                          {u.active ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--ink-muted)] font-mono">{fmtDT(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Approve & Issue Credentials */}
      {selectedReq && (
        <Modal
          open={Boolean(selectedReq)}
          onClose={() => setSelectedReq(null)}
          title={`Approve Lounge: ${selectedReq.cafe_name}`}
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-400">
              Approving will automatically initialize this gaming cafe and generate master administrator login credentials to be provided to <strong>{selectedReq.owner_name}</strong>.
            </p>

            <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Applicant Email:</span>
                <span className="font-bold text-white">{selectedReq.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Requested Capacity:</span>
                <span className="font-bold text-white">{selectedReq.station_count} PS5s · {selectedReq.simulator_count} Rigs</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Generated Staff / Admin Username
                </label>
                <input
                  type="text"
                  value={genUsername}
                  onChange={(e) => setGenUsername(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D9184B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Master Temporary Password
                </label>
                <input
                  type="text"
                  value={genPassword}
                  onChange={(e) => setGenPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D9184B]"
                />
              </div>
            </div>

            <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-200">
              💡 <strong>Next Step:</strong> Forward these credentials to <code>{selectedReq.email}</code>. They will enter via the VORA Login Portal.
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <Button
                onClick={handleApprove}
                loading={busy}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-xs"
              >
                Confirm Approval &amp; Issue
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Custom Confirmation Dialog (Replaces raw browser confirm) */}
      {confirmDialog && (
        <Modal
          open={Boolean(confirmDialog)}
          onClose={() => setConfirmDialog(null)}
          title={confirmDialog.title}
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[var(--ink-primary)]">Attention Required</p>
                <p className="text-[var(--ink-secondary)]">{confirmDialog.message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--ink-muted)] hover:bg-[var(--bg-surface-soft)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Email Credentials Dispatch */}
      {emailModalData && (
        <Modal
          open={Boolean(emailModalData)}
          onClose={() => setEmailModalData(null)}
          title={`Email Credentials — ${emailModalData.cafe}`}
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
              <div>
                <span className="text-[var(--ink-muted)] block text-[10px] uppercase font-bold">Recipient Email</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{emailModalData.to}</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-bold">
                Ready to Send
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--ink-primary)]">Email Message Preview:</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(emailModalData.body)
                    toast('Full email text copied to clipboard!')
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--crimson)] hover:underline cursor-pointer"
                >
                  <Copy className="h-3 w-3" /> Copy Message Text
                </button>
              </div>

              <textarea
                value={emailModalData.body}
                onChange={(e) => setEmailModalData({ ...emailModalData, body: e.target.value })}
                rows={11}
                className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-soft)] p-3 text-xs text-[var(--ink-primary)] font-mono leading-relaxed focus:outline-none focus:border-[var(--crimson)] resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-[var(--ink-muted)]">
                Sender Signature: <strong>The Ameroids Team &amp; VORA</strong>
              </span>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setEmailModalData(null)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-[var(--ink-muted)] hover:bg-[var(--bg-surface-soft)] cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={openInGmail}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 cursor-pointer transition"
                  title="Open directly in Gmail Web"
                >
                  <Mail className="h-3.5 w-3.5" /> Open in Gmail
                </button>
                <button
                  type="button"
                  onClick={sendEmailViaClient}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--crimson)] to-[var(--wine)] hover:opacity-95 shadow-md shadow-[var(--crimson-glow)] cursor-pointer transition"
                  title="Open in Outlook / Windows Mail App"
                >
                  <Send className="h-3.5 w-3.5" /> Default Mail App
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}
