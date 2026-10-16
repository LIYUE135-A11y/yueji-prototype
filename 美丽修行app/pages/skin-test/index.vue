<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="hero-header">
      <view class="title-bar">
        <text class="brand-title">AI 妆小妍</text>
      </view>
      <view class="search-bar" @tap="onSearch">
        <text class="search-icon">⌕</text>
        <text class="search-placeholder">搜索你想查询的产品/成分/内容</text>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
    <view class="main">
      <view class="hero-card" @tap="openWhoModal">
        <view class="hero-glow"></view>
        <view class="cam-badge">
          <view class="cam-body">
            <view class="cam-lens"></view>
          </view>
        </view>
        <text class="hero-title">AI 智能测肤</text>
        <text class="hero-desc">拍一张正脸照，生成今日肤质建议与护肤轨迹</text>
        <view class="start-btn">
          <text class="start-btn-text">开始测肤</text>
        </view>
      </view>

      <view class="tips">
        <view class="tip-item">
          <text class="tip-num">01</text>
          <text class="tip-label">摘眼镜露额头</text>
        </view>
        <view class="tip-item">
          <text class="tip-num">02</text>
          <text class="tip-label">光线均匀柔和</text>
        </view>
        <view class="tip-item">
          <text class="tip-num">03</text>
          <text class="tip-label">正对后置摄像头</text>
        </view>
      </view>
    </view>
    </scroll-view>

    <!-- 测谁弹层 -->
    <view class="who-mask" v-if="showWhoModal" @tap="closeWhoModal">
      <view class="who-wrap" @tap.stop>
        <view class="who-card">
          <view class="who-illus">
            <view class="illus-glow"></view>
            <view class="illus-spark s1">✦</view>
            <view class="illus-spark s2">✧</view>
            <view class="illus-spark s3">✦</view>
            <view class="illus-cam">
              <view class="illus-cam-body">
                <view class="illus-cam-lens"></view>
                <view class="illus-cam-flash"></view>
              </view>
            </view>
          </view>

          <text class="who-title">这次要测谁的肤质？</text>
          <text class="who-sub">选择后将决定报告是否保存到你的护肤轨迹</text>

          <view
            class="who-option"
            :class="{ active: selectedTarget === 'self' }"
            @tap="selectTarget('self')"
          >
            <view class="opt-tag" v-if="selectedTarget === 'self'">
              <text class="opt-tag-text">推荐</text>
            </view>
            <image class="opt-avatar" :src="CURRENT_USER.avatar" mode="aspectFill" />
            <view class="opt-body">
              <text class="opt-title">测自己</text>
              <text class="opt-desc">保存到我的护肤轨迹</text>
              <text class="opt-desc">生成趋势和照片对比</text>
            </view>
            <view class="opt-check" v-if="selectedTarget === 'self'">
              <text class="opt-check-mark">✓</text>
            </view>
          </view>

          <view
            class="who-option"
            :class="{ active: selectedTarget === 'friend' }"
            @tap="selectTarget('friend')"
          >
            <view class="opt-avatars">
              <image class="opt-avatar sm" :src="getUserAvatar('晚风与妆')" mode="aspectFill" />
              <image class="opt-avatar sm overlap" :src="getUserAvatar('修宝小柚')" mode="aspectFill" />
            </view>
            <view class="opt-body">
              <text class="opt-title">帮朋友测</text>
              <text class="opt-desc">仅生成本次报告</text>
              <text class="opt-desc">不保存到个人记录</text>
            </view>
            <view class="opt-check" v-if="selectedTarget === 'friend'">
              <text class="opt-check-mark">✓</text>
            </view>
          </view>

          <view class="who-privacy">
            <text class="privacy-icon">ⓘ</text>
            <text class="privacy-text">照片仅限于分析，不会公开展示</text>
          </view>
        </view>

        <view class="who-close" @tap="closeWhoModal">
          <text class="who-close-x">×</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { CURRENT_USER, getUserAvatar } from '../../common/user-data.js'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const showWhoModal = ref(false)
const selectedTarget = ref('self')
const closedByUser = ref(false)
let navigating = false

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeightStyle({ includeTabBar: true, extraPx: 96 })
  } catch (e) {}
})

onShow(() => {
  navigating = false
  if (closedByUser.value) return
  selectedTarget.value = 'self'
  showWhoModal.value = true
})

function openWhoModal() {
  closedByUser.value = false
  selectedTarget.value = 'self'
  showWhoModal.value = true
}

function closeWhoModal() {
  showWhoModal.value = false
  closedByUser.value = true
}

function selectTarget(target) {
  if (navigating) return
  selectedTarget.value = target
  closedByUser.value = false
  try {
    uni.setStorageSync('skinTestTarget', target)
  } catch (e) {}

  navigating = true
  setTimeout(() => {
    showWhoModal.value = false
    uni.navigateTo({
      url: `/pages/skin-camera/index?target=${target}`,
      fail(err) {
        navigating = false
        uni.showToast({
          title: (err && err.errMsg) || '打开拍照失败',
          icon: 'none'
        })
      }
    })
  }, 180)
}

function onSearch() {
  uni.showToast({ title: '搜索', icon: 'none' })
}
</script>

