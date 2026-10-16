<template>
  <view class="page">
    <view class="hero">
      <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>
      <view class="nav-bar">
        <view class="nav-btn" @tap="goBack"><text class="nav-back">‹</text></view>
        <text class="nav-title">积分商城</text>
        <view class="nav-right" @tap="onRules"><text class="nav-rules">规则</text></view>
      </view>
      <view class="balance">
        <view class="balance-left">
          <text class="my-link" @tap="onMyPoints">我的积分 ›</text>
          <text class="score">{{ state.score }}</text>
          <view class="pending-row">
            <text class="pending">未生效积分: {{ state.pending }}</text>
            <text class="pending-tip" @tap="onPendingTip">?</text>
          </view>
        </view>
        <view class="coin-art">
          <view class="coin-ring"><text class="coin-star">★</text></view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHeight }" :show-scrollbar="false">
      <view class="seg">
        <view
          class="seg-item"
          :class="{ active: activeTab === 'tasks' }"
          @tap="activeTab = 'tasks'"
        ><text>积分任务</text></view>
        <view
          class="seg-item"
          :class="{ active: activeTab === 'redeem' }"
          @tap="activeTab = 'redeem'"
        ><text>兑换奖品</text></view>
      </view>

      <view v-if="activeTab === 'tasks'" class="pane">
        <view class="card">
          <view class="card-head">
            <view class="card-icon"><text>📅</text></view>
            <view class="card-main">
              <view class="card-title-row">
                <text class="card-title">每日签到</text>
                <view class="remind" @tap="toggleRemind">
                  <text>签到提醒</text>
                  <view class="switch" :class="{ on: state.remind }"></view>
                </view>
              </view>
              <text class="card-sub">连续签到能获取更多积分哦~</text>
            </view>
          </view>
          <view class="days">
            <view
              v-for="(reward, idx) in checkinRewards"
              :key="'d' + idx"
              class="day"
              :class="dayClass(idx)"
            >
              <view class="day-coin" :class="{ big: idx === 6 }"><text>+{{ reward }}</text></view>
              <text class="day-label">{{ idx === 6 ? '7天+' : (idx + 1) + '天' }}</text>
            </view>
          </view>
          <view
            class="checkin-btn"
            :class="{ disabled: checkedInToday }"
            @tap="onCheckin"
          ><text>{{ checkedInToday ? '今日已签到' : '立即签到' }}</text></view>
        </view>

        <view class="card">
          <view class="card-head">
            <view class="card-icon"><text>❔</text></view>
            <view class="card-main">
              <view class="card-title-row">
                <view class="quiz-title-wrap">
                  <text class="card-title">每日一答({{ quizDone ? 1 : 0 }}/1)</text>
                  <text class="quiz-reward">🪙 +1</text>
                </view>
                <text class="rank-link" @tap="onRank">排行榜 ›</text>
              </view>
              <text class="card-sub">学习护肤tips还能拿积分哦~</text>
            </view>
          </view>
          <text class="q">{{ quiz.q }}</text>
          <view class="opts">
            <view
              v-for="(opt, idx) in quiz.options"
              :key="'o' + idx"
              class="opt"
              :class="optClass(idx)"
              @tap="onAnswer(idx)"
            ><text>{{ opt }}</text></view>
          </view>
        </view>
      </view>

      <view v-else class="pane">
        <view v-for="p in prizes" :key="p.id" class="prize">
          <view class="prize-img"><text>{{ p.icon }}</text></view>
          <view class="prize-body">
            <text class="prize-name">{{ p.name }}</text>
            <text class="prize-cost">{{ p.cost }} 积分</text>
          </view>
          <view class="prize-btn" @tap="onRedeem(p)"><text>兑换</text></view>
        </view>
      </view>

      <view class="list-end"><text class="end-text">— 已经到底啦 —</text></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  CHECKIN_REWARDS,
  DAILY_QUIZ,
  PRIZE_LIST,
  loadPointsState,
  savePointsState,
  isCheckedInToday,
  isQuizDoneToday,
  doCheckin,
  answerQuiz,
  redeemPrize
} from '../../common/points-data.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const activeTab = ref('tasks')
const state = ref(loadPointsState())
const checkinRewards = CHECKIN_REWARDS
const quiz = DAILY_QUIZ
const prizes = PRIZE_LIST

