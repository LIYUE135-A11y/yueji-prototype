/**
 * AI 导购问题（会话反馈）种子 · 每评价类型 100 条（共 400）
 * 满意 / 一般 / 不满意 / 跳过
 * localStorage: ai_guide_card_feedback_v2
 * version: v2-100-per-score
 */
(function (global) {
  var VERSION = 'v2-100-per-score';
  var PER_TYPE = 100;
  var SCORES = [
    { score: 'good', idPrefix: 'GD', label: '满意' },
    { score: 'ok', idPrefix: 'OK', label: '一般' },
    { score: 'bad', idPrefix: 'BD', label: '不满意' },
    { score: 'skip', idPrefix: 'SK', label: '跳过' }
  ];
  var HANDLERS = ['', '', '客服小美', '客服小紫', '运营管家', ''];
  var STATUSES = ['pending', 'pending', 'pending', 'done', 'done'];
  var NAMES = [
    '野稗子', '软软子', '晚棠', '温以柔', '沈清欢', '程予薇', '韩以安', '赵浅予', '金琉璃', '夏念安',
    '江晚宁', '陆星眠', '许清禾', '唐小鹿', '吴晚棠', '叶知夏', '苏念初', '梁慕白', '郑予欢', '何清禾',
    '方知予', '宋软软', '顾惜月', '林予安', '谢星河', '周南枝', '陈初雪', '乔薇', '白柠', '许澄'
  ];
  var REAL_NAMES = [
    '陈野', '宋软软', '吴晚棠', '温以柔', '沈清欢', '程予薇', '韩以安', '赵浅予', '金琉璃', '夏念安',
    '江晚宁', '陆星眠', '许清禾', '唐小鹿', '吴晚棠', '叶知夏', '苏念初', '梁慕白', '郑予欢', '何清禾',
    '方知予', '宋软软', '顾惜月', '林予安', '谢星河', '周南枝', '陈初雪', '乔薇', '白柠', '许澄'
  ];
  var TOPICS = [
    '干皮口红推荐', '油皮防晒不搓泥', '敏感肌修护精华', '抗初老眼霜', '显白正红色号',
    '同款识图不准', '推荐成别的品牌', '预算 200 内水乳', '成分是否含酒精', '通勤底妆轻薄',
    '面膜舒缓泛红', '气垫遮瑕力', '卸妆是否伤肤', '防晒适合混油', '唇釉持久度',
    '护肤顺序建议', '烟酰胺浓度', '神经酰胺修护', '美白是否刺激', '孕妇可用清单'
  ];
  var NOTES = [
    '推荐不准，和主图不一致', '希望多一点同品牌', '识图品牌偏了', '建议更具体一点',
    '商品卡价格对不上', '会话太长没结论', '想要更多对比', '跳过评价',
    '很有帮助', '基本满意', '一般般', '不满意推荐逻辑'
  ];
  var SOLUTIONS = [
    '', '', '',
    '已核对识图策略，品牌命中优先；已回访用户。',
    '已补充同品牌候选，并更新推荐话术。',
    '已记录反馈，同步算法侧优化同图匹配。'
  ];
  var IMG1 = '../美丽修行app/static/images/lipstick-2.jpg';
  var IMG2 = '../美丽修行app/static/images/lipstick-1.jpg';
  var IMG3 = '../美丽修行app/static/images/products/essence-1.jpg';

  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = '0' + s;
    return s;
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pick(arr, i) { return arr[i % arr.length]; }

  function isoAt(i, scoreIdx) {
    var d = new Date(2026, 2, 1 + ((i + scoreIdx * 3) % 28), 10 + (i % 8), (i * 11) % 60, (i * 7) % 60);
    return d.toISOString();
  }

  function phoneOf(i) {
    return '1' + String(3 + (i % 6)) + String(5 + (i % 4)) +
      String(10000000 + ((i * 7919) % 89999999)).slice(0, 8);
  }

  function buildMessages(i, topic, score) {
    var img = pick([IMG1, IMG2, IMG3], i);
    var msgs = [
      { role: 'user', content: topic + '，帮我看看', img: (i % 4 === 0 ? img : ''), products: [] },
      {
        role: 'assistant',
        content: '已根据你的需求在站内匹配到相关单品，可点进详情查看色号/成分与评价。',
        img: '',
        products: [
          {
            id: 'p' + (i % 9 + 1),
            title: pick(['经典正红丝绒口红', '滋润粉色口红礼盒', 'HEY:REAL B5精华液', '温和修护面膜'], i),
            sub: pick(['阅己 · 口红', 'NABLA · 口红', 'HEY:REAL · 精华', '阅己 · 面膜'], i),
            price: '¥' + (99 + (i % 20) * 10),
            reason: pick(['肤质适配', '同图命中', '成分温和', '场景通勤'], i),
            img: img
          }
        ]
      }
    ];
    if (score === 'bad' || i % 3 === 0) {
      msgs.push({ role: 'user', content: score === 'bad' ? '怎么推荐成别的了？' : '再对比一下这两款', img: '', products: [] });
      msgs.push({
        role: 'assistant',
        content: score === 'bad'
          ? '抱歉匹配偏差，已为你收窄同品牌/同品类候选，请再看一下。'
          : '两款差异主要在质地与色调：一款更显白，一款更日常温柔。',
        img: '',
        products: []
      });
    }
    return msgs;
  }

  function buildOne(scoreIdx, i) {
    var t = SCORES[scoreIdx];
    var n = i + 1;
    var topic = pick(TOPICS, i + scoreIdx);
    var status = pick(STATUSES, i + scoreIdx);
    var handler = pick(HANDLERS, i + scoreIdx);
    if (status === 'done' && !handler) handler = pick(['客服小美', '客服小紫', '运营管家'], i);
    if (status === 'pending' && i % 5 !== 0) handler = handler || '';
    var note = pick(NOTES, i + scoreIdx);
    if (t.score === 'skip') note = note || '跳过评价';
    var solution = status === 'done' ? pick(SOLUTIONS.filter(Boolean).concat(['已处理并回访。']), i) : pick(SOLUTIONS, i);
    var messages = buildMessages(i, topic, t.score);
    var sessionText = messages.map(function (m) {
      return (m.role === 'user' ? '用户：' : '妆小妍：') + String(m.content || '').slice(0, 48);
    }).join('\n');
    var sessionImage = '';
    for (var mi = 0; mi < messages.length; mi++) {
      if (messages[mi].img) { sessionImage = messages[mi].img; break; }
    }
    return {
      id: 'AGF' + t.idPrefix + pad3(n),
      at: isoAt(i, scoreIdx),
      score: t.score,
      note: note,
      skipped: t.score === 'skip',
      source: 'beauty-aiguide-seed',
      status: status,
      nickName: pick(NAMES, i + scoreIdx),
      realName: pick(REAL_NAMES, i + scoreIdx),
      phone: phoneOf(i + scoreIdx * 17),
      handler: handler,
      solution: solution,
      sessionImage: sessionImage || IMG1,
      messages: messages,
      sessionText: sessionText,
      topic: topic,
      channel: pick(['app', 'app', '小程序', 'H5'], i),
      vipLevel: pick(['普通', '普通', '银卡', '金卡'], i),
      city: pick(['上海', '北京', '广州', '深圳', '杭州', '成都'], i),
      turnCount: messages.length,
      recommendCount: (messages[1] && messages[1].products) ? messages[1].products.length : 0,
      seedVersion: VERSION
    };
  }

  var CACHE = null;
  function list() {
    if (!CACHE) {
      CACHE = [];
      for (var si = 0; si < SCORES.length; si++) {
        for (var i = 0; i < PER_TYPE; i++) CACHE.push(buildOne(si, i));
      }
    }
    return CACHE.map(function (r) { return JSON.parse(JSON.stringify(r)); });
  }

  var api = {
    count: SCORES.length * PER_TYPE,
    perType: PER_TYPE,
    version: VERSION,
    scores: SCORES.map(function (s) { return s.score; }),
    list: list
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyAiGuideFeedbackSeed = api;
})(typeof window !== 'undefined' ? window : global);
