// use-employment-timeline.ts

import { useQuery } from '@tanstack/react-query'
import { employmentService } from '../service/employment.service'

export function useEmploymentTimeline(employeeId: string) {
  return useQuery({
    queryKey: ['employment-timeline', employeeId],
    queryFn: () => employmentService.getTimeline(employeeId),
    enabled: !!employeeId,
  })
}
