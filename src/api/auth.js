import { apiRequest } from './client.js'

// Route::prefix('v1/auth')->group(function () {
// 1. الإدارة العليا (Platform Admin)
// POST /api/v1/auth/admin/login
export function adminLogin(body) {
  return apiRequest('/api/v1/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
