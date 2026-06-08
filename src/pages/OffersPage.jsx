import { useState, useEffect, useCallback, useRef } from 'react'
import { Tag, PauseCircle, CalendarX, Package, Store, X, Eye, Loader2 } from 'lucide-react'
import {
  getPromotion,
  mapPromotionDetail,
  fetchPromotionOverview,
  EMPTY_OFFER_STATS,
} from '../api/adminPromotions.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض العروض والخصومات.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

function statusBadgeClass(status) {
  if (status === 'نشط') return 'bg-emerald-100 text-emerald-700'
  if (status === 'مجدول') return 'bg-brand-300 text-brand-700'
  return 'bg-brand-300 text-white/80'
}

export function OffersPage() {
  const [offers, setOffers] = useState([])
  const [stats, setStats] = useState(EMPTY_OFFER_STATS)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const loadSeq = useRef(0)

  const loadOffers = useCallback(async () => {
    const seq = ++loadSeq.current
    const { offers: nextOffers, stats: nextStats } = await fetchPromotionOverview()
    if (seq !== loadSeq.current) return
    setOffers(nextOffers)
    setStats(nextStats)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setStatsLoading(true)
      setLoadError('')
      try {
        await loadOffers()
      } catch (err) {
        if (cancelled) return
        setOffers([])
        setStats(EMPTY_OFFER_STATS)
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل العروض. تأكد من تسجيل الدخول وأن الخادم يعمل.'))
      } finally {
        if (!cancelled) {
          setLoading(false)
          setStatsLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadOffers])

  const { activeCount, stoppedCount, expiredCount, discountedProductsCount } = stats

  const openDetails = async (offer) => {
    setSelectedOffer(offer)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    setDetailError('')
    try {
      const data = await getPromotion(offer.id)
      setSelectedOffer(mapPromotionDetail(data))
    } catch (err) {
      setDetailError(apiErrorMessage(err, 'تعذّر تحميل تفاصيل العرض.'))
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetails = () => {
    setDetailsModalOpen(false)
    setSelectedOffer(null)
    setDetailLoading(false)
    setDetailError('')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col items-start gap-1 border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">العروض والخصومات</h1>
        <p className="text-sm text-white/60">عرض العروض الترويجية وخصومات المنتجات</p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <Tag className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">العروض النشطة</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {statsLoading ? <Loader2 className="mx-auto size-6 animate-spin text-white/50" /> : activeCount}
          </p>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <PauseCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">العروض المتوقفة</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {statsLoading ? <Loader2 className="mx-auto size-6 animate-spin text-white/50" /> : stoppedCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <CalendarX className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">العروض المنتهية</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {statsLoading ? <Loader2 className="mx-auto size-6 animate-spin text-white/50" /> : expiredCount}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <Package className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">المنتجات بخصم</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {statsLoading ? <Loader2 className="mx-auto size-6 animate-spin text-white/50" /> : discountedProductsCount}
          </p>
        </div>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-white/60">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">جاري تحميل العروض...</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-brand-200 p-12 text-center text-white/60">
          لا توجد عروض أو خصومات حالياً.
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => (
          <div key={offer.id} className="rounded-2xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden transition-shadow hover:shadow-premium flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass(offer.status)}`}>
                   {offer.status}
                 </span>
                 <div className="size-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                   <Tag className="size-4" />
                 </div>
              </div>
              
              <h3 className="text-lg font-bold text-white text-center mb-4">{offer.title}</h3>
              
              <div className="mb-6 rounded-xl bg-brand-100 py-6 text-center ring-1 ring-brand-100">
                <p className="mb-1 text-4xl font-bold text-white" dir="ltr">{offer.discount}</p>
                <p className="text-sm text-white/70">خصم</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-white/70">
                  <span className="text-white/60">المتجر:</span>
                  <span className="font-medium text-purple-600">{offer.store}</span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span className="text-white/60">من:</span>
                  <span className="font-medium">{offer.startDate}</span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span className="text-white/60">إلى:</span>
                  <span className="font-medium">{offer.endDate}</span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span className="text-white/60">المنتجات:</span>
                  <span className="font-medium text-white">{offer.productsCount}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 pt-0">
               <button 
                 onClick={() => openDetails(offer)}
                 className="w-full rounded-xl bg-brand-900 py-3 text-sm font-bold text-white hover:bg-brand-950 transition-colors shadow-premium flex items-center justify-center gap-2"
               >
                 <Eye className="size-4" />
                 عرض التفاصيل
               </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Offer Details Modal */}
      {detailsModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل العرض</h2>
              <button onClick={closeDetails} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 p-16 text-white/60">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">جاري تحميل التفاصيل...</span>
              </div>
            ) : detailError ? (
              <div className="p-6">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {detailError}
                </div>
              </div>
            ) : (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${statusBadgeClass(selectedOffer.status)}`}>
                  {selectedOffer.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedOffer.title}</h3>
                  <p className="text-sm text-purple-600 mt-1 flex items-center justify-end gap-1 font-medium">
                     {selectedOffer.store} <Store className="size-4" />
                  </p>
                </div>
              </div>

              {selectedOffer.description && (
                <p className="text-sm text-white/70 text-right leading-relaxed">{selectedOffer.description}</p>
              )}

              <div className="flex flex-col items-center justify-center rounded-xl border border-brand-100 bg-brand-100/50 p-8 text-center">
                <p className="mb-2 text-6xl font-bold text-white" dir="ltr">{selectedOffer.discount}</p>
                <p className="text-sm font-medium text-white/70">
                  {selectedOffer.discountType === 'fixed' ? 'قيمة الخصم' : 'نسبة الخصم'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">تاريخ البدء</p>
                  <p className="font-bold text-white text-lg">{selectedOffer.startDate}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">تاريخ الانتهاء</p>
                  <p className="font-bold text-white text-lg">{selectedOffer.endDate}</p>
                </div>
              </div>
              
              <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                <p className="text-sm text-white/60 mb-3 font-medium">المنتجات المشمولة ({selectedOffer.productsCount})</p>
                {selectedOffer.products.length > 0 ? (
                <div className="space-y-2">
                  {selectedOffer.products.map((p, idx) => (
                    <div key={idx} className="bg-brand-200 rounded-lg border border-white/10 p-3 flex justify-between items-center shadow-premium">
                       <span className="font-bold text-white text-sm">{p}</span>
                       <Package className="size-5 text-orange-400" />
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-sm text-white/50">لا توجد منتجات مرتبطة بهذا العرض.</p>
                )}
              </div>

            </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
