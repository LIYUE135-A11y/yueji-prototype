/** 运营管理系统用户头像（本地图片，按 userId 唯一映射） */
export const USER_AVATAR_MAP = {
  U20240105: '/static/avatars/u01.jpg',
  U20240088: '/static/avatars/u02.jpg',
  U20240256: '/static/avatars/u03.jpg',
  U20240032: '/static/avatars/u04.jpg',
  U20240102: '/static/avatars/u05.jpg',
  U20240501: '/static/avatars/u06.jpg',
  U20240322: '/static/avatars/u07.jpg',
  U20240608: '/static/avatars/u08.jpg',
  U20240178: '/static/avatars/u09.jpg',
  U20240901: '/static/avatars/u10.jpg',
  U20240208: '/static/avatars/u11.jpg',
  U20240612: '/static/avatars/u12.jpg',
  U20240076: '/static/avatars/u13.jpg',
  U20241102: '/static/avatars/u14.jpg',
  U20241156: '/static/avatars/u15.jpg',
  U20240334: '/static/avatars/u16.jpg',
  U20240442: '/static/avatars/u17.jpg',
  U20240778: '/static/avatars/u18.jpg',
  U20240888: '/static/avatars/u19.jpg',
  U20240236: '/static/avatars/u20.jpg',
  U20241220: '/static/avatars/u21.jpg',
  U20241312: '/static/avatars/u22.jpg',
  U20241444: '/static/avatars/u23.jpg',
  U20241558: '/static/avatars/u24.jpg',
  U20241668: '/static/avatars/u25.jpg'
}

export const ROLE_AVATAR_MAP = {
  管理员: '/static/avatars/admin.jpg',
  客服小紫: '/static/avatars/cs03.jpg'
}

export function getUserAvatar(userId) {
  return USER_AVATAR_MAP[userId] || '/static/avatars/u01.jpg'
}

export function getRoleAvatar(roleName) {
  return ROLE_AVATAR_MAP[roleName] || '/static/avatars/admin.jpg'
}
