// src/modules/hr/appointments/repository/appointment.repository.ts

import { and, eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { appointments, DB } from '../../../../db'

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

const isActive = eq(appointments.isDeleted, false)

export const AppointmentRepository = {
  create: async (tx: DB, data: typeof appointments.$inferInsert) => {
    const [createdRaw] = await tx
      .insert(appointments)
      .values(data)
      .returning({ id: appointments.id })

    const created = assertExists(createdRaw, 'Failed to create appointment')

    return AppointmentRepository.findById(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    const result = await tx.query.appointments.findFirst({
      where: and(eq(appointments.id, id), isActive),
    })

    if (!result) {
      throw new AppError('Appointment not found', 404)
    }

    return result
  },

  findByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx.query.appointments.findMany({
      where: and(eq(appointments.employmentId, employmentId), isActive),
      orderBy: (a, { desc }) => [desc(a.startDate)],
    })
  },

  update: async (
    tx: DB,
    id: string,
    data: Partial<typeof appointments.$inferInsert>,
  ) => {
    const [updatedRaw] = await tx
      .update(appointments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), isActive))
      .returning({ id: appointments.id })

    const updated = assertExists(updatedRaw, 'Update failed')

    return AppointmentRepository.findById(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await AppointmentRepository.findById(tx, id)

    await tx
      .update(appointments)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        ...(userId && { deletedBy: userId }),
      })
      .where(and(eq(appointments.id, id), isActive))

    return existing
  },
}
