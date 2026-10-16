/**

 * 我的 · 个人购物车

 * App 本地持久化（localStorage / uni storage）

 */

(function (global) {

  var STORAGE_KEY = 'zhuangyan_profile_cart_v1';

  var UPDATE_MSG = 'profile-cart-updated';



  function cloneItem(item) {

    return {

      id: String(item.id || item.productId || ''),

      productId: String(item.productId || item.id || ''),

      title: item.title || item.name || '',

      subTitle: item.subTitle || '',

      img: item.img || item.cover || '',

      basePrice: item.basePrice != null ? String(item.basePrice) : '',

      price: String(item.price != null ? item.price : '0'),

      originPrice: item.originPrice != null ? String(item.originPrice) : '',

      couponId: item.couponId ? String(item.couponId) : '',

      couponTag: item.couponTag ? String(item.couponTag) : '',

      spec: item.spec || '标准装',

      brand: item.brand || '',

      cat1: item.cat1 || '',

      cat2: item.cat2 || '',

      cat3: item.cat3 || '',

      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,

      addedAt: item.addedAt || Date.now()

    };

  }



  function load(activityList) {

    var list = [];

    try {

      var raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {

        var parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) list = parsed.map(cloneItem);

      }

    } catch (e) { /* ignore */ }

    if (list.length && typeof ActivityStore !== 'undefined') {

      var activities = activityList || ActivityStore.load();

      var changed = false;

      for (var i = 0; i < list.length; i++) {

        var item = list[i];

        var meta = ActivityStore.buildProductMetaFromCartItem

          ? ActivityStore.buildProductMetaFromCartItem(item)

          : { brand: item.brand, cat3: item.spec, subTitle: item.subTitle };

        var before = String(item.price) + '|' + String(item.couponTag) + '|' + String(item.couponId);

        applyCouponFields(item, meta, activities);

        if (String(item.price) + '|' + String(item.couponTag) + '|' + String(item.couponId) !== before) changed = true;

      }

      if (changed) {

        try {

          localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(cloneItem)));

        } catch (e) { /* ignore */ }

      }

    }

    return list.map(cloneItem);

  }



  function save(list) {

    var snapshot = (list || []).map(cloneItem);

    try {

      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));

    } catch (e) { /* ignore */ }

    notify(snapshot);

    return snapshot;

  }



  function notify(list) {

    try {

      global.dispatchEvent(new CustomEvent(UPDATE_MSG, { detail: (list || load()).map(cloneItem) }));

    } catch (e) { /* ignore */ }

  }



  function findIndex(list, productId, spec) {

    var pid = String(productId || '');

    var sp = spec || '标准装';

    for (var i = 0; i < list.length; i++) {

      if (String(list[i].productId) === pid && (list[i].spec || '标准装') === sp) return i;

    }

    return -1;

  }



  function buildProductMeta(product) {

    if (!product) return {};

    var spec = product.spec || product.cat3 || product.cat2 || '标准装';

    return {

      cat1: product.cat1 || '',

      cat2: product.cat2 || '',

      cat3: product.cat3 || spec,

      brand: product.brand || '',

      subTitle: product.subTitle || ((product.brand || '') + (spec ? ' · ' + spec : ''))

    };

  }



  function applyCouponFields(item, productMeta, activityList) {

    var base = Number(item.basePrice || item.price) || 0;

    if (typeof ActivityStore !== 'undefined' && ActivityStore.applyClaimedCouponToPricing) {

      var pricing = ActivityStore.applyClaimedCouponToPricing(base, item.productId, productMeta, activityList);

      var displayTag = ActivityStore.getDisplayCouponTag
        ? ActivityStore.getDisplayCouponTag(item.productId, productMeta, activityList, base)
        : (pricing.couponTag || '');

      item.basePrice = String(pricing.basePrice);

      item.price = String(pricing.price);

      item.originPrice = String(pricing.originPrice);

      item.couponId = pricing.couponId || '';

      item.couponTag = displayTag || '';

    } else {

      item.basePrice = String(base);

      if (!item.originPrice) item.originPrice = String(Math.round(Number(base) * 1.35));

    }

    return item;

  }



  function refreshCoupons(productId, activityList) {

    var list = load();

    var changed = false;

    for (var i = 0; i < list.length; i++) {

      var item = list[i];

      if (productId && String(item.productId) !== String(productId)) continue;

      var meta = (typeof ActivityStore !== 'undefined' && ActivityStore.buildProductMetaFromCartItem)

        ? ActivityStore.buildProductMetaFromCartItem(item)

        : { brand: item.brand, cat3: item.spec, subTitle: item.subTitle };

      var before = String(item.price) + '|' + String(item.couponTag);

      applyCouponFields(item, meta, activityList);

      if (String(item.price) + '|' + String(item.couponTag) !== before) changed = true;

    }

    return changed ? save(list) : list;

  }



  function mapProductToCartItem(product, cover, activityList) {
    if (!product) return null;
    var spec = product.spec || product.cat3 || product.cat2 || '标准装';
    var meta = buildProductMeta(product);
    var basePrice = product.price != null ? product.price : '0';
    var rawTitle = product.title || product.name || '';
    var promoTitle = '';
    if (typeof global.ProfileOrderSync !== 'undefined' && global.ProfileOrderSync.isPromoLikeTitle &&
        global.ProfileOrderSync.isPromoLikeTitle(rawTitle)) {
      promoTitle = rawTitle;
      rawTitle = '';
    }
    if (!rawTitle && typeof global.ProductStore !== 'undefined' && global.ProductStore.findProduct) {
      var catalog = global.ProductStore.findProduct(
        global.ProductStore.mergeAppProducts ? global.ProductStore.mergeAppProducts(global.ProductStore.load()) : global.ProductStore.load(),
        product.id || product.sku || '',
        ''
      );
      if (catalog && catalog.name) {
        rawTitle = catalog.name;
        if (!product.brand && catalog.brand) meta = buildProductMeta(Object.assign({}, product, catalog));
        if (!cover) cover = catalog.cover || catalog.coverUrl || cover;
      }
    }
    if (!rawTitle) rawTitle = '精选美妆商品';
    var item = cloneItem({
      id: String(product.id || product.sku || ''),
      productId: String(product.id || product.sku || ''),
      title: rawTitle,
      subTitle: meta.subTitle,
      img: cover || product.img || product.cover || product.coverUrl || '',
      basePrice: String(basePrice),
      price: String(basePrice),
      originPrice: product.originPrice != null ? String(product.originPrice) : '',
      spec: spec,
      brand: product.brand || '',
      cat1: product.cat1 || '',
      cat2: product.cat2 || '',
      cat3: product.cat3 || spec,
      quantity: 1,
      addedAt: Date.now(),
      couponTag: product.couponTag || promoTitle || ''
    });
    applyCouponFields(item, meta, activityList);
    if (promoTitle && !item.couponTag) item.couponTag = promoTitle;
    return item;
  }



  function addProduct(product, cover, activityList) {

    var item = mapProductToCartItem(product, cover, activityList);

    if (!item || !item.productId) return load();

    var list = load();

    var idx = findIndex(list, item.productId, item.spec);

    if (idx >= 0) {

      list[idx].quantity = (Number(list[idx].quantity) || 1) + 1;

      list[idx].addedAt = Date.now();

      list[idx].title = item.title;

      list[idx].subTitle = item.subTitle;

      list[idx].img = item.img;

      list[idx].basePrice = item.basePrice;

      list[idx].price = item.price;

      list[idx].originPrice = item.originPrice;

      list[idx].couponId = item.couponId;

      list[idx].couponTag = item.couponTag;

    } else {

      list.unshift(item);

    }

    return save(list);

  }



  function removeItem(productId, spec) {

    var pid = String(productId || '');

    var list = load().filter(function (item) {

      if (String(item.productId) !== pid) return true;

      if (spec && (item.spec || '标准装') !== spec) return true;

      return false;

    });

    return save(list);

  }



  function getCount() {

    return load().reduce(function (sum, item) {

      return sum + (Number(item.quantity) || 1);

    }, 0);

  }



  function getTotalPrice() {

    return load().reduce(function (sum, item) {

      var price = Number(item.price) || 0;

      var qty = Number(item.quantity) || 1;

      return sum + price * qty;

    }, 0);

  }



  function changeQuantity(productId, spec, delta) {

    var list = load();

    var idx = findIndex(list, productId, spec);

    if (idx < 0) return list;

    var qty = (Number(list[idx].quantity) || 1) + delta;

    if (qty <= 0) return removeItem(productId, spec);

    list[idx].quantity = qty;

    return save(list);

  }



  function clear() {

    return save([]);

  }



  global.ProfileCartStore = {

    STORAGE_KEY: STORAGE_KEY,

    UPDATE_MSG: UPDATE_MSG,

    load: load,

    save: save,

    addProduct: addProduct,

    removeItem: removeItem,

    changeQuantity: changeQuantity,

    refreshCoupons: refreshCoupons,

    clear: clear,

    getCount: getCount,

    getTotalPrice: getTotalPrice,

    mapProductToCartItem: mapProductToCartItem,

    cloneItem: cloneItem

  };

})(typeof window !== 'undefined' ? window : this);

