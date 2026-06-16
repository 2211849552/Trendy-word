import { apiRequest } from './client.js'
import { loadDriverCustodyView } from './driverCustody.js'

export {
  getDriverCustodyBalance,
  getDriverFinanceCustodyBalance,
  fetchDriverCustody,
  loadDriverCustodyView,
  mapDriverCustodyView,
  getDriverSettleableBalance,
  settleDriverCash,
  settleDriverCustody,
  mapDriverCustodyBalance,
  mapSettleDriverCashResponse,
  formatDriverCustodyAmount,
} from './driverCustody.js'

// [18] إدارة السائقين
// GET /api/drivers — عرض القائمة والبحث والفلترة
export function getDrivers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/drivers${query ? `?${query}` : ''}`)
}

// GET /api/drivers/{id}
export function getDriver(id) {
  return apiRequest(`/api/drivers/${encodeURIComponent(String(id))}`)
}

// POST /api/drivers — إضافة سائق جديد [18.1]
export function createDriver(body) {
  return apiRequest('/api/drivers', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// PUT /api/drivers/{id} — تعديل بيانات السائق [18.9]
export function updateDriver(id, body) {
  return apiRequest(`/api/drivers/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// POST /api/drivers/{id}/deactivate
export function deactivateDriver(id, reason) {
  return apiRequest(`/api/drivers/${encodeURIComponent(String(id))}/deactivate`, {
    method: 'POST',
    body: JSON.stringify({
      reason: String(reason ?? '').trim() || 'تعطيل من لوحة الإدارة',
    }),
  })
}

// POST /api/drivers/{id}/reactivate
export function reactivateDriver(id) {
  return apiRequest(`/api/drivers/${encodeURIComponent(String(id))}/reactivate`, {
    method: 'POST',
  })
}

// GET /api/drivers/{id} — إجمالي التوصيلات من profile.total_orders (للإدارة)
export async function getDriverTotalDeliveries(driverId) {
  const data = await getDriver(driverId)
  return mapDriverDeliveries(data)
}

/** جلب إحصائيات السائق للوحة الإدارة: التوصيلات + عرض العهدة */
export async function loadDriverAdminStats(driverId) {
  const id = Number(driverId)
  const [driverData, custodyView] = await Promise.all([
    getDriver(id),
    loadDriverCustodyView(id),
  ])

  const detail = mapDriverDetail(driverData)
  const deliveries = mapDriverDeliveries(driverData)

  return {
    ...detail,
    deliveries: deliveries.totalDeliveries,
    totalEarnings: deliveries.totalEarnings,
    custodyBalance: custodyView.custodyBalance,
    pendingCash: custodyView.pendingCash ?? detail.pendingCash,
    isBlockedFromCod: custodyView.isBlockedFromCod ?? detail.isBlockedFromCod,
    firstCashCollectedAt: custodyView.firstCashCollectedAt ?? detail.firstCashCollectedAt,
    custodyView,
    deliveriesStats: deliveries,
  }
}

export function mapDriverDeliveries(data) {
  const item = data?.data ?? data
  const profile = item?.driver_profile ?? item?.profile ?? {}
  const stats = item?.stats ?? {}

  return {
    totalDeliveries: Number(
      profile.total_orders ??
      stats.total_deliveries ??
      stats.total_orders ??
      item.total_deliveries ??
      item.total_orders ??
      item.deliveries ??
      0,
    ),
    totalEarnings: Number(
      profile.earnings ??
      stats.total_earnings ??
      item.total_earnings ??
      0,
    ),
    currency: item?.currency ?? 'LYD',
  }
}

/** أنواع المركبة المدعومة في POST /api/drivers */
export const DRIVER_VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'دراجة نارية' },
  { value: 'car', label: 'سيارة' },
  { value: 'van', label: 'فان' },
]

