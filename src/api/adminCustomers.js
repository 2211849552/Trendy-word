import { apiRequest } from './client.js'
import { getOrders, extractOrderList } from './adminOrders.js'

// [10] إدارة الزبائن
// GET /api/customers — عرض القائمة والبحث والفلترة
export function getCustomers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/customers${query ? `?${query}` : ''}`)
}

// GET /api/customers/{id}
export function getCustomer(id) {
  return apiRequest(`/api/customers/${encodeURIComponent(String(id))}`)
}

// POST /api/customers/{id}/deactivate
function cleanCustomerField(value) {
  if (value == null) return null
  const text = String(value).trim()
  if (!text || text === '—') return null
  return text
}

export function buildCustomerProfilePayload(customer) {
  const raw = customer?.raw ?? {}
  const payload = raw?.data ?? raw
  const profile = payload?.profile ?? payload

  const body = {
    user_id: customer?.userId ?? customer?.user_id ?? profile?.user_id ?? payload?.user_id ?? null,
    name: cleanCustomerField(customer?.name ?? profile?.name),
    email: cleanCustomerField(customer?.email ?? profile?.email),
    phone: cleanCustomerField(customer?.phone ?? profile?.phone),
  }

  if (customer?.defaultAddress != null) {
    body.default_address = customer.defaultAddress
  } else if (profile?.default_address != null) {
    body.default_address = profile.default_address
  }

  return Object.fromEntries(Object.entries(body).filter(([, value]) => value != null))
}

export function buildDeactivateCustomerPayload(customer, reason) {
  return {
    ...buildCustomerProfilePayload(customer),
    reason: String(reason ?? '').trim(),
  }
}

export function deactivateCustomer(id, customer, reason) {
  const body = buildDeactivateCustomerPayload(customer, reason)
  return apiRequest(`/api/customers/${encodeURIComponent(String(id))}/deactivate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/customers/{id}/reactivate
export function buildReactivateCustomerPayload(customer) {
  return buildCustomerProfilePayload(customer)
}

export function reactivateCustomer(id, customer) {
  const body = buildReactivateCustomerPayload(customer)
  return apiRequest(`/api/customers/${encodeURIComponent(String(id))}/reactivate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/customers/export — طباعة/تصدير قائمة الزبائن
export function exportCustomers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/customers/export${query ? `?${query}` : ''}`)
}

export function extractCustomerList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function extractPaginationMeta(data) {
  return data?.meta ?? {}
}

const STATUS_UI = {
  active: 'نشط',
  inactive: 'معطل',
  suspended: 'موقوف',
  banned: 'محظور',
}

const STATUS_API = {
  'جميع الحالات': null,
  نشط: 'active',
  معطل: 'inactive',
}

export function uiStatusToApi(statusLabel) {
  return STATUS_API[statusLabel] ?? null
}

export function mapCustomerStatus(status) {
  return STATUS_UI[status] ?? status ?? '—'
}

