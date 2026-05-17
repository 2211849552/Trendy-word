import { createPortal } from 'react-dom'
import { X, User, MapPin, Phone, Mail, ShoppingBag, Package, Star, TrendingUp, Calendar, CheckCircle2, Eye, Trash2 } from 'lucide-react'

export function StoreDetailModal({ store, open, onClose }) {
  if (!open || !store) return null

  // Mock stats for demo purposes
  const stats = {
    rating: 4.8,
    orders: store.orders || 234,
    productsCount: store.products || 156,
    revenue: 45000,
    joinDate: '2025-01-15',
    activeProducts: 3
  }

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">تفاصيل المتجر</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="size-6" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
          
          {/* Store Main Info */}
          <div className="text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-blue-50 shadow-sm mb-4">
              <ShoppingBag className="size-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{store.name}</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              متجر متخصص في الملابس العصرية والأزياء الحديثة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-slate-500">التاجر</p>
                <p className="font-bold text-slate-900 mt-1">{store.merchant || 'أحمد محمد'}</p>
              </div>
              <User className="size-5 text-slate-400" />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-slate-500">الموقع</p>
                <p className="font-bold text-slate-900 mt-1">{store.city || 'طرابلس'}</p>
              </div>
              <MapPin className="size-5 text-slate-400" />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-slate-500">البريد الإلكتروني</p>
                <p className="font-bold text-slate-900 mt-1">{store.email || 'ahmad@fashion.ly'}</p>
              </div>
              <Mail className="size-5 text-slate-400" />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-slate-500">الهاتف</p>
                <p className="font-bold text-slate-900 mt-1 tabular-nums">{store.phone || '0912345678'}</p>
              </div>
              <Phone className="size-5 text-slate-400" />
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100 text-center">
              <p className="text-3xl font-bold text-blue-600 tabular-nums">{stats.productsCount}</p>
              <p className="text-xs text-blue-600/70 font-medium mt-1">المنتجات</p>
            </div>
            <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-100 text-center">
              <p className="text-3xl font-bold text-emerald-600 tabular-nums">{stats.orders}</p>
              <p className="text-xs text-emerald-600/70 font-medium mt-1">الطلبات</p>
            </div>
            <div className="rounded-xl bg-amber-50/50 p-4 border border-amber-100 text-center">
              <p className="text-3xl font-bold text-amber-600 tabular-nums">{stats.rating}</p>
              <p className="text-xs text-amber-600/70 font-medium mt-1">التقييم</p>
            </div>
          </div>

          {/* Products List (Scrollable) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">أحدث المنتجات</h4>
              <span className="text-xs text-slate-400">إجمالي {store.catalog?.length || 0} منتج</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(store.catalog || []).map((product, idx) => (
                <div key={product.sku} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
                  <div className="size-14 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                     <img 
                      src={`https://images.unsplash.com/photo-${idx % 2 === 0 ? '1521572163474-6864f9cf17ab' : '1591047139829-d91aecb6caea'}?auto=format&fit=crop&w=100&q=80`} 
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bold text-slate-900 truncate">{product.name}</h5>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">نشط</span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-500">
                      <span className="font-bold text-emerald-600">السعر: {product.price} د.ل</span>
                      <span>المخزون: {product.stock}</span>
                      <span>المشاهدات: {Math.floor(Math.random() * 500) + 100}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
               <div className="text-right">
                <p className="text-xs text-slate-500">تاريخ الانضمام</p>
                <p className="font-bold text-slate-900 mt-1 tabular-nums">{stats.joinDate}</p>
              </div>
              <Calendar className="size-5 text-slate-400" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-100">
               <div className="text-right">
                <p className="text-xs text-emerald-600">الإيرادات</p>
                <p className="font-bold text-emerald-700 mt-1 tabular-nums">{stats.revenue} د.ل</p>
              </div>
              <TrendingUp className="size-5 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-purple-50 p-4 border border-purple-100">
               <div className="text-right">
                <p className="text-xs text-purple-600">عدد المنتجات الفعلية</p>
                <p className="font-bold text-purple-700 mt-1 tabular-nums">{stats.activeProducts} منتج</p>
              </div>
              <Package className="size-5 text-purple-500" />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
               <div className="text-right">
                <p className="text-xs text-slate-500">الحالة</p>
                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">نشط</span>
              </div>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
          </div>

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
