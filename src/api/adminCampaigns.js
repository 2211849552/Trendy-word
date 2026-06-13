import { apiRequest } from './client.js'
import { extractMediaUrls } from '../utils/mediaUrl.js'

// [2.4] إدارة الحملات الترويجية — للإدارة
// GET /api/admin/campaigns
export function getAdminCampaigns(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/campaigns${query ? `?${query}` : ''}`)
}

// POST /api/admin/campaigns — يدعم JSON أو multipart/form-data (banner_image)
export function createAdminCampaign(body) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  return apiRequest('/api/admin/campaigns', {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
  })
}

// GET /api/admin/campaigns/{campaign}
export function getAdminCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${encodeURIComponent(String(campaign))}`)
}

// PUT /api/admin/campaigns/{campaign} — يدعم JSON أو multipart/form-data (banner_image)
export function updateAdminCampaign(campaign, body) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const path = `/api/admin/campaigns/${encodeURIComponent(String(campaign))}`
  if (isFormData) {
    body.append('_method', 'PUT')
    return apiRequest(path, { method: 'POST', body })
  }
  return apiRequest(path, {
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

/** تاريخ اليوم بصيغة YYYY-MM-DD (توقيت المتصفح المحلي) */
export function getTodayIsoDate(ref = new Date()) {
  const y = ref.getFullYear()
  const m = String(ref.getMonth() + 1).padStart(2, '0')
  const d = String(ref.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** توحيد التاريخ القادم من API إلى YYYY-MM-DD */
export function normalizeCampaignDate(value) {
  if (!value) return ''
  const raw = String(value).trim()

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
  if (dmy) {
    const day = dmy[1].padStart(2, '0')
    const month = dmy[2].padStart(2, '0')
    return `${dmy[3]}-${month}-${day}`
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return getTodayIsoDate(parsed)

  return raw.slice(0, 10)
}

/** عرض التاريخ بشكل واضح للمستخدم العربي */
export function formatCampaignDateDisplay(value) {
  const iso = normalizeCampaignDate(value)
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/** هل اليوم ضمن فترة الحملة؟ */
export function isCampaignWithinSchedule(campaign, ref = new Date()) {
  const from = normalizeCampaignDate(campaign?.dateFrom)
  const to = normalizeCampaignDate(campaign?.dateTo)
  if (!from || !to) return true
  const today = getTodayIsoDate(ref)
  return today >= from && today <= to
}

export function getCampaignActivationHint(campaign, ref = new Date()) {
  const from = normalizeCampaignDate(campaign?.dateFrom)
  const to = normalizeCampaignDate(campaign?.dateTo)
  const today = getTodayIsoDate(ref)

  if (!from || !to) return null
  if (today < from) {
    return `لا يمكن التفعيل الآن. تبدأ الحملة في ${formatCampaignDateDisplay(from)} (اليوم: ${formatCampaignDateDisplay(today)}).`
  }
  if (today > to) {
    return `انتهت صلاحية الحملة في ${formatCampaignDateDisplay(to)}. عدّلي تاريخ الانتهاء ثم أعيدي المحاولة.`
  }
  return null
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
    bannerImage: item.banner_image ?? item.banner_url ?? item.image ?? null,
    bannerImageUrl:
      extractMediaUrls(
        item.banner_image,
        item.banner_url,
        item.image,
        item.image_url,
        item.media,
        item.banner,
      )[0] ?? null,
    dateFrom: normalizeCampaignDate(item.start_date ?? item.date_from ?? item.dateFrom),
    dateTo: normalizeCampaignDate(item.end_date ?? item.date_to ?? item.dateTo),
    status: mapped.status,
    paused: mapped.paused,
    stores: item.store_subscriptions_count ?? item.stores_count ?? item.stores ?? 0,
    products: item.products_count ?? item.products ?? 0,
    views: item.views_count ?? item.views ?? 0,
    rawStatus: item.status ?? '',
    price: item.price ?? 0.00,
  }
}

export function mapCampaignDetail(data) {
  return mapCampaign(data?.data ?? data)
}

export const CAMPAIGN_IMAGE_MAX_BYTES = 2 * 1024 * 1024
export const CAMPAIGN_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateCampaignImage(file) {
  if (!file) return null
  if (!CAMPAIGN_IMAGE_TYPES.includes(file.type)) {
    return 'صيغة الصورة غير مدعومة. استخدمي JPEG أو PNG أو WebP.'
  }
  if (file.size > CAMPAIGN_IMAGE_MAX_BYTES) {
    return 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت.'
  }
  return null
}

export function toCampaignPayload(form) {
  const startDate = normalizeCampaignDate(form.dateFrom)
  const endDate = normalizeCampaignDate(form.dateTo)
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    start_date: `${startDate} 00:00:00`,
    end_date: `${endDate} 23:59:59`,
    price: form.price != null && form.price !== '' ? Number(form.price) : 0.00,
  }
  const link = form.link?.trim()
  if (link) payload.link = link
  return payload
}

/** بناء FormData لإنشاء/تعديل حملة مع صورة — multipart/form-data حسب api.md */
export function toCampaignFormData(form) {
  const fd = new FormData()
  const payload = toCampaignPayload(form)
  Object.entries(payload).forEach(([key, value]) => {
    if (value != null && value !== '') fd.append(key, String(value))
  })
  if (form.bannerImage instanceof File) {
    fd.append('banner_image', form.bannerImage)
  }
  return fd
}

export function toCampaignRequestBody(form) {
  if (form.bannerImage instanceof File) return toCampaignFormData(form)
  return toCampaignPayload(form)
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
