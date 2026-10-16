/**
 * 我的收藏（护肤清单）· APP 端数据层
 * 收藏条目仅存商品 id 与分类，商品详情实时取自 ProductStore（运营端-商品管理），
 * 保证价格/名称/上下架状态与运营端同步（逻辑闭环）。
 * 通过 localStorage 持久化。
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_collect_list_v1';
  var SYNC_MSG = 'collect-sync';

  var TYPE_LABELS = { want: '想用', used: '用过', allergy: '过敏不适' };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
    } catch (e) { /* ignore */ }
    broadcast();
  }

  function broadcast() {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: SYNC_MSG, count: load().length }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  function cloneEntry(e) {
    return { pid: String(e.pid || ''), type: TYPE_LABELS[e.type] ? e.type : 'want', time: e.time || '' };
  }

  function indexOfPid(list, pid) {
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].pid) === String(pid)) return i;
    }
    return -1;
  }

  function all() {
    return load().map(cloneEntry);
  }

  function has(pid) {
    return indexOfPid(load(), pid) > -1;
  }

  function typeOf(pid) {
    var list = load();
    var i = indexOfPid(list, pid);
    return i > -1 ? list[i].type : '';
  }

  // 加入收藏：同商品已存在时更新其分类；type 不合法默认「想用」
  function add(pid, type) {
    var t = TYPE_LABELS[type] ? type : 'want';
    var list = load();
    var i = indexOfPid(list, pid);
    var entry = cloneEntry({ pid: pid, type: t, time: new Date().toISOString() });
    if (i > -1) list[i] = entry;
    else list.unshift(entry);
    save(list);
    return true;
  }

  function remove(pid) {
    var list = load();
    var i = indexOfPid(list, pid);
    if (i > -1) {
      list.splice(i, 1);
      save(list);
    }
    return list;
  }

  // type='all' 返回全部数量
  function countByType(type) {
    var list = load();
    if (!type || type === 'all') return list.length;
    var n = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].type === type) n++;
    }
    return n;
  }

  function labelOf(type) {
    return TYPE_LABELS[type] || '';
  }

  global.ProfileCollectStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    TYPE_LABELS: TYPE_LABELS,
    all: all,
    load: load,
    save: save,
    add: add,
    remove: remove,
    has: has,
    typeOf: typeOf,
    countByType: countByType,
    labelOf: labelOf
  };
})(window);
