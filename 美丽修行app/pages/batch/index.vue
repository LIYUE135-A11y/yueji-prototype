<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-left">
        <view class="nav-btn" @tap="goBack"><text class="nav-back">‹</text></view>
        <view class="nav-btn" @tap="goBack"><text class="nav-close">×</text></view>
      </view>
      <text class="nav-title">批号查询</text>
      <view class="nav-right"></view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view v-if="showNotice" class="notice">
        <text class="notice-ico">📢</text>
        <text class="notice-text">化妆品批号查询保质期功能上线啦～</text>
        <text class="notice-x" @tap="showNotice = false">×</text>
      </view>

      <view class="form-card">
        <view class="field" @tap="pickBrand">
          <text class="field-label">品牌</text>
          <text class="field-value" :class="{ placeholder: !brand }">
            {{ brand || '请选择品牌' }}
          </text>
          <text class="field-arrow">›</text>
        </view>

        <view class="field">
          <text class="field-label">批号</text>
          <input
            class="field-input"
            v-model="batchNo"
            placeholder="请输入生产批号 / SKU / 商品ID"
            placeholder-class="field-ph"
          />
        </view>

        <view class="help-row">
          <view class="help-link" @tap="onFeedback">
            <text class="help-ico">✎</text>
            <text>问题反馈</text>
          </view>
          <view class="help-link" @tap="onHelp">
            <text class="help-ico">ⓘ</text>
            <text>批号说明</text>
          </view>
        </view>

        <view class="query-btn" :class="{ active: canQuery }" @tap="onQuery">
          <text class="query-text">查询</text>
        </view>
      </view>

      <view v-if="queried" class="result-section">
        <view class="history-head">
          <text class="history-title">查询结果</text>
          <text class="result-count">{{ resultList.length }} 件商品</text>
        </view>
        <view v-if="resultList.length" class="result-list">
          <view
            v-for="item in resultList"
            :key="item.id"
            class="result-item"
            @tap="openProduct(item)"
          >
            <image class="result-cover" :src="item.img" mode="aspectFill" />
            <view class="result-body">
              <text class="result-name">{{ item.title }}</text>
              <text class="result-sub">{{ item.brand }} · {{ item.sku || item.batchNo }}</text>
              <view class="result-foot">
                <text class="result-price">¥{{ item.price }}</text>
                <text class="result-status" :class="{ off: item.status === '已下架' }">
                  {{ item.status || '已上架' }}
                </text>
              </view>
            </view>
            <text class="result-arrow">›</text>
          </view>
        </view>
        <view v-else class="result-empty">
          <text class="result-empty-text">未在商品管理中找到匹配项</text>
          <text class="result-empty-tip">可尝试输入该品牌商品的 SKU 或商品ID</text>
        </view>
      </view>

      <view class="history-section">
        <view class="history-head">
          <text class="history-title">查询历史</text>
          <view class="desk-link" @tap="onDesk">
            <text class="desk-ico">▣</text>
            <text class="desk-text">我的梳妆台</text>
          </view>
        </view>

        <view v-if="historyList.length" class="history-list">
          <view
            v-for="item in historyList"
            :key="item.id"
            class="history-item"
            @tap="fillHistory(item)"
          >
            <view class="history-main">
              <text class="history-brand">{{ item.brand }}</text>
              <text class="history-batch">批号 {{ item.batchNo }}</text>
            </view>
            <view class="history-meta">
              <text class="history-result">{{ item.result }}</text>
              <text class="history-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
        <view v-else class="history-empty">
          <view class="empty-art">
            <view class="empty-scroll"></view>
            <view class="empty-glass"></view>
            <view class="empty-person"></view>
          </view>
          <text class="history-empty-text">暂无查询历史～</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'
import {
  loadQueryableProductList,
  collectProductBrands,
  queryProductsByBrandAndBatch
} from '../../common/product-store-app.js'

const HISTORY_KEY = 'zhuangyan_batch_query_history_v1'
const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const brand = ref('')
const batchNo = ref('')
const showNotice = ref(true)
const brands = ref(['花西子', '薇诺娜', 'OLAY', '完美日记', '自然堂', '其他品牌'])
const historyList = ref([])
const resultList = ref([])
const queried = ref(false)

const canQuery = computed(() => !!(brand.value && String(batchNo.value || '').trim()))

