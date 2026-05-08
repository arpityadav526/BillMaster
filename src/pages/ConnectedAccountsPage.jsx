import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card, Button, Badge, Skeleton } from '../components/ui/index'
import { Link2, Unlink, RefreshCw, Smartphone, Building2, Wallet, CheckCircle2, AlertTriangle, Upload, Loader2, FileJson } from 'lucide-react'
import { motion } from 'framer-motion'
import * as connectedAccountService from '../services/connected-account.service'

const providers = [
  { id: 'google_pay', name: 'Google Pay', type: 'upi', icon: Smartphone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'phonepe', name: 'PhonePe', type: 'upi', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'paytm', name: 'Paytm', type: 'wallet', icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'bank', name: 'Bank Account', type: 'bank', icon: Building2, color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

export default function ConnectedAccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [connectingId, setConnectingId] = useState(null)
  
  // CSV Import state
  const [selectedAccountForImport, setSelectedAccountForImport] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await connectedAccountService.getAccounts()
      setAccounts(res.data || [])
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleConnect = async (providerId, providerName) => {
    setConnectingId(providerId)
    // Simulate OAuth / connection flow delay
    setTimeout(async () => {
      try {
        await connectedAccountService.connectAccount({
          provider: providerId,
          accountName: `My ${providerName}`
        })
        fetchAccounts()
      } catch (err) {
        alert('Failed to connect account: ' + err.message)
      } finally {
        setConnectingId(null)
      }
    }, 1500)
  }

  const handleDisconnect = async (accountId) => {
    if (!window.confirm('Are you sure you want to disconnect this account?')) return
    try {
      await connectedAccountService.disconnectAccount(accountId)
      fetchAccounts()
    } catch (err) {
      alert('Failed to disconnect: ' + err.message)
    }
  }

  const handleFileUpload = async (e, accountId) => {
    const file = e.target.files[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)
    setSelectedAccountForImport(accountId)

    try {
      const text = await file.text()
      // Basic CSV Parser for demonstration (expects: Date,Description,Amount,Category)
      const lines = text.split('\n')
      const transactions = []
      
      // Skip header, parse lines
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const [date, description, amount, category] = lines[i].split(',')
        if (date && amount) {
          transactions.push({
            date: new Date(date),
            description: description || 'Imported Transaction',
            amount: parseFloat(amount),
            category: category ? category.trim().toLowerCase() : 'other'
          })
        }
      }

      if (transactions.length === 0) {
        throw new Error('No valid transactions found in file. Please check the format.')
      }

      const res = await connectedAccountService.importTransactions(accountId, transactions)
      setImportResult({ success: true, count: res.data.importedCount })
      fetchAccounts() // Refresh last synced time
    } catch (err) {
      setImportResult({ success: false, error: err.message })
    } finally {
      setIsImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Linked Apps & Accounts</h1>
        <p className="text-sm text-surface-700">Connect your payment apps to automatically sync or manually import transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Integrations */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Available Integrations</h2>
          
          <div className="grid gap-4">
            {providers.map((p) => {
              const connectedAcc = accounts.find(a => a.provider === p.id && a.status === 'connected')
              
              return (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-white/5 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.bg}`}>
                      <p.icon className={`w-6 h-6 ${p.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{p.name}</h3>
                      <p className="text-xs text-surface-200">
                        {connectedAcc ? 'Connected and ready to sync' : 'Connect to enable sync and import'}
                      </p>
                    </div>
                  </div>

                  {connectedAcc ? (
                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <Badge variant="green" className="!px-3 !py-1.5 hidden sm:inline-flex">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                      <button 
                        onClick={() => handleDisconnect(connectedAcc._id)}
                        className="btn-ghost !text-xs !px-3 !py-1.5 w-full sm:w-auto"
                      >
                        <Unlink className="w-3 h-3" /> Disconnect
                      </button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handleConnect(p.id, p.name)}
                      disabled={connectingId === p.id}
                      className="w-full sm:w-auto !py-2 !px-4"
                    >
                      {connectingId === p.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Connecting...</>
                      ) : (
                        <><Link2 className="w-4 h-4" /> Connect</>
                      )}
                    </Button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Active Connections & Import */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Your Connected Accounts</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : accounts.filter(a => a.status === 'connected').length === 0 ? (
            <div className="card border-dashed border-white/10 bg-surface-900/50 flex flex-col items-center justify-center py-12 text-center">
              <Link2 className="w-8 h-8 text-surface-700 mb-3" />
              <p className="text-sm font-medium text-white mb-1">No accounts connected</p>
              <p className="text-xs text-surface-200 max-w-xs">Connect your payment apps or bank accounts from the list to start importing transactions.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {accounts.filter(a => a.status === 'connected').map(acc => {
                const providerInfo = providers.find(p => p.id === acc.provider)
                
                return (
                  <motion.div key={acc._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card gradient-border glow-blue relative overflow-hidden bg-surface-900/40">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${providerInfo?.bg || 'bg-white/10'}`}>
                          {providerInfo ? <providerInfo.icon className={`w-5 h-5 ${providerInfo.color}`} /> : <Building2 className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{acc.accountName}</h3>
                          <p className="text-xs text-surface-200 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> 
                            Last synced: {new Date(acc.lastSynced).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="green" className="shadow-lg shadow-emerald-500/20 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Active</Badge>
                    </div>

                    {/* Import Section */}
                    <div className="relative z-10">
                      <h4 className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wider">Manual Import</h4>
                      <p className="text-xs text-surface-200 mb-4 leading-relaxed">
                        If automatic sync is delayed, you can manually upload a CSV statement exported from your {providerInfo?.name || 'bank'} app.
                      </p>
                      
                      <div className="relative">
                        <input 
                          type="file" 
                          id={`import-${acc._id}`} 
                          className="hidden" 
                          accept=".csv,.txt"
                          onChange={(e) => handleFileUpload(e, acc._id)}
                          disabled={isImporting}
                        />
                        <label 
                          htmlFor={`import-${acc._id}`}
                          className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all cursor-pointer text-sm font-medium text-emerald-400
                            ${isImporting && selectedAccountForImport === acc._id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {isImporting && selectedAccountForImport === acc._id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing file...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Upload CSV Statement</>
                          )}
                        </label>
                      </div>

                      {/* Import Result Feedback */}
                      {importResult && selectedAccountForImport === acc._id && (
                        <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-xs border ${importResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                          {importResult.success ? (
                            <><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Successfully imported {importResult.count} transactions.</>
                          ) : (
                            <><AlertTriangle className="w-4 h-4 flex-shrink-0" /> Failed to import: {importResult.error}</>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CSV Format Helper */}
      <div className="mt-8 card bg-surface-900/50">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <FileJson className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Supported CSV Format</h3>
            <p className="text-xs text-surface-200 mb-3">When uploading manual statements, please ensure your CSV file follows this exact format (with headers):</p>
            <div className="bg-surface-950 p-3 rounded-lg font-mono text-[11px] text-surface-100 overflow-x-auto border border-white/5">
              <p className="text-surface-700">Date,Description,Amount,Category</p>
              <p>2026-05-01,Netflix Subscription,15.99,subscriptions</p>
              <p>2026-05-03,Whole Foods Market,142.50,food</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
