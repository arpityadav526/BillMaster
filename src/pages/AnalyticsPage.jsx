import { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Badge, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Brain, Zap, AlertTriangle,
  CheckCircle2, Lightbulb, Target, ArrowUpRight, Send, Bot, User as UserIcon, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as expenseService from '../services/expense.service'
import * as budgetService from '../services/budget.service'
import * as analyticsService from '../services/analytics.service'
import * as incomeService from '../services/income.service'
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

// ── AI Chat Widget ──────────────────────────────────────────────────────────
function AIChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI financial advisor. Ask me anything about your spending, savings, or budget. 💡" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || isLoading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setIsLoading(true)
    try {
      const res = await analyticsService.chatWithAI(q)
      setMessages(prev => [...prev, { role: 'ai', text: res.answer || 'Sorry, I could not answer that.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'The AI service is currently unavailable. Make sure the ML service is running.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const QUICK = ['How much did I spend this month?', "What's my savings rate?", 'Show my spending trend', 'Any recurring charges?']

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
      className="stat-card-new gradient-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-accent-400/10 border border-accent-400/20">
          <Brain className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Financial Advisor</h3>
          <p className="text-xs text-surface-700">Ask anything about your finances</p>
        </div>
        <Badge variant="purple" className="ml-auto">AI Chat</Badge>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK.map(q => (
          <button key={q} onClick={() => { setInput(q); }}
            className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-surface-200 hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-400 transition-all cursor-pointer">
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="h-48 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-accent-400" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
              m.role === 'user'
                ? 'bg-primary-500/20 border border-primary-500/30 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-surface-200 rounded-tl-sm'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4 text-primary-400" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent-400" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-400/60 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your finances..."
          className="input-field flex-1 py-2.5 text-xs"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-400 hover:bg-primary-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  )
}

// ── Savings Prediction Widget ───────────────────────────────────────────────
function SavingsPredictionWidget({ currency }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await analyticsService.getSavingsPrediction()
      setData(res.data || res)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const isOnTrack = data?.status === 'on_track'
  const savingsPct = Math.max(0, Math.min(100, data?.savings_rate_pct ?? 0))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
      className="stat-card-new border-primary-500/20 bg-primary-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-2xl rounded-full" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-white">Savings Projection</h3>
          <button onClick={fetch} className="p-1.5 rounded-lg text-surface-700 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-surface-200 mb-4">Based on your current 30-day velocity</p>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <p className="text-xs text-rose-400 italic">ML service unavailable — start the Python service to see predictions.</p>
        ) : (
          <>
            <div className="flex items-end gap-3 mb-1">
              <span className={`text-3xl font-bold ${isOnTrack ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatAmount(Math.max(0, (data?.monthlySalary || 0) - (data?.projected_spend || 0)), currency)}
              </span>
              <span className="text-sm text-surface-700 pb-1">predicted savings</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant={isOnTrack ? 'green' : 'rose'}>
                {isOnTrack ? '✓ On Track' : '⚠ At Risk'}
              </Badge>
              <span className="text-xs text-surface-700">{data?.days_remaining || 0} days remaining</span>
            </div>

            <div className="w-full h-2 bg-surface-900 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isOnTrack ? 'bg-gradient-to-r from-emerald-500 to-primary-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`}
                style={{ width: `${savingsPct}%` }}
              />
            </div>
            <p className="text-[10px] text-surface-700 mb-3">{savingsPct.toFixed(1)}% savings rate projected</p>

            {data?.advice && (
              <p className="text-xs text-surface-200 leading-relaxed bg-white/5 rounded-xl p-3 border border-white/10">
                {data.advice}
              </p>
            )}

            {data?.daily_run_rate > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-[10px] text-surface-700 uppercase tracking-wider">Daily Rate</p>
                  <p className="text-sm font-bold text-white">{formatAmount(data.daily_run_rate, currency)}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <p className="text-[10px] text-surface-700 uppercase tracking-wider">Projected Spend</p>
                  <p className="text-sm font-bold text-white">{formatAmount(data.projected_spend, currency)}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuth()
  const currencySymbol = getCurrencySymbol(user?.currency)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [stats, setStats] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [insights, setInsights] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const [statsRes, budgetsRes, insightsRes, incomeStatsRes] = await Promise.all([
        expenseService.getStats(),
        budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
        analyticsService.getInsights(),
        incomeService.getStats(),
      ])
      setStats(statsRes.data)
      setBudgets(budgetsRes.data || [])
      setInsights(Array.isArray(insightsRes) ? insightsRes : (insightsRes?.data || []))
      setTotalIncome(incomeStatsRes.data?.currentMonthTotal || user?.monthlySalary || 0)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const trendData = stats?.monthlyTrend?.map(t => ({
    month: new Date(t._id.year, t._id.month - 1).toLocaleString('default', { month: 'short' }),
    expenses: t.total,
    income: totalIncome > 0 ? totalIncome : 0,
  })) || []

  const catSpending = stats?.byCategory?.map(c => {
    const catInfo = categories.find(cat => cat.id === c._id)
    return { name: catInfo ? catInfo.name : c._id, value: c.total, count: c.count, color: catInfo ? catInfo.color : '#64748b' }
  }) || []

  const budgetComparison = budgets.map(b => {
    const catInfo = categories.find(c => c.id === b.category)
    return { name: catInfo?.name || b.category, budget: b.limit, spent: b.spent, color: catInfo?.color || '#64748b' }
  })

  const totalExpenses = stats?.currentMonth?.total || 0
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0

  const insightIcons = { warning: AlertTriangle, success: CheckCircle2, info: Zap, tip: Lightbulb }
  const insightColors = {
    warning: 'border-amber-500/50 bg-amber-500/10',
    success: 'border-emerald-500/50 bg-emerald-500/10',
    info: 'border-primary-500/30 bg-primary-500/5',
    tip: 'border-accent-400/30 bg-accent-400/5',
  }
  const insightIconColors = {
    warning: 'text-amber-400', success: 'text-emerald-400', info: 'text-primary-400', tip: 'text-accent-400',
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Analytics & Insights</h1>
        <p className="text-sm text-surface-700">AI-powered breakdown of your financial patterns</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="stat-card-new">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Total Expenses</span>
                <div className="p-2 rounded-lg bg-rose-500/10"><TrendingUp className="w-4 h-4 text-rose-400" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{formatAmount(totalExpenses, user?.currency)}</p>
              <p className="text-xs text-surface-700 mt-1">{stats?.currentMonth?.count || 0} transactions</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card-new">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Net Cash Flow</span>
                <div className="p-2 rounded-lg bg-emerald-500/10"><ArrowUpRight className="w-4 h-4 text-emerald-400" /></div>
              </div>
              <p className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(totalIncome - totalExpenses) >= 0 ? '+' : ''}{formatAmount(Math.abs(totalIncome - totalExpenses), user?.currency)}
              </p>
              <p className="text-xs text-surface-700 mt-1">Income − Expenses</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card-new">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">Savings Rate</span>
                <div className="p-2 rounded-lg bg-primary-500/10"><Target className="w-4 h-4 text-primary-400" /></div>
              </div>
              <p className="text-2xl font-bold text-white">{savingsRate}%</p>
              <p className="text-xs text-surface-700 mt-1">Of total income</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card-new">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-700">vs Last Month</span>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 stat-card-new">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card-new">
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

      {/* Budget + ML Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="stat-card-new">
          <h3 className="text-lg font-semibold text-white mb-6">Budget vs Actual</h3>
          {budgetComparison.length === 0 ? (
            <div className="py-8 text-center text-sm text-surface-700 italic">No budgets set for this month</div>
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

        <div className="space-y-6">
          {/* ML Insights Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="stat-card-new gradient-border">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-accent-400" />
              <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
              <Badge variant="purple">AI</Badge>
              <button onClick={fetchData} className="ml-auto p-1.5 rounded-lg text-surface-700 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : insights.length === 0 ? (
              <div className="py-8 text-center">
                <Brain className="w-10 h-10 text-surface-700 mx-auto mb-3" />
                <p className="text-sm text-surface-700 italic">Add some expenses to get personalized AI insights</p>
                <p className="text-xs text-surface-700 mt-1">Also ensure the ML service is running on port 8000</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {insights.map((insight, i) => {
                    const Icon = insightIcons[insight.type] || Zap
                    return (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border transition-all duration-300 ${insightColors[insight.type] || insightColors.info}`}>
                        <div className="flex gap-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${insightIconColors[insight.type] || 'text-primary-400'}`} />
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">{insight.title}</h4>
                            <p className="text-xs text-surface-200 leading-relaxed">{insight.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Live Savings Prediction */}
          <SavingsPredictionWidget currency={user?.currency} />
        </div>
      </div>

      {/* AI Chat */}
      <AIChatWidget />
    </DashboardLayout>
  )
}
