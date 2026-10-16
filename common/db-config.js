/**
 * 美丽修行 · 项目数据库配置（与 server/config.js 对齐）
 * 运营端「大模型 → 全局配置 → 数据库配置」自动填充
 */
(function (global) {
  var DEFAULTS = {
    type: 'MySQL',
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '123456',
    database: 'meilixiuxing',
    apiPort: 3789
  };

  var API_BASES = [
    'http://127.0.0.1:3789',
    'http://localhost:3789'
  ];

  function normalizeHost(host) {
    var h = String(host || '').trim();
    if (!h || h === 'localhost') return '127.0.0.1';
    if (h.indexOf('http://') === 0 || h.indexOf('https://') === 0) return '127.0.0.1';
    return h;
  }

  function toLlmForm(cfg) {
    cfg = cfg || DEFAULTS;
    return {
      type: cfg.type || DEFAULTS.type,
      host: normalizeHost(cfg.host || DEFAULTS.host),
      port: String(cfg.port != null ? cfg.port : DEFAULTS.port),
      user: cfg.user || DEFAULTS.user,
      password: cfg.password != null ? cfg.password : DEFAULTS.password,
      database: cfg.database || cfg.db || DEFAULTS.database
    };
  }

  function isLegacyDbConfig(db) {
    if (!db || typeof db !== 'object') return true;
    if (db.database === 'guojimami') return true;
    if (db.password === 'password') return true;
    return false;
  }

  function fetchJson(path) {
    path = path || '/api/db-config';
    var i = 0;
    function tryNext() {
      if (i >= API_BASES.length) {
        return Promise.reject(new Error('API 未连接'));
      }
      var base = API_BASES[i++];
      return fetch(base + path, { method: 'GET' })
        .then(function (res) {
          if (!res.ok) throw new Error('status ' + res.status);
          return res.json();
        })
        .catch(function (err) {
          if (i < API_BASES.length) return tryNext();
          throw err;
        });
    }
    return tryNext();
  }

  function fetchFromApi() {
    return fetchJson('/api/db-config').then(function (data) {
      if (!data || !data.ok) throw new Error('invalid db-config');
      return toLlmForm({
        type: data.type,
        host: data.host,
        port: data.port,
        user: data.user,
        password: data.password,
        database: data.database
      });
    });
  }

  function testHealth() {
    return fetchJson('/api/health').then(function (data) {
      return {
        ok: !!(data && data.ok),
        degraded: !!(data && data.degraded),
        database: data && data.database,
        error: data && data.error,
        hint: data && data.hint
      };
    });
  }

  global.DbConfig = {
    DEFAULTS: DEFAULTS,
    API_BASES: API_BASES,
    normalizeHost: normalizeHost,
    toLlmForm: toLlmForm,
    getLlmFormDefaults: function () { return toLlmForm(DEFAULTS); },
    isLegacyDbConfig: isLegacyDbConfig,
    fetchFromApi: fetchFromApi,
    testHealth: testHealth,
    fetchJson: fetchJson
  };
})(typeof window !== 'undefined' ? window : this);
