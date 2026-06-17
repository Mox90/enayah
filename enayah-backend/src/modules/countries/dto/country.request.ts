import { z } from 'zod'

export const CountryLookupQuerySchema = z.object({
  search: z.string().trim().optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CountryLookupQueryDto = z.infer<typeof CountryLookupQuerySchema>
