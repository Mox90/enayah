import { CreateEmployeeDto, UpdateEmployeeDto } from '../dto/employee.request'

export function toEmployeeDb(dto: CreateEmployeeDto) {
  return {
    employeeNumber: dto.employeeNumber.trim(),
    firstNameEn: dto.firstNameEn.trim(),
    secondNameEn: dto.secondNameEn?.trim() ?? null,
    thirdNameEn: dto.thirdNameEn?.trim() ?? null,
    familyNameEn: dto.familyNameEn.trim(),
    firstNameAr: dto.firstNameAr.trim(),
    secondNameAr: dto.secondNameAr?.trim() ?? null,
    thirdNameAr: dto.thirdNameAr?.trim() ?? null,
    familyNameAr: dto.familyNameAr.trim(),
    gender: dto.gender,
    dateOfBirth: dto.dateOfBirth ?? null,
    countryId: dto.countryId ?? null,
  }
}

export function toEmployeeUpdateDb(dto: UpdateEmployeeDto) {
  return {
    ...(dto.employeeNumber !== undefined && {
      employeeNumber: dto.employeeNumber.trim(),
    }),

    ...(dto.firstNameEn !== undefined && {
      firstNameEn: dto.firstNameEn.trim(),
    }),

    ...(dto.secondNameEn !== undefined && {
      secondNameEn: dto.secondNameEn?.trim() ?? null,
    }),

    ...(dto.thirdNameEn !== undefined && {
      thirdNameEn: dto.thirdNameEn?.trim() ?? null,
    }),

    ...(dto.familyNameEn !== undefined && {
      familyNameEn: dto.familyNameEn.trim(),
    }),

    ...(dto.firstNameAr !== undefined && {
      firstNameAr: dto.firstNameAr.trim(),
    }),

    ...(dto.secondNameAr !== undefined && {
      secondNameAr: dto.secondNameAr?.trim() ?? null,
    }),

    ...(dto.thirdNameAr !== undefined && {
      thirdNameAr: dto.thirdNameAr?.trim() ?? null,
    }),

    ...(dto.familyNameAr !== undefined && {
      familyNameAr: dto.familyNameAr.trim(),
    }),

    ...(dto.gender !== undefined && {
      gender: dto.gender,
    }),

    ...(dto.dateOfBirth !== undefined && {
      dateOfBirth: dto.dateOfBirth,
    }),

    ...(dto.countryId !== undefined && {
      countryId: dto.countryId,
    }),
  }
}

/*
const mapEmployee = (dto: CreateEmployeeDto | UpdateEmployeeDto) => ({
  ...(dto.employeeNumber !== undefined && {
    employeeNumber: dto.employeeNumber.trim(),
  }),

  ...(dto.firstNameEn !== undefined && {
    firstNameEn: dto.firstNameEn.trim(),
  }),

  ...(dto.secondNameEn !== undefined && {
    secondNameEn: dto.secondNameEn?.trim() ?? null,
  }),

  ...(dto.thirdNameEn !== undefined && {
    thirdNameEn: dto.thirdNameEn?.trim() ?? null,
  }),

  ...(dto.familyNameEn !== undefined && {
    familyNameEn: dto.familyNameEn.trim(),
  }),

  ...(dto.firstNameAr !== undefined && {
    firstNameAr: dto.firstNameAr.trim(),
  }),

  ...(dto.secondNameAr !== undefined && {
    secondNameAr: dto.secondNameAr?.trim() ?? null,
  }),

  ...(dto.thirdNameAr !== undefined && {
    thirdNameAr: dto.thirdNameAr?.trim() ?? null,
  }),

  ...(dto.familyNameAr !== undefined && {
    familyNameAr: dto.familyNameAr.trim(),
  }),

  ...(dto.gender !== undefined && {
    gender: dto.gender,
  }),

  ...(dto.dateOfBirth !== undefined && {
    dateOfBirth: dto.dateOfBirth,
  }),

  ...(dto.countryId !== undefined && {
    countryId: dto.countryId,
  }),
})

export const toEmployeeDb = mapEmployee

export const toEmployeeUpdateDb = mapEmployee
*/
