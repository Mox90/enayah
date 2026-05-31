import { useQuery } from '@tanstack/react-query'

import { employeeService } from '../services/employee.service'

export function useEmployees(params: {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { page, limit, search, sortBy, sortOrder } = params

  return useQuery({
    queryKey: ['employees', page, limit, search, sortBy, sortOrder],

    queryFn: () =>
      employeeService.getEmployees({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      }),
  })
}
