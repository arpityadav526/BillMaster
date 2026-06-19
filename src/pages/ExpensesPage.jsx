import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button, Input, Modal, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import { Search, Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import * as expenseService from '../services/expense.service'
import { useAuth } from '../context/AuthContext'
import { getCurrencySymbol } from '../utils/currency'

export default function ExpensesPage() {
  const { user } = useAuth()
  const currencySymbol = getCurrencySymbol(user?.currency)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0] })
  const [isLoading, setIsLoading] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 1 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeDetailTx, setActiveDetailTx] = useState(null)
  const perPage = 8

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await expenseService.getExpenses({
        page: currentPage,
        limit: perPage,
        category: categoryFilter,
        search: search
      })
      setExpenses(res.data)
      setPagination(res.pagination)
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, categoryFilter, search, perPage])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search, currentPage])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await expenseService.createExpense(newExpense)
      setShowAddModal(false)
      setNewExpense({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0] })
      fetchExpenses()
    } catch (err) {
      if (err.message?.includes('429')) alert('Slow down! Too many requests.')
      else alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e) => { 
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await expenseService.updateExpense(selectedExpense._id, selectedExpense)
      setShowEditModal(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => { 
    try {
      await expenseService.deleteExpense(selectedExpense._id)
      setShowDeleteModal(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      alert(err.message)
    }
  }

  const getMerchantIcon = (name) => {
    const n = name?.toLowerCase() || '';
    if (n.includes('starbucks')) return <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-[10px] text-white">☕</div>;
    if (n.includes('amazon')) return <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-[10px] text-black font-bold">a</div>;
    if (n.includes('uber')) return <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-[8px] text-white font-bold tracking-tighter">Uber</div>;
    if (n.includes('netflix')) return <div className="w-6 h-6 rounded bg-black flex items-center justify-center text-[10px] text-red-600 font-black">N</div>;
    return <div className="w-6 h-6 rounded bg-surface-800 flex items-center justify-center text-xs text-surface-400 font-bold">{name?.charAt(0)}</div>;
  }

  const getCustomBadge = (category) => {
    const cat = category?.toLowerCase() || ''
    if (cat.includes('coffee') || cat.includes('food')) {
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-600/20 text-purple-400 border border-purple-600/30">Coffee</span>
    }
    if (cat.includes('shopping')) {
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">Shopping</span>
    }
    if (cat.includes('transport') || cat.includes('uber')) {
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-600/20 text-green-400 border border-green-600/30">Transportation</span>
    }
    if (cat.includes('entertainment') || cat.includes('netflix')) {
      return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-600/20 text-red-400 border border-red-600/30">Entertainment</span>
    }
    return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-surface-800 text-surface-300 border border-white/5">{category}</span>
  }

  const demoExpenses = [
    { _id: 'e1', description: 'Starbucks', category: 'food', date: '2026-05-15T00:00:00.000Z', amount: 14.50, account: 'Chase Sapphire' },
    { _id: 'e2', description: 'Amazon', category: 'shopping', date: '2026-05-15T00:00:00.000Z', amount: 89.99, account: 'Amex Gold' },
    { _id: 'e3', description: 'Uber', category: 'transport', date: '2026-05-15T00:00:00.000Z', amount: 32.25, account: 'Amex Gold' },
    { _id: 'e4', description: 'Amazon', category: 'transport', date: '2026-05-15T00:00:00.000Z', amount: 14.50, account: 'Chase Sapphire' },
    { _id: 'e5', description: 'Uber', category: 'transport', date: '2026-05-15T00:00:00.000Z', amount: 32.25, account: 'Chase Sapphire' },
    { _id: 'e6', description: 'Netflix', category: 'entertainment', date: '2026-05-15T00:00:00.000Z', amount: 15.99, account: 'Amex Gold' },
    { _id: 'e7', description: 'Netflix', category: 'entertainment', date: '2026-05-15T00:00:00.000Z', amount: 15.99, account: 'Chase Sapphire' },
    { _id: 'e8', description: 'Amazon', category: 'shopping', date: '2026-05-15T00:00:00.000Z', amount: 89.99, account: 'Amex Gold' },
  ]

  const displayExpenses = expenses.length > 0 ? expenses : demoExpenses
  const activeTx = activeDetailTx || displayExpenses[0]

  return (
    <DashboardLayout onAddExpense={() => setShowAddModal(true)}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1.5 font-sora">Expenses</h1>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Table & Filters */}
        <div className="flex-1 w-full space-y-6">
          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 shadow-lg bg-surface-900/40">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input 
                  type="text" 
                  placeholder="Search by description or merchant..." 
                  value={search} 
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} 
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#121829] text-white placeholder-surface-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-dm-sans text-xs focus:outline-none" 
                />
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }} 
                  className="appearance-none py-2.5 px-4 rounded-xl border border-white/5 bg-[#121829] text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-dm-sans text-xs cursor-pointer min-w-[140px] focus:outline-none"
                >
                  <option value="all" className="bg-surface-900">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
                </select>
                <Button 
                  onClick={() => setShowAddModal(true)} 
                  className="!rounded-xl !bg-[#2e9d66] hover:!bg-[#258253] text-xs !py-2.5"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </Button>
              </div>
            </div>

            {/* Active filters */}
            {(search || categoryFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider font-dm-sans">Active Filters:</span>
                {search && (
                  <button onClick={() => setSearch('')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer font-medium">
                    &quot;{search}&quot; <X className="w-3 h-3" />
                  </button>
                )}
                {categoryFilter !== 'all' && (
                  <button onClick={() => setCategoryFilter('all')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer font-medium">
                    {categories.find(c => c.id === categoryFilter)?.name} <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="glass-card rounded-2xl border border-white/5 shadow-xl overflow-hidden bg-surface-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-xs font-semibold text-surface-400">
                    <th className="py-4 pl-6 pr-4 font-dm-sans">Date</th>
                    <th className="py-4 pr-4 font-dm-sans">Merchant</th>
                    <th className="py-4 pr-4 font-dm-sans">Category</th>
                    <th className="py-4 pr-4 font-dm-sans">Account</th>
                    <th className="py-4 pr-6 text-right font-dm-sans">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-surface-200">
                  {isLoading ? (
                    Array(perPage).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan="5" className="py-4"><Skeleton className="h-10 w-full" /></td></tr>
                    ))
                  ) : displayExpenses.length === 0 ? (
                    <tr><td colSpan="5" className="py-12 text-center text-sm text-surface-700 italic">No expenses found matching your filters.</td></tr>
                  ) : (
                    displayExpenses.map(tx => (
                      <tr 
                        key={tx._id} 
                        onClick={() => setActiveDetailTx(tx)}
                        className={`hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0 cursor-pointer ${activeTx?._id === tx._id ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="py-4 pl-6 pr-4">
                          <span className="text-xs text-surface-300 font-dm-sans">
                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-4 pr-4 flex items-center gap-2.5">
                          {getMerchantIcon(tx.description)}
                          <span className="text-sm text-white font-medium font-dm-sans">{tx.description}</span>
                        </td>
                        <td className="py-4 pr-4">{getCustomBadge(tx.category)}</td>
                        <td className="py-4 pr-4">
                          <span className="text-xs text-surface-400 font-dm-sans">
                            {tx.account || (tx.amount > 30 ? 'Amex Gold' : 'Chase Sapphire')}
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-right font-bold text-white font-dm-sans">
                          -${Number(tx.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/5 text-xs text-surface-500">
                <p>Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={pagination.page === 1} className="p-1 rounded hover:bg-white/5 cursor-pointer disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))} disabled={pagination.page === pagination.pages} className="p-1 rounded hover:bg-white/5 cursor-pointer disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Expense Detail Panel */}
        {activeTx && (
          <div className="w-full lg:w-80 flex-shrink-0 glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40 lg:sticky lg:top-24">
            <div className="flex justify-between items-center mb-6">
              <button 
                className="text-surface-400 hover:text-white cursor-pointer"
                onClick={() => setActiveDetailTx(null)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                className="text-surface-400 hover:text-white cursor-pointer"
                onClick={() => setActiveDetailTx(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              {getMerchantIcon(activeTx.description)}
              <h3 className="text-base font-bold text-white font-sora">{activeTx.description}</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-[10px] text-surface-500 uppercase font-semibold block mb-0.5">Date</span>
                <span className="text-xs font-semibold text-white">
                  {new Date(activeTx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-surface-500 uppercase font-semibold block mb-0.5">Amount</span>
                <span className="text-sm font-bold text-white">-${Number(activeTx.amount).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-surface-500 uppercase font-semibold block mb-1">Category</span>
                {getCustomBadge(activeTx.category)}
              </div>
            </div>

            {/* Receipt Scan container */}
            <div className="pt-4 border-t border-white/5">
              <span className="text-[10px] text-surface-500 uppercase font-semibold block mb-3">Receipt scan</span>
              <div className="border border-white/10 rounded-xl bg-white p-4 text-black font-mono text-[9px] shadow-lg select-none max-w-[200px] mx-auto">
                <div className="text-center font-bold mb-2 tracking-widest text-[10px]">RECEIPT</div>
                <div className="text-center text-[7px] text-gray-500 mb-3">VTE-240-BLMST</div>
                <div className="flex justify-between mb-1"><span>{activeTx.description}</span><span>-${Number(activeTx.amount).toFixed(2)}</span></div>
                <div className="flex justify-between mb-1"><span>Tax (8.0%)</span><span>-${Number(activeTx.amount * 0.08).toFixed(2)}</span></div>
                <div className="border-t border-black border-dashed my-2" />
                <div className="flex justify-between font-bold text-xs"><span>Total</span><span>-${Number(activeTx.amount * 1.08).toFixed(2)}</span></div>
                <div className="text-center text-gray-400 mt-4 text-[7px]">THANK YOU FOR YOUR VISIT!</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <form onSubmit={handleAdd} className="space-y-5">
          <Input label="Description" placeholder="e.g., Grocery shopping" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={`Amount (${currencySymbol})`} type="number" placeholder="0.00" step="0.01" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
            <Input label="Date" type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-surface-200">Category</label>
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="input-field appearance-none cursor-pointer">
              {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Expense">
        {selectedExpense && (
          <form onSubmit={handleEdit} className="space-y-5">
            <Input label="Description" value={selectedExpense.description} onChange={(e) => setSelectedExpense({ ...selectedExpense, description: e.target.value })} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={`Amount (${currencySymbol})`} type="number" value={selectedExpense.amount} step="0.01" onChange={(e) => setSelectedExpense({ ...selectedExpense, amount: e.target.value })} required />
              <Input label="Date" type="date" value={selectedExpense.date} onChange={(e) => setSelectedExpense({ ...selectedExpense, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-surface-200">Category</label>
              <select value={selectedExpense.category} onChange={(e) => setSelectedExpense({ ...selectedExpense, category: e.target.value })} className="input-field appearance-none cursor-pointer">
                {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Expense" size="sm">
        {selectedExpense && (
          <div>
            <p className="text-sm text-surface-200 mb-6">Are you sure you want to delete <span className="text-white font-medium">&quot;{selectedExpense.description}&quot;</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}><Trash2 className="w-4 h-4" /> Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
