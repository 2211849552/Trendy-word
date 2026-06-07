import { apiRequest } from './client.js'

// عرض جميع طلبات الانضمام المعلقة (status=pending) مع الفلترة
// GET /api/admin/stores/requests
export function getStoreRequests(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/stores/requests${query ? `?${query}` : ''}`)
}

// عرض تفاصيل طلب انضمام محدد (بيانات الطلب + مقدم الطلب + الخطة)
// GET /api/admin/stores/requests/{storeJoinRequest}
export function getStoreRequest(storeJoinRequest) {
  return apiRequest(`/api/admin/stores/requests/${storeJoinRequest}`)
}

// قبول طلب الانضمام: إنشاء المستخدم والمتجر (inactive)
// POST /api/admin/stores/requests/{storeJoinRequest}/accept
export function acceptStoreRequest(storeJoinRequest) {
  return apiRequest(`/api/admin/stores/requests/${storeJoinRequest}/accept`, {
    method: 'POST',
  })
}

// رفض طلب الانضمام مع ذكر السبب
// POST /api/admin/stores/requests/{storeJoinRequest}/reject
export function rejectStoreRequest(storeJoinRequest, body) {
  return apiRequest(`/api/admin/stores/requests/${storeJoinRequest}/reject`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

function resolveMediaUrl(path) {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  const origin = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
  return `${origin.replace(/\/$/, '')}/storage/${String(path).replace(/^\//, '')}`
}

export function mapJoinRequest(item) {
  const user = item.user ?? {}
  return {
    id: String(item.id),
    date: item.date ?? item.created_at?.slice(0, 10) ?? '',
    storeName: item.store_name ?? item.storeName ?? '',
    owner: item.applicant_name ?? item.owner_name ?? item.owner ?? user.name ?? '',
    email: item.contact_email ?? item.email ?? user.email ?? '',
    city: item.zone_name ?? item.city ?? item.google_map_url ?? '',
    phone: item.contact_phone ?? item.applicant_phone ?? item.phone ?? user.phone ?? '',
    description: item.description ?? item.notes ?? '',
    businessType: item.type ?? item.business_type ?? item.businessType ?? item.entity_type ?? '',
    status: item.status ?? 'pending',
    documentFile: item.document_file ?? item.documentFile ?? '',
    image: resolveMediaUrl(item.logo ?? item.image),
    sampleProducts: item.sample_products ?? item.sampleProducts ?? [],
    plan: item.plan ?? null,
    entityType: item.entity_type ?? '',
    commercialRegister: item.commercial_register_number ?? '',
    storeId: item.store_id ?? item.store?.id ?? null,
  }
}
