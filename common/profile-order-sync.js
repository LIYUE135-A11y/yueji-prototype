/**
 * App 个人订单 → 运营端订单管理列表 映射与同步
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_profile_orders_v1';
  var SYNC_MSG = 'profile-order-sync';
  var REQUEST_MSG = 'profile-order-request-sync';

  var DEFAULT_USER = {
    id: 'U20240076',
    nickname: '野稗子',
    avatarBg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)',
    avatarText: '野'
  };

  var DEFAULT_ORDER_STATE = {
    payStatus: '已支付',
    payStatusKey: 'paid',
    status: '待发货',
    statusKey: 'await',
    delivery: '普通快递',
    deliveryStatus: '待发货',
    deliveryStatusKey: 'await'
  };

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatOrderTime(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function payMethodKey(method) {
    var m = String(method || '');
    if (m.indexOf('支付宝') >= 0) return 'alipay';
    if (m.indexOf('银行卡') >= 0) return 'card';
    if (m.indexOf('余额') >= 0) return 'balance';
    if (m.indexOf('货到付款') >= 0) return 'cod';
    return 'wechat';
  }

  function buildProdName(items) {
    if (!items || !items.length) return '商品';
    var first = resolveOrderItemProduct(items[0], null);
    var title = first.title || '商品';
    if (items.length === 1) return title;
    return title + ' 等' + items.length + '件';
  }

  function isPromoLikeTitle(title) {
    var t = String(title || '').trim();
    if (!t) return true;
    if (/满减|满折|首单|女王节|双十一|双12|双十二|优惠券|活动券|限时抢|限时特惠|快来抢/.test(t)) return true;
    if (/^(新人|会员|全场|店铺).{0,8}(专享|优惠|活动|促销)/.test(t)) return true;
    if (t.length <= 14 && /(活动|促销|专场|补贴)$/.test(t)) return true;
    return false;
  }

  function loadProductCatalog() {
    try {
      if (typeof global.ProductStore !== 'undefined' && global.ProductStore.load) {
        var list = global.ProductStore.mergeAppProducts
          ? global.ProductStore.mergeAppProducts(global.ProductStore.load())
          : global.ProductStore.load();
        if (list && list.length) return list;
      }
    } catch (e) { /* ignore */ }
    try {
      var raw = localStorage.getItem('zhuangyan_product_list_v1');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e2) { /* ignore */ }
    return [];
  }

  function findCatalogProduct(skuOrId) {
    var key = String(skuOrId || '').trim();
    if (!key) return null;
    var list = loadProductCatalog();
    if (typeof global.ProductStore !== 'undefined' && global.ProductStore.findProduct) {
      var hit = global.ProductStore.findProduct(list, key, '');
      if (hit) return hit;
    }
    var lower = key.toLowerCase();
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p) continue;
      if (String(p.id).toLowerCase() === lower || String(p.sku || '').toLowerCase() === lower) return p;
    }
    // SP 编码在 App 商品库未加载时，回退到 App 种子商品，避免活动名占位
    if (/^sp\d+$/i.test(key) && typeof global.ProductStore !== 'undefined' && global.ProductStore.getAppProductSeed) {
      var seed = global.ProductStore.getAppProductSeed() || [];
      if (seed.length) {
        var num = parseInt(key.replace(/\D/g, ''), 10) || 1;
        return seed[(Math.max(num, 1) - 1) % seed.length];
      }
    }
    return null;
  }

  /** 订单行商品信息：优先真实商品名，避免活动名占位 */
  function resolveOrderItemProduct(item, adminRow) {
    item = item || {};
    var next = Object.assign({}, item);
    var adminName = adminRow ? String(adminRow.prodName || '') : '';
    var adminSku = adminRow ? String(adminRow.prodSku || '') : '';
    var adminCover = adminRow ? String(adminRow.prodCover || '') : '';
    var catalog = findCatalogProduct(next.productId || next.id || adminSku);

    var title = String(next.title || next.name || '');
    if (adminName && !isPromoLikeTitle(adminName) && !/\s*等\d+件$/.test(adminName)) {
      title = adminName;
    } else if (isPromoLikeTitle(title) && catalog && catalog.name) {
      title = catalog.name;
    } else if (isPromoLikeTitle(title) && adminName && !isPromoLikeTitle(adminName)) {
      title = adminName;
    } else if (isPromoLikeTitle(title)) {
      // 仍像活动名：尽量用商品库，否则保留原值（不再用活动名回写）
      if (catalog && catalog.name) title = catalog.name;
    }

    next.title = title || (catalog && catalog.name) || '商品';
    if (adminCover) next.img = adminCover;
    else if ((!next.img || isPromoLikeTitle(String(item.title || ''))) && catalog) {
      if (typeof global.ProductStore !== 'undefined' && global.ProductStore.resolveCover) {
        next.img = global.ProductStore.resolveCover(catalog, '../运营管理系统/static/products/') || next.img;
      } else if (catalog.cover || catalog.coverUrl) {
        next.img = catalog.cover || catalog.coverUrl;
      }
    }
    if (catalog) {
      if (!next.productId) next.productId = String(catalog.id || catalog.sku || '');
      if (!next.subTitle || next.subTitle === '标准装' || isPromoLikeTitle(String(item.subTitle || ''))) {
        var brand = catalog.brand || '';
        var spec = catalog.cat3 || catalog.cat2 || '标准装';
        next.subTitle = brand ? (brand + ' · ' + spec) : spec;
      }
      if (adminRow && Number(adminRow.prodQty) > 0) {
        // qty handled by caller
      } else if (!next.quantity) {
        next.quantity = 1;
      }
    }
    // 活动名挪到券标签，不占商品标题
    var oldTitle = String(item.title || '');
    if (isPromoLikeTitle(oldTitle) && !next.couponTag) {
      next.couponTag = oldTitle;
    }
    return next;
  }

  function enrichOrderProducts(order, adminRow) {
    order = normalizeProfileOrder(order);
    adminRow = adminRow || findAdminRowForProfileOrder(order);
    var items = (order.items || []).map(function (it, idx) {
      var row = idx === 0 ? adminRow : null;
      var fixed = resolveOrderItemProduct(it, row);
      if (idx === 0 && adminRow && Number(adminRow.prodQty) > 0) {
        fixed.quantity = Number(adminRow.prodQty);
      }
      if (idx === 0 && adminRow && adminRow.orderAmount != null && (order.items || []).length === 1) {
        var qty = Number(fixed.quantity) || 1;
        fixed.price = String(Math.round((Number(adminRow.orderAmount) / qty) * 100) / 100);
      }
      return fixed;
    });
    if (!items.length && adminRow) {
      var seed = resolveOrderItemProduct({
        productId: adminRow.prodSku || '',
        title: adminRow.prodName || '',
        img: adminRow.prodCover || '',
        price: String(Number(adminRow.orderAmount) || 0),
        quantity: Number(adminRow.prodQty) || 1
      }, adminRow);
      items = [seed];
    }
    order.items = items;
    return order;
  }

  function buildRemark(order) {
    var items = order.items || [];
    var tags = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].couponTag && tags.indexOf(items[i].couponTag) < 0) {
        tags.push(items[i].couponTag);
      }
    }
    var parts = ['App个人中心 · 我的购物车'];
    if (tags.length) parts.push('券：' + tags.join('、'));
    return parts.join(' · ');
  }

  function normalizeProfileOrder(order) {
    if (!order) return order;
    var o = Object.assign({}, order);
    if (!o.payStatus) {
      o.payStatus = DEFAULT_ORDER_STATE.payStatus;
      o.payStatusKey = DEFAULT_ORDER_STATE.payStatusKey;
    }
    // 兼容旧数据：status=已支付 表示已付款待发货；status=已付款 保持独立展示态
    if (o.status === '已支付') {
      o.payStatus = '已支付';
      o.payStatusKey = 'paid';
      o.status = '待发货';
      o.statusKey = 'await';
    } else if (o.statusKey === 'paid' || o.status === '已付款') {
      o.payStatus = '已支付';
      o.payStatusKey = 'paid';
      o.status = '已付款';
      o.statusKey = 'paid';
    }
    if (!o.delivery) o.delivery = DEFAULT_ORDER_STATE.delivery;
    if (!o.deliveryStatus) o.deliveryStatus = DEFAULT_ORDER_STATE.deliveryStatus;
    if (!o.deliveryStatusKey) o.deliveryStatusKey = DEFAULT_ORDER_STATE.deliveryStatusKey;
    if (!o.status) o.status = DEFAULT_ORDER_STATE.status;
    if (!o.statusKey) o.statusKey = DEFAULT_ORDER_STATE.statusKey;
    o.grassPublished = !!o.grassPublished;
    o.grassId = o.grassId || '';
    return o;
  }

  var DEMO_REGS = [
    { province: '上海市', city: '上海市', district: '浦东新区', address: '陆家嘴环路1000号恒生银行大厦18楼' },
    { province: '浙江省', city: '杭州市', district: '西湖区', address: '文三路478号华星时代广场C座2103' },
    { province: '广东省', city: '广州市', district: '天河区', address: '珠江新城华夏路10号富力中心写字楼15楼' },
    { province: '广东省', city: '深圳市', district: '南山区', address: '科技园南区高新南一道飞亚达科技大厦8楼' },
    { province: '北京市', city: '北京市', district: '朝阳区', address: '建国路81号华贸中心写字楼3座2301' },
    { province: '四川省', city: '成都市', district: '锦江区', address: '春熙路东段1号伊藤洋华堂双楠店6楼' }
  ];
  var DEMO_WAREHOUSES = ['华东仓', '华南仓', '华北仓', '西南仓', '线上直发仓'];
  var DEMO_STORES = ['上海旗舰店', '杭州体验店', '广州天河店', '深圳南山店', '线上直发仓'];
  var BRAND_MERCHANT = {
    'SK-II': 'SK-II奢享汇',
    'Lancôme': '兰蔻官方授权店',
    '兰蔻': '兰蔻官方授权店',
    '雅诗兰黛': '雅诗兰黛集团官方店',
    '完美日记': '完美日记品牌店',
    '花西子': '花西子国风旗舰店',
    '自然堂': '自然堂生活美学馆',
    '海蓝之谜': '海蓝精选',
    '修丽可': '修丽可官方旗舰店',
    '珂润': '珂润敏感肌护理店',
    "L'Oréal Paris": '欧莱雅集团官方店',
    '欧莱雅': '欧莱雅集团官方店'
  };

  function hashPick(seed, arr) {
    var h = 0;
    var s = String(seed || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return arr[h % arr.length];
  }

  function normalizeOpsCoverPath(src) {
    if (!src) return '';
    return String(src)
      .replace(/^\.\.\/运营管理系统\//, './')
      .replace(/^运营管理系统\//, './');
  }

  function mapProfileOrderToAdminRow(order, user) {
    user = user || DEFAULT_USER;
    order = enrichOrderProducts(normalizeProfileOrder(order), null);
    var items = order.items || [];
    var first = items[0] || {};
    var qty = Number(first.quantity) || 1;
    var oid = String(order.orderNo || order.id || '');
    var reg = hashPick(oid, DEMO_REGS);
    var brand = first.brand || '护肤';
    var merchant = first.merchant || BRAND_MERCHANT[brand] || '阅己美妆旗舰店';
    var stKey = order.statusKey || DEFAULT_ORDER_STATE.statusKey;
    var delKey = order.deliveryStatusKey || DEFAULT_ORDER_STATE.deliveryStatusKey;
    var needTrack = /shipped|receive|done|paid/.test(String(stKey)) ||
      /shipping|picked|delivering|signed/.test(String(delKey)) ||
      /已发货|待收货|确认收货|已完成/.test(String(order.status || ''));
    var disc = Math.max(0, ((Number(first.price) || 0) * qty) - (Number(order.totalPrice) || 0));
    var idx = 0;
    for (var hi = 0; hi < oid.length; hi++) idx = (idx * 31 + oid.charCodeAt(hi)) >>> 0;
    return {
      id: oid,
      orderTime: formatOrderTime(order.createdAt),
      orderGroup: '普通订单',
      userId: user.id || DEFAULT_USER.id,
      userName: user.nickname || DEFAULT_USER.nickname,
      userAvatarBg: user.avatarBg || DEFAULT_USER.avatarBg,
      userAvatarText: user.avatarText || DEFAULT_USER.avatarText,
      merchantName: merchant,
      store: hashPick(oid + 's', DEMO_STORES),
      warehouse: hashPick(oid + 'w', DEMO_WAREHOUSES),
      channel: 'App',
      prodName: buildProdName(items),
      prodSku: String(first.productId || first.id || ''),
      brand: brand,
      spec: first.spec || first.sku || '—',
      cat1: first.cat1 || '护肤',
      cat2: first.cat2 || '面部护肤',
      cat3: first.cat3 || '—',
      unitPrice: Number(first.price) || 0,
      prodQty: qty,
      totalPrice: (Number(first.price) || 0) * qty,
      activityType: disc > 0 ? '优惠券' : '无',
      discountPrice: disc,
      payAmount: Number(order.totalPrice) || 0,
      freight: 0,
      pointsUsed: 0,
      couponCode: disc > 0 ? ('CP' + String(100000 + (idx % 900000))) : '—',
      prodCover: normalizeOpsCoverPath(first.img || ''),
      itemCount: Number(order.itemCount) || items.reduce(function (s, it) {
        return s + (Number(it.quantity) || 1);
      }, 0) || items.length,
      orderAmount: Number(order.totalPrice) || 0,
      payMethod: order.payMethod || '微信支付',
      payMethodKey: payMethodKey(order.payMethod),
      payStatus: order.payStatus || DEFAULT_ORDER_STATE.payStatus,
      payStatusKey: order.payStatusKey || DEFAULT_ORDER_STATE.payStatusKey,
      delivery: order.delivery || DEFAULT_ORDER_STATE.delivery,
      deliveryStatus: order.deliveryStatus || DEFAULT_ORDER_STATE.deliveryStatus,
      deliveryStatusKey: order.deliveryStatusKey || DEFAULT_ORDER_STATE.deliveryStatusKey,
      deliveryNo: needTrack ? ('SF' + String(1000000000000 + (idx % 899999999999))) : '—',
      status: order.status || DEFAULT_ORDER_STATE.status,
      statusKey: stKey,
      refund: /refunding|退款中/.test(String(stKey) + String(order.status || '')) ? '退款中'
        : /refunded|已退款/.test(String(stKey) + String(order.status || '')) ? '已退款' : '—',
      receiverName: user.nickname || DEFAULT_USER.nickname,
      receiverPhone: '138****' + String(1000 + (idx % 9000)),
      province: reg.province,
      city: reg.city,
      district: reg.district,
      address: reg.province + reg.city + reg.district + reg.address,
      invoice: false,
      remark: buildRemark(order),
      _fromProfile: true,
      _profileOrderId: String(order.id || '')
    };
  }

  function mapProfileOrdersToAdminRows(orders, user) {
    return (orders || []).map(function (order) {
      return mapProfileOrderToAdminRow(order, user);
    });
  }

  function loadProfileOrders() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(normalizeProfileOrder);
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function mergeIntoOrderList(orderList, profileOrders, user) {
    if (!orderList || !Array.isArray(orderList)) return [];
    var mapped = mapProfileOrdersToAdminRows(profileOrders, user);
    var i;
    for (i = orderList.length - 1; i >= 0; i--) {
      if (orderList[i]._fromProfile) orderList.splice(i, 1);
    }
    for (i = mapped.length - 1; i >= 0; i--) {
      orderList.unshift(mapped[i]);
    }
    return orderList;
  }

  function applyAction(order, action, extra) {
    var next = normalizeProfileOrder(Object.assign({}, order));
    if (action === 'refund' || action === 'aftersale') {
      if (next.statusKey !== 'refunding' && next.statusKey !== 'refunded') {
        next._prevStatus = next.status;
        next._prevStatusKey = next.statusKey;
      }
      next.status = '退款中';
      next.statusKey = 'refunding';
      next.refundAppliedAt = Date.now();
    } else if (action === 'confirm') {
      next.status = '已完成';
      next.statusKey = 'done';
      next.deliveryStatus = '已签收';
      next.deliveryStatusKey = 'signed';
    } else if (action === 'ship') {
      next.status = '确认收货';
      next.statusKey = 'receive';
      next.deliveryStatus = '运输中';
      next.deliveryStatusKey = 'shipping';
    } else if (action === 'pay') {
      next.payStatus = '已支付';
      next.payStatusKey = 'paid';
      next.status = '已付款';
      next.statusKey = 'paid';
    } else if (action === 'review') {
      next.reviewed = true;
      next.reviewScore = Number(extra && extra.score) || 5;
      next.reviewText = (extra && extra.text) || '';
      if (!next.reviewedAt) next.reviewedAt = formatOrderTime(Date.now());
      if (next.statusKey !== 'done') {
        next.status = '已完成';
        next.statusKey = 'done';
      }
    }
    return next;
  }

  function getActionTip(order, action) {
    order = normalizeProfileOrder(order);
    if (action === 'refund' || action === 'aftersale') return '已提交售后申请，订单状态已同步为「退款中」';
    if (action === 'confirm') return '已确认收货，订单状态已同步为「已完成」';
    if (action === 'logistics') return getLogisticsTip(order);
    if (action === 'ship') return '商家已发货，订单进入「确认收货」';
    if (action === 'review') return '评价成功，感谢你的反馈';
    if (action === 'pay') return '支付成功，订单状态为「已付款」';
    return '操作成功';
  }

  function getLogisticsTip(order) {
    order = normalizeProfileOrder(order);
    var company = order.delivery || '普通快递';
    var ds = order.deliveryStatus || '待发货';
    var key = order.deliveryStatusKey || 'await';
    if (key === 'await') return '物流状态：' + company + ' · ' + ds + '（与运营端同步）';
    if (key === 'picked') return '物流状态：' + company + ' · ' + ds + '，快递员已揽收';
    if (key === 'shipping') return '物流状态：' + company + ' · ' + ds + '，包裹运输中';
    if (key === 'delivering') return '物流状态：' + company + ' · ' + ds + '，正在派送中';
    if (key === 'signed' || key === 'done') return '物流状态：' + company + ' · ' + ds;
    return '物流状态：' + company + ' · ' + ds;
  }

  function getDisplayStatus(order) {
    if (!order) return '待发货';
    order = normalizeProfileOrder(order);
    if (!order) return '待发货';
    var status = String(order.status || '');
    var key = String(order.statusKey || '');
    var payKey = String(order.payStatusKey || '');
    // 中文状态文案优先（运营端编辑 status 后 statusKey 可能滞后）
    if (status.indexOf('待付款') >= 0) return '待付款';
    if (status === '已付款') return '已付款';
    if (status.indexOf('待发货') >= 0) return '待发货';
    if (status.indexOf('确认收货') >= 0 || status.indexOf('待收货') >= 0 || status.indexOf('已发货') >= 0) return '确认收货';
    if (status.indexOf('已完成') >= 0) return '已完成';
    if (status.indexOf('退款中') >= 0) return '退款中';
    if (status.indexOf('已退款') >= 0) return '已退款';
    if (status.indexOf('已取消') >= 0) return '已取消';
    if (key === 'pending' || key === 'unpaid') return '待付款';
    if (key === 'paid') return '已付款';
    if (key === 'await') return '待发货';
    if (key === 'receive' || key === 'shipped' || key === 'shipping' || key === 'delivering') return '确认收货';
    if (key === 'done') return '已完成';
    if (key === 'refunding') return '退款中';
    if (key === 'refunded') return '已退款';
    if (key === 'cancel') return '已取消';
    if (payKey === 'unpaid') return '待付款';
    return status || '待发货';
  }

  function getReviewLabel(order) {
    order = normalizeProfileOrder(order);
    if (getDisplayStatus(order) !== '已完成' && order.statusKey !== 'done') return '';
    return order.reviewed ? '已评价' : '待评价';
  }

  function calcCouponAfterPrice(order) {
    order = normalizeProfileOrder(order);
    var items = order.items || [];
    var originSum = 0;
    var hasOrigin = false;
    var hasCoupon = false;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var qty = Number(it.quantity) || 1;
      var origin = Number(it.originPrice);
      var price = Number(it.price) || 0;
      if (!isNaN(origin) && origin > 0) {
        originSum += origin * qty;
        hasOrigin = true;
        if (origin > price) hasCoupon = true;
      } else {
        originSum += price * qty;
      }
      if (it.couponTag) hasCoupon = true;
    }
    var total = Number(order.totalPrice);
    if (isNaN(total) || total < 0) total = originSum;
    if (!hasCoupon && hasOrigin && originSum > total) hasCoupon = true;
    if (!hasCoupon) return null;
    return Math.round(total);
  }

  var ADMIN_ORDER_KEY = 'zhuangyan_order_list_v1';

  function loadAdminOrderRows() {
    try {
      var raw = localStorage.getItem(ADMIN_ORDER_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function findAdminRowForProfileOrder(order, adminRows) {
    adminRows = adminRows || loadAdminOrderRows();
    var pid = String(order.id || '');
    var ono = String(order.orderNo || '');
    for (var i = 0; i < adminRows.length; i++) {
      var r = adminRows[i];
      if (!r) continue;
      if (r._fromProfile && String(r._profileOrderId) === pid) return r;
      if (ono && String(r.id) === ono) return r;
      if (pid && String(r.id) === pid) return r;
    }
    return null;
  }

  function applyAdminFieldsToOrder(o, adminRow) {
    var next = normalizeProfileOrder(Object.assign({}, o, {
      status: adminRow.status || o.status,
      statusKey: adminRow.statusKey || o.statusKey,
      payStatus: adminRow.payStatus || o.payStatus,
      payStatusKey: adminRow.payStatusKey || o.payStatusKey,
      delivery: adminRow.delivery || o.delivery,
      deliveryStatus: adminRow.deliveryStatus || o.deliveryStatus,
      deliveryStatusKey: adminRow.deliveryStatusKey || o.deliveryStatusKey,
      totalPrice: adminRow.orderAmount != null ? Number(adminRow.orderAmount) : o.totalPrice,
      payMethod: adminRow.payMethod || o.payMethod
    }));
    var label = getDisplayStatus(next);
    if (label === '待付款') {
      next.status = '待付款';
      next.statusKey = 'pending';
      next.payStatus = '未支付';
      next.payStatusKey = 'unpaid';
    } else if (label === '已付款') {
      next.status = '已付款';
      next.statusKey = 'paid';
      next.payStatus = '已支付';
      next.payStatusKey = 'paid';
    } else if (label === '待发货') {
      next.status = '待发货';
      next.statusKey = 'await';
      next.payStatus = '已支付';
      next.payStatusKey = 'paid';
    } else if (label === '确认收货') {
      next.status = '确认收货';
      next.statusKey = 'receive';
      next.payStatus = '已支付';
      next.payStatusKey = 'paid';
    } else if (label === '已完成') {
      next.status = '已完成';
      next.statusKey = 'done';
      next.payStatus = '已支付';
      next.payStatusKey = 'paid';
    }

    var adminName = String(adminRow.prodName || '');
    var singleName = adminName && adminName !== '商品' && !/\s*等\d+件$/.test(adminName) && !isPromoLikeTitle(adminName);
    next.items = (o.items || []).map(function (it) { return Object.assign({}, it); });
    if (next.items.length) {
      if (singleName) next.items[0].title = adminName;
      if (adminRow.prodCover) next.items[0].img = adminRow.prodCover;
      if (Number(adminRow.prodQty) > 0) next.items[0].quantity = Number(adminRow.prodQty);
      if (adminRow.orderAmount != null && next.items.length === 1) {
        var qty = Number(next.items[0].quantity) || 1;
        next.items[0].price = String(Math.round((Number(adminRow.orderAmount) / qty) * 100) / 100);
      }
      if (adminRow.prodSku && (!next.items[0].productId || isPromoLikeTitle(String(next.items[0].title || '')))) {
        next.items[0].productId = adminRow.prodSku;
      }
    } else if (singleName || adminRow.prodCover || adminRow.prodSku) {
      next.items = [{
        productId: adminRow.prodSku || '',
        title: singleName ? adminName : (adminRow.prodName || '商品'),
        subTitle: '标准装',
        price: String(Number(adminRow.orderAmount) || 0),
        quantity: Number(adminRow.prodQty) || 1,
        img: adminRow.prodCover || ''
      }];
    }
    if (typeof adminRow.reviewed !== 'undefined') next.reviewed = !!adminRow.reviewed;
    return enrichOrderProducts(next, adminRow);
  }

  function patchProfileFromAdminRow(adminRow) {
    if (!adminRow) return loadProfileOrders();
    var pid = adminRow._profileOrderId;
    var orders = loadProfileOrders();
    var changed = false;
    orders = orders.map(function (o) {
      var match = (pid && String(o.id) === String(pid)) ||
        String(o.orderNo) === String(adminRow.id) ||
        String(o.id) === String(adminRow.id);
      if (!match) return o;
      changed = true;
      return applyAdminFieldsToOrder(o, adminRow);
    });
    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      } catch (e) { /* ignore */ }
      broadcast(orders);
    }
    return orders;
  }

  /** 打开「我的订单」时从运营端订单管理回写状态/商品，并纠正活动名占位 */
  function syncProfileOrdersFromAdmin() {
    var orders = loadProfileOrders();
    var adminRows = loadAdminOrderRows();
    if (!orders.length) return orders;
    var changed = false;
    var adminChanged = false;
    orders = orders.map(function (o) {
      var row = findAdminRowForProfileOrder(o, adminRows);
      var next = row ? applyAdminFieldsToOrder(o, row) : enrichOrderProducts(o, null);
      var before = JSON.stringify(o.items || []);
      var after = JSON.stringify(next.items || []);
      if (before !== after || (row && (o.status !== next.status || o.statusKey !== next.statusKey || Number(o.totalPrice) !== Number(next.totalPrice)))) {
        changed = true;
      }
      // 回写运营端：把活动名 prodName 纠正为真实商品
      if (row) {
        var fixedName = buildProdName(next.items);
        var first = (next.items && next.items[0]) || {};
        if (isPromoLikeTitle(row.prodName) && fixedName && !isPromoLikeTitle(fixedName)) {
          row.prodName = fixedName;
          adminChanged = true;
        }
        if ((!row.prodCover || isPromoLikeTitle(row.prodName)) && first.img) {
          row.prodCover = first.img;
          adminChanged = true;
        }
        if (first.productId && (!row.prodSku || isPromoLikeTitle(String(row.prodSku)))) {
          row.prodSku = String(first.productId);
          adminChanged = true;
        }
      }
      return next;
    });
    // 顺带纠正订单管理里其它活动名占位行
    for (var ai = 0; ai < adminRows.length; ai++) {
      var ar = adminRows[ai];
      if (!ar || !isPromoLikeTitle(ar.prodName)) continue;
      var cat = findCatalogProduct(ar.prodSku);
      if (cat && cat.name) {
        ar.prodName = cat.name;
        if (!ar.prodCover && (cat.cover || cat.coverUrl)) ar.prodCover = cat.cover || cat.coverUrl;
        adminChanged = true;
      }
    }
    if (changed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      } catch (e) { /* ignore */ }
      broadcast(orders);
    }
    if (adminChanged) {
      try {
        localStorage.setItem(ADMIN_ORDER_KEY, JSON.stringify(adminRows));
      } catch (e2) { /* ignore */ }
    }
    return orders;
  }

  function broadcast(orders) {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({
          type: SYNC_MSG,
          orders: orders || loadProfileOrders()
        }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  global.ProfileOrderSync = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    ADMIN_ORDER_KEY: ADMIN_ORDER_KEY,
    DEFAULT_USER: DEFAULT_USER,
    DEFAULT_ORDER_STATE: DEFAULT_ORDER_STATE,
    loadProfileOrders: loadProfileOrders,
    normalizeProfileOrder: normalizeProfileOrder,
    mapProfileOrderToAdminRow: mapProfileOrderToAdminRow,
    mapProfileOrdersToAdminRows: mapProfileOrdersToAdminRows,
    mergeIntoOrderList: mergeIntoOrderList,
    applyAction: applyAction,
    getActionTip: getActionTip,
    getLogisticsTip: getLogisticsTip,
    getDisplayStatus: getDisplayStatus,
    getReviewLabel: getReviewLabel,
    calcCouponAfterPrice: calcCouponAfterPrice,
    isPromoLikeTitle: isPromoLikeTitle,
    enrichOrderProducts: enrichOrderProducts,
    resolveOrderItemProduct: resolveOrderItemProduct,
    patchProfileFromAdminRow: patchProfileFromAdminRow,
    syncProfileOrdersFromAdmin: syncProfileOrdersFromAdmin,
    broadcast: broadcast
  };
})(typeof window !== 'undefined' ? window : this);
