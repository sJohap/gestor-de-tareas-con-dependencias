export type UserRole = 'user' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
}

export type AuthResponse = {
  user: User
  accessToken: string
}
