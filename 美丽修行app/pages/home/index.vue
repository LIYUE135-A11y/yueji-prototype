<template>
  <view class="page">
    <!-- 状态栏 -->
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="status-inner">
        <text class="status-time">{{ currentTime }}</text>
        <view class="status-right">
          <text class="status-signal">▮▮▮▮</text>
          <text class="status-network">5G</text>
          <text class="status-battery">🔋</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="page-scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
    <!-- 顶部渐变区 -->
    <view class="hero-header">
      <view class="title-bar">
        <text class="brand-title">阅己美妆 — 你的科学美妆助手</text>
        <view class="title-actions">
          <view class="action-item" @tap="onAiGuide">
            <image class="action-icon" src="/static/features/ai-guide.svg" mode="aspectFit" />
            <text class="action-label">AI导购</text>
          </view>
          <view class="action-item" @tap="onAiKefu">
            <image class="action-icon" src="/static/features/ai-kefu.svg" mode="aspectFit" />
            <text class="action-label">AI客服</text>
          </view>
          <view class="action-item" @tap="onMessage">
            <image class="action-icon" src="/static/features/message.svg" mode="aspectFit" />
            <text class="action-label">消息</text>
          </view>
          <view class="action-item" @tap="onPoints">
            <image class="action-icon" src="/static/features/points.svg" mode="aspectFit" />
            <text class="action-label">积分</text>
          </view>
        </view>
      </view>

      <!-- 搜索卡片 -->
      <view class="search-card">
        <view class="search-input-row">
          <textarea
            class="search-input"
            v-model="inputText"
            :placeholder="placeholderText"
            placeholder-class="search-placeholder"
            :maxlength="500"
            auto-height
            confirm-type="search"
            @confirm="onSearchSubmit"
          />
          <view class="scan-btn" @tap="onScan">
            <text class="scan-icon">⎘</text>
          </view>
        </view>
        <view class="search-bottom">
          <view class="mode-tabs">
            <view
              class="mode-tab"
              :class="{ active: inputMode === 'search' }"
              @tap="onSearchTab"
            >
              <text class="mode-icon">⌕</text>
              <text class="mode-text">搜索</text>
            </view>
            <view
              class="mode-tab"
              :class="{ active: inputMode === 'ask' }"
              @tap="onAskTab"
            >
              <text class="mode-icon">💬</text>
              <text class="mode-text">提问</text>
            </view>
          </view>
          <view class="mascot">
            <text class="mascot-emoji">👧</text>
          </view>
        </view>
      </view>

      <view v-if="searchQueried" class="home-search-result">
        <view class="home-search-head">
          <text class="home-search-title">搜索结果</text>
          <text class="home-search-count">{{ searchResults.length }} 件商品</text>
          <text class="home-search-close" @tap="clearSearchResults">×</text>
        </view>
        <view v-if="searchResults.length" class="home-search-list">
          <view
            v-for="item in searchResults"
            :key="item.id"
            class="home-search-item"
            @tap="openSearchProduct(item)"
          >
            <image class="home-search-cover" :src="item.img" mode="aspectFill" />
            <view class="home-search-body">
              <text class="home-search-name">{{ item.title }}</text>
              <text class="home-search-sub">{{ item.subTitle || item.brand }}</text>
              <view class="home-search-foot">
                <text class="home-search-price">¥{{ item.price }}</text>
                <text class="home-search-go">查看 ›</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="home-search-empty">
          <text>未在商品管理中找到「{{ lastSearchKeyword }}」相关商品</text>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="feature-section">
      <view
        v-for="item in features"
        :key="item.id"
        class="feature-item"
        hover-class="feature-item-hover"
        @tap.stop="onFeatureTap(item)"
        @click.stop="onFeatureTap(item)"
      >
        <view class="feature-icon-wrap">
          <image class="feature-icon" :src="item.icon" mode="aspectFit" />
        </view>
        <text class="feature-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- 内容区块 -->
    <view class="content-blocks">
      <view class="blocks-row">
        <view class="guide-card">
          <view class="card-head" @tap="onCardTap('guide')">
            <text class="card-title">每日防护指南</text>
            <text class="card-arrow">›</text>
          </view>
          <text class="card-desc">开启定位并记录肤质 获取更精准的防护建议</text>
          <view class="guide-actions">
            <view class="guide-action-item action-loc" @tap.stop="onOpenLocation">
              <view class="action-deco deco-a"></view>
              <view class="action-deco deco-b"></view>
              <view class="action-badge">
                <image class="badge-img" src="/static/features/location-badge.svg" mode="aspectFit" />
              </view>
              <view class="guide-info">
                <view class="guide-title-row">
                  <text class="guide-action-title">{{ locTitle }}</text>
                  <text class="guide-tag">天气</text>
                </view>
                <text class="guide-action-desc">{{ locDesc }}</text>
              </view>
              <view class="guide-cta">
                <text class="guide-cta-text">{{ locCta }}</text>
                <text class="guide-cta-arrow">›</text>
              </view>
            </view>
            <view class="guide-action-item action-skin" @tap="onCardTap('skin-record')">
              <view class="action-deco deco-a"></view>
              <view class="action-deco deco-b"></view>
              <view class="action-badge">
                <image class="badge-img" src="/static/features/skin-badge.svg" mode="aspectFit" />
              </view>
              <view class="guide-info">
                <view class="guide-title-row">
                  <text class="guide-action-title">记录肤质</text>
                  <text class="guide-tag soft">护肤</text>
                </view>
                <text class="guide-action-desc">获取定制防护建议</text>
              </view>
              <view class="guide-cta">
                <text class="guide-cta-text">去记录</text>
                <text class="guide-cta-arrow">›</text>
              </view>
            </view>
          </view>
          <view class="guide-footer">
            <view
              v-for="item in guideFooter"
              :key="item.id"
              class="guide-footer-item"
              @tap.stop="onGuideFooter(item.id)"
            >
              <view class="footer-icon-wrap">
                <image class="footer-icon" :src="item.icon" mode="aspectFit" />
              </view>
              <text class="footer-label">{{ item.name }}</text>
            </view>
          </view>
        </view>

        <view class="blocks-right">
          <view class="promo-card" @tap.stop="goTrialCenter" @click.stop="goTrialCenter">
            <view class="card-head" @tap.stop="goTrialCenter">
              <text class="card-title">阅己优选&amp;试用</text>
              <text class="card-arrow">›</text>
            </view>
            <view class="promo-list">
              <view
                v-for="item in trialList"
                :key="item.id"
                class="promo-item"
                @tap.stop="goTrialCenter"
              >
                <view class="promo-img-wrap">
                  <view v-if="item.tag" class="promo-tag">{{ item.tag }}</view>
                  <image class="promo-img" :src="item.img" mode="aspectFill" />
                </view>
                <text class="promo-line1">{{ item.line1 }}</text>
                <text class="promo-line2">{{ item.line2 }}</text>
              </view>
            </view>
          </view>
          <view class="promo-card" @tap="goBeautyBox" @click="goBeautyBox">
            <view class="card-head">
              <text class="card-title">1元抢爆款</text>
              <text class="card-arrow">›</text>
            </view>
            <view class="promo-list">
              <view v-for="item in flashList" :key="item.id" class="promo-item">
                <view class="promo-img-wrap">
                  <view v-if="item.tag" class="promo-tag">{{ item.tag }}</view>
                  <image class="promo-img" :src="item.img" mode="aspectFill" />
                </view>
                <text class="promo-line1">{{ item.line1 }}</text>
                <text class="promo-line2">{{ item.line2 }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 广告横幅 -->
    <view class="ad-banner">
      <image class="ad-img" src="/static/images/ad-banner.jpg" mode="aspectFill" />
      <view class="ad-content">
        <text class="ad-title">元宝AI 帮你解决各种难题</text>
        <text class="ad-sub">广告</text>
        <view class="ad-btn" @tap="onCardTap('ad-skip')">不想看广告</view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-section">
      <view class="product-section-head">
        <text class="product-section-title">热门推荐</text>
      </view>
      <view
        v-for="item in productList"
        :key="item.id"
        class="product-row"
        @tap="goProductDetail(item)"
      >
        <image class="product-row-img" :src="item.img" mode="aspectFill" />
        <view class="product-row-info">
          <text class="product-row-title">{{ item.title }}</text>
          <text class="product-row-sub">{{ item.subTitle }}</text>
        </view>
        <text class="product-row-arrow">›</text>
      </view>
    </view>

    <!-- 问卷反馈 -->
    <view class="feedback-bar">
      <text class="feedback-emoji">👧</text>
      <text class="feedback-text">填写问卷，您的反馈让 APP 更好用！</text>
      <view class="feedback-btn" @tap="onCardTap('survey')">去填写</view>
    </view>
    </scroll-view>

    <!-- 定位用途说明 -->
    <view v-if="showLocSoft" class="loc-mask" @tap="closeLocSoft">
      <view class="loc-soft" @tap.stop>
        <view class="loc-soft-ico"><text>📍</text></view>
        <text class="loc-soft-title">开启定位服务</text>
        <text class="loc-soft-desc">开启后可获取当地天气、紫外线与空气质量，为你匹配更精准的每日防护建议与妆容搭配推荐。</text>
        <view class="loc-soft-actions">
          <view class="loc-soft-btn cancel" @tap="denyLocation"><text>暂不开启</text></view>
          <view class="loc-soft-btn ok" @tap="openLocSys"><text>去开启</text></view>
        </view>
      </view>
    </view>

    <!-- 系统风格授权弹窗 -->
    <view v-if="showLocSys" class="loc-mask" @tap="closeLocSys">
      <view class="loc-sys" @tap.stop>
        <view class="loc-sys-body">
          <text class="loc-sys-title">允许「阅己美妆」访问你的位置？</text>
          <text class="loc-sys-desc">用于展示当地天气并提供更精准的护肤防护建议</text>
        </view>
        <view class="loc-sys-btn allow" @tap="grantLocation('always')"><text>使用 App 时允许</text></view>
        <view class="loc-sys-btn" @tap="grantLocation('once')"><text>仅本次允许</text></view>
        <view class="loc-sys-btn deny" @tap="denyLocation"><text>不允许</text></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getProductImage } from '../../common/product-image.js'
