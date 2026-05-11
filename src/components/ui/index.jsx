import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

// ========== BUTTON ==========
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled = false, isLoading = false, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25',
  }
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <motion.button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={disabled || isLoading} 
      whileHover={disabled ? {} : { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  )
}

// ========== CARD ==========
export function Card({ children, className = '' }) {
  return (
    <motion.div 
      className={`glass-card rounded-2xl ${className}`}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
    >
      {children}
    </motion.div>
  )
}

// ========== INPUT ==========
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-surface-200">{label}</label>}
      <input className={`input-field ${error ? 'border-rose-500/50 focus:border-rose-500' : ''}`} {...props} />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}

// ========== MODAL ==========
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} glass-card rounded-2xl p-6 animate-scale-in`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-surface-200 hover:text-white cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

// ========== BADGE ==========
export function Badge({ children, variant = 'blue', className = '' }) {
  const variants = {
    blue: 'badge-blue',
    green: 'badge-green',
    purple: 'badge-purple',
    rose: 'badge-rose',
    amber: 'badge-amber',
  }
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ========== SELECT ==========
export function Select({ label, options, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-surface-200">{label}</label>}
      <select className="input-field appearance-none cursor-pointer" {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ========== PROGRESS BAR ==========
export function ProgressBar({ value, max, currencySymbol = '$', color = '#3b82f6', showLabel = true, size = 'md' }) {
  const percentage = Math.min((value / max) * 100, 100)
  const isOver = value > max

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-surface-200">{currencySymbol}{value.toLocaleString()}</span>
          <span className={isOver ? 'text-rose-400' : 'text-surface-700'}>{currencySymbol}{max.toLocaleString()}</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} rounded-full overflow-hidden bg-white/5`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: isOver
              ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
              : `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>
    </div>
  )
}

// ========== SKELETON ==========
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 animate-pulse ${className}`}
      style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }}
    />
  )
}

// ========== STAT CARD ==========
export function StatCard({ title, value, change, trend, icon, delay = 0, isGlass = true }) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-amber-400',
  }

  const icons = {
    wallet: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-400">
        <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5z" />
        <path d="M16 12a1 1 0 100 2 1 1 0 000-2z" fill="currentColor" />
      </svg>
    ),
    target: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-400">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    piggy: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    ),
    clock: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    'trending-down': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-400">
        <path d="M23 18l-9.5-9.5-5 5L1 6" />
        <polyline points="17 18 23 18 23 12" />
      </svg>
    ),
  }

  return (
    <motion.div 
      className={`${isGlass ? 'glass-card' : 'card'} p-6 relative overflow-hidden group`} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
    >
      {/* Decorative inner glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 
        ${icon === 'wallet' || icon === 'piggy' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
      />
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="p-3.5 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-all duration-300 border border-white/5 shadow-inner">
          {icons[icon] || icons['wallet']}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest ${trendColors[trend]}`}>
          {trend === 'up' && <span>↑</span>}
          {trend === 'down' && <span>↓</span>}
          {change}
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-1.5">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight tabular-nums">{value}</p>
      </div>
    </motion.div>
  )
}

// ========== EMPTY STATE ==========
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-surface-200 max-w-md">{description}</p>
    </div>
  )
}
