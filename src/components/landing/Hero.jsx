import { Link } from 'react-router-dom'
import { ArrowRight, DollarSign } from 'lucide-react'
import FaultyTerminal from '../ui/FaultyTerminal'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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
          brightness={0.4}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="flex items-center justify-center gap-2 group mb-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-surface-400">BillMaster</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up opacity-0 stagger-1" style={{ animationFillMode: 'forwards' }}>
          <span className="text-white">Master your</span>
          <br />
          <span className="gradient-text">finances.</span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-surface-200 leading-relaxed mb-10 animate-slide-up opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
          Track expenses, scan receipts, and gain powerful insights into your spending patterns. The modern way to manage your bills.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
          <Link to="/register" className="btn-primary !px-8 !py-4 text-base group">
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/dashboard" className="btn-secondary !px-8 !py-4 text-base">
            View Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
          {[
            { value: '50K+', label: 'Active Users' },
            { value: '$2.4B', label: 'Tracked' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-surface-700 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 animate-slide-up opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-b from-primary-500/20 via-accent-500/10 to-transparent rounded-3xl blur-2xl" />
            <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs text-surface-700 ml-2">BillMaster Dashboard</span>
              </div>
              <div className="p-6 lg:p-8">
                {/* Mini dashboard preview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Expenses', val: '$4,247', color: 'text-primary-400' },
                    { label: 'Budget Used', val: '73%', color: 'text-accent-400' },
                    { label: 'Savings', val: '$1,553', color: 'text-emerald-400' },
                    { label: 'Bills Due', val: '3', color: 'text-amber-400' },
                  ].map((item) => (
                    <div key={item.label} className="glass-light rounded-xl p-4">
                      <p className="text-xs text-surface-700 mb-1">{item.label}</p>
                      <p className={`text-xl font-bold ${item.color}`}>{item.val}</p>
                    </div>
                  ))}
                </div>
                {/* Chart placeholder */}
                <div className="glass-light rounded-xl p-6 h-48 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary-500/60 to-primary-400/30 transition-all duration-500" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
