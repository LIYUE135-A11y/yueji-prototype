import { getUserAvatar } from './user-data.js'
import { getProductImage } from './product-image.js'

export const TOPIC_STORAGE_KEY = 'yueji_topic_list_v2'

const TOPIC_COVER_MAP = {
  '00016': '/static/images/lipstick-1.jpg',
  '00017': '/static/images/lipstick-2.jpg',
  '00018': '/static/images/lipstick-3.jpg',
  '00019': '/static/images/product-trial-1.jpg',
  '00020': '/static/images/product-trial-2.jpg'
}

const USER_ID_AVATAR = {
  U20240032: '/static/images/user-f04.jpg',
  U20240102: '/static/images/user-f05.jpg',
  U20241102: '/static/images/user-f02.jpg',
  U20241220: '/static/images/user-f06.jpg',
  U20241312: '/static/images/user-f07.jpg'
}

export const TOPIC_SEED_LIST = [
  { id: '00016', seed: 'topic-1', title: '#我在阅己盒挖到宝', initiator: '叶知夏', initiatorId: 'U20240032', status: 'passed', statusText: '已通过', discussions: '992', heat: 986, viewers: 992, isHot: true, createTime: '2026-06-01' },
  { id: '00017', seed: 'topic-2', title: '#敏感肌急救清单', initiator: '苏念初', initiatorId: 'U20240102', status: 'passed', statusText: '已通过', discussions: '1280', heat: 852, viewers: 1280, isHot: true, createTime: '2026-06-15' },
  { id: '00018', seed: 'topic-3', title: '#口红显白色号合集', initiator: '梁慕白', initiatorId: 'U20241102', status: 'passed', statusText: '已通过', discussions: '756', heat: 1256, viewers: 756, isHot: true, createTime: '2026-07-08' },
  { id: '00019', seed: 'topic-4', title: '#七夕送礼不踩雷', initiator: '郑予欢', initiatorId: 'U20241220', status: 'passed', statusText: '已通过', discussions: '2103', heat: 1580, viewers: 2103, isHot: true, createTime: '2026-07-22' },
  { id: '00020', seed: 'topic-5', title: '#素颜出街', initiator: '何清禾', initiatorId: 'U20241312', status: 'pending', statusText: '待审核', discussions: '520', heat: 623, viewers: 520, isHot: false, createTime: '2026-08-01' }
]

function cloneTopic(t) {
  return {
    id: t.id,
    seed: t.seed || '',
    title: t.title || '',
    initiator: t.initiator || '',
    initiatorId: t.initiatorId || '',
    status: t.status || '',
    statusText: t.statusText || '',
    discussions: t.discussions || '',
    heat: Number(t.heat) || 0,
    viewers: Number(t.viewers) || 0,
    isHot: !!t.isHot,
    createTime: t.createTime || '',
    syncCover: t.syncCover || ''
  }
}

export function formatTopicTitle(title) {
  const text = String(title || '').trim()
  if (!text) return '#话题'
  const core = text.replace(/^#+/, '').replace(/#+$/, '').trim()
  return '#' + core
}

export function formatTopicViewers(topic) {
  const n = Number(topic && topic.viewers) || 0
  return n + '人围观'
}

export function resolveTopicCover(topic) {
  if (!topic) return '/static/images/lipstick-1.jpg'
  if (topic.syncCover && /^(data:|https?:)/.test(topic.syncCover)) return topic.syncCover
  return TOPIC_COVER_MAP[topic.id] || getProductImage('', topic.title)
}

export function resolveTopicAvatar(topic) {
  if (!topic) return '/static/images/avatar-1.jpg'
  if (topic.initiatorId && USER_ID_AVATAR[topic.initiatorId]) return USER_ID_AVATAR[topic.initiatorId]
  if (topic.initiator) return getUserAvatar(topic.initiator)
  return '/static/images/avatar-1.jpg'
}

export function loadTopicList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(TOPIC_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneTopic)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(TOPIC_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneTopic)
      }
    }
  } catch (e) { /* ignore */ }
  return TOPIC_SEED_LIST.map(cloneTopic)
}

export function filterTopicForRecommend(list, limit = 4) {
  const items = (list || []).filter((t) => t.status === 'passed')
  return limit > 0 ? items.slice(0, limit) : items
}

export function mapTopicToRecommendCard(topic) {
  return {
    id: topic.id,
    contentType: 'topic',
    name: formatTopicTitle(topic.title),
    title: formatTopicTitle(topic.title),
    hot: topic.isHot,
    watch: formatTopicViewers(topic),
    img: resolveTopicCover(topic),
    desc: `${topic.discussions || 0} 条讨论 · 热度 ${topic.heat || 0}`
  }
}

export function getTopicDetail(id) {
  const topic = loadTopicList().find((t) => String(t.id) === String(id))
  if (!topic) return null
  return {
    type: 'topic',
    typeLabel: '话题',
    navTitle: '话题详情',
    id: topic.id,
    title: formatTopicTitle(topic.title),
    cover: resolveTopicCover(topic),
    meta: formatTopicViewers(topic) + (topic.createTime ? ` · ${topic.createTime}` : ''),
    author: topic.initiator || '发起人',
    authorSub: '话题发起人',
    avatar: resolveTopicAvatar(topic),
    body: `${topic.discussions || 0} 条讨论，${formatTopicViewers(topic)}。欢迎参与话题讨论，分享你的真实体验与看法。`,
    images: [resolveTopicCover(topic)]
  }
}
