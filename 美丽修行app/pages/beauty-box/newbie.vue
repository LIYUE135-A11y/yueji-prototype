<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">新人专区</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="coupon-card">
        <text class="coupon-title">新人见面礼</text>
        <view class="coupon-row">
          <view class="coupon-item" v-for="c in coupons" :key="c.id">
            <text class="coupon-value">¥{{ c.value }}</text>
            <text class="coupon-cond">{{ c.cond }}</text>
            <view class="coupon-btn" @tap="onClaim(c)">
              <text class="coupon-btn-text">领取</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-head">
        <text class="section-title">大牌尝鲜</text>
        <text class="section-desc">6.9元起 · 仅限新用户</text>
      </view>

      <view
        v-for="item in list"
        :key="item.id"
        class="deal-card"
        @tap="onTap(item)"
      >
        <image class="deal-img" :src="item.img" mode="aspectFill" />
        <view class="deal-body">
          <text class="deal-name">{{ item.name }}</text>
          <text class="deal-sub">{{ item.sub }}</text>
          <view class="deal-foot">
            <view class="deal-price-wrap">
              <text class="deal-label">新人价</text>
              <text class="deal-price">¥{{ item.price }}</text>
              <text class="deal-origin">¥{{ item.origin }}</text>
            </view>
            <view class="deal-btn">
              <text class="deal-btn-text">去抢购</text>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')

const coupons = [
  { id: 'c1', value: '3', cond: '无门槛' },
  { id: 'c2', value: '10', cond: '满59可用' },
  { id: 'c3', value: '20', cond: '满99可用' }
]

const list = [
  {
    id: '1',
    name: '新人口红礼盒',
    sub: '豆沙色号 · 通勤百搭',
    price: '9.9',
    origin: '79',
    img: '/static/images/lipstick-1.jpg'
  },
  {
    id: '2',
    name: '新人面膜尝鲜装',
    sub: '补水修护 · 敏感友好',
    price: '9.9',
    origin: '68',
    img: '/static/images/product-flash-2.jpg'
  },
  {
    id: '3',
    name: '新人护肤体验装',
    sub: '清爽保湿 · 油皮适用',
    price: '6.9',
    origin: '59',
    img: '/static/images/lipstick-4.jpg'
  },
  {
    id: '4',
    name: '新人彩妆入门装',
    sub: '自然裸妆 · 易上手',
    price: '9.9',
    origin: '89',
    img: '/static/images/lipstick-2.jpg'
  },
  {
    id: '5',
    name: '新人防晒小样盒',
    sub: '轻薄防晒 · 不闷痘',
    price: '6.9',
    origin: '49',
    img: '/static/images/product-flash-1.jpg'
  }
].map((item) => ({
  ...item,
  img: getProductImage(`p${item.id}`, item.name)
}))

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - 44}px`
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/beauty-box/index' })
    }
  })
}

function onClaim(c) {
  uni.showToast({ title: `已领 ¥${c.value} 券`, icon: 'none' })
}

function onTap(item) {
  uni.showToast({ title: item.name, icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: $primary-bg;
  display: flex;
  flex-direction: column;
}

.status-bar {
  width: 100%;
  background: #ffffff;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-btn,
.nav-placeholder {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-back {
  font-size: 48rpx;
  color: $text-primary;
  line-height: 1;
  font-weight: 300;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.coupon-card {
  margin: 24rpx 24rpx 0;
  padding: 28rpx 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #fff5f7 0%, #f7f5fc 100%);
  border: 2rpx solid rgba(255, 107, 157, 0.15);
}

.coupon-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}

.coupon-row {
  display: flex;
  gap: 12rpx;
}

.coupon-item {
  flex: 1;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 16rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.coupon-value {
  font-size: 36rpx;
  font-weight: 700;
  color: $tag-red;
}

.coupon-cond {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $text-hint;
}

.coupon-btn {
  margin-top: 12rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  background: $primary-color;
}

.coupon-btn-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 600;
}

.section-head {
  margin: 32rpx 24rpx 8rpx;
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-desc {
  font-size: 22rpx;
  color: $text-hint;
}

.deal-card {
  margin: 16rpx 24rpx 0;
  padding: 20rpx;
  background: #fafafc;
  border-radius: 20rpx;
  display: flex;
  gap: 20rpx;
}

.deal-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.deal-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.deal-name {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.deal-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $text-hint;
}

.deal-foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.deal-price-wrap {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  min-width: 0;
}

.deal-label {
  font-size: 18rpx;
  color: $tag-pink;
  background: rgba(255, 107, 157, 0.12);
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}

.deal-price {
  font-size: 32rpx;
  font-weight: 700;
  color: $tag-red;
}

.deal-origin {
  font-size: 20rpx;
  color: #bbbbbb;
  text-decoration: line-through;
}

.deal-btn {
  flex-shrink: 0;
  padding: 10rpx 22rpx;
  border-radius: 28rpx;
  background: $primary-color;
}

.deal-btn-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #ffffff;
}

.bottom-space {
  height: 40rpx;
}
</style>
