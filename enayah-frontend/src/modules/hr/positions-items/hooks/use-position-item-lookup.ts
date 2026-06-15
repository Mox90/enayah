import { useQuery } from '@tanstack/react-query'
import {
  positionItemLookupService,
  PositionItemLookupParams,
} from '../services/position-item-lookup.service'

export function usePositionItemLookup(params: PositionItemLookupParams = {}) {
  return useQuery({
    queryKey: ['position-item-lookup', params],
    queryFn: () => positionItemLookupService.lookup(params),
    staleTime: 60 * 1000,
  })
}
