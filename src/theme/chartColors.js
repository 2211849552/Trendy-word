export const BRAND_NAVY = '#5c54a4'

export const CHART_BRAND_SCALE = [
  '#5c54a4',
  '#8b83c7',
  '#6b63b5',
  '#a89fd4',
  '#c4bddf',
]

/** ألوان مقاييس التسويق */
export const CAMPAIGN_METRICS = {
  views: {
    stroke: '#5c54a4',
    card: 'border-brand-400/50 bg-accent-lavender/80',
    value: 'text-brand-900',
    label: 'text-brand-800',
  },
  stores: {
    stroke: '#8b83c7',
    card: 'border-brand-400/40 bg-brand-300/80',
    value: 'text-brand-800',
    label: 'text-brand-700',
  },
  products: {
    stroke: '#c4bddf',
    card: 'border-brand-400/30 bg-brand-100',
    value: 'text-brand-700',
    label: 'text-brand-600',
  },
}

export const CHART_LINE_REVENUE = CAMPAIGN_METRICS.views.stroke
export const CHART_LINE_ORDERS = CAMPAIGN_METRICS.stores.stroke

export const CHART_DISTRIBUTION_COLORS = [
  CAMPAIGN_METRICS.views.stroke,
  CAMPAIGN_METRICS.stores.stroke,
  '#2ecc71',
]
