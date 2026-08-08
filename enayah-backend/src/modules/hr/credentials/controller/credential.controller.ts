// enayah-backend/src/modules/hr/credentials/controller/credential.controller.ts

import type { Request, Response } from 'express'
import { asyncHandler } from '../../../../core/utils/asyncHandler'
import {
  CreateBoardSchema,
  CreateDegreeSchema,
  CreateEmployeeCredentialsSchema,
  CreateFellowshipSchema,
  CreateLicenseSchema,
  CreateLifeSupportSchema,
  CreateMalpracticeSchema,
  CreateMembershipSchema,
  CredentialRecordIdSchema,
  EmployeeCredentialParamSchema,
  EmployeeCredentialRecordParamSchema,
  EmployeeCredentialVerificationEventParamSchema,
  UpdateBoardSchema,
  UpdateCredentialVerificationSchema,
  UpdateDegreeSchema,
  UpdateFellowshipSchema,
  UpdateLicenseSchema,
  UpdateLifeSupportSchema,
  UpdateMalpracticeSchema,
  UpdateMembershipSchema,
  parseCredentialMultipartBody,
} from '../dto/credential.request'
import { CredentialService } from '../service/credential.service'
import { AppError } from '../../../../core/errors/AppError'

function getAuthenticatedUserId(request: Request): string {
  const userId = request.user?.id

  if (!userId) {
    throw new AppError('An authenticated user is required.', 401)
  }

  return userId
}

type CredentialDocumentDisposition = 'inline' | 'attachment'

function normalizeDocumentFilename(fileName: string): string {
  const normalized = fileName.replace(/[\u0000-\u001F\u007F]/g, ' ').trim()

  return normalized || 'credential-document'
}

function createAsciiFilename(fileName: string): string {
  const asciiFilename = fileName
    .replace(/["\\]/g, '_')
    .replace(/[^\x20-\x7E]/g, '_')
    .trim()

  return asciiFilename || 'credential-document'
}

function encodeRfc5987Filename(fileName: string): string {
  return encodeURIComponent(fileName).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function buildContentDisposition(
  disposition: CredentialDocumentDisposition,
  originalName: string,
): string {
  const normalizedName = normalizeDocumentFilename(originalName)
  const asciiName = createAsciiFilename(normalizedName)
  const encodedName = encodeRfc5987Filename(normalizedName)

  return `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`
}

async function sendCredentialDocument({
  response,
  absolutePath,
  originalName,
  mimeType,
  disposition,
}: {
  response: Response
  absolutePath: string
  originalName: string
  mimeType: string
  disposition: CredentialDocumentDisposition
}): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    response.sendFile(
      absolutePath,
      {
        acceptRanges: true,
        cacheControl: false,
        dotfiles: 'deny',
        lastModified: false,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': buildContentDisposition(
            disposition,
            originalName,
          ),
          'Cache-Control': 'private, no-store, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
          'X-Content-Type-Options': 'nosniff',
          'Cross-Origin-Resource-Policy': 'same-origin',
        },
      },
      (error) => {
        if (!error) {
          resolve()
          return
        }

        /*
         * sendFile may fail after part of the response has
         * already been streamed.
         *
         * At that point, another HTTP response cannot be sent.
         * Close the connection and do not reject the Promise,
         * otherwise asyncHandler would forward the error to the
         * JSON error middleware.
         */
        if (response.headersSent) {
          console.error(
            'Credential document stream failed after headers were sent:',
            error,
          )

          response.destroy(error)
          resolve()
          return
        }

        /*
         * No response has been committed yet, so the normal
         * Express error pipeline can safely return JSON.
         */
        reject(error)
      },
    )
  })
}

