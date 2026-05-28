import axios from 'axios'

let refreshPromise: Promise<string> | null = null

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/iam/auth/refresh`,
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
