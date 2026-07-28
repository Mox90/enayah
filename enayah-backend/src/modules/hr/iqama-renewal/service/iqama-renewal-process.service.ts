// src/modules/hr/iqama-renewal-process/service/iqama-renewal-process.service.ts

import { and, asc, eq, or, sql } from 'drizzle-orm'

import {
  db,
  employeeIdentifications,
  employees,
  roles,
  userRoles,
  users,
} from '../../../../db'

import {
  ChangeIqamaRenewalStatusInput,
  CompleteIqamaRenewalInput,
  CreateIqamaRenewalCaseInput,
  GOVERNMENT_RELATIONS_ROLE,
  IqamaRenewalCaseActor,
  IqamaRenewalProcessError,
  IqamaRenewalStatus,
  ListIqamaRenewalCasesQuery,
  ReturnIqamaRenewalToHrInput,
  UpdateIqamaRenewalCaseInput,
} from '../types/iqama-renewal-process.types'

import {
  IqamaRenewalProcessRepository,
  type UpdateCaseData,
} from '../repository/iqama-renewal-process.repository'
import { IqamaRenewalWorkflowNotificationService } from './iqama-renewal-workflow-notification.service'
import { getRiyadhTodayDateOnly } from '../../../../core/utils/date'
import { IqamaRenewalCaseCommentRepository } from '../repository/iqama-renewal-case-comment.repository'

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

const assertGovernmentRelationsAssignee = async (
  tx: Parameters<typeof IqamaRenewalProcessRepository.findById>[0],
  userId: string,
) => {
  const [assignee] = await tx
    .select({
      id: users.id,
    })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    //.where(and(eq(users.id, userId), eq(roles.name, 'HR_GOVERNMENT_RELATION')))
    .where(
      and(
        eq(users.id, userId),
        eq(roles.name, GOVERNMENT_RELATIONS_ROLE),
        eq(users.isActive, true),
        eq(userRoles.isActive, true),
      ),
    )
    .limit(1)

  if (!assignee) {
    throw new IqamaRenewalProcessError(
      'The selected user is not a Government Relations user.',
      422,
      'INVALID_GOVERNMENT_RELATIONS_ASSIGNEE',
    )
  }
}

const buildStatusUpdate = (
  input: ChangeIqamaRenewalStatusInput,
  actor: IqamaRenewalCaseActor,
): UpdateCaseData => {
  const now = new Date()

  const update: UpdateCaseData = {
    status: input.status,
    updatedAt: now,
    updatedBy: actor.userId,
  }

  if (input.notes !== undefined) {
    update.notes = input.notes
  }

  switch (input.status) {
    case 'pending_upload':
      update.denialReason = null
      update.mhrsdDeniedAt = null
      update.mhrsdApprovedAt = null
      update.assignedToUserId = null
      update.governmentRelationsDueDate = null
      break

    case 'uploaded_to_mhrsd':
      update.mhrsdUploadedAt = now
      update.mhrsdApprovedAt = null
      update.mhrsdDeniedAt = null
      update.denialReason = null
      update.assignedToUserId = null
      update.governmentRelationsDueDate = null
      break

    case 'under_process':
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
      update.assignedToUserId = null
      update.governmentRelationsDueDate = null
      break

    case 'sent_to_government_relations':
      update.assignedToUserId = input.assignedToUserId ?? null

      update.governmentRelationsDueDate =
        input.governmentRelationsDueDate ?? null
      break

    case 'eoc_required':
      break

    case 'completed':
      break

    case 'cancelled':
      break

    default: {
      const exhaustiveCheck: never = input.status
      return exhaustiveCheck
    }
  }

  return update
}

