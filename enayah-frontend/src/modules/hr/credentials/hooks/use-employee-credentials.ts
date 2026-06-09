'use client'

import { useQuery } from '@tanstack/react-query'

import { credentialService } from '../services/credential.service'

export function useEmployeeCredentials(employeeId: string, enabled = true) {
  return useQuery({
    queryKey: ['employee-credentials', employeeId],
    queryFn: () => credentialService.getEmployeeCredentials(employeeId),
    enabled: enabled && !!employeeId,
    staleTime: 1000 * 60 * 10, // 10 mins
  })
}