/** حقول body لـ POST /api/drivers — مطابقة لـ api.md [18.1] */
export const DRIVER_CREATE_FIELDS = [
  { key: 'name', label: 'اسم السائق', required: true, type: 'text', placeholder: 'أدخل اسم السائق' },
  { key: 'phone', label: 'رقم الهاتف', required: true, type: 'tel', placeholder: '0912345678', dir: 'ltr' },
  { key: 'email', label: 'البريد الإلكتروني', required: false, type: 'email', placeholder: 'driver@example.com', dir: 'ltr' },
  { key: 'password', label: 'كلمة المرور', required: true, type: 'password', minLength: 8, placeholder: '8 أحرف على الأقل' },
  { key: 'license_number', label: 'رقم رخصة القيادة', required: true, type: 'text', placeholder: 'مثال: DL-123456' },
  { key: 'current_zone_id', label: 'المنطقة الحالية', required: true, type: 'zone', api: 'GET /api/zones' },
  { key: 'vehicle_type', label: 'نوع المركبة', required: true, type: 'vehicle_type' },
  { key: 'plate_number', label: 'رقم لوحة المركبة', required: true, type: 'text', placeholder: 'ABC123' },
]

export function extractDriverList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function extractPaginationMeta(data) {
  return data?.meta ?? {}
}

const ACCOUNT_STATUS_UI = {
  active: 'نشط',
  inactive: 'معطل',
  disabled: 'معطل',
}

const AVAILABILITY_UI = {
  available: 'متاح',
  online: 'متاح',
  on_trip: 'في مهمة',
  busy: 'في مهمة',
  delivering: 'في مهمة',
  offline: 'غير متصل',
  unavailable: 'غير متصل',
}

const VEHICLE_TYPE_UI = Object.fromEntries(
  DRIVER_VEHICLE_TYPES.map(({ value, label }) => [value, label]),
)

export function mapDriverAvailability(value) {
  return AVAILABILITY_UI[value] ?? value ?? '—'
}

export function mapVehicleTypeLabel(value) {
  return VEHICLE_TYPE_UI[value] ?? value ?? '—'
}

function formatVehicle(item) {
  const profile = item.driver_profile ?? item.profile ?? {}
  const type = profile.vehicle_type ?? item.vehicle_type ?? ''
  const plate = profile.plate_number ?? profile.vehicle_plate ?? profile.license_plate ?? item.plate_number ?? item.vehicle_plate ?? item.license_plate ?? ''
  const info = profile.vehicle_info ?? item.vehicle_info ?? item.vehicle ?? ''
  const typeLabel = mapVehicleTypeLabel(type)

  if (info) return info
  if (type && plate) return `${typeLabel !== type ? typeLabel : type} - ${plate}`
  if (typeLabel) return typeLabel
  if (plate) return plate
  return '—'
}

function resolveDriverAvailability(item) {
  const profile = item.driver_profile ?? item.profile ?? {}

  const explicit =
    profile.availability_status ??
    item.availability_status ??
    profile.online_status ??
    item.online_status ??
    item.availability ??
    item.connection_status ??
    null

  if (explicit) return explicit

  if (profile.is_online === false || item.is_online === false) return 'offline'
  if (profile.is_online === true || item.is_online === true) return 'available'

  return 'offline'
}

function resolveDisplayStatus(item) {
  const profile = item.driver_profile ?? item.profile ?? {}
  const accountStatus = item.status ?? profile.status ?? 'active'
  if (accountStatus === 'inactive' || accountStatus === 'disabled') {
    return { label: 'معطل', rawStatus: 'inactive', availability: null }
  }

  const availability = resolveDriverAvailability(item)

  return {
    label: mapDriverAvailability(availability),
    rawStatus: 'active',
    availability,
  }
}

export function mapDriver(item) {
  const display = resolveDisplayStatus(item)
  const profile = item.driver_profile ?? item.profile ?? {}
  const stats = item.stats ?? {}

  return {
    id: item.id,
    name: item.name ?? '—',
    phone: item.phone ?? '—',
    email: item.email ?? '—',
    licenseNumber: profile.license_number ?? item.license_number ?? '—',
    vehicle: formatVehicle(item),
    vehicleType: profile.vehicle_type ?? item.vehicle_type ?? '',
    vehicleTypeLabel: mapVehicleTypeLabel(profile.vehicle_type ?? item.vehicle_type),
    plateNumber: profile.plate_number ?? item.plate_number ?? '',
    zoneId: profile.current_zone_id ?? item.current_zone_id ?? null,
    zoneName: profile.zone_name ?? item.zone_name ?? item.current_zone?.name ?? '—',
    rating: Number(
      profile.average_rating ??
      item.avg_rating ??
      item.rating ??
      item.average_rating ??
      0,
    ),
    deliveries: Number(
      profile.total_orders ??
      stats.total_deliveries ??
      stats.total_orders ??
      item.total_deliveries ??
      item.total_orders ??
      item.deliveries ??
      0,
    ),
    status: display.label,
    rawStatus: display.rawStatus,
    availability: display.availability,
    accountStatusLabel: ACCOUNT_STATUS_UI[item.status] ?? item.status ?? '—',
    custodyBalance: Number(
      profile.cash_collected_balance ??
        profile.custody_balance ??
        item.cash_collected_balance ??
        item.custody_balance ??
        0,
    ),
    pendingCash: Number(profile.pending_cash ?? item.pending_cash ?? 0),
    isBlockedFromCod: Boolean(profile.is_blocked_from_cod ?? item.is_blocked_from_cod ?? false),
    firstCashCollectedAt: profile.first_cash_collected_at ?? item.first_cash_collected_at ?? null,
    totalEarnings: Number(stats.total_earnings ?? item.total_earnings ?? profile.earnings ?? 0),
    joinDate: item.created_at ? String(item.created_at).slice(0, 10) : '—',
    raw: item,
  }
}

