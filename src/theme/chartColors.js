export const BRAND_NAVY = '#1e1e4d'

export const CHART_BRAND_SCALE = [
  '#8b5cf6', // Violet 500
  '#3b82f6', // Blue 500
  '#64748b', // Slate 500
  '#94a3b8',
  '#cbd5e1',
]

/** ألوان مقاييس التسويق — متناسقة مع أداء الحملات مع تباين أوضح */
export const CAMPAIGN_METRICS = {
  views: {
    stroke: '#60a5fa', // Bright Blue (Active / Revenue)
    card: 'border-brand-200 bg-brand-50/90',
    value: 'text-brand-950',
    label: 'text-brand-800',
  },
  stores: {
    stroke: '#94a3b8', // Slate 400 (Orders / Pending)
    card: 'border-[#b8c5dc] bg-[#e8edf6]',
    value: 'text-[#2e4568]',
    label: 'text-[#3d5a80]',
  },
  products: {
    stroke: '#cbd5e1', // Slate 300 (Disabled)
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
