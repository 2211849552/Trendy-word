import { apiRequest } from './client.js'

// [2.5] إدارة خطط الاشتراك — للإدارة
// GET /api/admin/plans
export function getAdminPlans(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/plans${query ? `?${query}` : ''}`)
}

// POST /api/admin/plans
export function createAdminPlan(body) {
  return apiRequest('/api/admin/plans', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/admin/plans/{plan}
export function getAdminPlan(plan) {
  return apiRequest(`/api/admin/plans/${plan}`)
}

// PUT /api/admin/plans/{plan}
export function updateAdminPlan(plan, body) {
  return apiRequest(`/api/admin/plans/${plan}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/admin/plans/{plan}
export function deleteAdminPlan(plan) {
  const id = encodeURIComponent(String(plan))
  return apiRequest(`/api/admin/plans/${id}`, {
    method: 'DELETE',
  })
}

export function extractPlanList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function durationToDays(duration) {
  return duration === 'yearly' ? 365 : 30
}

export function daysToDuration(days) {
  return Number(days) >= 365 ? 'yearly' : 'monthly'
}

export function mapPlan(item) {
  return {
    id: Number(item.id),
    name: item.name ?? '',
    price: Number(item.price ?? 0),
    duration: daysToDuration(item.duration_days),
    durationDays: item.duration_days ?? 30,
    status: item.is_active === false ? 'paused' : 'active',
    subscribers: item.stores_count ?? item.subscribers ?? 0,
    commissionRate: item.commission_rate ?? null,
    features: Array.isArray(item.features) ? item.features : [],
    createdAt: item.created_at?.slice(0, 10) ?? '',
  }
}

export function mapPlanDetail(data) {
  return mapPlan(data?.data ?? data)
}

export function toPlanPayload(form) {
  return {
    name: form.name.trim(),
    price: Number(form.price),
    duration_days: Number(form.durationDays) || durationToDays(form.duration),
    is_active: form.status !== 'paused',
  }
}
