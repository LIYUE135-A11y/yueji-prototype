/**
 * 客服管理四表：从美妆种子写入 meilixiuxing
 *   chanpinjieda  产品解答
 *   dingdan       订单（客服视角）
 *   shouhou       售后
 *   quanyi        权益
 * 字段名 = 列表中文列名拼音首字母
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const BeautyProductSeed = require('../common/beauty-product-seed');
const BeautyOrderSeed = require('../common/beauty-order-seed');
const BeautyAftersaleSeed = require('../common/beauty-aftersale-seed');

function loadLists() {
  return {
    PRODUCT_LIST: BeautyProductSeed.list(),
    ORDER_LIST: BeautyOrderSeed.list(),
    AFTER_LIST: BeautyAftersaleSeed.list()
  };
}

function fmtPrice(n) {
  const v = Number(n);
  return isNaN(v) ? '0.00' : v.toFixed(2);
}

function inferProductIngredients(p) {
  if (!p || typeof p !== 'object') return '详见商品页成分表';
  const explicit = p.ingredients || p.ingredient || p.keyIng || p.keyIngredients;
  if (explicit && String(explicit).trim()) return String(explicit).trim();
  const name = String(p.name || p.title || '');
  const brand = String(p.brand || '');
  const cat = [p.cat3, p.cat2, p.cat1, name, brand].join(' ');
  const keys = [];
  function push(x) {
    if (!x || keys.indexOf(x) >= 0) return;
    keys.push(x);
  }
  if (/氨基酸/.test(name + cat)) push('氨基酸表活');
  if (/玻尿酸|透明质酸|水光/.test(name + cat)) push('玻尿酸');
  if (/神经酰胺|珂润|敏感肌友好/.test(name + brand + cat)) push('神经酰胺');
  if (/烟酰胺/.test(name)) push('烟酰胺');
  if (/视黄醇|A醇|抗初老/.test(name)) push('视黄醇类');
  if (/维\s*C|维生素C|CE\b|抗氧|维他命C/.test(name)) push('维C/抗氧');
  if (/龙血/.test(name)) push('龙血树提取物');
  if (/Pitera|神仙水|SK-?II|SK2/i.test(name + brand)) push('Pitera发酵精华');
  if (/小黑瓶|肌底|Genifique/i.test(name)) push('双歧发酵产物');
  if (/小棕瓶|修护精华/.test(name) && /雅诗兰黛|Estee/i.test(brand + name)) push('修护肽复合物');
  if (/色修|植萃|Phyto/i.test(name)) push('橄榄叶·桑根·黄瓜');
  if (/桃胶/.test(name)) push('桃胶·桃花蜜');
  if (/冰川/.test(name)) push('冰川矿泉水基质');
  if (/松露/.test(name)) push('黑金松露精萃');
  if (/大红瓶|RNA/i.test(name)) push('Pitera+胜肽');
  if (/前男友面膜|面膜/.test(name + cat) && /SK-?II/i.test(brand + name)) push('Pitera面膜精华');
  if (/控油|男士/.test(name) && /洁面|洗面/.test(cat)) push('控油洁净因子');
  if (/温和|不紧绷/.test(name)) push('温和低刺激');
  if (/洁面|洗面|洁颜/.test(cat) && keys.length < 2) push('洁面表活体系');
  if (/面霜|乳液|乳霜/.test(cat) && keys.length < 2) push('保湿乳化体系');
  if (/精华/.test(cat) && keys.length < 1) push('活性功效成分');
  if (/面膜/.test(cat) && keys.length < 1) push('补水膜布精粹');
  if (/粉底|气垫|CC/.test(cat) && keys.length < 1) push('成膜粉体·防晒剂');
  if (/口红|唇釉|唇膏/.test(cat) && keys.length < 1) push('成膜剂·色素');
  if (!keys.length) push('详见商品页成分表');
  if (keys.length < 8) {
    if (/洁面|洗面|洁颜/.test(name + cat)) {
      ['水', '甘油', '椰油酰基谷氨酸钠', '丁二醇', '甜菜碱', 'PCA钠', '苯氧乙醇', '柠檬酸'].forEach(push);
    } else if (/面膜/.test(name + cat)) {
      ['水', '甘油', '丁二醇', '甜菜碱', '透明质酸钠', '泛醇', '尿囊素', '苯氧乙醇', '黄原胶'].forEach(push);
    } else if (/面霜|乳液|乳霜/.test(name + cat)) {
      ['水', '甘油', '丁二醇', '角鲨烷', '鲸蜡硬脂醇', '生育酚乙酸酯', '透明质酸钠', '苯氧乙醇', '香精'].forEach(push);
    } else if (/精华|肌底|次抛|神仙水|小黑瓶/.test(name + cat)) {
      ['水', '丁二醇', '甘油', '烟酰胺', '透明质酸钠', '腺苷', '泛醇', '苯氧乙醇'].forEach(push);
    } else {
      ['水', '甘油', '丁二醇', '甜菜碱', '透明质酸钠', '泛醇', '苯氧乙醇', '香精'].forEach(push);
    }
  }
  if (/神仙水|Pitera|SK-?II/i.test(name + brand)) {
    push('半乳糖酵母样菌发酵产物滤液(PITERA)');
    push('乙基己基甘油');
  }
  if (/小黑瓶|Genifique|肌底/i.test(name)) {
    push('双歧发酵产物溶胞物');
    push('玫瑰提取物');
  }
  if (/龙血/.test(name)) {
    push('龙血树提取物');
    push('肉豆蔻酸');
    push('月桂酸');
  }
  if (/珂润|Curel|神经酰胺/.test(name + brand)) {
    push('神经酰胺NP');
    push('神经酰胺AP');
  }
  return keys.slice(0, 18).join('、') + '（示意成分，以包装备案全成分为准）';
}

function inferProductSkinType(p) {
  if (!p || typeof p !== 'object') return '多数肤质可；敏感肌先局部试用';
  const name = String(p.name || p.title || '');
  const brand = String(p.brand || '');
  const cat = [p.cat3, p.cat2, p.cat1, name, brand].join(' ');
  if (/敏感|舒敏|屏障|神经酰胺|珂润|Curel|友好/.test(name + brand + cat)) {
    return '敏感肌友好；干敏/屏障受损可；先耳后或下颌试用';
  }
  if (/控油|清爽|男士|油皮|祛痘|痘印/.test(name + cat)) {
    return '油皮/混油适宜；干皮注意补水，敏感肌慎用强功效款';
  }
  if (/滋润|修护|特润|菁纯|松露|龙血|大红瓶/.test(name)) {
    return '干皮/中性偏干适宜；油皮建议薄涂或夜间使用';
  }
  if (/口红|唇|唇釉|唇膏/.test(name + cat)) {
    return '多数唇况可；干唇建议先润唇再上妆';
  }
  if (/粉底|气垫|CC|遮瑕/.test(name + cat)) {
    return '按妆效选：干皮偏滋润款，油皮偏哑光/控油款；敏感肌选低刺激配方';
  }
  if (/防晒|SPF/.test(name + cat)) {
    return '日常通勤全肤质可；敏感肌选物理/温和配方并先试用';
  }
  if (/面膜/.test(name + cat)) {
    return '补水类多数肤质可；含酸/刷酸类敏感肌慎用、勿过夜';
  }
  if (/洁面|洗面|洁颜/.test(name + cat)) {
    return '氨基酸/温和款适合敏感与干皮；控油款更适油皮，避免过度清洁';
  }
  if (/眼霜|眼部/.test(name + cat)) {
    return '眼周干燥/初老可；眼周破皮或过敏期停用';
  }
  if (/精华|次抛|肌底|神仙水/.test(name + cat)) {
    return '多数肤质可按耐受使用；敏感肌降频、先局部试';
  }
  return '多数肤质可；敏感肌建议先局部试用，以自身耐受为准';
}

function inferProductUsageTips(p) {
  if (!p || typeof p !== 'object') return '按详情页用法使用；功效以详情为准';
  const name = String(p.name || p.title || '');
  const cat = [p.cat3, p.cat2, p.cat1, name].join(' ');
  if (/次抛/.test(name)) {
    return '洁面后取1支涂全脸，日1～2次；开封后尽快用完，勿留存过夜';
  }
  if (/口红|唇|唇釉|唇膏/.test(name + cat)) {
    return '直接涂或唇刷勾勒；干唇先润唇；可叠润唇膏增加滋润';
  }
  if (/面膜/.test(name + cat)) {
    return '洁面后敷10～15分钟取下，余液轻拍吸收；每周2～3次，勿过夜';
  }
  if (/洁面|洗面|洁颜/.test(name + cat)) {
    return '湿润面部取适量打圈按摩，清水洗净；日1～2次，避免过度揉搓';
  }
  if (/防晒|SPF/.test(name + cat)) {
    return '出门前15～20分钟涂匀；出汗或擦拭后补涂；卸妆需彻底';
  }
  if (/眼霜|眼部/.test(name + cat)) {
    return '护肤后取米粒量点涂眼周，轻拍至吸收；早晚可用，勿入眼';
  }
  if (/粉底|气垫|CC|遮瑕/.test(name + cat)) {
    return '护肤后取适量由内向外推开；局部可用美妆蛋叠遮；卸妆要干净';
  }
  if (/精华|肌底|神仙水/.test(name + cat)) {
    return '洁面→水/精华水→本品→乳霜；日1～2次，用量以吸收为准';
  }
  if (/面霜|乳液|乳霜/.test(name + cat)) {
    return '精华后取硬币大薄涂全脸；干皮可加量，油皮减量或仅夜间';
  }
  if (/爽肤水|化妆水|精华水|柔肤水|冰川/.test(name + cat)) {
    return '洁面后拍打或化妆棉湿敷；再叠精华与乳霜';
  }
  return '按详情页步骤使用；建议顺序：洁面→水→精华→乳霜；功效以详情为准';
}

function buildProductScript(p) {
  const cat = p.cat3 || p.cat2 || p.cat1 || '美妆';
  const brand = p.brand || '本品牌';
  const ingredients = inferProductIngredients(p);
  const skin = inferProductSkinType(p);
  const usage = inferProductUsageTips(p);
  const lines = [];
  let pos = '';
  if (/敏感|舒敏|屏障|修护|神经酰胺/.test([p.name, cat, brand].join(''))) pos = '主打屏障修护/舒缓';
  else if (/口红|唇|唇釉/.test([p.name, cat].join(''))) pos = '主打显色/妆效';
  else if (/补水|保湿|玻尿酸|水光/.test(p.name || '')) pos = '主打补水保湿';
  else if (/抗氧|维\s*C|CE\b|提亮/.test(p.name || '')) pos = '主打抗氧化/提亮';
  else if (/控油|清爽/.test(p.name || '')) pos = '主打清爽控油';
  else pos = '属「' + cat + '」护肤/美妆';
  lines.push('【' + (p.name || '商品') + '】' + pos + '。');
  lines.push('适用：' + skin + '。');
  lines.push('用法：' + usage + '。');
  lines.push(
    '成分答法：挑关键成分说明作用即可（' +
      String(ingredients).split('、').slice(0, 3).join('、') +
      '…）；全成分以包装备案为准。'
  );
  if (/敏感|舒敏|屏障|修护|神经酰胺|珂润/.test([p.name, cat, brand].join(''))) {
    lines.push('注意：避免与高浓度酸类同晚叠加；刺痛加重请停用并转售后。');
  } else if (/口红|唇|唇釉/.test([p.name, cat].join(''))) {
    lines.push('注意：色差以实拍与详情为准；可按显白/雾面/滋润需求推荐色号。');
  } else if (/视黄醇|A醇|抗初老/.test(p.name || '')) {
    lines.push('注意：循序渐进；孕期/哺乳期建议遵医嘱，客服不做医疗承诺。');
  } else {
    lines.push('注意：功效以详情页为准，不做医疗承诺；深度选款可转 AI 导购。');
  }
  lines.push('货号 ' + (p.id || p.sku || '—') + (p.merchant ? ' · 店铺 ' + p.merchant : '') + '。');
  return lines.join(' ');
}

function findProductForOrder(o, productList) {
  o = o || {};
  const list = Array.isArray(productList) ? productList : [];
  const sku = String(o.prodSku || o.sku || '').trim();
  const name = String(o.prodName || o.title || '').trim();
  let i;
  let p;
  if (sku) {
    for (i = 0; i < list.length; i++) {
      p = list[i];
      if (String(p.id || '') === sku || String(p.sku || '') === sku) return p;
    }
  }
  if (name) {
    for (i = 0; i < list.length; i++) {
      p = list[i];
      const pn = String(p.name || p.title || '');
      if (!pn) continue;
      if (pn === name || name.indexOf(pn) >= 0 || pn.indexOf(name.slice(0, 10)) >= 0) return p;
    }
  }
  return {
    name: name || '商品',
    brand: o.brand || '',
    cat1: o.cat1 || '',
    cat2: o.cat2 || '',
    cat3: o.cat3 || '',
    ingredients: o.ingredients || ''
  };
}

function buildOrderScript(o, productList) {
  const st = o.status || '';
  let tip = '';
  if (st === '待付款') tip = '提醒买家尽快完成支付；超时未付系统可能自动取消，可协助核对优惠是否仍可用。';
  else if (st === '待发货') tip = '安抚发货时效，同步仓库进度；急单可备注加急并核对收件信息。';
  else if (st === '已发货' || st === '待收货') tip = '提供物流公司与轨迹说明；异常签收引导拍照反馈并登记工单。';
  else if (st === '已完成') tip = '可引导评价/晒单；售后时效内说明退换货入口（我的→我的订单）。';
  else if (/退款/.test(st)) tip = '说明退款进度与到账渠道；金额以售后单为准，勿口头承诺额外赔付。';
  else if (st === '已取消') tip = '确认取消原因；若仍需购买可协助重新下单或匹配相似活动价。';
  else tip = '核对订单状态与物流后据实回复，无法确认时转人工主管。';
  const ingredients = inferProductIngredients(findProductForOrder(o, productList));
  return (
    '订单 ' +
    (o.id || '') +
    '，买家「' +
    (o.userName || '') +
    '」，商品「' +
    (o.prodName || '') +
    '」现为「' +
    st +
    '」。关键成分：' +
    ingredients +
    '。物流：' +
    (o.delivery || '—') +
    '/' +
    (o.deliveryStatus || '—') +
    '。' +
    tip
  );
}

function buildAftersaleScript(a) {
  const base =
    a.remark && String(a.remark).trim()
      ? String(a.remark).trim()
      : '售后类型「' + (a.afterType || '') + '」，原因「' + (a.reason || '') + '」，状态「' + (a.status || '') + '」。';
  const handler = a.handler ? '处理人：' + a.handler + '。' : '待分配处理人。';
  return base + (/\。$/.test(base) ? '' : '。') + handler;
}

function mapBenefitType(o) {
  const act = String(o.activityType || '');
  if (/会员|省钱卡|超级会员/.test(act) || /会员/.test(o.orderGroup || '')) return '会员折扣';
  if (/券|优惠券|消费券/.test(act)) return '优惠券';
  if (/百亿|补贴|官方立减/.test(act)) return '平台补贴';
  if (/拼团|拼单|二人团|多人团/.test(act)) return '拼团优惠';
  if (/秒杀|限时/.test(act)) return '限时秒杀';
  if (/满减|满赠|买赠/.test(act)) return '满减满赠';
  if (/新人|首单|新客/.test(act)) return '新人权益';
  if (/包邮|免运费/.test(act)) return '包邮服务';
  if (/价保|贵就赔/.test(act)) return '价保补偿';
  if (Number(o.discountPrice) > 0) return '价保补偿';
  return '';
}

function buildBenefitRuleMeta(benefitType) {
  const t = String(benefitType || '');
  const map = {
    新人权益: { rule: '限新注册账号（手机号/设备）；含新人礼/首单礼/新客价', stack: '通常不可与其他新客专享重复领用' },
    优惠券: { rule: '满足门槛与适用商品/店铺后方可抵扣', stack: '平台券与店铺券能否叠加以结算页为准' },
    满减满赠: { rule: '按结算页实时门槛计算；凑单后可能不再满足', stack: '一般不可与互斥活动同享；赠品赠完即止' },
    拼团优惠: { rule: '限时成团才享拼团价；未成团按规则退款或转单买', stack: '拼团价通常限制与大额券叠加' },
    限时秒杀: { rule: '限时限量先到先得；未支付超时释放库存', stack: '秒杀款多限制优惠叠加，以结算页为准' },
    平台补贴: { rule: '商品页已体现补贴价，下单自动减免；名额用完恢复原价', stack: '可能限制与部分券叠加，勿口头追加补贴' },
    积分兑换: { rule: '积分在会员中心兑换券/试用装，过期不补', stack: '兑换所得券按券面规则使用，客服勿口头加分' },
    会员折扣: { rule: '按下单时会员等级/省钱卡状态计折；升级一般对新单生效', stack: '与普通券叠加规则以结算页为准；已付单不回溯' },
    价保补偿: { rule: '约定时效内、同规格同店铺活动价可申请差价', stack: '特殊券/尾货清仓等可能不支持价保' },
    七天无理由: { rule: '签收后7天内、商品完好可退；贴身/开封类以商详为准', stack: '与运费险等保障可并存；质量问题走售后优先' },
    极速退款: { rule: '符合信用/未发货等条件可快速原路退', stack: '不满足时按普通售后时效，勿承诺秒到账' },
    运费险: { rule: '退货寄回后按保额理赔运费；可能低于实付快递费', stack: '无运费险时运费由责任方承担' },
    坏单包赔: { rule: '破损/少件/错发请48小时内拍照留证申请售后', stack: '核实后可补发或退款；轻微压痕按完好标准解释' },
    晚发即赔: { rule: '承诺时效内未发货可申请补偿（金额以服务页为准）', stack: '已发仅派送延误属物流问题，不计入晚发即赔' },
    正品保障: { rule: '支持正品保障；质疑真伪保留包装凭证走鉴定', stack: '未鉴定前勿口头认定真伪；假货按公示规则赔付' },
    包邮服务: { rule: '以商品页/结算页为准；可能有满额门槛或偏远除外', stack: '改址/拆单/部分退可能补运费' }
  };
  return map[t] || { rule: '以活动页与结算页规则为准', stack: '是否可与其他优惠叠加以结算页可选项为准' };
}

function buildBenefitScript(row) {
  if (row.kind === 'faq') return row.script;
  const meta = buildBenefitRuleMeta(row.benefitType);
  return (
    '用户「' +
    row.user +
    '」在订单 ' +
    row.refId +
    ' 享受「' +
    row.benefitType +
    '」' +
    (Number(row.amount) > 0 ? '，优惠 ¥' + fmtPrice(row.amount) : '') +
    '。使用规则：' +
    meta.rule +
    '。叠加：' +
    meta.stack +
    '。答复时核对活动有效期与账户明细；积分/券到账以「我的→卡券/会员中心」为准。关联：' +
    (row.content || '—') +
    '。'
  );
}

function collectBenefitRows(orders) {
  const rows = [];
  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    let bt = mapBenefitType(o);
    if (!bt && !(Number(o.discountPrice) > 0)) continue;
    if (!bt) bt = '价保补偿';
    const meta = buildBenefitRuleMeta(bt);
    rows.push({
      id: 'BEN-' + (o.id || i),
      kind: 'order',
      benefitType: bt,
      user: o.userName || '—',
      refId: o.id || '—',
      content: (o.activityType || '优惠') + ' · ' + (o.prodName || ''),
      amount: o.discountPrice || 0,
      rule: meta.rule,
      stack: meta.stack,
      script: ''
    });
  }
  /* 权益说明 FAQ：参考拼多多用户常见保障与优惠权益 */
  const faqs = [
    {
      id: 'BEN-FAQ-01',
      kind: 'faq',
      benefitType: '新人权益',
      user: '—',
      refId: '权益说明',
      content: '新人礼 / 首单礼 / 新客专享价',
      amount: 0,
      script:
        '新人权益限符合条件的新注册账号（通常按手机号/设备判定）；含新人礼包、首单礼或新客专享价。若提示「已享过权益」，核对是否重复注册，勿人工重复发放。'
    },
    {
      id: 'BEN-FAQ-02',
      kind: 'faq',
      benefitType: '优惠券',
      user: '—',
      refId: '权益说明',
      content: '平台券 / 店铺券使用规则',
      amount: 0,
      script:
        '券需满足使用门槛与适用商品/店铺范围；平台券与店铺券能否叠加以结算页可选项为准。未到账先查「我的→卡券」领取记录与站内信，仍异常登记工单排查。'
    },
    {
      id: 'BEN-FAQ-03',
      kind: 'faq',
      benefitType: '满减满赠',
      user: '—',
      refId: '权益说明',
      content: '满减 / 满赠 / 买赠活动',
      amount: 0,
      script:
        '满减满赠按结算页实时门槛计算，凑单后金额变化可能导致不再满足；赠品以活动页标注为准，赠完即止。已支付订单一般不补发漏赠以外的额外赠品。'
    },
    {
      id: 'BEN-FAQ-04',
      kind: 'faq',
      benefitType: '拼团优惠',
      user: '—',
      refId: '权益说明',
      content: '拼团价 / 多人团优惠',
      amount: 0,
      script:
        '拼团需在规定时间内成团才享拼团价；未成团订单按规则自动退款或转单买价（以活动说明为准）。勿承诺线下改价成团，引导用户在 App 内邀请好友拼单。'
    },
    {
      id: 'BEN-FAQ-05',
      kind: 'faq',
      benefitType: '限时秒杀',
      user: '—',
      refId: '权益说明',
      content: '限时秒杀 / 整点抢购',
      amount: 0,
      script:
        '秒杀价库存有限、先到先得；下单未支付超时会释放库存。秒杀商品通常限制优惠叠加，以结算页为准。抢不到属正常库存竞争，可关注下一场或相似在售款。'
    },
    {
      id: 'BEN-FAQ-06',
      kind: 'faq',
      benefitType: '平台补贴',
      user: '—',
      refId: '权益说明',
      content: '官方立减 / 平台补贴价',
      amount: 0,
      script:
        '平台补贴价已在商品页体现，下单时自动减免；补贴库存或名额用完后价格恢复。补贴商品可能限制与部分券叠加，客服勿口头追加补贴金额。'
    },
    {
      id: 'BEN-FAQ-07',
      kind: 'faq',
      benefitType: '积分兑换',
      user: '—',
      refId: '权益说明',
      content: '积分兑换优惠券 / 试用装',
      amount: 0,
      script:
        '积分可在「我的→会员中心」查看与兑换；兑换券/试用装到账后请在有效期内使用，过期不补。客服勿口头加分，到账异常登记工单核查。'
    },
    {
      id: 'BEN-FAQ-08',
      kind: 'faq',
      benefitType: '会员折扣',
      user: '—',
      refId: '权益说明',
      content: '会员等级折扣 / 省钱卡',
      amount: 0,
      script:
        '会员折扣按下单时等级或省钱卡状态计算，升级后一般对新单生效；已支付订单不回溯补差，除非活动明确支持价保。会员专享价与普通券叠加规则以结算页为准。'
    },
    {
      id: 'BEN-FAQ-09',
      kind: 'faq',
      benefitType: '价保补偿',
      user: '—',
      refId: '权益说明',
      content: '买贵必赔 / 活动价保',
      amount: 0,
      script:
        '价保需在约定时效内申请，且商品为同规格同店铺活动价；已用特殊券/尾货清仓等可能不支持。核对价保规则后可按差价退回原支付方式，勿口头承诺超规则赔付。'
    },
    {
      id: 'BEN-FAQ-10',
      kind: 'faq',
      benefitType: '七天无理由',
      user: '—',
      refId: '权益说明',
      content: '7天无理由退货',
      amount: 0,
      script:
        '支持签收后7天内无理由退货（商品完好、不影响二次销售）；贴身/开封试用类以商品页说明为准。引导用户在「订单→申请售后」提交，客服勿跳过审核直接承诺必退。'
    },
    {
      id: 'BEN-FAQ-11',
      kind: 'faq',
      benefitType: '极速退款',
      user: '—',
      refId: '权益说明',
      content: '极速退款 / 秒退',
      amount: 0,
      script:
        '符合极速退款条件的订单（如未发货取消、或命中信用极速退规则）可快速原路退回。不满足条件时按普通售后时效处理，向用户说明审核与退款到账周期（一般1–7个工作日）。'
    },
    {
      id: 'BEN-FAQ-12',
      kind: 'faq',
      benefitType: '运费险',
      user: '—',
      refId: '权益说明',
      content: '退货运费险 / 运费补贴',
      amount: 0,
      script:
        '购买或赠送运费险的订单，退货寄回后可按保额理赔运费；理赔金额以保单规则为准，可能低于实付快递费。无运费险时退货运费一般由责任方承担（质量问题商家、无理由买家）。'
    },
    {
      id: 'BEN-FAQ-13',
      kind: 'faq',
      benefitType: '坏单包赔',
      user: '—',
      refId: '权益说明',
      content: '破损坏单包赔 / 少件补发',
      amount: 0,
      script:
        '收货发现破损、少件、错发，请引导用户48小时内拍照留证并申请售后。核实属实可补发或退款；外包装轻微压痕不影响使用的，按商品完好标准解释，避免过度承诺。'
    },
    {
      id: 'BEN-FAQ-14',
      kind: 'faq',
      benefitType: '晚发即赔',
      user: '—',
      refId: '权益说明',
      content: '超时发货补偿',
      amount: 0,
      script:
        '承诺时效内未发货可申请晚发补偿（具体金额以活动/服务页为准）。先核对订单发货截止时间与物流揽收记录；已发货仅延迟派送的，引导查询物流或联系承运商，不属于晚发即赔。'
    },
    {
      id: 'BEN-FAQ-15',
      kind: 'faq',
      benefitType: '正品保障',
      user: '—',
      refId: '权益说明',
      content: '正品保障 / 假一赔十',
      amount: 0,
      script:
        '平台售卖正品，支持正品保障服务。用户质疑真伪时，引导保留包装与凭证，走售后鉴定流程；核实假货按规则赔付（如假一赔十以页面公示为准）。勿在未鉴定前口头认定真伪。'
    },
    {
      id: 'BEN-FAQ-16',
      kind: 'faq',
      benefitType: '包邮服务',
      user: '—',
      refId: '权益说明',
      content: '包邮 / 满额包邮',
      amount: 0,
      script:
        '包邮以商品页与结算页展示为准（可能有满额包邮门槛或偏远地区除外）。改地址、拆单、部分退货可能导致补运费，下单前请用户确认收货地址与包邮条件。'
    }
  ];
  return rows.concat(faqs).map(function (r) {
    const meta = buildBenefitRuleMeta(r.benefitType);
    if (!r.rule) r.rule = meta.rule;
    if (!r.stack) r.stack = meta.stack;
    r.script = r.script || buildBenefitScript(r);
    return r;
  });
}

