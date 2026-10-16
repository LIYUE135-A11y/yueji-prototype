<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">猜你喜欢</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="top-card">
        <text class="top-title">人气爆款榜单</text>
        <text class="top-desc">根据你的肤质偏好精选，9.9元起抢</text>
      </view>

      <view
        v-for="(item, index) in list"
        :key="item.id"
        class="rank-row"
        @tap="onTap(item)"
      >
        <view class="rank-num" :class="'n' + (index + 1)">
          <text class="rank-num-text">{{ index + 1 }}</text>
        </view>
        <image class="rank-img" :src="item.img" mode="aspectFill" />
        <view class="rank-info">
          <text class="rank-name">{{ item.name }}</text>
          <text class="rank-sub">{{ item.sub }}</text>
          <view class="rank-tags">
            <text v-for="tag in item.tags" :key="tag" class="rank-tag">{{ tag }}</text>
          </view>
          <view class="rank-price-row">
            <text class="rank-price">¥{{ item.price }}</text>
            <text class="rank-origin">¥{{ item.origin }}</text>
            <text class="rank-hot">热度 {{ item.hot }}</text>
          </view>
        </view>
        <text class="rank-arrow">›</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')

const list = [
  {
    id: '1',
    name: '奥礼防晒专属盒',
    sub: '通勤防晒 · 清爽不油腻',
    tags: ['防晒', '油皮友好'],
    price: '9.9',
    origin: '89',
    hot: '2.1万',
    img: '/static/images/lipstick-1.jpg'
  },
  {
    id: '2',
    name: '美白淡斑精选盒',
    sub: '提亮肤色 · 温和淡斑',
    tags: ['美白', '淡斑'],
    price: '19.9',
    origin: '128',
    hot: '1.6万',
    img: '/static/images/lipstick-2.jpg'
  },
  {
    id: '3',
    name: '油皮控油清爽盒',
    sub: '控油收敛 · 毛孔更细腻',
    tags: ['控油', '清爽'],
    price: '15.9',
    origin: '99',
    hot: '1.2万',
    img: '/static/images/lipstick-3.jpg'
  },
  {
    id: '4',
    name: '干皮补水滋润盒',
    sub: '深层补水 · 锁水不拔干',
    tags: ['补水', '干皮'],
    price: '12.9',
    origin: '109',
    hot: '9800',
    img: '/static/images/product-flash-2.jpg'
  },
  {
    id: '5',
    name: '敏感维稳修护盒',
    sub: '舒缓修护 · 稳稳度过敏感期',
    tags: ['敏感', '修护'],
    price: '18.9',
    origin: '138',
    hot: '8600',
    img: '/static/images/product-trial-2.jpg'
  },
  {
    id: '6',
    name: '绒雾口红尝鲜盒',
    sub: '显白雾面 · 轻盈不拔干',
    tags: ['彩妆', '显白'],
    price: '9.9',
    origin: '79',
    hot: '7200',
    img: '/static/images/lipstick-4.jpg'
  }
].map((item) => ({
  ...item,
  img: getProductImage(`p${item.id}`, item.name)
}))

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - 44}px`
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/beauty-box/index' })
    }
  })
}

function onTap(item) {
  uni.showToast({ title: item.name, icon: 'none' })
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
  width: 100%;
  background: #ffffff;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.nav-btn,
.nav-placeholder {
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
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.top-card {
  margin: 24rpx 24rpx 8rpx;
  padding: 28rpx 24rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f7f5fc 0%, #efeafc 100%);
}

.top-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.top-desc {
  display: block;
  font-size: 24rpx;
  color: $text-hint;
}

.rank-row {
  margin: 16rpx 24rpx 0;
  padding: 20rpx;
  background: #fafafc;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.rank-num {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  background: #eeeeee;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-num.n1 { background: #ff6b6b; }
.rank-num.n2 { background: #ffa94d; }
.rank-num.n3 { background: #fcc419; }

.rank-num-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #666666;
}

.rank-num.n1 .rank-num-text,
.rank-num.n2 .rank-num-text,
.rank-num.n3 .rank-num-text {
  color: #ffffff;
}

.rank-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.rank-sub {
  display: block;
  margin-top: 4rpx;
  font-size: 22rpx;
  color: $text-hint;
}

.rank-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.rank-tag {
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  background: rgba(139, 124, 246, 0.1);
  font-size: 18rpx;
  color: $primary-color;
}

.rank-price-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-top: 8rpx;
}

.rank-price {
  font-size: 28rpx;
  font-weight: 700;
  color: $tag-red;
}

.rank-origin {
  font-size: 20rpx;
  color: #bbbbbb;
  text-decoration: line-through;
}

.rank-hot {
  margin-left: auto;
  font-size: 20rpx;
  color: $text-hint;
}

.rank-arrow {
  font-size: 32rpx;
  color: $primary-light;
  flex-shrink: 0;
}

.bottom-space {
  height: 40rpx;
}
</style>
