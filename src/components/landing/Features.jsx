import { BarChart3, Receipt, Shield, Zap, Brain, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Receipt,
    title: 'Smart Receipt Scanning',
    description: 'Upload receipts and let AI extract amounts, vendors, and categories automatically.',
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Beautiful charts and insights that help you understand where your money goes.',
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations to optimize your spending and save more.',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your financial data is encrypted and protected with enterprise-level security.',
    gradient: 'from-rose-400 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Real-Time Tracking',
    description: 'Instant updates and notifications for every transaction and budget milestone.',
    gradient: 'from-amber-400 to-amber-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Track expenses on-the-go with our responsive, beautifully designed interface.',
    gradient: 'from-cyan-400 to-cyan-500',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-semibold text-primary-400 tracking-widest uppercase mb-4">Features</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Everything you need to
            <br />
            <span className="gradient-text">manage expenses</span>
          </h2>
          <p className="max-w-2xl mx-auto text-surface-200 text-lg">
            Powerful tools designed for modern financial management, wrapped in a beautiful interface.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card group cursor-default"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-surface-200 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
