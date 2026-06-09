const GRADIENT_STYLE = {
  backgroundImage: 'linear-gradient(to right, #b533ff, #4285f4)',
  backgroundColor: '#b533ff',
}

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-xl border-0 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-[#b533ff]/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'

const SIZE_CLASS = {
  default: 'px-4 py-2.5',
  lg: 'min-h-12 px-8',
}

export function PrimaryButton({
  children,
  className = '',
  size = 'default',
  type = 'button',
  style,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${BASE_CLASS} ${SIZE_CLASS[size] ?? SIZE_CLASS.default} ${className}`.trim()}
      style={{ ...GRADIENT_STYLE, ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
