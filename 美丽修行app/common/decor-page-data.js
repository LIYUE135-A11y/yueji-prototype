/** 自定义装修页 · 与运营端店铺装修同步 */
export const DECOR_PAGE_STORAGE_KEY = 'zhuangyan_decor_pages_v1'

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

function makeFallbackModules(name) {
  const keyword = (name || '精选专题').trim()
  return [
    {
      type: 'banner',
      title: keyword + ' 专属会场',
      subtitle: '为你精选的节日礼遇与好物推荐',
      image: ''
    },
    {
      type: 'hero',
      title: keyword + ' · 精选专题',
      text: '汇集适合 ' + keyword + ' 场景的护肤与美妆好物，一站式挑选心意礼物。',
      cta: '立即选购'
    },
    {
      type: 'grid',
      title: '编辑推荐',
      items: [keyword + ' 热销礼盒', keyword + ' 实用单品', keyword + ' 口碑爆款', keyword + ' 限时特惠']
    },
    {
      type: 'cta',
      title: '进入 ' + keyword + ' 会场',
      subtitle: '更多好物等你发现',
      cta: '马上逛逛'
    }
  ]
}

export function loadDecorPageList() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(DECOR_PAGE_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (Array.isArray(parsed) && parsed.length) return parsed.map(clonePage)
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DECOR_PAGE_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length) return parsed.map(clonePage)
      }
    }
  } catch (e) { /* ignore */ }
  return []
}

export function findDecorPage({ id, path, name } = {}) {
  const list = loadDecorPageList()
  if (id) {
    const hit = list.find((p) => String(p.id) === String(id))
    if (hit) return hit
  }
  if (path) {
    const hit = list.find((p) => p.path === path)
    if (hit) return hit
  }
  if (name) {
    const n = String(name).trim()
    const exact = list.find((p) => p.name === n)
    if (exact) return exact
    const soft = list.find((p) => p.name && (p.name.indexOf(n) >= 0 || n.indexOf(p.name) >= 0))
    if (soft) return soft
  }
  return null
}

/** 按 id / path / name 解析页面；找不到时按名称生成临时会场页 */
export function resolveDecorPage(query = {}) {
  const id = query.id || ''
  const path = query.path || ''
  const name = decodeURIComponent(query.name || '')
  const found = findDecorPage({ id, path, name })
  if (found) return found
  const title = name || '精选专题'
  return {
    id: id || 'TMP',
    name: title,
    type: '专题页',
    path: path || '',
    status: '已发布',
    statusKey: 'published',
    modules: makeFallbackModules(title)
  }
}
