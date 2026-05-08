import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Upload, CreditCard, Settings, LogOut,
  ChevronLeft, ChevronRight, TrendingUp, Menu, X, Bell, Search, Plus,
  Link2, CheckCircle2, Info, AlertTriangle, Lightbulb, DollarSign, User as UserIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import * as notificationService from '../../services/notification.service'
import ParticleBackground from './ParticleBackground'

// ========== NAV ITEMS ==========
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/expenses', label: 'Expenses', icon: CreditCard },
  { path: '/receipts', label: 'Receipts', icon: Upload },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  { path: '/connected-accounts', label: 'Linked Apps', icon: Link2 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

// ========== BILLMASTER LOGO ==========
function BillMasterLogo({ collapsed }) {
  return (
    <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
        <DollarSign className="w-5 h-5 text-white" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold text-white tracking-tight">
          Bill<span className="text-emerald-400">Master</span>
        </span>
      )}
    </div>
  )
}

// ========== NOTIFICATION PANEL ==========
function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const res = await notificationService.getNotifications()
        setNotifications(res.data || [])
      } catch {
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  const insightIcons = {
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    info: <Info className="w-4 h-4 text-primary-400" />,
    tip: <Lightbulb className="w-4 h-4 text-accent-400" />,
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-14 w-80 sm:w-96 glass-card rounded-2xl border border-white/10 shadow-2xl shadow-black/40 z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-surface-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-xs text-surface-700">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-surface-700 mx-auto mb-2" />
                <p className="text-sm text-surface-700">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((n) => (
                  <div key={n._id} className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 mt-0.5">{insightIcons[n.type] || insightIcons.info}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{n.title}</p>
                      <p className="text-xs text-surface-200 line-clamp-2">{n.description}</p>
                      <p className="text-xs text-surface-700 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ========== NAV CONTENT ==========
const NavContent = ({ collapsed, setMobileOpen, location, logout }) => {
  const isActive = (path) => location.pathname === path

  return (
    <>
      <BillMasterLogo collapsed={collapsed} />

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive(item.path)
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-surface-200 hover:bg-white/5 hover:text-white'
              }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.path) ? 'text-emerald-400' : 'text-surface-700 group-hover:text-surface-200'}`} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-200 hover:bg-white/5 hover:text-white transition-all duration-200 w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-surface-700" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </>
  )
}

// ========== SIDEBAR ==========
export function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass cursor-pointer"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full bg-surface-950 border-r border-white/5 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-surface-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent collapsed={false} setMobileOpen={setMobileOpen} location={location} logout={logout} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen border-r border-white/5 bg-surface-950/80 backdrop-blur-xl transition-all duration-300 z-40
          ${collapsed ? 'w-[72px]' : 'w-60'}`}
      >
        <NavContent collapsed={collapsed} setMobileOpen={setMobileOpen} location={location} logout={logout} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-surface-700 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-surface-200" /> : <ChevronLeft className="w-3 h-3 text-surface-200" />}
        </button>
      </aside>
    </>
  )
}

// ========== TOP NAVBAR ==========
export function TopNavbar({ onAddExpense }) {
  const { user } = useAuth()
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const toggleNotif = useCallback(() => setNotifOpen(prev => !prev), [])
  const closeNotif = useCallback(() => setNotifOpen(false), [])

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Search */}
        <div className={`relative max-w-md flex-1 transition-all duration-300 ${searchFocused ? 'max-w-lg' : ''}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-700" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white/5 border border-white/5 text-surface-100 placeholder:text-surface-700 focus:outline-none focus:border-primary-500/30 focus:bg-white/8 transition-all duration-200"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onAddExpense}
            className="btn-primary !py-2 !px-4 !text-xs hidden sm:inline-flex cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={toggleNotif}
              className="relative p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-surface-200" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <NotificationPanel isOpen={notifOpen} onClose={closeNotif} />
          </div>

          <Link to="/settings" className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center cursor-pointer overflow-hidden ring-offset-2 ring-offset-surface-950 transition-all hover:ring-2 hover:ring-emerald-500/50">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className={`w-full h-full bg-surface-800 flex items-center justify-center ${user?.avatar ? 'hidden' : 'flex'}`}>
              <UserIcon className="w-4 h-4 text-surface-400" />
            </div>
            <span className={`text-xs font-bold text-white ${user?.avatar ? 'hidden' : ''}`}>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

// ========== DASHBOARD LAYOUT ==========
export function DashboardLayout({ children, onAddExpense }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface-950">
      <ParticleBackground />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-60'}`}>
        <TopNavbar onAddExpense={onAddExpense} />
        <main className="p-4 lg:p-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
