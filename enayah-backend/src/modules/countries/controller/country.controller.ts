// src/modules/master/countries/controller/country.controller.ts

import { Request, Response } from 'express'
//import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { CountryLookupQuerySchema } from '../dto/country.request'
import { CountryService } from '../service/country.service'
import { asyncHandler } from '../../../core/utils/asyncHandler'

export const CountryController = {
  lookup: asyncHandler(async (req: Request, res: Response) => {
    const query = CountryLookupQuerySchema.parse(req.query)

    const result = await CountryService.lookup(query)

    res.status(200).json(result)
  }),
}
