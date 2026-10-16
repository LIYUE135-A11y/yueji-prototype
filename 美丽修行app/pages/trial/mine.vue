<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack"><text class="nav-back">‹</text></view>
      <text class="nav-title">我的试用</text>
      <view class="nav-right"></view>
    </view>

    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @tap="activeTab = tab.id"
      >
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view class="empty">
        <view class="empty-art">
          <view class="box">
            <view class="box-lid"></view>
            <view class="paper"><text class="q">?</text></view>
          </view>
          <view class="person">
            <view class="head"></view>
            <view class="body"></view>
            <view class="skirt"></view>
          </view>
          <view class="spark a"></view>
          <view class="spark b"></view>
          <view class="cloud c1"></view>
          <view class="cloud c2"></view>
        </view>
        <text class="empty-text">{{ emptyText }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const activeTab = ref('activity')

const tabs = [
  { id: 'activity', name: '试用活动' },
  { id: 'won', name: '已中奖' }
]

const emptyText = computed(() =>
  activeTab.value === 'won'
    ? "还木有中奖呢(‘⊙ω⊙’)"
    : "还木有参加过呢(‘⊙ω⊙’)"
)

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const nav = 44
    const tabsH = 44
    scrollHeight.value = `${info.windowHeight - statusBarHeight.value - nav - tabsH}px`
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.navigateTo({ url: '/pages/trial/index' })
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.status-bar, .nav-bar, .tabs { background: #fff; flex-shrink: 0; }

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  position: relative;
}

.nav-btn {
  width: 64rpx; height: 64rpx;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}

.nav-back { font-size: 52rpx; color: #111; line-height: 1; font-weight: 300; }

.nav-title {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 34rpx; font-weight: 700; color: #111;
}

.nav-right { width: 64rpx; margin-left: auto; }

.tabs {
  display: flex;
  height: 88rpx;
  border-bottom: 1rpx solid #F2F2F2;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: #999;
  font-weight: 500;
}

.tab.active .tab-text {
  color: #111;
  font-weight: 700;
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #8A63F2;
}

.scroll { flex: 1; min-height: 0; }

.empty {
  padding: 160rpx 40rpx 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-art {
  width: 420rpx;
  height: 320rpx;
  position: relative;
  margin-bottom: 36rpx;
}

.box {
  position: absolute;
  left: 48rpx;
  top: 90rpx;
  width: 160rpx;
  height: 110rpx;
  background: linear-gradient(180deg, #B8A4F8, #8A63F2);
  border-radius: 12rpx 12rpx 20rpx 20rpx;
}

.box-lid {
  position: absolute;
  left: -10rpx;
  top: -28rpx;
  width: 180rpx;
  height: 36rpx;
  background: #C4B5FD;
  border-radius: 10rpx;
  transform: rotate(-8deg);
}

.paper {
  position: absolute;
  left: 48rpx;
  top: -70rpx;
  width: 64rpx;
  height: 90rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(138, 99, 242, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.q {
  font-size: 48rpx;
  font-weight: 800;
  color: #F5C542;
  line-height: 1;
}

.person {
  position: absolute;
  right: 60rpx;
  top: 70rpx;
  width: 120rpx;
  height: 200rpx;
}

.head {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #FFD7C2;
  margin: 0 auto;
  box-shadow: 0 -8rpx 0 8rpx #3A2A5A;
}

.body {
  width: 70rpx;
  height: 56rpx;
  margin: 8rpx auto 0;
  background: #fff;
  border-radius: 12rpx;
  border: 2rpx solid #E8E4F8;
}

.skirt {
  width: 90rpx;
  height: 70rpx;
  margin: -4rpx auto 0;
  background: #8A63F2;
  border-radius: 8rpx 8rpx 28rpx 28rpx;
}

.spark {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: #F5C542;
  transform: rotate(45deg);
  border-radius: 2rpx;
}
.spark.a { left: 36rpx; top: 40rpx; }
.spark.b { left: 200rpx; top: 30rpx; width: 12rpx; height: 12rpx; }

.cloud {
  position: absolute;
  background: #EFEAFF;
  border-radius: 999rpx;
  opacity: 0.9;
}
.cloud.c1 { width: 80rpx; height: 36rpx; left: 20rpx; bottom: 40rpx; }
.cloud.c2 { width: 60rpx; height: 28rpx; right: 40rpx; bottom: 60rpx; }

.empty-text {
  font-size: 28rpx;
  color: #B0B0B5;
  text-align: center;
}
</style>