async function seedChanpinjieda(conn, list) {
  await conn.query('DROP TABLE IF EXISTS chanpinjieda');
  await conn.query(`
    CREATE TABLE chanpinjieda (
      hh      VARCHAR(64)  NOT NULL COMMENT '货号',
      sp      VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品',
      pp      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '品牌',
      pl      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '品类',
      syfz    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '适用肤质',
      yfyd    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '用法要点',
      gjcf    TEXT NOT NULL COMMENT '关键成分',
      kfjeyd  TEXT NOT NULL COMMENT '客服解答要点',
      PRIMARY KEY (hh)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服管理·产品解答'
  `);
  const sql =
    'INSERT INTO chanpinjieda (hh,sp,pp,pl,syfz,yfyd,gjcf,kfjeyd) VALUES (?,?,?,?,?,?,?,?)';
  for (const p of list) {
    const hh = String(p.id || p.sku || '').trim();
    if (!hh) continue;
    await conn.query(sql, [
      hh,
      p.name || '',
      p.brand || '',
      p.cat3 || p.cat2 || p.cat1 || '',
      inferProductSkinType(p),
      inferProductUsageTips(p),
      inferProductIngredients(p),
      buildProductScript(p)
    ]);
  }
  return list.length;
}

async function seedDingdan(conn, list, productList) {
  await conn.query('DROP TABLE IF EXISTS dingdan');
  await conn.query(`
    CREATE TABLE dingdan (
      ddh     VARCHAR(64)  NOT NULL COMMENT '订单号',
      mj      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '买家',
      sp      VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品',
      sf      DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '实付',
      ddzt    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '订单状态',
      wl      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '物流',
      kfgjhs  TEXT NOT NULL COMMENT '客服跟进话术',
      PRIMARY KEY (ddh)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服管理·订单'
  `);
  const sql =
    'INSERT INTO dingdan (ddh,mj,sp,sf,ddzt,wl,kfgjhs) VALUES (?,?,?,?,?,?,?)';
  for (const o of list) {
    const ddh = String(o.id || '').trim();
    if (!ddh) continue;
    const sf = o.payAmount != null ? o.payAmount : o.orderAmount;
    await conn.query(sql, [
      ddh,
      o.userName || '',
      o.prodName || '',
      Number(sf) || 0,
      o.status || '',
      o.deliveryStatus || o.delivery || '',
      buildOrderScript(o, productList)
    ]);
  }
  return list.length;
}