import {
  DECOR_ENTRY_STORAGE_KEY,
  getHomeFeatures,
  saveDecorEntryList,
  ENTRY_ACTION_ROUTES,
  resolveEntryActionKey,
  resolveEntryNavigateUrl
} from '../../common/decor-entry-data.js'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'
import { searchProductsByKeyword } from '../../common/product-store-app.js'

function withImg(item) {
  return {
    ...item,
    img: getProductImage(item.id || item.productId, item.title || item.line1 || '')
  }
}

const inputMode = ref('search')
const inputText = ref('')
const searchResults = ref([])
const searchQueried = ref(false)
const lastSearchKeyword = ref('')
const statusBarHeight = ref(0)
const scrollHeight = ref('100vh')
const currentTime = ref('9:41')
let timeTimer = null

const LOC_STORAGE_KEY = 'yueji_location_granted_v1'
const locGranted = ref(false)
const locCity = ref('杭州市')
const locWeather = ref('晴 26°C')
const showLocSoft = ref(false)
const showLocSys = ref(false)

const locTitle = computed(() => (locGranted.value ? locCity.value : '开启定位'))
const locDesc = computed(() =>
  locGranted.value ? `今日天气 · ${locWeather.value}` : '获取当前位置天气'
)
const locCta = computed(() => (locGranted.value ? '已开启' : '去开启'))

