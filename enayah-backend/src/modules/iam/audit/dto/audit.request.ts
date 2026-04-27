import z from 'zod'

export const auditLogsQuerySchema = z.object({
  resource: z.string().max(100).optional(),
  action: z.string().max(100).optional(),
  userId: z.string().optional(),
  from: z
    .string()
    .datetime()
    .transform((s) => new Date(s))
    .optional(),
  to: z
    .string()
    .datetime()
    .transform((s) => new Date(s))
    .optional(),
  limit: z.coerce.number().int().positive().optional(),
})

export const auditIdSchema = z.object({
  id: z.uuid(),
})
