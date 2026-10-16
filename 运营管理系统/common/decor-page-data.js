/** 自定义页面 · 运营端 DecorPanel 持久化 + 内容自动生成 */

export const DECOR_PAGE_STORAGE_KEY = 'zhuangyan_decor_pages_v1'

const TONE_OPTIONS = ['活泼', '专业', '简约', '温馨', '奢华', '年轻']

const STYLE_IMAGE = {
  活泼: '活泼明亮色彩配色高饱和度',
  专业: '专业质感干净留白排版',
  简约: '极简风格大量留白低饱和度',
  温馨: '温暖柔粉色调柔和光线',
  奢华: '奢华金色调深色质感高端',
  年轻: '年轻潮流撞色卡通插画'
}

const TYPE_PATH_PREFIX = {
  专题页: '/pages/topic/',
  活动页: '/pages/activity/',
  品牌页: '/pages/brand/',
  内容页: '/pages/content/'
}

function clonePage(pg) {
  return {
    id: pg.id,
    name: pg.name || '',
    type: pg.type || '专题页',
    path: pg.path || '',
    status: pg.status || '草稿',
    statusKey: pg.statusKey || 'draft',
    updateTime: pg.updateTime || '',
    modules: Array.isArray(pg.modules) ? pg.modules.map(cloneModule) : []
  }
}

function cloneModule(m) {
  const c = { type: m.type, title: m.title || '' }
  if (m.name) c.name = m.name
  if (m.catId) c.catId = m.catId
  if (m.mode) c.mode = m.mode
  if (m.rule) c.rule = m.rule
  if (m.subtitle) c.subtitle = m.subtitle
  if (m.text) c.text = m.text
  if (m.cta) c.cta = m.cta
  if (m.image) c.image = m.image
  if (Array.isArray(m.items)) c.items = m.items.slice()
  if (Array.isArray(m.cats)) c.cats = m.cats.slice()
  if (Array.isArray(m.paragraphs)) c.paragraphs = m.paragraphs.slice()
  if (m.rules) c.rules = m.rules.slice()
  if (m.coupon) c.coupon = m.coupon
  if (m.endDate) c.endDate = m.endDate
  return c
}

function nowStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

function mergeMissingDefaults(list) {
  const ids = {}
  const merged = (list || []).map(clonePage)
  merged.forEach((pg) => { ids[pg.id] = true })
  DECOR_PAGE_SEED.forEach((def) => {
    if (!ids[def.id]) merged.push(clonePage(def))
  })
  return merged
}

export function loadDecorPageList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(DECOR_PAGE_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed)) return mergeMissingDefaults(parsed)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DECOR_PAGE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return mergeMissingDefaults(parsed)
      }
    }
  } catch (e) { /* ignore */ }
  return DECOR_PAGE_SEED.map(clonePage)
}

export function saveDecorPageList(list) {
  const snapshot = (list || []).map(clonePage)
  try {
    if (typeof uni !== 'undefined' && uni.setStorageSync) {
      uni.setStorageSync(DECOR_PAGE_STORAGE_KEY, snapshot)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DECOR_PAGE_STORAGE_KEY, JSON.stringify(snapshot))
    }
  } catch (e) { /* ignore */ }
  if (typeof window !== 'undefined') {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'decor-page-sync', pages: snapshot }, '*')
      }
    } catch (e) { /* ignore */ }
  }
  return snapshot
}

