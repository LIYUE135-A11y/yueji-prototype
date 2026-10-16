export function normFilterVal(v) {
  return (!v || v === '全部') ? '' : v
}

export function withinJoinRange(dateStr, range) {
  if (!range || !dateStr) return true
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const d = new Date(dateStr.replace(/-/g, '/'))
  const diffDays = Math.floor((today - d) / 86400000)
  if (range === '近7天') return diffDays >= 0 && diffDays <= 7
  if (range === '近30天') return diffDays >= 0 && diffDays <= 30
  if (range === '近3个月') return diffDays >= 0 && diffDays <= 90
  if (range === '近半年') return diffDays >= 0 && diffDays <= 180
  if (range === '1年以上') return diffDays >= 365
  return true
}

export function withinOrderTime(dateStr, range) {
  if (!range || !dateStr) return true
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const d = new Date(dateStr.replace(/-/g, '/'))
  const diffMs = today - d
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (range === '近24小时') return diffHours >= 0 && diffHours <= 24
  if (range === '近7天') return diffDays >= 0 && diffDays <= 7
  if (range === '近30天') return diffDays >= 0 && diffDays <= 30
  if (range === '近3个月') return diffDays >= 0 && diffDays <= 90
  if (range === '近半年') return diffDays >= 0 && diffDays <= 180
  if (range === '1年以上') return diffDays >= 365
  return true
}

export function filterProducts(list, f) {
  const kw = (f.keyword || '').trim().toLowerCase()
  return list.filter(p => {
    if (kw) {
      const hit = (p.name || '').toLowerCase().includes(kw)
        || (p.id || '').toLowerCase().includes(kw)
        || (p.sku || '').toLowerCase().includes(kw)
      if (!hit) return false
    }
    if (f.cat1 && p.cat1 !== f.cat1) return false
    if (f.cat2 && p.cat2 !== f.cat2) return false
    if (f.cat3 && p.cat3 !== f.cat3) return false
    if (f.brand && p.brand !== f.brand) return false
    if (f.merchant && p.merchant !== f.merchant) return false
    if (f.status && p.status !== f.status) return false
    if (f.audit && p.auditStatus !== f.audit) return false
    return true
  })
}

export function filterMerchants(list, f) {
  const kw = (f.keyword || '').trim().toLowerCase()
  return list.filter(m => {
    if (kw) {
      const hit = (m.name || '').toLowerCase().includes(kw)
        || (m.id || '').toLowerCase().includes(kw)
        || (m.contact || '').toLowerCase().includes(kw)
      if (!hit) return false
    }
    if (f.type && m.type !== f.type) return false
    if (f.audit && m.auditStatus !== f.audit) return false
    if (f.open && m.openStatus !== f.open) return false
    if (f.category && m.category !== f.category) return false
    if (f.region && m.region !== f.region) return false
    if (!withinJoinRange(m.joinTime, f.join)) return false
    return true
  })
}

export function filterOrders(list, f) {
  const kw = (f.keyword || '').trim().toLowerCase()
  return list.filter(o => {
    if (kw) {
      const hit = (o.id || '').toLowerCase().includes(kw)
        || (o.prodName || '').toLowerCase().includes(kw)
        || (o.userName || '').toLowerCase().includes(kw)
        || (o.userId || '').toLowerCase().includes(kw)
        || (o.merchantName || '').toLowerCase().includes(kw)
      if (!hit) return false
    }
    if (f.status && o.status !== f.status) return false
    if (f.payStatus && o.payStatus !== f.payStatus) return false
    if (f.delivery && o.delivery !== f.delivery) return false
    if (f.merchant && o.merchantName !== f.merchant) return false
    if (f.payMethod && o.payMethod !== f.payMethod) return false
    if (!withinOrderTime(o.orderTime, f.time)) return false
    return true
  })
}

export function paginateList(list, page, pageSize) {
  const size = parseInt(pageSize, 10) || 10
  const maxPage = Math.max(1, Math.ceil(list.length / size))
  const safePage = Math.min(Math.max(1, page), maxPage)
  const start = (safePage - 1) * size
  return {
    items: list.slice(start, start + size),
    total: list.length,
    maxPage,
    page: safePage
  }
}
