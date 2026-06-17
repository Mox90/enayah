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

export const EmployeePersonalController = {
  findByEmployeeId: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)

    const result = await EmployeePersonalService.findByEmployeeId(id)

    res.status(200).json(result)
  }),

  createAll: asyncHandler(async (req: Request, res: Response) => {
    const { id } = EmployeeIdSchema.parse(req.params)
    const body = CreateEmployeePersonalSchema.parse(req.body)

    const result = await EmployeePersonalService.createAll(id, body)
    res.status(201).json(result)
  }),

  updateIdentification: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeIdentificationSchema.parse(req.body)

    const result = await EmployeePersonalService.updateIdentification(id, body)

    res.status(200).json(result)
  }),

  updateEmail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeEmailSchema.parse(req.body)

    const result = await EmployeePersonalService.updateEmail(id, body)

    res.status(200).json(result)
  }),

  updatePhoneNumber: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeePhoneNumberSchema.parse(req.body)

    const result = await EmployeePersonalService.updatePhoneNumber(id, body)

    res.status(200).json(result)
  }),

  updateDependent: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeDependentSchema.parse(req.body)

    const result = await EmployeePersonalService.updateDependent(id, body)

    res.status(200).json(result)
  }),

  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeAddressSchema.parse(req.body)

    const result = await EmployeePersonalService.updateAddress(id, body)

    res.status(200).json(result)
  }),

  updateEmergencyContact: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeEmergencyContactSchema.parse(req.body)

    const result = await EmployeePersonalService.updateEmergencyContact(
      id,
      body,
    )

    res.status(200).json(result)
  }),

  updateVisa: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)
    const body = UpdateEmployeeVisaSchema.parse(req.body)

    const result = await EmployeePersonalService.updateVisa(id, body)

    res.status(200).json(result)
  }),

  softDeleteIdentification: asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = PersonalRecordIdSchema.parse(req.params)

      await EmployeePersonalService.softDeleteIdentification(id, req.user?.id)

      res.status(204).send()
    },
  ),

  softDeleteEmail: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteEmail(id, req.user?.id)

    res.status(204).send()
  }),

  softDeletePhoneNumber: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeletePhoneNumber(id, req.user?.id)

    res.status(204).send()
  }),

  softDeleteDependent: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteDependent(id, req.user?.id)

    res.status(204).send()
  }),

  softDeleteAddress: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteAddress(id, req.user?.id)

    res.status(204).send()
  }),

  softDeleteEmergencyContact: asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = PersonalRecordIdSchema.parse(req.params)

      await EmployeePersonalService.softDeleteEmergencyContact(id, req.user?.id)

      res.status(204).send()
    },
  ),

  softDeleteVisa: asyncHandler(async (req: Request, res: Response) => {
    const { id } = PersonalRecordIdSchema.parse(req.params)

    await EmployeePersonalService.softDeleteVisa(id, req.user?.id)

    res.status(204).send()
  }),
}
