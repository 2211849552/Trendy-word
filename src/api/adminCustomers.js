import { apiRequest } from './client.js'

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
export function deactivateCustomer(id, reason) {
  return apiRequest(`/api/customers/${encodeURIComponent(String(id))}/deactivate`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

// POST /api/customers/{id}/reactivate
export function reactivateCustomer(id) {
  return apiRequest(`/api/customers/${encodeURIComponent(String(id))}/reactivate`, {
    method: 'POST',
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

function formatAddress(address) {
  if (!address) return '—'
  if (typeof address === 'string') return address
  if (typeof address === 'object') {
    return address.city ?? address.area ?? address.label ?? address.street ?? '—'
  }
  return '—'
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

export function mapCustomerDetail(data) {
  const payload = data?.data ?? data
  const profile = payload?.profile ?? payload
  const stats = payload?.stats ?? {}
  return {
    ...mapCustomer({
      ...profile,
      total_orders: stats.total_orders,
      total_spent: stats.total_spent,
    }),
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

export function buildCustomerStats(customers, meta = {}) {
  return {
    total: Number(meta.total ?? customers.length),
    active: customers.filter((c) => c.rawStatus === 'active' || c.status === 'نشط').length,
    disabled: customers.filter((c) => c.rawStatus === 'inactive' || c.status === 'معطل').length,
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
