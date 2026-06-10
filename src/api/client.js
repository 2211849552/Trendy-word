const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiRequest(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const hasBody = options.body != null && options.body !== ''
  if (hasBody && !headers['Content-Type'] && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const token = localStorage.getItem('auth_token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = `API error: ${response.status}`
    try {
      const body = await response.json()
      message = body?.message ?? body?.error ?? message
      if (body?.errors) {
        const first = Object.values(body.errors).flat()[0]
        if (first) message = first
      }
    } catch {
      // ignore non-JSON error bodies
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null

  return response.json()
}