function refreshBrands() {
  const list = loadQueryableProductList()
  const fromProducts = collectProductBrands(list)
  brands.value = fromProducts.length > 1 ? fromProducts : brands.value
}

function loadHistory() {
  try {
    const raw = uni.getStorageSync(HISTORY_KEY)
    if (!raw) return
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(parsed)) historyList.value = parsed.slice(0, 30)
  } catch (e) { /* ignore */ }
}

function saveHistory() {
  try {
    uni.setStorageSync(HISTORY_KEY, historyList.value.slice(0, 30))
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeightStyle({ navRpx: 88, extraPx: 0 })
  } catch (e) {}
  refreshBrands()
  loadHistory()
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function pickBrand() {
  refreshBrands()
  const list = brands.value
  if (!list.length) {
    uni.showToast({ title: '暂无可选品牌', icon: 'none' })
    return
  }
  // ActionSheet 最多约 6 项体验较好，品牌多时用多组或 picker
  if (list.length <= 6) {
    uni.showActionSheet({
      itemList: list,
      success(res) {
        brand.value = list[res.tapIndex]
      }
    })
    return
  }
  uni.showActionSheet({
    itemList: list.slice(0, 6).concat(['更多品牌…']),
    success(res) {
      if (res.tapIndex < 6) {
        brand.value = list[res.tapIndex]
        return
      }
      uni.showActionSheet({
        itemList: list.slice(6, 12).concat(list.length > 12 ? ['继续…'] : []),
        success(res2) {
          const idx = 6 + res2.tapIndex
          if (idx < list.length) brand.value = list[idx]
          else if (list.length > 12) {
            uni.showActionSheet({
              itemList: list.slice(12),
              success(res3) {
                brand.value = list[12 + res3.tapIndex]
              }
            })
          }
        }
      })
    }
  })
}

function onFeedback() {
  uni.showToast({ title: '问题反馈即将上线', icon: 'none' })
}

function onHelp() {
  uni.showModal({
    title: '批号说明',
    content:
      '批号一般印在外包装或瓶身底部。本页将根据所选品牌，在运营端「商品管理」列表中匹配批号 / SKU / 商品ID，展示对应商品信息。',
    showCancel: false
  })
}

function formatNow() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `今天 ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function onQuery() {
  if (!canQuery.value) {
    uni.showToast({ title: '请选择品牌并输入生产批号', icon: 'none' })
    return
  }
  const no = batchNo.value.trim()
  const hits = queryProductsByBrandAndBatch(brand.value, no)
  resultList.value = hits
  queried.value = true
  const resultText = hits.length
    ? `找到 ${hits.length} 件 · ${hits[0].title}`
    : '未找到匹配商品'
  historyList.value.unshift({
    id: Date.now(),
    brand: brand.value,
    batchNo: no,
    result: resultText,
    time: formatNow(),
    productId: hits[0] ? hits[0].id : ''
  })
  if (historyList.value.length > 30) historyList.value.length = 30
  saveHistory()
  uni.showToast({
    title: hits.length ? `查询到 ${hits.length} 件商品` : '未找到匹配商品',
    icon: 'none'
  })
}

function fillHistory(item) {
  brand.value = item.brand
  batchNo.value = item.batchNo
  const hits = queryProductsByBrandAndBatch(item.brand, item.batchNo)
  resultList.value = hits
  queried.value = true
}

function openProduct(item) {
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

function onDesk() {
  uni.navigateTo({
    url: '/pages/desk/index',
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开梳妆台失败',
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
  background: #F5F5F7;
}

.status-bar,
.nav-bar {
  background: #fff;
  flex-shrink: 0;
}

.nav-bar {
  height: 88rpx;
  padding: 0 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
  z-index: 2;
}

.nav-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 52rpx;
  color: #111;
  line-height: 1;
  margin-top: -4rpx;
}

.nav-close {
  font-size: 40rpx;
  color: #111;
  line-height: 1;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 34rpx;
  font-weight: 700;
  color: #111;
}

.nav-right {
  width: 120rpx;
}

.scroll {
  flex: 1;
  min-height: 0;
}

.notice {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 64rpx 20rpx 28rpx;
  background: #EFEAFF;
}

.notice-ico {
  font-size: 24rpx;
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
  font-size: 26rpx;
  color: #8A63F2;
  font-weight: 500;
}

.notice-x {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  color: #B5A4F0;
  padding: 8rpx;
}

.form-card {
  margin: 28rpx 24rpx 0;
  padding: 8rpx 32rpx 40rpx;
  background: #fff;
  border-radius: 28rpx;
}

.field {
  height: 104rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #F0F0F2;
}

.field:last-of-type {
  border-bottom: none;
}

.field-label {
  width: 84rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #111;
  flex-shrink: 0;
}

.field-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.field-value.placeholder {
  color: #C0C0C4;
}

.field-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  height: 104rpx;
}

.field-ph {
  color: #C0C0C4;
}

.field-arrow {
  font-size: 36rpx;
  color: #C8C8CC;
  font-weight: 300;
  flex-shrink: 0;
}

.help-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 28rpx 4rpx 36rpx;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #8A63F2;
}

.help-ico {
  font-size: 26rpx;
  color: #8A63F2;
}

.query-btn {
  height: 96rpx;
  border-radius: 48rpx;
  background: #E5E5EA;
  display: flex;
  align-items: center;
  justify-content: center;
}

.query-btn.active {
  background: #8A63F2;
  box-shadow: 0 8rpx 24rpx rgba(139, 124, 246, 0.28);
}

.query-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.history-section {
  margin: 32rpx 24rpx 48rpx;
  padding: 32rpx 28rpx 40rpx;
  background: #fff;
  border-radius: 28rpx;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.history-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111;
}

.result-section {
  margin: 28rpx 24rpx 0;
  padding: 32rpx 28rpx 24rpx;
  background: #fff;
  border-radius: 28rpx;
}

.result-count {
  font-size: 24rpx;
  color: #8A63F2;
  font-weight: 500;
}

.result-list {
  padding-top: 8rpx;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}

.result-item:last-child {
  border-bottom: none;
}

.result-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: #f5f5f7;
  flex-shrink: 0;
}

.result-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.result-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-sub {
  font-size: 22rpx;
  color: #888;
}

.result-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.result-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #E11D48;
}

.result-status {
  font-size: 22rpx;
  color: #059669;
  background: #D1FAE5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.result-status.off {
  color: #6B7280;
  background: #F3F4F6;
}

.result-arrow {
  font-size: 36rpx;
  color: #C8C8CC;
  flex-shrink: 0;
}

.result-empty {
  padding: 40rpx 16rpx 24rpx;
  text-align: center;
}

.result-empty-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.result-empty-tip {
  display: block;
  font-size: 24rpx;
  color: #bbb;
}

.desk-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.desk-ico {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  background: #8A63F2;
  color: #fff;
  font-size: 18rpx;
  line-height: 32rpx;
  text-align: center;
}

.desk-text {
  font-size: 26rpx;
  color: #8A63F2;
  font-weight: 500;
}

.history-list {
  padding-top: 4rpx;
}

.history-item {
  padding: 24rpx 4rpx;
  border-bottom: 1rpx solid #f2f2f2;
}

.history-item:last-child {
  border-bottom: none;
}

.history-main {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.history-brand {
  font-size: 28rpx;
  font-weight: 700;
  color: #111;
}

.history-batch {
  font-size: 24rpx;
  color: #666;
}

.history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.history-result {
  flex: 1;
  font-size: 24rpx;
  color: #8A63F2;
}

.history-time {
  font-size: 22rpx;
  color: #bbb;
  flex-shrink: 0;
}

.history-empty {
  padding: 48rpx 0 24rpx;
  text-align: center;
}

.empty-art {
  width: 280rpx;
  height: 220rpx;
  margin: 0 auto 24rpx;
  position: relative;
}

.empty-scroll {
  position: absolute;
  right: 36rpx;
  top: 36rpx;
  width: 120rpx;
  height: 150rpx;
  border-radius: 16rpx;
  background: #F3EEFF;
  border: 4rpx solid #C4B5FD;
}

.empty-glass {
  position: absolute;
  left: 48rpx;
  top: 70rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 10rpx solid #8A63F2;
  box-sizing: border-box;
}

.empty-glass::after {
  content: '';
  position: absolute;
  right: -28rpx;
  bottom: -28rpx;
  width: 44rpx;
  height: 12rpx;
  background: #8A63F2;
  border-radius: 8rpx;
  transform: rotate(42deg);
}

.empty-person {
  position: absolute;
  left: 28rpx;
  top: 24rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #FFD7C2;
  box-shadow: 0 56rpx 0 -8rpx #8A63F2;
}

.history-empty-text {
  font-size: 26rpx;
  color: #C8C8CC;
}
</style>
