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
    store: 'متجر الإلكترونيات الذكية',
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    productsCount: 1,
    status: 'نشط',
    minAmount: null,
    products: ['هاتف ذكي سامسونج']
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
    products: ['نظارة شمسية', 'تيشيرت صيفي']
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
      <div className="flex flex-col items-start gap-1 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">العروض والخصومات</h1>
        <p className="text-sm text-slate-500">عرض العروض الترويجية وخصومات المنتجات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Offers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">8% ↑</div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <Tag className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">العروض النشطة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
        </div>
        
        {/* Scheduled Offers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <CalendarCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">العروض المجدولة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{scheduledCount}</p>
        </div>

        {/* Expired Offers */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <CalendarX className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">العروض المنتهية</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{expiredCount}</p>
        </div>

        {/* Discounted Products */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <Package className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">المنتجات بخصم</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{discountedProductsCount}</p>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(offer => (
          <div key={offer.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    offer.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' :
                    offer.status === 'مجدول' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                 }`}>
                   {offer.status}
                 </span>
                 <div className="size-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                   <Tag className="size-4" />
                 </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 text-center mb-4">{offer.title}</h3>
              
              <div className="bg-red-50 rounded-xl py-6 text-center mb-6">
                <p className="text-4xl font-bold text-red-600 mb-1" dir="ltr">{offer.discount}</p>
                <p className="text-sm text-slate-600">خصم</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-500">المتجر:</span>
                  <span className="font-medium text-purple-600">{offer.store}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-500">من:</span>
                  <span className="font-medium">{offer.startDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-500">إلى:</span>
                  <span className="font-medium">{offer.endDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="text-slate-500">المنتجات:</span>
                  <span className="font-medium text-blue-600">{offer.productsCount}</span>
                </div>
                {offer.minAmount && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-500">الحد الأدنى:</span>
                    <span className="font-medium text-emerald-600">{offer.minAmount} د.ل</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 pt-0">
               <button 
                 onClick={() => openDetails(offer)}
                 className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
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
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900">تفاصيل العرض</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center text-right border-b border-slate-100 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedOffer.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' :
                  selectedOffer.status === 'مجدول' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedOffer.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedOffer.title}</h3>
                  <p className="text-sm text-purple-600 mt-1 flex items-center justify-end gap-1 font-medium">
                     {selectedOffer.store} <Store className="size-4" />
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-red-50/50 border border-red-50 p-8 text-center flex flex-col items-center justify-center">
                <p className="font-bold text-red-600 text-6xl mb-2" dir="ltr">{selectedOffer.discount}</p>
                <p className="text-sm text-slate-600 font-medium">نسبة الخصم</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-slate-500 mb-1">تاريخ البدء</p>
                  <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {selectedOffer.startDate}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-slate-500 mb-1">تاريخ الانتهاء</p>
                  <p className="font-bold text-slate-900 text-lg">{selectedOffer.endDate}</p>
                </div>
              </div>
              
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-right">
                <p className="text-sm text-slate-500 mb-3 font-medium">المنتجات المشمولة ({selectedOffer.productsCount})</p>
                <div className="space-y-2">
                  {selectedOffer.products.map((p, idx) => (
                    <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3 flex justify-between items-center shadow-sm">
                       <span className="font-bold text-slate-900 text-sm">{p}</span>
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
