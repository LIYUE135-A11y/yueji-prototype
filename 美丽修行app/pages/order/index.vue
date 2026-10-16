<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">我的订单</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view scroll-x class="order-tabs" :show-scrollbar="false">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="order-tab"
        :class="{ active: activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >{{ tab.name }}</view>
    </scroll-view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view v-if="filteredOrders.length" class="order-list">
        <view v-for="order in filteredOrders" :key="order.id" class="order-card">
          <view class="order-head">
            <text class="order-no">订单号 {{ order.orderNo }}</text>
            <view class="order-head-right">
              <text v-if="getReviewLabel(order)" class="order-review-flag">{{ getReviewLabel(order) }}</text>
              <text class="order-status">{{ getOrderDisplayStatus(order) }}</text>
            </view>
          </view>
          <view v-for="item in order.items" :key="item.productId + item.spec" class="order-item">
            <image v-if="item.img" class="order-img" :src="item.img" mode="aspectFill" />
            <view v-else class="order-img-ph"><text>暂无图</text></view>
            <view class="order-body">
              <text class="order-title">{{ item.title }}</text>
              <text class="order-sub">{{ item.subTitle }}</text>
              <text v-if="item.couponTag" class="order-coupon">{{ item.couponTag }}</text>
              <view class="order-meta">
                <text class="order-price">¥{{ item.price }}</text>
                <text class="order-qty">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
          <view class="order-foot">
            <text class="order-time">{{ formatTime(order.createdAt) }} · {{ order.payMethod }}</text>
            <view class="order-foot-right">
              <text v-if="calcCouponAfter(order) != null" class="order-coupon-after">券后 ¥{{ calcCouponAfter(order) }}</text>
              <text class="order-total">合计 ¥{{ order.totalPrice }}</text>
            </view>
          </view>
          <view class="order-actions">
            <view
              v-for="btn in getOrderButtons(order)"
              :key="btn.action"
              class="order-action-btn"
              :class="{ primary: btn.primary }"
              @tap="onOrderAction(order, btn.action)"
            >{{ btn.label }}</view>
          </view>
        </view>
      </view>

      <view v-else class="empty-wrap">
        <text class="empty-icon">📋</text>
        <text class="empty-text">{{ emptyText }}</text>
        <text class="empty-sub">立即购买或购物车结算后订单会出现在这里</text>
      </view>

      <view class="list-end">
        <text class="end-text">— 已经到底啦 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  ORDER_STORAGE_KEY,
  ORDER_UPDATE_EVENT,
  loadOrderList,
  applyOrderAction,
  getOrderDisplayStatus,
  getOrderReviewLabel,
  calcOrderCouponAfter,
  formatOrderTime
} from '../../common/order-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const orders = ref([])
const activeTab = ref('all')
const tabs = [
  { key: 'all', name: '全部' },
  { key: 'unpaid', name: '待付款' },
  { key: 'await', name: '待发货' },
  { key: 'receive', name: '待收货' },
  { key: 'done', name: '已完成' },
  { key: 'review', name: '评价' }
]

function resolveTabKey(order) {
  const key = order.statusKey || ''
  const status = order.status || ''
  if (status.includes('待付款') || key === 'pending' || key === 'unpaid') return 'unpaid'
  if (status.includes('退款') || key === 'refunding') return 'refunding'
  if (status.includes('确认收货') || status.includes('待收货') || status.includes('已发货') ||
      key === 'receive' || key === 'shipped' || key === 'shipping' || key === 'delivering') {
    return 'receive'
  }
  if (status.includes('已完成') || key === 'done') return 'done'
  if (status === '已付款' || key === 'paid' || status.includes('待发货') || key === 'await' || status.includes('已支付')) {
    return 'await'
  }
  if (order.payStatusKey === 'unpaid') return 'unpaid'
  return key || 'await'
}

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const tk = resolveTabKey(order)
    if (activeTab.value === 'all') return true
    if (activeTab.value === 'review') return tk === 'done'
    return tk === activeTab.value
  })
})

const emptyText = computed(() => {
  const map = {
    all: '暂无订单',
    unpaid: '暂无待付款订单',
    await: '暂无待发货订单',
    receive: '暂无待收货订单',
    done: '暂无已完成订单',
    review: '暂无评价订单'
  }
  return map[activeTab.value] || '暂无订单'
})

function getReviewLabel(order) {
  return getOrderReviewLabel(order)
}

function calcCouponAfter(order) {
  return calcOrderCouponAfter(order)
}

function getOrderButtons(order) {
  const tk = resolveTabKey(order)
  if (tk === 'unpaid') {
    return [
      { action: 'cancel', label: '取消订单' },
      { action: 'pay', label: '去付款', primary: true }
    ]
  }
  if (tk === 'await') {
    return [
      { action: 'aftersale', label: '申请售后' },
      { action: 'logistics', label: '查看物流' },
      { action: 'ship', label: '模拟发货', primary: true }
    ]
  }
  if (tk === 'receive') {
    return [
      { action: 'aftersale', label: '申请售后' },
      { action: 'logistics', label: '查看物流' },
      { action: 'confirm', label: '确认收货', primary: true }
    ]
  }
  if (tk === 'done') {
    const btns = [
      { action: 'aftersale', label: '申请售后' },
      { action: 'logistics', label: '查看物流' }
    ]
    if (!order.reviewed) btns.push({ action: 'review', label: '评价', primary: true })
    else btns.push({ action: 'view-review', label: '已评价' })
    return btns
  }
  if (tk === 'refunding') {
    return [
      { action: 'logistics', label: '查看物流' },
      { action: 'aftersale', label: '售后进度', primary: true }
    ]
  }
  return [
    { action: 'aftersale', label: '申请售后' },
    { action: 'logistics', label: '查看物流' },
    { action: 'confirm', label: '确认收货', primary: true }
  ]
}

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const navH = 44
  const tabH = 44
  const safe = info.safeAreaInsets?.bottom || 0
  return info.windowHeight - statusBar - navH - tabH - safe
}

