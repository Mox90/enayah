// src/modules/hr/iqama-renewal-process/iqama-renewal-process.service.ts

import { db, employeeIdentifications, employees, users } from '../../../../db'
import { and, eq } from 'drizzle-orm'

import {
  ChangeIqamaRenewalStatusInput,
  CreateIqamaRenewalCaseInput,
  IqamaRenewalCaseActor,
  IqamaRenewalProcessError,
  IqamaRenewalStatus,
  ListIqamaRenewalCasesQuery,
  UpdateIqamaRenewalCaseInput,
} from '../types/iqama-renewal-process.types'
// import { employeeIdentifications, employees, users } from '../../../../db/schema'
import {
  IqamaRenewalProcessRepository,
  UpdateCaseData,
} from '../repository/iqama-renewal-process.repository'

const allowedTransitions = {
  pending_upload: ['uploaded_to_mhrsd', 'cancelled'],

  uploaded_to_mhrsd: [
    'under_process',
    'approved_by_mhrsd',
    'denied_by_mhrsd',
    'cancelled',
  ],

  under_process: ['approved_by_mhrsd', 'denied_by_mhrsd', 'cancelled'],

  approved_by_mhrsd: ['sent_to_government_relations', 'cancelled'],

  denied_by_mhrsd: [
    'pending_upload',
    'uploaded_to_mhrsd',
    'eoc_required',
    'cancelled',
  ],

  sent_to_government_relations: ['completed', 'eoc_required', 'cancelled'],

  eoc_required: ['completed', 'cancelled'],

  completed: [],

  cancelled: [],
} satisfies Record<IqamaRenewalStatus, readonly IqamaRenewalStatus[]>

const assertCaseExists = <T>(value: T | null | undefined): T => {
  if (!value) {
    throw new IqamaRenewalProcessError(
      'Iqama renewal case was not found.',
      404,
      'IQAMA_RENEWAL_CASE_NOT_FOUND',
    )
  }

  return value
}

const assertVersionUpdateSucceeded = <T>(value: T | null | undefined): T => {
  if (!value) {
    throw new IqamaRenewalProcessError(
      'The record was changed by another user. Refresh the record and try again.',
      409,
      'IQAMA_RENEWAL_VERSION_CONFLICT',
    )
  }

  return value
}

const validateStatusTransition = (
  currentStatus: IqamaRenewalStatus,
  nextStatus: IqamaRenewalStatus,
) => {
  if (currentStatus === nextStatus) {
    throw new IqamaRenewalProcessError(
      `The case is already in status "${nextStatus}".`,
      409,
      'IQAMA_RENEWAL_STATUS_UNCHANGED',
    )
  }

  const allowed = allowedTransitions[
    currentStatus
  ] as readonly IqamaRenewalStatus[]

  if (!allowed.includes(nextStatus)) {
    throw new IqamaRenewalProcessError(
      `Status cannot be changed from "${currentStatus}" to "${nextStatus}".`,
      422,
      'INVALID_IQAMA_RENEWAL_STATUS_TRANSITION',
    )
  }
}

const buildStatusUpdate = (
  currentStatus: IqamaRenewalStatus,
  input: ChangeIqamaRenewalStatusInput,
  actor: IqamaRenewalCaseActor,
) => {
  const now = new Date()

  const update: {
    status: IqamaRenewalStatus
    updatedAt: Date
    updatedBy: string
    notes?: string | null
    denialReason?: string | null
    governmentRelationsDueDate?: string | null
    mhrsdUploadedAt?: Date | null
    mhrsdApprovedAt?: Date | null
    mhrsdDeniedAt?: Date | null
  } = {
    status: input.status,
    updatedAt: now,
    updatedBy: actor.userId,
  }

  if (input.notes !== undefined) {
    update.notes = input.notes
  }

  if (input.governmentRelationsDueDate !== undefined) {
    update.governmentRelationsDueDate = input.governmentRelationsDueDate
  }

  switch (input.status) {
    case 'pending_upload':
      /*
       * This usually means a denied case was returned for correction
       * and needs to be uploaded again.
       */
      update.denialReason = null
      update.mhrsdDeniedAt = null
      update.mhrsdApprovedAt = null
      update.governmentRelationsDueDate = null
      break

    case 'uploaded_to_mhrsd':
      update.mhrsdUploadedAt = now
      update.mhrsdApprovedAt = null
      update.mhrsdDeniedAt = null
      update.denialReason = null
      break

    case 'approved_by_mhrsd':
      update.mhrsdApprovedAt = now
      update.mhrsdDeniedAt = null
      update.denialReason = null
      break

    case 'denied_by_mhrsd':
      update.mhrsdDeniedAt = now
      update.mhrsdApprovedAt = null
      update.denialReason = input.denialReason?.trim() ?? null
      update.governmentRelationsDueDate = null
      break

    case 'sent_to_government_relations':
      update.governmentRelationsDueDate =
        input.governmentRelationsDueDate ?? null
      break

    case 'completed':
    case 'cancelled':
      break
  }

  return update
}

