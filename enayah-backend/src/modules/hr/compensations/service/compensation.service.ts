import { db, DB, compensations } from '../../../../db'
import { eq, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { CompensationRepository } from '../repository/compensation.repository'

export const CompensationService = {
  create: async (dto: any) => {
    return db.transaction(async (tx) => {
      // 🔒 LOCK EMPLOYMENT
      await tx.execute(sql`
        SELECT id FROM employments
        WHERE id = ${dto.employmentId}
        FOR UPDATE
      `)

      // 🔍 VALIDATE DATE ORDER
      const current = await CompensationRepository.getCurrent(
        tx,
        dto.employmentId,
      )

      if (current) {
        if (new Date(dto.effectiveDate) <= new Date(current.effectiveDate)) {
          throw new AppError(
            'Effective date must be greater than current compensation',
            400,
          )
        }
      }

      return CompensationRepository.create(tx, dto)
    })
  },

  approve: async (id: string, approverId: string) => {
    return db.transaction(async (tx) => {
      const existing = await tx.query.compensations.findFirst({
        where: eq(compensations.id, id),
      })

      if (!existing) {
        throw new AppError('Compensation not found', 404)
      }

      if (existing.status !== 'draft') {
        throw new AppError('Only draft can be approved', 400)
      }

      const [updated] = await tx
        .update(compensations)
        .set({
          status: 'approved',
          approvedBy: approverId,
          approvedAt: new Date(),
        })
        .where(eq(compensations.id, id))
        .returning()

      return updated
    })
  },

  // Para lang ma trigger ang payroll, in the future
  apply: async (id: string) => {
    return db.transaction(async (tx) => {
      const comp = await tx.query.compensations.findFirst({
        where: eq(compensations.id, id),
      })

      if (!comp) throw new AppError('Not found', 404)

      if (comp.status !== 'approved') {
        throw new AppError('Must be approved first', 400)
      }

      const [updated] = await tx
        .update(compensations)
        .set({
          status: 'applied',
        })
        .where(eq(compensations.id, id))
        .returning()

      return updated
    })
  },
}
