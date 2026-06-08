import { apiRequest } from './client.js'

// إدارة البطاقات المصرفية — للمحاسبين والإدارة العليا
// GET /api/admin/bank-cards
export function getBankCards(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/bank-cards${query ? `?${query}` : ''}`)
}

// POST /api/admin/bank-cards
export function createBankCard(body) {
  return apiRequest('/api/admin/bank-cards', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// PUT /api/admin/bank-cards/{id}
export function updateBankCard(id, body) {
  return apiRequest(`/api/admin/bank-cards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

// DELETE /api/admin/bank-cards/{id}
export function deleteBankCard(id) {
  return apiRequest(`/api/admin/bank-cards/${id}`, {
    method: 'DELETE',
  })
}

// POST /api/admin/bank-cards/{id}/activate
export function activateBankCard(id) {
  return apiRequest(`/api/admin/bank-cards/${id}/activate`, {
    method: 'POST',
  })
}

export function extractBankCardList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function mapBankCard(item) {
  return {
    id: item.id,
    cardholderName: item.cardholder_name ?? item.cardholderName ?? '',
    lastFour: item.last_four ?? item.lastFour ?? '',
    expirationDate: item.expiration_date ?? item.expirationDate ?? '',
    isActive: item.is_active ?? item.isActive ?? false,
    stripePaymentMethodId: item.stripe_payment_method_id ?? item.stripePaymentMethodId ?? '',
  }
}
