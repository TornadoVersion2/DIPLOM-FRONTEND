export interface User {
  id: number
  email: string
  name?: string
  roles: Role[]
}

export interface AuthResponse {
  access_token: string
  user: User
}
export enum Role {
  GUEST = 'GUEST',
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}  