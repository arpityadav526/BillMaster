import { motion } from 'framer-motion'
import { categories } from '../../data/mockData'
import { formatAmount } from '../../utils/currency'

export default function CategoryTrends({ trends = {}, currentMonth = [], currencyCode = 'USD' }) {
  if (Object.keys(trends).length === 0 && currentMonth.length === 0) {
    return <div className="text-sm text-surface-700 py-4 italic text-center">No category data available</div>
  }

  // Get top 5 categories by current month spend
  const topCats = [...currentMonth].sort((a, b) => b.total - a.total).slice(0, 5)

  return (
    <div className="space-y-4">
      {topCats.map((cat, i) => {
        const catInfo = categories.find(c => c.id === cat._id) || { name: cat._id, color: '#64748b', icon: null }
        const history = trends[cat._id] || []
        
        // Find max in history for sparkline scaling
        const max = Math.max(...history.map(h => h.total), cat.total, 1)
        
        // Generate sparkline path (last 6 months)
        const points = history.slice(-6).map((h, idx, arr) => {
          const x = (idx / Math.max(1, arr.length - 1)) * 100
          const y = 100 - (h.total / max) * 100
          return `${x},${y}`
        }).join(' ')

        return (
          <motion.div 
            key={cat._id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-xl bg-surface-900/50 border border-white/5 hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center text-white" style={{ backgroundColor: catInfo.color }}>
              {catInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-white truncate">{catInfo.name}</span>
                <span className="text-sm font-bold text-white">{formatAmount(cat.total, currencyCode)}</span>
              </div>
              <div className="flex items-end justify-between h-8 gap-4">
                <div className="flex-1 h-full py-1">
                  {history.length > 1 ? (
                    <svg className="w-full h-full overflow-visible preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <polyline
                        points={points}
                        fill="none"
                        stroke={catInfo.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-80"
                      />
                    </svg>
                  ) : (
                    <div className="h-full flex items-center text-[10px] text-surface-700">Not enough history</div>
                  )}
                </div>
                <div className="text-[10px] text-surface-400 mb-1 w-12 text-right">
                  {cat.count} txns
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
