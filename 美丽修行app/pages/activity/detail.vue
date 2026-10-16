<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">活动详情</text>
      <view class="nav-btn" @tap="onShare">
        <view class="share-ring">
          <text class="share-arrow">↑</text>
        </view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ height: scrollHeight }"
      :enhanced="true"
      :show-scrollbar="true"
    >
      <view class="hero-wrap">
        <image class="hero-img" :src="detail.img" mode="aspectFill" />
      </view>

      <view class="info-card">
        <view class="user-row">
          <image class="avatar" :src="detail.avatar" mode="aspectFill" />
          <view class="user-meta">
            <text class="username">{{ detail.user }}</text>
            <text class="tags">{{ detail.tags }}</text>
          </view>
        </view>

        <view class="price-row">
          <view class="price-main">
            <template v-if="detail.typeKey === 'manzhe'">
              <text class="price-num">{{ detail.price }}折</text>
            </template>
            <template v-else>
              <text class="price-yen">¥</text>
              <text class="price-num">{{ detail.price }}</text>
            </template>
            <text v-if="detail.originPrice" class="price-origin">¥{{ detail.originPrice }}</text>
          </view>
          <text class="score-text">● {{ detail.score }} · {{ detail.reviewCount }}人参与</text>
        </view>

        <text class="title">{{ detail.title }}</text>
        <text class="sub">{{ detail.subTitle }}</text>
        <text class="desc">{{ detail.desc }}</text>

        <view class="stat-row">
          <view class="stat-item">
            <text class="stat-num">{{ detail.viewCount || 0 }}</text>
            <text class="stat-label">浏览</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ detail.reviewCount || 0 }}</text>
            <text class="stat-label">参与</text>
          </view>
          <view class="stat-item">
            <text class="stat-num">{{ detail.stock || 0 }}</text>
            <text class="stat-label">库存</text>
          </view>
        </view>

        <view class="gallery">
          <image
            v-for="(img, idx) in detail.images"
            :key="idx"
            class="gallery-img"
            :src="img"
            mode="aspectFill"
            @tap="preview(img)"
          />
        </view>
      </view>

      <view v-if="detail.infoRows && detail.infoRows.length" class="section-card">
        <text class="section-title">活动信息</text>
        <view
          v-for="(row, idx) in detail.infoRows"
          :key="'info-' + idx"
          class="info-row"
        >
          <text class="info-label">{{ row.label }}</text>
          <text class="info-value">{{ row.value }}</text>
        </view>
      </view>

      <view
        v-for="(section, idx) in detail.sections"
        :key="'sec-' + idx"
        class="section-card"
      >
        <text class="section-title">{{ section.title }}</text>
        <text class="section-body">{{ section.body }}</text>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>

    <view class="composer">
      <view class="composer-btn ghost" @tap="goBack">返回</view>
      <view class="composer-btn primary" @tap="onJoin">立即参与</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getActivityById } from '../../common/activity-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const detail = ref(getActivityById('202506005'))

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const navH = 44
  const barH = 64
  const safe = info.safeAreaInsets?.bottom || 0
  return info.windowHeight - statusBar - navH - barH - safe
}

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}

  detail.value = getActivityById(query.id || '202506005')
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/discover/index' })
    }
  })
}

function onShare() {
  uni.showToast({ title: '分享功能即将上线', icon: 'none' })
}

function onJoin() {
  const pid = detail.value.productId || 'p1'
  const title = detail.value.title || ''
  const subTitle = detail.value.subTitle || ''
  const img = detail.value.img || ''
  const desc = detail.value.desc || ''
  uni.navigateTo({
    url:
      `/pages/product/detail?id=${encodeURIComponent(pid)}` +
      `&title=${encodeURIComponent(title)}` +
      `&subTitle=${encodeURIComponent(subTitle)}` +
      `&img=${encodeURIComponent(img)}` +
      `&desc=${encodeURIComponent(desc)}`,
    fail() {
      uni.showToast({ title: '打开商品详情失败', icon: 'none' })
    }
  })
}

function preview(img) {
  uni.previewImage({
    urls: detail.value.images || [detail.value.img],
    current: img
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
  box-sizing: border-box;
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

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 56rpx;
  color: #222222;
  line-height: 1;
  margin-top: -6rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
}

.share-ring {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #333333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-arrow {
  font-size: 22rpx;
  color: #333333;
  line-height: 1;
}

.scroll {
  flex: 1;
  min-height: 0;
  background: $purple-surface;
  box-sizing: border-box;
}

.hero-wrap {
  width: 100%;
  background: $purple-placeholder;
}

.hero-img {
  width: 100%;
  height: 560rpx;
  display: block;
}

.info-card {
  margin: -36rpx 24rpx 20rpx;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(139, 124, 246, 0.1);
  position: relative;
  z-index: 1;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.username {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #222222;
}

.tags {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999999;
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 16rpx 18rpx;
  border-radius: 14rpx;
  background: $purple-surface;
}

.price-main {
  display: flex;
  align-items: baseline;
}

.price-yen {
  font-size: 26rpx;
  font-weight: 700;
  color: $primary-color;
}

.price-num {
  font-size: 44rpx;
  font-weight: 700;
  color: $primary-color;
  line-height: 1;
}

.price-origin {
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #bbbbbb;
  text-decoration: line-through;
}

.score-text {
  font-size: 22rpx;
  color: #888888;
}

.title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #222222;
  line-height: 1.4;
}

.sub {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $primary-color;
}

.desc {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #555555;
  line-height: 1.7;
}

.stat-row {
  display: flex;
  margin-top: 24rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #222222;
}

.stat-label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999999;
}

.gallery {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
}

.gallery-img {
  flex: 1;
  height: 200rpx;
  border-radius: 12rpx;
  background: $purple-placeholder;
}

.section-card {
  margin: 0 24rpx 20rpx;
  padding: 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(139, 124, 246, 0.08);
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #222222;
  margin-bottom: 16rpx;
}

.section-body {
  display: block;
  font-size: 28rpx;
  color: #555555;
  line-height: 1.7;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: #999999;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: #333333;
  text-align: right;
  flex: 1;
  margin-left: 24rpx;
}

.list-end {
  display: flex;
  justify-content: center;
  padding: 20rpx 0 40rpx;
}

.end-text {
  font-size: 22rpx;
  color: #cccccc;
}

.composer {
  flex-shrink: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.composer-btn {
  flex: 1;
  height: 76rpx;
  border-radius: 38rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.composer-btn.ghost {
  color: $primary-color;
  background: $purple-surface;
}

.composer-btn.primary {
  color: #ffffff;
  background: $primary-color;
}
</style>
