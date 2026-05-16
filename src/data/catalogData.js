export const CLOTHING_CATEGORIES = [
  { id: 'cat-1', name: 'قميص', icon: '👔', count: 120, isActive: true },
  { id: 'cat-2', name: 'بنطلون', icon: '👖', count: 85, isActive: true },
  { id: 'cat-3', name: 'فستان', icon: '👗', count: 210, isActive: true },
  { id: 'cat-4', name: 'جاكيت', icon: '🧥', count: 45, isActive: true },
  { id: 'cat-5', name: 'بلوزة', icon: '👚', count: 150, isActive: true },
  { id: 'cat-6', name: 'شورت', icon: '🩳', count: 65, isActive: true },
]

export const CLOTHING_ATTRIBUTES = [
  { id: 'attr-1', name: 'المقاس', type: 'قائمة', isRequired: true, categories: ['قميص', 'بنطلون', 'فستان', 'جاكيت', 'بلوزة', 'شورت'] },
  { id: 'attr-2', name: 'اللون', type: 'قائمة', isRequired: true, categories: ['قميص', 'بنطلون', 'فستان', 'جاكيت', 'بلوزة', 'شورت'] },
  { id: 'attr-3', name: 'نوع القماش', type: 'قائمة', isRequired: false, categories: ['قميص', 'فستان', 'بلوزة'] },
  { id: 'attr-4', name: 'طول الأكمام', type: 'قائمة', isRequired: true, categories: ['قميص', 'فستان', 'بلوزة'] },
  { id: 'attr-5', name: 'نوع الياقة', type: 'نص', isRequired: false, categories: ['قميص', 'جاكيت'] },
]

export const CLOTHING_PRODUCTS = [
  { id: 'prod-1', name: 'قميص قطني كلاسيك', category: 'قميص', description: 'قميص قطني 100% مريح وعملي', price: 120, quantity: 45, image: '👔' },
  { id: 'prod-2', name: 'بنطلون جينز أزرق', category: 'بنطلون', description: 'بنطلون جينز بقصة مستقيمة', price: 180, quantity: 30, image: '👖' },
  { id: 'prod-3', name: 'فستان صيفي مشجر', category: 'فستان', description: 'فستان صيفي خفيف مناسب للطلعات', price: 250, quantity: 15, image: '👗' },
  { id: 'prod-4', name: 'جاكيت شتوي مبطن', category: 'جاكيت', description: 'جاكيت شتوي دافئ ومقاوم للماء', price: 450, quantity: 10, image: '🧥' },
  { id: 'prod-5', name: 'بلوزة حريرية أنيقة', category: 'بلوزة', description: 'بلوزة حريرية ناعمة للمناسبات', price: 150, quantity: 25, image: '👚' },
  { id: 'prod-6', name: 'شورت رياضي مريح', category: 'شورت', description: 'شورت رياضي خفيف ومناسب للجري', price: 80, quantity: 50, image: '🩳' },
]

export const INVENTORY_DATA = [
  { id: 'inv-1', product: 'قميص قطني كلاسيك', size: 'M', color: 'أبيض', quantity: 20, warehouse: 'المستودع الرئيسي', status: 'متوفر' },
  { id: 'inv-2', product: 'قميص قطني كلاسيك', size: 'L', color: 'أسود', quantity: 15, warehouse: 'المستودع الرئيسي', status: 'متوفر' },
  { id: 'inv-3', product: 'بنطلون جينز أزرق', size: '32', color: 'أزرق', quantity: 5, warehouse: 'المستودع الفرعي', status: 'كمية منخفضة' },
  { id: 'inv-4', product: 'فستان صيفي مشجر', size: 'S', color: 'أحمر', quantity: 0, warehouse: 'المستودع الرئيسي', status: 'نفد' },
  { id: 'inv-5', product: 'جاكيت شتوي مبطن', size: 'XL', color: 'رمادي', quantity: 10, warehouse: 'المستودع الرئيسي', status: 'متوفر' },
]
