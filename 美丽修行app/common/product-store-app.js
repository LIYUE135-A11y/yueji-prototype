import { getProductImage } from './product-image.js'

export const ADMIN_PRODUCT_STORAGE_KEY = 'zhuangyan_product_list_v1'

const SP_FILE_MAP = {
  sp100001: 'sp100001', sp100002: 'sp100002', sp100003: 'sp100003', sp100004: 'sp100004',
  sp100005: 'sp100005', sp100006: 'sp100006', sp100007: 'sp100007', sp100008: 'sp100008',
  sp100009: 'sp100009', sp100010: 'sp100010', sp100011: 'sp100011', sp100012: 'sp100012',
  sp100013: 'sp100013', sp100014: 'sp100014', sp100015: 'sp100015', sp100016: 'sp100016',
  sp100017: 'sp100017', sp100018: 'sp100018', sp100019: 'sp100019', sp100020: 'sp100020',
  sp100021: 'sp100021', sp100022: 'sp100022', sp100023: 'sp100023', sp100024: 'sp100024'
}

function resolveProductFile(key) {
  const raw = String(key || '').trim().toLowerCase()
  if (!raw) return 'sp100001'
  if (/^sp\d{6}$/.test(raw)) return SP_FILE_MAP[raw] || raw
  return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sp100001'
}

function readAdminList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(ADMIN_PRODUCT_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ADMIN_PRODUCT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed
      }
    }
  } catch (e) { /* ignore */ }
  return []
}

export function loadAdminProductList() {
  return readAdminList()
}

