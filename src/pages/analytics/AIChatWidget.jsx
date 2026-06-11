import { useState, useEffect, useRef } from 'react'
import { Badge } from '../../components/ui/index'
import { Brain, Send, Bot, User as UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import * as analyticsService from '../../services/analytics.service'

export default function AIChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI financial advisor. Ask me anything about your spending, savings, or budget. 💡" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
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
      setMessages(prev => [...prev, { role: 'ai', text: 'The AI service is currently unavailable.' }])
    } finally { setIsLoading(false) }
  }

  const QUICK = ['How much did I spend this month?', "What's my savings rate?", 'Show my spending trend', 'Any recurring charges?']

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="stat-card-new gradient-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-accent-400/10 border border-accent-400/20">
          <Brain className="w-5 h-5 text-accent-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Financial Advisor</h3>
          <p className="text-xs text-surface-700">Ask anything about your finances</p>
        </div>
        <Badge variant="purple" className="ml-auto">AI Chat</Badge>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK.map(q => (
          <button key={q} onClick={() => setInput(q)}
            className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-surface-200 hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-400 transition-all cursor-pointer">
            {q}
          </button>
        ))}
      </div>
      <div className="h-56 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-accent-400" />
              </div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
              m.role === 'user'
                ? 'bg-primary-500/20 border border-primary-500/30 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/10 text-surface-200 rounded-tl-sm'
            }`}>{m.text}</div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4 text-primary-400" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-accent-400/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent-400" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white/5 border border-white/10">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent-400/60 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your finances..."
          className="input-field flex-1 py-2.5 text-xs" disabled={isLoading} />
        <button type="submit" disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-400 hover:bg-primary-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  )
}
