<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack"><text class="nav-back">‹</text></view>
      <view class="nav-actions">
        <view class="nav-icon" @tap="onSearch"><text>⌕</text></view>
        <view class="nav-icon" @tap="onShare"><text>⇈</text></view>
        <view class="nav-icon" @tap="onRefresh"><text>↻</text></view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view class="hero-wrap">
        <image class="hero-img" :src="detail.img" mode="aspectFill" @tap="previewImage" />
        <view class="badges">
          <text class="badge">TOP榜单</text>
        </view>
        <view class="search-same" @tap="searchSame" @click="searchSame">
          <text class="search-same-text">⌕ 搜索同款</text>
        </view>
      </view>

      <view class="info-card">
        <text class="product-title">{{ detail.title }}</text>
        <view class="meta-row">
          <text class="stars">{{ starText }}</text>
          <text class="score">{{ detail.score }}</text>
          <text class="price-spec">{{ detail.origin || '中国' }} | ¥{{ detail.price }}/{{ detail.spec }}</text>
        </view>
        <view class="tag-row">
          <text v-for="(tag, i) in displayTags" :key="i" class="tag-chip">{{ tag }}</text>
        </view>
        <text class="origin-line">产地：{{ regionText }}</text>
      </view>

      <view class="shop-card">
        <text class="shop-head">优惠 | 第三方商户由此提供服务</text>
        <view class="shop-row">
          <text class="shop-logo tmall">天猫</text>
          <view class="shop-info">
            <text class="shop-name">{{ shopName }}旗舰店</text>
            <text class="shop-price">¥{{ shopPrice1 }}</text>
          </view>
          <view class="shop-btn buy" @tap="onShopBuy"><text>抢购</text></view>
        </view>
        <view class="shop-row">
          <text class="shop-logo jd">京东</text>
          <view class="shop-info">
            <text class="shop-name">京东自营</text>
            <text class="shop-price">¥{{ shopPrice2 }}</text>
          </view>
          <view class="shop-btn wait" @tap="onShopWait"><text>待售</text></view>
        </view>
      </view>

      <view class="banner skin">
        <view class="banner-text">
          <text class="banner-title">皮肤有问题？</text>
          <text class="banner-sub">打开测肤测一下，3秒告诉你答案</text>
        </view>
        <view class="banner-btn" @tap="goSkin"><text>去测评</text></view>
      </view>
      <view class="banner ai">
        <view class="banner-text">
          <text class="banner-title">AI肤色多层分析</text>
          <text class="banner-sub">智能解读成分与肤质匹配度</text>
        </view>
        <view class="banner-btn purple" @tap="goAi"><text>AI分析 ›</text></view>
      </view>

      <view class="mx-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.id"
          class="mx-tab"
          :class="{ active: activeTab === tab.id }"
          @tap="activeTab = tab.id"
        >
          <text>{{ tab.name }}</text>
          <text v-if="tab.id === 'score'" class="tab-score"> {{ detail.score }}</text>
        </view>
      </view>

      <view v-if="activeTab === 'effect'" class="pane">
        <view class="card">
          <view class="sec-title-row">
            <text class="sec-title">产品功效</text>
            <text class="sec-link">4项功效验证报告 ›</text>
          </view>
          <view class="effect-icons">
            <view v-for="e in effects" :key="e.name" class="effect-item">
              <view class="effect-ico"><text>{{ e.icon }}</text></view>
              <text class="effect-name">{{ e.name }}</text>
            </view>
          </view>
        </view>
        <view class="card">
          <view class="sec-title-row">
            <text class="sec-title">成分功效</text>
            <text class="sec-link">全成分表 ›</text>
          </view>
          <view class="ing-grid">
            <view v-for="ing in ingEffects" :key="ing.name" class="ing-item">
              <text class="ing-name">{{ ing.name }}</text>
              <text class="ing-count">{{ ing.count }}</text>
            </view>
          </view>
        </view>
        <view class="card">
          <view class="sec-title-row">
            <text class="sec-title">成分安全</text>
            <text class="safe-score">4.8分</text>
          </view>
          <view class="ing-grid">
            <view v-for="s in safetyItems" :key="s.name" class="ing-item">
              <text class="ing-name">{{ s.name }}</text>
              <text class="ing-count">{{ s.count }}</text>
            </view>
          </view>
          <view class="ing-btn" @tap="onIngredients"><text>查看28种全成分解读</text></view>
        </view>
      </view>

      <view v-else-if="activeTab === 'score'" class="pane">
        <view class="card score-card">
          <text class="big-score">{{ detail.score }}</text>
          <text class="big-stars">{{ starText }}</text>
          <text class="sec-link center" @tap="onSameSkin">查看同肤质评分 ›</text>
        </view>
      </view>

      <view v-else class="pane">
        <view class="card">
          <text class="archive-line">规格：{{ detail.spec }}</text>
          <text class="archive-body">{{ detail.desc }}</text>
          <text class="archive-line">产地：{{ regionText }}</text>
        </view>
        <view class="card">
          <text class="sec-title">发货说明</text>
          <text class="archive-body">付款后48小时内发货，默认快递配送。偏远地区可能延迟，请耐心等待物流更新。</text>
        </view>
        <view class="card">
          <text class="sec-title">退换货说明</text>
          <text class="archive-body">支持7天无理由退货（未拆封/不影响二次销售）。质量问题支持退换，请联系在线客服处理。</text>
        </view>
      </view>

      <view class="review-card">
        <view class="section-head">
          <text class="section-title">修友评价 {{ detail.reviewCount }}条</text>
          <text class="section-more" @tap="goAllReviews">全部 ›</text>
        </view>
        <view class="review-chips">
          <text v-for="c in reviewChips" :key="c" class="chip">{{ c }}</text>
        </view>
        <view
          v-for="item in detail.reviews"
          :key="item.id"
          class="review-item"
          @tap="goReview"
        >
          <view class="review-head">
            <image class="avatar" :src="item.avatar" mode="aspectFill" />
            <view class="review-user">
              <text class="username">{{ item.user }}</text>
              <text class="skin-tag">{{ item.skin || '敏感肌' }}</text>
              <view class="mini-stars">
                <text
                  v-for="i in 5"
                  :key="i"
                  class="mini-star"
                  :class="{ on: i <= item.score }"
                >★</text>
              </view>
            </view>
            <text class="review-time">{{ item.time }}</text>
          </view>
          <text class="review-body">{{ item.content }}</text>
          <view v-if="item.photos && item.photos.length" class="review-photos">
            <image
              v-for="(ph, pi) in item.photos"
              :key="pi"
              class="review-photo"
              :src="ph"
              mode="aspectFill"
            />
          </view>
          <view class="review-foot">
            <text class="like-text">♡ {{ item.likes }}</text>
            <text class="like-text">💬</text>
          </view>
        </view>
      </view>

      <view class="list-end"><text class="end-text">— 已经到底啦 —</text></view>
    </scroll-view>

    <view class="composer">
      <view class="composer-btn ghost" @tap.stop="onCart" @click.stop="onCart"><text>加入购物车</text></view>
      <view class="composer-btn primary" @tap.stop="onBuy" @click.stop="onBuy"><text>立即购买</text></view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getProductById } from '../../common/product-data.js'
