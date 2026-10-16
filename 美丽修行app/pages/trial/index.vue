<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack"><text class="nav-back">‹</text></view>
      <text class="nav-title">试用中心</text>
      <view class="nav-right">
        <text class="nav-search" @tap="onSearch">⌕</text>
        <text class="nav-mine" @tap="onMyTrial">我的试用</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <!-- 进行中 -->
      <view class="card">
        <view class="row-main">
          <image class="cover" :src="activeTrial.img" mode="aspectFill" />
          <view class="info">
            <text class="title">{{ activeTrial.title }}</text>
            <text class="meta">参考价格：{{ activeTrial.price }}</text>
            <text class="meta">提供数量：{{ activeTrial.qty }}</text>
          </view>
        </view>
        <view class="foot">
          <view class="countdown"><text class="cd-text">距结束{{ endText }}</text></view>
          <view class="btn primary" @tap="onApply"><text>免费申请</text></view>
        </view>
      </view>

      <view class="section-div"><text class="section-text">即将上线</text></view>

      <!-- 即将上线 -->
      <view class="card">
        <view class="row-main">
          <image class="cover" :src="soonTrial.img" mode="aspectFill" />
          <view class="info">
            <text class="title">{{ soonTrial.title }}</text>
            <text class="meta">参考价格：{{ soonTrial.price }}</text>
            <text class="meta">提供数量：{{ soonTrial.qty }}</text>
          </view>
        </view>
        <view class="foot">
          <view class="countdown soon"><text class="cd-text soon">距开始{{ startText }}</text></view>
          <view class="btn-group">
            <view class="btn ghost" @tap="onRemind"><text>提醒我</text></view>
            <view class="btn primary" @tap="onViewSoon"><text>查看</text></view>
          </view>
        </view>
      </view>

      <view class="section-div"><text class="section-text">往期试用</text></view>

      <!-- 往期 -->
      <view class="card past-card">
        <view class="past-row">
          <image class="cover sm" :src="pastTrial.img" mode="aspectFill" />
          <view class="info">
            <text class="title">{{ pastTrial.title }}</text>
            <text class="hot">人气值：{{ pastTrial.hot }}</text>
            <view class="report-btn" @tap="onReport"><text>提交试用报告</text></view>
          </view>
          <view class="gift" @tap="onGift"><text>🎁</text></view>
        </view>
        <view class="review">
          <image class="avatar" :src="review.avatar" mode="aspectFill" />
          <view class="review-body">
            <text class="review-name">{{ review.user }}</text>
            <text class="review-skin">试客肤质：{{ review.skin }}</text>
            <text class="review-text">{{ review.content }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getUserAvatar } from '../../common/user-data.js'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const endText = ref('4天00小时19分26秒')
const startText = ref('4天00小时19分26秒')
let timer = null
let endAt = 0
let startAt = 0

const activeTrial = {
  id: 'a1',
  title: '第九期50份美修盒试用上线啦！',
  price: 50,
  qty: 50,
  img: '/static/images/product-trial-1.jpg'
}

const soonTrial = {
  id: 'a2',
  title: '第十期50份美修盒试用上线啦！',
  price: 50,
  qty: 50,
  img: '/static/images/product-trial-2.jpg'
}

const pastTrial = {
  id: 'p1',
  title: '110份松达婴儿山茶油霜 (正装 68g) 免费领取中，快来申请吧！',
  hot: 13879,
  img: getProductImage('p1', '松达婴儿山茶油霜')
}

const review = {
  user: '56bd8e',
  avatar: getUserAvatar('修宝012644') || '/static/images/avatar-7.jpg',
  skin: '干性敏感肌',
  content: '包装设计跟婴儿一样白嫩，白色的简约包装，还有儿...'
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmt(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${d}天${pad(h)}小时${pad(m)}分${pad(s)}秒`
}

function tick() {
  endText.value = fmt(endAt - Date.now())
  startText.value = fmt(startAt - Date.now())
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - 44}px`
  } catch (e) {}
  endAt = Date.now() + (4 * 86400 + 19 * 60 + 26) * 1000
  startAt = Date.now() + (4 * 86400 + 19 * 60 + 26) * 1000
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function goBack() {
  uni.navigateBack({
    fail() { uni.switchTab({ url: '/pages/home/index' }) }
  })
}

function onSearch() {
  uni.showToast({ title: '搜索试用即将上线', icon: 'none' })
}

function onMyTrial() {
  uni.navigateTo({
    url: '/pages/trial/mine',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开我的试用失败',
        icon: 'none'
      })
    }
  })
}

