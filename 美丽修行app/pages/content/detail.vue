<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">{{ detail.navTitle || '详情' }}</text>
      <view class="nav-btn" @tap="onShare">
        <view class="share-ring">
          <text class="share-arrow">↑</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <image class="cover" :src="detail.cover" mode="aspectFill" @tap="previewImage(detail.cover)" />
      <view class="main">
        <text class="type-chip">{{ detail.typeLabel || '内容' }}</text>
        <text class="title">{{ detail.title }}</text>
        <text v-if="detail.meta" class="meta">{{ detail.meta }}</text>

        <view class="author-row">
          <image class="avatar" :src="detail.avatar" mode="aspectFill" />
          <view class="author-info">
            <text class="author-name">{{ detail.author }}</text>
            <text class="author-sub">{{ detail.authorSub }}</text>
          </view>
        </view>

        <text class="body">{{ detail.body }}</text>

        <view v-if="detail.images && detail.images.length > 1" class="gallery">
          <image
            v-for="(img, idx) in detail.images"
            :key="idx"
            class="gallery-img"
            :src="img"
            mode="aspectFill"
            @tap="previewImage(img)"
          />
        </view>
      </view>
      <view class="end-tip">— 已经到底啦 —</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getContentDetail } from '../../common/content-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const detail = ref({
  navTitle: '详情',
  typeLabel: '内容',
  title: '',
  cover: '',
  meta: '',
  author: '',
  authorSub: '',
  avatar: '/static/images/avatar-1.jpg',
  body: '',
  images: []
})

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const h = info.windowHeight - (info.statusBarHeight || 20) - 44
    scrollHeight.value = h + 'px'
  } catch (e) {}

  const type = query?.type || 'post'
  const id = query?.id || ''
  const data = getContentDetail(type, id)
  if (data) {
    detail.value = data
  } else {
    uni.showToast({ title: '内容不存在', icon: 'none' })
  }
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onShare() {
  uni.showToast({ title: '分享功能即将上线', icon: 'none' })
}

function previewImage(img) {
  const urls = detail.value.images && detail.value.images.length
    ? detail.value.images
    : [detail.value.cover]
  uni.previewImage({ urls, current: img || detail.value.cover })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: #fff;
}

.status-bar {
  background: #fff;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0ecfa;
  flex-shrink: 0;
}

.scroll {
  @include app-page-scroll;
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

.share-ring {
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-arrow {
  font-size: 24rpx;
  color: #666;
}

.cover {
  width: 100%;
  height: 420rpx;
  background: #f5f5f5;
}

.main {
  padding: 28rpx 32rpx 40rpx;
}

.type-chip {
  display: inline-block;
  font-size: 22rpx;
  color: #8b7cf6;
  background: #f3f0ff;
  border-radius: 8rpx;
  padding: 4rpx 16rpx;
}

.title {
  display: block;
  margin-top: 20rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #111;
  line-height: 1.45;
}

.meta {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.author-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 28rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid #f7f5fc;
  border-bottom: 1rpx solid #f7f5fc;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #eee;
}

.author-info {
  flex: 1;
}

.author-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.author-sub {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #999;
}

.body {
  display: block;
  margin-top: 28rpx;
  font-size: 28rpx;
  color: #444;
  line-height: 1.7;
  white-space: pre-wrap;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}

.gallery-img {
  width: 210rpx;
  height: 210rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.end-tip {
  padding: 40rpx 0 60rpx;
  text-align: center;
  font-size: 24rpx;
  color: #ccc;
}
</style>