export const IqamaRenewalProcessService = {
  listGovernmentRelationsUsers: async () => {
    const result = await db
      .selectDistinct({
        id: users.id,
        employeeId: users.employeeId,
        email: users.email,
        username: users.username,

        employeeNumber: employees.employeeNumber,

        labelEn: sql<string>`
        nullif(
          trim(
            concat_ws(
              ' ',
              ${employees.firstNameEn},
              ${employees.secondNameEn},
              ${employees.thirdNameEn},
              ${employees.familyNameEn}
            )
          ),
          ''
        )
      `,

        labelAr: sql<string>`
        nullif(
          trim(
            concat_ws(
              ' ',
             ${employees.firstNameAr},
              ${employees.secondNameAr},
              ${employees.thirdNameAr},
              ${employees.familyNameAr}
            )
          ),
          ''
        )
      `,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .leftJoin(employees, eq(employees.id, users.employeeId))
      .where(
        and(
          eq(users.isActive, true),
          eq(users.isDeleted, false),
          eq(roles.name, GOVERNMENT_RELATIONS_ROLE),
          or(eq(employees.isDeleted, false), sql`${employees.id} is null`),
        ),
      )
      .orderBy(
        asc(sql<string>`
        nullif(
          trim(
            concat_ws(
              ' ',
             ${employees.firstNameAr},
              ${employees.secondNameAr},
              ${employees.thirdNameAr},
              ${employees.familyNameAr}
            )
          ),
          ''
        )
      `),
        //asc(employees.lastNameEn),
        asc(users.username),
      )

    return result.map((user) => ({
      id: user.id,
      employeeId: user.employeeId,

      // Useful fallbacks when an account is not linked correctly.
      labelEn: user.labelEn || user.email || user.username || 'Unnamed user',

      labelAr:
        user.labelAr ||
        user.labelEn ||
        user.email ||
        user.username ||
        'مستخدم بدون اسم',

      email: user.email,
      username: user.username,
      employeeNumber: user.employeeNumber,
    }))
  },

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
          'Only an Iqama identification can be used.',
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
          'An active renewal case already exists for this Iqama.',
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

      assertVersionUpdateSucceeded(updated)

      const refreshed = await IqamaRenewalProcessRepository.findById(tx, id)

      return assertCaseExists(refreshed)
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

      if (input.status === 'sent_to_government_relations') {
        if (!input.assignedToUserId) {
          throw new IqamaRenewalProcessError(
            'Government Relations assignee is required.',
            422,
            'GOVERNMENT_RELATIONS_ASSIGNEE_REQUIRED',
          )
        }

        await assertGovernmentRelationsAssignee(tx, input.assignedToUserId)
      }

      const updateData = buildStatusUpdate(input, actor)
      const updated = await IqamaRenewalProcessRepository.updateWithVersion(
        tx,
        id,
        input.version,
        updateData,
      )

      assertVersionUpdateSucceeded(updated)

      const refreshed = await IqamaRenewalProcessRepository.findById(tx, id)
      const updatedCase = assertCaseExists(refreshed)

      /*
       * Notify the assigned Government Relations user
       * after the case was successfully transferred.
       */
      if (input.status === 'sent_to_government_relations') {
        if (!updatedCase.assignedToUserId) {
          throw new IqamaRenewalProcessError(
            'The updated case has no Government Relations assignee.',
            500,
            'GOVERNMENT_RELATIONS_ASSIGNEE_MISSING',
          )
        }

        await IqamaRenewalWorkflowNotificationService.notifyGovernmentRelationsAssignment(
          tx,
          {
            renewalCase: {
              id: updatedCase.id,
              employeeId: updatedCase.employeeId,
              employeeNumber: updatedCase.employeeNumber ?? null,
              employeeNameEn: updatedCase.employeeNameEn ?? null,
              employeeNameAr: updatedCase.employeeNameAr ?? null,
            },
            actorUserId: actor.userId,
            assignedToUserId: updatedCase.assignedToUserId,
            dueDate: updatedCase.governmentRelationsDueDate ?? null,
          },
        )
      }

      return updatedCase
    })
  },

  completeWithIqama: async (
    id: string,
    input: CompleteIqamaRenewalInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const current = await IqamaRenewalProcessRepository.findById(tx, id)

      const record = assertCaseExists(current)

      /*
       * The Iqama can only be updated after
       * assignment to Government Relations.
       */
      if (record.status !== 'sent_to_government_relations') {
        throw new IqamaRenewalProcessError(
          'The case is not awaiting Government Relations processing.',
          409,
          'IQAMA_RENEWAL_NOT_WITH_GOVERNMENT_RELATIONS',
        )
      }

      /*
       * Only the assigned Government Relations
       * user may complete this case.
       */
      if (record.assignedToUserId !== actor.userId) {
        throw new IqamaRenewalProcessError(
          'This Iqama renewal case is assigned to another user.',
          403,
          'IQAMA_RENEWAL_NOT_ASSIGNED_TO_USER',
        )
      }

      const actorRoles = await tx
        .select({
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(users, eq(users.id, userRoles.userId))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(
          and(
            eq(userRoles.userId, actor.userId),
            eq(userRoles.isActive, true),
            eq(users.isActive, true),
          ),
        )

      const isGovernmentRelationsUser = actorRoles.some(
        (row) => row.roleName === GOVERNMENT_RELATIONS_ROLE,
      )

      if (!isGovernmentRelationsUser) {
        throw new IqamaRenewalProcessError(
          'Only Government Relations may complete the Iqama renewal.',
          403,
          'GOVERNMENT_RELATIONS_ROLE_REQUIRED',
        )
      }

      /*
       * Confirm the identification still exists,
       * belongs to the case employee, and is an Iqama.
       */
      const [identification] = await tx
        .select({
          id: employeeIdentifications.id,
          employeeId: employeeIdentifications.employeeId,
          type: employeeIdentifications.type,
        })
        .from(employeeIdentifications)
        .where(
          and(
            eq(employeeIdentifications.id, record.identificationId),
            eq(employeeIdentifications.isDeleted, false),
          ),
        )
        .limit(1)

      if (!identification) {
        throw new IqamaRenewalProcessError(
          'The Iqama identification was not found.',
          404,
          'IQAMA_IDENTIFICATION_NOT_FOUND',
        )
      }

      if (identification.employeeId !== record.employeeId) {
        throw new IqamaRenewalProcessError(
          'The Iqama does not belong to the case employee.',
          422,
          'IQAMA_EMPLOYEE_MISMATCH',
        )
      }

      if (identification.type !== 'iqama') {
        throw new IqamaRenewalProcessError(
          'The identification is not an Iqama.',
          422,
          'IDENTIFICATION_IS_NOT_IQAMA',
        )
      }

      const identificationNumber =
        input.identification.identificationNumber.trim()

      if (!identificationNumber) {
        throw new IqamaRenewalProcessError(
          'The Iqama number is required.',
          422,
          'IQAMA_NUMBER_REQUIRED',
        )
      }

      const todayIso = getRiyadhTodayDateOnly()

      if (input.identification.expiryDate <= todayIso) {
        throw new IqamaRenewalProcessError(
          'The renewed Iqama expiry date must be in the future.',
          422,
          'IQAMA_EXPIRY_DATE_NOT_IN_FUTURE',
        )
      }

      /*
       * Update the employee Iqama.
       */
      const [updatedIdentification] = await tx
        .update(employeeIdentifications)
        .set({
          identificationNumber,
          issueDate: input.identification.issueDate ?? null,
          expiryDate: input.identification.expiryDate,
          issueDateHijri: input.identification.issueDateHijri ?? null,
          expiryDateHijri: input.identification.expiryDateHijri ?? null,
          sponsor: input.identification.sponsor ?? null,
          issuingAuthority: input.identification.issuingAuthority ?? null,
          occupation: input.identification.occupation ?? null,
          isCurrent: true,
          fileId: input.identification.fileId ?? null,
          updatedAt: new Date(),
          updatedBy: actor.userId,
        })
        .where(
          and(
            eq(employeeIdentifications.id, record.identificationId),
            eq(employeeIdentifications.employeeId, record.employeeId),
            eq(employeeIdentifications.isDeleted, false),
          ),
        )
        .returning({
          id: employeeIdentifications.id,
        })

      if (!updatedIdentification) {
        throw new IqamaRenewalProcessError(
          'Unable to update the employee Iqama.',
          500,
          'IQAMA_UPDATE_FAILED',
        )
      }

      /*
       * Complete the case with optimistic locking.
       */
      const updatedCase = await IqamaRenewalProcessRepository.updateWithVersion(
        tx,
        id,
        input.version,
        {
          status: 'completed',
          updatedAt: new Date(),
          updatedBy: actor.userId,
        },
      )

      assertVersionUpdateSucceeded(updatedCase)

      /*
       * Reload the completed case so the response and
       * notification contain the latest information.
       */
      const refreshed = await IqamaRenewalProcessRepository.findById(tx, id)

      //return assertCaseExists(refreshed)
      const completedCase = assertCaseExists(refreshed)

      /*
       * Notify all active HR_ADMIN users that
       * Government Relations updated the employee's
       * Iqama and completed the renewal process.
       */
      await IqamaRenewalWorkflowNotificationService.notifyHrAdminsOfCompletion(
        tx,
        {
          renewalCase: {
            id: completedCase.id,
            employeeId: completedCase.employeeId,
            employeeNumber: completedCase.employeeNumber ?? null,
            employeeNameEn: completedCase.employeeNameEn ?? null,
            employeeNameAr: completedCase.employeeNameAr ?? null,
          },

          actorUserId: actor.userId,
        },
      )

      return completedCase
    })
  },

  returnToHr: async (
    id: string,
    input: ReturnIqamaRenewalToHrInput,
    actor: IqamaRenewalCaseActor,
  ) => {
    return db.transaction(async (tx) => {
      const current = await IqamaRenewalProcessRepository.findById(tx, id)

      const record = assertCaseExists(current)

      /*
       * A case can only be returned while it is
       * assigned to Government Relations.
       */
      if (record.status !== 'sent_to_government_relations') {
        throw new IqamaRenewalProcessError(
          'Only a case awaiting Government Relations processing can be returned to HR.',
          409,
          'IQAMA_RENEWAL_NOT_WITH_GOVERNMENT_RELATIONS',
        )
      }

      /*
       * Only the assigned Government Relations
       * user may return the case.
       */
      if (record.assignedToUserId !== actor.userId) {
        throw new IqamaRenewalProcessError(
          'This Iqama renewal case is assigned to another user.',
          403,
          'IQAMA_RENEWAL_NOT_ASSIGNED_TO_USER',
        )
      }

      /*
       * Verify that the actor really has the
       * Government Relations role.
       */
      const actorRoles = await tx
        .select({
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(users, eq(users.id, userRoles.userId))
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .where(
          //and(eq(userRoles.userId, actor.userId), eq(userRoles.isActive, true)),
          and(
            eq(userRoles.userId, actor.userId),
            eq(userRoles.isActive, true),
            eq(users.isActive, true),
          ),
        )

      const isGovernmentRelationsUser = actorRoles.some(
        (row) => row.roleName === GOVERNMENT_RELATIONS_ROLE,
      )

      if (!isGovernmentRelationsUser) {
        throw new IqamaRenewalProcessError(
          'Only Government Relations may return this case to HR.',
          403,
          'GOVERNMENT_RELATIONS_ROLE_REQUIRED',
        )
      }

      const reason = input.reason.trim()

      if (!reason) {
        throw new IqamaRenewalProcessError(
          'A return reason is required.',
          422,
          'IQAMA_RETURN_REASON_REQUIRED',
        )
      }

      /*
       * Return the case to HR.
       *
       * Clear the GR assignment because the case is
       * no longer waiting for Government Relations.
       */
      const updated = await IqamaRenewalProcessRepository.updateWithVersion(
        tx,
        id,
        input.version,
        {
          status: 'pending_upload',
          assignedToUserId: null,
          governmentRelationsDueDate: null,
          updatedAt: new Date(),
          updatedBy: actor.userId,
        },
      )

      assertVersionUpdateSucceeded(updated)

      /*
       * Store the required reason as an append-only,
       * top-level case comment.
       */
      const createdComment = await IqamaRenewalCaseCommentRepository.create(
        tx,
        {
          caseId: record.id,
          authorUserId: actor.userId,
          body: reason,

          /*
           * The comment records the resulting
           * workflow state.
           */
          statusAtTime: 'pending_upload',
          parentCommentId: null,
          threadRootId: null,
        },
      )

      if (!createdComment) {
        throw new IqamaRenewalProcessError(
          'Unable to save the return reason.',
          500,
          'IQAMA_RETURN_COMMENT_CREATE_FAILED',
        )
      }

      const refreshed = await IqamaRenewalProcessRepository.findById(tx, id)

      const returnedCase = assertCaseExists(refreshed)

      //return assertCaseExists(refreshed)
      /*
       * Notify HR Admin after both the case update
       * and required comment creation succeeded.
       */
      await IqamaRenewalWorkflowNotificationService.notifyHrAdminsOfReturn(tx, {
        renewalCase: {
          id: returnedCase.id,
          employeeId: returnedCase.employeeId,
          employeeNumber: returnedCase.employeeNumber ?? null,
          employeeNameEn: returnedCase.employeeNameEn ?? null,
          employeeNameAr: returnedCase.employeeNameAr ?? null,
        },
        actorUserId: actor.userId,
        caseVersion: returnedCase.version,
        reason,
      })

      return returnedCase
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
