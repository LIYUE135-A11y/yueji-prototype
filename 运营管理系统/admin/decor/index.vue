<template>
  <view class="sub-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">店铺装修</text>
      <view style="width:56rpx"></view>
    </view>
    <scroll-view scroll-y class="page-body">
      <DecorPanel />
    </scroll-view>
  </view>
</template>
<script>
import DecorPanel from './DecorPanel.vue'
export default {
  components: { DecorPanel },
  methods: {
    goBack() {
      uni.navigateBack({ delta: 1, fail: () => { uni.reLaunch({ url: '/admin/index' }) } })
    }
  }
}
</script>
<style lang="scss">
@import '../../uni.scss';
.sub-page { min-height: 100vh; background: $purple-surface; display: flex; flex-direction: column; }
.header-bar {
  height: 88rpx; min-height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex; align-items: center; justify-content: space-between; padding: 0 28rpx;
  box-shadow: 0 4rpx 16rpx rgba($primary-color, 0.25);
}
.back-btn { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; }
.back-arrow { font-size: 56rpx; font-weight: 300; color: #fff; line-height: 1; }
.header-title { font-size: 32rpx; font-weight: 700; color: #fff; letter-spacing: 1rpx; }
.page-body { flex: 1; padding: 24rpx; height: 0; }
</style>
