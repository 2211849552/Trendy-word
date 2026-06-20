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

// GET /api/admin/plans/subscriptions
export function getAdminPlanSubscriptions() {
  return apiRequest('/api/admin/plans/subscriptions')
}

export function extractPlanSubscriptionsList(data) {
  if (Array.isArray(data?.plans)) return data.plans
  if (Array.isArray(data?.data?.plans)) return data.data.plans
  return []
}

export function findPlanSubscriptions(data, planId) {
  const id = Number(planId)
  if (!Number.isFinite(id)) return []
  const plan = extractPlanSubscriptionsList(data).find((item) => Number(item.id) === id)
  return Array.isArray(plan?.stores) ? plan.stores : []
}

const SUBSCRIPTION_STATUS_LABELS = {
  active: 'نشط',
  scheduled: 'مجدول',
  expired: 'منتهي',
  cancelled: 'ملغى',
  inactive: 'غير نشط',
}

const STORE_STATUS_LABELS = {
  active: 'نشط',
  inactive: 'بانتظار الاشتراك',
  deactivated: 'معطّل',
}

export function formatPlanSubscriptionDate(value) {
  if (!value) return '—'
  const raw = String(value).trim()
  const parsed = new Date(raw.replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10)
  return parsed.toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function mapPlanSubscriptionStore(item) {
  const subscription = item?.subscription ?? {}
  const status = subscription.status ?? ''
  return {
    id: Number(item.id),
    name: item.name ?? '',
    status: item.status ?? '',
    statusLabel: STORE_STATUS_LABELS[item.status] ?? item.status ?? '—',
    subscription: {
      startsAt: subscription.starts_at ?? null,
      endsAt: subscription.ends_at ?? null,
      pricePaid: subscription.price_paid != null ? Number(subscription.price_paid) : null,
      status,
      statusLabel: SUBSCRIPTION_STATUS_LABELS[status] ?? status ?? '—',
    },
  }
}

export function extractPlanList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function readPlanSubscriberCount(item) {
  const direct =
    item?.stores_count ??
    item?.subscribers ??
    item?.subscribers_count ??
    item?.active_stores_count ??
    item?.subscribed_stores_count
  if (direct != null && direct !== '') {
    const parsed = Number(direct)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (Array.isArray(item?.stores)) return item.stores.length
  return 0
}

export function countSubscribersByPlanId(subscriptionsData) {
  const counts = new Map()
  extractPlanSubscriptionsList(subscriptionsData).forEach((item) => {
    const id = Number(item.id)
    if (!Number.isFinite(id)) return
    counts.set(id, readPlanSubscriberCount(item))
  })
  return counts
}

export function mergePlansWithSubscriberCounts(plans, subscriptionsData) {
  const counts = countSubscribersByPlanId(subscriptionsData)
  if (counts.size === 0) return plans
  return plans.map((plan) => ({
    ...plan,
    subscribers: counts.has(plan.id) ? counts.get(plan.id) : plan.subscribers,
  }))
}

export function mergePlansWithFinanceCounts(plans, financePayload) {
  const root = financePayload?.data ?? financePayload ?? {}
  const breakdown = root.plans ?? root.by_plan ?? root.plan_stats ?? root.breakdown
  if (!Array.isArray(breakdown)) return plans

  const counts = new Map()
  breakdown.forEach((item) => {
    const id = Number(item.plan_id ?? item.id)
    if (!Number.isFinite(id)) return
    counts.set(id, readPlanSubscriberCount(item))
  })

  if (counts.size === 0) return plans
  return plans.map((plan) => ({
    ...plan,
    subscribers: counts.has(plan.id) ? counts.get(plan.id) : plan.subscribers,
  }))
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
    subscribers: readPlanSubscriberCount(item),
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
