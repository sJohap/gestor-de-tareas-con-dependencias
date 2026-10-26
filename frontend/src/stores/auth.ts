import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/lib/api'
import type { AuthResponse, User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  let refreshRequest: Promise<void> | null = null

  function applySession(session: AuthResponse): void {
    user.value = session.user
    accessToken.value = session.accessToken
  }

  function clearSession(): void {
    user.value = null
    accessToken.value = null
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
    applySession(response.data)
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    applySession(response.data)
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      clearSession()
    }
  }

  function refreshSession(): Promise<void> {
    if (!refreshRequest) {
      refreshRequest = api
        .post<AuthResponse>('/auth/refresh')
        .then((response) => {
          applySession(response.data)
        })
        .finally(() => {
          refreshRequest = null
        })
    }

    return refreshRequest
  }

  async function restoreSession(): Promise<void> {
    try {
      await refreshSession()
    } catch {
      clearSession()
    } finally {
      ready.value = true
    }
  }

  return {
    user,
    accessToken,
    ready,
    isAuthenticated,
    register,
    login,
    logout,
    clearSession,
    refreshSession,
    restoreSession,
  }
})
