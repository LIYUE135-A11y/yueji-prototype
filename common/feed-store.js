/**
 * 动态列表 · 运营后台 ↔ App 发现同步
 */
(function (global) {
  var STORAGE_KEY = 'yueji_feed_list_v2';
  var SYNC_MSG = 'feed-sync';
  var REQUEST_MSG = 'feed-request-sync';

  var FEED_COVER_MAP = {
    '00021': 'feed_1.jpg',
    '00022': 'feed_2.jpg',
    '00023': 'feed_3.jpg',
    '00024': 'feed_4.jpg',
    '00025': 'feed_5.jpg'
  };

  var DEFAULT_FEEDS = [
    { id:'00021', seed:'feed-1', user:'林予安', userId:'U20240105', publisher:'用户', cat:'护肤', tag:'开箱', status:'passed', statusText:'已通过', text:'新买的兰蔻菁纯面霜到啦！包装真的太高级了，迫不及待想要试用，期待效果！', imgs:1, likes:128, comments:23, shares:12, publishTime:'2026-08-24' },
    { id:'00022', seed:'feed-2', user:'顾惜月', userId:'U20240256', publisher:'用户', cat:'彩妆', tag:'日常', status:'passed', statusText:'已通过', text:'今天的妆容分享，温柔奶茶色系，适合秋冬，约会通勤都可以用～', imgs:2, likes:256, comments:45, shares:28, publishTime:'2026-08-23', mediaType:'video', video:'1' },
    { id:'00023', seed:'feed-3', user:'周南枝', userId:'U20240778', publisher:'商家', cat:'护肤', tag:'开箱', status:'pending', statusText:'待审核', text:'开箱日记｜海蓝之谜精粹水终于入手了！包装很有质感，期待上脸效果。', imgs:3, likes:189, comments:34, shares:15, publishTime:'2026-08-21' },
    { id:'00024', seed:'feed-4', user:'陈初雪', userId:'U20240888', publisher:'平台', cat:'日常', tag:'测评', status:'passed', statusText:'已通过', text:'我的早晚护肤流程大公开！从洁面到防晒，一步都不能少，坚持皮肤会变好的！', imgs:1, likes:342, comments:78, shares:56, publishTime:'2026-08-16' },
    { id:'00025', seed:'feed-5', user:'姚慕晴', userId:'U20241668', publisher:'用户', cat:'彩妆', tag:'测评', status:'passed', statusText:'已通过', text:'新手化妆入门教程来啦！从0到1教你化妆，手残党也能学会，超详细步骤。', imgs:2, likes:425, comments:92, shares:128, publishTime:'2026-08-12' }
  ];

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

  function cloneFeed(f) {
    var file = FEED_COVER_MAP[f.id] || 'feed_1.jpg';
    var syncImgs = Array.isArray(f.syncImgs) ? f.syncImgs.slice() : [];
    var syncCover = f.syncCover || (syncImgs[0] || ('./community_images/' + file));
    return {
      id: f.id,
      seed: f.seed || '',
      user: f.user || '',
      userId: f.userId || '',
      publisher: f.publisher || '',
      cat: f.cat || '',
      tag: f.tag || '',
      status: f.status || '',
      statusText: f.statusText || '',
      text: f.text || '',
      imgs: f.imgs != null ? f.imgs : (syncImgs.length || 1),
      likes: toStatNum(f.likes, 0),
      comments: toStatNum(f.comments, 0),
      shares: toStatNum(f.shares, 0),
      publishTime: f.publishTime || '',
      syncCover: syncCover,
      syncImgs: syncImgs.length ? syncImgs : (syncCover ? [syncCover] : []),
      video: f.video || '',
      mediaType: f.mediaType || (f.video ? 'video' : 'image'),
      device: f.device || '',
      city: f.city || '',
      topicRef: f.topicRef || '',
      brand: f.brand || '',
      visibility: f.visibility || '',
      reportCount: f.reportCount != null ? f.reportCount : 0,
      featured: !!f.featured,
      skinType: f.skinType || ''
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(cloneFeed);
        }
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_FEEDS.map(cloneFeed);
  }

  function save(list) {
    var snapshot = (list || []).map(cloneFeed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = {
      type: SYNC_MSG,
      source: 'workspace',
      feeds: (list || load()).map(cloneFeed)
    };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    /* 不再对本窗口 postMessage，避免运营端 feed-sync 自触发重绘导致列表横跳 */
    try {
      global.dispatchEvent(new CustomEvent('feed-updated', { detail: payload.feeds }));
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

  function resolveCover(feed, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (!feed) return imgBase + 'feed_1.jpg';
    if (feed.syncImgs && feed.syncImgs.length) {
      var first = coverFromSyncPath(feed.syncImgs[0], imgBase) || feed.syncImgs[0];
      if (first) return first;
    }
    var fromSync = coverFromSyncPath(feed.syncCover, imgBase);
    if (fromSync) return fromSync;
    var file = FEED_COVER_MAP[feed.id] || 'feed_1.jpg';
    return imgBase + file;
  }

  function resolveGallery(feed, imgBase) {
    imgBase = normalizeBase(imgBase);
    if (feed && Array.isArray(feed.syncImgs) && feed.syncImgs.length) {
      return feed.syncImgs.map(function (p) {
        return coverFromSyncPath(p, imgBase) || p;
      });
    }
    var cover = resolveCover(feed, imgBase);
    return cover ? [cover] : [imgBase + 'feed_1.jpg'];
  }

  function resolveAvatar(feed, avatarBase) {
    avatarBase = normalizeAvatarBase(avatarBase);
    if (!feed) return avatarBase + 'u01.jpg';
    var file = AUTHOR_AVATAR_MAP[feed.userId];
    if (file) return avatarBase + file;
    return avatarBase + 'u01.jpg';
  }

  function buildTitle(feed, maxLen) {
    var text = (feed && feed.text) ? String(feed.text) : '';
    maxLen = maxLen || 18;
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
  }

  function filterForDiscover(list) {
    return (list || []).filter(function (f) {
      return f.status === 'passed';
    });
  }

  function bumpFeedStat(list, feedId, field) {
    var fields = { likes: true, comments: true, shares: true };
    if (!fields[field]) return (list || []).map(cloneFeed);
    return (list || []).map(function (f) {
      if (String(f.id) !== String(feedId)) return cloneFeed(f);
      var copy = cloneFeed(f);
      copy[field] = toStatNum(copy[field], 0) + 1;
      return copy;
    });
  }

  global.FeedStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneFeed: cloneFeed,
    resolveCover: resolveCover,
    resolveGallery: resolveGallery,
    resolveAvatar: resolveAvatar,
    buildTitle: buildTitle,
    filterForDiscover: filterForDiscover,
    bumpFeedStat: bumpFeedStat
  };
})(typeof window !== 'undefined' ? window : this);

