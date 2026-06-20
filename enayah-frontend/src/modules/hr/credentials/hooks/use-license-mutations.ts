import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  CreateLicensePayload,
  credentialLicenseService,
  UpdateLicensePayload,
} from '../services/credential-license.service'

export function useCreateLicense(employeeId: string) {
  const queryClient = useQueryClient()
  const t = useTranslations('credentials')
  return useMutation({
    mutationFn: (payload: Omit<CreateLicensePayload, 'employeeId'>) =>
      credentialLicenseService.create({
        employeeId,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
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
    mutationFn: (payload: UpdateLicensePayload) =>
      credentialLicenseService.update(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
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
    mutationFn: (id: string) => credentialLicenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-credentials', employeeId],
      })

      toast.success(t.rich('deleteSuccess', { name: 'License' }))
    },

    onError: () => {
      toast.error(t.rich('deleteError', { name: 'license' }))
    },
  })
}
