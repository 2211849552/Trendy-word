import { apiRequest } from './client.js'

// [20] إدارة الإشعارات
// GET /api/notifications
export function getNotifications(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/notifications${query ? `?${query}` : ''}`)
}

// GET /api/notifications/{id}
export function getNotification(id) {
  return apiRequest(`/api/notifications/${encodeURIComponent(String(id))}`)
}

// PATCH /api/notifications/{id}/read
export function markNotificationAsRead(id) {
  return apiRequest(`/api/notifications/${encodeURIComponent(String(id))}/read`, {
    method: 'PATCH',
  })
}

// POST /api/notifications/read-all
export function markAllNotificationsAsRead() {
  return apiRequest('/api/notifications/read-all', {
    method: 'POST',
  })
}

export function extractNotificationList(data) {
  const payload = data?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(data)) return data
  return []
}

export function extractUnreadCount(data) {
  if (data?.unread_count != null) return Number(data.unread_count)
  return extractNotificationList(data).filter((item) => !item.read).length
}

const TYPE_LABELS = {
  info: 'تنبيه',
  warning: 'تحذير',
  critical: 'عاجل',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mapNotificationTypeLabel(type) {
  return TYPE_LABELS[type] ?? TYPE_LABELS.info
}

export function mapNotification(item) {
  const isRead = Boolean(item.read ?? item.read_at)
  const type = item.type ?? 'info'
  const tags = []
  if (!isRead) tags.push('جديد')
  if (type === 'critical') tags.push('عاجل')
  if (type === 'warning') tags.push('مهم')

  return {
    id: item.id,
    title: item.title ?? 'إشعار',
    text: item.body ?? '',
    type,
    typeLabel: mapNotificationTypeLabel(type),
    tags,
    date: formatDate(item.created_at),
    createdAt: item.created_at ?? null,
    isRead,
    data: item.data ?? null,
    actionUrl: item.data?.url ?? item.data?.link ?? item.data?.action_url ?? null,
    raw: item,
  }
}

export function mapNotificationDetail(data) {
  const item = data?.data ?? data
  return mapNotification(item)
}

export function buildNotificationStats(notifications) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    read: notifications.filter((n) => n.isRead).length,
    today: notifications.filter((n) => {
      const created = new Date(n.createdAt ?? n.date)
      return !Number.isNaN(created.getTime()) && created >= todayStart
    }).length,
  }
}
