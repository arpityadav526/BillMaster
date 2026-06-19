import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Receipt, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FaultyTerminal from '../components/ui/FaultyTerminal'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-surface-950 overflow-hidden">
      
      {/* Left Pane - Brand & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/5">
        <div className="absolute inset-0 overflow-hidden">
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
            tint="#10b981"
            mouseReact
            mouseStrength={0.5}
            pageLoadAnimation
            brightness={0.3}
          />
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950/80 via-surface-950/40 to-surface-950/90" />
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight font-sora">BillMaster</span>
          </Link>
        </div>

        {/* Value Prop */}
        <div className="relative z-10 max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> AI-Powered Financial Control
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight font-sora">
            Master your wealth with <span className="gradient-text">intelligent insights</span>
          </h1>
          <p className="text-surface-300 text-lg mb-10 leading-relaxed font-dm-sans">
            Connect your accounts and let our advanced AI categorize, analyze, and optimize your financial future in real-time.
          </p>
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 text-surface-200">
              <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center border border-white/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-medium">Bank-level 256-bit encryption</span>
            </div>
            <div className="flex items-center gap-4 text-surface-200">
              <div className="w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center border border-white/5">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-medium">Predictive cash flow modeling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noiseFilter\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.65\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noiseFilter)\\'/%3E%3C/svg%3E')] opacity-[0.02]" />
        
        <div className="w-full max-w-md relative z-10 animate-scale-in">
          {/* Mobile Logo (hidden on desktop) */}
          <Link to="/" className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-700 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight font-sora">BillMaster</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-3 font-sora">Welcome back</h2>
            <p className="text-surface-400 font-dm-sans">Enter your credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3 animate-fade-in">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-surface-200">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full padding-4 rounded-xl border border-white/10 bg-surface-900/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all px-4 py-3 font-dm-sans"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-surface-200">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full padding-4 rounded-xl border border-white/10 bg-surface-900/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all px-4 py-3 pr-12 font-dm-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3.5 px-4 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all flex justify-center items-center gap-2 mt-4 hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-sm font-medium text-surface-500 font-dm-sans">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Social */}
          <button 
            className="w-full rounded-xl bg-surface-900 border border-white/10 py-3.5 px-4 font-medium text-surface-200 hover:bg-surface-800 hover:border-white/20 transition-all flex justify-center items-center gap-3"
            onClick={async () => {
              try {
                const mockUserToken = JSON.stringify({
                  email: 'google.demo@example.com',
                  name: 'Google Demo User',
                  picture: 'https://lh3.googleusercontent.com/a/ACg8ocL_V-Y5X5Z-X-X-X'
                });
                const res = await googleLogin(mockUserToken);
                if (res.success) navigate('/dashboard');
              } catch {
                setError('Google login failed. Try again.');
              }
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {/* Sign up link */}
          <p className="text-center text-sm text-surface-400 mt-8 font-dm-sans">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
