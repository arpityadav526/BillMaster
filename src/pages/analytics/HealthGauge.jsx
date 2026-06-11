import { motion } from 'framer-motion'

const COLORS = { Excellent: '#10b981', Good: '#34d399', Fair: '#fbbf24', Poor: '#f43f5e' }

export default function HealthGauge({ score = 0, label = 'Fair' }) {
  const color = COLORS[label] || '#fbbf24'
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (score / 100) * circumference * 0.75

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="130" viewBox="0 0 140 110">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Background arc */}
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference * 0.75}
          strokeDashoffset={0} transform="rotate(135 70 70)" />
        {/* Value arc */}
        <motion.circle cx="70" cy="70" r="54" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference * 0.75}
          initial={{ strokeDashoffset: circumference * 0.75 }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          transform="rotate(135 70 70)"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }} />
        <text x="70" y="62" textAnchor="middle" fill="white" fontSize="28" fontWeight="800" fontFamily="Sora, sans-serif">
          {score}
        </text>
        <text x="70" y="82" textAnchor="middle" fill={color} fontSize="11" fontWeight="600">
          {label}
        </text>
      </svg>
    </div>
  )
}
