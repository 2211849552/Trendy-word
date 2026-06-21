import { useState, useEffect } from 'react'
import { Bell, AlertCircle, AlertTriangle, X } from 'lucide-react'
import { adminLogout } from './api/auth.js'
import { resolveApiBase } from './api/client.js'
import {
  fetchCurrentUserProfile,
  mapCurrentUser,
  mergeCurrentUser,
  clearPersistedUserRoles,
  canAccessOrderList,
  canAccessDisputes,
  canAccessCustomers,
  canAccessFinance,
  canAccessStaff,
  canAccessCatalog,
  canAccessPlans,
  canAccessMarketing,
  canAccessDrivers,
  canAccessZones,
  canViewStoreJoinRequestNotifications,
  hasStoreManagementAccess,
} from './api/user.js'
import { getNotifications, extractUnreadCountForUser, markNotificationAsRead, shouldShowNotificationToUser } from './api/adminNotifications.js'
import { Sidebar } from './components/Sidebar.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { MarketingPage } from './pages/MarketingPage.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { PlansPage } from './pages/PlansPage.jsx'
import { StoreManagementPage } from './pages/StoreManagementPage.jsx'
import { CategoriesPage } from './pages/CategoriesPage.jsx'
import { DisputesPage } from './pages/DisputesPage.jsx'
import { FinancePage } from './pages/FinancePage.jsx'
import { CustomersPage } from './pages/CustomersPage.jsx'
import { StaffPage } from './pages/StaffPage.jsx'
import { NotificationsPage } from './pages/NotificationsPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { DriversPage } from './pages/DriversPage.jsx'
import { ZonesPage } from './pages/ZonesPage.jsx'

function renderPage(activeNav, activeNavParams, setActiveNavParams, onNavigate, setUnreadCount, currentUser) {
  if (activeNav === 'stores') {
    if (hasStoreManagementAccess(currentUser)) {
      return (
        <StoreManagementPage
          params={activeNavParams}
          setParams={setActiveNavParams}
          currentUser={currentUser}
        />
      )
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة المتاجر مخصصة لمدير النظام ومسؤول المتاجر فقط.</p>
      </div>
    )
  }
  if (activeNav === 'plans') {
    if (canAccessPlans(currentUser)) {
      return <PlansPage currentUser={currentUser} />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة الخطط غير متاحة لدورك الحالي.</p>
      </div>
    )
  }
  if (activeNav === 'marketing') {
    if (canAccessMarketing(currentUser)) {
      return <MarketingPage />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة التسويق والمحتوى مخصصة لمدير النظام ومسؤول العمليات فقط.</p>
      </div>
    )
  }
  if (activeNav === 'catalog') {
    if (canAccessCatalog(currentUser)) {
      return <CategoriesPage />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">هذه الصفحة مخصصة لمدير النظام ومسؤول المتاجر فقط.</p>
      </div>
    )
  }
  if (activeNav === 'disputes') {
    if (canAccessDisputes(currentUser)) {
      return <DisputesPage params={activeNavParams} setParams={setActiveNavParams} />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة الشكاوى والنزاعات غير متاحة لدورك الحالي.</p>
      </div>
    )
  }
  if (activeNav === 'finance') {
    if (canAccessFinance(currentUser)) {
      return <FinancePage />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة الإدارة المالية غير متاحة لدورك الحالي.</p>
      </div>
    )
  }
  if (activeNav === 'customers') {
    if (canAccessCustomers(currentUser)) {
      return <CustomersPage />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة الزبائن غير متاحة لدورك الحالي.</p>
      </div>
    )
  }
  if (activeNav === 'staff') {
    if (canAccessStaff(currentUser)) {
      return <StaffPage />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة الموظفين غير متاحة لدورك الحالي.</p>
      </div>
    )
  }
  if (activeNav === 'notifications') return <NotificationsPage onNavigate={onNavigate} setUnreadCount={setUnreadCount} currentUser={currentUser} />
  if (activeNav === 'orders') {
    if (canAccessOrderList(currentUser)) {
      return <OrdersPage currentUser={currentUser} />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة الطلبات غير متاحة لدورك الحالي.</p>
      </div>
    )
  }
  if (activeNav === 'drivers') {
    if (canAccessDrivers(currentUser)) {
      return <DriversPage params={activeNavParams} setParams={setActiveNavParams} currentUser={currentUser} />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة السائقين مخصصة لمدير النظام ومسؤول العمليات فقط.</p>
      </div>
    )
  }
  if (activeNav === 'zones') {
    if (canAccessZones(currentUser)) {
      return <ZonesPage />
    }
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-brand-200 rounded-2xl shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 animate-bounce">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</h2>
        <p className="text-sm text-white/60">صفحة إدارة المناطق مخصصة لمدير النظام ومسؤول المتاجر فقط.</p>
      </div>
    )
  }
  return <OverviewPage />
}

