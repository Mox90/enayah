export interface EmployeeName {
  firstNameEn?: string | null
  secondNameEn?: string | null
  thirdNameEn?: string | null
  familyNameEn?: string | null

  firstNameAr?: string | null
  secondNameAr?: string | null
  thirdNameAr?: string | null
  familyNameAr?: string | null
}

export function getEmployeeFullName(
  employee?: EmployeeName | null,
  locale: 'en' | 'ar' = 'en',
) {
  if (!employee) return ''

  if (locale === 'ar') {
    return [
      employee.firstNameAr,
      employee.secondNameAr,
      employee.thirdNameAr,
      employee.familyNameAr,
    ]
      .filter(Boolean)
      .join(' ')
  }

  return [
    employee.firstNameEn,
    employee.secondNameEn,
    employee.thirdNameEn,
    employee.familyNameEn,
  ]
    .filter(Boolean)
    .join(' ')
}
