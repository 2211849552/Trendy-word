import { apiRequest } from './client.js'

// أرباح المنصة — لوحة الإدارة
// GET /api/v1/admin/finance/ad-profits
export function getAdProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/finance/ad-profits${query ? `?${query}` : ''}`)
}

// GET /api/v1/admin/finance/subscription-profits
export function getSubscriptionProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/finance/subscription-profits${query ? `?${query}` : ''}`)
}

// GET /api/v1/admin/finance/delivery-profits
export function getDeliveryProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/finance/delivery-profits${query ? `?${query}` : ''}`)
}

// GET /api/v1/admin/finance/platform-earnings
export function getPlatformEarnings(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/finance/platform-earnings${query ? `?${query}` : ''}`)
}
