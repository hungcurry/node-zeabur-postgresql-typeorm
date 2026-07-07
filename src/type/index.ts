type ApiResponse<T> = {
  status: 'success' | 'error'
  data?: T
  message?: string
}

type TTodo = {
  id: string
  title: string
}

type TUser = {
  name: string
  age: number
  role: string
  createdAt?: Date
  updatedAt?: Date
}

type TRole = {
  name: string
  description: string
  is_system: boolean
  createdAt?: Date
  updatedAt?: Date
}

type TTokenPayload = {
  userId: string
  role: string
}

export type { ApiResponse, TTodo, TUser, TRole, TTokenPayload }
