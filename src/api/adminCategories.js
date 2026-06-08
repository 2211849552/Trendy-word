import { apiRequest } from './client.js'

// [4.1-4.3] إدارة التصنيفات — للمدراء
// GET /api/admin/categories
export function getAdminCategories(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/categories${query ? `?${query}` : ''}`)
}

// POST /api/admin/categories
export function createAdminCategory(body) {
  return apiRequest('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/admin/categories/{category}
export function getAdminCategory(category) {
  return apiRequest(`/api/admin/categories/${category}`)
}

// PUT /api/admin/categories/{category}
export function updateAdminCategory(category, body) {
  return apiRequest(`/api/admin/categories/${category}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/admin/categories/{category} — Soft Delete [4.3]
export function deleteAdminCategory(category) {
  return apiRequest(`/api/admin/categories/${category}`, {
    method: 'DELETE',
  })
}
