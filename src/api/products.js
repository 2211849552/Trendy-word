import { apiRequest } from './client.js'
import { resolveMediaUrl } from '../utils/mediaUrl.js'

// [5.2] عرض منتجات متجر معين — يتضمن thumbnail للصورة الأولى
// GET /api/stores/{storeId}/products
export function getStoreProducts(storeId, params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/stores/${encodeURIComponent(String(storeId))}/products${query ? `?${query}` : ''}`)
}

// عرض منتجات متجر (نشطة + مؤرشفة) مع فلترة بالاسم والحالة
// GET /api/my-store/products (+ store_id عند عرض متجر محدد)
export function getMyStoreProducts(storeId, params = {}) {
  const queryParams = { ...params }
  if (storeId != null && storeId !== '') {
    queryParams.store_id = storeId
  }
  const query = new URLSearchParams(queryParams).toString()
  return apiRequest(`/api/my-store/products${query ? `?${query}` : ''}`)
}

// [5.3] تفاصيل منتج — يتضمن images[] مع url لكل صورة
// GET /api/products/{id}
export function getProduct(id) {
  return apiRequest(`/api/products/${encodeURIComponent(String(id))}`)
}

export function extractProductList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.products)) return data.products
  if (Array.isArray(data?.data?.products)) return data.data.products
  if (Array.isArray(data?.items)) return data.items
  return []
}

function apiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (base) return base
  if (import.meta.env.DEV) return 'http://127.0.0.1:8000'
  return ''
}

function extractFileName(source) {
  if (!source) return null

  if (typeof source === 'object') {
    return extractFileName(source.file_name ?? source.url ?? source.thumbnail)
  }

  const value = String(source).trim()
  if (!value) return null

  const withoutQuery = value.split('?')[0]
  const fileName = withoutQuery.split('/').pop()
  return fileName || null
}

/** بناء رابط صورة المنتج الصحيح: storage/products/{productId}/{fileName} */
export function resolveProductImageUrl(productId, source) {
  const fileName = extractFileName(source)
  if (!fileName || productId == null || productId === '') return null

  const path = `storage/products/${productId}/${fileName}`
  const origin = apiOrigin()
  return origin ? `${origin}/${path}` : `/${path}`
}

export function pickProductImage(item) {
  if (!item) return null

  const productId = item.id
  const sources = [
    item.thumbnail,
    ...(Array.isArray(item.images) ? item.images : []),
    item.image,
    item.image_url,
    item.media?.[0],
  ]

  for (const source of sources) {
    const url = resolveProductImageUrl(productId, source)
    if (url) return url
  }

  return resolveMediaUrl(
    item.thumbnail ??
    item.images?.[0] ??
    item.image ??
    item.image_url ??
    item.media?.[0],
  )
}

export function mapProduct(item) {
  const image = pickProductImage(item)

  return {
    id: item.id != null ? String(item.id) : '',
    name: item.name ?? item.title ?? '—',
    price: item.base_price ?? item.price ?? 0,
    category: item.category?.name ?? item.category_name ?? item.category ?? '—',
    status: item.status ?? 'active',
    sku: item.sku ?? item.code ?? '',
    stock: item.stock ?? item.quantity ?? item.stock_quantity ?? null,
    image,
    raw: item,
  }
}

export async function fetchStoreProductsList(storeId, params = {}) {
  const data = await getStoreProducts(storeId, { per_page: 50, ...params })
  return extractProductList(data).map(mapProduct).filter((p) => p.id !== '')
}

async function enrichProductImage(product) {
  if (product.image) return product

  try {
    const data = await getProduct(product.id)
    const detail = data?.data ?? data
    const image = pickProductImage(detail)
    if (!image) return product
    return { ...product, image }
  } catch {
    return product
  }
}

/** جلب منتجات المتجر مع صورة كل منتج (قائمة المتجر + تفاصيل المنتج عند الحاجة) */
export async function fetchStoreProductsForDetail(storeId, params = {}) {
  const products = await fetchStoreProductsList(storeId, params)
  return Promise.all(products.map(enrichProductImage))
}

export async function fetchMyStoreProductsList(storeId, params = {}) {
  const data = await getMyStoreProducts(storeId, { per_page: 50, ...params })
  return extractProductList(data).map(mapProduct).filter((p) => p.id !== '')
}

/** جلب منتجات المتجر (my-store) مع صورة كل منتج — يدعم فلترة الحالة والاسم */
export async function fetchMyStoreProductsForDetail(storeId, params = {}) {
  const products = await fetchMyStoreProductsList(storeId, params)
  return Promise.all(products.map(enrichProductImage))
}
