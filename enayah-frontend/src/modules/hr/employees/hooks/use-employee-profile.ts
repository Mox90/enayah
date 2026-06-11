import { useQuery } from '@tanstack/react-query'
import { employeeService } from '../services/employee.service'

export function useEmployeeProfile(id: string) {
  return useQuery({
    queryKey: ['employee-profile', id],
    queryFn: () => employeeService.getProfile(id!),
  })
}
