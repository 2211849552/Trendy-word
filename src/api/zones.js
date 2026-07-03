import { apiRequest } from './client.js'
import { getOrders, extractOrderList } from './adminOrders.js'
import { normalizeCityName } from '../data/libyanCities.js'

// ─────────────────────────────────────────────────────────────────────────────
// إدارة المناطق — api.md
// GET    /api/zones              — عرض قائمة المناطق (للجميع)
// POST   /api/admin/zones        — إضافة منطقة (الإدارة)
// DELETE /api/admin/zones/{id}   — حذف منطقة (الإدارة)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/zones — عرض قائمة المناطق */
export function getZones(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/zones${query ? `?${query}` : ''}`)
}

/** POST /api/admin/zones — إضافة منطقة */
export function createZone(body) {
  return apiRequest('/api/admin/zones', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const ZONE_CITY_STORAGE_KEY = 'trendy_admin_zone_cities'
const ZONE_CITY_BY_NAME_KEY = 'trendy_admin_zone_cities_by_name'

function readZoneCityMap() {
  try {
    const raw = localStorage.getItem(ZONE_CITY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function readZoneCityByNameMap() {
  try {
    const raw = localStorage.getItem(ZONE_CITY_BY_NAME_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeZoneCityMap(map) {
  localStorage.setItem(ZONE_CITY_STORAGE_KEY, JSON.stringify(map))
}

function writeZoneCityByNameMap(map) {
  localStorage.setItem(ZONE_CITY_BY_NAME_KEY, JSON.stringify(map))
}

export function saveZoneCity(zoneId, city, zoneName = '') {
  const trimmed = String(city ?? '').trim()
  if (!trimmed) return
  if (zoneId) {
    const map = readZoneCityMap()
    map[String(zoneId)] = trimmed
    writeZoneCityMap(map)
  }
  const nameKey = normalizeZoneKey(zoneName)
  if (nameKey) {
    const byName = readZoneCityByNameMap()
    byName[nameKey] = trimmed
    writeZoneCityByNameMap(byName)
  }
}

export function removeZoneCity(zoneId, zoneName = '') {
  if (zoneId != null && zoneId !== '') {
    const map = readZoneCityMap()
    delete map[String(zoneId)]
    writeZoneCityMap(map)
  }
  const nameKey = normalizeZoneKey(zoneName)
  if (nameKey) {
    const byName = readZoneCityByNameMap()
    delete byName[nameKey]
    writeZoneCityByNameMap(byName)
  }
}

function normalizeZoneKey(value) {
  return String(value ?? '').trim().toLowerCase()
}

function resolveZoneCity(item, cityByZone = null) {
  const fromApi = item?.city ?? item?.zone_city ?? item?.city_name ?? item?.region ?? ''
  if (fromApi) return normalizeCityName(fromApi)

  const id = item?.id ?? item?.zone_id
  if (id != null) {
    const stored = readZoneCityMap()[String(id)]
    if (stored) return normalizeCityName(stored)
  }

  const name = item?.name ?? item?.zone_name
  if (name) {
    const storedByName = readZoneCityByNameMap()[normalizeZoneKey(name)]
    if (storedByName) return normalizeCityName(storedByName)
  }

  if (id != null && cityByZone instanceof Map) {
    const fromOrders = cityByZone.get(String(id))
    if (fromOrders) return fromOrders
  }

  return ''
}

function recordZoneCityCount(countsByZone, zoneId, city) {
  const cityLabel = normalizeCityName(city)
  if (!zoneId || !cityLabel) return
  const key = String(zoneId)
  if (!countsByZone.has(key)) countsByZone.set(key, new Map())
  const cityCounts = countsByZone.get(key)
  cityCounts.set(cityLabel, (cityCounts.get(cityLabel) ?? 0) + 1)
}

function buildZoneCityMap(orders, zones = []) {
  const countsByZone = new Map()
  const zoneNameToId = new Map()

  zones.forEach((zone) => {
    const id = zone?.id ?? zone?.zone_id
    const name = zone?.name ?? zone?.zone_name
    if (id != null && name) {
      zoneNameToId.set(normalizeZoneKey(name), String(id))
    }
  })

  orders.forEach((order) => {
    const address = order.shipping_address
    const city =
      address?.city ??
      address?.address_line_2 ??
      order.zone_name ??
      address?.zone?.name
    if (!city) return

    const zoneId = order.zone_id ?? address?.zone_id ?? address?.zone?.id
    if (zoneId != null) {
      recordZoneCityCount(countsByZone, zoneId, city)
      return
    }

    const line1 = address?.address_line_1
    if (!line1) return
    const matchedZoneId = zoneNameToId.get(normalizeZoneKey(line1))
    if (matchedZoneId) {
      recordZoneCityCount(countsByZone, matchedZoneId, city)
    }
  })

  const result = new Map()
  countsByZone.forEach((cityCounts, zoneId) => {
    let bestCity = ''
    let bestCount = 0
    cityCounts.forEach((count, cityLabel) => {
      if (count > bestCount) {
        bestCity = cityLabel
        bestCount = count
      }
    })
    if (bestCity) result.set(zoneId, bestCity)
  })

  return result
}

/** DELETE /api/admin/zones/{id} — حذف منطقة */
export function deleteZone(id) {
  return apiRequest(`/api/admin/zones/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
  })
}

