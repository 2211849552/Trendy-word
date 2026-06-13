import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ImagePlus, X } from 'lucide-react'
import {
  CAMPAIGN_IMAGE_TYPES,
  validateCampaignImage,
} from '../../api/adminCampaigns.js'

const acceptImages = CAMPAIGN_IMAGE_TYPES.join(',')

export function EditCampaignModal({ campaign, open, onClose, onSave, saving = false }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [price, setPrice] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [bannerImage, setBannerImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open || !campaign) return
    setName(campaign.title)
    setDescription(campaign.description)
    setLink(campaign.link ?? '')
    setPrice(campaign.price != null ? String(campaign.price) : '')
    setDateFrom(campaign.dateFrom)
    setDateTo(campaign.dateTo)
    setBannerImage(null)
    setPreviewUrl('')
    setErrors({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [open, campaign])

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

  if (!open || !campaign) return null

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-brand-300/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-900 focus:bg-brand-200 focus:ring-2 focus:ring-brand-900/20'

  const displayImageUrl = previewUrl || campaign.bannerImageUrl || ''
  const hasNewImage = bannerImage instanceof File

  const clearNewImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setBannerImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (errors.bannerImage) setErrors((x) => ({ ...x, bannerImage: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      clearNewImage()
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
    setBannerImage(file)
    setErrors((prev) => ({ ...prev, bannerImage: '' }))
  }

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'مطلوب'
    if (!description.trim()) e.description = 'مطلوب'
    const priceNum = Number(price)
    if (price === '' || Number.isNaN(priceNum)) e.price = 'مطلوب'
    else if (priceNum < 0) e.price = 'يجب أن يكون السعر صفراً أو أكثر'
    if (!dateFrom) e.dateFrom = 'مطلوب'
    if (!dateTo) e.dateTo = 'مطلوب'
    if (dateFrom && dateTo && dateTo < dateFrom) {
      e.dateTo = 'يجب أن يكون بعد تاريخ البدء'
    }
    if (bannerImage) {
      const imageError = validateCampaignImage(bannerImage)
      if (imageError) e.bannerImage = imageError
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (saving || !validate()) return
    const priceNum = Number(price)
    await onSave?.({
      id: campaign.id,
      name: name.trim(),
      description: description.trim(),
      link: link.trim(),
      price: priceNum,
      dateFrom,
      dateTo,
      bannerImage,
    })
  }

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
        aria-labelledby="edit-campaign-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/5 bg-brand-200 px-5 py-4">
          <h2 id="edit-campaign-title" className="text-lg font-bold text-white">
            تعديل الحملة
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
            <label htmlFor="edit-name" className="mb-1.5 block text-sm font-semibold text-white/90">
              اسم الحملة
            </label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((x) => ({ ...x, name: '' }))
              }}
              className={fieldClass}
              disabled={saving}
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="edit-desc" className="mb-1.5 block text-sm font-semibold text-white/90">
              الوصف
            </label>
            <textarea
              id="edit-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((x) => ({ ...x, description: '' }))
              }}
              rows={4}
              className={`${fieldClass} resize-y min-h-[100px]`}
              disabled={saving}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="edit-link" className="mb-1.5 block text-sm font-semibold text-white/90">
              رابط الحملة
            </label>
            <input
              id="edit-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className={fieldClass}
              dir="ltr"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="edit-price" className="mb-1.5 block text-sm font-semibold text-white/90">
              سعر الحملة (د.ل) <span className="text-rose-600">*</span>
            </label>
            <input
              id="edit-price"
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price) setErrors((x) => ({ ...x, price: '' }))
              }}
              className={fieldClass}
              dir="ltr"
              disabled={saving}
            />
            {errors.price ? <p className="mt-1 text-xs text-rose-600">{errors.price}</p> : null}
          </div>

          <div>
            <label htmlFor="edit-image" className="mb-1.5 block text-sm font-semibold text-white/90">
              صورة الإعلان
            </label>
            <p className="mb-2 text-xs text-white/50">
              JPEG أو PNG أو WebP — حد أقصى 2 ميجابايت
            </p>

            {displayImageUrl ? (
              <div className="relative mb-3 overflow-hidden rounded-xl border border-white/10 bg-brand-300/50">
                <img
                  src={displayImageUrl}
                  alt="صورة الإعلان"
                  className="max-h-48 w-full object-cover"
                />
                {hasNewImage ? (
                  <button
                    type="button"
                    onClick={clearNewImage}
                    disabled={saving}
                    className="absolute left-2 top-2 rounded-lg bg-slate-900/70 p-1.5 text-white transition hover:bg-slate-900 disabled:opacity-50"
                    aria-label="إلغاء الصورة الجديدة"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>
            ) : (
              <label
                htmlFor="edit-image"
                className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-brand-300/40 px-4 py-8 text-center transition hover:border-brand-500/40 hover:bg-brand-300/60"
              >
                <ImagePlus className="size-8 text-white/40" />
                <span className="text-sm font-medium text-white/70">اضغطي لرفع صورة الإعلان</span>
              </label>
            )}

            <input
              ref={fileInputRef}
              id="edit-image"
              type="file"
              accept={acceptImages}
              onChange={handleImageChange}
              disabled={saving}
              className="block w-full text-xs text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white disabled:opacity-60"
            />
            {hasNewImage ? (
              <p className="mt-1 text-xs text-brand-300">سيتم استبدال الصورة الحالية عند الحفظ.</p>
            ) : campaign.bannerImageUrl ? (
              <p className="mt-1 text-xs text-white/50">اختر ملفاً جديداً لاستبدال الصورة الحالية.</p>
            ) : null}
            {errors.bannerImage ? (
              <p className="mt-1 text-xs text-rose-600">{errors.bannerImage}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-from" className="mb-1.5 block text-sm font-semibold text-white/90">
                تاريخ البدء
              </label>
              <input
                id="edit-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  if (errors.dateFrom) setErrors((x) => ({ ...x, dateFrom: '' }))
                }}
                className={fieldClass}
                disabled={saving}
              />
              {errors.dateFrom ? (
                <p className="mt-1 text-xs text-rose-600">{errors.dateFrom}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="edit-to" className="mb-1.5 block text-sm font-semibold text-white/90">
                تاريخ الانتهاء
              </label>
              <input
                id="edit-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  if (errors.dateTo) setErrors((x) => ({ ...x, dateTo: '' }))
                }}
                className={fieldClass}
                disabled={saving}
              />
              {errors.dateTo ? <p className="mt-1 text-xs text-rose-600">{errors.dateTo}</p> : null}
            </div>
          </div>

          <div className="flex gap-3 border-t border-white/5 pt-5" dir="rtl">
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
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
