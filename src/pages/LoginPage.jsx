import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Receipt, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.98.12.01.24.02.36.02.94 0 2.1-.63 2.62-1.44z" />
  </svg>
)

const MicrosoftIcon = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 23 23" fill="currentColor">
    <path d="M0 0h11v11H0z" fill="#f25022" />
    <path d="M12 0h11v11H12z" fill="#7fba00" />
    <path d="M0 12h11v11H0z" fill="#00a4ef" />
    <path d="M12 12h11v11H12z" fill="#ffb900" />
  </svg>
)

function WaveGraphics() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth
      canvas.height = canvas.parentElement.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let count = 0
    const points = []
    const numPoints = 30
    
    // Initialize grid points for the constellation overlay
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      })
    }

    const draw = () => {
      if (!canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Draw Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bgGrad.addColorStop(0, '#0c1324')
      bgGrad.addColorStop(0.5, '#121829')
      bgGrad.addColorStop(1, '#1b1b36')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Draw Waves
      ctx.save()
      count += 0.004
      
      const drawWave = (offset, amp, freq, color1, color2) => {
        ctx.beginPath()
        const grad = ctx.createLinearGradient(0, canvas.height / 2, canvas.width, canvas.height)
        grad.addColorStop(0, color1)
        grad.addColorStop(1, color2)
        ctx.fillStyle = grad
        
        ctx.moveTo(0, canvas.height)
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = canvas.height * 0.55 + Math.sin(x * freq + count + offset) * amp + Math.cos(x * 0.0015 + count * 0.4) * 25
          ctx.lineTo(x, y)
        }
        ctx.lineTo(canvas.width, canvas.height)
        ctx.closePath()
        ctx.fill()
      }

      // Draw bottom/back wave (purple)
      drawWave(0, 45, 0.002, 'rgba(88, 28, 135, 0.12)', 'rgba(76, 29, 149, 0.25)')
      // Draw middle wave (blue/indigo)
      drawWave(Math.PI / 2, 55, 0.0018, 'rgba(30, 58, 138, 0.18)', 'rgba(67, 56, 202, 0.35)')
      // Draw top wave (bright cyan/blue highlights)
      drawWave(Math.PI, 35, 0.003, 'rgba(17, 94, 89, 0.12)', 'rgba(30, 64, 175, 0.3)')
      ctx.restore()

      // 3. Draw Grid/Constellation
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        p.x += p.vx
        p.y += p.vy
        
        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Draw node
        ctx.fillStyle = 'rgba(147, 197, 253, 0.15)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j]
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 140) {
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.04 * (1 - dist / 140)})`
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
  )
}

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
    <div className="min-h-screen flex w-full bg-[#0c1324] overflow-hidden">
      
      {/* Left Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <Receipt className="w-4.5 h-4.5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight font-sora">BillMaster</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-1.5 font-sora tracking-tight">Welcome Back</h2>
            <p className="text-surface-400 font-dm-sans text-sm">to BillMaster.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Social */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-6">
            <button 
              type="button" 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.03] text-[11px] font-medium text-surface-200 hover:bg-white/10 hover:border-white/15 transition-all cursor-pointer"
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
              <GoogleIcon /> Continue with Google
            </button>
            
            <button 
              type="button" 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.03] text-[11px] font-medium text-surface-200 hover:bg-white/10 hover:border-white/15 transition-all cursor-pointer"
            >
              <AppleIcon /> Continue with Apple
            </button>
            
            <button 
              type="button" 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.03] text-[11px] font-medium text-surface-200 hover:bg-white/10 hover:border-white/15 transition-all cursor-pointer"
            >
              <MicrosoftIcon /> Continue with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest font-dm-sans">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-surface-200">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/5 bg-[#121829] text-white placeholder-surface-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all px-3.5 py-2.5 text-xs font-dm-sans focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-surface-200">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/5 bg-[#121829] text-white placeholder-surface-700 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all px-3.5 py-2.5 text-xs font-dm-sans pr-10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox & Forgot Password */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <label className="flex items-center gap-2 text-surface-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-white/5 bg-[#121829] text-emerald-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-emerald-500" 
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-surface-400 hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="w-full rounded-lg bg-[#2e9d66] hover:bg-[#258253] py-2.5 px-4 font-semibold text-white transition-all flex justify-center items-center gap-2 mt-6 cursor-pointer text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-xs text-surface-400 mt-6 font-dm-sans">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-white hover:underline font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Pane - Graphics */}
      <div className="hidden lg:flex lg:w-1/2 p-6 h-screen items-center justify-center relative">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 relative bg-[#121829] flex flex-col justify-end p-12">
          {/* Canvas animation background */}
          <WaveGraphics />
        </div>
      </div>
    </div>
  )
}
