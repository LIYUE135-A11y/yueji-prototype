<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goHome">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">支付结果</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="success-card">
        <view class="success-icon">✓</view>
        <text class="success-title">支付成功</text>
        <text class="success-amount">¥{{ displayAmount }}</text>
        <text class="success-sub">订单已生成，可在「我的订单」查看物流进度</text>
        <view class="success-actions">
          <view class="order-btn ghost" @tap="goHome">返回首页</view>
          <view class="order-btn" @tap="goOrders">查看订单</view>
        </view>
      </view>

      <view class="recommend-section">
        <view class="section-head">
          <text class="section-title">相关推荐</text>
          <text class="section-sub">来自运营商品管理</text>
        </view>

        <view v-if="recommendList.length" class="recommend-list">
          <view
            v-for="item in recommendList"
            :key="item.id"
            class="recommend-row"
            @tap="openProduct(item)"
          >
            <image class="recommend-img" :src="item.img" mode="aspectFill" />
            <view class="recommend-body">
              <text class="recommend-title">{{ item.title }}</text>
              <text class="recommend-sub">{{ item.subTitle }}</text>
              <view class="recommend-meta">
                <text class="recommend-price">¥{{ item.price }}</text>
                <text class="recommend-action">去看看 ›</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="empty-recommend">
          <text>暂无推荐商品，请先在运营端上架商品</text>
        </view>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  loadQueryableProductList,
  filterRecommendProducts
} from '../../common/product-store-app.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const displayAmount = ref('0')
const recommendList = ref([])

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const navH = 44
  return info.windowHeight - statusBar - navH
}

function loadRecommendations() {
  const list = loadQueryableProductList()
  recommendList.value = filterRecommendProducts(list, {
    limit: 6,
    imgBase: '../运营管理系统/static/products/'
  })
}

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}
  displayAmount.value = decodeURIComponent(query.amount || '0')
  loadRecommendations()
})

onShow(() => {
  loadRecommendations()
})

function goHome() {
  uni.switchTab({
    url: '/pages/home/index',
    fail() {
      uni.reLaunch({ url: '/pages/home/index' })
    }
  })
}

function goOrders() {
  uni.redirectTo({
    url: '/pages/order/index',
    fail() {
      uni.navigateTo({
        url: '/pages/order/index',
        fail() {
          uni.showToast({ title: '打开订单页失败', icon: 'none' })
        }
      })
    }
  })
}

function openProduct(item) {
  const q = [
    `id=${encodeURIComponent(item.id)}`,
    `productId=${encodeURIComponent(item.id)}`,
    `title=${encodeURIComponent(item.title || '')}`,
    `subTitle=${encodeURIComponent(item.subTitle || '')}`,
    `img=${encodeURIComponent(item.img || '')}`,
    `price=${encodeURIComponent(item.price || '')}`
  ].join('&')
  uni.navigateTo({
    url: `/pages/product/detail?${q}`,
    fail() {
      uni.showToast({ title: '打开商品详情失败', icon: 'none' })
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

.scroll {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.success-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(124, 92, 240, 0.08);
}

.success-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #fff;
  font-size: 56rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-title {
  margin-top: 24rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #222;
}

.success-amount {
  margin-top: 12rpx;
  font-size: 56rpx;
  font-weight: 700;
  color: $primary-color;
}

.success-sub {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.success-actions {
  margin-top: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  width: 100%;
}

.order-btn {
  margin-top: 0;
  min-width: 240rpx;
  height: 80rpx;
  padding: 0 40rpx;
  border-radius: 40rpx;
  background: $primary-color;
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.order-btn.ghost {
  background: #f3f0fa;
  color: $primary-color;
}

.recommend-section {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
}

.section-sub {
  font-size: 22rpx;
  color: #aaa;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.recommend-row {
  display: flex;
  gap: 20rpx;
  padding: 16rpx;
  border-radius: 20rpx;
  background: #fafafb;
}

.recommend-img {
  width: 144rpx;
  height: 144rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.recommend-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.recommend-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recommend-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.recommend-meta {
  margin-top: auto;
  padding-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recommend-price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary-color;
}

.recommend-action {
  font-size: 24rpx;
  color: #888;
}

.empty-recommend {
  padding: 48rpx 16rpx;
  text-align: center;
  font-size: 24rpx;
  color: #bbb;
}

.list-end {
  padding: 32rpx 0 16rpx;
  text-align: center;
}

.end-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>
