import { useState } from 'react'
import { Search, MessageSquare, CheckCircle2, Eye, AlertCircle, Calendar, Package, Store, User, ChevronDown, Camera, X, Send, Lock, AlertTriangle, UserMinus, ShieldAlert, DollarSign } from 'lucide-react'

const initialDisputes = [
  { 
    id: '1#', 
    store: 'متجر الأزياء العصرية', 
    customer: 'علي حسن', 
    status: 'مفتوحة', 
    type: 'استرجاع',
    date: '2026-05-01', 
    orderId: 'ORD-001',
    subject: 'المنتج المستلم لا يطابق الوصف',
    hasImage: true
  },
  { 
    id: '2#', 
    store: 'متجر الإلكترونيات الذكية', 
    customer: 'منى سالم', 
    status: 'قيد المراجعة', 
    type: 'نزاع',
    date: '2026-04-28', 
    orderId: 'ORD-002',
    subject: 'الجهاز به عيب في الصناعة',
    hasImage: true
  },
]

export function DisputesPage() {
  const [disputes, setDisputes] = useState(initialDisputes)
  const [activeStatusFilter, setActiveStatusFilter] = useState('الكل')
  const [activeTypeFilter, setActiveTypeFilter] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState(null)
  
  // Modals state
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)

  const placeholderProductImage = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1000'

  const openReplyModal = (dispute) => {
    setSelectedDispute(dispute)
    setReplyModalOpen(true)
  }

  const openDetailsModal = (dispute) => {
    setSelectedDispute(dispute)
    setDetailsModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">الشكاوى والنزاعات</h1>
        <p className="text-sm text-slate-500">إدارة شكاوى الزبائن والنزاعات بين الأطراف</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-blue-500">
            <MessageSquare className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">متوسط وقت الحل</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">24 ساعة</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500">5% ↑</div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-emerald-500">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">تم الحل</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">0</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-yellow-500">
            <Eye className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">قيد المراجعة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">1</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">الشكاوى المفتوحة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{disputes.filter(d => d.status === 'مفتوحة').length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث في الشكاوى (رقم الشكوى، الزبون، المتجر، رقم الطلب، الوصف)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-0 bg-transparent py-2 pl-4 pr-11 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-slate-700">الحالة:</span>
          {['الكل', 'مفتوحة', 'قيد المراجعة', 'تم الحل', 'مغلقة'].map(status => (
            <button
              key={status}
              onClick={() => setActiveStatusFilter(status)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeStatusFilter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-slate-700">النوع:</span>
          {['الكل', 'استرجاع', 'بلاغ', 'نزاع'].map(type => (
            <button
              key={type}
              onClick={() => setActiveTypeFilter(type)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTypeFilter === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes
          .filter(d => {
            const matchesSearch = d.store.includes(searchQuery) || d.customer.includes(searchQuery) || d.id.includes(searchQuery)
            if (!matchesSearch) return false
            if (activeStatusFilter !== 'الكل' && d.status !== activeStatusFilter) return false
            if (activeTypeFilter !== 'الكل' && d.type !== activeTypeFilter) return false
            return true
          })
          .map(dispute => (
          <div key={dispute.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            
            {/* Top row of card */}
            <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-4 mb-4">
              
              {/* Right Side: Title & Info */}
              <div className="flex-1 order-2 md:order-1 text-right w-full">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 flex-row-reverse">
                     شكوى <span className="text-slate-700">{dispute.id}</span>
                   </h3>
                </div>
                <p className="text-base font-medium text-slate-800 mb-4">{dispute.subject}</p>
                
                <div className="flex flex-wrap items-center justify-end gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <User className="size-4 text-purple-500" />
                    <span>{dispute.customer}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Store className="size-4 text-pink-500" />
                    <span>{dispute.store}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Package className="size-4 text-orange-400" />
                    <span className="font-mono text-xs">{dispute.orderId}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <Calendar className="size-4 text-blue-400" />
                    <span>{dispute.date}</span>
                  </div>
                </div>
              </div>

              {/* Left Side: Buttons & Tags */}
              <div className="flex flex-col items-start gap-3 w-full md:w-auto order-1 md:order-2">
                 <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      dispute.type === 'استرجاع' ? 'bg-blue-100 text-blue-700' :
                      dispute.type === 'نزاع' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {dispute.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      dispute.status === 'مفتوحة' ? 'bg-red-100 text-red-700' :
                      dispute.status === 'قيد المراجعة' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {dispute.status}
                    </span>
                    {dispute.hasImage && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                         صورة مرفقة <Camera className="size-3" />
                      </span>
                    )}
                    <button 
                      onClick={() => openDetailsModal(dispute)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full border border-blue-200 text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                    >
                       عرض التفاصيل <Eye className="size-3" />
                    </button>
                    
                    {dispute.status !== 'مغلقة' && (
                      <>
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === dispute.id ? null : dispute.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                            dispute.status === 'مفتوحة' ? 'border-red-200 bg-red-50 text-red-600' :
                            dispute.status === 'قيد المراجعة' ? 'border-yellow-200 bg-yellow-50 text-yellow-600' :
                            dispute.status === 'تم الحل' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}>
                             {dispute.status}
                             <ChevronDown className="size-3" />
                          </button>

                          {openDropdownId === dispute.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-white shadow-xl ring-1 ring-slate-900/5 z-20 overflow-hidden">
                              {['مفتوحة', 'قيد المراجعة', 'تم الحل', 'مغلقة'].map((opt) => (
                                <button
                                  key={opt}
                                  onClick={() => {
                                    setDisputes(disputes.map(d => d.id === dispute.id ? { ...d, status: opt } : d))
                                    setOpenDropdownId(null)
                                  }}
                                  className={`w-full text-right px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors ${
                                    dispute.status === opt ? 'bg-slate-50 text-blue-600' : 'text-slate-700'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => openReplyModal(dispute)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                           إضافة رد <Send className="size-3.5" />
                        </button>
                        <button 
                          onClick={() => setDisputes(disputes.map(d => d.id === dispute.id ? { ...d, status: 'مغلقة' } : d))}
                          className="px-4 py-1.5 rounded-lg text-sm font-bold text-white bg-slate-700 hover:bg-slate-800 transition-colors shadow-sm"
                        >
                           إغلاق
                        </button>
                      </>
                    )}
                 </div>
              </div>
            </div>

            {/* Bottom row: Image attached */}
            {dispute.hasImage && (
              <div 
                onClick={() => {
                  setSelectedDispute(dispute)
                  setShowImageModal(true)
                }}
                className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors group"
              >
                 <div className="flex items-center gap-4">
                    <div className="size-16 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center text-3xl">
                      <img src={placeholderProductImage} alt="Product" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">صورة المنتج من الزبون</h4>
                      <p className="text-xs text-slate-500 mt-1">تم إرفاق صورة توضيحية للمنتج - اضغط للتكبير</p>
                    </div>
                 </div>
                 <div className="size-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                    <Search className="size-4" />
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Reply Modal */}
      {replyModalOpen && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
               <h2 className="text-xl font-bold text-slate-900">إضافة رد على الشكوى</h2>
               <button onClick={() => setReplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="size-5" />
               </button>
            </div>
            <div className="p-6">
               <label className="block text-sm font-medium text-slate-700 mb-2">الرد *</label>
               <textarea 
                 rows="6" 
                 placeholder="اكتب ردك على الشكوى..." 
                 className="w-full rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
               ></textarea>
            </div>
            <div className="flex items-center justify-start gap-3 border-t border-slate-100 p-6">
               <button onClick={() => setReplyModalOpen(false)} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-colors">
                 إرسال الرد
               </button>
               <button onClick={() => setReplyModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                 إلغاء
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Details Modal */}
      {detailsModalOpen && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto py-10">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
               <div>
                  <h2 className="text-2xl font-bold text-slate-900">تفاصيل الشكوى</h2>
               </div>
               <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X className="size-6" />
               </button>
            </div>

            <div className="p-6 space-y-6">
               {/* Header info */}
               <div className="flex justify-between items-center text-right border-b border-slate-100 pb-4">
                  <div className="flex gap-2">
                     <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      selectedDispute.type === 'استرجاع' ? 'bg-blue-100 text-blue-700' :
                      selectedDispute.type === 'نزاع' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedDispute.type}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      selectedDispute.status === 'مفتوحة' ? 'bg-red-100 text-red-700' :
                      selectedDispute.status === 'قيد المراجعة' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedDispute.status}
                    </span>
                  </div>
                  <div className="text-left">
                     <h3 className="text-xl font-bold text-slate-900 flex items-center justify-end gap-1">شكوى {selectedDispute.id}</h3>
                     <p className="text-sm text-slate-500 mt-1">{selectedDispute.date}</p>
                  </div>
               </div>

               {/* Details Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-5 text-right">
                     <p className="text-sm text-blue-400 mb-1">الزبون</p>
                     <p className="font-bold text-slate-900 text-lg">{selectedDispute.customer}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-5 text-right">
                     <p className="text-sm text-emerald-500 mb-1">المتجر</p>
                     <p className="font-bold text-slate-900 text-lg">{selectedDispute.store}</p>
                  </div>
                  <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-5 text-right">
                     <p className="text-sm text-purple-400 mb-1">رقم الطلب</p>
                     <p className="font-bold text-slate-900 text-lg">{selectedDispute.orderId}</p>
                  </div>
               </div>

               {/* Subject */}
               <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-right">
                  <p className="text-sm text-slate-500 mb-2">وصف الشكوى</p>
                  <p className="font-bold text-slate-900 text-lg">{selectedDispute.subject}</p>
               </div>

                {/* Attached Image */}
                {selectedDispute.hasImage && (
                  <div className="rounded-xl border border-blue-200 bg-white overflow-hidden text-right">
                     <div className="p-3 bg-blue-50/50 border-b border-blue-100">
                       <p className="text-sm font-bold text-slate-600">صورة المنتج المرفقة من الزبون</p>
                     </div>
                     <div className="p-6 flex flex-col items-center justify-center">
                        <div 
                          onClick={() => setShowImageModal(true)}
                          className="w-full max-w-md h-64 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-inner overflow-hidden cursor-pointer hover:ring-2 ring-blue-400 transition-all mb-4"
                        >
                          <img src={placeholderProductImage} alt="Product Detail" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">صورة توضيحية للمنتج موضوع الشكوى</p>
                        <button 
                          onClick={() => setShowImageModal(true)}
                          className="text-blue-600 text-sm font-bold mt-2 flex items-center gap-1 hover:underline"
                        >
                           اضغط للتكبير <Search className="size-3" />
                        </button>
                     </div>
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                       <p className="text-xs text-slate-500">ملاحظة: الصورة مرفقة من الزبون كدليل على الشكوى</p>
                    </div>
                 </div>
               )}

               {/* Available Actions */}
               <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900 text-right mb-4 border-b pb-2">الإجراءات المتاحة</h3>
                  
                  <div className="space-y-6">
                    {/* Financial Actions */}
                    <div>
                      <p className="text-sm font-bold text-slate-500 flex justify-end items-center gap-2 mb-3">
                         إجراء مالي <DollarSign className="size-4" />
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="w-full rounded-xl bg-emerald-600 py-4 text-center font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm text-lg flex items-center justify-center gap-2">
                           استرداد للزبون 💰
                        </button>
                        <button className="w-full rounded-xl bg-red-600 py-4 text-center font-bold text-white hover:bg-red-700 transition-colors shadow-sm text-lg flex items-center justify-center gap-2">
                           خصم من التاجر 💳
                        </button>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div>
                      <p className="text-sm font-bold text-slate-500 flex justify-end items-center gap-2 mb-3">
                         إجراء إداري <ShieldAlert className="size-4" />
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="w-full rounded-xl bg-orange-600 py-4 text-center font-bold text-white hover:bg-orange-700 transition-colors shadow-sm text-lg flex items-center justify-center gap-2">
                           حظر المتجر 🚫
                        </button>
                        <button className="w-full rounded-xl bg-amber-500 py-4 text-center font-bold text-white hover:bg-amber-600 transition-colors shadow-sm text-lg flex items-center justify-center gap-2">
                           تحذير التاجر ⚠️
                        </button>
                        <button className="w-full rounded-xl bg-purple-600 py-4 text-center font-bold text-white hover:bg-purple-700 transition-colors shadow-sm text-lg flex items-center justify-center gap-2">
                           حظر الزبون ⛔
                        </button>
                        <button 
                          onClick={() => {
                            setDisputes(disputes.map(d => d.id === selectedDispute.id ? { ...d, status: 'مغلقة' } : d))
                            setDetailsModalOpen(false)
                          }}
                          className="w-full rounded-xl bg-slate-600 py-4 text-center font-bold text-white hover:bg-slate-700 transition-colors shadow-sm text-lg flex items-center justify-center gap-2"
                        >
                           إغلاق الشكوى 🔒
                        </button>
                      </div>
                    </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
      {/* Image Zoom Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 size-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="size-6" />
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <img 
              src={placeholderProductImage} 
              alt="Enlarged Product" 
              className="w-full h-full object-contain bg-slate-800"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white text-right" dir="rtl">
              <h3 className="text-xl font-bold">معاينة الصورة المرفقة</h3>
              <p className="text-sm text-slate-300 mt-1">توضيح لحالة المنتج المستلم في الشكوى {selectedDispute?.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
