import { useQuery } from '@tanstack/react-query'
import { positionItemService } from '../services/position.item.service'

export function usePositionItems(params: {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { page, limit, search, sortBy, sortOrder } = params

  return useQuery({
    queryKey: ['position-items', page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      positionItemService.getPositionItems({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      }),
  })
}
