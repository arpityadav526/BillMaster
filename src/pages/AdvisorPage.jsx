import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { 
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, XAxis, YAxis 
} from 'recharts'
import { 
  AlertTriangle, Lightbulb, Bell, Bot, Mic, Send, MoreHorizontal, Receipt 
} from 'lucide-react'

// Sparkline data for Anomaly Detected
const sparklineData = [
  { val: 12 }, { val: 15 }, { val: 11 }, { val: 18 }, { val: 45 }, { val: 20 }, { val: 25 }
]

// Mini bar chart data for Savings Opportunity
const savingsMiniData = [
  { name: 'Oct', value: 8000, fill: '#10b981' },
  { name: 'Nov', value: 12000, fill: '#ec4899' },
  { name: 'Dec', value: 7000, fill: '#10b981' },
  { name: 'Other', value: 9500, fill: '#ec4899' }
]

// Chat comparative bar chart data
const compareData = [
  { name: 'Food', 'This month': 8500, 'Last month': 7500 },
  { name: 'Shopping', 'This month': 6000, 'Last month': 5000 },
  { name: 'Grocery', 'This month': 9000, 'Last month': 11000 },
  { name: 'Entertainment', 'This month': 3500, 'Last month': 2800 },
  { name: 'Travel', 'This month': 4500, 'Last month': 3200 }
]

