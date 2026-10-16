<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">大牌5件5折心动尝鲜</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="hero">
        <view class="hero-left">
          <text class="hero-emoji">📣</text>
          <text class="hero-title">大牌多件多折</text>
          <text class="hero-sub">2件9折 · 3件7折</text>
          <view class="hero-btns">
            <view class="hero-chip" @tap="onToast('修宝专享折扣')">
              <text class="hero-chip-text">👑 修宝专享折扣</text>
            </view>
            <view class="hero-cta" @tap="onToast('抢5件5折')">
              <text class="hero-cta-text">抢5件5折 ›</text>
            </view>
          </view>
        </view>
        <view class="hero-right">
          <view class="hero-badge">
            <text class="hero-badge-text">大牌2折起</text>
          </view>
          <view class="hero-imgs">
            <image
              v-for="img in heroImgs"
              :key="img"
              class="hero-img"
              :src="img"
              mode="aspectFill"
            />
          </view>
        </view>
      </view>

      <view v-for="sec in sections" :key="sec.id" class="section-card">
        <view class="section-head">
          <text class="section-title">{{ sec.title }}</text>
          <view class="section-line"></view>
        </view>
        <view class="product-grid">
          <view
            v-for="item in sec.list"
            :key="item.id"
            class="product-card"
            @tap="onAdd(item)"
          >
            <view class="product-media">
              <image class="product-img" :src="item.img" mode="aspectFill" />
              <view class="product-overlay">
                <text class="overlay-text">{{ item.overlay }}</text>
              </view>
              <view class="img-price">
                <text class="img-price-text">¥{{ item.price }}</text>
              </view>
            </view>
            <text class="product-name">{{ item.name }}</text>
            <view class="product-tags">
              <text v-for="tag in item.tags" :key="tag" class="product-tag">{{ tag }}</text>
            </view>
            <view class="product-foot">
              <text class="product-price">¥{{ item.price }}</text>
              <view class="add-btn" @tap.stop="onAdd(item)">
                <text class="add-icon">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="cart-float" @tap="onCart">
      <text class="cart-icon">🛒</text>
      <view class="cart-badge" v-if="cartCount > 0">
        <text class="cart-badge-text">{{ cartCount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getProductImage, getProductImages } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const cartCount = ref(4)

const heroImgs = getProductImages('p1', '大牌闪购', 3)

const sections = [
  {
    id: 's1',
    title: '榜单盒单品20包邮',
    list: [
      {
        id: 'p1',
        name: '【榜单盒精选单品】8小时细嫩亮精华',
        overlay: '8小时细·嫩·亮',
        price: '4.9',
        tags: ['2件9折', '3件8折'],
        img: '/static/images/product-flash-1.jpg'
      },
      {
        id: 'p2',
        name: '【榜单盒精选单品】安稳美白淡斑精华',
        overlay: '减黄黑 安稳白',
        price: '9.9',
        tags: ['2件9折', '3件8折'],
        img: '/static/images/lipstick-2.jpg'
      }
    ]
  },
  {
    id: 's2',
    title: '防晒王炸奥札',
    list: [
      {
        id: 'p3',
        name: '【奥札】清爽防晒乳 轻薄不油腻',
        overlay: '轻薄防晒 不闷痘',
        price: '19.9',
        tags: ['4件6.3折'],
        img: '/static/images/product-flash-2.jpg'
      },
      {
        id: 'p4',
        name: '【奥札】高倍防晒喷雾 便携补涂',
        overlay: '高倍防护 随时补涂',
        price: '15.9',
        tags: ['4件6.3折'],
        img: '/static/images/lipstick-3.jpg'
      }
    ]
  },
  {
    id: 's3',
    title: '大牌1元秒专场',
    list: [
      {
        id: 'p5',
        name: '【大牌1元秒】减黄黑安稳白精华',
        overlay: '减黄黑 安稳白',
        price: '1',
        tags: ['限量1元秒'],
        img: '/static/images/product-flash-1.jpg'
      },
      {
        id: 'p6',
        name: '【大牌1元秒】丝绒哑光口红小样',
        overlay: '显白雾面 轻盈不拔干',
        price: '1',
        tags: ['限量1元秒'],
        img: '/static/images/lipstick-1.jpg'
      }
    ]
  }
].map((section) => ({
  ...section,
  list: section.list.map((item) => ({
    ...item,
    img: getProductImage(item.id, item.name)
  }))
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

function onToast(title) {
  uni.showToast({ title, icon: 'none' })
}

function onAdd(item) {
  cartCount.value += 1
  uni.showToast({ title: `已加入 ¥${item.price}`, icon: 'none' })
}

function onCart() {
  uni.showToast({ title: `购物车 ${cartCount.value} 件`, icon: 'none' })
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
  width: 100%;
  background: #ffffff;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  background: #ffffff;
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

.hero {
  margin: 20rpx 24rpx 0;
  padding: 28rpx 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #9b8cf8 0%, #8b7cf6 50%, #7c6df0 100%);
  display: flex;
  gap: 16rpx;
  overflow: hidden;
}

.hero-left {
  flex: 1;
  min-width: 0;
}

.hero-emoji {
  display: block;
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.hero-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.hero-sub {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 20rpx;
}

.hero-btns {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12rpx;
}

.hero-chip {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.22);
}

.hero-chip-text {
  font-size: 20rpx;
  color: #ffffff;
}

.hero-cta {
  padding: 12rpx 24rpx;
  border-radius: 28rpx;
  background: #ffffff;
}

.hero-cta-text {
  font-size: 24rpx;
  font-weight: 700;
  color: $primary-color;
}

.hero-right {
  width: 200rpx;
  flex-shrink: 0;
  position: relative;
}

.hero-badge {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  padding: 4rpx 12rpx;
  border-radius: 0 12rpx 0 12rpx;
  background: $tag-red;
}

.hero-badge-text {
  font-size: 18rpx;
  color: #ffffff;
  font-weight: 600;
}

.hero-imgs {
  margin-top: 28rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hero-img {
  width: 100%;
  height: 72rpx;
  border-radius: 10rpx;
  background: rgba(255, 255, 255, 0.35);
}

.section-card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx 20rpx 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(139, 124, 246, 0.06);
}

.section-head {
  margin-bottom: 20rpx;
  padding: 0 4rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-line {
  margin-top: 8rpx;
  width: 64rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background: $primary-color;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.product-card {
  width: calc(50% - 8rpx);
  box-sizing: border-box;
}

.product-media {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  background: $purple-placeholder;
}

.product-img {
  width: 100%;
  height: 220rpx;
}

.product-overlay {
  position: absolute;
  left: 12rpx;
  top: 12rpx;
  right: 12rpx;
}

.overlay-text {
  font-size: 22rpx;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.35);
}

.img-price {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8rpx 12rpx;
  background: rgba(0, 0, 0, 0.45);
}

.img-price-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #ffffff;
}

.product-name {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: $text-primary;
  line-height: 1.4;
  height: 62rpx;
  overflow: hidden;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.product-tag {
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  border: 1rpx solid rgba(139, 124, 246, 0.45);
  font-size: 18rpx;
  color: $primary-color;
}

.product-foot {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 30rpx;
  font-weight: 700;
  color: $tag-red;
}

.add-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #dddddd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 28rpx;
  color: #999999;
  line-height: 1;
}

.bottom-space {
  height: 120rpx;
}

.cart-float {
  position: fixed;
  right: 28rpx;
  bottom: 120rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.cart-icon {
  font-size: 36rpx;
}

.cart-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 14rpx;
  background: $tag-red;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-badge-text {
  font-size: 18rpx;
  color: #ffffff;
  font-weight: 700;
}
</style>
