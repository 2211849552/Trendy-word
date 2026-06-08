import { apiRequest } from './client.js'

// أرباح المنصة — لوحة الإدارة
// GET /api/admin/finance/ad-profits
export function getAdProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/ad-profits${query ? `?${query}` : ''}`)
}

// GET /api/admin/finance/subscription-profits
export function getSubscriptionProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/subscription-profits${query ? `?${query}` : ''}`)
}

// GET /api/admin/finance/delivery-profits
export function getDeliveryProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/delivery-profits${query ? `?${query}` : ''}`)
}

// GET /api/admin/finance/platform-earnings
export function getPlatformEarnings(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/platform-earnings${query ? `?${query}` : ''}`)
}

export function extractFinancePayload(data) {
  return data?.data ?? data ?? {}
}

export function pickFinanceAmount(payload, ...keys) {
  for (const key of keys) {
    if (payload?.[key] != null && payload[key] !== '') return payload[key]
  }
  return null
}
