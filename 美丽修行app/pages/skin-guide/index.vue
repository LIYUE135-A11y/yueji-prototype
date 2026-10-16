<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">准备开始拍照测肤</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
    <view class="stage">
      <view class="blob blob-a"></view>
      <view class="blob blob-b"></view>
      <view class="orbit orbit-a"></view>
      <view class="orbit orbit-b"></view>
      <view class="star star-1">✦</view>
      <view class="star star-2">✦</view>
      <view class="star star-3">✦</view>
      <view class="dot dot-1"></view>
      <view class="dot dot-2"></view>
      <view class="dot dot-3"></view>

      <view class="phone" @tap="startCamera" @click="startCamera">
        <view class="phone-screen">
          <image class="face-img" :src="previewAvatar" mode="aspectFill" />
          <view class="scan-corners">
            <view class="corner tl"></view>
            <view class="corner tr"></view>
            <view class="corner bl"></view>
            <view class="corner br"></view>
          </view>
          <view class="scan-line"></view>
          <view class="cam-btn">
            <text class="cam-icon">📷</text>
          </view>
        </view>
      </view>

      <view class="badge-30">
        <text class="badge-text">30秒</text>
      </view>
    </view>
    </scroll-view>

    <view class="footer-tip">
      <text class="tip-text">拍一张正脸照，生成今日肤质建议</text>
    </view>

    <view class="footer">
      <view class="start-btn" @tap="startCamera" @click="startCamera">
        <text class="start-btn-text">开始拍照</text>
      </view>
      <view class="upload-btn" @tap="uploadLocalImage" @click="uploadLocalImage">
        <text class="upload-btn-text">从相册上传</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CURRENT_USER } from '../../common/user-data.js'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const previewAvatar = ref(CURRENT_USER.avatar)

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeightStyle({ navRpx: 88, footerRpx: 280 })
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function startCamera() {
  uni.switchTab({
    url: '/pages/skin-test/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开测肤失败',
        icon: 'none'
      })
    }
  })
}

function uploadLocalImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success(res) {
      const path = res && res.tempFilePaths && res.tempFilePaths[0]
      if (!path) {
        uni.showToast({ title: '未选择图片', icon: 'none' })
        return
      }
      previewAvatar.value = path
      try {
        uni.setStorageSync('skin_upload_image_v1', path)
      } catch (e) {}
      uni.showToast({ title: '已选择图片', icon: 'success' })
      setTimeout(function () {
        uni.switchTab({
          url: '/pages/skin-test/index',
          fail() {
            uni.showToast({ title: '已上传，可继续测肤', icon: 'none' })
          }
        })
      }, 400)
    },
    fail(err) {
      if (err && /cancel/i.test(String(err.errMsg || ''))) return
      uni.showToast({
        title: (err && err.errMsg) || '打开相册失败',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #e8e4f8 0%, #f4f1fb 42%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.page-scroll {
  flex: 1;
  min-height: 0;
}

.status-bar {
  background: transparent;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  position: relative;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 2;
}

.nav-back {
  font-size: 48rpx;
  color: #222222;
  line-height: 1;
  font-weight: 300;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: #222222;
}

.nav-placeholder {
  width: 64rpx;
  margin-left: auto;
}

.stage {
  position: relative;
  flex: 1;
  min-height: 720rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
}

.blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.blob-a {
  width: 360rpx;
  height: 360rpx;
  left: 50%;
  top: 50%;
  margin-left: -220rpx;
  margin-top: -200rpx;
  background: radial-gradient(circle, rgba(186, 170, 240, 0.55) 0%, rgba(186, 170, 240, 0) 70%);
}

.blob-b {
  width: 300rpx;
  height: 300rpx;
  left: 50%;
  top: 50%;
  margin-left: -40rpx;
  margin-top: -120rpx;
  background: radial-gradient(circle, rgba(168, 152, 230, 0.4) 0%, rgba(168, 152, 230, 0) 70%);
}

.orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 2rpx solid rgba(167, 139, 250, 0.28);
  border-radius: 50%;
  pointer-events: none;
}

.orbit-a {
  width: 520rpx;
  height: 520rpx;
  margin-left: -260rpx;
  margin-top: -260rpx;
  transform: rotate(-18deg);
}

.orbit-b {
  width: 600rpx;
  height: 420rpx;
  margin-left: -300rpx;
  margin-top: -210rpx;
  transform: rotate(12deg);
  border-color: rgba(167, 139, 250, 0.18);
}

.star {
  position: absolute;
  color: rgba(139, 124, 246, 0.55);
  font-size: 28rpx;
  pointer-events: none;
}

.star-1 {
  left: 18%;
  top: 28%;
  font-size: 34rpx;
}

.star-2 {
  right: 16%;
  top: 36%;
  font-size: 22rpx;
  color: rgba(167, 139, 250, 0.7);
}

.star-3 {
  left: 22%;
  bottom: 30%;
  font-size: 20rpx;
}

.dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(139, 124, 246, 0.35);
  pointer-events: none;
}

