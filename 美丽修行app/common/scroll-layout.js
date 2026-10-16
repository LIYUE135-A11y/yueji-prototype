/** 页面主滚动区域高度计算（固定顶栏/底栏 + 中间 scroll-view） */

export function getSystemLayout() {
  try {
    if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
      const info = uni.getSystemInfoSync()
      return {
        windowHeight: info.windowHeight || 667,
        windowWidth: info.windowWidth || 375,
        statusBarHeight: info.statusBarHeight || 20,
        safeBottom: (info.safeAreaInsets && info.safeAreaInsets.bottom) || 0
      }
    }
  } catch (e) { /* ignore */ }
  return { windowHeight: 667, windowWidth: 375, statusBarHeight: 20, safeBottom: 0 }
}

function rpxToPx(rpx, layout) {
  const width = layout.windowWidth || 375
  return (Number(rpx) * width) / 750
}

/**
 * @param {object} options
 * @param {number} [options.navPx] 顶部导航 px
 * @param {number} [options.navRpx] 顶部导航 rpx
 * @param {number} [options.tabsPx] 标签栏 px
 * @param {number} [options.tabsRpx] 标签栏 rpx
 * @param {number} [options.footerPx] 底部操作栏 px
 * @param {number} [options.footerRpx] 底部操作栏 rpx
 * @param {number} [options.tabBarPx=50] 原生 tabBar 高度 px
 * @param {number} [options.extraPx=0] 额外扣除
 * @param {boolean} [options.includeTabBar=false] 是否扣除 tabBar
 */
export function calcScrollHeightPx(options = {}) {
  const layout = getSystemLayout()
  const {
    navPx = 0,
    navRpx = 0,
    tabsPx = 0,
    tabsRpx = 0,
    footerPx = 0,
    footerRpx = 0,
    tabBarPx = 50,
    extraPx = 0,
    includeTabBar = false,
    windowHeight = layout.windowHeight,
    statusBarHeight = layout.statusBarHeight,
    safeBottom = layout.safeBottom
  } = options

  const deduction =
    statusBarHeight +
    (navPx || rpxToPx(navRpx, layout)) +
    (tabsPx || rpxToPx(tabsRpx, layout)) +
    (footerPx || rpxToPx(footerRpx, layout)) +
    (includeTabBar ? tabBarPx : 0) +
    safeBottom +
    extraPx

  return Math.max(160, Math.floor(windowHeight - deduction))
}

export function calcScrollHeightStyle(options = {}) {
  return `${calcScrollHeightPx(options)}px`
}
