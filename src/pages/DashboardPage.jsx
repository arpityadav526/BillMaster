import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Modal, Input, Button, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, ArrowUpRight, Lightbulb, AlertTriangle, ArrowUp, ArrowDown, MoreHorizontal, Bell } from 'lucide-react'
import * as expenseService from '../services/expense.service'
import * as budgetService from '../services/budget.service'
import * as notificationService from '../services/notification.service'
import * as analyticsService from '../services/analytics.service'
import * as incomeService from '../services/income.service'
import { formatAmount } from '../utils/currency'
import { useAuth } from '../context/AuthContext'

const CustomTooltip = ({ active, payload, label, currencySymbol = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-xs bg-surface-900 border border-white/10">
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

const formatRupee = (val) => {
  return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const chartData = [
  { name: '1.01', income: 45, expenses: 30 },
  { name: '2.01', income: 75, expenses: 55 },
  { name: '4.01', income: 65, expenses: 50 },
  { name: '7.01', income: 60, expenses: 40 },
  { name: '9.01', income: 105, expenses: 95 },
  { name: '10.01', income: 98, expenses: 88 },
  { name: '12.01', income: 85, expenses: 75 },
  { name: '15.01', income: 110, expenses: 90 },
  { name: '17.01', income: 105, expenses: 85 },
  { name: '19.01', income: 135, expenses: 110 },
  { name: '21.01', income: 118, expenses: 100 },
  { name: '23.01', income: 102, expenses: 92 },
  { name: '25.01', income: 108, expenses: 88 },
  { name: '28.01', income: 122, expenses: 108 },
  { name: '30.01', income: 110, expenses: 95 }
]

export default function DashboardPage() {
  const { user } = useAuth()
  
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

  const getCustomBadge = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
      case 'groceries':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">Groceries</span>
      case 'entertainment':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-pink-600/20 text-pink-400 border border-pink-600/30">Entertainment</span>
      case 'housing':
      case 'rent':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-600/30">Housing</span>
      case 'transport':
      case 'transportation':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-600/30">Transportation</span>
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-800 text-surface-300 border border-white/5">{category}</span>
    }
  }

  const demoTransactions = [
    { _id: 't1', description: 'Whole Foods Market', category: 'food', date: '2026-10-26T00:00:00.000Z', amount: 1200.50 },
    { _id: 't2', description: 'Spotify Premium', category: 'entertainment', date: '2026-10-25T00:00:00.000Z', amount: 299.00 },
    { _id: 't3', description: 'Rent Payment', category: 'housing', date: '2026-10-24T00:00:00.000Z', amount: 24000.00 },
    { _id: 't4', description: 'Uber Ride', category: 'transport', date: '2026-10-23T00:00:00.000Z', amount: 350.00 },
  ]
  const displayTx = data.transactions.length > 0 ? data.transactions : demoTransactions

  const totalSpent = data.stats[1]?.value ? parseFloat(data.stats[1].value.replace(/[^0-9.]/g, '')) : 26000
  const remainingBalance = data.stats[2]?.value ? parseFloat(data.stats[2].value.replace(/[^0-9.]/g, '')) : 40000
  const totalIncome = data.totalIncome || 40000

  return (
    <DashboardLayout onAddExpense={() => setShowAddModal(true)}>
      
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

      {/* Row 1: KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Balance */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-surface-900/40">
          <p className="text-xs font-semibold text-surface-400 mb-2 font-dm-sans">Total Balance</p>
          <h2 className="text-3xl font-bold text-white mb-2 font-sora tracking-tight">{formatRupee(remainingBalance)}</h2>
          <div className="w-full h-1.5 rounded-full bg-surface-800 overflow-hidden my-3">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-purple-500" style={{ width: '65%' }}></div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-surface-500 font-dm-sans">
            <span>Goal: None</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Positive trend
            </span>
          </div>
        </div>

        {/* Card 2: Monthly Income */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-surface-400 mb-2 font-dm-sans">Monthly Income</p>
            <h2 className="text-3xl font-bold text-white font-sora tracking-tight">{formatRupee(totalIncome)}</h2>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ArrowUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Monthly Expenses */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40 flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-surface-400 mb-2 font-dm-sans">Monthly Expenses</p>
            <h2 className="text-3xl font-bold text-white font-sora tracking-tight">{formatRupee(totalSpent)}</h2>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Charts and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 30-Day Cashflow Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-white font-sora">30-Day Cashflow</h3>
            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
                <span className="text-surface-300">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
                <span className="text-surface-300">Expenses</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip currencySymbol="₹" />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#8b5cf6" strokeWidth={2} fill="url(#incomeGrad)" dot={{ r: 2.5, fill: '#8b5cf6', strokeWidth: 1 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#6366f1" strokeWidth={2} fill="url(#expensesGrad)" dot={{ r: 2.5, fill: '#6366f1', strokeWidth: 1 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights Panel */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white font-sora">AI Insights</h3>
            <button className="text-surface-400 hover:text-white cursor-pointer">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {/* Card 1 */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/15 to-purple-500/5 border border-pink-500/20 text-white flex gap-3">
              <div className="mt-0.5 text-pink-400"><AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" /></div>
              <div>
                <h4 className="text-xs font-bold font-sora text-white mb-0.5">Unusual Spending Pattern</h4>
                <p className="text-[11px] text-surface-200 leading-relaxed font-dm-sans">
                  High restaurant expenses this week. AI suggests reviewing budgets.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-600/15 to-indigo-600/5 border border-pink-600/20 text-white flex gap-3">
              <div className="mt-0.5 text-pink-400"><Lightbulb className="w-4.5 h-4.5 flex-shrink-0" /></div>
              <div>
                <h4 className="text-xs font-bold font-sora text-white mb-0.5">Savings Opportunity</h4>
                <p className="text-[11px] text-surface-200 leading-relaxed font-dm-sans">
                  Switch your utility provider to save approx. ₹500/month.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-700/15 to-indigo-700/5 border border-purple-700/20 text-white flex gap-3">
              <div className="mt-0.5 text-purple-400"><Bell className="w-4.5 h-4.5 flex-shrink-0" /></div>
              <div>
                <h4 className="text-xs font-bold font-sora text-white mb-0.5">Bill Reminder</h4>
                <p className="text-[11px] text-surface-200 leading-relaxed font-dm-sans">
                  Rent is due in 3 days. Automated payment is set.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Transactions */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-sora tracking-tight mb-1">Recent Transactions</h3>
          </div>
          <Link to="/expenses" className="text-sm font-semibold text-[#8b5cf6] hover:underline flex items-center gap-1 transition-colors">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs font-semibold text-surface-400">
                <th className="pb-3 pr-4 font-dm-sans">Description</th>
                <th className="pb-3 pr-4 font-dm-sans">Category</th>
                <th className="pb-3 pr-4 font-dm-sans">Date</th>
                <th className="pb-3 text-right font-dm-sans">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-surface-200">
              {isLoading ? (
                <tr><td colSpan="4" className="py-8"><Skeleton className="h-16 w-full" /></td></tr>
              ) : displayTx.map(tx => (
                <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                  <td className="py-4 pr-4"><span className="text-sm text-white font-medium font-dm-sans">{tx.description}</span></td>
                  <td className="py-4 pr-4">{getCustomBadge(tx.category)}</td>
                  <td className="py-4 pr-4"><span className="text-xs text-surface-400 font-dm-sans">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                  <td className="py-4 text-right font-semibold text-white">-{formatRupee(tx.amount)}</td>
                </tr>
              ))}
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
