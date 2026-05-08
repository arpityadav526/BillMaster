import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Badge, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Brain, Zap, AlertTriangle,
  CheckCircle2, Lightbulb, Target, ArrowUpRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import * as expenseService from '../services/expense.service'
import * as budgetService from '../services/budget.service'
import * as analyticsService from '../services/analytics.service'
import { useAuth } from '../context/AuthContext'
import { getCurrencySymbol, formatAmount } from '../utils/currency'

const CustomTooltip = ({ active, payload, label, currencySymbol = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-xs">
        <p className="text-surface-200 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: {currencySymbol}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const currencySymbol = getCurrencySymbol(user?.currency)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [stats, setStats] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [insights, setInsights] = useState([])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const [statsRes, budgetsRes, insightsRes] = await Promise.all([
        expenseService.getStats(),
        budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
        analyticsService.getInsights()
      ])
      setStats(statsRes.data)
      setBudgets(budgetsRes.data)
      setInsights(insightsRes.data || [])
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const trendData = stats?.monthlyTrend?.map(t => ({
    month: new Date(t._id.year, t._id.month - 1).toLocaleString('default', { month: 'short' }),
    expenses: t.total,
    income: 6500 // TODO: Replace with real income data once Income model is built
  })) || []

  const catSpending = stats?.byCategory?.map(c => {
    const catInfo = categories.find(cat => cat.id === c._id)
    return {
      name: catInfo ? catInfo.name : c._id,
      value: c.total,
      count: c.count,
      color: catInfo ? catInfo.color : '#64748b'
    }
  }) || []

  const budgetComparison = budgets.map(b => {
    const catInfo = categories.find(c => c.id === b.category)
    return {
      name: catInfo?.name || b.category,
      budget: b.limit,
      spent: b.spent,
      color: catInfo?.color || '#64748b'
    }
  })

  const totalExpenses = stats?.currentMonth?.total || 0
  const totalIncome = 6500 // TODO: Replace with real income
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0

  const insightIcons = { warning: AlertTriangle, success: CheckCircle2, info: Zap, tip: Lightbulb }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-sm text-surface-700">Deep insights into your financial patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Total Expenses</span>
                <div className="p-2 rounded-lg bg-rose-500/10"><TrendingUp className="w-4 h-4 text-rose-400" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{formatAmount(totalExpenses, user?.currency)}</p>
              <p className="text-xs text-surface-700 mt-1">{stats?.currentMonth?.count || 0} transactions</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Net Cash Flow</span>
                <div className="p-2 rounded-lg bg-emerald-500/10"><ArrowUpRight className="w-4 h-4 text-emerald-400" /></div>
              </div>
              <p className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(totalIncome - totalExpenses) >= 0 ? '+' : ''}{formatAmount(Math.abs(totalIncome - totalExpenses), user?.currency)}
              </p>
              <p className="text-xs text-surface-700 mt-1">Income - Expenses</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Savings Rate</span>
                <div className="p-2 rounded-lg bg-primary-500/10"><Target className="w-4 h-4 text-primary-400" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{savingsRate}%</p>
              <p className="text-xs text-surface-700 mt-1">Of total income</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Change vs Last Month</span>
                <div className={`p-2 rounded-lg ${stats?.changePercent > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                  {stats?.changePercent > 0 ? <TrendingUp className="w-4 h-4 text-rose-400" /> : <TrendingDown className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
              <p className={`text-2xl font-bold ${stats?.changePercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stats?.changePercent > 0 ? '+' : ''}{stats?.changePercent || 0}%
              </p>
              <p className="text-xs text-surface-700 mt-1">Spending trend</p>
            </motion.div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Spending Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Spending Trends</h3>
              <p className="text-xs text-surface-700 mt-1">Income vs Expenses over time</p>
            </div>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {['week', 'month', 'year'].map(r => (
                <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${timeRange === r ? 'bg-emerald-500/20 text-emerald-400' : 'text-surface-700 hover:text-surface-200'}`}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incGrad)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h3 className="text-lg font-semibold text-white mb-2">Category Breakdown</h3>
          <p className="text-xs text-surface-700 mb-4">This month's spending</p>
          {catSpending.length === 0 ? (
            <div className="py-12 text-center text-sm text-surface-700 italic">No spending data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catSpending} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {catSpending.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {catSpending.slice(0, 5).map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: c.color }} /><span className="text-surface-200">{c.name}</span></div>
                    <span className="text-white font-medium">{formatAmount(c.value, user?.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Budget Comparison + ML Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Budget vs Actual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Budget vs Actual</h3>
          {budgetComparison.length === 0 ? (
            <div className="py-12 text-center text-sm text-surface-700 italic">No budgets set for this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetComparison} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="#334155" radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* ML Insights & Predictions */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="card gradient-border">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-accent-400" />
              <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
              <Badge variant="purple">AI</Badge>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : insights.length === 0 ? (
              <div className="py-12 text-center text-sm text-surface-700 italic">Add some expenses to get personalized insights</div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                      insight.type === 'warning' ? 'border-amber-500/50 bg-amber-500/10 glow-purple' :
                      insight.type === 'success' ? 'border-emerald-500/50 bg-emerald-500/10 glow-blue' :
                      'border-primary-500/30 bg-primary-500/5'
                    }`}
                  >
                    <div className="flex gap-3 relative z-10">
                      <div className="flex-shrink-0 mt-0.5">
                        {(() => {
                          const Icon = insightIcons[insight.type] || Zap;
                          return <Icon className={`w-5 h-5 ${insight.type === 'warning' ? 'text-amber-400' : insight.type === 'success' ? 'text-emerald-400' : insight.type === 'tip' ? 'text-accent-400' : 'text-primary-400'}`} />
                        })()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-1 tracking-wide">{insight.title}</h4>
                        <p className="text-xs text-surface-200 leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Savings Prediction Widget */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="card border-primary-500/20 bg-primary-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-2xl rounded-full" />
            <h3 className="text-lg font-semibold text-white mb-2">Savings Projection</h3>
            <p className="text-xs text-surface-200 mb-4">Based on your current 30-day velocity</p>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold text-emerald-400">
                {formatAmount(totalIncome > 0 ? Math.max(0, totalIncome - (totalExpenses * 1.2)) : 0, user?.currency)}
              </span>
              <span className="text-sm text-surface-700 pb-1">predicted savings</span>
            </div>
            <div className="w-full h-2 bg-surface-900 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-primary-500 w-3/4 rounded-full" />
            </div>
            <p className="text-[10px] text-surface-700 mt-2">You are on track to save 75% of your target this month.</p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
