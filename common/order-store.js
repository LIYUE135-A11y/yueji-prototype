/**
 * 我的 · 个人订单
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_profile_orders_v1';
  var UPDATE_MSG = 'profile-order-updated';

  var DEFAULT_ORDER_STATE = {
    payStatus: '已支付',
    payStatusKey: 'paid',
    status: '待发货',
    statusKey: 'await',
    delivery: '普通快递',
    deliveryStatus: '待发货',
    deliveryStatusKey: 'await'
  };

  function cloneItem(item) {
    return {
      productId: String(item.productId || item.id || ''),
      title: item.title || item.name || '',
      subTitle: item.subTitle || '',
      img: item.img || item.cover || '',
      price: String(item.price != null ? item.price : '0'),
      originPrice: item.originPrice != null ? String(item.originPrice) : '',
      spec: item.spec || '标准装',
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      couponTag: item.couponTag ? String(item.couponTag) : ''
    };
  }

  function normalizeOrder(order) {
    var o = cloneOrder(order);
    if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.normalizeProfileOrder) {
      return ProfileOrderSync.normalizeProfileOrder(o);
    }
    if (!order.payStatus) {
      o.payStatus = DEFAULT_ORDER_STATE.payStatus;
      o.payStatusKey = DEFAULT_ORDER_STATE.payStatusKey;
    }
    if (order.status === '已支付') {
      o.payStatus = '已支付';
      o.payStatusKey = 'paid';
      o.status = DEFAULT_ORDER_STATE.status;
      o.statusKey = DEFAULT_ORDER_STATE.statusKey;
    } else if (order.statusKey === 'paid' || order.status === '已付款') {
      o.payStatus = '已支付';
      o.payStatusKey = 'paid';
      o.status = '已付款';
      o.statusKey = 'paid';
    }
    if (!o.delivery) o.delivery = DEFAULT_ORDER_STATE.delivery;
    if (!o.deliveryStatus) o.deliveryStatus = DEFAULT_ORDER_STATE.deliveryStatus;
    if (!o.deliveryStatusKey) o.deliveryStatusKey = DEFAULT_ORDER_STATE.deliveryStatusKey;
    return o;
  }

  function cloneOrder(order) {
    return {
      id: String(order.id || ''),
      orderNo: order.orderNo || '',
      status: order.status || DEFAULT_ORDER_STATE.status,
      statusKey: order.statusKey || DEFAULT_ORDER_STATE.statusKey,
      payStatus: order.payStatus || DEFAULT_ORDER_STATE.payStatus,
      payStatusKey: order.payStatusKey || DEFAULT_ORDER_STATE.payStatusKey,
      delivery: order.delivery || DEFAULT_ORDER_STATE.delivery,
      deliveryStatus: order.deliveryStatus || DEFAULT_ORDER_STATE.deliveryStatus,
      deliveryStatusKey: order.deliveryStatusKey || DEFAULT_ORDER_STATE.deliveryStatusKey,
      payMethod: order.payMethod || '微信支付',
      totalPrice: Number(order.totalPrice) || 0,
      itemCount: Number(order.itemCount) || 0,
      createdAt: order.createdAt || Date.now(),
      items: (order.items || []).map(cloneItem),
      reviewed: !!order.reviewed,
      reviewScore: Number(order.reviewScore) || 0,
      reviewText: order.reviewText || '',
      reviewId: order.reviewId || '',
      reviewedAt: order.reviewedAt || '',
      reviewReply: order.reviewReply || '',
      reviewReplyName: order.reviewReplyName || '',
      reviewReplyTime: order.reviewReplyTime || '',
      reviewHidden: !!order.reviewHidden,
      aftersaleId: order.aftersaleId || '',
      aftersaleStatus: order.aftersaleStatus || '',
      aftersaleStatusKey: order.aftersaleStatusKey || '',
      aftersaleRemark: order.aftersaleRemark || '',
      aftersaleHandler: order.aftersaleHandler || '',
      aftersaleHandleTime: order.aftersaleHandleTime || '',
      refundAppliedAt: order.refundAppliedAt || 0,
      grassPublished: !!order.grassPublished,
      grassId: order.grassId || '',
      _prevStatus: order._prevStatus || '',
      _prevStatusKey: order._prevStatusKey || ''
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(normalizeOrder);
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    var snapshot = (list || []).map(normalizeOrder);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    notify(snapshot);
    return snapshot;
  }

  var SYNC_MSG = 'profile-order-sync';

  function broadcast(list) {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: SYNC_MSG, orders: (list || load()).map(cloneOrder) }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  function notify(list) {
    try {
      global.dispatchEvent(new CustomEvent(UPDATE_MSG, { detail: (list || load()).map(cloneOrder) }));
    } catch (e) { /* ignore */ }
    broadcast(list);
  }

  function formatOrderNo() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return 'DD' + y + m + day + rand;
  }

  function createFromCart(cartItems, payMethod) {
    var items = (cartItems || []).map(cloneItem);
    if (!items.length) return null;
    var total = items.reduce(function (sum, item) {
      return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }, 0);
    var count = items.reduce(function (sum, item) {
      return sum + (Number(item.quantity) || 1);
    }, 0);
    var order = cloneOrder({
      id: 'ORD' + Date.now(),
      orderNo: formatOrderNo(),
      payStatus: DEFAULT_ORDER_STATE.payStatus,
      payStatusKey: DEFAULT_ORDER_STATE.payStatusKey,
      status: DEFAULT_ORDER_STATE.status,
      statusKey: DEFAULT_ORDER_STATE.statusKey,
      delivery: DEFAULT_ORDER_STATE.delivery,
      deliveryStatus: DEFAULT_ORDER_STATE.deliveryStatus,
      deliveryStatusKey: DEFAULT_ORDER_STATE.deliveryStatusKey,
      payMethod: payMethod || '微信支付',
      totalPrice: Math.round(total),
      itemCount: count,
      createdAt: Date.now(),
      items: items
    });
    var list = load();
    list.unshift(order);
    save(list);
    return order;
  }

  function createFromProduct(product, cover, activityList, payMethod) {
    var CartStore = global.ProfileCartStore;
    if (!CartStore || !CartStore.mapProductToCartItem) return null;
    var item = CartStore.mapProductToCartItem(product, cover, activityList);
    if (!item) return null;
    return createFromCart([item], payMethod);
  }

  function getCount() {
    return load().length;
  }

  function matchOrderId(order, orderId) {
    return String(order.id) === String(orderId) || String(order.orderNo) === String(orderId);
  }

  function applyAction(orderId, action, extra) {
    var list = load();
    var target = null;
    var changed = false;
    extra = extra || {};
    for (var i = 0; i < list.length; i++) {
      if (matchOrderId(list[i], orderId)) {
        target = list[i];
        break;
      }
    }
    if (!target) return { changed: false, tip: '订单不存在' };

    var tip;
    if (typeof ProfileOrderSync !== 'undefined') {
      tip = ProfileOrderSync.getActionTip(target, action);
    } else if (action === 'aftersale' || action === 'refund') {
      tip = '已提交售后申请，订单状态已同步为「退款中」';
    } else if (action === 'confirm') {
      tip = '已确认收货，订单状态已同步为「已完成」';
    } else if (action === 'logistics') {
      tip = '物流状态：' + (target.delivery || '普通快递') + ' · ' + (target.deliveryStatus || '待发货');
    } else if (action === 'ship') {
      tip = '商家已发货，订单进入「确认收货」';
    } else if (action === 'review') {
      tip = '评价成功，感谢你的反馈';
    } else if (action === 'pay') {
      tip = '支付成功，订单状态为「已付款」';
    } else {
      tip = '操作成功';
    }

    if (action === 'logistics') {
      return { changed: false, tip: tip, order: target };
    }

    list = list.map(function (o) {
      if (!matchOrderId(o, orderId)) return o;
      changed = true;
      var next = cloneOrder(o);
      if (typeof ProfileOrderSync !== 'undefined') {
        next = cloneOrder(ProfileOrderSync.applyAction(next, action, extra));
      } else if (action === 'aftersale' || action === 'refund') {
        next.status = '退款中';
        next.statusKey = 'refunding';
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
        next.reviewScore = Number(extra.score) || 5;
        next.reviewText = extra.text || '';
        if (!next.reviewedAt) {
          var d = new Date();
          function p2(n) { return (n < 10 ? '0' : '') + n; }
          next.reviewedAt = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' +
            p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
        }
        if (next.statusKey !== 'done') {
          next.status = '已完成';
          next.statusKey = 'done';
        }
      }
      return next;
    });

    if (changed) {
      save(list);
      if ((action === 'refund' || action === 'aftersale') && typeof ProfileAftersaleSync !== 'undefined') {
        var updated = null;
        for (var j = 0; j < list.length; j++) {
          if (matchOrderId(list[j], orderId)) {
            updated = list[j];
            break;
          }
        }
        if (updated) {
          var row = ProfileAftersaleSync.upsertFromRefundOrder(updated);
          if (row && row.id) {
            // 回写 aftersaleId 到订单
            list = list.map(function (o) {
              if (!matchOrderId(o, orderId)) return o;
              var c = cloneOrder(o);
              c.aftersaleId = row.id;
              c.aftersaleStatus = row.status;
              c.aftersaleStatusKey = row.statusKey;
              return c;
            });
            save(list);
          }
        }
      }
      if (action === 'review' && typeof ReviewStore !== 'undefined' && ReviewStore.upsertFromOrderReview) {
        var reviewedOrder = null;
        for (var k = 0; k < list.length; k++) {
          if (matchOrderId(list[k], orderId)) {
            reviewedOrder = list[k];
            break;
          }
        }
        if (reviewedOrder) {
          var reviewUser = { id: '', nickName: '我' };
          try {
            if (typeof UserStore !== 'undefined' && UserStore.load) {
              var ul = UserStore.load() || [];
              if (ul[0]) {
                reviewUser = {
                  id: ul[0].id || '',
                  nickName: ul[0].nickName || ul[0].nickname || '我',
                  nickname: ul[0].nickName || ul[0].nickname || '我'
                };
              }
            }
          } catch (eUser) { /* ignore */ }
          var rev = ReviewStore.upsertFromOrderReview(reviewedOrder, reviewUser);
          if (rev && rev.id) {
            list = list.map(function (o) {
              if (!matchOrderId(o, orderId)) return o;
              var c = cloneOrder(o);
              c.reviewId = rev.id;
              c.reviewedAt = rev.reviewTime || c.reviewedAt;
              c.reviewReply = rev.replyContent || rev.replyText || '';
              c.reviewReplyName = rev.replyName || '';
              c.reviewReplyTime = rev.replyTime || '';
              return c;
            });
            save(list);
          }
        }
      }
    }
    return { changed: changed, tip: tip };
  }

  function getDisplayStatus(order) {
    if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.getDisplayStatus) {
      return ProfileOrderSync.getDisplayStatus(order);
    }
    return order.status || '待发货';
  }

  function getReviewLabel(order) {
    if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.getReviewLabel) {
      return ProfileOrderSync.getReviewLabel(order);
    }
    if ((order.statusKey === 'done' || order.status === '已完成')) {
      return order.reviewed ? '已评价' : '待评价';
    }
    return '';
  }

  function calcCouponAfterPrice(order) {
    if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.calcCouponAfterPrice) {
      return ProfileOrderSync.calcCouponAfterPrice(order);
    }
    return null;
  }

  function syncFromAdmin() {
    if (typeof ProfileOrderSync !== 'undefined' && ProfileOrderSync.syncProfileOrdersFromAdmin) {
      return ProfileOrderSync.syncProfileOrdersFromAdmin().map(normalizeOrder);
    }
    return load();
  }

  global.ProfileOrderStore = {
    STORAGE_KEY: STORAGE_KEY,
    UPDATE_MSG: UPDATE_MSG,
    SYNC_MSG: SYNC_MSG,
    load: load,
    save: save,
    createFromCart: createFromCart,
    createFromProduct: createFromProduct,
    getCount: getCount,
    cloneOrder: cloneOrder,
    applyAction: applyAction,
    getDisplayStatus: getDisplayStatus,
    getReviewLabel: getReviewLabel,
    calcCouponAfterPrice: calcCouponAfterPrice,
    syncFromAdmin: syncFromAdmin,
    broadcast: function () { broadcast(load()); }
  };
})(typeof window !== 'undefined' ? window : this);
