import { apiRequest, resolveApiBase, sanitizeApiErrorMessage } from './client.js'

const AUTH_BASE = '/api/v1/auth'

let passwordResetSessionReady = false

async function ensureCsrfCookie() {
  const base = resolveApiBase()
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

function sanitizeDbConnectionMessage(message) {
  const sanitized = sanitizeApiErrorMessage(message)
  return sanitized !== message ? sanitized : null
}

function toFormBody(body) {
  const form = new URLSearchParams()
  Object.entries(body ?? {}).forEach(([key, value]) => {
    if (value != null && value !== '') form.set(key, String(value))
  })
  return form.toString()
}

function isMissingLoginFieldsError(err) {
  const message = String(err?.message ?? '').toLowerCase()
  return err?.status === 422 && (
    message.includes('email field is required')
    || message.includes('password field is required')
    || message.includes('البريد') && message.includes('مطلوب')
  )
}

export function extractAuthToken(data) {
  return data?.token ?? data?.access_token ?? data?.data?.token ?? null
}

export function extractLoginUser(data) {
  return data?.user ?? data?.data?.user ?? data?.data ?? null
}

async function postAuth(path, body) {
  try {
    return await apiRequest(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toFormBody(body),
    })
  } catch (err) {
    if (!isMissingLoginFieldsError(err)) throw err
    return apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

async function passwordResetRequest(path, body) {
  await beginPasswordResetSession()
  return postAuth(path, body)
}

// POST /api/v1/auth/admin/login
export function adminLogin(body) {
  return postAuth(`${AUTH_BASE}/admin/login`, body)
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

export function isUnauthorizedRoleError(err) {
  const msg = String(err?.message ?? '').toLowerCase()
  return (
    err?.status === 403
    || msg.includes('unauthorized_role')
    || msg.includes('auth.unauthorized_role')
    || msg.includes('غير مخول')
    || msg.includes('غير مصر')
  )
}

export function isInvalidCredentialsError(err) {
  const msg = String(err?.message ?? '').toLowerCase()
  return (
    err?.status === 401
    || msg.includes('credentials do not match')
    || msg.includes('بيانات الدخول غير صحيحة')
    || msg.includes('invalid credentials')
    || msg.includes('incorrect email or password')
  )
}

export function loginErrorMessage(err, fallback = 'تحقق من البريد الالكتروني او كلمة المرور واعد المحاولة مجددا') {
  const msg = err?.message ?? ''
  if (isUnauthorizedRoleError(err)) {
    return 'عذراً، حسابك غير مخوّل للوصول إلى لوحة الإدارة. يرجى التحقق من بياناتك أو التواصل مع الإدارة.'
  }
  if (isInvalidCredentialsError(err)) {
    return 'تحقق من البريد الالكتروني او كلمة المرور واعد المحاولة مجددا'
  }
  if (err?.status === 404) return 'رابط تسجيل الدخول غير موجود (404). تأكد من API.'
  if (err?.status === 422) {
    if (isInvalidCredentialsError(err)) {
      return 'تحقق من البريد الالكتروني او كلمة المرور واعد المحاولة مجددا'
    }
    return msg || 'البيانات المدخلة غير صالحة.'
  }
  if (err?.status === 401) return fallback
  if (err?.status === 500) {
    const dbHint = sanitizeDbConnectionMessage(msg)
    if (dbHint) return dbHint
    if (msg && !msg.startsWith('API error')) return msg
    return 'خطأ في الخادم (500). جرب لاحقاً.'
  }
  if (err?.status === 0 || err?.status == null) {
    return 'تعذّر الاتصال بالخادم. تأكد أن Laravel Backend يعمل على http://127.0.0.1:8000 (php artisan serve) وأن MySQL شغّال.'
  }
  return msg || fallback
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
