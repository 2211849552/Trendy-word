import { apiRequest } from './client.js'

// [4.4] عرض قائمة التصنيفات المتاحة (للجميع)
// GET /api/catalog/categories
export function getCatalogCategories() {
  return apiRequest('/api/catalog/categories')
}

// [4.8] عرض قائمة الخصائص المتاحة (للجميع)
// GET /api/catalog/attributes
export function getCatalogAttributes() {
  return apiRequest('/api/catalog/attributes')
}

// [4.9] البحث في التصنيفات بالاسم
// GET /api/catalog/search/categories?query=
export function searchCatalogCategories(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/catalog/search/categories${query ? `?${query}` : ''}`)
}

// [4.9] البحث في الخصائص بالاسم
// GET /api/catalog/search/attributes?query=
export function searchCatalogAttributes(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/catalog/search/attributes${query ? `?${query}` : ''}`)
}

export function extractCatalogList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function mapCategory(item, defaultImage = '') {
  return {
    id: item.id,
    name: item.name ?? '',
    image: item.image ?? item.image_url ?? defaultImage,
    count: item.products_count ?? item.count ?? 0,
    isActive: item.is_active ?? item.isActive ?? true,
  }
}

export function mapAttribute(item) {
  return {
    id: item.id,
    name: item.name ?? '',
    type: item.type ?? 'قائمة',
    isRequired: item.is_required ?? item.isRequired ?? true,
    options: item.options ?? item.list_options ?? [],
    relatedCats: item.related_categories ?? item.relatedCats ?? [],
  }
}
