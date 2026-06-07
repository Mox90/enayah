import { useQuery } from '@tanstack/react-query'
import { departmentService } from '../services/department.service'

export function useDepartmentLookup() {
  return useQuery({
    queryKey: ['department-lookup'],
    queryFn: () => departmentService.findLookup(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
