/** 我的 · 个人购物车（个人功能入口） */

import {

  applyClaimedCouponToPricing,

  getDisplayCouponTag,

  getProductMetaFromCartItem

} from './activity-data.js'



export const CART_STORAGE_KEY = 'zhuangyan_profile_cart_v1'

export const CHECKOUT_STORAGE_KEY = 'zhuangyan_checkout_v1'

export const CART_UPDATE_EVENT = 'profile-cart-updated'



function cloneItem(item) {

  return {

    id: String(item.id || item.productId || ''),

    productId: String(item.productId || item.id || ''),

    title: item.title || item.name || '',

    subTitle: item.subTitle || '',

    img: item.img || item.cover || '',

    basePrice: item.basePrice != null ? String(item.basePrice) : '',

    price: String(item.price != null ? item.price : '0'),

    originPrice: item.originPrice != null ? String(item.originPrice) : '',

    couponId: item.couponId ? String(item.couponId) : '',

    couponTag: item.couponTag ? String(item.couponTag) : '',

    spec: item.spec || '标准装',

    brand: item.brand || '',

    cat1: item.cat1 || '',

    cat2: item.cat2 || '',

    cat3: item.cat3 || '',

    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,

    addedAt: item.addedAt || Date.now()

  }

}



export function loadCartList() {

  let list = []

  try {

    if (typeof uni !== 'undefined' && uni.getStorageSync) {

      const raw = uni.getStorageSync(CART_STORAGE_KEY)

      if (raw) {

        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

        if (Array.isArray(parsed)) list = parsed.map(cloneItem)

      }

    } else if (typeof localStorage !== 'undefined') {

      const raw = localStorage.getItem(CART_STORAGE_KEY)

      if (raw) {

        const parsed = JSON.parse(raw)

        if (Array.isArray(parsed)) list = parsed.map(cloneItem)

      }

    }

  } catch (e) { /* ignore */ }

  if (list.length) {

    let changed = false

    list.forEach((item) => {

      const meta = getProductMetaFromCartItem(item)

      const before = `${item.price}|${item.couponTag}|${item.couponId}`

      applyCouponFields(item, meta)

      if (`${item.price}|${item.couponTag}|${item.couponId}` !== before) changed = true

    })

    if (changed) saveCartList(list)

  }

  return list.map(cloneItem)

}



export function saveCartList(list) {

  const snapshot = (list || []).map(cloneItem)

  try {

    if (typeof uni !== 'undefined' && uni.setStorageSync) {

      uni.setStorageSync(CART_STORAGE_KEY, snapshot)

    }

    if (typeof localStorage !== 'undefined') {

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(snapshot))

    }

  } catch (e) { /* ignore */ }

  notifyCartUpdated(snapshot)

  return snapshot

}



export function notifyCartUpdated(list) {

  if (typeof window === 'undefined') return

  try {

    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT, { detail: list || loadCartList() }))

  } catch (e) { /* ignore */ }

}



function findIndex(list, productId, spec) {

  const pid = String(productId || '')

  const sp = spec || '标准装'

  return list.findIndex((item) => String(item.productId) === pid && (item.spec || '标准装') === sp)

}



function buildProductMeta(product) {

  if (!product) return {}

  const spec = product.spec || product.cat3 || product.cat2 || '标准装'

  return {

    cat1: product.cat1 || '',

    cat2: product.cat2 || '',

    cat3: product.cat3 || spec,

    brand: product.brand || '',

    subTitle: product.subTitle || `${product.brand || ''}${spec ? ` · ${spec}` : ''}`.trim()

  }

}



function applyCouponFields(item, productMeta) {

  const base = Number(item.basePrice || item.price) || 0

  const pricing = applyClaimedCouponToPricing(base, item.productId, productMeta)

  const displayTag = getDisplayCouponTag(item.productId, productMeta, base)

  item.basePrice = String(pricing.basePrice)

  item.price = String(pricing.price)

  item.originPrice = String(pricing.originPrice)

  item.couponId = pricing.couponId

  item.couponTag = displayTag

  return item

}



export function refreshCartCoupons(productId) {

  const list = loadCartList()

  let changed = false

  list.forEach((item) => {

    if (productId && String(item.productId) !== String(productId)) return

    const meta = getProductMetaFromCartItem(item)

    const before = `${item.price}|${item.couponTag}`

    applyCouponFields(item, meta)

    if (`${item.price}|${item.couponTag}` !== before) changed = true

  })

  return changed ? saveCartList(list) : list

}



