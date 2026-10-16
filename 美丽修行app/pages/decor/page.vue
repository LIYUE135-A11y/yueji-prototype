<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">{{ pageData.name || '专题页' }}</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view v-for="(mod, idx) in pageData.modules" :key="idx" class="mod">
        <block v-if="mod.type === 'banner' || mod.type === 'hero'">
          <view class="mod-banner" :class="{ hero: mod.type === 'hero' }">
            <image v-if="mod.image" class="mod-banner-img" :src="mod.image" mode="aspectFill" />
            <view v-else class="mod-banner-fallback"></view>
            <view class="mod-banner-mask">
              <text class="mod-banner-title">{{ mod.title }}</text>
              <text v-if="mod.subtitle || mod.text" class="mod-banner-sub">{{ mod.subtitle || mod.text }}</text>
              <view v-if="mod.cta" class="mod-cta" @tap="onCta(mod)">
                <text class="mod-cta-text">{{ mod.cta }}</text>
              </view>
            </view>
          </view>
        </block>

        <block v-else-if="mod.type === 'countdown'">
          <view class="mod-card">
            <text class="mod-card-title">{{ mod.title }}</text>
            <text class="mod-card-sub">{{ mod.subtitle }}</text>
            <text v-if="mod.endDate" class="mod-card-meta">截止：{{ mod.endDate }}</text>
            <view v-if="mod.cta" class="mod-cta solid" @tap="onCta(mod)">
              <text class="mod-cta-text">{{ mod.cta }}</text>
            </view>
          </view>
        </block>

        <block v-else-if="mod.type === 'coupon'">
          <view class="mod-coupon">
            <view class="mod-coupon-left">
              <text class="mod-coupon-code">{{ mod.coupon || '券' }}</text>
            </view>
            <view class="mod-coupon-right">
              <text class="mod-card-title">{{ mod.title }}</text>
              <text class="mod-card-sub">{{ mod.subtitle }}</text>
              <view class="mod-cta solid" @tap="onClaim(mod)">
                <text class="mod-cta-text">{{ mod.cta || '领取' }}</text>
              </view>
            </view>
          </view>
        </block>

        <block v-else-if="mod.type === 'grid'">
          <view class="mod-card">
            <text class="mod-card-title">{{ mod.title }}</text>
            <view class="mod-grid">
              <view v-for="(it, i) in (mod.items || [])" :key="i" class="mod-grid-item" @tap="onItem(it)">
                <view class="mod-grid-thumb"></view>
                <text class="mod-grid-name">{{ it }}</text>
              </view>
            </view>
          </view>
        </block>

        <block v-else-if="mod.type === 'story'">
          <view class="mod-card">
            <text class="mod-card-title">{{ mod.title }}</text>
            <text v-for="(p, i) in (mod.paragraphs || [])" :key="i" class="mod-para">{{ p }}</text>
          </view>
        </block>

        <block v-else-if="mod.type === 'task'">
          <view class="mod-card">
            <text class="mod-card-title">{{ mod.title }}</text>
            <view v-for="(it, i) in (mod.items || [])" :key="i" class="mod-task-row">
              <text class="mod-task-dot">{{ i + 1 }}</text>
              <text class="mod-task-text">{{ it }}</text>
            </view>
          </view>
        </block>

        <block v-else-if="mod.type === 'cta'">
          <view class="mod-cta-block">
            <text class="mod-banner-title dark">{{ mod.title }}</text>
            <text v-if="mod.subtitle" class="mod-banner-sub dark">{{ mod.subtitle }}</text>
            <view class="mod-cta solid" @tap="onCta(mod)">
              <text class="mod-cta-text">{{ mod.cta || '立即前往' }}</text>
            </view>
          </view>
        </block>

        <block v-else>
          <view class="mod-card">
            <text class="mod-card-title">{{ mod.title || '内容模块' }}</text>
            <text v-if="mod.subtitle || mod.text" class="mod-card-sub">{{ mod.subtitle || mod.text }}</text>
            <view v-if="mod.items && mod.items.length" class="mod-tag-row">
              <text v-for="(it, i) in mod.items" :key="i" class="mod-tag">{{ it }}</text>
            </view>
          </view>
        </block>
      </view>

      <view v-if="!pageData.modules || !pageData.modules.length" class="empty">
        <text class="empty-text">页面内容准备中</text>
      </view>
      <view class="list-end"><text class="end-text">— 已经到底啦 —</text></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { resolveDecorPage } from '../../common/decor-page-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const pageData = ref({ name: '', modules: [] })

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = (info.windowHeight - (info.statusBarHeight || 20) - 44) + 'px'
  } catch (e) { /* ignore */ }
  pageData.value = resolveDecorPage(query || {})
})

