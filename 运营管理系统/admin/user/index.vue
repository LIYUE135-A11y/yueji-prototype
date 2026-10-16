<template>
  <view class="sub-page">
    <view class="header-bar">
      <view class="back-btn" @click="goBack"><text class="back-arrow">‹</text></view>
      <text class="header-title">用户管理</text>
      <view style="width:56rpx"></view>
    </view>
    <scroll-view scroll-y class="page-body">
      <view class="content-card">
        <view class="card-header">
          <view class="card-title-row">
            <view class="card-title-icon"><text>👥</text></view>
            <text class="card-title">用户管理</text>
          </view>
        </view>
        <view class="card-body">
          <view class="empty-placeholder">
            <text class="empty-icon">👥</text>
            <text class="empty-text">用户管理</text>
            <text class="empty-tip">（内容为空 - 暂未填充业务数据）</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>
<script>
export default {
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
.page-body { flex: 1; padding: 40rpx; height: 0; }
.content-card {
  background: #fff; border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba($primary-color, 0.08);
  min-height: 100%; display: flex; flex-direction: column;
}
.card-header {
  padding: 36rpx 44rpx; border-bottom: 1px solid $purple-border;
  background: linear-gradient(180deg, #FAF8FF 0%, #FFFFFF 100%);
  border-radius: 24rpx 24rpx 0 0;
}
.card-title-row { display: flex; align-items: center; gap: 20rpx; }
.card-title-icon {
  width: 64rpx; height: 64rpx; border-radius: 16rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex; align-items: center; justify-content: center; font-size: 36rpx;
  box-shadow: 0 6rpx 20rpx rgba($primary-color, 0.3);
}
.card-title { font-size: 34rpx; font-weight: 700; color: #000; }
.card-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 80rpx 40rpx; }
.empty-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 32rpx; padding: 120rpx 40rpx;
}
.empty-icon { font-size: 144rpx; line-height: 1; opacity: 0.85; }
.empty-text { font-size: 32rpx; color: #888; font-weight: 500; }
.empty-tip { font-size: 24rpx; color: #BBB; margin-top: -12rpx; }
</style>
