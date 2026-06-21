import { apiRequest } from './client.js'
import { withQuery } from './helpers.js'
import { getOrders, extractOrderMeta, extractOrderList } from './adminOrders.js'
import { getAdminStore } from './adminStores.js'

// GET /api/stores?name=&type=&per_page=20
export function getStores(params = {}) {
  return apiRequest(withQuery('/api/stores', params))
}

// GET /api/stores/{store}
export function getStore(store) {
  return apiRequest(`/api/stores/${store}`)
}

// POST /api/stores/join
export function joinStore(body) {
  return apiRequest('/api/stores/join', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/stores/subscribe
export function subscribeStore(body) {
  return apiRequest('/api/stores/subscribe', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/stores/wallet/charge
export function chargeStoreWallet(body) {
  return apiRequest('/api/stores/wallet/charge', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/stores/wallet/withdraw
export function withdrawStoreWallet(body) {
  return apiRequest('/api/stores/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/stores/dashboard/total-new-orders
export function getStoreTotalNewOrders(params = {}) {
  return apiRequest(withQuery('/api/stores/dashboard/total-new-orders', params))
}

// GET /api/stores/dashboard/total-employees
export function getStoreTotalEmployees(params = {}) {
  return apiRequest(withQuery('/api/stores/dashboard/total-employees', params))
}

// GET /api/stores/custody/summary
export function getStoreCustodySummary(params = {}) {
  return apiRequest(withQuery('/api/stores/custody/summary', params))
}

// GET /api/stores/custody/logs
export function getStoreCustodyLogs(params = {}) {
  return apiRequest(withQuery('/api/stores/custody/logs', params))
}

async function loadAdminStoreCustodySummary(storeId) {
  const data = await getAdminStore(storeId)
  const item = data?.data ?? data
  const totalOwed = Number(
    item?.total_custody_owed ??
    item?.custody_balance ??
    item?.custody_owed ??
    0,
  )
  const pending = totalOwed > 0

  return {
    data: {
      total_custody_owed: totalOwed,
      total_owed: totalOwed,
      custody_orders_count: item?.custody_orders_count ?? item?.pending_custody_orders_count ?? null,
      last_settled_at: item?.last_settled_at ?? item?.custody_last_settled_at ?? null,
      status: item?.custody_status ?? (pending ? 'pending_settlement' : 'settled'),
      status_text: item?.custody_status_text ?? (pending ? 'بانتظار التسوية' : 'لا توجد عهدة مستحقة'),
      currency: item?.currency ?? 'LYD',
    },
  }
}

/**
 * مسار /api/stores/custody/* لا يشمل stores_admin في الباك اند —
 * عند 403 نكمّل من GET /api/admin/stores/{store} (مسموح لمسؤول المتاجر).
 */
export async function getStoreCustodySummaryForStore(storeId) {
  try {
    return await getStoreCustodySummary({ store_id: storeId })
  } catch (err) {
    if (err?.status !== 403) throw err
    return loadAdminStoreCustodySummary(storeId)
  }
}

export async function getStoreCustodyLogsForStore(storeId, params = {}) {
  try {
    return await getStoreCustodyLogs({ store_id: storeId, per_page: 10, ...params })
  } catch (err) {
    if (err?.status !== 403) throw err
    return { data: [] }
  }
}

export function extractCustodyLogs(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function readOrderCount(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function pickOrderCount(...values) {
  for (const value of values) {
    const count = readOrderCount(value)
    if (count != null) return count
  }
  return null
}

/** عدد طلبات العهدة غير المسوّاة — GET /api/stores/custody/summary */
export function extractCustodyPendingOrderCount(data) {
  const item = data?.data ?? data
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null

  return pickOrderCount(
    item.number_of_orders,
    item.pending_orders_count,
    item.custody_orders_count,
    item.unsettled_orders_count,
  )
}

/** إجمالي طلبات المتجر من تفاصيل المتجر — GET /api/admin/stores/{store} */
export function extractStoreOrderCount(data) {
  const item = data?.data ?? data
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null

  return pickOrderCount(
    item.orders_count,
    item.total_orders,
    item.stats?.orders_count,
    item.stats?.total_orders,
    item.metrics?.orders_count,
    item.metrics?.total_orders,
    item.orders?.count,
    typeof item.orders === 'number' ? item.orders : null,
  )
}

function orderBelongsToStore(order, storeId, storeName = '') {
  const id = Number(storeId)
  const orderStoreId = Number(order?.store_id ?? order?.store?.id ?? order?.storeId ?? 0)
  if (Number.isFinite(orderStoreId) && orderStoreId > 0 && orderStoreId === id) return true

  if (!storeName) return false
  const name = String(order?.store_name ?? order?.store?.name ?? '').trim()
  return name !== '' && name === String(storeName).trim()
}

async function countOrdersFromList(storeId, storeName = '') {
  let page = 1
  let lastPage = 1
  let count = 0

  do {
    const data = await getOrders({ per_page: 100, page })
    const list = extractOrderList(data)
    const meta = extractOrderMeta(data)
    count += list.filter((order) => orderBelongsToStore(order, storeId, storeName)).length
    lastPage = Number(meta.last_page ?? 1)
    page += 1
  } while (page <= lastPage)

  return count
}

async function countOrdersFromFilteredApi(storeId) {
  const filterParams = [
    { store_id: storeId, per_page: 1 },
    { store: storeId, per_page: 1 },
  ]

  for (const params of filterParams) {
    try {
      const data = await getOrders(params)
      const metaTotal = readOrderCount(extractOrderMeta(data)?.total)
      const list = extractOrderList(data)
      const filterLooksApplied = list.length === 0
        || list.every((order) => orderBelongsToStore(order, storeId))

      if (metaTotal != null && filterLooksApplied) return metaTotal
    } catch {
      // try next filter shape
    }
  }

  return null
}

export function mapCustodySummary(data) {
  const item = data?.data ?? data
  return {
    totalOwed: Number(item?.total_custody_owed ?? item?.total_owed ?? 0),
    numberOfOrders: extractCustodyPendingOrderCount(data) ?? 0,
    lastSettledAt: item?.last_settled_at ?? null,
    status: item?.status ?? 'settled',
    statusText: item?.status_text ?? '—',
    totalProfits: Number(item?.total_profits ?? 0),
    currency: item?.currency ?? 'LYD',
  }
}

/**
 * إجمالي طلبات المتجر — api.md:
 * 1. GET /api/admin/stores/{store}
 * 2. GET /api/orders?store_id= (meta.total)
 * 3. GET /api/orders (عدّ يدوي حسب store_id)
 */
export async function fetchStoreOrdersCount(storeId, { storeName = '', knownCount = null } = {}) {
  const id = Number(storeId)
  if (!Number.isFinite(id) || id <= 0) return 0

  const preset = readOrderCount(knownCount)
  if (preset != null) return preset

  try {
    const storeData = await getAdminStore(id)
    const fromStore = extractStoreOrderCount(storeData)
    if (fromStore != null) return fromStore
  } catch {
    // ignore and try fallbacks
  }

  try {
    const fromFiltered = await countOrdersFromFilteredApi(id)
    if (fromFiltered != null) return fromFiltered
  } catch {
    // ignore and try fallbacks
  }

  try {
    return await countOrdersFromList(id, storeName)
  } catch {
    return 0
  }
}

export function mapCustodyLog(item) {
  return {
    id: item.id,
    date: item.date ?? null,
    action: item.action ?? '—',
    type: item.type ?? '',
    amount: Number(item.amount ?? 0),
    amountFormatted: item.amount_formatted ?? String(item.amount ?? 0),
    balanceAfter: Number(item.balance_after ?? 0),
  }
}

export function formatCustodyDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCustodyAmount(value, currency = 'LYD') {
  const amount = Number(value)
  if (Number.isNaN(amount)) return '—'
  const label = currency === 'LYD' ? 'د.ل' : currency
  return `${amount.toFixed(2)} ${label}`
}

// POST /api/stores/{store}/renew
export function renewStorePlan(store, body = {}) {
  return apiRequest(`/api/stores/${store}/renew`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/stores/{store}/change-plan/{plan}
export function changeStorePlan(store, plan, body = {}) {
  return apiRequest(`/api/stores/${store}/change-plan/${plan}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/stores/{store}/campaigns/subscribe
export function subscribeStoreToCampaign(store, body) {
  return apiRequest(`/api/stores/${store}/campaigns/subscribe`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// POST /api/stores/{store}/campaign-subscribe
export function subscribeStoreCampaign(store, body) {
  return apiRequest(`/api/stores/${store}/campaign-subscribe`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
