<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack"><text class="nav-back">‹</text></view>
      <text class="nav-title">{{ navTitle }}</text>
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
        <text>{{ tab.name }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view class="weather-hero">
        <text class="city">{{ city }}</text>
        <text class="temp">{{ weather }}</text>
        <text class="hero-sub">基于当前位置的实时数据</text>
      </view>

      <!-- 实时预报 -->
      <view v-if="activeTab === 'forecast'" class="pane">
        <view class="card">
          <text class="card-title">今日概况</text>
          <view class="stat-row">
            <view v-for="s in todayStats" :key="s.label" class="stat">
              <text class="stat-val">{{ s.value }}</text>
              <text class="stat-label">{{ s.label }}</text>
            </view>
          </view>
        </view>
        <view class="card">
          <text class="card-title">24小时预报</text>
          <scroll-view scroll-x class="hour-scroll" :show-scrollbar="false">
            <view class="hour-row">
              <view v-for="h in hours" :key="h.t" class="hour-item">
                <text class="hour-t">{{ h.t }}</text>
                <text class="hour-ico">{{ h.ico }}</text>
                <text class="hour-temp">{{ h.temp }}°</text>
              </view>
            </view>
          </scroll-view>
        </view>
        <view class="card">
          <text class="card-title">未来三天</text>
          <view v-for="d in days" :key="d.day" class="day-row">
            <text class="day-name">{{ d.day }}</text>
            <text class="day-ico">{{ d.ico }}</text>
            <text class="day-range">{{ d.low }}° / {{ d.high }}°</text>
          </view>
        </view>
      </view>

      <!-- 防护建议 -->
      <view v-else-if="activeTab === 'advice'" class="pane">
        <view class="card tip-card">
          <text class="tip-badge">今日重点</text>
          <text class="tip-main">紫外线中等，建议白天外出做好防晒补涂</text>
        </view>
        <view v-for="a in adviceList" :key="a.title" class="card advice-item">
          <view class="advice-head">
            <text class="advice-ico">{{ a.ico }}</text>
            <text class="advice-title">{{ a.title }}</text>
            <text class="advice-level" :class="a.level">{{ a.levelText }}</text>
          </view>
          <text class="advice-desc">{{ a.desc }}</text>
        </view>
      </view>

      <!-- 搭配推荐 -->
      <view v-else class="pane">
        <view class="card">
          <text class="card-title">今日妆护搭配</text>
          <text class="card-sub">根据杭州市晴 26°C · 紫外线中等匹配</text>
        </view>
        <view
          v-for="p in products"
          :key="p.id"
          class="product-row"
          @tap="goProduct(p)"
        >
          <image class="p-img" :src="p.img" mode="aspectFill" />
          <view class="p-info">
            <text class="p-name">{{ p.name }}</text>
            <text class="p-tag">{{ p.tag }}</text>
            <text class="p-price">¥{{ p.price }}</text>
          </view>
          <text class="p-arrow">›</text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const activeTab = ref('forecast')
const city = ref('杭州市')
const weather = ref('晴 26°C')

const tabs = [
  { id: 'forecast', name: '实时预报' },
  { id: 'advice', name: '防护建议' },
  { id: 'match', name: '搭配推荐' }
]

const navTitle = computed(() => {
  const hit = tabs.find((t) => t.id === activeTab.value)
  return hit ? hit.name : '每日防护'
})

const todayStats = [
  { label: '紫外线', value: '中等' },
  { label: '湿度', value: '58%' },
  { label: '风速', value: '2级' },
  { label: '空气', value: '优' }
]

const hours = [
  { t: '现在', ico: '☀️', temp: 26 },
  { t: '12时', ico: '☀️', temp: 28 },
  { t: '14时', ico: '⛅', temp: 29 },
  { t: '16时', ico: '⛅', temp: 27 },
  { t: '18时', ico: '🌤', temp: 24 },
  { t: '20时', ico: '🌙', temp: 22 }
]

const days = [
  { day: '今天', ico: '☀️', low: 18, high: 29 },
  { day: '明天', ico: '⛅', low: 19, high: 28 },
  { day: '后天', ico: '🌧', low: 17, high: 24 }
]

const adviceList = [
  {
    ico: '🛡',
    title: '防晒防护',
    level: 'mid',
    levelText: '建议',
    desc: '外出前涂抹 SPF30+ 防晒，每隔 2–3 小时补涂，尤其注意颧骨与鼻梁。'
  },
  {
    ico: '💧',
    title: '保湿维稳',
    level: 'low',
    levelText: '常规',
    desc: '湿度适中，可使用清爽保湿精华，避免厚重乳霜造成闷痘。'
  },
  {
    ico: '🍃',
    title: '舒缓修护',
    level: 'mid',
    levelText: '建议',
    desc: '日晒后可用含泛醇 / 积雪草成分的修护精华，减轻泛红与干燥感。'
  }
]

const products = [
  {
    id: 'p1',
    name: '轻薄防晒乳 SPF50+',
    tag: '防晒首选',
    price: '128',
    img: getProductImage('p1', '防晒')
  },
  {
    id: 'p2',
    name: 'B5 修护精华液',
    tag: '日晒后维稳',
    price: '159',
    img: getProductImage('mx3', 'B5精华')
  },
  {
    id: 'p3',
    name: '清爽保湿喷雾',
    tag: '补水随身',
    price: '69',
    img: getProductImage('p3', '喷雾')
  }
]

onLoad((query) => {
  const tab = (query && query.tab) || 'forecast'
  if (['forecast', 'advice', 'match'].indexOf(tab) >= 0) activeTab.value = tab
  try {
    const raw = uni.getStorageSync('yueji_location_granted_v1')
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (data && data.city) city.value = data.city
    if (data && data.weather) weather.value = data.weather
  } catch (e) {}
})

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = `${info.windowHeight - statusBarHeight.value - 44 - 44}px`
  } catch (e) {}
})