export function extractZoneList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.zones)) return data.zones
  if (Array.isArray(data?.data?.zones)) return data.data.zones
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data?.items)) return data.data.items
  return []
}

export function mapZone(item, cityByZone = null) {
  const id = item?.id ?? item?.zone_id ?? item?.current_zone_id
  const name = item?.name ?? item?.zone_name ?? item?.title ?? item?.label
  if (id == null || id === '' || !name) return null
  const city = resolveZoneCity(item, cityByZone)
  return {
    id: String(id),
    name: String(name),
    city,
    status: item.status ?? item.is_active ?? null,
    createdAt: item.created_at ? String(item.created_at).slice(0, 10) : '—',
    raw: item,
  }
}

export function extractCreatedZone(data) {
  const payload = data?.data ?? data
  if (payload?.id == null) return null
  return mapZone(payload)
}

export function buildCreateZonePayload(form) {
  const payload = { name: form.name.trim() }
  const city = form.city?.trim()
  if (city) payload.city = city
  return payload
}

export function validateCreateZoneForm(form) {
  if (!form.name?.trim()) return 'اسم المنطقة مطلوب.'
  if (!form.city?.trim()) return 'المدينة مطلوبة.'
  return null
}

/** GET /api/zones — المناطق المتاحة (api.md) لاختيار current_zone_id */
export async function fetchAvailableZones() {
  const data = await getZones({ per_page: 100 })
  return extractZoneList(data)
    .map(mapZone)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
}

/** جلب المناطق جاهزة لقائمة اختيار current_zone_id في نموذج إضافة السائق */
export async function fetchZonesForSelect() {
  return fetchAvailableZones()
}

/** جلب قائمة المناطق لصفحة الإدارة */
export async function fetchZonesList() {
  const [zonesResult, ordersResult] = await Promise.allSettled([
    getZones({ per_page: 100 }),
    getOrders({ per_page: 100 }),
  ])

  const rawZones =
    zonesResult.status === 'fulfilled' ? extractZoneList(zonesResult.value) : []

  const cityByZone =
    ordersResult.status === 'fulfilled'
      ? buildZoneCityMap(extractOrderList(ordersResult.value), rawZones)
      : new Map()

  if (zonesResult.status !== 'fulfilled') {
    throw zonesResult.reason
  }

  return extractZoneList(zonesResult.value)
    .map((item) => mapZone(item, cityByZone))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
}
