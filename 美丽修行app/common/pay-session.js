/** 支付流程临时会话（确认订单 → 输入密码 → 支付成功） */
export const PAY_SESSION_KEY = 'zhuangyan_pay_session_v1'

function readStorage(key) {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(key)
      if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) { /* ignore */ }
  return null
}

function writeStorage(key, value) {
  try {
    const payload = JSON.stringify(value)
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(key, payload)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, payload)
    }
  } catch (e) { /* ignore */ }
}

function removeStorage(key) {
  try {
    if (typeof uni !== 'undefined' && uni.removeStorageSync) {
      uni.removeStorageSync(key)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key)
    }
  } catch (e) { /* ignore */ }
}

export function savePaySession(session) {
  writeStorage(PAY_SESSION_KEY, {
    items: session.items || [],
    mode: session.mode || 'buyNow',
    payMethod: session.payMethod || '微信支付',
    totalPrice: Number(session.totalPrice) || 0,
    savedAt: Date.now()
  })
}

export function loadPaySession() {
  const data = readStorage(PAY_SESSION_KEY)
  if (!data || !Array.isArray(data.items) || !data.items.length) return null
  return data
}

export function clearPaySession() {
  removeStorage(PAY_SESSION_KEY)
}
