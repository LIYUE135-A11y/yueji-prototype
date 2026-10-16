/**
 * 美丽修行 · 数据 API 服务
 * 连接 MySQL: localhost / root / meilixiuxing
 * MySQL 未启动时仍监听端口，/api/tables 返回兜底表名（演示用）
 */
const http = require('http');
const url = require('url');
const config = require('./config');
const db = require('./db');

let dbReady = false;
let dbError = '';

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function handle(req, res) {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    if (req.method === 'GET' && (path === '/' || path === '/api/health' || path === '/health')) {
      if (!dbReady) {
        return sendJson(res, 200, {
          ok: true,
          degraded: true,
          service: 'meilixiuxing-api',
          database: null,
          error: dbError || 'MySQL 未连接',
          hint: '请以管理员启动 Windows 服务 MySQL80，再重启本 API',
          storeKeys: config.storeKeys
        });
      }
      const info = await db.ping();
      return sendJson(res, 200, {
        ok: true,
        degraded: false,
        service: 'meilixiuxing-api',
        database: info.db,
        time: info.now,
        storeKeys: config.storeKeys
      });
    }

    if (req.method === 'GET' && path === '/api/db-config') {
      const mysql = config.mysql || {};
      const host = mysql.host === 'localhost' ? '127.0.0.1' : (mysql.host || '127.0.0.1');
      return sendJson(res, 200, {
        ok: true,
        type: 'MySQL',
        host,
        port: String(mysql.port || 3306),
        user: mysql.user || 'root',
        password: mysql.password || '',
        database: mysql.database || 'meilixiuxing',
        apiPort: config.port || 3789,
        mysqlConnected: dbReady
      });
    }

    if (req.method === 'GET' && (path === '/api/tables' || path === '/tables')) {
      if (!dbReady) {
        await tryConnectDb('请求触发');
      }
      if (!dbReady) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          tables: [],
          count: 0,
          error: dbError || 'MySQL 未连接',
          hint: '请启动 MySQL80；API 会自动重连，无需重启 npm run dev'
        });
      }
      try {
        const tables = await db.listTables();
        return sendJson(res, 200, {
          ok: true,
          degraded: false,
          database: config.mysql.database,
          tables,
          count: tables.length
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          tables: [],
          count: 0,
          error: String(err.message || err),
          hint: '无法读取 information_schema，请检查库 meilixiuxing'
        });
      }
    }

    if (req.method === 'GET' && (path === '/api/kefu/knowledge' || path === '/kefu/knowledge')) {
      if (!dbReady) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          dingdan: [],
          shouhou: [],
          chanpinjieda: [],
          quanyi: [],
          error: dbError || 'MySQL 未连接'
        });
      }
      try {
        const data = await db.listKefuKnowledge();
        return sendJson(res, 200, {
          ok: true,
          database: config.mysql.database,
          dingdan: data.dingdan || [],
          shouhou: data.shouhou || [],
          chanpinjieda: data.chanpinjieda || [],
          quanyi: data.quanyi || [],
          counts: {
            dingdan: (data.dingdan || []).length,
            shouhou: (data.shouhou || []).length,
            chanpinjieda: (data.chanpinjieda || []).length,
            quanyi: (data.quanyi || []).length
          }
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          dingdan: [],
          shouhou: [],
          chanpinjieda: [],
          quanyi: [],
          error: String(err.message || err)
        });
      }
    }

    if (req.method === 'GET' && (path === '/api/spgl' || path === '/spgl')) {
      if (!dbReady) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          products: [],
          count: 0,
          error: dbError || 'MySQL 未连接',
          hint: '请启动 MySQL80 后重试'
        });
      }
      try {
        const products = await db.listSpgl();
        return sendJson(res, 200, {
          ok: true,
          degraded: false,
          database: config.mysql.database,
          table: 'spgl',
          products,
          count: products.length
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          products: [],
          count: 0,
          error: String(err.message || err),
          hint: '无法读取 spgl，请确认表已创建（npm run seed:spgl）'
        });
      }
    }

    if (req.method === 'GET' && (path === '/api/pinglunbiao' || path === '/pinglunbiao')) {
      if (!dbReady) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          reviews: [],
          count: 0,
          error: dbError || 'MySQL 未连接',
          hint: '请启动 MySQL80 后重试'
        });
      }
      try {
        const reviews = await db.listPinglunbiao();
        return sendJson(res, 200, {
          ok: true,
          degraded: false,
          database: config.mysql.database,
          table: 'pinglunbiao',
          reviews,
          count: reviews.length
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          reviews: [],
          count: 0,
          error: String(err.message || err),
          hint: '无法读取 pinglunbiao，请确认已执行 npm run seed:pinglunbiao'
        });
      }
    }

    if (req.method === 'GET' && (path === '/api/zhongcaobiao' || path === '/zhongcaobiao')) {
      if (!dbReady) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          grasses: [],
          count: 0,
          error: dbError || 'MySQL 未连接',
          hint: '请启动 MySQL80 后重试'
        });
      }
      try {
        const grasses = await db.listZhongcaobiao();
        return sendJson(res, 200, {
          ok: true,
          degraded: false,
          database: config.mysql.database,
          table: 'zhongcaobiao',
          grasses,
          count: grasses.length
        });
      } catch (err) {
        return sendJson(res, 200, {
          ok: false,
          degraded: true,
          database: config.mysql.database,
          grasses: [],
          count: 0,
          error: String(err.message || err),
          hint: '无法读取 zhongcaobiao，请确认已执行 npm run seed:zhongcaobiao'
        });
      }
    }

    /* 大模型代理：不依赖 MySQL，供浏览器绕过 CORS 调用 OpenAI 兼容接口 */
    if (req.method === 'POST' && path === '/api/llm/chat') {
      const body = await readBody(req);
      const apiUrl = String((body && body.apiUrl) || '').replace(/\/+$/, '');
      const apiKey = String((body && body.apiKey) || '');
      const model = String((body && body.model) || 'deepseek-chat');
      const messages = (body && body.messages) || [];
      const isLocal = !!(body && body.allowEmptyKey) || /127\.0\.0\.1|localhost/i.test(apiUrl);
      if (!apiUrl) return sendJson(res, 400, { ok: false, error: '缺少 apiUrl' });
      if (!apiKey && !isLocal) return sendJson(res, 400, { ok: false, error: '缺少 apiKey' });
      if (!Array.isArray(messages) || !messages.length) {
        return sendJson(res, 400, { ok: false, error: '缺少 messages' });
      }
      let endpoint = apiUrl;
      if (!/\/chat\/completions$/i.test(endpoint)) endpoint += '/chat/completions';
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model,
          messages,
          temperature: body.temperature != null ? Number(body.temperature) : 0.7,
          max_tokens: body.max_tokens != null ? Number(body.max_tokens) : 2048
        })
      });
      const rawText = await upstream.text();
      let data = null;
      try { data = JSON.parse(rawText); } catch (e) { data = { raw: rawText }; }
      if (!upstream.ok) {
        const msg = (data && data.error && data.error.message) || (data && data.message) || rawText || ('HTTP ' + upstream.status);
        return sendJson(res, 502, { ok: false, error: String(msg).slice(0, 500) });
      }
      const choice = data && data.choices && data.choices[0];
      const text = choice && choice.message && choice.message.content
        ? String(choice.message.content)
        : (choice && choice.text ? String(choice.text) : '');
      return sendJson(res, 200, { ok: true, text: text.trim(), raw: data });
    }

    if (!dbReady) {
      return sendJson(res, 503, {
        ok: false,
        error: 'MySQL 未连接',
        hint: '请启动服务 MySQL80（管理员），账号 root/123456，库 meilixiuxing'
      });
    }

    if (req.method === 'GET' && path === '/api/stores') {
      const stores = await db.getAllStores();
      return sendJson(res, 200, { ok: true, stores });
    }

    const oneMatch = path.match(/^\/api\/stores\/([^/]+)$/);
    if (oneMatch) {
      const key = decodeURIComponent(oneMatch[1]);
      if (req.method === 'GET') {
        const value = await db.getStore(key);
        return sendJson(res, 200, { ok: true, key, value, exists: value !== null });
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        const body = await readBody(req);
        const value = body && Object.prototype.hasOwnProperty.call(body, 'value') ? body.value : body;
        await db.setStore(key, value);
        return sendJson(res, 200, { ok: true, key, saved: true });
      }
    }

    if (req.method === 'POST' && path === '/api/stores/sync') {
      const body = await readBody(req);
      const map = (body && body.stores) || body || {};
      const count = await db.setStores(map);
      return sendJson(res, 200, { ok: true, saved: count });
    }

    sendJson(res, 404, { ok: false, error: 'Not Found' });
  } catch (err) {
    console.error('[api]', err);
    sendJson(res, 500, { ok: false, error: String(err.message || err) });
  }
}