export function resolveAdminProductCover(product, imgBase = '../运营管理系统/static/products/') {
  if (!product) return getProductImage('p1', '商品')
  if (product.coverUrl) return product.coverUrl
  if (product.cover && /^(data:|https?:)/.test(String(product.cover))) return product.cover
  const base = imgBase.endsWith('/') ? imgBase : `${imgBase}/`
  const sync = String(product.syncCover || product.cover || '')
  const match = sync.match(/static\/products\/([^?#/]+)/i)
  if (match) return base + match[1]
  const file = resolveProductFile(product.id || product.sku)
  return base + file + '.jpg'
}

export function mapAdminProductToCard(product, imgBase) {
  const id = String(product.id || product.sku || '')
  const title = product.name || '商品'
  const subTitle = [product.brand, product.cat3 || product.cat2].filter(Boolean).join(' · ')
  return {
    id,
    title,
    subTitle,
    img: resolveAdminProductCover(product, imgBase),
    price: String(Math.round(Number(product.price) || 0)),
    merchant: product.merchant || product.brand || '',
    brand: product.brand || ''
  }
}

export function filterRecommendProducts(list, options = {}) {
  const limit = options.limit || 6
  const excludeIds = new Set((options.excludeIds || []).map(String))
  const result = []
  for (const item of list || []) {
    if (item.status && item.status !== '已上架') continue
    const id = String(item.id || item.sku || '')
    if (excludeIds.has(id)) continue
    result.push(mapAdminProductToCard(item, options.imgBase))
    if (result.length >= limit) break
  }
  return result
}

function appImg(path) {
  return `../美丽修行app/${String(path || '').replace(/^\//, '')}`
}

/** 与 common/product-store.js 对齐的 APP 端商品种子 */
export function getAppProductSeed() {
  return [
    { id: 'p1', name: '经典正红丝绒口红', brand: '阅己', sku: 'APP-P1', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 129, stock: 1200, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-1.jpg'), syncCover: appImg('static/images/lipstick-1.jpg'), fav: 3260, review: 326, order: 21000, gmv: 2709000, status: '已上架', auditStatus: '审核通过' },
    { id: 'p2', name: '温柔裸粉口红礼盒', brand: '阅己', sku: 'APP-P2', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 199, stock: 860, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-2.jpg'), syncCover: appImg('static/images/lipstick-2.jpg'), fav: 2180, review: 218, order: 14000, gmv: 2786000, status: '已上架', auditStatus: '审核通过' },
    { id: 'p3', name: '珊瑚莓果双色套装', brand: '阅己', sku: 'APP-P3', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 149, stock: 980, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-3.jpg'), syncCover: appImg('static/images/lipstick-3.jpg'), fav: 1870, review: 187, order: 9800, gmv: 1460200, status: '已上架', auditStatus: '审核通过' },
    { id: 'p4', name: '绒雾质感口红', brand: '阅己', sku: 'APP-P4', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 109, stock: 1560, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-4.jpg'), syncCover: appImg('static/images/lipstick-4.jpg'), fav: 2640, review: 264, order: 18000, gmv: 1962000, status: '已上架', auditStatus: '审核通过' },
    { id: 'mx1', name: '可复美重组胶原蛋白「绿印」修护次抛精华液', brand: '可复美', sku: 'APP-MX1', cat1: '护肤', cat2: '面部护肤', cat3: '精华', price: 485, stock: 420, merchant: '可复美官方旗舰店', merchantLetter: '可', coverUrl: appImg('static/images/product-trial-2.jpg'), syncCover: appImg('static/images/product-trial-2.jpg'), fav: 9520, review: 7184, order: 95000, gmv: 46075000, status: '已上架', auditStatus: '审核通过' },
    { id: 'mx2', name: '薇诺娜舒敏保湿特护霜', brand: '薇诺娜', sku: 'APP-MX2', cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜', price: 188, stock: 680, merchant: '薇诺娜官方旗舰店', merchantLetter: '薇', coverUrl: appImg('static/images/products/skincare-1.jpg'), syncCover: appImg('static/images/products/skincare-1.jpg'), fav: 5612, review: 3280, order: 56000, gmv: 10528000, status: '已上架', auditStatus: '审核通过' },
    { id: 'mx3', name: 'HEY:REAL B5精华液', brand: 'HEY:REAL', sku: 'APP-MX3', cat1: '护肤', cat2: '面部护肤', cat3: '精华', price: 159, stock: 920, merchant: 'HEY:REAL官方店', merchantLetter: 'H', coverUrl: appImg('static/images/product-flash-2.jpg'), syncCover: appImg('static/images/product-flash-2.jpg'), fav: 3340, review: 2106, order: 33000, gmv: 5247000, status: '已上架', auditStatus: '审核通过' },
    { id: 'r1', name: 'OLAY美白焕亮精华身体乳', brand: 'OLAY', sku: 'APP-R1', cat1: '护肤', cat2: '身体护理', cat3: '身体乳', price: 165, stock: 1100, merchant: 'OLAY官方旗舰店', merchantLetter: 'O', coverUrl: appImg('static/images/product-trial-1.jpg'), syncCover: appImg('static/images/product-trial-1.jpg'), fav: 2154, review: 1491, order: 8200, gmv: 1353000, status: '已上架', auditStatus: '审核通过' },
    { id: 'r5', name: '松达婴儿山茶油霜', brand: '松达', sku: 'APP-R5', cat1: '护肤', cat2: '身体护理', cat3: '身体乳', price: 98, stock: 2400, merchant: '松达母婴旗舰店', merchantLetter: '松', coverUrl: appImg('static/images/product-flash-1.jpg'), syncCover: appImg('static/images/product-flash-1.jpg'), fav: 3890, review: 2103, order: 15600, gmv: 1528800, status: '已上架', auditStatus: '审核通过' },
    { id: 'r6', name: '花西子养肤粉底液', brand: '花西子', sku: 'APP-R6', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', price: 159, stock: 1800, merchant: '花西子国风旗舰店', merchantLetter: '西', coverUrl: appImg('static/images/products/foundation-1.jpg'), syncCover: appImg('static/images/products/foundation-1.jpg'), fav: 2941, review: 1876, order: 12400, gmv: 1971600, status: '已上架', auditStatus: '审核通过' }
  ]
}

export function mergeAppProducts(list) {
  const seed = getAppProductSeed()
  const map = {}
  const order = []
  seed.forEach((s) => {
    const id = String(s.id)
    map[id] = { ...s }
    order.push(id)
  })
  ;(list || []).forEach((p) => {
    if (!p || p.id == null || p.id === '') return
    const id = String(p.id)
    if (map[id]) {
      const base = map[id]
      map[id] = {
        ...base,
        ...p,
        cat1: p.cat1 || base.cat1,
        cat2: p.cat2 || base.cat2,
        cat3: p.cat3 || base.cat3,
        brand: p.brand || base.brand,
        sku: p.sku || base.sku,
        coverUrl: p.coverUrl || base.coverUrl,
        syncCover: p.syncCover || base.syncCover,
        merchant: p.merchant || base.merchant,
        merchantLetter: p.merchantLetter || base.merchantLetter,
        status: p.status || base.status,
        auditStatus: p.auditStatus || base.auditStatus
      }
    } else {
      map[id] = { ...p }
      order.push(id)
    }
  })
  return order.map((id) => map[id])
}

/** 商品管理列表：读取共享存储并合并 APP 端全部商品 */
export function loadProductListForAdmin(fallback = []) {
  const stored = readAdminList()
  const base = stored.length ? stored : fallback
  const merged = mergeAppProducts(base)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ADMIN_PRODUCT_STORAGE_KEY, JSON.stringify(merged))
    }
  } catch (e) { /* ignore */ }
  return merged
}

/** App 端可读的完整商品池：运营端存储 ∪ App 种子 */
export function loadQueryableProductList() {
  return mergeAppProducts(loadAdminProductList())
}

function normKey(v) {
  return String(v || '')
    .trim()
    .toUpperCase()
    .replace(/[\s\-_/·．.]+/g, '')
}

/** 从商品池提取品牌选项（含「其他品牌」） */
export function collectProductBrands(list) {
  const seen = {}
  const brands = []
  ;(list || []).forEach((p) => {
    const b = String((p && p.brand) || '').trim()
    if (!b || seen[b]) return
    seen[b] = true
    brands.push(b)
  })
  brands.sort((a, b) => a.localeCompare(b, 'zh-CN'))
  brands.push('其他品牌')
  return brands
}

/**
 * 按品牌 + 批号查询运营端商品管理列表项
 * 批号匹配：batchNo / sku / 商品ID（忽略大小写与分隔符）
 */
export function queryProductsByBrandAndBatch(brand, batchNo, options = {}) {
  const list = options.list || loadQueryableProductList()
  const brandRaw = String(brand || '').trim()
  const batchRaw = String(batchNo || '').trim()
  if (!brandRaw || !batchRaw) return []
  const batchKey = normKey(batchRaw)
  const brandOther = brandRaw === '其他品牌'
  const brandKey = normKey(brandRaw)
  const imgBase = options.imgBase || '../运营管理系统/static/products/'
  const hits = []
  for (const p of list || []) {
    if (!p) continue
    const pBrand = String(p.brand || '').trim()
    if (!brandOther) {
      if (normKey(pBrand) !== brandKey) continue
    }
    const keys = [p.batchNo, p.sku, p.id, p.lotNo].map(normKey).filter(Boolean)
    const matched = keys.some((k) => k === batchKey || k.indexOf(batchKey) >= 0 || batchKey.indexOf(k) >= 0)
    if (!matched) continue
    hits.push({
      ...mapAdminProductToCard(p, imgBase),
      sku: p.sku || '',
      batchNo: p.batchNo || p.sku || p.id || '',
      status: p.status || '',
      auditStatus: p.auditStatus || '',
      stock: p.stock,
      cat1: p.cat1 || '',
      cat2: p.cat2 || '',
      cat3: p.cat3 || ''
    })
  }
  return hits
}

/**
 * 首页「搜索」：按关键词匹配运营端商品管理列表
 * 匹配字段：名称 / 品牌 / SKU / ID / 分类 / 商家
 */
export function searchProductsByKeyword(keyword, options = {}) {
  const q = String(keyword || '').trim()
  if (!q) return []
  const list = options.list || loadQueryableProductList()
  const imgBase = options.imgBase || '../运营管理系统/static/products/'
  const onlyOnShelf = !!options.onlyOnShelf
  const limit = options.limit || 50
  const qLower = q.toLowerCase()
  const qKey = normKey(q)
  const scored = []
  for (const p of list || []) {
    if (!p) continue
    if (onlyOnShelf && p.status && p.status !== '已上架') continue
    const fields = [
      p.name,
      p.brand,
      p.sku,
      p.id,
      p.cat1,
      p.cat2,
      p.cat3,
      p.merchant,
      p.batchNo
    ].map((v) => String(v || ''))
    let score = 0
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i]
      if (!f) continue
      const fl = f.toLowerCase()
      const fk = normKey(f)
      if (fl === qLower || fk === qKey) score += 100 - i
      else if (fl.indexOf(qLower) >= 0 || (qKey && fk.indexOf(qKey) >= 0)) score += 40 - i
    }
    if (score <= 0) continue
    scored.push({
      score,
      card: {
        ...mapAdminProductToCard(p, imgBase),
        sku: p.sku || '',
        status: p.status || '',
        auditStatus: p.auditStatus || '',
        cat1: p.cat1 || '',
        cat2: p.cat2 || '',
        cat3: p.cat3 || ''
      }
    })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => x.card)
}