// Chat breakdown donut chart data
const donutData = [
  { name: 'Travel', value: 4500, color: '#ec4899' },
  { name: 'Entertainment', value: 3500, color: '#3b82f6' },
  { name: 'Grocery', value: 9000, color: '#10b981' },
  { name: 'Food & Dining', value: 8500, color: '#8b5cf6' }
]

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      role: 'user',
      text: "How's my spending looking this month?"
    },
    {
      id: 'm2',
      role: 'ai',
      text: "Based on your current trend, you are on track to spend ₹45,000, which is 12% more than last month. The increase is primarily in 'Entertainment' and 'Travel'.",
      showCompareChart: true,
      breakdownText: "Here's a breakdown of your largest expenses.",
      showDonutChart: true
    },
    {
      id: 'm3',
      role: 'user',
      text: "Any suggestions to save?"
    },
    {
      id: 'm4',
      role: 'ai',
      text: "I've identified potential savings of ₹3,200. You could save on 'Grocery' by using loyalty programs and reviewing 'Subscription' plans.",
      quickActions: ["Explore Savings", "Set Savings Goal", "Analyze Subscriptions"]
    }
  ])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { id: Date.now().toString(), role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    
    // Simulate AI reply
    setTimeout(() => {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "I am analyzing your data to help you save. Let me check your current goals and alert thresholds."
      }
      setMessages(prev => [...prev, aiReply])
    }, 1000)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-6 items-start min-h-[calc(100vh-120px)] pb-6">
        
        {/* Left Column: AI Insights Feed */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <h2 className="text-xl font-bold text-white mb-6 font-sora tracking-tight">AI Insights Feed</h2>
          
          <div className="relative pl-6 border-l-2 border-purple-500/20 space-y-6">
            
            {/* Timeline Item 1: Anomaly Detected */}
            <div className="relative">
              {/* Bullet Node */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#0c1324]" />
              
              <div className="glow-magenta-border rounded-xl p-4 bg-surface-900/40">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider font-sora">Anomaly Detected</span>
                  <span className="text-[9px] text-surface-500">May 18, 2026</span>
                </div>
                <p className="text-xs text-surface-200 leading-relaxed font-dm-sans mb-3">
                  Unusual spike in "Shopping" category (₹8,500). Compare with last month.
                </p>
                
                {/* Tiny Sparkline */}
                <div className="h-10 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="spikeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#ec4899" strokeWidth={1.5} fill="url(#spikeGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[10px] cursor-pointer transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-surface-300 text-[10px] cursor-pointer transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline Item 2: Savings Opportunity */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#0c1324]" />
              
              <div className="glow-magenta-border rounded-xl p-4 bg-surface-900/40">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider font-sora">Savings Opportunity</span>
                  <span className="text-[9px] text-surface-500">May 15, 2026</span>
                </div>
                <p className="text-xs text-surface-200 leading-relaxed font-dm-sans mb-3">
                  Potential savings: ₹2,400 on subscriptions. Review active services.
                </p>

                {/* Tiny Bar Chart */}
                <div className="h-12 w-32 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={savingsMiniData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Bar dataKey="value" radius={[2, 2, 0, 0]} barSize={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[10px] cursor-pointer transition-colors">
                  Optimize Subscriptions
                </button>
              </div>
            </div>

            {/* Timeline Item 3: Budget Alert */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-[#0c1324]" />
              
              <div className="glow-magenta-border rounded-xl p-4 bg-surface-900/40">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider font-sora">Budget Alert</span>
                  <span className="text-[9px] text-surface-500">May 14, 2026</span>
                </div>
                <p className="text-xs text-surface-200 leading-relaxed font-dm-sans mb-3">
                  You've exceeded 80% of your "Food & Dining" budget.
                </p>

                {/* Custom styled progress bar */}
                <div className="w-full h-1.5 rounded-full bg-surface-800 overflow-hidden my-3">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: '85%' }}></div>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[10px] cursor-pointer transition-colors mt-2">
                  Adjust Budget
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: AI Advisor Chat Panel */}
        <div className="flex-1 w-full glass-card rounded-2xl border border-white/5 bg-surface-900/40 flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-surface-900/60 flex items-center gap-2.5">
            <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white font-sora">BillMaster AI Advisor</h3>
          </div>

          {/* Chat Bubbles Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar for AI */}
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Text Bubble */}
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-dm-sans ${
                        isUser 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-[#191f31] text-surface-200 rounded-tl-none border border-white/5'
                      }`}>
                        <p>{msg.text}</p>
                      </div>

                      {/* Embedded Comparative Bar Chart */}
                      {msg.showCompareChart && (
                        <div className="bg-[#121829]/60 border border-white/5 rounded-xl p-4 w-full sm:w-[320px]">
                          <div className="flex items-center gap-4 text-[9px] font-semibold text-surface-400 mb-3 justify-end select-none">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded bg-[#10b981]" />
                              <span>This month</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded bg-[#ec4899]" />
                              <span>Last month</span>
                            </div>
                          </div>
                          
                          <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={compareData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fill: '#64748b', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                              <Bar dataKey="This month" fill="#10b981" radius={[1.5, 1.5, 0, 0]} />
                              <Bar dataKey="Last month" fill="#ec4899" radius={[1.5, 1.5, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Embedded Breakdown Text */}
                      {msg.breakdownText && (
                        <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-dm-sans bg-[#191f31] text-surface-200 rounded-tl-none border border-white/5`}>
                          <p>{msg.breakdownText}</p>
                        </div>
                      )}

                      {/* Embedded Donut Chart */}
                      {msg.showDonutChart && (
                        <div className="bg-[#121829]/60 border border-white/5 rounded-xl p-4 w-full sm:w-[300px] flex items-center justify-between gap-4">
                          <div className="w-24 h-24 flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={donutData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={25}
                                  outerRadius={40}
                                  dataKey="value"
                                  stroke="none"
                                >
                                  {donutData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="flex-1 space-y-1.5 text-[8px] font-semibold text-surface-400">
                            {donutData.map((d) => (
                              <div key={d.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                  <span>{d.name}</span>
                                </div>
                                <span className="text-white">₹{d.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Embedded Quick Actions */}
                      {msg.quickActions && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {msg.quickActions.map((act) => (
                            <button 
                              key={act}
                              className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold transition-all cursor-pointer"
                              onClick={() => {
                                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: act }])
                              }}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#121829]/60 flex items-center gap-3">
            <button type="button" className="text-surface-400 hover:text-white cursor-pointer">
              <Bot className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              placeholder="Ask anything about your finances..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-[#191f31] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-emerald-500/30 transition-colors"
            />

            <button type="button" className="text-surface-400 hover:text-white cursor-pointer">
              <Mic className="w-5 h-5" />
            </button>

            <button 
              type="submit" 
              className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </DashboardLayout>
  )
}