function onApply() {
  uni.showToast({ title: '已提交免费申请', icon: 'none' })
}

function onRemind() {
  uni.showToast({ title: '已设置开抢提醒', icon: 'none' })
}

function onViewSoon() {
  uni.showToast({ title: '第十期美修盒试用详情', icon: 'none' })
}

function onReport() {
  uni.showToast({ title: '提交试用报告即将上线', icon: 'none' })
}

function onGift() {
  uni.showToast({ title: '试用礼包', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #F5F5F7;
}

.status-bar, .nav-bar { background: #fff; flex-shrink: 0; }

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
}

.nav-back { font-size: 52rpx; color: #111; line-height: 1; font-weight: 300; }

.nav-title {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 34rpx; font-weight: 700; color: #111;
}

.nav-right {
  margin-left: auto;
  display: flex; align-items: center; gap: 20rpx;
}

.nav-search { font-size: 36rpx; color: #333; }
.nav-mine { font-size: 26rpx; color: #8A63F2; font-weight: 600; }

.scroll {
  flex: 1; min-height: 0;
  box-sizing: border-box;
  padding: 24rpx 24rpx 0;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.row-main {
  display: flex; gap: 20rpx; padding: 24rpx;
}

.cover {
  width: 176rpx; height: 176rpx;
  border-radius: 16rpx;
  background: #F0ECF8;
  flex-shrink: 0;
}
.cover.sm { width: 144rpx; height: 144rpx; }

.info { flex: 1; min-width: 0; }

.title {
  display: block;
  font-size: 28rpx; font-weight: 700; color: #111;
  line-height: 1.4; margin-bottom: 14rpx;
}

.meta {
  display: block;
  font-size: 24rpx; color: #999; line-height: 1.55;
}

.foot {
  display: flex; align-items: center; gap: 16rpx;
  padding: 0 20rpx 20rpx;
}

.countdown {
  flex: 1; min-width: 0;
  background: #FFF8E8;
  border-radius: 16rpx;
  padding: 18rpx 16rpx;
}

.cd-text {
  font-size: 22rpx; color: #8A63F2; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cd-text.soon { color: #C47A2C; }

.btn-group { display: flex; gap: 12rpx; flex-shrink: 0; }

.btn {
  flex-shrink: 0;
  padding: 16rpx 28rpx;
  border-radius: 999rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 26rpx; font-weight: 700;
}
.btn text { color: inherit; }
.btn.primary { background: #8A63F2; color: #fff; }
.btn.ghost {
  background: #fff; color: #8A63F2;
  border: 1px solid #8A63F2;
  padding: 14rpx 22rpx;
}

.section-div {
  display: flex; align-items: center; gap: 20rpx;
  padding: 8rpx 4rpx 24rpx;
}
.section-div::before,
.section-div::after {
  content: '';
  flex: 1;
  border-top: 1px dashed #DDD;
}
.section-text { font-size: 24rpx; color: #AAA; flex-shrink: 0; }

.past-card { padding: 24rpx; }
.past-row { display: flex; gap: 16rpx; align-items: flex-start; }

.hot {
  display: block; margin-top: 10rpx;
  font-size: 24rpx; color: #999;
}

.report-btn {
  display: inline-flex;
  margin-top: 16rpx;
  padding: 10rpx 16rpx;
  background: #F0F0F0;
  border-radius: 8rpx;
  font-size: 22rpx; color: #888;
}

.gift {
  width: 56rpx; height: 56rpx;
  border-radius: 12rpx;
  background: #F5F0FF;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
}

.review {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #F3F3F3;
  display: flex; gap: 16rpx;
}

.avatar {
  width: 64rpx; height: 64rpx;
  border-radius: 50%;
  background: #EEE;
  flex-shrink: 0;
}

.review-body { flex: 1; min-width: 0; }
.review-name { display: block; font-size: 24rpx; font-weight: 600; color: #333; }
.review-skin { display: block; margin-top: 4rpx; font-size: 22rpx; color: #AAA; }
.review-text {
  display: block; margin-top: 10rpx;
  font-size: 24rpx; color: #666; line-height: 1.5;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}

.bottom-space { height: 40rpx; }
</style>
