<template>
  <view class="page" :style="pageStyle">
    <image class="camera-img" src="/static/images/skin-camera-bg.jpg" mode="aspectFill" />
    <view class="camera-dim"></view>

    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部 -->
    <view class="top-bar">
      <view class="top-left">
        <view class="icon-btn" @tap="goBack">
          <text class="icon-txt">‹</text>
        </view>
        <text class="vol-text">🕪 {{ volume }}%</text>
      </view>

      <view class="tip-bubble" v-if="!showTutorial">
        <text class="tip-text">点击切换手动拍照哦~</text>
      </view>

      <view class="top-right">
        <view class="mode-item" @tap="toggleMode">
          <view class="mode-icon-wrap"><text class="mode-icon">▣</text></view>
          <text class="mode-label">{{ autoMode ? '自动' : '手动' }}</text>
        </view>
        <view class="mode-item" @tap="onTutorialTap">
          <view class="mode-icon-wrap"><text class="mode-icon">☰</text></view>
          <text class="mode-label">教程</text>
        </view>
      </view>
    </view>

    <!-- 中间人脸引导 -->
    <view class="guide-area">
      <view class="face-hint">
        <text class="hint-text">请正对屏幕</text>
        <view class="hint-dot"></view>
      </view>

      <view class="face-frame">
        <view class="corner tl"></view>
        <view class="corner tr"></view>
        <view class="corner bl"></view>
        <view class="corner br"></view>
        <view class="face-oval">
          <view class="brow left"></view>
          <view class="brow right"></view>
          <view class="nose-line"></view>
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="bottom-area">
      <view class="disclaimer">
        <text class="disc-icon">ⓘ</text>
        <text class="disc-text">AI测肤旨在评估您的肌肤状态供美妆消费参考，并非医疗诊断。评估结果及护肤科普内容不能替代专业医生建议。如有皮肤疾病问题，请务必咨询专业皮肤科医生。</text>
      </view>
      <view class="bottom-bar">
        <view class="bottom-item" @tap="onAlbum">
          <text class="bottom-icon">🖼</text>
          <text class="bottom-label">相册</text>
        </view>
        <view class="bottom-spacer"></view>
        <view class="bottom-item" @tap="onFlip">
          <text class="bottom-icon">⟳</text>
          <text class="bottom-label">{{ frontCamera ? '前置' : '后置' }}</text>
        </view>
      </view>
    </view>

    <!-- 肤测教程弹层 -->
    <view class="tutorial-mask" v-if="showTutorial" @tap="closeTutorial">
      <view class="tutorial-wrap" @tap.stop>
        <view class="tutorial-card">
          <text class="tutorial-title">肤测教程</text>

          <view class="tutorial-step">
            <text class="step-num">1</text>
            <text class="step-text">摘眼镜，露额头</text>
            <view class="step-illust">
              <view class="illust-head"></view>
              <view class="illust-phone"></view>
            </view>
          </view>

          <view class="tutorial-step">
            <text class="step-num">2</text>
            <text class="step-text">打开手机声音提示</text>
            <view class="step-illust">
              <view class="illust-head"></view>
              <view class="illust-waves">
                <view class="wave"></view>
                <view class="wave"></view>
              </view>
              <view class="illust-phone"></view>
            </view>
          </view>

          <view class="tutorial-step">
            <text class="step-num">3</text>
            <view class="step-text-wrap">
              <text class="step-text">平视</text>
              <text class="step-text highlight">后置</text>
              <text class="step-text">摄像头自动拍照</text>
            </view>
            <view class="step-illust">
              <view class="illust-head"></view>
              <view class="illust-cone"></view>
              <view class="illust-phone rear"></view>
            </view>
          </view>

          <view class="tutorial-footer">
            <text class="countdown-icon">⏱</text>
            <text class="countdown-text">{{ tutorialLeft }}S后结束</text>
          </view>
        </view>

        <view class="tutorial-close" @tap="closeTutorial">
          <text class="tutorial-close-x">×</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(20)
