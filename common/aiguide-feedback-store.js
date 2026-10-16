/**
 * AI 导购问题（会话反馈）· App ↔ 运营共享
 * localStorage: ai_guide_card_feedback_v2（兼容读旧 v1）
 */
(function (global) {
  var STORAGE_KEY = 'ai_guide_card_feedback_v2';
  var STORAGE_KEY_LEGACY = 'ai_guide_card_feedback_v1';
  var MAX_KEEP = 600;
  var memoryList = null;

  function safeParse(raw) {
    try {
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function normalize(row, idx) {
    if (!row || typeof row !== 'object') return null;
    var next = Object.assign({}, row);
    if (!next.id) next.id = 'AGF' + String(Date.now()) + '_' + (idx || 0);
    if (!next.status) next.status = 'pending';
    if (next.skipped && !next.score) next.score = 'skip';
    if (!next.nickName) next.nickName = next.userName || next.nickname || '美妆用户';
    if (!next.realName) next.realName = next.name || '—';
    if (!next.phone) next.phone = next.mobile || '';
    if (!next.handler) next.handler = '';
    if (!next.solution) next.solution = '';
    if (!Array.isArray(next.messages)) next.messages = [];
    return next;
  }

  function readRaw() {
    var list = safeParse(localStorage.getItem(STORAGE_KEY));
    if (list.length) return list;
    var legacy = safeParse(localStorage.getItem(STORAGE_KEY_LEGACY));
    if (legacy.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy.slice(0, MAX_KEEP)));
      } catch (e) { /* ignore */ }
      return legacy;
    }
    return [];
  }

  function load() {
    if (memoryList) return memoryList.slice();
    var list = readRaw().map(normalize).filter(Boolean);
    memoryList = list;
    return list.slice();
  }

  function save(list) {
    var next = (list || []).map(normalize).filter(Boolean).slice(0, MAX_KEEP);
    memoryList = next;
    try {
      var raw = JSON.stringify(next);
      localStorage.setItem(STORAGE_KEY, raw);
      try { localStorage.setItem(STORAGE_KEY_LEGACY, raw); } catch (e2) { /* ignore */ }
    } catch (e) { /* ignore */ }
    try {
      if (typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('aiguide-feedback-updated'));
      }
    } catch (e3) { /* ignore */ }
    return next;
  }

  function upsert(row) {
    var list = load();
    var n = normalize(row, 0);
    if (!n) return null;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === n.id) { idx = i; break; }
    }
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], n);
    else list.unshift(n);
    save(list);
    return n;
  }

  var api = {
    KEY: STORAGE_KEY,
    KEY_LEGACY: STORAGE_KEY_LEGACY,
    load: load,
    save: save,
    upsert: upsert,
    normalize: normalize
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.AiGuideFeedbackStore = api;
})(typeof window !== 'undefined' ? window : global);
