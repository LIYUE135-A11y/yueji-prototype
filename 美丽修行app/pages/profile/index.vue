<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <!-- 用户信息 -->
      <view class="profile-head">
        <view class="head-actions">
          <view class="head-help" @tap="goAiHelp">帮助</view>
          <view class="head-icon" @tap="onTap('msg')">✉</view>
          <view class="head-icon" @tap="onTap('setting')">⚙</view>
        </view>
        <view class="user-row">
          <image class="avatar" :src="CURRENT_USER.avatar" mode="aspectFill" />
          <view class="user-info">
            <view class="name-row">
              <text class="nickname">{{ CURRENT_USER.nickname }}</text>
              <text class="name-arrow">›</text>
            </view>
            <view class="stats-row">
              <text class="stat">0关注</text>
              <text class="stat-div">|</text>
              <text class="stat">0收藏</text>
              <text class="stat-div">|</text>
              <text class="stat">0勋章</text>
            </view>
          </view>
        </view>
      </view>

      <!-- AI 会员卡 -->
      <view class="card ai-card" @tap="onTap('ai-vip')">
        <view class="ai-item">
          <view class="ai-dot"></view>
          <view class="ai-texts">
            <text class="ai-title">AI畅爽用</text>
            <text class="ai-sub">专属你的AI</text>
          </view>
        </view>
        <view class="ai-item">
          <view class="ai-dot"></view>
          <view class="ai-texts">
            <text class="ai-title">AI定制方案</text>
            <text class="ai-sub">全年护肤无忧</text>
          </view>
        </view>
        <view class="ai-btn">立即开通 ›</view>
      </view>

      <!-- 新手任务 -->
      <view class="card task-card">
        <view class="section-head">
          <text class="section-title">新手任务</text>
          <text class="countdown">距结束还剩05日10时</text>
        </view>
        <scroll-view scroll-x class="task-scroll" :show-scrollbar="false">
          <view class="task-list">
            <view v-for="item in tasks" :key="item.id" class="task-item">
              <text class="task-name">{{ item.name }}</text>
              <text class="task-reward">{{ item.reward }}</text>
              <view class="task-btn" @tap="onTap('task')">去完成</view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 功能入口 -->
      <view class="feature-section">
        <view
          v-for="item in menus"
          :key="item.id"
          class="feature-item"
          @tap="onTap(item.id)"
        >
          <view class="feature-icon-wrap">
            <image class="feature-icon" :src="item.icon" mode="aspectFit" />
          </view>
          <text class="feature-name">{{ item.name }}</text>
        </view>
      </view>

      <!-- AI定制方案 -->
      <view class="card plan-card" @tap="onTap('plan')">
        <view class="plan-left">
          <text class="plan-title">AI定制方案</text>
          <text class="plan-desc">3步定制你的专属省钱方案!</text>
          <text class="plan-tags">AI肤况追踪 妆品优化 跟练指南 搭配清单</text>
        </view>
        <view class="plan-btn">立即定制 ›</view>
      </view>

      <!-- 我的梳妆台 -->
      <view class="card desk-card" @tap="onTap('desk')">
        <view class="desk-head">
          <view class="desk-dot"></view>
          <text class="section-title">我的梳妆台</text>
        </view>
        <view class="desk-bubble">
          <text class="desk-text">打造专属美妆库 添加信息，轻松掌控~</text>
        </view>
      </view>

      <!-- 运行管理系统 -->
      <view class="card admin-card" @tap="onTap('admin')">
        <view class="admin-head">
          <view class="admin-icon-wrap">
            <text class="admin-icon">⚙</text>
          </view>
          <view class="admin-info-text">
            <text class="admin-title">运行管理系统</text>
            <text class="admin-desc">商品 · 订单 · 用户 · 数据 一站式管理</text>
          </view>
          <view class="admin-entry-btn">
            <text class="admin-entry-text">进入</text>
            <text class="admin-entry-arrow">›</text>
          </view>
        </view>
        <view class="admin-tags">
          <view class="admin-tag-item">
            <text class="tag-icon">📦</text>
            <text class="tag-label">商品管理</text>
          </view>
          <view class="admin-tag-item">
            <text class="tag-icon">📋</text>
            <text class="tag-label">订单管理</text>
          </view>
          <view class="admin-tag-item">
            <text class="tag-icon">👥</text>
            <text class="tag-label">用户管理</text>
          </view>
          <view class="admin-tag-item">
            <text class="tag-icon">📊</text>
            <text class="tag-label">数据中心</text>
          </view>
        </view>
      </view>

      <!-- 我的收藏 -->
      <view class="card fav-card">
        <view class="section-head">
          <text class="section-title">我的收藏(护肤清单)</text>
          <text class="section-more" @tap="onTap('fav-all')">查看全部 ›</text>
        </view>
        <view class="fav-grid">
          <view v-for="item in favs" :key="item.id" class="fav-item" @tap="onTap(item.id)">
            <view class="fav-icon-wrap">
              <image class="fav-icon-img" :src="item.icon" mode="aspectFit" />
            </view>
            <text class="fav-name">{{ item.name }}</text>
            <text class="fav-count">{{ item.count }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { CURRENT_USER } from '../../common/user-data.js'
import {
  DECOR_ENTRY_STORAGE_KEY,
  getProfileFeatures,
  saveDecorEntryList,
  resolveEntryActionKey,
  resolveEntryNavigateUrl,
  ENTRY_ACTION_ROUTES
} from '../../common/decor-entry-data.js'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')

const tasks = [
  { id: 1, name: '建立个人肤质档案 (0/1)', reward: '+50积分' },
  { id: 2, name: '完成首次AI测肤 (0/1)', reward: '+30积分' },
  { id: 3, name: '添加一件梳妆台产品 (0/1)', reward: '+20积分' }
]

const menus = ref([])

function refreshProfileFeatures() {
  menus.value = getProfileFeatures()
}

function handleDecorEntryStorage(ev) {
  if (!ev || ev.key !== DECOR_ENTRY_STORAGE_KEY) return
  refreshProfileFeatures()
}

function handleDecorEntryMessage(ev) {
  if (!ev.data || ev.data.type !== 'decor-entry-sync' || !Array.isArray(ev.data.entries)) return
  saveDecorEntryList(ev.data.entries)
  refreshProfileFeatures()
}

onShow(() => {
  refreshProfileFeatures()
})

const favs = [
  { id: 'want', name: '想用', count: '0', icon: '/static/features/want.svg' },
  { id: 'used', name: '用过', count: '0', icon: '/static/features/used.svg' },
  { id: 'allergy', name: '过敏不适', count: '0', icon: '/static/features/allergy.svg' }
]

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeightStyle({ includeTabBar: true })
  } catch (e) {}
  refreshProfileFeatures()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleDecorEntryStorage)
    window.addEventListener('message', handleDecorEntryMessage)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('storage', handleDecorEntryStorage)
    window.removeEventListener('message', handleDecorEntryMessage)
  }
})

