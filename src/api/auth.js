import { apiRequest } from './client.js'

const AUTH_BASE = '/api/v1/auth'

async function ensureCsrfCookie() {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  await fetch(`${base}/sanctum/csrf-cookie`, { credentials: 'include' })
}

// POST /api/v1/auth/admin/login
export function adminLogin(body) {
  return apiRequest(`${AUTH_BASE}/admin/login`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/v1/auth/logout
export function adminLogout() {
  return apiRequest(`${AUTH_BASE}/logout`, { method: 'POST' })
}

// POST /api/v1/auth/password/forgot — طلب رمز استعادة كلمة المرور
export async function forgotPassword(body) {
  await ensureCsrfCookie()
  return apiRequest(`${AUTH_BASE}/password/forgot`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/v1/auth/password/verify-otp — التحقق من رمز OTP
export async function verifyResetOtp(body) {
  await ensureCsrfCookie()
  return apiRequest(`${AUTH_BASE}/password/verify-otp`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/v1/auth/password/reset — تعيين كلمة مرور جديدة
export async function resetPassword(body) {
  await ensureCsrfCookie()
  return apiRequest(`${AUTH_BASE}/password/reset`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function authErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة أو الرمز غير صالح.'
  if (err?.status === 403) return 'ليس لديك صلاحية لهذه العملية.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 404) return 'مسار الاستعادة غير موجود على الخادم.'
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}
