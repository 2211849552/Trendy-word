import { apiRequest } from './client.js'

// GET /api/plans — عرض عام للتجار
export function getPlans(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/plans${query ? `?${query}` : ''}`)
}
