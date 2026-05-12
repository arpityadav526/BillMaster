import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Receipt, Eye, EyeOff, Wallet, LayoutGrid, Plus, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FaultyTerminal from '../components/ui/FaultyTerminal'
import Stepper, { Step } from '../components/ui/Stepper'

const DEFAULT_CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Education']

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    monthlySalary: '',
    targetSavingsAmount: '',
    customCategories: DEFAULT_CATEGORIES
  })
  const [newCategory, setNewCategory] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }
    if (step === 2) {
      if (!formData.monthlySalary || !formData.targetSavingsAmount) {
        setError('Please provide your financial baseline')
        return false
      }
    }
    setError('')
    return true
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategory.trim() && !formData.customCategories.includes(newCategory.trim())) {
      setFormData({
        ...formData,
        customCategories: [...formData.customCategories, newCategory.trim()]
      })
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (cat) => {
    setFormData({
      ...formData,
      customCategories: formData.customCategories.filter(c => c !== cat)
    })
  }

  const handleFinalStep = async () => {
    setError('')
    setIsLoading(true)
    
    try {
      const payload = {
        ...formData,
        monthlySalary: Number(formData.monthlySalary),
        targetSavingsAmount: Number(formData.targetSavingsAmount),
        preferences: { theme: 'dark', notifications: true }
      }
      const result = await register(payload)
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = formData.password
    if (!p) return { width: '0%', color: 'bg-surface-800', label: '' }
    if (p.length < 6) return { width: '25%', color: 'bg-rose-500', label: 'Weak' }
    if (p.length < 10) return { width: '50%', color: 'bg-amber-500', label: 'Fair' }
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { width: '100%', color: 'bg-emerald-500', label: 'Strong' }
    return { width: '75%', color: 'bg-primary-500', label: 'Good' }
  }

  const strength = passwordStrength()

  const stepTitles = [
    { title: 'Create your account', subtitle: 'Step 1: Basic account information' },
    { title: 'Financial Baseline', subtitle: 'Step 2: Tell us about your monthly goals' },
    { title: 'Customize Categories', subtitle: 'Step 3: Define where your money goes' },
  ]

  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12 bg-surface-950">
      {/* FaultyTerminal Background */}
      <div className="absolute inset-0">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.5}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.1}
          tint="#34D399"
          mouseReact
          mouseStrength={0.5}
          pageLoadAnimation
          brightness={0.3}
        />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">BillMaster</span>
        </Link>

        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Step Title — driven by Stepper's onStepChange */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white mb-1">
              {stepTitles[currentStepIndex]?.title}
            </h1>
            <p className="text-sm text-surface-400">
              {stepTitles[currentStepIndex]?.subtitle}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3 animate-slide-down">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Stepper
            initialStep={1}
            onStepChange={(step) => {
              setError('')
              setCurrentStepIndex(step - 1)
            }}
            onFinalStepCompleted={handleFinalStep}
            validateBeforeNext={validateStep}
            backButtonText="Back"
            nextButtonText="Continue"
            completeButtonText="Complete Setup"
            loading={isLoading}
            disableStepIndicators={false}
          >
            {/* STEP 1: ACCOUNT DETAILS */}
            <Step>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-200">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-200">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-200">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field !pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }} />
                      </div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-surface-400">{strength.label} Strength</p>
                    </div>
                  )}
                </div>
              </div>
            </Step>

            {/* STEP 2: FINANCIAL DATA */}
            <Step>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Why we need this?</h3>
                      <p className="text-xs text-surface-400">This helps us calculate your savings potential and provide ML-driven advice.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-200">Monthly Net Salary</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">$</span>
                    <input
                      type="number"
                      name="monthlySalary"
                      placeholder="0.00"
                      value={formData.monthlySalary}
                      onChange={handleChange}
                      className="input-field !pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-surface-200">Target Savings Amount</label>
                    <span className="text-[10px] text-primary-400 font-bold uppercase">Goal</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">$</span>
                    <input
                      type="number"
                      name="targetSavingsAmount"
                      placeholder="0.00"
                      value={formData.targetSavingsAmount}
                      onChange={handleChange}
                      className="input-field !pl-8"
                    />
                  </div>
                  <p className="text-[11px] text-surface-500">The amount you want to save each month after all expenses.</p>
                </div>
              </div>
            </Step>

            {/* STEP 3: CATEGORIES */}
            <Step>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-surface-200">Your Spending Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {formData.customCategories.map((cat) => (
                      <div key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800 border border-white/5 text-xs text-white group hover:border-primary-500/50 transition-all">
                        {cat}
                        <button onClick={() => handleRemoveCategory(cat)} className="text-surface-500 hover:text-rose-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom category..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="input-field !py-2"
                  />
                  <button type="submit" className="w-12 h-10 rounded-xl bg-surface-800 border border-white/10 flex items-center justify-center hover:bg-surface-700 transition-colors">
                    <Plus className="w-5 h-5 text-primary-400" />
                  </button>
                </form>

                <div className="p-4 rounded-2xl bg-accent-500/5 border border-accent-500/10">
                  <div className="flex gap-3">
                    <LayoutGrid className="w-5 h-5 text-accent-400 flex-shrink-0" />
                    <p className="text-[11px] text-surface-400 leading-relaxed">
                      You can always add more or rename these later in your settings. These will be used to group your expenses.
                    </p>
                  </div>
                </div>
              </div>
            </Step>
          </Stepper>

          <p className="text-center text-sm text-surface-400 mt-10">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
