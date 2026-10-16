<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">备孕油皮抗纹修护方案</text>
      <view class="nav-more">
        <text class="nav-dot">⋯</text>
      </view>
    </view>

    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @tap="activeTab = tab.id"
      >
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="content">
        <view class="card">
          <text class="card-title">当前的肌肤状态</text>
          <view class="tag-row">
            <text v-for="tag in skinTags" :key="tag" class="tag">{{ tag }}</text>
          </view>
        </view>

        <view class="card">
          <text class="card-title">14天方案预计成果</text>

          <view class="section">
            <view class="section-head">
              <view class="section-bar"></view>
              <text class="section-title">问题诊断</text>
            </view>
            <text class="section-text">油皮伴有细纹（主要为表情纹），轻度敏感，右脸颊中度色沉，混合类型黑眼圈，轻度黑头。</text>
          </view>

          <view class="section">
            <view class="section-head">
              <view class="section-bar"></view>
              <text class="section-title">现阶段目标</text>
            </view>
            <text class="section-text">屏障稳定、轻度抗衰、管理色沉和黑眼圈，避开孕期禁用成分。</text>
          </view>

          <view class="section">
            <view class="section-head">
              <view class="section-bar"></view>
              <text class="section-title">预估成果</text>
            </view>
            <text class="section-text">2周内油脂平衡，细纹改善约30%，色沉黑眼圈淡化，无刺激。</text>
          </view>

          <view class="section">
            <view class="section-head">
              <view class="section-bar"></view>
              <text class="section-title">第二目标</text>
            </view>
            <text class="section-text">毛孔状态、肤质纹理长期健康改善。</text>
          </view>

          <view class="section">
            <view class="section-head">
              <view class="section-bar"></view>
              <text class="section-title">总结</text>
            </view>
            <text class="section-text">通过科学分层护理和安全成分组合，在孕期也能稳步改善油皮抗纹与修护需求。</text>
          </view>
        </view>
      </view>
      <view class="bottom-space"></view>
    </scroll-view>

    <view class="feedback-float" @tap="onFeedback">
      <text class="feedback-emoji">👧</text>
      <text class="feedback-label">意见反馈</text>
    </view>

    <view class="footer">
      <view class="cta-btn" @tap="onCustomize">
        <text class="cta-text">定制我的专属方案</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const activeTab = ref('report')

const tabs = [
  { id: 'report', name: 'AI肤质报告' },
  { id: 'desk', name: '梳妆台分析' },
  { id: 'product', name: '产品推荐' },
  { id: 'guide', name: '跟练指南' }
]

const skinTags = [
  '轻度敏感',
  '轻度色沉',
  '轻度皱纹',
  '轻度黑眼圈',
  '轻度黑头'
]

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const navH = 44
    const tabH = 44
    const footerH = 90
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - navH - tabH - footerH}px`
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function onFeedback() {
  uni.showToast({ title: '意见反馈', icon: 'none' })
}

function onCustomize() {
  uni.navigateTo({
    url: '/pages/plan/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开定制方案失败',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: linear-gradient(180deg, #f3effc 0%, #f7f5fc 24%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: #f3effc;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  background: #f3effc;
}

.nav-btn {
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
  padding: 0 8rpx;
}

.nav-more {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-dot {
  font-size: 36rpx;
  color: $text-primary;
  line-height: 1;
}

.tabs {
  display: flex;
  background: #f3effc;
  padding: 0 8rpx 8rpx;
  border-bottom: 1rpx solid rgba(139, 124, 246, 0.08);
}

.tab-item {
  flex: 1;
  padding: 16rpx 8rpx 12rpx;
  text-align: center;
  position: relative;
}

.tab-text {
  font-size: 24rpx;
  color: #999999;
}

.tab-item.active .tab-text {
  color: $primary-color;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: 0;
  height: 4rpx;
  background: $primary-color;
  border-radius: 2rpx;
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.content {
  padding: 24rpx 28rpx 0;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(139, 124, 246, 0.06);
}

.card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag {
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  font-size: 24rpx;
  color: #666666;
}

.section {
  margin-bottom: 28rpx;
}

.section:last-child {
  margin-bottom: 0;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.section-bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 3rpx;
  background: $primary-color;
  flex-shrink: 0;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.65;
}

.bottom-space {
  height: 40rpx;
}

.feedback-float {
  position: fixed;
  right: 24rpx;
  bottom: 200rpx;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.feedback-emoji {
  width: 72rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 50%;
  background: $primary-color;
  font-size: 32rpx;
  box-shadow: 0 6rpx 16rpx rgba(139, 124, 246, 0.35);
}

.feedback-label {
  font-size: 20rpx;
  color: $primary-color;
}

.footer {
  flex-shrink: 0;
  padding: 16rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.cta-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(90deg, #a78bfa 0%, #8b7cf6 50%, #7c6df0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.35);
}

.cta-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
