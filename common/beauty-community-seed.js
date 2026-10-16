/**
 * 美妆社区种子 · 文章100 / 种草100 / 圈子100 / 话题100 / 动态100
 * 运营社区管理 / 数据中心社区数据
 */
(function (global) {
  var CATS = ['护肤', '彩妆', '香水', '母婴', '日常'];
  var ART_TAGS = ['护肤攻略', '化妆技巧', '敏感肌', '好物推荐', '修护', '防晒', '抗老', '国货'];
  var GRASS_TAGS = ['爱用物', '测评', '国货', '开箱', '避雷', '平价'];
  var FEED_TAGS = ['开箱', '测评', '日常', '妆容', '护肤日记'];
  var PUBLISHERS = ['用户', '商家', '平台'];
  var LEVELS = [
    { level: '普通会员', levelKey: 'normal' },
    { level: 'Prime会员', levelKey: 'prime' },
    { level: '卓越会员', levelKey: 'excellent' }
  ];
  var STATUSES = [
    { status: 'passed', statusText: '已通过' },
    { status: 'passed', statusText: '已通过' },
    { status: 'passed', statusText: '已通过' },
    { status: 'pending', statusText: '待审核' },
    { status: 'hidden', statusText: '已隐藏' }
  ];
  var CHANNELS = ['App', '小程序', 'H5', '运营投稿', '达人合作'];
  var SKINS = ['干皮', '油皮', '混油', '敏感肌', '中性', '不限'];
  var CITIES = ['上海', '北京', '广州', '深圳', '杭州', '成都', '武汉', '南京', '重庆', '西安'];
  var BRANDS = ['兰蔻', '雅诗兰黛', 'SK-II', '花西子', '完美日记', '欧莱雅', '资生堂', '海蓝之谜', '迪奥', '香奈儿'];
  var NAMES = [
    '温以柔', '沈清欢', '宋软软', '方知予', '谢星河', '程予薇', '韩以安', '赵浅予', '金琉璃', '夏念安',
    '江晚宁', '陆星眠', '许清禾', '唐小鹿', '吴晚棠', '叶知夏', '苏念初', '梁慕白', '郑予欢', '何清禾',
    '林予安', '顾惜月', '周南枝', '陈初雪', '姚慕晴', '裴书言', '白予安', '陆晚星', '沈慕清', '顾南笙'
  ];
  var USER_IDS = [
    'U20240501', 'U20240088', 'U20240208', 'U20240612', 'U20240334', 'U20240901', 'U20241156', 'U20240442',
    'U20241444', 'U20241558', 'U20240322', 'U20240608', 'U20240178', 'U20240076', 'U20240236', 'U20240032',
    'U20240102', 'U20241102', 'U20241220', 'U20241312', 'U20240105', 'U20240256', 'U20240778', 'U20240888',
    'U20241668', 'U20240105', 'U20240088', 'U20240256', 'U20240322', 'U20240608'
  ];
  var ART_TITLES = [
    '护肤心得', '彩妆入门指南', '敏感肌换季急救笔记', '养肤底妆选购指南', '熬夜党修护精华清单',
    '夏季防晒全攻略', '抗老入门不踩雷', '国货精华真实测评', '口红显白色号合集', '油皮控油三部曲',
    '干皮补水救星清单', '香水分层叠香技巧', '母婴安心洗护指南', '眼霜到底有没有用', '面膜一周怎么敷',
    '气垫与粉底液怎么选', '换季维稳流程', '成分党避雷手册', '通勤淡妆五分钟', '贵妇面霜值不值',
    '平价替代大牌清单', '卸妆正确打开方式', '身体乳选购指南', '男士护肤入门', '孕妇可用美妆清单',
    '唇釉持久不拔干', '修容高光新手课', '眉形怎么画更自然', '打底妆服帖秘诀', '夜间修护顺序',
    '维C精华使用注意', '视黄醇入门指南', '玻尿酸与B5区别', '泥膜与涂抹面膜', '防晒补涂技巧',
    '旅行便携护肤包', '送礼美妆不踩雷', '学生党百元妆教', '熟龄妆容提亮法', '敏感肌彩妆温和选'
  ];
  var ART_EXCERPTS = [
    '从基础清洁开始，循序渐进添加精华与乳霜…',
    '新手彩妆从底妆、眉眼、唇妆三步说清…',
    '换季爆皮起皮怎么办？这份温和方案…',
    '养肤粉底与气垫怎么选？按肤质匹配…',
    '熬夜急救：舒缓、修护、锁水三步走…',
    '物理化学防晒怎么搭，户外补涂节奏…',
    '抗老别盲目上猛药，先维稳再进阶…',
    '几款国货精华上脸感受与适合肤质…'
  ];
  var GRASS_TEXTS = [
    '最近入手的这款精华真的太好用了！用了两周皮肤状态明显稳住，推荐给姐妹们！',
    '分享本月爱用物合集，从护肤到彩妆都是亲测好物。',
    '神仙水使用一个月效果对比来啦，肤感细腻了不少。',
    '平价替代｜这几款国货真的不输大牌，学生党必看！',
    '秋冬换季护肤攻略，敏感肌必看步骤与产品。',
    '这支口红显白不拔干，通勤约会都能用。',
    '防晒实测不搓泥，出油也不假白。',
    '泥膜清洁力刚好，敏敏肌也能接受。',
    '身体乳香气温柔持久，涂完皮肤软软的。',
    '唇釉一层就匀色，口红色号党狂喜。'
  ];
  var FEED_TEXTS = [
    '新买的面霜到啦！包装好高级，迫不及待想试用。',
    '今天的妆容分享，温柔奶茶色，适合秋冬通勤。',
    '开箱日记｜精粹水终于入手，期待上脸效果。',
    '早晚护肤流程大公开，坚持皮肤会变好的！',
    '新手化妆入门，手残党也能学会的详细步骤。',
    '今日份口红色号试色，偏显白的豆沙调。',
    '护肤台面整理完毕，极简瓶瓶罐罐更治愈。',
    '周末宅家敷面膜，来分享一下本周面膜合集。'
  ];
  var CIRCLE_NAMES = [
    '护肤交流圈', '彩妆学习圈', '香水爱好者', '宝妈美妆圈', '敏感肌互助圈',
    '成分党研究所', '国货美妆团', '口红试色屋', '防晒研究所', '抗老进阶营',
    '平价好物局', '贵妇护肤会', '通勤妆容圈', '男士理容社', '身体护理站',
    '美甲分享社', '发型与头皮', '医美恢复互助', '留学生美妆', '直播间种草团'
  ];
  var TOPIC_TITLES = [
    '#我在美丽修行挖到宝', '#敏感肌急救清单', '#口红显白色号合集', '#七夕送礼不踩雷', '#素颜出街',
    '#换季维稳打卡', '#国货之光', '#防晒必入榜', '#熬夜修护日记', '#通勤五分钟妆',
    '#成分党避雷', '#平价替代大牌', '#香水叠香实验', '#母婴安心洗护', '#眼妆新手营',
    '#唇釉不拔干', '#泥膜清洁日', '#身体乳香气', '#男士护肤入门', '#贵妇面霜真实评',
    '#学生党百元妆', '#打底服帖秘籍', '#视黄醇怎么用', '#玻尿酸补水', '#旅行护肤包',
    '#送礼美妆指南', '#眉形自然画法', '#高光修容课', '#卸妆正确姿势', '#周面膜计划'
  ];

  function pad5(n) {
    var s = String(n);
    while (s.length < 5) s = '0' + s;
    return s;
  }
  function pick(arr, i) { return arr[i % arr.length]; }
  function dateStr(y, m, d) {
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }
  function buildDate(i, baseY) {
    var y = baseY || 2026;
    var m = 1 + (i % 8);
    var d = 1 + (i % 27);
    return dateStr(y, m, d);
  }

  function enrichArticle(a) {
    if (!a) return a;
    if (!a.channel) a.channel = pick(CHANNELS, Number(String(a.id).replace(/\D/g, '') || 0));
    if (!a.skinType) a.skinType = pick(SKINS, (a.title || '').length);
    if (!a.brandMention) a.brandMention = pick(BRANDS, (a.author || '').length);
    if (a.wordCount == null) a.wordCount = 600 + ((Number(a.reads) || 0) % 2400);
    if (a.featured == null) a.featured = (a.status === 'passed' && (Number(a.likes) || 0) > 500);
    if (!a.source) a.source = a.publisher === '平台' ? '编辑精选' : (a.publisher === '商家' ? '商家投稿' : '用户原创');
    if (!a.editor) a.editor = a.publisher === '平台' ? '内容运营组' : '-';
    if (!a.region) a.region = pick(CITIES, (a.authorId || '').length);
    if (!a.recommendScore) a.recommendScore = Math.min(99, 60 + ((Number(a.likes) || 0) % 40));
    if (a.shareCount == null) a.shareCount = Math.floor((Number(a.likes) || 0) * 0.12);
    if (!a.content) a.content = (a.excerpt || '') + '（演示正文）';
    return a;
  }

  function enrichGrass(g) {
    if (!g) return g;
    if (!g.brand) g.brand = pick(BRANDS, (g.user || '').length);
    if (!g.productName) g.productName = g.brand + '体验装';
    if (!g.skinType) g.skinType = pick(SKINS, (g.text || '').length);
    if (g.rating == null) g.rating = 3 + ((Number(g.likes) || 0) % 3);
    if (g.useful == null) g.useful = Math.floor((Number(g.likes) || 0) * 0.18);
    if (g.featured == null) g.featured = (g.status === 'passed' && (Number(g.views) || 0) > 80000);
    if (!g.city) g.city = pick(CITIES, (g.userId || '').length);
    if (!g.device) g.device = pick(['iOS', 'Android', 'HarmonyOS'], (g.id || '').length);
    if (!g.topicRef) g.topicRef = pick(TOPIC_TITLES, Number(String(g.id).replace(/\D/g, '') || 0));
    if (g.reportCount == null) g.reportCount = (g.status === 'hidden' ? 2 + (Number(g.id) % 3) : 0);
    if (!g.orderNo && (Number(String(g.id).replace(/\D/g, '')) % 3 === 0)) {
      g.orderNo = 'OD2026' + pad5(1000 + (Number(String(g.id).replace(/\D/g, '')) % 9000));
    }
    return g;
  }

  function enrichCircle(c) {
    if (!c) return c;
    if (!c.region) c.region = pick(['全国', '华东', '华南', '华北', '西南'], (c.name || '').length);
    if (!c.level) c.level = pick(['官方认证', '优质圈子', '成长中', '普通'], (c.master || '').length);
    if (c.weeklyPosts == null) c.weeklyPosts = 20 + ((c.name || '').length * 7) % 200;
    if (c.activeRate == null) c.activeRate = (35 + ((c.name || '').length * 3) % 50) + '%';
    if (c.topicCount == null) c.topicCount = 5 + ((c.masterId || '').length % 40);
    if (!c.notice) c.notice = '文明交流，禁止广告引流';
    if (!c.joinMode) c.joinMode = pick(['自由加入', '需审核', '邀请制'], (c.id || '').length);
    if (c.recommend == null) c.recommend = c.status === 'passed' && String(c.members || '').indexOf('万') >= 0;
    return c;
  }

  function enrichTopic(t) {
    if (!t) return t;
    if (!t.cat) t.cat = pick(CATS, (t.title || '').length);
    if (!t.tag) t.tag = pick(ART_TAGS, (t.initiator || '').length);
    if (t.joinCount == null) t.joinCount = Number(t.viewers) || Number(t.discussions) || 0;
    if (t.postCount == null) t.postCount = Math.floor((Number(t.heat) || 0) * 0.4);
    if (t.featured == null) t.featured = !!t.isHot;
    if (!t.relatedBrand) t.relatedBrand = pick(BRANDS, (t.title || '').length);
    if (!t.ownerDept) t.ownerDept = pick(['社区运营', '品牌合作', '用户增长'], (t.initiatorId || '').length);
    if (!t.channel) t.channel = pick(CHANNELS, (t.id || '').length);
    return t;
  }

  function enrichFeed(f) {
    if (!f) return f;
    if (!f.device) f.device = pick(['iOS', 'Android', 'HarmonyOS'], (f.user || '').length);
    if (!f.city) f.city = pick(CITIES, (f.userId || '').length);
    if (!f.topicRef) f.topicRef = pick(TOPIC_TITLES, Number(String(f.id).replace(/\D/g, '') || 0) + 3);
    if (!f.brand) f.brand = pick(BRANDS, (f.text || '').length);
    if (!f.visibility) f.visibility = pick(['公开', '公开', '仅粉丝', '公开'], (f.id || '').length);
    if (f.reportCount == null) f.reportCount = f.status === 'hidden' ? 1 + (Number(String(f.id).replace(/\D/g, '')) % 4) : 0;
    if (f.featured == null) f.featured = f.status === 'passed' && (Number(f.likes) || 0) > 300;
    if (!f.skinType) f.skinType = pick(SKINS, (f.tag || '').length);
    if (!f.mediaType) f.mediaType = f.video ? 'video' : 'image';
    return f;
  }

  function buildArticle(i) {
    var n = i + 1;
    var id = String(10000 + n); /* 10001-10100 */
    var st = pick(STATUSES, i);
    var lv = pick(LEVELS, i + 1);
    var reads = st.status === 'pending' ? (i % 5 === 0 ? 0 : 800 + i * 97) : (2000 + ((i * 131) % 40000));
    var likes = Math.floor(reads * (0.04 + (i % 7) * 0.01));
    var comments = Math.floor(likes * (0.08 + (i % 5) * 0.02));
    var favorites = Math.floor(likes * (0.2 + (i % 4) * 0.05));
    var a = {
      id: id,
      seed: 'art-' + n,
      title: ART_TITLES[i] || ('美妆文章' + n),
      excerpt: pick(ART_EXCERPTS, i),
      cat: pick(['护肤', '彩妆', '香水', '母婴'], i),
      tag: pick(ART_TAGS, i),
      publisher: pick(PUBLISHERS, i),
      author: pick(NAMES, i),
      authorId: pick(USER_IDS, i),
      level: lv.level,
      levelKey: lv.levelKey,
      status: st.status,
      statusText: st.statusText,
      reads: reads,
      publishTime: buildDate(i + 2, 2026),
      subtitle: pick(['专业美容知识分享', '时尚彩妆教程', '护肤经验', '好物测评'], i),
      favorites: favorites,
      comments: comments,
      likes: likes,
      syncCover: './community_images/article_' + (1 + (i % 5)) + '.jpg'
    };
    return enrichArticle(a);
  }

  function buildGrass(i) {
    var n = i + 1;
    var id = String(20000 + n); /* 20001-20100 */
    var st = pick(STATUSES, i + 1);
    var lv = pick(LEVELS, i);
    var views = st.status === 'pending' ? 1200 + i * 80 : (8000 + ((i * 173) % 200000));
    var likes = Math.floor(views * (0.003 + (i % 6) * 0.001));
    var comments = Math.floor(likes * (0.1 + (i % 4) * 0.03));
    var g = {
      id: id,
      seed: 'grass-' + n,
      user: pick(NAMES, i + 3),
      userId: pick(USER_IDS, i + 3),
      publisher: pick(PUBLISHERS, i + 1),
      cat: pick(['护肤', '彩妆', '香水'], i),
      tag: pick(GRASS_TAGS, i),
      level: lv.level,
      levelKey: lv.levelKey,
      status: st.status,
      statusText: st.statusText,
      text: pick(GRASS_TEXTS, i),
      imgs: 1 + (i % 3),
      likes: likes,
      comments: comments,
      views: views,
      publishTime: buildDate(i + 5, 2026),
      syncCover: './community_images/grass_' + (1 + (i % 5)) + '.jpg',
      syncImgs: ['./community_images/grass_' + (1 + (i % 5)) + '.jpg']
    };
    return enrichGrass(g);
  }

  function buildCircle(i) {
    var n = i + 1;
    var id = String(30000 + n); /* 30001-30100 */
    var st = pick(STATUSES, i + 2);
    if (st.status === 'hidden') st = STATUSES[0];
    var membersNum = 0.8 + (i % 20) * 0.6 + (i % 3) * 0.2;
    var postsNum = 0.3 + (i % 15) * 0.2;
    var c = {
      id: id,
      seed: 'circle-' + n,
      name: CIRCLE_NAMES[i] || ('美妆圈子' + n),
      cat: pick(CATS, i),
      status: st.status,
      statusText: st.statusText,
      members: (Math.round(membersNum * 10) / 10) + '万',
      posts: (Math.round(postsNum * 10) / 10) + '万',
      master: pick(NAMES, i + 5),
      masterId: pick(USER_IDS, i + 5),
      createTime: buildDate(i, 2025 + (i % 2)),
      syncCover: './community_images/circle_' + (1 + (i % 5)) + '.jpg',
      syncAvatar: './avatars/u' + pad5(1 + (i % 24)).slice(-2) + '.jpg?v=2'
    };
    /* fix avatar path: u01-u24 style */
    var av = 1 + (i % 24);
    c.syncAvatar = './avatars/u' + (av < 10 ? '0' : '') + av + '.jpg?v=2';
    return enrichCircle(c);
  }

  function buildTopic(i) {
    var n = i + 1;
    var id = String(40000 + n); /* 40001-40100 */
    var st = pick(STATUSES, i);
    if (st.status === 'hidden') st = STATUSES[3];
    var heat = 400 + ((i * 97) % 1600);
    var viewers = 300 + ((i * 113) % 2500);
    var t = {
      id: id,
      seed: 'topic-' + n,
      title: TOPIC_TITLES[i] || ('#美妆话题' + n),
      initiator: pick(NAMES, i + 7),
      initiatorId: pick(USER_IDS, i + 7),
      status: st.status,
      statusText: st.statusText,
      discussions: String(viewers),
      heat: heat,
      viewers: viewers,
      isHot: heat >= 800,
      createTime: buildDate(i + 1, 2026),
      syncCover: './community_images/' + (i % 2 === 0 ? 'grass_' : 'feed_') + (1 + (i % 5)) + '.jpg'
    };
    return enrichTopic(t);
  }

  function buildFeed(i) {
    var n = i + 1;
    var id = String(50000 + n); /* 50001-50100 */
    var st = pick(STATUSES, i + 2);
    var likes = 50 + ((i * 67) % 800);
    var comments = Math.floor(likes * (0.12 + (i % 5) * 0.02));
    var shares = Math.floor(likes * (0.05 + (i % 4) * 0.02));
    var isVideo = i % 7 === 2;
    var f = {
      id: id,
      seed: 'feed-' + n,
      user: pick(NAMES, i + 9),
      userId: pick(USER_IDS, i + 9),
      publisher: pick(PUBLISHERS, i),
      cat: pick(['护肤', '彩妆', '日常'], i),
      tag: pick(FEED_TAGS, i),
      status: st.status,
      statusText: st.statusText,
      text: pick(FEED_TEXTS, i),
      imgs: isVideo ? 1 : (1 + (i % 3)),
      likes: likes,
      comments: comments,
      shares: shares,
      publishTime: buildDate(i + 8, 2026),
      syncCover: './community_images/feed_' + (1 + (i % 5)) + '.jpg',
      syncImgs: ['./community_images/feed_' + (1 + (i % 5)) + '.jpg'],
      mediaType: isVideo ? 'video' : 'image',
      video: isVideo ? '1' : ''
    };
    return enrichFeed(f);
  }

  var CACHE = { articles: null, grasses: null, circles: null, topics: null, feeds: null };

  function listArticles() {
    if (!CACHE.articles) {
      CACHE.articles = [];
      for (var i = 0; i < 100; i++) CACHE.articles.push(buildArticle(i));
    }
    return CACHE.articles.map(function (a) { return enrichArticle(Object.assign({}, a)); });
  }
  function listGrasses() {
    if (!CACHE.grasses) {
      CACHE.grasses = [];
      for (var i = 0; i < 100; i++) CACHE.grasses.push(buildGrass(i));
    }
    return CACHE.grasses.map(function (g) { return enrichGrass(Object.assign({}, g)); });
  }
  function listCircles() {
    if (!CACHE.circles) {
      CACHE.circles = [];
      for (var i = 0; i < 100; i++) CACHE.circles.push(buildCircle(i));
    }
    return CACHE.circles.map(function (c) { return enrichCircle(Object.assign({}, c)); });
  }
  function listTopics() {
    if (!CACHE.topics) {
      CACHE.topics = [];
      for (var i = 0; i < 100; i++) CACHE.topics.push(buildTopic(i));
    }
    return CACHE.topics.map(function (t) { return enrichTopic(Object.assign({}, t)); });
  }
  function listFeeds() {
    if (!CACHE.feeds) {
      CACHE.feeds = [];
      for (var i = 0; i < 100; i++) CACHE.feeds.push(buildFeed(i));
    }
    return CACHE.feeds.map(function (f) { return enrichFeed(Object.assign({}, f)); });
  }

  var api = {
    countArticles: 100,
    countGrass: 100,
    countCircle: 100,
    countTopic: 100,
    countFeed: 100,
    count: 500,
    listArticles: listArticles,
    listGrasses: listGrasses,
    listCircles: listCircles,
    listTopics: listTopics,
    listFeeds: listFeeds,
    enrichArticle: enrichArticle,
    enrichGrass: enrichGrass,
    enrichCircle: enrichCircle,
    enrichTopic: enrichTopic,
    enrichFeed: enrichFeed
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.BeautyCommunitySeed = api;
})(typeof window !== 'undefined' ? window : global);