function uniqueParts(parts) {
  const seen = new Set()
  return parts.filter((part) => {
    const key = part.toLowerCase()
    if (!part || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function formatAddress(address) {
  if (!address) return '—'
  if (typeof address === 'string') return address.trim() || '—'
  if (typeof address === 'object') {
    const parts = uniqueParts([
      address.city,
      address.address_line_1,
      address.address_line_2,
      address.area,
      address.label,
      address.street,
      address.zone?.name,
      address.zone_name,
    ].map((value) => String(value ?? '').trim()).filter(Boolean))
    return parts.length ? parts.join(' - ') : '—'
  }
  return '—'
}

function formatOrderShippingLocation(order) {
  const address = order?.shipping_address
  if (!address) {
    const zoneName = order?.zone_name
    return zoneName ? String(zoneName).trim() : ''
  }
  const formatted = formatAddress(address)
  return formatted === '—' ? '' : formatted
}

export function buildCustomerLocationMap(orders) {
  const map = new Map()

  orders.forEach((order) => {
    const location = formatOrderShippingLocation(order)
    if (!location) return

    const customerId = order.shipping_address?.customer_id ?? order.customer_id
    if (customerId != null) {
      map.set(Number(customerId), location)
    }
  })

  return map
}

function applyCustomerLocation(customer, locationMap) {
  if (!customer || customer.location !== '—') return customer
  const fromOrders = locationMap.get(Number(customer.id))
  if (!fromOrders) return customer
  return { ...customer, location: fromOrders }
}

function formatDate(value) {
  if (!value) return '—'
  return String(value).slice(0, 10)
}

export function mapCustomer(item) {
  return {
    id: item.id,
    userId: item.user_id ?? null,
    name: item.name ?? '—',
    email: item.email ?? '—',
    phone: item.phone ?? '—',
    location: formatAddress(item.default_address),
    orders: Number(item.total_orders ?? item.orders ?? 0),
    totalSpent: Number(item.total_spent ?? item.totalSpent ?? 0),
    joinDate: formatDate(item.joined_at ?? item.created_at),
    status: mapCustomerStatus(item.status),
    rawStatus: item.status ?? '',
    loyaltyPoints: Number(item.loyalty_points ?? 0),
    lastLoginAt: item.last_login_at ?? null,
    defaultAddress: item.default_address ?? null,
    raw: item,
  }
}

export function resolveCustomerId(customer, fallbackId = null) {
  if (fallbackId != null && fallbackId !== '') return fallbackId
  const id = customer?.recordId ?? customer?.customerId ?? customer?.id ?? customer?.customer_id
  if (id == null || id === '') return null
  return id
}

export function mapCustomerDetail(data, fallbackId = null) {
  const payload = data?.data ?? data
  const profile = payload?.profile ?? payload
  const stats = payload?.stats ?? {}
  const recordId =
    fallbackId ??
    profile?.customer_id ??
    payload?.customer_id ??
    profile?.id ??
    payload?.id ??
    null
  const mapped = mapCustomer({
    ...profile,
    id: recordId,
    total_orders: stats.total_orders,
    total_spent: stats.total_spent,
  })
  return {
    ...mapped,
    id: recordId,
    recordId,
    raw: data,
    totalComplaints: Number(stats.total_complaints ?? 0),
  }
}

export function buildCustomerQueryParams({ search, status, perPage = 100 } = {}) {
  const params = { per_page: perPage }
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed
  const apiStatus = uiStatusToApi(status)
  if (apiStatus) params.status = apiStatus
  return params
}

/** جلب الزبائن مع استكمال الموقع من عناوين الشحن في الطلبات عند الحاجة */
export async function fetchCustomersList(params = {}) {
  const [customersResult, ordersResult] = await Promise.allSettled([
    getCustomers(params),
    getOrders({ per_page: 100 }),
  ])

  if (customersResult.status !== 'fulfilled') {
    throw customersResult.reason
  }

  const locationMap =
    ordersResult.status === 'fulfilled'
      ? buildCustomerLocationMap(extractOrderList(ordersResult.value))
      : new Map()

  const customers = extractCustomerList(customersResult.value)
    .map(mapCustomer)
    .map((customer) => applyCustomerLocation(customer, locationMap))

  return {
    customers,
    meta: extractPaginationMeta(customersResult.value),
    locationMap,
  }
}

export async function fetchCustomerDetail(id) {
  const [customerResult, ordersResult] = await Promise.allSettled([
    getCustomer(id),
    getOrders({ per_page: 100 }),
  ])

  if (customerResult.status !== 'fulfilled') {
    throw customerResult.reason
  }

  const mapped = mapCustomerDetail(customerResult.value, id)
  if (mapped.location !== '—') return mapped

  const locationMap =
    ordersResult.status === 'fulfilled'
      ? buildCustomerLocationMap(extractOrderList(ordersResult.value))
      : new Map()

  return applyCustomerLocation(mapped, locationMap)
}

export function buildCustomerStats(customers, meta = {}) {
  return {
    total: Number(meta.total ?? customers.length),
    active: customers.filter((c) => c.rawStatus === 'active' || c.status === 'نشط').length,
    disabled: customers.filter(
      (c) => c.rawStatus === 'inactive' || c.rawStatus === 'suspended' || c.rawStatus === 'banned' || c.status === 'معطل' || c.status === 'موقوف',
    ).length,
    orders: customers.reduce((sum, c) => sum + (c.orders || 0), 0),
  }
}

export function extractExportCustomerList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.customers)) return data.customers
  return []
}

export function customersToCsv(customers) {
  const header = 'الاسم,البريد الإلكتروني,الهاتف,الموقع,الطلبات,الإنفاق الكلي,تاريخ الانضمام,الحالة'
  const rows = customers.map(
    (c) => `${c.name},${c.email},${c.phone},${c.location},${c.orders},${c.totalSpent},${c.joinDate},${c.status}`,
  )
  return `\uFEFF${header}\n${rows.join('\n')}`
}
