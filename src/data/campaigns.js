/** حملات تسويقية — متاجر أزياء بليبيا */

export const marketingStats = {
  totalViews: '53.8K',
  viewsChange: '28%',
  expired: 1,
  scheduled: 1,
  active: 1,
  activeChange: '12%',
}

/** نقاط مخطط الأداء (محور المشاهدات + مقاييس العد) */
export const campaignPerformanceSeries = [
  {
    name: 'حملة تخفيضات الصيف',
    views: 8200,
    products: 48,
    stores: 9,
  },
  {
    name: 'عرض الجمعة البيضاء',
    views: 24100,
    products: 96,
    stores: 15,
  },
  {
    name: 'إطلاق منتجات جديدة',
    views: 12600,
    products: 26,
    stores: 5,
  },
]

export const campaigns = [
  {
    id: 'c1',
    title: 'حملة تخفيضات الصيف',
    description: 'تخفيضات تصل إلى 50٪ على تشكيلة مختارة من الأزياء.',
    storeName: 'أزياء الوفاء — طرابلس',
    status: 'scheduled',
    stores: 10,
    products: 50,
    views: 15600,
    dateFrom: '2026-06-01',
    dateTo: '2026-08-31',
    emoji: '☀️',
    paused: false,
  },
  {
    id: 'c2',
    title: 'عرض الجمعة البيضاء',
    description: 'عروض قوية ليوم واحد على الأزياء والإكسسوارات.',
    storeName: 'مانجو — بنغازي',
    status: 'active',
    stores: 15,
    products: 100,
    views: 25400,
    dateFrom: '2026-04-15',
    dateTo: '2026-05-15',
    emoji: '🎉',
    paused: false,
  },
  {
    id: 'c3',
    title: 'إطلاق منتجات جديدة',
    description: 'تشكيلة أحذية رياضية وموديلات جديدة من فلو وكوتون.',
    storeName: 'فلو للأحذية — طرابلس',
    status: 'finished',
    stores: 5,
    products: 25,
    views: 12800,
    dateFrom: '2026-03-01',
    dateTo: '2026-03-31',
    emoji: '🎯',
    paused: false,
  },
  {
    id: 'c4',
    title: 'تخفيضات منتصف الموسم',
    description: 'تخفيضات على تشكيلة Terranova في طرابلس.',
    storeName: 'Terranova — طرابلس',
    status: 'stopped',
    stores: 3,
    products: 18,
    views: 4200,
    dateFrom: '2026-02-01',
    dateTo: '2026-02-28',
    emoji: '⏸️',
    paused: true,
  },
]

export const statusLabels = {
  all: 'الكل',
  active: 'نشط',
  scheduled: 'مجدول',
  finished: 'منتهي',
  stopped: 'متوقف',
}

export const statusBadgeClass = {
  active: 'bg-emerald-100 text-emerald-800 ring-emerald-200/80',
  scheduled: 'bg-sky-100 text-sky-800 ring-sky-200/80',
  finished: 'bg-slate-100 text-slate-700 ring-slate-200/80',
  stopped: 'bg-amber-100 text-amber-900 ring-amber-200/80',
}
