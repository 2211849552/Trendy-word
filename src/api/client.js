const LOCAL_VITE_PORTS = new Set(['5173', '5174', '4173'])

/** في التطوير/preview المحلي نستخدم مسارات نسبية عبر proxy Vite — لا اتصال مباشر بـ :8000 */
export function resolveApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location
    const isLocalHost =
      hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]'
    if (isLocalHost && LOCAL_VITE_PORTS.has(port)) {
      return ''
    }
  }

  if (import.meta.env.DEV) return ''

  return configured
}

const API_BASE = resolveApiBase()
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

  if (
    lower.includes('connection: mysql')
    || lower.includes('sqlstate[hy000] [2002]')
    || (lower.includes('mysql') && lower.includes('actively refused'))
    || (lower.includes('target machine actively refused') && lower.includes('3306'))
  ) {
    return 'تعذّر الاتصال بقاعدة البيانات. شغّل MySQL من XAMPP ثم أعد المحاولة.'
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
    const hint = API_BASE
      ? ` (${API_BASE})`
      : ' — شغّلي الواجهة عبر npm run dev وافتحي http://localhost:5173'
    const error = new Error(`تعذّر الاتصال بالخادم${hint}. تأكدي أن Laravel يعمل على http://127.0.0.1:8000`)
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
