/** 功能入口 · 与运营端店铺装修同步 */
import { loadDecorPageList } from './decor-page-data.js'

export const DECOR_ENTRY_STORAGE_KEY = 'zhuangyan_decor_entries_v1'

export const DECOR_ENTRY_SEED = [
  { id: 'EN10001', name: 'AI测肤', icon: 'skin.svg', position: '首页中部', path: '选择指定商品', sort: 1, visible: true, scope: 'home', actionKey: 'skinGuide' },
  { id: 'EN10002', name: '阅己榜单', icon: 'rank.svg', position: '首页中部', path: '指定活动', sort: 2, visible: true, scope: 'home', actionKey: 'rank' },
  { id: 'EN10003', name: '批号查询', icon: 'batch.svg', position: '首页中部', path: '选择指定商品', sort: 3, visible: true, scope: 'home', actionKey: 'batch' },
  { id: 'EN10004', name: '试用中心', icon: 'plan.svg', position: '首页顶部', path: '选择指定商品', sort: 4, visible: true, scope: 'home', actionKey: 'trial' },
  { id: 'EN10005', name: '我的梳妆台', icon: 'desk.svg', position: '个人中心', path: '选择指定商品', sort: 99, visible: false, scope: 'profile', actionKey: 'desk' },
  { id: 'EN10008', name: '我的订单', icon: 'order.svg', position: '个人中心', path: '自定页面', sort: 1, visible: true, scope: 'profile', actionKey: 'order' },
  { id: 'EN10009', name: '优惠券', icon: 'coupon.svg', position: '个人中心', path: '自定页面', sort: 2, visible: true, scope: 'profile', actionKey: 'coupon' },
  { id: 'EN10007', name: '购物车', icon: 'cart.svg', position: '个人中心', path: '自定页面', sort: 3, visible: true, scope: 'profile', actionKey: 'cart' },
  { id: 'EN10010', name: '收货地址', icon: 'address.svg', position: '个人中心', path: '自定页面', sort: 4, visible: true, scope: 'profile', actionKey: 'address' }
]

const REMOVED_ENTRY_IDS = { EN10006: true }

const ICON_MAP = {
  EN10001: 'skin.svg',
  EN10002: 'rank.svg',
  EN10003: 'batch.svg',
  EN10004: 'plan.svg',
  EN10005: 'desk.svg',
  EN10007: 'cart.svg',
  EN10008: 'order.svg',
  EN10009: 'coupon.svg',
  EN10010: 'address.svg'
}

export const ENTRY_ACTION_ROUTES = {
  skinGuide: '/pages/skin-guide/index',
  rank: '/pages/rank/index',
  batch: '/pages/batch/index',
  desk: '/pages/desk/index',
  trial: '/pages/trial/index',
  plan: '/pages/plan/index',
  coupon: '/pages/coupon/index',
  cart: '/pages/cart/index',
  order: '/pages/order/index',
  address: '/pages/address/index'
}

const LEGACY_ID_ACTION = {
  EN10001: 'skinGuide',
  EN10002: 'rank',
  EN10003: 'batch',
  EN10004: 'trial',
  EN10005: 'desk',
  EN10007: 'cart',
  EN10008: 'order'
}

function compareSort(a, b) {
  const sa = Number(a.sort) || 0
  const sb = Number(b.sort) || 0
  if (sa !== sb) return sa - sb
  return String(a.id).localeCompare(String(b.id))
}

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

