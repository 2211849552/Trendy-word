const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const REQUEST_TIMEOUT_MS = 20000

/** تحويل أخطاء SQL/قاعدة البيانات إلى رسائل مفهومة للمستخدم */
export function sanitizeApiErrorMessage(message) {
  if (!message || typeof message !== 'string') return message

  const lower = message.toLowerCase()

  if (lower.includes('duplicate entry') && lower.includes('phone')) {
    return 'رقم الهاتف مستخدم مسبقاً. استخدمي رقماً آخر.'
  }
  if (lower.includes('duplicate entry') && lower.includes('email')) {
    return 'البريد الإلكتروني مستخدم مسبقاً. استخدمي بريداً آخر.'
  }
  if (lower.includes('sqlstate') || lower.includes('integrity constraint')) {
    return 'تعذّر إتمام العملية. تحققي من البيانات المدخلة (قد يكون الهاتف أو البريد مستخدماً مسبقاً).'
  }

  return message
}

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

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      signal: controller.signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') {
      const error = new Error('انتهت مهلة الاتصال بالخادم. تأكد أن Laravel Backend يعمل على المنفذ 8000.')
      error.status = 0
      throw error
    }
    const error = new Error('تعذّر الاتصال بالخادم. تأكد أن Laravel Backend يعمل.')
    error.status = 0
    throw error
  } finally {
    clearTimeout(timeoutId)
  }

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
    const error = new Error(sanitizeApiErrorMessage(message))
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null

  return response.json()
}
