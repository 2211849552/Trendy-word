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
