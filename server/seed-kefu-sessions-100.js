/**
 * 写入客服会话种子到：
 * 1) app_store.zhuangyan_kefu_sessions_v2（同步写 v1）
 * 2) kfgl 表（客服会话结构化表）
 *
 * 用法：cd server && npm run seed:kefu-sessions
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const BeautyKefuSeed = require('../common/beauty-kefu-seed');

const STORE_KEY = 'zhuangyan_kefu_sessions_v2';
const STORE_KEY_LEGACY = 'zhuangyan_kefu_sessions_v1';

async function seedKfgl(conn, list) {
  await conn.query('DROP TABLE IF EXISTS kfgl');
  await conn.query(`
    CREATE TABLE kfgl (
      hhid   VARCHAR(64)  NOT NULL COMMENT '会话号',
      yhid   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '用户ID',
      yhmc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '用户',
      hhlx   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '会话类型',
      zxzy   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '最近咨询',
      zxlm   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '咨询类目',
      yxj    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '优先级',
      qx     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '情绪',
      jnz    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '技能组',
      gldd   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '关联订单',
      jdkf   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '接待客服',
      zt     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '状态',
      qd     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '渠道',
      cs     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '城市',
      sb     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '设备',
      xxs    INT NOT NULL DEFAULT 0 COMMENT '消息数',
      zrg    TINYINT NOT NULL DEFAULT 0 COMMENT '转人工',
      myd    VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '满意度',
      hydj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '会员等级',
      sjhm   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '手机掩码',
      ddsj   INT NOT NULL DEFAULT 0 COMMENT '等待分钟',
      scxy   INT NOT NULL DEFAULT 0 COMMENT '首响秒',
      jjsj   INT NOT NULL DEFAULT 0 COMMENT '解决分钟',
      sla    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT 'SLA',
      cjsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '创建时间',
      gxsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '更新时间',
      bz     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
      seed_ver VARCHAR(32) NOT NULL DEFAULT '' COMMENT '种子版本',
      PRIMARY KEY (hhid),
      KEY idx_hhlx (hhlx),
      KEY idx_zt (zt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客服管理·会话'
  `);

  const cols = [
    'hhid','yhid','yhmc','hhlx','zxzy','zxlm','yxj','qx','jnz','gldd','jdkf','zt','qd','cs','sb',
    'xxs','zrg','myd','hydj','sjhm','ddsj','scxy','jjsj','sla','cjsj','gxsj','bz','seed_ver'
  ];
  const sql = 'INSERT INTO kfgl (' + cols.join(',') + ') VALUES (' + cols.map(function () { return '?'; }).join(',') + ')';

  for (const s of list) {
    await conn.query(sql, [
      s.id, s.userId || '', s.userName || '', s.type || '', s.summary || '',
      s.category || '', s.priority || '', s.sentiment || '', s.skillGroup || '',
      s.orderId || '', s.agent || '', s.status || '', s.channel || '',
      s.city || '', s.device || '',
      s.msgCount != null ? s.msgCount : (Array.isArray(s.messages) ? s.messages.length : 0),
      s.transferFromAi ? 1 : 0,
      s.satisfaction != null ? String(s.satisfaction) : '',
      s.vipLevel || '', s.phoneMasked || '',
      s.waitMinutes || 0, s.firstResponseSec || 0, s.resolveMinutes || 0,
      s.slaLevel || '', s.createdAt || '', s.updatedAt || '',
      s.remark || '', s.seedVersion || ''
    ]);
  }
  return list.length;
}

async function main() {
  const list = BeautyKefuSeed.list();
  console.log('生成会话数:', list.length, '· version:', BeautyKefuSeed.version);

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
    const n = await seedKfgl(conn, list);
    console.log('已写入 kfgl 表 ·', n, '条');
  } finally {
    await conn.end();
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
