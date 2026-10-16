/**
 * 美妆订单种子 · 100 条（运营订单管理 / 数据中心订单数据）
 * 字段对齐运营列表 + 统计扩展字段；商品均为护肤/彩妆类。
 */
(function (global) {
  var GROUPS = [
    { orderGroup: '普通订单', w: 5 },
    { orderGroup: '会员订单', w: 2 },
    { orderGroup: '拼团订单', w: 1 },
    { orderGroup: '秒杀订单', w: 1 }
  ];
  var ACTIVITIES = ['无', '无', '满减', '会员折扣', '新人专享', '秒杀', '买赠', '优惠券'];
  var PAYS = [
    { payMethod: '微信支付', payMethodKey: 'wechat' },
    { payMethod: '支付宝', payMethodKey: 'alipay' },
    { payMethod: '银行卡', payMethodKey: 'card' },
    { payMethod: '余额支付', payMethodKey: 'balance' },
    { payMethod: '货到付款', payMethodKey: 'cod' }
  ];
  var DELIVERIES = [
    { delivery: '顺丰速运', deliveryKey: 'sf' },
    { delivery: '普通快递', deliveryKey: 'normal' },
    { delivery: '京东物流', deliveryKey: 'jd' },
    { delivery: '同城配送', deliveryKey: 'city' },
    { delivery: '到店自提', deliveryKey: 'pickup' },
    { delivery: '无需物流', deliveryKey: 'none' }
  ];
  var CHANNELS = ['App', '微信小程序', 'H5商城', '直播间', '专柜导购', '客服代下'];
  var WAREHOUSES = ['华东仓', '华南仓', '华北仓', '西南仓', '线上直发仓'];
  var STORES = ['上海旗舰店', '杭州体验店', '广州天河店', '深圳南山店', '成都春熙店', '北京朝阳店', '武汉光谷店', '西安高新店', '线上直发仓'];
  var MERCHANTS = [
    '阅己美妆旗舰店', '优品美妆专营店', '花语甄选店', '海蓝精选', '丽人全球购',
    '兰蔻官方授权店', '完美日记品牌店', '自然堂生活美学馆', 'SK-II奢享汇', '花西子国风旗舰店',
    '欧莱雅集团官方店', '修丽可官方旗舰店', '珂润敏感肌护理店', '雅诗兰黛集团官方店'
  ];
  var USERS = [
    { userId: 'U20240105', userName: '林予安', userAvatarText: '林', userAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { userId: 'U20240088', userName: '沈清欢', userAvatarText: '沈', userAvatarBg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
    { userId: 'U20240256', userName: '顾惜月', userAvatarText: '顾', userAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { userId: 'U20240032', userName: '叶知夏', userAvatarText: '叶', userAvatarBg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
    { userId: 'U20240102', userName: '苏念初', userAvatarText: '苏', userAvatarBg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)' },
    { userId: 'U20240501', userName: '温以柔', userAvatarText: '温', userAvatarBg: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)' },
    { userId: 'U20240322', userName: '江晚宁', userAvatarText: '江', userAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { userId: 'U20240608', userName: '陆星眠', userAvatarText: '陆', userAvatarBg: 'linear-gradient(135deg,#FEF9C3,#FDE68A)' },
    { userId: 'U20240178', userName: '许清禾', userAvatarText: '许', userAvatarBg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)' },
    { userId: 'U20240901', userName: '程予薇', userAvatarText: '程', userAvatarBg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)' },
    { userId: 'U20240208', userName: '宋软软', userAvatarText: '宋', userAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { userId: 'U20240612', userName: '方知予', userAvatarText: '方', userAvatarBg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
    { userId: 'U20240076', userName: '唐小鹿', userAvatarText: '唐', userAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { userId: 'U20241102', userName: '梁慕白', userAvatarText: '梁', userAvatarBg: 'linear-gradient(135deg,#FFEDD5,#FED7AA)' },
    { userId: 'U20241156', userName: '韩以安', userAvatarText: '韩', userAvatarBg: 'linear-gradient(135deg,#ECFDF5,#A7F3D0)' },
    { userId: 'U20240334', userName: '谢星河', userAvatarText: '谢', userAvatarBg: 'linear-gradient(135deg,#FDF4FF,#F0ABFC)' },
    { userId: 'U20240442', userName: '赵浅予', userAvatarText: '赵', userAvatarBg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)' },
    { userId: 'U20240778', userName: '周南枝', userAvatarText: '周', userAvatarBg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)' },
    { userId: 'U20240888', userName: '陈初雪', userAvatarText: '陈', userAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { userId: 'U20240236', userName: '吴晚棠', userAvatarText: '吴', userAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' }
  ];
  var REGS = [
    { province: '上海市', city: '上海市', district: '浦东新区', address: '陆家嘴环路1000号恒生银行大厦18楼' },
    { province: '浙江省', city: '杭州市', district: '西湖区', address: '文三路478号华星时代广场C座2103' },
    { province: '广东省', city: '广州市', district: '天河区', address: '珠江新城华夏路10号富力中心写字楼15楼' },
    { province: '广东省', city: '深圳市', district: '南山区', address: '科技园南区高新南一道飞亚达科技大厦8楼' },
    { province: '北京市', city: '北京市', district: '朝阳区', address: '建国路81号华贸中心写字楼3座2301' },
    { province: '四川省', city: '成都市', district: '锦江区', address: '春熙路东段1号伊藤洋华堂双楠店6楼' },
    { province: '江苏省', city: '苏州市', district: '工业园区', address: '月亮湾路9号建屋紫金东方A座1206' },
    { province: '江苏省', city: '南京市', district: '建邺区', address: '庐山路188号新地中心二期C座808' },
    { province: '湖北省', city: '武汉市', district: '江汉区', address: '解放大道634号新世界国贸大厦2座21楼' },
    { province: '陕西省', city: '西安市', district: '雁塔区', address: '高新路56号西安软件园秦风阁B座5层' },
    { province: '重庆市', city: '重庆市', district: '渝中区', address: '解放碑步行街88号环球金融中心22楼' },
    { province: '湖南省', city: '长沙市', district: '岳麓区', address: '桐梓坡西路518号时代帝景A座9楼' }
  ];
  var PRODUCTS = [
    { prodName: 'SK-II 神仙水精华露 230ml 经典款', brand: 'SK-II', spec: '230ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华水', unitPrice: 1699, sku: 'SK2-ESS-230-A', cover: 'sk2 essence bottle 230ml luxury skincare' },
    { prodName: '兰蔻小黑瓶精华肌底液 100ml', brand: 'Lancôme', spec: '100ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 1293, sku: 'LK-XHP-100B', cover: 'lancome advanced genifique serum black bottle' },
    { prodName: '珂润润浸保湿化妆水 III 150ml', brand: '珂润', spec: '150ml', cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水', unitPrice: 169, sku: 'CRL-HS-150-III', cover: 'curel moist lotion iii japanese skincare' },
    { prodName: '海蓝之谜浓缩修护精华露 50ml', brand: '海蓝之谜', spec: '50ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 4280, sku: 'HLZM-CS-50-A', cover: 'la mer concentrate repair serum luxury' },
    { prodName: '兰蔻菁纯臻颜精萃乳霜 60ml', brand: 'Lancôme', spec: '60ml', cat1: '护肤', cat2: '面部护肤', cat3: '面霜', unitPrice: 2180, sku: 'LK-JC-60-M', cover: 'lancome absolution cream gold jar' },
    { prodName: '自然堂喜马拉雅冰川水 160ml', brand: '自然堂', spec: '160ml', cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水', unitPrice: 118, sku: 'ZRT-BS-160-A', cover: 'chando himalaya glacier toner blue' },
    { prodName: 'SK-II 大红瓶面霜 80g 轻盈版', brand: 'SK-II', spec: '80g', cat1: '护肤', cat2: '面部护肤', cat3: '面霜', unitPrice: 1399, sku: 'SK2-DHP-80G-A', cover: 'sk2 rna power cream red jar' },
    { prodName: '修丽可维生素CE复合修护精华 30ml', brand: '修丽可', spec: '30ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 960, sku: 'XLK-CE-30ML', cover: 'skinceuticals CE ferulic serum' },
    { prodName: '雅诗兰黛小棕瓶修护精华 75ml', brand: '雅诗兰黛', spec: '75ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 1490, sku: 'YSLD-XZP-75-B', cover: 'estee lauder advanced night repair serum' },
    { prodName: 'L\'Oréal Paris 复颜玻尿酸水光充盈乳液 110ml', brand: 'L\'Oréal Paris', spec: '110ml', cat1: '护肤', cat2: '面部护肤', cat3: '乳液', unitPrice: 299, sku: 'LOREAL-FY-110M', cover: 'loreal hyaluronic emulsion bottle' },
    { prodName: '修丽可色修精华 30ml', brand: '修丽可', spec: '30ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华', unitPrice: 780, sku: 'XLK-SX-30ML', cover: 'skinceuticals phyto corrective serum' },
    { prodName: 'Curel 润浸保湿洁颜泡沫 150ml', brand: '珂润', spec: '150ml', cat1: '护肤', cat2: '面部护肤', cat3: '洁面', unitPrice: 149, sku: 'CRL-JM-150ML', cover: 'curel facial cleansing foam pump' },
    { prodName: 'SK-II 前男友面膜 10片装', brand: 'SK-II', spec: '10片', cat1: '护肤', cat2: '面部护肤', cat3: '面膜', unitPrice: 1090, sku: 'SK2-MM-10P', cover: 'sk2 facial mask sheet box' },
    { prodName: '花西子同心锁口红 哑光雾面 M301', brand: '花西子', spec: 'M301', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', unitPrice: 199, sku: 'HXZ-KK-M301', cover: 'florasis carved lipstick chinese beauty' },
    { prodName: '完美日记动物眼影盘 14色', brand: '完美日记', spec: '14色', cat1: '彩妆', cat2: '眼部彩妆', cat3: '眼影', unitPrice: 129, sku: 'WMRJ-YS-14', cover: 'perfect diary animal eyeshadow palette' },
    { prodName: '欧莱雅小金管防晒 30ml SPF50+', brand: 'L\'Oréal Paris', spec: '30ml', cat1: '护肤', cat2: '防晒', cat3: '防晒乳', unitPrice: 89, sku: 'LOREAL-SF-30', cover: 'loreal uv defender sunscreen gold tube' },
    { prodName: '海蓝之谜精粹水 150ml', brand: '海蓝之谜', spec: '150ml', cat1: '护肤', cat2: '面部护肤', cat3: '精华水', unitPrice: 1580, sku: 'LM-JC-150ML', cover: 'la mer treatment lotion bottle' },
    { prodName: '氨基酸净透洁面乳 120g', brand: '阅己自研', spec: '120g', cat1: '护肤', cat2: '面部护肤', cat3: '洁面', unitPrice: 69, sku: 'WM-JM-120-03', cover: 'amino acid facial cleanser white tube' },
    { prodName: '雅诗兰黛白金级花菁萃面霜 50ml', brand: '雅诗兰黛', spec: '50ml', cat1: '护肤', cat2: '面部护肤', cat3: '面霜', unitPrice: 2680, sku: 'YSLD-BJ-50ML', cover: 'estee lauder re nutriv cream jar' },
    { prodName: '雅诗兰黛小棕瓶特润修护精华眼霜 15ml', brand: '雅诗兰黛', spec: '15ml', cat1: '护肤', cat2: '眼部护理', cat3: '眼霜', unitPrice: 590, sku: 'EL-EYE-15-022', cover: 'estee lauder advanced night repair eye cream' }
  ];

  /* statusKey 权重：待付款/待发货/已发货/待收货/已完成/退款中/已退款/已取消 */
  var STATUS_POOL = [
    { status: '待付款', statusKey: 'pending', payStatus: '未支付', payStatusKey: 'unpaid', deliveryStatus: '待发货', deliveryStatusKey: 'await', refund: '—' },
    { status: '待发货', statusKey: 'await', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '待发货', deliveryStatusKey: 'await', refund: '—' },
    { status: '待发货', statusKey: 'await', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '待发货', deliveryStatusKey: 'await', refund: '—' },
    { status: '已发货', statusKey: 'shipped', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '运输中', deliveryStatusKey: 'shipping', refund: '—' },
    { status: '已发货', statusKey: 'shipped', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '已揽件', deliveryStatusKey: 'picked', refund: '—' },
    { status: '待收货', statusKey: 'receive', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '派送中', deliveryStatusKey: 'delivering', refund: '—' },
    { status: '已完成', statusKey: 'done', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '已签收', deliveryStatusKey: 'signed', refund: '—' },
    { status: '已完成', statusKey: 'done', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '已签收', deliveryStatusKey: 'signed', refund: '—' },
    { status: '已完成', statusKey: 'done', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '已签收', deliveryStatusKey: 'signed', refund: '—' },
    { status: '退款中', statusKey: 'refunding', payStatus: '已支付', payStatusKey: 'paid', deliveryStatus: '已签收', deliveryStatusKey: 'signed', refund: '退款中' },
    { status: '已退款', statusKey: 'refunded', payStatus: '已退款', payStatusKey: 'refund', deliveryStatus: '已退款', deliveryStatusKey: 'refund', refund: '已退款' },
    { status: '已取消', statusKey: 'cancel', payStatus: '未支付', payStatusKey: 'unpaid', deliveryStatus: '待发货', deliveryStatusKey: 'await', refund: '—' }
  ];
  var REMARKS = [
    '', '', '', '请尽快发货', '生日礼物急用', '请附小样', '泡沫箱防压', '礼袋包装',
    '发票抬头：个人', '放门口勿敲门', '过敏体质请核对成分', '周末再送'
  ];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pad4(n) {
    var s = String(n);
    while (s.length < 4) s = '0' + s;
    return s;
  }
  function pick(arr, i) { return arr[i % arr.length]; }
  function round2(n) { return Math.round(n * 100) / 100; }
  function pickGroup(i) {
    var cycle = i % 9;
    if (cycle < 5) return GROUPS[0].orderGroup;
    if (cycle < 7) return GROUPS[1].orderGroup;
    if (cycle === 7) return GROUPS[2].orderGroup;
    return GROUPS[3].orderGroup;
  }

  function buildOne(i, imgFn) {
    var n = i + 1;
    var prod = pick(PRODUCTS, i);
    var user = pick(USERS, i);
    var reg = pick(REGS, i + 3);
    var st = pick(STATUS_POOL, i);
    var pay = pick(PAYS, i + 1);
    var del = pick(DELIVERIES, i + 2);
    var merchant = pick(MERCHANTS, i);
    var store = pick(STORES, i + 1);
    var activity = pick(ACTIVITIES, i);
    var channel = pick(CHANNELS, i);
    var warehouse = pick(WAREHOUSES, i);

    /* 日期：近半年为主，少量更早 */
    var dayOffset = (i % 40 === 0) ? (120 + (i % 200)) : (i % 55);
    var base = new Date(2026, 7, 26, 9, 0, 0); /* 2026-08-26 */
    base.setDate(base.getDate() - dayOffset);
    base.setHours(8 + (i % 14), (i * 7) % 60, (i * 13) % 60);
    var y = base.getFullYear();
    var m = pad2(base.getMonth() + 1);
    var d = pad2(base.getDate());
    var hh = pad2(base.getHours());
    var mm = pad2(base.getMinutes());
    var ss = pad2(base.getSeconds());
    var orderTime = y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
    var id = 'DD' + y + m + d + pad4(n);

    var qty = 1 + (i % 4);
    if (prod.unitPrice > 2000) qty = 1 + (i % 2);
    var unitPrice = prod.unitPrice;
    var totalPrice = round2(unitPrice * qty);
    var discount = 0;
    if (activity === '满减') discount = round2(Math.min(totalPrice * 0.08, 200));
    else if (activity === '会员折扣') discount = round2(totalPrice * 0.05);
    else if (activity === '新人专享') discount = round2(Math.min(40 + (i % 3) * 10, totalPrice * 0.15));
    else if (activity === '秒杀') discount = round2(Math.min(totalPrice * 0.12, 300));
    else if (activity === '优惠券') discount = round2(20 + (i % 5) * 10);
    else if (activity === '买赠') discount = 0;
    if (st.statusKey === 'refunded') discount = totalPrice;
    var payAmount = round2(Math.max(0, totalPrice - discount));
    if (st.payStatusKey === 'unpaid' && st.statusKey !== 'cancel') {
      /* 待付款仍保留应付 */
    }
    if (st.statusKey === 'refunded') {
      payAmount = 0;
    }

    /* 货到付款对齐 */
    if (pay.payMethodKey === 'cod' && st.statusKey !== 'cancel' && st.statusKey !== 'pending') {
      pay = { payMethod: '货到付款', payMethodKey: 'cod' };
    }
    /* 到店/无需物流 */
    if (del.deliveryKey === 'pickup' || del.deliveryKey === 'none') {
      if (st.statusKey === 'shipped' || st.statusKey === 'receive') {
        st = Object.assign({}, st, {
          status: '已完成', statusKey: 'done',
          deliveryStatus: del.deliveryKey === 'pickup' ? '已完成' : '已完成',
          deliveryStatusKey: 'done'
        });
      }
    }

    var phoneRaw = '1' + String(3 + (i % 6)) + String(100000000 + ((i * 7919) % 89999999)).slice(0, 8);
    var receiverPhone = phoneRaw.slice(0, 3) + '****' + phoneRaw.slice(7);
    var receiverName = user.userName;
    var addressFull = reg.city + reg.district + reg.address;
    var freight = (del.deliveryKey === 'pickup' || del.deliveryKey === 'none') ? 0 : (del.deliveryKey === 'sf' ? 12 : 6);
    if (payAmount >= 199) freight = 0;
    var pointsUsed = (i % 5 === 0) ? (50 + (i % 10) * 10) : 0;
    var couponCode = (activity === '优惠券' || activity === '新人专享') ? ('CP' + (2026000 + i)) : '';
    var deliveryNo = '—';
    if (/已揽件|运输中|派送中|已签收/.test(st.deliveryStatus) && del.deliveryKey !== 'pickup' && del.deliveryKey !== 'none') {
      deliveryNo = (del.deliveryKey === 'sf' ? 'SF' : del.deliveryKey === 'jd' ? 'JD' : 'YT') +
        String(1000000000000 + i * 7919).slice(0, 12);
    }
    var invoice = (i % 3 !== 2);
    var remark = pick(REMARKS, i);
    if (st.statusKey === 'refunding' || st.statusKey === 'refunded') {
      remark = remark || '申请退货退款';
    }
    var coverPrompt = (prod.prodName || prod.cover || '') + ' beauty cosmetics product photography white background';
    var skuSlug = String(prod.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var prodCover = skuSlug ? ('./static/products/' + skuSlug + '.jpg') : '';
    if (typeof imgFn === 'function' && !prodCover) {
      prodCover = imgFn(coverPrompt);
    }

    var payStatus = st.payStatus;
    var payStatusKey = st.payStatusKey;
    if (st.statusKey === 'shipped' && i % 11 === 0) {
      payStatus = '部分退款';
      payStatusKey = 'part';
    }

    return {
      id: id,
      orderGroup: pickGroup(i),
      orderTime: orderTime,
      userId: user.userId,
      userName: user.userName,
      userAvatarBg: user.userAvatarBg,
      userAvatarText: user.userAvatarText,
      merchantName: merchant,
      store: store,
      warehouse: warehouse,
      channel: channel,
      prodName: prod.prodName,
      prodSku: prod.sku,
      brand: prod.brand,
      spec: prod.spec,
      cat1: prod.cat1,
      cat2: prod.cat2,
      cat3: prod.cat3,
      unitPrice: unitPrice,
      prodQty: qty,
      totalPrice: totalPrice,
      activityType: activity,
      discountPrice: discount,
      payAmount: payAmount,
      freight: freight,
      pointsUsed: pointsUsed,
      couponCode: couponCode,
      prodCover: prodCover,
      coverPrompt: coverPrompt,
      itemCount: qty,
      orderAmount: payAmount,
      payMethod: pay.payMethod,
      payMethodKey: pay.payMethodKey,
      payStatus: payStatus,
      payStatusKey: payStatusKey,
      delivery: del.delivery,
      deliveryStatus: st.deliveryStatus,
      deliveryStatusKey: st.deliveryStatusKey,
      deliveryNo: deliveryNo,
      status: st.status,
      statusKey: st.statusKey,
      refund: payStatusKey === 'part' ? '部分退款' : st.refund,
      receiverName: receiverName,
      receiverPhone: receiverPhone,
      province: reg.province,
      city: reg.city,
      district: reg.district,
      address: addressFull,
      invoice: invoice,
      remark: remark,
      source: 'beauty-order-seed'
    };
  }

  function list(imgFn) {
    var out = [];
    for (var i = 0; i < 100; i++) out.push(buildOne(i, imgFn));
    return out;
  }

  function hashIndex(str, mod) {
    var h = 0;
    var s = String(str == null ? '' : str);
    for (var k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
    return mod ? (h % mod) : h;
  }

  function isSparseAddress(addr) {
    var a = String(addr || '');
    return !a || a === '-' || a === '—' || /待完善|App端下单/.test(a);
  }

  function normalizeOpsCover(src) {
    if (!src) return '';
    return String(src)
      .replace(/^\.\.\/运营管理系统\//, './')
      .replace(/^运营管理系统\//, './')
      .replace(/^\.\.\/\.\.\/运营管理系统\//, './');
  }

  function enrich(o, i, imgFn) {
    if (!o) return o;
    var idx = hashIndex(o.id || o.userId || i || 0, REGS.length);
    var reg = REGS[idx];
    var addr = String(o.address || '');
    if (isSparseAddress(addr) || !o.province) {
      if (isSparseAddress(addr)) {
        o.province = reg.province;
        o.city = reg.city;
        o.district = reg.district;
        o.address = reg.province + reg.city + reg.district + reg.address;
      } else {
        for (var r = 0; r < REGS.length; r++) {
          if (addr.indexOf(REGS[r].city) >= 0 || addr.indexOf(REGS[r].province.replace(/市$/, '')) >= 0) {
            o.province = o.province || REGS[r].province;
            o.city = o.city || REGS[r].city;
            o.district = o.district || REGS[r].district;
            break;
          }
        }
        if (!o.province) {
          o.province = reg.province;
          o.city = reg.city;
          o.district = reg.district;
        }
      }
    }
    if (o.freight == null) o.freight = 0;
    if (o.pointsUsed == null) o.pointsUsed = 0;
    if (!o.channel || o.channel === '-' || o.channel === '—') o.channel = 'App';
    if (!o.warehouse || o.warehouse === '-' || o.warehouse === '—') o.warehouse = pick(WAREHOUSES, idx);
    if (!o.store || o.store === '-' || o.store === '—') o.store = pick(STORES, idx + 1);
    if (!o.orderGroup || o.orderGroup === '-' || o.orderGroup === '—') o.orderGroup = '普通订单';
    if (!o.receiverName || o.receiverName === '-' || o.receiverName === '—') {
      o.receiverName = o.userName || '收货人';
    }
    if (!o.receiverPhone || o.receiverPhone === '138****0000' || o.receiverPhone === '-' || o.receiverPhone === '—') {
      o.receiverPhone = '138****' + String(1000 + (idx * 137) % 9000);
    }
    var needTrack = /已发货|待收货|确认收货|已完成/.test(String(o.status || '')) ||
      /运输中|已揽件|派送中|已签收/.test(String(o.deliveryStatus || ''));
    if ((!o.deliveryNo || o.deliveryNo === '-' || o.deliveryNo === '—') && needTrack) {
      o.deliveryNo = 'SF' + String(1000000000000 + (hashIndex(o.id, 899999999999)));
    } else if (!o.deliveryNo) {
      o.deliveryNo = '—';
    }
    if (!o.couponCode || o.couponCode === '') {
      o.couponCode = Number(o.discountPrice) > 0 ? ('CP' + String(100000 + (idx * 97) % 900000)) : '—';
    }
    if (o.prodCover) o.prodCover = normalizeOpsCover(o.prodCover);
    /* 有商品名时优先用名称派生本地图路径（运营端 coverFromProdName 会再精匹配） */
    if ((!o.prodCover || /\/gen\//i.test(String(o.prodCover))) && o.prodSku) {
      var slug = String(o.prodSku).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (slug) o.prodCover = './static/products/' + slug + '.jpg';
    }
    if (!o.prodCover && o.coverPrompt && typeof imgFn === 'function') {
      o.prodCover = imgFn(o.coverPrompt);
    }
    if (!o.coverPrompt && o.prodName) {
      o.coverPrompt = String(o.prodName) + ' beauty cosmetics product photography white background';
    }
    return o;
  }

  var api = { list: list, enrich: enrich, count: 100 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyOrderSeed = api;
})(typeof window !== 'undefined' ? window : global);
