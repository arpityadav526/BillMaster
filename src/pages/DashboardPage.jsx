import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { StatCard, ProgressBar, Modal, Badge, Input, Button, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Plus, ArrowUpRight, Lightbulb, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import * as expenseService from '../services/expense.service'
import * as budgetService from '../services/budget.service'
import * as notificationService from '../services/notification.service'
import * as incomeService from '../services/income.service'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-xs">
        <p className="text-surface-200 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
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

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      const [statsRes, txRes, budgetsRes, notificationsRes, incomeRes, incomeStatsRes] = await Promise.all([
        expenseService.getStats(),
        expenseService.getExpenses({ limit: 8 }),
        budgetService.getBudgets(now.getMonth() + 1, now.getFullYear()),
        notificationService.getNotifications(),
        incomeService.getIncomes({ limit: 10 }),
        incomeService.getStats()
      ])

      const statsData = statsRes.data
      const formattedStats = [
        { title: 'Total Expenses', value: `$${(statsData.currentMonth?.total || 0).toLocaleString()}`, change: `${statsData.changePercent > 0 ? '+' : ''}${statsData.changePercent}%`, trend: statsData.changePercent > 0 ? 'up' : 'down', icon: 'wallet' },
        { title: 'Monthly Budget', value: `$${(budgetsRes.data || []).reduce((acc, b) => acc + (b.limit || 0), 0).toLocaleString()}`, change: 'Plan active', trend: 'neutral', icon: 'target' },
        { title: 'Avg Daily', value: `$${((statsData.currentMonth?.total || 0) / 30).toFixed(2)}`, change: 'Based on month', trend: 'up', icon: 'piggy' },
        { title: 'Transactions', value: (statsData.currentMonth?.count || 0).toString(), change: 'This month', trend: 'neutral', icon: 'clock' },
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

      setData({
        stats: formattedStats,
        monthlyTrend: trendData,
        categorySpending: catSpending,
        budgets: budgetsRes.data || [],
        transactions: txRes.data || [],
        insights: notificationsRes.data || [],
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
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      await expenseService.createExpense(newExpense)
      setShowAddModal(false)
      setNewExpense({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], paymentMethod: 'credit_card', notes: '' })
      fetchDashboardData()
    } catch (err) {
      alert(err.message)
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
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Income Source" placeholder="e.g., Monthly Salary" value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} required />
                  <Input label="Amount" type="number" placeholder="0.00" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} required />
                </div>
                <Button type="submit" className="!bg-emerald-500 hover:!bg-emerald-600">Save Income & Continue</Button>
              </form>
            ) : (
              <form onSubmit={handleSetupBudget} className="space-y-4 max-w-lg">
                <h4 className="text-sm font-semibold text-emerald-400">Step 2: Set your first budget limit</h4>
                <div className="grid grid-cols-2 gap-4">
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
        <div className="lg:col-span-2 card animate-slide-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between mb-6">
            <div><h3 className="text-lg font-semibold text-white">Monthly Overview</h3><p className="text-xs text-surface-700 mt-1">Income vs Expenses</p></div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary-500" /><span className="text-surface-200">Income</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-accent-500" /><span className="text-surface-200">Expenses</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#3b82f6" strokeWidth={2} fill="url(#ig)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#8b5cf6" strokeWidth={2} fill="url(#eg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card animate-slide-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <h3 className="text-lg font-semibold text-white mb-2">Spending Categories</h3>
          <p className="text-xs text-surface-700 mb-4">This month&apos;s breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={data.categorySpending} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {data.categorySpending.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
            </Pie></PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {data.categorySpending.slice(0, 4).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: c.color }} /><span className="text-surface-200">{c.name}</span></div>
                <span className="text-white font-medium">${c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card animate-slide-up opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
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
                    <ProgressBar value={b.spent} max={b.limit} color={catInfo ? catInfo.color : '#64748b'} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="card animate-slide-up opacity-0" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
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

      <div className="card animate-slide-up opacity-0" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
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
                    <td className="py-3.5 pr-4 text-right"><span className="text-sm font-semibold text-white">-${tx.amount.toFixed(2)}</span></td>
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
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount" type="number" placeholder="0.00" step="0.01" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
            <Input label="Date" type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-surface-200">Category</label>
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="input-field appearance-none cursor-pointer">
              {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <Button type="submit"><Plus className="w-4 h-4" /> Add Expense</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
