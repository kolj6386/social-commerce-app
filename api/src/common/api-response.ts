export class ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial)
  }
}
