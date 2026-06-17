// src/modules/master/countries/service/country.service.ts

//import { db } from '../../../../db'
import { db } from '../../../db'
import { CountryLookupQueryDto } from '../dto/country.request'
import { CountryRepository } from '../repository/country.repository'

export const CountryService = {
  lookup: async (params: CountryLookupQueryDto) => {
    return CountryRepository.lookup(db, params)
  },
}
