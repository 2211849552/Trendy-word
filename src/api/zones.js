import { apiRequest } from './client.js'

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

function readZoneCityMap() {
  try {
    const raw = localStorage.getItem(ZONE_CITY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeZoneCityMap(map) {
  localStorage.setItem(ZONE_CITY_STORAGE_KEY, JSON.stringify(map))
}

export function saveZoneCity(zoneId, city) {
  const trimmed = String(city ?? '').trim()
  if (!zoneId || !trimmed) return
  const map = readZoneCityMap()
  map[String(zoneId)] = trimmed
  writeZoneCityMap(map)
}

export function removeZoneCity(zoneId) {
  if (zoneId == null || zoneId === '') return
  const map = readZoneCityMap()
  delete map[String(zoneId)]
  writeZoneCityMap(map)
}

function resolveZoneCity(item) {
  const fromApi = item?.city ?? item?.zone_city ?? ''
  if (fromApi) return String(fromApi)
  const id = item?.id ?? item?.zone_id
  if (id == null) return ''
  return readZoneCityMap()[String(id)] ?? ''
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

export function mapZone(item) {
  const id = item?.id ?? item?.zone_id ?? item?.current_zone_id
  const name = item?.name ?? item?.zone_name ?? item?.title ?? item?.label
  if (id == null || id === '' || !name) return null
  return {
    id: String(id),
    name: String(name),
    city: resolveZoneCity(item),
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
  return fetchAvailableZones()
}