export function mapDriverDetail(data) {
  const payload = data?.data ?? data
  const profile = payload?.driver_profile ?? payload?.profile ?? {}
  const stats = payload?.stats ?? {}

  return {
    ...mapDriver({
      ...payload,
      driver_profile: profile,
      stats,
    }),
    workDuration: stats.work_duration ?? payload.work_duration ?? null,
    recentTrips: payload.recent_trips ?? payload.trips ?? [],
  }
}

export function buildDriverQueryParams({ status, perPage = 100 } = {}) {
  const params = { per_page: perPage }

  switch (status) {
    case 'معطل':
      params.status = 'disabled'
      break
    case 'متاح':
    case 'في مهمة':
    case 'غير متصل':
      params.status = 'active'
      break
    default:
      break
  }

  return params
}

function driverSearchHaystack(driver) {
  return [
    driver.name,
    driver.phone,
    driver.email,
    driver.vehicle,
    driver.vehicleTypeLabel,
    driver.plateNumber,
    driver.licenseNumber,
  ]
    .filter((value) => value && value !== '—')
    .join(' ')
    .toLowerCase()
}

/** فلترة القائمة محلياً — حالات التوفر والبحث بالمركبة (غير مدعومة مباشرة في API) */
export function applyDriverListFilters(drivers, { search, status } = {}) {
  let list = Array.isArray(drivers) ? drivers : []

  if (status === 'متاح') {
    list = list.filter((driver) => driver.status === 'متاح')
  } else if (status === 'غير متصل') {
    list = list.filter((driver) => driver.status === 'غير متصل')
  } else if (status === 'في مهمة') {
    list = list.filter((driver) => driver.status === 'في مهمة')
  } else if (status === 'معطل') {
    list = list.filter((driver) => driver.status === 'معطل' || driver.rawStatus === 'inactive')
  }

  const trimmed = search?.trim().toLowerCase()
  if (trimmed) {
    list = list.filter((driver) => driverSearchHaystack(driver).includes(trimmed))
  }

  return list
}

export function buildDriverStats(drivers, meta = {}) {
  return {
    total: Number(meta.total ?? drivers.length),
    available: drivers.filter((d) => d.status === 'متاح').length,
    offline: drivers.filter((d) => d.status === 'غير متصل').length,
    onTrip: drivers.filter((d) => d.status === 'في مهمة').length,
    disabled: drivers.filter((d) => d.rawStatus === 'inactive' || d.status === 'معطل').length,
  }
}

/** نموذج فارغ — مفاتيح مطابقة لـ DRIVER_CREATE_FIELDS / api.md [18.1] */
export function emptyDriverForm() {
  const form = {}
  for (const field of DRIVER_CREATE_FIELDS) {
    form[field.key] = field.type === 'vehicle_type' ? 'motorcycle' : ''
  }
  return form
}

/** تحويل النموذج إلى body لـ POST /api/drivers — api.md [18.1] */
export function buildCreateDriverPayload(form) {
  const payload = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    password: form.password,
    license_number: form.license_number.trim(),
    vehicle_type: form.vehicle_type,
    plate_number: form.plate_number.trim(),
    current_zone_id: Number(form.current_zone_id),
  }

  const email = form.email?.trim()
  if (email) payload.email = email

  return payload
}

