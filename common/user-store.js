/**
 * 用户列表 · 运营后台 ↔ App 发现-推荐「推荐用户」同步
 */
(function (global) {
  var STORAGE_KEY = 'yueji_user_list_v4';
  var SYNC_MSG = 'user-sync';
  var REQUEST_MSG = 'user-request-sync';

  var USER_AVATAR_MAP = {
    'U20240105': 'u01.jpg', 'U20240088': 'u02.jpg', 'U20240256': 'u03.jpg',
    'U20240032': 'u04.jpg', 'U20240102': 'u05.jpg', 'U20240501': 'u06.jpg',
    'U20240322': 'u07.jpg', 'U20240608': 'u08.jpg', 'U20240178': 'u09.jpg',
    'U20240901': 'u10.jpg', 'U20240208': 'u11.jpg', 'U20240076': 'u13.jpg',
    'U20241102': 'u14.jpg', 'U20241156': 'u15.jpg', 'U20240334': 'u16.jpg',
    'U20240442': 'u17.jpg', 'U20240778': 'u18.jpg', 'U20240888': 'u19.jpg',
    'U20240236': 'u20.jpg', 'U20241220': 'u21.jpg', 'U20241312': 'u22.jpg',
    'U20241444': 'u23.jpg', 'U20241558': 'u24.jpg', 'U20241668': 'u25.jpg',
    'U20240612': 'u12.jpg'
  };

  function cloneUser(u) {
    var file = USER_AVATAR_MAP[u.id] || 'u01.jpg';
    return {
      id: u.id,
      nickName: u.nickName || '',
      realName: u.realName || '',
      phone: u.phone || '',
      wechat: u.wechat != null ? u.wechat : '-',
      email: u.email || '',
      gender: u.gender || '',
      birthday: u.birthday || '',
      age: u.age,
      province: u.province || '',
      city: u.city || '',
      district: u.district || '',
      addressDetail: u.addressDetail || '',
      zipCode: u.zipCode || '',
      homeAddress: u.homeAddress || '',
      receiverName: u.receiverName || '',
      receiverPhone: u.receiverPhone || '',
      skinType: u.skinType || '',
      occupation: u.occupation || '',
      tags: u.tags || '',
      userType: u.userType || '',
      level: u.level || '',
      levelKey: u.levelKey || '',
      status: u.status || '',
      points: u.points,
      orders: u.orders,
      spend: u.spend,
      channel: u.channel || '',
      inviteCode: u.inviteCode || '',
      device: u.device || '',
      regTime: u.regTime || '',
      lastLogin: u.lastLogin || '',
      viewCount: u.viewCount,
      favCount: u.favCount,
      likeCount: u.likeCount,
      followCount: u.followCount,
      fansCount: u.fansCount,
      remark: u.remark || '',
      syncAvatar: u.syncAvatar || ('./avatars/' + file)
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
      /* 兼容旧 key，避免刷新丢演示数据 */
      var legacy = localStorage.getItem('yueji_user_list_v3');
      if (legacy) {
        var old = JSON.parse(legacy);
        if (Array.isArray(old) && old.length) return old.map(cloneUser);
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    var snapshot = (list || []).map(cloneUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, users: (list || load()).map(cloneUser) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('user-updated', { detail: payload.users }));
    } catch (e2) { /* ignore */ }
  }

  function normalizeAvatarBase(avatarBase) {
    var base = avatarBase || './avatars/';
    if (base.charAt(base.length - 1) !== '/') base += '/';
    return base;
  }

  function avatarFromSyncPath(syncPath, avatarBase) {
    if (!syncPath) return '';
    var sc = String(syncPath);
    if (/^(data:|https?:)/.test(sc)) return sc;
    var match = sc.match(/avatars\/([^?#/]+)/i);
    if (match) return normalizeAvatarBase(avatarBase) + match[1];
    return '';
  }

  function resolveAvatar(user, avatarBase) {
    avatarBase = normalizeAvatarBase(avatarBase);
    if (!user) return avatarBase + 'u01.jpg';
    var fromSync = avatarFromSyncPath(user.syncAvatar, avatarBase);
    if (fromSync) return fromSync;
    var file = USER_AVATAR_MAP[user.id] || 'u01.jpg';
    return avatarBase + file;
  }

  function filterForRecommend(list) {
    return (list || []).filter(function (u) {
      return u.status === '正常';
    });
  }

  global.UserStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneUser: cloneUser,
    resolveAvatar: resolveAvatar,
    filterForRecommend: filterForRecommend
  };
})(typeof window !== 'undefined' ? window : this);
