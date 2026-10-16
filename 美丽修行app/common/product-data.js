import { getUserAvatar } from './user-data.js'
import { getProductImage } from './product-image.js'

function fillReviewAvatars(reviews) {
  return (reviews || []).map((item) => ({
    ...item,
    avatar: getUserAvatar(item.user)
  }))
}

/** 商品详情共用数据 */
export const productCatalog = {
  p1: {
    id: 'p1',
    title: '经典正红丝绒口红',
    subTitle: '哑光质地 · 持久显色',
    brand: '阅己',
    cat1: '彩妆',
    cat2: '唇部彩妆',
    cat3: '口红',
    img: getProductImage('p1', '经典正红丝绒口红'),
    desc: '经典正红色丝绒口红，哑光质地，上嘴显白，适合日常与派对妆容。丝绒质地不拔干，上嘴饱和度刚刚好。',
    price: '129',
    originPrice: '199',
    score: '4.8',
    reviewCount: 326,
    sales: '2.1万+',
    origin: '中国',
    spec: '3.5g',
    tags: ['哑光质地', '持久显色', '显白正红'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        score: 5,
        content: '正红色号显白又有气场，丝绒质地不拔干，上嘴饱和度刚刚好，日常和派对都能驾驭。',
        time: '07-18',
        likes: 128
      },
      {
        id: 'r2',
        user: '修宝小柚',
        avatar: '/static/images/avatar-3.jpg',
        score: 5,
        content: '显色力很强，一支就能涂出完整妆感，雾面不拔干，秋冬也很友好。',
        time: '07-15',
        likes: 86
      },
      {
        id: 'r3',
        user: '护肤日记本',
        avatar: '/static/images/avatar-4.jpg',
        score: 4,
        content: '包装很高级，色号比想象中更正一些，建议先试色。整体很满意会回购。',
        time: '07-12',
        likes: 42
      }
    ]
  },
  p2: {
    id: 'p2',
    title: '温柔裸粉口红礼盒',
    subTitle: '豆沙色号 · 通勤百搭',
    brand: '阅己',
    cat1: '彩妆',
    cat2: '唇部彩妆',
    cat3: '口红',
    img: getProductImage('p2', '温柔裸粉口红礼盒'),
    desc: '温柔裸粉豆沙色口红礼盒，日常通勤百搭，提升气色不挑皮。',
    price: '199',
    originPrice: '269',
    score: '4.6',
    reviewCount: 218,
    sales: '1.4万+',
    origin: '中国',
    spec: '双支装',
    tags: ['豆沙色', '通勤百搭', '礼盒装'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        score: 5,
        content: '裸粉色很温柔，涂完气色一下子起来，办公室日常完全够用。',
        time: '07-20',
        likes: 96
      },
      {
        id: 'r2',
        user: '骑马的猴子',
        avatar: '/static/images/avatar-1.jpg',
        score: 4,
        content: '礼盒包装精致，送人也很合适，质地偏润，干皮友好。',
        time: '07-16',
        likes: 53
      }
    ]
  },
  p3: {
    id: 'p3',
    title: '珊瑚莓果双色套装',
    subTitle: '两支装 · 一盒多用',
    brand: '阅己',
    cat1: '彩妆',
    cat2: '唇部彩妆',
    cat3: '口红',
    img: getProductImage('p3', '珊瑚莓果双色套装'),
    desc: '珊瑚与莓果双色口红套装，一盒满足多场景妆容需求。',
    price: '149',
    originPrice: '219',
    score: '4.5',
    reviewCount: 187,
    sales: '9800+',
    origin: '中国',
    spec: '双色',
    tags: ['双色套装', '多场景', '显气色'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '修宝小柚',
        avatar: '/static/images/avatar-3.jpg',
        score: 5,
        content: '两支色号搭配很聪明，一个日常一个约会，性价比很高。',
        time: '07-19',
        likes: 71
      },
      {
        id: 'r2',
        user: '护肤日记本',
        avatar: '/static/images/avatar-4.jpg',
        score: 4,
        content: '珊瑚橘显白，莓果色更有气质，质地丝滑好涂。',
        time: '07-11',
        likes: 38
      }
    ]
  },
  p4: {
    id: 'p4',
    title: '绒雾质感口红',
    subTitle: '雾面妆感 · 轻盈不拔干',
    brand: '阅己',
    cat1: '彩妆',
    cat2: '唇部彩妆',
    cat3: '口红',
    img: getProductImage('p4', '绒雾质感口红'),
    desc: '绒雾质感口红，雾面妆效轻盈不拔干，显白且易上色。',
    price: '109',
    originPrice: '159',
    score: '4.7',
    reviewCount: 264,
    sales: '1.8万+',
    origin: '中国',
    spec: '3.2g',
    tags: ['绒雾质感', '轻盈不拔干', '易上色'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        score: 5,
        content: '雾面但不干，持久度不错，午饭后补一下就好。',
        time: '07-21',
        likes: 112
      },
      {
        id: 'r2',
        user: '骑马的猴子',
        avatar: '/static/images/avatar-1.jpg',
        score: 5,
        content: '显白又低调，通勤妆很合适，已经回购第二支。',
        time: '07-14',
        likes: 67
      }
    ]
  },
  mx1: {
    id: 'mx1',
    title: '可复美重组胶原蛋白「绿印」修护次抛精华液',
    subTitle: '屏障受损 · 次抛设计 · 密集修护',
    brand: '可复美',
    cat1: '护肤',
    cat2: '精华',
    cat3: '次抛精华',
    img: getProductImage('mx1', '可复美重组胶原蛋白绿印修护次抛精华液'),
    desc: '可复美重组胶原蛋白绿印修护次抛精华液，密集修护屏障，次抛设计更安心，适合屏障受损与敏感维稳场景。',
    price: '485',
    originPrice: '560',
    score: '4.59',
    reviewCount: 7184,
    sales: '9.5万+',
    origin: '中国江苏',
    spec: '1.5ml*30支',
    tags: ['屏障受损', '次抛设计', '密集修护'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        skin: '油性敏感肌',
        score: 5,
        content: '次抛很安心，用完脸没那么紧绷，屏障修护感明显，敏感期也能用。',
        time: '08-12',
        likes: 326,
        photos: ['/static/images/product-trial-2.jpg', '/static/images/products/skincare-2.jpg']
      },
      {
        id: 'r2',
        user: '修宝小柚',
        avatar: '/static/images/avatar-3.jpg',
        skin: '干性敏感肌',
        score: 5,
        content: '吸收快不黏腻，搭配保湿霜 Overnight 效果更好，会继续回购。',
        time: '08-05',
        likes: 218,
        photos: ['/static/images/products/skincare-1.jpg']
      }
    ]
  },
  mx2: {
    id: 'mx2',
    title: '薇诺娜舒敏保湿特护霜',
    subTitle: '敏感修护 · 保湿 · 屏障',
    brand: '薇诺娜',
    cat1: '护肤',
    cat2: '面霜',
    cat3: '特护霜',
    img: getProductImage('mx2', '薇诺娜舒敏保湿特护霜'),
    desc: '薇诺娜舒敏保湿特护霜，敏感肌友好，修护屏障，质地清爽好吸收。',
    price: '188',
    originPrice: '238',
    score: '4.72',
    reviewCount: 3280,
    sales: '5.6万+',
    origin: '中国云南',
    spec: '50g',
    tags: ['敏感修护', '保湿', '屏障'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '护肤日记本',
        avatar: '/static/images/avatar-4.jpg',
        skin: '混合性敏感肌',
        score: 5,
        content: '换季红血丝明显时用很稳，保湿够用不厚重。',
        time: '08-08',
        likes: 189,
        photos: ['/static/images/products/skincare-1.jpg']
      },
      {
        id: 'r2',
        user: '骑马的猴子',
        avatar: '/static/images/avatar-1.jpg',
        skin: '干性敏感肌',
        score: 4,
        content: '舒敏确实有感，面霜质地偏润，干皮友好。',
        time: '07-28',
        likes: 96
      }
    ]
  },
  mx3: {
    id: 'mx3',
    title: 'HEY:REAL B5精华液',
    subTitle: '修护 · 保湿 · 泛醇',
    brand: 'HEY:REAL',
    cat1: '护肤',
    cat2: '精华',
    cat3: '精华液',
    img: getProductImage('mx3', 'HEY:REAL B5精华液'),
    desc: 'HEY:REAL B5精华液，修护保湿，适合屏障维稳与日常打底。',
    price: '159',
    originPrice: '199',
    score: '4.48',
    reviewCount: 2106,
    sales: '3.3万+',
    origin: '中国',
    spec: '30ml',
    tags: ['修护', '保湿', '泛醇'],
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: [
      {
        id: 'r1',
        user: '修宝小柚',
        avatar: '/static/images/avatar-3.jpg',
        skin: '油性敏感肌',
        score: 5,
        content: 'B5 打底很清爽，后续上乳霜更服帖，敏感期维稳够用。',
        time: '08-01',
        likes: 142,
        photos: ['/static/images/product-flash-2.jpg']
      }
    ]
  }
}

