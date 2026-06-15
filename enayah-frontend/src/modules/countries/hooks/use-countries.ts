import { useQuery } from '@tanstack/react-query'
import {
  countriesService,
  CountryLookupParams,
} from '../services/countries.service'
// import {
//   countriesService,
//   CountryLookupParams,
// } from '../services/countries.service'

export function useCountries(params: CountryLookupParams = {}) {
  return useQuery({
    queryKey: ['countries', params],
    queryFn: () => countriesService.getCountries(params),
    staleTime: 5 * 60 * 1000,
  })
}
