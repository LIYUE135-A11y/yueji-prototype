/**
 * 种草列表 · 运营后台 ↔ App 发现-推荐板块同步
 */
(function (global) {
  var STORAGE_KEY = 'yueji_grass_list_v2';
  var SYNC_MSG = 'grass-sync';
  var REQUEST_MSG = 'grass-request-sync';

  var GRASS_COVER_MAP = {
    '00006': 'grass_1.jpg',
    '00007': 'grass_2.jpg',
    '00008': 'grass_3.jpg',
    '00009': 'grass_4.jpg',
    '00010': 'grass_5.jpg'
  };

  var GRASS_VIEWS_MAP = {
    '00006': 183000,
    '00007': 96000,
    '00008': 45200,
    '00009': 121000,
    '00010': 78000
  };

  var AUTHOR_AVATAR_MAP = {
    'U20240105': 'u01.jpg', 'U20240088': 'u02.jpg', 'U20240256': 'u03.jpg',
    'U20240032': 'u04.jpg', 'U20240102': 'u05.jpg', 'U20240501': 'u06.jpg',
    'U20240322': 'u07.jpg', 'U20240608': 'u08.jpg', 'U20240178': 'u09.jpg',
    'U20240901': 'u10.jpg', 'U20240208': 'u11.jpg', 'U20240612': 'u12.jpg',
    'U20240076': 'u13.jpg', 'U20241102': 'u14.jpg', 'U20241156': 'u15.jpg',
    'U20240334': 'u16.jpg', 'U20240442': 'u17.jpg', 'U20240778': 'u18.jpg',
    'U20240888': 'u19.jpg', 'U20240236': 'u20.jpg', 'U20241220': 'u21.jpg',
    'U20241312': 'u22.jpg', 'U20241444': 'u23.jpg', 'U20241558': 'u24.jpg',
    'U20241668': 'u25.jpg'
  };

  function toStatNum(val, fallback) {
    if (val == null || val === '') return fallback || 0;
    var n = parseInt(val, 10);
    return isNaN(n) ? (fallback || 0) : n;
  }

  function cloneGrass(g) {
    var file = GRASS_COVER_MAP[g.id] || 'grass_1.jpg';
    var syncImgs = Array.isArray(g.syncImgs) ? g.syncImgs.slice() : [];
    var syncCover = g.syncCover || (syncImgs[0] || ('./community_images/' + file));
    return {
      id: g.id,
      seed: g.seed || '',
      user: g.user || '',
      userId: g.userId || '',
      publisher: g.publisher || '',
      cat: g.cat || '',
      tag: g.tag || '',
      level: g.level || '',
      levelKey: g.levelKey || '',
      status: g.status || '',
      statusText: g.statusText || '',
      text: g.text || '',
      brand: g.brand || '',
      productName: g.productName || '',
      skinType: g.skinType || '',
      rating: g.rating != null ? g.rating : 0,
      useful: g.useful != null ? g.useful : 0,
      featured: !!g.featured,
      city: g.city || '',
      device: g.device || '',
      topicRef: g.topicRef || '',
      reportCount: g.reportCount != null ? g.reportCount : 0,
      imgs: g.imgs != null ? g.imgs : (syncImgs.length || 1),
      likes: toStatNum(g.likes, 0),
      comments: toStatNum(g.comments, 0),
      views: toStatNum(g.views, GRASS_VIEWS_MAP[g.id] || 0),
      publishTime: g.publishTime || '',
      syncCover: syncCover,
      syncImgs: syncImgs.length ? syncImgs : (syncCover ? [syncCover] : []),
      orderId: g.orderId || '',
      orderNo: g.orderNo || g.orderId || ''
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
    var snapshot = (list || []).map(cloneGrass);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = {
      type: SYNC_MSG,
      grasses: (list || load()).map(cloneGrass)
    };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.postMessage(payload, '*');
    } catch (e0) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('grass-updated', { detail: payload.grasses }));
    } catch (e2) { /* ignore */ }
  }

  function normalizeBase(imgBase) {
    var base = imgBase || './community_images/';
    if (base.charAt(base.length - 1) !== '/') base += '/';
    return base;
  }

  function normalizeAvatarBase(avatarBase) {
    var base = avatarBase || './avatars/';
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

  function resolveCover(grass, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (!grass) return imgBase + 'grass_1.jpg';
    if (grass.syncImgs && grass.syncImgs.length) {
      var first = coverFromSyncPath(grass.syncImgs[0], imgBase) || grass.syncImgs[0];
      if (first) return first;
    }
    var fromSync = coverFromSyncPath(grass.syncCover, imgBase);
    if (fromSync) return fromSync;
    if (grass.syncCover && /^(data:|https?:|static\/)/.test(String(grass.syncCover))) {
      return grass.syncCover;
    }
    var file = GRASS_COVER_MAP[grass.id] || 'grass_1.jpg';
    return imgBase + file;
  }

  function resolveGallery(grass, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (grass && Array.isArray(grass.syncImgs) && grass.syncImgs.length) {
      return grass.syncImgs.map(function (p) {
        return coverFromSyncPath(p, imgBase) || p;
      });
    }
    var cover = resolveCover(grass, imgBase);
    return cover ? [cover] : [imgBase + 'grass_1.jpg'];
  }

  function resolveAvatar(grass, avatarBase) {
    avatarBase = normalizeAvatarBase(avatarBase);
    if (!grass) return avatarBase + 'u01.jpg';
    var file = AUTHOR_AVATAR_MAP[grass.userId];
    if (file) return avatarBase + file;
    return avatarBase + 'u01.jpg';
  }

  function buildTitle(grass, maxLen) {
    var text = (grass && grass.text) ? String(grass.text) : '';
    maxLen = maxLen || 18;
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
  }

  function buildSub(grass) {
    var parts = [];
    if (grass.cat) parts.push(grass.cat);
    if (grass.tag) parts.push(grass.tag);
    return parts.join(' · ') || '种草推荐';
  }

  function formatViews(n) {
    var num = toStatNum(n, 0);
    if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    return String(num);
  }

  function comparePublishTime(a, b) {
    var ta = a.publishTime || '';
    var tb = b.publishTime || '';
    if (ta === tb) return 0;
    return ta > tb ? -1 : 1;
  }

  function filterForRecommend(list) {
    return (list || []).filter(function (g) {
      return g.status === 'passed';
    }).sort(comparePublishTime);
  }

  function matchOrderRef(g, orderId, orderNo) {
    if (!g) return false;
    var oid = String(orderId || '').trim();
    var ono = String(orderNo || '').trim();
    if (!oid && !ono) return false;
    if (oid && (String(g.orderId || '') === oid || String(g.orderNo || '') === oid)) return true;
    if (ono && (String(g.orderNo || '') === ono || String(g.orderId || '') === ono)) return true;
    return false;
  }

  function findByOrder(list, orderId, orderNo) {
    var arr = list || [];
    for (var i = 0; i < arr.length; i++) {
      if (matchOrderRef(arr[i], orderId, orderNo)) return cloneGrass(arr[i]);
    }
    return null;
  }

  function hasOrderGrass(list, orderId, orderNo) {
    return !!findByOrder(list, orderId, orderNo);
  }

  global.GrassStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneGrass: cloneGrass,
    resolveCover: resolveCover,
    resolveGallery: resolveGallery,
    resolveAvatar: resolveAvatar,
    buildTitle: buildTitle,
    buildSub: buildSub,
    formatViews: formatViews,
    filterForRecommend: filterForRecommend,
    matchOrderRef: matchOrderRef,
    findByOrder: findByOrder,
    hasOrderGrass: hasOrderGrass
  };
})(typeof window !== 'undefined' ? window : this);
