import { getUserAvatar } from './user-data.js'
import { getProductImage } from './product-image.js'

export const GRASS_STORAGE_KEY = 'yueji_grass_list_v2'

const GRASS_COVER_MAP = {
  '00006': '/static/images/lipstick-1.jpg',
  '00007': '/static/images/lipstick-2.jpg',
  '00008': '/static/images/lipstick-3.jpg',
  '00009': '/static/images/product-trial-1.jpg',
  '00010': '/static/images/product-trial-2.jpg'
}

const USER_ID_AVATAR = {
  U20240901: '/static/images/user-f01.jpg',
  U20241156: '/static/images/user-f02.jpg',
  U20240442: '/static/images/user-f03.jpg',
  U20241444: '/static/images/user-f04.jpg',
  U20241558: '/static/images/user-f05.jpg'
}

export const GRASS_SEED_LIST = [
  { id: '00006', seed: 'grass-1', user: '程予薇', userId: 'U20240901', publisher: '用户', cat: '护肤', tag: '爱用物', level: '普通会员', status: 'passed', statusText: '已通过', text: '最近入手的这款兰蔻小黑瓶真的太好用了！用了两周感觉皮肤明显变好了，推荐给姐妹们！', imgs: 1, likes: 356, comments: 45, views: 183000, publishTime: '2026-08-22' },
  { id: '00007', seed: 'grass-2', user: '韩以安', userId: 'U20241156', publisher: '用户', cat: '彩妆', tag: '爱用物', level: 'Prime会员', status: 'passed', statusText: '已通过', text: '分享本月的爱用物合集，从护肤到彩妆一网打尽，每一样都是亲测好用的宝藏！', imgs: 3, likes: 528, comments: 67, views: 96000, publishTime: '2026-08-19' },
  { id: '00008', seed: 'grass-3', user: '赵浅予', userId: 'U20240442', publisher: '商家', cat: '护肤', tag: '测评', level: '卓越会员', status: 'pending', statusText: '待审核', text: 'SK-II神仙水使用一个月效果对比来啦！真的有变白，皮肤也更细腻了，强烈推荐！', imgs: 2, likes: 892, comments: 125, views: 45200, publishTime: '2026-08-15' },
  { id: '00009', seed: 'grass-4', user: '金琉璃', userId: 'U20241444', publisher: '用户', cat: '护肤', tag: '国货', level: '普通会员', status: 'passed', statusText: '已通过', text: '平价替代 | 这几款国货美妆真的不输大牌，学生党必看！', imgs: 1, likes: 423, comments: 56, views: 121000, publishTime: '2026-07-28' },
  { id: '00010', seed: 'grass-5', user: '夏念安', userId: 'U20241558', publisher: '平台', cat: '护肤', tag: '爱用物', level: 'Prime会员', status: 'passed', statusText: '已通过', text: '秋冬换季护肤攻略来啦！敏感肌必看的护肤步骤和产品推荐，亲测有效！', imgs: 2, likes: 268, comments: 34, views: 78000, publishTime: '2026-08-05' }
]

function cloneGrass(g) {
  return {
    id: g.id,
    seed: g.seed || '',
    user: g.user || '',
    userId: g.userId || '',
    publisher: g.publisher || '',
    cat: g.cat || '',
    tag: g.tag || '',
    level: g.level || '',
    status: g.status || '',
    statusText: g.statusText || '',
    text: g.text || '',
    imgs: g.imgs != null ? g.imgs : 1,
    likes: Number(g.likes) || 0,
    comments: Number(g.comments) || 0,
    views: Number(g.views) || 0,
    publishTime: g.publishTime || '',
    syncCover: g.syncCover || '',
    syncImgs: Array.isArray(g.syncImgs) ? g.syncImgs.slice() : []
  }
}

export function buildGrassTitle(grass, maxLen = 20) {
  const text = (grass && grass.text) ? String(grass.text) : ''
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen) + '…'
}

export function formatGrassViews(views) {
  const n = Number(views) || 0
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  return String(n)
}

export function resolveGrassCover(grass) {
  if (!grass) return '/static/images/lipstick-1.jpg'
  if (grass.syncCover && /^(data:|https?:)/.test(grass.syncCover)) return grass.syncCover
  return GRASS_COVER_MAP[grass.id] || getProductImage('', grass.text || grass.user)
}

export function resolveGrassAvatar(grass) {
  if (!grass) return '/static/images/avatar-1.jpg'
  if (grass.userId && USER_ID_AVATAR[grass.userId]) return USER_ID_AVATAR[grass.userId]
  if (grass.user) return getUserAvatar(grass.user)
  return '/static/images/avatar-1.jpg'
}

export function loadGrassList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(GRASS_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneGrass)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(GRASS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneGrass)
      }
    }
  } catch (e) { /* ignore */ }
  return GRASS_SEED_LIST.map(cloneGrass)
}

export function filterGrassForRecommend(list) {
  return (list || []).filter((g) => g.status === 'passed')
}

export function mapGrassToRecommendCard(grass) {
  return {
    id: grass.id,
    contentType: 'post',
    title: buildGrassTitle(grass, 20),
    user: grass.user,
    views: formatGrassViews(grass.views),
    avatar: resolveGrassAvatar(grass),
    img: resolveGrassCover(grass),
    desc: grass.text
  }
}

export function getGrassDetail(id) {
  const grass = loadGrassList().find((g) => String(g.id) === String(id))
  if (!grass) return null
  return {
    type: 'post',
    typeLabel: '种草',
    navTitle: '种草详情',
    id: grass.id,
    title: buildGrassTitle(grass, 40),
    cover: resolveGrassCover(grass),
    meta: `${formatGrassViews(grass.views)}浏览 · ${grass.likes || 0}赞 · ${grass.comments || 0}评论` +
      (grass.publishTime ? ` · ${grass.publishTime}` : ''),
    author: grass.user,
    authorSub: grass.level || grass.tag || '用户',
    avatar: resolveGrassAvatar(grass),
    body: grass.text,
    images: [resolveGrassCover(grass)]
  }
}
