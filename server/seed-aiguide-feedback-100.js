/**
 * 写入 AI 导购问题反馈种子到：
 * 1) app_store.ai_guide_card_feedback_v2（同步写 v1）
 * 2) dgwt 表（导购问题结构化表）
 *
 * 用法：cd server && npm run seed:aiguide-feedback
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const BeautyAiGuideFeedbackSeed = require('../common/beauty-aiguide-feedback-seed');

const STORE_KEY = 'ai_guide_card_feedback_v2';
const STORE_KEY_LEGACY = 'ai_guide_card_feedback_v1';

async function seedDgwt(conn, list) {
  await conn.query('DROP TABLE IF EXISTS dgwt');
  await conn.query(`
    CREATE TABLE dgwt (
      gdid   VARCHAR(64)  NOT NULL COMMENT '工单ID',
      pj     VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '评价score',
      zt     VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '处理状态',
      yhnc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '用户昵称',
      xm     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '真实姓名',
      sjhm   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '手机',
      clrx   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '处理人',
      jjfa   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '解决方案',
      bz     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注/反馈',
      ztmc   VARCHAR(128) NOT NULL DEFAULT '' COMMENT '话题',
      qd     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '渠道',
      hydj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '会员',
      cs     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '城市',
      lhs    INT NOT NULL DEFAULT 0 COMMENT '轮次',
      tjs    INT NOT NULL DEFAULT 0 COMMENT '推荐商品数',
      fksj   VARCHAR(40)  NOT NULL DEFAULT '' COMMENT '反馈时间',
      seed_ver VARCHAR(32) NOT NULL DEFAULT '' COMMENT '种子版本',
      PRIMARY KEY (gdid),
      KEY idx_pj (pj),
      KEY idx_zt (zt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI导购问题管理'
  `);

  const cols = [
    'gdid','pj','zt','yhnc','xm','sjhm','clrx','jjfa','bz','ztmc','qd','hydj','cs','lhs','tjs','fksj','seed_ver'
  ];
  const sql = 'INSERT INTO dgwt (' + cols.join(',') + ') VALUES (' + cols.map(() => '?').join(',') + ')';

  for (const r of list) {
    await conn.query(sql, [
      r.id || '',
      r.score || '',
      r.status || '',
      r.nickName || '',
      r.realName || '',
      r.phone || '',
      r.handler || '',
      String(r.solution || '').slice(0, 500),
      String(r.note || '').slice(0, 250),
      r.topic || '',
      r.channel || '',
      r.vipLevel || '',
      r.city || '',
      Number(r.turnCount) || 0,
      Number(r.recommendCount) || 0,
      r.at || '',
      r.seedVersion || ''
    ]);
  }
}

async function upsertStore(conn, key, list) {
  const raw = JSON.stringify(list);
  await conn.query(
    `INSERT INTO app_store (store_key, store_value, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE store_value = VALUES(store_value), updated_at = NOW()`,
    [key, raw]
  );
}

async function main() {
  const list = BeautyAiGuideFeedbackSeed.list();
  console.log('seed count', list.length, 'ver', BeautyAiGuideFeedbackSeed.version);
  const conn = await mysql.createConnection(config.mysql);
  try {
    await upsertStore(conn, STORE_KEY, list);
    await upsertStore(conn, STORE_KEY_LEGACY, list);
    await seedDgwt(conn, list);
    const [rows] = await conn.query('SELECT COUNT(*) AS c FROM dgwt');
    console.log('dgwt rows', rows[0].c);
    console.log('app_store keys written:', STORE_KEY, STORE_KEY_LEGACY);
  } finally {
    await conn.end();
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
