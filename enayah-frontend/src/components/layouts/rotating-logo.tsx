// enayah-frontend/src/components/layouts/rotating-logo.tsx

'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface RotatingLogoProps {
  size?: number
  firstSrc?: string
  secondSrc?: string
  interval?: number
  duration?: number
}

const RotatingLogo = ({
  size = 48,
  firstSrc = '/MODHS3.png',
  secondSrc = '/MODHS.jpg',
  interval = 60_000,
  duration = 1.2,
}: RotatingLogoProps) => {
  const logo1Ref = useRef<HTMLDivElement>(null)
  const logo2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const logo1 = logo1Ref.current
    const logo2 = logo2Ref.current

    if (!logo1 || !logo2) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    //let intervalId: ReturnType<typeof window.setInterval> | null = null
    let intervalId: number | null = null
    let showingFirstLogo = true

    const stopAnimation = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }

      gsap.killTweensOf([logo1, logo2])
    }

    const showStaticLogo = () => {
      stopAnimation()

      gsap.set(logo1, { opacity: 1 })
      gsap.set(logo2, { opacity: 0 })
    }

    const startAnimation = () => {
      stopAnimation()

      showingFirstLogo = true

      gsap.set(logo1, { opacity: 1 })
      gsap.set(logo2, { opacity: 0 })

      intervalId = window.setInterval(() => {
        const timeline = gsap.timeline()

        if (showingFirstLogo) {
          timeline
            .to(logo1, {
              opacity: 0,
              duration,
              ease: 'power2.inOut',
            })
            .to(
              logo2,
              {
                opacity: 1,
                duration,
                ease: 'power2.inOut',
              },
              '<',
            )
        } else {
          timeline
            .to(logo2, {
              opacity: 0,
              duration,
              ease: 'power2.inOut',
            })
            .to(
              logo1,
              {
                opacity: 1,
                duration,
                ease: 'power2.inOut',
              },
              '<',
            )
        }

        showingFirstLogo = !showingFirstLogo
      }, interval)
    }

    const handleMotionPreferenceChange = () => {
      if (mediaQuery.matches) {
        showStaticLogo()
      } else {
        startAnimation()
      }
    }

    handleMotionPreferenceChange()

    mediaQuery.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      stopAnimation()
      mediaQuery.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [duration, interval])

  return (
    <div
      className='relative shrink-0'
      style={{
        width: size,
        height: size,
      }}
    >
      <div ref={logo1Ref} className='absolute inset-0'>
        <Image
          src={firstSrc}
          alt='MODHS Logo'
          fill
          sizes={`${size}px`}
          className='h-auto w-auto rounded-full object-contain'
          priority
        />
      </div>

      <div ref={logo2Ref} className='absolute inset-0 opacity-0'>
        <Image
          src={secondSrc}
          alt=''
          fill
          sizes={`${size}px`}
          className='h-auto w-auto rounded-full object-contain'
          aria-hidden='true'
        />
      </div>
    </div>
  )
}

export default RotatingLogo
