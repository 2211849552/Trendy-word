import { apiRequest } from './client.js'

// [4.5-4.7] إدارة الخصائص — للمدراء
// GET /api/admin/attributes
export function getAdminAttributes(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/attributes${query ? `?${query}` : ''}`)
}

// POST /api/admin/attributes
export function createAdminAttribute(body) {
  return apiRequest('/api/admin/attributes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// GET /api/admin/attributes/{attribute}
export function getAdminAttribute(attribute) {
  return apiRequest(`/api/admin/attributes/${attribute}`)
}

// PUT /api/admin/attributes/{attribute}
export function updateAdminAttribute(attribute, body) {
  return apiRequest(`/api/admin/attributes/${attribute}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/admin/attributes/{attribute}
export function deleteAdminAttribute(attribute) {
  return apiRequest(`/api/admin/attributes/${attribute}`, {
    method: 'DELETE',
  })
}
