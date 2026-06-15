// src/modules/hr/credentials/controller/credential.controller.ts

import { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  CreateEmployeeCredentialsSchema,
  CredentialRecordIdSchema,
  EmployeeCredentialParamSchema,
} from '../dto/credential.request'
import { CredentialService } from '../service/credential.service'

export const CredentialController = {
  findByEmployeeId: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.findByEmployeeId(employeeId)

    res.status(200).json(result)
  }),

  createAll: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const body = CreateEmployeeCredentialsSchema.parse(req.body)

    const result = await CredentialService.createAll(employeeId, body)

    res.status(201).json(result)
  }),

  createDegree: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createDegree(employeeId, req.body)

    res.status(201).json(result)
  }),

  createBoard: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createBoard(employeeId, req.body)

    res.status(201).json(result)
  }),

  createFellowship: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createFellowship(
      employeeId,
      req.body,
    )

    res.status(201).json(result)
  }),

  createMembership: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createMembership(
      employeeId,
      req.body,
    )

    res.status(201).json(result)
  }),

  createLicense: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createLicense(employeeId, req.body)

    res.status(201).json(result)
  }),

  createLifeSupport: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createLifeSupport(
      employeeId,
      req.body,
    )

    res.status(201).json(result)
  }),

  createMalpractice: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.createMalpractice(
      employeeId,
      req.body,
    )

    res.status(201).json(result)
  }),

  updateDegree: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateDegree(id, req.body)

    res.status(200).json(result)
  }),

  updateBoard: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateBoard(id, req.body)

    res.status(200).json(result)
  }),

  updateFellowship: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateFellowship(id, req.body)

    res.status(200).json(result)
  }),

  updateMembership: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateMembership(id, req.body)

    res.status(200).json(result)
  }),

  updateLicense: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateLicense(id, req.body)

    res.status(200).json(result)
  }),

  updateLifeSupport: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateLifeSupport(id, req.body)

    res.status(200).json(result)
  }),

  updateMalpractice: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    const result = await CredentialService.updateMalpractice(id, req.body)

    res.status(200).json(result)
  }),

  deleteDegree: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteDegree(id, req.user?.id)

    res.status(204).send()
  }),

  deleteBoard: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteBoard(id, req.user?.id)

    res.status(204).send()
  }),

  deleteFellowship: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteFellowship(id, req.user?.id)

    res.status(204).send()
  }),

  deleteMembership: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteMembership(id, req.user?.id)

    res.status(204).send()
  }),

  deleteLicense: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteLicense(id, req.user?.id)

    res.status(204).send()
  }),

  deleteLifeSupport: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteLifeSupport(id, req.user?.id)

    res.status(204).send()
  }),

  deleteMalpractice: asyncHandler(async (req: Request, res: Response) => {
    const { id } = CredentialRecordIdSchema.parse(req.params)

    await CredentialService.softDeleteMalpractice(id, req.user?.id)

    res.status(204).send()
  }),
}
