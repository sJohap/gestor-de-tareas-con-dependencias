import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/lib/api'
import type { AuthResponse, User } from '@/types/user'
import { useTaskStore } from '@/stores/tasks'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  let refreshRequest: Promise<void> | null = null
  let restoreRequest: Promise<void> | null = null

  function applySession(session: AuthResponse): void {
    user.value = session.user
    accessToken.value = session.accessToken
  }

  function clearSession(): void {
    user.value = null
    accessToken.value = null
    useTaskStore().clear()
  }

  async function register(name: string, email: string, password: string): Promise<void> {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password })
    applySession(response.data)
  }

  async function login(email: string, password: string): Promise<void> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    applySession(response.data)
  }

  async function updateProfile(name: string, avatarUrl: string | null): Promise<void> {
    const response = await api.patch<{ user: User }>('/auth/me', { name, avatarUrl })
    user.value = response.data.user
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

  function restoreSession(): Promise<void> {
    if (ready.value) {
      return Promise.resolve()
    }

    if (!restoreRequest) {
      restoreRequest = refreshSession()
        .catch(() => {
          clearSession()
        })
        .then(() => {
          ready.value = true
        })
    }

    return restoreRequest
  }

  return {
    user,
    accessToken,
    ready,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    clearSession,
    refreshSession,
    restoreSession,
  }
})