export const CredentialController = {
  findByEmployeeId: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const result = await CredentialService.findByEmployeeId(employeeId)

    res.status(200).json(result)
  }),

  previewDegreeDocument: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: degreeId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)

    const document = await CredentialService.getDegreeDocument({
      employeeId,
      degreeId,
    })

    await sendCredentialDocument({
      response: res,
      absolutePath: document.absolutePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
      disposition: 'inline',
    })
  }),

  downloadDegreeDocument: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: degreeId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)

    const document = await CredentialService.getDegreeDocument({
      employeeId,
      degreeId,
    })

    await sendCredentialDocument({
      response: res,
      absolutePath: document.absolutePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
      disposition: 'attachment',
    })
  }),

  previewDegreeVerificationEvidence: asyncHandler(
    async (req: Request, res: Response) => {
      const {
        employeeId,
        id: degreeId,
        eventId,
      } = EmployeeCredentialVerificationEventParamSchema.parse(req.params)

      const document = await CredentialService.getDegreeVerificationEvidence({
        employeeId,
        degreeId,
        eventId,
      })

      await sendCredentialDocument({
        response: res,
        absolutePath: document.absolutePath,
        originalName: document.originalName,
        mimeType: document.mimeType,
        disposition: 'inline',
      })
    },
  ),

  downloadDegreeVerificationEvidence: asyncHandler(
    async (req: Request, res: Response) => {
      const {
        employeeId,
        id: degreeId,
        eventId,
      } = EmployeeCredentialVerificationEventParamSchema.parse(req.params)

      const document = await CredentialService.getDegreeVerificationEvidence({
        employeeId,
        degreeId,
        eventId,
      })

      await sendCredentialDocument({
        response: res,
        absolutePath: document.absolutePath,
        originalName: document.originalName,
        mimeType: document.mimeType,
        disposition: 'attachment',
      })
    },
  ),

  createAll: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const body = CreateEmployeeCredentialsSchema.parse(req.body)

    const result = await CredentialService.createAll(employeeId, body)

    res.status(201).json(result)
  }),

  createDegree: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

    const uploadedByUserId = getAuthenticatedUserId(req)

    const body = parseCredentialMultipartBody(
      req.body,
      'degree',
      CreateDegreeSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'degree',

      ...(req.file
        ? {
            document: req.file,
          }
        : {}),
    })

    res.status(201).json(result)
  }),

  createBoard: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const uploadedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'board',
      CreateBoardSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'board',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(201).json(result)
  }),

  createFellowship: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const uploadedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'fellowship',
      CreateFellowshipSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'fellowship',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(201).json(result)
  }),

  createMembership: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const uploadedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'membership',
      CreateMembershipSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'membership',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(201).json(result)
  }),

  createLicense: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const uploadedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'license',
      CreateLicenseSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'license',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(201).json(result)
  }),

  createLifeSupport: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const uploadedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'life_support',
      CreateLifeSupportSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'life-support',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(201).json(result)
  }),

  createMalpractice: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)
    const uploadedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'malpractice',
      CreateMalpracticeSchema,
    )

    const result = await CredentialService.createCredential({
      employeeId,
      data: body,
      uploadedByUserId,
      kind: 'malpractice',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(201).json(result)
  }),

  updateDegree: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: degreeId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'degree',
      UpdateDegreeSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: degreeId,
      data: body,
      updatedByUserId,
      kind: 'degree',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  updateBoard: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: boardId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'board',
      UpdateBoardSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: boardId,
      data: body,
      updatedByUserId,
      kind: 'board',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  updateFellowship: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: fellowshipId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'fellowship',
      UpdateFellowshipSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: fellowshipId,
      data: body,
      updatedByUserId,
      kind: 'fellowship',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  updateMembership: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: membershipId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'membership',
      UpdateMembershipSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: membershipId,
      data: body,
      updatedByUserId,
      kind: 'membership',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  updateLicense: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: licenseId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'license',
      UpdateLicenseSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: licenseId,
      data: body,
      updatedByUserId,
      kind: 'license',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  updateLifeSupport: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: lifeSupportId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'life_support',
      UpdateLifeSupportSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: lifeSupportId,
      data: body,
      updatedByUserId,
      kind: 'life-support',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  updateMalpractice: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: malpracticeId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)
    const updatedByUserId = getAuthenticatedUserId(req)
    const body = parseCredentialMultipartBody(
      req.body,
      'malpractice',
      UpdateMalpracticeSchema,
    )

    const result = await CredentialService.updateCredential({
      employeeId,
      credentialId: malpracticeId,
      data: body,
      updatedByUserId,
      kind: 'malpractice',
      ...(req.file ? { document: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  // updateBoard: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = CredentialRecordIdSchema.parse(req.params)

  //   const result = await CredentialService.updateBoard(id, req.body)

  //   res.status(200).json(result)
  // }),

  // updateFellowship: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = CredentialRecordIdSchema.parse(req.params)

  //   const result = await CredentialService.updateFellowship(id, req.body)

  //   res.status(200).json(result)
  // }),

  // updateMembership: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = CredentialRecordIdSchema.parse(req.params)

  //   const result = await CredentialService.updateMembership(id, req.body)

  //   res.status(200).json(result)
  // }),

  // updateLicense: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = CredentialRecordIdSchema.parse(req.params)

  //   const result = await CredentialService.updateLicense(id, req.body)

  //   res.status(200).json(result)
  // }),

  // updateLifeSupport: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = CredentialRecordIdSchema.parse(req.params)

  //   const result = await CredentialService.updateLifeSupport(id, req.body)

  //   res.status(200).json(result)
  // }),

  // updateMalpractice: asyncHandler(async (req: Request, res: Response) => {
  //   const { id } = CredentialRecordIdSchema.parse(req.params)

  //   const result = await CredentialService.updateMalpractice(id, req.body)

  //   res.status(200).json(result)
  // }),

  updateDegreeVerification: asyncHandler(
    async (req: Request, res: Response) => {
      const { employeeId, id: degreeId } =
        EmployeeCredentialRecordParamSchema.parse(req.params)

      const verifiedByUserId = getAuthenticatedUserId(req)

      /*
       * Preserve JSON compatibility:
       *
       * JSON:
       * {
       *   "isVerified": true,
       *   "remarks": "Reviewed"
       * }
       *
       * Multipart:
       * verification: JSON string
       * evidence: File
       */
      const isMultipart = Boolean(req.is('multipart/form-data'))

      const body = isMultipart
        ? parseCredentialMultipartBody(
            req.body,
            'verification',
            UpdateCredentialVerificationSchema,
          )
        : UpdateCredentialVerificationSchema.parse(req.body)

      const result = await CredentialService.updateDegreeVerification({
        employeeId,
        degreeId,
        data: body,
        verifiedByUserId,
        ...(req.file ? { evidence: req.file } : {}),
      })

      res.status(200).json(result)
    },
  ),

  updateBoardVerification: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: boardId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)

    const verifiedByUserId = getAuthenticatedUserId(req)

    /*
     * Preserve JSON compatibility:
     *
     * JSON:
     * {
     *   "isVerified": true,
     *   "remarks": "Reviewed"
     * }
     *
     * Multipart:
     * verification: JSON string
     * evidence: File
     */
    const isMultipart = Boolean(req.is('multipart/form-data'))

    const body = isMultipart
      ? parseCredentialMultipartBody(
          req.body,
          'verification',
          UpdateCredentialVerificationSchema,
        )
      : UpdateCredentialVerificationSchema.parse(req.body)

    const result = await CredentialService.updateBoardVerification({
      employeeId,
      boardId,
      data: body,
      verifiedByUserId,
      ...(req.file ? { evidence: req.file } : {}),
    })

    res.status(200).json(result)
  }),

  deleteDegree: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId, id: degreeId } =
      EmployeeCredentialRecordParamSchema.parse(req.params)

    const deletedByUserId = getAuthenticatedUserId(req)

    await CredentialService.softDeleteDegree({
      employeeId,
      degreeId,
      deletedByUserId,
    })

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

  // createDegree: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   const uploadedByUserId = getAuthenticatedUserId(req)

  //   const body = parseCredentialMultipartBody(
  //     req.body,
  //     'degree',
  //     CreateDegreeSchema,
  //   )

  //   const result = await CredentialService.createDegree({
  //     employeeId,
  //     data: body,
  //     uploadedByUserId,
  //     ...(req.file ? { document: req.file } : {}),
  //   })

  //   res.status(201).json(result)
  // }),

  // createBoard: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   const uploadedByUserId = getAuthenticatedUserId(req)

  //   const body = parseCredentialMultipartBody(
  //     req.body,
  //     'board',
  //     CreateBoardSchema,
  //   )

  //   const result = await CredentialService.createCredential({
  //     employeeId,
  //     data: body,
  //     uploadedByUserId,
  //     ...(req.file ? { document: req.file } : {}),
  //     kind: 'board',
  //   })

  //   res.status(201).json(result)
  // }),

  // createFellowship: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   // const uploadedByUserId = getAuthenticatedUserId(req)

  //   // const body = parseCredentialMultipartBody(
  //   //   req.body,
  //   //   'fellowship',
  //   //   CreateFellowshipSchema,
  //   // )

  //   const body = CreateFellowshipSchema.parse(req.body)

  //   const result = await CredentialService.createFellowship(employeeId, body)

  //   res.status(201).json(result)
  // }),

  // createMembership: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   const result = await CredentialService.createMembership(
  //     employeeId,
  //     req.body,
  //   )

  //   res.status(201).json(result)
  // }),

  // createLicense: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   const result = await CredentialService.createLicense(employeeId, req.body)

  //   res.status(201).json(result)
  // }),

  // createLifeSupport: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   const result = await CredentialService.createLifeSupport(
  //     employeeId,
  //     req.body,
  //   )

  //   res.status(201).json(result)
  // }),

  // createMalpractice: asyncHandler(async (req: Request, res: Response) => {
  //   const { employeeId } = EmployeeCredentialParamSchema.parse(req.params)

  //   const result = await CredentialService.createMalpractice(
  //     employeeId,
  //     req.body,
  //   )

  //   res.status(201).json(result)
  // }),
}
