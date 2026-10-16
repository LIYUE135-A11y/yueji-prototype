<template>
  <view class="page">
    <view class="header-wrap" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-bg">
        <text class="watermark">m</text>
        <view class="wave wave-a"></view>
        <view class="wave wave-b"></view>

        <view class="nav-bar">
          <view class="nav-btn" @tap="goBack" @click="goBack">
            <text class="nav-back">‹</text>
          </view>
          <view class="nav-right">
            <view class="rule-btn" @tap="onRules" @click="onRules">
              <text class="rule-text">入选规则</text>
            </view>
            <view class="share-btn" @tap="onShare" @click="onShare">
              <text class="share-icon">↑</text>
            </view>
          </view>
        </view>

        <view class="hero">
          <view class="title-row">
            <text class="wreath">❧</text>
            <text class="hero-title">阅己榜单</text>
            <text class="wreath flip">❧</text>
          </view>
          <view class="hero-meta">
            <text class="meta-item">安全无广</text>
            <text class="meta-dot">·</text>
            <text class="meta-item">千万用户真实数据</text>
            <text class="meta-dot">·</text>
            <text class="meta-item">每月更新</text>
          </view>
          <view class="hero-tag">
            <text class="hero-tag-text">中国人自己的护肤精选指南</text>
          </view>
        </view>

        <scroll-view scroll-x class="cat-scroll" :show-scrollbar="false">
          <view class="cat-row">
            <view
              v-for="cat in categories"
              :key="cat.id"
              class="cat-chip"
              :class="{ active: activeCat === cat.id }"
              @tap="activeCat = cat.id"
              @click="activeCat = cat.id"
            >
              <text v-if="activeCat === cat.id" class="wreath-sm">❧</text>
              <text class="cat-text">{{ cat.name }}</text>
              <text v-if="activeCat === cat.id" class="wreath-sm flip">❧</text>
              <view v-if="activeCat === cat.id" class="cat-arrow"></view>
            </view>
          </view>
        </scroll-view>

        <view class="gold-arc"></view>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll" :style="{ height: listHeight }">
      <view class="list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="rank-card"
          hover-class="rank-card-hover"
          @tap="goDetail(item)"
          @click="goDetail(item)"
        >
          <image class="rank-cover" :src="item.img" mode="aspectFill" />
          <view class="rank-info">
            <text class="rank-name">{{ item.name }}</text>
            <view class="rank-stats">
              <text class="score-dot">●</text>
              <text class="stat-text">{{ item.score }}分</text>
              <text class="stat-text">{{ item.reviews }}条评论</text>
              <text class="stat-text">收藏{{ item.favs }}</text>
            </view>
            <text class="rank-price">{{ item.origin }} ¥{{ item.price }}/{{ item.spec }}</text>
            <view class="match-btn" @tap.stop="goSkinTest" @click.stop="goSkinTest">
              <text class="match-text">测肤看匹配度</text>
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
import { ref, computed, onMounted } from 'vue'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const listHeight = ref('100vh')
const activeCat = ref('meixiu')

const categories = [
  { id: 'prefer', name: '阅己优选' },
  { id: 'meixiu', name: '美修榜单' },
  { id: 'body', name: '品类榜' },
  { id: 'serum', name: '飙升榜' },
  { id: 'base', name: '美白榜' }
]