<style lang="scss">
page {
  background-color: #f7f5fc !important;
}
</style>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #efeafc 0%, #f7f5fc 38%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.page-scroll {
  flex: 1;
  min-height: 0;
}

.status-bar {
  width: 100%;
}

.hero-header {
  padding: 8rpx 28rpx 24rpx;
}

.title-bar {
  margin-bottom: 20rpx;
}

.brand-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.search-bar {
  height: 72rpx;
  border-radius: 36rpx;
  background: #ffffff;
  border: 2rpx solid rgba(139, 124, 246, 0.18);
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(109, 91, 208, 0.06);
}

.search-icon {
  font-size: 28rpx;
  color: #999999;
}

.search-placeholder {
  font-size: 26rpx;
  color: #aaaaaa;
}

.main {
  padding: 24rpx 32rpx 40rpx;
}

.hero-card {
  position: relative;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 56rpx 40rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 8rpx 28rpx rgba(109, 91, 208, 0.08);
}

.hero-glow {
  position: absolute;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  top: -40rpx;
  background: radial-gradient(circle, rgba(186, 170, 240, 0.45) 0%, rgba(186, 170, 240, 0) 70%);
  pointer-events: none;
}

.cam-badge {
  position: relative;
  z-index: 1;
  width: 140rpx;
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28rpx;
}

.cam-body {
  width: 100rpx;
  height: 78rpx;
  border-radius: 20rpx;
  background: linear-gradient(145deg, #9b8cf8 0%, #7b6ae8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(139, 124, 246, 0.35);
}

.cam-lens {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffe08a 0%, #f5c542 45%, #c9921a 100%);
  border: 4rpx solid rgba(255, 255, 255, 0.55);
}

.hero-title {
  position: relative;
  z-index: 1;
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.hero-desc {
  position: relative;
  z-index: 1;
  font-size: 24rpx;
  color: #888888;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 36rpx;
}

.start-btn {
  position: relative;
  z-index: 1;
  width: 280rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(139, 124, 246, 0.35);
}

.start-btn-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}

.tips {
  margin-top: 36rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.tip-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.tip-num {
  font-size: 22rpx;
  font-weight: 700;
  color: $primary-color;
}

.tip-label {
  font-size: 22rpx;
  color: #666666;
  text-align: center;
  line-height: 1.3;
}

/* ===== 测谁弹层 ===== */
.who-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  box-sizing: border-box;
}

.who-wrap {
  width: 100%;
  max-width: 620rpx;
  max-height: 82vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.who-card {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 0 36rpx 32rpx;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

.who-illus {
  position: relative;
  height: 160rpx;
  margin-top: -56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illus-glow {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(186, 170, 240, 0.55) 0%, rgba(186, 170, 240, 0) 70%);
}

.illus-spark {
  position: absolute;
  color: rgba(255, 255, 255, 0.95);
  font-size: 22rpx;
  text-shadow: 0 0 8rpx rgba(139, 124, 246, 0.6);
}

.illus-spark.s1 {
  left: 28%;
  top: 18%;
}

.illus-spark.s2 {
  right: 26%;
  top: 28%;
  font-size: 16rpx;
}

.illus-spark.s3 {
  left: 34%;
  bottom: 22%;
  font-size: 14rpx;
}

.illus-cam {
  position: relative;
  z-index: 1;
}

.illus-cam-body {
  width: 112rpx;
  height: 88rpx;
  border-radius: 22rpx;
  background: linear-gradient(145deg, #a594f8 0%, #7b6ae8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 28rpx rgba(139, 124, 246, 0.4);
  position: relative;
}

.illus-cam-lens {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 32%, #ffe9a8 0%, #f5c542 42%, #c9921a 100%);
  border: 5rpx solid rgba(255, 255, 255, 0.5);
}

.illus-cam-flash {
  position: absolute;
  top: 14rpx;
  right: 16rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
}

.who-title {
  display: block;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
}

.who-sub {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 32rpx;
  line-height: 1.4;
}

.who-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  border: 2rpx solid #eeeeee;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.who-option.active {
  border-color: $primary-color;
  background: rgba(139, 124, 246, 0.06);
}

.opt-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: $primary-color;
  border-radius: 0 18rpx 0 16rpx;
  padding: 4rpx 16rpx;
}

.opt-tag-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 600;
}

.opt-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #f0ecf8;
}

.opt-avatar.sm {
  width: 52rpx;
  height: 52rpx;
  border: 3rpx solid #ffffff;
}

.opt-avatars {
  width: 84rpx;
  height: 72rpx;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
}

.opt-avatar.overlap {
  margin-left: -20rpx;
}

.opt-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.opt-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4rpx;
}

.opt-desc {
  font-size: 22rpx;
  color: #999999;
  line-height: 1.35;
}

.opt-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opt-check-mark {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
}

.who-privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 8rpx;
}

.privacy-icon {
  font-size: 22rpx;
  color: #bbbbbb;
}

.privacy-text {
  font-size: 22rpx;
  color: #bbbbbb;
}

.who-close {
  margin-top: 36rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.who-close-x {
  font-size: 48rpx;
  color: #333333;
  line-height: 1;
  font-weight: 300;
}
</style>
