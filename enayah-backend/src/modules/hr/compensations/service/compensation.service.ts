import { db, DB, compensations, contracts } from '../../../../db'
import { and, eq, sql } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { CompensationRepository } from '../repository/compensation.repository'
import { CreateCompensationDto } from '../dto/compensation.request'

export const CompensationService = {
  create: async (dto: CreateCompensationDto) => {
    return db.transaction(async (tx) => {
      // 🔒 LOCK EMPLOYMENT
      await tx.execute(sql`
        SELECT id FROM employments
        WHERE id = ${dto.employmentId}
        FOR UPDATE
      `)

      // Prevent sa pag duplicate with same effective date
      const duplicate = await tx.query.compensations.findFirst({
        where: and(
          eq(compensations.employmentId, dto.employmentId),
          eq(compensations.effectiveDate, dto.effectiveDate),
        ),
      })

      if (duplicate) {
        throw new AppError(
          'Compensation already exists for this effective date',

          400,
        )
      }

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

      const allContracts = await tx.query.contracts.findMany({
        where: eq(contracts.employmentId, dto.employmentId),
      })

      const contract = allContracts.find((c) => {
        const start = new Date(c.startDate)
        const end = new Date(c.endDate)
        const eff = new Date(dto.effectiveDate)
        return eff >= start && eff <= end
      })

      if (!contract) {
        throw new AppError(
          'Compensation must fall within a valid contract period',
          400,
        )
      }

      return CompensationRepository.create(tx, dto)
    })
  },

  approve: async (id: string, approverId: string) => {
    return db.transaction(async (tx) => {
      /*const existing = await tx.query.compensations.findFirst({
        where: eq(compensations.id, id),
      })

      if (!existing) {
        throw new AppError('Compensation not found', 404)
      }

      if (existing.status !== 'draft') {
        throw new AppError('Only draft can be approved', 400)
      }*/

      const updated = await tx
        .update(compensations)
        .set({
          status: 'approved',
          approvedBy: approverId,
          approvedAt: new Date(),
        })
        .where(and(eq(compensations.id, id), eq(compensations.status, 'draft')))
        .returning()

      if (!updated.length) {
        // differentiate error (optional but better UX)
        const exists = await tx.query.compensations.findFirst({
          where: eq(compensations.id, id),
        })

        if (!exists) {
          throw new AppError('Compensation not found', 404)
        }

        throw new AppError('Only draft can be approved', 400)
      }

      return updated[0]
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
