import { apiRequest } from './client.js'

/**
 * api.md [18] — عهدة السائق وتسويتها مع الإدارة العليا
 *
 * GET  /api/drivers/my/custody-balance?driver_id={id}
 *      → role: driver | super_admin | accountant
 * GET  /api/drivers/finance/custody-balance?driver_id={id}
 *      → role: driver | super_admin | accountant
 * GET  /api/drivers/{id}
 *      → fallback لـ operations_admin (profile.cash_collected_balance)
 * POST /api/drivers/{id}/settle-cash  body: { amount, description? }
 *      → role: super_admin | operations_admin
 */

// GET /api/drivers/my/custody-balance?driver_id={id}
export function getDriverCustodyBalance(driverId) {
  const query = new URLSearchParams({ driver_id: String(driverId) }).toString()
  return apiRequest(`/api/drivers/my/custody-balance?${query}`)
}

// GET /api/drivers/finance/custody-balance?driver_id={id}
export function getDriverFinanceCustodyBalance(driverId) {
  const query = new URLSearchParams({ driver_id: String(driverId) }).toString()
  return apiRequest(`/api/drivers/finance/custody-balance?${query}`)
}

async function fetchDriverProfileCash(driverId) {
  const data = await apiRequest(`/api/drivers/${encodeURIComponent(String(driverId))}`)
  const item = data?.data ?? data
  const profile = item?.driver_profile ?? item?.profile ?? {}
  return {
    cashCollected: Number(
      profile.cash_collected_balance ?? profile.custody_balance ?? 0,
    ),
    pendingCash: Number(profile.pending_cash ?? 0),
    firstCollectedAt: profile.first_cash_collected_at ?? null,
    isBlockedFromCod: Boolean(profile.is_blocked_from_cod ?? false),
  }
}

export function mapDriverCustodyBalance(data) {
  const item = data?.data ?? data
  return {
    balance: Number(
      item?.custody_balance ??
      item?.cash_collected_balance ??
      0,
    ),
    pendingCash: Number(item?.pending_cash ?? 0),
    currency: item?.currency ?? 'LYD',
    firstCollectedAt: item?.first_cash_collected_at ?? null,
    isBlockedFromCod: Boolean(item?.is_blocked_from_cod ?? false),
  }
}

/** جلب عهدة السائق للإدارة — api.md [18] */
export async function fetchDriverCustody(driverId) {
  const id = Number(driverId)
  if (!Number.isFinite(id) || id <= 0) {
    return Promise.reject(Object.assign(new Error('معرّف السائق غير صالح.'), { status: 422 }))
  }

  const profile = await fetchDriverProfileCash(id)
  const tryMap = async (request) => mapDriverCustodyBalance(await request())

  let custodyApi = null
  try {
    custodyApi = await tryMap(() => getDriverCustodyBalance(id))
  } catch (primaryErr) {
    try {
      custodyApi = await tryMap(() => getDriverFinanceCustodyBalance(id))
    } catch (financeErr) {
      if (primaryErr?.status !== 403 && financeErr?.status !== 403) {
        throw financeErr?.status != null ? financeErr : primaryErr
      }
    }
  }

  const custodyBalance = Number(custodyApi?.balance ?? profile.cashCollected ?? 0)

  return {
    balance: custodyBalance,
    settleableAmount: custodyBalance,
    cashCollected: custodyBalance,
    pendingCash: custodyApi?.pendingCash ?? profile.pendingCash ?? 0,
    currency: custodyApi?.currency ?? 'LYD',
    firstCollectedAt: custodyApi?.firstCollectedAt ?? profile.firstCollectedAt ?? null,
    isBlockedFromCod:
      custodyApi?.isBlockedFromCod ?? profile.isBlockedFromCod ?? false,
    source: custodyApi ? 'custody-balance' : 'driver-profile',
  }
}

/**
 * عرض عهدة السائق للإدارة العليا — api.md [18]
 * GET /api/drivers/my/custody-balance?driver_id={id}
 * GET /api/drivers/finance/custody-balance?driver_id={id}
 * GET /api/drivers/{id} (fallback)
 */
export async function loadDriverCustodyView(driverId) {
  const custody = await fetchDriverCustody(driverId)
  return mapDriverCustodyView(custody)
}

export function mapDriverCustodyView(custody) {
  return {
    custodyBalance: Number(custody?.balance ?? custody?.cashCollected ?? 0),
    pendingCash: Number(custody?.pendingCash ?? 0),
    currency: custody?.currency ?? 'LYD',
    firstCashCollectedAt: custody?.firstCollectedAt ?? null,
    isBlockedFromCod: Boolean(custody?.isBlockedFromCod ?? false),
    source: custody?.source ?? 'custody-balance',
  }
}

export async function getDriverSettleableBalance(driverId) {
  const custody = await fetchDriverCustody(driverId)
  return custody.settleableAmount
}

// POST /api/drivers/{id}/settle-cash
export function settleDriverCash(driverId, body) {
  const amount = Number(body?.amount)
  if (!Number.isFinite(amount) || amount < 0.01) {
    return Promise.reject(
      Object.assign(new Error('مبلغ التسوية مطلوب (0.01 على الأقل).'), { status: 422 }),
    )
  }

  const payload = { amount }
  const description = String(body?.description ?? '').trim()
  if (description) payload.description = description

  return apiRequest(`/api/drivers/${encodeURIComponent(String(driverId))}/settle-cash`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * تسوية عهدة السائق مع الإدارة العليا — api.md [18]
 * 1. GET /api/drivers/my/custody-balance?driver_id={id}
 * 2. POST /api/drivers/{id}/settle-cash
 */
export async function settleDriverCustody(driverId, { amount, description } = {}) {
  const id = Number(driverId)
  const custody = await fetchDriverCustody(id)
  const maxAmount = custody.settleableAmount
  const settleAmount = amount != null ? Number(amount) : maxAmount

  if (!Number.isFinite(settleAmount) || settleAmount < 0.01) {
    return Promise.reject(
      Object.assign(new Error('لا يوجد رصيد عهدة قابل للتسوية حالياً.'), { status: 422 }),
    )
  }
  if (settleAmount > maxAmount) {
    return Promise.reject(
      Object.assign(
        new Error(`المبلغ يتجاوز رصيد العهدة (${maxAmount} د.ل).`),
        { status: 422 },
      ),
    )
  }

  return settleDriverCash(id, { amount: settleAmount, description })
}

export function mapSettleDriverCashResponse(data) {
  const item = data?.data ?? data
  return {
    earningsBalance: Number(item?.earnings_balance ?? 0),
    cashCollectedBalance: Number(item?.cash_collected_balance ?? 0),
    pendingCash: Number(item?.pending_cash ?? 0),
    message: data?.message ?? '',
  }
}

export function formatDriverCustodyAmount(value, currency = 'LYD') {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return `${num.toLocaleString('ar-LY')} ${currency === 'LYD' ? 'د.ل' : currency}`
}
