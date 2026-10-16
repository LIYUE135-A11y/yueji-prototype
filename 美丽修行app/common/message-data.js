/** APP 消息中心数据 */

export const MESSAGE_STORAGE_KEY = 'yueji_message_list_v1'
export const MESSAGE_TABS = [
  { id: 'notice', name: '通知' },
  { id: 'curated', name: '内容精选' },
  { id: 'reply', name: '回复了我' },
  { id: 'like', name: '赞和收藏' }
]

const MESSAGE_SEED = [
  {
    id: 'M001',
    tab: 'notice',
    title: '系统通知',
    content: '您的测肤报告已生成，点击查看肤质分析与护肤建议。',
    time: '刚刚',
    read: false,
    avatar: '',
    icon: '🔔'
  },
  {
    id: 'M002',
    tab: 'notice',
    title: '活动提醒',
    content: '阅己盒周一10点上新，大牌小样限量开抢。',
    time: '10分钟前',
    read: false,
    avatar: '',
    icon: '🎉'
  },
  {
    id: 'M003',
    tab: 'notice',
    title: '物流通知',
    content: '您的订单已发货，预计 2 日内送达。',
    time: '昨天 18:20',
    read: true,
    avatar: '',
    icon: '📦'
  },
  {
    id: 'M004',
    tab: 'curated',
    title: '精选种草',
    content: '干敏皮春季维稳攻略：屏障修护精华怎么选？',
    time: '1小时前',
    read: false,
    avatar: '',
    icon: '✨'
  },
  {
    id: 'M005',
    tab: 'curated',
    title: '编辑推荐',
    content: '本周口碑榜：敏感肌友好防晒 TOP5。',
    time: '今天 09:30',
    read: false,
    avatar: '',
    icon: '📌'
  },
  {
    id: 'M006',
    tab: 'curated',
    title: '成分科普',
    content: '烟酰胺与维C能否同用？一文讲清搭配禁忌。',
    time: '昨天',
    read: true,
    avatar: '',
    icon: '🧪'
  },
  {
    id: 'M007',
    tab: 'reply',
    title: '妆小妍',
    content: '回复了你：这款精华适合混干皮早晚使用哦～',
    time: '5分钟前',
    read: false,
    avatar: '',
    icon: '💬'
  },
  {
    id: 'M008',
    tab: 'reply',
    title: '护肤达人小鹿',
    content: '回复了你：我用了两周色沉确实淡了，推荐同系列乳液。',
    time: '2小时前',
    read: false,
    avatar: '',
    icon: '💬'
  },
  {
    id: 'M009',
    tab: 'reply',
    title: '阅己官方',
    content: '回复了你：售后已受理，客服将在 24 小时内联系你。',
    time: '前天',
    read: true,
    avatar: '',
    icon: '💬'
  },
  {
    id: 'M010',
    tab: 'like',
    title: '小满',
    content: '赞了你的评价「质地清爽不拔干」',
    time: '刚刚',
    read: false,
    avatar: '',
    icon: '♡'
  },
  {
    id: 'M011',
    tab: 'like',
    title: '阿柚',
    content: '收藏了你的笔记「油皮夏季底妆流程」',
    time: '30分钟前',
    read: false,
    avatar: '',
    icon: '★'
  },
  {
    id: 'M012',
    tab: 'like',
    title: '柠夏',
    content: '赞了你的晒单',
    time: '昨天 21:05',
    read: true,
    avatar: '',
    icon: '♡'
  }
]

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

export function cloneMessage(m) {
  return {
    id: String(m.id || ''),
    tab: m.tab || 'notice',
    title: m.title || '',
    content: m.content || '',
    time: m.time || '',
    read: !!m.read,
    avatar: m.avatar || '',
    icon: m.icon || '🔔'
  }
}

export function loadMessageList() {
  const parsed = readJson(MESSAGE_STORAGE_KEY)
  if (Array.isArray(parsed) && parsed.length) {
    return parsed.map(cloneMessage)
  }
  const seed = MESSAGE_SEED.map(cloneMessage)
  writeJson(MESSAGE_STORAGE_KEY, seed)
  return seed
}

export function saveMessageList(list) {
  const cleaned = (list || []).map(cloneMessage)
  writeJson(MESSAGE_STORAGE_KEY, cleaned)
  return cleaned
}

export function getMessagesByTab(tabId, list) {
  const all = Array.isArray(list) ? list : loadMessageList()
  return all.filter((m) => m.tab === tabId)
}

export function countUnread(tabId, list) {
  const all = Array.isArray(list) ? list : loadMessageList()
  return all.filter((m) => (!tabId || m.tab === tabId) && !m.read).length
}

export function markAllRead(list) {
  const all = (Array.isArray(list) ? list : loadMessageList()).map((m) => ({
    ...cloneMessage(m),
    read: true
  }))
  return saveMessageList(all)
}

export function markOneRead(id, list) {
  const all = (Array.isArray(list) ? list : loadMessageList()).map((m) => {
    if (m.id !== id) return cloneMessage(m)
    return { ...cloneMessage(m), read: true }
  })
  return saveMessageList(all)
}
