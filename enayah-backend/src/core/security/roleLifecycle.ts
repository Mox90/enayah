import { db } from '../../db'
import { userRoles } from '../../db/schema'
import { eq } from 'drizzle-orm'
import {
  getCurrentPosition,
  getRolesByPosition,
} from '../../modules/auth/repository/auth.repository'
import { resolveScope } from './roleResolver'

export const syncUserRoles = async (
  employeeId: string,
  userId: string,
): Promise<void> => {
  await db.transaction(async (tx) => {
    await tx
      .update(userRoles)
      .set({ isActive: false })
      .where(eq(userRoles.userId, userId))

    const position = await getCurrentPosition(employeeId)

    if (!position.length || !position[0]?.positionId) return

    const positionId = position[0].positionId
    const departmentId = position[0].departmentId

    const roles = await getRolesByPosition(positionId)

    for (const r of roles) {
      const scope = await resolveScope(r.roleId)

      await tx.insert(userRoles).values({
        userId,
        roleId: r.roleId,
        departmentId: scope === 'department' ? departmentId : null,
        scope,
        isActive: true,
      })
    }
  })
}
