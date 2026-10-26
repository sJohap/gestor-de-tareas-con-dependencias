import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error)
    }

    const config = error.config as RetryConfig | undefined
    const url = config?.url ?? ''
    const skipsRefresh =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')

    if (!config || error.response?.status !== 401 || config._retry || skipsRefresh) {
      return Promise.reject(error)
    }

    config._retry = true
    const auth = useAuthStore()

    try {
      await auth.refreshSession()
    } catch (refreshError) {
      auth.clearSession()
      return Promise.reject(refreshError)
    }

    return api.request(config)
  },
)