const checkedInToday = computed(() => isCheckedInToday(state.value))
const quizDone = computed(() => isQuizDoneToday(state.value))

function calcScrollHeight(info) {
  const statusBar = info.statusBarHeight || 20
  const heroExtra = 140
  const safe = info.safeAreaInsets?.bottom || 0
  return info.windowHeight - statusBar - 44 - heroExtra - safe
}

function refresh() {
  state.value = loadPointsState()
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    scrollHeight.value = calcScrollHeight(info) + 'px'
  } catch (e) {}
}

function dayClass(idx) {
  const streak = state.value.streak || 0
  const day = idx + 1
  const cls = []
  if (checkedInToday.value && day <= streak) cls.push('done')
  if (checkedInToday.value && day === streak) cls.push('active')
  if (!checkedInToday.value && day === Math.min(streak + 1, 7)) cls.push('active')
  if (!checkedInToday.value && streak === 0 && day === 1) cls.push('active')
  return cls.join(' ')
}

function optClass(idx) {
  if (!quizDone.value) return ''
  if (idx === quiz.answer) return 'correct'
  return ''
}

onLoad(() => { refresh() })
onShow(() => { refresh() })

function goBack() {
  uni.navigateBack({
    delta: 1,
    fail() { uni.switchTab({ url: '/pages/home/index' }) }
  })
}

function onRules() {
  uni.showModal({
    title: '积分规则',
    content: '1. 每日签到可获得积分，连续签到奖励更高\n2. 每日一答答对可获得 1 积分\n3. 积分可用于兑换奖品\n4. 未生效积分需待订单完成后到账',
    showCancel: false
  })
}

function onPendingTip() {
  uni.showToast({ title: '订单完成后才会计入可用积分', icon: 'none' })
}

function onMyPoints() {
  uni.showToast({ title: '当前可用积分 ' + state.value.score, icon: 'none' })
}

function toggleRemind() {
  state.value = savePointsState({ ...state.value, remind: !state.value.remind })
  uni.showToast({ title: state.value.remind ? '已开启签到提醒' : '已关闭签到提醒', icon: 'none' })
}

function onCheckin() {
  const res = doCheckin(state.value)
  state.value = res.state
  if (!res.ok) return uni.showToast({ title: '今日已签到', icon: 'none' })
  uni.showToast({ title: '签到成功 +' + res.reward + ' 积分', icon: 'none' })
}

function onAnswer(idx) {
  if (quizDone.value) return
  const res = answerQuiz(state.value, idx)
  state.value = res.state
  if (!res.ok) return
  uni.showToast({
    title: res.correct ? '回答正确 +1 积分' : '回答错误，明天再来',
    icon: 'none'
  })
}

function onRank() {
  uni.showToast({ title: '排行榜即将上线', icon: 'none' })
}

function onRedeem(p) {
  const res = redeemPrize(state.value, p.id)
  if (!res.ok) {
    if (res.reason === 'insufficient') return uni.showToast({ title: '积分不足', icon: 'none' })
    return
  }
  state.value = res.state
  uni.showToast({ title: '兑换成功', icon: 'success' })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: #F6F7F2;
}

.hero {
  flex-shrink: 0;
  background: linear-gradient(180deg, #E8F6C8 0%, #F6F7F2 100%);
}

.status-bar { background: transparent; }

.nav-bar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
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
  font-weight: 700;
  color: #222;
}

.nav-right {
  min-width: 72rpx;
  text-align: right;
}

.nav-rules {
  font-size: 26rpx;
  color: #666;
}

.balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 40rpx 28rpx;
}

.balance-left { flex: 1; min-width: 0; }

.my-link {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.score {
  display: block;
  font-size: 88rpx;
  font-weight: 800;
  color: #222;
  line-height: 1.05;
}

.pending-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 10rpx;
}

.pending {
  font-size: 24rpx;
  color: #999;
}

.pending-tip {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 1px solid #CCC;
  color: #AAA;
  font-size: 20rpx;
  text-align: center;
  line-height: 26rpx;
}

