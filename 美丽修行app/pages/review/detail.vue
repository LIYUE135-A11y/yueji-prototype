<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <text class="nav-title">回复详情</text>
      <view class="nav-btn" @tap="onShare">
        <view class="share-ring">
          <text class="share-arrow">↑</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }">
      <view class="product-bar" @tap="onProductTap">
        <image class="product-thumb" :src="detail.productImg" mode="aspectFill" />
        <view class="product-meta">
          <text class="product-name">{{ detail.productName }}</text>
          <text class="product-spec">规格:{{ detail.spec }}</text>
        </view>
      </view>

      <view class="main-review">
        <view class="user-row">
          <image class="avatar" :src="detail.avatar" mode="aspectFill" />
          <view class="user-info">
            <view class="name-row">
              <text class="username">{{ detail.user }}</text>
              <view class="lv-badge">
                <text class="lv-text">LV.{{ detail.level }}</text>
              </view>
            </view>
            <view class="skin-tag-row">
              <text
                v-for="(tag, i) in detail.skinTags"
                :key="i"
                class="skin-tag"
              >{{ tag }}</text>
            </view>
          </view>
          <view class="more-btn" @tap.stop="onMore">
            <text class="more-dots">···</text>
          </view>
        </view>

        <view v-if="detail.featured" class="stamp-wrap">
          <view class="stamp">
            <text class="stamp-text">精选</text>
            <text class="stamp-text">点评</text>
          </view>
        </view>

        <view class="rate-row">
          <view class="stars-row">
            <text
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{ on: i <= detail.score }"
            >★</text>
          </view>
          <text class="summary">{{ detail.summary }}</text>
        </view>

        <text class="body">{{ detail.content }}</text>

        <view v-if="detail.images && detail.images.length" class="media-row">
          <image
            v-for="(img, idx) in detail.images"
            :key="idx"
            class="media-img"
            :src="img"
            mode="aspectFill"
            @tap="previewImage(img)"
          />
        </view>

        <view class="review-footer">
          <text class="meta">{{ detail.time }} {{ detail.location }}</text>
          <view class="actions">
            <view class="action" @tap="toggleLike('main')">
              <text class="ico">👍</text>
              <text class="action-num">{{ detail.likes }}</text>
            </view>
            <view class="action" @tap="onDislike">
              <text class="ico">👎</text>
            </view>
            <view class="action" @tap="focusReply(detail.user)">
              <text class="ico">💬</text>
              <text class="action-num">{{ detail.comments }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section-gap"></view>

      <view class="reply-list">
        <view v-for="item in detail.replies" :key="item.id" class="reply-item">
          <image class="avatar sm" :src="item.avatar" mode="aspectFill" />
          <view class="reply-main">
            <view class="reply-head">
              <view class="reply-user">
                <view class="name-row">
                  <text class="username">{{ item.user }}</text>
                  <view class="lv-badge">
                    <text class="lv-text">LV.{{ item.level }}</text>
                  </view>
                </view>
                <view class="skin-tag-row">
                  <text
                    v-for="(tag, i) in item.skinTags"
                    :key="i"
                    class="skin-tag"
                  >{{ tag }}</text>
                </view>
              </view>
            </view>

            <view class="reply-content">
              <text v-if="item.replyTo" class="reply-prefix">回复</text>
              <text v-if="item.replyTo" class="mention">@{{ item.replyTo }}</text>
              <text v-if="item.replyTo" class="reply-prefix">: </text>
              <text class="reply-text">{{ item.content }}</text>
            </view>

            <view class="reply-footer">
              <text class="meta">{{ item.time }} {{ item.location }}</text>
              <view class="actions">
                <view class="action" @tap="toggleLike(item.id)">
                  <text class="ico">👍</text>
                  <text v-if="item.likes" class="action-num">{{ item.likes }}</text>
                </view>
                <view class="action" @tap="onDislike">
                  <text class="ico">👎</text>
                </view>
                <text class="reply-link" @tap="focusReply(item.user)">回复</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="list-end">
        <text class="end-line"></text>
        <text class="end-text">已经到底啦</text>
        <text class="end-line"></text>
      </view>
    </scroll-view>

    <view class="composer">
      <input
        class="composer-input"
        v-model="replyText"
        :focus="inputFocus"
        :placeholder="'回复' + replyTarget"
        placeholder-class="composer-placeholder"
        confirm-type="send"
        @confirm="sendReply"
        @blur="inputFocus = false"
      />
      <text class="send-btn" @tap="sendReply">发送</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getReviewDetail } from '../../common/review-data.js'
import { getFeedDetail } from '../../common/feed-data.js'
import { getUserAvatar } from '../../common/user-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const replyText = ref('')
const replyTarget = ref('')
const inputFocus = ref(false)

const detail = ref(getReviewDetail(1))

onLoad((query) => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const navH = 44
    const composerH = 56
    const safe = info.safeAreaInsets?.bottom || 0
    const h = info.windowHeight - (info.statusBarHeight || 20) - navH - composerH - safe
    scrollHeight.value = h + 'px'
  } catch (e) {}

  const id = query?.id || 1
  detail.value = getFeedDetail(id) || getReviewDetail(id)
  replyTarget.value = detail.value.user
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onShare() {
  uni.showToast({ title: '分享功能即将上线', icon: 'none' })
}

function onMore() {
  uni.showActionSheet({
    itemList: ['举报', '不感兴趣'],
    fail: () => {}
  })
}

