import { apiRequest } from './client.js'
import { extractMediaUrls } from '../utils/mediaUrl.js'
import { getStoreProducts, extractProductList } from './products.js'

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

// GET /api/campaigns — قائمة الحملات مع المتاجر المشتركة
export function getPublicCampaigns(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/campaigns${query ? `?${query}` : ''}`)
}

// GET /api/campaigns/{campaign} — تفاصيل حملة مع المتاجر المشتركة (api.md)
export function getPublicCampaign(campaign) {
  return apiRequest(`/api/campaigns/${encodeURIComponent(String(campaign))}`)
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

/** عدد المتاجر المشتركة في الحملة */
export function pickCampaignSubscribedStores(item) {
  const fromCount = pickCampaignCount(item, [
    'store_subscriptions_count',
    'subscriptions_count',
    'subscribers_count',
    'subscribed_stores_count',
    'storeSubscriptionsCount',
  ])
  if (fromCount != null) return fromCount

  const lists = [
    item?.store_subscriptions,
    item?.subscribed_stores,
    item?.subscribers,
  ].filter(Array.isArray)

  for (const list of lists) {
    if (list.length > 0) return list.length
  }

  if (Array.isArray(item?.stores) && item.stores.length > 0) {
    const first = item.stores[0]
    if (first && typeof first === 'object') return item.stores.length
  }

  return 0
}

/** إجمالي عدد المتاجر (من استجابة الحملة أو لوحة التحكم) */
export function pickCampaignTotalStores(item) {
  return (
    pickCampaignCount(item, [
      'total_stores',
      'stores_count',
      'total_stores_count',
      'storesCount',
    ]) ?? 0
  )
}

/** @deprecated استخدم pickCampaignSubscribedStores أو pickCampaignTotalStores */
export function pickCampaignStores(item) {
  return pickCampaignSubscribedStores(item)
}

function extractPaginationTotal(data) {
  const meta = data?.meta ?? data?.pagination ?? {}
  const total = meta.total ?? data?.total
  if (total == null || total === '') return null
  const parsed = Number(total)
  return Number.isFinite(parsed) ? parsed : null
}

function unwrapCampaignPayload(data) {
  return data?.data ?? data ?? {}
}

/** استخراج معرّفات المتاجر المشتركة من GET /api/campaigns/{id} */
export function extractCampaignStoreIds(item) {
  const ids = new Set()

  const lists = [
    item?.stores,
    item?.subscribed_stores,
    item?.store_subscriptions,
    item?.subscribers,
    item?.subscribedStores,
    item?.stores?.data,
    item?.subscribed_stores?.data,
  ].filter(Array.isArray)

  for (const list of lists) {
    for (const entry of list) {
      if (entry == null) continue

      if (typeof entry === 'number' || (typeof entry === 'string' && String(entry).trim())) {
        const parsed = Number(entry)
        if (Number.isFinite(parsed) && parsed > 0) ids.add(parsed)
        continue
      }

      if (typeof entry !== 'object') continue

      const storeId =
        entry.store_id ??
        entry.storeId ??
        entry.store?.id ??
        (entry.store?.name == null && entry.name != null ? entry.id : null) ??
        entry.id

      const parsed = Number(storeId)
      if (Number.isFinite(parsed) && parsed > 0) ids.add(parsed)
    }
  }

  return [...ids]
}

function countProductsInList(list) {
  if (!Array.isArray(list) || list.length === 0) return null

  const first = list[0]
  if (first && typeof first === 'object') {
    const uniqueIds = new Set(
      list
        .map((product) => product?.id ?? product?.product_id)
        .filter((id) => id != null && id !== ''),
    )
    return uniqueIds.size || list.length
  }

  return list.length
}

/** عدّ المنتجات من استجابة GET /api/campaigns/{id} */
export function countCampaignProductsFromPayload(item) {
  const direct = pickCampaignCount(item, [
    'products_count',
    'total_products',
    'product_count',
    'products_count_total',
    'total_products_count',
    'productsCount',
    'totalProducts',
  ])
  if (direct != null && direct > 0) return direct

  const campaignProductLists = [
    item?.products,
    item?.campaign_products,
    item?.subscribed_products,
    item?.featured_products,
  ]

  for (const list of campaignProductLists) {
    const count = countProductsInList(list)
    if (count != null && count > 0) return count
  }

  const storeLists = [
    item?.stores,
    item?.subscribed_stores,
    item?.store_subscriptions,
    item?.subscribers,
  ].filter(Array.isArray)

  const uniqueProductIds = new Set()
  let summedStoreCounts = 0
  let hasStoreCounts = false

  for (const stores of storeLists) {
    for (const store of stores) {
      if (!store || typeof store !== 'object') continue

      const storeCount = pickCampaignCount(store, [
        'products_count',
        'product_count',
        'total_products',
        'productsCount',
        'totalProducts',
      ])
      if (storeCount != null) {
        summedStoreCounts += storeCount
        hasStoreCounts = true
      }

      const nestedCount = countProductsInList(store.products)
      if (nestedCount != null) {
        if (Array.isArray(store.products) && store.products[0]?.id != null) {
          store.products.forEach((product) => {
            const id = product?.id ?? product?.product_id
            if (id != null) uniqueProductIds.add(String(id))
          })
        } else {
          summedStoreCounts += nestedCount
          hasStoreCounts = true
        }
      }

      if (Array.isArray(store.product_ids)) {
        store.product_ids.forEach((id) => uniqueProductIds.add(String(id)))
      }
    }
  }

  if (uniqueProductIds.size > 0) return uniqueProductIds.size
  if (hasStoreCounts) return summedStoreCounts

  const fromSubscriptions = countProductsFromSubscriptions(item)
  if (fromSubscriptions != null && fromSubscriptions > 0) return fromSubscriptions

  return null
}

/**
 * GET /api/stores/{storeId}/products — جمع عدد منتجات المتاجر المشتركة
 * api.md [5.2]
 */
export async function fetchProductsCountForStores(storeIds) {
  const ids = [...new Set(storeIds.map(Number).filter((id) => Number.isFinite(id) && id > 0))]
  if (ids.length === 0) return 0

  const counts = await Promise.all(
    ids.map(async (storeId) => {
      try {
        const data = await getStoreProducts(storeId, { per_page: 1 })
        const fromMeta = extractPaginationTotal(data)
        if (fromMeta != null) return fromMeta
        return extractProductList(data).length
      } catch {
        return 0
      }
    }),
  )

  return counts.reduce((sum, value) => sum + value, 0)
}

/** حل عدد المنتجات المشتركة في الحملة — api.md */
export async function resolveCampaignProductsCount(item) {
  const fromPayload = countCampaignProductsFromPayload(item)
  if (fromPayload != null && fromPayload > 0) return fromPayload

  const storeIds = extractCampaignStoreIds(item)
  if (storeIds.length > 0) {
    const fromStores = await fetchProductsCountForStores(storeIds)
    if (fromStores > 0) return fromStores
  }

  return fromPayload ?? pickCampaignProducts(item) ?? 0
}

async function loadCampaignCombinedPayload(id, summary = {}) {
  let combined = { ...summary }

  try {
    const publicDetail = await getPublicCampaign(id)
    combined = { ...combined, ...unwrapCampaignPayload(publicDetail) }
  } catch {
    // ignore
  }

  try {
    const adminDetail = await getAdminCampaign(id)
    combined = { ...combined, ...unwrapCampaignPayload(adminDetail) }
  } catch {
    // ignore
  }

  return combined
}

export async function fetchCampaignWithMetrics(id, summary = {}) {
  const combined = await loadCampaignCombinedPayload(id, summary)
  const mapped = mapCampaign(combined)
  const products = await resolveCampaignProductsCount(combined)
  return { ...mapped, products }
}

function countProductsFromSubscriptions(item) {
  const subscriptionLists = [
    item?.store_subscriptions,
    item?.subscribers,
    item?.subscribed_stores,
    item?.stores_list,
  ].filter(Array.isArray)

  for (const subs of subscriptionLists) {
    if (subs.length === 0) continue

    let total = 0
    let found = false
    for (const sub of subs) {
      const count =
        pickCampaignCount(sub, [
          'products_count',
          'product_count',
          'total_products',
          'productsCount',
          'totalProducts',
        ]) ??
        (Array.isArray(sub?.products) ? sub.products.length : null)

      if (count != null) {
        total += count
        found = true
      }
    }

    if (found) return total
  }

  return null
}

export function pickCampaignProducts(item) {
  const direct = pickCampaignCount(item, [
    'products_count',
    'total_products',
    'product_count',
    'products_count_total',
    'total_products_count',
    'productsCount',
    'totalProducts',
  ])
  if (direct != null) return direct

  if (Array.isArray(item?.products)) {
    if (item.products.length === 0) return 0
    const first = item.products[0]
    if (first && typeof first === 'object') return item.products.length
  }

  const fromSubscriptions = countProductsFromSubscriptions(item)
  if (fromSubscriptions != null) return fromSubscriptions

  return 0
}

/** دمج بيانات القائمة مع تفاصيل الحملة (الإحصائيات غالباً في show فقط) */
export function mergeCampaignSources(summary, detail) {
  const extra = detail?.data ?? detail ?? {}
  const combined = { ...summary, ...extra }
  const mapped = mapCampaign(combined)
  const fromSummary = mapCampaign(summary)
  const fromDetail = mapCampaign(extra)

  return {
    ...mapped,
    stores: Math.max(fromSummary.stores, fromDetail.stores, mapped.stores),
    subscribedStores: Math.max(
      fromSummary.subscribedStores,
      fromDetail.subscribedStores,
      mapped.subscribedStores,
    ),
    products: Math.max(fromSummary.products, fromDetail.products, mapped.products),
  }
}

/** جلب القائمة ثم إثراء كل حملة — GET /api/campaigns/{id} + GET /api/stores/{id}/products */
export async function fetchAdminCampaignsWithMetrics(params = {}) {
  const data = await getAdminCampaigns(params)
  const list = extractCampaignList(data)
  if (list.length === 0) return []

  return Promise.all(
    list.map(async (item) => {
      const id = item?.id
      if (id == null || id === '') return mapCampaign(item)
      return fetchCampaignWithMetrics(id, item)
    }),
  )
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
    stores: pickCampaignTotalStores(item),
    subscribedStores: pickCampaignSubscribedStores(item),
    products: pickCampaignProducts(item),
    rawStatus: item.status ?? '',
  }
}

export function mapCampaignDetail(data) {
  return mapCampaign(data?.data ?? data)
}

const CAMPAIGN_SUBSCRIPTION_STATUS_LABELS = {
  active: 'نشط',
  scheduled: 'مجدول',
  expired: 'منتهي',
  cancelled: 'ملغى',
  inactive: 'غير نشط',
}

const CAMPAIGN_STORE_STATUS_LABELS = {
  active: 'نشط',
  inactive: 'بانتظار الاشتراك',
  deactivated: 'معطّل',
}

/** استخراج قائمة المتاجر المشتركة من استجابة GET /api/campaigns/{id} */
export function extractCampaignSubscribedStores(data) {
  const root = data?.data ?? data
  if (Array.isArray(root?.stores)) return root.stores
  if (Array.isArray(root?.store_subscriptions)) return root.store_subscriptions
  if (Array.isArray(root?.subscribed_stores)) return root.subscribed_stores
  return []
}

export function mapCampaignSubscriptionStore(item) {
  const store = item?.store ?? item
  const subscription = item?.subscription ?? item

  const status = subscription?.status ?? item?.status ?? ''
  const storeStatus = store?.status ?? item?.store_status ?? ''

  return {
    id: Number(store?.id ?? item?.store_id ?? item?.id),
    name: store?.name ?? item?.store_name ?? item?.name ?? '',
    status: storeStatus,
    statusLabel: CAMPAIGN_STORE_STATUS_LABELS[storeStatus] ?? storeStatus ?? '—',
    subscription: {
      startsAt:
        subscription?.starts_at ??
        subscription?.start_date ??
        item?.starts_at ??
        item?.subscribed_at ??
        null,
      endsAt:
        subscription?.ends_at ?? subscription?.end_date ?? item?.ends_at ?? null,
      pricePaid:
        subscription?.price_paid != null
          ? Number(subscription.price_paid)
          : item?.price_paid != null
            ? Number(item.price_paid)
            : null,
      status,
      statusLabel: CAMPAIGN_SUBSCRIPTION_STATUS_LABELS[status] ?? status ?? '—',
    },
  }
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
  const finished = campaigns.filter((c) => c.status === 'finished').length
  const scheduled = campaigns.filter((c) => c.status === 'scheduled').length
  const active = campaigns.filter((c) => c.status === 'active').length

  return {
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
