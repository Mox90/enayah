import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      localStorage.setItem('accessToken', response.data.accessToken)
      originalRequest.headers['Authorization'] =
        `Bearer ${response.data.accessToken}`
      return api(originalRequest)
    }
    return Promise.reject(error)
  },
)
