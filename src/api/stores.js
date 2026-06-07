import { apiRequest } from './client.js'

// عرض قائمة المتاجر النشطة مع Pagination والفلترة
// GET /api/v1/stores?name=&type=&per_page=20
export function getStores(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/stores${query ? `?${query}` : ''}`)
}

// عرض تفاصيل متجر واحد نشط (الاسم، الوصف، المنتجات، ...)
// GET /api/v1/stores/{store}
export function getStore(store) {
  return apiRequest(`/api/v1/stores/${store}`)
}