function loadLocationState() {
  try {
    let raw = ''
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      raw = uni.getStorageSync(LOC_STORAGE_KEY)
    } else if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(LOC_STORAGE_KEY) || ''
    }
    if (!raw) {
      locGranted.value = false
      return
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    locGranted.value = !!(data && data.granted)
    if (data.city) locCity.value = data.city
    if (data.weather) locWeather.value = data.weather
  } catch (e) {
    locGranted.value = false
  }
}

function saveLocationState(granted) {
  const payload = {
    granted: !!granted,
    city: locCity.value || '杭州市',
    weather: locWeather.value || '晴 26°C',
    at: Date.now()
  }
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(LOC_STORAGE_KEY, payload)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOC_STORAGE_KEY, JSON.stringify(payload))
    }
  } catch (e) {}
}

function onOpenLocation() {
  if (locGranted.value) {
    uni.showToast({ title: `${locCity.value} · ${locWeather.value}`, icon: 'none' })
    return
  }
  showLocSys.value = false
  showLocSoft.value = true
}

function closeLocSoft() {
  showLocSoft.value = false
}

function closeLocSys() {
  showLocSys.value = false
}

function openLocSys() {
  showLocSoft.value = false
  showLocSys.value = true
}

function grantLocation() {
  locGranted.value = true
  saveLocationState(true)
  showLocSoft.value = false
  showLocSys.value = false
  uni.showToast({ title: `定位已开启 · ${locCity.value}`, icon: 'none' })
}