const rankList = [
  {
    id: 'mx1',
    cat: 'meixiu',
    name: '可复美重组胶原蛋白「绿印」修护次抛精华液',
    score: '4.59',
    reviews: '7184',
    favs: '9520',
    origin: '中国',
    price: '485',
    spec: '1.5ml*30支',
    region: '中国江苏',
    tags: ['屏障受损', '次抛设计', '密集修护'],
    img: '/static/images/product-trial-2.jpg',
    desc: '可复美重组胶原蛋白绿印修护次抛精华液，密集修护屏障，次抛设计更安心。'
  },
  {
    id: 'mx2',
    cat: 'meixiu',
    name: '薇诺娜舒敏保湿特护霜',
    score: '4.72',
    reviews: '3280',
    favs: '5612',
    origin: '中国',
    price: '188',
    spec: '50g',
    region: '中国云南',
    tags: ['敏感修护', '保湿', '屏障'],
    img: '/static/images/product-trial-2.jpg',
    desc: '薇诺娜舒敏保湿特护霜，敏感肌友好，修护屏障，质地清爽好吸收。'
  },
  {
    id: 'mx3',
    cat: 'meixiu',
    name: 'HEY:REAL B5精华液',
    score: '4.48',
    reviews: '2106',
    favs: '3340',
    origin: '中国',
    price: '159',
    spec: '30ml',
    region: '中国',
    tags: ['修护', '保湿', '泛醇'],
    img: '/static/images/product-flash-2.jpg',
    desc: 'HEY:REAL B5精华液，修护保湿，适合屏障维稳。'
  },
  {
    id: 1,
    cat: 'prefer',
    name: 'OLAY美白焕亮精华身体乳',
    score: '3.96',
    reviews: '1491',
    favs: '2154',
    origin: '美国',
    price: '165',
    spec: '260g',
    img: '/static/images/product-trial-1.jpg',
    desc: 'OLAY美白焕亮精华身体乳，质地轻盈好吸收，提亮肤色，适合日常身体护理。'
  },
  {
    id: 2,
    cat: 'prefer',
    name: '薇诺娜舒敏保湿特护霜',
    score: '4.72',
    reviews: '3280',
    favs: '5612',
    origin: '中国',
    price: '188',
    spec: '50g',
    img: '/static/images/product-trial-2.jpg',
    desc: '薇诺娜舒敏保湿特护霜，敏感肌友好，修护屏障，质地清爽好吸收。'
  },
  {
    id: 3,
    cat: 'body',
    name: '松达婴儿山茶油霜',
    score: '4.35',
    reviews: '2103',
    favs: '3890',
    origin: '中国',
    price: '98',
    spec: '68g',
    img: '/static/images/product-flash-1.jpg',
    desc: '松达婴儿山茶油霜，温和滋润，全家可用的基础保湿选择。'
  },
  {
    id: 4,
    cat: 'serum',
    name: '花西子养肤粉底液',
    score: '4.18',
    reviews: '1876',
    favs: '2941',
    origin: '中国',
    price: '159',
    spec: '30ml',
    img: '/static/images/product-flash-2.jpg',
    desc: '花西子养肤粉底液，妆感自然服帖，养肤底妆持妆一整天都稳。'
  },
  {
    id: 5,
    cat: 'base',
    name: '丝绒哑光正红口红',
    score: '4.55',
    reviews: '956',
    favs: '1720',
    origin: '中国',
    price: '129',
    spec: '3.5g',
    img: '/static/images/lipstick-1.jpg',
    desc: '经典正红色丝绒口红，哑光质地，上嘴显白，适合日常与派对妆容。'
  },
  {
    id: 6,
    cat: 'prefer',
    name: '裸粉豆沙口红礼盒',
    score: '4.41',
    reviews: '1120',
    favs: '2033',
    origin: '中国',
    price: '199',
    spec: '双支装',
    img: '/static/images/lipstick-2.jpg',
    desc: '温柔裸粉豆沙色口红礼盒，日常通勤百搭，提升气色不挑皮。'
  },
  {
    id: 7,
    cat: 'body',
    name: 'OLAY美白焕亮精华身体乳',
    score: '3.96',
    reviews: '1491',
    favs: '2154',
    origin: '美国',
    price: '165',
    spec: '260g',
    img: '/static/images/product-trial-1.jpg',
    desc: 'OLAY美白焕亮精华身体乳，质地轻盈好吸收，提亮肤色，适合日常身体护理。'
  },
  {
    id: 8,
    cat: 'base',
    name: '珊瑚莓果双色口红',
    score: '4.28',
    reviews: '804',
    favs: '1456',
    origin: '中国',
    price: '149',
    spec: '双色',
    img: '/static/images/lipstick-3.jpg',
    desc: '两支色号一盒多用，珊瑚提亮、莓果显白，质地轻盈不粘腻。'
  }
].map((item, index) => {
  const num = parseInt(String(item.id).replace(/\D/g, ''), 10)
  const key = 'p' + ((((num > 0 ? num : (index + 1)) - 1) % 4) + 1)
  return {
    ...item,
    img: item.img || getProductImage(key, item.name)
  }
})

const filteredList = computed(() => {
  return rankList.filter((item) => item.cat === activeCat.value)
})

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const headerH = 420
    const h = info.windowHeight - (info.statusBarHeight || 20) - headerH
    listHeight.value = h + 'px'
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onRules() {
  uni.showToast({ title: '入选规则说明即将上线', icon: 'none' })
}

function onShare() {
  uni.showToast({ title: '分享功能即将上线', icon: 'none' })
}

function goSkinTest() {
  uni.navigateTo({
    url: '/pages/skin-guide/index',
    fail() {
      uni.switchTab({ url: '/pages/skin-test/index' })
    }
  })
}

