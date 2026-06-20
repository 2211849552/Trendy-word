import { useState, useEffect } from 'react'
import {
  adminLogin,
  authErrorMessage,
  beginPasswordResetSession,
  endPasswordResetSession,
  extractAuthToken,
  extractLoginUser,
  forgotPassword,
  loginErrorMessage,
  resetPassword,
  verifyResetOtp,
} from '../api/auth.js'

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
      const token = extractAuthToken(data)
      if (token) {
        localStorage.setItem('auth_token', token)
        onSuccess?.(data)
      } else {
        setError('لم يتم استلام التوكن من الخادم.')
      }
    } catch (err) {
      setError(loginErrorMessage(err))
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

function PasswordResetFlow({ onBack }) {
  const [step, setStep] = useState('forgot')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  useEffect(() => {
    beginPasswordResetSession().catch(() => {
      setError('تعذّر تهيئة جلسة الاستعادة. تأكد أن Laravel Backend يعمل.')
    })
    return () => endPasswordResetSession()
  }, [])

  const handleForgot = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني.')
      return
    }

    setLoading(true)
    try {
      await forgotPassword({ email: email.trim() })
      setInfo('إذا كان البريد مسجّلاً لدينا، ستصلك رسالة برمز التحقق.')
      setStep('otp')
    } catch (err) {
      setError(authErrorMessage(err, 'تعذّر إرسال رمز الاستعادة.'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!otp.trim()) {
      setError('يرجى إدخال رمز التحقق.')
      return
    }

    setLoading(true)
    try {
      await verifyResetOtp({ email: email.trim(), otp: otp.trim() })
      setOtpVerified(true)
      setInfo('تم التحقق من الرمز. أدخلي كلمة المرور الجديدة الآن.')
      setStep('reset')
    } catch (err) {
      setError(authErrorMessage(err, 'رمز التحقق غير صحيح أو منتهي الصلاحية.'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
      return
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.')
      return
    }

    setLoading(true)
    if (!otpVerified) {
      setError('يرجى التحقق من رمز OTP أولاً.')
      setStep('otp')
      return
    }

    try {
      await resetPassword({
        password,
        password_confirmation: confirmPassword,
      })
      setDone(true)
      setInfo('تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.')
    } catch (err) {
      setError(authErrorMessage(err, 'تعذّر تعيين كلمة المرور الجديدة.'))
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    forgot: 'نسيت كلمة المرور',
    otp: 'التحقق من الرمز',
    reset: 'كلمة مرور جديدة',
  }

  const subtitles = {
    forgot: 'أدخلي بريدك الإلكتروني وسنرسل لك رمز تحقق لاستعادة كلمة المرور.',
    otp: 'أدخلي رمز التحقق المرسل إلى بريدك الإلكتروني.',
    reset: 'اختر كلمة مرور جديدة لحسابك.',
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">{titles[step]}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{subtitles[step]}</p>
      </div>

      {info ? (
        <p className="mb-4 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3 py-3 text-center text-sm text-brand-200">
          {info}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {step === 'forgot' ? (
        <form onSubmit={handleForgot} className="flex flex-col gap-5">
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
              disabled={loading}
              className="input-brand disabled:opacity-60"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-lg w-full disabled:opacity-60">
            {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
          </button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
          <div>
            <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-white/80">
              البريد الإلكتروني
            </label>
            <input
              id="reset-email"
              type="email"
              dir="ltr"
              value={email}
              readOnly
              className="input-brand opacity-70"
            />
          </div>
          <div>
            <label htmlFor="reset-otp" className="mb-2 block text-sm font-medium text-white/80">
              رمز التحقق
            </label>
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              dir="ltr"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              className="input-brand font-mono disabled:opacity-60"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-lg w-full disabled:opacity-60">
            {loading ? 'جاري التحقق...' : 'تحقق من الرمز'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('forgot')
              setOtp('')
              setOtpVerified(false)
              setError('')
              setInfo('')
            }}
            className="text-sm text-white/55 transition hover:text-white"
          >
            إعادة إرسال الرمز
          </button>
        </form>
      ) : null}

      {step === 'reset' && !done ? (
        <form onSubmit={handleReset} className="flex flex-col gap-5">
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-white/80">
              كلمة المرور الجديدة
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              placeholder="8 أحرف على الأقل"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="input-brand disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-white/80">
              تأكيد كلمة المرور
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              placeholder="أعد إدخال كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="input-brand disabled:opacity-60"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary-lg w-full disabled:opacity-60">
            {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>
        </form>
      ) : null}

      <button
        type="button"
        onClick={() => {
          endPasswordResetSession()
          onBack()
        }}
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
    <div className="auth-layout flex min-h-dvh items-center justify-center bg-brand-50 px-4 py-10" dir="rtl">
      <div className="glass-card w-full max-w-md p-8 sm:p-10">
        {view === 'login' ? (
          <LoginForm
            onForgotPassword={() => setView('forgot')}
            onSuccess={onLoginSuccess}
          />
        ) : (
          <PasswordResetFlow onBack={() => setView('login')} />
        )}
      </div>
    </div>
  )
}
