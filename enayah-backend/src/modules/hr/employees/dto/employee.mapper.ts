// employee.mapper.ts
import { EmployeeResponse } from './employee.response'
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.request'

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
  ...(dto.firstNameEn && { firstNameEn: dto.firstNameEn }),
  ...(dto.secondNameEn && { secondNameEn: dto.secondNameEn }),
  ...(dto.thirdNameEn && { thirdNameEn: dto.thirdNameEn }),
  ...(dto.familyNameEn && { familyNameEn: dto.familyNameEn }),

  ...(dto.firstNameAr && { firstNameAr: dto.firstNameAr }),
  ...(dto.secondNameAr && { secondNameAr: dto.secondNameAr }),
  ...(dto.thirdNameAr && { thirdNameAr: dto.thirdNameAr }),
  ...(dto.familyNameAr && { familyNameAr: dto.familyNameAr }),

  ...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth }),
  ...(dto.gender && { gender: dto.gender }),

  ...(dto.countryId !== undefined && { countryId: dto.countryId }),
})

export const toEmployeeResponse = (employee: any): EmployeeResponse => {
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

    gender: employee.gender,
  }
}
