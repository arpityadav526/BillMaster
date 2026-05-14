import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { StatCard, ProgressBar, Modal, Badge, Input, Button, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Plus, ArrowUpRight, Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import * as expenseService from '../services/expense.service'
import * as budgetService from '../services/budget.service'
import * as notificationService from '../services/notification.service'
import * as analyticsService from '../services/analytics.service'
import * as incomeService from '../services/income.service'
import { getCurrencySymbol, formatAmount } from '../utils/currency'
import { useAuth } from '../context/AuthContext'

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

export default function DashboardPage() {
  const { user } = useAuth()
  const currencySymbol = getCurrencySymbol(user?.currency)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], paymentMethod: 'credit_card', notes: '' })
  const [newIncome, setNewIncome] = useState({ source: 'Salary', amount: '', category: 'salary', date: new Date().toISOString().split('T')[0], isRecurring: true })
  const [newBudget, setNewBudget] = useState({ category: 'food', limit: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState({
    stats: [],
    monthlyTrend: [],
    categorySpending: [],
    budgets: [],
    transactions: [],
    insights: [],
    incomes: [],
    totalIncome: 0
  })
  const [isAdding, setIsAdding] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const [statsRes, txRes, budgetsRes, notificationsRes, incomeRes, incomeStatsRes, mlInsightsRes] = await Promise.all([
        expenseService.getStats(),
        expenseService.getExpenses({ limit: 8 }),
        budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
        notificationService.getNotifications(),
        incomeService.getIncomes({ limit: 10 }),
        incomeService.getStats(),
        analyticsService.getInsights().catch(() => [])  // graceful fallback if ML is down
      ])

      const statsData = statsRes.data
      const totalSpent = statsData.currentMonth?.total || 0
      const monthlySalary = user?.monthlySalary || incomeStatsRes.data.currentMonthTotal || 0
      const remainingBalance = monthlySalary - totalSpent
      
      const formattedStats = [
        { 
          title: 'Monthly Salary', 
          value: formatAmount(monthlySalary, user?.currency), 
          change: 'Primary Income', 
          trend: 'neutral', 
          icon: 'wallet',
          isGlass: true 
        },
        { 
          title: 'Total Spent', 
          value: formatAmount(totalSpent, user?.currency), 
          change: `${statsData.changePercent > 0 ? '+' : ''}${statsData.changePercent}% vs last month`, 
          trend: statsData.changePercent > 0 ? 'up' : 'down', 
          icon: 'trending-down',
          isGlass: true
        },
        { 
          title: 'Remaining Balance', 
          value: formatAmount(remainingBalance, user?.currency), 
          change: `${((remainingBalance / monthlySalary) * 100).toFixed(1)}% of salary left`, 
          trend: remainingBalance > (user?.targetSavingsAmount || 0) ? 'down' : 'up', 
          icon: 'piggy',
          isGlass: true
        },
        { 
          title: 'Savings Target', 
          value: formatAmount(user?.targetSavingsAmount || 0, user?.currency), 
          change: 'Monthly Goal', 
          trend: 'neutral', 
          icon: 'target',
          isGlass: true
        },
      ]

      const totalIncome = incomeStatsRes.data.currentMonthTotal || 0

      const trendData = (statsData.monthlyTrend || []).map(t => ({
        month: new Date(t._id.year, t._id.month - 1).toLocaleString('default', { month: 'short' }),
        expenses: t.total,
        income: totalIncome > 0 ? totalIncome : 0
      }))

      const catSpending = (statsData.byCategory || []).map(c => {
        const catInfo = categories.find(cat => cat.id === c._id)
        return {
          name: catInfo ? catInfo.name : c._id,
          value: c.total,
          color: catInfo ? catInfo.color : '#64748b'
        }
      })

      // ML insights: use direct ML results; fall back to DB notifications if ML is down
      const mlInsights = Array.isArray(mlInsightsRes) ? mlInsightsRes : (mlInsightsRes?.data || [])
      const dbNotifications = notificationsRes.data || []
      const displayInsights = mlInsights.length > 0 ? mlInsights : dbNotifications

      setData({
        stats: formattedStats,
        monthlyTrend: trendData,
        categorySpending: catSpending,
        budgets: budgetsRes.data || [],
        transactions: txRes.data || [],
        insights: displayInsights,
        incomes: incomeRes.data?.incomes || [],
        totalIncome
      })

      if ((budgetsRes.data || []).length === 0 && (incomeRes.data?.incomes || []).length === 0 && !localStorage.getItem('billmaster-setup-dismissed')) {
        setShowSetupWizard(true)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (isAdding) return
    
    setIsAdding(true)
    try {
      await expenseService.createExpense(newExpense)
      setShowAddModal(false)
      setNewExpense({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], paymentMethod: 'credit_card', notes: '' })
      await fetchDashboardData()
    } catch (err) {
      if (err.message?.includes('429') || err.message?.toLowerCase().includes('too many')) {
        alert('You are adding expenses too quickly. Please wait a moment and try again.')
      } else {
        alert(err.message || 'Failed to add expense')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleSetupIncome = async (e) => {
    e.preventDefault()
    try {
      await incomeService.createIncome(newIncome)
      setWizardStep(2)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSetupBudget = async (e) => {
    e.preventDefault()
    try {
      const now = new Date()
      await budgetService.setBudget({ ...newBudget, month: now.getMonth() + 1, year: now.getFullYear() })
      setShowSetupWizard(false)
      localStorage.setItem('billmaster-setup-dismissed', 'true')
      fetchDashboardData()
    } catch (err) {
      alert(err.message)
    }
  }

  const dismissSetup = () => {
    setShowSetupWizard(false)
    localStorage.setItem('billmaster-setup-dismissed', 'true')
  }

  const insightIcons = { warning: <AlertTriangle className="w-5 h-5 text-amber-400" />, success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, info: <Info className="w-5 h-5 text-primary-400" />, tip: <Lightbulb className="w-5 h-5 text-accent-400" /> }
  const catBadgeMap = { food: 'amber', transport: 'blue', shopping: 'purple', bills: 'rose', entertainment: 'rose', health: 'green', education: 'blue', travel: 'purple', subscriptions: 'amber', other: 'blue' }
  const getCatBadge = (id) => { const c = categories.find(x => x.id === id); return c ? <Badge variant={catBadgeMap[id] || 'blue'}>{c.icon} {c.name}</Badge> : <Badge variant="blue">{id}</Badge> }

  return (
    <DashboardLayout onAddExpense={() => setShowAddModal(true)}>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-sm text-surface-700">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      {showSetupWizard && (
        <div className="card mb-8 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-surface-900 animate-slide-down relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Let's set up your finances</h3>
                <p className="text-sm text-surface-200 mt-1">Complete these quick steps to get accurate insights.</p>
              </div>
              <button onClick={dismissSetup} className="text-xs text-surface-700 hover:text-white transition-colors cursor-pointer">Skip for now</button>
            </div>

            {wizardStep === 1 ? (
              <form onSubmit={handleSetupIncome} className="space-y-4 max-w-lg">
                <h4 className="text-sm font-semibold text-emerald-400">Step 1: Add your primary income</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Income Source" placeholder="e.g., Monthly Salary" value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} required />
                  <Input label="Amount" type="number" placeholder="0.00" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} required />
                </div>
                <Button type="submit" className="!bg-emerald-500 hover:!bg-emerald-600">Save Income & Continue</Button>
              </form>
            ) : (
              <form onSubmit={handleSetupBudget} className="space-y-4 max-w-lg">
                <h4 className="text-sm font-semibold text-emerald-400">Step 2: Set your first budget limit</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-200">Category</label>
                    <select value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })} className="input-field">
                      {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
                    </select>
                  </div>
                  <Input label="Monthly Limit" type="number" placeholder="0.00" value={newBudget.limit} onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })} required />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="!bg-emerald-500 hover:!bg-emerald-600">Complete Setup</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading 
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
          : data.stats.map((c, i) => <StatCard key={c.title} {...c} delay={i * 100} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 stat-card-new p-6 animate-slide-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Financial Pulse</h3>
              <p className="text-xs text-surface-400 mt-1 uppercase tracking-widest font-bold">Income vs Expenses • 6 Months</p>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" /><span className="text-surface-200">Income</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" /><span className="text-surface-200">Expenses</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} fill="url(#ig)" animationDuration={2000} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#3b82f6" strokeWidth={3} fill="url(#eg)" animationDuration={2500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card-new p-6 animate-slide-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <h3 className="text-xl font-bold text-white tracking-tight mb-1">Allocation</h3>
          <p className="text-[10px] text-surface-400 uppercase tracking-widest font-bold mb-6">Current Month Breakdown</p>
          <div className="relative h-48 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.categorySpending} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={65} 
                  outerRadius={85} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {data.categorySpending.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currencySymbol={currencySymbol} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-surface-400 uppercase font-bold">Total</span>
              <span className="text-lg font-bold text-white">{currencySymbol}{data.categorySpending.reduce((acc, c) => acc + c.value, 0).toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            {data.categorySpending.slice(0, 3).map(c => (
              <div key={c.name} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}66` }} />
                  <span className="text-xs font-semibold text-surface-200">{c.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{currencySymbol}{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stat-card-new animate-slide-up opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <h3 className="text-lg font-semibold text-white mb-6">Budget Progress</h3>
          <div className="space-y-5">
            {data.budgets.length === 0 ? (
              <div className="py-8 text-center text-xs text-surface-700 italic">No budgets set for this month.</div>
            ) : (
              data.budgets.map(b => {
                const catInfo = categories.find(c => c.id === b.category)
                return (
                  <div key={b.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-surface-200">{catInfo ? catInfo.name : b.category}</span>
                      <span className={`text-xs font-medium ${b.spent > b.limit ? 'text-rose-400' : 'text-surface-700'}`}>{b.percentage}%</span>
                    </div>
                    <ProgressBar value={b.spent} max={b.limit} currencySymbol={currencySymbol} color={catInfo ? catInfo.color : '#64748b'} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="stat-card-new animate-slide-up opacity-0" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <h3 className="text-lg font-semibold text-white mb-6">Financial Insights</h3>
          <div className="space-y-4">
            {data.insights.length === 0 ? (
              <div className="py-8 text-center text-xs text-surface-700 italic">No insights or notifications yet.</div>
            ) : (
              data.insights.map(ins => (
                <div key={ins._id} className="flex gap-3 p-3 rounded-xl glass-light hover:bg-white/5 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">{insightIcons[ins.type] || <Info className="w-5 h-5 text-primary-400" />}</div>
                  <div><h4 className="text-sm font-semibold text-white mb-1">{ins.title}</h4><p className="text-xs text-surface-200 leading-relaxed">{ins.description}</p></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="stat-card-new animate-slide-up opacity-0" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-6">
          <div><h3 className="text-lg font-semibold text-white">Recent Transactions</h3><p className="text-xs text-surface-700 mt-1">Your latest expense activity</p></div>
          <a href="/expenses" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">View All <ArrowUpRight className="w-3 h-3" /></a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-surface-700 pb-3 pr-4">Description</th>
              <th className="text-left text-xs font-medium text-surface-700 pb-3 pr-4">Category</th>
              <th className="text-left text-xs font-medium text-surface-700 pb-3 pr-4">Date</th>
              <th className="text-right text-xs font-medium text-surface-700 pb-3 pr-4">Amount</th>
              <th className="text-right text-xs font-medium text-surface-700 pb-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {data.transactions.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-sm text-surface-700 italic">No transactions found.</td></tr>
              ) : (
                data.transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4"><span className="text-sm text-white font-medium">{tx.description}</span></td>
                    <td className="py-3.5 pr-4">{getCatBadge(tx.category)}</td>
                    <td className="py-3.5 pr-4"><span className="text-sm text-surface-200">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></td>
                    <td className="py-3.5 pr-4 text-right"><span className="text-sm font-semibold text-white">-{formatAmount(tx.amount, user?.currency)}</span></td>
                    <td className="py-3.5 text-right"><Badge variant={tx.status === 'completed' ? 'green' : 'amber'}>{tx.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Expense">
        <form onSubmit={handleAddExpense} className="space-y-5">
          <Input label="Description" placeholder="e.g., Grocery shopping" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Amount" type="number" placeholder="0.00" step="0.01" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
            <Input label="Date" type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-surface-200">Category</label>
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="input-field appearance-none cursor-pointer">
              {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-surface-200">Payment Method</label>
              <select value={newExpense.paymentMethod} onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })} className="input-field appearance-none cursor-pointer">
                <option value="credit_card" className="bg-surface-900">Credit Card</option>
                <option value="debit_card" className="bg-surface-900">Debit Card</option>
                <option value="bank_transfer" className="bg-surface-900">Bank Transfer</option>
                <option value="upi" className="bg-surface-900">UPI / Google Pay</option>
                <option value="cash" className="bg-surface-900">Cash</option>
                <option value="other" className="bg-surface-900">Other</option>
              </select>
            </div>
            <Input label="Notes (Optional)" placeholder="Additional details..." value={newExpense.notes} onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={isAdding} disabled={isAdding}>
              {isAdding ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Expense</>}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
