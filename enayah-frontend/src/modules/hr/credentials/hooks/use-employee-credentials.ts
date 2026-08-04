'use client'

import { useQuery } from '@tanstack/react-query'

import { credentialService } from '../services/credential.service'

export const employeeCredentialsQueryKeys = {
  all: ['employee-credentials'] as const,

  byEmployee: (employeeId: string) =>
    [...employeeCredentialsQueryKeys.all, employeeId] as const,
}

export function useEmployeeCredentials(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: employeeCredentialsQueryKeys.byEmployee(employeeId),
    queryFn: () => credentialService.getEmployeeCredentials(employeeId),
    enabled: enabled && !!employeeId,
    staleTime: 1000 * 60 * 10, // 10 mins
  })
}
