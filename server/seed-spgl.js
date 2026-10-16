/**
 * 商品管理 spgl 表：从运营端 preview.html 的 PRODUCT_LIST 建表并写入
 * 字段名 = 列表中文列名拼音首字母
 *
 *   shzt  审核状态
 *   zt    上下架 / 状态
 *   fm    封面
 *   spid  商品ID
 *   spmc  商品名称
 *   pp    品牌
 *   sku   SKU编码
 *   yjfl  一级分类
 *   ejfl  二级分类
 *   sjfl  三级分类
 *   jg    价格
 *   kc    库存
 *   sssj  所属商家
 *   scl   收藏量
 *   pll   评论量
 *   ddl   订单量
 *   jye   交易额
 *   sjszm 商家首字母（辅助字段）
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('./config');

const PREVIEW = path.join(__dirname, '..', '运营管理系统', 'preview.html');

const SP_FILE_MAP = {
  SP100001: 'sp100001', SP100002: 'sp100002', SP100003: 'sp100003', SP100004: 'sp100004',
  SP100005: 'sp100005', SP100006: 'sp100006', SP100007: 'sp100007', SP100008: 'sp100008',
  SP100009: 'sp100009', SP100010: 'sp100010', SP100011: 'sp100011', SP100012: 'sp100012',
  SP100013: 'sp100013', SP100014: 'sp100014', SP100015: 'sp100015', SP100016: 'sp100016',
  SP100017: 'sp100017', SP100018: 'sp100018', SP100019: 'sp100019', SP100020: 'sp100020',
  SP100021: 'sp100021', SP100022: 'sp100022', SP100023: 'sp100023', SP100024: 'sp100024'
};

function IMG(p) {
  return (
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
    encodeURIComponent(p) +
    '&image_size=square'
  );
}

function coverOf(id, cover) {
  if (cover && typeof cover === 'string' && cover.indexOf('./static/') === 0) return cover;
  if (cover && typeof cover === 'string' && /^https?:\/\//.test(cover)) {
    const file = SP_FILE_MAP[id] || String(id).toLowerCase();
    return './static/products/' + file + '.jpg';
  }
  const file = SP_FILE_MAP[id] || String(id).toLowerCase();
  return './static/products/' + file + '.jpg';
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

function loadProductList() {
  const src = fs.readFileSync(PREVIEW, 'utf8');
  const literal = extractArrayLiteral(src, 'PRODUCT_LIST');
  // eslint-disable-next-line no-new-func
  return new Function('IMG', 'return (' + literal + ');')(IMG);
}

async function main() {
  console.log('解析运营端 PRODUCT_LIST ...');
  const list = loadProductList();
  console.log('共', list.length, '条商品');

  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset: 'utf8mb4'
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS spgl (
      spid  VARCHAR(32)  NOT NULL COMMENT '商品ID',
      spmc  VARCHAR(255) NOT NULL COMMENT '商品名称',
      pp    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '品牌',
      sku   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT 'SKU编码',
      yjfl  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '一级分类',
      ejfl  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '二级分类',
      sjfl  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '三级分类',
      jg    DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '价格',
      kc    INT NOT NULL DEFAULT 0 COMMENT '库存',
      sssj  VARCHAR(128) NOT NULL DEFAULT '' COMMENT '所属商家',
      sjszm VARCHAR(8)   NOT NULL DEFAULT '' COMMENT '商家首字母',
      fm    VARCHAR(512) NOT NULL DEFAULT '' COMMENT '封面',
      scl   INT NOT NULL DEFAULT 0 COMMENT '收藏量',
      pll   INT NOT NULL DEFAULT 0 COMMENT '评论量',
      ddl   INT NOT NULL DEFAULT 0 COMMENT '订单量',
      jye   DECIMAL(14,2) NOT NULL DEFAULT 0 COMMENT '交易额',
      zt    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '上下架',
      shzt  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核状态',
      PRIMARY KEY (spid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品管理'
  `);

  await conn.query('TRUNCATE TABLE spgl');

  const sql = `
    INSERT INTO spgl
      (spid, spmc, pp, sku, yjfl, ejfl, sjfl, jg, kc, sssj, sjszm, fm, scl, pll, ddl, jye, zt, shzt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const p of list) {
    await conn.query(sql, [
      p.id,
      p.name,
      p.brand || '',
      p.sku || '',
      p.cat1 || '',
      p.cat2 || '',
      p.cat3 || '',
      p.price || 0,
      p.stock || 0,
      p.merchant || '',
      p.merchantLetter || '',
      coverOf(p.id, p.cover),
      p.fav || 0,
      p.review || 0,
      p.order || 0,
      p.gmv || 0,
      p.status || '',
      p.auditStatus || ''
    ]);
  }

  const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM spgl');
  const [sample] = await conn.query(
    'SELECT spid, spmc, pp, jg, zt, shzt FROM spgl ORDER BY spid LIMIT 5'
  );
  console.log('spgl 写入完成 → 库 meilixiuxing，共', rows[0].cnt, '条');
  console.log(sample);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
