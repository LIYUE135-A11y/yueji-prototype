<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">领券中心</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ height: scrollHeight }"
      :enhanced="true"
      :show-scrollbar="true"
    >
      <view class="head-card">
        <text class="head-title">可领取优惠券</text>
        <text class="head-sub">{{ productTitle ? `适用于：${productTitle}` : '满减/满折活动券' }}</text>
      </view>

      <view v-if="coupons.length" class="coupon-list">
        <view v-for="item in coupons" :key="item.id" class="coupon-item">
          <view class="coupon-left">
            <text class="coupon-type">{{ item.type }}</text>
            <text class="coupon-discount">{{ item.tag || item.discount }}</text>
            <text class="coupon-time">{{ item.startTime }} — {{ item.endTime }}</text>
          </view>
          <view class="coupon-right">
            <text class="coupon-name">{{ item.title }}</text>
            <text class="coupon-desc">{{ item.desc }}</text>
            <view
              class="coupon-btn"
              :class="{ claimed: item.claimed }"
              @tap="onClaim(item)"
            >
              <text class="coupon-btn-text">{{ item.claimed ? '已领取' : '立即领取' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-wrap">
        <text class="empty-text">暂无可领取的满减/满折优惠券</text>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  getCouponsForProductWithClaim,
  claimCoupon
} from '../../common/activity-data.js'
import { refreshCartCoupons } from '../../common/cart-data.js'
import { getProductById } from '../../common/product-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const productId = ref('p1')
const productTitle = ref('')
const coupons = ref([])

function refreshCoupons() {
  const product = getProductById(productId.value)
  productTitle.value = product.title || ''
  const meta = {
    cat1: product.cat1,
    cat2: product.cat2,
    cat3: product.cat3,
    brand: product.brand,
    subTitle: product.subTitle
  }
  coupons.value = getCouponsForProductWithClaim(productId.value, meta)
}

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = (info.windowHeight - (info.statusBarHeight || 20) - 44) + 'px'
  } catch (e) {}

  productId.value = query?.productId || query?.id || 'p1'
  refreshCoupons()
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onClaim(item) {
  if (!item || item.claimed) return
  claimCoupon(item.id)
  refreshCoupons()
  refreshCartCoupons(productId.value)
  uni.showToast({ title: '领取成功', icon: 'none' })
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
  background: #fff;
  flex-shrink: 0;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 48rpx;
  color: #333;
  line-height: 1;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.nav-placeholder {
  width: 64rpx;
}

.scroll {
  flex: 1;
  min-height: 0;
}

.head-card {
  margin: 24rpx 24rpx 12rpx;
  padding: 28rpx;
  background: linear-gradient(135deg, #8b7cf6, #c4b5fd);
  border-radius: 20rpx;
  color: #fff;
}

.head-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.head-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  opacity: 0.92;
}

.coupon-list {
  padding: 12rpx 24rpx 0;
}

.coupon-item {
  display: flex;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(139, 124, 246, 0.1);
}

.coupon-left {
  width: 220rpx;
  padding: 28rpx 20rpx;
  background: #fff5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 2rpx dashed #f3d0d8;
}

.coupon-type {
  font-size: 22rpx;
  color: #e85d7b;
  margin-bottom: 8rpx;
}

.coupon-discount {
  font-size: 30rpx;
  font-weight: 700;
  color: #e85d7b;
  text-align: center;
}

.coupon-time {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.coupon-right {
  flex: 1;
  padding: 24rpx 20rpx;
  min-width: 0;
}

.coupon-name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #222;
}

.coupon-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #888;
  line-height: 1.5;
}

.coupon-btn {
  margin-top: 16rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-btn.claimed {
  background: #f0ecf8;
}

.coupon-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.coupon-btn.claimed .coupon-btn-text {
  color: $primary-color;
}

.empty-wrap {
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.list-end {
  padding: 24rpx 0 40rpx;
  text-align: center;
}

.end-text {
  font-size: 22rpx;
  color: #ccc;
}
</style>
