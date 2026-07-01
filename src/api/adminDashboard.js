import { apiRequest } from './client.js'
import { getAdminStores, extractStoreList } from './adminStores.js'
import {
  getEmployees,
  extractEmployeeList,
  extractPaginationMeta as extractEmployeeMeta,
} from './adminEmployees.js'
import {
  getCustomers,
  extractCustomerList,
  extractPaginationMeta as extractCustomerMeta,
} from './adminCustomers.js'
import {
  getOrders,
  extractOrderList,
  extractOrderMeta,
  mapOrder,
  buildOrderStats,
} from './adminOrders.js'

// [2.6] إحصائيات لوحة التحكم — Admin Dashboard
export function getTotalStores() {
  return apiRequest('/api/admin/dashboard/total-stores')
}

export function getTotalCustomers() {
  return apiRequest('/api/admin/dashboard/total-customers')
}

export function getTotalOrders() {
  return apiRequest('/api/admin/dashboard/total-orders')
}

export function getTotalPlatformStaff() {
  return apiRequest('/api/admin/dashboard/total-platform-staff')
}

// GET /api/admin/dashboard/payment-methods-stats
export function getPaymentMethodsStats(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/dashboard/payment-methods-stats${query ? `?${query}` : ''}`)
}

export function getStoreTotalNewOrders(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/stores/dashboard/total-new-orders${query ? `?${query}` : ''}`)
}

function readCount(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function extractPaginationMeta(data) {
  return data?.meta ?? data?.pagination ?? {}
}

export function extractDashboardCount(data, preferredKeys = []) {
  const keys = [...preferredKeys, 'total', 'count', 'value', 'amount']

  const payloads = [data?.data, data]
  for (const payload of payloads) {
    if (payload == null) continue

    const direct = readCount(payload)
    if (direct != null && typeof payload !== 'object') return direct

    if (typeof payload === 'object' && !Array.isArray(payload)) {
      for (const key of keys) {
        const parsed = readCount(payload[key])
        if (parsed != null) return parsed
      }
    }
  }

  return null
}

async function countFromList(fetchList, extractList, extractMeta, perPage = 100) {
  const data = await fetchList({ per_page: perPage })
  const fromMeta = readCount(extractMeta(data)?.total)
  if (fromMeta != null) return fromMeta
  return extractList(data).length
}

async function resolveCount({
  dashboardCall,
  dashboardKeys = [],
  listCall,
  extractList,
  extractMeta,
}) {
  let dashboardCount = null

  try {
    const data = await dashboardCall()
    dashboardCount = extractDashboardCount(data, dashboardKeys)
  } catch {
    dashboardCount = null
  }

  let listCount = null
  try {
    listCount = await countFromList(listCall, extractList, extractMeta)
  } catch {
    listCount = null
  }

  if (dashboardCount != null && dashboardCount > 0) return dashboardCount
  if (listCount != null && listCount > 0) return listCount
  if (dashboardCount != null) return dashboardCount
  if (listCount != null) return listCount
  return 0
}

export function extractStoreNewOrdersList(data) {
  const payload = data?.data ?? data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.stores)) return payload.stores
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(data?.stores)) return data.stores
  return []
}

export function mapStoreNewOrders(item) {
  return {
    storeId: item.store_id ?? item.id ?? '',
    storeName: item.store_name ?? item.name ?? item.store?.name ?? '—',
    count: Number(
      item.new_orders ??
      item.total_new_orders ??
      item.count ??
      item.total ??
      0,
    ),
  }
}

const NEW_ORDER_STATUSES = new Set(['pending', 'pending_admin', 'processing'])

async function fetchNewOrdersByStoreFallback() {
  const data = await getOrders({ per_page: 100 })
  const orders = extractOrderList(data).map(mapOrder)
  const grouped = new Map()

  orders
    .filter((order) => NEW_ORDER_STATUSES.has(order.rawStatus))
    .forEach((order) => {
      const storeName = order.store || '—'
      grouped.set(storeName, (grouped.get(storeName) ?? 0) + 1)
    })

  return [...grouped.entries()].map(([storeName, count]) => ({
    storeId: storeName,
    storeName,
    count,
  }))
}

export async function fetchOverviewStats() {
  const errors = {}

  const [stores, customers, staff] = await Promise.all([
    resolveCount({
      dashboardCall: getTotalStores,
      dashboardKeys: ['total_stores', 'stores_count', 'stores'],
      listCall: getAdminStores,
      extractList: extractStoreList,
      extractMeta: extractPaginationMeta,
    }).catch((err) => {
      errors.stores = err
      return 0
    }),
    resolveCount({
      dashboardCall: getTotalCustomers,
      dashboardKeys: ['total_customers', 'customers_count', 'customers'],
      listCall: getCustomers,
      extractList: extractCustomerList,
      extractMeta: extractCustomerMeta,
    }).catch((err) => {
      errors.customers = err
      return 0
    }),
    resolveCount({
      dashboardCall: getTotalPlatformStaff,
      dashboardKeys: ['total_platform_staff', 'total_staff', 'staff_count', 'employees'],
      listCall: getEmployees,
      extractList: extractEmployeeList,
      extractMeta: extractEmployeeMeta,
    }).catch((err) => {
      errors.staff = err
      return 0
    }),
  ])

  let storeNewOrders = []
  let totalNewOrders = 0

  try {
    const ordersData = await getStoreTotalNewOrders()
    storeNewOrders = extractStoreNewOrdersList(ordersData)
      .map(mapStoreNewOrders)
      .filter((row) => row.storeName !== '—' || row.count > 0)

    const dashboardTotal = extractDashboardCount(ordersData, [
      'total_new_orders',
      'new_orders',
      'total_orders',
    ])
    totalNewOrders =
      dashboardTotal != null && dashboardTotal > 0
        ? dashboardTotal
        : storeNewOrders.reduce((sum, row) => sum + row.count, 0)
  } catch (err) {
    errors.orders = err
    try {
      const ordersData = await getOrders({ per_page: 100 })
      const orders = extractOrderList(ordersData).map(mapOrder)
      const orderStats = buildOrderStats(orders, extractOrderMeta(ordersData))
      totalNewOrders = orderStats.newOrders

      storeNewOrders = await fetchNewOrdersByStoreFallback()
      if (totalNewOrders === 0) {
        totalNewOrders = storeNewOrders.reduce((sum, row) => sum + row.count, 0)
      }
    } catch (fallbackErr) {
      errors.orders = fallbackErr
    }
  }

  if (storeNewOrders.length === 0 && totalNewOrders > 0) {
    try {
      storeNewOrders = await fetchNewOrdersByStoreFallback()
    } catch {
      // keep empty per-store rows
    }
  }

  return {
    stores,
    customers,
    staff,
    storeNewOrders,
    totalNewOrders,
    errors,
  }
}

export function formatDashboardNumber(value) {
  if (value == null) return '...'
  return Number(value).toLocaleString('ar-LY')
}
