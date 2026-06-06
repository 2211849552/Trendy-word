import { useState } from 'react'
import { ShoppingCart, Truck, CheckCircle, XCircle, Search, Eye, Package, Calendar, CreditCard, Store, User } from 'lucide-react'

const initialOrders = [
  {
    id: 'ORD-001',
    customer: 'علي حسن',
    store: 'متجر الأزياء العصرية',
    products: '3 منتجات',
    total: '360 د.ل',
    payment: 'محفظة',
    date: '2026-05-02',
    status: 'قيد التنفيذ'
  },
  {
    id: 'ORD-002',
    customer: 'منى سالم',
    store: 'متجر الإلكترونيات الذكية',
    products: '1 منتجات',
    total: '2500 د.ل',
    payment: 'نقدي',
    date: '2026-05-01',
    status: 'قيد الشحن'
  },
  {
    id: 'ORD-003',
    customer: 'يوسف أحمد',
    store: 'متجر الأحذية الرياضية',
    products: '2 منتجات',
    total: '900 د.ل',
    payment: 'محفظة',
    date: '2026-04-30',
    status: 'تم التسليم'
  }
];

export function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.store.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = activeStatus === 'جميع الحالات' || order.status === activeStatus
    return matchesSearch && matchesStatus
  })

  const openDetails = (order) => {
    setSelectedOrder(order)
    setDetailsModalOpen(true)
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'قيد التنفيذ': return 'bg-brand-300 text-brand-700'
      case 'قيد الشحن': return 'bg-yellow-100 text-yellow-700'
      case 'تم التسليم': return 'bg-emerald-100 text-emerald-700'
      case 'ملغي': return 'bg-red-100 text-red-700'
      default: return 'bg-brand-300 text-white/80'
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col items-start gap-1 border-b border-white/10 pb-5">
        <h1 className="text-2xl font-bold text-white">إدارة الطلبات</h1>
        <p className="text-sm text-white/60">إدارة شاملة لجميع الطلبات في المنصة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <ShoppingCart className="size-6" />
          </div>
          <div className="absolute top-4 left-4 flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <span>15% ↑</span>
          </div>
          <p className="text-sm font-medium text-white/60">الطلبات الجديدة</p>
          <p className="mt-1 text-2xl font-bold text-white">1</p>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <Truck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">قيد الشحن</p>
          <p className="mt-1 text-2xl font-bold text-white">1</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <CheckCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">تم التسليم</p>
          <p className="mt-1 text-2xl font-bold text-white">1</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <XCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الطلبات الملغاة</p>
          <p className="mt-1 text-2xl font-bold text-white">0</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <select 
          value={activeStatus}
          onChange={e => setActiveStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option>جميع الحالات</option>
          <option>قيد التنفيذ</option>
          <option>قيد الشحن</option>
          <option>تم التسليم</option>
          <option>ملغي</option>
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث عن طلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm ">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">رقم الطلب</th>
                <th className="px-3 py-3 font-medium">الزبون</th>
                <th className="px-3 py-3 font-medium">المتجر</th>
                <th className="px-3 py-3 font-medium text-center">الإجمالي</th>
                <th className="px-3 py-3 font-medium text-center">الدفع</th>
                <th className="px-3 py-3 font-medium">التاريخ</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-bold text-white">{order.id}</td>
                  <td className="px-3 py-3 text-white/70">{order.customer}</td>
                  <td className="px-3 py-3 text-white/70">{order.store}</td>
                  <td className="px-3 py-3 font-bold text-white text-center">{order.total}</td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="size-5 flex items-center justify-center rounded bg-brand-100 text-brand-500">
                        <CreditCard className="size-3" />
                      </div>
                      <span className="text-[10px] text-white/60">{order.payment}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-white/60 font-mono text-xs">{order.date}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-bold ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button 
                      onClick={() => openDetails(order)}
                      className="icon-btn-view"
                      title="عرض التفاصيل"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-white/60">
                    لا توجد طلبات مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {filteredOrders.length} من {orders.length} طلب
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل الطلب</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white/50 hover:text-white/70 transition-colors">
                <XCircle className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedOrder.id}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedOrder.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <User className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">الزبون</p>
                    <p className="font-bold text-white">{selectedOrder.customer}</p>
                  </div>
                </div>
                
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Store className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">المتجر</p>
                    <p className="font-bold text-white">{selectedOrder.store}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-white/10 flex items-center justify-center text-white/50">
                    <Package className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/60 mb-0.5">المنتجات</p>
                    <p className="font-bold text-white">{selectedOrder.products}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-100 border border-brand-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-brand-200 border border-brand-200 flex items-center justify-center text-brand-500">
                    <CreditCard className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-500 mb-0.5">الإجمالي والدفع</p>
                    <p className="font-bold text-white">{selectedOrder.total} ({selectedOrder.payment})</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => setDetailsModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
