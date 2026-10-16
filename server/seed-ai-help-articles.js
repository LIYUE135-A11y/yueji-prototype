/**
 * 写入「知识库管理 → AI帮助」列表到 meilixiuxing：
 * 1) app_store.zhuangyan_ai_help_articles_v1（运营 / App 经 db-bridge 同步）
 * 2) app_store.zhuangyan_ai_help_articles_seed_ver（种子版本，防旧列表回灌）
 * 3) 结构化表 AIBANGZHUAI（AI帮助条目）
 *
 * 用法：cd server && npm run seed:ai-help
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const AiHelp = require('../common/ai-help-articles-store');

const STORE_KEY = AiHelp.KEY || 'zhuangyan_ai_help_articles_v1';
const SEED_VER_KEY = AiHelp.SEED_VERSION_KEY || 'zhuangyan_ai_help_articles_seed_ver';
const SEED_VERSION = AiHelp.SEED_VERSION || 'manual-v3-20260908';
const TABLE = 'AIBANGZHUAI';

async function upsertStore(conn, key, value) {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  await conn.query(
    `INSERT INTO app_store (store_key, store_value, updated_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE store_value = VALUES(store_value), updated_at = NOW()`,
    [key, raw]
  );
}

async function seedAibangzhuai(conn, list) {
  /* 旧名 aibz 一并清理 */
  await conn.query('DROP TABLE IF EXISTS aibz');
  await conn.query('DROP TABLE IF EXISTS `' + TABLE + '`');
  await conn.query(`
    CREATE TABLE \`${TABLE}\` (
      bzid     VARCHAR(64)  NOT NULL COMMENT '帮助条目ID',
      zt       VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '主题标签',
      bt       VARCHAR(255) NOT NULL DEFAULT '' COMMENT '标题',
      zw       TEXT         NOT NULL COMMENT '摘要正文',
      bz       MEDIUMTEXT   NULL COMMENT '步骤JSON',
      ztzt     VARCHAR(16)  NOT NULL DEFAULT '已启用' COMMENT '启用状态',
      gxsj     VARCHAR(40)  NOT NULL DEFAULT '' COMMENT '更新时间',
      seed_ver VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '种子版本',
      PRIMARY KEY (bzid),
      KEY idx_zt (zt),
      KEY idx_ztzt (ztzt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库·AI帮助'
  `);

  const sql =
    'INSERT INTO `' + TABLE + '` (bzid, zt, bt, zw, bz, ztzt, gxsj, seed_ver) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  for (const r of list) {
    await conn.query(sql, [
      r.id || '',
      r.tag || '',
      String(r.title || '').slice(0, 250),
      String(r.body || ''),
      JSON.stringify(Array.isArray(r.steps) ? r.steps : []),
      r.status || '已启用',
      r.updateTime || '',
      SEED_VERSION
    ]);
  }
}

async function main() {
  const list = typeof AiHelp.listForDb === 'function' ? AiHelp.listForDb() : (AiHelp.SEED || []).slice();
  console.log('库', config.mysql.database, '· 表', TABLE);
  console.log('AI帮助条目', list.length, '条 · seed', SEED_VERSION);

  const conn = await mysql.createConnection(config.mysql);
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS app_store (
        store_key VARCHAR(128) NOT NULL PRIMARY KEY,
        store_value LONGTEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await upsertStore(conn, STORE_KEY, list);
    await upsertStore(conn, SEED_VER_KEY, SEED_VERSION);
    await seedAibangzhuai(conn, list);
    const [rows] = await conn.query('SELECT COUNT(*) AS c FROM `' + TABLE + '`');
    const [dbRow] = await conn.query('SELECT DATABASE() AS db');
    console.log(TABLE, 'rows', rows[0].c, 'in', dbRow[0].db);
    console.log('app_store keys written:', STORE_KEY, SEED_VER_KEY);
  } finally {
    await conn.end();
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
