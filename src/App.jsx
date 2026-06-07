import { useState, useEffect } from 'react'
import { getCurrentUser } from './api/user.js'
import { Sidebar } from './components/Sidebar.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { MarketingPage } from './pages/MarketingPage.jsx'
import { OverviewPage } from './pages/OverviewPage.jsx'
import { PlansPage } from './pages/PlansPage.jsx'
import { StoreManagementPage } from './pages/StoreManagementPage.jsx'
import { CategoriesPage } from './pages/CategoriesPage.jsx'
import { DisputesPage } from './pages/DisputesPage.jsx'
import { FinancePage } from './pages/FinancePage.jsx'
import { OffersPage } from './pages/OffersPage.jsx'
import { CustomersPage } from './pages/CustomersPage.jsx'
import { StaffPage } from './pages/StaffPage.jsx'
import { NotificationsPage } from './pages/NotificationsPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { DriversPage } from './pages/DriversPage.jsx'

function renderPage(activeNav) {
  if (activeNav === 'stores') return <StoreManagementPage />
  if (activeNav === 'plans') return <PlansPage />
  if (activeNav === 'marketing') return <MarketingPage />
  if (activeNav === 'catalog') return <CategoriesPage />
  if (activeNav === 'disputes') return <DisputesPage />
  if (activeNav === 'finance') return <FinancePage />
  if (activeNav === 'offers') return <OffersPage />
  if (activeNav === 'customers') return <CustomersPage />
  if (activeNav === 'staff') return <StaffPage />
  if (activeNav === 'notifications') return <NotificationsPage />
  if (activeNav === 'orders') return <OrdersPage />
  if (activeNav === 'drivers') return <DriversPage />
  return <OverviewPage />
}

export default function App() {
  const [activeNav, setActiveNav] = useState('overview')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }, [isDarkMode])

  useEffect(() => {
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setAuthChecking(false))
  }, [])

  if (authChecking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-brand-50" dir="rtl">
        <p className="text-sm text-white/55">جاري التحميل...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="flex min-h-dvh flex-row bg-brand-100" dir="ltr">
      <main dir="rtl" className="min-w-0 flex-1 overflow-auto px-6 py-8 lg:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto max-w-[1600px]">
          {renderPage(activeNav)}
        </div>
      </main>

      <Sidebar 
        activeId={activeNav} 
        onNavigate={setActiveNav} 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
    </div>
  )
}
