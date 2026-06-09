import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Users,
  Store,
  UserPlus,
} from 'lucide-react'
import { StatCard } from '../components/StatCard.jsx'
import { PieChartCard } from '../components/PieChartCard.jsx'
import { LineChartCard } from '../components/LineChartCard.jsx'
import { OrderStatusBarCard } from '../components/OrderStatusBarCard.jsx'
import { fetchOverviewStats, formatDashboardNumber } from '../api/adminDashboard.js'
import { getAdminStores, extractStoreList, mapAdminStore } from '../api/adminStores.js'
import { getOrders, extractOrderList, mapOrder, buildOrderStats } from '../api/adminOrders.js'

function buildMonthlyStats(orders) {
  const months = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ]
  const now = new Date()
  const result = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = months[d.getMonth()]
    const year = d.getFullYear()

    const monthOrders = orders.filter((o) => {
      const rawDate = o.raw?.created_at ?? o.date
      if (!rawDate) return false
      const od = new Date(rawDate)
      return od.getFullYear() === year && od.getMonth() === d.getMonth()
    })

    const revenue = monthOrders.reduce(
      (sum, o) => sum + Number(o.raw?.total_amount ?? o.total ?? 0),
      0,
    )

    result.push({
      month: monthName,
      revenue: Math.round(revenue),
      orders: monthOrders.length,
    })
  }

  return result
}

export function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    stores: null,
    customers: null,
    staff: null,
    totalNewOrders: null,
  })
  const [loadError, setLoadError] = useState('')

  const [stores, setStores] = useState([])
  const [orderStats, setOrderStats] = useState(null)
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const data = await fetchOverviewStats()
        if (cancelled) return
        setStats({
          stores: data.stores,
          customers: data.customers,
          staff: data.staff,
          totalNewOrders: data.totalNewOrders,
        })

        const failed = Object.values(data.errors).filter(Boolean)
        if (
          failed.length > 0 &&
          data.stores == null &&
          data.customers == null &&
          data.staff == null
        ) {
          setLoadError('تعذّر تحميل إحصائيات لوحة التحكم.')
        }
      } catch {
        if (!cancelled) {
          setLoadError('تعذّر تحميل إحصائيات لوحة التحكم.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    async function loadCharts() {
      try {
        const [storesData, ordersData] = await Promise.all([
          getAdminStores({ per_page: 1000 }),
          getOrders({ per_page: 1000 }),
        ])

        if (cancelled) return

        const mappedStores = extractStoreList(storesData).map(mapAdminStore)
        setStores(mappedStores)

        const mappedOrders = extractOrderList(ordersData).map(mapOrder)
        setOrderStats(buildOrderStats(mappedOrders, extractOrderList(ordersData)))
        setMonthlyData(buildMonthlyStats(mappedOrders))
      } catch {
        // silently ignore chart errors so main stats still show
      }
    }

    load()
    loadCharts()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
          نظرة عامة
        </h1>
        <p className="mt-1 text-white/60">ملخص شامل لأداء المنصة</p>
      </header>

      {loadError ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="ltr">
        <StatCard
          label="إجمالي المتاجر"
          value={loading ? '...' : stats.stores != null ? formatDashboardNumber(stats.stores) : '—'}
          change="—"
          icon={Store}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="إجمالي الموظفين"
          value={loading ? '...' : stats.staff != null ? formatDashboardNumber(stats.staff) : '—'}
          change="—"
          icon={UserPlus}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="إجمالي الزبائن"
          value={loading ? '...' : stats.customers != null ? formatDashboardNumber(stats.customers) : '—'}
          change="—"
          icon={Users}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="إجمالي الطلبات الجديدة"
          value={loading ? '...' : stats.totalNewOrders != null ? formatDashboardNumber(stats.totalNewOrders) : '—'}
          change="—"
          icon={ShoppingCart}
          iconClassName="bg-brand-300 text-white"
          omitChange
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LineChartCard monthlyData={monthlyData} />
        <PieChartCard stores={stores} />
      </div>

      <div className="mt-8">
        <OrderStatusBarCard stats={orderStats} />
      </div>
    </>
  )
}
