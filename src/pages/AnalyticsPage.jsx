import { useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import SpendingHeatmap from './analytics/SpendingHeatmap'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl p-3 text-xs bg-[#121829] border border-white/10 text-white font-mono">
        <p className="font-bold border-b border-white/5 pb-1 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: ₹{Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const categorySpendingData = [
  { name: "Jan '26", "Housing & Rent": 17500, "Food & Dining": 7200, Transportation: 3800, "Shopping & Retail": 5500, Entertainment: 3000, Other: 4500 },
  { name: "Feb '26", "Housing & Rent": 18000, "Food & Dining": 6900, Transportation: 4000, "Shopping & Retail": 4800, Entertainment: 3200, Other: 4000 },
  { name: "Mar '26", "Housing & Rent": 18000, "Food & Dining": 8000, Transportation: 4100, "Shopping & Retail": 5800, Entertainment: 2800, Other: 5200 },
  { name: "Apr '26", "Housing & Rent": 18000, "Food & Dining": 7800, Transportation: 3500, "Shopping & Retail": 5000, Entertainment: 3400, Other: 4800 },
  { name: "May '26", "Housing & Rent": 18000, "Food & Dining": 8500, Transportation: 4200, "Shopping & Retail": 6000, Entertainment: 3500, Other: 5000 },
  { name: "Jun '26", "Housing & Rent": 18000, "Food & Dining": 8200, Transportation: 4500, "Shopping & Retail": 6200, Entertainment: 4000, Other: 5500 }
]

const netWorthData = [
  { name: "Jan '26", netWorth: 1250000 },
  { name: "Feb '26", netWorth: 1320000 },
  { name: "Mar '26", netWorth: 1400000 },
  { name: "Apr '26", netWorth: 1510000 },
  { name: "May '26", netWorth: 1670000 },
  { name: "Jun '26", netWorth: 1820000 }
]

export default function AnalyticsPage() {
  const [viewByNetWorth, setViewByNetWorth] = useState(false)

  return (
    <DashboardLayout layoutType="top-nav-tabs">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1.5 font-sora">Analytics Studio</h1>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-surface-400 font-medium">
          <div className="flex items-center gap-2">
            <span>Date Range:</span>
            <select className="bg-[#121829] border border-white/5 rounded-xl px-3.5 py-2 text-white cursor-pointer focus:outline-none">
              <option>Last 6 Months (Jan 2026 - Jun 2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>View by:</span>
            <div className="flex items-center gap-1.5">
              <span>Spending</span>
              <button 
                onClick={() => setViewByNetWorth(!viewByNetWorth)}
                className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer ${
                  viewByNetWorth ? 'bg-emerald-500' : 'bg-surface-800'
                }`}
              >
                <div 
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                    viewByNetWorth ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
              <span>Net Worth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Card 1: Spending by Category Stacked Bar Chart */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40">
          <h3 className="text-sm font-bold text-white font-sora mb-1">Spending by Category</h3>
          <p className="text-[10px] text-surface-500 mb-6 font-dm-sans uppercase tracking-widest font-semibold">Jan '26 - Jun '26</p>
          
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categorySpendingData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Housing & Rent" stackId="a" fill="#3f51b5" />
              <Bar dataKey="Food & Dining" stackId="a" fill="#10b981" />
              <Bar dataKey="Transportation" stackId="a" fill="#f43f5e" />
              <Bar dataKey="Shopping & Retail" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="Entertainment" stackId="a" fill="#06b6d4" />
              <Bar dataKey="Other" stackId="a" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Card 2: Net Worth Trends Area Chart */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40">
          <h3 className="text-sm font-bold text-white font-sora mb-1">Net Worth Trends</h3>
          <p className="text-[10px] text-surface-500 mb-6 font-dm-sans uppercase tracking-widest font-semibold">Jan '26 - Jun '26</p>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={netWorthData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#10b981" strokeWidth={2.5} fill="url(#nwGrad)" dot={{ r: 3, fill: '#10b981', strokeWidth: 1 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Card 3: Spending Heatmap Grid */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-sora mb-1">Spending Heatmap</h3>
            <p className="text-[10px] text-surface-500 mb-4 font-dm-sans uppercase tracking-widest font-semibold">Last 90 Days</p>
          </div>
          <SpendingHeatmap />
        </div>
      </div>

      {/* Bottom Card: Key Insights */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 bg-surface-900/40">
        <h3 className="text-base font-bold text-white font-sora mb-4">Key Insights</h3>
        <ul className="space-y-3.5 text-sm text-surface-200 font-dm-sans list-disc list-inside">
          <li className="marker:text-emerald-400">
            Spending on dining has increased by <strong className="text-white">12%</strong> this month.
          </li>
          <li className="marker:text-emerald-400">
            Net worth has grown consistently by an average of <strong className="text-white">5%</strong> per month.
          </li>
          <li className="marker:text-emerald-400">
            Highest spending occurs on <strong className="text-white">weekends</strong>.
          </li>
        </ul>
      </div>
    </DashboardLayout>
  )
}
