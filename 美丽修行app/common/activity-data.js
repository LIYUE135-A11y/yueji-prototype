/** 发现页「活动」列表与详情 · 与运营端满减/满折同步 */
import { getUserAvatar } from './user-data.js'
import { getProductImage, getProductImages } from './product-image.js'

export const ACTIVITY_STORAGE_KEY = 'zhuangyan_activity_list_v2'

const COVER_PRODUCTS = ['p1', 'p2', 'p3', 'p4', 'p1', 'p2']

const COVER_FILE_PRODUCT_MAP = {
  'product-trial-1.jpg': 'p1',
  'product-trial-2.jpg': 'p1',
  'lipstick-1.jpg': 'p2',
  'lipstick-2.jpg': 'p3',
  'lipstick-3.jpg': 'p4',
  'lipstick-4.jpg': 'p4'
}

const COVER_FILES = [
  'product-trial-1.jpg',
  'lipstick-1.jpg',
  'lipstick-2.jpg',
  'lipstick-3.jpg',
  'product-trial-2.jpg',
  'lipstick-4.jpg'
]

export const ACTIVITY_SEED_LIST = [
  { id: '202506001', type: '满减', typeKey: 'manjian', status: '已结束', statusKey: 'ended', name: '双11全场满减', startTime: '2024-11-01', endTime: '2024-11-12', discount: '满200减30 等3档', limit: 5, stock: 0, view: 12580, join: 4820, refund: 125, refundRate: '2.6%', amount: 286580, enabled: true, productScope: '全部商品', userScope: '全部用户' },
  { id: '202506003', type: '满折', typeKey: 'manzhe', status: '已结束', statusKey: 'ended', name: '双12满折优惠', startTime: '2024-12-01', endTime: '2024-12-12', discount: '满300打8折', limit: 3, stock: 0, view: 9860, join: 3560, refund: 89, refundRate: '2.5%', amount: 198650, enabled: false, productScope: '全部商品', userScope: 'VIP会员' },
  { id: '202506005', type: '满减', typeKey: 'manjian', status: '进行中', statusKey: 'ongoing', name: '新人首单满减', startTime: '2026-01-01', endTime: '2026-12-31', discount: '满99减20', limit: 1, stock: 9999, view: 5680, join: 2350, refund: 45, refundRate: '1.9%', amount: 52360, enabled: true, productScope: '全部商品', userScope: '新注册用户' },
  { id: '202506011', type: '满折', typeKey: 'manzhe', status: '进行中', statusKey: 'ongoing', name: '会员专属满折', startTime: '2026-01-01', endTime: '2026-12-31', discount: '满500打7折', limit: 3, stock: 9999, view: 4520, join: 1680, refund: 32, refundRate: '1.9%', amount: 98650, enabled: true, productScope: '全部商品', userScope: 'VIP会员' },
  { id: '202506016', type: '满减', typeKey: 'manjian', status: '进行中', statusKey: 'ongoing', name: '年货节满减', startTime: '2026-01-15', endTime: '2026-02-10', discount: '满500减80 等4档', limit: 5, stock: 3200, view: 6820, join: 2560, refund: 65, refundRate: '2.5%', amount: 186520, enabled: true, productScope: '指定商品', productScopeDetail: 'SP100001', userScope: '全部用户' },
  { id: '202506018', type: '满折', typeKey: 'manzhe', status: '进行中', statusKey: 'ongoing', name: '护肤品类满折', startTime: '2026-02-01', endTime: '2026-02-28', discount: '满200打9折', limit: 2, stock: 9999, view: 5680, join: 2180, refund: 42, refundRate: '1.9%', amount: 78560, enabled: true, productScope: '指定商品', productScopeDetail: 'SP100002', userScope: '全部用户' },
  { id: '202506021', type: '满减', typeKey: 'manjian', status: '未开始', statusKey: 'upcoming', name: '38女王节满减', startTime: '2026-03-05', endTime: '2026-03-10', discount: '满300减60', limit: 4, stock: 10000, view: 0, join: 0, refund: 0, refundRate: '0.0%', amount: 0, enabled: true, productScope: '全部商品', userScope: '全部用户' }
]

