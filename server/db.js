/**
 * MySQL 连接池
 */
const mysql = require('mysql2/promise');
const config = require('./config');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    });
  }
  return pool;
}

async function ping() {
  const [rows] = await getPool().query('SELECT 1 AS ok, DATABASE() AS db, NOW() AS now');
  return rows[0];
}

async function ensureSchema() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS app_store (
      store_key VARCHAR(128) NOT NULL PRIMARY KEY COMMENT '对应 localStorage key',
      store_value LONGTEXT NOT NULL COMMENT 'JSON 数据',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS db_meta (
      meta_key VARCHAR(64) NOT NULL PRIMARY KEY,
      meta_value VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await p.query(
    `INSERT INTO db_meta (meta_key, meta_value) VALUES ('project', '美丽修行 / 阅己美妆')
     ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)`
  );
}

async function getAllStores() {
  const [rows] = await getPool().query(
    'SELECT store_key, store_value, updated_at FROM app_store ORDER BY store_key'
  );
  const result = {};
  for (const row of rows) {
    try {
      result[row.store_key] = JSON.parse(row.store_value);
    } catch (e) {
      result[row.store_key] = row.store_value;
    }
  }
  return result;
}

async function getStore(key) {
  const [rows] = await getPool().query(
    'SELECT store_key, store_value, updated_at FROM app_store WHERE store_key = ? LIMIT 1',
    [key]
  );
  if (!rows.length) return null;
  try {
    return JSON.parse(rows[0].store_value);
  } catch (e) {
    return rows[0].store_value;
  }
}

async function setStore(key, value) {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  await getPool().query(
    `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
    [key, json]
  );
  return true;
}

async function setStores(map) {
  if (!map || typeof map !== 'object') return 0;
  let count = 0;
  const p = getPool();
  const conn = await p.getConnection();
  try {
    await conn.beginTransaction();
    for (const key of Object.keys(map)) {
      const json = typeof map[key] === 'string' ? map[key] : JSON.stringify(map[key]);
      await conn.query(
        `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
        [key, json]
      );
      count += 1;
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  return count;
}

async function listTables() {
  const dbName = config.mysql.database;
  const [rows] = await getPool().query(
    `SELECT TABLE_NAME AS name
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME`,
    [dbName]
  );
  return rows.map((r) => r.name).filter(Boolean);
}

function mapSpglRow(row) {
  const id = String((row && row.spid) || '');
  const file = id.toLowerCase() || 'sp100001';
  return {
    id,
    name: row.spmc || '',
    brand: row.pp || '',
    sku: row.sku || '',
    cat1: row.yjfl || '',
    cat2: row.ejfl || '',
    cat3: row.sjfl || '',
    price: row.jg != null ? Number(row.jg) : 0,
    stock: row.kc != null ? Number(row.kc) : 0,
    merchant: row.sssj || '',
    merchantLetter: row.sjszm || '',
    fav: row.scl != null ? Number(row.scl) : 0,
    review: row.pll != null ? Number(row.pll) : 0,
    order: row.ddl != null ? Number(row.ddl) : 0,
    gmv: row.jye != null ? Number(row.jye) : 0,
    status: row.zt || '',
    auditStatus: row.shzt || '',
    auditKey: /通过/.test(String(row.shzt || '')) ? 'pass' : (/未通过|驳回/.test(String(row.shzt || '')) ? 'fail' : 'pending'),
    cover: './static/products/' + file + '.jpg',
    syncCover: './static/products/' + file + '.jpg',
    coverUrl: '../运营管理系统/static/products/' + file + '.jpg',
    source: 'spgl'
  };
}

async function listSpgl() {
  const [rows] = await getPool().query(
    `SELECT fm, spid, spmc, pp, sku, yjfl, ejfl, sjfl, jg, kc, sssj, scl, pll, ddl, jye, zt, shzt, sjszm
     FROM spgl
     ORDER BY spid`
  );
  return (rows || []).map(mapSpglRow);
}

function parseJsonField(v, fallback) {
  if (v == null || v === '') return fallback;
  if (Array.isArray(v) || typeof v === 'object') return v;
  try {
    return JSON.parse(String(v));
  } catch (e) {
    return fallback;
  }
}

/** 评价管理-商品评价 pinglunbiao → App Review 形状 */
function mapPinglunRow(row) {
  const images = parseJsonField(row.pjtp, []);
  const shzt = String(row.shzt || '');
  let auditKey = 'pending';
  if (/通过/.test(shzt)) auditKey = 'pass';
  else if (/屏蔽|未通过|驳回/.test(shzt)) auditKey = 'block';
  return {
    id: String(row.pjid || ''),
    content: row.pjnr || '',
    images: Array.isArray(images) ? images : [],
    rating: row.pfdj != null ? Number(row.pfdj) : 0,
    reviewTime: row.pjsj || '',
    reviewerName: row.yh || '',
    reviewerId: row.yhid || '',
    prodId: row.spid || '',
    prodName: row.pjsp || '',
    prodCover: row.spfm || '',
    spec: row.gg || '',
    price: row.jg != null ? Number(row.jg) : 0,
    merchantName: row.sssj || '',
    views: row.lll != null ? Number(row.lll) : 0,
    auditStatus: shzt,
    auditKey: auditKey,
    replyName: row.hfr || '',
    replyTime: row.hfsj || '',
    replyContent: row.hfnr || '',
    reviewType: 'product',
    source: 'pinglunbiao'
  };
}

async function listPinglunbiao() {
  const [rows] = await getPool().query(
    `SELECT pjid, yh, yhid, pjnr, pjtp, pfdj, pjsj, pjsp, spid, spfm, sssj, gg, jg, ggjg, lll, shzt, hfr, hfsj, hfnr
     FROM pinglunbiao
     ORDER BY pjsj DESC`
  );
  return (rows || []).map(mapPinglunRow);
}

/** 种草管理 zhongcaobiao → App Grass 形状 */
function mapZhongcaoRow(row) {
  const imgs = parseJsonField(row.pt, []);
  const shzt = String(row.shzt || '');
  let status = 'pending';
  let statusText = shzt || '待审核';
  if (/通过|passed/i.test(shzt)) {
    status = 'passed';
    statusText = shzt.indexOf('已') === 0 ? shzt : '已通过';
  } else if (/屏蔽|驳回|fail/i.test(shzt)) {
    status = 'rejected';
  }
  return {
    id: String(row.id || ''),
    user: row.nc || '',
    userId: row.yhid || '',
    publisher: row.fbr || '',
    cat: row.fl || '',
    tag: row.bq || '',
    level: row.dj || '',
    status: status,
    statusText: statusText,
    text: row.nr || '',
    images: Array.isArray(imgs) ? imgs : [],
    imgs: Array.isArray(imgs) ? imgs.length : Number(row.imgs) || 1,
    likes: row.dz != null ? Number(row.dz) : 0,
    comments: row.pl != null ? Number(row.pl) : 0,
    views: row.lll != null ? Number(row.lll) : 0,
    publishTime: row.fbsj || '',
    orderNo: row.gldd || '',
    orderId: row.gldd || '',
    syncAvatar: row.tx || '',
    syncCover: Array.isArray(imgs) && imgs[0] ? imgs[0] : '',
    source: 'zhongcaobiao'
  };
}

async function listZhongcaobiao() {
  const [rows] = await getPool().query(
    `SELECT id, shzt, fbr, nc, tx, pt, nr, fl, bq, dz, pl, gldd, dj, yhid, fbsj, lll
     FROM zhongcaobiao
     ORDER BY id`
  );
  return (rows || []).map(mapZhongcaoRow);
}

async function listKefuDingdan() {
  const [rows] = await getPool().query(
    'SELECT ddh, mj, sp, sf, ddzt, wl, kfgjhs FROM dingdan ORDER BY ddh'
  );
  return rows || [];
}

async function listKefuShouhou() {
  const [rows] = await getPool().query(
    'SELECT shdh, ddh, lx, mj, sp, zt, clr, kfcljy FROM shouhou ORDER BY shdh'
  );
  return rows || [];
}

async function listKefuChanpinjieda() {
  const [rows] = await getPool().query(
    'SELECT hh, sp, pp, pl, sj, zt, kfjeyd FROM chanpinjieda ORDER BY hh'
  );
  return rows || [];
}

async function listKefuQuanyi() {
  const [rows] = await getPool().query(
    'SELECT qyid, qylx, yh, gldh, glnr, yhje, kfdyd FROM quanyi ORDER BY qyid'
  );
  return rows || [];
}

async function listKefuKnowledge() {
  const [dingdan, shouhou, chanpinjieda, quanyi] = await Promise.all([
    listKefuDingdan().catch(() => []),
    listKefuShouhou().catch(() => []),
    listKefuChanpinjieda().catch(() => []),
    listKefuQuanyi().catch(() => [])
  ]);
  return { dingdan, shouhou, chanpinjieda, quanyi };
}

async function close() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/** 连接异常后丢弃旧池，下次 getPool 重建 */
function resetPool() {
  if (!pool) return;
  const old = pool;
  pool = null;
  try {
    old.end().catch(function () {});
  } catch (e) {}
}

module.exports = {
  getPool,
  ping,
  ensureSchema,
  listTables,
  listSpgl,
  listPinglunbiao,
  listZhongcaobiao,
  listKefuDingdan,
  listKefuShouhou,
  listKefuChanpinjieda,
  listKefuQuanyi,
  listKefuKnowledge,
  getAllStores,
  getStore,
  setStore,
  setStores,
  close,
  resetPool
};
