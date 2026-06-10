import { apiRequest } from './client.js'
import { extractMediaUrls, resolveMediaUrl } from '../utils/mediaUrl.js'

// [2.2] عرض قائمة المتاجر — للإدارة
// GET /api/admin/stores?name=&status=&type=&per_page=
export function getAdminStores(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/stores${query ? `?${query}` : ''}`)
}

// GET /api/admin/stores/{store}
export function getAdminStore(store) {
  return apiRequest(`/api/admin/stores/${store}`)
}

// GET /api/admin/stores/print — قائمة كاملة للطباعة والتصدير
export function printAdminStores(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/stores/print${query ? `?${query}` : ''}`)
}

// POST /api/admin/stores/{store}/deactivate
export function deactivateAdminStore(store, body) {
  return apiRequest(`/api/admin/stores/${store}/deactivate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/admin/stores/{store}/reactivate
export function reactivateAdminStore(store) {
  return apiRequest(`/api/admin/stores/${store}/reactivate`, {
    method: 'POST',
  })
}

// PUT /api/admin/stores/{store}
export function updateAdminStore(store, body) {
  return apiRequest(`/api/admin/stores/${encodeURIComponent(String(store))}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// PUT /api/admin/stores/{store}/delivery-prices
export function updateStoreDeliveryPrices(store, deliveryPrices) {
  return apiRequest(`/api/admin/stores/${encodeURIComponent(String(store))}/delivery-prices`, {
    method: 'PUT',
    body: JSON.stringify({ delivery_prices: deliveryPrices }),
  })
}

// POST /api/admin/stores/{store}/settle-custody
export function settleStoreCustody(store) {
  return apiRequest(`/api/admin/stores/${encodeURIComponent(String(store))}/settle-custody`, {
    method: 'POST',
  })
}

export function extractStoreList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function toApiStoreStatus(uiStatus) {
  if (uiStatus === 'all') return undefined
  if (uiStatus === 'disabled') return 'deactivated'
  if (uiStatus === 'pending') return 'inactive'
  return uiStatus
}

export function normalizeStoreStatus(status) {
  if (status === 'active') return 'active'
  if (status === 'inactive') return 'pending'
  if (status === 'deactivated') return 'disabled'
  return 'disabled'
}

export function mapAdminStore(item) {
  const owner = item.owner ?? item.user ?? item.merchant ?? item.manager ?? {}
  return {
    id: item.id,
    name: item.name ?? '',
    slug: item.slug ?? '',
    city: item.zone_name ?? item.city ?? '—',
    merchant: owner.name ?? item.merchant_name ?? item.owner_name ?? item.manager_name ?? item.store_owner ?? '—',
    email: owner.email ?? item.email ?? item.contact_email ?? item.business_email ?? '—',
    phone: item.phone ?? owner.phone ?? item.contact_phone ?? item.mobile ?? item.business_phone ?? '—',
    products: item.products_count ?? item.products ?? null,
    orders: item.orders_count ?? item.orders ?? null,
    image: resolveMediaUrl(
      item.logo_url ??
      item.logo ??
      item.image_url ??
      item.image ??
      item.cover_image,
    ),
    images: extractMediaUrls(
      item.logo_url,
      item.logo,
      item.image_url,
      item.image,
      item.cover_image,
      item.banner_image,
      item.images,
    ),
    description: item.description ?? '',
    type: item.type ?? '',
    status: normalizeStoreStatus(item.status),
    rawStatus: item.status ?? '',
    createdAt: item.created_at?.slice(0, 10) ?? '',
    deactivationReason: item.deactivation_reason ?? '',
    zoneId: item.zone_id ?? null,
    googleMapUrl: item.google_map_url ?? '',
    deliveryPrices: item.delivery_prices ?? {},
    custodyBalance: Number(item.custody_balance ?? 0),
    owner,
  }
}

export function mapAdminStoreDetail(data) {
  const item = data?.data ?? data
  return mapAdminStore(item)
}
