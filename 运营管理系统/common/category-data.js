/** 分类管理 · 列表项读取运营管理系统商品管理列表的 cat1/cat2/cat3 */

export const CATEGORY_STORAGE_KEY = 'zhuangyan_category_list_v1'
export const PRODUCT_STORAGE_KEY = 'zhuangyan_product_list_v1'

const LEVEL_LABEL = { 1: '一级分类', 2: '二级分类', 3: '三级分类' }

/** 商品为空或无分类字段时的兜底（与商品管理默认数据一致） */
const FALLBACK_TREE = [
  { cat1: '护肤', cat2: '面部护肤', cat3: '精华' },
  { cat1: '护肤', cat2: '面部护肤', cat3: '洁面' },
  { cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水' },
  { cat1: '护肤', cat2: '面部护肤', cat3: '面膜' },
  { cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜' },
  { cat1: '护肤', cat2: '眼部护理', cat3: '眼霜' },
  { cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底' },
  { cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红' },
  { cat1: '香水', cat2: '香氛', cat3: '精华' }
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

export function cloneCategory(c) {
  return {
    id: String(c.id || ''),
    name: c.name || '',
    level: Number(c.level) || 1,
    levelLabel: c.levelLabel || LEVEL_LABEL[Number(c.level) || 1] || '一级分类',
    parentName: c.parentName || '',
    path: c.path || c.name || '',
    cat1: c.cat1 || '',
    cat2: c.cat2 || '',
    cat3: c.cat3 || '',
    productCount: Number(c.productCount) || 0,
    sort: Number(c.sort) || 0,
    status: normalizeStatus(c.status),
    statusKey: statusKeyOf(c.status),
    createTime: c.createTime || '',
    _checked: false
  }
}

/** 规范化商品分类字段（兼容别名） */
export function normalizeProductCats(p) {
  if (!p) return { cat1: '', cat2: '', cat3: '' }
  return {
    ...p,
    cat1: String(p.cat1 || p.category1 || p.firstCategory || '').trim(),
    cat2: String(p.cat2 || p.category2 || p.secondCategory || '').trim(),
    cat3: String(p.cat3 || p.category3 || p.thirdCategory || '').trim()
  }
}

export function loadProductListForCategory() {
  const parsed = readJson(PRODUCT_STORAGE_KEY)
  if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeProductCats)
  return []
}

function loadMetaMap() {
  const parsed = readJson(CATEGORY_STORAGE_KEY)
  const map = {}
  if (Array.isArray(parsed)) {
    parsed.forEach((c) => {
      const path = String(c && (c.path || c.name) ? (c.path || c.name) : '').trim()
      if (!path) return
      map[path] = cloneCategory(c)
    })
  }
  return map
}

/**
 * 从商品管理列表聚合三级分类树节点
 */
export function aggregateCategoriesFromProducts(products) {
  let source = (products && products.length)
    ? products.map(normalizeProductCats)
    : FALLBACK_TREE.map((x) => ({ ...x }))

  const l1 = {}
  const l2 = {}
  const l3 = {}
  let hasCat = false

  source.forEach((p) => {
    const cat1 = String(p.cat1 || '').trim()
    const cat2 = String(p.cat2 || '').trim()
    const cat3 = String(p.cat3 || '').trim()
    if (cat1) {
      hasCat = true
      l1[cat1] = (l1[cat1] || 0) + 1
    }
    if (cat1 && cat2) {
      const key = cat1 + ' > ' + cat2
      if (!l2[key]) l2[key] = { cat1, cat2, count: 0 }
      l2[key].count += 1
    }
    if (cat1 && cat2 && cat3) {
      const key = cat1 + ' > ' + cat2 + ' > ' + cat3
      if (!l3[key]) l3[key] = { cat1, cat2, cat3, count: 0 }
      l3[key].count += 1
    }
  })

  if (!hasCat && products && products.length) {
    return aggregateCategoriesFromProducts(FALLBACK_TREE)
  }

  const nodes = []
  Object.keys(l1).forEach((name) => {
    nodes.push({
      path: name,
      name,
      level: 1,
      parentName: '',
      cat1: name,
      cat2: '',
      cat3: '',
      productCount: l1[name]
    })
  })
  Object.keys(l2).forEach((path) => {
    const n = l2[path]
    nodes.push({
      path,
      name: n.cat2,
      level: 2,
      parentName: n.cat1,
      cat1: n.cat1,
      cat2: n.cat2,
      cat3: '',
      productCount: n.count
    })
  })
  Object.keys(l3).forEach((path) => {
    const n = l3[path]
    nodes.push({
      path,
      name: n.cat3,
      level: 3,
      parentName: n.cat2,
      cat1: n.cat1,
      cat2: n.cat2,
      cat3: n.cat3,
      productCount: n.count
    })
  })
  return nodes
}

function assignIds(list) {
  let max = 0
  list.forEach((c) => {
    const n = parseInt(String(c.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  list.forEach((c) => {
    if (c.id) return
    max += 1
    c.id = String(max).padStart(5, '0')
  })
  return list
}

/**
 * 分类列表：以商品管理列表项的 cat1/cat2/cat3 为准
 */
export function loadCategoryList(productList) {
  let products = Array.isArray(productList) && productList.length
    ? productList.map(normalizeProductCats)
    : loadProductListForCategory()

  let nodes = aggregateCategoriesFromProducts(products)
  if (!nodes.length) nodes = aggregateCategoriesFromProducts(FALLBACK_TREE)

  const metaMap = loadMetaMap()
  const list = nodes.map((n) => {
    const meta = metaMap[n.path] || {}
    return cloneCategory({
      id: meta.id || '',
      name: n.name,
      level: n.level,
      levelLabel: LEVEL_LABEL[n.level],
      parentName: n.parentName,
      path: n.path,
      cat1: n.cat1,
      cat2: n.cat2,
      cat3: n.cat3,
      productCount: n.productCount,
      sort: meta.sort != null ? meta.sort : 0,
      status: meta.status || '已启用',
      createTime: meta.createTime || ''
    })
  })

  assignIds(list)
  return list.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    const sa = Number(a.sort) || 0
    const sb = Number(b.sort) || 0
    if (sa !== sb) return sa - sb
    return String(b.id).localeCompare(String(a.id))
  })
}

export function saveCategoryList(list) {
  const cleaned = (list || []).map((c) => {
    const x = cloneCategory(c)
    delete x._checked
    return x
  })
  writeJson(CATEGORY_STORAGE_KEY, cleaned)
  return cleaned
}

export function nextCategoryId(list) {
  let max = 0
  ;(list || []).forEach((c) => {
    const n = parseInt(String(c.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  return String(max + 1).padStart(5, '0')
}

export { LEVEL_LABEL }
