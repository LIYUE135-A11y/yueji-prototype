<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">消息</text>
      <view class="nav-right" @tap="onMarkAllRead">
        <text class="nav-read-all">全部已读</text>
      </view>
    </view>

    <view class="tabs-wrap">
      <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
        <view class="tabs-inner">
          <view
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @tap="switchTab(tab.id)"
          >
            <text class="tab-text">{{ tab.name }}</text>
            <view v-if="unreadOf(tab.id) > 0" class="tab-dot"></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ height: scrollHeight }"
      :show-scrollbar="false"
    >
      <view v-if="filteredList.length" class="msg-list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="msg-item"
          :class="{ unread: !item.read }"
          @tap="onOpenMessage(item)"
        >
          <view class="msg-avatar">
            <text class="msg-icon">{{ item.icon || '🔔' }}</text>
            <view v-if="!item.read" class="msg-unread-dot"></view>
          </view>
          <view class="msg-body">
            <view class="msg-top">
              <text class="msg-title">{{ item.title }}</text>
              <text class="msg-time">{{ item.time }}</text>
            </view>
            <text class="msg-content">{{ item.content }}</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-wrap">
        <text class="empty-icon">{{ emptyIcon }}</text>
        <text class="empty-text">{{ emptyText }}</text>
        <text class="empty-sub">有新动态时会显示在这里</text>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  MESSAGE_TABS,
  loadMessageList,
  getMessagesByTab,
  countUnread,
  markAllRead,
  markOneRead
} from '../../common/message-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const tabs = MESSAGE_TABS
const activeTab = ref('notice')
const list = ref([])

const filteredList = computed(() => getMessagesByTab(activeTab.value, list.value))

const emptyIcon = computed(() => {
  const map = { notice: '🔔', curated: '✨', reply: '💬', like: '♡' }
  return map[activeTab.value] || '📭'
})

const emptyText = computed(() => {
  const map = {
    notice: '暂无通知',
    curated: '暂无内容精选',
    reply: '暂无回复',
    like: '暂无赞和收藏'
  }
  return map[activeTab.value] || '暂无消息'
})

function unreadOf(tabId) {
  return countUnread(tabId, list.value)
}

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const navH = 44
  const tabsH = 44
  const safe = info.safeAreaInsets?.bottom || 0
  return info.windowHeight - statusBar - navH - tabsH - safe
}

function refresh() {
  list.value = loadMessageList()
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}
}

onLoad((query) => {
  if (query && query.tab) {
    const ok = MESSAGE_TABS.some((t) => t.id === query.tab)
    if (ok) activeTab.value = query.tab
  }
  refresh()
})

onShow(() => {
  refresh()
})

function goBack() {
  uni.navigateBack({
    delta: 1,
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function switchTab(id) {
  activeTab.value = id
}

function onMarkAllRead() {
  const unread = countUnread('', list.value)
  if (!unread) {
    uni.showToast({ title: '已全部已读', icon: 'none' })
    return
  }
  list.value = markAllRead(list.value)
  uni.showToast({ title: '已全部标为已读', icon: 'none' })
}

function onOpenMessage(item) {
  if (!item) return
  if (!item.read) {
    list.value = markOneRead(item.id, list.value)
  }
  if (item.tab === 'curated') {
    uni.navigateTo({
      url: '/pages/content/detail',
      fail() {
        uni.showToast({ title: item.title, icon: 'none' })
      }
    })
    return
  }
  uni.showToast({ title: item.title, icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: #fff;
}

.status-bar,
.nav-bar,
.tabs-wrap {
  background: #fff;
  flex-shrink: 0;
}

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16rpx 0 12rpx;
  border-bottom: 1px solid #F5F5F5;
}

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 52rpx;
  color: #222;
  line-height: 1;
  font-weight: 300;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}

.nav-right {
  min-width: 120rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8rpx;
}

.nav-read-all {
  font-size: 26rpx;
  color: #666;
}

.tabs-wrap {
  border-bottom: 1px solid #F0F0F0;
}

.tabs-scroll {
  width: 100%;
  white-space: nowrap;
}

.tabs-inner {
  display: inline-flex;
  align-items: center;
  padding: 0 12rpx;
  min-width: 100%;
  box-sizing: border-box;
}

.tab-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  padding: 0 28rpx;
  flex-shrink: 0;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: $primary-color;
  font-weight: 700;
  font-size: 30rpx;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 8rpx;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: $primary-color;
}

.tab-dot {
  position: absolute;
  top: 22rpx;
  right: 14rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #FF4757;
}

.scroll {
  @include app-page-scroll;
  background: #FAFAFC;
}

.msg-list {
  padding: 8rpx 0 0;
  background: #fff;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 28rpx 28rpx;
  border-bottom: 1px solid #F5F5F5;
  background: #fff;
}

.msg-item.unread {
  background: #FCFBFF;
}

.msg-avatar {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $purple-surface;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-icon {
  font-size: 36rpx;
  line-height: 1;
}

.msg-unread-dot {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #FF4757;
  border: 2rpx solid #fff;
}

.msg-body {
  flex: 1;
  min-width: 0;
  padding-top: 4rpx;
}

.msg-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.msg-title {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-time {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #AAA;
}

.msg-content {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #888;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-wrap {
  min-height: 520rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 8rpx;
  opacity: 0.7;
}

.empty-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #666;
}

.empty-sub {
  font-size: 24rpx;
  color: #AAA;
}

.list-end {
  padding: 36rpx 0 60rpx;
  text-align: center;
}

.end-text {
  font-size: 22rpx;
  color: #CCC;
}
</style>