.dot-1 {
  width: 16rpx;
  height: 16rpx;
  right: 22%;
  top: 24%;
  background: $primary-color;
}

.dot-2 {
  width: 12rpx;
  height: 12rpx;
  left: 16%;
  top: 48%;
}

.dot-3 {
  width: 20rpx;
  height: 20rpx;
  right: 18%;
  bottom: 28%;
  background: rgba(167, 139, 250, 0.5);
}

.phone {
  position: relative;
  z-index: 2;
  width: 340rpx;
  height: 620rpx;
  border-radius: 48rpx;
  background: #ffffff;
  box-shadow: 0 20rpx 60rpx rgba(109, 91, 208, 0.18);
  padding: 18rpx;
  box-sizing: border-box;
}

.phone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 36rpx;
  overflow: hidden;
  background: #f0ecf8;
}

.face-img {
  width: 100%;
  height: 100%;
}

.scan-corners {
  position: absolute;
  left: 36rpx;
  right: 36rpx;
  top: 120rpx;
  bottom: 180rpx;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 36rpx;
  height: 36rpx;
  border-color: #ffffff;
  border-style: solid;
}

.corner.tl {
  left: 0;
  top: 0;
  border-width: 4rpx 0 0 4rpx;
  border-radius: 6rpx 0 0 0;
}

.corner.tr {
  right: 0;
  top: 0;
  border-width: 4rpx 4rpx 0 0;
  border-radius: 0 6rpx 0 0;
}

.corner.bl {
  left: 0;
  bottom: 0;
  border-width: 0 0 4rpx 4rpx;
  border-radius: 0 0 0 6rpx;
}

.corner.br {
  right: 0;
  bottom: 0;
  border-width: 0 4rpx 4rpx 0;
  border-radius: 0 0 6rpx 0;
}

.scan-line {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  top: 42%;
  height: 4rpx;
  border-radius: 4rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 16rpx rgba(255, 255, 255, 0.9);
}

.cam-btn {
  position: absolute;
  left: 50%;
  bottom: 36rpx;
  margin-left: -40rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.4);
}

.cam-icon {
  font-size: 34rpx;
  line-height: 1;
}

.badge-30 {
  position: absolute;
  z-index: 3;
  right: 10%;
  top: 42%;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  background: $primary-color;
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.35);
}

.badge-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
}

.footer-tip {
  padding: 8rpx 40rpx 24rpx;
  text-align: center;
}

.tip-text {
  font-size: 30rpx;
  color: #222222;
  font-weight: 500;
  line-height: 1.5;
}

.footer {
  flex-shrink: 0;
  padding: 8rpx 48rpx calc(28rpx + env(safe-area-inset-bottom));
}

.start-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.35);
}

.start-btn-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}

.upload-btn {
  margin-top: 20rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 3rpx solid rgba(138, 99, 242, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(139, 124, 246, 0.12);
}

.upload-btn-text {
  font-size: 30rpx;
  font-weight: 700;
  color: $primary-color;
}
</style>
