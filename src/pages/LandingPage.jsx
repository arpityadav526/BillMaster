import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import AnalyticsPreview from '../components/landing/AnalyticsPreview'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />
      <Hero />
      <Features />
      <AnalyticsPreview />
      <Footer />
    </div>
  )
}
