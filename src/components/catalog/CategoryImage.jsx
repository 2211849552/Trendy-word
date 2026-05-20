import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { DEFAULT_CATEGORY_IMAGE } from '../../data/catalogData.js'

export function CategoryImage({ src, name, className = 'size-full' }) {
  const [failed, setFailed] = useState(false)
  const imageSrc = failed ? DEFAULT_CATEGORY_IMAGE : (src || DEFAULT_CATEGORY_IMAGE)

  return (
    <div className={`relative overflow-hidden bg-brand-300 ${className}`}>
      {!failed ? (
        <img
          src={imageSrc}
          alt={name}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1 text-white/50">
          <ImageIcon className="size-8" strokeWidth={1.5} aria-hidden />
          <span className="text-[10px] font-medium">{name}</span>
        </div>
      )}
    </div>
  )
}
