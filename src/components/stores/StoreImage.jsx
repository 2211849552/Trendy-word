import { useState } from 'react'
import { Store } from 'lucide-react'
import { DEFAULT_STORE_IMAGE } from '../../data/storeImages.js'

export function StoreImage({ src, name, className = 'size-full' }) {
  const [failed, setFailed] = useState(false)
  const imageSrc = failed ? DEFAULT_STORE_IMAGE : (src || DEFAULT_STORE_IMAGE)

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {!failed ? (
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
        <div className="flex size-full items-center justify-center text-brand-800">
          <Store className="size-6" strokeWidth={1.75} aria-hidden />
        </div>
      )}
    </div>
  )
}
