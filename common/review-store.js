/**
 * 评价列表 · 运营后台 ↔ App 闭环同步
 * 覆盖：商品 / 话题 / 动态 / 种草 / 文章 五类评价与回复
 * 通过 localStorage + postMessage 同步
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_review_list_v1';
  var SYNC_MSG = 'review-sync';
  var REQUEST_MSG = 'review-request-sync';

  function toNum(val, fallback) {
    if (val == null || val === '') return fallback || 0;
    var n = parseInt(val, 10);
    return isNaN(n) ? (fallback || 0) : n;
  }

  function normType(r) {
    if (r && r.reviewType) return r.reviewType;
    if (r && r.prodId) return 'product';
    return 'product';
  }

  function cloneReview(r) {
    if (!r) return null;
    var reply = r.replyContent || r.replyText || '';
    var userReplies = [];
    if (Array.isArray(r.userReplies)) {
      for (var i = 0; i < r.userReplies.length; i++) {
        var u = r.userReplies[i] || {};
        userReplies.push({
          id: u.id || '',
          name: u.name || '',
          text: u.text || '',
          time: u.time || '',
          replyTo: u.replyTo || '',
          avatar: u.avatar || ''
        });
      }
    }
    return {
      id: r.id,
      reviewType: normType(r),
      targetId: r.targetId || '',
      orderId: r.orderId || '',
      _profileOrderId: r._profileOrderId || '',
      prodId: r.prodId || '',
      prodName: r.prodName || '',
      prodCover: r.prodCover || '',
      content: r.content || '',
      images: Array.isArray(r.images) ? r.images.slice(0, 6) : [],
      video: r.video || '',
      rating: toNum(r.rating, 5),
      reviewTime: r.reviewTime || '',
      reviewerName: r.reviewerName || '',
      reviewerId: r.reviewerId || '',
      reviewerAvatarBg: r.reviewerAvatarBg || 'linear-gradient(135deg,#FCE7F3,#FBCFE8)',
      reviewerAvatarText: r.reviewerAvatarText || '',
      spec: r.spec || '',
      price: r.price || 0,
      merchantName: r.merchantName || '',
      views: toNum(r.views, 0),
      auditStatus: r.auditStatus || '',
      auditKey: r.auditKey || '',
      replyName: r.replyName || '',
      replyTime: r.replyTime || '',
      replyContent: reply,
      replyText: reply,
      userReplies: userReplies,
      usefulCount: toNum(r.usefulCount, 0),
      tags: r.tags || '',
      channel: r.channel || '',
      province: r.province || '',
      brand: r.brand || '',
      cat1: r.cat1 || '',
      cat3: r.cat3 || '',
      anonymous: !!r.anonymous,
      skinType: r.skinType || '',
      repurchase: !!r.repurchase,
      topicName: r.topicName || '',
      grassName: r.grassName || '',
      articleName: r.articleName || '',
      hidden: !!r.hidden,
      readStatus: r.readStatus || '',
      _fromProfile: !!r._fromProfile,
      _fromCatalog: !!r._fromCatalog
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(cloneReview).filter(Boolean);
        }
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    var snapshot = (list || []).map(cloneReview).filter(Boolean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
    return snapshot;
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, reviews: (list || load()).map(cloneReview).filter(Boolean) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('review-updated', { detail: payload.reviews }));
    } catch (e2) { /* ignore */ }
  }

  function requestSync() {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: REQUEST_MSG }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  /** APP 内容类型 → 评价类型：post→grass */
  function appTypeToReviewType(appType) {
    if (appType === 'post') return 'grass';
    if (appType === 'topic') return 'topic';
    if (appType === 'article') return 'article';
    if (appType === 'product') return 'product';
    return 'feed';
  }

  function isAppVisible(r) {
    if (!r) return false;
    if (r.hidden) return false;
    if (r.auditKey === 'block' || r.auditStatus === '已屏蔽') return false;
    return true;
  }

  function matchContent(r, reviewType, targetId, title) {
    if (!r || normType(r) !== reviewType) return false;
    /* 有 targetId 时只认精确关联，保证详情评论与评价管理闭环一致 */
    if (targetId) {
      if (r.targetId && String(r.targetId) === String(targetId)) return true;
      if (reviewType === 'product' && r.prodId && String(r.prodId) === String(targetId)) return true;
      return false;
    }
    var name = r.topicName || r.grassName || r.articleName || r.prodName || '';
    if (title && name) {
      var t = String(title);
      var n = String(name);
      if (n === t || n.indexOf(t) >= 0 || t.indexOf(n) >= 0) return true;
    }
    return false;
  }

  function countForContent(appType, targetId) {
    if (!targetId) return 0;
    return listForContent(appType, targetId, '').length;
  }

  function listForContent(appType, targetId, title) {
    var reviewType = appTypeToReviewType(appType);
    return load().filter(function (r) {
      return isAppVisible(r) && matchContent(r, reviewType, targetId, title);
    });
  }

  function listForProduct(prodId) {
    if (!prodId) return [];
    return load().filter(function (r) {
      if (!isAppVisible(r)) return false;
      if (normType(r) !== 'product') return false;
      return String(r.prodId) === String(prodId);
    });
  }

  function upsert(review) {
    var list = load();
    var item = cloneReview(review);
    if (!item || !item.id) return list;
    var found = false;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === String(item.id)) {
        list[i] = item;
        found = true;
        break;
      }
    }
    if (!found) list.unshift(item);
    return save(list);
  }

  function removeById(id) {
    var list = load().filter(function (r) { return String(r.id) !== String(id); });
    return save(list);
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function nowStamp() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
      pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function findByOrder(orderIdOrNo, profileOrderId) {
    var oid = String(orderIdOrNo || '');
    var pid = String(profileOrderId || '');
    var list = load();
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (normType(r) !== 'product') continue;
      if (pid && String(r._profileOrderId) === pid) return r;
      if (oid && String(r.orderId) === oid) return r;
    }
    return null;
  }

  /** App 订单评价 → 运营商品评价 */
  function upsertFromOrderReview(order, user) {
    if (!order) return null;
    user = user || {};
    var items = order.items || [];
    var first = items[0] || {};
    var existing = findByOrder(order.orderNo || order.id, order.id);
    var id = order.reviewId || (existing && existing.id) || ('APP-PJ' + Date.now());
    var name = user.nickName || user.nickname || '我';
    var payload = {
      id: id,
      reviewType: 'product',
      orderId: String(order.orderNo || order.id || ''),
      _profileOrderId: String(order.id || ''),
      _fromProfile: true,
      prodId: String(first.productId || first.id || ''),
      prodName: first.title || first.name || buildMultiName(items),
      prodCover: first.img || first.cover || '',
      content: order.reviewText || '用户未填写文字评价',
      images: [],
      rating: Number(order.reviewScore) || 5,
      reviewTime: order.reviewedAt || nowStamp(),
      reviewerName: name,
      reviewerId: user.id || '',
      reviewerAvatarText: String(name).charAt(0) || '我',
      spec: first.spec || first.subTitle || '标准装',
      price: Number(first.price) || Number(order.totalPrice) || 0,
      merchantName: '阅己美妆旗舰店',
      views: 0,
      auditStatus: (existing && existing.auditStatus) || '待审核',
      auditKey: (existing && existing.auditKey) || 'pending',
      replyName: (existing && existing.replyName) || '',
      replyTime: (existing && existing.replyTime) || '',
      replyContent: (existing && (existing.replyContent || existing.replyText)) || '',
      hidden: existing ? !!existing.hidden : false
    };
    upsert(payload);
    return cloneReview(payload);
  }

  function buildMultiName(items) {
    if (!items || !items.length) return '商品';
    if (items.length === 1) return items[0].title || items[0].name || '商品';
    return (items[0].title || items[0].name || '商品') + ' 等' + items.length + '件';
  }

  /** 运营回复/状态变化 → 回写个人订单评价字段 */
  function syncRepliesToProfileOrders() {
    var orders = [];
    if (typeof ProfileOrderStore !== 'undefined' && ProfileOrderStore.load) {
      orders = ProfileOrderStore.load() || [];
    } else {
      try {
        var raw = localStorage.getItem('zhuangyan_profile_orders_v1');
        if (raw) orders = JSON.parse(raw) || [];
      } catch (eLoad) { return false; }
    }
    if (!Array.isArray(orders) || !orders.length) return false;
    var allReviews = load();
    var changed = false;
    var next = orders.map(function (o) {
      if (!o.reviewed && !o.reviewId) return o;
      var r = findByOrder(o.orderNo || o.id, o.id);
      if (!r && o.reviewId) {
        for (var i = 0; i < allReviews.length; i++) {
          if (String(allReviews[i].id) === String(o.reviewId)) {
            r = allReviews[i];
            break;
          }
        }
      }
      if (!r) return o;
      var copy = Object.assign({}, o);
      var reply = r.replyContent || r.replyText || '';
      if (String(copy.reviewId || '') !== String(r.id)) {
        copy.reviewId = r.id;
        changed = true;
      }
      if (String(copy.reviewReply || '') !== String(reply)) {
        copy.reviewReply = reply;
        copy.reviewReplyName = r.replyName || '';
        copy.reviewReplyTime = r.replyTime || '';
        changed = true;
      }
      if (r.hidden || r.auditKey === 'block') {
        if (!copy.reviewHidden) { copy.reviewHidden = true; changed = true; }
      } else if (copy.reviewHidden) {
        copy.reviewHidden = false;
        changed = true;
      }
      return copy;
    });
    if (!changed) return false;
    if (typeof ProfileOrderStore !== 'undefined' && ProfileOrderStore.save) {
      ProfileOrderStore.save(next);
    } else {
      try {
        localStorage.setItem('zhuangyan_profile_orders_v1', JSON.stringify(next));
      } catch (eSave) { /* ignore */ }
      try {
        if (global.parent && global.parent !== global) {
          global.parent.postMessage({ type: 'profile-order-sync', orders: next, source: 'review-reply' }, '*');
        }
      } catch (ePost) { /* ignore */ }
      if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.broadcast) {
        try { ProfileOrderSync.broadcast(next); } catch (eBc) {}
      }
    }
    return true;
  }

  /* —— 按商品管理列表生成多样商品评价 —— */
  var REVIEW_AVATARS = [
    { bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
    { bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
    { bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { bg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)' },
    { bg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)' },
    { bg: 'linear-gradient(135deg,#FFEDD5,#FED7AA)' },
    { bg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)' }
  ];

  function hashStr(s) {
    var h = 0;
    var str = String(s || '');
    for (var i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function pick(arr, seed) {
    if (!arr || !arr.length) return null;
    return arr[seed % arr.length];
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function reviewTimeFromSeed(seed, dayOffset) {
    var d = new Date(2026, 7, 28, 10, 0, 0);
    d.setDate(d.getDate() - ((seed + (dayOffset || 0)) % 90));
    d.setHours(8 + (seed % 14), (seed * 7) % 60, (seed * 13) % 60);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function buildSpecFromProduct(p) {
    if (!p) return '标准装';
    if (p.spec) return String(p.spec);
    var parts = [];
    if (p.brand) parts.push(p.brand);
    if (p.cat3 || p.cat2) parts.push(p.cat3 || p.cat2);
    if (p.sku) parts.push(p.sku);
    return parts.length ? parts.join(' · ') : '标准装';
  }

  function coverOfProduct(p) {
    if (!p) return '';
    return p.cover || p.coverUrl || p.syncCover || '';
  }

  function catKeyOf(p) {
    var blob = [p.cat1, p.cat2, p.cat3, p.name, p.brand].join(' ');
    if (/口红|唇釉|唇膏|唇彩/.test(blob)) return 'lip';
    if (/粉底|气垫|遮瑕|BB|CC/.test(blob)) return 'base';
    if (/眼影|腮红|眉笔|睫毛/.test(blob)) return 'eye';
    if (/香水|香氛/.test(blob)) return 'perfume';
    if (/洁面|洗面奶|洗颜/.test(blob)) return 'clean';
    if (/面膜/.test(blob)) return 'mask';
    if (/眼霜/.test(blob)) return 'eyeCream';
    if (/面霜|乳液|身体乳/.test(blob)) return 'cream';
    if (/防晒|喷雾/.test(blob)) return 'sun';
    if (/精华|安瓶|次抛/.test(blob)) return 'serum';
    if (/礼盒|套装|试用/.test(blob)) return 'set';
    return 'general';
  }

  function contentTemplates(cat, name, brand) {
    var n = name || '这款';
    var b = brand || '这个品牌';
    var map = {
      lip: [
        { rating: 5, text: '色号超级显白！「' + n + '」上嘴柔雾不拔干，通勤约会都能用，已经回购第二支了。', imgs: 2 },
        { rating: 4, text: b + '这支质地很舒服，显色度刚好，就是持久度一般，吃饭后需要补一下。包装颜值很高。', imgs: 1 },
        { rating: 5, text: '冲着色号买的，实物比图片更温柔～不沾杯表现还行，送人自用都合适。', imgs: 0 },
        { rating: 3, text: '颜色还行，但对我来说有点干，黄皮慎入偏暗的色。物流很快。', imgs: 0 },
        { rating: 2, text: '色差有点大，显唇纹，这个价位期望更高一点，先观望会不会退。', imgs: 1 }
      ],
      base: [
        { rating: 5, text: '「' + n + '」妆感自然不假白，遮瑕中等，夏天持妆还能看，粉扑也好用。', imgs: 2 },
        { rating: 4, text: '上脸奶油肌很加分，4 小时后 T 区略油，定妆后就稳了。色号选对很重要。', imgs: 1 },
        { rating: 3, text: '遮瑕力一般，毛孔遮不住，混油皮建议搭配散粉。包装精致。', imgs: 0 },
        { rating: 2, text: '两小时后有点暗沉氧化，比脖子黄一圈，有点失望。', imgs: 1 },
        { rating: 5, text: '专柜同款，到手是正品。养肤底妆党友好，日常淡妆足够了。', imgs: 0 }
      ],
      eye: [
        { rating: 5, text: '配色绝了！珠光闪片很高级，日常+约会妆都能盘，粉质细。', imgs: 2 },
        { rating: 4, text: '颜色美，就是有点飞粉，建议先打底再晕染。性价比还不错。', imgs: 1 },
        { rating: 5, text: '「' + n + '」新手也能画出层次，哑光+珠光搭配合理，会回购。', imgs: 0 },
        { rating: 3, text: '部分色比较近，实用性一般，闪片掉渣略严重。', imgs: 0 }
      ],
      perfume: [
        { rating: 5, text: '前调清新后面木质调很有韵味，留香久，瓶子放梳妆台当装饰也值了。', imgs: 2 },
        { rating: 4, text: b + '这支东方香调很特别，不是大众甜香。喷两下就够，浓度可以。', imgs: 1 },
        { rating: 3, text: '味道个人偏好吧，我朋友觉得偏浓，自用还行。', imgs: 0 }
      ],
      clean: [
        { rating: 5, text: '洗完不紧绷！泡沫绵密，敏感肌也能用，「' + n + '」已回购第三次。', imgs: 2 },
        { rating: 4, text: '温和是真温和，早上用刚刚好；晚上卸妆后清洁力稍弱一点。', imgs: 0 },
        { rating: 5, text: '按压头超方便，无皂基味道清爽，全家都能用。', imgs: 1 },
        { rating: 3, text: '清洁力偏弱，油皮可能不够；干敏皮会觉得友好。', imgs: 0 }
      ],
      mask: [
        { rating: 5, text: '精华超级多，敷完脸滑溜溜，第二天底妆更服帖。节日囤货很香。', imgs: 1 },
        { rating: 4, text: '补水明显，敏感肌没刺痛。就是单片有点贵，大促再入划算。', imgs: 0 },
        { rating: 5, text: '「' + n + '」名不虚传，急救日敷一张状态立刻回来。', imgs: 2 },
        { rating: 3, text: '保湿可以，修护谈不上很强，适合日常维稳。', imgs: 0 }
      ],
      eyeCream: [
        { rating: 5, text: '熬夜党救星，涂完第二天黑眼圈没那么重，质地清爽不油。', imgs: 1 },
        { rating: 4, text: '抗蓝光要长期才看得出，保湿在线。价位偏高，蹲活动。', imgs: 0 },
        { rating: 2, text: '效果一般，一周降价又心塞，希望有价保说明更清楚。', imgs: 1 }
      ],
      cream: [
        { rating: 5, text: '润而不腻，第二天脸软软的。秋冬空调房本命面霜。', imgs: 1 },
        { rating: 4, text: '滋润度够，混油夏天略负担，冬天绝了。香味高级。', imgs: 0 },
        { rating: 5, text: '敏感换季厚敷一层，泛红起皮第二天好多了，已安利闺蜜。', imgs: 2 },
        { rating: 3, text: '味道偏重，无香党可能不习惯；肤感还行。', imgs: 0 }
      ],
      serum: [
        { rating: 5, text: '用了两周毛孔更细腻，吸收快不闷痘。「' + n + '」值这个价。', imgs: 2 },
        { rating: 4, text: '提亮有感，淡斑要更久。肤感清爽，可叠层。', imgs: 1 },
        { rating: 5, text: '和专柜对比过是正品。泛红舒缓很快，冷链发货很用心。', imgs: 2 },
        { rating: 2, text: '两周没看到预期效果，这个价位有点失望，可能不适合我。', imgs: 0 },
        { rating: 3, text: '质地不错，功效中规中矩，建议先买小样试。', imgs: 0 }
      ],
      sun: [
        { rating: 5, text: '轻薄不泛白，通勤够用，出汗也不易花妆。', imgs: 1 },
        { rating: 4, text: '清爽是真清爽，敏肌没闷痘。防晒力日常 OK。', imgs: 0 },
        { rating: 3, text: '成膜略黏，夏天要控量。', imgs: 0 }
      ],
      set: [
        { rating: 5, text: '礼盒包装好看，当礼物妈妈超开心，里面单品也能用得上。', imgs: 2 },
        { rating: 4, text: '试用装份量够体验，方便判断适不适合再回购正装。', imgs: 0 },
        { rating: 5, text: '套装比单买划算，旅行出差带着方便。', imgs: 1 }
      ],
      general: [
        { rating: 5, text: '「' + n + '」整体超出预期，包装完整物流快，会继续关注 ' + b + '。', imgs: 1 },
        { rating: 4, text: '质量不错，性价比可以，细节再打磨就更完美了。', imgs: 0 },
        { rating: 5, text: '回购选手！用着顺手，身边朋友也在问链接。', imgs: 2 },
        { rating: 3, text: '中规中矩，没有翻车也没有惊喜，观望下次活动。', imgs: 0 },
        { rating: 2, text: '和描述有点差距，客服态度还行，先给两星看后续。', imgs: 1 },
        { rating: 1, text: '不太满意，已申请售后。建议想买的再等等真实长评。', imgs: 0 }
      ]
    };
    return map[cat] || map.general;
  }

  function replyForRating(rating, brand) {
    var b = brand || '本店';
    if (rating >= 5) {
      return {
        name: '客服小美',
        content: '亲爱的，感谢真实晒单！看到您喜欢' + b + '我们超开心～后续活动会优先提醒老客，继续回购稳稳的～'
      };
    }
    if (rating === 4) {
      return {
        name: '客服小紫',
        content: '谢谢反馈！您提到的小遗憾我们已记录给产品组，大促时也会有满减+小样，欢迎再来～'
      };
    }
    if (rating === 3) {
      return {
        name: '客服小美',
        content: '感谢中肯评价～若使用上有疑问可随时私信，我们帮您看看是否手法/肤质匹配问题。'
      };
    }
    return {
      name: '运营管家',
      content: '非常抱歉没达到预期！已登记跟进，如需退换可提交售后，我们会尽快处理并补偿体验券。'
    };
  }

  function defaultReviewers() {
    return [
      { id: 'U20240105', nickName: '林予安' }, { id: 'U20240088', nickName: '沈清欢' },
      { id: 'U20240256', nickName: '顾惜月' }, { id: 'U20240032', nickName: '叶知夏' },
      { id: 'U20240102', nickName: '苏念初' }, { id: 'U20240501', nickName: '温以柔' },
      { id: 'U20240322', nickName: '江晚宁' }, { id: 'U20240608', nickName: '陆星眠' },
      { id: 'U20240178', nickName: '许清禾' }, { id: 'U20240901', nickName: '程予薇' },
      { id: 'U20240208', nickName: '宋软软' }, { id: 'U20240612', nickName: '方知予' },
      { id: 'U20240076', nickName: '唐小鹿' }, { id: 'U20241102', nickName: '梁慕白' },
      { id: 'U20241156', nickName: '韩以安' }, { id: 'U20240334', nickName: '谢星河' },
      { id: 'U20240442', nickName: '赵浅予' }, { id: 'U20240778', nickName: '周南枝' },
      { id: 'U20240888', nickName: '陈初雪' }, { id: 'U20240236', nickName: '吴晚棠' },
      { id: 'U20241220', nickName: '郑予欢' }, { id: 'U20241312', nickName: '何清禾' },
      { id: 'U20241444', nickName: '金琉璃' }, { id: 'U20241558', nickName: '夏念安' },
      { id: 'U20241668', nickName: '姚慕晴' }
    ];
  }

  function buildProductReviewsFromProducts(products, users, opts) {
    opts = opts || {};
    var list = Array.isArray(products) ? products : [];
    var reviewers = (users && users.length) ? users : defaultReviewers();
    var per = opts.perProduct != null ? opts.perProduct : 2;
    if (per < 1) per = 1;
    if (per > 3) per = 3;
    var imgFn = typeof opts.imgFn === 'function' ? opts.imgFn : null;
    var out = [];
    var seq = 0;

    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || !(p.id || p.sku)) continue;
      var pid = String(p.id || p.sku);
      var seed0 = hashStr(pid);
      var cat = catKeyOf(p);
      var templates = contentTemplates(cat, p.name, p.brand);
      var count = 1 + (seed0 % per);
      if (count > templates.length) count = templates.length;

      for (var k = 0; k < count; k++) {
        var seed = seed0 + k * 97 + i * 3;
        var tpl = pick(templates, seed + k * 11) || templates[0];
        var user = pick(reviewers, seed + 5) || defaultReviewers()[0];
        var av = pick(REVIEW_AVATARS, seed) || REVIEW_AVATARS[0];
        var nick = user.nickName || user.nickname || ('用户' + (seed % 1000));
        var uid = user.id || ('U' + (20000000 + (seed % 900000)));
        var auditRoll = seed % 10;
        var auditStatus = '审核通过';
        var auditKey = 'pass';
        if (auditRoll === 0) { auditStatus = '待审核'; auditKey = 'pending'; }
        else if (auditRoll === 1 && tpl.rating <= 2) { auditStatus = '已屏蔽'; auditKey = 'block'; }

        var images = [];
        if (tpl.imgs > 0 && imgFn) {
          for (var im = 0; im < tpl.imgs; im++) {
            var u = imgFn(seed + im, p, tpl);
            if (u) images.push(u);
          }
        } else if (tpl.imgs > 0 && coverOfProduct(p)) {
          images.push(coverOfProduct(p));
          if (tpl.imgs > 1) images.push(coverOfProduct(p));
        }

        var id = 'PJCAT' + pad2((seed % 28) + 1) + pad2((seed % 12) + 1) +
          String(100000 + ((seed + seq) % 900000));
        seq++;

        var item = {
          id: id,
          reviewType: 'product',
          targetId: pid,
          prodId: pid,
          prodName: p.name || '',
          prodCover: coverOfProduct(p),
          content: tpl.text,
          images: images,
          video: '',
          rating: tpl.rating,
          reviewTime: reviewTimeFromSeed(seed, k * 3),
          reviewerName: nick,
          reviewerId: uid,
          reviewerAvatarBg: av.bg,
          reviewerAvatarText: nick.charAt(0) || '评',
          spec: buildSpecFromProduct(p),
          price: Number(p.price) || 0,
          merchantName: p.merchant || p.merchantName || '',
          views: 200 + (seed % 80000),
          auditStatus: auditStatus,
          auditKey: auditKey,
          replyName: '',
          replyTime: '',
          replyContent: '',
          replyText: '',
          _fromCatalog: true
        };

        if (auditKey === 'pass' && (seed % 5 !== 0 || tpl.rating <= 2)) {
          var rp = replyForRating(tpl.rating, p.brand || p.merchant);
          item.replyName = rp.name;
          item.replyContent = rp.content;
          item.replyText = rp.content;
          item.replyTime = reviewTimeFromSeed(seed + 3, k);
        } else if (auditKey === 'pending' && tpl.rating <= 2 && seed % 2 === 0) {
          var rp2 = replyForRating(tpl.rating, p.brand || p.merchant);
          item.replyName = rp2.name;
          item.replyContent = rp2.content;
          item.replyText = rp2.content;
          item.replyTime = reviewTimeFromSeed(seed + 4, k);
        }

        out.push(item);
      }
    }
    out.sort(function (a, b) {
      return String(b.reviewTime || '').localeCompare(String(a.reviewTime || ''));
    });
    return out;
  }

  function syncProductReviewsWithCatalog(allReviews, products, users, opts) {
    var kept = [];
    var existing = Array.isArray(allReviews) ? allReviews : [];
    for (var i = 0; i < existing.length; i++) {
      var r = existing[i];
      if (!r) continue;
      if (normType(r) !== 'product') {
        kept.push(r);
        continue;
      }
      if (r._fromProfile || r.orderId || r._profileOrderId) kept.push(r);
    }
    var generated = buildProductReviewsFromProducts(products, users, opts);
    return generated.concat(kept);
  }

  global.ReviewStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    requestSync: requestSync,
    clone: cloneReview,
    normType: normType,
    appTypeToReviewType: appTypeToReviewType,
    isAppVisible: isAppVisible,
    listForContent: listForContent,
    countForContent: countForContent,
    listForProduct: listForProduct,
    upsert: upsert,
    removeById: removeById,
    findByOrder: findByOrder,
    upsertFromOrderReview: upsertFromOrderReview,
    syncRepliesToProfileOrders: syncRepliesToProfileOrders,
    buildProductReviewsFromProducts: buildProductReviewsFromProducts,
    syncProductReviewsWithCatalog: syncProductReviewsWithCatalog
  };
})(typeof window !== 'undefined' ? window : this);
