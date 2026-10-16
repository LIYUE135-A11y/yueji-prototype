/**
 * 文章列表 · 运营后台 ↔ App 发现板块同步
 */
(function (global) {
  var STORAGE_KEY = 'yueji_article_list_v2';
  var SYNC_MSG = 'article-sync';
  var REQUEST_MSG = 'article-request-sync';

  var ARTICLE_COVER_MAP = {
    '00001': 'article_1.jpg',
    '00002': 'article_2.jpg',
    '00003': 'article_3.jpg',
    '00004': 'article_4.jpg',
    '00005': 'article_5.jpg'
  };

  var ARTICLE_GALLERY_MAP = {
    '00001': ['article_1.jpg', 'grass_1.jpg', 'feed_1.jpg'],
    '00002': ['article_2.jpg', 'grass_2.jpg', 'feed_2.jpg'],
    '00003': ['article_3.jpg', 'grass_3.jpg', 'feed_3.jpg'],
    '00004': ['article_4.jpg', 'grass_4.jpg', 'feed_4.jpg'],
    '00005': ['article_5.jpg', 'grass_5.jpg', 'feed_5.jpg']
  };

  var ARTICLE_STATS_MAP = {
    '00001': { favorites: 236, comments: 58, likes: 892 },
    '00002': { favorites: 412, comments: 127, likes: 1560 },
    '00003': { favorites: 89, comments: 23, likes: 345 },
    '00004': { favorites: 15, comments: 6, likes: 78 },
    '00005': { favorites: 178, comments: 41, likes: 623 }
  };

  function toStatNum(val, fallback) {
    if (val == null || val === '') return fallback || 0;
    var n = parseInt(val, 10);
    return isNaN(n) ? (fallback || 0) : n;
  }

  function resolveStats(article) {
    var def = ARTICLE_STATS_MAP[article && article.id] || {};
    return {
      favorites: toStatNum(article && article.favorites, def.favorites || 0),
      comments: toStatNum(article && article.comments, def.comments || 0),
      likes: toStatNum(article && article.likes, def.likes || 0)
    };
  }

  function formatStatCount(n) {
    var num = toStatNum(n, 0);
    if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    return String(num);
  }

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

  function cloneArticle(a) {
    var file = ARTICLE_COVER_MAP[a.id] || 'article_1.jpg';
    var stats = resolveStats(a);
    return {
      id: a.id,
      seed: a.seed || '',
      title: a.title || '',
      excerpt: a.excerpt || '',
      content: a.content || '',
      cat: a.cat || '',
      tag: a.tag || '',
      publisher: a.publisher || '',
      author: a.author || '',
      authorId: a.authorId || '',
      level: a.level || '',
      levelKey: a.levelKey || '',
      status: a.status || '',
      statusText: a.statusText || '',
      auditReason: a.auditReason || '',
      reads: a.reads,
      publishTime: a.publishTime || '',
      subtitle: a.subtitle || '',
      syncCover: a.syncCover || ('./community_images/' + file),
      favorites: stats.favorites,
      comments: stats.comments,
      likes: stats.likes,
      channel: a.channel || '',
      skinType: a.skinType || '',
      brandMention: a.brandMention || '',
      wordCount: a.wordCount != null ? a.wordCount : 0,
      featured: !!a.featured,
      source: a.source || '',
      editor: a.editor || '',
      region: a.region || '',
      recommendScore: a.recommendScore != null ? a.recommendScore : 0,
      shareCount: a.shareCount != null ? a.shareCount : 0
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
    var snapshot = (list || []).map(cloneArticle);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, articles: (list || load()).map(cloneArticle) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('article-updated', { detail: payload.articles }));
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

  function resolveCover(article, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (!article) return imgBase + 'article_1.jpg';
    var fromSync = coverFromSyncPath(article.syncCover, imgBase);
    if (fromSync) return fromSync;
    var file = ARTICLE_COVER_MAP[article.id] || 'article_1.jpg';
    return imgBase + file;
  }

  function resolveGallery(article, imgBase) {
    imgBase = normalizeBase(imgBase);
    var files = ARTICLE_GALLERY_MAP[article.id] || [ARTICLE_COVER_MAP[article.id] || 'article_1.jpg'];
    return files.map(function (f) { return imgBase + f; });
  }

  function resolveAvatar(article, avatarBase) {
    avatarBase = normalizeAvatarBase(avatarBase);
    if (!article) return avatarBase + 'u01.jpg';
    var file = AUTHOR_AVATAR_MAP[article.authorId];
    if (file) return avatarBase + file;
    return avatarBase + 'u01.jpg';
  }

  function buildTags(article) {
    var parts = [];
    if (article.cat) parts.push(article.cat);
    if (article.tag) parts.push(article.tag);
    if (article.level) parts.push(article.level);
    return parts.join(' · ') || '阅己社区';
  }

  function filterForDiscover(list) {
    return (list || []).filter(function (a) {
      return a.status === 'passed';
    });
  }

  function bumpArticleStat(list, articleId, field) {
    var fields = { favorites: true, comments: true, likes: true };
    if (!fields[field]) return (list || []).map(cloneArticle);
    return (list || []).map(function (a) {
      if (String(a.id) !== String(articleId)) return cloneArticle(a);
      var copy = cloneArticle(a);
      copy[field] = toStatNum(copy[field], 0) + 1;
      return copy;
    });
  }

  global.ArticleStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneArticle: cloneArticle,
    resolveCover: resolveCover,
    resolveGallery: resolveGallery,
    resolveAvatar: resolveAvatar,
    buildTags: buildTags,
    filterForDiscover: filterForDiscover,
    resolveStats: resolveStats,
    formatStatCount: formatStatCount,
    bumpArticleStat: bumpArticleStat
  };
})(typeof window !== 'undefined' ? window : this);
