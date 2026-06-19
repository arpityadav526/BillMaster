import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Badge } from '../components/ui/index'
import { Brain, Send, Bot, User as UserIcon, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import * as analyticsService from '../services/analytics.service'
import { useAuth } from '../context/AuthContext'

export default function AdvisorPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${user?.name || 'there'}! I'm your AI financial advisor. I've analyzed your recent transactions and budget. How can I help you optimize your wealth today? 💡` }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const q = input.trim()
    if (!q || isLoading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setIsLoading(true)
    try {
      const res = await analyticsService.chatWithAI(q)
      setMessages(prev => [...prev, { role: 'ai', text: res.answer || 'Sorry, I could not answer that.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'The AI service is currently unavailable. Please try again later.' }])
    } finally { 
      setIsLoading(false) 
    }
  }

  const QUICK = [
    'How much did I spend this month?', 
    "What's my savings rate?", 
    'Analyze my shopping expenses', 
    'Can I afford a $500 purchase next week?',
    'What are my top spending categories?'
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 font-sora tracking-tight flex items-center gap-3">
          <Brain className="w-8 h-8 text-accent-400" /> AI Advisor
        </h1>
        <p className="text-surface-400 font-dm-sans">Your personalized intelligence feed and financial assistant</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col glass-card rounded-2xl border border-white/5 overflow-hidden shadow-xl animate-slide-up">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-surface-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-accent-400/20 flex items-center justify-center border border-accent-400/30">
                  <Bot className="w-5 h-5 text-accent-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface-950" />
              </div>
              <div>
                <h3 className="font-bold text-white font-sora">Wealth Assistant</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3" /> Online & analyzing
                </p>
              </div>
            </div>
            <Badge variant="purple" className="hidden sm:inline-flex shadow-[0_0_15px_rgba(139,92,246,0.2)]">GPT-4 Powered</Badge>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-surface-950/30">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                key={i} 
                className={`flex gap-3 sm:gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'ai' && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-accent-400/20 flex items-center justify-center flex-shrink-0 mt-1 border border-accent-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                    <Bot className="w-5 h-5 text-accent-400" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line font-dm-sans shadow-lg ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm border border-emerald-400/50'
                    : 'bg-surface-900 border border-white/10 text-surface-200 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
                
                {m.role === 'user' && (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1 border border-emerald-500/30">
                    <UserIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-xl bg-accent-400/20 flex items-center justify-center flex-shrink-0 border border-accent-400/30">
                  <Bot className="w-5 h-5 text-accent-400" />
                </div>
                <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-surface-900 border border-white/10 shadow-lg">
                  <div className="flex gap-1.5 items-center h-full">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-accent-400/60 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} className="h-2" />
          </div>

          {/* Quick Actions & Input */}
          <div className="p-4 border-t border-white/5 bg-surface-900/30">
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK.map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="px-3.5 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-surface-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all cursor-pointer font-dm-sans">
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-3">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Ask your financial advisor anything..."
                className="flex-1 py-3.5 px-5 rounded-xl border border-white/10 bg-surface-950/50 text-white placeholder-surface-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-dm-sans text-sm shadow-inner" 
                disabled={isLoading} 
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Insights Feed (Optional but fits "Insights Feed" requirement) */}
        <div className="hidden lg:flex w-80 flex-col gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <h3 className="font-bold text-white mb-4 font-sora">Recent Insights</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-surface-900/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="green" className="text-[10px] px-2 py-0.5">Budget</Badge>
                  <span className="text-[10px] text-surface-500">2 hrs ago</span>
                </div>
                <p className="text-sm text-surface-200 font-dm-sans">You're on track to save <strong className="text-emerald-400">$350</strong> more than last month. Keep up the disciplined food spending!</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-900/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="amber" className="text-[10px] px-2 py-0.5">Alert</Badge>
                  <span className="text-[10px] text-surface-500">Yesterday</span>
                </div>
                <p className="text-sm text-surface-200 font-dm-sans">Unusual charge of <strong className="text-white">$120</strong> at Amazon detected. Is this expected?</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-900/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="purple" className="text-[10px] px-2 py-0.5">Tip</Badge>
                  <span className="text-[10px] text-surface-500">3 days ago</span>
                </div>
                <p className="text-sm text-surface-200 font-dm-sans">Consider moving your excess cash to a high-yield savings account to earn <strong className="text-accent-400">5.1% APY</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
