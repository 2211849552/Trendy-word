import { apiRequest } from './client.js'

// عرض قائمة المناطق المدعومة
// GET /api/v1/zones
export function getZones() {
  return apiRequest('/api/v1/zones')
}
