import { CATEGORY_IMAGE_PRESETS } from '../../data/catalogData.js'
import { CategoryImage } from './CategoryImage.jsx'

export function CategoryImagePicker({ value, onChange }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid min-w-0 flex-1 max-h-52 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
        {CATEGORY_IMAGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.url)}
            className={`overflow-hidden rounded-xl ring-2 transition-all ${
              value === preset.url
                ? 'ring-brand-900 scale-[1.02] shadow-premium'
                : 'ring-transparent hover:ring-brand-200'
            }`}
            title={preset.label}
          >
            <CategoryImage
              src={preset.url}
              name={preset.label}
              className="aspect-square size-full"
            />
          </button>
        ))}
      </div>
      <CategoryImage
        src={value}
        name="معاينة"
        className="size-16 shrink-0 rounded-xl ring-1 ring-slate-200"
      />
    </div>
  )
}
