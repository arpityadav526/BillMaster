import { useState, useCallback, useEffect } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Badge, Button, Skeleton } from '../components/ui/index'
import { Upload, FileText, Image, CheckCircle2, Loader2, AlertCircle, X, Eye, Trash2 } from 'lucide-react'
import * as receiptService from '../services/receipt.service'

export default function ReceiptsPage() {
  const [dragActive, setDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState([])
  const [processedReceipts, setProcessedReceipts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await receiptService.getReceipts()
      setProcessedReceipts(res.data)
    } catch (err) {
      console.error('Failed to fetch receipts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReceipts()
  }, [fetchReceipts])

  const removeUpload = useCallback((id) => setUploadingFiles(prev => prev.filter(f => f.id !== id)), [])

  const handleUpload = useCallback(async (files) => {
    const newFiles = Array.from(files).map((f, i) => ({
      id: Date.now() + i, name: f.name, size: (f.size / 1024 / 1024).toFixed(1) + ' MB',
      progress: 0, status: 'uploading'
    }))
    setUploadingFiles(prev => [...prev, ...newFiles])

    for (const fileObj of newFiles) {
      const actualFile = Array.from(files).find(f => f.name === fileObj.name)
      try {
        await receiptService.uploadReceipt(actualFile)
        setUploadingFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'done' } : f))
        setTimeout(() => {
          removeUpload(fileObj.id)
          fetchReceipts()
        }, 2000)
      } catch (error) {
        console.error('Upload failed:', error)
        setUploadingFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'failed' } : f))
      }
    }
  }, [fetchReceipts, removeUpload])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }, [handleUpload])

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) handleUpload(e.target.files)
  }

  const handleDelete = async (id) => {
    try {
      await receiptService.deleteReceipt(id)
      fetchReceipts()
    } catch (err) {
      alert(err.message)
    }
  }

  const statusConfig = {
    processed: { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: 'green', label: 'Processed' },
    processing: { icon: <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />, badge: 'blue', label: 'Processing' },
    uploaded: { icon: <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />, badge: 'blue', label: 'Uploaded' },
    failed: { icon: <AlertCircle className="w-4 h-4 text-rose-400" />, badge: 'rose', label: 'Failed' },
  }


  const fileIcon = (name) => {
    if (name.match(/\.(jpg|jpeg|png|webp)$/i)) return <Image className="w-5 h-5 text-accent-400" />
    return <FileText className="w-5 h-5 text-primary-400" />
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Receipts</h1>
        <p className="text-sm text-surface-700">Upload and manage receipt scans with AI-powered OCR</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`stat-card-new mb-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${dragActive ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 hover:border-white/20'}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${dragActive ? 'bg-primary-500/20' : 'bg-white/5'}`}>
            <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-primary-400' : 'text-surface-700'}`} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {dragActive ? 'Drop files here' : 'Upload Receipts'}
          </h3>
          <p className="text-sm text-surface-200 mb-4">Drag & drop files or click to browse</p>
          <p className="text-xs text-surface-700">Supports JPG, PNG, PDF • Max 10MB per file</p>
          <input id="file-upload" type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} />
        </div>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="stat-card-new mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Upload Progress</h3>
          <div className="space-y-3">
            {uploadingFiles.map(file => (
              <div key={file.id} className="flex items-center gap-4 p-3 rounded-xl glass-light">
                <div className="p-2 rounded-lg bg-white/5">{fileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white font-medium truncate">{file.name}</p>
                    <button onClick={() => removeUpload(file.id)} className="p-1 rounded hover:bg-white/5 text-surface-700 hover:text-white transition-colors cursor-pointer flex-shrink-0 ml-2"><X className="w-3 h-3" /></button>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300" style={{ width: `${file.progress}%` }} />
                    </div>
                  )}
                  {file.status === 'processing' && (
                    <div className="flex items-center gap-2 text-xs text-primary-400"><Loader2 className="w-3 h-3 animate-spin" /> Processing with OCR...</div>
                  )}
                  {file.status === 'done' && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Complete</div>
                  )}
                </div>
                <span className="text-xs text-surface-700 flex-shrink-0">{file.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receipts Grid */}
      <div className="stat-card-new">
        <h3 className="text-lg font-semibold text-white mb-6">Processed Receipts</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : processedReceipts.length === 0 ? (
          <div className="py-12 text-center text-sm text-surface-700 italic">No receipts uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedReceipts.map(receipt => {
              const sc = statusConfig[receipt.status] || statusConfig.processed
              return (
                <div key={receipt._id} className="glass-light rounded-xl p-4 hover:bg-white/5 transition-all duration-200 group">
                  {/* File header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5">{fileIcon(receipt.originalName)}</div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-medium truncate max-w-[120px]">{receipt.originalName}</p>
                        <p className="text-xs text-surface-700">{(receipt.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Badge variant={sc.badge}>{sc.label}</Badge>
                  </div>

                  {/* Details */}
                  {receipt.status === 'processed' && receipt.extractedData && (
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-700">Vendor</span>
                        <span className="text-surface-200">{receipt.extractedData.vendor || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-700">Amount</span>
                        <span className="text-white font-semibold">${receipt.extractedData.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-700">Date</span>
                        <span className="text-surface-200">{receipt.extractedData.date ? new Date(receipt.extractedData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {(receipt.status === 'processing' || receipt.status === 'uploaded') && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                      <span className="text-xs text-primary-400">Extracting data...</span>
                    </div>
                  )}

                  {receipt.status === 'failed' && (
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-xs text-rose-400 mb-2">Failed to process this receipt</p>
                      <Button variant="secondary" size="sm" className="w-full !text-xs">Retry</Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs text-surface-200 hover:bg-white/5 transition-colors cursor-pointer"><Eye className="w-3 h-3" /> View</button>
                    <button onClick={() => handleDelete(receipt._id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
