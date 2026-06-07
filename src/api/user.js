import { apiRequest } from './client.js'

// مسار الاختبار الافتراضي — يُعيد بيانات المستخدم المسجَّل حالياً
// يُستخدم للتحقق من صحة التوكن أثناء التطوير
// GET /api/user  ← يتطلب auth:sanctum
export function getCurrentUser() {
  return apiRequest('/api/user')
}