function goBack() {
  uni.navigateBack({
    fail() { uni.switchTab({ url: '/pages/home/index' }) }
  })
}

function goProduct(p) {
  uni.navigateTo({
    url:
      `/pages/product/detail?id=${encodeURIComponent(p.id)}` +
      `&title=${encodeURIComponent(p.name)}` +
      `&img=${encodeURIComponent(p.img)}` +
      `&price=${encodeURIComponent(p.price)}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #F5F3FA;
}

.status-bar, .nav-bar, .tabs {
  background: #fff;
  flex-shrink: 0;
}

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

.nav-back { font-size: 52rpx; color: #111; line-height: 1; }

.nav-title {
  position: absolute; left: 50%; transform: translateX(-50%);
  font-size: 34rpx; font-weight: 700; color: #111;
}

.nav-right { width: 64rpx; margin-left: auto; }

.tabs {
  display: flex;
  height: 88rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #999;
  position: relative;
}

.tab.active {
  color: #8A63F2;
  font-weight: 700;
}

.tab.active::after {
  content: '';
  position: absolute;
  left: 50%; bottom: 0;
  transform: translateX(-50%);
  width: 48rpx; height: 6rpx;
  border-radius: 6rpx;
  background: #8A63F2;
}

.scroll { flex: 1; min-height: 0; }

.weather-hero {
  margin: 24rpx 24rpx 0;
  padding: 36rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #8A63F2, #A78BFA);
  color: #fff;
}

.city { display: block; font-size: 28rpx; opacity: 0.9; }
.temp { display: block; margin-top: 8rpx; font-size: 48rpx; font-weight: 800; }
.hero-sub { display: block; margin-top: 8rpx; font-size: 22rpx; opacity: 0.85; }

.pane { padding: 16rpx 24rpx 0; }

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
}

.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #111;
  margin-bottom: 20rpx;
}

.card-sub {
  display: block;
  margin-top: -8rpx;
  font-size: 22rpx;
  color: #999;
}

.stat-row {
  display: flex;
  justify-content: space-between;
}

.stat { text-align: center; flex: 1; }
.stat-val { display: block; font-size: 30rpx; font-weight: 700; color: #8A63F2; }
.stat-label { display: block; margin-top: 8rpx; font-size: 22rpx; color: #999; }

.hour-scroll { white-space: nowrap; }
.hour-row { display: inline-flex; gap: 28rpx; padding-bottom: 4rpx; }
.hour-item { width: 88rpx; text-align: center; }
.hour-t { display: block; font-size: 22rpx; color: #999; }
.hour-ico { display: block; margin: 12rpx 0; font-size: 32rpx; }
.hour-temp { display: block; font-size: 26rpx; font-weight: 600; color: #333; }

.day-row {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-top: 1rpx solid #F5F5F5;
}
.day-row:first-of-type { border-top: none; padding-top: 0; }
.day-name { width: 80rpx; font-size: 26rpx; color: #333; }
.day-ico { flex: 1; text-align: center; font-size: 28rpx; }
.day-range { font-size: 26rpx; color: #666; }

.tip-card {
  background: linear-gradient(135deg, #FFF8E8, #FFF);
}
.tip-badge {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #FFE8B8;
  color: #C47A2C;
  font-size: 20rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}
.tip-main {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
  line-height: 1.45;
}

.advice-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.advice-ico { font-size: 32rpx; }
.advice-title { flex: 1; font-size: 28rpx; font-weight: 700; color: #111; }
.advice-level {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #F0F0F0;
  color: #888;
}
.advice-level.mid { background: #EFEAFF; color: #8A63F2; }
.advice-desc { font-size: 24rpx; color: #666; line-height: 1.55; }

.product-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}
.p-img {
  width: 120rpx; height: 120rpx;
  border-radius: 16rpx;
  background: #F0ECF8;
  flex-shrink: 0;
}
.p-info { flex: 1; min-width: 0; }
.p-name { display: block; font-size: 28rpx; font-weight: 700; color: #111; }
.p-tag { display: block; margin-top: 8rpx; font-size: 22rpx; color: #8A63F2; }
.p-price { display: block; margin-top: 10rpx; font-size: 28rpx; font-weight: 700; color: #E85D7B; }
.p-arrow { font-size: 36rpx; color: #CCC; }

.bottom-space { height: 40rpx; }
</style>
