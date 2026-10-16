<template>

  <view class="page">

    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>



    <view class="nav-bar">

      <view class="nav-btn" @tap="goBack">

        <text class="nav-back">‹</text>

      </view>

      <text class="nav-title">我的购物车</text>

      <view class="nav-placeholder"></view>

    </view>



    <scroll-view

      scroll-y

      class="scroll"

      :style="{ height: scrollHeight }"

      :enhanced="true"

      :show-scrollbar="true"

    >

      <view v-if="items.length" class="cart-list">

        <view v-for="item in items" :key="item.id + item.spec" class="cart-item">

          <view class="cart-remove" @tap="onRemove(item)">×</view>

          <image class="cart-img" :src="item.img" mode="aspectFill" />

          <view class="cart-body">

            <text class="cart-title">{{ item.title }}</text>

            <text class="cart-sub">{{ item.subTitle }}</text>

            <text v-if="item.couponTag" class="cart-coupon">{{ item.couponTag }}</text>

            <view class="cart-bottom">

              <view class="cart-prices">

                <text class="cart-price">¥{{ item.price }}</text>

                <text v-if="item.originPrice" class="cart-origin">¥{{ item.originPrice }}</text>

              </view>

              <view class="cart-stepper">

                <view class="step-btn" @tap="onMinus(item)">−</view>

                <text class="step-num">{{ item.quantity }}</text>

                <view class="step-btn" @tap="onPlus(item)">+</view>

              </view>

            </view>

          </view>

        </view>

      </view>



      <view v-else class="empty-wrap">

        <text class="empty-icon">🛒</text>

        <text class="empty-text">购物车还是空的</text>

        <text class="empty-sub">去商品详情页点击「加入购物车」吧</text>

      </view>



      <view class="list-end">

        <text class="end-text">— 已经到底啦 —</text>

      </view>

    </scroll-view>



    <view v-if="items.length" class="footer">

      <view class="total-wrap">

        <text class="total-label">合计</text>

        <text class="total-price">¥{{ totalPrice }}</text>

      </view>

      <view class="checkout-btn" @tap="onCheckout">去结算</view>

    </view>

  </view>

</template>



<script setup>

import { ref, computed } from 'vue'

import { onLoad, onShow } from '@dcloudio/uni-app'

import {

  CART_STORAGE_KEY,

  CART_UPDATE_EVENT,

  loadCartList,

  removeCartItem,

  changeCartQuantity,

  saveCheckoutItems

} from '../../common/cart-data.js'



const statusBarHeight = ref(20)

const scrollHeight = ref('100vh')

const items = ref([])



const totalPrice = computed(() => {

  return items.value.reduce((sum, item) => {

    const price = Number(item.price) || 0

    const qty = Number(item.quantity) || 1

    return sum + price * qty

  }, 0).toFixed(0)

})



function calcScrollHeight(info) {

  const statusBar = info.statusBarHeight || 20

  const navH = 44

  const footerH = items.value.length ? 64 : 0

  const safe = info.safeAreaInsets?.bottom || 0

  return info.windowHeight - statusBar - navH - footerH - safe

}



function refreshCart() {

  items.value = loadCartList()

  try {

    const info = uni.getSystemInfoSync()

    scrollHeight.value = calcScrollHeight(info) + 'px'

  } catch (e) {}

}



function handleCartStorage(ev) {

  if (!ev || ev.key !== CART_STORAGE_KEY) return

  refreshCart()

}



function handleCartEvent() {

  refreshCart()

}



onLoad(() => {

  try {

    const info = uni.getSystemInfoSync()

    statusBarHeight.value = info.statusBarHeight || 20

  } catch (e) {}

  refreshCart()

  if (typeof window !== 'undefined') {

    window.addEventListener('storage', handleCartStorage)

    window.addEventListener(CART_UPDATE_EVENT, handleCartEvent)

  }

})



onShow(() => {

  refreshCart()

})



