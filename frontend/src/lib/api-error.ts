import axios from 'axios'

type ApiErrorBody = {
  status?: string
  message?: string
  errors?: { field: string; message: string }[]
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'No se pudo completar la solicitud'
  }

  const body = error.response?.data as ApiErrorBody | undefined

  if (body?.errors && body.errors.length > 0) {
    return body.errors.map((item) => item.message).join('. ')
  }

  return body?.message ?? 'No se pudo completar la solicitud'
}
