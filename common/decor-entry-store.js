/**
 * 功能入口 · 运营后台 ↔ App 共享数据层
 * 通过 localStorage + postMessage 同步
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_decor_entries_v1';
  var SYNC_MSG = 'decor-entry-sync';

  var DEFAULT_ENTRIES = [
    { id: 'EN10001', name: 'AI测肤', icon: 'skin.svg', position: '首页中部', path: '选择指定商品', sort: 1, visible: true, scope: 'home', actionKey: 'skinGuide' },
    { id: 'EN10002', name: '阅己榜单', icon: 'rank.svg', position: '首页中部', path: '指定活动', sort: 2, visible: true, scope: 'home', actionKey: 'rank' },
    { id: 'EN10003', name: '批号查询', icon: 'batch.svg', position: '首页中部', path: '选择指定商品', sort: 3, visible: true, scope: 'home', actionKey: 'batch' },
    { id: 'EN10004', name: '试用中心', icon: 'plan.svg', position: '首页顶部', path: '选择指定商品', sort: 4, visible: true, scope: 'home', actionKey: 'trial' },
    { id: 'EN10005', name: '我的梳妆台', icon: 'desk.svg', position: '个人中心', path: '选择指定商品', sort: 99, visible: false, scope: 'profile', actionKey: 'desk' },
    { id: 'EN10008', name: '我的订单', icon: 'order.svg', position: '个人中心', path: '自定页面', sort: 1, visible: true, scope: 'profile', actionKey: 'order' },
    { id: 'EN10009', name: '优惠券', icon: 'coupon.svg', position: '个人中心', path: '自定页面', sort: 2, visible: true, scope: 'profile', actionKey: 'coupon' },
    { id: 'EN10007', name: '购物车', icon: 'cart.svg', position: '个人中心', path: '自定页面', sort: 3, visible: true, scope: 'profile', actionKey: 'cart' },
    { id: 'EN10010', name: '收货地址', icon: 'address.svg', position: '个人中心', path: '自定页面', sort: 4, visible: true, scope: 'profile', actionKey: 'address' }
  ];

  var REMOVED_ENTRY_IDS = { EN10006: true };

  var ICON_MAP = {
    EN10001: 'skin.svg', EN10002: 'rank.svg', EN10003: 'batch.svg',
    EN10004: 'plan.svg', EN10005: 'desk.svg', EN10007: 'cart.svg', EN10008: 'order.svg',
    EN10009: 'coupon.svg', EN10010: 'address.svg'
  };

  function compareSort(a, b) {
    var sa = Number(a.sort) || 0;
    var sb = Number(b.sort) || 0;
    if (sa !== sb) return sa - sb;
    return String(a.id).localeCompare(String(b.id));
  }

  function cloneEntry(en) {
    return {
      id: en.id,
      name: en.name,
      icon: en.icon || '',
      iconUrl: en.iconUrl || '',
      position: en.position,
      path: en.path,
      linkUrl: en.linkUrl || '',
      sort: en.sort,
      visible: !!en.visible,
      scope: en.scope,
      actionKey: en.actionKey || ''
    };
  }

  function withoutRemovedEntries(list) {
    return (list || []).filter(function (en) {
      return !REMOVED_ENTRY_IDS[en.id];
    });
  }

  /** 历史文案「妆研榜单」统一改为「阅己榜单」；批号入口纠正 path */
  function normalizeEntryNames(list) {
    var changed = false;
    var next = (list || []).map(function (en) {
      var c = cloneEntry(en);
      var name = String(c.name || '');
      var isRank = c.id === 'EN10002' || c.actionKey === 'rank' || /妆研榜单/.test(name);
      if (isRank && name !== '阅己榜单') {
        c.name = '阅己榜单';
        if (!c.actionKey) c.actionKey = 'rank';
        changed = true;
      }
      var isBatch = c.id === 'EN10003' || c.actionKey === 'batch' || /批号/.test(name);
      if (isBatch) {
        if (!c.actionKey) { c.actionKey = 'batch'; changed = true; }
        if (c.path === '自定页面') { c.path = '选择指定商品'; changed = true; }
        if (/批号/.test(name) && name !== '批号查询') { c.name = '批号查询'; changed = true; }
      }
      var isTrial = c.id === 'EN10004' || c.actionKey === 'trial' || name === '试用中心';
      if (isTrial) {
        if (!c.actionKey) { c.actionKey = 'trial'; changed = true; }
        if (c.path === '跳转网址' || c.path === '自定页面') { c.path = '选择指定商品'; changed = true; }
      }
      // 个人中心快捷入口：订单 / 优惠券 / 购物车 / 收货地址
      if (c.id === 'EN10005' && c.scope === 'profile') {
        if (c.visible) { c.visible = false; changed = true; }
        if (Number(c.sort) !== 99) { c.sort = 99; changed = true; }
      }
      if (c.id === 'EN10008' || c.actionKey === 'order' || name.indexOf('订单') >= 0) {
        if (c.scope === 'profile' || c.id === 'EN10008') {
          if (c.name !== '我的订单') { c.name = '我的订单'; changed = true; }
          if (!c.actionKey) { c.actionKey = 'order'; changed = true; }
          if (Number(c.sort) !== 1) { c.sort = 1; changed = true; }
          if (c.icon !== 'order.svg' && !c.iconUrl) { c.icon = 'order.svg'; changed = true; }
          c.visible = true;
          c.scope = 'profile';
          c.position = '个人中心';
        }
      }
      if (c.id === 'EN10007' || c.actionKey === 'cart' || name.indexOf('购物车') >= 0) {
        if (c.scope === 'profile' || c.id === 'EN10007') {
          if (c.name !== '购物车') { c.name = '购物车'; changed = true; }
          if (!c.actionKey) { c.actionKey = 'cart'; changed = true; }
          if (Number(c.sort) !== 3) { c.sort = 3; changed = true; }
          c.visible = true;
          c.scope = 'profile';
          c.position = '个人中心';
        }
      }
      if (c.id === 'EN10009' || c.actionKey === 'coupon' || name === '优惠券') {
        if (c.name !== '优惠券') { c.name = '优惠券'; changed = true; }
        if (!c.actionKey) { c.actionKey = 'coupon'; changed = true; }
        if (Number(c.sort) !== 2) { c.sort = 2; changed = true; }
        if (c.icon !== 'coupon.svg' && !c.iconUrl) { c.icon = 'coupon.svg'; changed = true; }
        c.visible = true;
        c.scope = 'profile';
        c.position = '个人中心';
      }
      if (c.id === 'EN10010' || c.actionKey === 'address' || name.indexOf('收货地址') >= 0) {
        if (c.name !== '收货地址') { c.name = '收货地址'; changed = true; }
        if (!c.actionKey) { c.actionKey = 'address'; changed = true; }
        if (Number(c.sort) !== 4) { c.sort = 4; changed = true; }
        if (c.icon !== 'address.svg' && !c.iconUrl) { c.icon = 'address.svg'; changed = true; }
        c.visible = true;
        c.scope = 'profile';
        c.position = '个人中心';
      }
      return c;
    });
    return { list: next, changed: changed };
  }

  function mergeMissingDefaults(list) {
    var ids = {};
    var merged = withoutRemovedEntries(list || []).slice();
    merged.forEach(function (en) { ids[en.id] = true; });
    DEFAULT_ENTRIES.forEach(function (def) {
      if (!ids[def.id]) merged.push(cloneEntry(def));
    });
    return normalizeEntryNames(merged).list;
  }

  function mergeEntryLists(localList, remoteList) {
    var map = {};
    (remoteList || []).forEach(function (en) {
      if (!REMOVED_ENTRY_IDS[en.id]) map[en.id] = cloneEntry(en);
    });
    (localList || []).forEach(function (en) {
      if (!REMOVED_ENTRY_IDS[en.id]) map[en.id] = cloneEntry(en);
    });
    return normalizeEntryNames(Object.keys(map).map(function (id) { return map[id]; })).list;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          var filtered = mergeMissingDefaults(parsed);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.map(cloneEntry)));
          } catch (e) { /* ignore */ }
          return filtered.length ? filtered : DEFAULT_ENTRIES.map(cloneEntry);
        }
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_ENTRIES.map(cloneEntry);
  }

  function prepareForStorage(list) {
    return (list || []).map(function (en) {
      var c = cloneEntry(en);
      // 超过约 100KB 的 dataURL 容易撑爆 localStorage；压缩后的图标应低于此
      if (c.iconUrl && String(c.iconUrl).length > 140000) {
        c.iconUrl = '';
        if (!c.icon) c.icon = 'skin.svg';
      }
      return c;
    });
  }

  function save(list) {
    var snapshot = normalizeEntryNames((list || []).map(cloneEntry)).list;
    var stored = prepareForStorage(snapshot);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prepareForStorage(stored)));
      } catch (e2) { /* ignore */ }
    }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, entries: (list || load()).map(cloneEntry) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('decor-entry-updated', { detail: payload.entries }));
    } catch (e2) { /* ignore */ }
  }

  function filterVisible(list, scope) {
    return (list || []).filter(function (en) {
      return en.scope === scope && en.visible;
    }).sort(compareSort);
  }

  function filterForHome(list) {
    return filterVisible(list, 'home').filter(function (en) {
      return en.position === '首页顶部' || en.position === '首页中部';
    });
  }

  function filterForProfile(list) {
    return filterVisible(list, 'profile');
  }

  function filterForAdminHome(list) {
    return (list || []).filter(function (en) {
      return en.scope === 'home';
    }).sort(compareSort);
  }

  function matchesAdminScope(en, adminScope) {
    return en.scope === (adminScope || 'home');
  }

  function rewriteAdminAssetForApp(url, iconBase) {
    var u = String(url || '');
    if (!u || /^(data:|https?:)/i.test(u)) return u;
    if (u.indexOf('../运营管理系统/') === 0) return u;
    // APP 端 iconBase 通常是 static/features/；运营端则含 entries 或运营路径
    var fromApp = !iconBase || (String(iconBase).indexOf('运营管理系统') < 0 && String(iconBase).indexOf('static/entries') < 0);
    if (!fromApp) return u;
    if (/^(\.\/)?(community_images|avatars|static)\//.test(u)) {
      return '../运营管理系统/' + u.replace(/^\.\//, '');
    }
    return u;
  }

  function resolveModuleIconFromLink(entry) {
    if (!entry || !entry.linkUrl) return '';
    var url = String(entry.linkUrl);
    var m = url.match(/[?&]id=([^&]+)/);
    if (!m) return '';
    var id = decodeURIComponent(m[1]);
    var adminBase = '../运营管理系统/community_images/';
    var avatarBase = '../运营管理系统/avatars/';
    try {
      if (/\/pages\/circle\/detail/.test(url) && global.CircleStore) {
        var circles = global.CircleStore.load() || [];
        for (var i = 0; i < circles.length; i++) {
          if (String(circles[i].id) === id) {
            return global.CircleStore.resolveCover(circles[i], adminBase);
          }
        }
      }
      if (/\/pages\/grass\/detail/.test(url) && global.GrassStore) {
        var grasses = global.GrassStore.load() || [];
        for (var g = 0; g < grasses.length; g++) {
          if (String(grasses[g].id) === id) {
            return global.GrassStore.resolveCover(grasses[g], adminBase);
          }
        }
      }
      if (/\/pages\/topic\/detail/.test(url) && global.TopicStore) {
        var topics = global.TopicStore.load() || [];
        for (var t = 0; t < topics.length; t++) {
          if (String(topics[t].id) === id) {
            return global.TopicStore.resolveCover(topics[t], adminBase);
          }
        }
      }
      if (/\/pages\/article\/detail/.test(url) && global.ArticleStore) {
        var arts = global.ArticleStore.load() || [];
        for (var a = 0; a < arts.length; a++) {
          if (String(arts[a].id) === id) {
            return global.ArticleStore.resolveCover
              ? global.ArticleStore.resolveCover(arts[a], adminBase)
              : adminBase + 'article_1.jpg';
          }
        }
      }
      if (/\/pages\/user\/detail/.test(url) && global.UserStore) {
        var users = global.UserStore.load() || [];
        for (var u = 0; u < users.length; u++) {
          if (String(users[u].id) === id) {
            return global.UserStore.resolveAvatar
              ? global.UserStore.resolveAvatar(users[u], avatarBase)
              : avatarBase + 'u01.jpg';
          }
        }
      }
      if (/\/pages\/product\/detail/.test(url) && global.ProductStore) {
        var products = global.ProductStore.load() || [];
        var prod = global.ProductStore.findProduct(products, id, entry.name || '');
        if (prod && global.ProductStore.resolveCover) {
          return global.ProductStore.resolveCover(prod, '../运营管理系统/static/products/');
        }
      }
    } catch (e) { /* ignore */ }
    return '';
  }

  function resolveIcon(entry, iconBase) {
    iconBase = iconBase || 'static/entries/';
    if (!entry) return iconBase + 'skin.svg';
    // 已上传 / 已指定封面：优先直出，不被模块默认图覆盖
    if (entry.iconUrl) {
      var rewritten = rewriteAdminAssetForApp(entry.iconUrl, iconBase);
      if (rewritten) return rewritten;
      return entry.iconUrl;
    }
    var fromLink = resolveModuleIconFromLink(entry);
    if (fromLink) return fromLink;
    if (entry.icon) {
      var ic = String(entry.icon);
      if (/^(data:|https?:|\/)/.test(ic)) return ic;
      return iconBase + ic.replace(/^.*\//, '');
    }
    var file = ICON_MAP[entry.id] || 'skin.svg';
    return iconBase + file;
  }

  function seedIfEmpty(list) {
    if (!list || !list.length) {
      var seeded = DEFAULT_ENTRIES.map(cloneEntry);
      save(seeded);
      return seeded;
    }
    return list;
  }

  global.DecorEntryStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    DEFAULT_ENTRIES: DEFAULT_ENTRIES,
    load: load,
    save: save,
    broadcast: broadcast,
    seedIfEmpty: seedIfEmpty,
    filterForHome: filterForHome,
    filterForProfile: filterForProfile,
    filterForAdminHome: filterForAdminHome,
    matchesAdminScope: matchesAdminScope,
    resolveIcon: resolveIcon,
    compareSort: compareSort,
    mergeEntryLists: mergeEntryLists,
    cloneEntry: cloneEntry
  };
})(typeof window !== 'undefined' ? window : this);
