import { useState, useEffect, useCallback } from 'react'
import { Loader2, Percent, Tag } from 'lucide-react'
import {
  getAdminStorePromotions,
  extractPromotionList,
  mapAdminPromotion,
} from '../../api/adminPromotions.js'

const STATUS_CLASS = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-slate-100 text-slate-600',
  expired: 'bg-rose-100 text-rose-700',
  scheduled: 'bg-sky-100 text-sky-700',
  draft: 'bg-yellow-100 text-yellow-700',
}

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض خصومات هذا المتجر.'
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function StorePromotionsSection({ storeId, enabled = true }) {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPromotions = useCallback(async (id) => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const data = await getAdminStorePromotions(id)
      setPromotions(extractPromotionList(data).map(mapAdminPromotion))
    } catch (err) {
      setPromotions([])
      setError(apiErrorMessage(err, 'تعذّر تحميل خصومات المتجر.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !storeId) {
      setPromotions([])
      setError('')
      return
    }
    loadPromotions(storeId)
  }, [enabled, storeId, loadPromotions])

  if (!enabled) return null

  return (
    <div className="border-t border-white/5 pt-6 space-y-4">
      <div>
        <h4 className="text-lg font-bold text-white">خصومات المتجر</h4>
        <p className="text-sm text-white/60">قائمة العروض والخصومات النشطة والسابقة لهذا المتجر</p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-white/60">
          <Loader2 className="size-5 animate-spin" />
          جاري تحميل الخصومات...
        </div>
      ) : promotions.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-brand-300 py-10 text-center">
          <Percent className="size-8 text-white/50 mb-3" />
          <p className="text-sm text-white/60">لا توجد خصومات مسجّلة لهذا المتجر.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-right text-sm">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-2.5 font-medium">الخصم</th>
                <th className="px-3 py-2.5 font-medium">النوع</th>
                <th className="px-3 py-2.5 font-medium">القيمة</th>
                <th className="px-3 py-2.5 font-medium">البداية</th>
                <th className="px-3 py-2.5 font-medium">النهاية</th>
                <th className="px-3 py-2.5 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-brand-300/50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 shrink-0 text-white/50" />
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{promotion.name}</p>
                        {promotion.description ? (
                          <p className="mt-0.5 text-xs text-white/55 truncate">{promotion.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-white/70">{promotion.typeLabel}</td>
                  <td className="px-3 py-3 font-bold text-white tabular-nums" dir="ltr">
                    {promotion.discount}
                  </td>
                  <td className="px-3 py-3 text-white/70 tabular-nums">{promotion.startsAt}</td>
                  <td className="px-3 py-3 text-white/70 tabular-nums">{promotion.endsAt}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        STATUS_CLASS[promotion.status] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {promotion.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-white/10 bg-brand-300/50 px-4 py-3 text-sm text-white/60">
            عرض {promotions.length} {promotions.length === 1 ? 'خصم' : 'خصومات'}
          </div>
        </div>
      )}
    </div>
  )
}
