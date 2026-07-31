// enayah-frntend/src/modules/hr/employees/use-my-employee-profile.ts

import { useQuery } from '@tanstack/react-query'

import { employeeService } from '../services/employee.service'

export function useMyEmployeeProfile() {
  return useQuery({
    queryKey: ['my-employee-profile'],
    queryFn: employeeService.getMyProfile,
    retry: false,
  })
}
