/**
 * 社区管理 · 种草管理 → meilixiuxing.zhongcaobiao
 * 字段名 = 列表中文列名拼音首字母
 *
 *   shzt  审核
 *   id    ID
 *   fbr   发布人
 *   nc    昵称
 *   tx    头像
 *   pt    配图（JSON）
 *   nr    内容
 *   fl    分类
 *   bq    标签
 *   dz    点赞
 *   pl    评论
 *   gldd  关联订单
 *   dj    等级
 *   yhid  用户ID（辅助）
 *   fbsj  发布时间（辅助）
 *   lll   浏览量（辅助）
 *
 * 数据优先级：
 *   1) app_store.yueji_grass_list_v2（运营端种草管理实时同步，可能有 25+ 条）
 *   2) 运营端 preview.html 内置 GRASS_LIST 兜底
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./config');

const PREVIEW = path.join(__dirname, '..', '运营管理系统', 'preview.html');
const GRASS_STORE_KEY = 'yueji_grass_list_v2';

function extractArrayLiteral(src, varName) {
  const marker = 'var ' + varName + ' = [';
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('未找到 ' + varName);
  let i = start + marker.length - 1;
  let depth = 0;
  let inStr = false;
  let quote = '';
  let escaped = false;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = true;
      quote = ch;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) {
        return src.slice(start + ('var ' + varName + ' = ').length, i + 1);
      }
    }
  }
  throw new Error('解析 ' + varName + ' 失败');
}

function loadGrassListFromPreview() {
  const src = fs.readFileSync(PREVIEW, 'utf8');
  const literal = extractArrayLiteral(src, 'GRASS_LIST');
  // eslint-disable-next-line no-new-func
  return new Function('return (' + literal + ');')();
}

async function loadGrassListFromAppStore(conn) {
  try {
    const [rows] = await conn.query(
      'SELECT store_value FROM app_store WHERE store_key = ? LIMIT 1',
      [GRASS_STORE_KEY]
    );
    if (!rows.length || !rows[0].store_value) return [];
    const parsed = JSON.parse(rows[0].store_value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('读取 app_store 种草失败:', e.message);
    return [];
  }
}

function grassImgs(g) {
  if (Array.isArray(g.images) && g.images.length) {
    return JSON.stringify(g.images);
  }
  if (Array.isArray(g.syncImgs) && g.syncImgs.length) {
    return JSON.stringify(g.syncImgs);
  }
  if (Array.isArray(g.syncImages) && g.syncImages.length) {
    return JSON.stringify(g.syncImages);
  }
  if (g.syncCover) {
    return JSON.stringify([g.syncCover]);
  }
  const n = Number(g.imgs) || 1;
  const num = parseInt(String(g.id).replace(/\D/g, ''), 10) || 1;
  const base = './community_images/grass_' + ((num % 5) + 1) + '.jpg';
  return JSON.stringify(Array.from({ length: Math.max(1, n) }, () => base));
}

function avatarOf(userId, syncAvatar) {
  if (syncAvatar) return syncAvatar;
  if (!userId) return '';
  const m = String(userId).match(/(\d+)$/);
  if (m) {
    const n = parseInt(m[1], 10) % 20 || 1;
    return './avatars/u' + String(n).padStart(2, '0') + '.jpg';
  }
  return './avatars/' + String(userId).toLowerCase() + '.jpg';
}

async function main() {
  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset: 'utf8mb4'
  });

  console.log('优先读取 app_store.' + GRASS_STORE_KEY + ' ...');
  let list = await loadGrassListFromAppStore(conn);
  let source = 'app_store';
  if (!list.length) {
    console.log('app_store 无种草，回退 preview.html GRASS_LIST ...');
    list = loadGrassListFromPreview();
    source = 'preview.html';
  }
  console.log('来源', source, '共', list.length, '条种草');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS zhongcaobiao (
      id   VARCHAR(64)  NOT NULL COMMENT 'ID',
      shzt VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核',
      fbr  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布人',
      nc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
      tx   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      pt   TEXT         NULL COMMENT '配图JSON',
      nr   TEXT         NOT NULL COMMENT '内容',
      fl   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '分类',
      bq   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '标签',
      dz   INT          NOT NULL DEFAULT 0 COMMENT '点赞',
      pl   INT          NOT NULL DEFAULT 0 COMMENT '评论',
      gldd VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '关联订单',
      dj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '等级',
      yhid VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '用户ID',
      fbsj VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布时间',
      lll  INT          NOT NULL DEFAULT 0 COMMENT '浏览量',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区管理-种草管理'
  `);
  /* 兼容旧表 id 过短 */
  try {
    await conn.query('ALTER TABLE zhongcaobiao MODIFY id VARCHAR(64) NOT NULL COMMENT \'ID\'');
  } catch (eAlter) { /* ignore */ }

  await conn.query('TRUNCATE TABLE zhongcaobiao');

  const sql = `
    INSERT INTO zhongcaobiao
      (id, shzt, fbr, nc, tx, pt, nr, fl, bq, dz, pl, gldd, dj, yhid, fbsj, lll)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const g of list) {
    const gldd = g.orderNo || g.orderId || '';
    await conn.query(sql, [
      String(g.id || ''),
      g.statusText || g.status || '',
      g.publisher || '',
      g.user || '',
      avatarOf(g.userId, g.syncAvatar),
      grassImgs(g),
      g.text || '',
      g.cat || '',
      g.tag || '',
      g.likes || 0,
      g.comments || 0,
      gldd,
      g.level || '',
      g.userId || '',
      g.publishTime || '',
      g.views || 0
    ]);
  }

  await conn.query('CREATE OR REPLACE VIEW zhongcaobaio AS SELECT * FROM zhongcaobiao');

  const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM zhongcaobiao');
  const [sample] = await conn.query(
    'SELECT id, nc, fl, bq, dz, pl, shzt FROM zhongcaobiao ORDER BY id LIMIT 8'
  );
  console.log('zhongcaobiao 写入完成 → 库 meilixiuxing，共', rows[0].cnt, '条');
  console.log(sample);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