export function getProductById(id, fallback = {}) {
  const key = String(id || '')
  const catalog = productCatalog[key]
  if (catalog) {
    return {
      ...catalog,
      ...pickFallback(fallback),
      img: fallback.img || getProductImage(key, fallback.title || catalog.title),
      reviews: fillReviewAvatars(catalog.reviews)
    }
  }

  // 榜单等数字 id：按图映射到相近商品
  const rankMap = {
    '1': 'p2',
    '2': 'p1',
    '3': 'p3',
    '4': 'p4',
    r1: 'p2',
    r2: 'p1',
    r3: 'p3'
  }
  const mapped = productCatalog[rankMap[key]]
  if (mapped) {
    return {
      ...mapped,
      id: key,
      title: fallback.title || mapped.title,
      subTitle: fallback.subTitle || mapped.subTitle,
      img: fallback.img || getProductImage(key, fallback.title || mapped.title),
      desc: fallback.desc || mapped.desc,
      price: fallback.price || mapped.price,
      score: fallback.score || mapped.score,
      reviewCount: fallback.reviewCount || mapped.reviewCount,
      origin: fallback.origin || mapped.origin,
      spec: fallback.spec || mapped.spec,
      reviews: fillReviewAvatars(mapped.reviews)
    }
  }

  return {
    id: key || 'p1',
    title: fallback.title || '商品详情',
    subTitle: fallback.subTitle || '',
    img: getProductImage(key, fallback.title),
    desc: fallback.desc || '暂无详细介绍',
    price: fallback.price || '129',
    originPrice: fallback.originPrice || '199',
    score: fallback.score || '4.8',
    reviewCount: fallback.reviewCount || 128,
    sales: fallback.sales || '1万+',
    origin: '中国',
    spec: '默认款',
    tags: (fallback.subTitle || '').split(/[·|]/).map((s) => s.trim()).filter(Boolean).slice(0, 3),
    services: ['正品保障', '七天无理由', '满99包邮'],
    reviews: fillReviewAvatars(productCatalog.p1.reviews)
  }
}

function pickFallback(fallback) {
  const next = {}
  if (fallback.title) next.title = fallback.title
  if (fallback.subTitle) next.subTitle = fallback.subTitle
  if (fallback.img) next.img = fallback.img
  if (fallback.desc) next.desc = fallback.desc
  if (fallback.price) next.price = fallback.price
  if (fallback.originPrice) next.originPrice = fallback.originPrice
  if (fallback.brand) next.brand = fallback.brand
  if (fallback.spec) next.spec = fallback.spec
  if (fallback.score) next.score = fallback.score
  if (fallback.reviewCount) next.reviewCount = fallback.reviewCount
  if (fallback.origin) next.origin = fallback.origin
  return next
}
