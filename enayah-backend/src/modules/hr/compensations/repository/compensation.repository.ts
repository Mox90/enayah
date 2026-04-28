import { DB, compensations, compensationAllowances } from '../../../../db'
import { eq, desc } from 'drizzle-orm'
import { toCompensationDb, toAllowanceDb } from '../dto/compensation.mapper'
import { AppError } from '../../../../core/errors/AppError'
import { CreateCompensationDto } from '../dto/compensation.request'

export const CompensationRepository = {
  create: async (tx: DB, dto: CreateCompensationDto) => {
    const [comp] = await tx
      .insert(compensations)
      .values(toCompensationDb(dto))
      .returning()

    if (!comp) {
      throw new AppError('Failed to create compensation', 500)
    }

    if (dto.allowances?.length) {
      await tx
        .insert(compensationAllowances)
        .values(toAllowanceDb(comp.id, dto.allowances))
    }

    return comp
  },

  findById: async (tx: DB, id: string) => {
    return tx.query.compensations.findFirst({
      where: eq(compensations.id, id),
      with: {
        allowances: true,
      },
    })
  },

  getCurrent: async (tx: DB, employmentId: string) => {
    return tx.query.compensations.findFirst({
      where: eq(compensations.employmentId, employmentId),
      orderBy: (c, { desc }) => [desc(c.effectiveDate)],
    })
  },

  approve: async (tx: DB, id: string, userId: string) => {
    await tx
      .update(compensations)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      })
      .where(eq(compensations.id, id))
  },
}
