// enayah-frontend/src/modules/hr/offboarding/hooks/use-offboarding.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

//import { offboardingService } from '../services/offboarding.service'
import type {
  CreateSeparationPayload,
  EmploymentSeparation,
  UpdateSeparationPayload,
} from '../types/offboarding.types'
import { offboardingService } from '../service/offboarding.service'

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

    onSuccess: () => {
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
      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })

      queryClient.setQueryData(offboardingKeys.detail(result.id), result)
    },
  })
}

export function useSubmitSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: offboardingService.submit,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useApproveSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: offboardingService.approve,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}

export function useCancelSeparation(employmentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: offboardingService.cancel,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: offboardingKeys.employment(employmentId),
      })
    },
  })
}
