import { db } from '../../../../db'
import { CredentialRepository } from '../repository/credential.repository'

export const CredentialService = {
  getEmployeeCredentials: async (employeeId: string) => {
    return db.transaction(async (tx) => {
      //const [personal, employment, credentials, training, cpd] =
      const [credentials] = await Promise.all([
        CredentialRepository.findByEmployeeId(tx, employeeId),
      ])

      return {
        credentials,
      }
    })
  },
}
