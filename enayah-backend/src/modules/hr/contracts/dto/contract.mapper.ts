import { CreateContractDto, UpdateContractDto } from './contract.request'

export function toContractDb(
  dto: CreateContractDto & { contractNumber: string },
) {
  return {
    employmentId: dto.employmentId,
    contractNumber: dto.contractNumber,
    startDate: dto.startDate,
    endDate: dto.endDate,
    contractType: dto.contractType,
    status: dto.status,
    signedDate: dto.signedDate ?? null,
    documentPath: dto.documentPath ?? null,
    notes: dto.notes ?? null,
  }
}

export function toContractUpdateDb(dto: UpdateContractDto) {
  return {
    ...(dto.contractNumber !== undefined && {
      contractNumber: dto.contractNumber,
    }),

    ...(dto.startDate !== undefined && {
      startDate: dto.startDate,
    }),

    ...(dto.endDate !== undefined && {
      endDate: dto.endDate,
    }),

    ...(dto.contractType !== undefined && {
      contractType: dto.contractType,
    }),

    ...(dto.status !== undefined && {
      status: dto.status,
    }),

    ...(dto.signedDate !== undefined && {
      signedDate: dto.signedDate,
    }),

    ...(dto.documentPath !== undefined && {
      documentPath: dto.documentPath,
    }),

    ...(dto.notes !== undefined && {
      notes: dto.notes,
    }),
  }
}
