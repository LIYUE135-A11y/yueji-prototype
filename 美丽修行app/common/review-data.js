import { getUserAvatar } from './user-data.js'
import { getProductImage, getProductImages } from './product-image.js'

function fillAvatars(node) {
  if (!node || typeof node !== 'object') return
  if (node.user) node.avatar = getUserAvatar(node.user)
  if (node.productName) {
    node.productImg = getProductImage('', node.productName)
    if (Array.isArray(node.images)) {
      node.images = getProductImages('', node.productName, node.images.length)
    }
  }
  if (Array.isArray(node.replies)) node.replies.forEach(fillAvatars)
}

/** 点评列表 → 回复详情 共用数据 */
export const reviewDetails = {
  1: {
    id: 1,
    productName: '薇诺娜舒敏保湿特护霜',
    productImg: '/static/images/product-trial-1.jpg',
    spec: '试用报告',
    user: '骑马的猴子',
    avatar: '/static/images/avatar-1.jpg',
    level: 2,
    skinTags: ['干性', '敏感肌', '色素型', '紧致型'],
    featured: true,
    score: 5,
    summary: '非常推荐，无可挑剔',
    content:
      '我个人对于薇诺娜的观感一贯良好，这款舒敏保湿特护霜质地清爽好吸收，敏感肌也能安心用，修护屏障效果不错。\n\n• 质地：清爽不黏腻，上脸好吸收\n• 舒敏：泛红、干痒能明显缓解\n• 屏障：坚持使用后皮肤更稳、更耐造\n\n敏感肌日常急救和维稳都很合适，会继续回购。',
    images: ['/static/images/product-trial-1.jpg', '/static/images/product-trial-2.jpg'],
    time: '2023-11-24',
    location: '山东',
    likes: 580,
    comments: 143,
    replies: [
      {
        id: 101,
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        level: 3,
        skinTags: ['油性', '敏感肌', '不均匀', '衰老型'],
        content: '同款在用，秋冬厚涂一层也不闷，姐妹说得太准了！',
        time: '07-19 17:55',
        location: '未知',
        likes: 28,
        replyTo: ''
      },
      {
        id: 102,
        user: '修宝小柚',
        avatar: '/static/images/avatar-3.jpg',
        level: 2,
        skinTags: ['干性', '色素型', '紧致型'],
        content: '敏感肌可以用吗？我最近换季有点泛红。',
        time: '07-20 09:12',
        location: '广东',
        likes: 6,
        replyTo: ''
      },
      {
        id: 103,
        user: '骑马的猴子',
        avatar: '/static/images/avatar-1.jpg',
        level: 2,
        skinTags: ['干性', '敏感肌', '色素型', '紧致型'],
        content: '可以的，我就是敏感肌，温和不刺激，建议少量多次。',
        time: '07-20 10:03',
        location: '山东',
        likes: 15,
        replyTo: '修宝小柚'
      },
      {
        id: 104,
        user: '护肤日记本',
        avatar: '/static/images/avatar-4.jpg',
        level: 4,
        skinTags: ['混合性', '屏障受损'],
        content: '特护霜真的是敏感肌本命，种草成功。',
        time: '07-21 21:40',
        location: '上海',
        likes: 9,
        replyTo: ''
      },
      {
        id: 105,
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        level: 3,
        skinTags: ['油性', '敏感肌', '不均匀', '衰老型'],
        content: '谢谢分享，我也去囤一罐！',
        time: '07-22 08:16',
        location: '北京',
        likes: 2,
        replyTo: '骑马的猴子'
      }
    ]
  },
  2: {
    id: 2,
    productName: '丝绒哑光正红口红',
    productImg: '/static/images/lipstick-1.jpg',
    spec: '种草分享',
    user: '晚风与妆',
    avatar: '/static/images/avatar-2.jpg',
    level: 3,
    skinTags: ['油性', '敏感肌', '不均匀', '衰老型'],
    featured: false,
    score: 5,
    summary: '相当满意，无可挑剔',
    content:
      '正红色号显白又有气场，丝绒质地不拔干，上嘴饱和度刚刚好，日常和派对都能驾驭。\n\n• 显色：一抹到位，不需要反复叠涂\n• 质地：丝绒哑光，不拔干也不卡唇纹\n• 持久：吃喝后轻微掉色，补涂很快\n\n黄皮姐妹闭眼入，气场直接拉满。',
    images: ['/static/images/lipstick-1.jpg'],
    time: '2024-03-12',
    location: '上海',
    likes: 326,
    comments: 87,
    replies: [
      {
        id: 201,
        user: '修宝小柚',
        avatar: '/static/images/avatar-3.jpg',
        level: 2,
        skinTags: ['干性', '色素型'],
        content: '正红真的太绝了，求色号！',
        time: '03-13 11:20',
        location: '杭州',
        likes: 8,
        replyTo: ''
      },
      {
        id: 202,
        user: '晚风与妆',
        avatar: '/static/images/avatar-2.jpg',
        level: 3,
        skinTags: ['油性', '敏感肌', '不均匀', '衰老型'],
        content: '就是主打正红色，专柜问丝绒哑光正红就行～',
        time: '03-13 14:05',
        location: '上海',
        likes: 4,
        replyTo: '修宝小柚'
      }
    ]
  },
  3: {
    id: 3,
    productName: '裸粉豆沙口红礼盒',
    productImg: '/static/images/lipstick-2.jpg',
    spec: '开箱测评',
    user: '修宝小柚',
    avatar: '/static/images/avatar-3.jpg',
    level: 2,
    skinTags: ['干性', '色素型', '紧致型'],
    featured: true,
    score: 5,
    summary: '相当满意，无可挑剔',
    content:
      '礼盒包装精致，豆沙色很适合通勤，薄涂自然厚涂更显气色，持久度也超出预期。\n\n• 包装：开箱仪式感很强，送礼也拿得出手\n• 色号：裸粉日常、豆沙通勤，两支刚好\n• 妆感：薄涂水润，厚涂也不显唇纹\n\n秋冬唇妆直接靠它搞定。',
    images: ['/static/images/lipstick-2.jpg'],
    time: '2024-05-08',
    location: '广州',
    likes: 912,
    comments: 204,
    replies: [
      {
        id: 301,
        user: '护肤日记本',
        avatar: '/static/images/avatar-4.jpg',
        level: 4,
        skinTags: ['混合性', '屏障受损'],
        content: '礼盒也好看，准备入来当生日礼物。',
        time: '05-09 16:40',
        location: '成都',
        likes: 11,
        replyTo: ''
      }
    ]
  },
  4: {
    id: 4,
    productName: '珊瑚莓果双色口红',
    productImg: '/static/images/lipstick-3.jpg',
    spec: '试用报告',
    user: '护肤日记本',
    avatar: '/static/images/avatar-4.jpg',
    level: 4,
    skinTags: ['混合性', '屏障受损', '色素型'],
    featured: false,
    score: 5,
    summary: '整体不错，值得一试',
    content:
      '两支色号一盒多用，珊瑚提亮、莓果显白，质地轻盈不粘腻，新手也能轻松上手。\n\n• 珊瑚：提亮气色，适合素颜和淡妆\n• 莓果：显白有气场，约会也能用\n• 质地：轻盈不沾杯，新手友好\n\n性价比很高的双色组合。',
    images: ['/static/images/lipstick-3.jpg'],
    time: '2024-06-18',
    location: '北京',
    likes: 451,
    comments: 96,
    replies: [
      {
        id: 401,
        user: '骑马的猴子',
        avatar: '/static/images/avatar-1.jpg',
        level: 2,
        skinTags: ['干性', '敏感肌'],
        content: '珊瑚那支我也很爱，夏天用太合适了。',
        time: '06-19 09:30',
        location: '山东',
        likes: 5,
        replyTo: ''
      }
    ]
  }
}

export function getReviewDetail(id) {
  const key = Number(id)
  const raw = reviewDetails[key] || reviewDetails[1]
  const detail = JSON.parse(JSON.stringify(raw))
  fillAvatars(detail)
  return detail
}
