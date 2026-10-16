/** 全局用户头像与基础信息（本地图片，每人唯一） */
export const MOCK_USERS = {
  骑马的猴子: { avatar: '/static/images/avatar-1.jpg', level: 2 },
  晚风与妆: { avatar: '/static/images/avatar-2.jpg', level: 3 },
  修宝小柚: { avatar: '/static/images/avatar-3.jpg', level: 2 },
  护肤日记本: { avatar: '/static/images/avatar-4.jpg', level: 4 },
  阅己活动君: { avatar: '/static/images/avatar-5.jpg', level: 5 },
  周小磕: { avatar: '/static/images/avatar-6.jpg', level: 2 },
  修宝012644: { avatar: '/static/images/avatar-7.jpg', level: 2 },
  塔阿: { avatar: '/static/images/avatar-8.jpg', level: 2 },
  野稗子: { avatar: '/static/images/avatar-9.jpg', level: 3 },
  我: { avatar: '/static/images/avatar-9.jpg', level: 1 }
}

/** 当前登录用户（个人中心） */
export const CURRENT_USER = {
  nickname: '野稗子',
  ...MOCK_USERS['野稗子']
}

export function getUserAvatar(nickname) {
  return MOCK_USERS[nickname]?.avatar || '/static/images/avatar-1.jpg'
}

export function getUserLevel(nickname) {
  return MOCK_USERS[nickname]?.level || 1
}
