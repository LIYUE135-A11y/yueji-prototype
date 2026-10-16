/**
 * APP 端全部商品种子 · 运营后台商品管理列表读取
 * 与美丽修行app/common/product-data.js 及预览端榜单/试用等商品对齐
 */
(function (global) {
  var APP_IMG = '../美丽修行app/static/images/';

  function img(path) {
    return APP_IMG + String(path || 'lipstick-1.jpg').replace(/^\//, '').replace(/^static\/images\//, '');
  }

  /** APP 端全部商品（运营列表字段） */
  var APP_PRODUCT_SEED = [
    { id: 'p1', name: '经典正红丝绒口红', brand: '阅己', sku: 'YJ-P1-RED', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 129, stock: 2000, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('lipstick-1.jpg'), fav: 3260, review: 326, order: 21000, gmv: 2709000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'p2', name: '温柔裸粉口红礼盒', brand: '阅己', sku: 'YJ-P2-NUDE', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 199, stock: 1600, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('lipstick-2.jpg'), fav: 2180, review: 218, order: 14000, gmv: 2786000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'p3', name: '珊瑚莓果双色套装', brand: '阅己', sku: 'YJ-P3-DUAL', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 149, stock: 1800, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('lipstick-3.jpg'), fav: 1870, review: 187, order: 9800, gmv: 1460200, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'p4', name: '绒雾质感口红', brand: '阅己', sku: 'YJ-P4-MATTE', cat1: '彩妆', cat2: '唇部彩妆', cat3: '口红', price: 109, stock: 2200, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('lipstick-4.jpg'), fav: 2640, review: 264, order: 18000, gmv: 1962000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'mx1', name: '可复美重组胶原蛋白「绿印」修护次抛精华液', brand: '可复美', sku: 'KFM-MX1-GREEN', cat1: '护肤', cat2: '面部护肤', cat3: '精华', price: 485, stock: 860, merchant: '可复美旗舰店', merchantLetter: '可', coverUrl: img('product-trial-2.jpg'), fav: 9520, review: 7184, order: 95000, gmv: 46075000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'mx2', name: '薇诺娜舒敏保湿特护霜', brand: '薇诺娜', sku: 'WNN-MX2-50G', cat1: '护肤', cat2: '面部护肤', cat3: '乳液/面霜', price: 188, stock: 3200, merchant: '薇诺娜旗舰店', merchantLetter: '薇', coverUrl: img('products/skincare-1.jpg'), fav: 5612, review: 3280, order: 56000, gmv: 10528000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'mx3', name: 'HEY:REAL B5精华液', brand: 'HEY:REAL', sku: 'HR-MX3-B5', cat1: '护肤', cat2: '面部护肤', cat3: '精华', price: 159, stock: 2800, merchant: 'HEY:REAL旗舰店', merchantLetter: 'H', coverUrl: img('products/essence-1.jpg'), fav: 3340, review: 2106, order: 33000, gmv: 5247000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-olay-body', name: 'OLAY美白焕亮精华身体乳', brand: 'OLAY', sku: 'OLAY-BODY-260', cat1: '护肤', cat2: '身体护理', cat3: '身体乳', price: 165, stock: 4500, merchant: 'OLAY官方旗舰店', merchantLetter: 'O', coverUrl: img('products/body-lotion-1.jpg'), fav: 2154, review: 1491, order: 12000, gmv: 1980000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-songda', name: '松达婴儿山茶油霜', brand: '松达', sku: 'SD-BABY-68', cat1: '护肤', cat2: '婴童护理', cat3: '面霜', price: 98, stock: 5600, merchant: '松达官方旗舰店', merchantLetter: '松', coverUrl: img('products/baby-1.jpg'), fav: 3890, review: 2103, order: 18000, gmv: 1764000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-hxz-fd', name: '花西子养肤粉底液', brand: '花西子', sku: 'HXZ-FD-30', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', price: 159, stock: 3800, merchant: '花西子国风旗舰店', merchantLetter: '西', coverUrl: img('products/foundation-1.jpg'), fav: 2941, review: 1876, order: 15000, gmv: 2385000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-hualan', name: '花兰槿养肤粉底液', brand: '花兰槿', sku: 'HLJ-FD-30', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', price: 289, stock: 1200, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('products/foundation-1.jpg'), fav: 1860, review: 920, order: 6800, gmv: 1965200, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-sunscreen', name: '轻薄防晒乳 SPF50+', brand: '阅己', sku: 'YJ-SF-50', cat1: '护肤', cat2: '面部护肤', cat3: '防晒', price: 128, stock: 4200, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('products/sunscreen-1.jpg'), fav: 4520, review: 1680, order: 22000, gmv: 2816000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-mist', name: '清爽保湿喷雾', brand: '阅己', sku: 'YJ-MIST-01', cat1: '护肤', cat2: '面部护肤', cat3: '喷雾', price: 69, stock: 6800, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('products/skincare-2.jpg'), fav: 3120, review: 980, order: 16000, gmv: 1104000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-fenty', name: 'FENTY美妆滤镜大师柔光持久粉底液440', brand: 'FENTY', sku: 'FENTY-FD-440', cat1: '彩妆', cat2: '面部彩妆', cat3: '粉底', price: 320, stock: 680, merchant: 'FENTY BEAUTY旗舰店', merchantLetter: 'F', coverUrl: img('lipstick-1.jpg'), fav: 2180, review: 860, order: 5200, gmv: 1664000, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-trial-box', name: '第九期美修盒试用装', brand: '阅己', sku: 'YJ-TRIAL-09', cat1: '护肤', cat2: '试用装', cat3: '套装', price: 50, stock: 50, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('product-trial-1.jpg'), fav: 8900, review: 2400, order: 50, gmv: 2500, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-trial-box-10', name: '第十期美修盒试用装', brand: '阅己', sku: 'YJ-TRIAL-10', cat1: '护肤', cat2: '试用装', cat3: '套装', price: 50, stock: 50, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('product-trial-2.jpg'), fav: 6200, review: 0, order: 0, gmv: 0, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-mask', name: '急救修护面膜', brand: '阅己', sku: 'YJ-MASK-01', cat1: '护肤', cat2: '面部护肤', cat3: '面膜', price: 89, stock: 3500, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('products/mask-1.jpg'), fav: 2760, review: 1120, order: 9800, gmv: 872200, status: '已上架', auditStatus: '审核通过', source: 'app' },
    { id: 'app-gift', name: '七夕限定护肤礼盒', brand: '阅己', sku: 'YJ-QIXI-01', cat1: '护肤', cat2: '礼盒套装', cat3: '套装', price: 299, stock: 800, merchant: '阅己美妆旗舰店', merchantLetter: '阅', coverUrl: img('qixi-ad.jpg'), fav: 1680, review: 420, order: 2600, gmv: 777400, status: '已上架', auditStatus: '审核通过', source: 'app' }
  ];

  function normalizeAudit(p) {
    var next = Object.assign({}, p);
    if (next.auditStatus === '审核通过') {
      next.auditKey = 'pass';
      next.status = next.status || '已上架';
    } else if (next.auditStatus === '审核未通过') {
      next.auditKey = 'fail';
      next.status = '已下架';
    } else if (next.auditStatus === '已驳回') {
      next.auditKey = 'reject';
      next.status = '已下架';
    } else {
      next.auditKey = next.auditKey || 'pending';
      next.auditStatus = next.auditStatus || '待审核';
      if (!next.status) next.status = '已下架';
    }
    if (next.coverUrl && !next.cover) next.cover = next.coverUrl;
    if (next.coverUrl && !next.syncCover) next.syncCover = next.coverUrl;
    return next;
  }

  function list() {
    return APP_PRODUCT_SEED.map(normalizeAudit);
  }

  /**
   * 将 APP 商品合并进运营列表：APP 商品优先保留/补齐，再保留运营原有其它商品
   */
  function mergeInto(existingList) {
    var map = {};
    var order = [];
    var appList = list();
    for (var i = 0; i < appList.length; i++) {
      var ap = appList[i];
      map[String(ap.id)] = ap;
      order.push(String(ap.id));
    }
    (existingList || []).forEach(function (p) {
      if (!p) return;
      var id = String(p.id || p.sku || '');
      if (!id) return;
      if (!map[id]) {
        map[id] = normalizeAudit(p);
        order.push(id);
      } else {
        // APP 种子为主，补运营侧可能改过的库存/状态等可选字段不覆盖 name/cover
        var base = map[id];
        if (p.stock != null && base.source === 'app') {
          /* keep app seed defaults unless ops already customized non-app */
        }
      }
    });
    return order.map(function (id) { return map[id]; }).filter(Boolean);
  }

  global.AppProductSeed = {
    APP_IMG_BASE: APP_IMG,
    list: list,
    mergeInto: mergeInto,
    SEED: APP_PRODUCT_SEED
  };
})(typeof window !== 'undefined' ? window : this);
