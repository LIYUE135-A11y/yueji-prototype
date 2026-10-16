/**
 * AI客服会话 · App「AI客服」↔ 运营「知识库管理」共享
 * localStorage: zhuangyan_kefu_sessions_v2（兼容读旧 v1）
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_kefu_sessions_v2';
  var STORAGE_KEY_LEGACY = 'zhuangyan_kefu_sessions_v1';
  var SYNC_MSG = 'kefu-session-sync';
  var REQUEST_MSG = 'kefu-session-request-sync';
  var memoryList = null;

  function nowStr() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
  }

  function genId() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    var stamp = '' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) +
      p(d.getHours()) + p(d.getMinutes());
    return 'KF' + stamp + String(Math.floor(Math.random() * 900) + 100);
  }

  function normalizeSession(s) {
    s = s || {};
    return {
      id: String(s.id || genId()),
      userId: String(s.userId || 'U20240076'),
      userName: String(s.userName || '野稗子'),
      type: s.type || 'AI智能客服',
      summary: s.summary || '',
      orderId: s.orderId || '—',
      agent: s.agent || 'AI牛牛',
      status: s.status || '已回复',
      channel: s.channel || 'app',
      updatedAt: s.updatedAt || nowStr(),
      createdAt: s.createdAt || nowStr(),
      messages: Array.isArray(s.messages) ? s.messages.slice() : [],
      category: s.category || '',
      priority: s.priority || '',
      sentiment: s.sentiment || '',
      skillGroup: s.skillGroup || '',
      city: s.city || '',
      device: s.device || '',
      transferFromAi: !!s.transferFromAi,
      msgCount: s.msgCount != null ? s.msgCount : (Array.isArray(s.messages) ? s.messages.length : 0),
      waitMinutes: s.waitMinutes != null ? s.waitMinutes : 0,
      firstResponseSec: s.firstResponseSec != null ? s.firstResponseSec : 0,
      resolveMinutes: s.resolveMinutes != null ? s.resolveMinutes : 0,
      satisfaction: s.satisfaction != null ? s.satisfaction : '-',
      tags: s.tags || '',
      vipLevel: s.vipLevel || '',
      phoneMasked: s.phoneMasked || '',
      language: s.language || '',
      slaLevel: s.slaLevel || '',
      reopenCount: s.reopenCount != null ? s.reopenCount : 0,
      aiConfidence: s.aiConfidence != null ? s.aiConfidence : 0,
      lastMsgPreview: s.lastMsgPreview || '',
      relatedProductId: s.relatedProductId || '',
      remark: s.remark || '',
      assignTime: s.assignTime || '',
      closeTime: s.closeTime || '',
      hangupReason: s.hangupReason || '',
      seedVersion: s.seedVersion || '',
      source: s.source || ''
    };
  }

  function load() {
    var fromLs = null;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) raw = localStorage.getItem(STORAGE_KEY_LEGACY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) fromLs = parsed.map(normalizeSession);
      }
    } catch (e) {}
    /* 内存与 LS 合并，避免 setItem 失败或竞态时旧 LS 冲掉刚发送的消息 */
    if (fromLs && memoryList && memoryList.length) {
      memoryList = mergeSessionLists(memoryList, fromLs);
      return clone(memoryList);
    }
    if (fromLs) {
      memoryList = fromLs;
      return clone(memoryList);
    }
    if (memoryList && memoryList.length) return clone(memoryList);
    memoryList = [];
    return [];
  }

  function invalidate() {
    memoryList = null;
  }

  function sessionNewer(a, b) {
    if (!a) return false;
    if (!b) return true;
    var ta = String(a.updatedAt || '');
    var tb = String(b.updatedAt || '');
    if (ta !== tb) return ta > tb;
    var ma = (a.messages && a.messages.length) || 0;
    var mb = (b.messages && b.messages.length) || 0;
    if (ma !== mb) return ma > mb;
    return true;
  }

  function msgKey(m) {
    if (!m) return '';
    return [m.role || '', m.source || '', m.at || '', String(m.text || '').slice(0, 80)].join('|');
  }

  function mergeMessages(aMsgs, bMsgs) {
    var seen = {};
    var out = [];
    function add(list) {
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (!m) continue;
        var k = msgKey(m);
        if (!k || seen[k]) continue;
        seen[k] = true;
        out.push(m);
      }
    }
    add(aMsgs);
    add(bMsgs);
    out.sort(function (x, y) {
      return String(x.at || '').localeCompare(String(y.at || ''));
    });
    if (out.length > 80) out = out.slice(-80);
    return out;
  }

  function mergeOneSession(localSes, remoteSes) {
    if (!localSes) return normalizeSession(remoteSes);
    if (!remoteSes) return normalizeSession(localSes);
    var base = sessionNewer(remoteSes, localSes) ? remoteSes : localSes;
    var other = base === remoteSes ? localSes : remoteSes;
    var merged = normalizeSession(Object.assign({}, other, base));
    merged.messages = mergeMessages(localSes.messages, remoteSes.messages);
    /* 以消息末条时间校准 updatedAt，避免丢最新气泡 */
    if (merged.messages.length) {
      var lastAt = merged.messages[merged.messages.length - 1].at;
      if (lastAt && String(lastAt) > String(merged.updatedAt || '')) {
        merged.updatedAt = lastAt;
      }
    }
    return merged;
  }

  /** 双端合并：同 id 合并消息列表，避免 requestSync / 竞态覆盖刚发送的回复 */
  function mergeSessionLists(localList, remoteList) {
    var byId = {};
    var order = [];
    function ingest(list) {
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var s = normalizeSession(list[i]);
        if (!s || !s.id) continue;
        if (!byId[s.id]) {
          byId[s.id] = s;
          order.push(s.id);
        } else {
          byId[s.id] = mergeOneSession(byId[s.id], s);
        }
      }
    }
    ingest(localList);
    ingest(remoteList);
    var out = [];
    var seen = {};
    for (var j = 0; j < order.length; j++) {
      var id = order[j];
      if (seen[id]) continue;
      seen[id] = true;
      if (byId[id]) out.push(byId[id]);
    }
    for (var k in byId) {
      if (!Object.prototype.hasOwnProperty.call(byId, k) || seen[k]) continue;
      out.push(byId[k]);
    }
    out.sort(function (a, b) {
      return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
    });
    return out;
  }

  function save(list, opts) {
    opts = opts || {};
    memoryList = (list || []).map(normalizeSession);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryList));
    } catch (e) {}
    if (!opts.silent) broadcast(memoryList);
    return clone(memoryList);
  }

  var bc = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel(STORAGE_KEY);
      bc.onmessage = function (ev) {
        var data = ev && ev.data;
        if (!data) return;
        /* 不再因对端 REQUEST 全量广播，避免旧快照覆盖新消息；由 parent 合并转发 */
        if (data.type === REQUEST_MSG) return;
        if (data.type !== SYNC_MSG || !Array.isArray(data.payload)) return;
        applyRemote(data.payload);
        try {
          global.dispatchEvent(new CustomEvent('kefu-session-updated', { detail: load() }));
        } catch (eBc) {}
      };
    }
  } catch (eBcInit) { bc = null; }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, payload: list || load(), source: 'kefu-store' };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e0) {}
    /* 不再 window.postMessage 给自己，避免同页重复 apply */
    try {
      if (bc) bc.postMessage(payload);
    } catch (eBc2) {}
    try {
      if (global.dispatchEvent) {
        global.dispatchEvent(new CustomEvent('kefu-session-updated', { detail: payload.payload }));
      }
    } catch (e2) {}
  }

  function findById(id) {
    var list = load();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function upsertSession(patch) {
    var list = load();
    var found = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === patch.id) { found = i; break; }
    }
    var next = normalizeSession(found >= 0 ? Object.assign({}, list[found], patch) : patch);
    next.updatedAt = nowStr();
    if (found >= 0) list[found] = next;
    else list.unshift(next);
    if (list.length > 200) list = list.slice(0, 200);
    save(list);
    return next;
  }

  function ensureSession(meta) {
    meta = meta || {};
    var list = load();
    var candidates = [];
    var uid = meta.userId || 'U20240076';
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      if (!s || String(s.userId) !== String(uid)) continue;
      var st = String(s.status || '');
      var t = String(s.type || '');
      if (/已完结|已关闭/.test(st)) continue;
      if (t === '人工客服已完结') continue;
      if (!(st === '接待中' || st === '已回复' || st === '待接入')) continue;
      candidates.push(s);
    }
    if (candidates.length && !meta.forceNew) {
      candidates.sort(function (a, b) {
        function rank(ses) {
          var ty = String(ses.type || '');
          var sta = String(ses.status || '');
          if (ty === '人工客服' && sta === '接待中') return 100;
          if (ty === '转人工' || sta === '待接入') return 90;
          if (ty === '人工客服') return 80;
          if (sta === '接待中') return 50;
          return 10;
        }
        var d = rank(b) - rank(a);
        if (d) return d;
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
      return candidates[0];
    }
    return upsertSession({
      id: genId(),
      userId: meta.userId || 'U20240076',
      userName: meta.userName || '野稗子',
      type: meta.type || 'AI智能客服',
      agent: meta.agent || 'AI牛牛',
      status: '接待中',
      channel: 'app',
      summary: '新会话',
      orderId: '—',
      messages: [],
      createdAt: nowStr()
    });
  }

  function appendMessage(sessionId, role, text, extra) {
    extra = extra || {};
    var list = load();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === sessionId) { idx = i; break; }
    }
    if (idx < 0) return null;
    var s = list[idx];
    s.messages = s.messages || [];
    var msg = {
      role: role,
      text: String(text || ''),
      at: nowStr(),
      source: extra.source || ''
    };
    if (extra.orderId) msg.orderId = extra.orderId;
    if (extra.orders && extra.orders.length) msg.orders = clone(extra.orders);
    else if (extra.order) msg.orders = [clone(extra.order)];
    if (extra.products && extra.products.length) msg.products = clone(extra.products);
    if (extra.aftersales && extra.aftersales.length) msg.aftersales = clone(extra.aftersales);
    else if (extra.aftersale) msg.aftersales = [clone(extra.aftersale)];
    if (extra.highlightIngredients) msg.highlightIngredients = true;
    s.messages.push(msg);
    if (s.messages.length > 80) s.messages = s.messages.slice(-80);
    if (role === 'user') {
      s.summary = String(text || '').slice(0, 40);
      if (extra.orderId) s.orderId = extra.orderId;
    }
    if (extra.type) s.type = extra.type;
    if (extra.status) s.status = extra.status;
    if (extra.agent) s.agent = extra.agent;
    if (role === 'assistant' && !extra.status) {
      if (s.status === '待接入') {/* keep */}
      else s.status = '已回复';
    }
    s.updatedAt = nowStr();
    list[idx] = s;
    save(list);
    return s;
  }

  function updateSession(sessionId, patch) {
    var cur = findById(sessionId);
    if (!cur) return null;
    return upsertSession(Object.assign({}, cur, patch || {}, { id: sessionId }));
  }

  function fmtPrice(n) {
    var v = Number(n);
    return isNaN(v) ? '0.00' : v.toFixed(2);
  }

  function loadProducts() {
    try {
      if (global.ProductStore && global.ProductStore.load) {
        var list = global.ProductStore.mergeAppProducts
          ? global.ProductStore.mergeAppProducts(global.ProductStore.load())
          : global.ProductStore.load();
        if (list && list.length) return list;
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem('zhuangyan_product_list_v1');
      if (raw) {
        var p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      }
    } catch (e2) {}
    return [];
  }

  function loadAppProfileOrders() {
    try {
      if (global.ProfileOrderStore && typeof global.ProfileOrderStore.load === 'function') {
        var list = global.ProfileOrderStore.load() || [];
        if (Array.isArray(list) && list.length) return list.slice();
      }
    } catch (e) {}
    try {
      if (global.ProfileOrderSync && typeof global.ProfileOrderSync.load === 'function') {
        var list2 = global.ProfileOrderSync.load() || [];
        if (Array.isArray(list2) && list2.length) return list2.slice();
      }
    } catch (e2) {}
    try {
      var rawProf = localStorage.getItem('zhuangyan_profile_orders_v1');
      if (rawProf) {
        var prof = JSON.parse(rawProf);
        if (Array.isArray(prof) && prof.length) return prof.slice();
      }
    } catch (e3) {}
    return [];
  }

  function syncAppProfileOrdersFromAdmin() {
    try {
      if (global.ProfileOrderStore && typeof global.ProfileOrderStore.syncFromAdmin === 'function') {
        return global.ProfileOrderStore.syncFromAdmin() || loadAppProfileOrders();
      }
    } catch (e) {}
    try {
      if (global.ProfileOrderSync && typeof global.ProfileOrderSync.syncProfileOrdersFromAdmin === 'function') {
        return global.ProfileOrderSync.syncProfileOrdersFromAdmin() || loadAppProfileOrders();
      }
    } catch (e2) {}
    return loadAppProfileOrders();
  }

  /**
   * 订单源：
   * - App 端（有 ProfileOrderStore）：优先「我的 · 我的订单」
   * - 运营端：优先订单管理列表，再合并 App 个人订单
   * opts.preferApp === true/false 可强制
   */
  function loadOrders(opts) {
    opts = opts || {};
    var byId = {};
    function ingest(list, prefer) {
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        if (!o) continue;
        var id = String(o.id || o.orderId || o.orderNo || '');
        if (!id) continue;
        if (!byId[id] || prefer) byId[id] = o;
        /* 同时用 orderNo 建索引，避免 id / orderNo 不一致漏查 */
        var ono = String(o.orderNo || '');
        if (ono && ono !== id && (!byId[ono] || prefer)) byId[ono] = o;
      }
    }

    var appOrders = loadAppProfileOrders();
    var hasProfileStore = !!(global.ProfileOrderStore && typeof global.ProfileOrderStore.load === 'function');
    var preferApp = opts.preferApp === true ||
      (opts.preferApp !== false && hasProfileStore);

    if (preferApp) {
      /* App AI 客服：以「我的订单」为准，运营表只补缺 */
      ingest(appOrders, true);
      try {
        var rawAdmin = localStorage.getItem('zhuangyan_order_list_v1');
        if (rawAdmin) {
          var adminList = JSON.parse(rawAdmin);
          if (Array.isArray(adminList)) ingest(adminList, false);
        }
      } catch (e0) {}
      try {
        var rawDingdan = localStorage.getItem('zhuangyan_kefu_dingdan_v1');
        if (rawDingdan) {
          var ddList = JSON.parse(rawDingdan);
          if (Array.isArray(ddList)) {
            ingest(ddList.map(normalizeOrderRow).filter(Boolean), false);
          }
        }
      } catch (eDd) {}
      try {
        if (global.OrderStore && global.OrderStore.load && global.OrderStore !== global.ProfileOrderStore) {
          ingest(global.OrderStore.load(), false);
        }
      } catch (e) {}
    } else {
      /* 运营端：优先订单管理 */
      try {
        var rawAdmin2 = localStorage.getItem('zhuangyan_order_list_v1');
        if (rawAdmin2) {
          var adminList2 = JSON.parse(rawAdmin2);
          if (Array.isArray(adminList2)) ingest(adminList2, true);
        }
      } catch (eA) {}
      try {
        var rawDingdan2 = localStorage.getItem('zhuangyan_kefu_dingdan_v1');
        if (rawDingdan2) {
          var ddList2 = JSON.parse(rawDingdan2);
          if (Array.isArray(ddList2)) {
            ingest(ddList2.map(normalizeOrderRow).filter(Boolean), false);
          }
        }
      } catch (eDd2) {}
      try {
        if (global.OrderStore && global.OrderStore.load) {
          ingest(global.OrderStore.load(), false);
        }
      } catch (eB) {}
      ingest(appOrders, false);
    }

    var seen = {};
    var out = [];
    for (var k in byId) {
      if (!Object.prototype.hasOwnProperty.call(byId, k)) continue;
      var row = byId[k];
      var uniq = String(row.id || row.orderId || row.orderNo || k);
      if (seen[uniq]) continue;
      seen[uniq] = true;
      out.push(row);
    }
    out.sort(function (a, b) {
      var ta = Number(a.createdAt) || Date.parse(a.createdAt || a.orderTime || '') || 0;
      var tb = Number(b.createdAt) || Date.parse(b.createdAt || b.orderTime || '') || 0;
      return tb - ta;
    });
    return out;
  }

  function extractOrderId(query) {
    var q = String(query || '');
    var m = q.match(/DD\d{8,}/i);
    if (m) return m[0].toUpperCase();
    m = q.match(/\b[A-Z]{0,3}\d{12,}\b/i);
    return m ? m[0].toUpperCase() : '';
  }

  function findOrderById(orders, orderId) {
    var want = String(orderId || '').toUpperCase();
    if (!want) return null;
    for (var i = 0; i < (orders || []).length; i++) {
      var o = orders[i] || {};
      var oid = String(o.id || o.orderId || '').toUpperCase();
      var ono = String(o.orderNo || '').toUpperCase();
      if ((oid && oid === want) || (ono && ono === want)) return o;
    }
    return null;
  }

  function loadAftersales() {
    var byId = {};
    function ingest(list, prefer) {
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        var a = normalizeAftersale(list[i]);
        if (!a) continue;
        var id = String(a.id || '');
        if (!id) continue;
        if (!byId[id] || prefer) byId[id] = a;
      }
    }
    /* 优先运营售后管理 / 客服 shouhou 缓存 */
    try {
      var rawAdmin = localStorage.getItem('zhuangyan_aftersale_list_v1');
      if (rawAdmin) {
        var adminList = JSON.parse(rawAdmin);
        if (Array.isArray(adminList)) ingest(adminList, true);
      }
    } catch (e0) {}
    try {
      var rawKf = localStorage.getItem('zhuangyan_kefu_shouhou_v1');
      if (rawKf) {
        var kfList = JSON.parse(rawKf);
        if (Array.isArray(kfList)) ingest(kfList, false);
      }
    } catch (eKf) {}
    try {
      if (global.ProfileAftersaleSync && global.ProfileAftersaleSync.load) {
        ingest(global.ProfileAftersaleSync.load(), false);
      }
    } catch (e) {}
    try {
      var raw = localStorage.getItem('zhuangyan_profile_aftersales_v1');
      if (raw) {
        var p = JSON.parse(raw);
        if (Array.isArray(p)) ingest(p, false);
      }
    } catch (e2) {}
    var out = [];
    for (var k in byId) {
      if (Object.prototype.hasOwnProperty.call(byId, k)) out.push(byId[k]);
    }
    return out;
  }

  /** 兼容运营 AFTER_LIST 与库表 shouhou 行 */
  function normalizeAftersale(a) {
    if (!a || typeof a !== 'object') return null;
    if (a.shdh || (a.ddh && a.kfcljy != null)) {
      return {
        id: a.shdh || a.id || '',
        orderId: a.ddh || a.orderId || '',
        afterType: a.lx || a.afterType || '',
        userName: a.mj || a.userName || '',
        prodName: a.sp || a.prodName || '',
        status: a.zt || a.status || '',
        handler: a.clr || a.handler || '',
        remark: a.kfcljy || a.remark || '',
        reason: a.reason || ''
      };
    }
    return {
      id: a.id || '',
      orderId: a.orderId || '',
      afterType: a.afterType || a.type || '',
      userName: a.userName || '',
      prodName: a.prodName || '',
      status: a.status || '',
      handler: a.handler || '',
      remark: a.remark || '',
      reason: a.reason || ''
    };
  }

  function normalizeOrderRow(o) {
    if (!o || typeof o !== 'object') return null;
    if (o.ddh && (o.ddzt != null || o.kfgjhs != null)) {
      return {
        id: o.ddh,
        orderId: o.ddh,
        userName: o.mj || '',
        prodName: o.sp || '',
        payAmount: o.sf,
        status: o.ddzt || '',
        deliveryStatus: o.wl || '',
        delivery: o.wl || ''
      };
    }
    return o;
  }

  function findAftersaleByOrderOrId(aftersales, key) {
    var want = String(key || '').toUpperCase();
    if (!want) return null;
    for (var i = 0; i < (aftersales || []).length; i++) {
      var a = aftersales[i];
      if (String(a.id || '').toUpperCase() === want) return a;
      if (String(a.orderId || '').toUpperCase() === want) return a;
    }
    return null;
  }

  function extractAftersaleId(query) {
    var m = String(query || '').match(/SH\d{8,}/i);
    return m ? m[0].toUpperCase() : '';
  }

  function buildProductScript(p) {
    var cat = p.cat3 || p.cat2 || p.cat1 || '美妆';
    var ingredients = '';
    try {
      if (global.AiConfigStore && typeof global.AiConfigStore.buildDetailedProductIngredients === 'function') {
        ingredients = global.AiConfigStore.buildDetailedProductIngredients(p) || '';
      } else if (global.AiConfigStore && typeof global.AiConfigStore.inferGuideIngredients === 'function') {
        ingredients = global.AiConfigStore.inferGuideIngredients(p) || '';
      }
    } catch (eIng) {}
    if (!ingredients) {
      var explicit = p.ingredients || p.ingredient || p.keyIng;
      ingredients = explicit ? String(explicit) : '详见商品页成分表';
    }
    var lines = [];
    lines.push('【' + (p.name || p.title || '商品') + '】属「' + cat + '」。');
    lines.push('适用：敏感肌建议先局部试用；按自身肤质与耐受选择。');
    lines.push('用法：建议顺序洁面→水→精华→乳霜；以详情页为准。');
    lines.push('成分答法：' + String(ingredients).split('、').slice(0, 3).join('、') + '…；全成分以包装备案为准。');
    lines.push('功效以详情页为准，不做医疗承诺；深度选款可转「AI导购」。');
    lines.push('货号 ' + (p.id || p.sku || '—') + '。');
    return lines.join('');
  }

  /** 结构化商品卡（AI 客服气泡渲染） */
  function buildProductCard(p) {
    if (!p) return null;
    var name = p.name || p.title || '商品';
    var cover = p.coverUrl || p.cover || p.syncCover || p.img || p.image || '';
    if (cover && cover.indexOf('./static/products/') === 0) {
      cover = '../运营管理系统/' + cover.replace(/^\.\//, '');
    }
    if (!cover) {
      cover = resolveProductCover(p.id || p.sku || '', name);
    }
    var ingredients = p.ingredients || '';
    try {
      if (!ingredients && global.AiConfigStore) {
        if (typeof global.AiConfigStore.inferGuideIngredients === 'function') {
          ingredients = global.AiConfigStore.inferGuideIngredients(p) || '';
        }
        if ((!ingredients || ingredients.indexOf('详见') === 0) &&
            typeof global.AiConfigStore.buildDetailedProductIngredients === 'function') {
          ingredients = global.AiConfigStore.buildDetailedProductIngredients(p) || ingredients;
        }
      }
    } catch (eIng2) {}
    if (!ingredients) ingredients = '详见商品页成分表';
    return {
      id: String(p.id || p.sku || ''),
      sku: String(p.sku || p.id || ''),
      title: name,
      sub: [p.brand, p.cat3 || p.cat2 || p.cat1].filter(Boolean).join(' · ') || (p.sku || ''),
      price: String(p.price != null ? p.price : '0'),
      img: cover || '',
      brand: p.brand || '',
      status: p.status || '',
      merchant: p.merchant || '',
      cat1: p.cat1 || '',
      cat2: p.cat2 || '',
      cat3: p.cat3 || '',
      ingredients: ingredients
    };
  }

  function isKefuIngredientAsk(q) {
    try {
      if (global.AiConfigStore && typeof global.AiConfigStore.guideIsIngredientAsk === 'function') {
        return !!global.AiConfigStore.guideIsIngredientAsk(q);
      }
    } catch (e) {}
    var s = String(q || '');
    return /成分|全成分|成分表|成分解读|成分分析|成分安全|查成分|看看成分|成分怎么样|成分如何/.test(s);
  }

  function detectKefuProductCategory(q) {
    try {
      if (global.AiConfigStore && typeof global.AiConfigStore.detectGuideCategory === 'function') {
        var cat = global.AiConfigStore.detectGuideCategory(q);
        if (cat) return cat;
      }
    } catch (e) {}
    var s = String(q || '');
    var m = s.match(/面霜|乳液|口红|唇釉|唇膏|精华|洁面|洗面|面膜|防晒|粉底|眼影|腮红|卸妆|身体乳|眼霜|香水|爽肤水|化妆水/);
    return m ? { key: '', label: m[0] } : null;
  }

  /**
   * 模糊商品/成分问句：优先出商品卡（如「口红」「查成分」「精华怎么样」）
   * 排除订单/售后/权益意图，避免抢答
   */
  function isVagueProductCardAsk(q) {
    var s = String(q || '').replace(/^\s+|\s+$/g, '');
    if (!s) return false;
    if (/订单|物流|发货|退款|售后|快递|运单|转人工|优惠券怎么用|价保|运费险申请|什么时候到|到货|送达/.test(s)) return false;
    if (isKefuIngredientAsk(s)) return true;
    var cat = detectKefuProductCategory(s);
    if (!cat) return false;
    var compact = s.replace(/\s+/g, '');
    /* 仅品类 / 短问 / 浏览式模糊问法 */
    if (compact.length <= 10) return true;
    if (/有什么|哪些|推荐|查(一下)?|看看|相关|信息|怎么样|如何|介绍|成分|挑|选/.test(s)) return true;
    return compact.length <= 16;
  }

  /** 模糊成分/品类问句扩检索词 */
  function expandIngredientSearchQuery(q) {
    var s = String(q || '');
    var keys = [];
    try {
      if (global.AiConfigStore && typeof global.AiConfigStore.extractIngredientSearchKeys === 'function') {
        keys = global.AiConfigStore.extractIngredientSearchKeys(s) || [];
      }
    } catch (e) {}
    var catLabel = '';
    var cat = detectKefuProductCategory(s);
    if (cat && cat.label) catLabel = cat.label;
    if (catLabel && s.indexOf(catLabel) < 0) return catLabel + ' ' + s;
    if (keys.length) return keys.join(' ') + ' ' + s;
    if (/成分/.test(s) && s.length <= 14) {
      return (catLabel ? catLabel + ' ' : '精华 面霜 洁面 口红 ') + s;
    }
    return s;
  }

  function buildProductCardsAnswer(q, products, limit) {
    var ingAsk = isKefuIngredientAsk(q);
    var cards = pickProductCardsForKefu(q, products, limit > 0 ? limit : 3);
    if (!cards.length) {
      return {
        category: 'product',
        text: '暂时没匹配到合适商品。可补充品牌或品名，例如「烟酰胺精华的成分」「花西子口红成分」；深度选款也可转「AI导购」。',
        products: [],
        highlightIngredients: true,
        orderId: '—',
        refId: ''
      };
    }
    var tipMore;
    if (cards.length === 1) {
      tipMore = ingAsk
        ? '已为你定位到相关商品，点下方卡片可看详情与关键成分。'
        : '已为你找到相关商品，点下方卡片查看详情与关键成分。';
    } else {
      tipMore = ingAsk
        ? ('问法偏宽泛，先为你挑了 ' + cards.length + ' 款相关商品；点卡片可看详情与关键成分。也可补充品牌/品名再问。')
        : ('目前可查询到以下相关商品（优先以卡片展示）。点卡片可看详情与关键成分；补充品牌、色号或肤质后我可以讲得更细。');
    }
    return {
      category: 'product',
      text: tipMore,
      products: cards,
      highlightIngredients: true,
      orderId: '—',
      refId: cards[0].id || ''
    };
  }

  function pickProductCardsForKefu(query, products, limit) {
    var max = limit > 0 ? limit : 3;
    var searchQ = expandIngredientSearchQuery(query);
    var cards = [];
    try {
      if (global.AiConfigStore && typeof global.AiConfigStore.pickGuideProducts === 'function') {
        cards = global.AiConfigStore.pickGuideProducts(searchQ, max) || [];
      }
    } catch (ePick) { cards = []; }
    if (cards && cards.length) {
      return cards.slice(0, max).map(function (c) {
        return buildProductCard(c) || c;
      }).filter(Boolean);
    }
    /* 本地兜底：按品名/品牌/品类/成分词打分 */
    var list = products || loadProducts() || [];
    var qCompact = String(searchQ || '').replace(/\s+/g, '');
    var ranked = [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p) continue;
      var name = String(p.name || p.title || '');
      var brand = String(p.brand || '');
      var blob = [name, brand, p.cat1, p.cat2, p.cat3, p.sku].join(' ');
      var score = 0;
      if (name && String(query).indexOf(name) >= 0) score += 12;
      if (brand && String(query).indexOf(brand) >= 0) score += 6;
      var mCat = String(searchQ).match(/面霜|乳液|口红|精华|洁面|面膜|防晒|唇釉/);
      if (mCat && new RegExp(mCat[0]).test(blob)) score += 5;
      if (/烟酰胺|玻尿酸|神经酰胺|视黄醇|氨基酸|积雪草|泛醇/.test(searchQ)) {
        var ingHit = '';
        try {
          if (global.AiConfigStore && global.AiConfigStore.inferGuideIngredients) {
            ingHit = global.AiConfigStore.inferGuideIngredients(p) || '';
          }
        } catch (e3) {}
        var mIng = String(searchQ).match(/烟酰胺|玻尿酸|神经酰胺|视黄醇|氨基酸|积雪草|泛醇/);
        if (mIng && mIng[0] && new RegExp(mIng[0]).test(ingHit + blob)) {
          score += 8;
        }
      }
      if (name.length >= 4 && qCompact.indexOf(name.replace(/\s+/g, '').slice(0, 4)) >= 0) score += 3;
      if (String(p.status || '').indexOf('下架') >= 0) score -= (score > 10 ? 2 : 40);
      else score += 1;
      if (score > 0) ranked.push({ p: p, s: score });
    }
    ranked.sort(function (a, b) { return b.s - a.s; });
    var out = [];
    for (var r = 0; r < ranked.length && out.length < max; r++) {
      var card = buildProductCard(ranked[r].p);
      if (card) out.push(card);
    }
    return out;
  }

  function resolveProductCover(productId, nameHint) {
    if (!productId && !nameHint) return '';
    try {
      var list = loadProducts();
      var wantId = String(productId || '');
      var wantName = String(nameHint || '');
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p) continue;
        if (wantId && (String(p.id || '') === wantId || String(p.sku || '') === wantId)) {
          return p.cover || p.img || p.image || '';
        }
      }
      if (wantName) {
        for (var j = 0; j < list.length; j++) {
          var p2 = list[j];
          var n = String((p2 && (p2.name || p2.title)) || '');
          if (n && (n === wantName || wantName.indexOf(n) >= 0 || n.indexOf(wantName.slice(0, 8)) >= 0)) {
            return p2.cover || p2.img || p2.image || '';
          }
        }
      }
    } catch (e) {}
    return '';
  }

  /** 订单行商品（兼容运营扁平字段 / App items） */
  function getOrderLineItems(o) {
    o = o || {};
    var rows = [];
    if (o.items && o.items.length) {
      for (var i = 0; i < o.items.length; i++) {
        var it = o.items[i] || {};
        var title = it.title || it.name || it.prodName || '商品';
        var qty = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
        var price = Number(it.price != null ? it.price : it.unitPrice) || 0;
        var img = it.img || it.cover || it.prodCover || resolveProductCover(it.productId || it.id || it.sku, title);
        rows.push({
          productId: String(it.productId || it.id || it.sku || ''),
          title: title,
          img: img || '',
          price: price,
          spec: it.spec || it.subTitle || it.sku || '标准装',
          quantity: qty,
          lineTotal: Math.round(price * qty * 100) / 100
        });
      }
      return rows;
    }
    var name = o.prodName || o.title || '商品';
    var qty2 = Number(o.prodQty || o.quantity || o.itemCount) > 0
      ? Number(o.prodQty || o.quantity || o.itemCount)
      : 1;
    var unit = Number(o.unitPrice != null ? o.unitPrice : o.price) || 0;
    if (!unit && o.totalPrice != null && qty2) {
      unit = Math.round((Number(o.totalPrice) / qty2) * 100) / 100;
    }
    var cover = o.prodCover || o.cover || o.img || resolveProductCover(o.prodSku || o.sku, name);
    rows.push({
      productId: String(o.prodSku || o.sku || o.productId || ''),
      title: name,
      img: cover || '',
      price: unit,
      spec: o.spec || '—',
      quantity: qty2,
      lineTotal: Math.round(unit * qty2 * 100) / 100
    });
    return rows;
  }

  /** 结构化订单卡片数据（供 AI 客服气泡渲染） */
  function buildOrderCard(o) {
    if (!o) return null;
    var items = getOrderLineItems(o);
    var id = String(o.id || o.orderId || o.orderNo || '');
    var goodsSum = 0;
    for (var i = 0; i < items.length; i++) goodsSum += Number(items[i].lineTotal) || 0;
    var pay = o.payAmount != null ? Number(o.payAmount)
      : (o.orderAmount != null ? Number(o.orderAmount)
        : (o.totalPrice != null ? Number(o.totalPrice) : goodsSum));
    var total = o.totalPrice != null ? Number(o.totalPrice) : goodsSum;
    var stCard = o.status || '处理中';
    try {
      if (global.ProfileOrderStore && typeof global.ProfileOrderStore.getDisplayStatus === 'function') {
        stCard = global.ProfileOrderStore.getDisplayStatus(o) || stCard;
      }
    } catch (eStC) {}
    return {
      id: id,
      orderNo: String(o.orderNo || id),
      status: stCard,
      deliveryStatus: o.deliveryStatus || o.delivery || '',
      payAmount: isNaN(pay) ? 0 : pay,
      totalPrice: isNaN(total) ? goodsSum : total,
      discountPrice: Number(o.discountPrice) || 0,
      items: items
    };
  }

  function buildOrderCards(list, limit) {
    var out = [];
    var max = limit > 0 ? limit : 5;
    for (var i = 0; i < (list || []).length && out.length < max; i++) {
      var card = buildOrderCard(list[i]);
      if (card) out.push(card);
    }
    return out;
  }

  function buildOrderScript(o) {
    var id = o.id || o.orderId || o.orderNo || '';
    var name = o.prodName || o.title || (o.items && o.items[0] && (o.items[0].title || o.items[0].name)) || '商品';
    if (o.items && o.items.length > 1 && name.indexOf('等') < 0) {
      name = name + ' 等' + o.items.length + '件';
    }
    var st = o.status || '处理中';
    try {
      if (global.ProfileOrderStore && typeof global.ProfileOrderStore.getDisplayStatus === 'function') {
        st = global.ProfileOrderStore.getDisplayStatus(o) || st;
      }
    } catch (eSt) {}
    var delivery = o.deliveryStatus || o.delivery || '';
    var tip = /待发货/.test(st) ? '仓库正在备货，请稍候；急单可转人工备注加急。'
      : (/待付款/.test(st) ? '请尽快完成支付，超时可能自动取消。'
        : (/已发货|待收货/.test(st) ? ('物流：' + (delivery || '运输中') + '；异常签收请拍照反馈。')
          : (/已完成|已签收/.test(st) ? '订单已完结，如需售后可说明原因。'
            : (/退款/.test(st) ? '退款进度以售后单为准，到账渠道为原支付方式。'
              : '已为你按「我的订单」核对状态，如需帮助可继续说明。'))));
    var line = '订单 ' + id + ' 当前状态为「' + st + '」。商品「' + name + '」。';
    if (delivery && delivery !== st && !/待发货|待付款/.test(st)) {
      line += '物流状态「' + delivery + '」。';
    }
    return line + tip;
  }

  /** 是否在问快递/到货时效 */
  function isDeliveryEtaAsk(q) {
    var s = String(q || '');
    if (!s) return false;
    if (/什么时候到|何时到|啥时候到|几天到|多久到|什么时间到|什么时间能够到|何时能到|什么时候能到|几天能到|多久能到/.test(s)) return true;
    if (/到货时间|送达时间|预计.*达|什么时候送|啥时候送|几时到|哪天到/.test(s)) return true;
    if (/快递|物流|包裹/.test(s) && /什么时候|何时|多久|几天|时间|啥时候|能到|到了没|到了吗/.test(s)) return true;
    return false;
  }

  /** 是否在问物流进度（含时效） */
  function isLogisticsAsk(q) {
    var s = String(q || '');
    return isDeliveryEtaAsk(s) ||
      /物流|快递|发货|到哪|签收|运单|包裹到|查(一下)?快递|查(一下)?物流/.test(s);
  }

  /** 快递时效纯文本（下方只挂订单卡，不掺商品/成分） */
  function buildDeliveryEtaScript(o) {
    var id = o.id || o.orderId || o.orderNo || '';
    var st = o.status || '处理中';
    try {
      if (global.ProfileOrderStore && typeof global.ProfileOrderStore.getDisplayStatus === 'function') {
        st = global.ProfileOrderStore.getDisplayStatus(o) || st;
      }
    } catch (eSt) {}
    var delivery = String(o.deliveryStatus || o.delivery || '');
    var blob = st + ' ' + delivery;

    if (/待付款|未支付/.test(blob)) {
      return '订单 ' + id + ' 尚未付款。付款并发货后才会产生物流时效：一般发出后普通快递约 1–3 个工作日送达，偏远地区约 3–5 天，具体以物流更新为准。';
    }
    if (/待发货|备货/.test(blob) && !/已发货|待收货|派送|揽收|运输|在途|签收/.test(delivery)) {
      return '订单 ' + id + ' 当前为「待发货」，仓库备货中。通常付款后 48 小时内发出；发出后普通快递约 1–3 个工作日送达（偏远地区 3–5 天）。有轨迹后可再问我查进度。';
    }
    if (/已签收|签收成功|本人签收/.test(blob) || (/已完成/.test(st) && /签收/.test(delivery))) {
      return '订单 ' + id + ' 物流显示已签收/已完成，无需再等待派送。若未实际收到，可说明情况或申请售后。';
    }
    if (/派送中|派件|正在派送/.test(blob)) {
      return '订单 ' + id + ' 当前「派送中」，一般当天或次日可签收；请保持电话畅通，也可联系快递员约定时间。';
    }
    if (/已发货|待收货|已揽收|运输中|在途|中转|干线/.test(blob)) {
      return '订单 ' + id + ' 物流状态为「' + (delivery || st) + '」。按当前进度，预计 1–3 个工作日送达（同城/邻近城市往往更快）。请以物流轨迹为准，下方为对应订单。';
    }
    if (/退款|售后|关闭|取消/.test(blob)) {
      return '订单 ' + id + ' 当前为「' + st + '」，暂无正常派送时效。如需查退款或售后进度可直接说明。';
    }
    return '订单 ' + id + ' 当前状态「' + st + '」'
      + (delivery ? '，物流「' + delivery + '」' : '')
      + '。普通快递发出后一般 1–3 个工作日送达，偏远地区可能更久，请以物流更新为准。';
  }

  function wrapOrderAnswer(orderHit, textOverride) {
    var card = buildOrderCard(orderHit);
    return {
      category: 'order',
      text: textOverride || buildOrderScript(orderHit),
      orderId: (card && card.id) || orderHit.id || orderHit.orderId || '—',
      refId: (card && card.id) || orderHit.id || orderHit.orderId || '',
      order: card,
      orders: card ? [card] : [],
      products: []
    };
  }

  function buildAftersaleScript(a) {
    if (a.remark) {
      return '售后单 ' + (a.id || '') + '（关联订单 ' + (a.orderId || '—') + '）：' + String(a.remark);
    }
    return '售后单 ' + (a.id || '') + '，关联订单 ' + (a.orderId || '—')
      + '，类型「' + (a.afterType || a.type || '') + '」，状态「' + (a.status || '') + '」。'
      + '商品「' + (a.prodName || '—') + '」。处理人：' + (a.handler || '待分配') + '。';
  }

  /** 结构化售后卡片（AI 客服气泡渲染） */
  function buildAftersaleCard(a) {
    if (!a) return null;
    var id = String(a.id || a.aftersaleId || '');
    var name = a.prodName || a.title || '商品';
    var cover = a.prodCover || a.cover || a.img || a.image || '';
    if (!cover) {
      cover = resolveProductCover(a.prodSku || a.sku || a.productId || '', name);
    }
    if (cover && cover.indexOf('./static/products/') === 0) {
      cover = '../运营管理系统/' + cover.replace(/^\.\//, '');
    }
    var amount = a.amount != null ? Number(a.amount)
      : (a.refundAmount != null ? Number(a.refundAmount) : 0);
    return {
      id: id,
      aftersaleId: id,
      orderId: String(a.orderId || a.orderNo || ''),
      afterType: a.afterType || a.type || '售后',
      status: a.status || '处理中',
      reason: a.reason || '',
      prodName: name,
      prodSpec: a.prodSpec || a.spec || '',
      img: cover || '',
      amount: isNaN(amount) ? 0 : amount,
      handler: a.handler || '待分配',
      remark: a.remark || '',
      refundMethod: a.refundMethod || '',
      applyTime: a.applyTime || '',
      handleTime: a.handleTime || ''
    };
  }

  function buildAftersaleCards(list, limit) {
    var out = [];
    var max = limit > 0 ? limit : 3;
    for (var i = 0; i < (list || []).length && out.length < max; i++) {
      var card = buildAftersaleCard(list[i]);
      if (card) out.push(card);
    }
    return out;
  }

  function wrapAftersaleAnswer(afHit, textOverride) {
    var card = buildAftersaleCard(afHit);
    var brief = textOverride;
    if (!brief) {
      brief = card
        ? ('已为你查到售后单「' + (card.id || '') + '」，进度如下：')
        : buildAftersaleScript(afHit);
    }
    return {
      category: 'aftersale',
      text: brief,
      orderId: (card && card.orderId) || afHit.orderId || '—',
      refId: (card && card.id) || afHit.id || '',
      aftersale: card,
      aftersales: card ? [card] : [],
      type: (card && card.afterType) || afHit.afterType || '售后',
      status: (card && card.status) || afHit.status || '',
      agent: (card && card.handler) || afHit.handler || ''
    };
  }

  function buildBenefitScript(o) {
    var act = o.activityType || '优惠';
    return '该单享受「' + act + '」优惠 ¥' + fmtPrice(o.discountPrice || 0) + '。券/积分以账户明细为准，过期不补发；规则以结算页为准。';
  }

  function loadBenefits() {
    var rows = [];
    try {
      var raw = localStorage.getItem('zhuangyan_kefu_quanyi_v1');
      if (raw) {
        var list = JSON.parse(raw);
        if (Array.isArray(list)) rows = list.slice();
      }
    } catch (e) {}
    return rows.map(function (r) {
      return {
        id: r.qyid || r.id || '',
        benefitType: r.qylx || r.benefitType || '',
        user: r.yh || r.user || '',
        refId: r.gldh || r.refId || '',
        content: r.glnr || r.content || '',
        amount: r.yhje != null ? r.yhje : (r.amount || 0),
        script: r.kfdyd || r.script || ''
      };
    });
  }

  function matchBenefitRows(query, rows) {
    var q = String(query || '');
    var hits = [];
    for (var i = 0; i < (rows || []).length; i++) {
      var r = rows[i];
      var score = 0;
      var type = String(r.benefitType || '');
      var content = String(r.content || '');
      var blob = [type, content, r.user, r.refId, r.script].join(' ');
      if (/优惠券|怎么用券|用券|领券|消费券/.test(q) && /优惠券|券/.test(type + content)) score += 8;
      if (/积分|兑换/.test(q) && /积分/.test(type + content)) score += 8;
      if (/会员|折扣|等级|省钱卡/.test(q) && /会员|省钱卡/.test(type + content)) score += 8;
      if (/新人|首单|新客/.test(q) && /新人/.test(type + content)) score += 8;
      if (/满减|满赠|买赠/.test(q) && /满减|满赠|买赠/.test(type + content)) score += 6;
      if (/拼团|拼单|成团/.test(q) && /拼团/.test(type + content)) score += 8;
      if (/秒杀|抢购|限时/.test(q) && /秒杀|限时/.test(type + content)) score += 8;
      if (/补贴|百亿|官方立减/.test(q) && /补贴|立减/.test(type + content)) score += 8;
      if (/价保|贵就赔|买贵/.test(q) && /价保|贵就赔|买贵/.test(type + content)) score += 8;
      if (/七天|无理由|退货/.test(q) && /七天|无理由|退货/.test(type + content)) score += 8;
      if (/极速退|秒退/.test(q) && /极速退|秒退/.test(type + content)) score += 8;
      if (/运费险|运费补贴|退货运费/.test(q) && /运费/.test(type + content)) score += 8;
      if (/坏单|破损|少件|包赔/.test(q) && /坏单|破损|少件|包赔/.test(type + content)) score += 8;
      if (/晚发|超时发货/.test(q) && /晚发|超时/.test(type + content)) score += 8;
      if (/正品|假一赔|真伪/.test(q) && /正品|假一赔/.test(type + content)) score += 8;
      if (/包邮|免运费/.test(q) && /包邮/.test(type + content)) score += 8;
      if (/权益|福利|保障/.test(q)) score += 3;
      if (type && q.indexOf(type) >= 0) score += 10;
      if (r.refId && q.indexOf(String(r.refId)) >= 0) score += 12;
      if (score > 0) hits.push({ score: score, row: r });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits;
  }

  /**
   * 按运营知识库管理同口径：产品 / 订单 / 售后 / 权益 检索答疑
   * bags 可选：{ products, orders, aftersales, benefits }
   */
  function answerFromKnowledge(query, bags) {
    var q = String(query || '');
    if (!q) return null;
    bags = bags || {};
    var products = bags.products || loadProducts();
    var orders = bags.orders || loadOrders({ preferApp: bags.preferApp });
    var aftersales = bags.aftersales || loadAftersales();
    var benefits = bags.benefits || loadBenefits();

    /* 订单号 / 售后单号 —— 同时查订单管理 + 售后管理 */
    var oidInQ = extractOrderId(q);
    var shInQ = extractAftersaleId(q);
    var orderHit = null;

    if (shInQ || oidInQ) {
      var afByKey = findAftersaleByOrderOrId(aftersales, shInQ || oidInQ);
      if (afByKey) {
        return wrapAftersaleAnswer(afByKey);
      }
    }

    if (oidInQ) {
      orderHit = findOrderById(orders, oidInQ);
      if (orderHit) {
        if (isDeliveryEtaAsk(q)) {
          return wrapOrderAnswer(orderHit, buildDeliveryEtaScript(orderHit));
        }
        return wrapOrderAnswer(orderHit);
      }
      return {
        category: 'order',
        text: '未在订单/售后系统查到单号 ' + oidInQ + '。请核对订单号或售后单号（SH 开头）后重试，也可回复「转人工」。',
        orderId: oidInQ,
        refId: oidInQ,
        orders: [],
        products: []
      };
    }
    if (shInQ) {
      return {
        category: 'aftersale',
        text: '未在售后系统查到售后单号 ' + shInQ + '。请核对后重试，或回复「转人工」。',
        orderId: '—',
        refId: shInQ
      };
    }

    /* 发送订单：列出可选订单卡片供用户点选 */
    if (/^发送订单$|选择订单|我要发订单/.test(q.replace(/\s+/g, ''))) {
      var pickCards = buildOrderCards(orders, 5);
      if (!pickCards.length) {
        return {
          category: 'order',
          text: '暂未查到可发送的订单。下单后可在「我的订单」查看，或直接发送订单号。',
          orderId: '—',
          refId: '',
          orders: []
        };
      }
      return {
        category: 'order',
        text: '请选择要发送的订单（点击卡片即可）：',
        orderId: pickCards[0].id || '—',
        refId: pickCards[0].id || '',
        orders: pickCards,
        pickable: true
      };
    }

    var multiHits = [];
    var logiAsk = isLogisticsAsk(q);
    var etaAsk = isDeliveryEtaAsk(q);
    for (var oi = 0; oi < orders.length; oi++) {
      var o = orders[oi];
      var oid = String(o.id || o.orderId || o.orderNo || '');
      var ono = String(o.orderNo || '');
      if (oid && q.indexOf(oid) >= 0) { orderHit = o; break; }
      if (ono && ono !== oid && q.indexOf(ono) >= 0) { orderHit = o; break; }
      var pname = String(o.prodName || o.title || '');
      if (!pname && o.items && o.items[0]) {
        pname = String(o.items[0].title || o.items[0].name || '');
      }
      if (logiAsk && pname && pname.length >= 4 && q.indexOf(pname.slice(0, 4)) >= 0) {
        orderHit = o; break;
      }
    }
    if (!orderHit && (logiAsk || /我的订单|查一下订单|订单到哪|订单状态|查询订单|查订单/.test(q)) && orders.length) {
      if (etaAsk || logiAsk) {
        /* 时效/物流：优先在途/待收货单，否则最近一笔 */
        var prefer = null;
        for (var pi = 0; pi < orders.length; pi++) {
          var po = orders[pi] || {};
          var pst = String(po.status || '') + ' ' + String(po.deliveryStatus || po.delivery || '');
          if (/待收货|已发货|派送|运输|揽收|在途/.test(pst)) { prefer = po; break; }
        }
        orderHit = prefer || orders[0];
        multiHits = [];
      } else if (/我的订单|查询订单|查订单|查一下订单|订单状态/.test(q)) {
        multiHits = orders.slice(0, 3);
        orderHit = multiHits[0];
      } else {
        orderHit = orders[0];
      }
    }
    if (!orderHit && (logiAsk || /我的订单|查一下订单|订单到哪|订单状态|查询订单|查订单/.test(q)) && !orders.length) {
      return {
        category: 'order',
        text: etaAsk
          ? '「我的订单」里暂时没有可查物流的订单。下单发货后即可查询预计送达时间。'
          : '「我的订单」里暂时没有订单。下单并支付后会出现在这里，也可发送订单号再查。',
        orderId: '—',
        refId: '',
        orders: [],
        products: []
      };
    }
    if (orderHit && (logiAsk || /订单|状态|查询/.test(q))) {
      /* 快递时效：纯文本 + 仅对应一笔订单卡 */
      if (etaAsk) {
        return wrapOrderAnswer(orderHit, buildDeliveryEtaScript(orderHit));
      }
      if (multiHits.length > 1 && !logiAsk) {
        var cards = buildOrderCards(multiHits, 3);
        return {
          category: 'order',
          text: '为你查到最近 ' + cards.length + ' 笔订单，详情如下：',
          orderId: cards[0].id || '—',
          refId: cards[0].id || '',
          order: cards[0],
          orders: cards,
          products: []
        };
      }
      /* 查物流（非时效）：文本说明 + 单笔订单卡 */
      if (logiAsk) {
        return wrapOrderAnswer(orderHit);
      }
      return wrapOrderAnswer(orderHit);
    }

    /* 售后 / 退款（关键词或商品名命中售后） */
    var afHit = null;
    for (var ai = 0; ai < aftersales.length; ai++) {
      var a = aftersales[ai];
      if ((a.id && q.indexOf(a.id) >= 0) || (a.orderId && q.indexOf(a.orderId) >= 0)) {
        afHit = a; break;
      }
      var apn = String(a.prodName || '');
      if (apn.length >= 6) {
        var piece = apn.replace(/\s+/g, '').slice(0, 8);
        if (piece && q.replace(/\s+/g, '').indexOf(piece) >= 0) { afHit = a; break; }
      }
    }
    if (!afHit && /退款|售后|退货|换货|仅退款/.test(q) && aftersales.length) {
      afHit = aftersales[0];
    }
    if (afHit && (/退款|售后|退货|换货|进度/.test(q) || (afHit.prodName && q.replace(/\s+/g, '').indexOf(String(afHit.prodName).replace(/\s+/g, '').slice(0, 6)) >= 0))) {
      return wrapAftersaleAnswer(afHit);
    }

    /* 权益 —— 优先运营「知识库管理·权益 / quanyi」话术 */
    if (/优惠券|积分|会员|权益|折扣|满减|满赠|新人|兑换|怎么用券|领券|福利|价保/.test(q)) {
      var benHits = matchBenefitRows(q, benefits);
      if (benHits.length) {
        var top = benHits[0].row;
        var text = top.script;
        if (!text) {
          text = '【' + (top.benefitType || '权益') + '】' + (top.content || '')
            + (Number(top.amount) > 0 ? ('，优惠约 ¥' + fmtPrice(top.amount)) : '')
            + '。详情以账户/结算页为准。';
        }
        if (benHits.length > 1 && /权益|福利|有哪些/.test(q)) {
          var more = [];
          for (var mi = 0; mi < benHits.length && mi < 4; mi++) {
            more.push((mi + 1) + '. ' + (benHits[mi].row.benefitType || '') + ' · ' + (benHits[mi].row.content || ''));
          }
          text = '为你查到相关权益说明：\n' + more.join('\n') + '\n\n' + text;
        }
        return {
          category: 'benefit',
          text: text,
          orderId: top.refId || '—',
          refId: top.id || top.refId || ''
        };
      }
      var benOrder = null;
      for (var bi = 0; bi < orders.length; bi++) {
        if (Number(orders[bi].discountPrice) > 0 || /会员|券|满减|新人/.test(String(orders[bi].activityType || ''))) {
          benOrder = orders[bi];
          break;
        }
      }
      if (benOrder) {
        return {
          category: 'benefit',
          text: buildBenefitScript(benOrder),
          orderId: benOrder.id || '—',
          refId: benOrder.id || ''
        };
      }
      return {
        category: 'benefit',
        text: '可咨询的常见权益含：新人礼、优惠券、满减满赠、拼团/秒杀、平台补贴、积分兑换、会员折扣、价保、七天无理由、极速退款、运费险、坏单包赔、晚发即赔、正品保障、包邮等。也可直接问：「优惠券怎么用」「价保怎么申请」「七天无理由」「运费险」。',
        orderId: '—',
        refId: ''
      };
    }

    /* 成分问句 / 模糊品类（如「口红」「查成分」）：优先商品卡牌 */
    if (isVagueProductCardAsk(q)) {
      return buildProductCardsAnswer(q, products, 3);
    }

    /* 产品解答 —— 模糊匹配品名片段；命中时附商品卡 */
    var prodHit = null;
    var best = 0;
    var qCompact = q.replace(/\s+/g, '');
    for (var pi = 0; pi < products.length; pi++) {
      var p = products[pi];
      var name = String(p.name || p.title || '');
      var brand = String(p.brand || '');
      var nameCompact = name.replace(/\s+/g, '');
      var score = 0;
      if (name && q.indexOf(name) >= 0) score += 10;
      else if (nameCompact && qCompact.indexOf(nameCompact) >= 0) score += 10;
      else if (nameCompact.length >= 6) {
        for (var len = Math.min(10, nameCompact.length); len >= 5; len--) {
          if (qCompact.indexOf(nameCompact.slice(0, len)) >= 0 ||
              qCompact.indexOf(nameCompact.slice(-len)) >= 0) {
            score += 5;
            break;
          }
        }
      }
      if (brand && q.indexOf(brand) >= 0) score += 4;
      else if (brand.length >= 2 && q.indexOf(brand.slice(1)) >= 0) score += 2;
      if (/面霜|乳液|口红|精华|洁面|面膜|防晒|唇釉|粉底/.test(q)) {
        var catBlob = [p.cat3, p.cat2, p.name].join(' ');
        var mCat = q.match(/面霜|乳液|口红|精华|洁面|面膜|防晒|唇釉|粉底/);
        if (mCat && new RegExp(mCat[0]).test(catBlob)) score += 3;
      }
      if (score > best) { best = score; prodHit = p; }
    }
    /* 明确点到单品：话术 + 单卡；弱匹配（仅品类分）仍出多卡 */
    if (prodHit && best >= 4) {
      var oneCard = buildProductCard(prodHit);
      return {
        category: 'product',
        text: buildProductScript(prodHit),
        products: oneCard ? [oneCard] : [],
        highlightIngredients: true,
        orderId: '—',
        refId: prodHit.id || prodHit.sku || ''
      };
    }
    if (prodHit && best >= 3) {
      return buildProductCardsAnswer(q, products, 3);
    }

    if (/转人工|人工客服/.test(q)) {
      return {
        category: 'human',
        text: '已为你登记转人工客服。工作时间客服将尽快接入；也可先提供订单号，方便人工更快处理。',
        orderId: '—',
        refId: '',
        status: '待接入',
        type: '转人工',
        agent: '未分配'
      };
    }

    return null;
  }

  function requestSync() {
    /* 向工作台要一份合并后的权威快照；不再对本页/BC 发 REQUEST 以免旧数据回灌 */
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: REQUEST_MSG, source: 'kefu-store' }, '*');
      }
    } catch (e0) {}
  }

  /** 从 MySQL 客服四表拉取到 localStorage，供 App 查询售后/订单
   *  asyncMode === false → 同步；true → 异步（可传 onDone）
   */
  function pullKnowledgeFromApi(asyncMode, onDone) {
    var API = (global.MEILIXIUXING_API || 'http://localhost:3789').replace(/\/$/, '');
    function apply(data) {
      if (!data || data.ok === false) return false;
      try {
        if (Array.isArray(data.shouhou)) {
          localStorage.setItem('zhuangyan_kefu_shouhou_v1', JSON.stringify(data.shouhou));
        }
        if (Array.isArray(data.dingdan)) {
          localStorage.setItem('zhuangyan_kefu_dingdan_v1', JSON.stringify(data.dingdan));
        }
        if (Array.isArray(data.chanpinjieda)) {
          localStorage.setItem('zhuangyan_kefu_chanpinjieda_v1', JSON.stringify(data.chanpinjieda));
        }
        if (Array.isArray(data.quanyi)) {
          localStorage.setItem('zhuangyan_kefu_quanyi_v1', JSON.stringify(data.quanyi));
        }
      } catch (e) {}
      return true;
    }
    function finish(ok, data) {
      try { if (typeof onDone === 'function') onDone(!!ok, data || null); } catch (eCb) {}
      return !!ok;
    }
    try {
      if (asyncMode === false) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', API + '/api/kefu/knowledge', false);
        xhr.send(null);
        if (xhr.status >= 200 && xhr.status < 300) {
          var syncData = JSON.parse(xhr.responseText || '{}');
          return finish(apply(syncData), syncData);
        }
        return finish(false, null);
      }
      var xhr2 = new XMLHttpRequest();
      xhr2.open('GET', API + '/api/kefu/knowledge', true);
      xhr2.onload = function () {
        try {
          var data = JSON.parse(xhr2.responseText || '{}');
          finish(xhr2.status >= 200 && xhr2.status < 300 && apply(data), data);
        } catch (e2) {
          finish(false, null);
        }
      };
      xhr2.onerror = function () { finish(false, null); };
      xhr2.send(null);
      return true;
    } catch (err) {
      return finish(false, null);
    }
  }

  /**
   * 回答前实时重载：客服四表（MySQL）+ 可选 app_store（DbBridge）
   * done(ok) 在刷新完成后回调；timeoutMs 默认 2500
   */
  function refreshLive(done, timeoutMs) {
    var pending = 2;
    var finished = false;
    var anyOk = false;
    function tick(ok) {
      if (ok) anyOk = true;
      pending -= 1;
      if (pending > 0 || finished) return;
      finished = true;
      try { if (typeof done === 'function') done(anyOk); } catch (e) {}
    }
    try {
      pullKnowledgeFromApi(true, function (ok) { tick(ok); });
    } catch (e1) {
      tick(false);
    }
    try {
      if (global.DbBridge && typeof global.DbBridge.pull === 'function') {
        global.DbBridge.pull().then(function () { tick(true); }).catch(function () { tick(false); });
      } else {
        tick(false);
      }
    } catch (e2) {
      tick(false);
    }
    var wait = timeoutMs != null ? Number(timeoutMs) : 2500;
    if (!(wait > 0)) wait = 2500;
    setTimeout(function () {
      if (finished) return;
      finished = true;
      try { if (typeof done === 'function') done(anyOk); } catch (e3) {}
    }, wait);
  }

  /** 同步强制拉库（阻塞，适合必须立刻用最新数据时） */
  function refreshLiveSync() {
    var okKf = false;
    try { okKf = !!pullKnowledgeFromApi(false); } catch (e) {}
    var okDb = false;
    try {
      if (global.DbBridge && typeof global.DbBridge.pullSync === 'function') {
        global.DbBridge.pullSync();
        okDb = true;
      }
    } catch (e2) {}
    return okKf || okDb;
  }

  function answerFromKnowledgeLive(query, bags, done) {
    refreshLive(function () {
      var hit = null;
      try { hit = answerFromKnowledge(query, bags); } catch (e) { hit = null; }
      if (typeof done === 'function') done(hit);
    });
  }

  try {
    pullKnowledgeFromApi(true);
  } catch (ePull) {}

  function applyRemote(list) {
    if (!Array.isArray(list)) return load();
    var local = [];
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) local = parsed;
      }
    } catch (e) {}
    if (!local.length && memoryList && memoryList.length) local = memoryList;
    var merged = mergeSessionLists(local, list);
    return save(merged, { silent: true });
  }

  try {
    if (global.addEventListener) {
      global.addEventListener('storage', function (ev) {
        if (!ev || ev.key !== STORAGE_KEY) return;
        memoryList = null;
        try {
          global.dispatchEvent(new CustomEvent('kefu-session-updated', { detail: load() }));
        } catch (e) {}
      });
      global.addEventListener('message', function (ev) {
        var data = ev && ev.data;
        if (!data) return;
        if (data.type === SYNC_MSG && Array.isArray(data.payload)) {
          applyRemote(data.payload);
          try {
            global.dispatchEvent(new CustomEvent('kefu-session-updated', { detail: load() }));
          } catch (e) {}
        }
        /* 仅响应工作台发起的拉取；不对任意 REQUEST 回推，降低旧快照覆盖风险 */
        if (data.type === REQUEST_MSG && data.source === 'workspace') {
          broadcast(load());
        }
      });
    }
  } catch (eBoot) {}

  global.KefuStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    invalidate: invalidate,
    mergeSessionLists: mergeSessionLists,
    broadcast: broadcast,
    requestSync: requestSync,
    applyRemote: applyRemote,
    ensureSession: ensureSession,
    upsertSession: upsertSession,
    appendMessage: appendMessage,
    updateSession: updateSession,
    findById: findById,
    answerFromKnowledge: answerFromKnowledge,
    answerFromKnowledgeLive: answerFromKnowledgeLive,
    extractOrderId: extractOrderId,
    extractAftersaleId: extractAftersaleId,
    loadOrders: loadOrders,
    loadAppProfileOrders: loadAppProfileOrders,
    syncAppProfileOrdersFromAdmin: syncAppProfileOrdersFromAdmin,
    loadAftersales: loadAftersales,
    loadBenefits: loadBenefits,
    pullKnowledgeFromApi: pullKnowledgeFromApi,
    refreshLive: refreshLive,
    refreshLiveSync: refreshLiveSync,
    buildProductScript: buildProductScript,
    buildProductCard: buildProductCard,
    pickProductCardsForKefu: pickProductCardsForKefu,
    isKefuIngredientAsk: isKefuIngredientAsk,
    isVagueProductCardAsk: isVagueProductCardAsk,
    isDeliveryEtaAsk: isDeliveryEtaAsk,
    isLogisticsAsk: isLogisticsAsk,
    buildDeliveryEtaScript: buildDeliveryEtaScript,
    buildOrderScript: buildOrderScript,
    buildOrderCard: buildOrderCard,
    buildOrderCards: buildOrderCards,
    getOrderLineItems: getOrderLineItems,
    buildAftersaleScript: buildAftersaleScript,
    buildAftersaleCard: buildAftersaleCard,
    buildAftersaleCards: buildAftersaleCards,
    wrapAftersaleAnswer: wrapAftersaleAnswer,
    buildBenefitScript: buildBenefitScript
  };
})(typeof window !== 'undefined' ? window : this);
