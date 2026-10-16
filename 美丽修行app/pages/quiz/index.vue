<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">小问答</text>
      <view class="nav-right">
        <text class="timer-badge">{{ remain }}s</text>
      </view>
    </view>

    <view class="hero">
      <text class="hero-tag">每日必答</text>
      <text class="hero-title">卷王挑战 · 10秒快速问答</text>
      <text class="hero-desc">答对赢积分，边玩边涨护肤知识</text>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="progress-row">
        <text class="progress-text">第 {{ current + 1 }} / {{ questions.length }} 题</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressWidth }"></view>
        </view>
      </view>

      <view class="q-card">
        <text class="q-title">{{ currentQ.title }}</text>
        <view
          v-for="(opt, idx) in currentQ.options"
          :key="idx"
          class="opt"
          :class="{
            active: selected === idx,
            correct: answered && idx === currentQ.answer,
            wrong: answered && selected === idx && idx !== currentQ.answer
          }"
          @tap="pick(idx)"
          @click="pick(idx)"
        >
          <text class="opt-key">{{ optKeys[idx] }}</text>
          <text class="opt-text">{{ opt }}</text>
        </view>
      </view>

      <view v-if="answered" class="tip-card">
        <text class="tip-title">{{ selected === currentQ.answer ? '答对了！' : '再接再厉' }}</text>
        <text class="tip-desc">{{ currentQ.tip }}</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="footer">
      <view class="cta-btn" @tap="onCta" @click="onCta">
        <text class="cta-text">{{ ctaText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const current = ref(0)
const selected = ref(-1)
const answered = ref(false)
const remain = ref(10)
const score = ref(0)
let timer = null

const optKeys = ['A', 'B', 'C', 'D']

const questions = [
  {
    title: '敏感肌日常护肤，最先要做的是？',
    options: ['猛上酸类产品', '先维稳屏障', '天天换新品', '只用水洗脸'],
    answer: 1,
    tip: '敏感肌优先修护屏障，再谈功效叠加。'
  },
  {
    title: '防晒一般建议多久补涂一次？',
    options: ['2–3小时', '8小时一次', '只用早上', '下雨不用涂'],
    answer: 0,
    tip: '户外活动建议每2–3小时补涂防晒。'
  },
  {
    title: '「批号」主要用来查询什么？',
    options: ['物流单号', '生产批次与保质信息', '优惠券码', '会员等级'],
    answer: 1,
    tip: '批号可核对生产批次，辅助判断保质期。'
  }
]

const currentQ = computed(() => questions[current.value])
const progressWidth = computed(() => `${((current.value + 1) / questions.length) * 100}%`)
const ctaText = computed(() => {
  if (!answered.value) return '确认作答'
  if (current.value >= questions.length - 1) return '完成挑战'
  return '下一题'
})

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const footerH = 90
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - 44 - footerH}px`
  } catch (e) {}
  startTimer()
})

onUnmounted(() => {
  clearTimer()
})

function startTimer() {
  clearTimer()
  remain.value = 10
  timer = setInterval(() => {
    if (remain.value <= 1) {
      remain.value = 0
      clearTimer()
      if (!answered.value) {
        answered.value = true
        uni.showToast({ title: '时间到', icon: 'none' })
      }
      return
    }
    remain.value -= 1
  }, 1000)
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function goBack() {
  clearTimer()
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/discover/index' })
    }
  })
}

function pick(idx) {
  if (answered.value) return
  selected.value = idx
}

function onCta() {
  if (!answered.value) {
    if (selected.value < 0) {
      uni.showToast({ title: '请先选择答案', icon: 'none' })
      return
    }
    answered.value = true
    clearTimer()
    if (selected.value === currentQ.value.answer) {
      score.value += 1
    }
    return
  }

  if (current.value >= questions.length - 1) {
    uni.showToast({
      title: `挑战完成 · 答对 ${score.value}/${questions.length}`,
      icon: 'none'
    })
    setTimeout(goBack, 600)
    return
  }

  current.value += 1
  selected.value = -1
  answered.value = false
  startTimer()
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: $purple-surface;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: #ffffff;
}

.nav-bar {
  height: 88rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
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
  color: $text-primary;
  line-height: 1;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.nav-right {
  min-width: 64rpx;
  display: flex;
  justify-content: flex-end;
}

.timer-badge {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: $purple-placeholder;
  color: $primary-color;
  font-size: 22rpx;
  font-weight: 600;
}

.hero {
  margin: 20rpx 24rpx 0;
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, $primary-light, $primary-color);
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.25);
}

.hero-tag {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 20rpx;
  margin-bottom: 12rpx;
}

.hero-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.hero-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.scroll {
  padding: 20rpx 24rpx 0;
  box-sizing: border-box;
}

.progress-row {
  margin-bottom: 16rpx;
}

.progress-text {
  font-size: 22rpx;
  color: $text-hint;
  margin-bottom: 10rpx;
  display: block;
}

.progress-track {
  height: 10rpx;
  border-radius: 999rpx;
  background: #ebe6f8;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: $primary-color;
}

.q-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.q-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.opt {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 22rpx 20rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  background: $card-tint;
  border: 2rpx solid transparent;
}

.opt:last-child {
  margin-bottom: 0;
}

.opt.active {
  border-color: $primary-color;
  background: $purple-placeholder;
}

.opt.correct {
  border-color: $primary-color;
  background: rgba(139, 124, 246, 0.12);
}

.opt.wrong {
  border-color: #ff8a8a;
  background: #fff5f5;
}

.opt-key {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: $purple-placeholder;
  color: $primary-color;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-align: center;
  line-height: 44rpx;
}

.opt-text {
  flex: 1;
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.4;
}

.tip-card {
  margin-top: 16rpx;
  padding: 22rpx 24rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.tip-title {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 8rpx;
}

.tip-desc {
  display: block;
  font-size: 24rpx;
  color: $text-hint;
  line-height: 1.5;
}

.bottom-space {
  height: 24rpx;
}

.footer {
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.cta-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(139, 124, 246, 0.35);
}

.cta-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
}
</style>
