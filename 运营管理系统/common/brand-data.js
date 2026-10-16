/** 品牌管理 · 列表项读取商品管理中的品牌 */

export const BRAND_STORAGE_KEY = 'zhuangyan_brand_list_v1'
export const PRODUCT_STORAGE_KEY = 'zhuangyan_product_list_v1'

/** 英文名兜底（商品 brand 字段常见值） */
const EN_NAME_HINT = {
  'SK-II': 'SK-II',
  'Lancôme': 'Lancôme',
  '兰蔻': 'Lancôme',
  'Estée Lauder': 'Estée Lauder',
  '雅诗兰黛': 'Estée Lauder',
  '完美日记': 'Perfect Diary',
  '花西子': 'Florasis',
  '自然堂': 'Chando',
  '海蓝之谜': 'La Mer',
  "L'Oréal Paris": "L'Oréal Paris",
  '欧莱雅': "L'Oréal Paris",
  '修丽可': 'SkinCeuticals',
  '珂润': 'Curel',
  'Curel': 'Curel',
  '阅己': 'YueJi',
  '薇诺娜': 'Winona',
  'OLAY': 'OLAY',
  '玉兰油': 'OLAY'
}

/** 商品列表为空时的兜底品牌（与商品管理默认数据一致） */
const PRODUCT_BRAND_FALLBACK = [
  'SK-II', 'Lancôme', 'Estée Lauder', '雅诗兰黛', '完美日记', '花西子',
  '自然堂', '海蓝之谜', "L'Oréal Paris", '修丽可', '珂润'
]

function statusKeyOf(status) {
  return status === '已停用' || status === '停用' ? 'off' : 'on'
}

function normalizeStatus(status) {
  if (status === '停用' || status === '已停用') return '已停用'
  return '已启用'
}

function readJson(key) {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(key)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (parsed) return parsed
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) { /* ignore */ }
  return null
}

function writeJson(key, data) {
  try {
    const raw = JSON.stringify(data)
    if (typeof uni !== 'undefined' && uni.setStorageSync) uni.setStorageSync(key, raw)
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, raw)
  } catch (e) { /* ignore */ }
}

export function cloneBrand(b) {
  return {
    id: String(b.id || ''),
    name: b.name || '',
    enName: b.enName || '',
    logo: b.logo || '',
    productCount: Number(b.productCount) || 0,
    sort: Number(b.sort) || 0,
    status: normalizeStatus(b.status),
    statusKey: statusKeyOf(b.status),
    intro: b.intro || '',
    createTime: b.createTime || '',
    _checked: false
  }
}

/** 读取商品管理列表 */
export function loadProductListForBrand() {
  const parsed = readJson(PRODUCT_STORAGE_KEY)
  if (Array.isArray(parsed) && parsed.length) return parsed
  return []
}

/** 从商品列表聚合品牌 → { name: count } */
export function aggregateBrandsFromProducts(products) {
  const map = {}
  ;(products || []).forEach((p) => {
    const name = String(p && p.brand ? p.brand : '').trim()
    if (!name) return
    map[name] = (map[name] || 0) + 1
  })
  return map
}

function loadBrandMetaMap() {
  const parsed = readJson(BRAND_STORAGE_KEY)
  const map = {}
  if (Array.isArray(parsed)) {
    parsed.forEach((b) => {
      const name = String(b && b.name ? b.name : '').trim()
      if (!name) return
      map[name] = cloneBrand(b)
    })
  }
  return map
}

function assignStableIds(brands) {
  let max = 0
  brands.forEach((b) => {
    const n = parseInt(String(b.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  brands.forEach((b) => {
    if (b.id) return
    max += 1
    b.id = String(max).padStart(5, '0')
  })
  return brands
}

/**
 * 品牌列表：以商品管理中的 brand 为准，关联商品数实时统计；
 * 英文名/Logo/状态/简介/排序等可编辑字段从本地品牌元数据合并。
 */
export function loadBrandList(productList) {
  const products = Array.isArray(productList) ? productList : loadProductListForBrand()
  let countMap = aggregateBrandsFromProducts(products)
  let names = Object.keys(countMap)

  // 商品存储为空时，用默认商品品牌兜底，避免列表空白
  if (!names.length) {
    names = PRODUCT_BRAND_FALLBACK.slice()
    countMap = {}
    names.forEach((n) => { countMap[n] = 1 })
  }

  const metaMap = loadBrandMetaMap()
  const list = names.map((name) => {
    const meta = metaMap[name] || {}
    return cloneBrand({
      id: meta.id || '',
      name,
      enName: meta.enName || EN_NAME_HINT[name] || '',
      logo: meta.logo || '',
      productCount: countMap[name] || 0,
      sort: meta.sort != null ? meta.sort : 0,
      status: meta.status || '已启用',
      intro: meta.intro || '',
      createTime: meta.createTime || ''
    })
  })

  assignStableIds(list)
  return list.sort((a, b) => {
    const sa = Number(a.sort) || 0
    const sb = Number(b.sort) || 0
    if (sa !== sb) return sa - sb
    return String(b.id).localeCompare(String(a.id))
  })
}

/** 保存品牌可编辑元数据（不覆盖商品品牌来源） */
export function saveBrandList(list) {
  const cleaned = (list || []).map((b) => {
    const c = cloneBrand(b)
    delete c._checked
    return c
  })
  writeJson(BRAND_STORAGE_KEY, cleaned)
  return cleaned
}

export function nextBrandId(list) {
  let max = 0
  ;(list || []).forEach((b) => {
    const n = parseInt(String(b.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  return String(max + 1).padStart(5, '0')
}

export function guessBrandEnName(name) {
  return EN_NAME_HINT[name] || ''
}
