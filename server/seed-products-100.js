/**
 * 写入 100 条美妆商品到 app_store.zhuangyan_product_list_v2
 * 用法：cd server && npm run seed:products
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const BeautyProductSeed = require('../common/beauty-product-seed');

const STORE_KEY = 'zhuangyan_product_list_v2';

async function main() {
  const list = BeautyProductSeed.list();
  console.log('生成商品数:', list.length);
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
    await conn.execute(
      `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
      [STORE_KEY, json]
    );
    console.log('已写入', STORE_KEY, '·', list.length, '条');
  } finally {
    await conn.end();
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
