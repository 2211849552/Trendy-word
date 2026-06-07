import { apiRequest } from './client.js'

// إدارة البطاقات المصرفية — لوحة الإدارة
// GET /api/v1/admin/bank-cards
export function getBankCards(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/v1/admin/bank-cards${query ? `?${query}` : ''}`)
}

// POST /api/v1/admin/bank-cards
export function createBankCard(body) {
  return apiRequest('/api/v1/admin/bank-cards', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// PUT /api/v1/admin/bank-cards/{id}
export function updateBankCard(id, body) {
  return apiRequest(`/api/v1/admin/bank-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/v1/admin/bank-cards/{id}
export function deleteBankCard(id) {
  return apiRequest(`/api/v1/admin/bank-cards/${id}`, {
    method: 'DELETE',
  })
}

// POST /api/v1/admin/bank-cards/{id}/activate
export function activateBankCard(id) {
  return apiRequest(`/api/v1/admin/bank-cards/${id}/activate`, {
    method: 'POST',
  })
}
