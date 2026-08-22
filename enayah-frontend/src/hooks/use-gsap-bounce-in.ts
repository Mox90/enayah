// enayah-frontend/src/hooks/use-gsap-bounce-in.ts

'use client'

import { useCallback, useRef } from 'react'
import { gsap } from 'gsap'

interface UseGsapBounceInOptions {
  enabled?: boolean
  initialScale?: number
  overshootScale?: number
  settleScale?: number
}

export function useGsapBounceIn<T extends HTMLElement = HTMLDivElement>({
  enabled = true,
  initialScale = 0.82,
  overshootScale = 1.08,
  settleScale = 0.97,
}: UseGsapBounceInOptions = {}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const ref = useCallback(
    (element: T | null) => {
      timelineRef.current?.kill()
      timelineRef.current = null

      if (!element || !enabled) {
        return
      }

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (prefersReducedMotion) {
        return
      }

      requestAnimationFrame(() => {
        /*
         * Save the element's existing transform.
         * Radix/Tailwind uses it for centering.
         */
        const computedStyle = window.getComputedStyle(element)

        const existingTransform = computedStyle.transform

        /*
         * Use transformOrigin at the center so the
         * bounce grows evenly in every direction.
         */
        gsap.set(element, {
          transformOrigin: '50% 50%',
          willChange: 'transform, opacity',
        })

        timelineRef.current = gsap
          .timeline({
            defaults: {
              overwrite: 'auto',
            },
          })
          .fromTo(
            element,
            {
              opacity: 0,
              scale: initialScale,
            },
            {
              opacity: 1,
              scale: overshootScale,
              duration: 0.2,
              ease: 'power3.out',
            },
          )
          .to(element, {
            scale: settleScale,
            duration: 0.11,
            ease: 'power2.inOut',
          })
          .to(element, {
            scale: 1,
            duration: 0.17,
            ease: 'power2.out',

            onComplete: () => {
              gsap.set(element, {
                clearProps: 'opacity,scale,transformOrigin,willChange',
              })
            },
          })
      })
    },
    [enabled, initialScale, overshootScale, settleScale],
  )

  return ref
}
