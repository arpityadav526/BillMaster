import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Skeleton, Badge } from '../components/ui/index'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { getCurrencySymbol, formatAmount } from '../utils/currency'
import * as analyticsService from '../services/analytics.service'

import HealthGauge from './analytics/HealthGauge'
import AIChatWidget from './analytics/AIChatWidget'
import SpendingHeatmap from './analytics/SpendingHeatmap'
import CategoryTrends from './analytics/CategoryTrends'
import BudgetPanel from './analytics/BudgetPanel'

const CustomTooltip = ({ active, payload, label, currencySymbol = '$' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-xs">
        <p className="text-surface-200 mb-1 font-bold">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: {currencySymbol}{entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
  const currencyCode = user?.currency || 'USD'
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await analyticsService.getDashboard()
      setData(res.data || res)
    } catch (err) {
      console.error('Failed to fetch analytics dashboard:', err)
      setError('Could not load analytics. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (error) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <Activity className="w-12 h-12 text-rose-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-surface-400 mb-6">{error}</p>
          <button onClick={fetchData} className="btn-primary">Try Again</button>
        </div>
      </DashboardLayout>
    )
  }

  const S = data?.summary || {}
  const H = data?.healthScore || { score: 0, label: 'N/A' }

  // Format charts data
  const trendData = (data?.monthlyTrend || []).map(t => ({
    month: new Date(t.year, t.month - 1).toLocaleString('default', { month: 'short' }),
    Expenses: t.expenses,
    Income: t.income,
    Savings: t.savings
  }))

  const topMerchants = data?.topMerchants || []

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 tracking-tight">Analytics Studio</h1>
          <p className="text-sm text-surface-400">Deep insights into your financial behavior</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="green">ML Powered</Badge>
          <Badge variant="blue">Real-time</Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <>
          {/* Top KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="stat-card-new p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-400 uppercase tracking-wider font-semibold">Net Cash Flow</span>
                <div className={`p-1.5 rounded-lg ${S.netCashFlow >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  {S.netCashFlow >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                </div>
              </div>
              <p className={`text-2xl font-bold ${S.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {S.netCashFlow >= 0 ? '+' : ''}{formatAmount(S.netCashFlow, currencyCode)}
              </p>
              <div className="mt-2 text-[10px] text-surface-500 flex justify-between">
                <span>In: {formatAmount(S.currentMonthIncome, currencyCode)}</span>
                <span>Out: {formatAmount(S.currentMonthExpenses, currencyCode)}</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card-new p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-400 uppercase tracking-wider font-semibold">Savings Rate</span>
                <div className="p-1.5 rounded-lg bg-primary-500/10"><Target className="w-4 h-4 text-primary-400" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{S.savingsRate}%</p>
              <p className="text-xs text-surface-400 mt-2">{S.thirtyDayChange > 0 ? '+' : ''}{S.thirtyDayChange}% vs last 30d</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card-new p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-400 uppercase tracking-wider font-semibold">Daily Run Rate</span>
                <div className="p-1.5 rounded-lg bg-accent-400/10"><Zap className="w-4 h-4 text-accent-400" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{formatAmount(S.dailyRunRate, currencyCode)}<span className="text-sm font-normal text-surface-500">/day</span></p>
              <p className="text-xs text-surface-400 mt-2">Proj. EOM: {formatAmount(S.projectedMonthEnd, currencyCode)}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card-new p-5 relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-2xl rounded-full" />
              <div className="z-10 flex-1">
                <span className="text-xs text-surface-400 uppercase tracking-wider font-semibold block mb-1">Financial Health</span>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={H.score >= 65 ? 'green' : (H.score >= 45 ? 'amber' : 'rose')}>{H.label}</Badge>
                </div>
                <p className="text-[10px] text-surface-500 mt-3 leading-tight max-w-[120px]">Based on savings, budget & trends</p>
              </div>
              <div className="z-10 -mr-4">
                <HealthGauge score={H.score} label={H.label} />
              </div>
            </motion.div>
          </div>

          {/* Main Charts & Heatmap Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 stat-card-new p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Income vs Expenses</h3>
                  <p className="text-xs text-surface-400 mt-1">12-month historical performance</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fill="url(#incGrad)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={3} fill="url(#expGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card-new p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-1">Spending Heatmap</h3>
              <p className="text-xs text-surface-400 mb-6">Last 90 days activity</p>
              
              <div className="flex-1 flex flex-col justify-center overflow-x-auto custom-scrollbar pb-4">
                <SpendingHeatmap data={data?.dailyHeatmap} currencySymbol={currencySymbol} />
              </div>
            </motion.div>
          </div>

          {/* Deep Dives Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Category Trends */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="stat-card-new p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Category Velocity</h3>
              <p className="text-xs text-surface-400 mb-6">Top categories (6mo trend)</p>
              <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                <CategoryTrends trends={data?.categoryTrends} currentMonth={data?.byCategory} currencyCode={currencyCode} />
              </div>
            </motion.div>

            {/* Weekly Rhythm */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="stat-card-new p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Weekly Rhythm</h3>
              <p className="text-xs text-surface-400 mb-6">Spending pattern by day (90d)</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.weeklyPattern || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip currencySymbol={currencySymbol} />} />
                  <Bar dataKey="total" name="Total Spent" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Merchants */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="stat-card-new p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Top Merchants</h3>
              <p className="text-xs text-surface-400 mb-6">Where your money goes (90d)</p>
              <div className="space-y-3">
                {topMerchants.length === 0 ? (
                  <div className="text-sm text-surface-700 italic text-center py-8">No merchant data available</div>
                ) : (
                  topMerchants.map((m, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-surface-900/50 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{m._id || 'Unknown'}</p>
                        <p className="text-[10px] text-surface-400 capitalize">{m.category} • {m.count} txns</p>
                      </div>
                      <span className="text-sm font-bold text-white ml-2">
                        {formatAmount(m.total, currencyCode)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Budgets & AI Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="stat-card-new p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Budget Adherence</h3>
              <p className="text-xs text-surface-400 mb-6">Current month progress</p>
              <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                <BudgetPanel budgets={data?.budgetComparison} currency={currencyCode} />
              </div>
            </motion.div>

            <AIChatWidget />
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
