/**
 * 评价管理 · 商品评价 → meilixiuxing.pinglunbiao
 * 字段名 = 列表中文列名拼音首字母
 *
 *   pjid  评价ID
 *   yh    用户（评价人昵称）
 *   yhid  用户ID
 *   pjnr  评价内容
 *   pjtp  评价图片（JSON）
 *   pfdj  评分等级
 *   pjsj  评价时间
 *   pjsp  评价商品
 *   spid  商品ID
 *   spfm  商品封面
 *   sssj  所属商家
 *   gg    规格
 *   jg    价格
 *   ggjg  规格 · 价格
 *   lll   浏览量
 *   shzt  审核状态
 *   hfr   回复人
 *   hfsj  回复时间
 *   hfnr  回复内容
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./config');

const PREVIEW = path.join(__dirname, '..', '运营管理系统', 'preview.html');

function IMG(p) {
  return (
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
    encodeURIComponent(p) +
    '&image_size=square'
  );
}

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

function loadReviewList() {
  const src = fs.readFileSync(PREVIEW, 'utf8');
  const literal = extractArrayLiteral(src, 'REVIEW_LIST');
  // eslint-disable-next-line no-new-func
  return new Function('IMG', 'return (' + literal + ');')(IMG);
}

function isProductReview(r) {
  return !r.reviewType || r.reviewType === 'product';
}

function j(v) {
  if (v == null) return null;
  if (Array.isArray(v) || typeof v === 'object') return JSON.stringify(v);
  return v;
}

async function main() {
  console.log('解析运营端 REVIEW_LIST（商品评价）...');
  const all = loadReviewList();
  const list = all.filter(isProductReview);
  console.log('商品评价', list.length, '条（总评价', all.length, '条）');

  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset: 'utf8mb4'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS pinglunbiao (
      pjid  VARCHAR(32)   NOT NULL COMMENT '评价ID',
      yh    VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '用户',
      yhid  VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '用户ID',
      pjnr  TEXT          NOT NULL COMMENT '评价内容',
      pjtp  LONGTEXT      NULL COMMENT '评价图片JSON',
      pfdj  INT           NOT NULL DEFAULT 0 COMMENT '评分等级',
      pjsj  VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '评价时间',
      pjsp  VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '评价商品',
      spid  VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '商品ID',
      spfm  VARCHAR(1024) NOT NULL DEFAULT '' COMMENT '商品封面',
      sssj  VARCHAR(128)  NOT NULL DEFAULT '' COMMENT '所属商家',
      gg    VARCHAR(128)  NOT NULL DEFAULT '' COMMENT '规格',
      jg    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '价格',
      ggjg  VARCHAR(160)  NOT NULL DEFAULT '' COMMENT '规格·价格',
      lll   INT           NOT NULL DEFAULT 0 COMMENT '浏览量',
      shzt  VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '审核状态',
      hfr   VARCHAR(64)   NOT NULL DEFAULT '' COMMENT '回复人',
      hfsj  VARCHAR(32)   NOT NULL DEFAULT '' COMMENT '回复时间',
      hfnr  TEXT          NULL COMMENT '回复内容',
      PRIMARY KEY (pjid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价管理-商品评价'
  `);

  await conn.query('TRUNCATE TABLE pinglunbiao');

  const sql = `
    INSERT INTO pinglunbiao
      (pjid, yh, yhid, pjnr, pjtp, pfdj, pjsj, pjsp, spid, spfm, sssj, gg, jg, ggjg, lll, shzt, hfr, hfsj, hfnr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const r of list) {
    const price = r.price != null ? Number(r.price) : 0;
    const gg = r.spec || '';
    const ggjg =
      gg + (r.price != null ? ' · ¥' + price.toFixed(2) : '');
    await conn.query(sql, [
      r.id,
      r.reviewerName || '',
      r.reviewerId || '',
      r.content || '',
      j(r.images || []),
      r.rating != null ? r.rating : 0,
      r.reviewTime || '',
      r.prodName || '',
      r.prodId || '',
      r.prodCover || '',
      r.merchantName || '',
      gg,
      price,
      ggjg,
      r.views || 0,
      r.auditStatus || '',
      r.replyName || '',
      r.replyTime || '',
      r.replyContent || null
    ]);
  }

  const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM pinglunbiao');
  const [sample] = await conn.query(
    'SELECT pjid, yh, pfdj, pjsp, shzt FROM pinglunbiao ORDER BY pjsj DESC LIMIT 5'
  );
  console.log('pinglunbiao 写入完成 → 库 meilixiuxing，共', rows[0].cnt, '条');
  console.log(sample);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