function navigate(url, failTitle) {
  uni.navigateTo({
    url,
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || failTitle || '打开失败',
        icon: 'none'
      })
    }
  })
}

function goDesk() {
  navigate('/pages/desk/index', '打开梳妆台失败')
}

function goAiHelp() {
  navigate('/pages/ai-help/index', '打开AI帮助中心失败')
}

function goPlan() {
  navigate('/pages/plan/index', '打开定制方案失败')
}

function goSkinGuide() {
  navigate('/pages/skin-guide/index', '打开AI测肤失败')
}

function goAdmin() {
  // 运营端独立目录：勿挂在 App pages 下
  const url = '../运营管理系统/preview.html'
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    window.open(url, '_blank')
    return
  }
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '运营端链接已复制', icon: 'none' })
  })
}

function onTap(id) {
  const menu = menus.value.find((m) => m.id === id)
  const nav = resolveEntryNavigateUrl(menu || { id })
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
    navigate(nav.url.startsWith('/') ? nav.url : '/' + nav.url, '打开失败')
    return
  }
  const actionKey = menu ? (menu.actionKey || resolveEntryActionKey(menu)) : ''
  if (actionKey) {
    const route = ENTRY_ACTION_ROUTES[actionKey]
    if (route) {
      navigate(route, '打开失败')
      return
    }
  }
  if (menu && /购物车/.test(menu.name || '')) {
    navigate('/pages/cart/index', '打开购物车失败')
    return
  }
  if (menu && /订单/.test(menu.name || '')) {
    navigate('/pages/order/index', '打开订单失败')
    return
  }
  if (id === 'desk') {
    goDesk()
    return
  }
  if (id === 'plan' || id === 'ai-vip') {
    goPlan()
    return
  }
  if (id === 'task') {
    goSkinGuide()
    return
  }
  if (id === 'admin') {
    goAdmin()
    return
  }
  if (id === 'msg') {
    navigate('/pages/message/index', '打开消息失败')
    return
  }
  uni.showToast({ title: String(id || ''), icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: $primary-bg;
}

.status-bar {
  background: $primary-bg;
  flex-shrink: 0;
}

.scroll {
  flex: 1;
  min-height: 0;
  background: $primary-bg;
}

.profile-head {
  background: $primary-bg;
  padding: 8rpx 28rpx 28rpx;
}

.head-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.head-help {
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 18rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #a78bfa 0%, #8a63f2 100%);
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  box-shadow: 0 4rpx 14rpx rgba(138, 99, 242, 0.28);
}

.head-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $purple-surface;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: $primary-dark;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.name-arrow {
  font-size: 32rpx;
  color: $primary-light;
}

.stats-row {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  gap: 10rpx;
}

.stat {
  font-size: 22rpx;
  color: $text-hint;
}

.stat-div {
  font-size: 20rpx;
  color: $border-color;
}

.card {
  margin: 20rpx 24rpx 0;
  background: $card-bg;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 40rpx $shadow-color;
}

.ai-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 22rpx 20rpx;
}

