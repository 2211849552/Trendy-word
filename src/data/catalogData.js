/** صور تصنيفات من Unsplash — ملابس حقيقية (روابط مُختبرة) */
const IMG = (id) =>
  `https://images.unsplash.com/photo-${id}?w=480&h=480&fit=crop&q=85&auto=format`

export const CATEGORY_IMAGE_PRESETS = [
  { id: 'shirt', label: 'قميص', url: IMG('1596755094514-f87e34085b2c') },
  { id: 'pants', label: 'بنطلون', url: IMG('1542272604-787c3835535d') },
  { id: 'dress', label: 'فستان', url: IMG('1515372039744-b8f02a3ae446') },
  { id: 'jacket', label: 'جاكيت', url: IMG('1539533018447-63fcce2678e3') },
  { id: 'blouse', label: 'بلوزة', url: IMG('1591047139829-d91aecb6caea') },
  { id: 'shorts', label: 'شورت', url: IMG('1618354691373-d851c5c3a990') },
  { id: 'tshirt', label: 'تيشيرت', url: IMG('1521572163474-6864f9cf17ab') },
  { id: 'skirt', label: 'تنورة', url: IMG('1556747439-3b96858b9d8d') },
  { id: 'socks', label: 'جوارب', url: IMG('1503342217505-b0a15ec3261c') },
]

const presetByLabel = Object.fromEntries(
  CATEGORY_IMAGE_PRESETS.map((p) => [p.label, p.url]),
)

export const CLOTHING_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'قميص',
    image: presetByLabel['قميص'],
    count: 120,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'بنطلون',
    image: presetByLabel['بنطلون'],
    count: 85,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'فستان',
    image: presetByLabel['فستان'],
    count: 210,
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'جاكيت',
    image: presetByLabel['جاكيت'],
    count: 45,
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'بلوزة',
    image: presetByLabel['بلوزة'],
    count: 150,
    isActive: true,
  },
  {
    id: 'cat-6',
    name: 'شورت',
    image: presetByLabel['شورت'],
    count: 65,
    isActive: true,
  },
]

export const DEFAULT_CATEGORY_IMAGE = CATEGORY_IMAGE_PRESETS[0].url

export const CLOTHING_ATTRIBUTES = [
  { id: 'attr-1', name: 'المقاس', type: 'قائمة', isRequired: true, categories: ['قميص', 'بنطلون', 'فستان', 'جاكيت', 'بلوزة', 'شورت'] },
  { id: 'attr-2', name: 'اللون', type: 'قائمة', isRequired: true, categories: ['قميص', 'بنطلون', 'فستان', 'جاكيت', 'بلوزة', 'شورت'] },
  { id: 'attr-3', name: 'نوع القماش', type: 'قائمة', isRequired: false, categories: ['قميص', 'فستان', 'بلوزة'] },
  { id: 'attr-4', name: 'طول الأكمام', type: 'قائمة', isRequired: true, categories: ['قميص', 'فستان', 'بلوزة'] },
  { id: 'attr-5', name: 'نوع الياقة', type: 'نص', isRequired: false, categories: ['قميص', 'جاكيت'] },
]

export function getCategoryImageUrl(categoryName) {
  return presetByLabel[categoryName] ?? DEFAULT_CATEGORY_IMAGE
}

export const CLOTHING_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'قميص قطني كلاسيك',
    category: 'قميص',
    description: 'قميص قطني 100% مريح وعملي',
    price: 120,
    quantity: 45,
    image: presetByLabel['قميص'],
  },
  {
    id: 'prod-2',
    name: 'بنطلون جينز أزرق',
    category: 'بنطلون',
    description: 'بنطلون جينز بقصة مستقيمة',
    price: 180,
    quantity: 30,
    image: presetByLabel['بنطلون'],
  },
  {
    id: 'prod-3',
    name: 'فستان صيفي مشجر',
    category: 'فستان',
    description: 'فستان صيفي خفيف مناسب للطلعات',
    price: 250,
    quantity: 15,
    image: presetByLabel['فستان'],
  },
  {
    id: 'prod-4',
    name: 'جاكيت شتوي مبطن',
    category: 'جاكيت',
    description: 'جاكيت شتوي دافئ ومقاوم للماء',
    price: 450,
    quantity: 10,
    image: presetByLabel['جاكيت'],
  },
  {
    id: 'prod-5',
    name: 'بلوزة حريرية أنيقة',
    category: 'بلوزة',
    description: 'بلوزة حريرية ناعمة للمناسبات',
    price: 150,
    quantity: 25,
    image: presetByLabel['بلوزة'],
  },
  {
    id: 'prod-6',
    name: 'شورت رياضي مريح',
    category: 'شورت',
    description: 'شورت رياضي خفيف ومناسب للجري',
    price: 80,
    quantity: 50,
    image: presetByLabel['شورت'],
  },
]

export const INVENTORY_DATA = [
  { id: 'inv-1', product: 'قميص قطني كلاسيك', size: 'M', color: 'أبيض', quantity: 20, warehouse: 'المستودع الرئيسي', status: 'متوفر' },
  { id: 'inv-2', product: 'قميص قطني كلاسيك', size: 'L', color: 'أسود', quantity: 15, warehouse: 'المستودع الرئيسي', status: 'متوفر' },
  { id: 'inv-3', product: 'بنطلون جينز أزرق', size: '32', color: 'أزرق', quantity: 5, warehouse: 'المستودع الفرعي', status: 'كمية منخفضة' },
  { id: 'inv-4', product: 'فستان صيفي مشجر', size: 'S', color: 'أحمر', quantity: 0, warehouse: 'المستودع الرئيسي', status: 'نفد' },
  { id: 'inv-5', product: 'جاكيت شتوي مبطن', size: 'XL', color: 'رمادي', quantity: 10, warehouse: 'المستودع الرئيسي', status: 'متوفر' },
]
