/** 店铺装修 - 本地图片映射 */

const AD_COVER_MAP = {
  AD10001: '/static/ads/ad10001.jpg',
  AD10002: '/static/ads/ad10002.jpg',
  AD10003: '/static/ads/ad10003.jpg',
  AD10004: '/static/ads/ad10004.jpg',
  AD10005: '/static/ads/ad10005.jpg'
}

const PAGE_COVER_MAP = {
  PG10001: '/static/pages/pg10001.jpg',
  PG10002: '/static/pages/pg10002.jpg',
  PG10003: '/static/pages/pg10003.jpg',
  PG10004: '/static/pages/pg10004.jpg',
  PG10005: '/static/pages/pg10005.jpg'
}

const ENTRY_ICON_MAP = {
  EN10001: '/static/entries/skin.svg',
  EN10002: '/static/entries/rank.svg',
  EN10003: '/static/entries/batch.svg',
  EN10004: '/static/entries/plan.svg',
  EN10005: '/static/entries/desk.svg',
  EN10007: '/static/entries/cart.svg',
  EN10008: '/static/entries/order.svg'
}

const DEFAULT_AD_COVER = '/static/ads/ad10001.jpg'
const DEFAULT_PAGE_COVER = '/static/pages/pg10001.jpg'
const DEFAULT_ENTRY_ICON = '/static/entries/skin.svg'

export function getAdCover(adId) {
  const id = String(adId || '').trim().toUpperCase()
  return AD_COVER_MAP[id] || DEFAULT_AD_COVER
}

export function getPageCover(pageId) {
  const id = String(pageId || '').trim().toUpperCase()
  return PAGE_COVER_MAP[id] || DEFAULT_PAGE_COVER
}

export function getEntryIcon(entryIdOrEntry, iconFile) {
  if (entryIdOrEntry && typeof entryIdOrEntry === 'object') {
    const en = entryIdOrEntry
    if (en.iconUrl) return en.iconUrl
    if (en.icon) {
      const ic = String(en.icon)
      if (/^(data:|https?:|\/|\.\/)/.test(ic)) return ic
      return '/static/entries/' + ic.replace(/^.*\//, '')
    }
    entryIdOrEntry = en.id
  }
  const id = String(entryIdOrEntry || '').trim().toUpperCase()
  if (iconFile) {
    const file = String(iconFile)
    if (/^(data:|https?:|\/|\.\/)/.test(file)) return file
    return '/static/entries/' + file.replace(/^.*\//, '')
  }
  return ENTRY_ICON_MAP[id] || DEFAULT_ENTRY_ICON
}

export function getAdCoverRelative(adId) {
  return getAdCover(adId).replace(/^\//, './')
}

export function getPageCoverRelative(pageId) {
  return getPageCover(pageId).replace(/^\//, './')
}

export function getEntryIconRelative(entryId) {
  return getEntryIcon(entryId).replace(/^\//, './')
}
