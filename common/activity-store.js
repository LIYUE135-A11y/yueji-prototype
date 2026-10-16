/**
 * 活动列表 · 运营后台 ↔ App 发现-活动同步（满减/满折）
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_activity_list_v2';
  var STORAGE_KEY_LEGACY = 'zhuangyan_activity_list_v1';
  var SYNC_MSG = 'activity-sync';
  var REQUEST_MSG = 'activity-request-sync';

  var APP_COVER_FILES = [
    'product-trial-1.jpg',
    'lipstick-1.jpg',
    'lipstick-2.jpg',
    'lipstick-3.jpg',
    'product-trial-2.jpg',
    'lipstick-4.jpg'
  ];

  function num(v, d) { return v != null && v !== '' ? Number(v) : (d != null ? d : 0); }
  function str(v) { return v == null ? '' : String(v); }
  function cloneActivity(a) {
    a = a || {};
    return {
      id: a.id,
      type: str(a.type),
      typeKey: str(a.typeKey),
      status: str(a.status),
      statusKey: str(a.statusKey),
      name: str(a.name),
      subtitle: str(a.subtitle),
      description: str(a.description),
      ruleText: str(a.ruleText),
      coverUrl: str(a.coverUrl),
      bannerUrl: str(a.bannerUrl),
      startTime: str(a.startTime),
      endTime: str(a.endTime),
      preheatStart: str(a.preheatStart),
      preheatEnd: str(a.preheatEnd),
      discount: str(a.discount),
      thresholdAmount: num(a.thresholdAmount, 0),
      discountAmount: num(a.discountAmount, 0),
      discountRate: num(a.discountRate, 0),
      maxDiscount: num(a.maxDiscount, 0),
      limit: num(a.limit, 0),
      claimLimit: num(a.claimLimit, a.limit != null ? a.limit : 0),
      dailyLimit: num(a.dailyLimit, 1),
      stock: num(a.stock, 0),
      totalQuota: num(a.totalQuota, a.stock != null ? a.stock : 0),
      usedQuota: num(a.usedQuota, 0),
      remainQuota: num(a.remainQuota, 0),
      view: num(a.view, 0),
      join: num(a.join, 0),
      refund: num(a.refund, 0),
      refundRate: str(a.refundRate) || '0.0%',
      amount: num(a.amount, 0),
      orderCount: num(a.orderCount, 0),
      payCount: num(a.payCount, 0),
      payAmount: num(a.payAmount, a.amount != null ? a.amount : 0),
      avgOrderAmount: num(a.avgOrderAmount, 0),
      shareCount: num(a.shareCount, 0),
      collectCount: num(a.collectCount, 0),
      clickRate: str(a.clickRate) || '0.0%',
      convertRate: str(a.convertRate) || '0.0%',
      enabled: a.enabled !== false,
      productScope: str(a.productScope),
      userScope: str(a.userScope),
      productScopeDetail: str(a.productScopeDetail),
      userScopeDetail: str(a.userScopeDetail),
      categoryScope: str(a.categoryScope),
      brand: str(a.brand),
      merchantId: str(a.merchantId),
      merchantName: str(a.merchantName),
      channel: str(a.channel),
      scene: str(a.scene),
      budget: str(a.budget),
      budgetAmount: num(a.budgetAmount, 0),
      platformSubsidy: num(a.platformSubsidy, 0),
      merchantSubsidy: num(a.merchantSubsidy, 0),
      costAmount: num(a.costAmount, 0),
      profitAmount: num(a.profitAmount, 0),
      region: str(a.region),
      cityLimit: str(a.cityLimit),
      ageLimit: str(a.ageLimit),
      genderLimit: str(a.genderLimit),
      stackable: !!a.stackable,
      memberOnly: !!a.memberOnly,
      exclusivity: str(a.exclusivity),
      couponCode: str(a.couponCode),
      couponFaceValue: num(a.couponFaceValue, 0),
      couponThreshold: num(a.couponThreshold, 0),
      couponValidDays: num(a.couponValidDays, 0),
      giftName: str(a.giftName),
      giftSku: str(a.giftSku),
      giftStock: num(a.giftStock, 0),
      groupSize: num(a.groupSize, 0),
      groupHours: num(a.groupHours, 0),
      groupPrice: num(a.groupPrice, 0),
      seckillPrice: num(a.seckillPrice, 0),
      seckillStock: num(a.seckillStock, 0),
      seckillStartHour: str(a.seckillStartHour),
      landingPage: str(a.landingPage),
      shareTitle: str(a.shareTitle),
      shareDesc: str(a.shareDesc),
      notifyMode: str(a.notifyMode),
      notifySms: !!a.notifySms,
      notifyPush: !!a.notifyPush,
      priority: str(a.priority),
      sort: num(a.sort, 0),
      tag: str(a.tag),
      riskLevel: str(a.riskLevel),
      relatedCampaign: str(a.relatedCampaign),
      whiteList: str(a.whiteList),
      blackList: str(a.blackList),
      roi: num(a.roi, 0),
      owner: str(a.owner),
      department: str(a.department),
      creator: str(a.creator),
      createTime: str(a.createTime),
      updateTime: str(a.updateTime),
      publishTime: str(a.publishTime),
      auditStatus: str(a.auditStatus),
      auditKey: str(a.auditKey),
      auditor: str(a.auditor),
      auditTime: str(a.auditTime),
      auditRemark: str(a.auditRemark),
      remark: str(a.remark),
      source: str(a.source),
      seedVersion: str(a.seedVersion)
    };
  }

  var ACTIVITY_DEFAULTS = {
    '202506016': { typeKey: 'manjian', productScope: '指定商品', productScopeDetail: 'SP100001' },
    '202506018': { typeKey: 'manzhe', productScope: '指定商品', productScopeDetail: 'SP100002' }
  };

  function patchActivityDefaults(activity) {
    var item = cloneActivity(activity);
    var def = ACTIVITY_DEFAULTS[item.id];
    if (def) {
      if (!item.typeKey) item.typeKey = def.typeKey || resolveTypeKey(item);
      if (!item.productScope && def.productScope) item.productScope = def.productScope;
      if (!item.productScopeDetail && def.productScopeDetail) item.productScopeDetail = def.productScopeDetail;
    }
    if (!item.typeKey) item.typeKey = resolveTypeKey(item);
    return item;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(patchActivityDefaults);
        }
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    var snapshot = (list || []).map(cloneActivity);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, activities: (list || load()).map(cloneActivity) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('activity-updated', { detail: payload.activities }));
    } catch (e2) { /* ignore */ }
  }

  function filterForDiscoverApp(list) {
    return (list || []).filter(function (a) {
      var tk = resolveTypeKey(a);
      if (tk !== 'manjian' && tk !== 'manzhe') return false;
      if (a.enabled === false) return false;
      if (a.statusKey === 'ended') return false;
      return true;
    });
  }

  function coverIndexFromId(id) {
    var str = String(id || '');
    var sum = 0;
    for (var i = 0; i < str.length; i++) sum += str.charCodeAt(i);
    return sum % APP_COVER_FILES.length;
  }

  function resolveCover(activity, imgBase) {
    var base = imgBase || 'static/images/';
    if (base.charAt(base.length - 1) !== '/') base += '/';
    var file = APP_COVER_FILES[coverIndexFromId(activity && activity.id)];
    return base + file;
  }

  function extractDisplayPrice(activity) {
    if (!activity) return '0';
    var discount = String(activity.discount || '');
    if (activity.typeKey === 'manjian') {
      var off = discount.match(/减(\d+(?:\.\d+)?)/);
      if (off) return off[1];
    }
    if (activity.typeKey === 'manzhe') {
      var fold = discount.match(/打([\d.]+)折/);
      if (fold) return fold[1];
    }
    return '0';
  }

  function buildSubTitle(activity) {
    if (!activity) return '';
    var parts = [];
    if (activity.discount) parts.push(activity.discount);
    if (activity.startTime && activity.endTime) {
      parts.push(activity.startTime + ' — ' + activity.endTime);
    }
    return parts.join(' · ') || activity.productScope || '限时优惠';
  }

  function buildDesc(activity) {
    if (!activity) return '';
    return [
      activity.name,
      activity.discount,
      '适用商品：' + (activity.productScope || '全部商品'),
      '适用用户：' + (activity.userScope || '全部用户')
    ].filter(Boolean).join('，');
  }

  function resolveProductIdFromCoverIndex(id) {
    var file = APP_COVER_FILES[coverIndexFromId(id)];
    var map = {
      'product-trial-1.jpg': 'p1',
      'product-trial-2.jpg': 'p1',
      'lipstick-1.jpg': 'p2',
      'lipstick-2.jpg': 'p3',
      'lipstick-3.jpg': 'p4',
      'lipstick-4.jpg': 'p4'
    };
    return map[file] || 'p1';
  }

  function resolveProductId(activity) {
    if (!activity) return 'p1';
    var detail = String(activity.productScopeDetail || '');
    if (detail) {
      var urlMatch = detail.match(/[?&]id=([^&|#\s]+)/i);
      if (urlMatch) return urlMatch[1];
      var spMatch = detail.match(/\b(SP\d+)\b/i);
      if (spMatch) return spMatch[1];
      var parts = detail.split(/[,，|]/);
      for (var pi = 0; pi < parts.length; pi++) {
        var token = String(parts[pi] || '').trim();
        if (/^(SP\d+|p\d+)$/i.test(token)) return token;
      }
    }
    return resolveProductIdFromCoverIndex(activity.id);
  }

  function activityMatchesProduct(activity, productId, productMeta) {
    productMeta = productMeta || {};
    if (!activity || activity.enabled === false) return false;
    if (activity.statusKey === 'ended') return false;
    var typeKey = resolveTypeKey(activity);
    if (typeKey !== 'manjian' && typeKey !== 'manzhe') return false;
    var scope = activity.productScope || '全部商品';
    var pid = String(productId || '');
    var detail = String(activity.productScopeDetail || '');
    if (scope === '全部商品') return true;
    if (scope === '指定商品') {
      if (detail && pid && detail.indexOf(pid) >= 0) return true;
      var urlMatch = detail.match(/[?&]id=([^&|#\s]+)/i);
      if (urlMatch && urlMatch[1] === pid) return true;
      return false;
    }
    if (scope === '指定分类') {
      var cats = [productMeta.cat1, productMeta.cat2, productMeta.cat3, productMeta.brand, productMeta.subTitle];
      for (var ci = 0; ci < cats.length; ci++) {
        if (cats[ci] && detail.indexOf(String(cats[ci])) >= 0) return true;
      }
      return detail.length > 0 && cats.length > 0;
    }
    return false;
  }

  function mapActivityToCoupon(activity) {
    var typeKey = resolveTypeKey(activity);
    var discount = activity.discount || '';
    return {
      id: activity.id,
      activityId: activity.id,
      type: activity.type || '优惠',
      typeKey: typeKey,
      title: activity.name || '',
      discount: discount,
      tag: formatCouponTag(discount, typeKey),
      desc: buildSubTitle(activity),
      limit: activity.limit || 0,
      stock: activity.stock || 0,
      startTime: activity.startTime || '',
      endTime: activity.endTime || '',
      productScope: activity.productScope || ''
    };
  }

  function isOngoingActivity(activity) {
    if (!activity) return false;
    return activity.statusKey === 'ongoing' || activity.status === '进行中';
  }

  function scopePriority(scope) {
    if (scope === '指定商品') return 3;
    if (scope === '指定分类') return 2;
    return 1;
  }

  function sortCouponsForProduct(coupons) {
    return coupons.slice().sort(function (a, b) {
      return scopePriority(b.productScope) - scopePriority(a.productScope);
    });
  }

  function getCouponsForProduct(productId, productMeta, list) {
    var activities = list || load();
    var out = [];
    for (var i = 0; i < activities.length; i++) {
      var act = activities[i];
      if (isOngoingActivity(act) && activityMatchesProduct(act, productId, productMeta)) {
        out.push(mapActivityToCoupon(act));
      }
    }
    return sortCouponsForProduct(out);
  }

  function getPrimaryCouponTag(productId, productMeta, list) {
    var coupons = getCouponsForProduct(productId, productMeta, list);
    return coupons.length ? coupons[0].tag : '';
  }

  var CLAIMED_COUPON_KEY = 'zhuangyan_claimed_coupons_v1';

  function loadClaimedCouponIds() {
    try {
      var raw = localStorage.getItem(CLAIMED_COUPON_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  var CLAIMED_SYNC_MSG = 'claimed-coupon-sync';
  var CLAIMED_REQUEST_MSG = 'claimed-coupon-request-sync';

  function broadcastClaimed(ids) {
    var list = ids || loadClaimedCouponIds();
    var payload = { type: CLAIMED_SYNC_MSG, claimedIds: list };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('coupon-claimed', { detail: { ids: list } }));
    } catch (e2) { /* ignore */ }
  }

  function saveClaimedCouponIds(ids) {
    var snapshot = (ids || []).map(String);
    var uniq = [];
    var seen = {};
    for (var i = 0; i < snapshot.length; i++) {
      var id = snapshot[i];
      if (!id || seen[id]) continue;
      seen[id] = true;
      uniq.push(id);
    }
    try {
      localStorage.setItem(CLAIMED_COUPON_KEY, JSON.stringify(uniq));
    } catch (e) { /* ignore */ }
    broadcastClaimed(uniq);
    return uniq;
  }

  function removeClaimedCoupon(id) {
    var key = String(id || '');
    if (!key) return loadClaimedCouponIds();
    return saveClaimedCouponIds(loadClaimedCouponIds().filter(function (x) {
      return String(x) !== key;
    }));
  }

  /** 下单使用后：从已领列表移除 */
  function markCouponUsed(couponId) {
    return removeClaimedCoupon(couponId);
  }

  /** 领取成功时给对应活动 join +1，并通过 activity-sync 回写运营端 */
  function bumpActivityJoin(couponId) {
    var id = String(couponId || '');
    if (!id) return;
    var list = load();
    var changed = false;
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].id) === id) {
        list[i].join = (Number(list[i].join) || 0) + 1;
        changed = true;
        break;
      }
    }
    if (changed) save(list);
  }

  function claimCoupon(couponId) {
    var id = String(couponId || '');
    if (!id) return loadClaimedCouponIds();
    var ids = loadClaimedCouponIds();
    var isNew = ids.indexOf(id) < 0;
    if (isNew) {
      ids.push(id);
      saveClaimedCouponIds(ids);
      bumpActivityJoin(id);
    }
    return loadClaimedCouponIds();
  }

  function isCouponClaimed(couponId) {
    return loadClaimedCouponIds().indexOf(String(couponId || '')) >= 0;
  }

  function requestClaimedSync() {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: CLAIMED_REQUEST_MSG }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  function resolveTypeKey(activity) {
    if (!activity) return '';
    if (activity.typeKey) return activity.typeKey;
    var t = String(activity.type || '');
    if (t.indexOf('满折') >= 0 || t === 'manzhe') return 'manzhe';
    if (t.indexOf('满减') >= 0 || t === 'manjian') return 'manjian';
    return '';
  }

  function parseDiscountRule(discount, typeKey) {
    var text = String(discount || '').replace(/\s*等\d+档.*$/, '').trim();
    var key = typeKey || '';
    if (!key) {
      if (/打\s*[\d.]+\s*折/.test(text)) key = 'manzhe';
      else if (/减\s*\d/.test(text)) key = 'manjian';
    }
    if (key === 'manzhe') {
      var mz = text.match(/满\s*(\d+(?:\.\d+)?)\s*打\s*([\d.]+)\s*折/);
      if (mz) {
        return {
          typeKey: 'manzhe',
          threshold: Number(mz[1]),
          rate: Number(mz[2]) / 10,
          tag: '满' + mz[1] + '打' + mz[2] + '折'
        };
      }
      return null;
    }
    var mj = text.match(/满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/);
    if (mj) {
      return {
        typeKey: 'manjian',
        threshold: Number(mj[1]),
        reduce: Number(mj[2]),
        tag: '满' + mj[1] + '减' + mj[2]
      };
    }
    return null;
  }

  function formatCouponTag(discount, typeKey) {
    var rule = parseDiscountRule(discount, typeKey);
    if (rule) return rule.tag;
    return String(discount || '').replace(/\s*等\d+档.*$/, '').trim();
  }

  function calcDiscountedPrice(basePrice, coupon) {
    var price = Number(basePrice) || 0;
    if (!coupon) return price;
    var rule = coupon.rule || parseDiscountRule(coupon.discount, coupon.typeKey);
    if (!rule) return price;
    if (rule.typeKey === 'manzhe') {
      if (price >= rule.threshold) return Math.max(0, Math.round(price * rule.rate));
      return price;
    }
    if (price >= rule.threshold) return Math.max(0, price - rule.reduce);
    return price;
  }

  function buildClaimedCouponObj(c) {
    var rule = parseDiscountRule(c.discount, c.typeKey);
    return {
      id: c.id,
      typeKey: c.typeKey,
      discount: c.discount,
      tag: rule ? rule.tag : (c.tag || c.discount),
      rule: rule
    };
  }

  function getClaimedCouponForProduct(productId, productMeta, list, basePrice) {
    var claimed = loadClaimedCouponIds();
    var coupons = getCouponsForProduct(productId, productMeta, list);
    if (!coupons.length) return null;
    var primaryType = coupons[0].typeKey || resolveTypeKey(coupons[0]);
    var applicable = [];
    var i;
    for (i = 0; i < coupons.length; i++) {
      if (claimed.indexOf(String(coupons[i].id)) >= 0) applicable.push(coupons[i]);
    }
    if (!applicable.length) return null;
    var pool = [];
    if (primaryType) {
      for (i = 0; i < applicable.length; i++) {
        var tk = applicable[i].typeKey || resolveTypeKey(applicable[i]);
        if (tk === primaryType) pool.push(applicable[i]);
      }
    }
    if (!pool.length) pool = applicable;

    var best = null;
    var bestPrice = null;
    var numericBase = basePrice != null ? Number(basePrice) : null;
    for (i = 0; i < pool.length; i++) {
      var c = pool[i];
      var obj = buildClaimedCouponObj(c);
      if (numericBase != null && !isNaN(numericBase)) {
        var price = calcDiscountedPrice(numericBase, obj);
        if (best === null || price < bestPrice) {
          best = obj;
          bestPrice = price;
        }
      } else if (!best) {
        best = obj;
      }
    }
    return best;
  }

  function getDisplayCouponTag(productId, productMeta, list, basePrice) {
    var claimed = getClaimedCouponForProduct(productId, productMeta, list, basePrice);
    if (claimed) return claimed.tag || claimed.discount || '';
    return getPrimaryCouponTag(productId, productMeta, list);
  }

  function buildProductMetaFromCartItem(item) {
    if (!item) return {};
    var sub = String(item.subTitle || '');
    var brand = item.brand || sub.split('·')[0].replace(/^\s+|\s+$/g, '') || '';
    return {
      cat1: item.cat1 || '',
      cat2: item.cat2 || '',
      cat3: item.cat3 || item.spec || '',
      brand: brand,
      subTitle: item.subTitle || ''
    };
  }

  function applyClaimedCouponToPricing(basePrice, productId, productMeta, list) {
    var numericBase = Number(basePrice) || 0;
    var coupon = getClaimedCouponForProduct(productId, productMeta, list, numericBase);
    if (!coupon) {
      return {
        basePrice: numericBase,
        price: numericBase,
        couponId: '',
        couponTag: '',
        originPrice: String(Math.round(numericBase * 1.35))
      };
    }
    var discounted = calcDiscountedPrice(numericBase, coupon);
    return {
      basePrice: numericBase,
      price: discounted,
      couponId: String(coupon.id),
      couponTag: coupon.tag || coupon.discount || '',
      originPrice: String(numericBase)
    };
  }

  global.ActivityStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    CLAIMED_COUPON_KEY: CLAIMED_COUPON_KEY,
    CLAIMED_SYNC_MSG: CLAIMED_SYNC_MSG,
    CLAIMED_REQUEST_MSG: CLAIMED_REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneActivity: cloneActivity,
    patchActivityDefaults: patchActivityDefaults,
    filterForDiscoverApp: filterForDiscoverApp,
    resolveCover: resolveCover,
    extractDisplayPrice: extractDisplayPrice,
    buildSubTitle: buildSubTitle,
    buildDesc: buildDesc,
    resolveProductId: resolveProductId,
    activityMatchesProduct: activityMatchesProduct,
    getCouponsForProduct: getCouponsForProduct,
    getPrimaryCouponTag: getPrimaryCouponTag,
    resolveTypeKey: resolveTypeKey,
    formatCouponTag: formatCouponTag,
    getDisplayCouponTag: getDisplayCouponTag,
    mapActivityToCoupon: mapActivityToCoupon,
    loadClaimedCouponIds: loadClaimedCouponIds,
    saveClaimedCouponIds: saveClaimedCouponIds,
    broadcastClaimed: broadcastClaimed,
    requestClaimedSync: requestClaimedSync,
    claimCoupon: claimCoupon,
    isCouponClaimed: isCouponClaimed,
    markCouponUsed: markCouponUsed,
    removeClaimedCoupon: removeClaimedCoupon,
    parseDiscountRule: parseDiscountRule,
    calcDiscountedPrice: calcDiscountedPrice,
    getClaimedCouponForProduct: getClaimedCouponForProduct,
    buildProductMetaFromCartItem: buildProductMetaFromCartItem,
    applyClaimedCouponToPricing: applyClaimedCouponToPricing
  };
})(typeof window !== 'undefined' ? window : this);
