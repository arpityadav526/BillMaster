import { motion } from 'framer-motion'
import { ProgressBar } from '../../components/ui/index'
import { categories } from '../../data/mockData'
import { formatAmount } from '../../utils/currency'

export default function BudgetPanel({ budgets = [], currency = 'USD' }) {
  if (!budgets || budgets.length === 0) {
    return <div className="text-sm text-surface-700 py-8 text-center italic">No budgets set for this month</div>
  }

  // Sort by percentage used
  const sorted = [...budgets].sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="space-y-4">
      {sorted.map((b, i) => {
        const catInfo = categories.find(c => c.id === b.category)
        const color = catInfo?.color || '#3b82f6'
        const isOver = b.percentage > 100

        return (
          <motion.div 
            key={b.category}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl bg-surface-900/40 border border-white/5"
          >
            <div className="flex justify-between items-end mb-2">
              <div>
                <h4 className="text-sm font-semibold text-white">{catInfo?.name || b.category}</h4>
                <p className="text-[10px] text-surface-400 mt-0.5">{b.percentage}% used</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${isOver ? 'text-rose-400' : 'text-white'}`}>
                  {formatAmount(b.spent, currency)}
                </span>
                <span className="text-xs text-surface-500"> / {formatAmount(b.limit, currency)}</span>
              </div>
            </div>
            <ProgressBar value={b.spent} max={b.limit} color={color} showLabel={false} size="sm" />
          </motion.div>
        )
      })}
    </div>
  )
}