import { addProductToCart, getCartCount, mapProductToCartItem, saveCheckoutItems } from '../../common/cart-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const activeTab = ref('effect')
const pediaMeta = ref({})

const tabs = [
  { id: 'effect', name: '功效与安全' },
  { id: 'score', name: '修真评分' },
  { id: 'archive', name: '产品档案' }
]

const effects = [
  { icon: '🛡', name: '修护' },
  { icon: '🍃', name: '舒缓' },
  { icon: '💧', name: '保湿' },
  { icon: '✨', name: '控油' }
]

const ingEffects = [
  { name: '修护', count: '11项' },
  { name: '保湿', count: '2项' },
  { name: '舒缓', count: '2项' },
  { name: '抗氧化', count: '1项' },
  { name: '活性成分', count: '14项' }
]

const safetyItems = [
  { name: '香精', count: '—' },
  { name: '防腐剂', count: '—' },
  { name: '风险成分', count: '—' },
  { name: '孕妇慎用', count: '—' },
  { name: '酒精', count: '—' },
  { name: '致痘成分', count: '1项' }
]

const reviewChips = ['水润 (213)', '好吸收 (203)', '适合敏感肌 (181)']

const detail = ref(getProductById('p1'))

const starText = computed(() => {
  const n = Math.max(1, Math.min(5, Math.round(Number(detail.value.score) || 5)))
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n)
})

