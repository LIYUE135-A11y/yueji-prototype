<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <text class="nav-action" @tap="goBack">取消</text>
      <text class="nav-title">我的梳妆台</text>
      <text class="nav-action primary" @tap="onSubmit">提交</text>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="tip-card">
        <text class="tip-text">打造专属美妆库，选择产品状态，轻松掌控使用进度</text>
      </view>

      <view
        v-for="item in products"
        :key="item.id"
        class="product-card"
      >
        <view class="card-main" @tap="goDetail(item)">
          <image class="product-img" :src="item.img" mode="aspectFill" />
          <view class="product-info">
            <text class="name-cn">{{ item.nameCn }}</text>
            <text class="name-en">{{ item.nameEn }}</text>
            <view class="meta-row">
              <text class="meta-price">¥{{ item.price }}</text>
              <text class="meta-score">● {{ item.score }} · {{ item.reviews }}条评价</text>
            </view>
          </view>
          <text class="card-arrow">›</text>
        </view>

        <view class="status-block">
          <text class="status-label">请选择产品状态</text>
          <view class="status-row">
            <view
              v-for="opt in statusOptions"
              :key="opt"
              class="status-btn"
              :class="{ active: item.status === opt }"
              @tap.stop="setStatus(item, opt)"
            >
              <text class="status-text">{{ opt }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')

const statusOptions = ['未开封', '使用中', '已用完']

const products = ref([
  {
    id: 'd1',
    productId: 'p1',
    nameCn: "FENTY美妆滤镜大师柔光持久粉底液440",
    nameEn: "FENTY BEAUTY PRO FILT'R SOFT MATTE LONGWEAR FOUNDATION 440",
    img: getProductImage('p1', 'FENTY美妆滤镜大师柔光持久粉底液440'),
    price: '320',
    score: '4.6',
    reviews: '186',
    status: '',
    desc: '柔光持久粉底液，轻薄遮瑕，妆效自然持久。'
  },
  {
    id: 'd2',
    productId: 'p2',
    nameCn: '温柔裸粉口红礼盒',
    nameEn: 'NUDE PINK LIPSTICK GIFT SET',
    img: getProductImage('p2', '温柔裸粉口红礼盒'),
    price: '199',
    score: '4.6',
    reviews: '218',
    status: '',
    desc: '温柔裸粉豆沙色口红礼盒，日常通勤百搭，提升气色不挑皮。'
  },
  {
    id: 'd3',
    productId: 'p3',
    nameCn: '珊瑚莓果双色套装',
    nameEn: 'CORAL BERRY DUAL LIPSTICK SET',
    img: getProductImage('p3', '珊瑚莓果双色套装'),
    price: '149',
    score: '4.5',
    reviews: '187',
    status: '',
    desc: '珊瑚与莓果双色口红套装，一盒满足多场景妆容需求。'
  }
])

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const navH = 44
    const h = info.windowHeight - (info.statusBarHeight || 20) - navH
    scrollHeight.value = h + 'px'
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function setStatus(item, opt) {
  item.status = item.status === opt ? '' : opt
}

function onSubmit() {
  const selected = products.value.filter((p) => p.status)
  if (!selected.length) {
    uni.showToast({ title: '请先选择产品状态', icon: 'none' })
    return
  }
  uni.showToast({
    title: `已提交 ${selected.length} 件产品`,
    icon: 'none'
  })
  setTimeout(() => {
    uni.navigateBack({
      fail() {
        uni.switchTab({ url: '/pages/profile/index' })
      }
    })
  }, 500)
}

function goDetail(item) {
  uni.navigateTo({
    url:
      `/pages/product/detail?id=${item.productId}` +
      `&title=${encodeURIComponent(item.nameCn)}` +
      `&subTitle=${encodeURIComponent('梳妆台 · ' + (item.status || '待标记'))}` +
      `&img=${encodeURIComponent(item.img)}` +
      `&desc=${encodeURIComponent(item.desc)}`
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: $purple-surface;
}

.status-bar,
.nav-bar {
  background: #ffffff;
}

.nav-bar {
  height: 88rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-action {
  min-width: 80rpx;
  font-size: 28rpx;
  color: #666666;
}

.nav-action.primary {
  color: $primary-color;
  font-weight: 600;
  text-align: right;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #222222;
}

.scroll {
  background: $purple-surface;
}

.tip-card {
  margin: 20rpx 24rpx 0;
  padding: 20rpx 24rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(139, 124, 246, 0.08);
}

.tip-text {
  font-size: 24rpx;
  color: $primary-color;
  line-height: 1.5;
}

.product-card {
  margin: 20rpx 24rpx 0;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.card-main {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.product-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.name-cn {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #222222;
  line-height: 1.4;
}

.name-en {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #999999;
  line-height: 1.35;
  word-break: break-all;
  text-transform: uppercase;
}

.meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}

.meta-price {
  font-size: 28rpx;
  font-weight: 700;
  color: $primary-color;
}

.meta-score {
  font-size: 22rpx;
  color: #888888;
}

.card-arrow {
  font-size: 36rpx;
  color: #cccccc;
  line-height: 1;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.status-block {
  margin-top: 22rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f2f0f8;
}

.status-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 14rpx;
}

.status-row {
  display: flex;
  gap: 16rpx;
}

.status-btn {
  flex: 1;
  height: 64rpx;
  border-radius: 12rpx;
  background: $purple-surface;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
}

.status-btn.active {
  background: rgba(139, 124, 246, 0.12);
  border-color: $primary-color;
}

.status-text {
  font-size: 24rpx;
  color: #666666;
}

.status-btn.active .status-text {
  color: $primary-color;
  font-weight: 600;
}

.list-end {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 48rpx 48rpx;
}

.end-text {
  font-size: 22rpx;
  color: #cccccc;
}
</style>
