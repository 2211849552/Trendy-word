import { apiRequest } from './client.js'
import { resolveMediaUrl } from '../utils/mediaUrl.js'

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

// POST /api/complaints/{id}/close — POST /api/v1/complaints/{id}/close
export function closeComplaint(id, body = {}) {
  const options = { method: 'POST' }
  if (Object.keys(body).length > 0) {
    options.body = JSON.stringify(body)
  }
  return apiRequest(`/api/complaints/${encodeURIComponent(String(id))}/close`, options)
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
  order_issue: 'مشكلة في الطلب',
  store_issue: 'مشكلة مع المتجر',
  technical_issue: 'مشكلة تقنية',
  general_inquiry: 'استفسار عام',
  'مشكلة في الطلب': 'مشكلة في الطلب',
  'مشكلة مع المتجر': 'مشكلة مع المتجر',
  'مشكلة تقنية': 'مشكلة تقنية',
  'استفسار عام': 'استفسار عام',
}

export const COMPLAINT_CATEGORY_FILTER_OPTIONS = [
  { label: 'مشكلة في الطلب', apiValue: 'order_issue' },
  { label: 'مشكلة مع المتجر', apiValue: 'store_issue' },
  { label: 'مشكلة تقنية', apiValue: 'technical_issue' },
  { label: 'استفسار عام', apiValue: 'general_inquiry' },
]

const STATUS_API = {
  الكل: null,
  مفتوحة: 'open',
  'قيد المراجعة': 'under_review',
  'تم الحل': 'resolved',
  مغلقة: 'closed',
}

const CATEGORY_API = {
  الكل: null,
  'مشكلة في الطلب': 'order_issue',
  'مشكلة مع المتجر': 'store_issue',
  'مشكلة تقنية': 'technical_issue',
  'استفسار عام': 'general_inquiry',
}

export function resolveComplaintCategoryRaw(item) {
  const category = item?.category
  if (typeof category === 'string') return category.trim()
  if (category && typeof category === 'object') {
    return String(
      category.value ?? category.slug ?? category.key ?? category.code ?? category.name ?? '',
    ).trim()
  }
  return ''
}

const STATUS_DETAIL_UI = {
  open: 'قيد المعالجة',
  under_review: 'قيد المعالجة',
  awaiting_reply: 'قيد المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'ملغاة',
}

const STATUS_UPDATE_API = {
  'قيد المعالجة': 'under_review',
  'تم الحل': 'resolved',
}

export const COMPLAINT_EDITABLE_STATUS_OPTIONS = [
  'قيد المعالجة',
  'تم الحل',
]

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

export function mapStatusToDetailUi(status) {
  return STATUS_DETAIL_UI[status] ?? mapStatusToUi(status)
}

export function mapCategoryToUi(category) {
  const raw = String(category ?? '').trim()
  if (!raw) return '—'
  return CATEGORY_UI[raw] ?? raw
}

function apiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (base) return base
  if (import.meta.env.DEV) return 'http://127.0.0.1:8000'
  return ''
}

/** Laravel Media Library: /storage/{mediaId}/{file_name} — الـ API قد يُرجع مساراً ناقصاً */
export function resolveComplaintAttachmentUrl(file) {
  if (!file) return ''

  const mediaId = file.id ?? file.media_id ?? null
  const fileName = file.file_name ?? file.filename ?? null

  if (mediaId != null && fileName) {
    const path = `storage/${mediaId}/${fileName}`
    const origin = apiOrigin()
    if (!import.meta.env.VITE_API_BASE_URL) {
      return `/${path}`
    }
    return origin ? `${origin}/${path}` : `/${path}`
  }

  const rawUrl = file.url ?? file.full_url ?? file.path ?? file.file_path ?? ''
  if (!rawUrl) return resolveMediaUrl(fileName ?? file.name) ?? ''

  if (typeof rawUrl === 'string' && /^https?:\/\//i.test(rawUrl)) {
    const origin = apiOrigin()
    if (!import.meta.env.VITE_API_BASE_URL) {
      try {
        const parsed = new URL(rawUrl)
        return `${parsed.pathname}${parsed.search}`
      } catch {
        return rawUrl
      }
    }
    if (origin && rawUrl.startsWith(origin)) return rawUrl
    return rawUrl
  }

  return resolveMediaUrl(rawUrl) ?? ''
}

function collectAttachmentSources(item) {
  const sources = [
    ...(Array.isArray(item.attachments) ? item.attachments : []),
    ...(Array.isArray(item.media) ? item.media : []),
    ...(Array.isArray(item.proofs) ? item.proofs : []),
    ...(Array.isArray(item.files) ? item.files : []),
  ]

  if (item.image) sources.push(item.image)
  if (item.product_image) sources.push(item.product_image)
  if (item.photo) sources.push(item.photo)

  return sources
}

function mapAttachments(item) {
  return collectAttachmentSources(item).map((file) => ({
    id: file?.id ?? file?.media_id ?? null,
    url: resolveComplaintAttachmentUrl(file),
    name: file?.name ?? file?.file_name ?? file?.filename ?? '',
    mimeType: file?.mime_type ?? file?.mimeType ?? '',
  })).filter((file) => file.url)
}

/** GET /api/complaints/{id} — جلب صور المنتج المرفقة من الزبون */
export async function getComplaintProductImages(complaintId) {
  const data = await getComplaint(complaintId)
  const item = data?.data ?? data
  return mapAttachments(item)
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
    category: mapCategoryToUi(resolveComplaintCategoryRaw(item)),
    rawCategory: resolveComplaintCategoryRaw(item),
    type: mapCategoryToUi(resolveComplaintCategoryRaw(item)),
    priority: item.priority ?? '',
    resolutionSummary: item.resolution_summary ?? '',
    hasImage: attachments.length > 0,
    imageUrl: firstImage,
    attachments,
    actions: item.actions ?? [],
    raw: item,
  }
}

export function mapComplaintDetail(data) {
  const item = data?.data ?? data
  return mapComplaint(item)
}

export function buildComplaintStats(disputes) {
  const closed = disputes.filter((d) =>
    ['closed', 'cancelled'].includes(d.rawStatus),
  ).length
  const review = disputes.filter((d) =>
    ['under_review', 'awaiting_reply'].includes(d.rawStatus),
  ).length
  const resolved = disputes.filter((d) => d.rawStatus === 'resolved').length
  return { closed, review, resolved }
}
