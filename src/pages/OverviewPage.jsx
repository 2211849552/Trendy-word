import { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Users,
  Store,
  Package,
  TrendingUp,
  AlertCircle,
  BadgeCheck,
  UserPlus,
} from 'lucide-react'
import { StatCard } from '../components/StatCard.jsx'
import { PieChartCard } from '../components/PieChartCard.jsx'
import { LineChartCard } from '../components/LineChartCard.jsx'
import { OrderStatusBarCard } from '../components/OrderStatusBarCard.jsx'
import { KpiMiniCard } from '../components/KpiMiniCard.jsx'
import { fetchOverviewStats, formatDashboardNumber } from '../api/adminDashboard.js'

export function OverviewPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    stores: null,
    customers: null,
    staff: null,
    totalNewOrders: null,
  })
  const [loadError, setLoadError] = useState('')

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

    load()
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
        <LineChartCard />
        <PieChartCard />
      </div>

      <div className="mt-8 space-y-6">
        <OrderStatusBarCard />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiMiniCard
            label="المنتجات النشطة"
            value="8,456"
            icon={Package}
            iconWrapClassName="bg-brand-300 text-white"
          />
          <KpiMiniCard
            label="الحملات النشطة"
            value="23"
            icon={TrendingUp}
            iconWrapClassName="bg-brand-300 text-white/90"
          />
          <KpiMiniCard
            label="الشكاوى المفتوحة"
            value="15"
            icon={AlertCircle}
            iconWrapClassName="bg-rose-100 text-rose-600"
          />
          <KpiMiniCard
            label="العروض النشطة"
            value="34"
            icon={BadgeCheck}
            iconWrapClassName="bg-violet-100 text-violet-600"
          />
        </div>
      </div>
    </>
  )
}