async function seedShouhou(conn, list) {
  await conn.query('DROP TABLE IF EXISTS shouhou');
  await conn.query(`
    CREATE TABLE shouhou (
      shdh    VARCHAR(64)  NOT NULL COMMENT '售后单号',
      ddh     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '订单号',
      lx      VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '类型',
      mj      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '买家',
      sp      VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品',
      zt      VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '状态',
      clr     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '处理人',
      kfcljy  TEXT NOT NULL COMMENT '客服处理纪要',
      PRIMARY KEY (shdh)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服管理·售后'
  `);
  const sql =
    'INSERT INTO shouhou (shdh,ddh,lx,mj,sp,zt,clr,kfcljy) VALUES (?,?,?,?,?,?,?,?)';
  for (const a of list) {
    const shdh = String(a.id || '').trim();
    if (!shdh) continue;
    await conn.query(sql, [
      shdh,
      a.orderId || '',
      a.afterType || '',
      a.userName || '',
      a.prodName || '',
      a.status || '',
      a.handler || '',
      buildAftersaleScript(a)
    ]);
  }
  return list.length;
}

async function seedQuanyi(conn, rows) {
  await conn.query('DROP TABLE IF EXISTS quanyi');
  await conn.query(`
    CREATE TABLE quanyi (
      qyid    VARCHAR(64)  NOT NULL COMMENT '权益行ID',
      qylx    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '权益类型',
      yh      VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '用户',
      gldh    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '关联单号',
      glnr    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '关联内容',
      yhje    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '优惠金额',
      sygz    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '使用规则',
      djsm    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '叠加说明',
      kfdyd   TEXT NOT NULL COMMENT '客服答复要点',
      PRIMARY KEY (qyid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服管理·权益'
  `);
  const sql =
    'INSERT INTO quanyi (qyid,qylx,yh,gldh,glnr,yhje,sygz,djsm,kfdyd) VALUES (?,?,?,?,?,?,?,?,?)';
  for (const r of rows) {
    await conn.query(sql, [
      r.id,
      r.benefitType || '',
      r.user || '',
      r.refId || '',
      r.content || '',
      Number(r.amount) || 0,
      r.rule || '',
      r.stack || '',
      r.script || ''
    ]);
  }
  return rows.length;
}

async function main() {
  console.log('从 beauty-*-seed 加载客服管理数据源 ...');
  const lists = loadLists();
  const benefits = collectBenefitRows(lists.ORDER_LIST);
  console.log(
    '产品',
    lists.PRODUCT_LIST.length,
    '· 订单',
    lists.ORDER_LIST.length,
    '· 售后',
    lists.AFTER_LIST.length,
    '· 权益',
    benefits.length
  );

  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset: 'utf8mb4'
  });

  const counts = {};
  counts.chanpinjieda = await seedChanpinjieda(conn, lists.PRODUCT_LIST);
  counts.dingdan = await seedDingdan(conn, lists.ORDER_LIST, lists.PRODUCT_LIST);
  counts.shouhou = await seedShouhou(conn, lists.AFTER_LIST);
  counts.quanyi = await seedQuanyi(conn, benefits);

  console.log('写入完成:');
  for (const [t, n] of Object.entries(counts)) {
    const [rows] = await conn.query('SELECT COUNT(*) AS c FROM `' + t + '`');
    console.log('  ' + t + ': ' + n + ' 条 (库内 ' + rows[0].c + ')');
  }
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
