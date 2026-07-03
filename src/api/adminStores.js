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

// GET /api/admin/stores/{store}/delivery-prices
export function getStoreDeliveryPrices(store) {
  return apiRequest(`/api/admin/stores/${encodeURIComponent(String(store))}/delivery-prices`)
}

// PUT /api/admin/stores/{store}/delivery-prices
export function buildDeliveryPricesPayload(pricesByZoneId) {
  return Object.fromEntries(
    Object.entries(pricesByZoneId).map(([zoneId, price]) => [
      String(zoneId),
      normalizePriceValue(price),
    ]),
  )
}

export function updateStoreDeliveryPrices(store, deliveryPrices) {
  const payload = buildDeliveryPricesPayload(deliveryPrices)
  return apiRequest(`/api/admin/stores/${encodeURIComponent(String(store))}/delivery-prices`, {
    method: 'PUT',
    body: JSON.stringify({ delivery_prices: payload }),
  })
}

function normalizePriceValue(price) {
  const value = Number(price)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

/** يحوّل delivery_prices أو zone_delivery_prices إلى خريطة { zoneId: price } */
export function extractDeliveryPricesMap(item) {
  if (!item) return {}

  const objectPrices = item.delivery_prices
  if (objectPrices && typeof objectPrices === 'object' && !Array.isArray(objectPrices)) {
    return Object.fromEntries(
      Object.entries(objectPrices).map(([zoneId, price]) => [
        String(zoneId),
        normalizePriceValue(price),
      ]),
    )
  }

  const list = item.zone_delivery_prices ?? (Array.isArray(objectPrices) ? objectPrices : null)
  if (Array.isArray(list)) {
    return Object.fromEntries(
      list
        .map((row) => {
          const zoneId = row.zone_id ?? row.id ?? row.zone?.id
          const price = row.delivery_price ?? row.price ?? 0
          if (zoneId == null || zoneId === '') return null
          return [String(zoneId), normalizePriceValue(price)]
        })
        .filter(Boolean),
    )
  }

  return {}
}

/** قائمة أسعار مع أسماء المناطق من StoreAdminResource */
export function extractZoneDeliveryPricesList(item) {
  if (Array.isArray(item)) {
    return item
      .map((row) => {
        if (row == null || typeof row !== 'object') return null
        const zoneId = row.zone_id ?? row.zoneId ?? row.zone?.id
        if (zoneId == null || zoneId === '') return null
        return {
          zoneId: String(zoneId),
          zoneName: row.zone_name ?? row.zoneName ?? row.name ?? row.zone?.name ?? null,
          deliveryPrice: normalizePriceValue(row.delivery_price ?? row.deliveryPrice ?? row.price ?? 0),
        }
      })
      .filter(Boolean)
  }

  if (Array.isArray(item?.zone_delivery_prices)) {
    return item.zone_delivery_prices
      .map((row) => {
        const zoneId = row.zone_id ?? row.id ?? row.zone?.id
        if (zoneId == null || zoneId === '') return null
        return {
          zoneId: String(zoneId),
          zoneName: row.zone_name ?? row.name ?? row.zone?.name ?? null,
          deliveryPrice: normalizePriceValue(row.delivery_price ?? row.price ?? 0),
        }
      })
      .filter(Boolean)
  }

  const pricesMap = extractDeliveryPricesMap(item)
  return Object.entries(pricesMap).map(([zoneId, deliveryPrice]) => ({
    zoneId,
    zoneName: null,
    deliveryPrice,
  }))
}

export function mapStoreDeliveryPricesResponse(data) {
  const payload = data?.data ?? data

  if (Array.isArray(payload)) {
    const zoneDeliveryPrices = extractZoneDeliveryPricesList(payload)
    return {
      prices: Object.fromEntries(
        zoneDeliveryPrices.map((row) => [row.zoneId, row.deliveryPrice]),
      ),
      zoneDeliveryPrices,
    }
  }

  const item = payload
  return {
    prices: extractDeliveryPricesMap(item),
    zoneDeliveryPrices: extractZoneDeliveryPricesList(item),
  }
}

// POST /api/admin/stores/{store}/settle-custody
export function settleStoreCustody(store) {
  return apiRequest(`/api/admin/stores/${encodeURIComponent(String(store))}/settle-custody`, {
    method: 'POST',
  })
}

export function mapSettleCustodyResponse(data) {
  const item = data?.data ?? data
  return {
    storeId: item?.store_id ?? null,
    settledAmount: Number(item?.settled_amount ?? 0),
    custodyBalance: Number(item?.custody_balance ?? 0),
    walletBalance: Number(item?.wallet_balance ?? 0),
    message: data?.message ?? '',
  }
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
    deliveryPrices: extractDeliveryPricesMap(item),
    zoneDeliveryPrices: extractZoneDeliveryPricesList(item),
    custodyBalance: Number(item.custody_balance ?? 0),
    owner,
  }
}

export function mapAdminStoreDetail(data) {
  const item = data?.data ?? data
  return mapAdminStore(item)
}