function Toast({ toast, onClose, onAction }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="size-5" />
          </div>
        )
      case 'warning':
        return (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="size-5" />
          </div>
        )
      default:
        return (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Bell className="size-5" />
          </div>
        )
    }
  }

  const eventType = toast.data?.event ?? ''
  const hasDetailsAction = ['new_complaint', 'new_store_join_request', 'driver_support_message'].includes(eventType) ||
    toast.title === 'تذكرة شكوى جديدة' ||
    toast.title === 'طلب انضمام متجر جديد' ||
    toast.title === 'رسالة جديدة من السائق في شات الدعم'

  return (
    <div
      dir="rtl"
      className="toast-panel flex w-96 max-w-full items-start gap-4 rounded-2xl border border-white/10 bg-brand-950/90 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-left-5 fade-in duration-300"
    >
      {getIcon(toast.type)}
      <div className="flex-1 min-w-0 text-right">
        <h4 className="text-sm font-bold text-white mb-0.5">{toast.title}</h4>
        <p className="text-xs text-white/70 leading-relaxed break-words">{toast.body}</p>
        {hasDetailsAction && (
          <button
            type="button"
            onClick={() => {
              onAction?.(toast)
              onClose()
            }}
            className="mt-2 text-xs font-bold text-brand-300 hover:text-brand-200 transition-colors cursor-pointer"
          >
            عرض التفاصيل
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-white/40 hover:text-white rounded-lg p-1 transition-colors self-start shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export default function App() {
  const [activeNav, setActiveNav] = useState('overview')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [toasts, setToasts] = useState([])
  const [activeNavParams, setActiveNavParams] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null)
      return
    }

    async function fetchUser() {
      try {
        const user = await fetchCurrentUserProfile()
        setCurrentUser((previous) => mergeCurrentUser(previous, user))
      } catch (err) {
        console.error('Failed to fetch current user profile:', err)
      }
    }

    fetchUser()
  }, [isAuthenticated])

  const handlePageNavigate = (page, params = null) => {
    setActiveNav(page)
    setActiveNavParams(params)
  }

  const handleToastAction = (toast) => {
    const eventType = toast.data?.event ?? ''
    const data = toast.data ?? {}

    if (toast.id) {
      markNotificationAsRead(toast.id)
        .then(() => {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        })
        .catch(() => {})
    }

    if (eventType === 'new_complaint' || toast.title === 'تذكرة شكوى جديدة') {
      if (data.ticket_id) {
        handlePageNavigate('disputes', { ticket_id: data.ticket_id })
      }
    } else if (eventType === 'new_store_join_request' || toast.title === 'طلب انضمام متجر جديد') {
      if (data.store_join_request_id && canViewStoreJoinRequestNotifications(currentUser)) {
        handlePageNavigate('stores', { store_join_request_id: data.store_join_request_id })
      }
    } else if (eventType === 'driver_support_message' || toast.title === 'رسالة جديدة من السائق في شات الدعم') {
      if (data.driver_id) {
        handlePageNavigate('drivers', { driver_id: data.driver_id })
      }
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    async function fetchUnread() {
      try {
        const data = await getNotifications({ per_page: 100 })
        setUnreadCount(extractUnreadCountForUser(data, currentUser))
      } catch (err) {
        console.error('Failed to load initial unread notifications count:', err)
      }
    }

    fetchUnread()
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    const apiBase = resolveApiBase()
    const streamUrl = `${apiBase}/api/notifications/stream?token=${encodeURIComponent(token)}`

    const eventSource = new EventSource(streamUrl)

    eventSource.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data)

        if (!shouldShowNotificationToUser(notif, currentUser)) {
          return
        }
        
        setToasts((prev) => [
          ...prev,
          {
            id: notif.id ?? Date.now(),
            title: notif.title,
            body: notif.body,
            type: notif.type,
            data: notif.data,
          },
        ])

        setUnreadCount((prev) => prev + 1)

        const customEvent = new CustomEvent('admin_new_notification', { detail: notif })
        window.dispatchEvent(customEvent)
      } catch (err) {
        console.error('Error parsing notification event data', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err)
    }

    return () => {
      eventSource.close()
    }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    let cancelled = false

    async function verifyAuth() {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        if (!cancelled) {
          setIsAuthenticated(false)
          setAuthChecking(false)
        }
        return
      }

      try {
        const user = await Promise.race([
          fetchCurrentUserProfile(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000),
          ),
        ])
        if (!cancelled) {
          setIsAuthenticated(true)
          setCurrentUser(user)
        }
      } catch {
        localStorage.removeItem('auth_token')
        if (!cancelled) setIsAuthenticated(false)
      } finally {
        if (!cancelled) setAuthChecking(false)
      }
    }

    verifyAuth()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    try {
      await adminLogout()
    } catch {
      // clear local session even if server logout fails
    }
    localStorage.removeItem('auth_token')
    clearPersistedUserRoles()
    setIsAuthenticated(false)
  }

  if (authChecking) {
    return (
      <div className="auth-layout flex min-h-dvh items-center justify-center bg-brand-50" dir="rtl">
        <p className="text-sm text-brand-800/60">جاري التحميل...</p>
      </div>
    )
  }

  const handleLoginSuccess = (loginData) => {
    setIsAuthenticated(true)
    setCurrentUser(mapCurrentUser(loginData))
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="flex h-dvh overflow-hidden flex-row bg-brand-50" dir="ltr">
      <main
        dir="rtl"
        className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-brand-50 px-6 py-8 lg:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="mx-auto max-w-[1600px]">
          {renderPage(activeNav, activeNavParams, setActiveNavParams, handlePageNavigate, setUnreadCount, currentUser)}
        </div>
      </main>

      <Sidebar
        activeId={activeNav}
        onNavigate={setActiveNav}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onLogout={handleLogout}
        unreadNotificationsCount={unreadCount}
        currentUser={currentUser}
      />

      {/* حاوية الإشعارات الفورية المنبثقة (Toast Banners) */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-full">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onAction={handleToastAction}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </div>
  )
}
