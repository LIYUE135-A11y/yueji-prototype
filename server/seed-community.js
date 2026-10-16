/**
 * 社区管理：文章/种草/圈子/话题/动态
 * → app_store（运营/App 同步）+ wzgl / zcgl / qzgl / htgl / dtgl
 * 字段 = 列表中文列名拼音首字母
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const BeautyCommunitySeed = require('../common/beauty-community-seed');

function loadLists() {
  return {
    ARTICLE_LIST: BeautyCommunitySeed.listArticles(),
    GRASS_LIST: BeautyCommunitySeed.listGrasses(),
    CIRCLE_LIST: BeautyCommunitySeed.listCircles(),
    TOPIC_LIST: BeautyCommunitySeed.listTopics(),
    FEED_LIST: BeautyCommunitySeed.listFeeds()
  };
}

async function putStore(conn, key, value) {
  await conn.execute(
    `CREATE TABLE IF NOT EXISTS app_store (
      store_key VARCHAR(128) PRIMARY KEY,
      store_value LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
  await conn.execute(
    `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
    [key, JSON.stringify(value)]
  );
}

function artCover(a) {
  return a.syncCover || './community_images/article_' + String(a.id).replace(/^0+/, '') + '.jpg';
}
function grassImgs(g) {
  const n = Number(g.imgs) || 1;
  const base = './community_images/grass_' + ((parseInt(g.id, 10) % 5) + 1) + '.jpg';
  return JSON.stringify(Array.from({ length: n }, () => base));
}
function feedImgs(f) {
  const n = Number(f.imgs) || 1;
  const base = './community_images/feed_' + ((parseInt(f.id, 10) % 5) + 1) + '.jpg';
  return JSON.stringify(Array.from({ length: n }, () => base));
}
function avatarOf(userId) {
  if (!userId) return '';
  return './avatars/' + String(userId).toLowerCase() + '.jpg';
}

async function seedWzgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS wzgl (
      id   VARCHAR(32)  NOT NULL COMMENT 'ID',
      shzt VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核',
      fbr  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布人',
      nc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
      tx   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      fm   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '封面图',
      bt   VARCHAR(255) NOT NULL DEFAULT '' COMMENT '标题',
      jj   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '简介',
      fl   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '分类',
      bq   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '标签',
      sc   INT NOT NULL DEFAULT 0 COMMENT '收藏',
      pl   INT NOT NULL DEFAULT 0 COMMENT '评论',
      dz   INT NOT NULL DEFAULT 0 COMMENT '点赞',
      dj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '等级',
      yhid VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '作者用户ID',
      fbsj VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布时间',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章管理'
  `);
  await conn.query('TRUNCATE TABLE wzgl');
  const sql = `INSERT INTO wzgl (id,shzt,fbr,nc,tx,fm,bt,jj,fl,bq,sc,pl,dz,dj,yhid,fbsj)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const a of list) {
    await conn.query(sql, [
      a.id, a.statusText || a.status || '', a.publisher || '', a.author || '',
      avatarOf(a.authorId), artCover(a), a.title || '', a.excerpt || '',
      a.cat || '', a.tag || '', a.favorites || 0, a.comments || 0, a.likes || 0,
      a.level || '', a.authorId || '', a.publishTime || ''
    ]);
  }
  return list.length;
}

async function seedZcgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS zcgl (
      id   VARCHAR(32)  NOT NULL COMMENT 'ID',
      shzt VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核',
      fbr  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布人',
      nc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
      tx   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      pt   TEXT NULL COMMENT '配图JSON',
      nr   TEXT NOT NULL COMMENT '内容',
      fl   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '分类',
      bq   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '标签',
      dz   INT NOT NULL DEFAULT 0 COMMENT '点赞',
      pl   INT NOT NULL DEFAULT 0 COMMENT '评论',
      dj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '等级',
      yhid VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '用户ID',
      fbsj VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布时间',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='种草管理'
  `);
  await conn.query('TRUNCATE TABLE zcgl');
  const sql = `INSERT INTO zcgl (id,shzt,fbr,nc,tx,pt,nr,fl,bq,dz,pl,dj,yhid,fbsj)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const g of list) {
    await conn.query(sql, [
      g.id, g.statusText || g.status || '', g.publisher || '', g.user || '',
      avatarOf(g.userId), grassImgs(g), g.text || '', g.cat || '', g.tag || '',
      g.likes || 0, g.comments || 0, g.level || '', g.userId || '', g.publishTime || ''
    ]);
  }
  return list.length;
}

async function seedQzgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS qzgl (
      id   VARCHAR(32)  NOT NULL COMMENT 'ID',
      shzt VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核',
      tx   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      qzmc VARCHAR(128) NOT NULL DEFAULT '' COMMENT '圈子名称',
      fm   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '封面图',
      cys  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '成员数',
      tzs  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '帖子数',
      qz   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '圈主',
      fl   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '分类',
      qzid VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '圈主用户ID',
      cjsj VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '创建时间',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='圈子管理'
  `);
  await conn.query('TRUNCATE TABLE qzgl');
  const sql = `INSERT INTO qzgl (id,shzt,tx,qzmc,fm,cys,tzs,qz,fl,qzid,cjsj)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
  for (const c of list) {
    await conn.query(sql, [
      c.id, c.statusText || c.status || '', c.syncAvatar || avatarOf(c.masterId),
      c.name || '', c.syncCover || '', c.members || '', c.posts || '',
      c.master || '', c.cat || '', c.masterId || '', c.createTime || ''
    ]);
  }
  return list.length;
}

async function seedHtgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS htgl (
      id   VARCHAR(32)  NOT NULL COMMENT 'ID',
      shzt VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核',
      fm   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '封面图',
      htbt VARCHAR(255) NOT NULL DEFAULT '' COMMENT '话题标题',
      fqr  VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '发起人',
      tx   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      tls  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '讨论数',
      rd   INT NOT NULL DEFAULT 0 COMMENT '热度',
      fqrid VARCHAR(32) NOT NULL DEFAULT '' COMMENT '发起人ID',
      cjsj VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '创建时间',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话题管理'
  `);
  await conn.query('TRUNCATE TABLE htgl');
  const sql = `INSERT INTO htgl (id,shzt,fm,htbt,fqr,tx,tls,rd,fqrid,cjsj)
    VALUES (?,?,?,?,?,?,?,?,?,?)`;
  for (const t of list) {
    await conn.query(sql, [
      t.id, t.statusText || t.status || '', t.syncCover || '', t.title || '',
      t.initiator || '', avatarOf(t.initiatorId), t.discussions || '', t.heat || 0,
      t.initiatorId || '', t.createTime || ''
    ]);
  }
  return list.length;
}

async function seedDtgl(conn, list) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS dtgl (
      id   VARCHAR(32)  NOT NULL COMMENT 'ID',
      shzt VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '审核',
      fbr  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布人',
      nc   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
      tx   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      pt   TEXT NULL COMMENT '配图JSON',
      nr   TEXT NOT NULL COMMENT '内容',
      fl   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '分类',
      bq   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '标签',
      dz   INT NOT NULL DEFAULT 0 COMMENT '点赞',
      pl   INT NOT NULL DEFAULT 0 COMMENT '评论',
      zf   INT NOT NULL DEFAULT 0 COMMENT '转发',
      yhid VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '用户ID',
      fbsj VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '发布时间',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态管理'
  `);
  await conn.query('TRUNCATE TABLE dtgl');
  const sql = `INSERT INTO dtgl (id,shzt,fbr,nc,tx,pt,nr,fl,bq,dz,pl,zf,yhid,fbsj)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  for (const f of list) {
    await conn.query(sql, [
      f.id, f.statusText || f.status || '', f.publisher || '', f.user || '',
      avatarOf(f.userId), feedImgs(f), f.text || '', f.cat || '', f.tag || '',
      f.likes || 0, f.comments || 0, f.shares || 0, f.userId || '', f.publishTime || ''
    ]);
  }
  return list.length;
}

async function main() {
  console.log('从 beauty-community-seed 加载社区管理列表...');
  const lists = loadLists();
  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    charset: 'utf8mb4'
  });

  await putStore(conn, 'yueji_article_list_v2', lists.ARTICLE_LIST);
  await putStore(conn, 'yueji_grass_list_v2', lists.GRASS_LIST);
  await putStore(conn, 'yueji_circle_list_v2', lists.CIRCLE_LIST);
  await putStore(conn, 'yueji_topic_list_v2', lists.TOPIC_LIST);
  await putStore(conn, 'yueji_feed_list_v2', lists.FEED_LIST);
  console.log('已写入 app_store 文章/种草/圈子/话题/动态');

  const counts = {
    wzgl: await seedWzgl(conn, lists.ARTICLE_LIST),
    zcgl: await seedZcgl(conn, lists.GRASS_LIST),
    qzgl: await seedQzgl(conn, lists.CIRCLE_LIST),
    htgl: await seedHtgl(conn, lists.TOPIC_LIST),
    dtgl: await seedDtgl(conn, lists.FEED_LIST)
  };

  console.log('写入完成:');
  for (const [t, n] of Object.entries(counts)) {
    const [rows] = await conn.query('SELECT COUNT(*) AS c FROM `' + t + '`');
    const [sample] = await conn.query('SELECT * FROM `' + t + '` LIMIT 1');
    const tip = sample[0]
      ? Object.values(sample[0]).slice(0, 3).join(' | ')
      : '';
    console.log('  ' + t + ': ' + n + ' 条 (库内 ' + rows[0].c + ')  例: ' + tip);
  }
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
