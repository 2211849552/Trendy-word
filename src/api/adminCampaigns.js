import { apiRequest } from './client.js'

// تفعيل حملة ترويجية (تغيير الحالة إلى active لتظهر للمتاجر)
// POST /api/admin/campaigns/{campaign}/activate
export function activateCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${campaign}/activate`, {
    method: 'POST',
  })
}

// إيقاف حملة ترويجية (تغيير الحالة إلى inactive)
// POST /api/admin/campaigns/{campaign}/deactivate
export function deactivateCampaign(campaign) {
  return apiRequest(`/api/admin/campaigns/${campaign}/deactivate`, {
    method: 'POST',
  })
}
