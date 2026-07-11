const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export type PredictionPayload = {
  produceType: string
  temperature: number
  humidity: number
  ethylene: number
  storageDuration: number
}

export const api = {
  dashboard: () => request('/dashboard'),
  inventory: () => request('/inventory'),
  warehouses: () => request('/warehouses'),
  alerts: () => request('/alerts'),
  reports: () => request('/reports'),
  predict: (payload: PredictionPayload) => request('/predict', { method: 'POST', body: payload }),
  resolveAlert: (id: string) => request(`/alerts/${id}/resolve`, { method: 'POST' }),
}
