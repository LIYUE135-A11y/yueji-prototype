/** 商品封面本地图片（每个商品 ID / SKU 独立映射） */
function toSlug(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** SP 商品 ID → 本地文件名 */
const SP_FILE_MAP = {
  sp100001: 'sp100001',
  sp100002: 'sp100002',
  sp100003: 'sp100003',
  sp100004: 'sp100004',
  sp100005: 'sp100005',
  sp100006: 'sp100006',
  sp100007: 'sp100007',
  sp100008: 'sp100008',
  sp100009: 'sp100009',
  sp100010: 'sp100010',
  sp100011: 'sp100011',
  sp100012: 'sp100012',
  sp100013: 'sp100013',
  sp100014: 'sp100014',
  sp100015: 'sp100015',
  sp100016: 'sp100016',
  sp100017: 'sp100017',
  sp100018: 'sp100018',
  sp100019: 'sp100019',
  sp100020: 'sp100020',
  sp100021: 'sp100021',
  sp100022: 'sp100022',
  sp100023: 'sp100023',
  sp100024: 'sp100024',
  sp100028: 'lm-cz-03wt',
  sp100029: 'bbs-bs-nb-96',
  sp100030: 'scx-mh-450x2',
  sp100031: 'sy-jj-4p-45',
  sp100032: 'sfj-xz-125x6',
  sp100033: 'keb-vc-100x3',
  sp100034: 'hxz-qd-tj-b25x2',
  sp100035: 'zrt-ns-lh-4p',
  sp100036: 'lm-jc-150ml'
}

/** SKU → 本地文件名（订单/评价等按 SKU 查图） */
const SKU_FILE_MAP = {
  'sk2-ess-230-01': 'sp100001',
  'lc-gx-50-009': 'sp100002',
  'el-eye-15-022': 'sp100003',
  'wm-rj-01-n': 'sp100004',
  'hxz-ks-m301': 'sp100005',
  'zrt-bs-160-a': 'sp100006',
  'wm-jm-120-03': 'sp100007',
  'zrt-mm-10p-b5': 'sp100008',
  'lm-kf-50ml': 'sp100009',
  'loreal-fy-110m': 'sp100010',
  'xlk-sx-30ml': 'sp100011',
  'crl-jm-150ml': 'sp100012',
  'el-xzp-75b': 'sp100013',
  'hxz-qd-c30': 'sp100014',
  'sk2-dhp-80g-a': 'sp100015',
  'lk-jc-60-m': 'sp100016',
  'wm-rj-12-yt': 'sp100017',
  'xlk-ce-30ml': 'sp100018',
  'crl-ms-40g': 'sp100019',
  'loreal-hj-50ml': 'sp100020',
  'zrt-ns-120g': 'sp100021',
  'lm-ms-60ml': 'sp100022',
  'hxz-xs-50ml': 'sp100023',
  'sk2-mm-10p': 'sp100024'
}

const DEFAULT_COVER = '/static/products/sp100001.jpg'

function resolveProductFile(key) {
  const raw = String(key || '').trim()
  if (!raw) return 'sp100001'
  const lower = raw.toLowerCase()
  if (/^sp\d{6}$/.test(lower)) {
    return SP_FILE_MAP[lower] || lower
  }
  if (SKU_FILE_MAP[lower]) return SKU_FILE_MAP[lower]
  return toSlug(raw) || 'sp100001'
}

export function getProductCover(key) {
  const file = resolveProductFile(key)
  return `/static/products/${file}.jpg`
}

export function getProductCoverRelative(key) {
  return getProductCover(key).replace(/^\//, './')
}

export function getProductCovers(key, count = 3) {
  const main = getProductCover(key)
  const pool = [
    main,
    '/static/products/sp100002.jpg',
    '/static/products/sp100008.jpg',
    '/static/products/sp100005.jpg',
    '/static/products/sp100011.jpg'
  ].filter((v, i, arr) => arr.indexOf(v) === i)
  while (pool.length < count) pool.push(main)
  return pool.slice(0, count)
}