function denyLocation() {
  showLocSoft.value = false
  showLocSys.value = false
  uni.showToast({ title: '已拒绝定位授权', icon: 'none' })
}

function onGuideFooter(id) {
  if (!locGranted.value) {
    onOpenLocation()
    return
  }
  const tab = id === 'advice' || id === 'match' || id === 'forecast' ? id : 'forecast'
  uni.navigateTo({
    url: `/pages/guide/protect?tab=${tab}`,
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开失败',
        icon: 'none'
      })
    }
  })
}

function updateTime() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  currentTime.value = `${h}:${m < 10 ? '0' : ''}${m}`
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 0
    scrollHeight.value = calcScrollHeightStyle({ includeTabBar: true, extraPx: 44 })
  } catch (e) {
    statusBarHeight.value = 0
  }
  updateTime()
  timeTimer = setInterval(updateTime, 60000)
  refreshHomeFeatures()
  loadLocationState()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleDecorEntryStorage)
    window.addEventListener('message', handleDecorEntryMessage)
  }
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', handleDecorEntryStorage)
    window.removeEventListener('message', handleDecorEntryMessage)
  }
})

const features = ref([])

function refreshHomeFeatures() {
  features.value = getHomeFeatures()
}

function handleDecorEntryStorage(ev) {
  if (!ev || ev.key !== DECOR_ENTRY_STORAGE_KEY) return
  refreshHomeFeatures()
}

function handleDecorEntryMessage(ev) {
  if (!ev.data || ev.data.type !== 'decor-entry-sync' || !Array.isArray(ev.data.entries)) return
  saveDecorEntryList(ev.data.entries)
  refreshHomeFeatures()
}

onShow(() => {
  refreshHomeFeatures()
  loadLocationState()
})

const guideFooter = [
  { id: 'forecast', name: '实时预报', icon: '/static/features/forecast-line.svg' },
  { id: 'advice', name: '防护建议', icon: '/static/features/advice-line.svg' },
  { id: 'match', name: '搭配推荐', icon: '/static/features/match-line.svg' }
]

const trialList = [
  withImg({ id: 't1', productId: 'p1', line1: '丝绒哑光口红', line2: '阅己盒试用', tag: '上新' }),
  withImg({ id: 't2', productId: 'p2', line1: '裸粉口红礼盒', line2: '阅己盒试用', tag: '上新' })
]

const flashList = [
  withImg({ id: 'f1', productId: 'p3', line1: '双色口红套装', line2: '珊瑚+莓果', tag: '上新' }),
  withImg({ id: 'f2', productId: 'p4', line1: '绒雾口红', line2: '显白必入', tag: '上新' })
]

const productList = [
  withImg({
    id: 'p1',
    title: '经典正红丝绒口红',
    subTitle: '哑光质地 · 持久显色',
    desc: '经典正红色丝绒口红，哑光质地，上嘴显白，适合日常与派对妆容。'
  }),
  withImg({
    id: 'p2',
    title: '温柔裸粉口红礼盒',
    subTitle: '豆沙色号 · 通勤百搭',
    desc: '温柔裸粉豆沙色口红礼盒，日常通勤百搭，提升气色不挑皮。'
  }),
  withImg({
    id: 'p3',
    title: '珊瑚莓果双色套装',
    subTitle: '两支装 · 一盒多用',
    desc: '珊瑚与莓果双色口红套装，一盒满足多场景妆容需求。'
  }),
  withImg({
    id: 'p4',
    title: '绒雾质感口红',
    subTitle: '雾面妆感 · 轻盈不拔干',
    desc: '绒雾质感口红，雾面妆效轻盈不拔干，显白且易上色。'
  })
]

const placeholderText = computed(() => {
  return inputMode.value === 'search'
    ? '搜索你想查询的产品/成分/内容'
    : '向 AI 妆小妍提问护肤问题...'
})

function switchMode(mode) {
  inputMode.value = mode
}

function runHomeProductSearch() {
  const q = String(inputText.value || '').trim()
  if (!q) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }
  lastSearchKeyword.value = q
  const hits = searchProductsByKeyword(q, { onlyOnShelf: false, limit: 30 })
  searchResults.value = hits
  searchQueried.value = true
  uni.showToast({
    title: hits.length ? `找到 ${hits.length} 件商品` : '未找到相关商品',
    icon: 'none'
  })
}