const autoMode = ref(true)
const frontCamera = ref(true)
const windowHeight = ref(667)
const volume = ref(47)
const showTutorial = ref(false)
const tutorialLeft = ref(2)
const targetType = ref('self')

let tutorialTimer = null

const pageStyle = computed(() => ({
  minHeight: windowHeight.value + 'px',
  height: windowHeight.value + 'px',
  backgroundColor: '#3a322c'
}))

onLoad((query) => {
  if (query && query.target === 'friend') {
    targetType.value = 'friend'
  } else {
    targetType.value = 'self'
  }
  try {
    uni.setStorageSync('skinTestTarget', targetType.value)
  } catch (e) {}
})

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    windowHeight.value = info.windowHeight || 667
  } catch (e) {}
  openTutorial()
})

onUnmounted(() => {
  clearTutorialTimer()
})

function clearTutorialTimer() {
  if (tutorialTimer) {
    clearInterval(tutorialTimer)
    tutorialTimer = null
  }
}

function onTutorialTap() {
  openTutorial()
}

function openTutorial() {
  clearTutorialTimer()
  showTutorial.value = true
  tutorialLeft.value = 2
  tutorialTimer = setInterval(() => {
    tutorialLeft.value -= 1
    if (tutorialLeft.value <= 0) {
      closeTutorial()
    }
  }, 1000)
}

function closeTutorial() {
  clearTutorialTimer()
  showTutorial.value = false
}

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/skin-test/index' })
    }
  })
}

function toggleMode() {
  autoMode.value = !autoMode.value
  uni.showToast({
    title: autoMode.value ? '已切换自动拍照' : '已切换手动拍照',
    icon: 'none'
  })
}

function onAlbum() {
  uni.chooseImage({
    count: 1,
    sourceType: ['album'],
    success() {
      uni.showToast({ title: '已选择照片', icon: 'none' })
    },
    fail() {
      uni.showToast({ title: '打开相册', icon: 'none' })
    }
  })
}

function onFlip() {
  frontCamera.value = !frontCamera.value
}
</script>

<style lang="scss">
page {
  background-color: #3a322c !important;
}
</style>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  position: relative;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.camera-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.camera-dim {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.28);
  z-index: 0;
}

.status-bar,
.top-bar,
.guide-area,
.bottom-area {
  position: relative;
  z-index: 1;
}

.status-bar {
  flex-shrink: 0;
  width: 100%;
}

.top-bar {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8rpx 28rpx 0;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 140rpx;
}

.icon-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-txt {
  color: #ffffff;
  font-size: 52rpx;
  line-height: 1;
  font-weight: 300;
}

.vol-text {
  color: #ffffff;
  font-size: 22rpx;
}

.tip-bubble {
  margin-top: 4rpx;
  background: $primary-color;
  border-radius: 12rpx;
  padding: 12rpx 18rpx;
  max-width: 300rpx;
}

.tip-text {
  color: #ffffff;
  font-size: 22rpx;
  line-height: 1.3;
}

.top-right {
  display: flex;
  gap: 16rpx;
  min-width: 140rpx;
  justify-content: flex-end;
}

.mode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72rpx;
}

.mode-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}

.mode-icon {
  color: #ffffff;
  font-size: 26rpx;
}

.mode-label {
  color: #ffffff;
  font-size: 20rpx;
}

.guide-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200rpx;
  padding: 20rpx 0;
}

.face-hint {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
  padding: 12rpx 28rpx;
  margin-bottom: 36rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #000000;
  font-weight: 600;
}

.hint-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $primary-color;
}

.face-frame {
  position: relative;
  width: 440rpx;
  height: 520rpx;
  flex-shrink: 0;
}

.corner {
  position: absolute;
  width: 48rpx;
  height: 48rpx;
  border-color: #ffffff;
  border-style: solid;
}

.corner.tl {
  top: 0;
  left: 0;
  border-width: 4rpx 0 0 4rpx;
}

.corner.tr {
  top: 0;
  right: 0;
  border-width: 4rpx 4rpx 0 0;
}