function goDetail(item) {
  if (!item) return
  uni.navigateTo({
    url:
      `/pages/product/detail?id=${encodeURIComponent(item.id)}` +
      `&title=${encodeURIComponent(item.name || '')}` +
      `&subTitle=${encodeURIComponent((item.origin || '') + ' ¥' + (item.price || '') + '/' + (item.spec || ''))}` +
      `&img=${encodeURIComponent(item.img || '')}` +
      `&desc=${encodeURIComponent(item.desc || '')}` +
      `&score=${encodeURIComponent(item.score || '')}` +
      `&reviews=${encodeURIComponent(item.reviews || '')}` +
      `&price=${encodeURIComponent(item.price || '')}` +
      `&spec=${encodeURIComponent(item.spec || '')}` +
      `&origin=${encodeURIComponent(item.origin || '')}` +
      `&region=${encodeURIComponent(item.region || item.origin || '')}` +
      `&tags=${encodeURIComponent((item.tags || []).join(','))}` +
      `&pedia=1`
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-wrap {
  flex-shrink: 0;
}

.header-bg {
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #1a0f3c 0%, #2a1a5e 38%, #1e1448 72%, #161038 100%);
}

.watermark {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  font-size: 360rpx;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.04);
  font-family: Georgia, serif;
  line-height: 1;
  pointer-events: none;
}

.wave {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.wave-a {
  width: 500rpx;
  height: 500rpx;
  right: -120rpx;
  top: -80rpx;
  background: radial-gradient(circle, rgba(120, 90, 200, 0.35) 0%, transparent 70%);
}

.wave-b {
  width: 400rpx;
  height: 400rpx;
  left: -100rpx;
  bottom: 40rpx;
  background: radial-gradient(circle, rgba(80, 60, 160, 0.3) 0%, transparent 70%);
}

.nav-bar {
  position: relative;
  z-index: 2;
  height: 88rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 56rpx;
  color: #ffffff;
  line-height: 1;
  margin-top: -6rpx;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.rule-btn {
  height: 56rpx;
  padding: 0 22rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
}

.rule-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
}

.share-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-icon {
  font-size: 24rpx;
  color: #ffffff;
}

.hero {
  position: relative;
  z-index: 2;
  padding: 8rpx 32rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.wreath {
  font-size: 36rpx;
  color: #d4af37;
  line-height: 1;
  opacity: 0.9;
}

.wreath.flip {
  transform: scaleX(-1);
}

.hero-title {
  font-size: 60rpx;
  font-weight: 800;
  color: #e8c872;
  letter-spacing: 4rpx;
  text-shadow: 0 2rpx 12rpx rgba(212, 175, 55, 0.35);
}

.hero-meta {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8rpx;
}

.meta-item {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
}

.meta-dot {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

.hero-tag {
  margin-top: 20rpx;
  padding: 10rpx 28rpx;
  border-radius: 28rpx;
  background: rgba(0, 0, 0, 0.22);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.hero-tag-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.cat-scroll {
  position: relative;
  z-index: 2;
  width: 100%;
  white-space: nowrap;
}

.cat-row {
  display: inline-flex;
  align-items: flex-end;
  gap: 12rpx;
  padding: 16rpx 24rpx 28rpx;
}

.cat-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 28rpx;
}

.cat-chip.active {
  background: linear-gradient(180deg, #faf6ee 0%, #f0e8d8 100%);
  padding-bottom: 14rpx;
  margin-bottom: -6rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.cat-chip.active .cat-text {
  color: #a67c2e;
  font-weight: 700;
}

.cat-chip:not(.active) .cat-text {
  color: rgba(255, 255, 255, 0.85);
}

.wreath-sm {
  font-size: 20rpx;
  color: #c9a227;
  line-height: 1;
}

.cat-text {
  font-size: 24rpx;
}

.cat-arrow {
  position: absolute;
  left: 50%;
  bottom: -10rpx;
  margin-left: -8rpx;
  width: 0;
  height: 0;
  border-left: 8rpx solid transparent;
  border-right: 8rpx solid transparent;
  border-top: 10rpx solid #f0e8d8;
}

.gold-arc {
  position: relative;
  z-index: 2;
  height: 24rpx;
  margin-top: -4rpx;
  background: #f5f5f5;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  box-shadow: 0 -2rpx 0 0 rgba(212, 175, 55, 0.55);
}

.header-wrap {
  flex-shrink: 0;
}

.list-scroll {
  @include app-page-scroll;
  background: #f5f5f5;
}

.list {
  padding: 16rpx 24rpx 8rpx;
}

.rank-card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.rank-card-hover {
  opacity: 0.94;
}

.rank-cover {
  width: 180rpx;
  height: 180rpx;
  border-radius: 16rpx;
  background: #ececec;
  flex-shrink: 0;
}

.rank-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 8rpx;
}

.rank-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #111111;
  line-height: 1.35;
}

.rank-stats {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
}

.score-dot {
  font-size: 16rpx;
  color: #c9c9c9;
  line-height: 1;
}

.stat-text {
  font-size: 22rpx;
  color: #999999;
}

.rank-price {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #999999;
}

.match-btn {
  align-self: flex-end;
  margin-top: auto;
  padding: 8rpx 18rpx;
  border-radius: 24rpx;
  background: #f0f0f0;
}

.match-text {
  font-size: 20rpx;
  color: #888888;
}

.list-end {
  padding: 24rpx 0 48rpx;
  text-align: center;
}

.end-text {
  font-size: 22rpx;
  color: #cccccc;
}
</style>
