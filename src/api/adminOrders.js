import { apiRequest } from './client.js'

// [16] إدارة الطلبات
// GET /api/orders — عرض القائمة والبحث والفلترة
export function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/orders${query ? `?${query}` : ''}`)
}

// GET /api/orders/{id}
export function getOrder(id) {
  return apiRequest(`/api/orders/${encodeURIComponent(String(id))}`)
}

// PATCH /api/orders/{id}/status
export function updateOrderStatus(id, body) {
  return apiRequest(`/api/orders/${encodeURIComponent(String(id))}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

// POST /api/orders/{id}/cancel
export function cancelOrder(id, reason) {
  return apiRequest(`/api/orders/${encodeURIComponent(String(id))}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

// POST /api/admin/orders/{id}/reassign — driver_id = driver_profiles.id (ليس users.id)
export function reassignOrder(id, driverProfileId) {
  const body =
    driverProfileId != null && driverProfileId !== ''
      ? { driver_id: Number(driverProfileId) }
      : {}
  return apiRequest(`/api/admin/orders/${encodeURIComponent(String(id))}/reassign`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'processing', label: 'قيد التجهيز' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'out_for_delivery', label: 'قيد التوصيل' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' },
]

export function extractOrderList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function extractOrderMeta(data) {
  return data?.meta ?? {}
}

const STATUS_UI = {
  pending: 'قيد التنفيذ',
  pending_admin: 'قيد التنفيذ',
  processing: 'قيد التنفيذ',
  shipped: 'قيد الشحن',
  out_for_delivery: 'قيد الشحن',
  delivered: 'تم التسليم',
  completed: 'تم التسليم',
  cancelled: 'ملغي',
  returned: 'ملغي',
}

const STATUS_GROUPS = {
  'قيد التنفيذ': ['pending', 'pending_admin', 'processing'],
  'قيد الشحن': ['shipped', 'out_for_delivery'],
  'تم التسليم': ['delivered', 'completed'],
  ملغي: ['cancelled', 'returned'],
}

const PAYMENT_UI = {
  wallet: 'محفظة',
  card: 'محفظة',
  electronic_wallet: 'محفظة',
  cash: 'نقدي',
  cash_on_delivery: 'نقدي',
  cod: 'نقدي',
}

export function mapOrderStatus(status) {
  return STATUS_UI[status] ?? status ?? '—'
}

export function mapPaymentMethod(method) {
  const key = String(method ?? '').toLowerCase()
  if (key.includes('wallet') || key.includes('card') || key.includes('electronic')) {
    return PAYMENT_UI.wallet
  }
  if (key.includes('cash') || key.includes('cod')) return PAYMENT_UI.cash
  return PAYMENT_UI[key] ?? method ?? '—'
}

function formatDate(value) {
  if (!value) return '—'
  return String(value).slice(0, 10)
}

function countItems(items) {
  if (!Array.isArray(items) || !items.length) return '—'
  const total = items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
  return total === 1 ? '1 منتج' : `${total} منتجات`
}

export function mapOrder(item) {
  const rawStatus = item.status ?? ''
  return {
    id: item.order_number ?? `ORD-${item.id}`,
    orderId: Number(item.id),
    customer: item.customer_name ?? '—',
    customerPhone: item.customer_phone ?? '—',
    store: item.store_name ?? '—',
    driver: item.driver_name ?? '—',
    products: countItems(item.items),
    total: Number(item.total_amount ?? 0),
    payment: mapPaymentMethod(item.payment_method),
    rawPayment: item.payment_method ?? '',
    paymentStatus: item.payment_status ?? '',
    date: formatDate(item.created_at),
    status: mapOrderStatus(rawStatus),
    rawStatus,
    items: item.items ?? [],
    shippingAddress: item.shipping_address ?? null,
    timeline: item.timeline ?? [],
    cancellationReason: item.cancellation_reason ?? '',
    deliveredAt: item.delivered_at ?? null,
    raw: item,
  }
}

export function mapOrderDetail(data) {
  const item = data?.data ?? data
  return mapOrder(item)
}

export function buildOrderQueryParams({ search, perPage = 100 } = {}) {
  const params = { per_page: perPage }
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed
  return params
}

export function filterOrdersClient(orders, { status } = {}) {
  if (!status || status === 'جميع الحالات') return orders
  const group = STATUS_GROUPS[status]
  if (!group) return orders.filter((order) => order.status === status)
  return orders.filter((order) => group.includes(order.rawStatus))
}

export function buildOrderStats(orders, meta = {}) {
  const countByGroup = (statuses) =>
    orders.filter((order) => statuses.includes(order.rawStatus)).length

  return {
    total: Number(meta.total ?? orders.length),
    newOrders: countByGroup(['pending', 'pending_admin', 'processing']),
    shipping: countByGroup(['shipped', 'out_for_delivery']),
    delivered: countByGroup(['delivered', 'completed']),
    cancelled: countByGroup(['cancelled', 'returned']),
  }
}
