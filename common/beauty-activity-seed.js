/**
 * 美妆活动种子 · 每类型 100 条（共 600）运营活动管理 / 数据中心活动数据
 * 注意：活动名不作商品标题，仅作营销活动名称。
 * version: v3-100-per-type
 */
(function (global) {
  var VERSION = 'v3-100-per-type';
  var PER_TYPE = 100;

  var TYPES = [
    { type: '满减', typeKey: 'manjian', idPrefix: 'MJ' },
    { type: '满折', typeKey: 'manzhe', idPrefix: 'MZ' },
    { type: '秒杀', typeKey: 'shaimiao', idPrefix: 'SK' },
    { type: '拼团', typeKey: 'pintuan', idPrefix: 'PT' },
    { type: '优惠券', typeKey: 'coupon', idPrefix: 'CP' },
    { type: '赠品', typeKey: 'gift', idPrefix: 'GF' }
  ];
  var STATUSES = [
    { status: '进行中', statusKey: 'ongoing' },
    { status: '进行中', statusKey: 'ongoing' },
    { status: '进行中', statusKey: 'ongoing' },
    { status: '未开始', statusKey: 'upcoming' },
    { status: '已结束', statusKey: 'ended' },
    { status: '已暂停', statusKey: 'paused' }
  ];
  var AUDIT_POOL = [
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '待审核', auditKey: 'pending' },
    { auditStatus: '审核未通过', auditKey: 'fail' },
    { auditStatus: '已驳回', auditKey: 'reject' }
  ];
  var PRODUCT_SCOPES = ['全部商品', '指定商品', '指定分类'];
  var USER_SCOPES = ['全部用户', 'VIP会员', '新注册用户', '指定用户'];
  var CHANNELS = ['App', '小程序', 'H5商城', '直播间', '专柜导购', '社群推送'];
  var SCENES = ['大促主会场', '品牌日', '会员日', '新人专享', '品类日', '节日营销', '日常运营', '直播专场'];
  var BUDGETS = ['平台补贴', '商家出资', '品牌联合', '混合出资'];
  var PROVINCES = ['全国', '华东', '华南', '华北', '西南', '华中', '东北', '西北'];
  var CATEGORIES = ['护肤', '彩妆', '香水', '个护', '母婴护理', '全品类'];
  var BRANDS = ['SK-II', '兰蔻', '雅诗兰黛', '完美日记', '花西子', '自然堂', '欧莱雅', '修丽可', '珂润', '海蓝之谜', '阅己', '薇诺娜'];
  var MERCHANTS = [
    '阅己美妆旗舰店', '兰蔻官方授权店', '完美日记品牌店', '自然堂生活美学馆',
    'SK-II奢享汇', '修丽可官方旗舰店', '花西子国风旗舰店', '欧莱雅集团官方店'
  ];
  var OWNERS = ['运营小妍', '活动组-阿宁', '品牌合作部', '增长组', '直播运营组', '会员运营组'];
  var DEPARTMENTS = ['运营中心', '活动运营组', '品牌合作部', '增长组', '市场品牌部'];
  var PRIORITIES = ['P0', 'P1', 'P1', 'P2', 'P2', 'P3'];
  var RISK_LEVELS = ['低', '低', '中', '中', '高'];
  var EXCLUSIVITY = ['可与券叠加', '不可与满减同享', '仅本活动', '可与会员折扣叠加', '互斥全部促销'];
  var TAGS_POOL = ['爆款', '限时', '新人必领', '会员专享', '直播同款', '国货', '敏感肌友好', '大促预热', '清仓', '礼盒'];
  var CITY_LIMITS = ['不限', '一线城市', '新一线', '华东省市', '华南省市', '北上广深'];
  var GENDER_LIMITS = ['不限', '女性优先', '不限', '不限'];
  var AGE_LIMITS = ['不限', '18-25', '26-35', '18-45', '不限'];
  var NOTIFY_MODES = ['Push', '短信', '站内信', 'Push+站内信', '不推送'];
  var LANDING_PAGES = [
    '/pages/activity/detail',
    '/pages/activity/618-sale',
    '/pages/activity/newbie-coupon',
    '/pages/shop/home',
    '/pages/discover/deals'
  ];
  var GIFT_NAMES = ['化妆包', '口红小样', '5ml香水小样', '面膜体验装', '旅行装精华', '美妆蛋套装', '护手霜'];
  var NAMES = [
    '双11全场满减', '超值底价拼团', '双12满折优惠', '限时秒杀专场', '新人首单满减',
    '领券中心', '满额赠好礼', '品牌日秒杀', '618品质狂欢节', '闺蜜拼团季',
    '会员专属满折', '双11预售券', '七夕浪漫满减', '午间12点秒杀', '新春赠品季',
    '年货节满减', '新品首发拼团', '护肤品类满折', '新人领券礼', '晚间8点秒杀',
    '38女王节满减', '满额赠香水小样', '新春团圆拼', '会员日专属', '会员专属券',
    '敏感肌专场满减', '国货彩妆满折', '玻尿酸品类日', '唇妆拼团周', '防晒季秒杀',
    '母婴护理满减', '香水小样买赠', '抗老精华满折', '换季维稳满减', '黑五跨境券',
    '元旦跨年秒杀', '春节礼盒满赠', '情人节双人拼', '植树节绿意券', '五一出行满减',
    '端午粽香满折', '毕业季彩妆拼', '暑期清仓秒杀', '开学焕新满减', '中秋团圆满赠',
    '国庆黄金周券', '双十一预热满减', '双十一狂欢秒杀', '双十二收官满折', '年终会员日',
    '护肤入门拼团', '贵妇面霜满减', '平价好物秒杀', '直播专属券', '社群裂变拼团',
    '积分兑换满赠', '回购专享满折', '店庆周年满减', '周末闪购秒杀', '月末清仓券',
    '早C晚A满减专场', '水乳套装满折', '气垫粉底秒杀', '眼霜买赠礼', '面膜囤货拼团',
    '防晒喷雾券', '香水彩妆满减', '卸妆油满折', '洁面慕斯秒杀', '身体乳满赠',
    '胶原口服拼团', '口红试色券', '眼影盘满减', '眉笔买一送一', '睫毛膏秒杀',
    '敏感肌券包', '熬夜急救满折', '旅行便携拼', '职场通勤满减', '约会妆容券',
    '换季修护满赠', '抗初老精华折', '控油清痘秒杀', '提亮肤色满减', '屏障修护券',
    '国风口红拼团', '学生党平价秒', '专柜同款满折', '直播间专属赠', '社群专属券',
    '积分加倍满减', '回购礼遇满折', '周年庆秒杀', '周末双人拼', '月末冲刺券',
    '跨年倒计时满减', '开年焕新满折', '情人节秒杀夜', '女神节拼团', '春日防晒券'
  ];
  var SLOGANS = [
    '美力加持·即刻焕新', '限时疯抢·手慢无', '会员尊享·多省一截', '新人见面礼',
    '大牌同款·底价回归', '囤货不慌·规则清晰', '直播同款·一键直达', '国货当红·满额立减'
  ];
  var DISCOUNTS = {
    manjian: ['满99减20', '满200减30 等3档', '满300减50 等5档', '满500减80 等4档', '满200减40'],
    manzhe: ['满300打8折', '满500打7折', '满200打9折', '满100打6折', '第2件半价'],
    shaimiao: ['最低3折', '直降50%', '低至2折', '3折起', '限时直降'],
    pintuan: ['5折起', '买2送1', '第2件半价', '满2件8折', '2人成团立减'],
    coupon: ['最高立减100元', '满100减20等', '注册即领50元券', '满500减50', '无门槛10元券'],
    gift: ['满500赠化妆包', '满300赠口红', '满200赠5ml香水', '满额赠小样', '买正装送旅行装']
  };
  var RULE_TEMPLATES = [
    '活动期间下单满足门槛即可享受优惠；优惠以结算页展示为准，数量有限先到先得。',
    '同一账号、同一设备、同一收货信息视为同一用户；超限订单系统自动取消优惠。',
    '赠品/秒杀库存独立统计，售完即止，不与其他赠品活动叠加。',
    '拼团需在规定时间内成团；未成团按规则退款或转单买价。',
    '优惠券领取后需在有效期内使用，过期自动作废，不可折现。'
  ];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = '0' + s;
    return s;
  }
  function pick(arr, i) { return arr[i % arr.length]; }
  function round1(n) { return Math.round(n * 10) / 10; }
  function round2(n) { return Math.round(n * 100) / 100; }
  function fmtDate(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function fmtDateTime(d) {
    return fmtDate(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function coverOf(n) {
    var file = 'sp100' + pad3(((n - 1) % 24) + 1);
    return './static/products/' + file + '.jpg';
  }

  function parseManjian(discount) {
    var m = String(discount || '').match(/满\s*(\d+(?:\.\d+)?)\s*减\s*(\d+(?:\.\d+)?)/);
    if (m) return { thresholdAmount: Number(m[1]), discountAmount: Number(m[2]), discountRate: 0 };
    return { thresholdAmount: 0, discountAmount: 0, discountRate: 0 };
  }
  function parseManzhe(discount) {
    var m = String(discount || '').match(/满\s*(\d+(?:\.\d+)?)\s*打\s*([\d.]+)\s*折/);
    if (m) return { thresholdAmount: Number(m[1]), discountAmount: 0, discountRate: Number(m[2]) };
    return { thresholdAmount: 0, discountAmount: 0, discountRate: 0 };
  }

  function buildOne(typeIdx, i) {
    var t = TYPES[typeIdx] || TYPES[0];
    var n = i + 1;
    var st = pick(STATUSES, i + 1 + typeIdx);
    if (st.statusKey === 'upcoming') {
      /* keep */
    } else if (i % 11 === 0) {
      st = STATUSES[4]; /* ended */
    }
    var name = (NAMES[i % NAMES.length] || ('美妆活动' + n)) + (i >= NAMES.length ? (' #' + n) : '');
    var id = (t.idPrefix || 'AC') + pad3(n);

    var startY = 2025 + (i % 2);
    var startM = 1 + (i % 12);
    var startD = 1 + (i % 27);
    var dur = 7 + (i % 20) * 3;
    var start = new Date(startY, startM - 1, startD, 10 + (i % 8), (i * 7) % 60);
    var end = new Date(start.getTime() + dur * 86400000);
    if (st.statusKey === 'ongoing') {
      start = new Date(2026, 0, 1 + (i % 28), 0, 0);
      end = new Date(2026, 11, 31, 23, 59);
    } else if (st.statusKey === 'upcoming') {
      start = new Date(2026, 8 + (i % 3), 1 + (i % 20), 10, 0);
      end = new Date(start.getTime() + 20 * 86400000);
    } else if (st.statusKey === 'ended') {
      start = new Date(2024 + (i % 2), i % 12, 1 + (i % 20), 9, 0);
      end = new Date(start.getTime() + (10 + i % 15) * 86400000);
    }
    var startTime = fmtDate(start);
    var endTime = fmtDate(end);
    var preheatStart = fmtDate(new Date(start.getTime() - (3 + i % 5) * 86400000));
    var preheatEnd = startTime;

    var discount = pick(DISCOUNTS[t.typeKey] || DISCOUNTS.manjian, i);
    var productScope = pick(PRODUCT_SCOPES, i);
    var userScope = pick(USER_SCOPES, i + 2);
    var limit = 1 + (i % 10);
    var stock = st.statusKey === 'ended' ? 0 : (50 + ((i * 97) % 20000));
    var view = st.statusKey === 'upcoming' ? 0 : (500 + ((i * 131) % 30000));
    var join = st.statusKey === 'upcoming' ? 0 : Math.floor(view * (0.2 + (i % 5) * 0.08));
    var refund = Math.floor(join * (0.015 + (i % 8) * 0.002));
    var refundRate = join ? (round1(refund * 100 / join) + '%') : '0.0%';
    var amount = st.statusKey === 'upcoming' ? 0 : Math.floor(join * (80 + (i % 40) * 12));
    var enabled = st.statusKey === 'ongoing' || st.statusKey === 'upcoming';
    if (st.statusKey === 'paused' || st.statusKey === 'ended') enabled = false;

    var channel = pick(CHANNELS, i);
    var scene = pick(SCENES, i + 1);
    var budget = pick(BUDGETS, i);
    var region = pick(PROVINCES, i);
    var stackable = i % 3 !== 0;
    var memberOnly = userScope === 'VIP会员';
    var couponCode = t.typeKey === 'coupon' ? ('AC' + (2026000 + typeIdx * 1000 + n)) : '';
    var budgetAmount = 10000 + ((i * 7919 + typeIdx * 1000) % 500000);
    var platformSubsidy = Math.floor(budgetAmount * (0.3 + (i % 5) * 0.1));
    var merchantSubsidy = Math.max(0, budgetAmount - platformSubsidy);
    var roi = round1(1.2 + (i % 30) / 10);
    var owner = pick(OWNERS, i);
    var department = pick(DEPARTMENTS, i + 1);
    var remark = scene + '·' + budget + (stackable ? '·可叠券' : '·不可叠券');

    var audit = pick(AUDIT_POOL, i + 3);
    if (st.statusKey === 'ongoing') audit = AUDIT_POOL[0];
    if (st.statusKey === 'upcoming' && i % 7 === 0) audit = AUDIT_POOL[3];

    var structured = t.typeKey === 'manzhe' ? parseManzhe(discount) : parseManjian(discount);
    if (t.typeKey === 'coupon') {
      structured.thresholdAmount = 50 + (i % 10) * 50;
      structured.discountAmount = 10 + (i % 9) * 10;
    }
    if (t.typeKey === 'shaimiao' || t.typeKey === 'pintuan') {
      structured.thresholdAmount = 0;
      structured.discountAmount = 0;
      structured.discountRate = 3 + (i % 5);
    }

    var totalQuota = stock > 0 ? stock : (100 + i * 10);
    var usedQuota = st.statusKey === 'upcoming' ? 0 : Math.min(totalQuota, Math.floor(join * (0.6 + (i % 4) * 0.1)));
    var remainQuota = Math.max(0, totalQuota - usedQuota);
    var orderCount = st.statusKey === 'upcoming' ? 0 : Math.floor(join * (0.55 + (i % 5) * 0.05));
    var payCount = st.statusKey === 'upcoming' ? 0 : Math.floor(orderCount * (0.85 + (i % 4) * 0.03));
    var payAmount = st.statusKey === 'upcoming' ? 0 : Math.floor(amount * (0.92 + (i % 5) * 0.01));
    var avgOrderAmount = payCount ? round2(payAmount / payCount) : 0;
    var shareCount = st.statusKey === 'upcoming' ? 0 : Math.floor(view * (0.02 + (i % 6) * 0.005));
    var collectCount = st.statusKey === 'upcoming' ? 0 : Math.floor(view * (0.04 + (i % 5) * 0.008));
    var clickRate = view ? (round1(join * 100 / view) + '%') : '0.0%';
    var convertRate = join ? (round1(payCount * 100 / join) + '%') : '0.0%';
    var costAmount = Math.floor(budgetAmount * (0.35 + (i % 4) * 0.05));
    var profitAmount = Math.max(0, payAmount - costAmount);

    var createTime = fmtDateTime(new Date(start.getTime() - (10 + i % 20) * 86400000));
    var updateTime = fmtDateTime(new Date(Math.min(Date.now(), end.getTime())));
    var publishTime = st.statusKey === 'upcoming' && audit.auditKey !== 'pass' ? '' : fmtDateTime(start);
    var auditTime = audit.auditKey === 'pending' ? '' : fmtDateTime(new Date(start.getTime() - (2 + i % 5) * 86400000));

    var categoryScope = pick(CATEGORIES, i);
    var brand = pick(BRANDS, i);
    var merchantName = pick(MERCHANTS, i + 2);
    var merchantId = 'M' + (10001 + (i % 8));
    var priority = pick(PRIORITIES, i);
    var riskLevel = pick(RISK_LEVELS, i + 1);
    var exclusivity = stackable ? pick(EXCLUSIVITY, 0) : pick(EXCLUSIVITY, i + 1);
    var tag = pick(TAGS_POOL, i) + ',' + pick(TAGS_POOL, i + 3);
    var cityLimit = pick(CITY_LIMITS, i);
    var genderLimit = pick(GENDER_LIMITS, i);
    var ageLimit = pick(AGE_LIMITS, i);
    var notifyMode = pick(NOTIFY_MODES, i);
    var landingPage = pick(LANDING_PAGES, i) + '?id=' + id;
    var subtitle = pick(SLOGANS, i);
    var description = name + '：面向' + userScope + '，覆盖' + productScope + '（' + categoryScope + '），渠道' + channel + '。';
    var ruleText = pick(RULE_TEMPLATES, i) + ' 优惠说明：' + discount + '。';

    var giftName = t.typeKey === 'gift' ? pick(GIFT_NAMES, i) : '';
    var giftSku = giftName ? ('GIFT' + pad3(n)) : '';
    var giftStock = giftName ? (20 + (i % 50) * 3) : 0;

    var groupSize = t.typeKey === 'pintuan' ? (2 + (i % 3)) : 0;
    var groupHours = t.typeKey === 'pintuan' ? (12 + (i % 4) * 12) : 0;
    var groupPrice = t.typeKey === 'pintuan' ? round2(49 + (i % 20) * 15.5) : 0;

    var seckillPrice = t.typeKey === 'shaimiao' ? round2(19.9 + (i % 30) * 8) : 0;
    var seckillStock = t.typeKey === 'shaimiao' ? (30 + (i % 20) * 10) : 0;
    var seckillStartHour = t.typeKey === 'shaimiao' ? (10 + (i % 10)) + ':00' : '';

    var couponFaceValue = t.typeKey === 'coupon' ? structured.discountAmount : 0;
    var couponThreshold = t.typeKey === 'coupon' ? structured.thresholdAmount : 0;
    var couponValidDays = t.typeKey === 'coupon' ? (7 + (i % 4) * 7) : 0;

    var maxDiscount = structured.discountAmount || (structured.discountRate ? Math.floor(200 + i * 3) : (50 + i % 100));
    var dailyLimit = 1 + (i % 5);
    var claimLimit = limit;

    var productScopeDetail = '';
    if (productScope === '指定商品') {
      productScopeDetail = 'SP1000' + pad2((i % 20) + 1) + ',SP1000' + pad2(((i + 3) % 20) + 1);
    } else if (productScope === '指定分类') {
      productScopeDetail = categoryScope + '/' + pick(['精华', '面霜', '口红', '防晒', '面膜'], i);
    }
    var userScopeDetail = '';
    if (userScope === '指定用户') userScopeDetail = '定向标签：' + pick(['高复购', '沉睡唤醒', '直播观众', '种草达人'], i);
    if (userScope === 'VIP会员') userScopeDetail = '会员等级≥银卡';
    if (userScope === '新注册用户') userScopeDetail = '注册≤7天';

    var relatedCampaign = pick(['618主会场', '双11预热', '双11狂欢', '双12收官', '会员日', '品牌日', '无'], i);
    var whiteList = i % 9 === 0 ? 'WL-' + pad3(n) : '';
    var blackList = i % 13 === 0 ? 'BL-' + pad3(n) : '';
    var creator = pick(['系统种子', '运营小妍', '活动组-阿宁', '增长组'], i);
    var auditor = audit.auditKey === 'pending' ? '' : pick(['审核员-小林', '审核员-阿哲', '主管-周启明'], i);
    var auditRemark = audit.auditKey === 'pass' ? '规则清晰，预算可控' :
      (audit.auditKey === 'pending' ? '' :
        (audit.auditKey === 'fail' ? '预算超支需调整' : '与同期活动互斥冲突'));

    var shareTitle = name + ' · ' + discount;
    var shareDesc = subtitle + '，' + startTime + '至' + endTime;

    return {
      id: id,
      type: t.type,
      typeKey: t.typeKey,
      status: st.status,
      statusKey: st.statusKey,
      name: name,
      subtitle: subtitle,
      description: description,
      ruleText: ruleText,
      coverUrl: coverOf(n),
      bannerUrl: coverOf(n + 3),
      startTime: startTime,
      endTime: endTime,
      preheatStart: preheatStart,
      preheatEnd: preheatEnd,
      discount: discount,
      thresholdAmount: structured.thresholdAmount,
      discountAmount: structured.discountAmount,
      discountRate: structured.discountRate,
      maxDiscount: maxDiscount,
      limit: limit,
      claimLimit: claimLimit,
      dailyLimit: dailyLimit,
      stock: stock,
      totalQuota: totalQuota,
      usedQuota: usedQuota,
      remainQuota: remainQuota,
      view: view,
      join: join,
      refund: refund,
      refundRate: refundRate,
      amount: amount,
      orderCount: orderCount,
      payCount: payCount,
      payAmount: payAmount,
      avgOrderAmount: avgOrderAmount,
      shareCount: shareCount,
      collectCount: collectCount,
      clickRate: clickRate,
      convertRate: convertRate,
      enabled: enabled,
      productScope: productScope,
      userScope: userScope,
      productScopeDetail: productScopeDetail,
      userScopeDetail: userScopeDetail,
      categoryScope: categoryScope,
      brand: brand,
      merchantId: merchantId,
      merchantName: merchantName,
      channel: channel,
      scene: scene,
      budget: budget,
      budgetAmount: budgetAmount,
      platformSubsidy: platformSubsidy,
      merchantSubsidy: merchantSubsidy,
      costAmount: costAmount,
      profitAmount: profitAmount,
      region: region,
      cityLimit: cityLimit,
      ageLimit: ageLimit,
      genderLimit: genderLimit,
      stackable: stackable,
      memberOnly: memberOnly,
      exclusivity: exclusivity,
      couponCode: couponCode,
      couponFaceValue: couponFaceValue,
      couponThreshold: couponThreshold,
      couponValidDays: couponValidDays,
      giftName: giftName,
      giftSku: giftSku,
      giftStock: giftStock,
      groupSize: groupSize,
      groupHours: groupHours,
      groupPrice: groupPrice,
      seckillPrice: seckillPrice,
      seckillStock: seckillStock,
      seckillStartHour: seckillStartHour,
      landingPage: landingPage,
      shareTitle: shareTitle,
      shareDesc: shareDesc,
      notifyMode: notifyMode,
      notifySms: notifyMode.indexOf('短信') >= 0,
      notifyPush: notifyMode.indexOf('Push') >= 0,
      priority: priority,
      sort: n,
      tag: tag,
      riskLevel: riskLevel,
      relatedCampaign: relatedCampaign,
      whiteList: whiteList,
      blackList: blackList,
      roi: roi,
      owner: owner,
      department: department,
      creator: creator,
      createTime: createTime,
      updateTime: updateTime,
      publishTime: publishTime,
      auditStatus: audit.auditStatus,
      auditKey: audit.auditKey,
      auditor: auditor,
      auditTime: auditTime,
      auditRemark: auditRemark,
      remark: remark,
      source: 'beauty-activity-seed',
      seedVersion: VERSION
    };
  }

  function list() {
    var out = [];
    for (var ti = 0; ti < TYPES.length; ti++) {
      for (var i = 0; i < PER_TYPE; i++) out.push(buildOne(ti, i));
    }
    return out;
  }

  function enrich(a) {
    if (!a) return a;
    if (!a.channel) a.channel = 'App';
    if (!a.scene) a.scene = '日常运营';
    if (!a.budget) a.budget = '平台补贴';
    if (a.budgetAmount == null) a.budgetAmount = 0;
    if (!a.region) a.region = '全国';
    if (a.stackable == null) a.stackable = false;
    if (a.memberOnly == null) a.memberOnly = a.userScope === 'VIP会员';
    if (!a.couponCode) a.couponCode = '';
    if (a.roi == null) a.roi = 0;
    if (!a.owner) a.owner = '';
    if (!a.remark) a.remark = '';
    if (a.enabled == null) a.enabled = a.statusKey === 'ongoing' || a.statusKey === 'upcoming';
    if (!a.subtitle) a.subtitle = '';
    if (!a.description) a.description = '';
    if (!a.ruleText) a.ruleText = '';
    if (!a.coverUrl) a.coverUrl = '';
    if (!a.bannerUrl) a.bannerUrl = a.coverUrl || '';
    if (!a.preheatStart) a.preheatStart = a.startTime || '';
    if (!a.preheatEnd) a.preheatEnd = a.startTime || '';
    if (a.thresholdAmount == null) a.thresholdAmount = 0;
    if (a.discountAmount == null) a.discountAmount = 0;
    if (a.discountRate == null) a.discountRate = 0;
    if (a.maxDiscount == null) a.maxDiscount = 0;
    if (a.claimLimit == null) a.claimLimit = a.limit != null ? a.limit : 0;
    if (a.dailyLimit == null) a.dailyLimit = 1;
    if (a.totalQuota == null) a.totalQuota = a.stock != null ? a.stock : 0;
    if (a.usedQuota == null) a.usedQuota = 0;
    if (a.remainQuota == null) a.remainQuota = Math.max(0, (a.totalQuota || 0) - (a.usedQuota || 0));
    if (a.orderCount == null) a.orderCount = 0;
    if (a.payCount == null) a.payCount = 0;
    if (a.payAmount == null) a.payAmount = a.amount != null ? a.amount : 0;
    if (a.avgOrderAmount == null) a.avgOrderAmount = 0;
    if (a.shareCount == null) a.shareCount = 0;
    if (a.collectCount == null) a.collectCount = 0;
    if (!a.clickRate) a.clickRate = '0.0%';
    if (!a.convertRate) a.convertRate = '0.0%';
    if (!a.categoryScope) a.categoryScope = '全品类';
    if (!a.brand) a.brand = '';
    if (!a.merchantId) a.merchantId = '';
    if (!a.merchantName) a.merchantName = '';
    if (a.platformSubsidy == null) a.platformSubsidy = 0;
    if (a.merchantSubsidy == null) a.merchantSubsidy = 0;
    if (a.costAmount == null) a.costAmount = 0;
    if (a.profitAmount == null) a.profitAmount = 0;
    if (!a.cityLimit) a.cityLimit = '不限';
    if (!a.ageLimit) a.ageLimit = '不限';
    if (!a.genderLimit) a.genderLimit = '不限';
    if (!a.exclusivity) a.exclusivity = a.stackable ? '可与券叠加' : '仅本活动';
    if (a.couponFaceValue == null) a.couponFaceValue = 0;
    if (a.couponThreshold == null) a.couponThreshold = 0;
    if (a.couponValidDays == null) a.couponValidDays = 0;
    if (!a.giftName) a.giftName = '';
    if (!a.giftSku) a.giftSku = '';
    if (a.giftStock == null) a.giftStock = 0;
    if (a.groupSize == null) a.groupSize = 0;
    if (a.groupHours == null) a.groupHours = 0;
    if (a.groupPrice == null) a.groupPrice = 0;
    if (a.seckillPrice == null) a.seckillPrice = 0;
    if (a.seckillStock == null) a.seckillStock = 0;
    if (!a.seckillStartHour) a.seckillStartHour = '';
    if (!a.landingPage) a.landingPage = '';
    if (!a.shareTitle) a.shareTitle = a.name || '';
    if (!a.shareDesc) a.shareDesc = '';
    if (!a.notifyMode) a.notifyMode = '不推送';
    if (a.notifySms == null) a.notifySms = false;
    if (a.notifyPush == null) a.notifyPush = false;
    if (!a.priority) a.priority = 'P2';
    if (a.sort == null) a.sort = 0;
    if (!a.tag) a.tag = '';
    if (!a.riskLevel) a.riskLevel = '低';
    if (!a.relatedCampaign) a.relatedCampaign = '';
    if (!a.whiteList) a.whiteList = '';
    if (!a.blackList) a.blackList = '';
    if (!a.department) a.department = '';
    if (!a.creator) a.creator = '';
    if (!a.createTime) a.createTime = '';
    if (!a.updateTime) a.updateTime = '';
    if (!a.publishTime) a.publishTime = '';
    if (!a.auditStatus) a.auditStatus = a.enabled ? '审核通过' : '待审核';
    if (!a.auditKey) {
      a.auditKey = a.auditStatus === '审核通过' ? 'pass'
        : (a.auditStatus === '审核未通过' ? 'fail'
          : (a.auditStatus === '已驳回' ? 'reject' : 'pending'));
    }
    if (!a.auditor) a.auditor = '';
    if (!a.auditTime) a.auditTime = '';
    if (!a.auditRemark) a.auditRemark = '';
    if (!a.seedVersion) a.seedVersion = '';
    return a;
  }

  var api = {
    list: list,
    enrich: enrich,
    count: TYPES.length * PER_TYPE,
    perType: PER_TYPE,
    version: VERSION,
    types: TYPES.map(function (t) { return t.typeKey; })
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyActivitySeed = api;
})(typeof window !== 'undefined' ? window : global);