function refreshOrders() {
  orders.value = loadOrderList()
  try {
    const info = uni.getSystemInfoSync()
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}
}

function switchTab(key) {
  activeTab.value = key
}

function formatTime(ts) {
  return formatOrderTime(ts)
}

function onOrderAction(order, action) {
  if (action === 'cancel') {
    uni.showModal({
      title: '取消订单',
      content: '确定取消该待付款订单吗？',
      success(res) {
        if (!res.confirm) return
        const list = loadOrderList().filter((o) => o.id !== order.id)
        try {
          uni.setStorageSync(ORDER_STORAGE_KEY, list)
        } catch (e) {}
        refreshOrders()
        uni.showToast({ title: '订单已取消', icon: 'none' })
      }
    })
    return
  }
  if (action === 'review') {
    const result = applyOrderAction(order.id, 'review', { score: 5, text: '很好用，推荐！' })
    if (result.changed) refreshOrders()
    uni.showToast({ title: result.tip || '评价成功', icon: 'none', duration: 2500 })
    return
  }
  if (action === 'view-review') {
    uni.showModal({
      title: '我的评价',
      content: '评分：' + (order.reviewScore || 5) + ' 星\n' + (order.reviewText || '暂无文字评价'),
      showCancel: false
    })
    return
  }
  const result = applyOrderAction(order.id, action)
  if (result.changed) refreshOrders()
  uni.showToast({ title: result.tip || '操作成功', icon: 'none', duration: 2500 })
}

function handleOrderStorage(ev) {
  if (!ev || ev.key !== ORDER_STORAGE_KEY) return
  refreshOrders()
}

function handleOrderEvent() {
  refreshOrders()
}

onLoad(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {}
  refreshOrders()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleOrderStorage)
    window.addEventListener(ORDER_UPDATE_EVENT, handleOrderEvent)
  }
})

onShow(() => {
  refreshOrders()
})

function goBack() {
  uni.navigateBack({ delta: 1, fail() { uni.switchTab({ url: '/pages/profile/index' }) } })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: $purple-surface;
}

.status-bar,
.nav-bar {
  background: #ffffff;
  flex-shrink: 0;
}

.nav-bar {
  height: 88rpx;
  padding: 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-btn,
.nav-placeholder {
  width: 72rpx;
  height: 72rpx;
}

.nav-back {
  font-size: 56rpx;
  color: #222222;
  line-height: 72rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
}

.order-tabs {
  flex-shrink: 0;
  white-space: nowrap;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 0 8rpx;
}

.order-tab {
  display: inline-block;
  padding: 24rpx 28rpx;
  font-size: 26rpx;
  color: #666;
}

.order-tab.active {
  color: #8A63F2;
  font-weight: 600;
  position: relative;
}

.order-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  border-radius: 4rpx;
  background: #8A63F2;
}

.scroll {
  flex: 1;
  min-height: 0;
}

.order-list {
  padding: 24rpx;
}

.order-card {
  background: #ffffff;
  border-radius: 28rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(139, 124, 246, 0.08);
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 16rpx;
}

.order-no {
  font-size: 24rpx;
  color: #666666;
}

.order-head-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.order-status {
  font-size: 24rpx;
  font-weight: 600;
  color: $primary-color;
}

.order-review-flag {
  font-size: 22rpx;
  font-weight: 600;
  color: #c45c26;
  background: #fff3eb;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.order-item {
  display: flex;
  gap: 20rpx;
  padding: 16rpx 0;
}

.order-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.order-img-ph {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f3f0fa, #ede8f8);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #b7a9d9;
}

.order-body {
  flex: 1;
  min-width: 0;
}

.order-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #222222;
  line-height: 1.35;
}

.order-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999999;
}

.order-coupon {
  display: inline-block;
  margin-top: 8rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  border: 1rpx solid #f3d0d8;
  font-size: 22rpx;
  color: #e85d7b;
}

.order-meta {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-top: 12rpx;
}

.order-price {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary-color;
}

.order-qty {
  font-size: 24rpx;
  color: #888888;
}

.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  gap: 12rpx;
}

.order-time {
  font-size: 22rpx;
  color: #999999;
}

.order-foot-right {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  flex-shrink: 0;
}

.order-coupon-after {
  font-size: 24rpx;
  font-weight: 600;
  color: #c45c26;
}

.order-total {
  font-size: 28rpx;
  font-weight: 700;
  color: $primary-color;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
}

.order-action-btn {
  padding: 10rpx 28rpx;
  border-radius: 32rpx;
  border: 1rpx solid #dddddd;
  background: #ffffff;
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
}

.order-action-btn.primary {
  border-color: $primary-color;
  background: $primary-color;
  color: #ffffff;
}

.empty-wrap {
  padding: 160rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #444444;
}

.empty-sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999999;
  text-align: center;
}

.list-end {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 40rpx;
}

.end-text {
  font-size: 22rpx;
  color: #cccccc;
}
</style>
