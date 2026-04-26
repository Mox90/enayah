import { DB, db } from '../../../../db'
import { jobAssignments } from '../../../../db/schema/jobAssignments'
import { and, eq, isNull } from 'drizzle-orm'
import { AppError } from '../../../../core/errors/AppError'
import {
  CreateJobAssignmentDto,
  UpdateJobAssignmentDto,
} from '../dto/jobAssignment.request'
import {
  toJobAssignmentDb,
  toJobAssignmentUpdateDb,
} from '../dto/jobAssignment.mapper'

type CreateJobAssignmentInternal = CreateJobAssignmentDto & {
  employmentId: string
}

const isActive = isNull(jobAssignments.deletedAt)

function assertExists<T>(value: T | undefined, message: string): T {
  if (!value) throw new AppError(message, 404)
  return value
}

export const JobAssignmentRepository = {
  create: async (tx: DB, dto: CreateJobAssignmentInternal) => {
    return db.transaction(async (tx) => {
      // 🔥 ensure only one primary
      if (dto.isPrimary ?? true) {
        await tx
          .update(jobAssignments)
          .set({ isPrimary: false })
          .where(
            and(
              eq(jobAssignments.employmentId, dto.employmentId),
              eq(jobAssignments.isPrimary, true),
            ),
          )
      }

      const [row] = await tx
        .insert(jobAssignments)
        .values(toJobAssignmentDb(dto))
        .returning({ id: jobAssignments.id })

      return assertExists(row, 'Failed to create job assignment')
    })
  },

  findActivePrimary: async (employmentId: string) => {
    return db.query.jobAssignments.findFirst({
      where: and(
        eq(jobAssignments.employmentId, employmentId),
        eq(jobAssignments.isPrimary, true),
        isActive,
      ),
      with: {
        department: true,
        position: true,
      },
    })
  },

  findById: async (id: string) => {
    const row = await db.query.jobAssignments.findFirst({
      where: and(eq(jobAssignments.id, id), isActive),
      with: {
        department: true,
        position: true,
      },
    })

    return assertExists(row, 'Job assignment not found')
  },

  update: async (id: string, dto: UpdateJobAssignmentDto) => {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(jobAssignments)
        .set(toJobAssignmentUpdateDb(dto))
        .where(eq(jobAssignments.id, id))
        .returning({ id: jobAssignments.id })

      const row = assertExists(updated, 'Update failed')

      return row
    })
  },

  endAssignment: async (id: string, endDate: Date) => {
    return db
      .update(jobAssignments)
      .set({ endDate })
      .where(eq(jobAssignments.id, id))
  },
}
