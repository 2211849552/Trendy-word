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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Truck
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'stores', label: 'إدارة المتاجر', icon: Store },
  { id: 'plans', label: 'إدارة الخطط', icon: CreditCard },
  { id: 'marketing', label: 'التسويق والمحتوى', icon: Megaphone },
  {
    id: 'catalog',
    label: 'إدارة الكتالوج',
    icon: List,
  },
  { id: 'disputes', label: 'الشكاوى والنزاعات', icon: MessageCircle },
  { id: 'finance', label: 'الإدارة المالية', icon: DollarSign },
  { id: 'offers', label: 'العروض والخصومات', icon: Tag },
  { id: 'customers', label: 'إدارة الزبائن', icon: Users },
  { id: 'staff', label: 'إدارة الموظفين', icon: UserPlus },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingCart },
  { id: 'drivers', label: 'إدارة السائقين', icon: Truck },
]

export function Sidebar({ activeId = 'overview', onNavigate }) {
  const [openMenus, setOpenMenus] = useState({ catalog: true })

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      dir="rtl"
      className="flex h-dvh w-72 shrink-0 flex-col overflow-hidden bg-brand-950 text-white shadow-2xl"
    >
      <div className="shrink-0 px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
            <Store className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Trendy
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-brand-300/60">
              Admin Control
            </p>
          </div>
        </div>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-4 scrollbar-hide"
        aria-label="القائمة الرئيسية"
      >
        {navItems.map(({ id, label, icon: Icon, items }) => {
          const isActive = id === activeId || items?.some((sub) => sub.id === activeId)
          const isOpen = openMenus[id]

          return (
            <div key={id} className="mb-1">
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
                  'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-start text-sm font-medium transition-all duration-200',
                  isActive && !items
                    ? 'premium-gradient text-white shadow-lg shadow-brand-600/20'
                    : isActive && items
                    ? 'bg-white/5 text-white'
                    : 'text-brand-100/60 hover:bg-white/5 hover:text-white',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={[
                      'size-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-brand-400/60 group-hover:text-brand-300',
                    ].join(' ')}
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden
                  />
                  <span>{label}</span>
                </div>
                {items && (
                  <div className={['transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(' ')}>
                    <ChevronDown className="size-4 opacity-40" />
                  </div>
                )}
              </button>

              {items && isOpen && (
                <div className="mt-1 flex flex-col gap-1 pr-11">
                  {items.map((subItem) => {
                    const isSubActive = subItem.id === activeId
                    return (
                      <button
                        key={subItem.id}
                        type="button"
                        onClick={() => onNavigate?.(subItem.id)}
                        className={[
                          'flex w-full items-center rounded-lg py-2 text-start text-[13px] font-medium transition-colors relative',
                          isSubActive
                            ? 'text-brand-300'
                            : 'text-brand-100/40 hover:text-brand-200',
                        ].join(' ')}
                      >
                        {isSubActive && <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(165,180,252,0.6)]" />}
                        {subItem.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>


    </aside>
  )
}
