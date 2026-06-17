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

function readCampaignCount(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** استخراج عدد من الحقول المحتملة في استجابة Laravel */
export function pickCampaignCount(item, keys) {
  for (const key of keys) {
    const direct = readCampaignCount(item?.[key])
    if (direct != null) return direct
  }

  const nested = item?.stats ?? item?.metrics ?? item?.counts ?? null
  if (nested && typeof nested === 'object') {
    for (const key of keys) {
      const parsed = readCampaignCount(nested[key])
      if (parsed != null) return parsed
    }
  }

  return null
}

export function pickCampaignStores(item) {
  return (
    pickCampaignCount(item, [
      'store_subscriptions_count',
      'stores_count',
      'subscriptions_count',
      'subscribers_count',
      'stores',
      'storeSubscriptionsCount',
      'storesCount',
    ]) ??
    (Array.isArray(item?.store_subscriptions) ? item.store_subscriptions.length : null) ??
    0
  )
}

export function pickCampaignProducts(item) {
  return (
    pickCampaignCount(item, [
      'products_count',
      'total_products',
      'products',
      'productsCount',
      'totalProducts',
    ]) ??
    (Array.isArray(item?.products) ? item.products.length : null) ??
    0
  )
}

export function pickCampaignViews(item) {
  return (
    pickCampaignCount(item, [
      'views_count',
      'total_views',
      'views',
      'viewsCount',
      'totalViews',
    ]) ?? 0
  )
}

/** دمج بيانات القائمة مع تفاصيل الحملة (الإحصائيات غالباً في show فقط) */
export function mergeCampaignSources(summary, detail) {
  const extra = detail?.data ?? detail ?? {}
  return mapCampaign({ ...summary, ...extra })
}

/** جلب القائمة ثم إثراء كل حملة بتفاصيلها لعرض الأرقام الصحيحة */
export async function fetchAdminCampaignsWithMetrics(params = {}) {
  const data = await getAdminCampaigns(params)
  const list = extractCampaignList(data)
  if (list.length === 0) return []

  const enriched = await Promise.all(
    list.map(async (item) => {
      const id = item?.id
      if (id == null || id === '') return mapCampaign(item)
      try {
        const detail = await getAdminCampaign(id)
        return mergeCampaignSources(item, detail)
      } catch {
        return mapCampaign(item)
      }
    }),
  )

  return enriched
}

/** تاريخ اليوم بصيغة YYYY-MM-DD (توقيت المتصفح المحلي) */
export function getTodayIsoDate(ref = new Date()) {
  const y = ref.getFullYear()
  const m = String(ref.getMonth() + 1).padStart(2, '0')
  const d = String(ref.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** تاريخ اليوم بصيغة YYYY-MM-DD (UTC — يطابق تحقق Laravel after_or_equal:today) */
export function getUtcTodayIsoDate(ref = new Date()) {
  const y = ref.getUTCFullYear()
  const m = String(ref.getUTCMonth() + 1).padStart(2, '0')
  const d = String(ref.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** تحويل تاريخ البدء المحلي إلى قيمة يقبلها الخادم */
function toApiStartDate(dateFrom) {
  const selected = normalizeCampaignDate(dateFrom)
  if (!selected) return selected

  const localToday = getTodayIsoDate()
  const utcToday = getUtcTodayIsoDate()

  // اليوم المحلي قد يكون يوماً أقل من UTC (مثلاً 13/6 محلياً = 14/6 UTC)
  if (selected === localToday && selected < utcToday) return utcToday

  return selected
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

const CAMPAIGN_PRICE_STORAGE_KEY = 'trendy_admin_campaign_prices'

function readCampaignPriceMap() {
  try {
    const raw = localStorage.getItem(CAMPAIGN_PRICE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCampaignPriceMap(map) {
  localStorage.setItem(CAMPAIGN_PRICE_STORAGE_KEY, JSON.stringify(map))
}

export function saveCampaignPrice(campaignId, price) {
  const id = String(campaignId)
  const num = Number(price)
  if (!id || !Number.isFinite(num) || num < 0) return
  const map = readCampaignPriceMap()
  map[id] = num
  writeCampaignPriceMap(map)
}

export function removeCampaignPrice(campaignId) {
  if (campaignId == null || campaignId === '') return
  const map = readCampaignPriceMap()
  delete map[String(campaignId)]
  writeCampaignPriceMap(map)
}

function resolveCampaignPrice(item) {
  const fromApi = item?.price ?? item?.campaign_price
  if (fromApi != null && fromApi !== '') {
    const num = Number(fromApi)
    if (Number.isFinite(num)) return num
  }
  const id = item?.id
  if (id == null) return null
  const stored = readCampaignPriceMap()[String(id)]
  if (stored == null || stored === '') return null
  const num = Number(stored)
  return Number.isFinite(num) ? num : null
}

export function formatCampaignPriceDisplay(price) {
  const num = Number(price)
  if (!Number.isFinite(num)) return '—'
  return `${num.toLocaleString('ar-LY')} د.ل`
}

export function extractCreatedCampaign(data) {
  const raw = data?.data ?? data
  if (raw?.id == null) return null
  return mapCampaign(raw)
}

export function mapCampaign(item) {
  const mapped = mapApiStatusToUi(item.status)
  const price = resolveCampaignPrice(item)
  return {
    id: Number(item.id),
    title: item.name ?? item.title ?? '',
    description: item.description ?? '',
    price: price ?? 0,
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
    stores: pickCampaignStores(item),
    products: pickCampaignProducts(item),
    views: pickCampaignViews(item),
    rawStatus: item.status ?? '',
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
  const startDate = toApiStartDate(form.dateFrom)
  const endDate = normalizeCampaignDate(form.dateTo)
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    start_date: startDate,
    end_date: endDate,
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
