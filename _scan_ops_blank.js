const { chromium } = require('./server/node_modules/playwright-core');
const fs = require('fs');
const logPath = require('path').join('.cursor', 'debug-ffd1d8.log');

function appendLog(obj) {
  try {
    fs.mkdirSync('.cursor', { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(Object.assign({ sessionId: 'ffd1d8', timestamp: Date.now() }, obj)) + '\n');
  } catch (e) {}
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e.message || e)));

  await page.goto('http://127.0.0.1:8791/%E8%BF%90%E8%90%A5%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F/preview.html', {
    waitUntil: 'domcontentloaded',
    timeout: 120000
  });
  await page.waitForTimeout(2000);

  const blanks = [];

  async function snapshot(label) {
    const info = await page.evaluate((lab) => {
      const active = document.querySelector('.panel-section.active');
      const emptyTip = [...document.querySelectorAll('.settings-empty-tip, .dc-empty-title, .ppv-empty, .tab-empty-text')]
        .filter((el) => {
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden' && el.offsetParent !== null;
        })
        .map((el) => (el.innerText || '').trim().slice(0, 40));
      const tbodies = active
        ? [...active.querySelectorAll('tbody')].map((tb) => ({
            id: tb.id || '',
            rows: tb.querySelectorAll('tr').length,
            h: Math.round(tb.getBoundingClientRect().height)
          }))
        : [];
      const ov = document.getElementById('dcOverview');
      const grid = document.getElementById('dcGrid');
      return {
        label: lab,
        panel: active ? active.getAttribute('data-panel') : null,
        textLen: active ? (active.innerText || '').trim().length : 0,
        h: active ? Math.round(active.getBoundingClientRect().height) : 0,
        emptyTips: emptyTip,
        tbodies,
        dcOv: ov ? ov.innerHTML.length : -1,
        dcGrid: grid ? grid.innerHTML.length : -1,
        settingsEmptyDisplay: (() => {
          const el = document.getElementById('settingsEmptyWrap');
          return el ? getComputedStyle(el).display : null;
        })(),
        activeSettingsPanel: (() => {
          const p = document.querySelector(
            '.settings-brand-panel.active,.settings-kb-panel.active,.settings-llm-panel.active,.settings-dept-panel.active,.settings-staff-panel.active,.settings-role-panel.active,.settings-category-panel.active,.settings-tag-panel.active'
          );
          return p
            ? {
                cls: p.className,
                textLen: (p.innerText || '').trim().length,
                display: getComputedStyle(p).display
              }
            : null;
        })()
      };
    }, label);
    const isBlank =
      (info.textLen < 40 && info.panel !== 'data') ||
      (info.panel === 'data' && info.dcOv === 0 && info.dcGrid === 0) ||
      (info.settingsEmptyDisplay === 'flex') ||
      (info.emptyTips && info.emptyTips.length > 0 && info.textLen < 80) ||
      (info.tbodies.length && info.tbodies.every((t) => t.rows === 0) && info.textLen < 200);
    if (isBlank) blanks.push(info);
    appendLog({ hypothesisId: 'G', location: 'scan', message: 'panel snapshot', data: info, runId: 'continue-scan' });
    return info;
  }

  const menus = [
    'product',
    'merchant',
    'order',
    'review',
    'aftersale',
    'user',
    'activity',
    'decor',
    'community',
    'data',
    'kefu',
    'aiguide',
    'humankf'
  ];
  for (const m of menus) {
    await page.click(`[data-menu="${m}"]`);
    await page.waitForTimeout(450);
    await snapshot('menu:' + m);
  }

  // activity sub tabs
  await page.click('[data-menu="activity"]');
  await page.waitForTimeout(300);
  for (const t of ['manjian', 'manzhe', 'gift', 'pintuan', 'seckill', 'coupon']) {
    await page.click(`[data-act-tab="${t}"]`);
    await page.waitForTimeout(350);
    await snapshot('act:' + t);
  }

  // data center tabs
  await page.click('[data-menu="data"]');
  await page.waitForTimeout(300);
  for (const t of ['product', 'merchant', 'order', 'review', 'aftersale', 'user', 'activity', 'community', 'kefu', 'ai']) {
    await page.click(`[data-dctab="${t}"]`);
    await page.waitForTimeout(400);
    await snapshot('dc:' + t);
  }

  // settings
  await page.click('#settingsBtn');
  await page.waitForTimeout(400);
  for (const s of ['brand', 'category', 'tag', 'dept', 'staff', 'role', 'llm', 'kb']) {
    await page.click(`[data-settings="${s}"]`);
    await page.waitForTimeout(400);
    await snapshot('settings:' + s);
  }

  // llm ai sub panes
  await page.click('[data-settings="llm"]');
  await page.waitForTimeout(300);
  const aiItem = await page.$('[data-llm-sub="ai"]');
  if (aiItem) {
    await aiItem.click();
    await page.waitForTimeout(300);
    for (const pane of ['kefu', 'daogou', 'shitu', 'zhuanxie', 'shangpin', 'neirong', 'cefu']) {
      const btn = await page.$(`[data-ai-pane-tab="${pane}"], [data-ai-tab="${pane}"], .aicfg-tab[data-ai="${pane}"]`);
      // try common selectors
      const clicked = await page.evaluate((p) => {
        const el =
          document.querySelector(`[data-ai-pane="${p}"]`) ||
          document.querySelector(`[data-ai-tab="${p}"]`) ||
          document.querySelector(`.aicfg-nav-item[data-ai="${p}"]`) ||
          document.querySelector(`[data-ai="${p}"]`);
        if (el && el.click) {
          el.click();
          return true;
        }
        const tabs = [...document.querySelectorAll('.aicfg-tab, .ai-tab, [data-ai-pane-tab]')];
        for (const t of tabs) {
          if ((t.textContent || '').includes(p) || t.getAttribute('data-ai-pane-tab') === p) {
            t.click();
            return true;
          }
        }
        return false;
      }, pane);
      await page.waitForTimeout(250);
      if (clicked) await snapshot('llm-ai:' + pane);
    }
  }

  appendLog({
    hypothesisId: 'G',
    location: 'scan-summary',
    message: 'blank candidates',
    data: { blanks, pageErrors: pageErrors.slice(0, 20) },
    runId: 'continue-scan'
  });
  console.log('BLANK_COUNT', blanks.length);
  console.log(JSON.stringify(blanks, null, 2));
  console.log('PAGE_ERRORS', JSON.stringify(pageErrors.slice(0, 15)));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
