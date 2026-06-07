import { useState } from 'react'
import { adminLogin } from '../api/auth.js'

function LoginForm({ onForgotPassword, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
      return
    }

    setLoading(true)
    try {
      const data = await adminLogin({ email: email.trim(), password })
      const token = data?.token ?? data?.access_token ?? data?.data?.token
      if (token) {
        localStorage.setItem('auth_token', token)
        onSuccess?.()
      } else {
        setError('لم يتم استلام التوكن من الخادم.')
      }
    } catch (err) {
      console.error('Login error:', err)
      let msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
      if (err.status === 404) msg = 'رابط تسجيل الدخول غير موجود (404). تأكد من API.'
      else if (err.status === 422) msg = 'البيانات المدخلة غير صالحة (422).'
      else if (err.status === 500) msg = 'خطأ في الخادم (500). جرب لاحقاً.'
      else if (err.status === 0 || err.status == null) msg = 'تعذّر الاتصال بالخادم. تأكد أن Backend شغال.'
      else if (err.message) msg = err.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-white/55">أدخل بياناتك للوصول إلى حسابك</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-white/80">
            البريد الإلكتروني
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-brand"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-white/80">
            كلمة المرور
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-brand"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-white/55 transition hover:text-white"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={loading} className="btn-primary-lg w-full disabled:opacity-60">
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
    </>
  )
}

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">استعادة كلمة المرور</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
        </p>
      </div>

      {sent ? (
        <p className="mb-6 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-3 text-center text-sm text-white/80">
          إذا كان البريد مسجّلاً لدينا، ستصلك رسالة برابط الاستعادة قريباً.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-white/80">
            البريد الإلكتروني
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-brand"
          />
        </div>

        <button type="submit" className="btn-primary-lg w-full">
          إرسال رابط الاستعادة
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 w-full text-center text-sm text-white/55 transition hover:text-white"
      >
        العودة لتسجيل الدخول
      </button>
    </>
  )
}

export function LoginPage({ onLoginSuccess }) {
  const [view, setView] = useState('login')

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-50 px-4 py-10" dir="rtl">
      <div className="glass-card w-full max-w-md p-8 sm:p-10">
        {view === 'login' ? (
          <LoginForm
            onForgotPassword={() => setView('forgot')}
            onSuccess={onLoginSuccess}
          />
        ) : (
          <ForgotPasswordForm onBack={() => setView('login')} />
        )}
      </div>
    </div>
  )
}
