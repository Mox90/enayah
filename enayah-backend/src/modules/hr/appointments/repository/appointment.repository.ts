// enayah-backend/src/modules/hr/appointments/repository/appointment.repository.ts

import { and, eq } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import { appointments, DB } from '../../../../db'
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from '../dto/appointment.request'
import {
  toAppointmentDb,
  toAppointmentUpdateDb,
} from '../dto/appointment.mapper'

function assertExists<T>(
  value: T | undefined,
  message: string,
  statusCode = 500,
): T {
  if (!value) throw new AppError(message, statusCode)
  return value
}

const isActive = eq(appointments.isDeleted, false)

async function findByIdOrThrow(tx: DB, id: string) {
  const result = await tx.query.appointments.findFirst({
    where: and(eq(appointments.id, id), isActive),
    with: {
      department: true,
      position: true,
      manager: true,
    },
  })

  if (!result) {
    throw new AppError('Appointment not found', 404)
  }

  return result
}

export const AppointmentRepository = {
  create: async (tx: DB, dto: CreateAppointmentDto) => {
    const [createdRaw] = await tx
      .insert(appointments)
      .values(toAppointmentDb(dto))
      .returning({ id: appointments.id })
    const created = assertExists(createdRaw, 'Failed to create appointment')

    return findByIdOrThrow(tx, created.id)
  },

  findById: async (tx: DB, id: string) => {
    return findByIdOrThrow(tx, id)
  },

  findByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx.query.appointments.findMany({
      where: and(eq(appointments.employmentId, employmentId), isActive),
      with: {
        department: true,
        position: true,
        manager: true,
      },

      orderBy: (a, { desc }) => [desc(a.startDate)],
    })
  },

  findCurrentByEmploymentId: async (tx: DB, employmentId: string) => {
    return tx.query.appointments.findFirst({
      where: and(
        eq(appointments.employmentId, employmentId),
        eq(appointments.endDate, null as any),
        isActive,
      ),
      with: {
        department: true,
        position: true,
        manager: true,
      },
      orderBy: (a, { desc }) => [desc(a.startDate)],
    })
  },

  update: async (tx: DB, id: string, dto: UpdateAppointmentDto) => {
    const [updatedRaw] = await tx
      .update(appointments)
      .set({
        ...toAppointmentUpdateDb(dto),
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), isActive))
      .returning({ id: appointments.id })
    const updated = assertExists(updatedRaw, 'Update failed')

    return findByIdOrThrow(tx, updated.id)
  },

  endAppointment: async (
    tx: DB,
    id: string,
    endDate: string,
    remarks?: string | null,
  ) => {
    const [updatedRaw] = await tx
      .update(appointments)
      .set({
        endDate,
        ...(remarks !== undefined && { remarks }),
        updatedAt: new Date(),
      })
      .where(and(eq(appointments.id, id), isActive))
      .returning({ id: appointments.id })

    const updated = assertExists(updatedRaw, 'End appointment failed')

    return findByIdOrThrow(tx, updated.id)
  },

  softDelete: async (tx: DB, id: string, userId?: string) => {
    const existing = await findByIdOrThrow(tx, id)

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
