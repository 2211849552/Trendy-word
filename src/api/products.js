import { apiRequest } from './client.js'

// [5.2] عرض منتجات متجر معين
// GET /api/stores/{storeId}/products?name=&category_id=&min_price=&max_price=&per_page=
export function getStoreProducts(storeId, params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/stores/${encodeURIComponent(String(storeId))}/products${query ? `?${query}` : ''}`)
}

export function extractProductList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.products)) return data.products
  if (Array.isArray(data?.data?.products)) return data.data.products
  if (Array.isArray(data?.items)) return data.items
  return []
}

export function mapProduct(item) {
  const image =
    item.image ??
    item.image_url ??
    item.thumbnail ??
    (Array.isArray(item.images) ? item.images[0]?.url ?? item.images[0] : null)

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
