/**
 * 圈子列表 · 运营后台 ↔ App 发现-推荐「热门圈子」同步
 */
(function (global) {
  var STORAGE_KEY = 'yueji_circle_list_v2';
  var SYNC_MSG = 'circle-sync';
  var REQUEST_MSG = 'circle-request-sync';

  var CIRCLE_COVER_MAP = {
    '00011': 'circle_1.jpg',
    '00012': 'circle_2.jpg',
    '00013': 'circle_3.jpg',
    '00014': 'circle_4.jpg',
    '00015': 'circle_5.jpg'
  };

  var CIRCLE_AVATAR_MAP = {
    '00011': 'circle_1.jpg',
    '00012': 'circle_2.jpg',
    '00013': 'circle_3.jpg',
    '00014': 'circle_4.jpg',
    '00015': 'circle_5.jpg'
  };

  function cloneCircle(c) {
    var coverFile = CIRCLE_COVER_MAP[c.id] || 'circle_1.jpg';
    var avatarFile = CIRCLE_AVATAR_MAP[c.id] || coverFile;
    var syncCover = c.syncCover || ('./community_images/' + coverFile);
    return {
      id: c.id,
      seed: c.seed || '',
      name: c.name || '',
      cat: c.cat || '',
      status: c.status || '',
      statusText: c.statusText || '',
      members: c.members || '',
      posts: c.posts || '',
      master: c.master || '',
      masterId: c.masterId || '',
      createTime: c.createTime || '',
      syncCover: syncCover,
      syncAvatar: c.syncAvatar || syncCover || ('./community_images/' + avatarFile),
      region: c.region || '',
      level: c.level || '',
      weeklyPosts: c.weeklyPosts != null ? c.weeklyPosts : 0,
      activeRate: c.activeRate || '',
      topicCount: c.topicCount != null ? c.topicCount : 0,
      notice: c.notice || '',
      joinMode: c.joinMode || '',
      recommend: !!c.recommend
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
    var snapshot = (list || []).map(cloneCircle);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, circles: (list || load()).map(cloneCircle) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('circle-updated', { detail: payload.circles }));
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

  function resolveCover(circle, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (!circle) return imgBase + 'circle_1.jpg';
    var fromSync = coverFromSyncPath(circle.syncCover, imgBase);
    if (fromSync) return fromSync;
    var file = CIRCLE_COVER_MAP[circle.id] || 'circle_1.jpg';
    return imgBase + file;
  }

  function resolveAvatar(circle, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (!circle) return imgBase + 'circle_1.jpg';
    var fromAvatar = coverFromSyncPath(circle.syncAvatar, imgBase);
    if (fromAvatar) return fromAvatar;
    var fromCover = coverFromSyncPath(circle.syncCover, imgBase);
    if (fromCover) return fromCover;
    var file = CIRCLE_AVATAR_MAP[circle.id] || CIRCLE_COVER_MAP[circle.id] || 'circle_1.jpg';
    return imgBase + file;
  }

  function filterForRecommend(list) {
    return (list || []).filter(function (c) {
      return c.status === 'passed';
    });
  }

  global.CircleStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneCircle: cloneCircle,
    resolveCover: resolveCover,
    resolveAvatar: resolveAvatar,
    filterForRecommend: filterForRecommend
  };
})(typeof window !== 'undefined' ? window : this);