function onSearchTab() {
  inputMode.value = 'search'
  runHomeProductSearch()
}

function onAskTab() {
  inputMode.value = 'ask'
  const q = String(inputText.value || '').trim()
  if (q) {
    uni.navigateTo({
      url: `/pages/ai-guide/index?q=${encodeURIComponent(q)}`,
      fail() {
        uni.showToast({ title: '打开提问失败', icon: 'none' })
      }
    })
  }
}

function onSearchSubmit() {
  inputMode.value = 'search'
  runHomeProductSearch()
}

function clearSearchResults() {
  searchQueried.value = false
  searchResults.value = []
}

function openSearchProduct(item) {
  if (!item) return
  const q = [
    `id=${encodeURIComponent(item.id)}`,
    `productId=${encodeURIComponent(item.id)}`,
    `title=${encodeURIComponent(item.title || '')}`,
    `subTitle=${encodeURIComponent(item.subTitle || '')}`,
    `img=${encodeURIComponent(item.img || '')}`
  ].join('&')
  uni.navigateTo({
    url: `/pages/product/detail?${q}`,
    fail() {
      uni.showToast({ title: '打开商品详情失败', icon: 'none' })
    }
  })
}

function onAiGuide() {
  uni.navigateTo({
    url: '/pages/ai-guide/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开AI导购失败',
        icon: 'none'
      })
    }
  })
}

function onAiKefu() {
  uni.navigateTo({
    url: '/pages/ai-kefu/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开AI客服失败',
        icon: 'none'
      })
    }
  })
}

function onMessage() {
  uni.navigateTo({
    url: '/pages/message/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开消息失败',
        icon: 'none'
      })
    }
  })
}

function onPoints() {
  uni.navigateTo({
    url: '/pages/points/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开积分商城失败',
        icon: 'none'
      })
    }
  })
}

function onScan() {
  uni.showToast({ title: '扫一扫', icon: 'none' })
}

function onFeatureTap(item) {
  if (!item) return
  const nav = resolveEntryNavigateUrl(item)
  if (nav) {
    if (nav.type === 'external') {
      if (typeof window !== 'undefined' && typeof window.open === 'function') {
        window.open(nav.url, '_blank')
      } else {
        uni.setClipboardData({
          data: nav.url,
          success: () => uni.showToast({ title: '链接已复制', icon: 'none' })
        })
      }
      return
    }
    uni.navigateTo({
      url: nav.url.startsWith('/') ? nav.url : '/' + nav.url,
      fail(err) {
        uni.showToast({
          title: (err && err.errMsg) || '打开失败',
          icon: 'none'
        })
      }
    })
    return
  }
  const actionKey = item.actionKey || resolveEntryActionKey(item)
  const route = ENTRY_ACTION_ROUTES[actionKey]
  if (route) {
    uni.navigateTo({
      url: route,
      fail(err) {
        uni.showToast({
          title: (err && err.errMsg) || '打开失败',
          icon: 'none'
        })
      }
    })
    return
  }
  // 无配置链接时，按入口名称打开装修会场（如「父亲节」）
  if (item.name && !resolveEntryActionKey(item)) {
    uni.navigateTo({
      url: '/pages/decor/page?name=' + encodeURIComponent(item.name),
      fail(err) {
        uni.showToast({
          title: (err && err.errMsg) || ('打开' + item.name + '失败'),
          icon: 'none'
        })
      }
    })
    return
  }
  uni.showToast({ title: item.name || '功能入口', icon: 'none' })
}

function goTrialCenter() {
  uni.navigateTo({
    url: '/pages/trial/index',
    fail(err) {
      console.error('navigateTo trial failed', err)
      uni.showToast({
        title: (err && err.errMsg) ? err.errMsg : '打开试用中心失败',
        icon: 'none',
        duration: 2500
      })
    }
  })
}

function goBeautyBox() {
  uni.switchTab({
    url: '/pages/beauty-box/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开美秀盒失败',
        icon: 'none'
      })
    }
  })
}

function onCardTap(name) {
  if (name === 'trial') {
    goTrialCenter()
    return
  }
  if (name === 'flash') {
    goBeautyBox()
    return
  }
  if (name === 'guide' || name === 'skin-record') {
    uni.navigateTo({
      url: '/pages/skin-guide/index',
      fail(err) {
        uni.showToast({
          title: (err && err.errMsg) || '打开失败',
          icon: 'none'
        })
      }
    })
    return
  }
  if (name === 'location') {
    onOpenLocation()
    return
  }
  if (name === 'survey') {
    uni.showToast({ title: '问卷已打开', icon: 'none' })
    return
  }
  uni.showToast({ title: name, icon: 'none' })
}

