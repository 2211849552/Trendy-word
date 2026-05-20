import { useState } from 'react'
import { Users, UserCheck, AlertCircle, TrendingUp, Search, Eye, Edit, Ban, Plus, X } from 'lucide-react'

const initialStaff = [
  {
    id: 1,
    name: 'عمر الليبي',
    email: 'omar@trendy.ly',
    phone: '0911111111',
    role: 'مدير نظام',
    hireDate: '2024-01-01',
    lastLogin: '10:30 2026-05-02',
    status: 'نشط'
  },
  {
    id: 2,
    name: 'ليلى محمود',
    email: 'laila@trendy.ly',
    phone: '0922222222',
    role: 'مسؤول عمليات',
    hireDate: '2024-02-15',
    lastLogin: '09:15 2026-05-02',
    status: 'نشط'
  },
  {
    id: 3,
    name: 'كريم عبدالله',
    email: 'karim@trendy.ly',
    phone: '0933333333',
    role: 'محاسب',
    hireDate: '2024-03-10',
    lastLogin: '16:45 2026-05-01',
    status: 'نشط'
  }
];

export function StaffPage() {
  const [staff, setStaff] = useState(initialStaff)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeRole, setActiveRole] = useState('جميع الأدوار')
  
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const openDetails = (s) => {
    setSelectedStaff(s)
    setDetailsModalOpen(true)
  }

  const openEdit = (s) => {
    setSelectedStaff(s ? { ...s } : { name: '', email: '', phone: '', role: 'موظف دعم' })
    setEditModalOpen(true)
  }

  const toggleStatus = (id) => {
    setStaff(staff.map(s => 
      s.id === id ? { ...s, status: s.status === 'نشط' ? 'معطل' : 'نشط' } : s
    ))
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (selectedStaff.id) {
      setStaff(staff.map(s => s.id === selectedStaff.id ? selectedStaff : s))
    } else {
      setStaff([...staff, { 
        ...selectedStaff, 
        id: Date.now(), 
        hireDate: new Date().toISOString().split('T')[0],
        lastLogin: 'لم يسجل الدخول',
        status: 'نشط'
      }])
    }
    setEditModalOpen(false)
  }

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || s.email.includes(searchQuery) || s.phone.includes(searchQuery)
    const matchesRole = activeRole === 'جميع الأدوار' || s.role === activeRole
    return matchesSearch && matchesRole
  })

  const totalStaffCount = staff.length
  const activeStaffCount = staff.filter(s => s.status === 'نشط').length
  const disabledStaffCount = staff.filter(s => s.status === 'معطل').length
  const newStaffCount = 5 // Dummy value matching the screenshot

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'مدير نظام': return 'bg-brand-300 text-brand-700'
      case 'مسؤول عمليات': return 'bg-brand-300 text-white/90'
      case 'محاسب': return 'bg-brand-300 text-white/90'
      default: return 'bg-brand-300 text-white/80'
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">إدارة الموظفين</h1>
          <p className="text-sm text-white/60">إدارة حسابات الموظفين والصلاحيات</p>
        </div>
        <button onClick={() => openEdit(null)} className="flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-950 transition-colors shadow-premium">
          <Plus className="size-4" />
          إضافة موظف
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <Users className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الموظفين</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalStaffCount}</p>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <UserCheck className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">الموظفون النشطون</p>
          <p className="mt-1 text-2xl font-bold text-white">{activeStaffCount}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-yellow-50 text-yellow-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">حسابات معطلة</p>
          <p className="mt-1 text-2xl font-bold text-white">{disabledStaffCount}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <TrendingUp className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">موظفون جدد (الشهر)</p>
          <p className="mt-1 text-2xl font-bold text-white">{newStaffCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <select 
          value={activeRole}
          onChange={e => setActiveRole(e.target.value)}
          className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
        >
          <option>جميع الأدوار</option>
          <option>مدير نظام</option>
          <option>مسؤول عمليات</option>
          <option>محاسب</option>
          <option>موظف دعم</option>
          <option>مسؤول متاجر</option>
        </select>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث عن موظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">الاسم</th>
                <th className="px-6 py-4 font-medium">البريد الإلكتروني</th>
                <th className="px-6 py-4 font-medium">الهاتف</th>
                <th className="px-6 py-4 font-medium">الدور</th>
                <th className="px-6 py-4 font-medium">تاريخ التوظيف</th>
                <th className="px-6 py-4 font-medium">آخر دخول</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map(s => (
                <tr key={s.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                  <td className="px-6 py-4 text-white/70 font-mono text-xs">{s.email}</td>
                  <td className="px-6 py-4 text-white/70 font-mono text-xs">{s.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(s.role)}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60">{s.hireDate}</td>
                  <td className="px-6 py-4 text-white/60 text-xs">{s.lastLogin}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      s.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => toggleStatus(s.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          s.status === 'نشط' ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={s.status === 'نشط' ? "تعطيل الحساب" : "تنشيط الحساب"}
                      >
                        <Ban className="size-4" />
                      </button>
                      <button 
                        onClick={() => openEdit(s)}
                        className="icon-btn-edit"
                        title="تعديل"
                      >
                        <Edit className="size-4" />
                      </button>
                      <button 
                        onClick={() => openDetails(s)}
                        className="icon-btn-view"
                        title="عرض التفاصيل"
                      >
                        <Eye className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-white/60">
                    لا يوجد موظفين مطابقين للبحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 bg-brand-300/50 text-left">
          <p className="text-sm text-white/60">
            عرض {filteredStaff.length} من {totalStaffCount} موظف
          </p>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل الموظف</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4 mb-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedStaff.status === 'نشط' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedStaff.status}
                </span>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white">{selectedStaff.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedStaff.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">البريد الإلكتروني</p>
                  <p className="font-bold text-white text-lg font-mono">{selectedStaff.email}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">رقم الهاتف</p>
                  <p className="font-bold text-white text-lg font-mono">{selectedStaff.phone}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">تاريخ التوظيف</p>
                  <p className="font-bold text-white text-lg">{selectedStaff.hireDate}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">آخر دخول</p>
                  <p className="font-bold text-white text-lg text-xs">{selectedStaff.lastLogin}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Modal */}
      {editModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">
                {selectedStaff.id ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </h2>
              <button onClick={() => setEditModalOpen(false)} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-5 text-right">
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  value={selectedStaff.name}
                  onChange={e => setSelectedStaff({...selectedStaff, name: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    required
                    value={selectedStaff.email}
                    onChange={e => setSelectedStaff({...selectedStaff, email: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-mono text-left outline-none transition-colors focus:border-brand-500"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">رقم الهاتف</label>
                  <input 
                    type="tel" 
                    required
                    value={selectedStaff.phone}
                    onChange={e => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-mono text-left outline-none transition-colors focus:border-brand-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">الدور الوظيفي</label>
                <select 
                  value={selectedStaff.role}
                  onChange={e => setSelectedStaff({...selectedStaff, role: e.target.value})}
                  className="w-full rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500"
                >
                  <option>مدير نظام</option>
                  <option>مسؤول عمليات</option>
                  <option>محاسب</option>
                  <option>موظف دعم</option>
                  <option>مسؤول متاجر</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button 
                  type="submit"
                  className="rounded-lg bg-brand-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-950 transition-colors"
                >
                  حفظ التعديلات
                </button>
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg border border-white/10 bg-brand-200 px-6 py-2.5 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors"
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