export const IqamaRenewalProcessService = {
  create: async (
    input: CreateIqamaRenewalCaseInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const [employee] = await tx
        .select({
          id: employees.id,
        })
        .from(employees)
        .where(
          and(
            eq(employees.id, input.employeeId),
            eq(employees.isDeleted, false),
          ),
        )
        .limit(1)

      if (!employee) {
        throw new IqamaRenewalProcessError(
          'Employee was not found.',
          404,
          'EMPLOYEE_NOT_FOUND',
        )
      }

      const [identification] = await tx
        .select({
          id: employeeIdentifications.id,
          employeeId: employeeIdentifications.employeeId,
          type: employeeIdentifications.type,
          isCurrent: employeeIdentifications.isCurrent,
        })
        .from(employeeIdentifications)
        .where(
          and(
            eq(employeeIdentifications.id, input.identificationId),
            eq(employeeIdentifications.isDeleted, false),
          ),
        )
        .limit(1)

      if (!identification) {
        throw new IqamaRenewalProcessError(
          'Employee identification was not found.',
          404,
          'EMPLOYEE_IDENTIFICATION_NOT_FOUND',
        )
      }

      if (identification.employeeId !== input.employeeId) {
        throw new IqamaRenewalProcessError(
          'The selected identification does not belong to the employee.',
          422,
          'IDENTIFICATION_EMPLOYEE_MISMATCH',
        )
      }

      if (identification.type !== 'iqama') {
        throw new IqamaRenewalProcessError(
          'Only an Iqama identification can be used for an Iqama renewal case.',
          422,
          'IDENTIFICATION_IS_NOT_IQAMA',
        )
      }

      if (input.assignedToUserId) {
        const [assignee] = await tx
          .select({
            id: users.id,
          })
          .from(users)
          .where(eq(users.id, input.assignedToUserId))
          .limit(1)

        if (!assignee) {
          throw new IqamaRenewalProcessError(
            'The assigned user was not found.',
            404,
            'ASSIGNED_USER_NOT_FOUND',
          )
        }
      }

      const existing =
        await IqamaRenewalProcessRepository.findOpenByIdentificationId(
          tx,
          input.identificationId,
        )

      if (existing) {
        throw new IqamaRenewalProcessError(
          'An active renewal case already exists for this Iqama identification.',
          409,
          'ACTIVE_IQAMA_RENEWAL_CASE_EXISTS',
        )
      }

      return IqamaRenewalProcessRepository.create(tx, {
        employeeId: input.employeeId,
        identificationId: input.identificationId,
        assignedToUserId: input.assignedToUserId ?? null,
        governmentRelationsDueDate: input.governmentRelationsDueDate ?? null,
        notes: input.notes ?? null,
        createdBy: actor.userId,
        updatedBy: actor.userId,
      })
    })
  },

  list: async (query: ListIqamaRenewalCasesQuery) => {
    return IqamaRenewalProcessRepository.list(db, query)
  },

  getById: async (id: string) => {
    const record = await IqamaRenewalProcessRepository.findById(db, id)

    return assertCaseExists(record)
  },

  update: async (
    id: string,
    input: UpdateIqamaRenewalCaseInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const current = await IqamaRenewalProcessRepository.findById(tx, id)

      assertCaseExists(current)

      if (input.assignedToUserId) {
        const [assignee] = await tx
          .select({
            id: users.id,
          })
          .from(users)
          .where(eq(users.id, input.assignedToUserId))
          .limit(1)

        if (!assignee) {
          throw new IqamaRenewalProcessError(
            'The assigned user was not found.',
            404,
            'ASSIGNED_USER_NOT_FOUND',
          )
        }
      }

      const updateData: UpdateCaseData = {
        updatedAt: new Date(),
        updatedBy: actor.userId,
      }

      if (input.assignedToUserId !== undefined) {
        updateData.assignedToUserId = input.assignedToUserId
      }

      if (input.governmentRelationsDueDate !== undefined) {
        updateData.governmentRelationsDueDate = input.governmentRelationsDueDate
      }

      if (input.notes !== undefined) {
        updateData.notes = input.notes
      }

      const updated = await IqamaRenewalProcessRepository.updateWithVersion(
        tx,
        id,
        input.version,
        updateData,
      )

      return assertVersionUpdateSucceeded(updated)
    })
  },

  changeStatus: async (
    id: string,
    input: ChangeIqamaRenewalStatusInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const current = await IqamaRenewalProcessRepository.findById(tx, id)

      const record = assertCaseExists(current)

      validateStatusTransition(record.status, input.status)

      const statusUpdate = buildStatusUpdate(record.status, input, actor)

      const updated = await IqamaRenewalProcessRepository.updateWithVersion(
        tx,
        id,
        input.version,
        statusUpdate,
      )

      return assertVersionUpdateSucceeded(updated)
    })
  },

  remove: async (id: string, version: number, actor: IqamaRenewalCaseActor) => {
    return db.transaction(async (tx) => {
      const current = await IqamaRenewalProcessRepository.findById(tx, id)

      assertCaseExists(current)

      const deleted = await IqamaRenewalProcessRepository.softDeleteWithVersion(
        tx,
        id,
        version,
        actor.userId,
      )

      return assertVersionUpdateSucceeded(deleted)
    })
  },
}
