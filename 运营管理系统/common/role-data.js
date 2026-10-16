/** 角色权限管理 · 角色列表读取员工管理中的角色 */

export const ROLE_STORAGE_KEY = 'zhuangyan_role_perm_v2'
export const STAFF_STORAGE_KEY = 'zhuangyan_staff_list_v1'

/** 与员工管理 ROLE_NAMES 保持一致 */
export const STAFF_ROLE_FALLBACK = [
  '超级管理员', '运营管理员', '商品运营', '客服专员',
  '技术开发', '市场专员', '仓储专员', '财务专员', 'HR专员'
]

/** 侧栏功能模块（与运营管理系统一级菜单对齐） */
export const PERM_MODULES = [
  { id: 'product', name: '商品管理', pageCount: 1, subMenus: [], actions: ['新增', '删除', '上架', '下架', '人工审核'] },
  { id: 'merchant', name: '商家管理', pageCount: 1, subMenus: [], actions: ['新增', '编辑', '启用', '停用', '删除'] },
  { id: 'order', name: '订单管理', pageCount: 1, subMenus: [], actions: ['查看', '发货', '关闭', '导出', '备注'] },
  { id: 'review', name: '评价管理', pageCount: 6, subMenus: ['商品评价', '晒单管理', '回复管理', '敏感词', '举报处理'], actions: ['查看', '回复', '隐藏', '删除', '导出'] },
  { id: 'aftersale', name: '售后管理', pageCount: 1, subMenus: [], actions: ['查看', '审核', '退款', '关闭', '导出'] },
  { id: 'user', name: '用户管理', pageCount: 1, subMenus: [], actions: ['查看', '编辑', '禁用', '启用', '导出'] },
  { id: 'activity', name: '活动管理', pageCount: 1, subMenus: [], actions: ['新增', '编辑', '启用', '停用', '删除'] },
  { id: 'decor', name: '店铺装修', pageCount: 4, subMenus: ['广告位管理', '自定义页面', '金刚区入口'], actions: ['新增', '编辑', '发布', '下线', '删除'] },
  { id: 'community', name: '社区管理', pageCount: 6, subMenus: ['文章管理', '种草管理', '圈子管理', '话题管理', '动态管理'], actions: ['新增', '编辑', '审核', '下架', '删除'] },
  { id: 'data', name: '数据中心', pageCount: 5, subMenus: ['经营概览', '商品分析', '用户分析', '活动分析'], actions: ['查看', '导出', '订阅报表'] }
]

function allModuleKeys() {
  const keys = {}
  PERM_MODULES.forEach((m) => {
    keys[m.id] = true
    ;(m.actions || []).forEach((a) => { keys[m.id + '::' + a] = true })
    ;(m.subMenus || []).forEach((s, i) => { keys[m.id + '::sub::' + i] = true })
  })
  return keys
}

const FULL_PERMS = allModuleKeys()

function pickPerms(moduleIds) {
  const map = {}
  const set = {}
  moduleIds.forEach((id) => { set[id] = true })
  PERM_MODULES.forEach((m) => {
    if (!set[m.id]) return
    map[m.id] = true
    ;(m.actions || []).forEach((a) => { map[m.id + '::' + a] = true })
    ;(m.subMenus || []).forEach((s, i) => { map[m.id + '::sub::' + i] = true })
  })
  return map
}

