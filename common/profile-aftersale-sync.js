/**
 * App「我的订单」售后 ↔ 运营「售后管理」闭环同步
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_profile_aftersales_v1';
  var SYNC_MSG = 'profile-aftersale-sync';
  var REQUEST_MSG = 'profile-aftersale-request-sync';
  var UPDATE_EVT = 'profile-aftersale-updated';

  var DEFAULT_USER = {
    id: 'U20240076',
    nickname: '野稗子',
    avatarBg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)',
    avatarText: '野'
  };

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatApplyTime(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function formatAfterId(ts) {
    var d = new Date(ts || Date.now());
    var rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return 'SH' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + rand;
  }

  function refundMethodFromPay(payMethod) {
    var m = String(payMethod || '');
    if (m.indexOf('支付宝') >= 0) return { refundMethod: '支付宝', refundKey: 'alipay' };
    if (m.indexOf('银行卡') >= 0) return { refundMethod: '银行卡', refundKey: 'card' };
    if (m.indexOf('余额') >= 0) return { refundMethod: '余额', refundKey: 'balance' };
    if (m.indexOf('微信') >= 0) return { refundMethod: '微信', refundKey: 'wechat' };
    return { refundMethod: '原路退回', refundKey: 'original' };
  }

  function buildProdName(items) {
    if (!items || !items.length) return '商品';
    var first = items[0];
    if (items.length === 1) return first.title || '商品';
    return (first.title || '商品') + ' 等' + items.length + '件';
  }

  var BRAND_MERCHANT = {
    'SK-II': 'SK-II奢享汇',
    'Lancôme': '兰蔻官方授权店',
    '雅诗兰黛': '海蓝精选',
    '花西子': '花西子国风旗舰店',
    '完美日记': '完美日记品牌店',
    '阅己自研': '完美日记品牌店',
    '自然堂': '自然堂生活美学馆',
    'L\'Oréal Paris': '欧莱雅集团官方店',
    '欧莱雅': '欧莱雅集团官方店',
    '修丽可': '修丽可官方旗舰店',
    '珂润': '珂润敏感肌护理店',
    '海蓝之谜': '海蓝精选',
    '荔萌': '优品美妆专营店'
  };
  var DEMO_PROVINCES = ['上海市', '浙江省', '广东省', '北京市', '四川省', '江苏省', '湖北省', '陕西省', '重庆市', '湖南省'];
  var DEMO_WAREHOUSES = ['华东售后仓', '华南售后仓', '华北售后仓', '西南售后仓'];

  function hashPick(seed, arr) {
    var h = 0;
    var s = String(seed || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  }

  function normalizeOpsCoverPath(src) {
    if (!src) return '';
    return String(src)
      .replace(/^\.\.\/运营管理系统\//, './')
      .replace(/^运营管理系统\//, './')
      .replace(/^\.\.\/\.\.\/运营管理系统\//, './');
  }

  function inferCat1(name, brand) {
    var n = String(name || '') + ' ' + String(brand || '');
    if (/口红|唇釉|眼影|气垫|粉底|彩妆|散粉/i.test(n)) return '彩妆';
    return '护肤';
  }

  function cloneAftersale(row) {
    row = row || {};
    return {
      id: row.id,
      orderId: row.orderId || '',
      afterType: row.afterType || '仅退款',
      afterTypeKey: row.afterTypeKey || 'refund',
      reason: row.reason || 'App申请退款',
      prodName: row.prodName || '',
      prodSpec: row.prodSpec || '',
      prodSku: row.prodSku || '',
      prodCover: normalizeOpsCoverPath(row.prodCover || ''),
      prodMerchant: row.prodMerchant || '阅己美妆旗舰店',
      brand: row.brand || '',
      cat1: row.cat1 || '',
      userName: row.userName || DEFAULT_USER.nickname,
      userId: row.userId || DEFAULT_USER.id,
      userAvatarBg: row.userAvatarBg || DEFAULT_USER.avatarBg,
      userAvatarText: row.userAvatarText || DEFAULT_USER.avatarText,
      amount: row.amount != null ? Number(row.amount) : 0,
      refundAmount: row.refundAmount != null ? Number(row.refundAmount) : 0,
      applyTime: row.applyTime || formatApplyTime(),
      status: row.status || '退款中',
      statusKey: row.statusKey || 'refunding',
      handler: row.handler || '',
      handleTime: row.handleTime || '',
      proof: Array.isArray(row.proof) ? row.proof.slice() : [],
      refundMethod: row.refundMethod || '',
      refundKey: row.refundKey || '',
      remark: row.remark || '',
      channel: row.channel || 'App申请',
      priority: row.priority || '普通',
      warehouse: row.warehouse || '',
      province: row.province || '',
      expressNo: row.expressNo || '—',
      slaHours: row.slaHours != null ? Number(row.slaHours) : 24,
      coverPrompt: row.coverPrompt || '',
      _fromProfile: row._fromProfile !== false,
      _profileOrderId: row._profileOrderId || '',
      _profileAftersaleId: row._profileAftersaleId || row.id || '',
      _prevStatus: row._prevStatus || '',
      _prevStatusKey: row._prevStatusKey || ''
    };
  }

  function mapOrderToAftersaleRow(order, user) {
    user = user || DEFAULT_USER;
    if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.DEFAULT_USER) {
      user = user || ProfileOrderSync.DEFAULT_USER;
    }
    var items = order.items || [];
    var first = items[0] || {};
    var refund = refundMethodFromPay(order.payMethod);
    var applyTs = order.refundAppliedAt || Date.now();
    var oid = String(order.orderNo || order.id || '');
    var brand = first.brand || '';
    var merchant = first.merchant || BRAND_MERCHANT[brand] || '阅己美妆旗舰店';
    var prodName = buildProdName(items);
    var prodSku = String(first.productId || first.id || first.sku || '');
    var cover = normalizeOpsCoverPath(first.img || '');
    if (!cover && prodSku) {
      var slug = prodSku.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (slug) cover = './static/products/' + slug + '.jpg';
    }
    return cloneAftersale({
      id: order.aftersaleId || formatAfterId(applyTs),
      orderId: oid,
      afterType: '仅退款',
      afterTypeKey: 'refund',
      reason: order.refundReason || 'App申请退款',
      prodName: prodName,
      prodSpec: first.spec || first.subTitle || first.sku || '标准装',
      prodSku: prodSku,
      prodCover: cover,
      prodMerchant: merchant,
      brand: brand || '',
      cat1: first.cat1 || inferCat1(prodName, brand),
      userName: user.nickname || DEFAULT_USER.nickname,
      userId: user.id || DEFAULT_USER.id,
      userAvatarBg: user.avatarBg || DEFAULT_USER.avatarBg,
      userAvatarText: user.avatarText || DEFAULT_USER.avatarText,
      amount: Number(order.totalPrice) || 0,
      refundAmount: 0,
      applyTime: formatApplyTime(applyTs),
      status: '退款中',
      statusKey: 'refunding',
      handler: '',
      handleTime: '',
      proof: [],
      refundMethod: refund.refundMethod,
      refundKey: refund.refundKey,
      remark: 'App个人中心 · 买家申请退款，待运营审核处理。',
      channel: 'App申请',
      priority: Number(order.totalPrice) > 1000 ? '加急' : '普通',
      warehouse: hashPick(oid + 'w', DEMO_WAREHOUSES),
      province: order.province || hashPick(oid + 'p', DEMO_PROVINCES),
      expressNo: '—',
      slaHours: 24,
      coverPrompt: prodName + ' beauty cosmetics product photography white background',
      _fromProfile: true,
      _profileOrderId: String(order.id || ''),
      _profileAftersaleId: String(order.aftersaleId || ''),
      _prevStatus: order._prevStatus || order.status || '',
      _prevStatusKey: order._prevStatusKey || order.statusKey || ''
    });
  }

  function loadProfileAftersales() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(cloneAftersale);
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, aftersales: list || loadProfileAftersales() };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent(UPDATE_EVT, { detail: payload.aftersales }));
    } catch (e2) { /* ignore */ }
  }

  function saveProfileAftersales(list, opts) {
    var snapshot = (list || []).map(cloneAftersale);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    if (!(opts && opts.silent)) broadcast(snapshot);
    return snapshot;
  }

  function requestSync() {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: REQUEST_MSG }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  function upsertFromRefundOrder(order, user) {
    if (!order) return null;
    var list = loadProfileAftersales();
    var pid = String(order.id || '');
    var orderNo = String(order.orderNo || '');
    var existingIdx = -1;
    var i;
    for (i = 0; i < list.length; i++) {
      if (String(list[i]._profileOrderId) === pid || String(list[i].orderId) === orderNo) {
        existingIdx = i;
        break;
      }
    }
    var payload = Object.assign({}, order, {
      refundAppliedAt: order.refundAppliedAt || Date.now(),
      aftersaleId: existingIdx >= 0 ? list[existingIdx].id : (order.aftersaleId || undefined),
      _prevStatus: order._prevStatus || order.status,
      _prevStatusKey: order._prevStatusKey || order.statusKey
    });
    var row = mapOrderToAftersaleRow(payload, user);
    row._profileAftersaleId = row.id;
    if (existingIdx >= 0) {
      // 保留运营已写入的处理信息（若仍在处理中可覆盖状态为退款中）
      var old = list[existingIdx];
      if (old.handler) row.handler = old.handler;
      if (old.handleTime && old.statusKey !== 'refunding') row.handleTime = old.handleTime;
      list[existingIdx] = row;
    } else {
      list.unshift(row);
    }
    saveProfileAftersales(list);
    return row;
  }

  function mergeIntoAfterList(afterList, profileAftersales) {
    if (!afterList || !Array.isArray(afterList)) return [];
    var mapped = (profileAftersales || []).map(cloneAftersale);
    var i;
    for (i = afterList.length - 1; i >= 0; i--) {
      if (afterList[i]._fromProfile) afterList.splice(i, 1);
    }
    for (i = mapped.length - 1; i >= 0; i--) {
      afterList.unshift(mapped[i]);
    }
    return afterList;
  }

  function findByOrder(orderIdOrNo) {
    var key = String(orderIdOrNo || '');
    if (!key) return null;
    var list = loadProfileAftersales();
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (String(a.orderId) === key || String(a._profileOrderId) === key || String(a.id) === key) {
        return a;
      }
    }
    return null;
  }

  function findById(id) {
    var key = String(id || '');
    var list = loadProfileAftersales();
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === key) return list[i];
    }
    return null;
  }

  /** 运营售后状态 → App 订单状态 */
  function mapAftersaleToOrderStatus(aftersale) {
    var key = String((aftersale && aftersale.statusKey) || '');
    var status = String((aftersale && aftersale.status) || '');
    if (key === 'rejected' || status.indexOf('拒绝') >= 0 || key === 'canceled' || status.indexOf('取消') >= 0) {
      return {
        status: aftersale._prevStatus || '已完成',
        statusKey: aftersale._prevStatusKey || 'done',
        aftersaleClosed: true
      };
    }
    if (key === 'refunded' || key === 'done' || key === 'exdone' ||
        status.indexOf('已退款') >= 0 || status === '已完成' || status.indexOf('换货完成') >= 0) {
      return { status: '已退款', statusKey: 'refunded', aftersaleClosed: true };
    }
    return { status: '退款中', statusKey: 'refunding', aftersaleClosed: false };
  }

  function patchProfileOrderFromAftersale(aftersale, opts) {
    opts = opts || {};
    if (!aftersale || typeof ProfileOrderStore === 'undefined') return false;
    var list = ProfileOrderStore.load() || [];
    var pid = String(aftersale._profileOrderId || '');
    var ono = String(aftersale.orderId || '');
    var changed = false;
    var mapped = mapAftersaleToOrderStatus(aftersale);
    var nextList = list.map(function (o) {
      var hit = (pid && String(o.id) === pid) || (ono && (String(o.orderNo) === ono || String(o.id) === ono));
      if (!hit) return o;
      changed = true;
      var copy = Object.assign({}, o);
      if (!copy._prevStatusKey && copy.statusKey !== 'refunding' && copy.statusKey !== 'refunded') {
        copy._prevStatus = copy.status;
        copy._prevStatusKey = copy.statusKey;
      }
      copy.status = mapped.status;
      copy.statusKey = mapped.statusKey;
      copy.aftersaleId = aftersale.id;
      copy.aftersaleStatus = aftersale.status;
      copy.aftersaleStatusKey = aftersale.statusKey;
      copy.aftersaleRemark = aftersale.remark || '';
      copy.aftersaleHandler = aftersale.handler || '';
      copy.aftersaleHandleTime = aftersale.handleTime || '';
      return copy;
    });
    if (!changed) return false;
    if (opts.silent) {
      try {
        localStorage.setItem(ProfileOrderStore.STORAGE_KEY, JSON.stringify(nextList));
      } catch (e) { /* ignore */ }
      return true;
    }
    ProfileOrderStore.save(nextList);
    return true;
  }

  function upsertAdminAftersale(adminRow, opts) {
    opts = opts || {};
    if (!adminRow) return null;
    var row = cloneAftersale(Object.assign({}, adminRow, {
      _fromProfile: adminRow._fromProfile !== false || !!adminRow._profileOrderId
    }));
    var list = opts._list || loadProfileAftersales();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(row.id) ||
          (row._profileOrderId && String(list[i]._profileOrderId) === String(row._profileOrderId)) ||
          (row.orderId && String(list[i].orderId) === String(row.orderId) && list[i]._fromProfile)) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) {
      if (!row._prevStatusKey && list[idx]._prevStatusKey) {
        row._prevStatus = list[idx]._prevStatus;
        row._prevStatusKey = list[idx]._prevStatusKey;
      }
      if (!row._profileOrderId) row._profileOrderId = list[idx]._profileOrderId;
      list[idx] = row;
    } else if (row._fromProfile || row._profileOrderId) {
      list.unshift(row);
    } else {
      // 非 App 来源：若能匹配到个人订单号，也纳入闭环
      var matched = false;
      if (typeof ProfileOrderStore !== 'undefined' && row.orderId) {
        var orders = ProfileOrderStore.load() || [];
        for (var j = 0; j < orders.length; j++) {
          if (String(orders[j].orderNo) === String(row.orderId) || String(orders[j].id) === String(row.orderId)) {
            row._fromProfile = true;
            row._profileOrderId = String(orders[j].id);
            matched = true;
            break;
          }
        }
      }
      if (!matched) return null;
      list.unshift(row);
    }
    if (opts._list) {
      /* 批量模式：只改内存列表，由调用方统一 save/broadcast */
      if (!opts.skipOrderPatch) patchProfileOrderFromAftersale(row, { silent: true });
      return row;
    }
    saveProfileAftersales(list, { silent: !!opts.silent });
    patchProfileOrderFromAftersale(row, { silent: !!opts.silent });
    return row;
  }

  /** 运营 AFTER_LIST 变更后：回写 App 售后单 + 订单状态（整表只广播一次，避免百次 postMessage 卡死页面） */
  function syncFromAdminAfterList(afterList) {
    if (!Array.isArray(afterList)) return;
    var list = loadProfileAftersales();
    var i;
    var touched = [];
    for (i = 0; i < afterList.length; i++) {
      var a = afterList[i];
      if (!a) continue;
      if (a._fromProfile || a._profileOrderId || a.orderId) {
        var row = upsertAdminAftersale(a, { _list: list, skipOrderPatch: true });
        if (row) touched.push(row);
      }
    }
    saveProfileAftersales(list, { silent: true });
    /* 订单状态批量回写，只 notify 一次 */
    if (typeof ProfileOrderStore !== 'undefined' && touched.length) {
      var orders = ProfileOrderStore.load() || [];
      var orderChanged = false;
      for (i = 0; i < touched.length; i++) {
        var aftersale = touched[i];
        var pid = String(aftersale._profileOrderId || '');
        var ono = String(aftersale.orderId || '');
        var mapped = mapAftersaleToOrderStatus(aftersale);
        orders = orders.map(function (o) {
          var hit = (pid && String(o.id) === pid) || (ono && (String(o.orderNo) === ono || String(o.id) === ono));
          if (!hit) return o;
          orderChanged = true;
          var copy = Object.assign({}, o);
          if (!copy._prevStatusKey && copy.statusKey !== 'refunding' && copy.statusKey !== 'refunded') {
            copy._prevStatus = copy.status;
            copy._prevStatusKey = copy.statusKey;
          }
          copy.status = mapped.status;
          copy.statusKey = mapped.statusKey;
          copy.aftersaleId = aftersale.id;
          copy.aftersaleStatus = aftersale.status;
          copy.aftersaleStatusKey = aftersale.statusKey;
          copy.aftersaleRemark = aftersale.remark || '';
          copy.aftersaleHandler = aftersale.handler || '';
          copy.aftersaleHandleTime = aftersale.handleTime || '';
          return copy;
        });
      }
      if (orderChanged) {
        try { localStorage.setItem(ProfileOrderStore.STORAGE_KEY, JSON.stringify(orders)); } catch (eOrd) {}
        try { ProfileOrderStore.broadcast(); } catch (eBc) {}
      }
    }
    broadcast(loadProfileAftersales());
  }

  function buildProgressHtml(aftersale, order) {
    if (!aftersale) {
      return '暂无售后记录。如已提交申请，请稍候刷新。';
    }
    var lines = [];
    lines.push('售后单号：<b>' + escapeHtml(aftersale.id) + '</b>');
    lines.push('关联订单：' + escapeHtml(aftersale.orderId || (order && order.orderNo) || '-'));
    lines.push('售后类型：' + escapeHtml(aftersale.afterType || '仅退款'));
    lines.push('申请原因：' + escapeHtml(aftersale.reason || '-'));
    lines.push('当前状态：<b style="color:#8A63F2;">' + escapeHtml(aftersale.status || '处理中') + '</b>');
    if (aftersale.amount != null) {
      lines.push('申请金额：¥' + Number(aftersale.amount || 0).toFixed(2));
    }
    if (aftersale.refundMethod) {
      lines.push('退款方式：' + escapeHtml(aftersale.refundMethod));
    }
    if (aftersale.handler) {
      lines.push('处理人：' + escapeHtml(aftersale.handler));
    }
    if (aftersale.handleTime) {
      lines.push('处理时间：' + escapeHtml(aftersale.handleTime));
    }
    if (aftersale.remark) {
      lines.push('处理备注：' + escapeHtml(aftersale.remark));
    }
    lines.push('<span style="color:#999;font-size:12px;">与运营端售后管理实时同步</span>');
    return lines.join('<br/>');
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  global.ProfileAftersaleSync = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    UPDATE_EVT: UPDATE_EVT,
    DEFAULT_USER: DEFAULT_USER,
    loadProfileAftersales: loadProfileAftersales,
    saveProfileAftersales: saveProfileAftersales,
    mapOrderToAftersaleRow: mapOrderToAftersaleRow,
    upsertFromRefundOrder: upsertFromRefundOrder,
    mergeIntoAfterList: mergeIntoAfterList,
    broadcast: broadcast,
    requestSync: requestSync,
    cloneAftersale: cloneAftersale,
    findByOrder: findByOrder,
    findById: findById,
    upsertAdminAftersale: upsertAdminAftersale,
    syncFromAdminAfterList: syncFromAdminAfterList,
    patchProfileOrderFromAftersale: patchProfileOrderFromAftersale,
    mapAftersaleToOrderStatus: mapAftersaleToOrderStatus,
    buildProgressHtml: buildProgressHtml
  };
})(typeof window !== 'undefined' ? window : this);
