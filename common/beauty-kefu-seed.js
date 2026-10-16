/**
 * 美妆客服会话种子 · 每类型 100 条（共 300）
 * AI智能客服 / 人工客服 / 转人工
 * 与 KefuStore（zhuangyan_kefu_sessions_v2）同源
 * version: v2-100-per-type
 */
(function (global) {
  var VERSION = 'v2-100-per-type';
  var PER_TYPE = 100;
  var TYPES = [
    { type: 'AI智能客服', idPrefix: 'AI' },
    { type: '人工客服', idPrefix: 'HM' },
    { type: '转人工', idPrefix: 'TF' }
  ];
  var STATUSES = ['已回复', '已回复', '接待中', '待接入', '已完结', '已关闭'];
  var AGENTS_AI = ['AI牛牛', 'AI妆小妍', 'AI客服助理'];
  var AGENTS_HUMAN = ['客服小美', '客服小紫', '客服小禾', '客服阿岚', '客服小林', '未分配'];
  var CHANNELS = ['app', 'app', '小程序', 'H5', 'app'];
  var CATEGORIES = ['物流催发', '退款售后', '优惠券', '商品咨询', '账户会员', '投诉建议', '活动规则', '发票开具', '色号咨询', '过敏申诉'];
  var PRIORITIES = ['普通', '普通', '普通', '加急', '重大客诉'];
  var SENTIMENTS = ['平静', '平静', '焦虑', '不满', '满意'];
  var SKILL_GROUPS = ['售前', '售后', '物流', '会员', '综合'];
  var CITIES = ['上海', '北京', '广州', '深圳', '杭州', '成都', '武汉', '南京', '重庆', '西安'];
  var DEVICES = ['iOS', 'Android', 'HarmonyOS', '小程序'];
  var VIP_LEVELS = ['普通', '普通', '银卡', '金卡', '黑金'];
  var LANGUAGES = ['中文', '中文', '中文', '英文'];
  var SLA = ['标准', '标准', '加急SLA', 'VIP专属'];
  var NAMES = [
    '野稗子', '软软子', '晚棠', '温以柔', '沈清欢', '程予薇', '韩以安', '赵浅予', '金琉璃', '夏念安',
    '江晚宁', '陆星眠', '许清禾', '唐小鹿', '吴晚棠', '叶知夏', '苏念初', '梁慕白', '郑予欢', '何清禾',
    '方知予', '宋软软', '顾惜月', '林予安', '谢星河', '周南枝', '陈初雪', '乔薇', '白柠', '许澄'
  ];
  var USER_IDS = [
    'U20240076', 'U20240088', 'U20240099', 'U20240501', 'U20240208', 'U20240901', 'U20241156', 'U20240442',
    'U20241444', 'U20241558', 'U20240322', 'U20240608', 'U20240178', 'U20240032', 'U20240102', 'U20241102',
    'U20241220', 'U20241312', 'U20240105', 'U20240256', 'U20240334', 'U20240778', 'U20240888', 'U20240236'
  ];
  var SUMMARIES = [
    '催发货，询问物流时效', '退款进度催办', '优惠券与积分咨询', '色号/肤质适配咨询',
    '面膜过敏投诉', '开具电子发票', '会员权益说明', '活动满减规则',
    '改收货地址', '包裹破损理赔', '赠品未发咨询', '成分敏感询问',
    '取消订单', '换货进度', '券未到账', '积分抵现规则',
    '直播专属券', '保税仓发货时效', '售后寄回运费', '转人工加急',
    '口红试色差', '防晒搓泥咨询', '拼团未成团', '秒杀未支付库存',
    '价保差价申请', '运费险理赔', '晚发即赔咨询', '正品鉴定指引'
  ];

  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = '0' + s;
    return s;
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pick(arr, i) { return arr[i % arr.length]; }
  function phoneMasked(i) {
    return '138****' + pad2(10 + (i % 90)) + String(i % 10);
  }

  function ts(i, hourOff) {
    var d = new Date(2026, 2, 1 + (i % 28), 9 + ((i + (hourOff || 0)) % 10), (i * 7) % 60, (i * 13) % 60);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }

  function buildMessages(i, type, summary) {
    var msgs = [];
    var t0 = ts(i, 0);
    msgs.push({ role: 'user', text: summary + '，麻烦看一下。', source: 'app', at: t0 });
    msgs.push({
      role: 'assistant',
      text: '已收到您的咨询，正在为您核对相关信息。',
      source: type.indexOf('人工') >= 0 ? 'ops' : 'llm',
      at: ts(i, 1)
    });
    if (i % 3 === 0) {
      msgs.push({ role: 'user', text: '好的，请尽快回复。', source: 'app', at: ts(i, 2) });
    }
    if (type === '转人工' || type === '人工客服') {
      msgs.push({ role: 'user', text: '转人工', source: 'app', at: ts(i, 2) });
      msgs.push({
        role: 'assistant',
        text: type === '转人工' ? '已为你登记转人工客服，请稍候。' : '人工客服已接入，请问还有什么可以帮您？',
        source: type === '转人工' ? 'knowledge' : 'ops',
        at: ts(i, 3)
      });
    }
    if (i % 5 === 0) {
      msgs.push({
        role: 'assistant',
        text: '已为您核对完毕，如还有问题随时找我。',
        source: type.indexOf('AI') === 0 ? 'llm' : 'ops',
        at: ts(i, 4)
      });
    }
    return msgs;
  }

  function enrich(s) {
    if (!s) return s;
    var n = Number(String(s.id || '').replace(/\D/g, '').slice(-3)) || 0;
    if (!s.category) s.category = pick(CATEGORIES, n);
    if (!s.priority) s.priority = pick(PRIORITIES, n + 1);
    if (!s.sentiment) s.sentiment = pick(SENTIMENTS, n + 2);
    if (!s.skillGroup) s.skillGroup = pick(SKILL_GROUPS, n);
    if (!s.city) s.city = pick(CITIES, n);
    if (!s.device) s.device = pick(DEVICES, n + 3);
    if (s.transferFromAi == null) {
      s.transferFromAi = s.type === '转人工' || s.type === '人工客服' || /转人工/.test(s.summary || '');
    }
    if (s.msgCount == null) {
      s.msgCount = Array.isArray(s.messages) ? s.messages.length : (2 + (n % 6));
    }
    if (s.waitMinutes == null) s.waitMinutes = s.status === '待接入' ? (5 + (n % 40)) : (n % 8);
    if (s.firstResponseSec == null) s.firstResponseSec = 15 + (n % 180);
    if (s.resolveMinutes == null) {
      s.resolveMinutes = (s.status === '已完结' || s.status === '已关闭') ? (10 + (n % 90)) : 0;
    }
    if (s.satisfaction == null || s.satisfaction === '') {
      if (s.status === '已完结' || s.status === '已回复') s.satisfaction = 3 + (n % 3);
      else s.satisfaction = '-';
    }
    if (!s.tags) s.tags = [s.category, s.priority].filter(Boolean).join(',');
    if (!s.channel) s.channel = pick(CHANNELS, n);
    if (!s.vipLevel) s.vipLevel = pick(VIP_LEVELS, n);
    if (!s.phoneMasked) s.phoneMasked = phoneMasked(n);
    if (!s.language) s.language = pick(LANGUAGES, n);
    if (!s.slaLevel) s.slaLevel = pick(SLA, n);
    if (s.reopenCount == null) s.reopenCount = n % 4 === 0 ? 1 : 0;
    if (s.aiConfidence == null) {
      s.aiConfidence = s.type && String(s.type).indexOf('AI') === 0 ? (0.55 + (n % 40) / 100) : 0;
    }
    if (!s.lastMsgPreview) {
      var msgs = Array.isArray(s.messages) ? s.messages : [];
      s.lastMsgPreview = msgs.length ? String(msgs[msgs.length - 1].text || '').slice(0, 40) : (s.summary || '');
    }
    if (!s.relatedProductId) s.relatedProductId = n % 5 === 0 ? '' : ('SP1000' + pad2(1 + (n % 20)));
    if (!s.remark) s.remark = (s.skillGroup || '综合') + '·' + (s.priority || '普通');
    if (!s.seedVersion) s.seedVersion = '';
    if (!s.assignTime) s.assignTime = s.status === '待接入' ? '' : (s.createdAt || '');
    if (!s.closeTime) {
      s.closeTime = (s.status === '已完结' || s.status === '已关闭') ? (s.updatedAt || '') : '';
    }
    if (!s.hangupReason) {
      s.hangupReason = s.status === '已关闭' ? pick(['用户离开', '超时关闭', '已解决关闭'], n) : '';
    }
    return s;
  }

  function buildOne(typeIdx, i) {
    var t = TYPES[typeIdx] || TYPES[0];
    var type = t.type;
    var n = i + 1;
    var status = pick(STATUSES, i + 2 + typeIdx);
    if (type === '转人工' && status === '已回复') status = '待接入';
    if (type === '人工客服' && status === '待接入' && i % 2 === 0) status = '接待中';
    if (type === 'AI智能客服' && status === '待接入') status = '已回复';
    var agent = type.indexOf('AI') === 0
      ? pick(AGENTS_AI, i)
      : (status === '待接入' ? '未分配' : pick(AGENTS_HUMAN, i));
    if (agent === '未分配' && status === '接待中') agent = pick(AGENTS_HUMAN, i + 1);
    var summary = pick(SUMMARIES, i + typeIdx * 3);
    var hasOrder = i % 4 !== 3;
    var orderId = hasOrder ? ('ORD2026' + pad2(1 + (i % 12)) + pad3(100 + (i % 800))) : '—';
    var createdAt = ts(i + typeIdx * 10, -2);
    var updatedAt = ts(i + typeIdx * 10, status === '已完结' ? 5 : 3);
    var messages = buildMessages(i, type, summary);
    var s = {
      id: 'KF' + t.idPrefix + pad3(n),
      userId: pick(USER_IDS, i + typeIdx),
      userName: pick(NAMES, i + typeIdx),
      type: type,
      summary: summary,
      orderId: orderId,
      agent: agent,
      status: status,
      channel: pick(CHANNELS, i),
      createdAt: createdAt,
      updatedAt: updatedAt,
      messages: messages,
      source: 'beauty-kefu-seed',
      seedVersion: VERSION
    };
    return enrich(s);
  }

  var CACHE = null;
  function list() {
    if (!CACHE) {
      CACHE = [];
      for (var ti = 0; ti < TYPES.length; ti++) {
        for (var i = 0; i < PER_TYPE; i++) CACHE.push(buildOne(ti, i));
      }
    }
    return CACHE.map(function (s) { return enrich(JSON.parse(JSON.stringify(s))); });
  }

  var api = {
    count: TYPES.length * PER_TYPE,
    perType: PER_TYPE,
    version: VERSION,
    types: TYPES.map(function (t) { return t.type; }),
    list: list,
    enrich: enrich
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyKefuSeed = api;
})(typeof window !== 'undefined' ? window : global);
