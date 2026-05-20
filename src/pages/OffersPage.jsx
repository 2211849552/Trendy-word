import { useState } from 'react'
import { Tag, CalendarCheck, CalendarX, Package, Store, Calendar, ShoppingBag, X, Eye } from 'lucide-react'

const initialOffers = [
  {
    id: 1,
    title: 'عرض الجمعة البيضاء',
    discount: '70%',
    store: 'متجر الأزياء العصرية',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    productsCount: 1,
    status: 'منتهي',
    minAmount: null,
    products: ['قميص رجالي كلاسيكي']
  },
  {
    id: 2,
    title: 'خصم نهاية الموسم',
    discount: '50%',
    store: 'متجر الأزياء العصرية',
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    productsCount: 1,
    status: 'نشط',
    minAmount: null,
    products: ['جاكيت شتوي مبطن']
  },
  {
    id: 3,
    title: 'عرض الصيف الكبير',
    discount: '25%',
    store: 'متجر الأزياء العصرية',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    productsCount: 2,
    status: 'مجدول',
    minAmount: 100,
    products: ['فستان صيفي مشجر', 'تيشيرت صيفي']
  }
];

export function OffersPage() {
  const [offers] = useState(initialOffers)
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const openDetails = (offer) => {
    setSelectedOffer(offer)
    setDetailsModalOpen(true)
  }

  const activeCount = offers.filter(o => o.status === 'نشط').length
  const scheduledCount = offers.filter(o => o.status === 'مجدول').length
  const expiredCount = offers.filter(o => o.status === 'منتهي').length
  const discountedProductsCount = offers.reduce((acc, curr) => acc + curr.productsCount, 0)

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col items-start gap-1 border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">العروض والخصومات</h1>
        <p className="text-sm text-white/60">عرض العروض الترويجية وخصومات المنتجات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Offers */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">8% ↑</div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <Tag className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">العروض النشطة</p>
          <p className="mt-1 text-2xl font-bold text-white">{activeCount}</p>
        </div>
        
        {/* Scheduled Offers */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <CalendarCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">العروض المجدولة</p>
          <p className="mt-1 text-2xl font-bold text-white">{scheduledCount}</p>
        </div>

        {/* Expired Offers */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <CalendarX className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">العروض المنتهية</p>
          <p className="mt-1 text-2xl font-bold text-white">{expiredCount}</p>
        </div>

        {/* Discounted Products */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <Package className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">المنتجات بخصم</p>
          <p className="mt-1 text-2xl font-bold text-white">{discountedProductsCount}</p>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => (
          <div key={offer.id} className="rounded-2xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden transition-shadow hover:shadow-premium flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    offer.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' :
                    offer.status === 'مجدول' ? 'bg-brand-300 text-brand-700' :
                    'bg-brand-300 text-white/80'
                 }`}>
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
                {offer.minAmount && (
                  <div className="flex justify-between items-center text-white/70">
                    <span className="text-white/60">الحد الأدنى:</span>
                    <span className="font-medium text-emerald-600">{offer.minAmount} د.ل</span>
                  </div>
                )}
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

      {/* Offer Details Modal */}
      {detailsModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل العرض</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedOffer.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' :
                  selectedOffer.status === 'مجدول' ? 'bg-brand-300 text-brand-700' :
                  'bg-brand-300 text-white/80'
                }`}>
                  {selectedOffer.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedOffer.title}</h3>
                  <p className="text-sm text-purple-600 mt-1 flex items-center justify-end gap-1 font-medium">
                     {selectedOffer.store} <Store className="size-4" />
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-brand-100 bg-brand-100/50 p-8 text-center">
                <p className="mb-2 text-6xl font-bold text-white" dir="ltr">{selectedOffer.discount}</p>
                <p className="text-sm font-medium text-white/70">نسبة الخصم</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">تاريخ البدء</p>
                  <p className="font-bold text-white text-lg flex items-center gap-2">
                    {selectedOffer.startDate}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">تاريخ الانتهاء</p>
                  <p className="font-bold text-white text-lg">{selectedOffer.endDate}</p>
                </div>
              </div>
              
              <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                <p className="text-sm text-white/60 mb-3 font-medium">المنتجات المشمولة ({selectedOffer.productsCount})</p>
                <div className="space-y-2">
                  {selectedOffer.products.map((p, idx) => (
                    <div key={idx} className="bg-brand-200 rounded-lg border border-white/10 p-3 flex justify-between items-center shadow-premium">
                       <span className="font-bold text-white text-sm">{p}</span>
                       <Package className="size-5 text-orange-400" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