export function mapProductToCartItem(product) {
  if (!product) return null
  const spec = product.spec || product.cat3 || product.cat2 || '标准装'
  let meta = buildProductMeta(product)
  const basePrice = product.price != null ? product.price : '0'
  let rawTitle = product.title || product.name || ''
  let promoTitle = ''
  if (/满减|满折|首单|女王节|双十一|双12|优惠券|活动券|限时/.test(String(rawTitle))) {
    promoTitle = rawTitle
    rawTitle = ''
  }
  if (!rawTitle) rawTitle = '精选美妆商品'
  const item = cloneItem({
    id: String(product.id || product.sku || ''),
    productId: String(product.id || product.sku || ''),
    title: rawTitle,
    subTitle: meta.subTitle,
    img: product.img || product.cover || product.coverUrl || '',
    basePrice: String(basePrice),
    price: String(basePrice),
    originPrice: product.originPrice != null ? String(product.originPrice) : '',
    spec,
    brand: product.brand || '',
    cat1: product.cat1 || '',
    cat2: product.cat2 || '',
    cat3: product.cat3 || spec,
    quantity: 1,
    addedAt: Date.now(),
    couponTag: product.couponTag || promoTitle || ''
  })
  applyCouponFields(item, meta)
  if (promoTitle && !item.couponTag) item.couponTag = promoTitle
  return item
}

export function addProductToCart(product) {

  const item = mapProductToCartItem(product)

  if (!item || !item.productId) return loadCartList()

  const list = loadCartList()

  const idx = findIndex(list, item.productId, item.spec)

  if (idx >= 0) {

    list[idx].quantity = (Number(list[idx].quantity) || 1) + 1

    list[idx].addedAt = Date.now()

    list[idx].title = item.title

    list[idx].subTitle = item.subTitle

    list[idx].img = item.img

    list[idx].basePrice = item.basePrice

    list[idx].price = item.price

    list[idx].originPrice = item.originPrice

    list[idx].couponId = item.couponId

    list[idx].couponTag = item.couponTag

  } else {

    list.unshift(item)

  }

  return saveCartList(list)

}



export function removeCartItem(productId, spec) {

  const pid = String(productId || '')

  const list = loadCartList().filter((item) => {

    if (String(item.productId) !== pid) return true

    if (spec && (item.spec || '标准装') !== spec) return true

    return false

  })

  return saveCartList(list)

}



export function getCartCount() {

  return loadCartList().reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)

}



export function changeCartQuantity(productId, spec, delta) {

  const list = loadCartList()

  const idx = findIndex(list, productId, spec)

  if (idx < 0) return list

  const qty = (Number(list[idx].quantity) || 1) + delta

  if (qty <= 0) return removeCartItem(productId, spec)

  list[idx].quantity = qty

  return saveCartList(list)

}



export function getCartTotalPrice() {

  return loadCartList().reduce((sum, item) => {

    const price = Number(item.price) || 0

    const qty = Number(item.quantity) || 1

    return sum + price * qty

  }, 0)

}



export function clearCart() {

  return saveCartList([])

}



export function saveCheckoutItems(items) {

  const snapshot = (items || []).map(cloneItem)

  try {

    if (typeof uni !== 'undefined' && uni.setStorageSync) {

      uni.setStorageSync(CHECKOUT_STORAGE_KEY, snapshot)

    }

    if (typeof localStorage !== 'undefined') {

      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(snapshot))

    }

  } catch (e) { /* ignore */ }

  return snapshot

}



export function loadCheckoutItems() {

  try {

    if (typeof uni !== 'undefined' && uni.getStorageSync) {

      const raw = uni.getStorageSync(CHECKOUT_STORAGE_KEY)

      if (raw) {

        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

        if (Array.isArray(parsed)) return parsed.map(cloneItem)

      }

    }

    if (typeof localStorage !== 'undefined') {

      const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY)

      if (raw) {

        const parsed = JSON.parse(raw)

        if (Array.isArray(parsed)) return parsed.map(cloneItem)

      }

    }

  } catch (e) { /* ignore */ }

  return []

}



export function clearCheckoutItems() {

  try {

    if (typeof uni !== 'undefined' && uni.removeStorageSync) {

      uni.removeStorageSync(CHECKOUT_STORAGE_KEY)

    }

    if (typeof localStorage !== 'undefined') {

      localStorage.removeItem(CHECKOUT_STORAGE_KEY)

    }

  } catch (e) { /* ignore */ }

}

