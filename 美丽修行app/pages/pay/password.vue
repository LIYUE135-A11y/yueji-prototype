<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">输入支付密码</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
    <view class="content">
      <view class="pay-brand">
        <view class="pay-brand-icon" :class="brandClass">{{ brandIcon }}</view>
        <text class="pay-brand-name">{{ payMethod }}</text>
      </view>

      <view class="amount-wrap">
        <text class="amount-label">支付金额</text>
        <text class="amount-value">¥{{ displayAmount }}</text>
      </view>

      <view class="pwd-box" @tap="focusInput">
        <view
          v-for="idx in 6"
          :key="idx"
          class="pwd-dot"
          :class="{ filled: password.length >= idx }"
        ></view>
      </view>

      <input
        class="pwd-input"
        type="number"
        password
        maxlength="6"
        :focus="inputFocus"
        :value="password"
        @input="onPasswordInput"
        @confirm="submitPay"
      />

      <text v-if="errorTip" class="error-tip">{{ errorTip }}</text>

      <view class="submit-btn" :class="{ disabled: password.length < 6 || submitting }" @tap="submitPay">
        {{ submitting ? '支付中…' : '确认支付' }}
      </view>

      <text class="hint">演示密码：123456</text>
    </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { loadPaySession, clearPaySession } from '../../common/pay-session.js'
import { createOrderFromCart } from '../../common/order-data.js'
import { clearCart, clearCheckoutItems } from '../../common/cart-data.js'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'

const DEMO_PASSWORD = '123456'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const displayAmount = ref('0')
const payMethod = ref('微信支付')
const password = ref('')
const errorTip = ref('')
const submitting = ref(false)
const inputFocus = ref(true)
const checkoutMode = ref('buyNow')

const brandClass = computed(() => {
  if (payMethod.value.includes('支付宝')) return 'alipay'
  if (payMethod.value.includes('银行')) return 'bank'
  return 'wechat'
})

const brandIcon = computed(() => {
  if (payMethod.value.includes('支付宝')) return '支'
  if (payMethod.value.includes('银行')) return '卡'
  return '微'
})

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeightStyle({ navRpx: 88 })
  } catch (e) {}

  const session = loadPaySession()
  if (!session) {
    uni.showToast({ title: '支付信息已失效', icon: 'none' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
    return
  }

  checkoutMode.value = session.mode || 'buyNow'
  payMethod.value = session.payMethod || '微信支付'
  displayAmount.value = String(query.amount || session.totalPrice || 0)
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function focusInput() {
  inputFocus.value = false
  setTimeout(() => { inputFocus.value = true }, 20)
}

function onPasswordInput(e) {
  const val = String(e.detail.value || '').replace(/\D/g, '').slice(0, 6)
  password.value = val
  errorTip.value = ''
  if (val.length === 6) {
    setTimeout(() => submitPay(), 80)
  }
}

function submitPay() {
  if (submitting.value || password.value.length < 6) return
  if (password.value !== DEMO_PASSWORD) {
    errorTip.value = '支付密码错误，请重试'
    password.value = ''
    focusInput()
    return
  }

  const session = loadPaySession()
  if (!session || !session.items.length) {
    uni.showToast({ title: '支付信息已失效', icon: 'none' })
    return
  }

  submitting.value = true
  createOrderFromCart(session.items, session.payMethod)
  if (session.mode === 'cart') {
    clearCart()
  }
  clearCheckoutItems()
  const amount = displayAmount.value
  clearPaySession()

  setTimeout(() => {
    submitting.value = false
    uni.redirectTo({
      url: `/pages/pay/success?amount=${encodeURIComponent(amount)}`,
      fail() {
        uni.reLaunch({
          url: `/pages/pay/success?amount=${encodeURIComponent(amount)}`,
          fail() {
            uni.showToast({ title: '打开支付成功页失败', icon: 'none' })
          }
        })
      }
    })
  }, 400)
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f5f6fa;
}

.page-scroll {
  flex: 1;
  min-height: 0;
}

.status-bar,
.nav-bar {
  background: #fff;
  flex-shrink: 0;
}

.nav-bar {
  height: 88rpx;
  padding: 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn,
.nav-placeholder {
  width: 72rpx;
  height: 72rpx;
}

.nav-back {
  font-size: 56rpx;
  color: #222;
  line-height: 72rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}

.content {
  padding: 80rpx 48rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.pay-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.pay-brand-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.pay-brand-icon.wechat { background: #07c160; }
.pay-brand-icon.alipay { background: #1677ff; }
.pay-brand-icon.bank { background: #ff9500; }

.pay-brand-name {
  font-size: 28rpx;
  color: #666;
}

.amount-wrap {
  margin-top: 56rpx;
  text-align: center;
}

.amount-label {
  display: block;
  font-size: 26rpx;
  color: #999;
}

.amount-value {
  display: block;
  margin-top: 12rpx;
  font-size: 72rpx;
  font-weight: 700;
  color: #222;
  letter-spacing: 1rpx;
}

.pwd-box {
  margin-top: 64rpx;
  display: flex;
  gap: 20rpx;
}

.pwd-dot {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #fff;
  border: 2rpx solid #e8e4f0;
  position: relative;
}

.pwd-dot.filled::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16rpx;
  height: 16rpx;
  margin: -8rpx 0 0 -8rpx;
  border-radius: 50%;
  background: #222;
}

.pwd-input {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  width: 1px;
  height: 1px;
}

.error-tip {
  margin-top: 24rpx;
  font-size: 24rpx;
  color: #ff5b6b;
}

.submit-btn {
  margin-top: 48rpx;
  width: 100%;
  height: 88rpx;
  border-radius: 44rpx;
  background: $primary-color;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.disabled {
  opacity: 0.45;
}

.hint {
  margin-top: 24rpx;
  font-size: 22rpx;
  color: #bbb;
}
</style>
