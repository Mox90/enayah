'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

export function FadeUp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
    )
  }, [])

  return <div ref={ref}>{children}</div>
}