.ai-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
}

.ai-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-light, $primary-color);
  flex-shrink: 0;
}

.ai-texts {
  min-width: 0;
}

.ai-title {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: $text-primary;
}

.ai-sub {
  display: block;
  margin-top: 4rpx;
  font-size: 18rpx;
  color: $text-hint;
}

.ai-btn,
.plan-btn {
  flex-shrink: 0;
  background: $primary-color;
  color: $text-white;
  font-size: 22rpx;
  font-weight: 600;
  padding: 14rpx 18rpx;
  border-radius: 40rpx;
  white-space: nowrap;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.countdown {
  font-size: 20rpx;
  color: $text-hint;
}

.section-more {
  font-size: 22rpx;
  color: $primary-light;
}

.task-scroll {
  white-space: nowrap;
  width: 100%;
}

.task-list {
  display: inline-flex;
  gap: 16rpx;
}

.task-item {
  display: inline-flex;
  flex-direction: column;
  width: 280rpx;
  padding: 20rpx;
  background: $purple-surface;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.task-name {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
  white-space: normal;
  line-height: 1.35;
}

.task-reward {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: $primary-color;
  font-weight: 600;
}

.task-btn {
  margin-top: 16rpx;
  align-self: flex-start;
  background: $primary-color;
  color: $text-white;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
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

.plan-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #FAFAFC;
}

.plan-left {
  flex: 1;
  min-width: 0;
}

.plan-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.plan-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 600;
}

.plan-tags {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
  color: $text-hint;
  line-height: 1.4;
}

.desk-card {
  padding-bottom: 20rpx;
}

.desk-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.desk-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-light, $primary-color);
}

.desk-bubble {
  background: $purple-surface;
  border-radius: 16rpx;
  padding: 22rpx 20rpx;
}

.desk-text {
  font-size: 24rpx;
  color: $text-hint;
}

/* 运行管理系统卡片 */
.admin-card {
  background: linear-gradient(135deg, #FAF8FF 0%, #F3EEFF 100%);
  border: 2rpx solid $purple-border;
  padding: 28rpx;
}

.admin-head {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.admin-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(139, 124, 246, 0.3);
  flex-shrink: 0;
}

.admin-icon {
  font-size: 40rpx;
}

.admin-info-text {
  flex: 1;
  min-width: 0;
}

.admin-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $primary-dark;
  line-height: 1.3;
}

.admin-desc {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $text-hint;
  line-height: 1.4;
}

.admin-entry-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx 12rpx 24rpx;
  background: $primary-color;
  border-radius: 40rpx;
  flex-shrink: 0;
  box-shadow: 0 6rpx 16rpx rgba(139, 124, 246, 0.3);
}

.admin-entry-text {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-white;
}

.admin-entry-arrow {
  font-size: 28rpx;
  color: $text-white;
  margin-left: 2rpx;
  line-height: 1;
}

.admin-tags {
  display: flex;
  gap: 16rpx;
}

.admin-tag-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 12rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(139, 124, 246, 0.08);
}

.tag-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.tag-label {
  font-size: 20rpx;
  color: $text-secondary;
  font-weight: 500;
}

.fav-grid {
  display: flex;
  gap: 16rpx;
}

.fav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.fav-icon-wrap {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #F8F5FF 100%);
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.12), inset 0 2rpx 4rpx rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.fav-icon-img {
  width: 56%;
  height: 56%;
}

.fav-name {
  font-size: 22rpx;
  color: $text-secondary;
}

.fav-count {
  font-size: 20rpx;
  color: $text-hint;
  margin-top: -4rpx;
}

.bottom-space {
  height: 40rpx;
}
</style>