function cloneActivity(a) {
  return {
    id: a.id,
    type: a.type || '',
    typeKey: a.typeKey || '',
    status: a.status || '',
    statusKey: a.statusKey || '',
    name: a.name || '',
    startTime: a.startTime || '',
    endTime: a.endTime || '',
    discount: a.discount || '',
    limit: a.limit != null ? a.limit : 0,
    stock: a.stock != null ? a.stock : 0,
    view: a.view != null ? a.view : 0,
    join: a.join != null ? a.join : 0,
    refund: a.refund != null ? a.refund : 0,
    refundRate: a.refundRate || '0.0%',
    amount: a.amount != null ? a.amount : 0,
    enabled: a.enabled !== false,
    productScope: a.productScope || '',
    userScope: a.userScope || '',
    productScopeDetail: a.productScopeDetail || '',
    userScopeDetail: a.userScopeDetail || ''
  }
}

function coverIndexFromId(id) {
  const str = String(id || '')
  let sum = 0
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i)
  return sum % COVER_PRODUCTS.length
}

export function extractActivityDisplayPrice(activity) {
  if (!activity) return '0'
  const discount = String(activity.discount || '')
  if (activity.typeKey === 'manjian') {
    const off = discount.match(/减(\d+(?:\.\d+)?)/)
    if (off) return off[1]
  }
  if (activity.typeKey === 'manzhe') {
    const fold = discount.match(/打([\d.]+)折/)
    if (fold) return fold[1]
  }
  return '0'
}

export function buildActivitySubTitle(activity) {
  if (!activity) return ''
  const parts = []
  if (activity.discount) parts.push(activity.discount)
  if (activity.startTime && activity.endTime) {
    parts.push(`${activity.startTime} — ${activity.endTime}`)
  }
  return parts.join(' · ') || activity.productScope || '限时优惠'
}

export function buildActivityDesc(activity) {
  if (!activity) return ''
  return [
    activity.name,
    activity.discount,
    `适用商品：${activity.productScope || '全部商品'}`,
    `适用用户：${activity.userScope || '全部用户'}`
  ].filter(Boolean).join('，')
}

export function resolveActivityCover(activity) {
  const pid = COVER_PRODUCTS[coverIndexFromId(activity && activity.id)]
  return getProductImage(pid, activity && activity.name)
}

function mergeSeedIntoActivityList(list) {
  const seedMap = {}
  ACTIVITY_SEED_LIST.forEach((s) => { seedMap[s.id] = s })
  return list.map((a) => {
    const seed = seedMap[a.id]
    if (!seed) return a
    return cloneActivity({
      ...seed,
      ...a,
      typeKey: a.typeKey || resolveTypeKey(a) || seed.typeKey,
      productScope: a.productScope || seed.productScope,
      productScopeDetail: a.productScopeDetail || seed.productScopeDetail
    })
  })
}

export function loadActivityList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(ACTIVITY_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) {
          return mergeSeedIntoActivityList(parsed.map(cloneActivity))
        }
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) {
          return mergeSeedIntoActivityList(parsed.map(cloneActivity))
        }
      }
    }
  } catch (e) { /* ignore */ }
  return ACTIVITY_SEED_LIST.map(cloneActivity)
}

export function saveActivityList(list) {
  const snapshot = (list || []).map(cloneActivity)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(ACTIVITY_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  broadcastActivityList(snapshot)
  return snapshot
}

export function broadcastActivityList(list) {
  if (typeof window === 'undefined') return
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'activity-sync', activities: list || [] }, '*')
    }
  } catch (e) { /* ignore */ }
}

export function filterActivitiesForDiscover(list) {
  return (list || []).filter((a) => {
    if (a.typeKey !== 'manjian' && a.typeKey !== 'manzhe') return false
    if (a.enabled === false) return false
    if (a.statusKey === 'ended') return false
    return true
  })
}

