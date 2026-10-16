/** 功能入口 · 运营端 DecorPanel 持久化 */
export const DECOR_ENTRY_STORAGE_KEY = 'zhuangyan_decor_entries_v1'

export const DECOR_ENTRY_SEED = [
  { id: 'EN10001', name: 'AI测肤', icon: 'skin.svg', position: '首页中部', path: '选择指定商品', sort: 1, visible: true, scope: 'home', actionKey: 'skinGuide' },
  { id: 'EN10002', name: '阅己榜单', icon: 'rank.svg', position: '首页中部', path: '指定活动', sort: 2, visible: true, scope: 'home', actionKey: 'rank' },
  { id: 'EN10003', name: '批号查询', icon: 'batch.svg', position: '首页中部', path: '自定页面', sort: 3, visible: true, scope: 'home', actionKey: 'batch' },
  { id: 'EN10004', name: '试用中心', icon: 'plan.svg', position: '首页顶部', path: '跳转网址', sort: 4, visible: true, scope: 'home', actionKey: 'trial' },
  { id: 'EN10005', name: '我的梳妆台', icon: 'desk.svg', position: '个人中心', path: '选择指定商品', sort: 99, visible: false, scope: 'profile', actionKey: 'desk' },
  { id: 'EN10008', name: '我的订单', icon: 'order.svg', position: '个人中心', path: '自定页面', sort: 1, visible: true, scope: 'profile', actionKey: 'order' },
  { id: 'EN10009', name: '优惠券', icon: 'coupon.svg', position: '个人中心', path: '自定页面', sort: 2, visible: true, scope: 'profile', actionKey: 'coupon' },
  { id: 'EN10007', name: '购物车', icon: 'cart.svg', position: '个人中心', path: '自定页面', sort: 3, visible: true, scope: 'profile', actionKey: 'cart' },
  { id: 'EN10010', name: '收货地址', icon: 'address.svg', position: '个人中心', path: '自定页面', sort: 4, visible: true, scope: 'profile', actionKey: 'address' }
]

const REMOVED_ENTRY_IDS = { EN10006: true }

function cloneEntry(en) {
  return {
    id: en.id,
    name: en.name || '',
    icon: en.icon || '',
    iconUrl: en.iconUrl || '',
    position: en.position || '',
    path: en.path || '',
    linkUrl: en.linkUrl || '',
    sort: en.sort,
    visible: !!en.visible,
    scope: en.scope || 'home',
    actionKey: en.actionKey || ''
  }
}

function withoutRemoved(list) {
  return (list || []).filter((en) => !REMOVED_ENTRY_IDS[en.id])
}

function normalizeEntryNames(list) {
  return (list || []).map((en) => {
    const c = cloneEntry(en)
    const name = String(c.name || '')
    const isRank = c.id === 'EN10002' || c.actionKey === 'rank' || /妆研榜单/.test(name)
    if (isRank && name !== '阅己榜单') {
      c.name = '阅己榜单'
      if (!c.actionKey) c.actionKey = 'rank'
    }
    return c
  })
}

function mergeMissingDefaults(list) {
  const ids = {}
  const merged = withoutRemoved(list).map(cloneEntry)
  merged.forEach((en) => { ids[en.id] = true })
  DECOR_ENTRY_SEED.forEach((def) => {
    if (!ids[def.id]) merged.push(cloneEntry(def))
  })
  return normalizeEntryNames(merged)
}

export function loadDecorEntryList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(DECOR_ENTRY_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) {
          const merged = mergeMissingDefaults(parsed)
          saveDecorEntryList(merged)
          return merged
        }
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DECOR_ENTRY_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const merged = mergeMissingDefaults(parsed)
          saveDecorEntryList(merged)
          return merged
        }
      }
    }
  } catch (e) { /* ignore */ }
  return DECOR_ENTRY_SEED.map(cloneEntry)
}

export function saveDecorEntryList(list) {
  const snapshot = normalizeEntryNames((list || []).map(cloneEntry))
  const stored = snapshot.map((en) => {
    const c = cloneEntry(en)
    if (c.iconUrl && String(c.iconUrl).length > 120000) {
      c.iconUrl = ''
      if (!c.icon) c.icon = 'skin.svg'
    }
    return c
  })
  const merged = mergeMissingDefaults(stored)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(DECOR_ENTRY_STORAGE_KEY, merged)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DECOR_ENTRY_STORAGE_KEY, JSON.stringify(merged))
    }
  } catch (e) { /* ignore */ }
  if (typeof window !== 'undefined') {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'decor-entry-sync', entries: merged }, '*')
      }
    } catch (e) { /* ignore */ }
  }
  return merged
}

export function nextEntryId(list) {
  let max = 10000
  ;(list || []).forEach((en) => {
    const n = parseInt(String(en.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  return 'EN' + (max + 1)
}