const displayTags = computed(() => {
  if (pediaMeta.value.tags && pediaMeta.value.tags.length) return pediaMeta.value.tags
  return detail.value.tags || []
})

const regionText = computed(() => pediaMeta.value.region || detail.value.origin || '中国')

const shopName = computed(() => {
  const t = detail.value.title || ''
  if (t.indexOf('可复美') >= 0) return '可复美'
  if (t.indexOf('薇诺娜') >= 0) return '薇诺娜'
  if (/HEY:?REAL/i.test(t)) return 'HEY:REAL'
  return detail.value.brand || '品牌'
})

const shopPrice1 = computed(() => {
  const p = Number(detail.value.price) || 100
  return String(Math.max(19.9, Math.round(p * 0.08 * 10) / 10))
})

const shopPrice2 = computed(() => {
  const p = Number(detail.value.price) || 100
  return String(Math.max(99, Math.round(p * 0.37)))
})

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const navH = 44
  const barH = 64
  const safe = info.safeAreaInsets?.bottom || 0
  return info.windowHeight - statusBar - navH - barH - safe
}

function decode(q) {
  try { return decodeURIComponent(q || '') } catch (e) { return q || '' }
}

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}

  const fallback = {
    title: decode(query.title),
    subTitle: decode(query.subTitle),
    img: decode(query.img),
    desc: decode(query.desc),
    price: decode(query.price) || undefined,
    score: decode(query.score) || undefined,
    reviewCount: decode(query.reviews) || undefined,
    origin: decode(query.origin) || undefined,
    spec: decode(query.spec) || undefined
  }
  detail.value = getProductById(query.id || query.productId || 'p1', fallback)
  if (fallback.price) detail.value.price = fallback.price
  if (fallback.score) detail.value.score = fallback.score
  if (fallback.reviewCount) detail.value.reviewCount = fallback.reviewCount
  if (fallback.origin) detail.value.origin = fallback.origin
  if (fallback.spec) detail.value.spec = fallback.spec
  if (fallback.img) detail.value.img = fallback.img

  const tags = decode(query.tags)
  pediaMeta.value = {
    region: decode(query.region) || fallback.origin || detail.value.origin,
    tags: tags ? tags.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : (detail.value.tags || [])
  }

  // enrich review skin tags for display
  detail.value.reviews = (detail.value.reviews || []).map((r, i) => ({
    ...r,
    skin: r.skin || ['油性敏感肌', '干性敏感肌', '混合性'][i % 3]
  }))
})

onShow(() => {})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onSearch() {
  uni.showToast({ title: '搜索即将上线', icon: 'none' })
}

function onShare() {
  uni.showToast({ title: '分享功能即将上线', icon: 'none' })
}

function onRefresh() {
  uni.showToast({ title: '已刷新', icon: 'none' })
}

function onShopBuy() {
  uni.showToast({ title: '即将跳转天猫抢购', icon: 'none' })
}

function onShopWait() {
  uni.showToast({ title: '京东暂未开售', icon: 'none' })
}

function goSkin() {
  uni.navigateTo({
    url: '/pages/skin-guide/index',
    fail() { uni.switchTab({ url: '/pages/skin-test/index' }) }
  })
}

function goAi() {
  uni.navigateTo({
    url: '/pages/ai-guide/index',
    fail() { uni.showToast({ title: '打开AI分析失败', icon: 'none' }) }
  })
}

