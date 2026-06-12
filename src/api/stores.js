import { apiRequest } from './client.js'
import { withQuery } from './helpers.js'

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

export function getStoreCustodySummaryForStore(storeId) {
  return getStoreCustodySummary({ store_id: storeId })
}

export function getStoreCustodyLogsForStore(storeId, params = {}) {
  return getStoreCustodyLogs({ store_id: storeId, per_page: 10, ...params })
}

export function extractCustodyLogs(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function mapCustodySummary(data) {
  const item = data?.data ?? data
  return {
    totalOwed: Number(item?.total_custody_owed ?? 0),
    numberOfOrders: Number(item?.number_of_orders ?? 0),
    lastSettledAt: item?.last_settled_at ?? null,
    status: item?.status ?? 'settled',
    statusText: item?.status_text ?? '—',
    totalProfits: Number(item?.total_profits ?? 0),
    currency: item?.currency ?? 'LYD',
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
