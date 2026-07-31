// enayah-frontend/src/api/refresh-token.tsx

import { api } from './client'

let refreshPromise: Promise<string> | null = null

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = api
      .post(
        `/iam/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .then((res) => {
        return res.data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}
