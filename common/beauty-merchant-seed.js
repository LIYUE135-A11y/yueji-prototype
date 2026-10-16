/**
 * 美妆商家种子 · 100 条（运营商家管理 / 数据中心商家数据）
 */
(function (global) {
  var TYPES = [
    { type: '旗舰店', typeKey: 'flagship' },
    { type: '专营店', typeKey: 'franchise' },
    { type: '专卖店', typeKey: 'exclusive' },
    { type: '普通店铺', typeKey: 'normal' },
    { type: '个人店', typeKey: 'personal' }
  ];
  var CATS = ['护肤美妆', '彩妆香水', '个护清洁', '母婴用品', '食品保健', '家居生活', '综合百货'];
  var LEVELS = ['战略合作', '金牌商家', '银牌商家', '普通商家', '观察期'];
  var SETTLES = ['日结', '周结', '半月结', '月结', '季结'];
  var CERTS = ['无', '正品保障', '品牌授权', '跨境备案', '有机认证', '敏感肌友好认证'];
  var AUDITS = [
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '审核通过', auditKey: 'pass' },
    { auditStatus: '待审核', auditKey: 'pending' },
    { auditStatus: '审核未通过', auditKey: 'fail' },
    { auditStatus: '已驳回', auditKey: 'reject' }
  ];
  var OPENS = [
    { openStatus: '营业中', openKey: 'open' },
    { openStatus: '营业中', openKey: 'open' },
    { openStatus: '营业中', openKey: 'open' },
    { openStatus: '休息中', openKey: 'rest' },
    { openStatus: '已冻结', openKey: 'frozen' },
    { openStatus: '已关闭', openKey: 'closed' }
  ];
  var REGS = [
    { province: '上海市', city: '上海市', district: '浦东新区', region: '上海' },
    { province: '浙江省', city: '杭州市', district: '西湖区', region: '杭州' },
    { province: '广东省', city: '广州市', district: '天河区', region: '广州' },
    { province: '广东省', city: '深圳市', district: '南山区', region: '深圳' },
    { province: '北京市', city: '北京市', district: '朝阳区', region: '北京' },
    { province: '四川省', city: '成都市', district: '锦江区', region: '成都' },
    { province: '江苏省', city: '苏州市', district: '工业园区', region: '苏州' },
    { province: '江苏省', city: '南京市', district: '建邺区', region: '南京' },
    { province: '湖北省', city: '武汉市', district: '江汉区', region: '武汉' },
    { province: '陕西省', city: '西安市', district: '雁塔区', region: '西安' },
    { province: '重庆市', city: '重庆市', district: '渝中区', region: '重庆' },
    { province: '湖南省', city: '长沙市', district: '雨花区', region: '长沙' }
  ];
  var ADDR_TAIL = [
    '创新大厦A座1201', '东方通信大厦18楼', '高德置地秋广场1505', '威盛科技大厦20楼',
    'SOHO现代城A座2808', '银石广场17楼', '恒宇广场3期22层', '金鹰世界A座21楼',
    '越洋广场36楼', '阿里巴巴西溪园区B区8号楼', '瑞安广场22楼', '王府中环西座15楼'
  ];
  var NAMES_BASE = [
    '阅己美妆旗舰店', '优品美妆专营店', '花语甄选店', '海蓝精选', '丽人全球购',
    '兰蔻官方授权店', '完美日记品牌店', '自然堂生活美学馆', 'SK-II奢享汇', '花西子国风旗舰店',
    '欧莱雅集团官方店', '修丽可官方旗舰店', '珂润敏感肌护理店', '妈咪宝贝孕婴童世界', '康恩贝健康食品专营',
    '山城优选小铺', '丝域家居美学馆', '舒肤佳家清官方店', '糖糖的美妆小铺', '雅诗兰黛集团官方店'
  ];
  var NAME_EXTRA = [
    '薇诺娜舒敏旗舰店', 'OLAY玉兰油官方店', '可复美修护专营', 'HEY:REAL成分店', 'FENTY美妆旗舰',
    '资生堂日系专柜', '迪奥香氛精选', '香奈儿彩妆集合店', '巴黎欧莱雅超市店', '润百颜玻尿酸馆',
    '珀莱雅国货旗舰', '夸迪次抛精华店', '华熙生物官方', '谷雨敏感肌店', '逐本清欢卸妆店',
    '橘朵平价彩妆店', 'INTO YOU唇泥馆', '花知晓童话店', '半亩花田身体护理', '且初洗护专营',
    '科颜氏科系店', '倩碧黄油专柜', '悦木之源菌菇水店', '植村秀卸妆油店', 'MAC魅可彩妆店',
    'YSL圣罗兰唇妆店', '阿玛尼气垫旗舰', '纪梵希散粉店', '贝德玛卸妆水店', '理肤泉敏感护理店'
  ];
  var LEGALS = '张明李思远王花花陈海蓝刘丽丽赵雅芝黄景瑜孙自然周诗诗吴西子林振华韩医生佐藤美咲吴妈康健钱山城苏菲冯宝洁糖糖沈雅兰'.split('');
  var CONTACTS = ['张经理', '李主管', '王店长', '陈女士', '刘小姐', '赵经理', '黄总监', '孙店长', '周经理', '吴CEO'];

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }
  function pick(arr, i) { return arr[i % arr.length]; }
  function round2(n) { return Math.round(n * 100) / 100; }

  function buildOne(i) {
    var n = i + 1;
    var id = 'SJ2024' + pad2(Math.floor((n - 1) / 31) + 1) + pad2(((n - 1) % 31) + 1);
    if (n <= 20) id = 'SJ202401' + pad2(n);
    var _pool = NAMES_BASE.concat(NAME_EXTRA);
    var name = _pool[i % _pool.length];
    if (i >= _pool.length) name = _pool[i % _pool.length].replace(/(旗舰店|专营店|专卖店|官方店|品牌店|集合店|小铺|馆)$/, '') + '优选店' + (i - _pool.length + 1);
    var t = pick(TYPES, i);
    var a = pick(AUDITS, i);
    var o = pick(OPENS, i + 2);
    if (a.auditKey !== 'pass' && o.openKey === 'open') {
      o = { openStatus: '休息中', openKey: 'rest' };
    }
    var reg = pick(REGS, i);
    var cat = pick(CATS, i);
    var level = pick(LEVELS, i);
    var settle = pick(SETTLES, i);
    var cert = pick(CERTS, i);
    var legal = pick(LEGALS, i) + (i % 3 === 0 ? '华' : '');
    var contact = pick(CONTACTS, i);
    var phone = '1' + String(3 + (i % 6)) + String(100000000 + ((i * 7919) % 89999999)).slice(0, 8);
    phone = phone.slice(0, 3) + '****' + phone.slice(7);
    var email = 'shop' + n + '@meili-beauty.cn';
    /* 入驻日相对今天散落在约 0–700 天前，便于老店/新店与时段统计 */
    var daysAgo = (i * 37 + (i % 5) * 11) % 700;
    var joinDate = new Date();
    joinDate.setHours(12, 0, 0, 0);
    joinDate.setDate(joinDate.getDate() - daysAgo);
    var joinTime = joinDate.getFullYear() + '-' + pad2(joinDate.getMonth() + 1) + '-' + pad2(joinDate.getDate());
    var productCount = 40 + ((i * 97) % 1400);
    var orderCount = 200 + ((i * 131) % 98000);
    var gmv = round2(orderCount * (80 + (i % 50) * 12));
    var score = round2(3.6 + ((i * 17) % 140) / 100);
    var shortName = name.replace(/旗舰店|专营店|专卖店|官方店|品牌店|集合店|小铺|世界|专营|馆$/g, '').slice(0, 8) || name.slice(0, 6);
    var address = reg.city + reg.district + pick(ADDR_TAIL, i);
    var licenseNo = '91' + String(10000000000000000 + i * 137).slice(0, 16);
    var foodLicense = /母婴|食品/.test(cat) ? ('JY' + String(31000000000000 + i * 53).slice(0, 14)) : '';
    var importNo = /全球|跨境|FENTY|迪奥|香奈儿|纪梵希|阿玛尼|YSL|MAC|科颜氏|倩碧/.test(name) ? ('JK' + (2024000 + i)) : '';
    var brandCount = 1 + (i % 18);
    var followerCount = 500 + ((i * 211) % 200000);
    var complaintCount = (i % 7);
    var returnRate = round2(0.5 + ((i * 13) % 80) / 10);
    var shipHours = 12 + (i % 5) * 12;
    var serviceScore = round2(4 + ((i * 7) % 100) / 100);
    var logisticsScore = round2(4 + ((i * 11) % 100) / 100);
    var bankName = pick(['招商银行', '工商银行', '建设银行', '支付宝企业', '微信支付商户'], i);
    var bankAccount = '6222****' + String(1000 + i).slice(-4);
    var desc = shortName + '专注' + cat + '，' + level + '·' + settle + '结算';
    var logoPrompt = name + ' beauty cosmetics boutique storefront logo premium';

    return {
      id: id,
      name: name,
      shortName: shortName,
      type: t.type,
      typeKey: t.typeKey,
      legal: legal,
      contact: contact,
      phone: phone,
      email: email,
      category: cat,
      province: reg.province,
      city: reg.city,
      district: reg.district,
      region: reg.region,
      address: address,
      joinTime: joinTime,
      auditStatus: a.auditStatus,
      auditKey: a.auditKey,
      openStatus: o.openStatus,
      openKey: o.openKey,
      cooperateLevel: level,
      settleMethod: settle,
      licenseNo: licenseNo,
      foodLicense: foodLicense,
      importNo: importNo,
      cert: cert,
      brandCount: brandCount,
      followerCount: followerCount,
      complaintCount: complaintCount,
      returnRate: returnRate,
      shipHours: shipHours,
      serviceScore: serviceScore,
      logisticsScore: logisticsScore,
      bankName: bankName,
      bankAccount: bankAccount,
      description: desc,
      remark: a.auditKey === 'pending' ? '新入驻商家，待完成资质审核' : (a.auditKey === 'fail' || a.auditKey === 'reject' ? '资质材料待补全' : ''),
      logo: '',
      logoPrompt: logoPrompt,
      productCount: productCount,
      orderCount: orderCount,
      gmv: gmv,
      score: score,
      source: 'ops-seed'
    };
  }

  function list() {
    var out = [];
    for (var i = 0; i < 100; i++) out.push(buildOne(i));
    return out;
  }

  function enrich(m, idx) {
    if (!m) return m;
    idx = idx || 0;
    var base = buildOne(idx % 100);
    var keys = [
      'shortName', 'email', 'province', 'city', 'district', 'cooperateLevel', 'settleMethod',
      'licenseNo', 'foodLicense', 'importNo', 'cert', 'brandCount', 'followerCount',
      'complaintCount', 'returnRate', 'shipHours', 'serviceScore', 'logisticsScore',
      'bankName', 'bankAccount', 'description', 'logoPrompt'
    ];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (m[k] == null || m[k] === '') m[k] = base[k];
    }
    /* 旧种子固定 2024 入驻日 → 换成相对今天的日期，便于老店/新店统计 */
    if (!m.joinTime || /^2024-/.test(String(m.joinTime))) m.joinTime = base.joinTime;
    if (!m.region) m.region = m.city || m.province || base.region;
    if (m.score == null) m.score = base.score;
    return m;
  }

  var api = { TARGET: 100, count: 100, list: list, enrich: enrich, buildOne: buildOne };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BeautyMerchantSeed = api;
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
