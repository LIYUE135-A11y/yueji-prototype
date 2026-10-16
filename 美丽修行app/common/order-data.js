import { mapProductToCartItem } from './cart-data.js'
import { upsertAftersaleFromRefundOrder } from './aftersale-data.js'

/** 我的 · 个人订单（个人功能入口） */
export const ORDER_STORAGE_KEY = 'zhuangyan_profile_orders_v1'
export const ORDER_UPDATE_EVENT = 'profile-order-updated'

function cloneItem(item) {
  return {
    productId: String(item.productId || item.id || ''),
    title: item.title || item.name || '',
    subTitle: item.subTitle || '',
    img: item.img || item.cover || '',
    price: String(item.price != null ? item.price : '0'),
    originPrice: item.originPrice != null ? String(item.originPrice) : '',
    spec: item.spec || '标准装',
    quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    couponTag: item.couponTag ? String(item.couponTag) : ''
  }
}

function cloneOrder(order) {
  return {
    id: String(order.id || ''),
    orderNo: order.orderNo || '',
    status: order.status || '待发货',
    statusKey: order.statusKey || 'await',
    payStatus: order.payStatus || '已支付',
    payStatusKey: order.payStatusKey || 'paid',
    delivery: order.delivery || '普通快递',
    deliveryStatus: order.deliveryStatus || '待发货',
    deliveryStatusKey: order.deliveryStatusKey || 'await',
    payMethod: order.payMethod || '微信支付',
    totalPrice: Number(order.totalPrice) || 0,
    itemCount: Number(order.itemCount) || 0,
    createdAt: order.createdAt || Date.now(),
    items: (order.items || []).map(cloneItem),
    reviewed: !!order.reviewed,
    reviewScore: Number(order.reviewScore) || 0,
    reviewText: order.reviewText || ''
  }
}

function normalizeOrder(order) {
  const o = cloneOrder(order)
  if (order.status === '已支付') {
    o.payStatus = '已支付'
    o.payStatusKey = 'paid'
    o.status = '待发货'
    o.statusKey = 'await'
  } else if (order.statusKey === 'paid' || order.status === '已付款') {
    o.payStatus = '已支付'
    o.payStatusKey = 'paid'
    o.status = '已付款'
    o.statusKey = 'paid'
  }
  return o
}

export function loadOrderList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(ORDER_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) return parsed.map(normalizeOrder)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(normalizeOrder)
      }
    }
  } catch (e) { /* ignore */ }
  return []
}

export function saveOrderList(list) {
  const snapshot = (list || []).map(normalizeOrder)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(ORDER_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  notifyOrderUpdated(snapshot)
  return snapshot
}

export const ORDER_SYNC_EVENT = 'profile-order-sync'

export function broadcastOrderList(list) {
  if (typeof window === 'undefined') return
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: ORDER_SYNC_EVENT,
        orders: list || loadOrderList()
      }, '*')
    }
  } catch (e) { /* ignore */ }
}

export function notifyOrderUpdated(list) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(ORDER_UPDATE_EVENT, { detail: list || loadOrderList() }))
  } catch (e) { /* ignore */ }
  broadcastOrderList(list)
}

export function formatOrderNo() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `DD${y}${m}${day}${rand}`
}

export function formatOrderTime(ts) {
  const d = new Date(ts || Date.now())
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

export function createOrderFromCart(cartItems, payMethod = '微信支付') {
  const items = (cartItems || []).map(cloneItem)
  if (!items.length) return null
  const total = items.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 1
    return sum + price * qty
  }, 0)
  const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
  const order = cloneOrder({
    id: 'ORD' + Date.now(),
    orderNo: formatOrderNo(),
    payStatus: '已支付',
    payStatusKey: 'paid',
    status: '待发货',
    statusKey: 'await',
    delivery: '普通快递',
    deliveryStatus: '待发货',
    deliveryStatusKey: 'await',
    payMethod,
    totalPrice: Math.round(total),
    itemCount: count,
    createdAt: Date.now(),
    items
  })
  const list = loadOrderList()
  list.unshift(order)
  saveOrderList(list)
  return order
}

export function createOrderFromProduct(product, payMethod = '微信支付') {
  const item = mapProductToCartItem(product)
  if (!item) return null
  return createOrderFromCart([item], payMethod)
}

export function getOrderCount() {
  return loadOrderList().length
}

function matchOrderId(order, orderId) {
  return String(order.id) === String(orderId) || String(order.orderNo) === String(orderId)
}

