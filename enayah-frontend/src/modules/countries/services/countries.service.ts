// src/modules/hr/employees/components/onboarding/services/countries.service.ts

import { api } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'
//import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface CountryLookupParams {
  search?: string
  offset?: number
  limit?: number
}

export interface CountryLookupItem {
  id: string
  name: string
  nameAr: string | null
  nationalityEn: string
  nationalityAr: string | null
  alpha2: string
  alpha3: string
  numericCode: string
}

export interface CountryLookupResponse {
  items: CountryLookupItem[]
  total: number
  offset: number
  limit: number
}

export const countriesService = {
  getCountries: async (
    params: CountryLookupParams,
  ): Promise<CountryLookupResponse> => {
    const response = await api.get(API_ENDPOINTS.countries.get, {
      params,
    })

    return response.data
  },
}
