import { createPortal } from 'react-dom'
import { useState, useMemo } from 'react'
import { X, User, MapPin, Phone, Mail, ShoppingBag, Package, Star, TrendingUp, Calendar, CheckCircle2, Eye, Trash2, Search } from 'lucide-react'

export function StoreDetailModal({ store, open, onClose }) {
  const [query, setQuery] = useState('')

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
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-brand-200 shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-xl font-bold text-white">تفاصيل المتجر</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors">
            <X className="size-6" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
          
          {/* Store Main Info */}
          <div className="text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-brand-100 shadow-premium mb-4">
              <ShoppingBag className="size-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">{store.name}</h3>
            <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
              متجر متخصص في الملابس العصرية والأزياء الحديثة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-white/60">التاجر</p>
                <p className="font-bold text-white mt-1">{store.merchant || 'أحمد محمد'}</p>
              </div>
              <User className="size-5 text-white/50" />
            </div>
            <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-white/60">الموقع</p>
                <p className="font-bold text-white mt-1">{store.city || 'طرابلس'}</p>
              </div>
              <MapPin className="size-5 text-white/50" />
            </div>
            <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-white/60">البريد الإلكتروني</p>
                <p className="font-bold text-white mt-1">{store.email || 'ahmad@fashion.ly'}</p>
              </div>
              <Mail className="size-5 text-white/50" />
            </div>
            <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
              <div className="text-right">
                <p className="text-xs text-white/60">الهاتف</p>
                <p className="font-bold text-white mt-1 tabular-nums">{store.phone || '0912345678'}</p>
              </div>
              <Phone className="size-5 text-white/50" />
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-brand-100/50 p-4 border border-brand-100 text-center">
              <p className="text-3xl font-bold text-white tabular-nums">{stats.productsCount}</p>
              <p className="text-xs text-white/70 font-medium mt-1">المنتجات</p>
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
              <h4 className="font-bold text-white">أحدث المنتجات</h4>
              <span className="text-xs text-white/50">إجمالي {store.catalog?.length || 0} منتج</span>
            </div>
            <label className="relative block">
              <span className="sr-only">البحث في المنتجات</span>
              <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="البحث في المنتجات..."
                className="w-full rounded-xl border border-white/10 bg-brand-300/80 py-2.5 pe-10 ps-3 text-sm text-white outline-none ring-brand-500/30 transition focus:border-brand-300 focus:bg-brand-200 focus:ring-2"
              />
            </label>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(store.catalog || []).filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).map((product, idx) => (
                <div key={product.sku} className="rounded-2xl border border-white/5 bg-brand-200 p-4 shadow-premium flex items-center gap-4 hover:border-brand-200 transition-colors">
                  <div className="size-14 rounded-xl bg-brand-300 flex items-center justify-center overflow-hidden shrink-0">
                     <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bold text-white truncate">{product.name}</h5>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">نشط</span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-[11px] text-white/60">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5">
               <div className="text-right">
                <p className="text-xs text-white/60">تاريخ الانضمام</p>
                <p className="font-bold text-white mt-1 tabular-nums">{stats.joinDate}</p>
              </div>
              <Calendar className="size-5 text-white/50" />
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
            <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5">
               <div className="text-right">
                <p className="text-xs text-white/60">الحالة</p>
                <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">نشط</span>
              </div>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
          </div>

        </div>

        <div className="p-6 bg-brand-300 border-t border-white/5">
          <button onClick={onClose} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-premium hover:bg-slate-800 transition-all active:scale-95">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
