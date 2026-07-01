import { apiRequest } from './client.js'
import { getPaymentMethodsStats } from './adminDashboard.js'
import { getOrder, getOrders, extractOrderList, mapOrder } from './adminOrders.js'
import { getAdminStore } from './adminStores.js'

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

function mapDashboardPaymentMethodEntries(entries) {
  const totals = { wallet: 0, cash: 0 }

  entries.forEach((entry) => {
    const label = String(entry.label ?? entry.name ?? entry.payment_method ?? '').toLowerCase()
    const pct = extractPercentage(entry)
    if (label.includes('نقد') || label.includes('cash') || label.includes('cod')) {
      totals.cash += pct
    } else {
      totals.wallet += pct
    }
  })

  return chartFromWalletAndCash(totals.wallet, totals.cash)
}

export function mapPaymentMethodPercentages(data) {
  const root = data?.data ?? data

  if (Array.isArray(root) && root.length) {
    if (root[0]?.label != null || root[0]?.payment_method != null) {
      return mapDashboardPaymentMethodEntries(root)
    }
    return mapPaymentMethodEntries(root)
  }

  const payload = extractFinancePayload(data)

  if (Array.isArray(payload)) {
    return payload.length ? mapPaymentMethodEntries(payload) : EMPTY_PAYMENT_METHODS_CHART
  }

  const nested = payload.payment_methods ?? payload.methods ?? payload.percentages
  if (Array.isArray(nested) && nested.length) {
    const hasCounts = nested.some((entry) => entry?.count != null || entry?.total != null)
    if (hasCounts) {
      const chart = mapPaymentMethodEntriesByCount(nested)
      if (paymentMethodsChartHasData(chart)) return chart
    } else {
      const chart = mapPaymentMethodEntries(nested)
      if (paymentMethodsChartHasData(chart)) return chart
    }
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
  const statsParams = buildPaymentStatsQueryParams({ period })
  const txParams = buildFinanceQueryParams({ period, perPage: 100 })

  const [statsResult, dashboardResult, txResult, ordersResult] = await Promise.allSettled([
    getPaymentMethodPercentages(statsParams),
    getPaymentMethodsStats(statsParams),
    getFinanceTransactions(txParams),
    getOrders({ per_page: 100, status: 'delivered' }),
  ])

  const orderPayload =
    statsResult.status === 'fulfilled' ? extractFinancePayload(statsResult.value) : {}
  const totalOrders = Number(orderPayload.total_orders ?? 0)

  let transactionCount = 0
  let transactionsChart = EMPTY_PAYMENT_METHODS_CHART

  if (txResult.status === 'fulfilled') {
    const mapped = extractTransactionList(txResult.value).map(mapTransaction)
    const filtered = filterTransactionsByPeriod(mapped, period)
    transactionCount = filtered.length
    transactionsChart = buildPaymentMethodsChart(filtered)
  }

  const sources = []

  if (statsResult.status === 'fulfilled') {
    const chart = mapPaymentMethodPercentages(statsResult.value)
    if (paymentMethodsChartHasData(chart)) {
      sources.push({ chart, source: 'orders', priority: 1 })
    }
  }

  if (dashboardResult.status === 'fulfilled') {
    const chart = mapPaymentMethodPercentages(dashboardResult.value)
    if (paymentMethodsChartHasData(chart)) {
      sources.push({ chart, source: 'orders', priority: 2 })
    }
  }

  if (paymentMethodsChartHasData(transactionsChart)) {
    sources.push({
      chart: transactionsChart,
      source: 'transactions',
      priority: 3,
    })
  }

  if (ordersResult.status === 'fulfilled') {
    const orders = extractOrderList(ordersResult.value).map(mapOrder)
    const ordersChart = buildPaymentMethodsChartFromOrders(orders)
    if (paymentMethodsChartHasData(ordersChart)) {
      sources.push({ chart: ordersChart, source: 'orders', priority: 4 })
    }
  }

  if (sources.length) {
    sources.sort((a, b) => a.priority - b.priority)
    return {
      chart: sources[0].chart,
      totalOrders,
      transactionCount,
      source: sources[0].source,
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
  if (Array.isArray(data?.data?.transactions)) return data.data.transactions
  if (Array.isArray(data?.transactions)) return data.transactions
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

export function buildPaymentStatsQueryParams({ period } = {}) {
  return uiPeriodToDateRange(period)
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

function firstFilledString(...values) {
  for (const value of values) {
    if (value == null) continue
    const normalized = String(value).trim()
    if (normalized && normalized !== '-') return normalized
  }
  return ''
}

function referenceModel(referenceType) {
  if (!referenceType) return null
  const parts = String(referenceType).split('\\')
  return parts[parts.length - 1] || null
}

function parseStoreFromDescription(description) {
  if (!description) return ''
  const text = String(description)
  const patterns = [
    /رسوم\s+اشتراك\s+متجر\s+(.+?)\s+في/u,
    /اشتراك\s+(?:المتجر|متجر)\s+(.+?)\s+في/u,
    /رسوم\s+اشتراك\s+متجر\s+(.+)$/u,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return ''
}

function parseOrderNumberFromDescription(description) {
  const match = String(description ?? '').match(/ORD-[\w-]+/)
  return match?.[0] ?? ''
}

function transactionMoment(item) {
  return String(item?.date ?? item?.created_at ?? '').slice(0, 19)
}

function referenceKey(referenceType, referenceId) {
  if (!referenceType || referenceId == null) return ''
  return `${referenceType}:${referenceId}`
}

function isStoreSideTransaction(tx) {
  const model = referenceModel(tx.referenceType)
  const rawType = String(tx.rawType ?? '').toLowerCase()
  const description = String(tx.description ?? '')

  if (model === 'Store' || model === 'Plan' || model === 'MegaCampaign') return true
  if (/متجر|اشتراك|محفظة\s+المتجر/u.test(description)) return true
  if (['withdrawal', 'deposit'].includes(rawType) && model !== 'Order') return true
  return false
}

function isCustomerSideTransaction(tx) {
  const rawType = String(tx.rawType ?? '').toLowerCase()
  const description = String(tx.description ?? '')

  if (referenceModel(tx.referenceType) === 'Order') return true
  if (rawType === 'order_payment') return true
  if (/طلبية|مشتريات|دفع\s+قيمة/u.test(description)) return true
  return false
}

function mapCustomerName(item) {
  return firstFilledString(
    item.reference_details?.customer_name,
    item.customer_name,
    item.user?.name,
    item.customer?.name,
    item.buyer_name,
    item.actor?.customer_name,
    item.actor?.name,
    item.performed_by_name,
  )
}

function mapStoreName(item) {
  return firstFilledString(
    item.wallet?.store?.name,
    item.store_name,
    item.store?.name,
    item.reference_details?.store_name,
    item.seller_name,
    item.actor?.store_name,
  )
}

export function mapTransaction(item) {
  const txId = item.transaction_id ?? item.id
  const orderNumber = item.reference_details?.order_number
  const customerName = mapCustomerName(item)
  const storeName = mapStoreName(item) || parseStoreFromDescription(item.description)
  return {
    id: orderNumber ? String(orderNumber) : `TX-${txId}`,
    transactionId: Number(txId),
    customer: customerName,
    store: storeName,
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

function applyOrderInfo(tx, order) {
  if (!order) return tx
  return {
    ...tx,
    customer: tx.customer || order.customer,
    store: tx.store || order.store,
  }
}

export async function enrichTransactionsWithParties(transactions) {
  if (!transactions.length) return transactions

  const orderIds = new Set()
  const storeIds = new Set()
  const orderNumbers = new Set()

  transactions.forEach((tx) => {
    const model = referenceModel(tx.referenceType)
    if (model === 'Order' && tx.referenceId) orderIds.add(Number(tx.referenceId))
    if (model === 'Store' && tx.referenceId) storeIds.add(Number(tx.referenceId))

    const orderNumber = tx.referenceDetails?.order_number
      || parseOrderNumberFromDescription(tx.description)
    if (orderNumber) orderNumbers.add(orderNumber)
  })

  const orderCache = new Map()
  const storeCache = new Map()

  await Promise.all([
    ...[...orderIds].map(async (id) => {
      try {
        const data = await getOrder(id)
        const order = data?.data ?? data
        orderCache.set(id, {
          customer: firstFilledString(order.customer_name, order.seller?.name),
          store: firstFilledString(order.store_name),
          orderNumber: order.order_number ?? '',
          totalAmount: Number(order.total_amount ?? 0),
          createdAt: String(order.created_at ?? ''),
        })
      } catch {
        // ignore lookup failures
      }
    }),
    ...[...storeIds].map(async (id) => {
      try {
        const data = await getAdminStore(id)
        const store = data?.data ?? data
        storeCache.set(id, {
          store: firstFilledString(store.name),
          owner: firstFilledString(store.owner?.name),
        })
      } catch {
        // ignore lookup failures
      }
    }),
    ...[...orderNumbers].map(async (orderNumber) => {
      const cached = [...orderCache.values()].some((order) => order.orderNumber === orderNumber)
      if (cached) return
      try {
        const data = await getOrders({ search: orderNumber, per_page: 5 })
        const order = extractOrderList(data).find((item) => item.order_number === orderNumber)
          ?? extractOrderList(data)[0]
        if (!order?.id) return
        orderCache.set(Number(order.id), {
          customer: firstFilledString(order.customer_name, order.seller?.name),
          store: firstFilledString(order.store_name),
          orderNumber: order.order_number ?? '',
          totalAmount: Number(order.total_amount ?? 0),
          createdAt: String(order.created_at ?? ''),
        })
      } catch {
        // ignore lookup failures
      }
    }),
  ])

  const storeByReferenceMoment = new Map()
  transactions.forEach((tx) => {
    const storeFromDescription = parseStoreFromDescription(tx.description)
    if (!storeFromDescription) return
    const key = `${referenceKey(tx.referenceType, tx.referenceId)}|${transactionMoment(tx.raw)}`
    storeByReferenceMoment.set(key, storeFromDescription)
  })

  return transactions.map((tx) => {
    let next = { ...tx }

    const refMomentKey = `${referenceKey(tx.referenceType, tx.referenceId)}|${transactionMoment(tx.raw)}`
    if (!next.store) {
      next.store = storeByReferenceMoment.get(refMomentKey) || ''
    }

    const model = referenceModel(tx.referenceType)
    if (model === 'Order' && tx.referenceId) {
      next = applyOrderInfo(next, orderCache.get(Number(tx.referenceId)))
    }
    if (model === 'Store' && tx.referenceId) {
      const storeInfo = storeCache.get(Number(tx.referenceId))
      if (storeInfo) {
        next.store = next.store || storeInfo.store
      }
    }

    const orderNumber = tx.referenceDetails?.order_number
      || parseOrderNumberFromDescription(tx.description)
    if (orderNumber) {
      const order = [...orderCache.values()].find((item) => item.orderNumber === orderNumber)
      next = applyOrderInfo(next, order)
    }

    if (!next.customer && tx.rawType === 'order_payment' && !tx.referenceId) {
      for (const order of orderCache.values()) {
        const orderDate = order.createdAt.slice(0, 10)
        if (orderDate === tx.date && Math.abs(order.totalAmount - tx.amount) < 0.02) {
          next = applyOrderInfo(next, order)
          break
        }
      }
    }

    if (!next.store && (model === 'Plan' || model === 'MegaCampaign')) {
      next.store = parseStoreFromDescription(tx.description) || storeByReferenceMoment.get(refMomentKey) || ''
    }

    if (!next.customer && !next.store) {
      if (isStoreSideTransaction(next)) {
        next.store = parseStoreFromDescription(next.description) || storeByReferenceMoment.get(refMomentKey) || ''
      } else if (isCustomerSideTransaction(next)) {
        next.customer = firstFilledString(next.referenceDetails?.customer_name)
      }
    }

    return {
      ...next,
      customer: next.customer || '—',
      store: next.store || '—',
    }
  })
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

export function buildPaymentMethodsChartFromOrders(orders) {
  if (!orders.length) return EMPTY_PAYMENT_METHODS_CHART

  const totals = { wallet: 0, cash: 0 }
  orders.forEach((order) => {
    const raw = String(order.rawPayment ?? order.payment ?? '').toLowerCase()
    const label = String(order.payment ?? '')
    if (raw.includes('cash') || raw.includes('cod') || label.includes('نقد')) {
      totals.cash += 1
    } else {
      totals.wallet += 1
    }
  })

  const total = totals.wallet + totals.cash
  if (!total) return EMPTY_PAYMENT_METHODS_CHART

  return chartFromWalletAndCash(
    (totals.wallet / total) * 100,
    (totals.cash / total) * 100,
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
