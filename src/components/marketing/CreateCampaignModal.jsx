import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImagePlus, X } from 'lucide-react'
import {
  CAMPAIGN_IMAGE_TYPES,
  getTodayIsoDate,
  validateCampaignImage,
} from '../../api/adminCampaigns.js'

function emptyForm() {
  return {
    name: '',
    description: '',
    link: '',
    dateFrom: getTodayIsoDate(),
    dateTo: '',
    bannerImage: null,
    price: '',
  }
}

const acceptImages = CAMPAIGN_IMAGE_TYPES.join(',')

export function CreateCampaignModal({ open, onClose, onSubmit, saving = false }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setForm(emptyForm())
      setErrors({})
      setPreviewUrl('')
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, saving])

  if (!open) return null

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    set('bannerImage', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      clearImage()
      return
    }

    const imageError = validateCampaignImage(file)
    if (imageError) {
      setErrors((prev) => ({ ...prev, bannerImage: imageError }))
      e.target.value = ''
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    set('bannerImage', file)
    setErrors((prev) => ({ ...prev, bannerImage: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'مطلوب'
    if (!form.description.trim()) e.description = 'مطلوب'
    if (!form.dateFrom) e.dateFrom = 'مطلوب'
    if (!form.dateTo) e.dateTo = 'مطلوب'
    if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom) {
      e.dateTo = 'يجب أن يكون بعد تاريخ البدء'
    }
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) {
      e.price = 'يجب إدخال سعر صالح (أكبر من أو يساوي 0)'
    }
    if (form.bannerImage) {
      const imageError = validateCampaignImage(form.bannerImage)
      if (imageError) e.bannerImage = imageError
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (saving || !validate()) return
    await onSubmit?.({ ...form })
  }

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-brand-300/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-900 focus:bg-brand-200 focus:ring-2 focus:ring-brand-900/20'

  const overlay = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => !saving && onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-campaign-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/5 bg-brand-200 px-5 py-4">
          <h2 id="create-campaign-title" className="text-lg font-bold text-white">
            إنشاء حملة إعلانية
          </h2>
          <button
            type="button"
            onClick={() => !saving && onClose?.()}
            className="rounded-lg p-2 text-white/60 hover:bg-brand-300 hover:text-white/90 disabled:opacity-50"
            aria-label="إغلاق"
            disabled={saving}
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6">
          <div>
            <label htmlFor="camp-name" className="mb-1.5 block text-sm font-semibold text-white/90">
              اسم الحملة <span className="text-rose-600">*</span>
            </label>
            <input
              id="camp-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="مثال: حملة تخفيضات الصيف"
              className={fieldClass}
              disabled={saving}
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="camp-desc" className="mb-1.5 block text-sm font-semibold text-white/90">
              الوصف <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="camp-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="وصف الحملة"
              rows={4}
              className={`${fieldClass} resize-y min-h-[100px]`}
              disabled={saving}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="camp-link" className="mb-1.5 block text-sm font-semibold text-white/90">
              رابط الحملة
            </label>
            <input
              id="camp-link"
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              placeholder="/offers/summer/"
              className={fieldClass}
              dir="ltr"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="camp-price" className="mb-1.5 block text-sm font-semibold text-white/90">
              سعر الاشتراك للحملة (د.ل) <span className="text-rose-600">*</span>
            </label>
            <input
              id="camp-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="مثال: 50.00"
              className={fieldClass}
              disabled={saving}
            />
            {errors.price ? <p className="mt-1 text-xs text-rose-600">{errors.price}</p> : null}
          </div>

          <div>
            <label htmlFor="camp-image" className="mb-1.5 block text-sm font-semibold text-white/90">
              صورة الإعلان
            </label>
            <p className="mb-2 text-xs text-white/50">
              JPEG أو PNG أو WebP — حد أقصى 2 ميجابايت
            </p>

            {previewUrl ? (
              <div className="relative mb-3 overflow-hidden rounded-xl border border-white/10 bg-brand-300/50">
                <img
                  src={previewUrl}
                  alt="معاينة صورة الإعلان"
                  className="max-h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={saving}
                  className="absolute left-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white transition hover:bg-slate-900 disabled:opacity-50"
                  aria-label="إزالة الصورة"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="camp-image"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-brand-300/40 px-4 py-8 text-center transition hover:border-brand-500/40 hover:bg-brand-300/60"
              >
                <ImagePlus className="size-8 text-white/40" />
                <span className="text-sm font-medium text-white/70">اضغطي لرفع صورة الإعلان</span>
                <span className="text-xs text-white/45">اختياري — تظهر في واجهة الإعلان</span>
              </label>
            )}

            <input
              ref={fileInputRef}
              id="camp-image"
              type="file"
              accept={acceptImages}
              onChange={handleImageChange}
              disabled={saving}
              className={previewUrl ? 'mt-2 block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white' : 'sr-only'}
            />
            {errors.bannerImage ? (
              <p className="mt-1 text-xs text-rose-600">{errors.bannerImage}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="camp-from" className="mb-1.5 block text-sm font-semibold text-white/90">
                تاريخ البدء <span className="text-rose-600">*</span>
              </label>
              <input
                id="camp-from"
                type="date"
                value={form.dateFrom}
                onChange={(e) => set('dateFrom', e.target.value)}
                className={fieldClass}
                disabled={saving}
              />
              {errors.dateFrom ? (
                <p className="mt-1 text-xs text-rose-600">{errors.dateFrom}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="camp-to" className="mb-1.5 block text-sm font-semibold text-white/90">
                تاريخ الانتهاء <span className="text-rose-600">*</span>
              </label>
              <input
                id="camp-to"
                type="date"
                value={form.dateTo}
                onChange={(e) => set('dateTo', e.target.value)}
                className={fieldClass}
                disabled={saving}
              />
              {errors.dateTo ? <p className="mt-1 text-xs text-rose-600">{errors.dateTo}</p> : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onClose?.()}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-brand-200 px-5 py-2.5 text-sm font-semibold text-white/80 shadow-premium hover:bg-brand-300 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white shadow-premium hover:bg-brand-950 disabled:opacity-60"
            >
              {saving ? 'جاري الإنشاء...' : 'إضافة الحملة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
