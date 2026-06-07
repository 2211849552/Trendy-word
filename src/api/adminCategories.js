import { apiRequest } from './client.js'

// [4.1-4.3] إدارة التصنيفات — للمدراء
// GET /api/v1/admin/categories
export function getAdminCategories(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/categories${query ? `?${query}` : ''}`)
}

// POST /api/v1/admin/categories
export function createAdminCategory(body) {
  return apiRequest('/api/v1/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/v1/admin/categories/{category}
export function getAdminCategory(category) {
  return apiRequest(`/api/v1/admin/categories/${category}`)
}

// PUT /api/v1/admin/categories/{category}
export function updateAdminCategory(category, body) {
  return apiRequest(`/api/v1/admin/categories/${category}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/v1/admin/categories/{category} — Soft Delete [4.3]
export function deleteAdminCategory(category) {
  return apiRequest(`/api/v1/admin/categories/${category}`, {
    method: 'DELETE',
  })
}