function onProductTap() {
  uni.navigateTo({
    url:
      `/pages/product/detail?id=${detail.value.id}` +
      `&title=${encodeURIComponent(detail.value.productName)}` +
      `&subTitle=${encodeURIComponent('规格:' + detail.value.spec)}` +
      `&img=${encodeURIComponent(detail.value.productImg)}` +
      `&desc=${encodeURIComponent(detail.value.content)}`
  })
}

function previewImage(img) {
  uni.previewImage({
    urls: detail.value.images,
    current: img
  })
}

function focusReply(user) {
  replyTarget.value = user || detail.value.user
  inputFocus.value = true
}

function toggleLike(target) {
  if (target === 'main') {
    detail.value.likes = Number(detail.value.likes) + 1
    return
  }
  const item = detail.value.replies.find((r) => r.id === target)
  if (item) item.likes = Number(item.likes || 0) + 1
}

function onDislike() {
  uni.showToast({ title: '已收到反馈', icon: 'none' })
}

function sendReply() {
  const text = replyText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入回复内容', icon: 'none' })
    return
  }
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  detail.value.replies.push({
    id: Date.now(),
    user: '我',
    avatar: getUserAvatar('我'),
    level: 1,
    skinTags: ['未测肤'],
    content: text,
    time: `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    location: '本地',
    likes: 0,
    replyTo: replyTarget.value === detail.value.user ? '' : replyTarget.value
  })
  detail.value.comments = Number(detail.value.comments) + 1
  replyText.value = ''
  uni.showToast({ title: '发送成功', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: #ffffff;
}

.status-bar {
  background: #ffffff;
}

.nav-bar {
  height: 88rpx;
  padding: 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-back {
  font-size: 56rpx;
  color: #222222;
  line-height: 1;
  margin-top: -6rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222222;
}

.share-ring {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #333333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-arrow {
  font-size: 22rpx;
  color: #333333;
  line-height: 1;
}

.scroll {
  background: #ffffff;
}

.product-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 28rpx 20rpx;
  border-bottom: 1rpx solid #eeeeee;
}

.product-thumb {
  width: 72rpx;
  height: 72rpx;
  border-radius: 8rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.product-meta {
  flex: 1;
  min-width: 0;
}

.product-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #222222;
  line-height: 1.35;
}

.product-spec {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999999;
}

.main-review {
  position: relative;
  padding: 28rpx 28rpx 24rpx;
}

.user-row,
.reply-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.avatar.sm {
  width: 64rpx;
  height: 64rpx;
}

.user-info,
.reply-user {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.username {
  font-size: 28rpx;
  font-weight: 600;
  color: #222222;
}

.lv-badge {
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  background: #eeeeee;
}

.lv-text {
  font-size: 18rpx;
  color: #888888;
  font-weight: 700;
  line-height: 1.4;
}

.skin-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 10rpx;
}

.skin-tag {
  font-size: 20rpx;
  color: #999999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  line-height: 1.3;
}

.more-btn {
  padding: 4rpx 8rpx;
}

.more-dots {
  font-size: 28rpx;
  color: #bbbbbb;
  letter-spacing: 2rpx;
}

.stamp-wrap {
  position: absolute;
  top: 28rpx;
  right: 80rpx;
  opacity: 0.45;
  pointer-events: none;
}

.stamp {
  width: 100rpx;
  height: 100rpx;
  border: 3rpx solid #f3a6b8;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: rotate(-18deg);
}

.stamp-text {
  font-size: 20rpx;
  color: #e891a6;
  font-weight: 700;
  line-height: 1.2;
}

.rate-row {
  margin-top: 20rpx;
}

.stars-row {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 28rpx;
  color: #dddddd;
}

.star.on {
  color: #f5c518;
}

.summary {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #f08a24;
  line-height: 1.5;
}

.body {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.75;
  white-space: pre-wrap;
}

.media-row {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.media-img {
  width: 240rpx;
  height: 240rpx;
  border-radius: 8rpx;
  background: $purple-placeholder;
}

.review-footer,
.reply-footer {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta {
  font-size: 22rpx;
  color: #bbbbbb;
}

.actions {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.action {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.ico {
  font-size: 26rpx;
  color: #999999;
  line-height: 1;
}

.action-num {
  font-size: 22rpx;
  color: #999999;
}

.reply-link {
  font-size: 24rpx;
  color: #999999;
}

.section-gap {
  height: 12rpx;
  background: #f7f7f7;
}

.reply-list {
  padding: 0 28rpx;
}

.reply-item {
  display: flex;
  gap: 16rpx;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}

.reply-main {
  flex: 1;
  min-width: 0;
}

.reply-content {
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.65;
  color: #333333;
}

.reply-prefix {
  color: #333333;
}

.mention {
  color: $primary-color;
}

.reply-text {
  color: #333333;
}

.list-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 48rpx 48rpx 40rpx;
}

.end-line {
  width: 64rpx;
  height: 1rpx;
  background: #e5e5e5;
}

.end-text {
  font-size: 22rpx;
  color: #cccccc;
}

.composer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.composer-input {
  flex: 1;
  height: 72rpx;
  padding: 0 28rpx;
  border-radius: 36rpx;
  background: #f5f5f5;
  font-size: 28rpx;
  color: #333333;
}

.composer-placeholder {
  color: #bbbbbb;
}

.send-btn {
  font-size: 30rpx;
  font-weight: 600;
  color: $primary-color;
  padding: 8rpx 8rpx 8rpx 4rpx;
}
</style>
