export type UserRole = 'user' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

export type AuthResponse = {
  user: User
  accessToken: string
}
