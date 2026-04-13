import { getRoleLevel } from '../../modules/auth/repository/auth.repository'

export const resolveScope = async (
  roleId: string,
): Promise<'hospital' | 'department'> => {
  const level = await getRoleLevel(roleId)
  return level <= 2 ? 'hospital' : 'department'
}