export function nextPageId(list) {
  let max = 10000
  ;(list || []).forEach((pg) => {
    const n = parseInt(String(pg.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  return 'PG' + (max + 1)
}

export function getPageToneOptions() {
  return TONE_OPTIONS.slice()
}

function makePath(type, name) {
  const prefix = TYPE_PATH_PREFIX[type] || '/pages/topic/'
  const slug = (name || 'custom').trim().toLowerCase()
    .replace(/[\s\u4e00-\u9fa5]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'custom'
  return prefix + slug
}

function pickImage(keyword, style) {
  const styleDesc = STYLE_IMAGE[style] || STYLE_IMAGE.专业
  const prompt = keyword + ' ' + styleDesc + ' 产品宣传图 高清电商 banner'
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(prompt) + '&image_size=landscape_16_9'
}

function makeModules(type, theme, tone, opts) {
  const keyword = (theme || '美妆精选').trim()
  const modules = []
  const style = TONE_OPTIONS.includes(tone) ? tone : '专业'

  const banner = {
    type: 'banner',
    title: keyword + (type === '活动页' ? ' 专属活动' : type === '品牌页' ? ' 品牌馆' : type === '内容页' ? ' 内容专辑' : ' 专题'),
    subtitle: '一站式精选 · ' + style + '风格',
    image: pickImage(keyword + ' banner 主视觉', style)
  }
  modules.push(banner)

  if (type === '活动页') {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)
    const p = (n) => String(n).padStart(2, '0')
    modules.push({
      type: 'countdown',
      title: '限时优惠倒计时',
      subtitle: '活动截止前领取更多福利',
      endDate: endDate.getFullYear() + '-' + p(endDate.getMonth() + 1) + '-' + p(endDate.getDate()),
      cta: '立即参与'
    })
    if (opts.coupon !== false) {
      modules.push({
        type: 'coupon',
        title: '满199减30 · 全场可用',
        subtitle: '新人专享 · 限量发放',
        coupon: 'NEW30',
        cta: '一键领取'
      })
    }
    if (opts.tasks !== false) {
      modules.push({
        type: 'task',
        title: '任务打卡赢好礼',
        items: ['浏览' + keyword + '会场 30 秒', '收藏任意 ' + keyword + ' 商品', '分享活动给好友', '下单任意活动商品']
      })
    }
  }

  if (type === '品牌页') {
    modules.push({
      type: 'story',
      title: '关于「' + keyword + '」',
      paragraphs: [
        keyword + ' 始终秉持以用户为中心的产品理念，结合前沿科技与东方美学，打造适合亚洲肤质的护肤方案。',
        '品牌创立至今，已服务超过百万用户，凭借稳定的品质与专业的研发团队，赢得行业与消费者广泛认可。'
      ]
    })
    if (opts.video !== false) {
      modules.push({
        type: 'video',
        title: '品牌故事视频',
        subtitle: '了解 ' + keyword + ' 的诞生与坚持',
        image: pickImage(keyword + ' 品牌故事 视频封面', style)
      })
    }
    if (opts.grid !== false) {
      modules.push({
        type: 'grid',
        title: '明星单品系列',
        items: [keyword + ' 精华系列', keyword + ' 面霜系列', keyword + ' 防晒系列', keyword + ' 套装礼盒']
      })
    }
  }

  if (type === '专题页') {
    modules.push({
      type: 'hero',
      title: keyword + ' · 焕新解读',
      text: '本专题聚焦 ' + keyword + ' 的核心场景与解决方案，结合成分科普、产品推荐与使用指南，帮助用户快速锁定适合的护肤组合。',
      cta: '查看全部'
    })
    if (opts.grid !== false) {
      modules.push({
        type: 'grid',
        title: '编辑精选 · ' + keyword,
        items: [keyword + ' 主推爆款', keyword + ' 入门尝鲜装', keyword + ' 进阶套装', keyword + ' 周边搭配']
      })
    }
    if (opts.story !== false) {
      modules.push({
        type: 'story',
        title: '专题内容指南',
        paragraphs: [
          '针对 ' + keyword + '，我们梳理了成分、肤质、季节三个维度的搭配建议，并配合实测数据呈现真实效果。',
          '每个推荐均经过编辑团队审核，确保信息准确、体验友好、价格透明。'
        ]
      })
    }
  }

  if (type === '内容页') {
    if (opts.article !== false) {
      modules.push({
        type: 'article',
        title: keyword + ' 相关精选文章',
        items: [
          keyword + ' 入门指南：新手必读的 5 个知识点',
          '成分解读：' + keyword + ' 背后的科学原理',
          '使用技巧：如何让 ' + keyword + ' 效果加倍',
          '常见误区：使用 ' + keyword + ' 时要避开的雷区'
        ]
      })
    }
    if (opts.tags !== false) {
      modules.push({
        type: 'tags',
        title: '热门标签',
        items: ['#' + keyword, '#成分党', '#护肤指南', '#年度精选', '#新品上市']
      })
    }
    if (opts.related !== false) {
      modules.push({
        type: 'related',
        title: '相关推荐',
        items: [keyword + ' 进阶专题', '相似主题合集', '近期热门内容']
      })
    }
  }

  modules.push({
    type: 'cta',
    title: '马上探索 ' + keyword,
    subtitle: style + '风格 · 由 AI 内容助手自动生成',
    cta: '进入会场'
  })

  return modules
}

const SEED_RAW = [
  { id: 'PG10001', name: '夏季护肤专题', type: '专题页', path: '/pages/topic/summer-skincare', status: '已发布', statusKey: 'published', updateTime: '2026-08-20 14:30', tone: '专业', options: { grid: true, story: true } },
  { id: 'PG10002', name: '会员权益说明', type: '品牌页', path: '/pages/vip/benefits', status: '已发布', statusKey: 'published', updateTime: '2026-08-18 09:15', tone: '奢华', options: { grid: true, story: true, video: true } },
  { id: 'PG10003', name: '新人领券活动', type: '活动页', path: '/pages/activity/newbie-coupon', status: '草稿', statusKey: 'draft', updateTime: '2026-08-22 16:42', tone: '活泼', options: { coupon: true, tasks: true } },
  { id: 'PG10004', name: '成分百科首页', type: '内容页', path: '/pages/ingredient/index', status: '已发布', statusKey: 'published', updateTime: '2026-08-15 11:08', tone: '简约', options: { article: true, tags: true, related: true } },
  { id: 'PG10005', name: '618大促会场', type: '活动页', path: '/pages/activity/618-sale', status: '已下线', statusKey: 'offline', updateTime: '2026-06-20 23:59', tone: '年轻', options: { coupon: true, tasks: true } }
]

export const DECOR_PAGE_SEED = SEED_RAW.map((s) => ({
  id: s.id,
  name: s.name,
  type: s.type,
  path: s.path,
  status: s.status,
  statusKey: s.statusKey,
  updateTime: s.updateTime,
  modules: makeModules(s.type, s.name, s.tone, s.options)
}))

/**
 * 根据表单输入自动生成自定义页面内容
 * @param {Object} form { name, type, tone, options: { grid, story, video, coupon, tasks, article, tags, related } }
 * @param {Array} existList 用于生成不重复 ID
 * @returns {Object} 新建页面对象 { id, name, type, path, status, statusKey, updateTime, modules }
 */
export function generatePageContent(form, existList) {
  const name = (form && form.name ? String(form.name) : '').trim() || '未命名页面'
  const type = form && form.type ? form.type : '专题页'
  const tone = form && form.tone ? form.tone : '专业'
  const opts = (form && form.options) || {}
  const modules = makeModules(type, name, tone, opts)
  const id = nextPageId(existList || [])
  return {
    id,
    name,
    type,
    path: makePath(type, name),
    status: '草稿',
    statusKey: 'draft',
    updateTime: nowStr(),
    modules
  }
}
