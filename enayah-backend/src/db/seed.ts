import { InferInsertModel } from 'drizzle-orm'
import { db } from './client'
import {
  roles,
  roleLevels,
  employees,
  employments,
  jobAssignments,
  positionRoles,
} from './schema'

async function seed() {
  console.log('🌱 Seeding...')

  // 1. ROLES
  const adminRoleResult = await db
    .insert(roles)
    .values({
      name: 'system_admin',
    })
    .returning()

  if (!adminRoleResult.length) {
    throw new Error('Failed to create role')
  }

  const adminRole = adminRoleResult[0]
  if (!adminRole) {
    throw new Error('Failed to resolve admin role')
  }

  // 2. ROLE LEVEL
  await db.insert(roleLevels).values({
    roleId: adminRole.id,
    level: 1,
  })

  // 3. EMPLOYEE
  const employeeResult = await db
    .insert(employees)
    .values({
      employeeNumber: 'EMP001',
      firstNameEn: 'Admin',
      familyNameEn: 'User',
      firstNameAr: 'ادمن',
      familyNameAr: 'يوزر',
    })
    .returning()

  if (!employeeResult.length) {
    throw new Error('Failed to create employee')
  }

  const employee = employeeResult[0]
  if (!employee) {
    throw new Error('Failed to create employee')
  }

  const today = new Date().toISOString().slice(0, 10)

  // 4. EMPLOYMENT
  type NewEmployment = InferInsertModel<typeof employments>

  const employmentResult = await db
    .insert(employments)
    .values({
      employeeId: employee.id,
      hireDate: today,
      startDate: today,
      status: 'active',
    } satisfies NewEmployment)
    .returning()

  if (!employmentResult.length) {
    throw new Error('Failed to create employment')
  }

  const employment = employmentResult[0]
  if (!employment) {
    throw new Error('Failed to resolve employment')
  }

  // 5. JOB ASSIGNMENT (NO DEPT NEEDED YET)
  const assignmentResult = await db
    .insert(jobAssignments)
    .values({
      employmentId: employment.id,
      startDate: new Date(),
      isPrimary: true,
    })
    .returning()

  if (!assignmentResult.length) {
    throw new Error('Failed to create job assignment')
  }

  // 6. POSITION ROLE (OPTIONAL FOR NOW)
  // You can skip if using default role fallback

  console.log('✅ Seed complete')
}

seed().then(() => process.exit())
