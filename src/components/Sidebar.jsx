import { useState } from 'react'
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Megaphone,
  List,
  MessageCircle,
  DollarSign,
  Tag,
  Users,
  UserPlus,
  Bell,
  ChevronDown,
  ShoppingCart,
  Truck,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'stores', label: 'إدارة المتاجر', icon: Store },
  { id: 'plans', label: 'إدارة الخطط', icon: CreditCard },
  { id: 'marketing', label: 'التسويق والمحتوى', icon: Megaphone },
  { id: 'catalog', label: 'إدارة الكتالوج', icon: List },
  { id: 'disputes', label: 'الشكاوى والنزاعات', icon: MessageCircle },
  { id: 'finance', label: 'الإدارة المالية', icon: DollarSign },
  { id: 'offers', label: 'العروض والخصومات', icon: Tag },
  { id: 'customers', label: 'إدارة الزبائن', icon: Users },
  { id: 'staff', label: 'إدارة الموظفين', icon: UserPlus },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingCart },
  { id: 'drivers', label: 'إدارة السائقين', icon: Truck },
]

export function Sidebar({ activeId = 'overview', onNavigate, isDarkMode = true, onToggleDarkMode, onLogout }) {
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      dir="rtl"
      className="flex h-dvh w-72 shrink-0 flex-col overflow-hidden bg-brand-950 text-white shadow-xl"
    >
      <div className="shrink-0 border-b border-white/10 px-6 py-7">
        <h1 className="text-xl font-bold tracking-tight text-white">Trendy</h1>
        <p className="mt-1 text-xs font-medium text-white/55">لوحة تحكم الإدارة العليا</p>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        aria-label="القائمة الرئيسية"
      >
        {navItems.map(({ id, label, icon: Icon, items }) => {
          const isActive = id === activeId || items?.some((sub) => sub.id === activeId)
          const isOpen = openMenus[id]
          const isLeafActive = isActive && !items

          return (
            <div key={id} className="mb-0.5">
              <button
                type="button"
                onClick={() => {
                  if (items) {
                    toggleMenu(id)
                  } else {
                    onNavigate?.(id)
                  }
                }}
                className={[
                  'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-start text-sm font-semibold transition-all duration-200',
                  isLeafActive
                    ? 'nav-item-active'
                    : isActive && items
                      ? 'bg-brand-200/10 text-white'
                      : 'text-white/70 hover:bg-brand-200/10 hover:text-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={[
                      'size-5 shrink-0',
                      isLeafActive
                        ? 'text-white'
                        : 'text-white/60 group-hover:text-white',
                    ].join(' ')}
                    strokeWidth={isLeafActive ? 2.25 : 2}
                    aria-hidden
                  />
                  <span>{label}</span>
                </div>
                {items ? (
                  <div className={['transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(' ')}>
                    <ChevronDown className="size-4 opacity-50" />
                  </div>
                ) : null}
              </button>

              {items && isOpen ? (
                <div className="mt-1 flex flex-col gap-0.5 pr-4">
                  {items.map((subItem) => {
                    const isSubActive = subItem.id === activeId
                    return (
                      <button
                        key={subItem.id}
                        type="button"
                        onClick={() => onNavigate?.(subItem.id)}
                        className={[
                          'flex w-full items-center rounded-lg px-4 py-2 text-start text-[13px] font-medium transition-all',
                          isSubActive ? 'nav-item-active' : 'text-white/55 hover:bg-brand-200/10 hover:text-white',
                        ].join(' ')}
                      >
                        {subItem.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 border-t border-white/10 px-6 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-brand-200/10 hover:text-white"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          <span>تسجيل الخروج</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            onClick={onToggleDarkMode}
            className={[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75',
              isDarkMode ? 'bg-brand-500' : 'bg-white/20'
            ].join(' ')}
          >
            <span className="sr-only">Toggle dark mode</span>
            <span
              aria-hidden="true"
              className={[
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                isDarkMode ? '-translate-x-4' : 'translate-x-0'
              ].join(' ')}
            />
          </button>
          <span className="text-white/70">
            {isDarkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </span>
        </div>
      </div>
    </aside>
  )
}