async function tryConnectDb(reason) {
  try {
    await db.ensureSchema();
    await db.ping();
    const wasDown = !dbReady;
    dbReady = true;
    dbError = '';
    if (wasDown) {
      console.log('[mysql] 已连接数据库' + (reason ? '（' + reason + '）' : ''));
    }
    return true;
  } catch (err) {
    dbReady = false;
    dbError = String(err && err.message ? err.message : err);
    return false;
  }
}

/** 未连上时后台重试；已连上时偶发探活，掉线后自动恢复 */
function startMysqlKeepAlive() {
  let tick = 0;
  setInterval(async () => {
    tick += 1;
    if (!dbReady) {
      await tryConnectDb('自动重连');
      return;
    }
    /* 已连接：约每 30s 探活一次（本定时器 3s 一轮） */
    if (tick % 10 !== 0) return;
    try {
      await db.ping();
    } catch (err) {
      dbReady = false;
      dbError = String(err && err.message ? err.message : err);
      console.warn('[mysql] 连接丢失，将自动重连:', dbError);
      if (typeof db.resetPool === 'function') {
        try { db.resetPool(); } catch (e) {}
      }
    }
  }, 3000);
}

async function main() {
  await tryConnectDb('启动');
  if (!dbReady) {
    console.warn('[warn] MySQL 未就绪，API 将以降级模式启动:', dbError);
    console.warn('[hint] 管理员 PowerShell: Start-Service MySQL80 （启动后无需重启 API，会自动重连）');
  }

  startMysqlKeepAlive();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(config.port, '0.0.0.0', () => {
    console.log('========================================');
    console.log('  美丽修行 API 已启动');
    console.log('  http://localhost:' + config.port);
    console.log('  MySQL: ' + config.mysql.user + '@' + config.mysql.host + '/' + config.mysql.database);
    console.log('  状态: ' + (dbReady ? '已连接数据库' : '降级模式（无 MySQL；后台每 3 秒自动重连）'));
    console.log('========================================');
  });
}

main().catch((err) => {
  console.error('启动失败:', err.message || err);
  process.exit(1);
});
