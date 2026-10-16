/**
 * 运营管理模块 → MySQL
 * 写入 app_store（与运营 preview / db-bridge 同步）+ 结构化表
 *
 * 覆盖：商家 / 订单 / 评价 / 售后 / 店铺装修自定义页
 * 用法：cd server && npm run seed:ops
 */
const mysql = require('mysql2/promise');
const config = require('./config');

const BeautyMerchantSeed = require('../common/beauty-merchant-seed');
const BeautyOrderSeed = require('../common/beauty-order-seed');
const BeautyReviewSeed = require('../common/beauty-review-seed');
const BeautyAftersaleSeed = require('../common/beauty-aftersale-seed');

const KEYS = {
  merchant: 'zhuangyan_merchant_list_v1',
  order: 'zhuangyan_order_list_v1',
  review: 'zhuangyan_review_list_v1',
  aftersale: 'zhuangyan_aftersale_list_v1',
  decorPages: 'zhuangyan_decor_pages_v1'
};

const DECOR_PAGE_SEED = [
  { id: 'PG10001', name: '夏季护肤专题', type: '专题页', pageKind: 'other', path: '/pages/topic/summer-skincare', status: '已发布', statusKey: 'published', updateTime: '2026-08-20 14:30' },
  { id: 'PG10002', name: '会员权益说明', type: '品牌页', pageKind: 'other', path: '/pages/vip/benefits', status: '已发布', statusKey: 'published', updateTime: '2026-08-18 09:15' },
  { id: 'PG10003', name: '新人领券活动', type: '活动页', pageKind: 'activity', path: '/pages/activity/newbie-coupon', status: '草稿', statusKey: 'draft', updateTime: '2026-08-22 16:42' },
  { id: 'PG10004', name: '成分百科首页', type: '内容页', pageKind: 'other', path: '/pages/ingredient/index', status: '已发布', statusKey: 'published', updateTime: '2026-08-15 11:08' },
  { id: 'PG10005', name: '618大促会场', type: '活动页', pageKind: 'activity', path: '/pages/activity/618-sale', status: '已下线', statusKey: 'offline', updateTime: '2026-06-20 23:59' }
];

function j(v) {
  if (v == null) return null;
  if (Array.isArray(v) || typeof v === 'object') return JSON.stringify(v);
  return v;
}

async function ensureAppStore(conn) {
  await conn.execute(
    `CREATE TABLE IF NOT EXISTS app_store (
      store_key VARCHAR(128) PRIMARY KEY,
      store_value LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
}

async function putStore(conn, key, value) {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  await conn.execute(
    `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
    [key, json]
  );
}

async function seedSjgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS sjgl (
      sjid   VARCHAR(32)  NOT NULL COMMENT '商家ID',
      sjmc   VARCHAR(128) NOT NULL COMMENT '商家名称',
      sjlx   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '商家类型',
      frdb   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '法人代表',
      lxr    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '联系人',
      lxdh   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '联系电话',
      jylm   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '经营类目',
      szdq   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '所在地区',
      xxdz   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '详细地址',
      rzsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '入驻时间',
      shzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核状态',
      yyzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '营业状态',
      dplogo VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '店铺logo',
      sps    INT NOT NULL DEFAULT 0 COMMENT '商品数',
      dds    INT NOT NULL DEFAULT 0 COMMENT '订单数',
      jye    DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '交易额',
      pf     DECIMAL(4,2) NOT NULL DEFAULT 0 COMMENT '评分',
      PRIMARY KEY (sjid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家管理'
  `);
  await conn.query('TRUNCATE TABLE sjgl');
  const sql = `INSERT INTO sjgl
    (sjid,sjmc,sjlx,frdb,lxr,lxdh,jylm,szdq,xxdz,rzsj,shzt,yyzt,dplogo,sps,dds,jye,pf)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const m of list) {
    await conn.query(sql, [
      m.id, m.name, m.type || '', m.legal || m.contact || '', m.contact || '', m.phone || '',
      m.category || '', m.region || '', m.address || '', m.joinTime || '',
      m.auditStatus || '', m.openStatus || '', m.logo || '',
      m.productCount || 0, m.orderCount || 0, m.gmv || 0, m.score || 0
    ]);
  }
  return list.length;
}

