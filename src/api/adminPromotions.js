import { apiRequest } from './client.js'

// [9] إدارة العروض والخصومات
// GET /api/promotions — عرض القائمة
export function getPromotions(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/promotions${query ? `?${query}` : ''}`)
}

// GET /api/promotions/{id} — عرض التفاصيل
export function getPromotion(id) {
  return apiRequest(`/api/promotions/${encodeURIComponent(String(id))}`)
}

export function extractPromotionList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

function extractPaginationTotal(data) {
  const meta = data?.meta ?? data ?? {}
  return Number(meta.total ?? 0)
}

async function fetchAllPromotions(params = {}) {
  const items = []
  let page = 1
  let lastPage = 1

  do {
    const data = await getPromotions({ ...params, page })
    items.push(...extractPromotionList(data))
    const meta = data?.meta ?? {}
    lastPage = Number(meta.last_page ?? 1)
    page += 1
  } while (page <= lastPage)

  return items
}

function countDiscountedProducts(items) {
  return items.reduce((sum, item) => {
    const products = item.affected_products ?? item.products
    return sum + (Array.isArray(products) ? products.length : 0)
  }, 0)
}

// إحصائيات العروض — GET /api/promotions مع فلترة status و meta.total
export async function fetchPromotionStats() {
  const [allItems, activeRes, inactiveRes, expiredRes] = await Promise.all([
    fetchAllPromotions({ per_page: 100 }),
    getPromotions({ status: 'active', per_page: 1 }),
    getPromotions({ status: 'inactive', per_page: 1 }),
    getPromotions({ status: 'expired', per_page: 1 }),
  ])

  return {
    activeCount: extractPaginationTotal(activeRes),
    stoppedCount: extractPaginationTotal(inactiveRes),
    expiredCount: extractPaginationTotal(expiredRes),
    discountedProductsCount: countDiscountedProducts(allItems),
  }
}

// القائمة + الإحصائيات في استدعاء واحد
export async function fetchPromotionOverview() {
  const [allItems, activeRes, inactiveRes, expiredRes] = await Promise.all([
    fetchAllPromotions({ per_page: 100 }),
    getPromotions({ status: 'active', per_page: 1 }),
    getPromotions({ status: 'inactive', per_page: 1 }),
    getPromotions({ status: 'expired', per_page: 1 }),
  ])

  return {
    offers: allItems.map(mapPromotion),
    stats: {
      activeCount: extractPaginationTotal(activeRes),
      stoppedCount: extractPaginationTotal(inactiveRes),
      expiredCount: extractPaginationTotal(expiredRes),
      discountedProductsCount: countDiscountedProducts(allItems),
    },
  }
}

const STATUS_LABELS = {
  active: 'نشط',
  scheduled: 'مجدول',
  expired: 'منتهي',
  inactive: 'متوقف',
}

function sliceDate(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function formatDiscount(type, value) {
  const num = Number(value ?? 0)
  if (type === 'fixed') return `${num.toLocaleString('ar-LY')} د.ل`
  return `${num}%`
}

function mapProducts(products) {
  if (!Array.isArray(products)) return []
  return products.map((p) => p.name ?? p.title ?? '—')
}

export function mapPromotion(item) {
  const products = mapProducts(item.affected_products ?? item.products)
  return {
    id: Number(item.id),
    title: item.name ?? item.title ?? '',
    description: item.description ?? '',
    discount: formatDiscount(item.type, item.value),
    discountType: item.type ?? 'percentage',
    discountValue: Number(item.value ?? 0),
    store: item.store?.name ?? item.store_name ?? '—',
    storeId: item.store?.id ?? item.store_id ?? null,
    startDate: sliceDate(item.start_at ?? item.start_date),
    endDate: sliceDate(item.end_at ?? item.end_date),
    productsCount: products.length,
    products,
    status: STATUS_LABELS[item.status] ?? item.status ?? '—',
    rawStatus: item.status ?? '',
    isActive: Boolean(item.is_active),
    createdAt: sliceDate(item.created_at),
    raw: item,
  }
}

export function mapPromotionDetail(data) {
  return mapPromotion(data?.data ?? data)
}

export function buildOfferStats(offers) {
  const activeCount = offers.filter((o) => o.rawStatus === 'active').length
  const stoppedCount = offers.filter((o) => o.rawStatus === 'inactive').length
  const expiredCount = offers.filter((o) => o.rawStatus === 'expired').length
  const discountedProductsCount = offers.reduce((sum, o) => sum + (o.productsCount || 0), 0)

  return { activeCount, stoppedCount, expiredCount, discountedProductsCount }
}

export const EMPTY_OFFER_STATS = {
  activeCount: 0,
  stoppedCount: 0,
  expiredCount: 0,
  discountedProductsCount: 0,
}
