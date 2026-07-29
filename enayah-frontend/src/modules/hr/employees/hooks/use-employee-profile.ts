// enayah-frontend/src/modules/hr/contracts/hooks/use-employee-profile.ts

import { useQuery } from '@tanstack/react-query'

import { employeeService } from '../services/employee.service'
import { EmployeeProfileSummary } from '../types/employee-personal.dto'

export const employeeQueryKeys = {
  all: ['employees'] as const,

  profile: (id: string) => [...employeeQueryKeys.all, 'profile', id] as const,

  profileSummary: (id: string) =>
    [...employeeQueryKeys.all, 'profile-summary', id] as const,
}

export function useEmployeeProfile(id?: string) {
  return useQuery({
    queryKey: employeeQueryKeys.profile(id ?? ''),
    queryFn: () => employeeService.getProfile(id!),
    enabled: Boolean(id),
  })
}

export function useCredentialSummary(id?: string) {
  return useQuery<EmployeeProfileSummary>({
    //queryKey: ['employees', 'profile-summary', id],
    queryKey: employeeQueryKeys.profile(id ?? ''),
    queryFn: () => employeeService.getCredentialSummary(id!),
    enabled: Boolean(id),
  })
}
