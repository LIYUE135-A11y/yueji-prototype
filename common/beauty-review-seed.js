/**
 * 美妆评价种子 · 100 条商品评价 + 社区评价（话题/动态/种草/文章）
 * 运营「评价管理」/ 数据中心「评价数据」
 */
(function (global) {
  var USERS = [
    { id: 'U20240105', name: '林予安', t: '林', bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { id: 'U20240088', name: '沈清欢', t: '沈', bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
    { id: 'U20240256', name: '顾惜月', t: '顾', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { id: 'U20240032', name: '叶知夏', t: '叶', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
    { id: 'U20240102', name: '苏念初', t: '苏', bg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)' },
    { id: 'U20240501', name: '温以柔', t: '温', bg: 'linear-gradient(135deg,#F3F4F6,#E5E7EB)' },
    { id: 'U20240322', name: '江晚宁', t: '江', bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { id: 'U20240608', name: '陆星眠', t: '陆', bg: 'linear-gradient(135deg,#FEF9C3,#FDE68A)' },
    { id: 'U20240178', name: '许清禾', t: '许', bg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)' },
    { id: 'U20240901', name: '程予薇', t: '程', bg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)' },
    { id: 'U20240208', name: '宋软软', t: '宋', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { id: 'U20240612', name: '方知予', t: '方', bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
    { id: 'U20240076', name: '唐小鹿', t: '唐', bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
    { id: 'U20241102', name: '梁慕白', t: '梁', bg: 'linear-gradient(135deg,#FFEDD5,#FED7AA)' },
    { id: 'U20241156', name: '韩以安', t: '韩', bg: 'linear-gradient(135deg,#ECFDF5,#A7F3D0)' },
    { id: 'U20240334', name: '谢星河', t: '谢', bg: 'linear-gradient(135deg,#FDF4FF,#F0ABFC)' },
    { id: 'U20240442', name: '赵浅予', t: '赵', bg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)' },
    { id: 'U20240778', name: '周南枝', t: '周', bg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)' },
    { id: 'U20240888', name: '陈初雪', t: '陈', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
    { id: 'U20240236', name: '吴晚棠', t: '吴', bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' }
  ];
  var SKINS = ['干皮', '油皮', '混干', '混油', '敏感肌', '中性肌', '痘痘肌'];
  var CHANNELS = ['订单完成后评价', 'App主动评价', '小程序', '邀请有礼', '客服邀评'];
  var TAGS_POOL = ['回购', '正品', '物流快', '包装好', '敏感肌可用', '提亮', '保湿', '不闷痘', '性价比', '色号准', '香味好', '质地清爽'];
  var MERCHANTS = [
    '阅己美妆旗舰店', 'SK-II奢享汇', '修丽可官方旗舰店', '花西子国风旗舰店', '珂润敏感肌护理店',
    '欧莱雅集团官方店', '自然堂生活美学馆', '完美日记品牌店', '海蓝精选', '兰蔻官方授权店',
    '雅诗兰黛集团官方店', '优品美妆专营店'
  ];
  var PRODUCTS = [
    { id: 'SP100001', name: '神仙水精华露 230ml 补水保湿提亮', brand: 'SK-II', cat1: '护肤', cat3: '精华水', spec: '230ml · 经典款', price: 1599, cover: 'sk2 essence bottle 230ml luxury skincare' },
    { id: 'SP100002', name: '兰蔻小黑瓶精华肌底液 100ml', brand: 'Lancôme', cat1: '护肤', cat3: '精华', spec: '100ml · 正装', price: 1293, cover: 'lancome genifique serum black bottle' },
    { id: 'SP100003', name: '小棕瓶特润修护精华眼霜 15ml', brand: '雅诗兰黛', cat1: '护肤', cat3: '眼霜', spec: '15ml · 单瓶', price: 590, cover: 'estee lauder night repair eye cream' },
    { id: 'SP100005', name: '花西子同心锁口红 哑光雾面 M301', brand: '花西子', cat1: '彩妆', cat3: '口红', spec: '3.2g · M301', price: 169, cover: 'huaxizi carved lipstick matte' },
    { id: 'SP100007', name: '氨基酸净透洁面乳 120g', brand: '阅己自研', cat1: '护肤', cat3: '洁面', spec: '120g · 单支', price: 69, cover: 'amino acid facial cleanser tube' },
    { id: 'SP100008', name: '玻尿酸补水保湿面膜 10片装', brand: '自然堂', cat1: '护肤', cat3: '面膜', spec: '25ml × 10片', price: 128, cover: 'hyaluronic acid sheet mask box' },
    { id: 'SP100010', name: '复颜玻尿酸水光充盈乳液 110ml', brand: 'L\'Oréal Paris', cat1: '护肤', cat3: '乳液', spec: '110ml · 单支', price: 299, cover: 'loreal hyaluronic emulsion' },
    { id: 'SP100011', name: '修丽可色修精华 30ml', brand: '修丽可', cat1: '护肤', cat3: '精华', spec: '30ml · 正装', price: 780, cover: 'skinceuticals phyto corrective' },
    { id: 'SP100012', name: '珂润润浸保湿洁颜泡沫 150ml', brand: '珂润', cat1: '护肤', cat3: '洁面', spec: '150ml · 泵装', price: 149, cover: 'curel cleansing foam pump' },
    { id: 'SP100013', name: '雅诗兰黛小棕瓶第七代修护精华 75ml', brand: '雅诗兰黛', cat1: '护肤', cat3: '精华', spec: '75ml · 第七代', price: 1490, cover: 'estee lauder advanced night repair' },
    { id: 'SP100014', name: '花西子玉容养肤气垫CC霜 C30', brand: '花西子', cat1: '彩妆', cat3: '气垫', spec: 'C30 · 13g', price: 199, cover: 'huaxizi jade cushion cc cream' },
    { id: 'SP100015', name: 'SK-II 大红瓶面霜 80g 轻盈版', brand: 'SK-II', cat1: '护肤', cat3: '面霜', spec: '80g · 轻盈版', price: 1399, cover: 'sk2 rna power cream red jar' },
    { id: 'SP100016', name: '兰蔻菁纯臻颜精萃乳霜 60ml', brand: 'Lancôme', cat1: '护肤', cat3: '面霜', spec: '60ml · 滋润版', price: 2180, cover: 'lancome absolution cream gold' },
    { id: 'SP100017', name: '完美日记探险家十二色眼影盘 玉兔盘', brand: '完美日记', cat1: '彩妆', cat3: '眼影', spec: '玉兔盘 · 12色', price: 129.9, cover: 'perfect diary eyeshadow jade rabbit' },
    { id: 'SP100018', name: '修丽可维生素CE复合修护精华 30ml', brand: '修丽可', cat1: '护肤', cat3: '精华', spec: '30ml · 正装', price: 960, cover: 'skinceuticals CE ferulic serum' },
    { id: 'SP100019', name: '珂润浸润保湿面霜 40g', brand: '珂润', cat1: '护肤', cat3: '面霜', spec: '40g · 软管', price: 188, cover: 'curel moisturizing cream jar' },
    { id: 'SP100020', name: '黑金松露奢养面霜 50ml', brand: 'L\'Oréal Paris', cat1: '护肤', cat3: '面霜', spec: '50ml · 单罐', price: 459, cover: 'loreal black gold truffle cream' },
    { id: 'SP100022', name: '海蓝之谜精华面霜经典款 60ml', brand: '海蓝之谜', cat1: '护肤', cat3: '面霜', spec: '60ml · 经典款', price: 3280, cover: 'la mer moisturizing cream jar' },
    { id: 'SP100024', name: 'SK-II 前男友面膜 10片装', brand: 'SK-II', cat1: '护肤', cat3: '面膜', spec: '10片 · 盒装', price: 1090, cover: 'sk2 pitera facial mask box' },
    { id: 'SP100028', name: '荔萌镜面水光唇釉 03#白桃乌龙', brand: '荔萌', cat1: '彩妆', cat3: '唇釉', spec: '1.5g · 03#', price: 39.9, cover: 'leemember lip gloss peach oolong' }
  ];
  var TEXTS = {
    5: [
      '用了三周皮肤明显变透亮，吸收快不闷痘，会回购！',
      '专柜对比过是正品，效果超出预期，包装物流都用心。',
      '敏感肌也能稳稳用，换季泛红好多了，已安利闺蜜。',
      '质地清爽好推开，上妆更服帖，这个价值得。',
      '色号很准，妆感自然，通勤约会都能用。'
    ],
    4: [
      '整体不错，保湿在线，就是价格略高，建议蹲活动。',
      '提亮有感，淡斑要更久，肤感清爽可叠层。',
      '物流很快，小样也多，效果中上，继续观察。',
      '香味高级包装好看，混油夏天略负担。',
      '飞粉有一点，打底后就好了，配色真的美。'
    ],
    3: [
      '中规中矩，没有翻车也没有惊喜，观望下次活动。',
      '清洁力对我偏弱，早上用刚好，晚上不够。',
      '味道个人偏好吧，朋友觉得偏浓，自用还行。',
      '持妆一般，四小时后要补，定妆后好一些。',
      '效果有，但性价比一般，再等等长评。'
    ],
    2: [
      '两周没看到预期效果，这个价位有点失望。',
      '有点暗沉氧化，比脖子黄一圈，先给两星。',
      '保湿比想象弱，大干皮可能不够，物流倒是快。',
      '色差有点大，显唇纹，期望更高一点。',
      '刚下单就降价，心塞，希望价保说明更清楚。'
    ],
    1: [
      '用了起小疹子，已停用申请退货，敏感肌慎入。',
      '味道奇怪且不适，差评，不会再买。',
      '和描述差距大，已走售后，建议再等等真实长评。'
    ]
  };
  var AUDITS = [
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '待审核', auditKey: 'pending' },
    { auditStatus: '审核未通过', auditKey: 'fail' },
    { auditStatus: '已屏蔽', auditKey: 'block' }
  ];
  var REPLYERS = ['客服小美', '客服小紫', '客服小修', '运营管家'];
  var PROVINCES = ['上海市', '浙江省', '广东省', '北京市', '四川省', '江苏省', '湖北省', '陕西省', '重庆市', '湖南省'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = '0' + s;
    return s;
  }
  function pick(arr, i) { return arr[i % arr.length]; }
  function ratingOf(i) {
    var r = i % 10;
    if (r < 5) return 5;
    if (r < 7) return 4;
    if (r < 8) return 3;
    if (r < 9) return 2;
    return 1;
  }

  function buildProductOne(i, imgFn) {
    var n = i + 1;
    var prod = pick(PRODUCTS, i);
    var user = pick(USERS, i + 2);
    var rating = ratingOf(i);
    var audit = pick(AUDITS, i + (rating <= 2 ? 3 : 0));
    if (rating >= 4 && audit.auditKey === 'block') audit = AUDITS[0];
    var dayOff = (i % 45 === 0) ? (90 + (i % 120)) : (i % 50);
    var base = new Date(2026, 7, 26, 10, 0, 0);
    base.setDate(base.getDate() - dayOff);
    base.setHours(9 + (i % 12), (i * 11) % 60, (i * 17) % 60);
    var reviewTime = base.getFullYear() + '-' + pad2(base.getMonth() + 1) + '-' + pad2(base.getDate()) +
      ' ' + pad2(base.getHours()) + ':' + pad2(base.getMinutes()) + ':' + pad2(base.getSeconds());
    var id = 'PJ' + base.getFullYear() + pad2(base.getMonth() + 1) + pad2(base.getDate()) + pad3(n);
    var content = pick(TEXTS[rating] || TEXTS[5], i) + '（' + prod.brand + ' · ' + prod.name.slice(0, 12) + '）';
    var imgCount = (i % 4 === 0) ? 0 : (1 + (i % 3));
    if (rating <= 2 && i % 2 === 0) imgCount = Math.max(1, imgCount);
    var images = [];
    var coverPrompt = prod.cover + ' product photography white background';
    var prodCover = typeof imgFn === 'function' ? imgFn(coverPrompt) : '';
    for (var im = 0; im < imgCount; im++) {
      var ip = prod.cover + ' user review photo ' + (im + 1);
      images.push(typeof imgFn === 'function' ? imgFn(ip) : '');
    }
    var hasVideo = i % 17 === 0;
    var video = hasVideo ? ('https://example.com/review-video/' + id + '.mp4') : '';
    var tags = [];
    for (var t = 0; t < 2 + (i % 3); t++) tags.push(pick(TAGS_POOL, i + t));
    var anonymous = i % 9 === 0;
    var repurchase = rating >= 4 && i % 3 !== 0;
    var usefulCount = 5 + ((i * 37) % 800);
    var views = 100 + ((i * 131) % 90000);
    var skinType = pick(SKINS, i);
    var channel = pick(CHANNELS, i);
    var province = pick(PROVINCES, i);
    var merchant = pick(MERCHANTS, i);
    var orderId = 'DD' + base.getFullYear() + pad2(base.getMonth() + 1) + pad2(base.getDate()) + pad3(100 + n);
    var replyName = '';
    var replyTime = '';
    var replyContent = '';
    if (audit.auditKey === 'pass' && (rating <= 3 || i % 4 !== 0)) {
      replyName = pick(REPLYERS, i);
      var rt = new Date(base.getTime() + 3600000 * (2 + (i % 5)));
      replyTime = rt.getFullYear() + '-' + pad2(rt.getMonth() + 1) + '-' + pad2(rt.getDate()) +
        ' ' + pad2(rt.getHours()) + ':' + pad2(rt.getMinutes()) + ':' + pad2(rt.getSeconds());
      replyContent = rating >= 4
        ? ('亲爱的' + user.name + '，感谢晒单！看到您喜欢' + prod.brand + '我们超开心～')
        : ('非常抱歉未达预期，已登记跟进，如需退换可提交售后，我们尽快处理。');
    }
    return {
      id: id,
      reviewType: 'product',
      targetId: prod.id,
      orderId: orderId,
      prodId: prod.id,
      prodName: prod.name,
      prodCover: prodCover,
      coverPrompt: coverPrompt,
      brand: prod.brand,
      cat1: prod.cat1,
      cat3: prod.cat3,
      content: content,
      images: images,
      video: video,
      rating: rating,
      reviewTime: reviewTime,
      reviewerName: anonymous ? (user.name.charAt(0) + '**') : user.name,
      reviewerId: user.id,
      reviewerAvatarBg: user.bg,
      reviewerAvatarText: user.t,
      anonymous: anonymous,
      skinType: skinType,
      repurchase: repurchase,
      usefulCount: usefulCount,
      tags: tags.join('、'),
      channel: channel,
      province: province,
      spec: prod.spec,
      price: prod.price,
      merchantName: merchant,
      views: views,
      auditStatus: audit.auditStatus,
      auditKey: audit.auditKey,
      replyName: replyName,
      replyTime: replyTime,
      replyContent: replyContent,
      replyText: replyContent,
      hidden: audit.auditKey === 'block',
      source: 'beauty-review-seed',
      _fromCatalog: false
    };
  }

  function communityList(imgFn) {
    function img(s) { return typeof imgFn === 'function' ? imgFn(s) : ''; }
    return [
      { id: '00085', reviewType: 'topic', targetId: '00016', content: '第一次打卡，下次出现地少了', images: [], video: '', replyText: '', reviewTime: '2024-05-22 09:15:39', reviewerName: '仙灵美人', reviewerId: 'U20240085', reviewerAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', reviewerAvatarText: '仙', prodId: '', prodName: '#我在阅己盒挖到宝', prodCover: '', topicName: '#我在阅己盒挖到宝', views: 128, auditStatus: '审核通过', auditKey: 'pass', hidden: false, rating: 5 },
      { id: '00083', reviewType: 'topic', targetId: '00017', content: '所以，这里的价格预算是来自你想象嘛？', images: [], video: '', replyText: '', reviewTime: '2024-04-27 15:00:06', reviewerName: '赏雪林', reviewerId: 'U20240083', reviewerAvatarBg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)', reviewerAvatarText: '赏', prodId: '', prodName: '#敏感肌急救清单', topicName: '#敏感肌急救清单', views: 86, auditStatus: '审核通过', auditKey: 'pass', hidden: false, rating: 4 },
      { id: '00088', reviewType: 'topic', targetId: '00018', content: '第一天打卡～坚持打卡打卡打卡！', images: [], video: '', replyText: '加油！', reviewTime: '2024-05-02 08:15:58', reviewerName: '测试人员', reviewerId: 'U20240888', reviewerAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', reviewerAvatarText: '测', prodId: '', prodName: '#口红显白色号合集', topicName: '#口红显白色号合集', views: 42, auditStatus: '审核通过', auditKey: 'pass', hidden: false, rating: 5 },
      { id: 'HT202608280001', reviewType: 'topic', targetId: '00017', content: '这个话题讨论很有参考价值，评论区干货好多，收藏了准备慢慢实践！', images: [img('skincare discussion topic comments phone screen')], video: '', replyText: '', reviewTime: '2026-08-28 10:22:18', reviewerName: '叶知夏', reviewerId: 'U20240032', reviewerAvatarBg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', reviewerAvatarText: '叶', prodId: '', prodName: '#敏感肌急救清单', prodCover: './community_images/grass_2.jpg', topicName: '#敏感肌急救清单', views: 3280, auditStatus: '审核通过', auditKey: 'pass', hidden: false, rating: 5 },
      { id: 'HT202608270002', reviewType: 'topic', targetId: '00019', content: '话题有点偏营销了，希望多一点真实体验分享。', images: [], video: '', replyText: '', reviewTime: '2026-08-27 16:48:05', reviewerName: '苏念初', reviewerId: 'U20240102', reviewerAvatarBg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)', reviewerAvatarText: '苏', prodId: '', prodName: '#七夕送礼不踩雷', topicName: '#七夕送礼不踩雷', views: 860, auditStatus: '待审核', auditKey: 'pending', hidden: false, rating: 3 },
      { id: '00006', reviewType: 'feed', targetId: '00021', content: '建议加个扫码查真伪', images: [], video: '', replyText: '', rating: 5, reviewTime: '2024-10-16 09:40:40', reviewerName: '151****2565', reviewerId: 'U20240006', reviewerAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', reviewerAvatarText: '1', prodId: '', prodName: '新买的兰蔻菁纯面霜到啦！', prodCover: './community_images/feed_1.jpg', merchantName: '社区动态', views: 5120, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view' },
      { id: '00004', reviewType: 'feed', targetId: '00022', content: '这款效果不错，真的好美', images: [img('beauty product review photo pink package')], video: '', replyText: '', rating: 5, reviewTime: '2024-10-15 14:22:18', reviewerName: '圣地亚', reviewerId: 'U20240004', reviewerAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', reviewerAvatarText: '圣', prodId: '', prodName: '今天的妆容分享，温柔奶茶色系', prodCover: './community_images/feed_2.jpg', merchantName: '社区动态', views: 860, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view' },
      { id: 'DT202608280011', reviewType: 'feed', targetId: '00021', content: '动态拍得很用心，妆容步骤清楚，学到了眼线技巧～', images: [img('eye makeup tutorial step by step')], video: '', replyText: '', rating: 5, reviewTime: '2026-08-28 12:05:40', reviewerName: '陈初雪', reviewerId: 'U20240888', reviewerAvatarBg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', reviewerAvatarText: '陈', prodId: '', prodName: '新买的兰蔻菁纯面霜到啦！', prodCover: './community_images/feed_1.jpg', merchantName: '社区动态', views: 5120, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view' },
      { id: 'DT202608260012', reviewType: 'feed', targetId: '00022', content: '滤镜有点重，希望能看到素颜对比。', images: [], video: '', replyText: '已回复：后续会补素颜对比～', rating: 2, reviewTime: '2026-08-26 21:18:33', reviewerName: '江晚宁', reviewerId: 'U20240322', reviewerAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', reviewerAvatarText: '江', prodId: '', prodName: '今天的妆容分享，温柔奶茶色系', prodCover: './community_images/feed_2.jpg', merchantName: '社区动态', views: 420, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'read' },
      { id: '00012', reviewType: 'grass', targetId: '00006', content: '看完种草直接下单了，水乳真的不闷痘', images: [], video: '', replyText: '', rating: 5, reviewTime: '2024-11-08 10:22:16', reviewerName: '138****6621', reviewerId: 'U20240012', reviewerAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', reviewerAvatarText: '1', prodId: '', prodName: '无限回购水乳 · 油皮友好', prodCover: './community_images/grass_1.jpg', merchantName: '种草社区', views: 986, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view', grassName: '无限回购水乳 · 油皮友好' },
      { id: 'ZC202608280021', reviewType: 'grass', targetId: '00006', content: '种草很实在，优缺点都写了，已经下单同款水乳。', images: [img('skincare bottles flat lay grass seeding')], video: '', replyText: '感谢支持～', rating: 5, reviewTime: '2026-08-28 09:12:08', reviewerName: '唐小鹿', reviewerId: 'U20240076', reviewerAvatarBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', reviewerAvatarText: '唐', prodId: '', prodName: '无限回购水乳 · 油皮友好', prodCover: './community_images/grass_1.jpg', merchantName: '种草社区', views: 9860, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view', grassName: '无限回购水乳 · 油皮友好' },
      { id: 'ZC202608250022', reviewType: 'grass', targetId: '00008', content: '写得太笼统了，想看具体成分表和使用周期。', images: [], video: '', replyText: '', rating: 3, reviewTime: '2026-08-25 14:36:55', reviewerName: '韩以安', reviewerId: 'U20241156', reviewerAvatarBg: 'linear-gradient(135deg,#ECFDF5,#A7F3D0)', reviewerAvatarText: '韩', prodId: '', prodName: '平价好用精华安利', prodCover: './community_images/grass_3.jpg', merchantName: '种草社区', views: 1280, auditStatus: '待审核', auditKey: 'pending', readStatus: 'read', grassName: '平价好用精华安利' },
      { id: '00018', reviewType: 'article', targetId: '00001', content: '这篇写得很细，收藏慢慢看', images: [], video: '', replyText: '', rating: 5, reviewTime: '2024-12-02 16:08:40', reviewerName: '豆沙小姐', reviewerId: 'U20240018', reviewerAvatarBg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)', reviewerAvatarText: '豆', prodId: '', prodName: '护肤心得', prodCover: './community_images/article_1.jpg', merchantName: '内容中心', views: 620, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view', articleName: '护肤心得' },
      { id: 'WZ202608280031', reviewType: 'article', targetId: '00001', content: '文章结构清晰，敏感肌护理那段特别实用，已转发给闺蜜。', images: [img('reading beauty article on tablet')], video: '', replyText: '', rating: 5, reviewTime: '2026-08-28 11:40:22', reviewerName: '许清禾', reviewerId: 'U20240178', reviewerAvatarBg: 'linear-gradient(135deg,#CFFAFE,#A5F3FC)', reviewerAvatarText: '许', prodId: '', prodName: '护肤心得', prodCover: './community_images/article_1.jpg', merchantName: '内容中心', views: 15620, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'view', articleName: '护肤心得' },
      { id: 'WZ202608240032', reviewType: 'article', targetId: '00002', content: '部分观点偏主观，建议补充权威来源链接。', images: [], video: '', replyText: '已补充参考文献～', rating: 4, reviewTime: '2026-08-24 18:05:11', reviewerName: '陆星眠', reviewerId: 'U20240608', reviewerAvatarBg: 'linear-gradient(135deg,#FEF9C3,#FDE68A)', reviewerAvatarText: '陆', prodId: '', prodName: '彩妆入门指南', prodCover: './community_images/article_2.jpg', merchantName: '内容中心', views: 4320, auditStatus: '审核通过', auditKey: 'pass', readStatus: 'read', articleName: '彩妆入门指南' }
    ];
  }

  function productList(imgFn) {
    var out = [];
    for (var i = 0; i < 100; i++) out.push(buildProductOne(i, imgFn));
    return out;
  }

  function list(imgFn) {
    return productList(imgFn).concat(communityList(imgFn));
  }

  function enrich(r) {
    if (!r) return r;
    if (!r.reviewType) r.reviewType = r.prodId ? 'product' : 'product';
    if (r.anonymous == null) r.anonymous = false;
    if (r.repurchase == null) r.repurchase = false;
    if (r.usefulCount == null) r.usefulCount = 0;
    if (!r.skinType) r.skinType = '';
    if (!r.channel) r.channel = '';
    if (!r.province) r.province = '';
    if (!r.tags) r.tags = '';
    if (!r.brand) r.brand = '';
    if (!r.cat1) r.cat1 = '';
    if (!r.orderId) r.orderId = '';
    if (!r.video) r.video = '';
    return r;
  }

  var api = { list: list, productList: productList, communityList: communityList, enrich: enrich, count: 100 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyReviewSeed = api;
})(typeof window !== 'undefined' ? window : global);
