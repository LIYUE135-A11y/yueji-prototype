/** 消费者端商品图片（本地存储，每个商品唯一） */
const ID_MAP = {
  p1: '/static/images/lipstick-1.jpg',
  p2: '/static/images/lipstick-2.jpg',
  p3: '/static/images/lipstick-3.jpg',
  p4: '/static/images/lipstick-4.jpg'
}

const NAME_RULES = [
  { test: /可复美|绿印|次抛|胶原蛋白/, img: '/static/images/product-trial-2.jpg' },
  { test: /薇诺娜|特护霜|舒敏/, img: '/static/images/products/skincare-1.jpg' },
  { test: /OLAY|身体乳|焕亮/, img: '/static/images/products/body-lotion-1.jpg' },
  { test: /松达|婴儿|山茶油/, img: '/static/images/products/baby-1.jpg' },
  { test: /FENTY|粉底液|花兰槿|花西子养肤|底妆/, img: '/static/images/products/foundation-1.jpg' },
  { test: /面膜|急救/, img: '/static/images/products/mask-1.jpg' },
  { test: /HEY:?REAL|B5|精华|垮脸|维稳/, img: '/static/images/products/essence-1.jpg' },
  { test: /防晒/, img: '/static/images/products/sunscreen-1.jpg' },
  { test: /七夕|礼盒|好礼/, img: '/static/images/qixi-ad.jpg' },
  { test: /阅己盒|试用盒|申领/, img: '/static/images/products/trial-box-1.jpg' },
  { test: /礼盒|套装|双色|珊瑚|莓果|豆沙|裸粉|口红|唇/, img: '/static/images/lipstick-2.jpg' },
  { test: /正红|丝绒|哑光/, img: '/static/images/lipstick-1.jpg' },
  { test: /绒雾|闪购/, img: '/static/images/lipstick-4.jpg' }
]

export function getProductImage(key, title = '') {
  const id = String(key || '').trim()
  if (ID_MAP[id]) return ID_MAP[id]
  const text = `${id} ${title}`
  for (const rule of NAME_RULES) {
    if (rule.test.test(text)) return rule.img
  }
  return ID_MAP.p1
}

export function getProductImages(key, title = '', count = 3) {
  const main = getProductImage(key, title)
  const pool = [
    main,
    '/static/images/products/skincare-2.jpg',
    '/static/images/products/skincare-3.jpg',
    '/static/images/products/gift-box-1.jpg',
    '/static/images/product-flash-1.jpg',
    '/static/images/product-flash-2.jpg'
  ].filter((v, i, arr) => arr.indexOf(v) === i)
  while (pool.length < count) {
    pool.push(main)
  }
  return pool.slice(0, count)
}
