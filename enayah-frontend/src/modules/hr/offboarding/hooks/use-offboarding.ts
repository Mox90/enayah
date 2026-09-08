// enayah-frontend/src/modules/hr/offboarding/hooks/use-offboarding.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { offboardingService } from '../service/offboarding.service'
import type {
  CreateSeparationPayload,
  EmploymentSeparation,
  UpdateSeparationPayload,
} from '../types/offboarding.types'

export const offboardingKeys = {
  all: ['offboarding'] as const,

  employment: (employmentId: string) =>
    [...offboardingKeys.all, 'employment', employmentId] as const,

  detail: (separationId: string) =>
    [...offboardingKeys.all, 'detail', separationId] as const,
}

export function useEmploymentSeparations(
  employmentId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: employmentId
      ? offboardingKeys.employment(employmentId)
      : [...offboardingKeys.all, 'employment', 'none'],

    queryFn: () => offboardingService.getByEmploymentId(employmentId!),

    enabled: enabled && Boolean(employmentId),
  })
}

export function useCreateSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSeparationPayload) =>
      offboardingService.create(employmentId, payload),

    onSuccess: (result) => {
      queryClient.setQueryData(offboardingKeys.detail(result.id), result)

      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useUpdateSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      separationId,
      payload,
    }: {
      separationId: string
      payload: UpdateSeparationPayload
    }) => offboardingService.update(separationId, payload),

    onSuccess: (result: EmploymentSeparation) => {
      queryClient.setQueryData(offboardingKeys.detail(result.id), result)

      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useSubmitSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (separationId: string) =>
      offboardingService.submit(separationId),

    onSuccess: (result) => {
      queryClient.setQueryData(offboardingKeys.detail(result.id), result)

      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useApproveSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (separationId: string) =>
      offboardingService.approve(separationId),

    onSuccess: (result) => {
      queryClient.setQueryData(offboardingKeys.detail(result.id), result)

      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useCancelSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (separationId: string) =>
      offboardingService.cancel(separationId),

    onSuccess: (result) => {
      queryClient.setQueryData(offboardingKeys.detail(result.id), result)

      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useCompleteSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (separationId: string) =>
      offboardingService.complete(separationId),

    onSuccess: (result) => {
      if (result?.separation) {
        queryClient.setQueryData(
          offboardingKeys.detail(result.separation.id),
          result.separation,
        )
      }

      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })

      /*
       * Completion changes employment,
       * contract, movement, appointments
       * and PCN.
       */
      queryClient.invalidateQueries({
        queryKey: ['employees'],
      })

      queryClient.invalidateQueries({
        queryKey: ['contracts'],
      })

      queryClient.invalidateQueries({
        queryKey: ['position-items'],
      })

      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      })
    },
  })
}
