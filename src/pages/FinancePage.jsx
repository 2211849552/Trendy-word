import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Download, Search, DollarSign, CheckCircle2, AlertCircle, BarChart2, Eye, X, CreditCard, Banknote, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import {
  getAdProfits,
  getSubscriptionProfits,
  getDeliveryProfits,
  getPlatformEarnings,
  getRevenueOverview,
  getFinanceTransactions,
  getFinanceTransaction,
  exportFinanceReport,
  extractFinancePayload,
  pickFinanceAmount,
  extractTransactionList,
  mapTransaction,
  mapTransactionDetail,
  buildFinanceQueryParams,
  filterTransactionsClient,
  fetchPaymentMethodsDistribution,
  fetchMonthlyRevenueSeries,
  paymentMethodsChartHasData,
  transactionsToCsv,
} from '../api/adminFinance.js'
import {
  getBankCards,
  createBankCard,
  updateBankCard,
  deleteBankCard,
  activateBankCard,
  extractBankCardList,
  mapBankCard,
} from '../api/bankCards.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض البيانات المالية.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function FinancePage() {
  const [activeType, setActiveType] = useState('جميع الأنواع')
  const [activePeriod, setActivePeriod] = useState('كل الفترات')
  const [activeStatus, setActiveStatus] = useState('جميع الحالات')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState('')
  const [bankCards, setBankCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsSaving, setCardsSaving] = useState(false)
  const [cardsError, setCardsError] = useState('')
  const [cardsMessage, setCardsMessage] = useState('')
  const [editingCardId, setEditingCardId] = useState(null)
  const [editCardholderName, setEditCardholderName] = useState('')
  const [editStripePaymentMethodId, setEditStripePaymentMethodId] = useState('')
  const [selectedTx, setSelectedTx] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(true)
  const [txError, setTxError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState('')
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([])
  const [paymentMethodsData, setPaymentMethodsData] = useState([
    { name: 'محفظة إلكترونية', value: 0, color: '#334155' },
    { name: 'نقدي', value: 0, color: '#10b981' },
  ])
  const [paymentMethodsHasData, setPaymentMethodsHasData] = useState(false)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [revenueOverview, setRevenueOverview] = useState(null)
  const [platformEarnings, setPlatformEarnings] = useState(null)
  const [adProfits, setAdProfits] = useState(null)
  const [subscriptionProfits, setSubscriptionProfits] = useState(null)
  const [deliveryProfits, setDeliveryProfits] = useState(null)
  const [financeLoading, setFinanceLoading] = useState(true)
  const loadSeq = useRef(0)

  const loadFinanceStats = async (period = activePeriod) => {
    setFinanceLoading(true)
    const dateParams = buildFinanceQueryParams({ period })
    try {
      const [platform, ads, subscriptions, delivery, overview] = await Promise.all([
        getPlatformEarnings(dateParams),
        getAdProfits(dateParams),
        getSubscriptionProfits(dateParams),
        getDeliveryProfits(dateParams),
        getRevenueOverview(dateParams),
      ])
      setPlatformEarnings(extractFinancePayload(platform))
      setAdProfits(extractFinancePayload(ads))
      setSubscriptionProfits(extractFinancePayload(subscriptions))
      setDeliveryProfits(extractFinancePayload(delivery))
      setRevenueOverview(extractFinancePayload(overview))
    } catch {
      // keep fallback values in cards
    } finally {
      setFinanceLoading(false)
    }
  }

  const loadCharts = async (period = activePeriod) => {
    setChartsLoading(true)
    try {
      const [monthly, paymentMethods] = await Promise.all([
        fetchMonthlyRevenueSeries(6),
        fetchPaymentMethodsDistribution({ period }),
      ])
      setMonthlyRevenueData(monthly)
      setPaymentMethodsData(paymentMethods.chart)
      setPaymentMethodsHasData(paymentMethodsChartHasData(paymentMethods.chart))
    } catch {
      setMonthlyRevenueData([])
      setPaymentMethodsData([
        { name: 'محفظة إلكترونية', value: 0, color: '#334155' },
        { name: 'نقدي', value: 0, color: '#10b981' },
      ])
      setPaymentMethodsHasData(false)
    } finally {
      setChartsLoading(false)
    }
  }

  const loadTransactions = useCallback(async () => {
    const seq = ++loadSeq.current
    const params = buildFinanceQueryParams({
      search: searchQuery,
      status: activeStatus,
      period: activePeriod,
    })
    const data = await getFinanceTransactions(params)
    if (seq !== loadSeq.current) return
    setTransactions(extractTransactionList(data).map(mapTransaction))
  }, [searchQuery, activeStatus, activePeriod])

  const loadBankCards = async () => {
    setCardsLoading(true)
    setCardsError('')
    try {
      const data = await getBankCards()
      setBankCards(extractBankCardList(data).map(mapBankCard))
    } catch (err) {
      setBankCards([])
      if (err?.status === 401) {
        setCardsError('انتهت الجلسة. سجّلي الدخول من جديد.')
      } else if (err?.status === 403) {
        setCardsError('ليس لديك صلاحية إدارة البطاقات المصرفية.')
      } else {
        setCardsError(err?.message || 'تعذّر تحميل البطاقات.')
      }
    } finally {
      setCardsLoading(false)
    }
  }

  useEffect(() => {
    loadCharts(activePeriod)
    loadFinanceStats(activePeriod)
  }, [activePeriod])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setTxLoading(true)
      setTxError('')
      try {
        await loadTransactions()
      } catch (err) {
        setTransactions([])
        setTxError(apiErrorMessage(err, 'تعذّر تحميل المعاملات المالية.'))
      } finally {
        setTxLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [loadTransactions])

  useEffect(() => {
    if (cardModalOpen) loadBankCards()
  }, [cardModalOpen])

  const formatAmount = (value, fallback) => {
    if (value == null || value === '') return fallback
    return `${Number(value).toLocaleString('ar-LY')} د.ل`
  }

  const resetCardForm = () => {
    setCardNumber('')
    setCardholderName('')
    setStripePaymentMethodId('')
  }

  const handleCreateBankCard = async (e) => {
    e.preventDefault()
    if (!cardNumber.trim() || !cardholderName.trim() || !stripePaymentMethodId.trim()) return

    setCardsSaving(true)
    setCardsError('')
    setCardsMessage('')
    try {
      await createBankCard({
        card_number: cardNumber.trim(),
        cardholder_name: cardholderName.trim(),
        stripe_payment_method_id: stripePaymentMethodId.trim(),
      })
      resetCardForm()
      setCardsMessage('تمت إضافة البطاقة بنجاح.')
      await loadBankCards()
    } catch (err) {
      setCardsError(err?.message || 'تعذّر إضافة البطاقة.')
    } finally {
      setCardsSaving(false)
    }
  }

  const handleActivateBankCard = async (id) => {
    setCardsError('')
    setCardsMessage('')
    try {
      await activateBankCard(id)
      setCardsMessage('تم تفعيل البطاقة بنجاح.')
      await loadBankCards()
    } catch (err) {
      setCardsError(err?.message || 'تعذّر تفعيل البطاقة.')
    }
  }

  const startEditBankCard = (card) => {
    setEditingCardId(card.id)
    setEditCardholderName(card.cardholderName)
    setEditStripePaymentMethodId(card.stripePaymentMethodId)
    setCardsError('')
    setCardsMessage('')
  }

  const cancelEditBankCard = () => {
    setEditingCardId(null)
    setEditCardholderName('')
    setEditStripePaymentMethodId('')
  }

  const handleUpdateBankCard = async (e) => {
    e.preventDefault()
    if (!editingCardId) return
    setCardsSaving(true)
    setCardsError('')
    setCardsMessage('')
    try {
      const payload = {}
      if (editCardholderName.trim()) payload.cardholder_name = editCardholderName.trim()
      if (editStripePaymentMethodId.trim()) {
        payload.stripe_payment_method_id = editStripePaymentMethodId.trim()
      }
      await updateBankCard(editingCardId, payload)
      cancelEditBankCard()
      setCardsMessage('تم تحديث البطاقة بنجاح.')
      await loadBankCards()
    } catch (err) {
      setCardsError(err?.message || 'تعذّر تحديث البطاقة.')
    } finally {
      setCardsSaving(false)
    }
  }

  const handleDeleteBankCard = async (id) => {
    setCardsError('')
    setCardsMessage('')
    try {
      await deleteBankCard(id)
      setCardsMessage('تم حذف البطاقة.')
      await loadBankCards()
    } catch (err) {
      setCardsError(err?.message || 'تعذّر حذف البطاقة.')
    }
  }

  const openDetails = async (tx) => {
    setSelectedTx(tx)
    setDetailsModalOpen(true)
    setDetailLoading(true)
    try {
      const data = await getFinanceTransaction(tx.transactionId)
      const detail = mapTransactionDetail(data)
      setSelectedTx(detail)
      setTransactions((prev) =>
        prev.map((t) =>
          t.transactionId === detail.transactionId
            ? {
                ...t,
                customer: detail.customer !== '—' ? detail.customer : t.customer,
                store: detail.store !== '—' ? detail.store : t.store,
              }
            : t,
        ),
      )
    } catch (err) {
      setExportMessage(apiErrorMessage(err, 'تعذّر تحميل تفاصيل المعاملة.'))
      setTimeout(() => setExportMessage(''), 3000)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setExportMessage('')
    const params = buildFinanceQueryParams({
      search: searchQuery,
      status: activeStatus,
      period: activePeriod,
    })
    try {
      const result = await exportFinanceReport(params)
      const message = result?.message || 'تم طلب تصدير التقرير بنجاح.'
      setExportMessage(message)
      if (result?.download_link && result.download_link !== '#') {
        window.open(result.download_link, '_blank', 'noopener')
      }
    } catch (err) {
      setExportMessage(apiErrorMessage(err, 'تعذّر تصدير التقرير من الخادم.'))
    }

    const csv = transactionsToCsv(filteredTransactions)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'financial_report.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setExporting(false)
    setTimeout(() => setExportMessage(''), 5000)
  }

  const filteredTransactions = useMemo(
    () => filterTransactionsClient(transactions, { type: activeType, status: activeStatus }),
    [transactions, activeType, activeStatus],
  )

  const totalRevenue = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
    [filteredTransactions],
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-200 p-3 border border-white/10 shadow-premium text-right text-sm">
          <p className="text-white mb-1">{label}</p>
          <p className="text-emerald-500">
            الإيرادات : {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-white">الإدارة المالية</h1>
          <p className="text-sm text-white/60">إدارة العمليات المالية والمعاملات والتقارير</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setCardModalOpen(true)} className="btn-primary shrink-0">
            <CreditCard className="size-5" strokeWidth={2.25} aria-hidden />
            بطاقة ائتمانية
          </button>
          <button type="button" onClick={handleExport} disabled={exporting} className="btn-primary shrink-0 disabled:opacity-60">
            {exporting ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" strokeWidth={2.25} aria-hidden />}
            تصدير التقارير
          </button>
        </div>
      </div>

      {exportMessage ? (
        <p className="rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200">
          {exportMessage}
        </p>
      ) : null}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center relative">
          <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">22% ↑</div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <DollarSign className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">إجمالي الإيرادات</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {financeLoading
              ? '...'
              : formatAmount(
                  pickFinanceAmount(revenueOverview, 'total_platform_revenue')
                    ?? pickFinanceAmount(platformEarnings, 'total_platform_earnings', 'total', 'amount'),
                  '0 د.ل',
                )}
          </p>
        </div>
        
        {/* Success Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-brand-100 text-brand-500">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">أرباح الاشتراكات</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {financeLoading
              ? '...'
              : formatAmount(
                  pickFinanceAmount(subscriptionProfits, 'subscription_profits', 'total', 'amount'),
                  '0 د.ل',
                )}
          </p>
        </div>

        {/* Failed Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <AlertCircle className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">أرباح التوصيل</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {financeLoading
              ? '...'
              : formatAmount(
                  pickFinanceAmount(deliveryProfits, 'delivery_profits', 'total', 'amount'),
                  '0 د.ل',
                )}
          </p>
        </div>

        {/* Avg Value Card */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-5 shadow-premium text-center flex flex-col items-center justify-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <BarChart2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-white/60">أرباح الإعلانات</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {financeLoading
              ? '...'
              : formatAmount(
                  pickFinanceAmount(adProfits, 'ad_profits', 'total', 'amount'),
                  '0 د.ل',
                )}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-6 shadow-premium">
          <h2 className="text-lg font-bold text-white mb-6 text-center">الإيرادات الشهرية</h2>
          {chartsLoading ? (
            <div className="flex h-[250px] items-center justify-center gap-2 text-white/60">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">جاري تحميل الإيرادات الشهرية...</span>
            </div>
          ) : (
          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={true} tickLine={true} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={true} tickLine={true} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} formatter={() => <span className="text-emerald-500 text-sm font-bold ml-2">الإيرادات</span>} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: 'white' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-white/10 bg-brand-200 p-6 shadow-premium">
          <h2 className="text-lg font-bold text-white mb-6 text-center">توزيع طرق الدفع</h2>
          {chartsLoading ? (
            <div className="flex h-[250px] items-center justify-center gap-2 text-white/60">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm">جاري تحميل توزيع طرق الدفع...</span>
            </div>
          ) : !paymentMethodsHasData ? (
            <div className="flex h-[250px] flex-col items-center justify-center gap-2 text-white/55">
              <p className="text-sm">لا توجد طلبات مكتملة في الفترة المحددة</p>
              <p className="text-xs text-white/40">يتم حساب النسب من الطلبات المسلّمة عبر المحفظة أو الدفع نقداً</p>
            </div>
          ) : (
          <div className="h-[250px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {paymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'النسبة']} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '12px' }}
                  formatter={(value) => <span className="text-sm text-white/80">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 rounded-xl border border-white/10 bg-brand-200 p-4 shadow-premium">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={activeStatus}
            onChange={e => setActiveStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option>جميع الحالات</option>
            <option>ناجحة</option>
            <option>معلقة</option>
            <option>فاشلة</option>
          </select>

          <select 
            value={activePeriod}
            onChange={e => setActivePeriod(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option>كل الفترات</option>
            <option>هذا الشهر</option>
            <option>الشهر الماضي</option>
          </select>

          <select 
            value={activeType}
            onChange={e => setActiveType(e.target.value)}
            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-500 w-full sm:w-auto"
          >
            <option>جميع الأنواع</option>
            <option>محفظة إلكترونية</option>
            <option>نقدي</option>
          </select>
        </div>
        
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="البحث في المعاملات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-brand-300 py-2 pl-4 pr-10 text-sm outline-none transition-colors focus:bg-brand-200 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-white/10 bg-brand-200 shadow-premium overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">المعاملات المالية</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-brand-300/80 text-white/60 border-b border-white/10">
              <tr>
                <th className="px-3 py-3 font-medium">رقم المعاملة</th>
                <th className="px-3 py-3 font-medium">الزبون</th>
                <th className="px-3 py-3 font-medium">المتجر</th>
                <th className="px-3 py-3 font-medium">المبلغ</th>
                <th className="px-3 py-3 font-medium">نوع العملية</th>
                <th className="px-3 py-3 font-medium">التاريخ</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txLoading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-12 text-center text-white/60">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      جاري تحميل المعاملات...
                    </span>
                  </td>
                </tr>
              ) : filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-brand-300 transition-colors">
                  <td className="px-3 py-3 font-mono text-white/80">{tx.id}</td>
                  <td className="px-3 py-3 font-medium text-white">{tx.customer}</td>
                  <td className="px-3 py-3 text-white/70">{tx.store}</td>
                  <td className="px-3 py-3 font-bold text-emerald-600" dir="ltr">{tx.amount} د.ل</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 text-white/80">
                      {tx.type} {tx.type === 'محفظة إلكترونية' ? <CreditCard className="size-4 text-brand-500" /> : <Banknote className="size-4 text-emerald-500" />}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-white/60">{tx.date}</td>
                  <td className="px-3 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status === 'معلقة' ? 'bg-yellow-100 text-yellow-700' : 
                      tx.status === 'ناجحة' ? 'bg-emerald-100 text-emerald-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button 
                      onClick={() => openDetails(tx)}
                      className="icon-btn-view"
                    >
                      <Eye className="size-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!txLoading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-12 text-center text-white/60">
                    {txError || 'لا توجد معاملات مطابقة للبحث أو الفلتر.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center p-4 border-t border-white/10 bg-brand-300/50">
          <p className="text-sm font-bold text-white/80">
            إجمالي الإيرادات: <span className="text-emerald-600">{totalRevenue.toLocaleString('ar-LY')} د.ل</span>
          </p>
          <p className="text-sm text-white/60">
            عرض {filteredTransactions.length} من {transactions.length} معاملة
          </p>
        </div>
      </div>

      {/* Bank Cards Modal */}
      {cardModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCardModalOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-modal-title"
            className="w-full max-w-lg rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            dir="rtl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <h2 id="card-modal-title" className="text-xl font-bold text-white">
                إدارة البطاقات المصرفية
              </h2>
              <button
                type="button"
                onClick={() => {
                  setCardModalOpen(false)
                  resetCardForm()
                  setCardsError('')
                  setCardsMessage('')
                }}
                className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-brand-300 hover:text-white/70"
                aria-label="إغلاق"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {cardsError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {cardsError}
                </p>
              ) : null}
              {cardsMessage ? (
                <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  {cardsMessage}
                </p>
              ) : null}

              <div>
                <h3 className="mb-3 text-sm font-bold text-white/80">البطاقات المسجّلة</h3>
                {cardsLoading ? (
                  <p className="py-6 text-center text-sm text-white/55">جاري تحميل البطاقات...</p>
                ) : bankCards.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-brand-300/50 px-4 py-6 text-center text-sm text-white/55">
                    لا توجد بطاقات مسجّلة بعد.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bankCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-brand-300/50 px-4 py-3"
                      >
                        <div>
                          <p className="font-bold text-white">{card.cardholderName}</p>
                          <p className="text-sm text-white/60" dir="ltr">
                            **** {card.lastFour}
                            {card.expirationDate ? ` · ${card.expirationDate}` : ''}
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              card.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {card.isActive ? 'نشطة' : 'غير نشطة'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditBankCard(card)}
                            className="rounded-lg border border-white/10 bg-brand-200 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-brand-100"
                          >
                            تعديل
                          </button>
                          {!card.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleActivateBankCard(card.id)}
                              className="rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-950"
                            >
                              تفعيل
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleDeleteBankCard(card.id)}
                            className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/25"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {editingCardId ? (
                <form className="space-y-4 border-t border-white/5 pt-5" onSubmit={handleUpdateBankCard}>
                  <h3 className="text-sm font-bold text-white/80">تعديل البطاقة</h3>
                  <div>
                    <label htmlFor="edit-cardholder-name" className="mb-2 block text-sm font-medium text-white/80">
                      اسم حامل البطاقة
                    </label>
                    <input
                      id="edit-cardholder-name"
                      type="text"
                      value={editCardholderName}
                      onChange={(e) => setEditCardholderName(e.target.value)}
                      className="input-brand"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-stripe-pm" className="mb-2 block text-sm font-medium text-white/80">
                      Stripe Payment Method ID
                    </label>
                    <input
                      id="edit-stripe-pm"
                      type="text"
                      value={editStripePaymentMethodId}
                      onChange={(e) => setEditStripePaymentMethodId(e.target.value)}
                      className="input-brand"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={cardsSaving} className="btn-primary disabled:opacity-60">
                      {cardsSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                    <button type="button" onClick={cancelEditBankCard} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-bold text-white/80">
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : null}

              <form className="space-y-4 border-t border-white/5 pt-5" onSubmit={handleCreateBankCard}>
                <h3 className="text-sm font-bold text-white/80">إضافة بطاقة جديدة</h3>

                <div>
                  <label htmlFor="cardholder-name" className="mb-2 block text-sm font-medium text-white/80">
                    اسم حامل البطاقة <span className="text-brand-300">*</span>
                  </label>
                  <input
                    id="cardholder-name"
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="مثال: أحمد محمد"
                    required
                    className="input-brand"
                  />
                </div>

                <div>
                  <label htmlFor="card-number" className="mb-2 block text-sm font-medium text-white/80">
                    رقم البطاقة <span className="text-brand-300">*</span>
                  </label>
                  <input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    placeholder="1234 5678 9012 3456"
                    required
                    dir="ltr"
                    className="input-brand text-left tracking-widest"
                  />
                </div>

                <div>
                  <label htmlFor="stripe-pm-id" className="mb-2 block text-sm font-medium text-white/80">
                    معرف Stripe Payment Method <span className="text-brand-300">*</span>
                  </label>
                  <input
                    id="stripe-pm-id"
                    type="text"
                    value={stripePaymentMethodId}
                    onChange={(e) => setStripePaymentMethodId(e.target.value.trim())}
                    placeholder="pm_xxxxxxxxxxxxx"
                    required
                    dir="ltr"
                    className="input-brand text-left"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-start gap-3 pt-2">
                  <button type="submit" disabled={cardsSaving} className="btn-primary disabled:opacity-60">
                    {cardsSaving ? 'جاري الحفظ...' : 'إضافة البطاقة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardModalOpen(false)
                      resetCardForm()
                      setCardsError('')
                      setCardsMessage('')
                    }}
                    className="rounded-xl border border-white/10 bg-brand-300 px-5 py-2.5 text-sm font-bold text-white/80 transition-colors hover:bg-brand-100"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {detailsModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-brand-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/5 p-6">
              <h2 className="text-2xl font-bold text-white">تفاصيل المعاملة المالية</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-white/50 hover:text-white/70">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-white/60">
                  <Loader2 className="size-6 animate-spin" />
                  <span>جاري تحميل التفاصيل...</span>
                </div>
              ) : (
              <>
              <div className="flex justify-between items-center text-right border-b border-white/5 pb-4 mb-2">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                  selectedTx.status === 'معلقة' ? 'bg-yellow-100 text-yellow-700' : 
                  selectedTx.status === 'ناجحة' ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedTx.status}
                </span>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">{selectedTx.id}</h3>
                  <p className="text-sm text-white/60 mt-1">{selectedTx.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">الزبون</p>
                  <p className="font-bold text-white text-lg">{selectedTx.customer}</p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">المتجر</p>
                  <p className="font-bold text-white text-lg">{selectedTx.store}</p>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-8 text-center flex flex-col items-center justify-center">
                <p className="font-bold text-emerald-600 text-5xl mb-2" dir="ltr">{selectedTx.amount} د.ل</p>
                <p className="text-sm text-white/70">المبلغ الإجمالي</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">نوع العملية</p>
                  <p className="font-bold text-white text-lg flex items-center gap-2">
                    {selectedTx.type} 
                    {selectedTx.type === 'محفظة إلكترونية' ? <CreditCard className="size-5 text-brand-500" /> : <Banknote className="size-5 text-emerald-500" />}
                  </p>
                </div>
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right flex flex-col items-start justify-center">
                  <p className="text-sm text-white/60 mb-1">التاريخ</p>
                  <p className="font-bold text-white text-lg">{selectedTx.date}</p>
                </div>
              </div>

              {selectedTx.description ? (
                <div className="rounded-xl bg-brand-300 border border-white/5 p-5 text-right">
                  <p className="text-sm text-white/60 mb-1">الوصف</p>
                  <p className="font-medium text-white">{selectedTx.description}</p>
                </div>
              ) : null}
              </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
