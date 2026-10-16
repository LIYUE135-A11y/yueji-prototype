import { getUserAvatar } from './user-data.js'
import { getProductImage, getProductImages } from './product-image.js'

export const ARTICLE_STORAGE_KEY = 'yueji_article_list_v2'

const ARTICLE_COVER_MAP = {
  '00001': '/static/images/product-trial-1.jpg',
  '00002': '/static/images/lipstick-1.jpg',
  '00003': '/static/images/lipstick-2.jpg',
  '00004': '/static/images/lipstick-3.jpg',
  '00005': '/static/images/product-trial-2.jpg'
}

const USER_ID_AVATAR = {
  U20240501: '/static/images/user-f06.jpg',
  U20240088: '/static/images/user-f02.jpg',
  U20240208: '/static/images/user-f07.jpg',
  U20240612: '/static/images/user-f08.jpg',
  U20240334: '/static/images/user-f09.jpg'
}

export const ARTICLE_SEED_LIST = [
  { id: '00001', seed: 'art-1', title: '护肤心得', excerpt: '从高铁米粉开始，循序渐进添加...', cat: '护肤', tag: '护肤攻略', publisher: '用户', author: '温以柔', authorId: 'U20240501', level: '卓越会员', levelKey: 'excellent', status: 'passed', statusText: '已通过', reads: 12580, publishTime: '2026-08-20', subtitle: '专业美容知识分享', favorites: 236, comments: 58, likes: 892 },
  { id: '00002', seed: 'art-2', title: '彩妆入门指南', excerpt: '两款奶粉从消化、溶解、价格三...', cat: '彩妆', tag: '化妆技巧', publisher: '商家', author: '沈清欢', authorId: 'U20240088', level: 'Prime会员', levelKey: 'prime', status: 'passed', statusText: '已通过', reads: 28560, publishTime: '2026-08-18', subtitle: '时尚彩妆教程', favorites: 412, comments: 127, likes: 1560 },
  { id: '00003', seed: 'art-3', title: '敏感肌换季急救笔记', excerpt: '换季爆皮起皮怎么办？这份温和...', cat: '护肤', tag: '敏感肌', publisher: '用户', author: '宋软软', authorId: 'U20240208', level: '普通会员', levelKey: 'normal', status: 'pending', statusText: '待审核', reads: 8920, publishTime: '2026-07-15', subtitle: '敏感肌护理分享', favorites: 89, comments: 23, likes: 345 },
  { id: '00004', seed: 'art-4', title: '养肤底妆选购指南', excerpt: '养肤粉底与气垫怎么选？从肤质...', cat: '彩妆', tag: '好物推荐', publisher: '平台', author: '方知予', authorId: 'U20240612', level: '卓越会员', levelKey: 'excellent', status: 'pending', statusText: '待审核', reads: 0, publishTime: '2026-08-10', subtitle: '底妆产品测评', favorites: 15, comments: 6, likes: 78 },
  { id: '00005', seed: 'art-5', title: '熬夜党修护精华清单', excerpt: '熬夜急救三步走：舒缓、修护、...', cat: '护肤', tag: '修护', publisher: '用户', author: '谢星河', authorId: 'U20240334', level: 'Prime会员', levelKey: 'prime', status: 'passed', statusText: '已通过', reads: 6250, publishTime: '2026-06-22', subtitle: '熬夜护肤经验', favorites: 178, comments: 41, likes: 623 }
]

function toStatNum(val, fallback = 0) {
  if (val == null || val === '') return fallback
  const n = parseInt(val, 10)
  return isNaN(n) ? fallback : n
}

export function cloneArticle(a) {
  return {
    id: a.id,
    seed: a.seed || '',
    title: a.title || '',
    excerpt: a.excerpt || '',
    content: a.content || '',
    cat: a.cat || '',
    tag: a.tag || '',
    publisher: a.publisher || '',
    author: a.author || '',
    authorId: a.authorId || '',
    level: a.level || '',
    levelKey: a.levelKey || '',
    status: a.status || '',
    statusText: a.statusText || '',
    reads: toStatNum(a.reads, 0),
    publishTime: a.publishTime || '',
    subtitle: a.subtitle || '',
    favorites: toStatNum(a.favorites, 0),
    comments: toStatNum(a.comments, 0),
    likes: toStatNum(a.likes, 0),
    syncCover: a.syncCover || '',
    syncImgs: Array.isArray(a.syncImgs) ? a.syncImgs.slice() : []
  }
}

export function formatArticleStatCount(n) {
  const num = toStatNum(n, 0)
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  return String(num)
}

