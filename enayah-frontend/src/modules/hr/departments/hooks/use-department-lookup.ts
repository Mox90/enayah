import { useQuery } from '@tanstack/react-query'
import { departmentService } from '../services/department.service'

export function useDepartmentLookup() {
  return useQuery({
    queryKey: ['department-lookup'],
    queryFn: () => departmentService.findLookup(),
  })
}
