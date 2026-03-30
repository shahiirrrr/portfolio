import { useEffect, useRef } from 'react'

const SYMBOLS = ['{}', '< />', '=>', 'const', 'function', 'import', 'export', 'let', 'return']
const BUG_SYMBOLS = ['{', '/>', '>', 'cost', 'functon', 'impor', 'expor', 'le', 'retrn']

const CodeParticles = () => {
  const canvasRef = useRef(null)
  const particles = useRef([])
  const mouse = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.isBug = Math.random() < 0.1
        this.symbol = this.isBug 
          ? BUG_SYMBOLS[Math.floor(Math.random() * BUG_SYMBOLS.length)]
          : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        
        this.size = Math.random() * 12 + 10
        this.color = this.isBug ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.2)'
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.angle = Math.random() * Math.PI * 2
        this.spin = (Math.random() - 0.5) * 0.01
        this.fixed = false
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.angle += this.spin

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        // Mouse interaction
        const dx = mouse.current.x - this.x
        const dy = mouse.current.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 100) {
          const forceX = dx / dist
          const forceY = dy / dist
          
          if (this.isBug && !this.fixed) {
            // Bugs attract slightly (like a magnet for the cursor to fix them)
            this.x += forceX * 0.5
            this.y += forceY * 0.5
          } else {
            // Normal particles repel
            this.x -= forceX * 1
            this.y -= forceY * 1
          }

          // Fix bug on close proximity
          if (this.isBug && !this.fixed && dist < 30) {
            this.fixBug()
          }
        }
      }

      fixBug() {
        this.fixed = true
        this.isBug = false
        this.symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        this.color = 'rgba(34, 197, 94, 0.8)' // Vibrant green when fixed
        
        // After 2 seconds, fade to normal opacity
        setTimeout(() => {
          this.color = 'rgba(255, 255, 255, 0.2)'
        }, 2000)
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        
        ctx.font = `${this.size}px "Fira Code", monospace`
        
        // Add glow for bugs and fixed particles
        if (this.isBug && !this.fixed) {
          ctx.shadowBlur = 15
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)'
        } else if (this.fixed) {
          ctx.shadowBlur = 20
          ctx.shadowColor = 'rgba(34, 197, 94, 0.8)'
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = this.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.symbol, 0, 0)
        ctx.restore()
      }
    }

    const initParticles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 15000)
      particles.current = Array.from({ length: count }, () => new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current.forEach(p => {
        p.update()
        p.draw()
      })
      requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleMouseMove = (e) => {
    mouse.current = { x: e.clientX, y: e.clientY }
  }

  const handleClick = (e) => {
    // Check if any bug particle was clicked
    particles.current.forEach(p => {
      if (p.isBug && !p.fixed) {
        const dx = e.clientX - p.x
        const dy = e.clientY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 50) {
          p.fixBug()
        }
      }
    })
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="fixed inset-0 pointer-events-auto z-[0] opacity-60"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

export default CodeParticles