async function seedDdgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS ddgl (
      ddh    VARCHAR(32)  NOT NULL COMMENT '订单号',
      xdsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '下单时间',
      xdyh   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '下单用户',
      yhid   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '用户ID',
      sssj   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '所属商家',
      spxx   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品信息',
      spsku  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '商品SKU',
      spfm   VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '商品封面',
      js     INT NOT NULL DEFAULT 0 COMMENT '件数',
      ddje   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '订单金额',
      zffs   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '支付方式',
      zfzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '支付状态',
      psfs   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '配送方式',
      wlzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '物流状态',
      ddzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '订单状态',
      shrdh  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '收货人电话',
      shdz   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '收货地址',
      sfkp   TINYINT NOT NULL DEFAULT 0 COMMENT '是否开票',
      mjbz   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '买家备注',
      PRIMARY KEY (ddh)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单管理'
  `);
  await conn.query('TRUNCATE TABLE ddgl');
  const sql = `INSERT INTO ddgl
    (ddh,xdsj,xdyh,yhid,sssj,spxx,spsku,spfm,js,ddje,zffs,zfzt,psfs,wlzt,ddzt,shrdh,shdz,sfkp,mjbz)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const o of list) {
    await conn.query(sql, [
      o.id, o.orderTime || '', o.userName || '', o.userId || '', o.merchantName || '',
      o.prodName || '', o.prodSku || '', o.prodCover || '', o.itemCount || o.prodQty || 0,
      o.orderAmount || o.payAmount || 0, o.payMethod || '', o.payStatus || '',
      o.delivery || '', o.deliveryStatus || '', o.status || '',
      o.receiverPhone || '', o.address || '', o.invoice ? 1 : 0, o.remark || ''
    ]);
  }
  return list.length;
}

async function seedPjgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS pjgl (
      pjid  VARCHAR(32)  NOT NULL COMMENT '评价ID',
      pjnr  TEXT NOT NULL COMMENT '评价内容',
      tp    LONGTEXT NULL COMMENT '图片JSON',
      hpd   INT NOT NULL DEFAULT 0 COMMENT '好评度',
      pjsj  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '评价时间',
      pjr   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '评价人',
      pjrid VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '评价人ID',
      pjsp  VARCHAR(255) NOT NULL DEFAULT '' COMMENT '评价商品',
      spid  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '商品ID',
      spfm  VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '商品封面',
      ggjg  VARCHAR(128) NOT NULL DEFAULT '' COMMENT '规格·价格',
      jg    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '价格',
      lll   INT NOT NULL DEFAULT 0 COMMENT '浏览量',
      sssj  VARCHAR(128) NOT NULL DEFAULT '' COMMENT '所属商家',
      shzt  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核状态',
      PRIMARY KEY (pjid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价管理'
  `);
  await conn.query('TRUNCATE TABLE pjgl');
  const sql = `INSERT INTO pjgl
    (pjid,pjnr,tp,hpd,pjsj,pjr,pjrid,pjsp,spid,spfm,ggjg,jg,lll,sssj,shzt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const r of list) {
    const ggjg = (r.spec || '') + (r.price != null ? ' · ¥' + Number(r.price).toFixed(2) : '');
    await conn.query(sql, [
      r.id, r.content || '', j(r.images || []), r.rating || 0, r.reviewTime || '',
      r.reviewerName || '', r.reviewerId || '', r.prodName || '', r.prodId || '',
      r.prodCover || '', ggjg, r.price || 0, r.views || 0, r.merchantName || '', r.auditStatus || ''
    ]);
  }
  return list.length;
}

async function seedShgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS shgl (
      shdh   VARCHAR(32)  NOT NULL COMMENT '售后单号',
      glddh  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '关联订单号',
      lx     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '类型',
      sqyy   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '申请原因',
      spxx   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '商品信息',
      spgg   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '商品规格',
      spfm   VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '商品封面',
      sssj   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '所属商家',
      mj     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '买家',
      mjid   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '买家ID',
      sqje   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '申请金额',
      sqsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '申请时间',
      clzt   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '处理状态',
      clr    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '处理人',
      clsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '处理时间',
      pz     LONGTEXT NULL COMMENT '凭证JSON',
      tkfs   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '退款方式',
      clbz   TEXT NULL COMMENT '处理备注',
      PRIMARY KEY (shdh)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后管理'
  `);
  await conn.query('TRUNCATE TABLE shgl');
  const sql = `INSERT INTO shgl
    (shdh,glddh,lx,sqyy,spxx,spgg,spfm,sssj,mj,mjid,sqje,sqsj,clzt,clr,clsj,pz,tkfs,clbz)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const a of list) {
    await conn.query(sql, [
      a.id, a.orderId || '', a.afterType || '', a.reason || '', a.prodName || '',
      a.prodSpec || '', a.prodCover || '', a.prodMerchant || a.merchantName || '',
      a.userName || '', a.userId || '', a.amount || 0, a.applyTime || '',
      a.status || '', a.handler || '', a.handleTime || '', j(a.proof || []),
      a.refundMethod || '', a.remark || ''
    ]);
  }
  return list.length;
}

