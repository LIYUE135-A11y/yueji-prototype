/**
 * 前端 ↔ MySQL 同步桥
 * 将 common/*-store 使用的 localStorage 与后端 app_store 表双向同步
 *
 * 用法：放在各 *-store.js 之前引入，启动时会同步拉取数据库。
 */
(function (global) {
  var API_BASE = (global.MEILIXIUXING_API || 'http://localhost:3789').replace(/\/$/, '');
  var STORE_KEYS = [
    'zhuangyan_product_list_v2',
    'zhuangyan_product_list_v1',
    'zhuangyan_merchant_list_v1',
    'zhuangyan_review_list_v1',
    'yueji_user_list_v2_feminine',
    'yueji_user_list_v3',
    'yueji_user_list_v4',
    'yueji_article_list_v2',
    'yueji_grass_list_v2',
    'yueji_topic_list_v2',
    'yueji_circle_list_v2',
    'yueji_feed_list_v2',
    'zhuangyan_activity_list_v2',
    'zhuangyan_activity_list_v1',
    'zhuangyan_claimed_coupons_v1',
    'zhuangyan_decor_entries_v1',
    'zhuangyan_decor_pages_v1',
    'zhuangyan_profile_orders_v1',
    'zhuangyan_profile_aftersales_v1',
    'zhuangyan_aftersale_list_v1',
    'zhuangyan_profile_cart_v1',
    'zhuangyan_order_list_v1',
    'zhuangyan_collect_list_v1',
    'zhuangyan_llm_settings_v1',
    'zhuangyan_llm_settings_v2',
    'zhuangyan_kb_list_v1',
    'zhuangyan_ai_help_articles_v1',
    'zhuangyan_ai_help_articles_seed_ver',
    'zhuangyan_ai_config_v1',
    'zhuangyan_kefu_sessions_v2',
    'zhuangyan_kefu_sessions_v1',
    'yueji_message_list_v1',
    'ai_guide_card_feedback_v2',
    'ai_guide_card_feedback_v1',
    'human_kefu_manage_v1'
  ];

  var ready = false;
  var online = false;
  var saveTimers = {};
  var originalSetItem = null;
  var syncingFromDb = false;

  function isTracked(key) {
    return STORE_KEYS.indexOf(key) >= 0;
  }

  function xhrJson(method, path, body, async) {
    return new Promise(function (resolve, reject) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open(method, API_BASE + path, async !== false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 2500;
        xhr.onload = function () {
          var data = null;
          try { data = JSON.parse(xhr.responseText || '{}'); } catch (e) { data = {}; }
          if (xhr.status >= 200 && xhr.status < 300 && data.ok !== false) resolve(data);
          else reject(new Error((data && data.error) || ('HTTP ' + xhr.status)));
        };
        xhr.onerror = function () { reject(new Error('network error')); };
        xhr.ontimeout = function () { reject(new Error('timeout')); };
        xhr.send(body != null ? JSON.stringify(body) : null);
      } catch (err) {
        reject(err);
      }
    });
  }

  /** 启动阶段同步请求，保证在 store 脚本执行前写好 localStorage */
  function xhrJsonSync(method, path, body) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, API_BASE + path, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    try {
      xhr.send(body != null ? JSON.stringify(body) : null);
    } catch (e) {
      throw new Error('无法连接数据库服务 ' + API_BASE);
    }
    var data = null;
    try { data = JSON.parse(xhr.responseText || '{}'); } catch (e2) { data = {}; }
    if (xhr.status < 200 || xhr.status >= 300 || data.ok === false) {
      throw new Error((data && data.error) || ('HTTP ' + xhr.status));
    }
    return data;
  }

  function applyStores(stores) {
    if (!stores || typeof stores !== 'object') return;
    syncingFromDb = true;
    try {
      Object.keys(stores).forEach(function (key) {
        if (!isTracked(key)) return;
        try {
          var val = stores[key];
          var raw = typeof val === 'string' ? val : JSON.stringify(val);
          if (originalSetItem) originalSetItem.call(localStorage, key, raw);
          else localStorage.setItem(key, raw);
        } catch (e) { /* ignore */ }
      });
    } finally {
      syncingFromDb = false;
    }
  }

  function collectLocalStores() {
    var map = {};
    var has = false;
    STORE_KEYS.forEach(function (key) {
      try {
        var raw = localStorage.getItem(key);
        if (raw == null) return;
        try { map[key] = JSON.parse(raw); } catch (e) { map[key] = raw; }
        has = true;
      } catch (e2) { /* ignore */ }
    });
    return has ? map : null;
  }

  function scheduleSave(key, value) {
    if (!online || syncingFromDb || !isTracked(key)) return;
    if (saveTimers[key]) clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(function () {
      var parsed = value;
      try { parsed = JSON.parse(value); } catch (e) { /* keep */ }
      xhrJson('PUT', '/api/stores/' + encodeURIComponent(key), { value: parsed }, true).catch(function (err) {
        console.warn('[DbBridge] 保存失败', key, err && err.message);
      });
    }, 400);
  }

  function patchLocalStorage() {
    if (!global.localStorage || originalSetItem) return;
    originalSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);
      scheduleSave(key, value);
    };
  }

  function bootstrap() {
    patchLocalStorage();
    /* 不阻塞页面 / iframe 加载：异步探测 API，失败或超时则继续用 localStorage */
    ready = true;
    var settled = false;
    function finish(isOnline) {
      if (settled) return;
      settled = true;
      online = !!isOnline;
      try {
        global.dispatchEvent(new CustomEvent('db-bridge-ready', { detail: { online: online } }));
      } catch (e) { /* ignore */ }
    }
    var timer = setTimeout(function () {
      console.warn('[DbBridge] 连接超时，继续使用 localStorage');
      finish(false);
    }, 1500);
    xhrJson('GET', '/api/health', null, true).then(function (health) {
      return xhrJson('GET', '/api/stores', null, true).then(function (data) {
        clearTimeout(timer);
        var stores = data.stores || {};
        var keys = Object.keys(stores);
        if (keys.length) {
          applyStores(stores);
          console.log('[DbBridge] 已从 MySQL 加载', keys.length, '组数据 →', health && health.database);
        } else {
          var local = collectLocalStores();
          if (local) {
            xhrJson('POST', '/api/stores/sync', { stores: local }, true).catch(function () {});
            console.log('[DbBridge] 本地数据已上传到 MySQL →', health && health.database);
          } else {
            console.log('[DbBridge] 已连接 MySQL，暂无业务数据');
          }
        }
        finish(true);
      });
    }).catch(function (err) {
      clearTimeout(timer);
      console.warn('[DbBridge] 数据库服务不可用，继续使用 localStorage:', err && err.message);
      finish(false);
    });
    return { online: false, ready: true };
  }

  global.DbBridge = {
    API_BASE: API_BASE,
    STORE_KEYS: STORE_KEYS,
    init: function () { return Promise.resolve(bootstrap()); },
    pull: function () {
      return xhrJson('GET', '/api/stores', null, true).then(function (data) {
        applyStores(data.stores || {});
        return data;
      });
    },
    /** 同步拉取 app_store（回答前强制读库） */
    pullSync: function () {
      var data = xhrJsonSync('GET', '/api/stores', null);
      applyStores((data && data.stores) || {});
      online = true;
      return data;
    },
    push: function () {
      var local = collectLocalStores() || {};
      return xhrJson('POST', '/api/stores/sync', { stores: local }, true);
    },
    isOnline: function () { return online; },
    isReady: function () { return ready; }
  };

  bootstrap();
})(typeof window !== 'undefined' ? window : this);
