'use client'

import { useQuery } from '@tanstack/react-query'
import { employeeService } from '../services/employee.service'

//import { EmployeeService } from '../services/employee.service'

export function useEmployee(id?: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: !!id,
  })
}
