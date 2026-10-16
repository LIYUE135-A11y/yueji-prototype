<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="status-inner">
        <text class="status-time">{{ currentTime }}</text>
        <view class="status-right">
          <text class="status-signal">▮▮▮▮</text>
          <text class="status-network">5G</text>
          <text class="status-battery">🔋</text>
        </view>
      </view>
    </view>

    <view class="hero-header">
      <view class="title-bar">
        <view class="title-block">
          <text class="page-title">阅己盒</text>
          <text class="page-subtitle">你的专属美妆收藏</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <!-- 活动 Banner -->
      <view class="banner-wrap" @tap="onToast('七夕活动')">
        <image class="banner-img" src="/static/images/qixi-ad.jpg" mode="aspectFill" />
        <view class="banner-mask">
          <text class="banner-title">七夕好物 贴心好礼</text>
          <text class="banner-sub">100-50 大额券限量领</text>
        </view>
        <view class="banner-dots">
          <view class="dot active"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>

      <!-- 测肤入口条 -->
      <view class="skin-bar" @tap="goSkinTest">
        <view class="skin-bar-left">
          <view class="skin-cam">📷</view>
          <text class="skin-bar-text">一键测肤，寻找最适合你肤质的TA!</text>
        </view>
        <view class="skin-bar-btn">
          <text class="skin-bar-btn-text">去测肤</text>
        </view>
      </view>

      <!-- 每周上新 + 大牌秒杀 -->
      <view class="grid-row">
        <view class="grid-card" @tap="goWeekly">
          <view class="grid-head">
            <text class="grid-title">每周上新</text>
            <text class="grid-more">全部 ›</text>
          </view>
          <view class="kit-list">
            <view v-for="item in weeklyList" :key="item.id" class="kit-item">
              <image class="kit-img" :src="item.img" mode="aspectFill" />
              <view class="kit-info">
                <text class="kit-name">{{ item.name }}</text>
                <text class="kit-meta">{{ item.count }}</text>
                <view class="kit-price-row">
                  <text class="kit-price">¥{{ item.price }}</text>
                  <text class="kit-origin">¥{{ item.origin }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="grid-card flash" @tap="goFlash">
          <view class="grid-head">
            <text class="grid-title">大牌1元秒</text>
            <text class="grid-more">›</text>
          </view>
          <image class="flash-img" :src="flashDeal.img" mode="aspectFill" />
          <text class="flash-tag">{{ flashDeal.tag }}</text>
          <view class="flash-price-wrap">
            <text class="flash-price">¥{{ flashDeal.price }}</text>
          </view>
        </view>
      </view>

      <!-- 猜你喜欢 -->
      <view class="section">
        <view class="section-head" @tap="goGuess">
          <text class="section-title">猜你喜欢</text>
          <text class="section-link">人气爆款榜单 9.9抢 ››</text>
        </view>
        <scroll-view scroll-x class="like-scroll" :show-scrollbar="false">
          <view class="like-row">
            <view
              v-for="item in likeList"
              :key="item.id"
              class="like-card"
              @tap="goGuess"
            >
              <view class="like-banner" :style="{ background: item.color }">
                <text class="like-banner-text">{{ item.badge }}</text>
              </view>
              <image class="like-img" :src="item.img" mode="aspectFill" />
              <text class="like-name">{{ item.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 新人专区 -->
      <view class="section">
        <view class="section-head" @tap="goNewbie">
          <text class="section-title">新人专区</text>
          <text class="section-desc">①3元无门槛券；②大牌6.9元起尝鲜</text>
        </view>
        <scroll-view scroll-x class="newbie-scroll" :show-scrollbar="false">
          <view class="newbie-row">
            <view
              v-for="item in newbieList"
              :key="item.id"
              class="newbie-card"
              @tap="goNewbie"
            >
              <image class="newbie-img" :src="item.img" mode="aspectFill" />
              <view class="newbie-price">
                <text class="newbie-price-text">新人价 ¥{{ item.price }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 右侧悬浮按钮 -->
    <view class="float-btns">
      <view class="float-btn" @tap="onToast('客服')">🎧</view>
      <view class="float-btn" @tap="onToast('购物车')">🛒</view>
      <view class="float-btn" @tap="onToast('店铺')">⌂</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getProductImage } from '../../common/product-image.js'

function withImg(item) {
  return { ...item, img: getProductImage(item.productId || item.id, item.name || item.title || '') }
}

const statusBarHeight = ref(0)
const currentTime = ref('9:41')
const scrollHeight = ref('100vh')
let timeTimer = null

const weeklyList = [
  withImg({ id: 'w1', productId: 'p1', name: '爆油爆痘救急舱', count: '10件套', price: '19.9', origin: '99' }),
  withImg({ id: 'w2', productId: 'p1', name: '敏感维稳舒缓舱', count: '8件套', price: '29.9', origin: '129' })
]

const flashDeal = {
  img: getProductImage('p1', '减黄黑安稳白'),
  tag: '减黄黑 安稳白',
  price: '1'
}

const likeList = [
  withImg({ id: 'l1', productId: 'p1', name: '奥礼防晒专属盒', badge: '防晒专场', color: 'linear-gradient(135deg, #A78BFA, #8B7CF6)' }),
  withImg({ id: 'l2', productId: 'p2', name: '美白淡斑精选盒', badge: '美白专场', color: 'linear-gradient(135deg, #F9A8D4, #F472B6)' }),
  withImg({ id: 'l3', productId: 'p3', name: '油皮控油清爽盒', badge: '控油专场', color: 'linear-gradient(135deg, #93C5FD, #60A5FA)' })
]

const newbieList = [
  withImg({ id: 'n1', productId: 'p1', name: '新人口红礼', price: '9.9' }),
  withImg({ id: 'n2', productId: 'p1', name: '新人面膜礼', price: '9.9' }),
  withImg({ id: 'n3', productId: 'p4', name: '新人护肤礼', price: '6.9' }),
  withImg({ id: 'n4', productId: 'p2', name: '新人彩妆礼', price: '9.9' })
]

function updateTime() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  currentTime.value = `${h}:${m < 10 ? '0' : ''}${m}`
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 0
    const headerH = (info.statusBarHeight || 0) + 72
    const tabH = 50
    scrollHeight.value = `${info.windowHeight - headerH - tabH}px`
  } catch (e) {
    statusBarHeight.value = 0
  }
  updateTime()
  timeTimer = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})

