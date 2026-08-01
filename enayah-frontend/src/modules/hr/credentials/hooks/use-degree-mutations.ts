// enayah-frontend/src/modules/hr/credentials/hooks/use-degree-mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import {
  credentialDegreeService,
  type CreateDegreePayload,
  type UpdateDegreePayload,
} from '../services/credential-degree.service'

type CreateDegreeMutationPayload = Omit<CreateDegreePayload, 'employeeId'>

type UpdateDegreeMutationPayload = Omit<UpdateDegreePayload, 'employeeId'>

export function useCreateDegree(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: CreateDegreeMutationPayload) =>
      credentialDegreeService.create({
        employeeId,
        ...payload,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('createSuccess', {
          name: 'Degree',
        }),
      )
    },

    onError: () => {
      toast.error(
        t.rich('createError', {
          name: 'degree',
        }),
      )
    },
  })
}

export function useUpdateDegree(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateDegreeMutationPayload) =>
      credentialDegreeService.update({
        employeeId,
        ...payload,
      }),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('updateSuccess', {
          name: `Degree ${variables.degreeName}`,
        }),
      )
    },

    onError: (_error, variables) => {
      toast.error(
        t.rich('updateError', {
          name: `degree ${variables.degreeName}`,
        }),
      )
    },
  })
}

export function useDeleteDegree(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (id: string) =>
      credentialDegreeService.delete({
        employeeId,
        id,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('deleteSuccess', {
          name: 'Degree',
        }),
      )
    },

    onError: () => {
      toast.error(
        t.rich('deleteError', {
          name: 'degree',
        }),
      )
    },
  })
}
