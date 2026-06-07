import { useQuery } from '@tanstack/react-query'
import { employeeService } from '../services/employee.service'

export function useEmployeeDirectory(params: any) {
  return useQuery({
    queryKey: ['employee-directory', params],
    queryFn: () => employeeService.getEmployeeDirectory(params),
  })
}
