import { useState, useRef } from 'react'
import { 
  User as UserIcon, Mail, Camera, Globe, Moon, Sun, Monitor, 
  CreditCard, Bell, Shield, Save, ChevronRight, CheckCircle2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as userService from '../services/user.service'
import { Button, Input, Card, Badge } from '../components/ui'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'USD',
    monthlyIncome: user?.monthlyIncome || 0,
    theme: user?.theme || 'dark',
    timezone: user?.timezone || 'UTC'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const response = await userService.updateProfile(formData)
      if (response.success) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        setSuccessMsg('Profile updated successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const uploadData = new FormData()
    uploadData.append('avatar', file)

    try {
      const response = await userService.updateAvatar(uploadData)
      if (response.success) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        setSuccessMsg('Avatar updated successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="text-surface-400">Manage your account preferences and personal information.</p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium animate-in zoom-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Account Status */}
        <div className="space-y-8">
          <Card className="p-6 text-center space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 opacity-50" />
            
            <div className="relative inline-block">
              <div 
                className={`w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white/5 transition-all duration-500 group-hover:ring-primary-500/30 cursor-pointer relative
                  ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                onClick={handleAvatarClick}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <div className={`w-full h-full bg-surface-800 flex items-center justify-center ${user?.avatar ? 'hidden' : 'flex'}`}>
                  <UserIcon className="w-12 h-12 text-surface-400" />
                </div>
                
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{user?.name}</h3>
              <p className="text-surface-400 text-sm">{user?.email}</p>
            </div>

            <div className="flex justify-center gap-2">
              <Badge variant="primary" className="bg-primary-500/10 text-primary-400 border-primary-500/20">
                PRO Member
              </Badge>
              <Badge variant="outline" className="text-surface-400 border-white/5">
                Beta Access
              </Badge>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <h4 className="text-sm font-semibold text-surface-400 uppercase tracking-wider px-2">Account Links</h4>
            <div className="space-y-1">
              {[
                { icon: CreditCard, label: 'Billing & Plans', color: 'text-blue-400' },
                { icon: Bell, label: 'Notifications', color: 'text-orange-400' },
                { icon: Shield, label: 'Privacy & Security', color: 'text-emerald-400' },
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <link.icon className={`w-5 h-5 ${link.color}`} />
                    <span className="text-sm font-medium text-surface-200">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-300 ml-1">Full Name</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-500 transition-colors" />
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-300 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-500 transition-colors" />
                    <Input 
                      name="email"
                      value={formData.email}
                      disabled
                      className="pl-10 opacity-60 bg-surface-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-300 ml-1">Preferred Currency</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-500 transition-colors" />
                    <select 
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-900/50 border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none"
                    >
                      {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-surface-300 ml-1">Timezone</label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-500 transition-colors" />
                    <select 
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-900/50 border border-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none"
                    >
                      {['UTC', 'PST', 'EST', 'GMT', 'CET', 'IST', 'JST'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-surface-300 ml-1">Interface Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, theme: t.id }))}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300
                        ${formData.theme === t.id 
                          ? 'bg-primary-500/10 border-primary-500/50 text-primary-400 ring-2 ring-primary-500/20' 
                          : 'bg-surface-900/50 border-white/5 text-surface-500 hover:border-white/10 hover:bg-surface-800'
                        }`}
                    >
                      <t.icon className="w-6 h-6" />
                      <span className="text-xs font-semibold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={isUpdating}
                  className="px-8 shadow-lg shadow-primary-500/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 bg-red-500/5 border-red-500/10 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-red-400">Danger Zone</h4>
              <p className="text-sm text-red-400/60">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <Button variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 px-6">
              Delete Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