function getLogisticsTip(order) {
  const company = order.delivery || '普通快递'
  const ds = order.deliveryStatus || '待发货'
  const key = order.deliveryStatusKey || 'await'
  if (key === 'await') return `物流状态：${company} · ${ds}（与运营端同步）`
  if (key === 'picked') return `物流状态：${company} · ${ds}，快递员已揽收`
  if (key === 'shipping') return `物流状态：${company} · ${ds}，包裹运输中`
  if (key === 'delivering') return `物流状态：${company} · ${ds}，正在派送中`
  if (key === 'signed' || key === 'done') return `物流状态：${company} · ${ds}`
  return `物流状态：${company} · ${ds}`
}

export function applyOrderAction(orderId, action, extra = {}) {
  const list = loadOrderList()
  const target = list.find((o) => matchOrderId(o, orderId))
  if (!target) return { changed: false, tip: '订单不存在' }

  if (action === 'logistics') {
    return { changed: false, tip: getLogisticsTip(target), order: target }
  }

  const nextList = list.map((o) => {
    if (!matchOrderId(o, orderId)) return o
    const next = { ...o }
    if (action === 'refund' || action === 'aftersale') {
      next.status = '退款中'
      next.statusKey = 'refunding'
    } else if (action === 'confirm') {
      next.status = '已完成'
      next.statusKey = 'done'
      next.deliveryStatus = '已签收'
      next.deliveryStatusKey = 'signed'
    } else if (action === 'ship') {
      next.status = '确认收货'
      next.statusKey = 'receive'
      next.deliveryStatus = '运输中'
      next.deliveryStatusKey = 'shipping'
    } else if (action === 'review') {
      next.reviewed = true
      next.reviewScore = Number(extra.score) || 5
      next.reviewText = extra.text || ''
      next.status = '已完成'
      next.statusKey = 'done'
    } else if (action === 'pay') {
      next.payStatus = '已支付'
      next.payStatusKey = 'paid'
      next.status = '已付款'
      next.statusKey = 'paid'
    }
    return normalizeOrder(next)
  })

  saveOrderList(nextList)
  if (action === 'refund' || action === 'aftersale') {
    const updated = nextList.find((o) => matchOrderId(o, orderId))
    if (updated) upsertAftersaleFromRefundOrder(updated)
  }
  const tips = {
    refund: '已提交售后申请，订单状态已同步为「退款中」',
    aftersale: '已提交售后申请，订单状态已同步为「退款中」',
    confirm: '已确认收货，订单状态已同步为「已完成」',
    ship: '商家已发货，订单进入「确认收货」',
    review: '评价成功，感谢你的反馈',
    pay: '支付成功，订单状态为「已付款」'
  }
  return { changed: true, tip: tips[action] || '操作成功' }
}

export function getOrderDisplayStatus(order) {
  const o = normalizeOrder(order)
  const status = String(o.status || '')
  const key = String(o.statusKey || '')
  if (status.includes('待付款')) return '待付款'
  if (status === '已付款') return '已付款'
  if (status.includes('待发货')) return '待发货'
  if (status.includes('确认收货') || status.includes('待收货') || status.includes('已发货')) return '确认收货'
  if (status.includes('已完成')) return '已完成'
  if (key === 'pending' || key === 'unpaid') return '待付款'
  if (key === 'paid') return '已付款'
  if (key === 'await') return '待发货'
  if (key === 'receive' || key === 'shipped' || key === 'shipping' || key === 'delivering') return '确认收货'
  if (key === 'done') return '已完成'
  if (o.payStatusKey === 'unpaid') return '待付款'
  return status || '待发货'
}

export function getOrderReviewLabel(order) {
  if (getOrderDisplayStatus(order) !== '已完成') return ''
  return order.reviewed ? '已评价' : '待评价'
}

export function calcOrderCouponAfter(order) {
  const items = order.items || []
  let originSum = 0
  let hasOrigin = false
  let hasCoupon = false
  for (const it of items) {
    const qty = Number(it.quantity) || 1
    const origin = Number(it.originPrice)
    const price = Number(it.price) || 0
    if (!Number.isNaN(origin) && origin > 0) {
      originSum += origin * qty
      hasOrigin = true
      if (origin > price) hasCoupon = true
    } else {
      originSum += price * qty
    }
    if (it.couponTag) hasCoupon = true
  }
  let total = Number(order.totalPrice)
  if (Number.isNaN(total) || total < 0) total = originSum
  if (!hasCoupon && hasOrigin && originSum > total) hasCoupon = true
  if (!hasCoupon) return null
  return Math.round(total)
}
