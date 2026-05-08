import { Link } from 'react-router-dom'
import { ArrowRight, DollarSign, Globe, MessageCircle } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Documentation', 'API Reference', 'Community', 'Support'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  }

  return (
    <footer className="relative border-t border-white/5">
      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Ready to master your
            <br />
            <span className="gradient-text">finances?</span>
          </h2>
          <p className="text-lg text-surface-200 mb-10 max-w-2xl mx-auto">
            Join thousands of users who've transformed their financial habits with BillMaster.
          </p>
          <Link to="/register" className="btn-primary !px-8 !py-4 text-base group">
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Bill<span className="text-emerald-400">Master</span></span>
            </div>
            <p className="text-sm text-surface-700 leading-relaxed mb-4">
              Smart expense tracking for the modern world.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-white/5 text-surface-700 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-white/5 text-surface-700 hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-surface-700 hover:text-surface-200 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-700">© 2026 BillMaster. All rights reserved.</p>
          <p className="text-xs text-surface-700">Crafted with precision for modern finance.</p>
        </div>
      </div>
    </footer>
  )
}
