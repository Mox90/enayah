// src/modules/hr/credentials/hooks/use-degree-mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  credentialDegreeService,
  CreateDegreePayload,
  UpdateDegreePayload,
} from '../services/credential-degree.service'

export function useCreateDegree(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<CreateDegreePayload, 'employeeId'>) =>
      credentialDegreeService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
    },
  })
}

export function useUpdateDegree(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateDegreePayload) =>
      credentialDegreeService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
    },
  })
}

export function useDeleteDegree(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => credentialDegreeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })
    },
  })
}
