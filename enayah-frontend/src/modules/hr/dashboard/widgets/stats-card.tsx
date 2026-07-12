// enayah-frontend/src/modules/hr/dashboard/widgets/stats-card.tsx

'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

type StatsCardItem = {
  label: string
  value: string | number
}

interface StatsCardProps {
  title: string
  value?: string | number
  subtitle?: string
  items?: StatsCardItem[]
}

const formatNumber = (value: number) => {
  return Math.round(value).toLocaleString()
}

const AnimatedCounter = ({
  value,
  className,
}: {
  value: string | number
  className?: string
}) => {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const target = Number(String(value).replace(/,/g, ''))

    if (Number.isNaN(target)) {
      ref.current.textContent = String(value)
      return
    }

    const counter = {
      value: 0,
    }

    const ctx = gsap.context(() => {
      // initial state
      gsap.set(ref.current, {
        opacity: 0,
        y: 20,
        scale: 0.95,
      })

      // number animation
      gsap.to(counter, {
        value: target,
        duration: 3,
        ease: 'power4.out',

        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = formatNumber(counter.value)
          }
        },
      })

      // visual animation
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'expo.out',
      })
    })

    return () => ctx.revert()
  }, [value])

  return (
    <h2 ref={ref} className={className}>
      0
    </h2>
  )
}

const StatsCard = ({ title, value, subtitle, items }: StatsCardProps) => {
  return (
    <div className='rounded-2xl border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
      <div className='space-y-4'>
        <p className='text-sm font-medium text-muted-foreground'>{title}</p>

        {items?.length ? (
          <div className='grid grid-cols-2 gap-4'>
            {items.map((item) => (
              <div key={item.label} className='space-y-1'>
                <p className='text-xs text-muted-foreground'>{item.label}</p>

                <AnimatedCounter
                  value={item.value}
                  className='text-2xl font-bold'
                />
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-2'>
            {value !== undefined && (
              <AnimatedCounter value={value} className='text-3xl font-bold' />
            )}

            {subtitle && (
              <p className='text-xs text-muted-foreground'>{subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard
