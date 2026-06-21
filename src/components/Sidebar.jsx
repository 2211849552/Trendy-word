import { useState } from 'react'
import trendyLogo from '../assets/vite.svg'
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Megaphone,
  List,
  MessageCircle,
  DollarSign,
  Users,
  UserPlus,
  Bell,
  ChevronDown,
  ShoppingCart,
  Truck,
  MapPin,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import {
  hasStoreManagementAccess,
  canAccessOrderList,
  canAccessDisputes,
  canAccessCustomers,
  canAccessFinance,
  canAccessStaff,
  canAccessCatalog,
  canAccessPlans,
  canAccessMarketing,
  canAccessDrivers,
  canAccessZones,
} from '../api/user.js'

const navItems = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'stores', label: 'إدارة المتاجر', icon: Store },
  { id: 'plans', label: 'إدارة الخطط', icon: CreditCard },
  { id: 'marketing', label: 'التسويق والمحتوى', icon: Megaphone },
  { id: 'catalog', label: 'إدارة الكتالوج', icon: List },
  { id: 'disputes', label: 'الشكاوى والنزاعات', icon: MessageCircle },
  { id: 'finance', label: 'الإدارة المالية', icon: DollarSign },
  { id: 'customers', label: 'إدارة الزبائن', icon: Users },
  { id: 'staff', label: 'إدارة الموظفين', icon: UserPlus },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'orders', label: 'إدارة الطلبات', icon: ShoppingCart },
  { id: 'drivers', label: 'إدارة السائقين', icon: Truck },
  { id: 'zones', label: 'إدارة المناطق', icon: MapPin },
]

export function Sidebar({
  activeId = 'overview',
  onNavigate,
  isDarkMode = true,
  onToggleDarkMode,
  onLogout,
  unreadNotificationsCount = 0,
  currentUser,
}) {
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredNavItems = navItems.filter((item) => {
    if (!currentUser) return true
    if (item.id === 'stores') {
      return hasStoreManagementAccess(currentUser)
    }
    if (item.id === 'orders') {
      return canAccessOrderList(currentUser)
    }
    if (item.id === 'disputes') {
      return canAccessDisputes(currentUser)
    }
    if (item.id === 'customers') {
      return canAccessCustomers(currentUser)
    }
    if (item.id === 'finance') {
      return canAccessFinance(currentUser)
    }
    if (item.id === 'staff') {
      return canAccessStaff(currentUser)
    }
    if (item.id === 'catalog') {
      return canAccessCatalog(currentUser)
    }
    if (item.id === 'plans') {
      return canAccessPlans(currentUser)
    }
    if (item.id === 'marketing') {
      return canAccessMarketing(currentUser)
    }
    if (item.id === 'drivers') {
      return canAccessDrivers(currentUser)
    }
    if (item.id === 'zones') {
      return canAccessZones(currentUser)
    }
    return true
  })

  const mainNavItems = filteredNavItems

  const renderNavItem = ({ id, label, icon: Icon, items }) => {
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
          <div className="flex items-center gap-3 flex-1 min-w-0">
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
            <span className="truncate">{label}</span>
            {id === 'notifications' && unreadNotificationsCount > 0 && (
              <span className="mr-auto shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none shadow-sm animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
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
  }

  return (
    <aside
      dir="rtl"
      className="sticky top-0 flex h-dvh w-72 shrink-0 flex-col overflow-hidden bg-brand-950 text-white shadow-xl"
    >
      <div className="flex shrink-0 flex-col items-center gap-1.5 border-b border-white/10 px-4 py-5 text-center">
        <img
          src={trendyLogo}
          alt="Trendy"
          className="block h-auto w-[110px] max-w-full object-contain"
        />
        <p className="text-[15px] font-bold text-white">لوحة تحكم الإدارة العليا</p>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        aria-label="القائمة الرئيسية"
      >
        {mainNavItems.map(renderNavItem)}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 border-t border-white/10 px-6 py-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
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