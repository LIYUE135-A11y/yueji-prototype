/**
 * 美妆售后种子 · 100 条（运营售后管理 / 数据中心售后数据）
 */
(function (global) {
  var TYPES = [
    { afterType: '退货退款', afterTypeKey: 'return' },
    { afterType: '仅退款', afterTypeKey: 'refund' },
    { afterType: '换货', afterTypeKey: 'exchange' },
    { afterType: '维修', afterTypeKey: 'repair' }
  ];
  var REASONS = ['质量问题', '过敏不适', '7天无理由', '发错货', '物流损坏', '尺寸不合适', '不喜欢效果差', '其他'];
  var STATUSES = [
    { status: '待商家审核', statusKey: 'pending' },
    { status: '审核通过待寄回', statusKey: 'approved' },
    { status: '用户已寄回', statusKey: 'shipped' },
    { status: '商家已收货', statusKey: 'received' },
    { status: '退款中', statusKey: 'refunding' },
    { status: '换货中', statusKey: 'exchanging' },
    { status: '已完成', statusKey: 'done' },
    { status: '换货完成', statusKey: 'exdone' },
    { status: '审核拒绝', statusKey: 'rejected' },
    { status: '已取消', statusKey: 'canceled' }
  ];
  var REFUNDS = [
    { refundMethod: '原路退回', refundKey: 'original' },
    { refundMethod: '微信', refundKey: 'wechat' },
    { refundMethod: '支付宝', refundKey: 'alipay' },
    { refundMethod: '银行卡', refundKey: 'card' },
    { refundMethod: '余额', refundKey: 'balance' },
    { refundMethod: '', refundKey: '' }
  ];
  var HANDLERS = ['客服小美', '客服小紫', '客服小修', '运营管家', '商家客服A', '商家客服B', ''];
  var CHANNELS = ['App申请', '小程序', '客服代提', '订单页快捷', '电话工单'];
  var PRIORITIES = ['普通', '普通', '普通', '加急', '重大客诉'];
  var WAREHOUSES = ['华东售后仓', '华南售后仓', '华北售后仓', '西南售后仓'];
  var PROVINCES = ['上海市', '浙江省', '广东省', '北京市', '四川省', '江苏省', '湖北省', '陕西省', '重庆市', '湖南省'];
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
  var PRODUCTS = [
    { name: '神仙水精华露 230ml 补水保湿提亮', spec: '230ml · 经典款', sku: 'SK2-ESS-230-A', brand: 'SK-II', cat1: '护肤', merchant: 'SK-II奢享汇', price: 1599, cover: 'sk2 essence bottle 230ml luxury skincare' },
    { name: '兰蔻小黑瓶精华肌底液 100ml', spec: '100ml · 正装', sku: 'LK-XHP-100B', brand: 'Lancôme', cat1: '护肤', merchant: '兰蔻官方授权店', price: 1293, cover: 'lancome genifique serum black bottle' },
    { name: '小棕瓶特润修护精华眼霜 15ml', spec: '15ml · 单瓶', sku: 'EL-EYE-15', brand: '雅诗兰黛', cat1: '护肤', merchant: '海蓝精选', price: 590, cover: 'estee lauder night repair eye cream' },
    { name: '花西子同心锁口红 哑光雾面 M301', spec: '3.2g · M301', sku: 'HXZ-KK-M301', brand: '花西子', cat1: '彩妆', merchant: '花西子国风旗舰店', price: 169, cover: 'huaxizi carved lipstick matte' },
    { name: '氨基酸净透洁面乳 120g', spec: '120g · 单支', sku: 'WM-JM-120', brand: '阅己自研', cat1: '护肤', merchant: '完美日记品牌店', price: 69, cover: 'amino acid facial cleanser tube' },
    { name: '玻尿酸补水保湿面膜 10片装', spec: '25ml × 10片', sku: 'HA-MASK-10', brand: '自然堂', cat1: '护肤', merchant: '自然堂生活美学馆', price: 128, cover: 'hyaluronic acid sheet mask box' },
    { name: '复颜玻尿酸水光充盈乳液 110ml', spec: '110ml · 单支', sku: 'LOREAL-FY-110', brand: 'L\'Oréal Paris', cat1: '护肤', merchant: '欧莱雅集团官方店', price: 299, cover: 'loreal hyaluronic emulsion' },
    { name: '修丽可色修精华 30ml', spec: '30ml · 正装', sku: 'XLK-SX-30', brand: '修丽可', cat1: '护肤', merchant: '修丽可官方旗舰店', price: 780, cover: 'skinceuticals phyto corrective' },
    { name: '珂润润浸保湿洁颜泡沫 150ml', spec: '150ml · 泵装', sku: 'CRL-JM-150', brand: '珂润', cat1: '护肤', merchant: '珂润敏感肌护理店', price: 149, cover: 'curel cleansing foam pump' },
    { name: '雅诗兰黛小棕瓶第七代修护精华 75ml', spec: '75ml · 第七代', sku: 'YSLD-XZP-75', brand: '雅诗兰黛', cat1: '护肤', merchant: '阅己美妆旗舰店', price: 1490, cover: 'estee lauder advanced night repair' },
    { name: '花西子玉容养肤气垫CC霜 C30', spec: 'C30 · 13g', sku: 'HXZ-QD-C30', brand: '花西子', cat1: '彩妆', merchant: '花西子国风旗舰店', price: 199, cover: 'huaxizi jade cushion cc cream' },
    { name: 'SK-II 大红瓶面霜 80g 轻盈版', spec: '80g · 轻盈版', sku: 'SK2-DHP-80', brand: 'SK-II', cat1: '护肤', merchant: 'SK-II奢享汇', price: 1399, cover: 'sk2 rna power cream red jar' },
    { name: '兰蔻菁纯臻颜精萃乳霜 60ml', spec: '60ml · 滋润版', sku: 'LK-JC-60', brand: 'Lancôme', cat1: '护肤', merchant: '兰蔻官方授权店', price: 2180, cover: 'lancome absolution cream gold' },
    { name: '完美日记探险家十二色眼影盘 玉兔盘', spec: '玉兔盘 · 12色', sku: 'WMRJ-YS-12', brand: '完美日记', cat1: '彩妆', merchant: '完美日记品牌店', price: 129.9, cover: 'perfect diary eyeshadow jade rabbit' },
    { name: '修丽可维生素CE复合修护精华 30ml', spec: '30ml · 正装', sku: 'XLK-CE-30', brand: '修丽可', cat1: '护肤', merchant: '修丽可官方旗舰店', price: 960, cover: 'skinceuticals CE ferulic serum' },
    { name: '珂润浸润保湿面霜 40g', spec: '40g · 软管', sku: 'CRL-MS-40', brand: '珂润', cat1: '护肤', merchant: '珂润敏感肌护理店', price: 188, cover: 'curel moisturizing cream jar' },
    { name: '黑金松露奢养面霜 50ml', spec: '50ml · 单罐', sku: 'LOREAL-HJ-50', brand: 'L\'Oréal Paris', cat1: '护肤', merchant: '欧莱雅集团官方店', price: 459, cover: 'loreal black gold truffle cream' },
    { name: '海蓝之谜精华面霜经典款 60ml', spec: '60ml · 经典款', sku: 'LM-MS-60', brand: '海蓝之谜', cat1: '护肤', merchant: '海蓝精选', price: 3280, cover: 'la mer moisturizing cream jar' },
    { name: 'SK-II 前男友面膜 10片装', spec: '10片 · 盒装', sku: 'SK2-MM-10', brand: 'SK-II', cat1: '护肤', merchant: '阅己美妆旗舰店', price: 1090, cover: 'sk2 pitera facial mask box' },
    { name: '荔萌镜面水光唇釉 03#白桃乌龙', spec: '1.5g · 03#', sku: 'LM-YG-03', brand: '荔萌', cat1: '彩妆', merchant: '优品美妆专营店', price: 39.9, cover: 'leemember lip gloss peach oolong' }
  ];
  var REMARKS = [
    '已登记跟进，等待买家补充凭证。',
    '符合7天无理由，同意放行。',
    '过敏客诉已升级品牌医学顾问。',
    '仓库发错货，运费店铺承担。',
    '物流外包装完好，婉拒仅退款并赠券。',
    '换货新件已发出，旧件到付寄回。',
    '价保差价已退回原支付账户。',
    '重大客诉越级处理完毕。',
    '维修完成后原路寄回并附赠品。',
    '买家主动取消售后。'
  ];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pad4(n) {
    var s = String(n);
    while (s.length < 4) s = '0' + s;
    return s;
  }
  function pick(arr, i) { return arr[i % arr.length]; }
  function round2(n) { return Math.round(n * 100) / 100; }

  function pickType(i) {
    var r = i % 10;
    if (r < 4) return TYPES[0];
    if (r < 7) return TYPES[1];
    if (r < 9) return TYPES[2];
    return TYPES[3];
  }
  function pickStatus(i, typeKey) {
    var pool = STATUSES;
    if (typeKey === 'exchange') {
      pool = [STATUSES[0], STATUSES[1], STATUSES[5], STATUSES[7], STATUSES[8], STATUSES[9]];
    } else if (typeKey === 'repair') {
      pool = [STATUSES[0], STATUSES[1], STATUSES[2], STATUSES[3], STATUSES[6], STATUSES[8]];
    } else if (typeKey === 'refund') {
      pool = [STATUSES[0], STATUSES[4], STATUSES[6], STATUSES[8], STATUSES[9]];
    }
    return pick(pool, i);
  }

  function buildOne(i, imgFn) {
    var n = i + 1;
    var prod = pick(PRODUCTS, i);
    var user = pick(USERS, i + 3);
    var type = pickType(i);
    var reason = pick(REASONS, i + 1);
    var st = pickStatus(i + 2, type.afterTypeKey);
    var refund = pick(REFUNDS, i);
    if (type.afterTypeKey === 'exchange' || type.afterTypeKey === 'repair') {
      if (st.statusKey !== 'done' && st.statusKey !== 'exdone') {
        refund = REFUNDS[5];
      }
    }
    if (st.statusKey === 'rejected' || st.statusKey === 'canceled' || st.statusKey === 'pending') {
      if (st.statusKey !== 'done') refund = (st.statusKey === 'pending') ? pick(REFUNDS, i % 5) : REFUNDS[5];
    }
    var handler = pick(HANDLERS, i);
    if (st.statusKey === 'pending') handler = '';
    if (!handler && st.statusKey !== 'pending' && st.statusKey !== 'shipped') {
      handler = pick(HANDLERS, i + 1) || '客服小美';
    }

    var dayOff = (i % 40 === 0) ? (100 + (i % 200)) : (i % 55);
    var base = new Date(2026, 7, 26, 10, 0, 0);
    base.setDate(base.getDate() - dayOff);
    base.setHours(9 + (i % 12), (i * 13) % 60, (i * 19) % 60);
    var y = base.getFullYear();
    var m = pad2(base.getMonth() + 1);
    var d = pad2(base.getDate());
    var applyTime = y + '-' + m + '-' + d + ' ' + pad2(base.getHours()) + ':' + pad2(base.getMinutes()) + ':' + pad2(base.getSeconds());
    var id = 'SH' + y + m + d + pad4(n);
    var orderId = 'DD' + y + m + d + pad4(200 + n);

    var handleTime = '';
    if (handler) {
      var ht = new Date(base.getTime() + 3600000 * (2 + (i % 48)));
      handleTime = ht.getFullYear() + '-' + pad2(ht.getMonth() + 1) + '-' + pad2(ht.getDate()) +
        ' ' + pad2(ht.getHours()) + ':' + pad2(ht.getMinutes()) + ':' + pad2(ht.getSeconds());
    }

    var amount = round2(prod.price * (0.5 + (i % 6) * 0.1));
    if (type.afterTypeKey === 'repair') amount = round2(prod.price * 0.3);
    if (reason === '7天无理由') amount = prod.price;

    var proofCount = (i % 5 === 0) ? 0 : (1 + (i % 2));
    if (reason === '过敏不适' || reason === '质量问题' || reason === '物流损坏') {
      proofCount = Math.max(1, proofCount);
    }
    var proof = [];
    for (var p = 0; p < proofCount; p++) {
      var prompt = prod.cover + ' aftersale proof photo ' + (p + 1) + ' ' + reason;
      proof.push(typeof imgFn === 'function' ? imgFn(prompt) : '');
    }

    var coverPrompt = (prod.name || prod.cover || '') + ' beauty cosmetics product photography white background';
    var skuSlug = String(prod.sku || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var prodCover = skuSlug ? ('./static/products/' + skuSlug + '.jpg') : '';
    if (typeof imgFn === 'function' && !prodCover) {
      prodCover = imgFn(coverPrompt);
    }
    var priority = pick(PRIORITIES, i);
    if (reason === '过敏不适' && amount > 1000) priority = '重大客诉';
    var channel = pick(CHANNELS, i);
    var warehouse = pick(WAREHOUSES, i);
    var province = pick(PROVINCES, i);
    var expressNo = '—';
    if (/寄回|收货|退款中|换货中|换货完成|已完成/.test(st.status)) {
      expressNo = (i % 2 === 0 ? 'SF' : 'YT') + String(1000000000000 + i * 7919).slice(0, 12);
    }
    var refundAmount = 0;
    if (/退款|已完成/.test(st.status) && type.afterTypeKey !== 'exchange' && type.afterTypeKey !== 'repair') {
      refundAmount = amount;
      if (st.statusKey === 'rejected' || st.statusKey === 'canceled') refundAmount = 0;
    }
    var slaHours = 12 + (i % 5) * 12;
    var remark = pick(REMARKS, i);
    if (priority === '重大客诉') remark = '重大客诉：' + remark;

    return {
      id: id,
      orderId: orderId,
      afterType: type.afterType,
      afterTypeKey: type.afterTypeKey,
      reason: reason,
      prodName: prod.name,
      prodSpec: prod.spec,
      prodSku: prod.sku,
      prodCover: prodCover,
      coverPrompt: coverPrompt,
      prodMerchant: prod.merchant,
      brand: prod.brand,
      cat1: prod.cat1,
      userName: user.userName,
      userId: user.userId,
      userAvatarBg: user.userAvatarBg,
      userAvatarText: user.userAvatarText,
      amount: amount,
      refundAmount: refundAmount,
      applyTime: applyTime,
      status: st.status,
      statusKey: st.statusKey,
      handler: handler,
      handleTime: handleTime,
      proof: proof,
      refundMethod: refund.refundMethod,
      refundKey: refund.refundKey,
      remark: remark,
      channel: channel,
      priority: priority,
      warehouse: warehouse,
      province: province,
      expressNo: expressNo,
      slaHours: slaHours,
      source: 'beauty-aftersale-seed'
    };
  }

  function list(imgFn) {
    var out = [];
    for (var i = 0; i < 100; i++) out.push(buildOne(i, imgFn));
    return out;
  }

  function normalizeOpsCover(src) {
    if (!src) return '';
    return String(src)
      .replace(/^\.\.\/运营管理系统\//, './')
      .replace(/^运营管理系统\//, './')
      .replace(/^\.\.\/\.\.\/运营管理系统\//, './');
  }

  function isBlank(v) {
    var s = String(v == null ? '' : v).trim();
    return !s || s === '-' || s === '—';
  }

  function hashIndex(str, mod) {
    var h = 0;
    var s = String(str == null ? '' : str);
    for (var k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
    return mod ? (h % mod) : h;
  }

  /** 按商品名 / SKU 从种子目录回填品牌、规格、商家等 */
  function matchProduct(a) {
    var name = String((a && a.prodName) || '');
    var sku = String((a && a.prodSku) || '').toLowerCase();
    var i;
    for (i = 0; i < PRODUCTS.length; i++) {
      var p = PRODUCTS[i];
      if (sku && String(p.sku).toLowerCase() === sku) return p;
    }
    for (i = 0; i < PRODUCTS.length; i++) {
      var p2 = PRODUCTS[i];
      if (name && (name.indexOf(p2.name) >= 0 || p2.name.indexOf(name.slice(0, 8)) >= 0)) return p2;
      if (name && p2.brand && name.indexOf(p2.brand) >= 0 && name.indexOf(p2.name.slice(0, 4)) >= 0) return p2;
    }
    /* 关键词兜底 */
    var KEYS = [
      [/神仙水|SK-?II.*精华/i, 0], [/小黑瓶|肌底液/i, 1], [/眼霜|小棕瓶.*眼/i, 2],
      [/同心锁|口红/i, 3], [/洁面/i, 4], [/面膜/i, 5], [/复颜|乳液/i, 6],
      [/色修/i, 7], [/洁颜泡沫|珂润.*洁/i, 8], [/小棕瓶|修护精华/i, 9],
      [/气垫/i, 10], [/大红瓶/i, 11], [/菁纯/i, 12], [/眼影/i, 13],
      [/维生素\s*CE|CE复合/i, 14], [/珂润.*面霜/i, 15], [/黑金松露/i, 16],
      [/海蓝之谜|面霜/i, 17], [/前男友/i, 18], [/唇釉/i, 19]
    ];
    for (i = 0; i < KEYS.length; i++) {
      if (KEYS[i][0].test(name)) return PRODUCTS[KEYS[i][1]];
    }
    return null;
  }

  function enrich(a, imgFn) {
    if (!a) return a;
    var matched = matchProduct(a);
    if (matched) {
      if (isBlank(a.brand)) a.brand = matched.brand;
      if (isBlank(a.cat1)) a.cat1 = matched.cat1;
      if (isBlank(a.prodSku)) a.prodSku = matched.sku;
      if (isBlank(a.prodSpec)) a.prodSpec = matched.spec;
      if (isBlank(a.prodMerchant)) a.prodMerchant = matched.merchant;
      if (isBlank(a.prodName) || a.prodName === '商品') a.prodName = matched.name;
      if (!a.coverPrompt) a.coverPrompt = (matched.name || matched.cover || '') + ' beauty cosmetics product photography white background';
    }
    if (a.refundAmount == null) a.refundAmount = 0;
    if (isBlank(a.channel)) a.channel = 'App申请';
    if (isBlank(a.priority)) a.priority = '普通';
    if (isBlank(a.warehouse)) a.warehouse = pick(WAREHOUSES, hashIndex(a.id || a.orderId, WAREHOUSES.length));
    if (isBlank(a.province)) a.province = pick(PROVINCES, hashIndex(a.id || a.userId, PROVINCES.length));
    if (isBlank(a.expressNo)) a.expressNo = '—';
    if (a.slaHours == null) a.slaHours = 24;
    if (isBlank(a.brand)) a.brand = matched ? matched.brand : '护肤';
    if (isBlank(a.cat1)) a.cat1 = '护肤';
    if (isBlank(a.prodSku) && matched) a.prodSku = matched.sku;
    if (isBlank(a.prodSpec)) a.prodSpec = '标准装';
    if (isBlank(a.prodMerchant)) a.prodMerchant = '阅己美妆旗舰店';
    if (!Array.isArray(a.proof)) a.proof = [];
    if (a.prodCover) a.prodCover = normalizeOpsCover(a.prodCover);
    if ((!a.prodCover || /\/gen\//i.test(String(a.prodCover))) && a.prodSku) {
      var slug = String(a.prodSku).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (slug) a.prodCover = './static/products/' + slug + '.jpg';
    }
    if (!a.prodCover && a.coverPrompt && typeof imgFn === 'function') {
      a.prodCover = imgFn(a.coverPrompt);
    }
    if (!a.coverPrompt && a.prodName) {
      a.coverPrompt = String(a.prodName) + ' beauty cosmetics product photography white background';
    }
    return a;
  }

  var api = { list: list, enrich: enrich, count: 100 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyAftersaleSeed = api;
})(typeof window !== 'undefined' ? window : global);
