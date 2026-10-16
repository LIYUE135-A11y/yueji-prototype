/** 功能入口排序：在当前子菜单列表内调整上下显示顺序 */

export function compareEntrySort(a, b) {
  const sa = Number(a.sort) || 0
  const sb = Number(b.sort) || 0
  if (sa !== sb) return sa - sb
  return String(a.id).localeCompare(String(b.id))
}

export function sortEntriesByOrder(list) {
  return (list || []).slice().sort(compareEntrySort)
}

/** 当前列表内可移动的分组（默认：同 scope 全部；传入 visibleList 则为筛选后的当前列表） */
export function getEntryMoveGroup(list, entry, visibleList) {
  if (!entry) return []
  if (visibleList && visibleList.length) {
    return sortEntriesByOrder(visibleList.filter(en => en.scope === entry.scope))
  }
  return sortEntriesByOrder((list || []).filter(en => en.scope === entry.scope))
}

export function getEntryMoveState(list, entry, visibleList) {
  const group = getEntryMoveGroup(list, entry, visibleList)
  const index = group.findIndex(en => en.id === entry.id)
  return {
    group,
    index,
    canMoveUp: index > 0,
    canMoveDown: index >= 0 && index < group.length - 1
  }
}

/** 将移动后的可见列表顺序合并回完整 scope 列表，并重编 sort */
export function applyVisibleOrderToScope(list, scope, orderedVisible) {
  const scopeAll = sortEntriesByOrder((list || []).filter(en => en.scope === scope))
  const visibleIdSet = new Set((orderedVisible || []).map(en => en.id))
  const result = []
  let vIdx = 0
  scopeAll.forEach(item => {
    if (visibleIdSet.has(item.id)) {
      result.push(orderedVisible[vIdx++])
    } else {
      result.push(item)
    }
  })
  result.forEach((en, i) => { en.sort = i + 1 })
  return result
}

/**
 * 在当前列表中上移/下移
 * @param {Array} list 全量入口列表
 * @param {string} entryId
 * @param {'up'|'down'} direction
 * @param {Array} [visibleList] 当前表格展示的列表（筛选项生效后）
 */
export function moveEntryInList(list, entryId, direction, visibleList) {
  const entry = (list || []).find(en => en.id === entryId)
  if (!entry) return { ok: false, message: '入口不存在' }

  const { group, index, canMoveUp, canMoveDown } = getEntryMoveState(list, entry, visibleList)
  if (index < 0) return { ok: false, message: '入口不存在' }

  if (direction === 'up') {
    if (!canMoveUp) return { ok: false, message: '已在最顶部' }
  } else if (direction === 'down') {
    if (!canMoveDown) return { ok: false, message: '已在最底部' }
  } else {
    return { ok: false, message: '无效操作' }
  }

  const targetIdx = direction === 'up' ? index - 1 : index + 1
  const nextVisible = group.slice()
  const moved = nextVisible[index]
  nextVisible.splice(index, 1)
  nextVisible.splice(targetIdx, 0, moved)
  applyVisibleOrderToScope(list, entry.scope, nextVisible)

  return {
    ok: true,
    message: (direction === 'up' ? '已上移：' : '已下移：') + moved.name,
    entry: moved
  }
}

/** 整理某子菜单下排序号（1 起连续，按当前 sort 顺序） */
export function normalizeScopeEntrySort(list, scope) {
  sortEntriesByOrder((list || []).filter(en => en.scope === scope))
    .forEach((en, i) => { en.sort = i + 1 })
}
