import { getUserAvatar } from './user-data.js'
import { getProductImage } from './product-image.js'

/** 与运营后台 FEED_LIST 对齐 */
export const FEED_STORAGE_KEY = 'yueji_feed_list_v2'

const FEED_COVER_MAP = {
  '00021': '/static/images/product-trial-1.jpg',
  '00022': '/static/images/lipstick-1.jpg',
  '00023': '/static/images/lipstick-2.jpg',
  '00024': '/static/images/lipstick-3.jpg',
  '00025': '/static/images/product-trial-2.jpg'
}

const USER_ID_AVATAR = {
  U20240105: '/static/images/user-f01.jpg',
  U20240256: '/static/images/user-f03.jpg',
  U20240778: '/static/images/user-f04.jpg',
  U20240888: '/static/images/user-f05.jpg',
  U20241668: '/static/images/user-f06.jpg'
}

export const FEED_SEED_LIST = [
  {
    id: '00021',
    seed: 'feed-1',
    user: '林予安',
    userId: 'U20240105',
    publisher: '用户',
    cat: '护肤',
    tag: '开箱',
    status: 'passed',
    statusText: '已通过',
    text: '新买的兰蔻菁纯面霜到啦！包装真的太高级了，迫不及待想要试用，期待效果！',
    imgs: 1,
    likes: 128,
    comments: 23,
    shares: 12,
    publishTime: '2026-08-24'
  },
  {
    id: '00022',
    seed: 'feed-2',
    user: '顾惜月',
    userId: 'U20240256',
    publisher: '用户',
    cat: '彩妆',
    tag: '日常',
    status: 'passed',
    statusText: '已通过',
    text: '今天的妆容分享，温柔奶茶色系，适合秋冬，约会通勤都可以用～',
    imgs: 2,
    likes: 256,
    comments: 45,
    shares: 28,
    publishTime: '2026-08-23'
  },
  {
    id: '00023',
    seed: 'feed-3',
    user: '周南枝',
    userId: 'U20240778',
    publisher: '商家',
    cat: '护肤',
    tag: '开箱',
    status: 'pending',
    statusText: '待审核',
    text: '开箱日记｜海蓝之谜精粹水终于入手了！包装很有质感，期待上脸效果。',
    imgs: 3,
    likes: 189,
    comments: 34,
    shares: 15,
    publishTime: '2026-08-21'
  },
  {
    id: '00024',
    seed: 'feed-4',
    user: '陈初雪',
    userId: 'U20240888',
    publisher: '平台',
    cat: '日常',
    tag: '测评',
    status: 'passed',
    statusText: '已通过',
    text: '我的早晚护肤流程大公开！从洁面到防晒，一步都不能少，坚持皮肤会变好的！',
    imgs: 1,
    likes: 342,
    comments: 78,
    shares: 56,
    publishTime: '2026-08-16'
  },
  {
    id: '00025',
    seed: 'feed-5',
    user: '姚慕晴',
    userId: 'U20241668',
    publisher: '用户',
    cat: '彩妆',
    tag: '测评',
    status: 'passed',
    statusText: '已通过',
    text: '新手化妆入门教程来啦！从0到1教你化妆，手残党也能学会，超详细步骤。',
    imgs: 2,
    likes: 425,
    comments: 92,
    shares: 128,
    publishTime: '2026-08-12'
  }
]

function cloneFeed(f) {
  return {
    id: f.id,
    seed: f.seed || '',
    user: f.user || '',
    userId: f.userId || '',
    publisher: f.publisher || '',
    cat: f.cat || '',
    tag: f.tag || '',
    status: f.status || '',
    statusText: f.statusText || '',
    text: f.text || '',
    imgs: f.imgs != null ? f.imgs : 1,
    likes: Number(f.likes) || 0,
    comments: Number(f.comments) || 0,
    shares: Number(f.shares) || 0,
    publishTime: f.publishTime || '',
    syncCover: f.syncCover || '',
    syncImgs: Array.isArray(f.syncImgs) ? f.syncImgs.slice() : []
  }
}

export function buildFeedTitle(feed, maxLen = 18) {
  const text = (feed && feed.text) ? String(feed.text) : ''
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + '…'
}

export function resolveFeedCover(feed) {
  if (!feed) return '/static/images/product-trial-1.jpg'
  if (feed.syncImgs && feed.syncImgs.length) {
    const first = String(feed.syncImgs[0])
    if (/^(data:|https?:)/.test(first)) return first
  }
  if (feed.syncCover) {
    const sc = String(feed.syncCover)
    if (/^(data:|https?:)/.test(sc)) return sc
  }
  return FEED_COVER_MAP[feed.id] || getProductImage('', feed.text || feed.user)
}

export function resolveFeedAvatar(feed) {
  if (!feed) return '/static/images/avatar-1.jpg'
  if (feed.userId && USER_ID_AVATAR[feed.userId]) return USER_ID_AVATAR[feed.userId]
  if (feed.user) return getUserAvatar(feed.user)
  return '/static/images/avatar-1.jpg'
}

export function loadFeedList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(FEED_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneFeed)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(FEED_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneFeed)
      }
    }
  } catch (e) { /* ignore */ }
  return FEED_SEED_LIST.map(cloneFeed)
}

export function saveFeedList(list) {
  const snapshot = (list || []).map(cloneFeed)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(FEED_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  broadcastFeedList(snapshot)
  return snapshot
}

export function broadcastFeedList(list) {
  if (typeof window === 'undefined') return
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'feed-sync', feeds: list || [] }, '*')
    }
  } catch (e) { /* ignore */ }
}

export function bumpFeedStat(feedId, field) {
  const allowed = { likes: true, comments: true, shares: true }
  if (!allowed[field]) return loadFeedList()
  const list = loadFeedList()
  const next = list.map((f) => {
    if (String(f.id) !== String(feedId)) return cloneFeed(f)
    const copy = cloneFeed(f)
    copy[field] = (Number(copy[field]) || 0) + 1
    return copy
  })
  return saveFeedList(next)
}

export function filterFeedsForDiscover(list) {
  return (list || []).filter((f) => f.status === 'passed')
}

export function mapFeedToDiscoverCard(feed) {
  return {
    id: feed.id,
    user: feed.user,
    avatar: resolveFeedAvatar(feed),
    product: buildFeedTitle(feed, 22),
    cat: feed.cat,
    tag: feed.tag,
    desc: feed.text,
    likes: String(feed.likes || 0),
    comments: String(feed.comments || 0),
    shares: String(feed.shares || 0),
    img: resolveFeedCover(feed)
  }
}

export function getFeedDetail(id) {
  const key = String(id)
  const feed = loadFeedList().find((f) => String(f.id) === key)
  if (!feed) return null
  return {
    id: feed.id,
    productName: buildFeedTitle(feed, 24),
    productImg: resolveFeedCover(feed),
    spec: feed.tag || feed.cat || '动态',
    user: feed.user,
    avatar: resolveFeedAvatar(feed),
    level: 2,
    skinTags: [feed.cat].filter(Boolean),
    featured: false,
    score: 5,
    summary: feed.tag || '动态分享',
    content: feed.text,
    images: [resolveFeedCover(feed)],
    time: feed.publishTime || '',
    location: '',
    likes: feed.likes || 0,
    comments: feed.comments || 0,
    replies: []
  }
}
