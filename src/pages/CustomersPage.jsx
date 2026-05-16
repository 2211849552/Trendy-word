import { useState } from 'react'
import { Users, UserCheck, UserX, ShoppingCart, Search, Eye, X, MapPin, Phone, Ban, Download } from 'lucide-react'

const initialCustomers = [
  {
    id: 1,
    name: 'علي حسن',
    email: 'ali@example.com',
    phone: '0917777777',
    location: 'طرابلس',
    orders: 15,
    totalSpent: 3450,
    joinDate: '2025-01-10',
    status: 'نشط'
  },
  {
    id: 2,
    name: 'منى سالم',
    email: 'mona@example.com',
    phone: '0918888888',
    location: 'بنغازي',
    orders: 8,
    totalSpent: 1890,
    joinDate: '2025-02-15',
    status: 'نشط'
  },
  {
    id: 3,
    name: 'يوسف أحمد',
    email: 'yousef@example.com',
    phone: '0919999999',
    location: 'مصراتة',
    orders: 23,
    totalSpent: 5670,
    joinDate: '2025-03-20',
    status: 'نشط'
  }
];

export function CustomersPage() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')
  
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const openDetails = (c) => {
    setSelectedCustomer(c)
    setDetailsModalOpen(true)
  }

  const toggleStatus = (id) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, status: c.status === 'نشط' ? 'معطل' : 'نشط' } : c
    ))
  }

  const handlePrint = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "الاسم,البريد الإلكتروني,الهاتف,الموقع,الطلبات,الإنفاق الكلي,تاريخ الانضمام,الحالة\n"
      + filteredCustomers.map(c => `${c.name},${c.email},${c.phone},${c.location},${c.orders},${c.totalSpent},${c.joinDate},${c.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.includes(searchQuery) || c.email.includes(searchQuery) || c.phone.includes(searchQuery)
    const matchesStatus = activeStatus === 'جميع الحالات' || c.status === activeStatus
    return matchesSearch && matchesStatus
  })

  const totalCustomersCount = customers.length
  const activeCustomersCount = customers.filter(c => c.status === 'نشط').length
  const disabledCustomersCount = customers.filter(c => c.status === 'معطل').length
  const totalOrdersCount = customers.reduce((acc, curr) => acc + curr.orders, 0)

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-slate-900">إدارة الزبائن</h1>
          <p className="text-sm text-slate-500">إدارة حسابات الزبائن وبياناتهم</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm">
          <Download className="size-4" />
          طباعة قائمة الزبائن
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">8% ↑</div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
            <Users className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي الزبائن</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalCustomersCount}</p>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <UserCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">الزبائن النشطون</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{activeCustomersCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <UserX className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">حسابات معطلة</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{disabledCustomersCount}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <ShoppingCart className="size-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">إجمالي الطلبات</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalOrdersCount}</p>
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
          <option>نشط</option>
          <option>معطل</option>
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث عن زبون..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-white focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">الاسم</th>
                <th className="px-6 py-4 font-medium">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-medium">الهاتف</th>
                <th className="px-6 py-4 font-medium">الموقع</th>
                <th className="px-6 py-4 font-medium">الطلبات</th>
                <th className="px-6 py-4 font-medium">الإنفاق الكلي</th>
                <th className="px-6 py-4 font-medium">تاريخ الانضمام</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{c.email}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{c.phone}</td>
                  <td className="px-6 py-4 text-slate-600">{c.location}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{c.orders}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600" dir="ltr">{c.totalSpent} د.ل</td>
                  <td className="px-6 py-4 text-slate-500">{c.joinDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleStatus(c.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.status === 'نشط' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={c.status === 'نشط' ? "تعطيل الحساب" : "تنشيط الحساب"}
                      >
                        <Ban className="size-4" />
                      </button>
                      <button 
                        onClick={() => openDetails(c)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                    لا يوجد زبائن مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-left">
          <p className="text-sm text-slate-500">
            عرض {filteredCustomers.length} من {totalCustomersCount} زبون
          </p>
        </div>
      </div>

      {/* Customer Details Modal */}
      {detailsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-900">تفاصيل الزبون</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-right border-b border-slate-100 pb-4 mb-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedCustomer.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedCustomer.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-mono">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-slate-500 mb-1">الموقع</p>
                  <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {selectedCustomer.location}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-slate-500 mb-1">رقم الهاتف</p>
                  <p className="font-bold text-slate-900 text-lg font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="rounded-xl bg-purple-50/50 border border-purple-100 p-5 text-center flex flex-col items-center justify-center">
                    <p className="font-bold text-purple-600 text-xl mb-1">{selectedCustomer.joinDate}</p>
                    <p className="text-sm text-slate-600">تاريخ الانضمام</p>
                 </div>
                 <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-5 text-center flex flex-col items-center justify-center">
                    <p className="font-bold text-emerald-600 text-3xl mb-1" dir="ltr">{selectedCustomer.totalSpent}</p>
                    <p className="text-sm text-slate-600 mt-1">د.ل</p>
                 </div>
                 <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-5 text-center flex flex-col items-center justify-center">
                    <p className="font-bold text-blue-600 text-3xl mb-1">{selectedCustomer.orders}</p>
                    <p className="text-sm text-slate-600 mt-1">طلب</p>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
