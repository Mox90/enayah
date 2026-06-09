import { useQuery } from '@tanstack/react-query'

import { departmentService } from '../services/department.service'

export function useDepartments(params: {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { page, limit, search, sortBy, sortOrder } = params
  return useQuery({
    queryKey: ['departments', page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      departmentService.getDepartments({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      }),
  })
}
