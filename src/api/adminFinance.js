import { apiRequest } from './client.js'

// أرباح المنصة — لوحة الإدارة
// GET /api/admin/finance/ad-profits
export function getAdProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/ad-profits${query ? `?${query}` : ''}`)
}

// GET /api/admin/finance/subscription-profits
export function getSubscriptionProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/subscription-profits${query ? `?${query}` : ''}`)
}

// GET /api/admin/finance/delivery-profits
export function getDeliveryProfits(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/delivery-profits${query ? `?${query}` : ''}`)
}

// GET /api/admin/finance/platform-earnings
export function getPlatformEarnings(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/admin/finance/platform-earnings${query ? `?${query}` : ''}`)
}

// [8] الإدارة المالية
// GET /api/finance/revenue-overview
export function getRevenueOverview(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/finance/revenue-overview${query ? `?${query}` : ''}`)
}

// GET /api/finance/transactions — بحث وفلترة
export function getFinanceTransactions(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/finance/transactions${query ? `?${query}` : ''}`)
}

// GET /api/finance/transactions/{id}
export function getFinanceTransaction(id) {
  return apiRequest(`/api/finance/transactions/${encodeURIComponent(String(id))}`)
}

// GET /api/finance/export — تصدير التقارير
export function exportFinanceReport(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/finance/export${query ? `?${query}` : ''}`)
}

// GET /api/finance/payment-method-percentages — إحصائيات ونسب طرق الدفع
export function getPaymentMethodPercentages(params = {}) {
  const query = new URLSearchParams(params).toString()
  return apiRequest(`/api/finance/payment-method-percentages${query ? `?${query}` : ''}`)
}

const PAYMENT_METHOD_COLORS = {
  wallet: '#60a5fa',
  cash: '#10b981',
}

const EMPTY_PAYMENT_METHODS_CHART = [
  { name: 'محفظة إلكترونية', value: 0, color: PAYMENT_METHOD_COLORS.wallet },
  { name: 'نقدي', value: 0, color: PAYMENT_METHOD_COLORS.cash },
]

function normalizePaymentMethodKey(key) {
  const value = String(key).toLowerCase()
  if (value.includes('wallet') || value.includes('card') || value.includes('electronic')) {
    return 'wallet'
  }
  if (value.includes('cash') || value.includes('cod')) return 'cash'
  return value
}

function chartFromWalletAndCash(walletPct, cashPct) {
  return [
    {
      name: 'محفظة إلكترونية',
      value: Math.round(Number(walletPct) || 0),
      color: PAYMENT_METHOD_COLORS.wallet,
    },
    {
      name: 'نقدي',
      value: Math.round(Number(cashPct) || 0),
      color: PAYMENT_METHOD_COLORS.cash,
    },
  ]
}

function extractPercentage(entry) {
  if (entry == null) return 0
  if (typeof entry === 'number') return entry
  if (typeof entry === 'string') return Number(entry) || 0
  return Number(entry.percentage ?? entry.percent ?? entry.value ?? entry.rate ?? 0)
}

function mapPaymentMethodEntries(entries) {
  const totals = { wallet: 0, cash: 0 }

  entries.forEach((entry) => {
    const key = normalizePaymentMethodKey(
      entry.payment_method ?? entry.method ?? entry.name ?? entry.type ?? '',
    )
    const pct = extractPercentage(entry)
    if (key === 'wallet') totals.wallet += pct
    else if (key === 'cash') totals.cash += pct
  })

  return chartFromWalletAndCash(totals.wallet, totals.cash)
}

function mapPaymentMethodEntriesByCount(entries) {
  const counts = { wallet: 0, cash: 0 }

  entries.forEach((entry) => {
    const key = normalizePaymentMethodKey(
      entry.payment_method ?? entry.method ?? entry.name ?? entry.type ?? '',
    )
    const count = Number(entry.count ?? entry.total ?? 0)
    if (key === 'wallet') counts.wallet += count
    else if (key === 'cash') counts.cash += count
  })

  const total = counts.wallet + counts.cash
  if (!total) return EMPTY_PAYMENT_METHODS_CHART

  return chartFromWalletAndCash(
    (counts.wallet / total) * 100,
    (counts.cash / total) * 100,
  )
}

export function mapPaymentMethodPercentages(data) {
  const payload = extractFinancePayload(data)

  if (Array.isArray(payload)) {
    return payload.length ? mapPaymentMethodEntries(payload) : EMPTY_PAYMENT_METHODS_CHART
  }

  const nested = payload.payment_methods ?? payload.methods ?? payload.percentages
  if (Array.isArray(nested) && nested.length) {
    const hasCounts = nested.some((entry) => entry?.count != null || entry?.total != null)
    if (hasCounts) return mapPaymentMethodEntriesByCount(nested)
    return mapPaymentMethodEntries(nested)
  }

  if (payload.wallet_percentage != null || payload.cash_percentage != null) {
    return chartFromWalletAndCash(payload.wallet_percentage, payload.cash_percentage)
  }

  if (payload.electronic_wallet_percentage != null || payload.cash_on_delivery_percentage != null) {
    return chartFromWalletAndCash(
      payload.electronic_wallet_percentage ?? payload.wallet_percentage,
      payload.cash_on_delivery_percentage ?? payload.cash_percentage,
    )
  }

  if (nested && typeof nested === 'object') {
    const totals = { wallet: 0, cash: 0 }
    Object.entries(nested).forEach(([key, value]) => {
      const normalized = normalizePaymentMethodKey(key)
      const pct = extractPercentage(value)
      if (normalized === 'wallet') totals.wallet += pct
      else if (normalized === 'cash') totals.cash += pct
    })
    return chartFromWalletAndCash(totals.wallet, totals.cash)
  }

  if (payload.wallet != null || payload.cash != null) {
    return chartFromWalletAndCash(payload.wallet, payload.cash)
  }

  return EMPTY_PAYMENT_METHODS_CHART
}

export function paymentMethodsChartHasData(chart) {
  return Array.isArray(chart) && chart.some((item) => Number(item.value) > 0)
}

export function filterPaymentMethodsChartForDisplay(chart) {
  if (!Array.isArray(chart)) return []
  return chart.filter((item) => Number(item.value) > 0)
}

export function filterTransactionsByPeriod(transactions, periodLabel) {
  const range = uiPeriodToDateRange(periodLabel)
  if (!range.start_date) return transactions
  return transactions.filter((tx) => tx.date >= range.start_date && tx.date <= range.end_date)
}

export async function fetchPaymentMethodsDistribution({ period } = {}) {
  const params = buildFinanceQueryParams({ period, perPage: 100 })

  const [orderResult, txResult] = await Promise.allSettled([
    getPaymentMethodPercentages(params),
    getFinanceTransactions(params),
  ])

  const orderPayload =
    orderResult.status === 'fulfilled' ? extractFinancePayload(orderResult.value) : {}
  const totalOrders = Number(orderPayload.total_orders ?? 0)
  const ordersChart =
    orderResult.status === 'fulfilled'
      ? mapPaymentMethodPercentages(orderResult.value)
      : EMPTY_PAYMENT_METHODS_CHART

  let transactionsChart = EMPTY_PAYMENT_METHODS_CHART
  let transactionCount = 0

  if (txResult.status === 'fulfilled') {
    const mapped = extractTransactionList(txResult.value).map(mapTransaction)
    const filtered = filterTransactionsByPeriod(mapped, period)
    transactionCount = filtered.length
    transactionsChart = buildPaymentMethodsChart(filtered)
  }

  const ordersWalletShare = Number(
    ordersChart.find((item) => item.name === 'محفظة إلكترونية')?.value ?? 0,
  )
  const txHasData = paymentMethodsChartHasData(transactionsChart)

  // المعاملات المالية تعكس نشاط المحفظة؛ الطلبات المكتملة قد لا تشملها
  if (txHasData && (totalOrders === 0 || ordersWalletShare === 0)) {
    return {
      chart: transactionsChart,
      totalOrders,
      transactionCount,
      source: 'transactions',
    }
  }

  if (paymentMethodsChartHasData(ordersChart)) {
    return {
      chart: ordersChart,
      totalOrders,
      transactionCount,
      source: 'orders',
    }
  }

  if (txHasData) {
    return {
      chart: transactionsChart,
      totalOrders,
      transactionCount,
      source: 'transactions',
    }
  }

  return {
    chart: EMPTY_PAYMENT_METHODS_CHART,
    totalOrders,
    transactionCount,
    source: 'none',
  }
}

export function extractFinancePayload(data) {
  return data?.data ?? data ?? {}
}

export function pickFinanceAmount(payload, ...keys) {
  for (const key of keys) {
    if (payload?.[key] != null && payload[key] !== '') return payload[key]
  }
  return null
}

export function sumSubscriptionAndAdProfits(subscriptionPayload, adPayload) {
  const subscription = Number(
    pickFinanceAmount(subscriptionPayload, 'subscription_profits', 'subscription_revenue') ?? 0,
  )
  const ads = Number(pickFinanceAmount(adPayload, 'ad_profits', 'ad_revenue') ?? 0)
  return subscription + ads
}

export function extractTransactionList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

const PAYMENT_TYPE_LABELS = {
  cash: 'نقدي',
  wallet: 'محفظة إلكترونية',
  card: 'محفظة إلكترونية',
  electronic_wallet: 'محفظة إلكترونية',
}

export function uiPeriodToDateRange(periodLabel) {
  const now = new Date()
  if (periodLabel === 'هذا الشهر') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: now.toISOString().slice(0, 10),
    }
  }
  if (periodLabel === 'الشهر الماضي') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return {
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
    }
  }
  return {}
}

export function buildFinanceQueryParams({ search, status, period, perPage = 100 } = {}) {
  const params = { per_page: perPage, ...uiPeriodToDateRange(period) }
  const trimmed = search?.trim()
  if (trimmed) params.search = trimmed
  if (status && status !== 'جميع الحالات') params.status = status
  return params
}

function mapPaymentType(item) {
  const txType = String(item.transaction_type ?? '').toLowerCase()
  const ledgerType = String(item.type ?? '').toLowerCase()

  if (txType.includes('cash') || txType.includes('cod')) {
    return PAYMENT_TYPE_LABELS.cash
  }

  const walletTxTypes = [
    'wallet', 'card', 'electronic', 'deposit', 'withdrawal', 'transfer',
    'top_up', 'topup', 'stripe', 'subscription', 'charge', 'refund', 'payment',
  ]
  if (walletTxTypes.some((token) => txType.includes(token))) {
    return PAYMENT_TYPE_LABELS.wallet
  }

  // معاملات المحفظة في النظام تُسجَّل كـ credit/debit وليست نقداً
  if (ledgerType === 'credit' || ledgerType === 'debit') {
    return PAYMENT_TYPE_LABELS.wallet
  }

  if (item.wallet != null) return PAYMENT_TYPE_LABELS.wallet

  return PAYMENT_TYPE_LABELS.cash
}

function mapTransactionStatus(item) {
  const status = String(item.status ?? '').toLowerCase()
  if (status.includes('pending') || status.includes('fail')) {
    return status.includes('fail') ? 'فاشلة' : 'معلقة'
  }

  // credit/debit في سجل المحفظة يعني إيداع/سحب مكتمل وليس حالة معلّقة
  const ledgerType = String(item.type ?? '').toLowerCase()
  if (ledgerType === 'credit' || ledgerType === 'debit') return 'ناجحة'

  return 'ناجحة'
}

export function mapTransaction(item) {
  const txId = item.transaction_id ?? item.id
  const orderNumber = item.reference_details?.order_number
  return {
    id: orderNumber ? String(orderNumber) : `TX-${txId}`,
    transactionId: Number(txId),
    customer:
      item.reference_details?.customer_name ??
      item.customer_name ??
      item.user?.name ??
      item.customer?.name ??
      item.buyer_name ??
      '—',
    store:
      item.wallet?.store?.name ??
      item.store_name ??
      item.store?.name ??
      item.reference_details?.store_name ??
      item.seller_name ??
      '—',
    amount: Number(item.net_amount ?? item.amount ?? 0),
    grossAmount: Number(item.amount ?? 0),
    fee: Number(item.fee ?? item.fee_amount ?? 0),
    type: mapPaymentType(item),
    rawType: item.transaction_type ?? item.type ?? '',
    date: String(item.date ?? item.created_at ?? '').slice(0, 10),
    status: mapTransactionStatus(item),
    description: item.description ?? '',
    balanceAfter: Number(item.balance_after ?? 0),
    referenceType: item.reference_type ?? '',
    referenceId: item.reference_id ?? null,
    referenceDetails: item.reference_details ?? null,
    raw: item,
  }
}

export function mapTransactionDetail(data) {
  return mapTransaction(data?.data ?? data)
}

export function filterTransactionsClient(transactions, { type, status } = {}) {
  let result = transactions
  if (type && type !== 'جميع الأنواع') {
    result = result.filter((tx) => tx.type === type)
  }
  if (status && status !== 'جميع الحالات') {
    result = result.filter((tx) => tx.status === status)
  }
  return result
}

export function buildPaymentMethodsChart(transactions) {
  if (!transactions.length) return EMPTY_PAYMENT_METHODS_CHART

  const totals = { 'محفظة إلكترونية': 0, نقدي: 0 }
  transactions.forEach((tx) => {
    const weight = Math.abs(Number(tx.amount) || 0) || 1
    totals[tx.type] = (totals[tx.type] ?? 0) + weight
  })
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0)
  if (!total) return EMPTY_PAYMENT_METHODS_CHART

  return chartFromWalletAndCash(
    (totals['محفظة إلكترونية'] / total) * 100,
    (totals['نقدي'] / total) * 100,
  )
}

export async function fetchMonthlyRevenueSeries(monthCount = 6) {
  const now = new Date()
  const requests = []

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    requests.push({
      name: AR_MONTHS[monthDate.getMonth()],
      start_date: monthDate.toISOString().slice(0, 10),
      end_date: monthEnd.toISOString().slice(0, 10),
    })
  }

  const results = await Promise.all(
    requests.map(async ({ name, start_date, end_date }) => {
      try {
        const data = await getRevenueOverview({ start_date, end_date })
        const payload = extractFinancePayload(data)
        return {
          name,
          value: Number(payload.total_platform_revenue ?? 0),
        }
      } catch {
        return { name, value: 0 }
      }
    }),
  )

  return results
}

export function transactionsToCsv(transactions) {
  const header = 'رقم المعاملة,الزبون,المتجر,المبلغ,نوع العملية,التاريخ,الحالة'
  const rows = transactions.map(
    (t) => `${t.id},${t.customer},${t.store},${t.amount},${t.type},${t.date},${t.status}`,
  )
  return `\uFEFF${header}\n${rows.join('\n')}`
}
