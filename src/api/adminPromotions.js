import { apiRequest } from './client.js'

// [7.2] GET /api/admin/stores/{store}/promotions — مسؤول المتاجر فقط
export function getAdminStorePromotions(store, params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(
    `/api/admin/stores/${encodeURIComponent(String(store))}/promotions${query ? `?${query}` : ''}`,
  )
}

export function extractPromotionList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

const PROMOTION_TYPE_LABELS = {
  percentage: 'نسبة مئوية',
  percent: 'نسبة مئوية',
  fixed: 'مبلغ ثابت',
  fixed_amount: 'مبلغ ثابت',
  amount: 'مبلغ ثابت',
}

const PROMOTION_STATUS_LABELS = {
  active: 'نشط',
  inactive: 'معطل',
  expired: 'منتهي',
  scheduled: 'مجدول',
  draft: 'مسودة',
}

function normalizePromotionStatus(item) {
  if (typeof item.is_active === 'boolean') {
    return item.is_active ? 'active' : 'inactive'
  }
  const status = String(item.status ?? '').toLowerCase()
  if (status) return status
  return 'inactive'
}

function formatDiscountValue(item) {
  const type = String(item.type ?? item.discount_type ?? '').toLowerCase()
  const value = item.value ?? item.discount_value ?? item.discount ?? item.percentage ?? item.amount

  if (type.includes('percent') || type === 'percentage') {
    const num = Number(value)
    return Number.isFinite(num) ? `${num}%` : `${value}%`
  }

  const num = Number(value)
  if (Number.isFinite(num)) return `${num} د.ل`
  return value != null && value !== '' ? String(value) : '—'
}

export function formatPromotionDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toLocaleDateString('ar-LY', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function mapAdminPromotion(item) {
  const status = normalizePromotionStatus(item)
  const typeKey = String(item.type ?? item.discount_type ?? '').toLowerCase()

  return {
    id: item.id,
    name: item.name ?? item.title ?? '—',
    type: typeKey,
    typeLabel: PROMOTION_TYPE_LABELS[typeKey] ?? item.type_label ?? item.type ?? '—',
    discount: formatDiscountValue(item),
    status,
    statusLabel: PROMOTION_STATUS_LABELS[status] ?? item.status_label ?? status,
    startsAt: formatPromotionDate(item.starts_at ?? item.start_date ?? item.start_at),
    endsAt: formatPromotionDate(item.ends_at ?? item.end_date ?? item.end_at),
    productsCount:
      item.products_count ??
      item.product_count ??
      (Array.isArray(item.products) ? item.products.length : null),
    description: item.description ?? '',
  }
}
