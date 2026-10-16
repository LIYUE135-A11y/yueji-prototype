/**
 * 美妆商品种子 · 100 条（运营商品管理 ↔ ProductStore）
 * 浏览器：window.BeautyProductSeed
 * Node：module.exports
 */
(function (global) {
  var BRANDS = [
    { brand: 'SK-II', merchant: 'SK-II奢享汇', letter: 'S' },
    { brand: 'Lancôme', merchant: '兰蔻官方授权店', letter: '兰' },
    { brand: '雅诗兰黛', merchant: '雅诗兰黛集团官方店', letter: '雅' },
    { brand: '完美日记', merchant: '完美日记品牌店', letter: '完' },
    { brand: '花西子', merchant: '花西子国风旗舰店', letter: '西' },
    { brand: '自然堂', merchant: '自然堂生活美学馆', letter: '自' },
    { brand: "L'Oréal Paris", merchant: '欧莱雅集团官方店', letter: '欧' },
    { brand: '修丽可', merchant: '修丽可官方旗舰店', letter: '修' },
    { brand: '珂润', merchant: '珂润敏感肌护理店', letter: '珂' },
    { brand: '海蓝之谜', merchant: '海蓝精选', letter: '海' },
    { brand: '阅己', merchant: '阅己美妆旗舰店', letter: '阅' },
    { brand: '薇诺娜', merchant: '薇诺娜旗舰店', letter: '薇' }
  ];

  var SKINS = ['干皮', '油皮', '混干皮', '混油皮', '敏感肌', '中性肌', '痘痘肌'];
  var TEXTURES = ['清爽凝胶', '水润乳液', '滋润霜质', '精华质地', '雾面哑光', '水光玻璃', '丝绒质感', '轻薄粉质'];
  var FINISHES = ['自然', '哑光', '水光', '缎光', '雾面', '亮泽', '—'];
  var SCENES = ['日常通勤', '约会妆', '职场妆', '熬夜急救', '换季修护', '夏日防晒', '旅行便携', '敏感修护'];
  var INGS = ['透明质酸', '烟酰胺', '神经酰胺', '视黄醇', '维生素C', '积雪草', 'Pitera', '胜肽', '水杨酸', '角鲨烷', '胶原蛋白', '玻尿酸'];
  var EFFS = ['补水保湿', '修护屏障', '提亮肤色', '抗初老', '控油清痘', '舒缓泛红', '紧致淡纹', '均匀肤色', '防晒隔离'];
  var TAGS = ['爆款', '国货', '专柜同款', '敏感肌友好', '成分党', '学生党平价', '抗老精华', '彩妆必备', '香水彩妆', '正装大容量'];
  var ORIGINS = ['日本', '法国', '美国', '韩国', '中国', '瑞士', '意大利'];
  var SHIPS = ['上海仓', '杭州仓', '广州仓', '成都仓', '北京仓', '保税仓'];
  var CHANNELS = ['旗舰店', '专营店', '全球购', '超市同款', '会员专享'];
  var UNITS = ['瓶', '盒', '支', '袋', '套'];
  var PACKS = ['玻璃瓶', '软管', '泵头瓶', '气垫盒', '纸盒装', '铝管', '喷雾瓶'];
  var BENEFITS = ['正品保障', '七天无理由', '运费险', '会员折扣', '优惠券', '新人权益'];

  var CATALOG = [
    { cat1: '护肤', cat2: '面部护肤', cat3: '精华', name: '修护精华液', subtitle: '维稳修护·提亮', net: '30ml', price: 780 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '精华', name: '玻尿酸精华露', subtitle: '深层补水', net: '50ml', price: 298 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '精华', name: '抗老精华', subtitle: '淡纹紧致', net: '30ml', price: 1280 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '洁面', name: '氨基酸洁面乳', subtitle: '温和不紧绷', net: '120g', price: 89 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '洁面', name: '泡沫洁颜慕斯', subtitle: '细腻绵密', net: '150ml', price: 128 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水', name: '保湿爽肤水', subtitle: '水油平衡', net: '200ml', price: 168 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '爽肤水', name: '精华水', subtitle: '二次清洁·铺垫吸收', net: '160ml', price: 390 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜', name: '清爽乳液', subtitle: '不油腻', net: '100ml', price: 259 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜', name: '修护面霜', subtitle: '夜间修护', net: '50g', price: 680 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜', name: '轻盈霜', subtitle: '日间锁水', net: '80g', price: 990 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '面膜', name: '补水面膜', subtitle: '10片装', net: '10片', price: 128 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '面膜', name: '修护面膜', subtitle: '急救舒缓', net: '5片', price: 198 },
    { cat1: '护肤', cat2: '面部护肤', cat3: '防晒', name: '轻薄防晒乳', subtitle: 'SPF50+ PA++++', net: '40ml', price: 158, spf: 'SPF50+', pa: 'PA++++' },
    { cat1: '护肤', cat2: '面部护肤', cat3: '防晒', name: '清爽防晒喷雾', subtitle: '补喷方便', net: '80ml', price: 118, spf: 'SPF50+', pa: 'PA+++' },
    { cat1: '护肤', cat2: '眼部护理', cat3: '眼霜', name: '修护眼霜', subtitle: '淡化细纹', net: '15ml', price: 520 },
    { cat1: '护肤', cat2: '眼部护理', cat3: '眼霜', name: '紧致眼部精华', subtitle: '抗蓝光', net: '15ml', price: 460 },
    { cat1: '护肤', cat2: '身体护理', cat3: '身体乳', name: '焕亮身体乳', subtitle: '香氛保湿', net: '250ml', price: 165 },
    { cat1: '护肤', cat2: '身体护理', cat3: '身体乳', name: '修护身体霜', subtitle: '干燥急救', net: '200ml', price: 139 },
    { cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', name: '丝绒口红', subtitle: '雾面显白', net: '3.5g', price: 169, shade: true },
    { cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', name: '水光唇釉', subtitle: '镜面嘟嘟唇', net: '5g', price: 129, shade: true },
    { cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', name: '哑光唇膏', subtitle: '不拔干', net: '3.2g', price: 109, shade: true },
    { cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', name: '气垫粉底', subtitle: '轻薄贴妆', net: '15g', price: 219, shade: true, spf: 'SPF50+', pa: 'PA+++' },
    { cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', name: '养肤粉底液', subtitle: '持妆控油', net: '30ml', price: 289, shade: true },
    { cat1: '彩妆', cat2: '面部彩妆', cat3: '眼影', name: '十二色眼影盘', subtitle: '大地色通勤', net: '12色', price: 159 },
    { cat1: '彩妆', cat2: '面部彩妆', cat3: '腮红', name: '雾面腮红', subtitle: '裸感气色', net: '4g', price: 99, shade: true },
    { cat1: '彩妆', cat2: '面部彩妆', cat3: '眉笔', name: '极细眉笔', subtitle: '防水防汗', net: '0.08g', price: 69, shade: true },
    { cat1: '彩妆', cat2: '面部彩妆', cat3: '睫毛膏', name: '纤长睫毛膏', subtitle: '根根分明', net: '8g', price: 89 },
    { cat1: '香水', cat2: '香氛', cat3: '香水', name: '淡香水', subtitle: '花果调', net: '50ml', price: 389, fragrance: true },
    { cat1: '香水', cat2: '香氛', cat3: '香水', name: '香水礼盒', subtitle: '东方香调', net: '30ml×2', price: 520, fragrance: true },
    { cat1: '个护', cat2: '口腔护理', cat3: '牙膏', name: '美白牙膏', subtitle: '清新口气', net: '120g', price: 39 },
    { cat1: '个护', cat2: '头发护理', cat3: '洗发水', name: '修护洗发水', subtitle: '柔顺防毛躁', net: '400ml', price: 78 },
    { cat1: '母婴', cat2: '婴童护理', cat3: '面霜', name: '婴儿山茶油霜', subtitle: '温和滋润', net: '68g', price: 98 },
    { cat1: '食品保健', cat2: '营养保健', cat3: '胶原蛋白', name: '胶原蛋白肽粉', subtitle: '美容口服', net: '30袋', price: 268 }
  ];

  var SHADES = ['01#自然色', '02#亮肤色', '03#暖米色', 'M301糖霜山楂', 'M302豆沙奶茶', 'C30自然偏白', '440深肤', '裸粉', '正红', '正棕'];
  var FRAGS = ['花果调', '东方调', '木质调', '清新绿叶', '琥珀麝香'];

  function pad3(n) {
    var s = String(n);
    while (s.length < 3) s = '0' + s;
    return s;
  }
  function pick(arr, i) {
    return arr[i % arr.length];
  }
  function round2(n) {
    return Math.round(n * 100) / 100;
  }
  function coverPath(n) {
    var file = 'sp100' + pad3(((n - 1) % 24) + 1);
    return './static/products/' + file + '.jpg';
  }
  function ym(i, baseY, baseM) {
    var m = baseM + (i % 18);
    var y = baseY + Math.floor((m - 1) / 12);
    m = ((m - 1) % 12) + 1;
    var d = 1 + (i % 27);
    return y + '-' + pad3(m).slice(-2) + '-' + pad3(d).slice(-2) + ' ' + pad3(10 + (i % 8)).slice(-2) + ':' + pad3((i * 7) % 60).slice(-2);
  }

  function buildOne(i) {
    var n = i + 1;
    var cat = CATALOG[i % CATALOG.length];
    var b = BRANDS[i % BRANDS.length];
    var id = 'SP100' + pad3(n);
    var price = round2(cat.price * (0.85 + ((i * 17) % 40) / 100));
    var originPrice = round2(price * (1.15 + ((i % 5) * 0.05)));
    var memberPrice = round2(price * 0.92);
    var costPrice = round2(price * 0.42);
    var stock = (i % 11 === 0) ? 0 : (20 + ((i * 97) % 9800));
    var orders = 80 + ((i * 131) % 48000);
    var fav = 200 + ((i * 89) % 22000);
    var review = 40 + ((i * 53) % 9000);
    var gmv = round2(orders * price * (0.7 + ((i % 10) / 20)));
    var auditPass = i % 9 !== 0;
    var auditFail = i % 23 === 0;
    var auditStatus = auditFail ? '审核未通过' : (auditPass ? '审核通过' : '待审核');
    var status = auditStatus === '审核通过' ? (stock <= 0 && i % 2 === 0 ? '已下架' : '已上架') : '已下架';
    var skin = pick(SKINS, i) + ((i % 3 === 0) ? (',' + pick(SKINS, i + 2)) : '');
    var shade = cat.shade ? pick(SHADES, i) : '';
    var spf = cat.spf || '';
    var pa = cat.pa || '';
    var fragrance = cat.fragrance ? pick(FRAGS, i) : ((cat.cat1 === '香水') ? pick(FRAGS, i) : '');
    var efficacy = pick(EFFS, i) + '、' + pick(EFFS, i + 3);
    var ingredients = pick(INGS, i) + '、' + pick(INGS, i + 4) + '、' + pick(INGS, i + 7);
    var tags = pick(TAGS, i) + ',' + pick(TAGS, i + 5);
    var benefit = pick(BENEFITS, i) + '、' + pick(BENEFITS, i + 2);
    var cover = coverPath(n);
    var name = b.brand + ' ' + cat.name + (shade ? ' ' + shade : '') + ' ' + cat.net;
    var sku = (b.brand.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/g, '').slice(0, 4) || 'YJ').toUpperCase() + '-' + cat.cat3.slice(0, 2) + '-' + pad3(n);
    var unit = cat.net.indexOf('片') >= 0 ? '盒' : pick(UNITS, i);
    var isGift = i % 17 === 0;
    var isDutyFree = i % 19 === 0;

    return {
      id: id,
      spuId: 'SPU' + pad3(Math.ceil(n / 3)),
      name: name,
      subtitle: cat.subtitle + ' · ' + pick(SCENES, i),
      brand: b.brand,
      sku: sku,
      barcode: '69' + String(1000000000000 + n * 137).slice(0, 11),
      unit: unit,
      cat1: cat.cat1,
      cat2: cat.cat2,
      cat3: cat.cat3,
      spec: cat.net + '/' + unit,
      netContent: cat.net,
      packType: pick(PACKS, i),
      shade: shade,
      texture: pick(TEXTURES, i),
      finish: cat.cat1 === '彩妆' ? pick(FINISHES, i) : '—',
      spf: spf,
      pa: pa,
      skinTypes: skin,
      scene: pick(SCENES, i),
      keyIngredients: ingredients,
      efficacy: efficacy,
      fragrance: fragrance || '—',
      suitAge: i % 5 === 0 ? '18-45岁' : '成年适用',
      origin: pick(ORIGINS, i),
      manufacturer: b.brand + '（中国）有限公司',
      shelfLife: (24 + (i % 3) * 12) + '个月',
      batchNo: 'B' + (2025 + (i % 2)) + pad3((i % 12) + 1) + pad3((i % 28) + 1),
      nmpaNo: '国妆备字' + (i % 2 === 0 ? 'G' : 'J') + '2025' + pad3(1000 + i),
      isDutyFree: isDutyFree ? '是' : '否',
      price: price,
      originPrice: originPrice,
      memberPrice: memberPrice,
      costPrice: costPrice,
      stock: stock,
      stockWarn: 50,
      salesChannel: pick(CHANNELS, i),
      weightG: 30 + ((i * 13) % 400),
      shipFrom: pick(SHIPS, i),
      freightTpl: i % 4 === 0 ? '偏远地区补运费' : '满99包邮',
      returnPolicy: '七天无理由（临期/开封除外）',
      isGift: isGift ? '是' : '否',
      tags: tags,
      recommendScore: 60 + (i % 40),
      shelfTime: ym(i, 2024, 3),
      updateTime: ym(i + 5, 2025, 6),
      buyerShow: 10 + ((i * 7) % 800),
      merchant: b.merchant,
      merchantLetter: b.letter,
      cover: cover,
      coverUrl: cover,
      syncCover: cover,
      fav: fav,
      review: review,
      order: orders,
      gmv: gmv,
      status: status,
      auditStatus: auditStatus,
      auditKey: auditFail ? 'fail' : (auditPass ? 'pass' : 'pending'),
      auditRemark: auditFail ? '成分宣称需补充备案证明' : '',
      benefit: benefit,
      benefits: benefit.split('、'),
      activityType: benefit.split('、')[0] || '',
      source: 'ops-seed'
    };
  }

  function list() {
    var out = [];
    for (var i = 0; i < 100; i++) out.push(buildOne(i));
    return out;
  }

  function enrich(p, idx) {
    if (!p) return p;
    idx = idx || 0;
    var base = buildOne(idx % 100);
    var keys = [
      'subtitle', 'spuId', 'barcode', 'unit', 'spec', 'netContent', 'packType',
      'shade', 'texture', 'finish', 'spf', 'pa', 'skinTypes', 'scene',
      'keyIngredients', 'efficacy', 'fragrance', 'suitAge',
      'origin', 'manufacturer', 'shelfLife', 'batchNo', 'nmpaNo', 'isDutyFree',
      'originPrice', 'memberPrice', 'costPrice', 'stockWarn', 'salesChannel',
      'weightG', 'shipFrom', 'freightTpl', 'returnPolicy', 'isGift',
      'tags', 'recommendScore', 'shelfTime', 'updateTime', 'buyerShow'
    ];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (p[k] == null || p[k] === '') p[k] = base[k];
    }
    if (p.originPrice == null && p.price != null) p.originPrice = round2(Number(p.price) * 1.2);
    if (p.memberPrice == null && p.price != null) p.memberPrice = round2(Number(p.price) * 0.95);
    if (p.stockWarn == null) p.stockWarn = 50;
    if (!p.spec && p.netContent) p.spec = p.netContent;
    return p;
  }

  var api = {
    TARGET: 100,
    list: list,
    enrich: enrich,
    buildOne: buildOne
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.BeautyProductSeed = api;
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
