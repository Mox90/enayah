// enayah-frontend/src/modules/iam/services/auth-services.ts

import { API_ENDPOINTS } from '@/lib/api/endpoints'
import { api } from '../../../lib/api/client'

export async function loginRequest(data: {
  username: string
  password: string
}) {
  const response = await api.post(API_ENDPOINTS.iam.login, data)
  return response.data
}

export async function meRequest() {
  const response = await api.get(API_ENDPOINTS.iam.me)
  return response.data
}

export async function logoutRequest() {
  const response = await api.post(API_ENDPOINTS.iam.logout)
  return response.data
}

export async function signupRequest(data: {
  username: string
  password: string
  email: string
  employeeNumber: string
}) {
  const response = await api.post(API_ENDPOINTS.iam.signup, data)
  return response.data
}