function goBack() {

  uni.navigateBack({ delta: 1, fail() { uni.switchTab({ url: '/pages/profile/index' }) } })

}



function onRemove(item) {

  removeCartItem(item.productId, item.spec)

  refreshCart()

  uni.showToast({ title: '已移除', icon: 'none' })

}



function onMinus(item) {

  changeCartQuantity(item.productId, item.spec, -1)

  refreshCart()

}



function onPlus(item) {

  changeCartQuantity(item.productId, item.spec, 1)

  refreshCart()

}



function onCheckout() {

  if (!items.value.length) return

  saveCheckoutItems(loadCartList())

  uni.navigateTo({

    url: '/pages/pay/index?from=cart',

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

  background: $purple-surface;

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

}



.cart-list {

  padding: 24rpx 24rpx 0;

}



.cart-item {

  position: relative;

  display: flex;

  align-items: flex-start;

  gap: 20rpx;

  padding: 28rpx 28rpx 28rpx 24rpx;

  margin-bottom: 24rpx;

  background: #ffffff;

  border-radius: 28rpx;

  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);

}



.cart-remove {

  position: absolute;

  top: 16rpx;

  right: 20rpx;

  width: 44rpx;

  height: 44rpx;

  line-height: 40rpx;

  text-align: center;

  font-size: 32rpx;

  color: #bbbbbb;

  z-index: 1;

}



.cart-img {

  width: 160rpx;

  height: 160rpx;

  border-radius: 20rpx;

  background: $purple-placeholder;

  flex-shrink: 0;

}



.cart-body {

  flex: 1;

  min-width: 0;

  padding-right: 36rpx;

}



.cart-title {

  display: block;

  font-size: 30rpx;

  font-weight: 700;

  color: #222222;

  line-height: 1.35;

  padding-right: 24rpx;

}



.cart-sub {

  display: block;

  margin-top: 8rpx;

  font-size: 24rpx;

  color: #999999;

  line-height: 1.4;

}



.cart-coupon {

  display: inline-block;

  margin-top: 8rpx;

  padding: 4rpx 16rpx;

  border-radius: 8rpx;

  border: 1rpx solid #f3d0d8;

  background: #ffffff;

  font-size: 22rpx;

  color: #e85d7b;

}



.cart-bottom {

  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-top: 20rpx;

  gap: 16rpx;

}



.cart-prices {

  display: flex;

  align-items: baseline;

  gap: 12rpx;

}



.cart-price {

  font-size: 36rpx;

  font-weight: 700;

  color: $primary-color;

}



.cart-origin {

  font-size: 24rpx;

  color: #bbbbbb;

  text-decoration: line-through;

}



.cart-stepper {

  display: flex;

  align-items: center;

  gap: 20rpx;

  flex-shrink: 0;

}



.step-btn {

  width: 56rpx;

  height: 56rpx;

  border-radius: 50%;

  background: #EDE8F8;

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



.empty-wrap {

  padding: 160rpx 48rpx;

  display: flex;

  flex-direction: column;

  align-items: center;

}



.empty-icon {

  font-size: 80rpx;

  margin-bottom: 24rpx;

}



.empty-text {

  font-size: 30rpx;

  font-weight: 600;

  color: #444444;

}



.empty-sub {

  margin-top: 12rpx;

  font-size: 24rpx;

  color: #999999;

}



.list-end {

  display: flex;

  justify-content: center;

  padding: 24rpx 0 40rpx;

}



.end-text {

  font-size: 22rpx;

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



.total-wrap {

  display: flex;

  align-items: baseline;

  gap: 8rpx;

}



.total-label {

  font-size: 28rpx;

  color: #666666;

}



.total-price {

  font-size: 40rpx;

  font-weight: 700;

  color: $primary-color;

}



.checkout-btn {

  min-width: 220rpx;

  height: 80rpx;

  padding: 0 36rpx;

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

