import { ca } from 'zod/locales'
import { db } from '../../../../db'
import {
  employees,
  employments,
  jobAssignments,
  permissions,
  positionRoles,
  roleLevels,
  rolePermissions,
  roles,
  userRoles,
  users,
} from '../../../../db/schema'
import { and, eq, inArray, isNull, or } from 'drizzle-orm'
import e from 'express'

export const findUserByEmail = (email: string) =>
  db.query.users.findFirst({
    where: eq(users.email, email),
  })

export const findUserByEmailOrUsername = async (
  email: string,
  username: string,
) => {
  return db.query.users.findFirst({
    where: or(eq(users.email, email), eq(users.username, username)),
  })
}

export const findUserByUsername = async (username: string) => {
  return db.query.users.findFirst({
    where: eq(users.username, username),
  })
}

export const createUserWithRole = async (data: {
  email: string
  username: string
  passwordHash: string
  employeeId: string
}) => {
  return db.transaction(async (tx) => {
    try {
      console.log('🔥 Creating user with:', data)

      const [user] = await tx.insert(users).values(data).returning({
        id: users.id,
        email: users.email,
        username: users.username,
        employeeId: users.employeeId,
      })

      console.log('✅ User created:', user)

      if (!user) throw new Error('User creation failed')

      const defaultRole = await tx.query.roles.findFirst({
        where: eq(roles.name, 'EMPLOYEE'),
      })

      console.log('🔍 Default role:', defaultRole)

      if (!defaultRole) throw new Error('Default role not found')

      await tx.insert(userRoles).values({
        userId: user.id,
        roleId: defaultRole.id,
      })

      console.log('✅ Role assigned')

      return user
    } catch (error) {
      console.error('ERROR in createUserWithRole:', error)
      throw error
    }
  })
}

export const getPermissionsByRoleIds = async (roleIds: string[]) => {
  if (roleIds.length === 0) return []

  const result = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds))

  return result.map((row) => row.name)
}

export const getRoles = async (userId: string) => {
  return db.transaction(async (tx) => {
    const roles = await tx.query.userRoles.findMany({
      where: and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)),
    })

    return roles
  })
}

/*export const getCurrentPosition = async (employeeId: string) => {
  return db
    .select({
      positionId: jobAssignments.positionId,
      departmentId: jobAssignments.departmentId,
    })
    .from(employees)
    .innerJoin(employments, eq(employments.employeeId, employees.id))
    .innerJoin(jobAssignments, eq(jobAssignments.employmentId, employments.id))
    .where(and(eq(employees.id, employeeId), isNull(jobAssignments.endDate)))
    .limit(1)
}*/

export interface PositionResult {
  positionId: string | null
  departmentId: string | null
}

export const getCurrentPosition = async (
  employeeId: string,
): Promise<PositionResult[]> => {
  return db
    .select({
      positionId: jobAssignments.positionId,
      departmentId: jobAssignments.departmentId,
    })
    .from(employees)
    .innerJoin(employments, eq(employments.employeeId, employees.id))
    .innerJoin(jobAssignments, eq(jobAssignments.employmentId, employments.id))
    .where(and(eq(employees.id, employeeId), isNull(jobAssignments.endDate)))
    .limit(1)
}

// ✅ EXPORT THIS
export const getRolesByPosition = async (positionId: string) => {
  return db
    .select({
      roleId: positionRoles.roleId,
    })
    .from(positionRoles)
    .where(eq(positionRoles.positionId, positionId))
}

// ✅ EXPORT THIS
export const getRoleLevel = async (roleId: string) => {
  const result = await db.query.roleLevels.findFirst({
    where: eq(roleLevels.roleId, roleId),
  })

  return result?.level ?? 999
}
