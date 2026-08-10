// enayah-frontend/src/modules/hr/credentials/hooks/use-license-mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  credentialLicenseService,
  type CreateLicensePayload,
  type UpdateLicensePayload,
} from '../services/credential-license.service'

type CreateLicenseMutationPayload = Omit<CreateLicensePayload, 'employeeId'>

type UpdateLicenseMutationPayload = Omit<UpdateLicensePayload, 'employeeId'>

export function useCreateLicense(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: CreateLicenseMutationPayload) =>
      credentialLicenseService.create({
        employeeId,
        ...payload,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('createSuccess', { name: 'License' }))
    },

    onError: () => {
      toast.error(t.rich('createError', { name: 'license' }))
    },
  })
}

export function useUpdateLicense(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (payload: UpdateLicenseMutationPayload) =>
      credentialLicenseService.update({ employeeId, ...payload }),

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(
        t.rich('updateSuccess', { name: `License ${variables.licenseNumber}` }),
      )
    },

    onError: (error, variables) => {
      toast.error(
        t.rich('updateError', { name: `license ${variables.licenseNumber}` }),
      )
    },
  })
}

export function useDeleteLicense(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')

  return useMutation({
    mutationFn: (id: string) =>
      credentialLicenseService.delete({ employeeId, id }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'License' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'license' }))
    },
  })
}
