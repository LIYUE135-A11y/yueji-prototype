/**
 * 公网静态站离线 MySQL 数据桥：
 * 当本机 API (localhost:3789) 不可用时，用 mysql-api-bundle.json 回答 /api/* 请求。
 * 须在 kefu-store / ai-config-store 等发起 API 请求的脚本之前引入。
 */
(function (global) {
  var bundle = null;
  var ready = false;
  var loading = null;

  function resolveBundleUrl() {
    if (global.MEILIXIUXING_MYSQL_BUNDLE) return String(global.MEILIXIUXING_MYSQL_BUNDLE);
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || '';
        if (/mysql-static-bridge\.js/i.test(src)) {
          return src.replace(/mysql-static-bridge\.js(\?.*)?$/i, 'mysql-api-bundle.json');
        }
      }
    } catch (e) { /* ignore */ }
    return 'common/mysql-api-bundle.json';
  }

  function loadBundle() {
    if (bundle) return Promise.resolve(bundle);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', resolveBundleUrl(), true);
      xhr.timeout = 30000;
      xhr.onload = function () {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error('mysql bundle HTTP ' + xhr.status));
          return;
        }
        try {
          bundle = JSON.parse(xhr.responseText || '{}');
          ready = true;
          resolve(bundle);
        } catch (e) {
          reject(e);
        }
      };
      xhr.onerror = function () { reject(new Error('mysql bundle network error')); };
      xhr.ontimeout = function () { reject(new Error('mysql bundle timeout')); };
      xhr.send(null);
    });
    return loading;
  }

  function normalizePath(url) {
    try {
      var u = new URL(url, global.location && global.location.href);
      return (u.pathname || '').replace(/\/+$/, '') || '/';
    } catch (e) {
      var m = String(url || '').match(/https?:\/\/[^/]+(\/[^?]*)/);
      return m ? m[1].replace(/\/+$/, '') : String(url || '');
    }
  }

  function isLocalApiUrl(url) {
    var s = String(url || '');
    return /127\.0\.0\.1:3789|localhost:3789|127\.0\.0\.1:3001|localhost:3001/i.test(s);
  }

  function lookup(path) {
    if (!bundle || !bundle.endpoints) return null;
    var p = path || '';
    if (bundle.endpoints[p]) return bundle.endpoints[p];
    // strip trailing slash variants already handled; try with/without /api prefix leftovers
    if (bundle.endpoints['/api' + p]) return bundle.endpoints['/api' + p];
    return null;
  }

  function patchXHR() {
    if (global.__MEILI_MYSQL_STATIC_XHR__) return;
    global.__MEILI_MYSQL_STATIC_XHR__ = true;
    var Orig = global.XMLHttpRequest;
    if (!Orig) return;

    function Wrapped() {
      var xhr = new Orig();
      var _url = '';
      var _method = 'GET';
      var _async = true;
      var open = xhr.open;
      xhr.open = function (method, url, async) {
        _method = String(method || 'GET').toUpperCase();
        _url = String(url || '');
        _async = async !== false;
        return open.apply(xhr, arguments);
      };
      var send = xhr.send;
      xhr.send = function (body) {
        if (_method === 'GET' && isLocalApiUrl(_url)) {
          var path = normalizePath(_url);
          var serve = function () {
            var data = lookup(path);
            if (!data) {
              try { return send.call(xhr, body); } catch (e) { /* fallthrough */ }
              Object.defineProperty(xhr, 'status', { get: function () { return 404; } });
              Object.defineProperty(xhr, 'readyState', { get: function () { return 4; } });
              Object.defineProperty(xhr, 'responseText', { get: function () { return JSON.stringify({ ok: false, error: 'static miss ' + path }); } });
              if (typeof xhr.onerror === 'function') xhr.onerror();
              return;
            }
            var text = JSON.stringify(data);
            Object.defineProperty(xhr, 'status', { get: function () { return 200; } });
            Object.defineProperty(xhr, 'statusText', { get: function () { return 'OK'; } });
            Object.defineProperty(xhr, 'readyState', { get: function () { return 4; } });
            Object.defineProperty(xhr, 'responseText', { get: function () { return text; } });
            Object.defineProperty(xhr, 'response', { get: function () { return text; } });
            if (typeof xhr.onreadystatechange === 'function') xhr.onreadystatechange();
            if (typeof xhr.onload === 'function') xhr.onload();
          };
          if (!ready) {
            loadBundle().then(serve).catch(function () {
              try { send.call(xhr, body); } catch (e2) {
                if (typeof xhr.onerror === 'function') xhr.onerror();
              }
            });
            return;
          }
          serve();
          return;
        }
        return send.apply(xhr, arguments);
      };
      return xhr;
    }
    Wrapped.prototype = Orig.prototype;
    global.XMLHttpRequest = Wrapped;
  }

  function patchFetch() {
    if (!global.fetch || global.__MEILI_MYSQL_STATIC_FETCH__) return;
    global.__MEILI_MYSQL_STATIC_FETCH__ = true;
    var orig = global.fetch.bind(global);
    global.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
      if (method === 'GET' && isLocalApiUrl(url)) {
        var path = normalizePath(url);
        return loadBundle().then(function () {
          var data = lookup(path);
          if (!data) return orig(input, init);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          });
        }).catch(function () {
          return orig(input, init);
        });
      }
      return orig(input, init);
    };
  }

  patchXHR();
  patchFetch();
  loadBundle().then(function (b) {
    try {
      console.log('[MysqlStatic] 已加载离线库', b && b.database, b && b.exportedAt);
      global.dispatchEvent(new CustomEvent('mysql-static-ready', { detail: { exportedAt: b && b.exportedAt } }));
    } catch (e) { /* ignore */ }
  }).catch(function (err) {
    console.warn('[MysqlStatic] 离线库不可用', err && err.message);
  });

  global.MysqlStatic = {
    load: loadBundle,
    isReady: function () { return ready; },
    getTables: function () {
      return loadBundle().then(function (b) {
        var ep = b.endpoints && b.endpoints['/api/tables'];
        return (ep && ep.tables) || [];
      });
    }
  };
})(typeof window !== 'undefined' ? window : this);
