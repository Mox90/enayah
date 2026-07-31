// enayah-frntend/src/modules/hr/employees/use-my-employee-profile.ts

import { useQuery } from '@tanstack/react-query'

import { employeeService } from '../services/employee.service'
//import { useAuthStore } from '@/modules/iam/stores/auth.store'

export const myEmployeeProfileQueryKeys = {
  all: ['my-employee-profile'] as const,

  byUser: (userId: string) =>
    [...myEmployeeProfileQueryKeys.all, userId] as const,
}

export function useMyEmployeeProfile(userId?: string) {
  //const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: myEmployeeProfileQueryKeys.byUser(userId ?? ''),
    queryFn: employeeService.getMyProfile,
    enabled: Boolean(userId),
    retry: false,
  })
}
