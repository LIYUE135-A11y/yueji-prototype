/**
 * 商品列表 · 运营后台 ↔ App 共享数据层
 * 通过 localStorage + postMessage 同步
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_product_list_v2';
  var LEGACY_KEYS = ['zhuangyan_product_list_v1'];
  var SYNC_MSG = 'product-sync';
  var REQUEST_MSG = 'product-request-sync';

  var SP_FILE_MAP = {
    sp100001: 'sp100001', sp100002: 'sp100002', sp100003: 'sp100003', sp100004: 'sp100004',
    sp100005: 'sp100005', sp100006: 'sp100006', sp100007: 'sp100007', sp100008: 'sp100008',
    sp100009: 'sp100009', sp100010: 'sp100010', sp100011: 'sp100011', sp100012: 'sp100012',
    sp100013: 'sp100013', sp100014: 'sp100014', sp100015: 'sp100015', sp100016: 'sp100016',
    sp100017: 'sp100017', sp100018: 'sp100018', sp100019: 'sp100019', sp100020: 'sp100020',
    sp100021: 'sp100021', sp100022: 'sp100022', sp100023: 'sp100023', sp100024: 'sp100024',
    sp100028: 'lm-cz-03wt', sp100029: 'bbs-bs-nb-96', sp100030: 'scx-mh-450x2',
    sp100031: 'sy-jj-4p-45', sp100032: 'sfj-xz-125x6', sp100033: 'keb-vc-100x3',
    sp100034: 'hxz-qd-tj-b25x2', sp100035: 'zrt-ns-lh-4p', sp100036: 'lm-jc-150ml'
  };

  var SKU_FILE_MAP = {
    'sk2-ess-230-01': 'sp100001', 'lc-gx-50-009': 'sp100002', 'el-eye-15-022': 'sp100003',
    'wm-rj-01-n': 'sp100004', 'hxz-ks-m301': 'sp100005', 'zrt-bs-160-a': 'sp100006',
    'wm-jm-120-03': 'sp100007', 'zrt-mm-10p-b5': 'sp100008', 'lm-kf-50ml': 'sp100009',
    'loreal-fy-110m': 'sp100010', 'xlk-sx-30ml': 'sp100011', 'crl-jm-150ml': 'sp100012',
    'el-xzp-75b': 'sp100013', 'hxz-qd-c30': 'sp100014', 'sk2-dhp-80g-a': 'sp100015',
    'lk-jc-60-m': 'sp100016', 'wm-rj-12-yt': 'sp100017', 'xlk-ce-30ml': 'sp100018',
    'crl-ms-40g': 'sp100019', 'loreal-hj-50ml': 'sp100020', 'zrt-ns-120g': 'sp100021',
    'lm-ms-60ml': 'sp100022', 'hxz-xs-50ml': 'sp100023', 'sk2-mm-10p': 'sp100024'
  };

  function resolveProductFile(key) {
    var raw = String(key || '').trim();
    if (!raw) return 'sp100001';
    var lower = raw.toLowerCase();
    if (/^sp\d{6}$/.test(lower)) return SP_FILE_MAP[lower] || lower;
    if (SKU_FILE_MAP[lower]) return SKU_FILE_MAP[lower];
    return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sp100001';
  }

  function cloneProduct(p) {
    var file = resolveProductFile(p.id || p.sku);
    var benefits = [];
    if (Array.isArray(p.benefits)) {
      for (var bi = 0; bi < p.benefits.length; bi++) {
        var bv = String(p.benefits[bi] || '').replace(/^\s+|\s+$/g, '');
        if (bv && benefits.indexOf(bv) < 0) benefits.push(bv);
      }
    }
    var singleBenefit = String(p.benefit || '').replace(/^\s+|\s+$/g, '');
    if (singleBenefit) {
      var parts = singleBenefit.split(/[、,，|/]/);
      for (var pi = 0; pi < parts.length; pi++) {
        var pv = String(parts[pi] || '').replace(/^\s+|\s+$/g, '');
        if (pv && benefits.indexOf(pv) < 0) benefits.push(pv);
      }
    }
    return {
      id: p.id,
      spuId: p.spuId || '',
      name: p.name,
      subtitle: p.subtitle || '',
      brand: p.brand || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      unit: p.unit || '',
      cat1: p.cat1 || '',
      cat2: p.cat2 || '',
      cat3: p.cat3 || '',
      spec: p.spec || '',
      netContent: p.netContent || '',
      packType: p.packType || '',
      shade: p.shade || '',
      texture: p.texture || '',
      finish: p.finish || '',
      spf: p.spf || '',
      pa: p.pa || '',
      skinTypes: p.skinTypes || '',
      scene: p.scene || '',
      keyIngredients: p.keyIngredients || '',
      efficacy: p.efficacy || '',
      fragrance: p.fragrance || '',
      suitAge: p.suitAge || '',
      origin: p.origin || '',
      manufacturer: p.manufacturer || '',
      shelfLife: p.shelfLife || '',
      batchNo: p.batchNo || '',
      nmpaNo: p.nmpaNo || '',
      isDutyFree: p.isDutyFree || '',
      price: p.price,
      originPrice: p.originPrice,
      memberPrice: p.memberPrice,
      costPrice: p.costPrice,
      stock: p.stock,
      stockWarn: p.stockWarn,
      salesChannel: p.salesChannel || '',
      weightG: p.weightG,
      shipFrom: p.shipFrom || '',
      freightTpl: p.freightTpl || '',
      returnPolicy: p.returnPolicy || '',
      isGift: p.isGift || '',
      tags: p.tags || '',
      recommendScore: p.recommendScore,
      shelfTime: p.shelfTime || '',
      updateTime: p.updateTime || '',
      buyerShow: p.buyerShow,
      merchant: p.merchant || '',
      merchantLetter: p.merchantLetter || '',
      cover: p.cover || '',
      coverUrl: p.coverUrl || '',
      syncCover: p.syncCover || ('./static/products/' + file + '.jpg'),
      fav: p.fav,
      review: p.review,
      order: p.order,
      gmv: p.gmv,
      status: p.status || '',
      auditStatus: p.auditStatus || '',
      auditKey: p.auditKey || '',
      auditRemark: p.auditRemark || '',
      /* 运营「商品管理·权益」→ App 商品详情 */
      benefit: benefits.length ? benefits.join('、') : '',
      benefits: benefits,
      activityType: p.activityType || '',
      source: p.source || ''
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed.map(cloneProduct);
      }
      for (var li = 0; li < LEGACY_KEYS.length; li++) {
        var legacy = localStorage.getItem(LEGACY_KEYS[li]);
        if (!legacy) continue;
        var old = JSON.parse(legacy);
        if (Array.isArray(old) && old.length) return old.map(cloneProduct);
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(list) {
    var snapshot = (list || []).map(cloneProduct);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) { /* ignore */ }
    broadcast(snapshot);
  }

  function broadcast(list) {
    var payload = { type: SYNC_MSG, products: (list || load()).map(cloneProduct) };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('product-updated', { detail: payload.products }));
    } catch (e2) { /* ignore */ }
  }

  function normalizeImgBase(imgBase) {
    var base = imgBase || './static/products/';
    if (base.charAt(base.length - 1) !== '/') base += '/';
    return base;
  }

  function coverFromSyncPath(syncPath, imgBase) {
    if (!syncPath) return '';
    var sc = String(syncPath);
    /* 历史外链文生图：不再直出，交给 resolveCover 走本地文件 */
    if (/trae-api|text_to_image|mchost\.guru/i.test(sc)) return '';
    if (/^data:/i.test(sc)) return sc;
    if (/^https?:/i.test(sc)) return '';
    var match = sc.match(/static\/products\/([^?#/]+)/i);
    if (match) return normalizeImgBase(imgBase) + match[1];
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(sc)) return normalizeImgBase(imgBase) + sc.replace(/^.*\//, '');
    return '';
  }

  /** 与后台 getProductCover 一致：coverUrl > syncCover > ID/SKU 本地映射 */
  function resolveCover(product, imgBase) {
    imgBase = normalizeImgBase(imgBase);
    if (!product) return imgBase + 'sp100001.jpg';
    var candidates = [product.coverUrl, product.syncCover, product.cover];
    var i;
    for (i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (!c) continue;
      var s = String(c);
      if (/^data:/i.test(s)) return s;
      if (/trae-api|text_to_image|mchost\.guru|^https?:/i.test(s)) continue;
      if (/\/static\//i.test(s) || /^\.\/static\//i.test(s) || /美丽修行app\/static\//i.test(s)) return s;
      var local = coverFromSyncPath(s, imgBase);
      if (local) return local;
    }
    var file = resolveProductFile(product.id || product.sku);
    return imgBase + file + '.jpg';
  }

  /** 运营端「已下架」→ App 不可售；空状态视为可售 */
  function isOffShelf(p) {
    if (!p) return true;
    var s = String(p.status || '');
    return s.indexOf('下架') >= 0;
  }

  function isOnShelf(p) {
    return !isOffShelf(p);
  }

  function filterForAppHome(list, limit) {
    var max = limit || 4;
    var result = [];
    for (var i = 0; i < (list || []).length; i++) {
      if (isOnShelf(list[i])) result.push(list[i]);
      if (result.length >= max) break;
    }
    return result;
  }

  /** App 列表用：仅保留上架商品 */
  function filterOnShelf(list) {
    var result = [];
    for (var i = 0; i < (list || []).length; i++) {
      if (isOnShelf(list[i])) result.push(list[i]);
    }
    return result;
  }

  function findProduct(list, key, title) {
    var raw = String(key || '').trim();
    var lower = raw.toLowerCase();
    if (!list || !list.length) return null;
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (lower && (String(p.id).toLowerCase() === lower || String(p.sku).toLowerCase() === lower)) return p;
    }
    if (title) {
      var t = String(title);
      for (var j = 0; j < list.length; j++) {
        var item = list[j];
        if (t.indexOf(item.name.substring(0, 8)) >= 0 || item.name.indexOf(t.substring(0, 8)) >= 0) return item;
      }
    }
    return null;
  }

  function appImg(path) {
    return '../美丽修行app/' + String(path || '').replace(/^\//, '');
  }

  /** APP 端全部商品（百科 / 榜单 / 详情），运营商品管理列表以此合并展示 */
  function getAppProductSeed() {
    return [
      { id: 'p1', name: '经典正红丝绒口红', brand: '阅己', sku: 'APP-P1', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 129, stock: 1200, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-1.jpg'), syncCover: appImg('static/images/lipstick-1.jpg'), fav: 3260, review: 326, order: 21000, gmv: 2709000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'p2', name: '温柔裸粉口红礼盒', brand: '阅己', sku: 'APP-P2', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 199, stock: 860, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-2.jpg'), syncCover: appImg('static/images/lipstick-2.jpg'), fav: 2180, review: 218, order: 14000, gmv: 2786000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'p3', name: '珊瑚莓果双色套装', brand: '阅己', sku: 'APP-P3', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 149, stock: 980, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-3.jpg'), syncCover: appImg('static/images/lipstick-3.jpg'), fav: 1870, review: 187, order: 9800, gmv: 1460200, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'p4', name: '绒雾质感口红', brand: '阅己', sku: 'APP-P4', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 109, stock: 1560, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: appImg('static/images/lipstick-4.jpg'), syncCover: appImg('static/images/lipstick-4.jpg'), fav: 2640, review: 264, order: 18000, gmv: 1962000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'mx1', name: '可复美重组胶原蛋白「绿印」修护次抛精华液', brand: '可复美', sku: 'APP-MX1', cat1: '护肤', cat2: '面部护肤', cat3: '精华', price: 485, stock: 420, merchant: '可复美官方旗舰店', merchantLetter: '可', coverUrl: appImg('static/images/product-trial-2.jpg'), syncCover: appImg('static/images/product-trial-2.jpg'), fav: 9520, review: 7184, order: 95000, gmv: 46075000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'mx2', name: '薇诺娜舒敏保湿特护霜', brand: '薇诺娜', sku: 'APP-MX2', cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜', price: 188, stock: 680, merchant: '薇诺娜官方旗舰店', merchantLetter: '薇', coverUrl: appImg('static/images/products/skincare-1.jpg'), syncCover: appImg('static/images/products/skincare-1.jpg'), fav: 5612, review: 3280, order: 56000, gmv: 10528000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'mx3', name: 'HEY:REAL B5精华液', brand: 'HEY:REAL', sku: 'APP-MX3', cat1: '护肤', cat2: '面部护肤', cat3: '精华', price: 159, stock: 920, merchant: 'HEY:REAL官方店', merchantLetter: 'H', coverUrl: appImg('static/images/product-flash-2.jpg'), syncCover: appImg('static/images/product-flash-2.jpg'), fav: 3340, review: 2106, order: 33000, gmv: 5247000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'r1', name: 'OLAY美白焕亮精华身体乳', brand: 'OLAY', sku: 'APP-R1', cat1: '护肤', cat2: '身体护理', cat3: '身体乳', price: 165, stock: 1100, merchant: 'OLAY官方旗舰店', merchantLetter: 'O', coverUrl: appImg('static/images/product-trial-1.jpg'), syncCover: appImg('static/images/product-trial-1.jpg'), fav: 2154, review: 1491, order: 8200, gmv: 1353000, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'r5', name: '松达婴儿山茶油霜', brand: '松达', sku: 'APP-R5', cat1: '护肤', cat2: '身体护理', cat3: '身体乳', price: 98, stock: 2400, merchant: '松达母婴旗舰店', merchantLetter: '松', coverUrl: appImg('static/images/product-flash-1.jpg'), syncCover: appImg('static/images/product-flash-1.jpg'), fav: 3890, review: 2103, order: 15600, gmv: 1528800, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' },
      { id: 'r6', name: '花西子养肤粉底液', brand: '花西子', sku: 'APP-R6', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', price: 159, stock: 1800, merchant: '花西子国风旗舰店', merchantLetter: '西', coverUrl: appImg('static/images/products/foundation-1.jpg'), syncCover: appImg('static/images/products/foundation-1.jpg'), fav: 2941, review: 1876, order: 12400, gmv: 1971600, status: '已上架', auditStatus: '审核通过', auditKey: 'pass' }
    ];
  }

  /** APP 种子在前，再并入运营/本地已有商品（按 id 去重） */
  function mergeAppProducts(list) {
    var seed = getAppProductSeed();
    var map = {};
    var order = [];
    var i;
    for (i = 0; i < seed.length; i++) {
      var sid = String(seed[i].id);
      map[sid] = cloneProduct(seed[i]);
      order.push(sid);
    }
    for (i = 0; i < (list || []).length; i++) {
      var p = list[i];
      if (!p || p.id == null || p.id === '') continue;
      var id = String(p.id);
      if (map[id]) {
        var merged = cloneProduct(p);
        var base = map[id];
        if (!merged.cat1) merged.cat1 = base.cat1;
        if (!merged.cat2) merged.cat2 = base.cat2;
        if (!merged.cat3) merged.cat3 = base.cat3;
        if (!merged.brand) merged.brand = base.brand;
        if (!merged.sku) merged.sku = base.sku;
        if (!merged.coverUrl && base.coverUrl) merged.coverUrl = base.coverUrl;
        if (!merged.syncCover && base.syncCover) merged.syncCover = base.syncCover;
        if (!merged.merchant) merged.merchant = base.merchant;
        if (!merged.merchantLetter) merged.merchantLetter = base.merchantLetter;
        if (!merged.status) merged.status = base.status;
        if (!merged.auditStatus) merged.auditStatus = base.auditStatus;
        if (!merged.auditKey) merged.auditKey = base.auditKey;
        map[id] = merged;
      } else {
        map[id] = cloneProduct(p);
        order.push(id);
      }
    }
    var result = [];
    for (i = 0; i < order.length; i++) result.push(map[order[i]]);
    return result;
  }

  function normKey(v) {
    return String(v || '').trim().toUpperCase().replace(/[\s\-_/·．.]+/g, '');
  }

  function collectBrands(list) {
    var seen = {};
    var brands = [];
    for (var i = 0; i < (list || []).length; i++) {
      var b = String((list[i] && list[i].brand) || '').trim();
      if (!b || seen[b]) continue;
      seen[b] = true;
      brands.push(b);
    }
    brands.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
    brands.push('其他品牌');
    return brands;
  }

  /** 品牌 + 批号 → 匹配商品管理列表（批号≈batchNo/sku/id） */
  function queryByBrandAndBatch(brand, batchNo, list, imgBase) {
    var brandRaw = String(brand || '').trim();
    var batchRaw = String(batchNo || '').trim();
    if (!brandRaw || !batchRaw) return [];
    var pool = list && list.length ? list : mergeAppProducts(load());
    var batchKey = normKey(batchRaw);
    var brandOther = brandRaw === '其他品牌';
    var brandKey = normKey(brandRaw);
    var hits = [];
    for (var i = 0; i < pool.length; i++) {
      var p = pool[i];
      if (!p) continue;
      if (!brandOther && normKey(p.brand) !== brandKey) continue;
      var keys = [p.batchNo, p.sku, p.id, p.lotNo];
      var matched = false;
      for (var k = 0; k < keys.length; k++) {
        var key = normKey(keys[k]);
        if (!key) continue;
        if (key === batchKey || key.indexOf(batchKey) >= 0 || batchKey.indexOf(key) >= 0) {
          matched = true;
          break;
        }
      }
      if (!matched) continue;
      hits.push({
        id: p.id,
        name: p.name,
        brand: p.brand || '',
        sku: p.sku || '',
        price: p.price,
        status: p.status || '',
        cover: resolveCover(p, imgBase || '../运营管理系统/static/products/')
      });
    }
    return hits;
  }

  /** 关键词搜索商品管理列表（名称/品牌/SKU/ID/分类/商家） */
  function searchByKeyword(keyword, list, opts) {
    opts = opts || {};
    var q = String(keyword || '').trim();
    if (!q) return [];
    var pool = list && list.length ? list : mergeAppProducts(load());
    var imgBase = opts.imgBase || '../运营管理系统/static/products/';
    var onlyOnShelf = !!opts.onlyOnShelf;
    var limit = opts.limit || 50;
    var qLower = q.toLowerCase();
    var qKey = normKey(q);
    var scored = [];
    for (var i = 0; i < pool.length; i++) {
      var p = pool[i];
      if (!p) continue;
      if (onlyOnShelf && isOffShelf(p)) continue;
      var fields = [p.name, p.brand, p.sku, p.id, p.cat1, p.cat2, p.cat3, p.merchant, p.batchNo, p.subtitle, p.tags, p.shade, p.skinTypes, p.keyIngredients, p.efficacy];
      var score = 0;
      for (var f = 0; f < fields.length; f++) {
        var raw = String(fields[f] || '');
        if (!raw) continue;
        var fl = raw.toLowerCase();
        var fk = normKey(raw);
        if (fl === qLower || fk === qKey) score += 100 - f;
        else if (fl.indexOf(qLower) >= 0 || (qKey && fk.indexOf(qKey) >= 0)) score += 40 - f;
      }
      if (score <= 0) continue;
      scored.push({
        score: score,
        item: {
          id: p.id,
          name: p.name,
          brand: p.brand || '',
          sku: p.sku || '',
          price: p.price,
          status: p.status || '',
          cat3: p.cat3 || '',
          cover: resolveCover(p, imgBase)
        }
      });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    var out = [];
    for (var j = 0; j < scored.length && j < limit; j++) out.push(scored[j].item);
    return out;
  }

  /** 合并两份商品列表：preferred 优先；extras 中仅 id 不存在的条目追加到前面（避免运营新增被 App 旧缓存冲掉） */
  function unionById(preferred, extras) {
    var map = {};
    var out = [];
    var i;
    function pushOne(p, toFront) {
      if (!p || p.id == null || p.id === '') return;
      var id = String(p.id);
      if (map[id]) return;
      map[id] = 1;
      var row = cloneProduct(p);
      if (toFront) out.unshift(row);
      else out.push(row);
    }
    for (i = 0; i < (preferred || []).length; i++) pushOne(preferred[i], false);
    var localOnly = [];
    for (i = 0; i < (extras || []).length; i++) {
      var ex = extras[i];
      if (!ex || ex.id == null || ex.id === '') continue;
      if (map[String(ex.id)]) continue;
      localOnly.push(cloneProduct(ex));
      map[String(ex.id)] = 1;
    }
    return localOnly.concat(out);
  }

  global.ProductStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    load: load,
    save: save,
    broadcast: broadcast,
    cloneProduct: cloneProduct,
    getAppProductSeed: getAppProductSeed,
    mergeAppProducts: mergeAppProducts,
    unionById: unionById,
    resolveCover: resolveCover,
    resolveProductFile: resolveProductFile,
    isOffShelf: isOffShelf,
    isOnShelf: isOnShelf,
    filterForAppHome: filterForAppHome,
    filterOnShelf: filterOnShelf,
    findProduct: findProduct,
    collectBrands: collectBrands,
    queryByBrandAndBatch: queryByBrandAndBatch,
    searchByKeyword: searchByKeyword
  };
})(typeof window !== 'undefined' ? window : this);