function goProductDetail(item) {
  uni.navigateTo({
    url: '/pages/plan/report',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开报告失败',
        icon: 'none'
      })
    }
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
  background: linear-gradient(180deg, #FFFFFF 0%, #F7F3FF 48%, #FCE8F3 100%);
}

.page-scroll {
  flex: 1;
  min-height: 0;
  padding-bottom: 32rpx;
  box-sizing: border-box;
}

.status-bar {
  background: #FFFFFF;
  flex-shrink: 0;
}

.status-inner {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
}

.status-time {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.status-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-signal,
.status-network,
.status-battery {
  font-size: 22rpx;
  color: $text-primary;
}

.hero-header {
  background: $header-gradient;
  padding: 0 24rpx 16rpx;
}

.title-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8rpx 0 12rpx;
}

.brand-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 1rpx;
  line-height: 44rpx;
  padding-top: 4rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.title-actions {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  min-width: 56rpx;
}

.action-icon {
  width: 44rpx;
  height: 44rpx;
}

.action-label {
  font-size: 18rpx;
  color: $primary-dark;
  line-height: 1.2;
}

.search-card {
  background: $card-bg;
  border-radius: 28rpx;
  padding: 28rpx 24rpx 20rpx;
  box-shadow: 0 12rpx 48rpx rgba(138, 99, 242, 0.12), 0 4rpx 16rpx rgba(244, 114, 182, 0.06);
  position: relative;
  overflow: hidden;
  margin-top: 0;
}

.search-card::before {
  content: 'AI AGENT';
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 80rpx;
  font-weight: 800;
  color: rgba(139, 124, 246, 0.06);
  letter-spacing: 4rpx;
  pointer-events: none;
}

.search-input-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  min-height: 80rpx;
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.5;
}

.search-placeholder {
  color: $text-hint;
  font-size: 28rpx;
}

.scan-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.scan-icon {
  font-size: 36rpx;
  color: $text-hint;
}

.search-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.mode-tabs {
  display: flex;
  gap: 16rpx;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  background: $purple-surface;
  border: none;
}

.mode-tab.active {
  background: linear-gradient(115deg, $primary-color 0%, $accent-pink 100%);
}

.mode-tab.active .mode-icon,
.mode-tab.active .mode-text {
  color: $text-white;
}

.mode-icon {
  font-size: 24rpx;
  color: $primary-color;
}

.mode-text {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: 500;
}

.mode-tab:not(.active) .mode-icon,
.mode-tab:not(.active) .mode-text {
  color: $primary-color;
}

.home-search-result {
  margin: 0 24rpx 24rpx;
  padding: 28rpx 24rpx 16rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(120, 90, 200, 0.08);
}

.home-search-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.home-search-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #111;
}

.home-search-count {
  flex: 1;
  font-size: 24rpx;
  color: #8A63F2;
}

.home-search-close {
  font-size: 36rpx;
  color: #bbb;
  padding: 0 8rpx;
  line-height: 1;
}

.home-search-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}

.home-search-item:last-child {
  border-bottom: none;
}

.home-search-cover {
  width: 112rpx;
  height: 112rpx;
  border-radius: 16rpx;
  background: #f5f5f7;
  flex-shrink: 0;
}

.home-search-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.home-search-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-search-sub {
  font-size: 22rpx;
  color: #888;
}

.home-search-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4rpx;
}

.home-search-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #E11D48;
}

.home-search-go {
  font-size: 24rpx;
  color: #8A63F2;
}

.home-search-empty {
  padding: 32rpx 8rpx 24rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.mascot {
  width: 100rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mascot-emoji {
  font-size: 72rpx;
}

.feature-section {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 20rpx 20rpx;
  background: $primary-bg;
}

.feature-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.feature-item-hover {
  opacity: 0.88;
}

.feature-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F5FF 100%);
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.15), inset 0 2rpx 4rpx rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.feature-icon {
  width: 56rpx;
  height: 56rpx;
}

.feature-name {
  font-size: 22rpx;
  color: $text-primary;
  text-align: center;
  line-height: 1.3;
}

.content-blocks {
  padding: 0 20rpx 20rpx;
}

