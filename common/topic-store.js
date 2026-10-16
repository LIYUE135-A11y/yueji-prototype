/**
 * 话题列表 · 运营后台 ↔ App 发现-推荐「话题」板块同步
 */
(function (global) {
  var STORAGE_KEY = 'yueji_topic_list_v2';
  var SYNC_MSG = 'topic-sync';
  var REQUEST_MSG = 'topic-request-sync';

  var TOPIC_COVER_MAP = {
    '00016': 'grass_1.jpg',
    '00017': 'grass_2.jpg',
    '00018': 'grass_3.jpg',
    '00019': 'feed_1.jpg',
    '00020': 'feed_2.jpg'
  };

  var TOPIC_VIEWERS_MAP = {
    '00016': 992,
    '00017': 1280,
    '00018': 756,
    '00019': 2103,
    '00020': 520
  };

  var TOPIC_HOT_MAP = {
    '00016': true,
    '00017': true,
    '00018': true,
    '00019': true,
    '00020': false
  };

  function toStatNum(val, fallback) {
    if (val == null || val === '') return fallback || 0;
    var n = parseInt(val, 10);
    return isNaN(n) ? (fallback || 0) : n;
  }

  function cloneTopic(t) {
    var file = TOPIC_COVER_MAP[t.id] || 'grass_1.jpg';
    var viewers = toStatNum(t.viewers, TOPIC_VIEWERS_MAP[t.id] || 0);
    var heat = toStatNum(t.heat, 0);
    var isHot = t.isHot != null ? !!t.isHot : (TOPIC_HOT_MAP[t.id] != null ? TOPIC_HOT_MAP[t.id] : heat >= 800);
    return {
      id: t.id,
      seed: t.seed || '',
      title: t.title || '',
      initiator: t.initiator || '',
      initiatorId: t.initiatorId || '',
      status: t.status || '',
      statusText: t.statusText || '',
      discussions: t.discussions || '',
      heat: heat,
      viewers: viewers,
      isHot: isHot,
      createTime: t.createTime || '',
      syncCover: t.syncCover || ('./community_images/' + file),
      cat: t.cat || '',
      tag: t.tag || '',
      joinCount: t.joinCount != null ? t.joinCount : 0,
      postCount: t.postCount != null ? t.postCount : 0,
      featured: !!t.featured,
      relatedBrand: t.relatedBrand || '',
      ownerDept: t.ownerDept || '',
      channel: t.channel || ''
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    var snapshot = (list || []).map(cloneTopic);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, topics: (list || load()).map(cloneTopic) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('topic-updated', { detail: payload.topics }));
    } catch (e2) { /* ignore */ }
  }

  function normalizeBase(imgBase) {
    var base = imgBase || './community_images/';
    if (base.charAt(base.length - 1) !== '/') base += '/';
    return base;
  }

  function coverFromSyncPath(syncPath, imgBase) {
    if (!syncPath) return '';
    var sc = String(syncPath);
    if (/^(data:|https?:)/.test(sc)) return sc;
    var match = sc.match(/community_images\/([^?#/]+)/i);
    if (match) return normalizeBase(imgBase) + match[1];
    return '';
  }

  function resolveCover(topic, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (!topic) return imgBase + 'grass_1.jpg';
    var fromSync = coverFromSyncPath(topic.syncCover, imgBase);
    if (fromSync) return fromSync;
    var file = TOPIC_COVER_MAP[topic.id] || 'grass_1.jpg';
    return imgBase + file;
  }

  function formatTitle(title) {
    var text = String(title || '').trim();
    if (!text) return '#话题';
    text = text.replace(/^#+/, '').replace(/#+$/, '').trim();
    return '#' + text;
  }

  function formatViewers(topic) {
    var num = toStatNum(topic && topic.viewers, 0);
    return num + '人围观';
  }

  function filterForRecommend(list, limit) {
    var items = (list || []).filter(function (t) {
      return t.status === 'passed';
    });
    if (limit && limit > 0) return items.slice(0, limit);
    return items;
  }

  global.TopicStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneTopic: cloneTopic,
    resolveCover: resolveCover,
    formatTitle: formatTitle,
    formatViewers: formatViewers,
    filterForRecommend: filterForRecommend
  };
})(typeof window !== 'undefined' ? window : this);