async function seedDpzx(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS dpzx (
      ymid   VARCHAR(32)  NOT NULL COMMENT '页面ID',
      ymmc   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '页面名称',
      ymlx   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '页面类型',
      ymlxk  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '类型key',
      lj     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '路径',
      zt     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '状态',
      ztk    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '状态key',
      gxsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '更新时间',
      PRIMARY KEY (ymid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店铺装修·自定义页面'
  `);
  await conn.query('TRUNCATE TABLE dpzx');
  const sql = `INSERT INTO dpzx (ymid,ymmc,ymlx,ymlxk,lj,zt,ztk,gxsj) VALUES (?,?,?,?,?,?,?,?)`;
  for (const p of list) {
    await conn.query(sql, [
      p.id, p.name || '', p.type || '', p.pageKind || '', p.path || '',
      p.status || '', p.statusKey || '', p.updateTime || ''
    ]);
  }
  return list.length;
}

async function main() {
  const merchants = BeautyMerchantSeed.list();
  const orders = BeautyOrderSeed.list();
  const reviews = BeautyReviewSeed.list();
  const aftersales = BeautyAftersaleSeed.list();
  const decorPages = DECOR_PAGE_SEED.slice();

  console.log('准备写入运营模块:');
  console.log('  商家', merchants.length, '| 订单', orders.length, '| 评价', reviews.length, '| 售后', aftersales.length, '| 装修页', decorPages.length);

  const conn = await mysql.createConnection(config.mysql);
  try {
    await ensureAppStore(conn);

    await putStore(conn, KEYS.merchant, merchants);
    await putStore(conn, KEYS.order, orders);
    await putStore(conn, KEYS.review, reviews);
    await putStore(conn, KEYS.aftersale, aftersales);
    await putStore(conn, KEYS.decorPages, decorPages);
    console.log('已写入 app_store:', Object.values(KEYS).join(', '));

    const counts = {
      sjgl: await seedSjgl(conn, merchants),
      ddgl: await seedDdgl(conn, orders),
      pjgl: await seedPjgl(conn, reviews),
      shgl: await seedShgl(conn, aftersales),
      dpzx: await seedDpzx(conn, decorPages)
    };
    console.log('结构化表:');
    for (const [t, n] of Object.entries(counts)) {
      const [rows] = await conn.query('SELECT COUNT(*) AS c FROM `' + t + '`');
      console.log('  ' + t + ': ' + n + ' 条 (库内 ' + rows[0].c + ')');
    }
  } finally {
    await conn.end();
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
