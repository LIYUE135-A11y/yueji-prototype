/**
 * 写入 100 条美妆活动到：
 * 1) app_store.zhuangyan_activity_list_v2（运营 / App 同步；兼容写 v1）
 * 2) hdgl 表（活动管理结构化表，字段=中文列名拼音首字母）
 *
 * 用法：cd server && npm run seed:activities
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const BeautyActivitySeed = require('../common/beauty-activity-seed');

const STORE_KEY = 'zhuangyan_activity_list_v2';
const STORE_KEY_LEGACY = 'zhuangyan_activity_list_v1';

async function seedHdgl(conn, list) {
  await conn.query(`DROP TABLE IF EXISTS hdgl`);
  await conn.query(`
    CREATE TABLE hdgl (
      hdid   VARCHAR(32)  NOT NULL COMMENT '活动ID',
      hdlx   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '活动类型',
      hdlxk  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '类型key',
      hdmc   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '活动名称',
      fbt    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '副标题',
      hdzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '活动状态',
      hdztk  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '状态key',
      shzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核状态',
      shztk  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核key',
      yxj    VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '优先级',
      bq     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '标签',
      syysp  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '适用商品',
      syyyh  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '适用用户',
      plfw   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '品类范围',
      pp     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '品牌',
      sjmc   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '商家名称',
      sjid   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '商家ID',
      kssj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '开始时间',
      jssj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '结束时间',
      yrks   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '预热开始',
      yrjs   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '预热结束',
      hdzk   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '活动折扣',
      mkje   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '门槛金额',
      jmje   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '减免金额',
      zkl    DECIMAL(8,2)  NOT NULL DEFAULT 0 COMMENT '折扣力度',
      zgyh   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '最高优惠',
      cj     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '场景',
      qd     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '渠道',
      czfs   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '出资方式',
      ys     DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '预算',
      ptbt   DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '平台补贴',
      sjbt   DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '商家补贴',
      qy     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '区域',
      csxz   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '城市限制',
      nlxz   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '年龄限制',
      xbxz   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '性别限制',
      kdq    TINYINT NOT NULL DEFAULT 0 COMMENT '可叠券',
      hyzx   TINYINT NOT NULL DEFAULT 0 COMMENT '会员专享',
      hcgz   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '互斥规则',
      qm     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '券码',
      qmje   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '券面额',
      qmmk   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '券门槛',
      qmyxts INT NOT NULL DEFAULT 0 COMMENT '券有效天数',
      zpmc   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '赠品名称',
      zpsku  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '赠品SKU',
      zpkc   INT NOT NULL DEFAULT 0 COMMENT '赠品库存',
      ctrs   INT NOT NULL DEFAULT 0 COMMENT '成团人数',
      ctsx   INT NOT NULL DEFAULT 0 COMMENT '成团时限小时',
      ptj    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '拼团价',
      msj    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '秒杀价',
      mskc   INT NOT NULL DEFAULT 0 COMMENT '秒杀库存',
      mskqsj VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '秒杀开抢时间',
      xgsl   INT NOT NULL DEFAULT 0 COMMENT '限购数量',
      lqsx   INT NOT NULL DEFAULT 0 COMMENT '领取上限',
      rx     INT NOT NULL DEFAULT 0 COMMENT '日限',
      zpe    INT NOT NULL DEFAULT 0 COMMENT '总配额',
      yype   INT NOT NULL DEFAULT 0 COMMENT '已用配额',
      sype   INT NOT NULL DEFAULT 0 COMMENT '剩余配额',
      kc     INT NOT NULL DEFAULT 0 COMMENT '库存',
      lll    INT NOT NULL DEFAULT 0 COMMENT '浏览量',
      cyrs   INT NOT NULL DEFAULT 0 COMMENT '参与人数',
      dds    INT NOT NULL DEFAULT 0 COMMENT '订单数',
      zfs    INT NOT NULL DEFAULT 0 COMMENT '支付数',
      djl    VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '点击率',
      zhl    VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '转化率',
      fxs    INT NOT NULL DEFAULT 0 COMMENT '分享数',
      scs    INT NOT NULL DEFAULT 0 COMMENT '收藏数',
      tks    INT NOT NULL DEFAULT 0 COMMENT '退款数',
      tkl    VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '退款率',
      jye    DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '交易额',
      sfe    DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '实付额',
      kdj    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '客单价',
      cb     DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '成本',
      ml     DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '毛利',
      roi    DECIMAL(8,2)  NOT NULL DEFAULT 0 COMMENT 'ROI',
      fxdj   VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '风险等级',
      gldc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '关联大促',
      fzr    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '负责人',
      bm     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '部门',
      cjr    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '创建人',
      cjsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '创建时间',
      gxsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '更新时间',
      fbsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布时间',
      shr    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '审核人',
      shsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核时间',
      shbz   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '审核备注',
      cdfs   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '触达方式',
      ldy    VARCHAR(255) NOT NULL DEFAULT '' COMMENT '落地页',
      fxbt   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '分享标题',
      fxms   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '分享描述',
      hdsm   TEXT COMMENT '活动说明',
      gzsm   TEXT COMMENT '规则说明',
      bmd    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '白名单',
      hmd    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '黑名单',
      kgzt   TINYINT NOT NULL DEFAULT 1 COMMENT '开关状态',
      bz     VARCHAR(512) NOT NULL DEFAULT '' COMMENT '备注',
      px     INT NOT NULL DEFAULT 0 COMMENT '排序',
      seed_ver VARCHAR(32) NOT NULL DEFAULT '' COMMENT '种子版本',
      PRIMARY KEY (hdid),
      KEY idx_hdlxk (hdlxk),
      KEY idx_hdztk (hdztk),
      KEY idx_shztk (shztk)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动管理'
  `);

  const cols = [
    'hdid','hdlx','hdlxk','hdmc','fbt','hdzt','hdztk','shzt','shztk','yxj','bq',
    'syysp','syyyh','plfw','pp','sjmc','sjid','kssj','jssj','yrks','yrjs','hdzk',
    'mkje','jmje','zkl','zgyh','cj','qd','czfs','ys','ptbt','sjbt','qy','csxz','nlxz','xbxz',
    'kdq','hyzx','hcgz','qm','qmje','qmmk','qmyxts','zpmc','zpsku','zpkc',
    'ctrs','ctsx','ptj','msj','mskc','mskqsj','xgsl','lqsx','rx','zpe','yype','sype','kc',
    'lll','cyrs','dds','zfs','djl','zhl','fxs','scs','tks','tkl','jye','sfe','kdj','cb','ml','roi',
    'fxdj','gldc','fzr','bm','cjr','cjsj','gxsj','fbsj','shr','shsj','shbz','cdfs','ldy','fxbt','fxms',
    'hdsm','gzsm','bmd','hmd','kgzt','bz','px','seed_ver'
  ];
  const sql = 'INSERT INTO hdgl (' + cols.join(',') + ') VALUES (' + cols.map(function () { return '?'; }).join(',') + ')';

  for (const a of list) {
    const row = [
      a.id, a.type, a.typeKey, a.name, a.subtitle || '', a.status, a.statusKey,
      a.auditStatus || '', a.auditKey || '', a.priority || '', a.tag || '',
      a.productScope || '', a.userScope || '', a.categoryScope || '', a.brand || '',
      a.merchantName || '', a.merchantId || '', a.startTime || '', a.endTime || '',
      a.preheatStart || '', a.preheatEnd || '', a.discount || '',
      a.thresholdAmount || 0, a.discountAmount || 0, a.discountRate || 0, a.maxDiscount || 0,
      a.scene || '', a.channel || '', a.budget || '', a.budgetAmount || 0,
      a.platformSubsidy || 0, a.merchantSubsidy || 0, a.region || '', a.cityLimit || '',
      a.ageLimit || '', a.genderLimit || '',
      a.stackable ? 1 : 0, a.memberOnly ? 1 : 0, a.exclusivity || '', a.couponCode || '',
      a.couponFaceValue || 0, a.couponThreshold || 0, a.couponValidDays || 0,
      a.giftName || '', a.giftSku || '', a.giftStock || 0,
      a.groupSize || 0, a.groupHours || 0, a.groupPrice || 0,
      a.seckillPrice || 0, a.seckillStock || 0, a.seckillStartHour || '',
      a.limit || 0, a.claimLimit || 0, a.dailyLimit || 0,
      a.totalQuota || 0, a.usedQuota || 0, a.remainQuota || 0, a.stock || 0,
      a.view || 0, a.join || 0, a.orderCount || 0, a.payCount || 0,
      a.clickRate || '', a.convertRate || '', a.shareCount || 0, a.collectCount || 0,
      a.refund || 0, a.refundRate || '', a.amount || 0, a.payAmount || 0,
      a.avgOrderAmount || 0, a.costAmount || 0, a.profitAmount || 0, a.roi || 0,
      a.riskLevel || '', a.relatedCampaign || '', a.owner || '', a.department || '',
      a.creator || '', a.createTime || '', a.updateTime || '', a.publishTime || '',
      a.auditor || '', a.auditTime || '', a.auditRemark || '', a.notifyMode || '',
      a.landingPage || '', a.shareTitle || '', a.shareDesc || '',
      a.description || '', a.ruleText || '', a.whiteList || '', a.blackList || '',
      a.enabled === false ? 0 : 1, a.remark || '', a.sort || 0, a.seedVersion || ''
    ];
    if (row.length !== cols.length) {
      throw new Error('列数与值数不一致: cols=' + cols.length + ' values=' + row.length);
    }
    await conn.query(sql, row);
  }
  return list.length;
}

async function main() {
  const list = BeautyActivitySeed.list();
  console.log('生成活动数:', list.length, '· version:', BeautyActivitySeed.version);

  const conn = await mysql.createConnection(config.mysql);
  try {
    await conn.execute(
      `CREATE TABLE IF NOT EXISTS app_store (
        store_key VARCHAR(128) PRIMARY KEY,
        store_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );
    const json = JSON.stringify(list);
    for (const key of [STORE_KEY, STORE_KEY_LEGACY]) {
      await conn.execute(
        `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
        [key, json]
      );
      console.log('已写入', key, '·', list.length, '条');
    }

    const n = await seedHdgl(conn, list);
    console.log('已写入 hdgl 表 ·', n, '条');
  } finally {
    await conn.end();
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
