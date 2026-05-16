import { useState } from 'react'
import { Bell, CheckCircle2, AlertCircle, Eye, Check, Package, Store, AlertTriangle } from 'lucide-react'

const initialNotifications = [
  {
    id: 1,
    title: 'طلب جديد',
    text: 'لديك طلب جديد من علي حسن بقيمة 360 د.ل',
    type: 'order',
    tags: ['عاجل', 'جديد'],
    date: '11:30 2026-05-02',
    isRead: false
  },
  {
    id: 2,
    title: 'طلب انضمام متجر',
    text: 'طلب انضمام جديد من متجر "الأثاث المنزلي"',
    type: 'store',
    tags: ['مهم', 'جديد'],
    date: '10:15 2026-05-02',
    isRead: false
  },
  {
    id: 3,
    title: 'شكوى جديدة',
    text: 'شكوى جديدة من منى سالم بخصوص الطلب ORD-002',
    type: 'dispute',
    tags: ['مهم'],
    date: '09:00 2026-05-01',
    isRead: true
  }
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const totalCount = notifications.length
  const unreadCount = notifications.filter(n => !n.isRead).length
  const readCount = notifications.filter(n => n.isRead).length
  // For demo purposes
  const todayCount = 0

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package className="size-6 text-orange-400" />
      case 'store': return <Store className="size-6 text-blue-500" />
      case 'dispute': return <AlertTriangle className="size-6 text-amber-500" />
      default: return <Bell className="size-6 text-slate-500" />
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-slate-900">إدارة الإشعارات</h1>
          <p className="text-sm text-slate-500">مركز التنبيهات والإشعارات</p>
        </div>
        <button onClick={markAllAsRead} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm">
          <CheckCircle2 className="size-4" />
          تحديد الكل كمقروء
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Bell className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي الإشعارات</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalCount}</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">غير مقروءة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{unreadCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">مقروءة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{readCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">إشعارات اليوم</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{todayCount}</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
              notif.isRead ? 'bg-white border-slate-200 opacity-75' : 'bg-blue-50/30 border-blue-200 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold text-lg ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && notif.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 rounded text-xs font-bold ${
                      tag === 'عاجل' ? 'bg-red-100 text-red-700' :
                      tag === 'جديد' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className={`${notif.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                  {notif.text}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Bell className="size-3" />
                    {notif.date}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    notif.type === 'order' ? 'bg-slate-100 text-slate-500' : 
                    notif.type === 'store' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {notif.type === 'order' ? 'طلب جديد' : notif.type === 'store' ? 'تحديث' : 'شكوى'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center mt-4 sm:mt-0">
              {!notif.isRead && (
                <button 
                  onClick={() => markAsRead(notif.id)}
                  className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                  title="تحديد كمقروء"
                >
                  <Check className="size-4" />
                </button>
              )}
              <button 
                className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                title="عرض التفاصيل"
              >
                <Eye className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Bell className="size-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">لا توجد إشعارات حالياً</p>
          </div>
        )}
      </div>

    </div>
  )
}
