import { apiRequest } from './client.js'

// تفعيل حملة ترويجية (تغيير الحالة إلى active لتظهر للمتاجر)
// POST /api/v1/admin/campaigns/{campaign}/activate
export function activateCampaign(campaign) {
  return apiRequest(`/api/v1/admin/campaigns/${campaign}/activate`, {
    method: 'POST',
  })
}

// إيقاف حملة ترويجية (تغيير الحالة إلى inactive)
// POST /api/v1/admin/campaigns/{campaign}/deactivate
export function deactivateCampaign(campaign) {
  return apiRequest(`/api/v1/admin/campaigns/${campaign}/deactivate`, {
    method: 'POST',
  })
}