export function buildArticleTags(article) {
  const parts = []
  if (article && article.cat) parts.push(article.cat)
  if (article && article.tag) parts.push(article.tag)
  if (article && article.level) parts.push(article.level)
  return parts.join(' · ') || '阅己社区'
}

export function resolveArticleCover(article) {
  if (!article) return '/static/images/product-trial-1.jpg'
  if (article.syncImgs && article.syncImgs.length) {
    const first = String(article.syncImgs[0])
    if (/^(data:|https?:|\/)/.test(first)) return first
  }
  if (article.syncCover) {
    const sc = String(article.syncCover)
    if (/^(data:|https?:|\/)/.test(sc)) return sc
  }
  return ARTICLE_COVER_MAP[article.id] || getProductImage('', article.title || article.excerpt || article.author)
}

export function resolveArticleImages(article, count = 3) {
  if (!article) return getProductImages('', '', count)
  if (article.syncImgs && article.syncImgs.length) {
    const list = article.syncImgs
      .map((img) => String(img || ''))
      .filter((img) => /^(data:|https?:|\/)/.test(img))
    if (list.length) return list.slice(0, count)
  }
  const cover = resolveArticleCover(article)
  const pool = getProductImages(article.seed || article.id, article.title || article.excerpt || '', count)
  if (pool[0] !== cover) {
    return [cover, ...pool.filter((img) => img !== cover)].slice(0, count)
  }
  return pool.slice(0, count)
}

export function resolveArticleAvatar(article) {
  if (!article) return '/static/images/avatar-1.jpg'
  if (article.authorId && USER_ID_AVATAR[article.authorId]) return USER_ID_AVATAR[article.authorId]
  if (article.author) return getUserAvatar(article.author)
  return '/static/images/avatar-1.jpg'
}

export function loadArticleList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(ARTICLE_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneArticle)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ARTICLE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneArticle)
      }
    }
  } catch (e) { /* ignore */ }
  return ARTICLE_SEED_LIST.map(cloneArticle)
}

export function broadcastArticleList(list) {
  if (typeof window === 'undefined') return
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'article-sync', articles: list || [] }, '*')
    }
  } catch (e) { /* ignore */ }
}

export function saveArticleList(list) {
  const snapshot = (list || []).map(cloneArticle)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(ARTICLE_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ARTICLE_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  broadcastArticleList(snapshot)
  return snapshot
}

export function bumpArticleStat(articleId, fieldOrAction) {
  const fieldMap = {
    fav: 'favorites',
    favorite: 'favorites',
    favorites: 'favorites',
    comment: 'comments',
    comments: 'comments',
    like: 'likes',
    likes: 'likes'
  }
  const field = fieldMap[fieldOrAction]
  if (!field) return loadArticleList()
  const list = loadArticleList()
  const next = list.map((a) => {
    if (String(a.id) !== String(articleId)) return cloneArticle(a)
    const copy = cloneArticle(a)
    copy[field] = toStatNum(copy[field], 0) + 1
    return copy
  })
  return saveArticleList(next)
}

export function filterArticlesForDiscover(list) {
  return (list || []).filter((a) => a.status === 'passed')
}

export function mapArticleToFindCard(article) {
  const images = resolveArticleImages(article, 3)
  return {
    id: article.id,
    articleId: article.id,
    contentType: 'article',
    user: article.author,
    avatar: resolveArticleAvatar(article),
    tags: buildArticleTags(article),
    title: article.title,
    desc: article.excerpt || article.subtitle || '',
    images,
    favorites: toStatNum(article.favorites, 0),
    comments: toStatNum(article.comments, 0),
    likes: toStatNum(article.likes, 0),
    favoritesText: formatArticleStatCount(article.favorites),
    commentsText: formatArticleStatCount(article.comments),
    likesText: formatArticleStatCount(article.likes)
  }
}

export function getArticleDetail(id) {
  const article = loadArticleList().find((a) => String(a.id) === String(id))
  if (!article) return null
  const cover = resolveArticleCover(article)
  const images = resolveArticleImages(article, 3)
  const body = article.content ||
    [article.excerpt, article.subtitle].filter(Boolean).join('\n\n') ||
    article.title
  return {
    type: 'article',
    typeLabel: '文章',
    navTitle: '文章详情',
    id: article.id,
    title: article.title,
    cover,
    meta: `${formatArticleStatCount(article.reads || article.likes || 0)}阅读 · ${article.likes || 0}赞 · ${article.comments || 0}评论` +
      (article.publishTime ? ` · ${article.publishTime}` : ''),
    author: article.author,
    authorSub: article.level || article.tag || '作者',
    avatar: resolveArticleAvatar(article),
    body,
    images
  }
}