.blocks-row {
  display: flex;
  gap: 16rpx;
  align-items: stretch;
}

.guide-card {
  flex: 1.05;
  display: flex;
  flex-direction: column;
  background: #FAFAFC;
  border-radius: 28rpx;
  padding: 20rpx 16rpx 16rpx;
  min-width: 0;
  border: none;
  box-sizing: border-box;
  box-shadow: 0 8rpx 28rpx rgba(138, 99, 242, 0.08);
}

.blocks-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  min-width: 0;
  align-self: stretch;
}

.promo-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #FAFAFC;
  border-radius: 28rpx;
  padding: 16rpx 12rpx 12rpx;
  border: none;
  box-sizing: border-box;
  min-height: 0;
  position: relative;
  z-index: 2;
  cursor: pointer;
  box-shadow: 0 8rpx 28rpx rgba(138, 99, 242, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6rpx;
}

.card-title {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-primary;
}

.card-arrow {
  font-size: 28rpx;
  color: $primary-light;
}

.card-desc {
  display: block;
  font-size: 18rpx;
  color: $text-hint;
  line-height: 1.5;
  margin-bottom: 12rpx;
}

.guide-actions {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 16rpx;
  flex: 1;
}

.guide-action-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  border-radius: 20rpx;
  padding: 18rpx 14rpx 18rpx 16rpx;
  position: relative;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.55);
}

.guide-action-item.action-loc {
  background: linear-gradient(145deg, #B8A6F5 0%, #8B7CF6 48%, #7A68E8 100%);
  box-shadow: 0 10rpx 24rpx rgba(109, 91, 208, 0.28);
}

.guide-action-item.action-skin {
  background: linear-gradient(145deg, #D4B8F8 0%, #A78BFA 48%, #9575F0 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 124, 246, 0.26);
}

.action-deco {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.action-loc .deco-a {
  width: 120rpx;
  height: 120rpx;
  right: -36rpx;
  top: -48rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 70%);
}

.action-loc .deco-b {
  width: 72rpx;
  height: 72rpx;
  left: 58rpx;
  bottom: -36rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 70%);
}

.action-skin .deco-a {
  width: 110rpx;
  height: 110rpx;
  right: -28rpx;
  bottom: -42rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 70%);
}

.action-skin .deco-b {
  width: 56rpx;
  height: 56rpx;
  left: 48rpx;
  top: -24rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
}

.action-badge {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 6rpx 16rpx rgba(74, 63, 140, 0.18), inset 0 1rpx 0 rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.badge-img {
  width: 52rpx;
  height: 52rpx;
}

.guide-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.guide-title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 4rpx;
}

.guide-action-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5rpx;
}

.guide-tag {
  font-size: 16rpx;
  color: #6D5BD0;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 999rpx;
  padding: 2rpx 10rpx;
  line-height: 1.4;
  font-weight: 600;
}

.guide-tag.soft {
  color: #7C3AED;
}

.guide-action-desc {
  display: block;
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.35;
}

.guide-cta {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 8rpx 14rpx 8rpx 16rpx;
  border-radius: 999rpx;
  background: $primary-color;
  box-shadow: 0 4rpx 12rpx rgba(139, 124, 246, 0.35);
  position: relative;
  z-index: 1;
}

.guide-cta-text {
  font-size: 18rpx;
  color: $text-white;
  font-weight: 700;
}

.guide-cta-arrow {
  font-size: 22rpx;
  color: $text-white;
  margin-left: 2rpx;
  line-height: 1;
  font-weight: 700;
}

.guide-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 8rpx;
  margin-top: auto;
}

.guide-footer-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F5FF 100%);
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.15), inset 0 2rpx 4rpx rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.footer-icon {
  width: 40rpx;
  height: 40rpx;
}

.footer-label {
  font-size: 18rpx;
  color: $primary-color;
  text-align: center;
  line-height: 1.3;
}

.promo-list {
  flex: 1;
  display: flex;
  gap: 10rpx;
  align-items: stretch;
}

.promo-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.promo-img-wrap {
  position: relative;
  margin-bottom: 6rpx;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  border-radius: 12rpx;
  background: #fff;
}

.promo-tag {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  font-size: 16rpx;
  color: $text-white;
  background: $primary-color;
  padding: 2rpx 8rpx;
  border-radius: 6rpx 0 6rpx 0;
}

