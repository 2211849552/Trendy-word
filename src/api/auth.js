import { apiRequest } from './client.js'

const AUTH_BASE = '/api/v1/auth'

let passwordResetSessionReady = false

async function ensureCsrfCookie() {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  await fetch(`${base}/sanctum/csrf-cookie`, { credentials: 'include' })
}

/** تهيئة جلسة Laravel مرة واحدة لمسار استعادة كلمة المرور (Session + Cache) */
export async function beginPasswordResetSession() {
  if (passwordResetSessionReady) return
  await ensureCsrfCookie()
  passwordResetSessionReady = true
}

export function endPasswordResetSession() {
  passwordResetSessionReady = false
}

async function passwordResetRequest(path, body) {
  await beginPasswordResetSession()
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
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

// POST /api/v1/auth/password/forgot
export async function forgotPassword(body) {
  return passwordResetRequest(`${AUTH_BASE}/password/forgot`, body)
}

// POST /api/v1/auth/password/verify-otp
export async function verifyResetOtp(body) {
  return passwordResetRequest(`${AUTH_BASE}/password/verify-otp`, body)
}

// POST /api/v1/auth/password/reset — يعتمد على نفس جلسة verify-otp
export async function resetPassword(body) {
  return passwordResetRequest(`${AUTH_BASE}/password/reset`, {
    password: body.password,
    password_confirmation: body.password_confirmation ?? body.password,
  })
}

export function authErrorMessage(err, fallback) {
  const msg = err?.message ?? ''
  if (
    msg.includes('انتهت صلاحية جلسة') ||
    msg.includes('session') ||
    msg.includes('expired')
  ) {
    return 'انتهت صلاحية جلسة إعادة التعيين. أعدي الخطوات من البداية (إرسال رمز جديد).'
  }
  if (err?.status === 401) return 'انتهت الجلسة أو الرمز غير صالح.'
  if (err?.status === 403) return 'ليس لديك صلاحية لهذه العملية.'
  if (err?.status === 422) return msg || fallback
  if (err?.status === 404) return 'مسار الاستعادة غير موجود على الخادم.'
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return msg || fallback
}
