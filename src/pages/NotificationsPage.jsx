import { useState, useEffect, useCallback } from 'react'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  Package,
  Store,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react'
import {
  getNotifications,
  getNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  extractNotificationList,
  mapNotification,
  mapNotificationDetail,
  buildNotificationStats,
  extractUnreadCountForUser,
  filterNotificationsForUser,
  shouldShowNotificationToUser,
} from '../api/adminNotifications.js'
import { canViewStoreJoinRequestNotifications } from '../api/user.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 404) {
    return 'خدمة الإشعارات غير مفعّلة على الخادم حالياً. (مستثناة حسب إعداد المشروع)'
  }
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض الإشعارات.'
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

function getIcon(type) {
  switch (type) {
    case 'critical': return <AlertCircle className="size-6 text-red-400" />
    case 'warning': return <AlertTriangle className="size-6 text-amber-500" />
    case 'order': return <Package className="size-6 text-orange-400" />
    case 'store': return <Store className="size-6 text-brand-500" />
    default: return <Bell className="size-6 text-white/60" />
  }
}

export function NotificationsPage({ onNavigate, setUnreadCount, currentUser }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const loadNotifications = useCallback(async () => {
    const data = await getNotifications({ per_page: 100 })
    const list = filterNotificationsForUser(
      extractNotificationList(data).map(mapNotification),
      currentUser,
    )
    setNotifications(list)
    if (typeof setUnreadCount === 'function') {
      setUnreadCount(extractUnreadCountForUser(data, currentUser))
    }
    return list
  }, [setUnreadCount, currentUser])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadNotifications()
      } catch (err) {
        setNotifications([])
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل الإشعارات.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [loadNotifications])

  useEffect(() => {
    const handleNewNotification = (event) => {
      const rawNotif = event.detail
      if (!rawNotif) return

      if (!shouldShowNotificationToUser(rawNotif, currentUser)) {
        return
      }

      const mapped = mapNotification(rawNotif)
      setNotifications((prev) => {
        // التحقق من عدم تكرار الإشعار
        if (prev.some((n) => n.id === mapped.id)) return prev
        return [mapped, ...prev]
      })
    }

    window.addEventListener('admin_new_notification', handleNewNotification)
    return () => {
      window.removeEventListener('admin_new_notification', handleNewNotification)
    }
  }, [currentUser])

  const stats = buildNotificationStats(notifications)

  const markAsRead = async (id) => {
    const target = notifications.find((n) => n.id === id)
    if (!target || target.isRead) return

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    if (typeof setUnreadCount === 'function') {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    try {
      await markNotificationAsRead(id)
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)))
      if (typeof setUnreadCount === 'function') {
        setUnreadCount((prev) => prev + 1)
      }
    }
  }

  const markAllAsRead = async () => {
    if (!stats.unread) return

    setActionLoading(true)
    setActionMessage('')
    const previous = notifications
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    if (typeof setUnreadCount === 'function') {
      setUnreadCount(0)
    }

    try {
      await markAllNotificationsAsRead()
      setActionMessage('تم تحديد جميع الإشعارات كمقروءة.')
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      setNotifications(previous)
      setActionMessage(apiErrorMessage(err, 'تعذّر تحديد الإشعارات كمقروءة.'))
      setTimeout(() => setActionMessage(''), 4000)
      if (typeof setUnreadCount === 'function') {
        setUnreadCount(previous.filter((n) => !n.isRead).length)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const openDetails = async (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id).catch(() => {})
    }

    const eventType = notif.data?.event ?? ''
    const data = notif.data ?? {}

    if (eventType === 'new_complaint' || notif.title === 'تذكرة شكوى جديدة') {
      if (onNavigate && data.ticket_id) {
        onNavigate('disputes', { ticket_id: data.ticket_id })
        return
      }
    }

    if (eventType === 'new_store_join_request' || notif.title === 'طلب انضمام متجر جديد') {
      if (onNavigate && data.store_join_request_id && canViewStoreJoinRequestNotifications(currentUser)) {
        onNavigate('stores', { store_join_request_id: data.store_join_request_id })
        return
      }
    }

    if (eventType === 'driver_support_message' || notif.title === 'رسالة جديدة من السائق في شات الدعم') {
      if (onNavigate && data.driver_id) {
        onNavigate('drivers', { driver_id: data.driver_id })
        return
      }
    }

    setSelectedNotif(notif)
    setDetailLoading(true)
    try {
      const apiData = await getNotification(notif.id)
      const detail = mapNotificationDetail(apiData)
      setSelectedNotif(detail)
    } catch (err) {
      setActionMessage(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الإشعار.'))
      setTimeout(() => setActionMessage(''), 3000)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 animate-in fade-in duration-500">

      {selectedNotif ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedNotif(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-200 border border-white/10 shadow-premium">
                  {getIcon(selectedNotif.type)}
                </div>
                <h2 className="text-lg font-bold text-white">تفاصيل الإشعار</h2>
              </div>
              <button type="button" onClick={() => setSelectedNotif(null)} className="rounded-xl p-2 text-white/50 hover:bg-brand-300 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-white/60">
                  <Loader2 className="size-5 animate-spin" />
                  <span>جاري تحميل التفاصيل...</span>
                </div>
              ) : (
              <>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{selectedNotif.title}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-white/50 font-mono flex items-center gap-1">
                    <Bell className="size-3" />
                    {selectedNotif.date}
                  </span>
                  <span className="rounded-full bg-brand-300 px-3 py-0.5 text-xs font-bold text-white/70">
                    {selectedNotif.typeLabel}
                  </span>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                    selectedNotif.isRead ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedNotif.isRead ? 'مقروء' : 'غير مقروء'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-brand-300 p-5 border border-white/5 leading-relaxed text-white/80 whitespace-pre-wrap">
                {selectedNotif.text}
              </div>

              {selectedNotif.type === 'critical' || selectedNotif.type === 'warning' ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-3 border border-amber-100">
                  <AlertTriangle className="size-5 text-amber-500 shrink-0" />
                  <p className="text-xs font-medium text-amber-800">
                    هذا إشعار {selectedNotif.type === 'critical' ? 'عاجل' : 'مهم'}. يرجى مراجعة التفاصيل واتخاذ الإجراء المناسب.
                  </p>
                </div>
              ) : null}

              {selectedNotif.actionUrl ? (
                <a
                  href={selectedNotif.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-950"
                >
                  اتخاذ إجراء
                </a>
              ) : null}
              </>
              )}
            </div>
            <div className="flex gap-3 p-5 bg-brand-300 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-premium hover:bg-slate-800 transition-all active:scale-95"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">إدارة الإشعارات</h1>
          <p className="text-sm text-white/60">مركز التنبيهات والإشعارات</p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={actionLoading || stats.unread === 0}
          className="flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-950 transition-colors shadow-premium disabled:opacity-60"
        >
          {actionLoading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          تحديد الكل كمقروء
        </button>
      </div>

      {actionMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <Bell className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الإشعارات</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.total}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">غير مقروءة</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.unread}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">مقروءة</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.read}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إشعارات اليوم</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? '...' : stats.today}</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-brand-200 py-16 text-white/60">
            <Loader2 className="size-5 animate-spin" />
            <span>جاري تحميل الإشعارات...</span>
          </div>
        ) : notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
              notif.isRead ? 'bg-brand-200 border-white/10 opacity-75' : 'bg-brand-100/30 border-brand-200 shadow-premium'
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`font-bold text-lg ${notif.isRead ? 'text-white/80' : 'text-white'}`}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && notif.tags.map((tag) => (
                    <span key={tag} className={`px-2 py-0.5 rounded text-xs font-bold ${
                      tag === 'عاجل' ? 'bg-red-100 text-red-700' :
                      tag === 'جديد' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className={`${notif.isRead ? 'text-white/60' : 'text-white/80 font-medium'}`}>
                  {notif.text}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-white/50 font-mono flex items-center gap-1">
                    <Bell className="size-3" />
                    {notif.date}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-300 text-white/60">
                    {notif.typeLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center mt-4 sm:mt-0">
              {!notif.isRead ? (
                <button
                  type="button"
                  onClick={() => markAsRead(notif.id)}
                  className="text-white hover:bg-brand-300 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                  title="تحديد كمقروء"
                >
                  <Check className="size-4" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => openDetails(notif)}
                className="icon-btn-view"
                title="عرض التفاصيل"
              >
                <Eye className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-12 bg-brand-200 rounded-xl border border-white/10">
            <Bell className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-white/60 font-medium">{loadError || 'لا توجد إشعارات حالياً'}</p>
          </div>
        )}
      </div>

    </div>
  )
}
