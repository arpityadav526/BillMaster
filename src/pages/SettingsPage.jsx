import { useState, useEffect } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button, Input } from '../components/ui/index'
import { User, Shield, Bell, Moon, Sun, Monitor, Trash2, Camera, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import * as authService from '../services/auth.service'

export default function SettingsPage() {
  const { user, login, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  // Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    currency: 'USD',
    monthlyIncomeTarget: '5000',
    financialGoal: 'Buy a House',
  })

  // Sync local form state with global user state
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        currency: user.currency || 'USD',
        monthlyIncomeTarget: user.monthlyIncomeTarget || '5000',
        financialGoal: user.financialGoal || 'Buy a House',
      })
    }
  }, [user])
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [avatarSuccess, setAvatarSuccess] = useState('')

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation: Only images, max 2MB
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB.')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await authService.updateAvatar(formData)
      
      // Update user in context and clear preview
      updateUser(res.data)
      setPreviewUrl(null)
      setAvatarSuccess('Profile picture updated successfully!')
      setTimeout(() => setAvatarSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to upload avatar', err)
      setPreviewUrl(null)
      alert('Failed to upload avatar. Check server logs.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      const res = await authService.updateProfile({ 
        name: profileData.name,
        currency: profileData.currency,
        monthlyIncomeTarget: Number(profileData.monthlyIncomeTarget),
        financialGoal: profileData.financialGoal
      })
      updateUser(res.data)
      setProfileSuccess('Profile details updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      console.error(err)
      alert('Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setPasswordSuccess('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Moon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-surface-700">Manage your account preferences and settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                  ${activeTab === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-surface-200 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Avatar Section */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                  {avatarSuccess && <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{avatarSuccess}</motion.span>}
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-surface-800 border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden ring-4 ring-emerald-500/10 group-hover:ring-emerald-500/30 transition-all duration-300">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      ) : previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover animate-pulse" />
                      ) : user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <span className="text-3xl font-bold text-surface-200">{user?.name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600 transition-colors shadow-lg hover:scale-110 active:scale-95 duration-200">
                      <Camera className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Upload new avatar</p>
                    <p className="text-xs text-surface-700">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <form onSubmit={handleProfileSave} className="card relative overflow-hidden">
                {isSavingProfile && (
                  <div className="absolute inset-0 z-20 bg-surface-950/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  {profileSuccess && <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{profileSuccess}</motion.span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <Input 
                    label="Full Name" 
                    value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                  />
                  <Input 
                    label="Email Address" 
                    value={profileData.email} 
                    disabled 
                    className="opacity-60 cursor-not-allowed"
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-200">Default Currency</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      value={profileData.currency}
                      onChange={e => setProfileData({...profileData, currency: e.target.value})}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  
                  <Input 
                    label="Monthly Income Target" 
                    type="number"
                    value={profileData.monthlyIncomeTarget} 
                    onChange={e => setProfileData({...profileData, monthlyIncomeTarget: e.target.value})} 
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-surface-200">Primary Financial Goal</label>
                    <select 
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      value={profileData.financialGoal}
                      onChange={e => setProfileData({...profileData, financialGoal: e.target.value})}
                    >
                      <option value="Buy a House">Buy a House</option>
                      <option value="Save for Retirement">Save for Retirement</option>
                      <option value="Pay off Debt">Pay off Debt</option>
                      <option value="Build Emergency Fund">Build Emergency Fund</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h3 className="text-lg font-semibold text-white mb-2">Theme Preferences</h3>
              <p className="text-sm text-surface-700 mb-6">Customize the look and feel of BillMaster.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all cursor-pointer
                      ${theme === t.id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <t.icon className={`w-8 h-8 ${theme === t.id ? 'text-emerald-400' : 'text-surface-200'}`} />
                    <span className={`text-sm font-medium ${theme === t.id ? 'text-emerald-400' : 'text-surface-200'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <form onSubmit={handlePasswordChange} className="card">
                <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
                {passwordError && <div className="p-3 mb-6 text-sm text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">{passwordError}</div>}
                {passwordSuccess && <div className="p-3 mb-6 text-sm text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">{passwordSuccess}</div>}
                
                <div className="space-y-4 mb-6 max-w-md">
                  <Input 
                    label="Current Password" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    required
                  />
                  <Input 
                    label="New Password" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    required
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="flex justify-start pt-4 border-t border-white/5">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                </div>
              </form>

              <div className="card border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                </div>
                <p className="text-sm text-surface-200 mb-6 max-w-xl">
                  Once you delete your account, there is no going back. Please be certain. All your data, expenses, and linked accounts will be permanently removed.
                </p>
                <Button variant="danger">Delete Account</Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                {[
                  { title: 'Budget Alerts', desc: 'Get notified when you approach or exceed budget limits' },
                  { title: 'Weekly Summary', desc: 'Receive a weekly email summarizing your spending' },
                  { title: 'Unusual Activity', desc: 'Alerts for unusually large expenses' },
                  { title: 'Product Updates', desc: 'News about new BillMaster features and improvements' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between pb-6 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                      <p className="text-xs text-surface-700">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                      <div className="w-11 h-6 bg-surface-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
