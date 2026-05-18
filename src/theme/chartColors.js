/** ألوان المخططات — درجات قريبة من لون الـ dashboard (#1e1e4d) */
export const BRAND_NAVY = '#1e1e4d'

export const CHART_BRAND_SCALE = [
  '#1e1e4d',
  '#2a315c',
  '#334155',
  '#475569',
  '#64748b',
]

/** ألوان مقاييس التسويق — متناسقة مع أداء الحملات مع تباين أوضح */
export const CAMPAIGN_METRICS = {
  views: {
    stroke: '#1e1e4d',
    card: 'border-brand-200 bg-brand-50/90',
    value: 'text-brand-950',
    label: 'text-brand-800',
  },
  stores: {
    stroke: '#3d5a80',
    card: 'border-[#b8c5dc] bg-[#e8edf6]',
    value: 'text-[#2e4568]',
    label: 'text-[#3d5a80]',
  },
  products: {
    stroke: '#7b8fa8',
    card: 'border-slate-300 bg-slate-100/90',
    value: 'text-slate-600',
    label: 'text-slate-700',
  },
}

/** ألوان مخططات نظرة عامة — نفس ألوان أداء الحملات الإعلانية */
export const CHART_LINE_REVENUE = CAMPAIGN_METRICS.views.stroke
export const CHART_LINE_ORDERS = CAMPAIGN_METRICS.stores.stroke

export const CHART_DISTRIBUTION_COLORS = [
  CAMPAIGN_METRICS.views.stroke,
  CAMPAIGN_METRICS.stores.stroke,
  CAMPAIGN_METRICS.products.stroke,
]
