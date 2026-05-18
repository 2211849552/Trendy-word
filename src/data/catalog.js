/** مقاسات الملابس المعتمدة */
export const CLOTHING_SIZES = ['S', 'M', 'L', 'XL']

/** أيقونات مخصصة للملابس فقط (بدون إلكترونيات وغيرها) */
export const CLOTHING_ICON_OPTIONS = ['👔', '👗', '👕', '👖', '🧥', '🥻', '🩳', '🧦', '🧢', '👜']

/** @deprecated استخدم CLOTHING_ICON_OPTIONS */
export const CATEGORY_ICON_OPTIONS = CLOTHING_ICON_OPTIONS

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-men',
    name: 'أزياء رجالية',
    emoji: '👔',
    productCount: 1234,
    active: true,
    subcategoryCount: 28,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-women',
    name: 'أزياء نسائية',
    emoji: '👗',
    productCount: 2156,
    active: true,
    subcategoryCount: 36,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-shirt',
    name: 'قميص',
    emoji: '👕',
    productCount: 890,
    active: true,
    subcategoryCount: 14,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-pants',
    name: 'بنطلون',
    emoji: '👖',
    productCount: 756,
    active: true,
    subcategoryCount: 12,
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cat-jacket',
    name: 'جاكيت',
    emoji: '🧥',
    productCount: 420,
    active: true,
    subcategoryCount: 10,
    sizes: ['S', 'M', 'L', 'XL'],
  },
]

const ALL_CATEGORY_IDS = INITIAL_CATEGORIES.map((c) => c.id)

/** أنواع الخصائص للعرض في الجدول والنموذج */
export const PROPERTY_TYPE_LABELS = {
  list: 'قائمة',
  text: 'نص',
  number: 'رقم',
}

export const INITIAL_PROPERTIES = [
  {
    id: 'prop-size',
    name: 'المقاس',
    type: 'list',
    required: true,
    categoryIds: [...ALL_CATEGORY_IDS],
    listOptions: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'prop-color',
    name: 'اللون',
    type: 'list',
    required: true,
    categoryIds: ['cat-men', 'cat-women', 'cat-shirt', 'cat-jacket'],
  },
  {
    id: 'prop-material',
    name: 'المادة',
    type: 'list',
    required: false,
    categoryIds: [...ALL_CATEGORY_IDS],
  },
  {
    id: 'prop-brand',
    name: 'الماركة',
    type: 'text',
    required: false,
    categoryIds: [...ALL_CATEGORY_IDS],
  },
  {
    id: 'prop-care',
    name: 'تعليمات العناية',
    type: 'text',
    required: false,
    categoryIds: [...ALL_CATEGORY_IDS],
  },
]
