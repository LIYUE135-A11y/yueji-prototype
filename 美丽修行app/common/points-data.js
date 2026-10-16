/** APP 积分商城 */

export const POINTS_STORAGE_KEY = 'yueji_points_mall_v1'

export const CHECKIN_REWARDS = [1, 1, 1, 3, 3, 3, 5]

export const DAILY_QUIZ = {
  q: 'HEY:REAL B5精华液的主要成分有哪些?',
  options: ['褐藻糖胶', '银耳多糖', '泛醇', '以上都有'],
  answer: 3,
  reward: 1
}

export const PRIZE_LIST = [
  { id: 'P1', name: '5元无门槛优惠券', cost: 100, icon: '🎟' },
  { id: 'P2', name: '面膜体验装 1片', cost: 200, icon: '🧴' },
  { id: 'P3', name: '10元满减券', cost: 300, icon: '💎' },
  { id: 'P4', name: '品牌小样盲盒', cost: 500, icon: '🎁' }
]

function todayStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}

function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const p = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}

function readJson(key) {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(key)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (parsed) return parsed
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) { /* ignore */ }
  return null
}

function writeJson(key, data) {
  try {
    const raw = JSON.stringify(data)
    if (typeof uni !== 'undefined' && uni.setStorageSync) uni.setStorageSync(key, raw)
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, raw)
  } catch (e) { /* ignore */ }
}

export function defaultPointsState() {
  return {
    score: 0,
    pending: 0,
    streak: 0,
    lastCheckin: '',
    remind: false,
    quizDoneDate: '',
    quizAnswered: false
  }
}

export function loadPointsState() {
  const parsed = readJson(POINTS_STORAGE_KEY)
  const state = { ...defaultPointsState(), ...(parsed || {}) }
  state.score = Number(state.score) || 0
  state.pending = Number(state.pending) || 0
  state.streak = Number(state.streak) || 0
  if (state.quizDoneDate !== todayStr()) state.quizAnswered = false
  return state
}

export function savePointsState(state) {
  writeJson(POINTS_STORAGE_KEY, state)
  return state
}

export function isCheckedInToday(state) {
  return !!(state && state.lastCheckin === todayStr())
}

export function doCheckin(state) {
  const next = { ...state }
  if (isCheckedInToday(next)) return { state: next, reward: 0, ok: false }
  if (next.lastCheckin === yesterdayStr()) next.streak = Math.min(7, (next.streak || 0) + 1)
  else next.streak = 1
  const idx = Math.min(next.streak, 7) - 1
  const reward = CHECKIN_REWARDS[idx] || 1
  next.score += reward
  next.lastCheckin = todayStr()
  savePointsState(next)
  return { state: next, reward, ok: true }
}

export function answerQuiz(state, optIdx) {
  const next = { ...state }
  if (next.quizDoneDate === todayStr() && next.quizAnswered) {
    return { state: next, correct: false, ok: false }
  }
  const correct = optIdx === DAILY_QUIZ.answer
  if (correct) next.score += DAILY_QUIZ.reward
  next.quizAnswered = true
  next.quizDoneDate = todayStr()
  savePointsState(next)
  return { state: next, correct, ok: true }
}

export function redeemPrize(state, prizeId) {
  const prize = PRIZE_LIST.find((p) => p.id === prizeId)
  if (!prize) return { state, ok: false, reason: 'not_found' }
  if (state.score < prize.cost) return { state, ok: false, reason: 'insufficient', prize }
  const next = { ...state, score: state.score - prize.cost }
  savePointsState(next)
  return { state: next, ok: true, prize }
}

export function isQuizDoneToday(state) {
  return !!(state && state.quizDoneDate === todayStr() && state.quizAnswered)
}