/** 搜索同款：带主图进入 AI 导购，走视觉大模型匹配商品库 */
function searchSame() {
  const d = detail.value || {}
  const q = {
    sameStyle: '1',
    img: d.img || '',
    title: d.title || '',
    brand: d.brand || '',
    excludeId: d.id || '',
    cat3: d.cat3 || d.spec || ''
  }
  const qs = Object.keys(q)
    .map((k) => `${k}=${encodeURIComponent(String(q[k] || ''))}`)
    .join('&')
  uni.navigateTo({
    url: `/pages/ai-guide/index?${qs}`,
    fail() {
      uni.showToast({ title: '打开搜同款失败', icon: 'none' })
    }
  })
}

function onIngredients() {
  uni.showToast({ title: '全成分解读即将上线', icon: 'none' })
}

function onSameSkin() {
  uni.showToast({ title: '同肤质评分即将上线', icon: 'none' })
}

function onBuy() {
  try {
    const d = detail.value || {}
    const product = {
      id: d.id || 'p1',
      productId: d.id || 'p1',
      title: d.title || '',
      name: d.title || '',
      subTitle: d.subTitle || '',
      img: d.img || '',
      desc: d.desc || '',
      price: d.price != null ? String(d.price) : '0',
      originPrice: d.originPrice != null ? String(d.originPrice) : '',
      brand: d.brand || '',
      cat1: d.cat1 || '',
      cat2: d.cat2 || '',
      cat3: d.cat3 || d.spec || '',
      spec: d.spec || d.cat3 || '标准装'
    }
    const item = mapProductToCartItem(product)
    if (item) saveCheckoutItems([item])

    const q = [
      'from=buyNow',
      `productId=${encodeURIComponent(product.id)}`,
      `id=${encodeURIComponent(product.id)}`,
      `title=${encodeURIComponent(product.title)}`,
      `subTitle=${encodeURIComponent(product.subTitle)}`,
      `img=${encodeURIComponent(product.img)}`,
      `desc=${encodeURIComponent(product.desc || '')}`,
      `price=${encodeURIComponent(product.price)}`,
      `brand=${encodeURIComponent(product.brand)}`,
      `spec=${encodeURIComponent(product.spec)}`
    ].join('&')
    uni.navigateTo({
      url: `/pages/pay/index?${q}`,
      fail(err) {
        uni.showToast({
          title: (err && err.errMsg) || '打开支付页失败',
          icon: 'none'
        })
      }
    })
  } catch (err) {
    uni.showToast({ title: '立即购买失败，请重试', icon: 'none' })
  }
}

function onCart() {
  addProductToCart(detail.value)
  const count = getCartCount()
  uni.showToast({ title: `已加入我的购物车（${count}）`, icon: 'none' })
}

function previewImage() {
  uni.previewImage({ urls: [detail.value.img], current: detail.value.img })
}

function goAllReviews() { goReview() }