export function resolveActivityProductId(activity) {
  if (!activity) return 'p1'
  const detail = String(activity.productScopeDetail || '')
  if (detail) {
    const urlMatch = detail.match(/[?&]id=([^&|#\s]+)/i)
    if (urlMatch) return urlMatch[1]
    const spMatch = detail.match(/\b(SP\d+)\b/i)
    if (spMatch) return spMatch[1]
    const parts = detail.split(/[,，|]/)
    for (const part of parts) {
      const token = String(part || '').trim()
      if (/^(SP\d+|p\d+)$/i.test(token)) return token
    }
  }
  const file = COVER_FILES[coverIndexFromId(activity.id)]
  return COVER_FILE_PRODUCT_MAP[file] || COVER_PRODUCTS[coverIndexFromId(activity.id)] || 'p1'
}

export function mapActivityToDealCard(activity, index) {
  const pid = resolveActivityProductId(activity)
  const img = resolveActivityCover(activity)
  const price = extractActivityDisplayPrice(activity)
  const pricePrefix = activity.typeKey === 'manzhe' ? '' : ''
  return {
    id: activity.id,
    activityId: activity.id,
    productId: pid,
    badge: activity.type || '活动',
    title: activity.name,
    subTitle: buildActivitySubTitle(activity),
    price,
    priceLabel: activity.typeKey === 'manzhe' ? '折' : '',
    desc: buildActivityDesc(activity),
    img,
    typeKey: activity.typeKey,
    status: activity.status,
    discount: activity.discount
  }
}

export function buildActivityInfoRows(activity) {
  if (!activity) return []
  return [
    { label: '活动类型', value: activity.type || '活动' },
    { label: '活动状态', value: activity.status || '' },
    { label: '开始时间', value: activity.startTime || '' },
    { label: '结束时间', value: activity.endTime || '' },
    { label: '活动折扣', value: activity.discount || '' },
    { label: '限购次数', value: String(activity.limit || 0) },
    { label: '剩余库存', value: String(activity.stock || 0) }
  ]
}

export function buildActivitySections(activity) {
  if (!activity) return []
  const productScope = activity.productScopeDetail
    ? `${activity.productScope}（${activity.productScopeDetail}）`
    : activity.productScope || '全部商品'
  const userScope = activity.userScopeDetail
    ? `${activity.userScope}（${activity.userScopeDetail}）`
    : activity.userScope || '全部用户'
  return [
    {
      title: '活动说明',
      body: `${activity.name}是阅己平台${activity.type || '促销'}活动，${activity.discount || ''}。活动期间满足条件即可享受对应优惠。`
    },
    {
      title: '参与规则',
      body: `每人限购 ${activity.limit || 1} 次，活动库存 ${activity.stock || 0} 份。已有 ${activity.join || 0} 人成功参与。`
    },
    {
      title: '适用商品',
      body: productScope
    },
    {
      title: '适用用户',
      body: userScope
    },
    {
      title: '温馨提示',
      body: '优惠不可与部分券叠加使用；退货后优惠名额不返还；最终以结算页显示价格为准。如有疑问请联系在线客服。'
    }
  ]
}

export function activityMatchesProduct(activity, productId, productMeta = {}) {
  if (!activity || activity.enabled === false) return false
  if (activity.statusKey === 'ended') return false
  const typeKey = resolveTypeKey(activity)
  if (typeKey !== 'manjian' && typeKey !== 'manzhe') return false

  const scope = activity.productScope || '全部商品'
  const pid = String(productId || '')
  const detail = String(activity.productScopeDetail || '')

  if (scope === '全部商品') return true

  if (scope === '指定商品') {
    if (!detail && !pid) return false
    if (detail && pid && detail.indexOf(pid) >= 0) return true
    const urlMatch = detail.match(/[?&]id=([^&|#\s]+)/i)
    if (urlMatch && urlMatch[1] === pid) return true
    return false
  }

  if (scope === '指定分类') {
    const cats = [
      productMeta.cat1,
      productMeta.cat2,
      productMeta.cat3,
      productMeta.brand,
      productMeta.subTitle
    ].filter(Boolean).map(String)
    if (!detail) return cats.length > 0
    return cats.some((c) => detail.indexOf(c) >= 0)
  }

  return false
}

export function mapActivityToCoupon(activity) {
  const typeKey = resolveTypeKey(activity)
  const discount = activity.discount || ''
  return {
    id: activity.id,
    activityId: activity.id,
    type: activity.type || '优惠',
    typeKey,
    title: activity.name || '',
    discount,
    tag: formatCouponTag(discount, typeKey),
    desc: buildActivitySubTitle(activity),
    limit: activity.limit || 0,
    stock: activity.stock || 0,
    startTime: activity.startTime || '',
    endTime: activity.endTime || '',
    productScope: activity.productScope || '',
    claimed: false
  }
}

export function isOngoingActivity(activity) {
  if (!activity) return false
  return activity.statusKey === 'ongoing' || activity.status === '进行中'
}

function scopePriority(scope) {
  if (scope === '指定商品') return 3
  if (scope === '指定分类') return 2
  return 1
}

function sortCouponsForProduct(coupons) {
  return coupons.slice().sort((a, b) => {
    const diff = scopePriority(b.productScope) - scopePriority(a.productScope)
    if (diff !== 0) return diff
    return 0
  })
}

export function getCouponsForProduct(productId, productMeta = {}) {
  return sortCouponsForProduct(
    loadActivityList()
      .filter((a) => isOngoingActivity(a) && activityMatchesProduct(a, productId, productMeta))
      .map((a) => mapActivityToCoupon(a))
  )
}

export function getPrimaryCouponTag(productId, productMeta = {}) {
  const coupons = getCouponsForProduct(productId, productMeta)
  return coupons.length ? coupons[0].tag : ''
}

function buildClaimedCouponObj(c) {
  const rule = parseDiscountRule(c.discount, c.typeKey)
  return {
    ...c,
    rule,
    tag: rule?.tag || c.tag || c.discount
  }
}

/** 当前商品已领取且可用的优惠券（同类型内取优惠力度最大） */
export function getClaimedCouponForProduct(productId, productMeta = {}, basePrice) {
  const claimed = loadClaimedCouponIds()
  const coupons = getCouponsForProduct(productId, productMeta)
  if (!coupons.length) return null
  const primaryType = coupons[0].typeKey || resolveTypeKey(coupons[0])
  const applicable = coupons.filter((c) => claimed.includes(String(c.id)))
  if (!applicable.length) return null
  let pool = primaryType
    ? applicable.filter((c) => (c.typeKey || resolveTypeKey(c)) === primaryType)
    : applicable
  if (!pool.length) pool = applicable

  let best = null
  let bestPrice = null
  const numericBase = basePrice != null ? Number(basePrice) : null
  for (let i = 0; i < pool.length; i++) {
    const c = pool[i]
    const obj = buildClaimedCouponObj(c)
    if (numericBase != null && !Number.isNaN(numericBase)) {
      const price = calcDiscountedPrice(numericBase, obj)
      if (best === null || price < bestPrice) {
        best = obj
        bestPrice = price
      }
    } else if (!best) {
      best = obj
    }
  }
  return best
}

/** 详情/列表展示用：已领取则显示生效券，否则显示首个可领券 */
export function getDisplayCouponTag(productId, productMeta = {}, basePrice) {
  const claimed = getClaimedCouponForProduct(productId, productMeta, basePrice)
  if (claimed) return claimed.tag || claimed.discount || ''
  return getPrimaryCouponTag(productId, productMeta)
}

export function resolveTypeKey(activity) {
  if (!activity) return ''
  if (activity.typeKey) return activity.typeKey
  const t = String(activity.type || '')
  if (t.includes('满折') || t === 'manzhe') return 'manzhe'
  if (t.includes('满减') || t === 'manjian') return 'manjian'
  return ''
}

/** 解析满减/满折规则（取 discount 文案中第一档） */
export function parseDiscountRule(discount, typeKey = '') {
  const text = String(discount || '').replace(/\s*等\d+档.*$/, '').trim()
  let key = typeKey || ''
  if (!key) {
    if (/打\s*[\d.]+\s*折/.test(text)) key = 'manzhe'
    else if (/减\s*\d/.test(text)) key = 'manjian'
  }
  if (key === 'manzhe') {
    const m = text.match(/满\s*(\d+(?:\.\d+)?)\s*打\s*([\d.]+)\s*折/)
    if (m) {
      return {
        typeKey: 'manzhe',
        threshold: Number(m[1]),
        rate: Number(m[2]) / 10,
        tag: `满${m[1]}打${m[2]}折`
      }
    }
    return null
  }
  const mj = text.match(/满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/)
  if (mj) {
    return {
      typeKey: 'manjian',
      threshold: Number(mj[1]),
      reduce: Number(mj[2]),
      tag: `满${mj[1]}减${mj[2]}`
    }
  }
  return null
}

export function formatCouponTag(discount, typeKey = '') {
  const rule = parseDiscountRule(discount, typeKey)
  if (rule) return rule.tag
  return String(discount || '').replace(/\s*等\d+档.*$/, '').trim()
}

/** 券后单价 */
export function calcDiscountedPrice(basePrice, coupon) {
  const price = Number(basePrice) || 0
  if (!coupon) return price
  const rule = coupon.rule || parseDiscountRule(coupon.discount, coupon.typeKey)
  if (!rule) return price
  if (rule.typeKey === 'manzhe') {
    if (price >= rule.threshold) return Math.max(0, Math.round(price * rule.rate))
    return price
  }
  if (price >= rule.threshold) return Math.max(0, price - rule.reduce)
  return price
}

export function isCouponClaimed(couponId) {
  return loadClaimedCouponIds().includes(String(couponId || ''))
}

export function getProductMetaFromCartItem(item) {
  if (!item) return {}
  const sub = String(item.subTitle || '')
  const brand = item.brand || sub.split('·')[0]?.trim() || ''
  return {
    cat1: item.cat1 || '',
    cat2: item.cat2 || '',
    cat3: item.cat3 || item.spec || '',
    brand,
    subTitle: item.subTitle || ''
  }
}

export function applyClaimedCouponToPricing(basePrice, productId, productMeta = {}) {
  const numericBase = Number(basePrice) || 0
  const coupon = getClaimedCouponForProduct(productId, productMeta, numericBase)
  if (!coupon) {
    return {
      basePrice: numericBase,
      price: numericBase,
      couponId: '',
      couponTag: '',
      originPrice: String(Math.round(numericBase * 1.35))
    }
  }
  const discounted = calcDiscountedPrice(numericBase, coupon)
  return {
    basePrice: numericBase,
    price: discounted,
    couponId: String(coupon.id),
    couponTag: coupon.tag || coupon.discount || '',
    originPrice: String(numericBase)
  }
}

export const CLAIMED_COUPON_KEY = 'zhuangyan_claimed_coupons_v1'

export function loadClaimedCouponIds() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(CLAIMED_COUPON_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) return parsed.map(String)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CLAIMED_COUPON_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(String)
      }
    }
  } catch (e) { /* ignore */ }
  return []
}

export function saveClaimedCouponIds(ids) {
  const snapshot = (ids || []).map(String)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(CLAIMED_COUPON_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAIMED_COUPON_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  return snapshot
}

export function claimCoupon(couponId) {
  const id = String(couponId || '')
  if (!id) return loadClaimedCouponIds()
  const ids = loadClaimedCouponIds()
  if (!ids.includes(id)) ids.push(id)
  return saveClaimedCouponIds(ids)
}

export function getCouponsForProductWithClaim(productId, productMeta = {}) {
  const claimed = loadClaimedCouponIds()
  return getCouponsForProduct(productId, productMeta).map((c) => ({
    ...c,
    claimed: claimed.includes(String(c.id))
  }))
}

export function mapActivityToDetail(activity) {
  if (!activity) return null
  const pid = resolveActivityProductId(activity)
  const img = resolveActivityCover(activity)
  const price = extractActivityDisplayPrice(activity)
  return {
    id: activity.id,
    typeKey: activity.typeKey,
    productId: pid,
    user: '阅己活动君',
    avatar: getUserAvatar('阅己活动君'),
    tags: `${activity.type} · ${activity.status} · ${activity.productScope}`,
    title: activity.name,
    subTitle: activity.discount,
    price,
    priceLabel: activity.typeKey === 'manzhe' ? '折' : '',
    originPrice: '',
    score: '4.9',
    reviewCount: activity.join || 0,
    viewCount: activity.view || 0,
    stock: activity.stock || 0,
    desc: buildActivityDesc(activity) + `。活动时间 ${activity.startTime} 至 ${activity.endTime}。`,
    img,
    images: getProductImages(pid, activity.name, 3),
    infoRows: buildActivityInfoRows(activity),
    sections: buildActivitySections(activity)
  }
}

export function getActivityById(id) {
  const activity = loadActivityList().find((a) => String(a.id) === String(id))
  if (!activity) {
    const fallback = filterActivitiesForDiscover(loadActivityList())[0]
    return mapActivityToDetail(fallback) || mapActivityToDetail(ACTIVITY_SEED_LIST[2])
  }
  return mapActivityToDetail(activity)
}

/** @deprecated 保留兼容，请用 loadActivityList */
export const activityList = ACTIVITY_SEED_LIST
