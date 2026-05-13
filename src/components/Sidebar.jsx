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
]

export function Sidebar({ activeId = 'overview', onNavigate }) {
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
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = id === activeId
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={[
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-medium transition-colors',
                active
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon
                className="size-5 shrink-0"
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              {label}
            </button>
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