function goReview() {
  uni.navigateTo({
    url:
      `/pages/review/detail?id=2` +
      `&product=${encodeURIComponent(detail.value.title)}` +
      `&img=${encodeURIComponent(detail.value.img)}` +
      `&desc=${encodeURIComponent(detail.value.desc)}` +
      `&likes=${detail.value.reviews?.[0]?.likes || 100}` +
      `&comments=${detail.value.reviewCount}` +
      `&score=${detail.value.score}`
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #F5F3FA;
}

.status-bar, .nav-bar { background: #fff; flex-shrink: 0; }

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx 0 8rpx;
}

.nav-btn {
  width: 72rpx; height: 72rpx;
  display: flex; align-items: center; justify-content: center;
}

.nav-back { font-size: 52rpx; color: #222; line-height: 1; font-weight: 300; }

.nav-actions { display: flex; gap: 8rpx; }

.nav-icon {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: #F5F5F5;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; color: #333;
}

.scroll { flex: 1; min-height: 0; }

.hero-wrap { position: relative; background: #fff; }
.hero-img { width: 100%; height: 560rpx; display: block; background: #F0ECF8; }
.search-same {
  position: absolute;
  left: 24rpx;
  bottom: 24rpx;
  z-index: 4;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(17, 17, 17, 0.62);
  display: flex;
  align-items: center;
}
.search-same:active { opacity: 0.88; }
.search-same-text {
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
}

.badges {
  position: absolute; right: 20rpx; top: 20rpx;
  display: flex; flex-direction: column; gap: 10rpx; align-items: flex-end;
}

.badge {
  padding: 8rpx 16rpx; border-radius: 999rpx;
  background: linear-gradient(135deg, #D4A017, #F5C542);
  color: #fff; font-size: 20rpx; font-weight: 700;
}

.info-card, .shop-card, .card, .review-card, .pane .card {
  margin: 16rpx 24rpx 0;
  padding: 28rpx;
  background: #fff;
  border-radius: 20rpx;
}

.product-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  line-height: 1.4;
}

.meta-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 10rpx;
  margin-top: 14rpx;
}

.stars { color: #FFB020; font-size: 24rpx; letter-spacing: 2rpx; }
.score { color: #FF8A00; font-size: 26rpx; font-weight: 700; }
.price-spec { font-size: 24rpx; color: #666; }

.tag-row { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 18rpx; }

.tag-chip {
  padding: 6rpx 16rpx; border-radius: 10rpx;
  border: 1px solid rgba(138, 99, 242, 0.35);
  color: #8A63F2; font-size: 22rpx; background: #F7F3FF;
}

.origin-line {
  display: block; margin-top: 18rpx;
  font-size: 24rpx; color: #999;
}

.shop-head { display: block; font-size: 24rpx; color: #888; margin-bottom: 8rpx; }

.shop-row {
  display: flex; align-items: center; gap: 16rpx;
  padding: 16rpx 0; border-top: 1px solid #F5F5F5;
}

.shop-logo {
  width: 68rpx; height: 68rpx; border-radius: 14rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; font-weight: 700; color: #fff; flex-shrink: 0;
}
.shop-logo.tmall { background: #FF0036; }
.shop-logo.jd { background: #E3393C; }

.shop-info { flex: 1; min-width: 0; }
.shop-name { display: block; font-size: 26rpx; color: #333; font-weight: 600; }
.shop-price { display: block; margin-top: 4rpx; font-size: 28rpx; color: #E85D7B; font-weight: 700; }

.shop-btn {
  flex-shrink: 0; padding: 12rpx 26rpx; border-radius: 999rpx;
  font-size: 24rpx; font-weight: 700;
}
.shop-btn.buy { background: #FF4757; color: #fff; }
.shop-btn.wait { background: #F0F0F0; color: #999; }

.banner {
  margin: 16rpx 24rpx 0; padding: 24rpx 28rpx; border-radius: 20rpx;
  display: flex; align-items: center; justify-content: space-between; gap: 16rpx;
}
.banner.skin { background: linear-gradient(90deg, #E8F4FF, #F5FBFF); }
.banner.ai { background: linear-gradient(90deg, #EFE8FF, #FCE8F3); }

.banner-title { display: block; font-size: 26rpx; font-weight: 700; color: #222; }
.banner-sub { display: block; margin-top: 6rpx; font-size: 22rpx; color: #888; }

.banner-btn {
  flex-shrink: 0; padding: 12rpx 22rpx; border-radius: 999rpx;
  background: #4A90E2; color: #fff; font-size: 24rpx; font-weight: 700;
}
.banner-btn.purple { background: #8A63F2; }

.mx-tabs {
  display: flex; margin: 20rpx 24rpx 0;
  background: #fff; border-radius: 20rpx 20rpx 0 0;
  border-bottom: 1px solid #F0ECF8; overflow: hidden;
}

.mx-tab {
  flex: 1; text-align: center; padding: 24rpx 4rpx;
  font-size: 26rpx; color: #888; font-weight: 600; position: relative;
}
.mx-tab.active { color: #8A63F2; }
.mx-tab.active::after {
  content: ''; position: absolute; left: 20%; right: 20%; bottom: 0;
  height: 4rpx; background: #8A63F2; border-radius: 4rpx;
}
.tab-score { color: #FF8A00; font-size: 22rpx; }

.pane { padding-bottom: 8rpx; }
.pane .card { margin-top: 0; border-radius: 0 0 20rpx 20rpx; }
.pane .card + .card { margin-top: 16rpx; border-radius: 20rpx; }

.sec-title-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20rpx;
}
.sec-title { font-size: 28rpx; font-weight: 700; color: #222; }
.sec-link { font-size: 22rpx; color: #AAA; }
.sec-link.center { display: block; text-align: center; margin-top: 16rpx; }
.safe-score { font-size: 26rpx; color: #8A63F2; font-weight: 700; }

.effect-icons { display: flex; justify-content: space-around; }
.effect-item { text-align: center; }
.effect-ico {
  width: 80rpx; height: 80rpx; margin: 0 auto 10rpx;
  border-radius: 50%; background: #F7F3FF;
  display: flex; align-items: center; justify-content: center; font-size: 32rpx;
}
.effect-name { font-size: 22rpx; color: #666; }

.ing-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.ing-item {
  width: calc(50% - 6rpx); box-sizing: border-box;
  background: #FAFAFC; border-radius: 14rpx; padding: 16rpx 18rpx;
  display: flex; justify-content: space-between; align-items: center;
}
.ing-name { font-size: 24rpx; color: #666; }
.ing-count { font-size: 24rpx; color: #333; font-weight: 700; }

.ing-btn {
  margin-top: 22rpx; height: 80rpx; border-radius: 999rpx;
  background: linear-gradient(90deg, #8A63F2, #A78BFA);
  color: #fff; font-size: 26rpx; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.score-card { text-align: center; padding: 48rpx 28rpx; }
.big-score { display: block; font-size: 88rpx; font-weight: 800; color: #222; line-height: 1; }
.big-stars { display: block; margin-top: 12rpx; color: #FFB020; font-size: 34rpx; letter-spacing: 4rpx; }

.archive-line { display: block; font-size: 26rpx; color: #333; font-weight: 600; margin-bottom: 12rpx; }
.archive-body { display: block; font-size: 24rpx; color: #888; line-height: 1.6; margin-bottom: 16rpx; }

.section-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx;
}
.section-title { font-size: 28rpx; font-weight: 700; color: #222; }
.section-more { font-size: 22rpx; color: #AAA; }

.review-chips { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx; }
.chip {
  padding: 8rpx 18rpx; border-radius: 999rpx;
  background: #F3F4F6; font-size: 22rpx; color: #666;
}

.review-item {
  padding: 20rpx 0; border-top: 1px solid #F5F5F5;
}

.review-head { display: flex; align-items: flex-start; gap: 14rpx; }
.avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: #EEE; flex-shrink: 0; }
.review-user { flex: 1; min-width: 0; }
.username { display: block; font-size: 26rpx; font-weight: 600; color: #222; }
.skin-tag { display: block; margin-top: 4rpx; font-size: 20rpx; color: #AAA; }
.mini-stars { margin-top: 4rpx; }
.mini-star { font-size: 20rpx; color: #DDD; }
.mini-star.on { color: #FFB020; }
.review-time { font-size: 20rpx; color: #CCC; flex-shrink: 0; }
.review-body {
  display: block; margin-top: 12rpx;
  font-size: 26rpx; color: #444; line-height: 1.5;
}
.review-photos {
  display: flex; gap: 12rpx; margin-top: 16rpx; overflow-x: auto;
}
.review-photo {
  width: 160rpx; height: 160rpx; border-radius: 16rpx; background: #F0ECF8; flex-shrink: 0;
}
.review-foot {
  display: flex; gap: 24rpx; margin-top: 12rpx; justify-content: flex-end;
}
.like-text { font-size: 22rpx; color: #AAA; }

.list-end { padding: 36rpx 0 40rpx; text-align: center; }
.end-text { font-size: 22rpx; color: #CCC; }

.composer {
  flex-shrink: 0;
  display: flex; gap: 16rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.04);
  position: relative;
  z-index: 20;
}

.composer-btn {
  flex: 1; height: 80rpx; border-radius: 999rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; font-weight: 700;
  cursor: pointer;
}
.composer-btn.ghost { background: #EDE8F8; color: #8A63F2; }
.composer-btn.primary {
  background: linear-gradient(135deg, #8A63F2, #A78BFA);
  color: #fff;
  }
</style>

