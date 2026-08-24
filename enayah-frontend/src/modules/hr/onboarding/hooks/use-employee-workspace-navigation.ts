// enayah-frontend/src/modules/hr/employees/hooks/use-employee-workspace-navigation.ts

'use client'

import { useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

import { usePathname, useRouter } from '../../../../../i18n/navigation'

//import type { EmployeeView } from '../types/employee-view.types'

import {
  isOnboardingStep,
  type OnboardingStep,
} from '../../onboarding/constants/onboarding-steps'
import { EmployeeView } from '../../employees/types/employee-view.types'

type EmployeeWorkspaceMode = 'directory' | 'onboarding'

export function useEmployeeWorkspaceNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const mode: EmployeeWorkspaceMode =
    searchParams.get('mode') === 'onboarding' ? 'onboarding' : 'directory'

  const viewParam = searchParams.get('view')

  const view: EmployeeView =
    viewParam === 'kanban' || viewParam === 'tree' ? viewParam : 'list'

  const stepParam = searchParams.get('step')

  const step: OnboardingStep = isOnboardingStep(stepParam)
    ? stepParam
    : 'personal'

  const updateQuery = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key)
          return
        }

        params.set(key, value)
      })

      const query = Object.fromEntries(params.entries())

      router.replace(
        {
          pathname,
          query,
        },
        {
          scroll: false,
        },
      )
    },
    [pathname, router, searchParams],
  )

  const openOnboarding = useCallback(() => {
    updateQuery({
      mode: 'onboarding',
      step: 'personal',
    })
  }, [updateQuery])

  const closeOnboarding = useCallback(() => {
    updateQuery({
      mode: null,
      step: null,
    })
  }, [updateQuery])

  const setStep = useCallback(
    (step: OnboardingStep) => {
      updateQuery({
        mode: 'onboarding',
        step,
      })
    },
    [updateQuery],
  )

  const setView = useCallback(
    (view: EmployeeView) => {
      updateQuery({
        view: view === 'list' ? null : view,
      })
    },
    [updateQuery],
  )

  return {
    mode,
    view,
    step,

    setView,
    setStep,

    openOnboarding,
    closeOnboarding,
  }
}
