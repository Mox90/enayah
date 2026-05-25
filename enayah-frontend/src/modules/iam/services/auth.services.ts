import { api } from '../../../lib/api/client'

export async function loginRequest(data: {
  username: string
  password: string
}) {
  const response = await api.post('/iam/auth/login', data)

  return response.data
}

export async function meRequest() {
  const response = await api.get('/iam/auth/me')

  return response.data
}

export async function logoutRequest() {
  const response = await api.post('/iam/auth/logout')

  return response.data
}