function goBack() {
  uni.navigateBack({
    delta: 1,
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function onCta() {
  uni.showToast({ title: '已进入会场精选', icon: 'none' })
}

function onClaim() {
  uni.showToast({ title: '领取成功', icon: 'none' })
}

function onItem(it) {
  uni.showToast({ title: String(it || '好物'), icon: 'none' })
}
</script>

<style scoped>
.page { min-height: 100vh; background: #F7F5FC; }
.status-bar { background: #fff; }
.nav-bar {
  height: 88rpx; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24rpx; background: #fff; border-bottom: 1rpx solid #F0ECF8;
}
.nav-btn { width: 64rpx; height: 64rpx; display: flex; align-items: center; justify-content: center; }
.nav-back { font-size: 48rpx; color: #333; line-height: 1; }
.nav-title { flex: 1; text-align: center; font-size: 32rpx; font-weight: 600; color: #111; }
.nav-placeholder { width: 64rpx; }
.scroll { width: 100%; }
.mod { margin-bottom: 20rpx; }
.mod-banner {
  position: relative; min-height: 360rpx; background: linear-gradient(135deg, #EDE7FF, #F8E8F0);
  overflow: hidden;
}
.mod-banner.hero { min-height: 280rpx; }
.mod-banner-img { width: 100%; height: 360rpx; }
.mod-banner-fallback { width: 100%; height: 360rpx; }
.mod-banner-mask {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 40rpx 32rpx;
  background: linear-gradient(transparent, rgba(40, 20, 60, 0.55));
}
.mod-banner-title { display: block; font-size: 40rpx; font-weight: 700; color: #fff; }
.mod-banner-title.dark { color: #2A2040; }
.mod-banner-sub { display: block; margin-top: 12rpx; font-size: 26rpx; color: rgba(255,255,255,0.9); line-height: 1.5; }
.mod-banner-sub.dark { color: #7A6F90; }
.mod-card {
  margin: 0 24rpx; padding: 28rpx; background: #fff; border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(120, 90, 180, 0.06);
}
.mod-card-title { display: block; font-size: 30rpx; font-weight: 600; color: #222; }
.mod-card-sub { display: block; margin-top: 10rpx; font-size: 24rpx; color: #888; line-height: 1.5; }
.mod-card-meta { display: block; margin-top: 12rpx; font-size: 22rpx; color: #A08CC8; }
.mod-para { display: block; margin-top: 16rpx; font-size: 26rpx; color: #555; line-height: 1.7; }
.mod-cta {
  margin-top: 20rpx; display: inline-flex; align-items: center; justify-content: center;
  padding: 14rpx 28rpx; border-radius: 999rpx; background: rgba(255,255,255,0.2);
  border: 1rpx solid rgba(255,255,255,0.5);
}
.mod-cta.solid {
  background: #8B7CF6; border: none;
}
.mod-cta-text { font-size: 24rpx; color: #fff; font-weight: 600; }
.mod-coupon {
  margin: 0 24rpx; display: flex; background: #fff; border-radius: 20rpx; overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(120, 90, 180, 0.06);
}
.mod-coupon-left {
  width: 160rpx; background: linear-gradient(160deg, #8B7CF6, #C4A8F5);
  display: flex; align-items: center; justify-content: center;
}
.mod-coupon-code { color: #fff; font-size: 28rpx; font-weight: 700; }
.mod-coupon-right { flex: 1; padding: 24rpx; }
.mod-grid { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 20rpx; }
.mod-grid-item { width: calc(50% - 8rpx); }
.mod-grid-thumb {
  height: 160rpx; border-radius: 16rpx;
  background: linear-gradient(135deg, #F0EBFF, #FDEEF5);
}
.mod-grid-name { display: block; margin-top: 10rpx; font-size: 24rpx; color: #444; }
.mod-task-row { display: flex; align-items: flex-start; gap: 16rpx; margin-top: 16rpx; }
.mod-task-dot {
  width: 36rpx; height: 36rpx; border-radius: 50%; background: #EEE8FF; color: #8B7CF6;
  font-size: 22rpx; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mod-task-text { font-size: 26rpx; color: #555; line-height: 1.5; }
.mod-cta-block {
  margin: 12rpx 24rpx 24rpx; padding: 36rpx 28rpx; border-radius: 20rpx;
  background: #fff; text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(120, 90, 180, 0.06);
}
.mod-tag-row { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
.mod-tag {
  padding: 8rpx 16rpx; border-radius: 999rpx; background: #F3EFFC;
  font-size: 22rpx; color: #6B5CAD;
}
.empty { padding: 120rpx 0; text-align: center; }
.empty-text { color: #999; font-size: 26rpx; }
.list-end { padding: 24rpx 0 48rpx; text-align: center; }
.end-text { font-size: 22rpx; color: #C0B8D0; }
</style>
