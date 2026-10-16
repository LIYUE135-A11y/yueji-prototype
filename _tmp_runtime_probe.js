/**
 * Probe preview.html main script for early runtime throws under a minimal DOM.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = path.join(__dirname, '运营管理系统', 'preview.html');
const html = fs.readFileSync(file, 'utf8');

function extractMainScript(htmlText) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  let best = '';
  while ((m = re.exec(htmlText))) {
    if (/\bsrc\s*=/.test(m[1])) continue;
    if (m[2].length > best.length) best = m[2];
  }
  return best;
}

function makeEl(tag, id) {
  const attrs = {};
  const children = [];
  const classSet = new Set();
  const el = {
    tagName: String(tag || 'div').toUpperCase(),
    id: id || '',
    style: {},
    value: '',
    checked: false,
    disabled: false,
    textContent: '',
    innerHTML: '',
    className: '',
    classList: {
      add(c) { classSet.add(c); el.className = [...classSet].join(' '); },
      remove(c) { classSet.delete(c); el.className = [...classSet].join(' '); },
      contains(c) { return classSet.has(c); },
      toggle(c, force) {
        if (force === true) classSet.add(c);
        else if (force === false) classSet.delete(c);
        else if (classSet.has(c)) classSet.delete(c); else classSet.add(c);
        el.className = [...classSet].join(' ');
        return classSet.has(c);
      }
    },
    dataset: {},
    parentNode: null,
    children,
    _listeners: {},
    getAttribute(name) {
      if (name === 'data-panel') return attrs['data-panel'] || null;
      if (name === 'data-menu') return attrs['data-menu'] || null;
      if (name === 'data-settings') return attrs['data-settings'] || null;
      if (name === 'data-act-tab') return attrs['data-act-tab'] || null;
      if (name === 'data-act-tab-content') return attrs['data-act-tab-content'] || null;
      if (name === 'data-dctab') return attrs['data-dctab'] || null;
      return attrs[name] != null ? attrs[name] : null;
    },
    setAttribute(name, val) { attrs[name] = String(val); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    appendChild(child) { children.push(child); child.parentNode = el; return child; },
    addEventListener(type, fn) {
      (el._listeners[type] = el._listeners[type] || []).push(fn);
    },
    removeEventListener() {},
    click() {},
    focus() {},
    blur() {},
    getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 40, bottom: 40, right: 100 }; }
  };
  return el;
}

const byId = {};
function ensureId(id, tag) {
  if (!byId[id]) byId[id] = makeEl(tag || 'div', id);
  return byId[id];
}

// Seed critical IDs referenced early
[
  'sidebar', 'toggleBtn', 'headerCollapseBtn', 'topCollapseBtn', 'menuList',
  'pathCurrent', 'settingsBtn', 'settingsEmptyTitle', 'settingsEmptyWrap',
  'settingsDeptPanel', 'settingsStaffPanel', 'settingsLlmPanel', 'settingsKbPanel',
  'settingsBrandPanel', 'settingsCategoryPanel', 'settingsTagPanel', 'settingsRolePanel',
  'adminAvatarBox', 'productTbody', 'activityTabBar', 'communityTabBar', 'decorTabBar',
  'kbTableBody', 'kbTotalHint', 'kbCheckAll', 'dcOverview', 'dcGrid', 'dcPullDbBtn'
].forEach((id) => ensureId(id));

ensureId('toggleBtn').querySelector = function () {
  return makeEl('span');
};
ensureId('menuList').querySelectorAll = function (sel) {
  if (sel === '.menu-item') {
    return ['product', 'merchant', 'order', 'review', 'aftersale', 'user', 'activity', 'decor', 'community', 'data', 'kefu', 'aiguide', 'humankf'].map((m) => {
      const el = makeEl('div');
      el.setAttribute('data-menu', m);
      return el;
    });
  }
  return [];
};

const panelIds = ['settings', 'product', 'merchant', 'order', 'review', 'aftersale', 'user', 'activity', 'decor', 'community', 'data', 'kefu', 'aiguide', 'humankf'];
const panels = panelIds.map((p) => {
  const el = makeEl('div');
  el.setAttribute('data-panel', p);
  if (p === 'product') el.classList.add('active');
  return el;
});

const settingsItems = ['brand', 'category', 'tag', 'dept', 'staff', 'role', 'llm', 'kb'].map((s) => {
  const el = makeEl('div');
  el.setAttribute('data-settings', s);
  if (s === 'brand') el.classList.add('active');
  return el;
});

const documentMock = {
  getElementById(id) { return ensureId(id); },
  querySelector(sel) {
    if (sel === '#settingsMenuList .settings-menu-item.active') return settingsItems[0];
    if (sel === '.dc-tab.active') {
      const t = makeEl('div');
      t.setAttribute('data-dctab', 'product');
      return t;
    }
    if (sel && sel.indexOf('[data-act-tab-content=') === 0) {
      const tab = sel.match(/"([^"]+)"/)[1];
      const el = ensureId('actPanel_' + tab);
      el.setAttribute('data-act-tab-content', tab);
      el.querySelector = function (q) {
        if (q && q.charAt(0) === '#') return byId[q.slice(1)] || null;
        return null;
      };
      return el;
    }
    return null;
  },
  querySelectorAll(sel) {
    if (sel === '.panel-section') return panels;
    if (sel === '#settingsMenuList .settings-menu-item') return settingsItems;
    if (sel === '[data-act-tab-content]') {
      return ['manjian', 'manzhe', 'gift', 'pintuan', 'seckill', 'coupon'].map((t) => {
        const el = ensureId('actPanel_' + t);
        el.setAttribute('data-act-tab-content', t);
        el.querySelector = function (q) {
          if (q && q.charAt(0) === '#') return byId[q.slice(1)] || null;
          return null;
        };
        return el;
      });
    }
    if (sel === '.dc-tab') {
      return ['product'].map((k) => {
        const el = makeEl('div');
        el.setAttribute('data-dctab', k);
        el.classList.add('active');
        return el;
      });
    }
    if (sel === '.menu-item') return ensureId('menuList').querySelectorAll('.menu-item');
    return [];
  },
  createElement(tag) { return makeEl(tag); },
  addEventListener() {},
  body: makeEl('body')
};

const store = function (name) {
  return {
    STORAGE_KEY: name,
    load() { return []; },
    save() {},
    cloneProduct(p) { return Object.assign({}, p); },
    cloneActivity(a) { return Object.assign({}, a); }
  };
};

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  parseInt,
  Number,
  String,
  Boolean,
  Array,
  Object,
  JSON,
  Math,
  Date,
  RegExp,
  Error,
  TypeError,
  ReferenceError,
  Promise,
  Map,
  Set,
  WeakMap,
  Uint8Array,
  encodeURIComponent,
  decodeURIComponent,
  btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
  atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
  localStorage: {
    _d: {},
    getItem(k) { return this._d[k] != null ? this._d[k] : null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  },
  sessionStorage: {
    _d: {},
    getItem(k) { return this._d[k] != null ? this._d[k] : null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  },
  document: documentMock,
  window: null,
  navigator: { userAgent: 'node' },
  location: { href: 'file:///preview.html', search: '', hash: '' },
  history: { replaceState() {}, pushState() {} },
  alert() {},
  confirm() { return false; },
  prompt() { return null; },
  fetch: async () => ({ ok: false, json: async () => ({}), text: async () => '' }),
  Image: function () { this.src = ''; },
  HTMLElement: function () {},
  Node: function () {},
  Event: function () {},
  CustomEvent: function () {},
  MutationObserver: function () { this.observe = function () {}; this.disconnect = function () {}; },
  requestAnimationFrame(cb) { return setTimeout(cb, 0); },
  cancelAnimationFrame(id) { clearTimeout(id); },
  ProductStore: store('product'),
  ActivityStore: store('activity'),
  UserStore: store('user'),
  KefuStore: { load() { return []; }, save() {} },
  AiConfigStore: { load() { return {}; }, save() {} },
  ArticleStore: { load() { return []; }, save() {} },
  GrassStore: { load() { return []; }, save() {} },
  TopicStore: { load() { return []; }, save() {} },
  CircleStore: { load() { return []; }, save() {} },
  FeedStore: { load() { return []; }, save() {} },
  ReviewStore: { load() { return []; }, save() {} },
  BeautyProductSeed: { list: [], count: 0 },
  BeautyMerchantSeed: { list: [], count: 0 },
  BeautyOrderSeed: { list: [], count: 0 },
  BeautyReviewSeed: { list: [], count: 0 },
  BeautyAftersaleSeed: { list: [], count: 0 },
  BeautyActivitySeed: { list: [], count: 0, version: 'test', enrich() {} },
  BeautyCommunitySeed: { list: [], count: 0 },
  BeautyKefuSeed: { list: [], count: 0 },
  BeautyAiguideFeedbackSeed: { list: [], count: 0 },
  DbBridge: { pull() {}, push() {}, schedulePush() {} }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

const body = extractMainScript(html);
console.log('main script chars', body.length);

// Instrument: wrap in try/catch with line mapping via sourceURL is hard; instead run and catch
try {
  const script = new vm.Script(body, { filename: 'preview-main.js' });
  script.runInNewContext(sandbox, { timeout: 20000 });
  console.log('RUN_OK');
  console.log('has escapeHtml', typeof sandbox.escapeHtml);
  console.log('has renderKbTable', typeof sandbox.renderKbTable);
  console.log('has ensureExtraActTabPanels', typeof sandbox.ensureExtraActTabPanels);
  console.log('has openWorkspaceView', typeof sandbox.openWorkspaceView);
  // gift panel filled?
  const gift = sandbox.document.querySelector('[data-act-tab-content="gift"]');
  console.log('gift innerHTML len', gift && gift.innerHTML ? gift.innerHTML.length : 0);
} catch (e) {
  console.log('RUN_FAIL', e && e.message);
  console.log(e && e.stack);
}
