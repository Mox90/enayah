import { useQuery } from '@tanstack/react-query'
import { positionService } from '../services/position.service'

export function usePositions(params: {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { page, limit, search, sortBy, sortOrder } = params

  return useQuery({
    queryKey: ['positions', page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      positionService.getPositions({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      }),
  })
}