/** 各角色默认权限（按员工管理角色名） */
const ROLE_DEFAULT_META = {
  '超级管理员': {
    code: 'SUPER_ADMIN',
    desc: '拥有全部功能页面与操作权限',
    locked: true,
    perms: { ...FULL_PERMS }
  },
  '运营管理员': {
    code: 'OPS_ADMIN',
    desc: '活动、装修、社区与商品运营权限',
    locked: false,
    perms: pickPerms(['activity', 'decor', 'community', 'data', 'product'])
  },
  '商品运营': {
    code: 'PRD_OPS',
    desc: '商品与商家日常运营权限',
    locked: false,
    perms: pickPerms(['product', 'merchant'])
  },
  '客服专员': {
    code: 'CS_SPEC',
    desc: '订单、售后、用户与评价处理权限',
    locked: false,
    perms: pickPerms(['order', 'aftersale', 'user', 'review'])
  },
  '技术开发': {
    code: 'TECH_DEV',
    desc: '数据中心与商品查看权限',
    locked: false,
    perms: pickPerms(['data', 'product'])
  },
  '市场专员': {
    code: 'MKT_SPEC',
    desc: '社区、活动与数据查看权限',
    locked: false,
    perms: pickPerms(['community', 'activity', 'data'])
  },
  '仓储专员': {
    code: 'WMS_SPEC',
    desc: '订单发货与售后处理权限',
    locked: false,
    perms: pickPerms(['order', 'aftersale'])
  },
  '财务专员': {
    code: 'FIN_SPEC',
    desc: '订单与数据中心查看权限',
    locked: false,
    perms: pickPerms(['order', 'data'])
  },
  'HR专员': {
    code: 'HR_SPEC',
    desc: '用户管理相关权限',
    locked: false,
    perms: pickPerms(['user'])
  }
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

export function cloneRole(r) {
  return {
    id: String(r.id || ''),
    name: r.name || '',
    code: r.code || '',
    desc: r.desc || '',
    status: r.status === '已停用' ? '已停用' : '已启用',
    locked: !!r.locked,
    staffCount: Number(r.staffCount) || 0,
    perms: Object.assign({}, r.perms || {})
  }
}

function codeFromName(name) {
  const map = {
    '超级管理员': 'SUPER_ADMIN',
    '运营管理员': 'OPS_ADMIN',
    '商品运营': 'PRD_OPS',
    '客服专员': 'CS_SPEC',
    '技术开发': 'TECH_DEV',
    '市场专员': 'MKT_SPEC',
    '仓储专员': 'WMS_SPEC',
    '财务专员': 'FIN_SPEC',
    'HR专员': 'HR_SPEC'
  }
  if (map[name]) return map[name]
  return 'ROLE_' + String(name || 'X').replace(/\s+/g, '_').toUpperCase()
}

function loadMetaMap() {
  const parsed = readJson(ROLE_STORAGE_KEY)
  const map = {}
  if (Array.isArray(parsed)) {
    parsed.forEach((r) => {
      const name = String(r && r.name ? r.name : '').trim()
      if (!name) return
      map[name] = cloneRole(r)
    })
  }
  return map
}

/** 从员工列表聚合角色名 → 人数 */
export function aggregateRolesFromStaff(staffList) {
  const countMap = {}
  ;(staffList || []).forEach((s) => {
    const name = String(s && s.role ? s.role : '').trim()
    if (!name) return
    countMap[name] = (countMap[name] || 0) + 1
  })
  return countMap
}

export function loadStaffListForRoles() {
  const parsed = readJson(STAFF_STORAGE_KEY)
  if (Array.isArray(parsed) && parsed.length) return parsed
  return []
}

/**
 * 角色列表：以员工管理 role 字段为准；权限/编码/说明等从本地元数据合并。
 */
export function loadRoleList(staffList) {
  const staff = Array.isArray(staffList) ? staffList : loadStaffListForRoles()
  let countMap = aggregateRolesFromStaff(staff)
  let names = Object.keys(countMap)

  // 员工为空时用员工管理角色枚举兜底，避免空白
  if (!names.length) {
    names = STAFF_ROLE_FALLBACK.slice()
    countMap = {}
    names.forEach((n) => { countMap[n] = 0 })
  } else {
    // 合并枚举中尚未出现的角色（员工筛选项里有、当前无人）
    STAFF_ROLE_FALLBACK.forEach((n) => {
      if (names.indexOf(n) < 0) {
        names.push(n)
        countMap[n] = 0
      }
    })
  }

  const metaMap = loadMetaMap()
  let max = 0
  Object.keys(metaMap).forEach((k) => {
    const n = parseInt(String(metaMap[k].id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })

  const list = names.map((name) => {
    const meta = metaMap[name] || {}
    const def = ROLE_DEFAULT_META[name] || {}
    let id = meta.id || ''
    if (!id) {
      max += 1
      id = 'R' + String(max).padStart(3, '0')
    }
    const locked = name === '超级管理员' ? true : (meta.locked != null ? !!meta.locked : !!def.locked)
    return cloneRole({
      id,
      name,
      code: meta.code || def.code || codeFromName(name),
      desc: meta.desc || def.desc || (name + '权限'),
      status: meta.status || '已启用',
      locked,
      staffCount: countMap[name] || 0,
      perms: (meta.perms && Object.keys(meta.perms).length)
        ? meta.perms
        : (def.perms || {})
    })
  })

  // 超级管理员置顶，其余按名称
  return list.sort((a, b) => {
    if (a.name === '超级管理员') return -1
    if (b.name === '超级管理员') return 1
    return String(a.name).localeCompare(String(b.name), 'zh')
  })
}

/** 仅保存可编辑元数据（不覆盖员工角色来源） */
export function saveRoleList(list) {
  const cleaned = (list || []).map((r) => {
    const c = cloneRole(r)
    delete c._checked
    return c
  })
  writeJson(ROLE_STORAGE_KEY, cleaned)
  return cleaned
}

export function nextRoleId(list) {
  let max = 0
  ;(list || []).forEach((r) => {
    const n = parseInt(String(r.id).replace(/\D/g, ''), 10)
    if (!isNaN(n) && n > max) max = n
  })
  return 'R' + String(max + 1).padStart(3, '0')
}

export function moduleCheckedCount(module, perms) {
  if (!module || !perms) {
    return {
      page: 0,
      action: 0,
      pageTotal: module ? module.pageCount : 0,
      actionTotal: (module && module.actions) ? module.actions.length : 0
    }
  }
  const actionTotal = (module.actions || []).length
  let action = 0
  ;(module.actions || []).forEach((a) => {
    if (perms[module.id + '::' + a]) action += 1
  })
  const pageTotal = module.pageCount || 1
  let page = 0
  if (perms[module.id]) {
    page = Math.min(
      pageTotal,
      1 + (module.subMenus || []).filter((s, i) => perms[module.id + '::sub::' + i]).length
    )
    if (!(module.subMenus || []).length) page = pageTotal
  }
  return { page, action, pageTotal, actionTotal }
}

export function isModuleFullyChecked(module, perms) {
  if (!perms[module.id]) return false
  const actionsOk = (module.actions || []).every((a) => perms[module.id + '::' + a])
  const subsOk = (module.subMenus || []).every((s, i) => perms[module.id + '::sub::' + i])
  return actionsOk && subsOk
}

export function setModuleChecked(module, perms, checked) {
  const next = Object.assign({}, perms)
  if (checked) {
    next[module.id] = true
    ;(module.actions || []).forEach((a) => { next[module.id + '::' + a] = true })
    ;(module.subMenus || []).forEach((s, i) => { next[module.id + '::sub::' + i] = true })
  } else {
    delete next[module.id]
    ;(module.actions || []).forEach((a) => { delete next[module.id + '::' + a] })
    ;(module.subMenus || []).forEach((s, i) => { delete next[module.id + '::sub::' + i] })
  }
  return next
}

export function isAllModulesChecked(perms) {
  return PERM_MODULES.every((m) => isModuleFullyChecked(m, perms || {}))
}

export function setAllModules(perms, checked) {
  let next = Object.assign({}, perms || {})
  PERM_MODULES.forEach((m) => {
    next = setModuleChecked(m, next, checked)
  })
  return next
}
