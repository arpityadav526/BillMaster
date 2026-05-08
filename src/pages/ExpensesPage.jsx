import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Badge, Button, Input, Modal, Skeleton } from '../components/ui/index'
import { categories } from '../data/mockData'
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import * as expenseService from '../services/expense.service'
import { useAuth } from '../context/AuthContext'
import { formatAmount, getCurrencySymbol } from '../utils/currency'

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
    try {
      await expenseService.createExpense(newExpense)
      setShowAddModal(false)
      setNewExpense({ description: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0] })
      fetchExpenses()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = async (e) => { 
    e.preventDefault()
    try {
      await expenseService.updateExpense(selectedExpense._id, selectedExpense)
      setShowEditModal(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      alert(err.message)
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

  const openEdit = (tx) => { setSelectedExpense({ ...tx, date: tx.date.split('T')[0] }); setShowEditModal(true) }
  const openDelete = (tx) => { setSelectedExpense(tx); setShowDeleteModal(true) }

  const catBadgeMap = { food: 'amber', transport: 'blue', shopping: 'purple', bills: 'rose', entertainment: 'rose', health: 'green', education: 'blue', travel: 'purple', subscriptions: 'amber', other: 'blue' }


  return (
    <DashboardLayout onAddExpense={() => setShowAddModal(true)}>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Expenses</h1>
        <p className="text-sm text-surface-700">Manage and track all your expenses</p>
      </div>

      {/* Filters Bar */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-700" />
            <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }} className="input-field !pl-10" />
          </div>
          <div className="flex gap-3">
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }} className="input-field appearance-none cursor-pointer !w-auto min-w-[160px]">
              <option value="all" className="bg-surface-900">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id} className="bg-surface-900">{c.name}</option>)}
            </select>
            <Button onClick={() => setShowAddModal(true)} size="md"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </div>

        {/* Active filters */}
        {(search || categoryFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
            <span className="text-xs text-surface-700">Filters:</span>
            {search && (
              <button onClick={() => setSearch('')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors cursor-pointer">
                &quot;{search}&quot; <X className="w-3 h-3" />
              </button>
            )}
            {categoryFilter !== 'all' && (
              <button onClick={() => setCategoryFilter('all')} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 transition-colors cursor-pointer">
                {categories.find(c => c.id === categoryFilter)?.name} <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-surface-700 pb-3 pr-4">Description</th>
                <th className="text-left text-xs font-medium text-surface-700 pb-3 pr-4">Category</th>
                <th className="text-left text-xs font-medium text-surface-700 pb-3 pr-4">Date</th>
                <th className="text-right text-xs font-medium text-surface-700 pb-3 pr-4">Amount ({currencySymbol})</th>
                <th className="text-right text-xs font-medium text-surface-700 pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array(perPage).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="5" className="py-4"><Skeleton className="h-10 w-full" /></td></tr>
                ))
              ) : expenses.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-sm text-surface-700 italic">No expenses found matching your filters.</td></tr>
              ) : (
                expenses.map(tx => {
                  const cat = categories.find(c => c.id === tx.category)
                  return (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 pr-4"><span className="text-sm text-white font-medium">{tx.description}</span></td>
                      <td className="py-3.5 pr-4">{cat ? <Badge variant={catBadgeMap[tx.category] || 'blue'}>{cat.icon} {cat.name}</Badge> : <Badge variant="blue">{tx.category}</Badge>}</td>
                      <td className="py-3.5 pr-4"><span className="text-sm text-surface-200">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                      <td className="py-3.5 pr-4 text-right"><span className="text-sm font-semibold text-white">-{formatAmount(tx.amount, user?.currency)}</span></td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-700 hover:text-primary-400 transition-colors cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => openDelete(tx)} className="p-1.5 rounded-lg hover:bg-white/5 text-surface-700 hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
            <p className="text-xs text-surface-700">Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={pagination.page === 1} className="p-2 rounded-lg hover:bg-white/5 text-surface-700 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${p === pagination.page ? 'bg-primary-500/15 text-primary-400' : 'text-surface-700 hover:bg-white/5 hover:text-white'}`}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))} disabled={pagination.page === pagination.pages} className="p-2 rounded-lg hover:bg-white/5 text-surface-700 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <form onSubmit={handleAdd} className="space-y-5">
          <Input label="Description" placeholder="e.g., Grocery shopping" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
