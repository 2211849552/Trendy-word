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
} from 'lucide-react'

const navItems = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'stores', label: 'إدارة المتاجر', icon: Store },
  { id: 'plans', label: 'إدارة الخطط', icon: CreditCard },
  { id: 'marketing', label: 'التسويق والمحتوى', icon: Megaphone },
  {
    id: 'catalog',
    label: 'إدارة الكتالوج والتصنيفات',
    icon: List,
  },
  { id: 'disputes', label: 'الشكاوى والنزاعات', icon: MessageCircle },
  { id: 'finance', label: 'الإدارة المالية', icon: DollarSign },
  { id: 'offers', label: 'العروض والخصومات', icon: Tag },
  { id: 'customers', label: 'إدارة الزبائن', icon: Users },
  { id: 'staff', label: 'إدارة الموظفين', icon: UserPlus },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
]

export function Sidebar({ activeId = 'overview', onNavigate }) {
  const [openMenus, setOpenMenus] = useState({ catalog: true })

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside
      dir="rtl"
      className="flex h-dvh w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white shadow-sm"
    >
      <div className="shrink-0 border-b border-slate-100 px-6 py-7 text-center">
        <h1 className="text-lg font-bold tracking-tight text-blue-950">
          Trendy Dashboard
        </h1>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
        aria-label="القائمة الرئيسية"
      >
        {navItems.map(({ id, label, icon: Icon, items }) => {
          const isActive = id === activeId || items?.some((sub) => sub.id === activeId)
          const isOpen = openMenus[id]

          return (
            <div key={id}>
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
                  'flex w-full items-center justify-between rounded-xl border-e-4 px-3 py-2.5 text-start text-sm font-medium transition-colors',
                  isActive && !items
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : isActive && items
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="size-5 shrink-0"
                    strokeWidth={isActive ? 2.25 : 2}
                    aria-hidden
                  />
                  {label}
                </div>
                {items && (
                  isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />
                )}
              </button>

              {items && isOpen && (
                <div className="mt-1 flex flex-col gap-1 pr-9">
                  {items.map((subItem) => {
                    const isSubActive = subItem.id === activeId
                    return (
                      <button
                        key={subItem.id}
                        type="button"
                        onClick={() => onNavigate?.(subItem.id)}
                        className={[
                          'flex w-full items-center rounded-lg px-3 py-2 text-start text-sm font-medium transition-colors relative',
                          isSubActive
                            ? 'text-blue-600 bg-blue-50/50'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                        ].join(' ')}
                      >
                        {isSubActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-600" />}
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

      <div className="flex shrink-0 justify-end p-4" dir="ltr">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700"
          aria-label="المساعدة"
        >
          <HelpCircle className="size-5" strokeWidth={2} />
        </button>
      </div>
    </aside>
  )
}
