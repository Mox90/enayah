import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import { EmployeeIdSchema } from '../dto/employee.request'
import {
  CreateEmployeePersonalSchema,
  PersonalRecordIdSchema,
  UpdateEmployeeAddressSchema,
  UpdateEmployeeDependentSchema,
  UpdateEmployeeEmailSchema,
  UpdateEmployeeEmergencyContactSchema,
  UpdateEmployeeIdentificationSchema,
  UpdateEmployeePhoneNumberSchema,
  UpdateEmployeeVisaSchema,
} from '../dto/employee-personal.request'
import { EmployeePersonalService } from '../service/employee-personal.service'
import { EmployeeProfileSummaryParamsSchema } from '../dto/employee-profile-summary.types'
import { EmployeeProfileService } from '../service/employee-profile.service'
import { db } from '../../../../db'

export const EmployeePersonalController = {
  findByEmployeeId: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)

    const result = await EmployeePersonalService.findByEmployeeId(id)

    res.status(200).json(result)
  }),

  createAll: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)
    //console.log('Employe id is ' + id)
    //console.log('Data received before parsing:')
    //console.log(req.body)
    const body = CreateEmployeePersonalSchema.parse(req.body)
    //console.log('Data received after parsing')
    //console.log(body)

    const result = await EmployeePersonalService.createAll(id, body)
    res.status(201).json(result)
  }),

  //   createAll: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = EmployeeIdSchema.parse(req.params)
  //   const body = CreateEmployeePersonalSchema.parse(req.body)

  //   const permissions = req.user?.permissions ?? []
  //   const canManageAnyEmployee = permissions.includes('employee.update')
  //   const isOwnProfile = req.user?.employeeId === id

  //   if (
  //     isOwnProfile &&
  //     !canManageAnyEmployee &&
  //     body.dependents &&
  //     body.dependents.length > 0
  //   ) {
  //     throw new AppError(
  //       'Employees are not permitted to create dependent records',
  //       403,
  //     )
  //   }

  //   const result = await EmployeePersonalService.createAll(id, body)

  //   res.status(201).json(result)
  // }),

  updateIdentification: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeIdentificationSchema.parse(req.body)

    const result = await EmployeePersonalService.updateIdentification(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  updateEmail: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeEmailSchema.parse(req.body)

    const result = await EmployeePersonalService.updateEmail(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  updatePhoneNumber: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeePhoneNumberSchema.parse(req.body)

    const result = await EmployeePersonalService.updatePhoneNumber(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  updateDependent: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeDependentSchema.parse(req.body)

    const result = await EmployeePersonalService.updateDependent(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeAddressSchema.parse(req.body)

    const result = await EmployeePersonalService.updateAddress(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  updateEmergencyContact: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeEmergencyContactSchema.parse(req.body)

    const result = await EmployeePersonalService.updateEmergencyContact(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  updateVisa: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, recordId } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeVisaSchema.parse(req.body)

    const result = await EmployeePersonalService.updateVisa(
      employeeId,
      recordId,
      body,
    )

    res.status(200).json(result)
  }),

  softDeleteIdentification: asyncHandler(
    async (req: Request, res: Response) => {
      const { recordId } = PersonalRecordIdSchema.parse(req.params)

      await EmployeePersonalService.softDeleteIdentification(
        recordId,
        req.user?.id,
      )

      res.status(204).send()
    },
  ),

  softDeleteEmail: asyncHandler(async (req: Request, res: Response) => {
    const { recordId } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteEmail(recordId, req.user?.id)

    res.status(204).send()
  }),

  softDeletePhoneNumber: asyncHandler(async (req: Request, res: Response) => {
    const { recordId } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeletePhoneNumber(recordId, req.user?.id)

    res.status(204).send()
  }),

  softDeleteDependent: asyncHandler(async (req: Request, res: Response) => {
    const { recordId } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteDependent(recordId, req.user?.id)

    res.status(204).send()
  }),

  softDeleteAddress: asyncHandler(async (req: Request, res: Response) => {
    const { recordId } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteAddress(recordId, req.user?.id)

    res.status(204).send()
  }),

  softDeleteEmergencyContact: asyncHandler(
    async (req: Request, res: Response) => {
      const { recordId } = PersonalRecordIdSchema.parse(req.params)

      await EmployeePersonalService.softDeleteEmergencyContact(
        recordId,
        req.user?.id,
      )

      res.status(204).send()
    },
  ),

  softDeleteVisa: asyncHandler(async (req: Request, res: Response) => {
    const { recordId } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteVisa(recordId, req.user?.id)

    res.status(204).send()
  }),

  getEmployeeProfileSummary: asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = EmployeeProfileSummaryParamsSchema.parse(req.params)

      const summary = await EmployeeProfileService.findProfileSummary(db, id)

      res.status(200).json({
        data: summary,
      })
    },
  ),
}
