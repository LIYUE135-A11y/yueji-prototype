<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">确认订单</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="card address-card">
        <view class="addr-pin">
          <text class="addr-pin-icon">📍</text>
        </view>
        <view class="addr-body">
          <view class="addr-row">
            <text class="addr-name">{{ address.name }}</text>
            <text class="addr-phone">{{ address.phone }}</text>
            <text class="addr-tag">默认</text>
          </view>
          <text class="addr-text">{{ address.full }}</text>
        </view>
        <text class="addr-arrow">›</text>
      </view>

      <view v-if="orderItems.length" class="card order-card">
        <text class="store-name">{{ storeName }}</text>

        <view
          v-for="(row, idx) in orderItems"
          :key="row.productId + (row.spec || '') + idx"
          class="goods-row"
        >
          <image class="goods-img" :src="row.img" mode="aspectFill" />
          <view class="goods-body">
            <text class="goods-title">{{ row.title }}</text>
            <text v-if="row.couponTag" class="goods-tag">{{ row.couponTag }}</text>
            <view class="goods-meta">
              <text class="goods-price">¥{{ row.price }}</text>
              <view class="goods-stepper">
                <view class="step-btn" @tap="onMinus(row)">−</view>
                <text class="step-num">{{ row.quantity || 1 }}</text>
                <view class="step-btn" @tap="onPlus(row)">+</view>
              </view>
            </view>
          </view>
        </view>

        <view class="bill-row">
          <text class="bill-label">商品金额</text>
          <text class="bill-value">¥{{ goodsAmount }}</text>
        </view>
        <view class="bill-row">
          <text class="bill-label">运费</text>
          <text class="bill-value free">包邮</text>
        </view>
        <view class="bill-row bill-total">
          <text class="bill-label">实付金额</text>
          <text class="bill-value highlight">¥{{ totalPrice }}</text>
        </view>
      </view>

      <view class="card pay-card">
        <text class="pay-card-title">支付方式</text>
        <view class="pay-select" @tap="payMethodOpen = !payMethodOpen">
          <view class="pay-row-left">
            <view class="pay-icon" :class="currentMethod.iconClass">{{ currentMethod.icon }}</view>
            <text>{{ currentMethod.label }}</text>
          </view>
          <text class="pay-arrow" :class="{ open: payMethodOpen }">›</text>
        </view>
        <view v-if="payMethodOpen" class="pay-dropdown">
          <view
            v-for="method in payMethods"
            :key="method.value"
            class="pay-option"
            :class="{ active: payMethod === method.value }"
            @tap.stop="selectPayMethod(method.value)"
          >
            <view class="pay-row-left">
              <view class="pay-icon" :class="method.iconClass">{{ method.icon }}</view>
              <text>{{ method.label }}</text>
            </view>
            <text v-if="payMethod === method.value" class="pay-check">✓</text>
          </view>
        </view>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>

    <view class="footer">
      <view class="footer-total">
        <text class="footer-label">实付 </text>
        <text class="footer-price">¥{{ totalPrice }}</text>
      </view>
      <view class="pay-btn" @tap="confirmPay">立即支付</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductById } from '../../common/product-data.js'
import {
  mapProductToCartItem,
  loadCheckoutItems,
  loadCartList,
  clearCheckoutItems,
  saveCheckoutItems,
  changeCartQuantity
} from '../../common/cart-data.js'
import { savePaySession } from '../../common/pay-session.js'

const DEFAULT_ADDRESS = {
  name: '野稗子',
  phone: '138****8888',
  full: '上海市 浦东新区 张江高科技园区碧波路888号 3号楼502室'
}

const PAY_METHODS = [
  { value: '微信支付', label: '微信支付', icon: '微', iconClass: 'wechat' },
  { value: '支付宝支付', label: '支付宝支付', icon: '支', iconClass: 'alipay' },
  { value: '银行卡支付', label: '银行卡支付', icon: '卡', iconClass: 'bank' }
]

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const orderItems = ref([])
const checkoutMode = ref('buyNow')
const payMethods = PAY_METHODS
const payMethod = ref('微信支付')
const payMethodOpen = ref(false)
const address = ref({ ...DEFAULT_ADDRESS })

const storeName = computed(() => '美修自营旗舰店')

const currentMethod = computed(() => {
  return payMethods.find((m) => m.value === payMethod.value) || payMethods[0]
})

const goodsAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    const price = Number(item.price) || 0
    const qty = Number(item.quantity) || 1
    return sum + Math.round(price * qty)
  }, 0)
})