.coin-art {
  width: 200rpx;
  height: 200rpx;
  flex-shrink: 0;
}

.coin-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #FFE9A8, #F5C542 55%, #E0A020 100%);
  box-shadow: 0 20rpx 40rpx rgba(224, 160, 32, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin-star {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #FFF6D6, #FFD56A);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  color: #F0A020;
}

.scroll {
  @include app-page-scroll;
  padding: 0 24rpx 24rpx;
  box-sizing: border-box;
}

.seg {
  display: flex;
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  overflow: hidden;
}

.seg-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 8rpx 24rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #888;
  background: #F3F4F0;
  position: relative;
}

.seg-item.active {
  color: #222;
  background: #fff;
  font-weight: 800;
}

.seg-item.active::after {
  content: '';
  position: absolute;
  left: 22%;
  right: 22%;
  bottom: 12rpx;
  height: 14rpx;
  border-radius: 14rpx;
  background: linear-gradient(90deg, #FFE08A, #FFC94A);
}

.pane {
  background: #fff;
  border-radius: 0 0 28rpx 28rpx;
  padding: 8rpx 28rpx 28rpx;
}

.card {
  padding: 28rpx 0 16rpx;
  border-bottom: 1px solid #F3F3F3;
}

.card:last-child { border-bottom: none; }

.card-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.card-icon {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  background: #FFF7E8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.card-main { flex: 1; min-width: 0; }

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
}

.card-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #AAA;
}

.remind {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
  color: #888;
  flex-shrink: 0;
}

.switch {
  width: 72rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #E5E5E5;
  position: relative;
}

.switch.on { background: #FF9F2E; }

.switch::after {
  content: '';
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.switch.on::after { left: 36rpx; }

.days {
  display: flex;
  justify-content: space-between;
  gap: 8rpx;
  margin: 28rpx 0 24rpx;
}

.day {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.day-coin {
  width: 64rpx;
  height: 64rpx;
  margin: 0 auto 10rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #FFE9A8, #F5C542);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: 700;
  color: #B86A00;
}

.day-coin.big {
  background: linear-gradient(145deg, #FFD76A, #FF9F2E);
  color: #fff;
  font-size: 24rpx;
}

.day-label {
  display: block;
  font-size: 22rpx;
  color: #AAA;
}

.day.active .day-label {
  color: #FF9F2E;
  font-weight: 700;
}

.day.done .day-coin { opacity: 0.55; }

.checkin-btn {
  height: 84rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #FFB84D, #FF9F2E);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(255, 159, 46, 0.28);
}

.checkin-btn.disabled {
  background: #E8E8E8;
  color: #AAA;
  box-shadow: none;
}

.quiz-title-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

.quiz-reward {
  font-size: 24rpx;
  color: #FF9F2E;
  font-weight: 700;
}

.rank-link {
  font-size: 24rpx;
  color: #AAA;
  flex-shrink: 0;
}

.q {
  display: block;
  margin-top: 24rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

.opts { margin-top: 20rpx; }

.opt {
  margin-bottom: 16rpx;
  padding: 22rpx 24rpx;
  border: 1px solid #EEE;
  border-radius: 20rpx;
  background: #FAFAFA;
  font-size: 26rpx;
  color: #444;
}

.opt.correct {
  border-color: #FF9F2E;
  background: #FFF8EE;
  color: #FF9F2E;
  font-weight: 600;
}

.prize {
  display: flex;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1px solid #F3F3F3;
  align-items: center;
}

.prize-img {
  width: 112rpx;
  height: 112rpx;
  border-radius: 20rpx;
  background: #FFF7E8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  flex-shrink: 0;
}

.prize-body { flex: 1; min-width: 0; }

.prize-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
}

.prize-cost {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #FF9F2E;
  font-weight: 700;
}

.prize-btn {
  flex-shrink: 0;
  padding: 14rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #FFB84D, #FF9F2E);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.list-end {
  padding: 36rpx 0 48rpx;
  text-align: center;
}

.end-text {
  font-size: 22rpx;
  color: #CCC;
}
</style>
