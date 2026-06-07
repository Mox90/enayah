// employee.mapper.ts
import {
  EmployeeDirectoryResponse,
  EmployeeResponse,
} from './employee.response'
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.request'
import { InferSelectModel } from 'drizzle-orm'
import { employees } from '../../../../db'

type EmployeeSelect = InferSelectModel<typeof employees>

export const toEmployeeDb = (dto: CreateEmployeeDto) => ({
  employeeNumber: dto.employeeNumber,

  firstNameEn: dto.firstNameEn,
  secondNameEn: dto.secondNameEn,
  thirdNameEn: dto.thirdNameEn,
  familyNameEn: dto.familyNameEn,

  firstNameAr: dto.firstNameAr,
  secondNameAr: dto.secondNameAr,
  thirdNameAr: dto.thirdNameAr,
  familyNameAr: dto.familyNameAr,

  dateOfBirth: dto.dateOfBirth,
  gender: dto.gender,

  countryId: dto.countryId,
})

export const toEmployeeUpdateDb = (dto: UpdateEmployeeDto) => ({
  ...(dto.firstNameEn !== undefined && { firstNameEn: dto.firstNameEn }),
  ...(dto.secondNameEn !== undefined && { secondNameEn: dto.secondNameEn }),
  ...(dto.thirdNameEn !== undefined && { thirdNameEn: dto.thirdNameEn }),
  ...(dto.familyNameEn !== undefined && { familyNameEn: dto.familyNameEn }),

  ...(dto.firstNameAr !== undefined && { firstNameAr: dto.firstNameAr }),
  ...(dto.secondNameAr !== undefined && { secondNameAr: dto.secondNameAr }),
  ...(dto.thirdNameAr !== undefined && { thirdNameAr: dto.thirdNameAr }),
  ...(dto.familyNameAr !== undefined && { familyNameAr: dto.familyNameAr }),

  ...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth }),
  ...(dto.gender !== undefined && { gender: dto.gender }),

  ...(dto.countryId !== undefined && { countryId: dto.countryId }),
})

export const toEmployeeResponse = (
  employee: EmployeeSelect & { nationality?: any },
): EmployeeResponse => {
  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullNameEn: [
      employee.firstNameEn,
      employee.secondNameEn,
      employee.thirdNameEn,
      employee.familyNameEn,
    ]
      .filter(Boolean)
      .join(' '),

    fullNameAr: [
      employee.firstNameAr,
      employee.secondNameAr,
      employee.thirdNameAr,
      employee.familyNameAr,
    ]
      .filter(Boolean)
      .join(' '),

    ...(employee.gender && { gender: employee.gender }), //gender: employee.gender,
    ...(employee.dateOfBirth && { dateOfBirth: employee.dateOfBirth }), //dateOfBirth: employee.dateOfBirth ?? undefined,
    //countryId: employee.countryId,
    nationality: employee.nationality
      ? {
          countryId: employee.nationality.id,
          name: employee.nationality.name,
          nameAr: employee.nationality.nameAr,
          nationalityEn: employee.nationality.nationalityEn,
          nationalityAr: employee.nationality.nationalityAr,
        }
      : null,
    version: employee.version,
  }
}

export function toEmployeeDirectoryResponse(
  //employee: any,
  employee: {
    id: string
    employeeNumber: string
    firstNameEn: string
    secondNameEn: string | null
    thirdNameEn: string | null
    familyNameEn: string
    firstNameAr: string
    secondNameAr: string | null
    thirdNameAr: string | null
    familyNameAr: string
    gender: string | null
    nationalityEn: string | null
    hireDate: string | null
    employmentStatus: string | null
    pcn: string | null
    categoryCode: number | null
    departmentId: string | null
    departmentNameEn: string | null
    departmentNameAr: string | null
    positionId: string | null
    positionTitleEn: string | null
    positionTitleAr: string | null
  },
): EmployeeDirectoryResponse {
  //const employment = employee.employments?.[0]

  //const item = employment?.positionItem

  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullNameEn:
      `${employee.firstNameEn} ${employee.secondNameEn ?? ''} ${employee.thirdNameEn ?? ''} ${employee.familyNameEn}`
        .replace(/\s+/g, ' ')
        .trim(),
    fullNameAr:
      `${employee.firstNameAr} ${employee.secondNameAr ?? ''} ${employee.thirdNameAr ?? ''} ${employee.familyNameAr}`
        .replace(/\s+/g, ' ')
        .trim(),
    gender: employee.gender,
    nationality: employee.nationalityEn ?? null, //employee.nationality?.nationalityEn ?? null,
    department: employee.departmentId //item?.department
      ? {
          id: employee.departmentId, //item.department.id,
          nameEn: employee.departmentNameEn!, //item.department.nameEn,
          nameAr: employee.departmentNameAr!,
        }
      : null,
    position: employee.positionId //item?.position
      ? {
          id: employee.positionId,
          titleEn: employee.positionTitleEn!,
          titleAr: employee.positionTitleAr ?? null,
        }
      : null,
    pcn: employee.pcn ?? null, //item?.itemNumber ?? null,
    categoryCode: employee.categoryCode ?? null,
    hireDate: employee.hireDate ?? null,
    employmentStatus: employee.employmentStatus ?? null,
  }
}