const totalPrice = computed(() => goodsAmount.value)

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const navH = 44
  const footerH = 64
  const safe = info.safeAreaInsets?.bottom || 0
  return info.windowHeight - statusBar - navH - footerH - safe
}

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}

  if (query.from === 'cart') {
    checkoutMode.value = 'cart'
    orderItems.value = loadCheckoutItems()
  } else {
    checkoutMode.value = 'buyNow'
    // 优先使用详情页预写入的结算清单
    const prepared = loadCheckoutItems()
    if (prepared && prepared.length && (query.from === 'buyNow' || query.productId || query.id)) {
      const pid = String(query.productId || query.id || '')
      if (!pid || prepared.some((it) => String(it.productId) === pid || String(it.id) === pid)) {
        orderItems.value = prepared
      }
    }
    if (!orderItems.value.length) {
      const fallback = {
        title: decodeURIComponent(query.title || ''),
        subTitle: decodeURIComponent(query.subTitle || ''),
        img: decodeURIComponent(query.img || ''),
        desc: decodeURIComponent(query.desc || ''),
        price: decodeURIComponent(query.price || ''),
        brand: decodeURIComponent(query.brand || ''),
        spec: decodeURIComponent(query.spec || '')
      }
      const product = getProductById(query.productId || query.id || 'p1', fallback)
      if (fallback.price) product.price = fallback.price
      if (fallback.brand) product.brand = fallback.brand
      if (fallback.spec) product.spec = fallback.spec
      if (fallback.img) product.img = fallback.img
      orderItems.value = [mapProductToCartItem(product)]
    }
  }
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function selectPayMethod(value) {
  payMethod.value = value
  payMethodOpen.value = false
}

function onMinus(row) {
  if (checkoutMode.value === 'cart') {
    changeCartQuantity(row.productId, row.spec, -1)
    orderItems.value = loadCartList()
    saveCheckoutItems(orderItems.value)
    if (!orderItems.value.length) {
      uni.navigateBack({ delta: 1 })
    }
    return
  }
  const qty = Number(row.quantity) || 1
  if (qty <= 1) return
  row.quantity = qty - 1
}

function onPlus(row) {
  if (checkoutMode.value === 'cart') {
    changeCartQuantity(row.productId, row.spec, 1)
    orderItems.value = loadCartList()
    saveCheckoutItems(orderItems.value)
    return
  }
  row.quantity = (Number(row.quantity) || 1) + 1
}

function confirmPay() {
  if (!orderItems.value.length) return
  savePaySession({
    items: orderItems.value,
    mode: checkoutMode.value,
    payMethod: payMethod.value,
    totalPrice: totalPrice.value
  })
  uni.navigateTo({
    url: `/pages/pay/password?amount=${encodeURIComponent(totalPrice.value)}`,
    fail() {
      uni.showToast({ title: '打开支付页失败', icon: 'none' })
    }
  })
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

.status-bar,
.nav-bar {
  background: #ffffff;
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
  color: #222222;
  line-height: 72rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
}

.scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.address-card {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  gap: 16rpx;
}

.addr-pin {
  flex-shrink: 0;
  width: 48rpx;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4rpx;
}

.addr-pin-icon {
  font-size: 36rpx;
  line-height: 1;
}

.addr-body {
  flex: 1;
  min-width: 0;
}

.addr-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.addr-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #222222;
}

.addr-phone {
  font-size: 28rpx;
  color: #333333;
}

.addr-tag {
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  background: #f3f0fa;
  font-size: 20rpx;
  color: $primary-color;
}

.addr-text {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.addr-arrow {
  flex-shrink: 0;
  font-size: 40rpx;
  color: #cccccc;
  line-height: 1;
}

.order-card {
  padding: 24rpx;
}

.store-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #222222;
  margin-bottom: 20rpx;
}

.goods-row {
  display: flex;
  gap: 20rpx;
  padding-bottom: 24rpx;
}

.goods-img {
  width: 144rpx;
  height: 144rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.goods-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.goods-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #222222;
  line-height: 1.4;
}

.goods-tag {
  display: inline-block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
}

.goods-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12rpx;
}

.goods-price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary-color;
}

.goods-stepper {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex-shrink: 0;
}

.step-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #ede8f8;
  color: $primary-color;
  font-size: 36rpx;
  line-height: 52rpx;
  text-align: center;
}

.step-num {
  min-width: 32rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.bill-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 28rpx;
}

.bill-label {
  color: #666666;
}

.bill-value {
  color: #333333;
}

.bill-value.free {
  color: #52c41a;
}

.bill-row.bill-total {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 4rpx;
}

.bill-value.highlight {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary-color;
}

.pay-card {
  padding: 24rpx;
}

.pay-card-title {
  display: block;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #222222;
  margin-bottom: 20rpx;
}

.pay-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}

.pay-arrow {
  font-size: 36rpx;
  color: #cccccc;
  line-height: 1;
  transform: rotate(90deg);
  transition: transform 0.2s ease;
}

.pay-arrow.open {
  transform: rotate(-90deg);
}

.pay-dropdown {
  margin-top: 8rpx;
  padding-top: 8rpx;
  border-top: 1rpx solid #f0f0f0;
}

.pay-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.pay-option.active {
  background: transparent;
}

.pay-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}

.pay-row-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 28rpx;
  color: #333333;
}

.pay-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #ffffff;
}

.pay-icon.wechat {
  background: #07c160;
}

.pay-icon.alipay {
  background: #1677ff;
}

.pay-icon.bank {
  background: #ff9500;
}

.pay-check {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary-color;
}

.list-end {
  padding: 32rpx 0 16rpx;
  text-align: center;
}

.end-text {
  font-size: 24rpx;
  color: #cccccc;
}

.footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.footer-total {
  display: flex;
  align-items: baseline;
}

.footer-label {
  font-size: 28rpx;
  color: #666666;
}

.footer-price {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary-color;
}

.pay-btn {
  min-width: 240rpx;
  height: 80rpx;
  padding: 0 48rpx;
  border-radius: 40rpx;
  background: $primary-color;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
