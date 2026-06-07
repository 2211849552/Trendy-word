import { apiRequest } from './client.js'

// [2.4] إدارة الحملات الترويجية — للإدارة
// GET /api/admin/campaigns
export function getAdminCampaigns(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/campaigns${query ? `?${query}` : ''}`)
}

// POST /api/admin/campaigns
export function createAdminCampaign(body) {
  return apiRequest('/api/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/admin/campaigns/{campaign}
export function getAdminCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${encodeURIComponent(String(campaign))}`)
}

// PUT /api/admin/campaigns/{campaign}
export function updateAdminCampaign(campaign, body) {
  return apiRequest(`/api/admin/campaigns/${encodeURIComponent(String(campaign))}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/admin/campaigns/{campaign}
export function deleteAdminCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${encodeURIComponent(String(campaign))}`, {
    method: 'DELETE',
  })
}

// POST /api/admin/campaigns/{campaign}/activate
export function activateCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${encodeURIComponent(String(campaign))}/activate`, {
    method: 'POST',
  })
}

// POST /api/admin/campaigns/{campaign}/deactivate
export function deactivateCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${encodeURIComponent(String(campaign))}/deactivate`, {
    method: 'POST',
  })
}

export function extractCampaignList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function sliceDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

export function mapApiStatusToUi(status) {
  if (status === 'paused' || status === 'inactive') {
    return { status: 'stopped', paused: true }
  }
  if (status === 'active') return { status: 'active', paused: false }
  if (status === 'scheduled') return { status: 'scheduled', paused: false }
  if (status === 'finished' || status === 'expired') {
    return { status: 'finished', paused: false }
  }
  return { status: 'scheduled', paused: false }
}

export function uiFilterToApiStatus(filter) {
  if (!filter || filter === 'all') return null
  if (filter === 'stopped') return 'paused'
  return filter
}

export function mapCampaign(item) {
  const mapped = mapApiStatusToUi(item.status)
  return {
    id: Number(item.id),
    title: item.name ?? item.title ?? '',
    description: item.description ?? '',
    link: item.link ?? item.url ?? '',
    bannerImage: item.banner_image ?? null,
    dateFrom: sliceDate(item.start_date ?? item.date_from ?? item.dateFrom),
    dateTo: sliceDate(item.end_date ?? item.date_to ?? item.dateTo),
    status: mapped.status,
    paused: mapped.paused,
    stores: item.store_subscriptions_count ?? item.stores_count ?? item.stores ?? 0,
    products: item.products_count ?? item.products ?? 0,
    views: item.views_count ?? item.views ?? 0,
    rawStatus: item.status ?? '',
  }
}

export function mapCampaignDetail(data) {
  return mapCampaign(data?.data ?? data)
}

export function toCampaignPayload(form) {
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    start_date: form.dateFrom,
    end_date: form.dateTo,
  }
  const link = form.link?.trim()
  if (link) payload.link = link
  return payload
}

export function buildPerformanceSeries(campaigns) {
  return campaigns.map((c) => ({
    name: c.title.length > 22 ? `${c.title.slice(0, 22)}…` : c.title,
    views: c.views || 0,
    products: c.products || 0,
    stores: c.stores || 0,
  }))
}

export function buildMarketingStats(campaigns) {
  const totalViews = campaigns.reduce((sum, c) => sum + (c.views || 0), 0)
  const finished = campaigns.filter((c) => c.status === 'finished').length
  const scheduled = campaigns.filter((c) => c.status === 'scheduled').length
  const active = campaigns.filter((c) => c.status === 'active').length

  return {
    totalViews: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : String(totalViews),
    viewsChange: '—',
    expired: finished,
    scheduled,
    active,
    activeChange: '—',
  }
}

export function filterCampaignsByUiStatus(campaigns, filter) {
  if (!filter || filter === 'all') return campaigns
  return campaigns.filter((c) => c.status === filter)
}
