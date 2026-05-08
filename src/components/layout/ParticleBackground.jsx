import { useEffect, useRef } from 'react'

/**
 * ParticleBackground — Canvas-based animated financial particle system.
 * Uses HTML5 Canvas for performance (no SVG/React re-renders per frame).
 * Renders floating orbs, grid lines, and subtle financial symbols.
 */
export default function ParticleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationId
    let width, height

    // ── Particle pool ──────────────────────────────────────────────
    class Particle {
      constructor() { this.reset(true) }
      reset(init = false) {
        this.x = Math.random() * width
        this.y = init ? Math.random() * height : height + 20
        this.size = Math.random() * 2.5 + 0.5
        this.speedY = -(Math.random() * 0.4 + 0.1)
        this.speedX = (Math.random() - 0.5) * 0.15
        this.opacity = Math.random() * 0.4 + 0.05
        this.hue = Math.random() > 0.7 ? 45 : 158  // gold or emerald
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.y < -10) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`
        ctx.fill()
      }
    }

    // ── Orb (slow-moving large glow) ──────────────────────────────
    class Orb {
      constructor(x, y, radius, hue) {
        this.x = x; this.y = y; this.radius = radius; this.hue = hue
        this.angle = Math.random() * Math.PI * 2
        this.speed = Math.random() * 0.0003 + 0.0001
        this.originX = x; this.originY = y
        this.drift = Math.random() * 80 + 40
      }
      update() {
        this.angle += this.speed
        this.x = this.originX + Math.sin(this.angle) * this.drift
        this.y = this.originY + Math.cos(this.angle * 0.7) * this.drift * 0.5
      }
      draw() {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius)
        grad.addColorStop(0, `hsla(${this.hue}, 60%, 50%, 0.06)`)
        grad.addColorStop(1, `hsla(${this.hue}, 60%, 50%, 0)`)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }
    }

    // ── Init ──────────────────────────────────────────────────────
    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const PARTICLE_COUNT = 60
    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle())
    const orbs = [
      new Orb(width * 0.15, height * 0.2, 350, 158),   // emerald top-left
      new Orb(width * 0.85, height * 0.7, 400, 45),    // gold bottom-right
      new Orb(width * 0.5,  height * 0.5, 280, 220),   // blue center
    ]

    // ── Grid lines ────────────────────────────────────────────────
    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.025)'
      ctx.lineWidth = 1
      const step = 80
      for (let x = 0; x < width; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }
    }

    // ── Render loop ───────────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, width, height)

      drawGrid()

      orbs.forEach(o => { o.update(); o.draw() })
      particles.forEach(p => { p.update(); p.draw() })

      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  )
}
