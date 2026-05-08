import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt, ArrowRight, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">BillMaster</span>
        </Link>

        <div className="glass-card rounded-2xl p-8">
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
                <p className="text-sm text-surface-200">Enter your email and we&apos;ll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-surface-200">Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary w-full group">
                  Send Reset Link
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-500/15 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
              <p className="text-sm text-surface-200 mb-6">
                We&apos;ve sent a password reset link to
                <br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary w-full">
                Try another email
              </button>
            </div>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-surface-200 hover:text-white transition-colors mt-6">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
