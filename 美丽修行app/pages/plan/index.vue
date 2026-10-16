<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <!-- 广告头图：文案已含在图片中 -->
      <view class="hero">
        <image
          class="ad-banner"
          src="/static/images/plan-ad-banner.png"
          mode="aspectFill"
        />
        <view class="nav-bar">
          <view class="nav-btn" @tap="goBack">
            <text class="nav-back">‹</text>
          </view>
        </view>
      </view>

      <view class="body">
        <view class="quote-card">
          <text class="quote-line">动辄浪费数千上万，皮肤问题愈演愈烈!</text>
          <text class="quote-line soft">一杯奶茶钱，省下上千元学费</text>
        </view>

        <view class="compare-wrap">
          <view class="compare-labels">
            <text class="label-item">时间</text>
            <text class="label-item">依据</text>
            <text class="label-item">结果</text>
            <text class="label-item">花费</text>
          </view>

          <view class="compare-cols">
            <view class="compare-col highlight">
              <text class="col-title">阅己美妆定制</text>
              <view class="col-cell">
                <text class="cell-line">30分钟内</text>
                <text class="cell-line">1V1生成</text>
              </view>
              <view class="col-cell">
                <text class="cell-line">亿级数据+</text>
                <text class="cell-line">专家审核</text>
              </view>
              <view class="col-cell">
                <text class="cell-line">低踩坑</text>
                <text class="cell-line">精准有效</text>
              </view>
              <view class="col-cell">
                <text class="cell-line">预算内买对</text>
              </view>
            </view>
            <view class="compare-col plain">
              <text class="col-title muted">自己做功课</text>
              <view class="col-cell muted">
                <text class="cell-line">7天+</text>
                <text class="cell-line">反复翻看对比</text>
              </view>
              <view class="col-cell muted">
                <text class="cell-line">碎片化种草</text>
              </view>
              <view class="col-cell muted">
                <text class="cell-line">高踩坑</text>
                <text class="cell-line">易踩雷</text>
              </view>
              <view class="col-cell muted">
                <text class="cell-line">花钱打水漂</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="footer">
      <view class="cta-btn" @tap="onStart">
        <text class="cta-text">点击开启你的1V1定制之旅</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const footerH = 90
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - footerH}px`
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function onStart() {
  uni.navigateTo({
    url: '/pages/skin-guide/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '开启1V1定制失败',
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
  background: $primary-bg;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: $purple-surface;
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.hero {
  background: $purple-surface;
  padding: 0;
  line-height: 0;
  position: relative;
  /* 16:9 头图正常比例 */
  height: 422rpx;
  overflow: hidden;
}

.ad-banner {
  width: 100%;
  height: 100%;
  display: block;
}

.nav-bar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  z-index: 2;
  background: transparent;
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
  font-weight: 300;
}

.body {
  padding: 28rpx 32rpx 0;
  background: $primary-bg;
}

.quote-card {
  background: $card-bg;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx $shadow-color;
  margin-bottom: 28rpx;
}

.quote-line {
  display: block;
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.6;
  font-weight: 600;
}

.quote-line.soft {
  margin-top: 8rpx;
  color: $text-secondary;
  font-weight: 500;
}

.compare-wrap {
  background: $card-bg;
  border-radius: 24rpx;
  padding: 28rpx 16rpx 20rpx;
  box-shadow: 0 8rpx 32rpx $shadow-color;
  display: flex;
  gap: 8rpx;
}

.compare-labels {
  width: 72rpx;
  flex-shrink: 0;
  padding-top: 72rpx;
  display: flex;
  flex-direction: column;
}

.label-item {
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: $text-hint;
}

.compare-cols {
  flex: 1;
  display: flex;
  gap: 12rpx;
  min-width: 0;
}

.compare-col {
  flex: 1;
  min-width: 0;
  border-radius: 16rpx;
  padding: 16rpx 10rpx 12rpx;
  display: flex;
  flex-direction: column;
}

.compare-col.highlight {
  background: $primary-bg;
  box-shadow: 0 8rpx 28rpx rgba(139, 124, 246, 0.18);
  border: 2rpx solid rgba(139, 124, 246, 0.2);
}

.compare-col.plain {
  background: $purple-surface;
}

.col-title {
  height: 56rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 16rpx;
  line-height: 1.3;
}

.col-title.muted {
  color: $text-hint;
  font-weight: 600;
}

.col-cell {
  height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cell-line {
  font-size: 22rpx;
  color: $text-primary;
  line-height: 1.35;
  font-weight: 500;
}

.col-cell.muted .cell-line {
  color: $text-hint;
  font-weight: 400;
}

.bottom-space {
  height: 24rpx;
}

.footer {
  flex-shrink: 0;
  padding: 16rpx 40rpx calc(24rpx + env(safe-area-inset-bottom));
  background: $primary-bg;
}

.cta-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.35);
}

.cta-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}
</style>
