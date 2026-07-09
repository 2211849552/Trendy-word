import { apiRequest } from './client.js'
import { resolveMediaUrl } from '../utils/mediaUrl.js'
import { getZones, extractZoneList } from './zones.js'

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

let zonesByIdCache = null

async function getZonesByIdMap() {
  if (zonesByIdCache) return zonesByIdCache
  try {
    const data = await getZones({ per_page: 100 })
    zonesByIdCache = new Map(
      extractZoneList(data)
        .map((zone) => [
          String(zone.id ?? zone.zone_id),
          String(zone.name ?? zone.zone_name ?? '').trim(),
        ])
        .filter(([id, name]) => id && name),
    )
  } catch {
    zonesByIdCache = new Map()
  }
  return zonesByIdCache
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

function resolveJoinRequestLogo(item) {
  const store = item.store ?? {}
  return resolveMediaUrl(
    item.logo ??
    item.logo_url ??
    item.image ??
    item.image_url ??
    store.logo ??
    store.logo_url,
  )
}

export function mapJoinRequest(item) {
  const user = item.user ?? {}
  const zone = item.zone ?? {}
  const store = item.store ?? {}
  const zoneId = item.zone_id ?? zone.id ?? store.zone_id ?? null

  return {
    id: String(item.id),
    date: item.date ?? item.created_at?.slice(0, 10) ?? '',
    storeName: firstNonEmpty(item.store_name, item.storeName),
    owner: firstNonEmpty(item.applicant_name, item.owner_name, item.owner, user.name),
    ownerEmail: firstNonEmpty(item.owner_email, user.email, item.contact_email, item.email),
    ownerPhone: firstNonEmpty(item.applicant_phone, item.owner_phone, user.phone),
    email: firstNonEmpty(item.contact_email, item.email, item.owner_email, user.email),
    zoneId,
    city: firstNonEmpty(item.zone_name, zone.name, item.city),
    googleMapUrl: firstNonEmpty(item.google_map_url, store.google_map_url),
    phone: firstNonEmpty(item.contact_phone, item.phone, item.applicant_phone, user.phone),
    description: firstNonEmpty(item.description, store.description),
    notes: firstNonEmpty(item.notes),
    businessType: firstNonEmpty(item.type, item.business_type, item.businessType, store.type),
    status: item.status ?? 'pending',
    documentFile: firstNonEmpty(item.document_file, item.documentFile),
    image: resolveJoinRequestLogo(item),
    sampleProducts: item.sample_products ?? item.sampleProducts ?? [],
    plan: item.plan ?? null,
    entityType: firstNonEmpty(item.entity_type, store.entity_type),
    commercialRegister: firstNonEmpty(item.commercial_register_number, item.commercial_register),
    storeId: item.store_id ?? store.id ?? null,
  }
}

export function enrichJoinRequestZone(request, zonesById = new Map()) {
  if (!request) return request
  const city = firstNonEmpty(
    request.city,
    request.zoneId != null ? zonesById.get(String(request.zoneId)) : '',
  )
  return city ? { ...request, city } : request
}

export async function enrichJoinRequestsWithZones(requests) {
  if (!Array.isArray(requests) || !requests.length) return requests
  const zonesById = await getZonesByIdMap()
  return requests.map((request) => enrichJoinRequestZone(request, zonesById))
}

export async function fetchJoinRequestDetail(requestId) {
  const normalizedId = String(requestId)
  const [data, zonesById] = await Promise.all([
    getStoreRequest(normalizedId),
    getZonesByIdMap(),
  ])
  return enrichJoinRequestZone(mapJoinRequest(data?.data ?? data), zonesById)
}
