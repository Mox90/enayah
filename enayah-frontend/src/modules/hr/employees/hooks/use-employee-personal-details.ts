import { useQuery } from '@tanstack/react-query'
import { employeeService } from '../services/employee.service'

export function useEmployeePersonal(id?: string) {
  return useQuery({
    queryKey: ['employee-personal', id],
    queryFn: () => employeeService.getPersonal(id!),
    enabled: !!id,
  })
}
