import { apiRequest } from './client.js'

// عرض جميع طلبات الانضمام المعلقة (status=pending) مع الفلترة
// GET /api/v1/admin/stores/requests
export function getStoreRequests(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/stores/requests${query ? `?${query}` : ''}`)
}

// عرض تفاصيل طلب انضمام محدد (بيانات الطلب + مقدم الطلب + الخطة)
// GET /api/v1/admin/stores/requests/{storeJoinRequest}
export function getStoreRequest(storeJoinRequest) {
  return apiRequest(`/api/v1/admin/stores/requests/${storeJoinRequest}`)
}

// قبول طلب الانضمام: إنشاء المستخدم والمتجر (inactive)
// POST /api/v1/admin/stores/requests/{storeJoinRequest}/accept
export function acceptStoreRequest(storeJoinRequest) {
  return apiRequest(`/api/v1/admin/stores/requests/${storeJoinRequest}/accept`, {
    method: 'POST',
  })
}

// رفض طلب الانضمام مع ذكر السبب
// POST /api/v1/admin/stores/requests/{storeJoinRequest}/reject
export function rejectStoreRequest(storeJoinRequest, body) {
  return apiRequest(`/api/v1/admin/stores/requests/${storeJoinRequest}/reject`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function mapJoinRequest(item) {
  return {
    id: String(item.id),
    date: item.date ?? item.created_at?.slice(0, 10) ?? '',
    storeName: item.store_name ?? item.storeName ?? '',
    owner: item.owner_name ?? item.owner ?? '',
    email: item.email ?? '',
    city: item.city ?? '',
    phone: item.phone ?? '',
    description: item.description ?? '',
    businessType: item.business_type ?? item.businessType ?? '',
    status: item.status ?? 'pending',
    documentFile: item.document_file ?? item.documentFile ?? '',
    image: item.image ?? null,
    sampleProducts: item.sample_products ?? item.sampleProducts ?? [],
    plan: item.plan ?? null,
  }
}
