// enayah-frontend/src/modules/hr/employees/hooks/use-upload-employee-avatar.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { employeeService } from '../services/employee.service'
import { EmployeeProfile } from '../types/employee-profile.types'
import { employeeQueryKeys } from './employee-query-keys'
//import { employeeQueryKeys } from './use-employee-profile'

export function useUploadEmployeeAvatar(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => employeeService.uploadAvatar(employeeId, file),

    onSuccess: async (uploadedAvatar) => {
      queryClient.setQueryData<EmployeeProfile>(
        employeeQueryKeys.profile(employeeId),
        (currentProfile) => {
          if (!currentProfile) {
            return currentProfile
          }

          return {
            ...currentProfile,

            personal: {
              ...currentProfile.personal,
              avatarFileId: uploadedAvatar.avatarFileId,
              avatar: uploadedAvatar.avatarUrl,
            },
          }
        },
      )

      await queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.profile(employeeId),
      })

      await queryClient.invalidateQueries({
        queryKey: ['my-employee-profile'],
      })

      toast.success('Employee photo uploaded successfully.')
    },
  })
}