export function resolveEntryIcon(entry) {
  if (!entry) return '/static/features/skin.svg'
  if (entry.iconUrl) return entry.iconUrl
  if (entry.icon) {
    const ic = String(entry.icon)
    if (/^(data:|https?:|\/)/.test(ic)) return ic
    return '/static/features/' + ic.replace(/^.*\//, '')
  }
  const file = ICON_MAP[entry.id] || 'skin.svg'
  return '/static/features/' + file
}

export function resolveEntryActionKey(entry) {
  if (!entry) return ''
  if (entry.actionKey) return entry.actionKey
  const name = String(entry.name || '')
  if (/购物车/.test(name)) return 'cart'
  if (/订单/.test(name)) return 'order'
  return LEGACY_ID_ACTION[entry.id] || ''
}

export function mapEntryToFeature(entry) {
  return {
    id: entry.id,
    name: entry.name,
    icon: resolveEntryIcon(entry),
    actionKey: resolveEntryActionKey(entry),
    path: entry.path || '',
    linkUrl: entry.linkUrl || ''
  }
}

function loadPagesForResolve() {
  try {
    return loadDecorPageList() || []
  } catch (e) {
    return []
  }
}

/**
 * 解析功能入口最终跳转地址
 * @returns {{ type: 'external'|'page', url: string } | null}
 */
export function resolveEntryNavigateUrl(entry) {
  if (!entry) return null
  const linkUrl = String(entry.linkUrl || '').trim()
  const name = String(entry.name || '').trim()
  const pathType = String(entry.path || '')
  const pages = loadPagesForResolve()

  if (/^https?:\/\//i.test(linkUrl)) {
    return { type: 'external', url: linkUrl }
  }

  if (linkUrl.indexOf('/pages/product/detail') === 0) {
    return { type: 'page', url: linkUrl.startsWith('/') ? linkUrl : '/' + linkUrl }
  }
  if (linkUrl.indexOf('/pages/activity/detail') === 0) {
    return { type: 'page', url: linkUrl.startsWith('/') ? linkUrl : '/' + linkUrl }
  }
  if (linkUrl.indexOf('/pages/decor/page') === 0) {
    return { type: 'page', url: linkUrl.startsWith('/') ? linkUrl : '/' + linkUrl }
  }

  const knownRoutes = Object.values(ENTRY_ACTION_ROUTES)
  for (let i = 0; i < knownRoutes.length; i++) {
    const route = knownRoutes[i]
    if (linkUrl === route || linkUrl.indexOf(route + '?') === 0) {
      return { type: 'page', url: linkUrl }
    }
  }

  if (linkUrl) {
    const byPath = pages.find((p) => p.path === linkUrl)
    if (byPath) {
      return { type: 'page', url: '/pages/decor/page?id=' + encodeURIComponent(byPath.id) }
    }
    // 假路径：/pages/topic|brand|content|activity|vip|ingredient/...（非真实注册页）
    if (/^\/pages\/(topic|brand|content|vip|ingredient|custom|activity)\//.test(linkUrl)
      && linkUrl.indexOf('/pages/activity/detail') !== 0) {
      const byPath2 = pages.find((p) => p.path === linkUrl)
      if (byPath2) {
        return { type: 'page', url: '/pages/decor/page?id=' + encodeURIComponent(byPath2.id) }
      }
      if (name) {
        return { type: 'page', url: '/pages/decor/page?name=' + encodeURIComponent(name) + '&path=' + encodeURIComponent(linkUrl) }
      }
      return { type: 'page', url: '/pages/decor/page?path=' + encodeURIComponent(linkUrl) }
    }
    if (linkUrl.indexOf('/pages/') === 0) {
      return { type: 'page', url: linkUrl }
    }
  }

  // 自定页面：无内置 actionKey 时，按名称匹配/打开装修页
  if (pathType === '自定页面' && !resolveEntryActionKey(entry)) {
    const byName = pages.find((p) => p.name === name)
      || pages.find((p) => p.name && name && (p.name.indexOf(name) >= 0 || name.indexOf(p.name) >= 0))
    if (byName) {
      return { type: 'page', url: '/pages/decor/page?id=' + encodeURIComponent(byName.id) }
    }
    if (name) {
      return { type: 'page', url: '/pages/decor/page?name=' + encodeURIComponent(name) }
    }
  }

  // 指定活动但无具体链接时，无法定位活动，返回空
  return null
}

export function filterForHome(list) {
  return (list || [])
    .filter((en) => en.scope === 'home' && en.visible)
    .filter((en) => en.position === '首页顶部' || en.position === '首页中部')
    .sort(compareSort)
}

export function filterForProfile(list) {
  return (list || [])
    .filter((en) => en.scope === 'profile' && en.visible)
    .sort(compareSort)
}

function withoutRemovedEntries(list) {
  return (list || []).filter((en) => !REMOVED_ENTRY_IDS[en.id])
}

/** 历史文案「妆研榜单」统一改为「阅己榜单」；批号入口纠正 path */
function normalizeEntryNames(list) {
  return (list || []).map((en) => {
    const c = cloneEntry(en)
    const name = String(c.name || '')
    const isRank = c.id === 'EN10002' || c.actionKey === 'rank' || /妆研榜单/.test(name)
    if (isRank && name !== '阅己榜单') {
      c.name = '阅己榜单'
      if (!c.actionKey) c.actionKey = 'rank'
    }
    const isBatch = c.id === 'EN10003' || c.actionKey === 'batch' || /批号/.test(name)
    if (isBatch) {
      if (!c.actionKey) c.actionKey = 'batch'
      if (c.path === '自定页面') c.path = '选择指定商品'
    }
    const isTrial = c.id === 'EN10004' || c.actionKey === 'trial' || name === '试用中心'
    if (isTrial) {
      if (!c.actionKey) c.actionKey = 'trial'
      if (c.path === '跳转网址' || c.path === '自定页面') c.path = '选择指定商品'
    }
    return c
  })
}

function mergeMissingDefaults(list) {
  const ids = {}
  const merged = withoutRemovedEntries(list || []).slice()
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
        if (Array.isArray(parsed) && parsed.length) {
          const filtered = mergeMissingDefaults(parsed)
          saveDecorEntryList(filtered)
          return filtered.map(cloneEntry)
        }
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DECOR_ENTRY_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) {
          const filtered = mergeMissingDefaults(parsed)
          saveDecorEntryList(filtered)
          return filtered.map(cloneEntry)
        }
      }
    }
  } catch (e) { /* ignore */ }
  return DECOR_ENTRY_SEED.map(cloneEntry)
}

export function saveDecorEntryList(list) {
  const snapshot = normalizeEntryNames((list || []).map(cloneEntry))
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(DECOR_ENTRY_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DECOR_ENTRY_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  broadcastDecorEntryList(snapshot)
  return snapshot
}

export function broadcastDecorEntryList(list) {
  if (typeof window === 'undefined') return
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'decor-entry-sync', entries: list || [] }, '*')
    }
  } catch (e) { /* ignore */ }
}

export function getHomeFeatures() {
  return filterForHome(loadDecorEntryList()).map(mapEntryToFeature)
}

export function getProfileFeatures() {
  return filterForProfile(loadDecorEntryList()).map(mapEntryToFeature)
}
