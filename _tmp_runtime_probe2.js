/**
 * Load all preview.html scripts in order under a minimal DOM; report first throw.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = __dirname;
const file = path.join(root, '运营管理系统', 'preview.html');
const html = fs.readFileSync(file, 'utf8');
const baseDir = path.join(root, '运营管理系统');

function makeEl(tag, id) {
  const attrs = {};
  const classSet = new Set();
  const el = {
    tagName: String(tag || 'div').toUpperCase(),
    id: id || '',
    style: { display: '', setProperty() {}, removeProperty() {} },
    value: '',
    checked: false,
    disabled: false,
    textContent: '',
    innerHTML: '',
    className: '',
    href: '',
    src: '',
    type: 'text',
    dataset: {},
    parentNode: { innerHTML: '', appendChild() {}, removeChild() {} },
    children: [],
    options: [],
    selectedIndex: 0,
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
    getAttribute(name) { return attrs[name] != null ? attrs[name] : null; },
    setAttribute(name, val) { attrs[name] = String(val); },
    removeAttribute(name) { delete attrs[name]; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    appendChild(child) { el.children.push(child); return child; },
    removeChild() {},
    insertBefore(n) { return n; },
    replaceChildren() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
    click() {},
    focus() {},
    blur() {},
    select() {},
    getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 40, bottom: 40, right: 100, x: 0, y: 0 }; },
    getContext() {
      return {
        fillRect() {}, clearRect() {}, fillText() {}, measureText() { return { width: 10 }; },
        beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {}, arc() {},
        drawImage() {}, createLinearGradient() { return { addColorStop() {} }; },
        save() {}, restore() {}, translate() {}, scale() {}, rotate() {},
        canvas: { width: 100, height: 100, toDataURL() { return 'data:image/png;base64,xx'; } }
      };
    },
    toDataURL() { return 'data:image/png;base64,xx'; },
    width: 100,
    height: 100
  };
  return el;
}

const byId = Object.create(null);
function ensureId(id) {
  if (!byId[id]) byId[id] = makeEl('div', id);
  return byId[id];
}

const panels = ['settings','product','merchant','order','review','aftersale','user','activity','decor','community','data','kefu','aiguide','humankf'].map((p) => {
  const el = makeEl('div');
  el.setAttribute('data-panel', p);
  if (p === 'product') el.classList.add('active');
  return el;
});
const menuItems = ['product','merchant','order','review','aftersale','user','activity','decor','community','data','kefu','aiguide','humankf'].map((m) => {
  const el = makeEl('div');
  el.setAttribute('data-menu', m);
  return el;
});
const settingsItems = ['brand','category','tag','dept','staff','role','llm','kb'].map((s) => {
  const el = makeEl('div');
  el.setAttribute('data-settings', s);
  if (s === 'brand') el.classList.add('active');
  return el;
});

ensureId('toggleBtn').querySelector = function () { return makeEl('span'); };
ensureId('menuList').querySelectorAll = function (sel) {
  if (sel === '.menu-item') return menuItems;
  return [];
};

function qsa(sel) {
  if (sel === '.panel-section') return panels;
  if (sel === '#settingsMenuList .settings-menu-item') return settingsItems;
  if (sel === '.menu-item') return menuItems;
  if (sel === '.dc-tab') {
    const el = makeEl('div');
    el.setAttribute('data-dctab', 'product');
    el.classList.add('active');
    return [el];
  }
  if (sel === '[data-act-tab-content]') {
    return ['manjian','manzhe','gift','pintuan','seckill','coupon'].map((t) => {
      const el = ensureId('actPanel_' + t);
      el.setAttribute('data-act-tab-content', t);
      el.querySelector = function (q) {
        if (q && q[0] === '#') return byId[q.slice(1)] || null;
        return null;
      };
      return el;
    });
  }
  return [];
}

const documentMock = {
  documentElement: makeEl('html'),
  head: makeEl('head'),
  body: makeEl('body'),
  readyState: 'complete',
  getElementById(id) { return ensureId(id); },
  querySelector(sel) {
    if (sel === '#settingsMenuList .settings-menu-item.active') return settingsItems[0];
    if (sel === '.dc-tab.active') {
      const el = makeEl('div');
      el.setAttribute('data-dctab', 'product');
      return el;
    }
    if (sel && sel.indexOf('[data-act-tab-content=') === 0) {
      const tab = sel.match(/"([^"]+)"/)[1];
      const el = ensureId('actPanel_' + tab);
      el.setAttribute('data-act-tab-content', tab);
      el.querySelector = function (q) {
        if (q && q[0] === '#') return byId[q.slice(1)] || null;
        return null;
      };
      return el;
    }
    if (sel && sel[0] === '#') return ensureId(sel.slice(1));
    return null;
  },
  querySelectorAll: qsa,
  createElement(tag) {
    const el = makeEl(tag);
    if (tag === 'canvas') {
      el.getContext = makeEl('canvas').getContext;
    }
    return el;
  },
  createElementNS() { return makeEl('svg'); },
  createTextNode(t) { return { textContent: t }; },
  createDocumentFragment() { return makeEl('fragment'); },
  addEventListener() {},
  removeEventListener() {}
};

const sandbox = {
  console: {
    log: (...a) => console.log('[page]', ...a),
    warn: (...a) => console.warn('[page]', ...a),
    error: (...a) => console.error('[page]', ...a),
    info: (...a) => console.log('[page]', ...a)
  },
  setTimeout, clearTimeout, setInterval, clearInterval,
  parseInt, Number, String, Boolean, Array, Object, JSON, Math, Date, RegExp,
  Error, TypeError, ReferenceError, SyntaxError, URIError,
  Promise, Map, Set, WeakMap, WeakSet, Symbol, Proxy, Reflect,
  Uint8Array, ArrayBuffer, DataView, TextEncoder, TextDecoder,
  encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
  isNaN, isFinite, Infinity, NaN, undefined,
  btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
  atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
  localStorage: {
    _d: Object.create(null),
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; },
    clear() { this._d = Object.create(null); },
    key() { return null; },
    get length() { return Object.keys(this._d).length; }
  },
  sessionStorage: {
    _d: Object.create(null),
    getItem(k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
    setItem(k, v) { this._d[k] = String(v); },
    removeItem(k) { delete this._d[k]; }
  },
  document: documentMock,
  navigator: { userAgent: 'node-probe', language: 'zh-CN' },
  location: { href: 'file:///preview.html', protocol: 'file:', search: '', hash: '', pathname: '/preview.html', origin: 'null' },
  history: { replaceState() {}, pushState() {} },
  alert() {}, confirm() { return false; }, prompt() { return null; },
  fetch: async () => ({ ok: false, status: 0, json: async () => ({}), text: async () => '', blob: async () => ({}) }),
  Image: function () { this.src = ''; this.onload = null; this.onerror = null; },
  HTMLElement: function () {},
  Node: { ELEMENT_NODE: 1 },
  Event: function (type) { this.type = type; },
  CustomEvent: function (type) { this.type = type; },
  MutationObserver: function () { this.observe = function () {}; this.disconnect = function () {}; },
  IntersectionObserver: function () { this.observe = function () {}; this.disconnect = function () {}; },
  ResizeObserver: function () { this.observe = function () {}; this.disconnect = function () {}; },
  requestAnimationFrame(cb) { return setTimeout(() => cb(Date.now()), 0); },
  cancelAnimationFrame(id) { clearTimeout(id); },
  getComputedStyle() { return { getPropertyValue() { return ''; }, display: 'block' }; },
  matchMedia() { return { matches: false, addListener() {}, addEventListener() {} }; },
  URL: URL,
  Blob: function () {},
  FileReader: function () { this.readAsDataURL = function () { this.onload && this.onload(); }; },
  DOMParser: function () { this.parseFromString = function () { return documentMock; }; },
  performance: { now: () => Date.now() },
  crypto: { getRandomValues(arr) { for (let i = 0; i < arr.length; i++) arr[i] = 1; return arr; } }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.top = sandbox;
sandbox.parent = sandbox;

function runCode(code, filename) {
  const script = new vm.Script(code, { filename });
  script.runInNewContext(sandbox, { timeout: 60000 });
}

const tagRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m;
let idx = 0;
while ((m = tagRe.exec(html))) {
  idx++;
  const attrs = m[1] || '';
  const body = m[2] || '';
  const srcM = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  try {
    if (srcM) {
      let src = srcM[1].replace(/\?.*$/, '');
      const abs = path.resolve(baseDir, src);
      if (!fs.existsSync(abs)) {
        console.log('MISSING_SRC', abs);
        continue;
      }
      const code = fs.readFileSync(abs, 'utf8');
      runCode(code, path.basename(abs));
      console.log('OK_SRC', path.basename(abs));
    } else if (body.trim()) {
      runCode(body, 'inline-' + idx + '.js');
      console.log('OK_INLINE', idx, 'len', body.length);
    }
  } catch (e) {
    console.log('FAIL', srcM ? srcM[1] : ('inline-' + idx), e.message);
    const stack = String(e.stack || '');
    const lineM = stack.match(/:(\d+):(\d+)/);
    console.log('STACK_TOP', stack.split('\n').slice(0, 8).join('\n'));
    if (lineM && !srcM) {
      const line = Number(lineM[1]);
      const lines = body.split(/\n/);
      const from = Math.max(1, line - 3);
      const to = Math.min(lines.length, line + 3);
      console.log('AROUND_FILE_LINE_HINT: inline script relative line', line);
      // Map to preview.html line: find script start
      const scriptStart = html.slice(0, m.index).split(/\n/).length + 1; // approx tag line
      console.log('approx html line of error', scriptStart + line);
      console.log(lines.slice(from - 1, to).map((l, i) => (from + i) + ': ' + l).join('\n'));
    }
    process.exitCode = 1;
    break;
  }
}

if (!process.exitCode) {
  console.log('ALL_OK');
  console.log('typeof escapeHtml', typeof sandbox.escapeHtml);
  console.log('typeof renderKbTable', typeof sandbox.renderKbTable);
  console.log('typeof ensureExtraActTabPanels', typeof sandbox.ensureExtraActTabPanels);
  const gift = sandbox.document.querySelector('[data-act-tab-content="gift"]');
  console.log('gift filled', !!(gift && gift.innerHTML && gift.innerHTML.length > 50), gift && gift.innerHTML.length);
}
