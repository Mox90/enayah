// use-employment-timeline.ts

import { useQuery } from '@tanstack/react-query'
import { employmentService } from '../service/employment.service'
import { EmploymentTimelineResponse } from '../types/employment-timeline'

export function useEmploymentTimeline(employeeId: string) {
  return useQuery<EmploymentTimelineResponse>({
    queryKey: ['employment-timeline', employeeId],
    queryFn: () => employmentService.getTimeline(employeeId),
    enabled: !!employeeId,
  })
}
