import { useState } from 'react'
import { Truck, UserCheck, AlertCircle, Search, Eye, Ban, Plus, X, Star, Phone, MapPin } from 'lucide-react'

const initialDrivers = [
  {
    id: 1,
    name: 'سامي التوصيل',
    phone: '0915555555',
    vehicle: 'دراجة نارية - ABC123',
    rating: 4.8,
    deliveries: 156,
    status: 'متاح'
  },
  {
    id: 2,
    name: 'حسام السريع',
    phone: '0916666666',
    vehicle: 'سيارة - XYZ789',
    rating: 4.6,
    deliveries: 234,
    status: 'في مهمة'
  },
  {
    id: 3,
    name: 'وليد الأمين',
    phone: '0917777777',
    vehicle: 'دراجة نارية - DEF456',
    rating: 4.9,
    deliveries: 189,
    status: 'متاح'
  }
];

export function DriversPage() {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')
  
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  
  const [newDriver, setNewDriver] = useState({ name: '', phone: '', vehicle: '' })

  const openDetails = (d) => {
    setSelectedDriver(d)
    setDetailsModalOpen(true)
  }

  const toggleStatus = (id) => {
    setDrivers(drivers.map(d => 
      d.id === id ? { ...d, status: d.status === 'معطل' ? 'متاح' : 'معطل' } : d
    ))
  }

  const handleAddDriver = (e) => {
    e.preventDefault()
    const driverToAdd = {
      ...newDriver,
      id: Date.now(),
      rating: 0,
      deliveries: 0,
      status: 'متاح'
    }
    setDrivers([...drivers, driverToAdd])
    setNewDriver({ name: '', phone: '', vehicle: '' })
    setAddModalOpen(false)
  }

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.includes(searchQuery) || d.phone.includes(searchQuery) || d.vehicle.includes(searchQuery)
    const matchesStatus = activeStatus === 'جميع الحالات' || d.status === activeStatus
    return matchesSearch && matchesStatus
  })

  const getStatusStyle = (status) => {
    switch (status) {
      case 'متاح': return 'bg-emerald-100 text-emerald-700'
      case 'في مهمة': return 'bg-yellow-100 text-yellow-700'
      case 'معطل': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-slate-900">إدارة السائقين</h1>
          <p className="text-sm text-slate-500">إدارة السائقين وعمليات التوصيل</p>
        </div>
        <button 
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="size-4" />
          إضافة سائق
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Truck className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي السائقين</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{drivers.length}</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <UserCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">سائقون متاحون</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{drivers.filter(d => d.status === 'متاح').length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <Truck className="size-6 rotate-12" />
          </div>
          <p className="text-sm font-medium text-slate-500">في مهمة توصيل</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{drivers.filter(d => d.status === 'في مهمة').length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">معطلون</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{drivers.filter(d => d.status === 'معطل').length}</p>
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
          <option>متاح</option>
          <option>في مهمة</option>
          <option>معطل</option>
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث عن سائق..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">الاسم</th>
                <th className="px-6 py-4 font-medium">الهاتف</th>
                <th className="px-6 py-4 font-medium">المركبة</th>
                <th className="px-6 py-4 font-medium text-center">التقييم</th>
                <th className="px-6 py-4 font-medium text-center">التوصيلات</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrivers.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{d.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{d.phone}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-3 text-slate-400" />
                      {d.vehicle}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-slate-700">{d.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{d.deliveries}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${getStatusStyle(d.status)}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => toggleStatus(d.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          d.status === 'معطل' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-amber-500 hover:bg-amber-50'
                        }`}
                        title={d.status === 'معطل' ? "تنشيط السائق" : "حظر السائق"}
                      >
                        <Ban className="size-4" />
                      </button>
                      <button 
                        onClick={() => openDetails(d)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    لا يوجد سائقين مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-left">
          <p className="text-sm text-slate-500">
            عرض {filteredDrivers.length} من {drivers.length} سائق
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900">تفاصيل السائق</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusStyle(selectedDriver.status)}`}>
                  {selectedDriver.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedDriver.name}</h3>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-slate-600">{selectedDriver.rating} التقييم العام</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Phone className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">رقم الهاتف</p>
                    <p className="font-bold text-slate-900 font-mono" dir="ltr">{selectedDriver.phone}</p>
                  </div>
                </div>
                
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Truck className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">المركبة</p>
                    <p className="font-bold text-slate-900">{selectedDriver.vehicle}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <MapPin className="size-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">إجمالي التوصيلات</p>
                    <p className="font-bold text-slate-900">{selectedDriver.deliveries} طلب</p>
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

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900">إضافة سائق جديد</h2>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="p-6 space-y-5 text-right">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم السائق *</label>
                <input 
                  type="text" 
                  required
                  placeholder="أدخل اسم السائق"
                  value={newDriver.name}
                  onChange={e => setNewDriver({...newDriver, name: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">رقم الهاتف *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="0912345678"
                  value={newDriver.phone}
                  onChange={e => setNewDriver({...newDriver, phone: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono outline-none transition-colors focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">معلومات المركبة *</label>
                <input 
                  type="text" 
                  required
                  placeholder="مثال: دراجة نارية - ABC123"
                  value={newDriver.vehicle}
                  onChange={e => setNewDriver({...newDriver, vehicle: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  إضافة السائق
                </button>
                <button 
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