.promo-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.promo-line1 {
  display: block;
  font-size: 18rpx;
  color: $primary-dark;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.promo-line2 {
  display: block;
  font-size: 16rpx;
  color: $text-hint;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-banner {
  margin: 0 20rpx 16rpx;
  background: $card-bg;
  border-radius: 20rpx;
  overflow: hidden;
  display: flex;
  box-shadow: 0 6rpx 24rpx rgba(139, 124, 246, 0.14);
  border: none;
}

.ad-img {
  width: 220rpx;
  height: 180rpx;
  flex-shrink: 0;
}

.ad-content {
  flex: 1;
  padding: 16rpx 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #FAF8FF, #F3EEFF);
}

.ad-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $primary-dark;
  margin-bottom: 8rpx;
}

.ad-sub {
  font-size: 20rpx;
  color: $text-hint;
  margin-bottom: 12rpx;
}

.ad-btn {
  align-self: flex-start;
  font-size: 22rpx;
  color: $text-white;
  border: none;
  padding: 6rpx 20rpx;
  border-radius: 24rpx;
  background: $primary-color;
}

.product-section {
  margin: 0 20rpx 16rpx;
  padding: 8rpx 0 16rpx;
}

.product-section-head {
  padding: 16rpx 8rpx 20rpx;
}

.product-section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $primary-dark;
}

.product-row {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 16rpx;
  background: $card-bg;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
  border: none;
}

.product-row:last-child {
  margin-bottom: 0;
}

.product-row:active {
  background: #F8F5FF;
}

.product-row-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 18rpx;
  flex-shrink: 0;
  background: $purple-placeholder;
}

.product-row-info {
  flex: 1;
  min-width: 0;
  margin: 0 24rpx;
}

.product-row-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-row-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $text-hint;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-row-arrow {
  flex-shrink: 0;
  font-size: 40rpx;
  color: $primary-light;
  line-height: 1;
}

.feedback-bar {
  margin: 0 20rpx;
  background: linear-gradient(90deg, $primary-color, $primary-light);
  border-radius: 40rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 6rpx 24rpx rgba(139, 124, 246, 0.35);
}

.feedback-emoji {
  font-size: 40rpx;
  flex-shrink: 0;
}

.feedback-text {
  flex: 1;
  font-size: 22rpx;
  color: $text-white;
  line-height: 1.4;
}

.feedback-btn {
  flex-shrink: 0;
  font-size: 22rpx;
  color: $text-white;
  background: $primary-dark;
  padding: 10rpx 24rpx;
  border-radius: 28rpx;
  font-weight: 600;
}

.loc-mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
}

.loc-soft {
  width: 100%;
  max-width: 620rpx;
  background: #fff;
  border-radius: 32rpx;
  padding: 44rpx 36rpx 32rpx;
  text-align: center;
}

.loc-soft-ico {
  width: 104rpx; height: 104rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #EFEAFF, #F7F3FF);
  display: flex; align-items: center; justify-content: center;
  font-size: 48rpx;
}

.loc-soft-title {
  display: block;
  font-size: 34rpx; font-weight: 700; color: #111;
  margin-bottom: 16rpx;
}

.loc-soft-desc {
  display: block;
  font-size: 26rpx; color: #888; line-height: 1.55;
  text-align: left; margin-bottom: 36rpx;
}

.loc-soft-actions { display: flex; gap: 20rpx; }

.loc-soft-btn {
  flex: 1; height: 80rpx; border-radius: 40rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 28rpx; font-weight: 600;
}
.loc-soft-btn text { color: inherit; }
.loc-soft-btn.cancel { background: #F3F3F5; color: #666; }
.loc-soft-btn.ok { background: #8A63F2; color: #fff; }

.loc-sys {
  width: 100%;
  max-width: 580rpx;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 28rpx;
  overflow: hidden;
  text-align: center;
}

.loc-sys-body { padding: 40rpx 32rpx 28rpx; }

.loc-sys-title {
  display: block;
  font-size: 32rpx; font-weight: 700; color: #111;
  line-height: 1.35; margin-bottom: 16rpx;
}

.loc-sys-desc {
  display: block;
  font-size: 24rpx; color: #666; line-height: 1.5;
}

.loc-sys-btn {
  height: 88rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 30rpx; color: #007AFF; font-weight: 500;
}
.loc-sys-btn text { color: inherit; }
.loc-sys-btn.allow { font-weight: 700; }
.loc-sys-btn.deny { color: #111; font-weight: 500; }
</style>
