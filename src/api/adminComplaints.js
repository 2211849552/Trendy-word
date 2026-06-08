import { apiRequest } from './client.js'

// [6] إدارة الشكاوى
// GET /api/complaints — بحث وفلترة
export function getComplaints(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/complaints${query ? `?${query}` : ''}`)
}

// GET /api/complaints/{id}
export function getComplaint(id) {
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}`)
}

// PATCH /api/complaints/{id}/status
export function updateComplaintStatus(id, status) {
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// POST /api/complaints/{id}/replies
export function addComplaintReply(id, message) {
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}/replies`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

// POST /api/complaints/{id}/close
export function closeComplaint(id, body = {}) {
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}/close`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/complaints/{id}/financial-action
export function complaintFinancialAction(id, body) {
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}/financial-action`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/complaints/{id}/admin-action
export function complaintAdminAction(id, body) {
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}/admin-action`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function extractComplaintList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

const STATUS_UI = {
  open: 'مفتوحة',
  under_review: 'قيد المراجعة',
  awaiting_reply: 'قيد المراجعة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'مغلقة',
}

const CATEGORY_UI = {
  order_issue: 'استرجاع',
  store_issue: 'بلاغ',
  technical_issue: 'بلاغ',
  general_inquiry: 'نزاع',
}

const STATUS_API = {
  الكل: null,
  مفتوحة: 'open',
  'قيد المراجعة': 'under_review',
  'تم الحل': 'resolved',
  مغلقة: 'closed',
}

const CATEGORY_API = {
  الكل: null,
  استرجاع: 'order_issue',
  بلاغ: 'store_issue',
  نزاع: 'general_inquiry',
}

const STATUS_UPDATE_API = {
  مفتوحة: 'under_review',
  'قيد المراجعة': 'under_review',
  'بانتظار الرد': 'awaiting_reply',
  'تم الحل': 'resolved',
  ملغاة: 'cancelled',
}

export function uiStatusFilterToApi(filter) {
  return STATUS_API[filter] ?? null
}

export function uiCategoryFilterToApi(filter) {
  return CATEGORY_API[filter] ?? null
}

export function uiStatusToApi(statusLabel) {
  return STATUS_UPDATE_API[statusLabel] ?? null
}

export function mapStatusToUi(status) {
  return STATUS_UI[status] ?? status ?? '—'
}

export function mapCategoryToUi(category) {
  return CATEGORY_UI[category] ?? category ?? '—'
}

export function resolveMediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = import.meta.env.VITE_API_BASE_URL || ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function mapAttachments(item) {
  const raw = item.attachments ?? item.media ?? []
  const list = Array.isArray(raw) ? raw : []
  return list.map((file) => ({
    id: file.id,
    url: resolveMediaUrl(file.url),
    name: file.name ?? file.file_name ?? '',
  }))
}

export function mapComplaint(item) {
  const attachments = mapAttachments(item)
  const firstImage = attachments[0]?.url ?? ''
  return {
    id: Number(item.id),
    ticketNumber: item.ticket_number ?? String(item.id),
    displayId: item.ticket_number ? item.ticket_number : `#${item.id}`,
    subject: item.subject ?? '',
    description: item.description ?? item.subject ?? '',
    customer: item.user?.name ?? item.order?.customer_name ?? '—',
    customerId: item.user?.id ?? null,
    store: item.order?.store_name ?? '—',
    orderId: item.order?.order_number ?? (item.order_id ? `ORD-${item.order_id}` : '—'),
    orderDbId: item.order?.id ?? item.order_id ?? null,
    date: String(item.created_at ?? '').slice(0, 10),
    status: mapStatusToUi(item.status),
    rawStatus: item.status ?? '',
    type: mapCategoryToUi(item.category),
    rawCategory: item.category ?? '',
    priority: item.priority ?? '',
    resolutionSummary: item.resolution_summary ?? '',
    hasImage: attachments.length > 0,
    imageUrl: firstImage,
    attachments,
    raw: item,
  }
}

export function mapComplaintDetail(data) {
  const item = data?.data ?? data
  return mapComplaint(item)
}

export function buildComplaintStats(disputes) {
  const open = disputes.filter((d) => d.rawStatus === 'open').length
  const review = disputes.filter((d) =>
    ['under_review', 'awaiting_reply'].includes(d.rawStatus),
  ).length
  const resolved = disputes.filter((d) => d.rawStatus === 'resolved').length
  return { open, review, resolved }
}
