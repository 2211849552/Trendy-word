import { useState } from 'react'
import { Store } from 'lucide-react'
import { DEFAULT_STORE_IMAGE } from '../../data/storeImages.js'

export function StoreImage({ src, name, className = 'size-full', useDefaultImage = true }) {
  const [failed, setFailed] = useState(false)
  const hasSource = Boolean(src)
  const imageSrc = !hasSource || failed
    ? (useDefaultImage ? DEFAULT_STORE_IMAGE : null)
    : src

  return (
    <div className={`relative overflow-hidden bg-brand-300 ${className}`}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center text-white/90">
          <Store className="size-6" strokeWidth={1.75} aria-hidden />
        </div>
      )}
    </div>
  )
}
