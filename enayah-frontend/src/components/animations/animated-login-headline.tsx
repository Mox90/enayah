'use client'

import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'

interface AnimatedLoginHeadlineProps {
  headline1: string
  headline2: string
  isRtl?: boolean
}

const AnimatedLoginHeadline = ({
  headline1,
  headline2,
  isRtl = false,
}: AnimatedLoginHeadlineProps) => {
  const containerRef = useRef<HTMLHeadingElement>(null)
  const reducedMotionRef = useRef(false)

  /*
   * Intl.Segmenter is better than string.split('')
   * because it respects Unicode grapheme clusters.
   */
  const lines = useMemo(() => {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: 'grapheme',
    })

    const split = (text: string) =>
      Array.from(segmenter.segment(text), ({ segment }) => segment)

    return [split(headline1), split(headline2)]
  }, [headline1, headline2])

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches

      if (mediaQuery.matches) {
        const characters =
          container.querySelectorAll<HTMLElement>('[data-character]')

        gsap.killTweensOf(characters)

        gsap.set(characters, {
          scale: 1,
          y: 0,
        })
      }
    }

    handleMotionPreference()

    mediaQuery.addEventListener('change', handleMotionPreference)

    return () => {
      const characters =
        container.querySelectorAll<HTMLElement>('[data-character]')

      gsap.killTweensOf(characters)

      mediaQuery.removeEventListener('change', handleMotionPreference)
    }
  }, [])

  const handlePointerMove = (event: React.PointerEvent<HTMLHeadingElement>) => {
    const container = containerRef.current

    if (!container || reducedMotionRef.current) return

    const characters =
      container.querySelectorAll<HTMLElement>('[data-character]')

    const pointerX = event.clientX
    const pointerY = event.clientY

    /*
     * Distance at which the pointer stops influencing
     * surrounding characters.
     */
    const influenceRadius = 110

    characters.forEach((character) => {
      const rect = character.getBoundingClientRect()

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = pointerX - centerX
      const deltaY = pointerY - centerY

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      /*
       * 1 = pointer directly over the character
       * 0 = outside the influence radius
       */
      const rawInfluence = Math.max(0, 1 - distance / influenceRadius)

      /*
       * Smoothstep makes the falloff more fluid.
       */
      const influence = rawInfluence * rawInfluence * (3 - 2 * rawInfluence)

      const scale = 1 + influence * 0.35
      const y = -influence * 8

      gsap.to(character, {
        scale,
        y,
        duration: 0.25,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    })
  }

  const handlePointerLeave = () => {
    const container = containerRef.current

    if (!container || reducedMotionRef.current) return

    const characters =
      container.querySelectorAll<HTMLElement>('[data-character]')

    gsap.to(characters, {
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.45)',
      stagger: {
        each: 0.008,
        from: 'center',
      },
      overwrite: 'auto',
    })
  }

  return (
    <h2
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={`${headline1} ${headline2}`}
      className='cursor-default text-4xl font-bold leading-[1.15] tracking-tight text-white xl:text-5xl'
    >
      <span aria-hidden='true' className='block whitespace-pre'>
        {lines[0].map((character, index) => (
          <span
            key={`line-1-${index}`}
            data-character
            className='inline-block origin-bottom will-change-transform'
          >
            {character === ' ' ? '\u00A0' : character}
          </span>
        ))}
      </span>

      <span aria-hidden='true' className='block whitespace-pre'>
        {lines[1].map((character, index) => (
          <span
            key={`line-2-${index}`}
            data-character
            className='inline-block origin-bottom will-change-transform'
          >
            {character === ' ' ? '\u00A0' : character}
          </span>
        ))}
      </span>
    </h2>
  )
}

export default AnimatedLoginHeadline
