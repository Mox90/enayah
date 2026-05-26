'use client'

import { useEffect, useRef } from 'react'

const Loader = ({
  message = 'Initializing Najran Armed Forces Hospital...',
}: {
  message?: string
}) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const W = 340
    const H = 120

    const ctx = canvas.getContext('2d')!
    //if (!ctx) return

    const waypoints: [number, number][] = [
      [0, 60],
      [40, 60],
      [55, 58],
      [65, 62],
      [80, 20],
      [95, 100],
      [110, 60],
      [150, 60],
      [165, 58],
      [175, 62],
      [190, 20],
      [205, 100],
      [220, 60],
      [320, 60],
    ]

    function buildSampledPath(
      pts: [number, number][],
      density = 2,
    ): [number, number][] {
      const out: [number, number][] = []
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i]
        const [x1, y1] = pts[i + 1]
        const steps = Math.max(
          2,
          Math.ceil(Math.hypot(x1 - x0, y1 - y0) * density),
        )
        for (let s = 0; s < steps; s++) {
          const t = s / steps
          out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
        }
      }
      out.push(pts[pts.length - 1])
      return out
    }

    const sampled = buildSampledPath(waypoints)
    const N = sampled.length
    const SPEED = 1.6
    const TRAIL = Math.floor(N * 0.18)
    const ERASE = Math.floor(N * 0.06)
    let progress = 0

    function drawGrid() {
      ctx.strokeStyle = 'rgba(0,255,120,0.06)'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= W; x += 10) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y <= H; y += 10) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(0,255,120,0.10)'
      ctx.lineWidth = 0.8
      for (let x = 0; x <= W; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }
      for (let y = 0; y <= H; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
    }

    function drawGhost() {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(0,255,120,0.12)'
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.moveTo(sampled[0][0], sampled[0][1])
      for (let i = 1; i < N; i++) ctx.lineTo(sampled[i][0], sampled[i][1])
      ctx.stroke()
    }

    function render() {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, W, H)
      drawGrid()
      drawGhost()

      const head = Math.floor(progress) % N

      // Erase block ahead of head
      let exMin = W,
        exMax = 0
      for (let e = 0; e < ERASE; e++) {
        const ix = (head + e) % N
        exMin = Math.min(exMin, sampled[ix][0])
        exMax = Math.max(exMax, sampled[ix][0])
      }
      ctx.fillStyle = '#000000'
      ctx.fillRect(exMin - 4, 0, exMax - exMin + 8, H)
      ctx.save()
      ctx.beginPath()
      ctx.rect(exMin - 4, 0, exMax - exMin + 8, H)
      ctx.clip()
      drawGrid()
      ctx.restore()

      // Trail with fade
      type Seg = [number, number][]
      const segs: Seg[] = []
      let seg: Seg = []
      for (let t = TRAIL; t >= 0; t--) {
        const idx = (((head - t) % N) + N) % N
        if (seg.length > 0) {
          const prev = seg[seg.length - 1]
          if (Math.abs(sampled[idx][0] - prev[0]) > 30) {
            segs.push(seg)
            seg = []
          }
        }
        seg.push(sampled[idx])
      }
      if (seg.length) segs.push(seg)

      segs.forEach((s) => {
        if (s.length < 2) return
        const len = s.length
        for (let i = 1; i < len; i++) {
          const a = i / len
          ctx.beginPath()
          ctx.strokeStyle = `rgba(0,255,120,${(a * 0.95).toFixed(2)})`
          ctx.lineWidth = 2 + a * 2
          ctx.lineCap = 'round'
          ctx.moveTo(s[i - 1][0], s[i - 1][1])
          ctx.lineTo(s[i][0], s[i][1])
          ctx.stroke()
        }
      })

      // Glowing head dot
      const [hx, hy] = sampled[head]
      const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14)
      grd.addColorStop(0, 'rgba(0,255,157,0.9)')
      grd.addColorStop(0.3, 'rgba(0,255,120,0.4)')
      grd.addColorStop(1, 'rgba(0,255,120,0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(hx, hy, 14, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(hx, hy, 3, 0, Math.PI * 2)
      ctx.fill()

      progress = (progress + SPEED) % N
      animRef.current = requestAnimationFrame(render)
    }

    //animRef.current = requestAnimationFrame(render)
    render()

    return () => {
      cancelAnimationFrame(animRef.current)
      animRef.current = 0
    }
  }, [prefersReducedMotion])

  return (
    // <div className='flex h-screen items-center justify-center bg-black overflow-hidden'>
    <div
      className='flex h-screen items-center justify-center bg-black overflow-hidden'
      role='status'
      aria-live='polite'
      aria-label='Loading application'
    >
      <div className='flex flex-col items-center gap-6'>
        <div
          style={{
            border: '1px solid rgba(0,255,120,0.2)',
            borderRadius: '6px',
            padding: '12px 16px',
            background: 'rgba(0,255,120,0.02)',
            boxShadow:
              '0 0 30px rgba(0,255,120,0.08), inset 0 0 20px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
        >
          {[
            {
              top: 0,
              left: 0,
              borderTop: '2px solid #00ff9d',
              borderLeft: '2px solid #00ff9d',
            },
            {
              top: 0,
              right: 0,
              borderTop: '2px solid #00ff9d',
              borderRight: '2px solid #00ff9d',
            },
            {
              bottom: 0,
              left: 0,
              borderBottom: '2px solid #00ff9d',
              borderLeft: '2px solid #00ff9d',
            },
            {
              bottom: 0,
              right: 0,
              borderBottom: '2px solid #00ff9d',
              borderRight: '2px solid #00ff9d',
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{ position: 'absolute', width: 10, height: 10, ...s }}
            />
          ))}

          {/* Fix 1: explicit width/height attributes on the canvas element */}
          <canvas
            aria-hidden='true'
            ref={canvasRef}
            width={340}
            height={120}
            style={{ display: 'block' }}
          />
        </div>

        <div className='flex items-center gap-3'>
          <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />

          <p className='animate-pulse font-mono text-xs tracking-[0.2em] text-emerald-400/60'>
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Loader