function onToast(title) {
  uni.showToast({ title, icon: 'none' })
}

function goPage(url, failTitle) {
  uni.navigateTo({
    url,
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || failTitle || '打开失败',
        icon: 'none'
      })
    }
  })
}

function goWeekly() {
  goPage('/pages/beauty-box/weekly', '打开每周上新失败')
}

function goFlash() {
  goPage('/pages/beauty-box/flash', '打开大牌1元秒失败')
}

function goGuess() {
  goPage('/pages/beauty-box/guess', '打开猜你喜欢失败')
}

function goNewbie() {
  goPage('/pages/beauty-box/newbie', '打开新人专区失败')
}

function goSkinTest() {
  uni.switchTab({
    url: '/pages/skin-test/index',
    fail() {
      uni.navigateTo({ url: '/pages/skin-guide/index' })
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background-color: $primary-bg;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: #ffffff;
}

.status-inner {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.status-time {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-signal,
.status-network,
.status-battery {
  font-size: 22rpx;
  color: $text-primary;
}

.hero-header {
  background: $header-gradient;
  padding: 0 24rpx 12rpx;
}

.title-bar {
  display: flex;
  align-items: flex-start;
  padding: 8rpx 0 4rpx;
}

.title-block {
  flex: 1;
  min-width: 0;
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
  line-height: 1.3;
}

.page-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: $text-hint;
  letter-spacing: 1rpx;
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.banner-wrap {
  margin: 8rpx 24rpx 0;
  height: 280rpx;
  border-radius: 20rpx;
  overflow: hidden;
  position: relative;
  background: $purple-placeholder;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.banner-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28rpx 28rpx 36rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.35) 100%);
}

.banner-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.banner-sub {
  display: inline-block;
  font-size: 22rpx;
  font-weight: 600;
  color: #1a1a1a;
  background: #c8f5c0;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
}

.banner-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12rpx;
  display: flex;
  justify-content: center;
  gap: 8rpx;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
}

.dot.active {
  background: #ffffff;
  width: 18rpx;
  border-radius: 6rpx;
}

.skin-bar {
  margin: 20rpx 24rpx 0;
  padding: 16rpx 20rpx;
  border-radius: 40rpx;
  background: $purple-surface;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.skin-bar-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.skin-cam {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $primary-color;
  color: #ffffff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skin-bar-text {
  flex: 1;
  font-size: 24rpx;
  color: $text-secondary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.skin-bar-btn {
  flex-shrink: 0;
  padding: 10rpx 22rpx;
  border-radius: 28rpx;
  background: $primary-color;
}

.skin-bar-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
}

.grid-row {
  margin: 20rpx 24rpx 0;
  display: flex;
  gap: 16rpx;
}

.grid-card {
  flex: 1;
  min-width: 0;
  background: #fafafc;
  border-radius: 20rpx;
  padding: 20rpx 16rpx 16rpx;
  box-sizing: border-box;
}

.grid-card.flash {
  flex: 0.92;
}

.grid-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.grid-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.grid-more {
  font-size: 22rpx;
  color: $primary-light;
}

.kit-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.kit-item {
  display: flex;
  gap: 12rpx;
  background: #ffffff;
  border-radius: 12rpx;
  padding: 10rpx;
}

.kit-img {
  width: 72rpx;
  height: 72rpx;
  border-radius: 10rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.kit-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.kit-name {
  font-size: 22rpx;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.kit-meta {
  font-size: 18rpx;
  color: $text-hint;
  margin-top: 2rpx;
}

.kit-price-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-top: 4rpx;
}

.kit-price {
  font-size: 24rpx;
  font-weight: 700;
  color: $tag-red;
}

.kit-origin {
  font-size: 18rpx;
  color: #bbbbbb;
  text-decoration: line-through;
}

.flash-img {
  width: 100%;
  height: 160rpx;
  border-radius: 12rpx;
  background: $purple-placeholder;
}

.flash-tag {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $text-secondary;
  font-weight: 500;
}

.flash-price-wrap {
  margin-top: 8rpx;
}

.flash-price {
  font-size: 36rpx;
  font-weight: 700;
  color: $tag-red;
}

.section {
  margin: 28rpx 0 0;
  padding: 0 24rpx;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
  gap: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  flex-shrink: 0;
}

.section-link {
  font-size: 22rpx;
  color: $primary-color;
}

.section-desc {
  flex: 1;
  font-size: 20rpx;
  color: $text-hint;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.like-scroll,
.newbie-scroll {
  width: 100%;
  white-space: nowrap;
}

.like-row,
.newbie-row {
  display: inline-flex;
  gap: 16rpx;
  padding-right: 8rpx;
}

.like-card {
  width: 220rpx;
  background: #fafafc;
  border-radius: 16rpx;
  overflow: hidden;
  display: inline-flex;
  flex-direction: column;
}

.like-banner {
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-banner-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #ffffff;
}

.like-img {
  width: 100%;
  height: 160rpx;
  background: $purple-placeholder;
}

.like-name {
  display: block;
  padding: 12rpx 12rpx 16rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: $text-primary;
  white-space: normal;
  line-height: 1.35;
}

.newbie-card {
  width: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #ffffff;
  border: 2rpx solid rgba(249, 168, 212, 0.45);
  display: inline-flex;
  flex-direction: column;
}

.newbie-img {
  width: 100%;
  height: 180rpx;
  background: $purple-placeholder;
}

.newbie-price {
  padding: 12rpx 0;
  background: #fff0f5;
  text-align: center;
}

.newbie-price-text {
  font-size: 22rpx;
  font-weight: 700;
  color: $tag-red;
}

.bottom-space {
  height: 40rpx;
}

.float-btns {
  position: fixed;
  right: 20rpx;
  bottom: 180rpx;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.float-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  border: 2rpx solid #eeeeee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}
</style>
