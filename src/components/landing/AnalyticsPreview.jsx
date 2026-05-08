export default function AnalyticsPreview() {
  const stats = [
    { label: 'Avg. Monthly Savings', value: '$1,240', change: '+18%', positive: true },
    { label: 'Bills Tracked', value: '2,847', change: '+24%', positive: true },
    { label: 'Time Saved', value: '12h/mo', change: '+32%', positive: true },
  ]

  return (
    <section id="analytics" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <span className="inline-block text-xs font-semibold text-accent-400 tracking-widest uppercase mb-4">Analytics</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
              Insights that drive
              <br />
              <span className="gradient-text">smarter decisions</span>
            </h2>
            <p className="text-surface-200 text-lg mb-10 leading-relaxed">
              Understand your spending patterns with beautiful visualizations and AI-powered recommendations that help you save more.
            </p>

            <div className="space-y-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-4 glass-light rounded-xl">
                  <div>
                    <p className="text-sm text-surface-200">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <span className={`text-sm font-semibold ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent rounded-3xl blur-2xl" />
            <div className="relative glass-card rounded-2xl p-6 lg:p-8">
              {/* Category breakdown */}
              <h3 className="text-sm font-semibold text-white mb-6">Spending by Category</h3>
              <div className="space-y-4">
                {[
                  { name: 'Food & Dining', pct: 28, color: '#f97316', amount: '$890' },
                  { name: 'Bills & Utilities', pct: 24, color: '#f43f5e', amount: '$750' },
                  { name: 'Shopping', pct: 22, color: '#a78bfa', amount: '$680' },
                  { name: 'Transportation', pct: 16, color: '#3b82f6', amount: '$520' },
                  { name: 'Entertainment', pct: 10, color: '#ec4899', amount: '$320' },
                ].map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                        <span className="text-surface-200">{cat.name}</span>
                      </div>
                      <span className="text-white font-medium">{cat.amount}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${cat.pct}%`, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}99)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-400">$3,160</p>
                  <p className="text-xs text-surface-700 mt-1">Total This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">-12%</p>
                  <p className="text-xs text-surface-700 mt-1">vs Last Month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
