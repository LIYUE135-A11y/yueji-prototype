/** App 退款申请 → 运营端售后管理同步（ES Module） */

export const AFTERSALE_STORAGE_KEY = 'zhuangyan_profile_aftersales_v1'
export const AFTERSALE_SYNC_EVENT = 'profile-aftersale-sync'

const DEFAULT_USER = {
  id: 'U20240076',
  nickname: '野稗子',
  avatarBg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)',
  avatarText: '野'
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatApplyTime(ts) {
  const d = new Date(ts || Date.now())
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function formatAfterId(ts) {
  const d = new Date(ts || Date.now())
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `SH${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${rand}`
}

function refundMethodFromPay(payMethod) {
  const m = String(payMethod || '')
  if (m.includes('支付宝')) return { refundMethod: '支付宝', refundKey: 'alipay' }
  if (m.includes('银行卡')) return { refundMethod: '银行卡', refundKey: 'card' }
  if (m.includes('余额')) return { refundMethod: '余额', refundKey: 'balance' }
  if (m.includes('微信')) return { refundMethod: '微信', refundKey: 'wechat' }
  return { refundMethod: '原路退回', refundKey: 'original' }
}

function buildProdName(items) {
  if (!items?.length) return '商品'
  const first = items[0]
  if (items.length === 1) return first.title || '商品'
  return `${first.title || '商品'} 等${items.length}件`
}

function cloneAftersale(row) {
  return {
    id: row.id,
    orderId: row.orderId || '',
    afterType: row.afterType || '仅退款',
    afterTypeKey: row.afterTypeKey || 'refund',
    reason: row.reason || 'App申请退款',
    prodName: row.prodName || '',
    prodSpec: row.prodSpec || '',
    prodCover: row.prodCover || '',
    prodMerchant: row.prodMerchant || '阅己美妆旗舰店',
    userName: row.userName || DEFAULT_USER.nickname,
    userId: row.userId || DEFAULT_USER.id,
    userAvatarBg: row.userAvatarBg || DEFAULT_USER.avatarBg,
    userAvatarText: row.userAvatarText || DEFAULT_USER.avatarText,
    amount: row.amount != null ? Number(row.amount) : 0,
    applyTime: row.applyTime || formatApplyTime(),
    status: row.status || '退款中',
    statusKey: row.statusKey || 'refunding',
    handler: row.handler || '',
    handleTime: row.handleTime || '',
    proof: Array.isArray(row.proof) ? row.proof.slice() : [],
    refundMethod: row.refundMethod || '',
    refundKey: row.refundKey || '',
    remark: row.remark || '',
    _fromProfile: row._fromProfile !== false,
    _profileOrderId: row._profileOrderId || '',
    _profileAftersaleId: row._profileAftersaleId || row.id || ''
  }
}

export function mapOrderToAftersaleRow(order, user = DEFAULT_USER) {
  const items = order.items || []
  const first = items[0] || {}
  const refund = refundMethodFromPay(order.payMethod)
  const applyTs = order.refundAppliedAt || Date.now()
  return cloneAftersale({
    id: order.aftersaleId || formatAfterId(applyTs),
    orderId: String(order.orderNo || order.id || ''),
    afterType: '仅退款',
    afterTypeKey: 'refund',
    reason: order.refundReason || 'App申请退款',
    prodName: buildProdName(items),
    prodSpec: first.spec || first.subTitle || '标准装',
    prodCover: first.img || '',
    prodMerchant: '阅己美妆旗舰店',
    userName: user.nickname,
    userId: user.id,
    userAvatarBg: user.avatarBg,
    userAvatarText: user.avatarText,
    amount: Number(order.totalPrice) || 0,
    applyTime: formatApplyTime(applyTs),
    status: '退款中',
    statusKey: 'refunding',
    handler: '',
    handleTime: '',
    proof: [],
    refundMethod: refund.refundMethod,
    refundKey: refund.refundKey,
    remark: 'App个人中心 · 买家申请退款，待运营审核处理。',
    _fromProfile: true,
    _profileOrderId: String(order.id || ''),
    _profileAftersaleId: String(order.aftersaleId || '')
  })
}

export function loadAftersaleList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(AFTERSALE_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) return parsed.map(cloneAftersale)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(AFTERSALE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed.map(cloneAftersale)
      }
    }
  } catch (e) { /* ignore */ }
  return []
}

export function saveAftersaleList(list) {
  const snapshot = (list || []).map(cloneAftersale)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(AFTERSALE_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AFTERSALE_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  broadcastAftersaleList(snapshot)
  return snapshot
}

export function broadcastAftersaleList(list) {
  if (typeof window === 'undefined') return
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: AFTERSALE_SYNC_EVENT,
        aftersales: list || loadAftersaleList()
      }, '*')
    }
  } catch (e) { /* ignore */ }
}

export function upsertAftersaleFromRefundOrder(order, user = DEFAULT_USER) {
  if (!order) return null
  const list = loadAftersaleList()
  const pid = String(order.id || '')
  const orderNo = String(order.orderNo || '')
  const existingIdx = list.findIndex(
    (row) => String(row._profileOrderId) === pid || String(row.orderId) === orderNo
  )
  const payload = {
    ...order,
    refundAppliedAt: Date.now(),
    aftersaleId: existingIdx >= 0 ? list[existingIdx].id : undefined
  }
  const row = mapOrderToAftersaleRow(payload, user)
  row._profileAftersaleId = row.id
  if (existingIdx >= 0) {
    list[existingIdx] = row
  } else {
    list.unshift(row)
  }
  saveAftersaleList(list)
  return row
}
