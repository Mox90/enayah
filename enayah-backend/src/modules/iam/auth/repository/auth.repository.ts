import { ca } from 'zod/locales'
import { db } from '../../../../db'
import {
  appointments,
  employees,
  employments,
  //jobAssignments,
  permissions,
  positionRoles,
  roleLevels,
  rolePermissions,
  roles,
  userRoles,
  users,
} from '../../../../db/schema'
import { and, desc, eq, gte, inArray, isNull, lte, or } from 'drizzle-orm'

export const findUserByEmail = (email: string) =>
  db.query.users.findFirst({
    where: eq(users.email, email),
  })

export const findUserById = (id: string) =>
  db.query.users.findFirst({
    where: eq(users.id, id),
  })

export const findUserByEmailOrUsername = async (
  email: string,
  username: string,
) => {
  return db.query.users.findFirst({
    where: or(eq(users.email, email), eq(users.username, username)),
  })
}

export interface PositionResult {
  positionId: string | null
  departmentId: string | null
}

export const findUserCredentialsByUsername = async (username: string) => {
  /*return db.query.users.findFirst({
    where: eq(users.username, username),
    with: {
      employee: true,
      userRoles: {
        where: eq(userRoles.isActive, true),
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })*/
  return db.query.users.findFirst({
    where: eq(users.username, username),
  })
}

export const findAuthenticatedUserById = async (id: string) => {
  return db.query.users.findFirst({
    where: eq(users.id, id),

    with: {
      employee: true,

      userRoles: {
        where: eq(userRoles.isActive, true),

        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
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
      //console.log('🔥 Creating user with:', data)
      const [user] = await tx.insert(users).values(data).returning({
        id: users.id,
        //email: users.email,
        //username: users.username,
        //employeeId: users.employeeId,
      })

      //console.log('✅ User created:', user)

      if (!user) throw new Error('User creation failed')

      const defaultRole = await tx.query.roles.findFirst({
        where: eq(roles.name, 'EMPLOYEE'),
      })

      //console.log('🔍 Default role:', defaultRole)

      if (!defaultRole) throw new Error('Default role not found')

      await tx.insert(userRoles).values({
        userId: user.id,
        roleId: defaultRole.id,
      })

      /*const fullUser = await tx.query.users.findFirst({
        where: eq(users.id, user.id),

        with: {
          employee: true,

          userRoles: {
            where: eq(userRoles.isActive, true),

            with: {
              role: {
                with: {
                  rolePermissions: {
                    with: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!fullUser) {
        throw new Error('Failed to load created user')
      }

      console.log('✅ Role assigned')*/

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
    .select({ code: permissions.code })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, roleIds))

  return result.map((row) => row.code)
}

export const getRoles = async (userId: string) => {
  return db.transaction(async (tx) => {
    const roles = await tx.query.userRoles.findMany({
      where: and(eq(userRoles.userId, userId), eq(userRoles.isActive, true)),
    })

    return roles
  })
}

export interface PositionResult {
  positionId: string | null
  departmentId: string | null
}

export const getCurrentPosition = async (
  employeeId: string,
): Promise<PositionResult[]> => {
  const today = new Date().toISOString().split('T')[0]!

  return db
    .select({
      positionId: appointments.actualPositionId,
      departmentId: appointments.actualDepartmentId,
    })
    .from(employees)
    .innerJoin(employments, eq(employments.employeeId, employees.id))
    .innerJoin(appointments, eq(appointments.employmentId, employments.id))
    .where(
      and(
        eq(employees.id, employeeId),

        // Employee record must be active.
        eq(employees.isDeleted, false),
        isNull(employees.deletedAt),

        // Employment must currently be active.
        eq(employments.isDeleted, false),
        isNull(employments.deletedAt),
        eq(employments.status, 'active'),
        lte(employments.startDate, today),
        or(isNull(employments.endDate), gte(employments.endDate, today)),

        // Appointment must currently be active.
        eq(appointments.isDeleted, false),
        isNull(appointments.deletedAt),
        lte(appointments.startDate, today),
        or(isNull(appointments.endDate), gte(appointments.endDate, today)),
      ),
    )
    .orderBy(desc(appointments.startDate))
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
