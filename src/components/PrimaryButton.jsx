const SIZE_CLASS = {
  default: 'px-4 py-2.5',
  lg: 'min-h-12 px-8',
}

export function PrimaryButton({
  children,
  className = '',
  size = 'default',
  type = 'button',
  ...props
}) {
  const btnClass = size === 'lg' ? 'btn-primary-lg' : 'btn-primary'

  return (
    <button
      type={type}
      className={`${btnClass} inline-flex items-center justify-center gap-2 ${SIZE_CLASS[size] ?? SIZE_CLASS.default} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
