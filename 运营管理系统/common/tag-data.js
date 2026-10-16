/** 标签分类管理 · 独立列表（样式对齐运营端参考图） */

export const TAG_STORAGE_KEY = 'zhuangyan_tag_list_v1'

const TAG_SEED = [
  { id: '00001', name: '热销', intro: '销量高、口碑好的爆款商品', productCount: 1, sort: 100, status: '已启用' },
  { id: '00002', name: '特卖', intro: '限时优惠、折扣力度大的商品', productCount: 2, sort: 95, status: '已启用' },
  { id: '00003', name: '新品', intro: '近期上架的新鲜好物', productCount: 3, sort: 90, status: '已启用' },
  { id: '00004', name: '爆款', intro: '短期内销量飙升的人气商品', productCount: 1, sort: 88, status: '已启用' },
  { id: '00005', name: '回购', intro: '用户复购率高的常备好物', productCount: 1, sort: 85, status: '已启用' },
  { id: '00006', name: '口碑', intro: '评价好、好评率高的商品', productCount: 2, sort: 80, status: '已启用' },
  { id: '00007', name: '明星同款', intro: '明星/达人同款推荐', productCount: 1, sort: 75, status: '已启用' },
  { id: '00008', name: '限量', intro: '数量有限、售完即止', productCount: 1, sort: 70, status: '已启用' },
  { id: '00009', name: '清仓', intro: '库存清仓特惠商品', productCount: 1, sort: 65, status: '已启用' },
  { id: '00010', name: '节日礼盒', intro: '节日礼盒套装推荐', productCount: 1, sort: 60, status: '已启用' }
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

export function cloneTag(t) {
  return {
    id: String(t.id || ''),
    name: t.name || '',
    intro: t.intro || '',
    productCount: Number(t.productCount) || 0,
    sort: Number(t.sort) || 0,
    status: normalizeStatus(t.status),
    statusKey: statusKeyOf(t.status),
    _checked: false
  }
}

export function loadTagList() {
  const parsed = readJson(TAG_STORAGE_KEY)
  let list = []
  if (Array.isArray(parsed) && parsed.length) {
    list = parsed.map(cloneTag)
  } else {
    list = TAG_SEED.map(cloneTag)
    saveTagList(list)
  }
  return list.sort((a, b) => {
    const sa = Number(a.sort) || 0
    const sb = Number(b.sort) || 0
    if (sa !== sb) return sb - sa
    return String(b.id).localeCompare(String(a.id))
  })
}

export function saveTagList(list) {
  const cleaned = (list || []).map((t) => {
    const c = cloneTag(t)
    delete c._checked
    return c
  })
  writeJson(TAG_STORAGE_KEY, cleaned)
  return cleaned
}

export function nextTagId(list) {
  let max = 0
  ;(list || []).forEach((t) => {
    const n = parseInt(String(t.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  return String(max + 1).padStart(5, '0')
}

export { TAG_SEED }
