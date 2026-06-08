import { apiRequest } from './client.js'

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

// POST /api/drivers/{id}/deactivate
export function deactivateDriver(id, reason) {
  const payload = reason?.trim() ? { reason: reason.trim() } : {}
  return apiRequest(`/api/drivers/${encodeURIComponent(String(id))}/deactivate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// POST /api/drivers/{id}/reactivate
export function reactivateDriver(id) {
  return apiRequest(`/api/drivers/${encodeURIComponent(String(id))}/reactivate`, {
    method: 'POST',
  })
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
}

const AVAILABILITY_UI = {
  available: 'متاح',
  online: 'متاح',
  on_trip: 'في مهمة',
  busy: 'في مهمة',
  delivering: 'في مهمة',
  offline: 'غير متصل',
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

function resolveDisplayStatus(item) {
  const accountStatus = item.status ?? 'active'
  if (accountStatus === 'inactive') {
    return { label: 'معطل', rawStatus: 'inactive', availability: null }
  }

  const availability =
    item.online_status ??
    item.availability ??
    item.connection_status ??
    item.driver_profile?.online_status ??
    'available'

  if (['on_trip', 'busy', 'delivering'].includes(availability)) {
    return { label: 'في مهمة', rawStatus: 'active', availability }
  }

  return { label: 'متاح', rawStatus: 'active', availability }
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
    rating: Number(item.avg_rating ?? item.rating ?? item.average_rating ?? 0),
    deliveries: Number(stats.total_deliveries ?? item.total_deliveries ?? item.deliveries ?? 0),
    status: display.label,
    rawStatus: display.rawStatus,
    availability: display.availability,
    accountStatusLabel: ACCOUNT_STATUS_UI[item.status] ?? item.status ?? '—',
    custodyBalance: Number(profile.custody_balance ?? item.custody_balance ?? 0),
    totalEarnings: Number(stats.total_earnings ?? item.total_earnings ?? 0),
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

export function buildDriverQueryParams({ search, status, perPage = 100 } = {}) {
  const params = { per_page: perPage }
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed

  switch (status) {
    case 'معطل':
      params.status = 'inactive'
      break
    case 'متاح':
      params.status = 'active'
      params.availability = 'available'
      break
    case 'في مهمة':
      params.status = 'active'
      params.availability = 'on_trip'
      break
    default:
      break
  }

  return params
}

export function buildDriverStats(drivers, meta = {}) {
  return {
    total: Number(meta.total ?? drivers.length),
    available: drivers.filter((d) => d.status === 'متاح').length,
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
