/** صور متاجر ومنتجات — ملابس فقط، بدون إكسسوارات */
const IMG = (id, w = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${w}&fit=crop&q=85&auto=format`

/** داخل / واجهة محل أزياء — صورة مختلفة قدر الإمكان لكل متجر */
export const STORE_IMAGES = {
  lcWaikiki: IMG('1567401893414-76b7b1e5a7a5', 600),
  mango: IMG('1445205170230-053b83016050', 600),
  alWafaa: IMG('1555529669-2269763671c0', 600),
  sultana: IMG('1594938298603-c8148c4dae35', 600),
  retaj: IMG('1555529669-2269763671c0', 520),
  oasis: IMG('1523381210434-271e8be1f52b', 600),
  brandat: IMG('1558618666-fcd25c85cd64', 600),
  terranova: IMG('1523381210434-271e8be1f52b', 520),
}

export const DEFAULT_STORE_IMAGE = STORE_IMAGES.lcWaikiki

/** صور منتجات — مفتاح فريد لكل نوع (ملابس فقط) */
export const PRODUCT_IMAGES = {
  shirt: IMG('1596755094514-f87e34085b2c'),
  pants: IMG('1542272604-787c3835535d'),
  dressWhite: IMG('1515372039744-b8f02a3ae446'),
  girlsSummerDress: IMG('1515372039744-b8f02a3ae446'),
  occasionSet: IMG('1434389677669-e08b4cac3105'),
  jacket: IMG('1539533018447-63fcce2678e3'),
  blouse: IMG('1591047139829-d91aecb6caea'),
  tshirt: IMG('1521572163474-6864f9cf17ab'),
  abayaCoat: IMG('1539533018447-63fcce2678e3'),
}

const BLOCKED_KEYWORDS = ['إكسسوار', 'حقيب', 'شنطة', 'ساعة', 'نظارة', 'وشاح', 'عقد', 'أحذية', 'حذاء', 'مجوهر']

const PRODUCT_BY_KEYWORD = [
  ['عبا', PRODUCT_IMAGES.abayaCoat],
  ['فستان', PRODUCT_IMAGES.dressWhite],
  ['فساتين', PRODUCT_IMAGES.dressWhite],
  ['جاكيت', PRODUCT_IMAGES.jacket],
  ['بلوز', PRODUCT_IMAGES.blouse],
  ['قميص', PRODUCT_IMAGES.shirt],
  ['قمصان', PRODUCT_IMAGES.shirt],
  ['تيشيرت', PRODUCT_IMAGES.tshirt],
  ['بنطلون', PRODUCT_IMAGES.pants],
  ['تشينو', PRODUCT_IMAGES.pants],
  ['نسائي', PRODUCT_IMAGES.occasionSet],
  ['طقم', PRODUCT_IMAGES.occasionSet],
  ['مناسبات', PRODUCT_IMAGES.occasionSet],
  ['رجالي', PRODUCT_IMAGES.shirt],
  ['ملابس', PRODUCT_IMAGES.blouse],
  ['كاجوال', PRODUCT_IMAGES.tshirt],
]

export function getProductImage(category = '', fallback = DEFAULT_STORE_IMAGE) {
  const text = String(category)
  if (BLOCKED_KEYWORDS.some((k) => text.includes(k))) {
    return PRODUCT_IMAGES.blouse
  }
  for (const [keyword, url] of PRODUCT_BY_KEYWORD) {
    if (text.includes(keyword)) return url
  }
  return fallback
}

export function withProductImages(products, fallback) {
  return products.map((p) => ({
    ...p,
    image: p.image ?? getProductImage(p.category, fallback),
  }))
}