/** تحقق محلي قبل الإرسال — مطابق لـ DRIVER_CREATE_FIELDS / api.md [18.1] */
export function validateCreateDriverForm(form) {
  const errors = {}

  for (const field of DRIVER_CREATE_FIELDS) {
    if (!field.required) continue

    const value = form[field.key]

    if (field.type === 'password') {
      const minLength = field.minLength ?? 8
      if (!value || value.length < minLength) {
        errors[field.key] = `${field.label} يجب أن تكون ${minLength} أحرف على الأقل.`
      }
      continue
    }

    if (field.type === 'zone') {
      if (!value) errors[field.key] = `يجب اختيار ${field.label}.`
      continue
    }

    if (!String(value ?? '').trim()) {
      errors[field.key] = `${field.label} مطلوب.`
    }
  }

  return errors
}

export function firstValidationError(errors) {
  const keys = DRIVER_CREATE_FIELDS.map((field) => field.key)
  for (const key of keys) {
    if (errors[key]) return errors[key]
  }
  return Object.values(errors)[0] ?? null
}

/** حقول PUT /api/drivers/{id} — api.md [18.9] */
export const DRIVER_UPDATE_FIELDS = [
  { key: 'name', label: 'اسم السائق', type: 'text' },
  { key: 'phone', label: 'رقم الهاتف', type: 'tel', dir: 'ltr' },
  { key: 'email', label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
  { key: 'vehicle_type', label: 'نوع المركبة', type: 'vehicle_type' },
  { key: 'plate_number', label: 'رقم لوحة المركبة', type: 'text' },
  { key: 'current_zone_id', label: 'المنطقة الحالية', type: 'zone' },
]

export function emptyDriverEditForm(driver) {
  return {
    name: driver?.name && driver.name !== '—' ? driver.name : '',
    phone: driver?.phone && driver.phone !== '—' ? driver.phone : '',
    email: driver?.email && driver.email !== '—' ? driver.email : '',
    vehicle_type: driver?.vehicleType || 'motorcycle',
    plate_number: driver?.plateNumber || '',
    current_zone_id: driver?.zoneId != null ? String(driver.zoneId) : '',
  }
}

export function buildUpdateDriverPayload(form) {
  const payload = {}
  const name = form.name?.trim()
  const phone = form.phone?.trim()
  const email = form.email?.trim()
  const plate = form.plate_number?.trim()

  if (name) payload.name = name
  if (phone) payload.phone = phone
  if (email) payload.email = email
  if (form.vehicle_type) payload.vehicle_type = form.vehicle_type
  if (plate) payload.plate_number = plate
  if (form.current_zone_id) payload.current_zone_id = Number(form.current_zone_id)

  return payload
}

/**
 * جلب مستحقات السائق من GET /api/admin/drivers/{id}/due-balance
 */
export async function getDriverDueBalance(driverId) {
  const id = Number(driverId)
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(Object.assign(new Error('معرّف السائق غير صالح.'), { status: 422 }))
  }

  const res = await apiRequest(`/api/admin/drivers/${encodeURIComponent(String(id))}/due-balance`)
  const data = res?.data ?? res

  // إذا أرجع النظام قائمة لجميع السائقين
  if (Array.isArray(data)) {
    const found = data.find(
      (item) => Number(item?.driver_id) === id || Number(item?.id) === id
    )
    return found ? Number(found?.due_balance ?? found?.balance ?? found?.amount ?? 0) : 0
  }

  // إذا أرجع النظام كائن الاستجابة لسائق واحد
  if (data && typeof data === 'object') {
    if (data?.due_balance !== undefined) return Number(data.due_balance)
    if (data?.balance !== undefined) return Number(data.balance)
    if (data?.amount !== undefined) return Number(data.amount)
    if (data[id] !== undefined) return Number(data[id])
  }

  return 0
}

/**
 * تسوية مستحقات السائق عبر POST /api/admin/drivers/{id}/settle-dues
 */
export function settleDriverDues(driverId, body) {
  const id = Number(driverId)
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(Object.assign(new Error('معرّف السائق غير صالح.'), { status: 422 }))
  }

  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount < 0.01) {
    return Promise.reject(
      Object.assign(new Error('مبلغ التسوية مطلوب (0.01 على الأقل).'), { status: 422 }),
    )
  }

  const payload = { amount }
  const description = String(body?.description ?? '').trim()
  if (description) payload.description = description

  return apiRequest(`/api/admin/drivers/${encodeURIComponent(String(id))}/settle-dues`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

