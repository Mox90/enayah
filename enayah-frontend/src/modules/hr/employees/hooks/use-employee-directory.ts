import { useQuery } from '@tanstack/react-query'
import { employeeService } from '../services/employee.service'
import { EmployeeDirectoryParams } from '../types/employee-directory.types'

export function useEmployeeDirectory(params: EmployeeDirectoryParams) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getDirectory(params),
  })
}
