import { useState } from 'react'
import { ShoppingCart, Truck, CheckCircle, XCircle, Search, Eye, Package, Calendar, CreditCard, Store, User, ChevronDown } from 'lucide-react'

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
  const [showToast, setShowToast] = useState(false)

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order))
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

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
      case 'قيد التنفيذ': return 'bg-blue-100 text-blue-700'
      case 'قيد الشحن': return 'bg-yellow-100 text-yellow-700'
      case 'تم التسليم': return 'bg-emerald-100 text-emerald-700'
      case 'ملغي': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">تم تحديث حالة الطلب بنجاح</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start gap-1 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">إدارة الطلبات</h1>
        <p className="text-sm text-slate-500">إدارة شاملة لجميع الطلبات في المنصة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <ShoppingCart className="size-6" />
          </div>
          <div className="absolute top-4 left-4 flex items-center gap-1 text-emerald-600 font-bold text-xs">
            <span>15% ↑</span>
          </div>
          <p className="text-sm font-medium text-slate-500">الطلبات الجديدة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">1</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <Truck className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">قيد الشحن</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">1</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <CheckCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">تم التسليم</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">1</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <XCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">الطلبات الملغاة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">0</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <select 
          value={activeStatus}
          onChange={e => setActiveStatus(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 w-full sm:w-auto"
        >
          <option>جميع الحالات</option>
          <option>قيد التنفيذ</option>
          <option>قيد الشحن</option>
          <option>تم التسليم</option>
          <option>ملغي</option>
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث عن طلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">رقم الطلب</th>
                <th className="px-6 py-4 font-medium">الزبون</th>
                <th className="px-6 py-4 font-medium">المتجر</th>
                <th className="px-6 py-4 font-medium text-center">الإجمالي</th>
                <th className="px-6 py-4 font-medium text-center">الدفع</th>
                <th className="px-6 py-4 font-medium">التاريخ</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{order.id}</td>
                  <td className="px-6 py-4 text-slate-600">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-600">{order.store}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-center">{order.total}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="size-5 flex items-center justify-center rounded bg-blue-50 text-blue-500">
                        <CreditCard className="size-3" />
                      </div>
                      <span className="text-[10px] text-slate-500">{order.payment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-full">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`w-full appearance-none rounded-full px-3 py-1.5 text-[11px] font-bold outline-none cursor-pointer border-none ${getStatusStyle(order.status)}`}
                      >
                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                        <option value="قيد الشحن">قيد الشحن</option>
                        <option value="تم التسليم">تم التسليم</option>
                        <option value="ملغي">ملغي</option>
                      </select>
                      <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 size-3 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => openDetails(order)}
                      className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    لا توجد طلبات مطابقة للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-left">
          <p className="text-sm text-slate-500">
            عرض {filteredOrders.length} من {orders.length} طلب
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900">تفاصيل الطلب</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusStyle(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedOrder.id}</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedOrder.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <User className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">الزبون</p>
                    <p className="font-bold text-slate-900">{selectedOrder.customer}</p>
                  </div>
                </div>
                
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Store className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">المتجر</p>
                    <p className="font-bold text-slate-900">{selectedOrder.store}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Package className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">المنتجات</p>
                    <p className="font-bold text-slate-900">{selectedOrder.products}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-500">
                    <CreditCard className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-500 mb-0.5">الإجمالي والدفع</p>
                    <p className="font-bold text-slate-900">{selectedOrder.total} ({selectedOrder.payment})</p>
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