.corner.bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 4rpx 4rpx;
}

.corner.br {
  bottom: 0;
  right: 0;
  border-width: 0 4rpx 4rpx 0;
}

.face-oval {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 300rpx;
  height: 380rpx;
  margin-left: -150rpx;
  margin-top: -190rpx;
  border: 3rpx solid #ffffff;
  border-radius: 50%;
  box-sizing: border-box;
}

.brow {
  position: absolute;
  top: 28%;
  width: 64rpx;
  height: 0;
  border-top: 3rpx dashed rgba(255, 255, 255, 0.9);
}

.brow.left {
  left: 18%;
  transform: rotate(-8deg);
}

.brow.right {
  right: 18%;
  transform: rotate(8deg);
}

.nose-line {
  position: absolute;
  left: 50%;
  top: 32%;
  width: 0;
  height: 110rpx;
  margin-left: -1rpx;
  border-left: 3rpx dashed rgba(255, 255, 255, 0.9);
}

.bottom-area {
  flex-shrink: 0;
  padding: 0 28rpx 20rpx;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin-bottom: 24rpx;
}

.disc-icon {
  color: #ffffff;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.disc-text {
  flex: 1;
  color: rgba(255, 255, 255, 0.95);
  font-size: 20rpx;
  line-height: 1.5;
}

.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12rpx;
}

.bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.bottom-spacer {
  flex: 1;
}

.bottom-icon {
  color: #ffffff;
  font-size: 44rpx;
  margin-bottom: 6rpx;
}

.bottom-label {
  color: #ffffff;
  font-size: 22rpx;
}

/* ===== 肤测教程 ===== */
.tutorial-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  box-sizing: border-box;
}

.tutorial-wrap {
  width: 100%;
  max-width: 620rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tutorial-card {
  width: 100%;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 36rpx 36rpx 28rpx;
  box-sizing: border-box;
}

.tutorial-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 28rpx;
}

.tutorial-step {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
}

.step-num {
  width: 56rpx;
  font-size: 52rpx;
  font-weight: 700;
  color: rgba(139, 124, 246, 0.55);
  line-height: 1;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 28rpx;
  color: #222222;
  font-weight: 500;
  line-height: 1.4;
}

.step-text-wrap {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.step-text.highlight {
  color: $primary-color;
  flex: none;
}

.step-illust {
  width: 120rpx;
  height: 72rpx;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.illust-head {
  width: 36rpx;
  height: 44rpx;
  border: 3rpx solid rgba(139, 124, 246, 0.7);
  border-radius: 18rpx 18rpx 14rpx 14rpx;
  position: absolute;
  left: 8rpx;
  top: 12rpx;
}

.illust-phone {
  width: 28rpx;
  height: 44rpx;
  border: 3rpx solid rgba(139, 124, 246, 0.7);
  border-radius: 6rpx;
  position: absolute;
  right: 8rpx;
  top: 14rpx;
  background: rgba(139, 124, 246, 0.08);
}

.illust-phone.rear {
  background: rgba(139, 124, 246, 0.2);
}

.illust-waves {
  position: absolute;
  left: 48rpx;
  top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.wave {
  width: 22rpx;
  height: 6rpx;
  border-top: 3rpx solid rgba(139, 124, 246, 0.55);
  border-radius: 50%;
}

.illust-cone {
  position: absolute;
  right: 36rpx;
  top: 18rpx;
  width: 0;
  height: 0;
  border-top: 18rpx solid transparent;
  border-bottom: 18rpx solid transparent;
  border-right: 28rpx solid rgba(255, 100, 100, 0.35);
}

.tutorial-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding-top: 8rpx;
}

.countdown-icon {
  font-size: 22rpx;
  color: #999999;
}

.countdown-text {
  font-size: 22rpx;
  color: #999999;
}

.tutorial-close {
  margin-top: 36rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.tutorial-close-x {
  font-size: 44rpx;
  color: #333333;
  line-height: 1;
  font-weight: 300;
}
</style>
