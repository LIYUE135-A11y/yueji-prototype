<template>
  <view class="page">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">阅己盒周一10点上新</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="hero">
        <view class="hero-glow"></view>
        <text class="hero-price">9.9元起抢!</text>
        <text class="hero-desc">一站式解决护肤难题</text>
        <view class="hero-tags">
          <text class="hero-tag">干皮</text>
          <text class="hero-tag">油皮</text>
          <text class="hero-tag">敏肌对号入座</text>
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

      <view
        v-for="group in groups"
        :key="group.id"
        class="group-card"
      >
        <text class="group-title">{{ group.title }}</text>
        <view class="product-grid">
          <view
            v-for="item in group.list"
            :key="item.id"
            class="product-card"
            @tap="onAdd(item)"
          >
            <text class="product-name">「{{ item.name }}」</text>
            <text class="product-desc">{{ item.desc }}</text>
            <view class="product-media">
              <view class="product-badge">
                <text class="product-badge-text">{{ item.count }}</text>
              </view>
              <image class="product-img" :src="item.img" mode="aspectFill" />
            </view>
            <view class="product-price-bar">
              <text class="bar-price">¥{{ item.price }}</text>
              <text class="bar-origin">原价: {{ item.origin }}</text>
            </view>
            <view class="product-foot">
              <text class="foot-name">{{ item.shortName }}</text>
              <text class="foot-price">¥{{ item.price }}</text>
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

const heroImgs = getProductImages('p1', '阅己盒周一上新', 4)

const groups = [
  {
    id: 'g1',
    title: '8.18 甄选上新',
    list: [
      {
        id: 'p1',
        name: '爆油爆痘救急舱',
        shortName: '爆油爆痘救急舱',
        desc: '面 背 头皮 一站式搞定油痘困扰',
        count: '10件套',
        price: '19.9',
        origin: '145',
        img: '/static/images/product-trial-1.jpg'
      },
      {
        id: 'p2',
        name: '毛孔清洁舱',
        shortName: '毛孔清洁舱',
        desc: '深层清洁毛孔 清爽不紧绷',
        count: '13件套',
        price: '19.9',
        origin: '139',
        img: '/static/images/product-flash-1.jpg'
      },
      {
        id: 'p3',
        name: '敏感美白舱',
        shortName: '敏感美白舱',
        desc: '温和提亮 敏肌也能放心用',
        count: '11件套',
        price: '23.9',
        origin: '178',
        img: '/static/images/lipstick-2.jpg'
      },
      {
        id: 'p4',
        name: '敏感修护舱',
        shortName: '敏感修护舱',
        desc: '舒缓修护 稳稳度过敏感期',
        count: '9件套',
        price: '18.9',
        origin: '138',
        img: '/static/images/product-trial-2.jpg'
      }
    ]
  },
  {
    id: 'g2',
    title: '8.14 甄选上新',
    list: [
      {
        id: 'p5',
        name: '敏感维稳舒缓舱',
        shortName: '敏感维稳舒缓舱',
        desc: '屏障修护 维稳舒缓一步到位',
        count: '8件套',
        price: '29.9',
        origin: '129',
        img: '/static/images/product-trial-2.jpg'
      },
      {
        id: 'p6',
        name: '干皮补水舱',
        shortName: '干皮补水舱',
        desc: '深层补水 告别紧绷干痒',
        count: '12件套',
        price: '22.9',
        origin: '158',
        img: '/static/images/product-flash-2.jpg'
      }
    ]
  }
].map((group) => ({
  ...group,
  list: group.list.map((item) => ({
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

function onAdd(item) {
  cartCount.value += 1
  uni.showToast({ title: `已加入 ${item.shortName}`, icon: 'none' })
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
  padding: 32rpx 28rpx 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #9b8cf8 0%, #8b7cf6 55%, #7c6df0 100%);
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  right: -40rpx;
  top: -40rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.hero-price {
  display: block;
  position: relative;
  z-index: 1;
  font-size: 44rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.hero-desc {
  display: block;
  position: relative;
  z-index: 1;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 16rpx;
}

.hero-tags {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.hero-tag {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.75);
  font-size: 22rpx;
  color: #ffffff;
}

.hero-imgs {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12rpx;
}

.hero-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.35);
}

.group-card {
  margin: 20rpx 24rpx 0;
  padding: 28rpx 20rpx 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(139, 124, 246, 0.06);
}

.group-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
  padding: 0 8rpx;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.product-card {
  width: calc(50% - 8rpx);
  background: #fafafc;
  border-radius: 16rpx;
  overflow: hidden;
  box-sizing: border-box;
  padding: 16rpx 14rpx 14rpx;
}

.product-name {
  display: block;
  font-size: 26rpx;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.35;
}

.product-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: $text-hint;
  line-height: 1.4;
  min-height: 56rpx;
}

.product-media {
  margin-top: 12rpx;
  position: relative;
}

.product-badge {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  padding: 4rpx 12rpx;
  border-radius: 0 0 12rpx 0;
  background: $primary-color;
}

.product-badge-text {
  font-size: 18rpx;
  color: #ffffff;
  font-weight: 600;
}

.product-img {
  width: 100%;
  height: 180rpx;
  border-radius: 12rpx;
  background: $purple-placeholder;
}

.product-price-bar {
  margin-top: 12rpx;
  padding: 8rpx 12rpx;
  border-radius: 10rpx;
  background: linear-gradient(90deg, rgba(139, 124, 246, 0.18), rgba(139, 124, 246, 0.08));
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.bar-price {
  font-size: 26rpx;
  font-weight: 700;
  color: $primary-color;
}

.bar-origin {
  font-size: 18rpx;
  color: #aaaaaa;
}

.product-foot {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.foot-name {
  flex: 1;
  min-width: 0;
  font-size: 20rpx;
  color: $text-secondary;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.foot-price {
  font-size: 28rpx;
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
  flex-shrink: 0;
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
