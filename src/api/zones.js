import { apiRequest } from './client.js'

// عرض قائمة المناطق المدعومة
// GET /api/zones
export function getZones() {
  return apiRequest('/api/zones')
}
