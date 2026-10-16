/**
 * 生成 100 条用户管理测试数据，写入：
 *   1) yhgl（用户管理结构化表，含省市区家庭地址等）
 *   2) app_store.yueji_user_list_v4（运营/App 同步用）
 *
 * 用法：cd server && npm run seed:users
 * （文件名仍为 seed-users-1001.js，实际条数以 TARGET 为准）
 */
const mysql = require('mysql2/promise');
const config = require('./config');

const TARGET = 100;
const SEED_VERSION = 'v-user-100';
const STORE_KEY = 'yueji_user_list_v4';

const SURNAMES = '林沈顾叶苏温江陆许程宋方唐梁韩谢赵周陈吴郑何金夏姚王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林罗郑梁谢宋唐韩曹许邓萧冯曾程蔡彭潘袁于董余苏叶吕魏蒋田杜丁沈姜范江傅钟卢汪戴崔任陆廖姚方金邱夏谭韦贾邹石熊孟秦阎薛侯雷白龙段郝孔邵史毛常万顾赖武康贺严尹钱施牛洪龚'.split('');
const GIVEN = [
  '予安', '清欢', '惜月', '知夏', '念初', '以柔', '晚宁', '星眠', '清禾', '予薇',
  '软软', '知予', '小鹿', '慕白', '以安', '星河', '浅予', '南枝', '初雪', '晚棠',
  '予欢', '琉璃', '念安', '慕晴', '若溪', '芷晴', '可心', '语嫣', '思涵', '雨桐',
  '一诺', '佳琦', '梦瑶', '梓萱', '欣怡', '诗涵', '雨萱', '嘉怡', '子墨', '浩然',
  '婉清', '书瑶', '映雪', '半夏', '听雨', '听澜', '青柠', '柚子', '桃桃', '奶盖'
];

const LEVELS = [
  { level: '普通会员', levelKey: 'normal' },
  { level: '银卡会员', levelKey: 'silver' },
  { level: '金卡会员', levelKey: 'gold' },
  { level: '铂金会员', levelKey: 'platinum' },
  { level: '钻石会员', levelKey: 'diamond' }
];
const CHANNELS = ['微信小程序', 'APP', 'H5', 'PC', '支付宝小程序', '运营录入'];
const STATUSES = ['正常', '正常', '正常', '正常', '正常', '正常', '正常', '禁用', '待激活'];
const TYPES = ['普通用户', '普通用户', '普通用户', '达人一', '达人二'];
const GENDERS = ['女', '女', '女', '女', '男', '保密'];
const SKINS = ['干皮', '油皮', '混干皮', '混油皮', '敏感肌', '中性肌', '痘痘肌'];
const JOBS = ['白领', '自由职业', '学生', '美妆博主', '设计师', '医护', '教师', '宝妈'];
const TAGS = [
  '护肤达人,抗老', '彩妆控,口红', '敏感肌友好', '国货偏好',
  '香水彩妆', '成分党', '平价囤货', '大牌专柜'
];
const DEVICES = ['iPhone 15', '华为 Mate60', '小米 14', 'OPPO Find X', 'vivo X100', 'iPad Pro', '安卓平板'];

const ADDRS = [
  { province: '上海市', city: '上海市', district: '浦东新区', detail: '陆家嘴环路1000号恒生银行大厦18楼1805室', zip: '200120' },
  { province: '浙江省', city: '杭州市', district: '西湖区', detail: '文三路478号华星时代广场C座2103', zip: '310012' },
  { province: '广东省', city: '广州市', district: '天河区', detail: '珠江新城华夏路10号富力中心写字楼15楼', zip: '510623' },
  { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园南区高新南一道飞亚达科技大厦8楼西', zip: '518057' },
  { province: '四川省', city: '成都市', district: '锦江区', detail: '春熙路东段1号伊藤洋华堂6楼', zip: '610021' },
  { province: '江苏省', city: '苏州市', district: '工业园区', detail: '月亮湾路9号建屋紫金东方A座1206', zip: '215123' },
  { province: '江苏省', city: '南京市', district: '建邺区', detail: '庐山路188号新地中心二期C座808', zip: '210019' },
  { province: '北京市', city: '北京市', district: '朝阳区', detail: '建国路81号华贸中心写字楼3座2301', zip: '100025' },
  { province: '湖北省', city: '武汉市', district: '江汉区', detail: '解放大道634号新世界国贸大厦2座21楼', zip: '430022' },
  { province: '陕西省', city: '西安市', district: '雁塔区', detail: '高新路56号西安软件园秦风阁B座5层', zip: '710075' },
  { province: '山东省', city: '青岛市', district: '市南区', detail: '香港中路8号青岛中心大厦28楼', zip: '266071' },
  { province: '重庆市', city: '重庆市', district: '沙坪坝区', detail: '汉渝路183号三峡广场世纪银河25楼', zip: '400030' },
  { province: '福建省', city: '厦门市', district: '思明区', detail: '鹭江道100号财富中心A座1906', zip: '361001' },
  { province: '湖南省', city: '长沙市', district: '岳麓区', detail: '麓谷大道658号长沙高新国际广场B座9楼', zip: '410205' },
  { province: '天津市', city: '天津市', district: '和平区', detail: '南京路189号津汇广场写字楼22层', zip: '300051' },
  { province: '辽宁省', city: '大连市', district: '中山区', detail: '人民路23号星海广场国贸大厦15楼', zip: '116001' },
  { province: '河南省', city: '郑州市', district: '金水区', detail: '农业东路51号正商中州城2号楼1108', zip: '450046' },
  { province: '安徽省', city: '合肥市', district: '蜀山区', detail: '长江西路500号置地广场写字楼18楼', zip: '230031' },
  { province: '江西省', city: '南昌市', district: '红谷滩区', detail: '丰和中大道1288号绿地中央广场A座', zip: '330038' },
  { province: '浙江省', city: '杭州市', district: '余杭区', detail: '文一西路969号阿里巴巴西溪园区B区8号楼', zip: '311121' }
];

const SEED25 = [
  { id: 'U20240105', nickName: '林予安', phone: '138****6688', gender: '女', birthday: '1996-08-15', level: '铂金会员', levelKey: 'platinum', points: 8650, orders: 42, spend: 28680.5, channel: '微信小程序', regTime: '2024-01-05 10:23:18', lastLogin: '2026-08-26 09:18', status: '正常' },
  { id: 'U20240088', nickName: '沈清欢', phone: '139****9912', gender: '女', birthday: '1993-03-22', level: '钻石会员', levelKey: 'diamond', points: 15280, orders: 68, spend: 56890.0, channel: 'APP', regTime: '2024-01-12 14:45:30', lastLogin: '2026-08-25 22:14', status: '正常' },
  { id: 'U20240256', nickName: '顾惜月', phone: '135****2258', gender: '女', birthday: '1998-11-08', level: '金卡会员', levelKey: 'gold', points: 4280, orders: 25, spend: 12560.8, channel: '微信小程序', regTime: '2024-02-08 09:33:42', lastLogin: '2026-08-26 10:32', status: '正常' },
  { id: 'U20240032', nickName: '叶知夏', phone: '137****7788', gender: '女', birthday: '1990-06-18', level: '钻石会员', levelKey: 'diamond', points: 18950, orders: 85, spend: 78650.0, channel: 'PC', regTime: '2024-01-03 16:28:55', lastLogin: '2026-08-24 14:22', status: '正常' },
  { id: 'U20240102', nickName: '苏念初', phone: '186****3344', gender: '女', birthday: '1995-12-25', level: '铂金会员', levelKey: 'platinum', points: 7320, orders: 38, spend: 25680.0, channel: 'APP', regTime: '2024-01-08 11:15:20', lastLogin: '2026-08-23 09:05', status: '正常' },
  { id: 'U20240501', nickName: '温以柔', phone: '158****8866', gender: '女', birthday: '1992-09-10', level: '银卡会员', levelKey: 'silver', points: 1860, orders: 12, spend: 4580.5, channel: 'H5', regTime: '2024-05-01 13:42:08', lastLogin: '2026-08-22 18:30', status: '正常' },
  { id: 'U20240322', nickName: '江晚宁', phone: '133****5566', gender: '女', birthday: '1999-04-14', level: '金卡会员', levelKey: 'gold', points: 3920, orders: 22, spend: 11280.0, channel: '微信小程序', regTime: '2024-03-22 15:18:32', lastLogin: '2026-08-26 08:45', status: '正常' },
  { id: 'U20240608', nickName: '陆星眠', phone: '159****2233', gender: '女', birthday: '1994-07-30', level: '普通会员', levelKey: 'normal', points: 320, orders: 3, spend: 890.0, channel: '支付宝小程序', regTime: '2024-06-08 10:05:12', lastLogin: '2026-08-20 14:18', status: '正常' },
  { id: 'U20240178', nickName: '许清禾', phone: '188****4455', gender: '女', birthday: '1997-02-18', level: '银卡会员', levelKey: 'silver', points: 2150, orders: 15, spend: 6280.5, channel: 'APP', regTime: '2024-01-18 09:28:44', lastLogin: '2026-08-21 16:52', status: '正常' },
  { id: 'U20240901', nickName: '程予薇', phone: '152****7788', gender: '女', birthday: '1991-10-05', level: '钻石会员', levelKey: 'diamond', points: 12380, orders: 55, spend: 45680.0, channel: 'PC', regTime: '2024-09-01 14:15:30', lastLogin: '2026-08-25 20:45', status: '正常' },
  { id: 'U20240208', nickName: '宋软软', phone: '177****3322', gender: '女', birthday: '1996-06-22', level: '金卡会员', levelKey: 'gold', points: 4680, orders: 28, spend: 13890.5, channel: '微信小程序', regTime: '2024-02-08 11:42:18', lastLogin: '2026-08-26 09:30', status: '正常' },
  { id: 'U20240612', nickName: '方知予', phone: '131****8899', gender: '女', birthday: '1989-12-08', level: '铂金会员', levelKey: 'platinum', points: 9250, orders: 48, spend: 32560.0, channel: 'APP', regTime: '2024-06-12 16:08:22', lastLogin: '2026-08-24 11:25', status: '正常' },
  { id: 'U20240076', nickName: '唐小鹿', phone: '132****6677', gender: '女', birthday: '1998-08-30', level: '普通会员', levelKey: 'normal', points: 580, orders: 5, spend: 1260.0, channel: 'H5', regTime: '2024-01-22 13:35:48', lastLogin: '2026-08-19 10:18', status: '正常' },
  { id: 'U20241102', nickName: '梁慕白', phone: '156****4488', gender: '女', birthday: '1995-05-12', level: '银卡会员', levelKey: 'silver', points: 1980, orders: 14, spend: 5280.5, channel: '微信小程序', regTime: '2024-11-02 10:22:15', lastLogin: '2026-08-23 15:40', status: '正常' },
  { id: 'U20241156', nickName: '韩以安', phone: '180****9911', gender: '女', birthday: '1993-01-25', level: '金卡会员', levelKey: 'gold', points: 3680, orders: 20, spend: 9890.0, channel: 'PC', regTime: '2024-11-15 08:48:32', lastLogin: '2026-08-22 19:15', status: '正常' },
  { id: 'U20240334', nickName: '谢星河', phone: '155****2266', gender: '女', birthday: '1999-09-18', level: '普通会员', levelKey: 'normal', points: 420, orders: 4, spend: 980.0, channel: '支付宝小程序', regTime: '2024-03-15 12:10:55', lastLogin: '2026-08-18 14:30', status: '禁用' },
  { id: 'U20240442', nickName: '赵浅予', phone: '136****8855', gender: '女', birthday: '1990-04-08', level: '铂金会员', levelKey: 'platinum', points: 8120, orders: 36, spend: 27890.5, channel: 'APP', regTime: '2024-04-12 15:28:18', lastLogin: '2026-08-25 16:08', status: '正常' },
  { id: 'U20240778', nickName: '周南枝', phone: '178****3344', gender: '女', birthday: '1997-11-22', level: '金卡会员', levelKey: 'gold', points: 4250, orders: 24, spend: 10680.0, channel: '微信小程序', regTime: '2024-07-18 09:55:42', lastLogin: '2026-08-26 11:20', status: '正常' },
  { id: 'U20240888', nickName: '陈初雪', phone: '153****7799', gender: '女', birthday: '1988-06-15', level: '钻石会员', levelKey: 'diamond', points: 14680, orders: 62, spend: 58960.0, channel: 'PC', regTime: '2024-08-20 14:32:08', lastLogin: '2026-08-24 18:45', status: '正常' },
  { id: 'U20240236', nickName: '吴晚棠', phone: '185****4422', gender: '女', birthday: '1996-03-28', level: '银卡会员', levelKey: 'silver', points: 1720, orders: 11, spend: 3980.5, channel: 'H5', regTime: '2024-02-25 11:08:30', lastLogin: '2026-08-21 13:22', status: '正常' },
  { id: 'U20241220', nickName: '郑予欢', phone: '176****6688', gender: '女', birthday: '1998-07-14', level: '普通会员', levelKey: 'normal', points: 280, orders: 2, spend: 560.0, channel: '微信小程序', regTime: '2024-12-20 10:45:18', lastLogin: '2026-08-17 09:30', status: '待激活' },
  { id: 'U20241312', nickName: '何清禾', phone: '139****2255', gender: '女', birthday: '1995-10-08', level: '金卡会员', levelKey: 'gold', points: 3850, orders: 21, spend: 9580.0, channel: 'APP', regTime: '2024-12-08 14:22:42', lastLogin: '2026-08-23 17:18', status: '正常' },
  { id: 'U20241444', nickName: '金琉璃', phone: '158****9966', gender: '女', birthday: '1991-08-20', level: '铂金会员', levelKey: 'platinum', points: 7890, orders: 34, spend: 24680.5, channel: 'PC', regTime: '2024-12-15 09:18:25', lastLogin: '2026-08-25 11:50', status: '正常' },
  { id: 'U20241558', nickName: '夏念安', phone: '132****4477', gender: '女', birthday: '1994-02-14', level: '银卡会员', levelKey: 'silver', points: 2050, orders: 13, spend: 5680.0, channel: '微信小程序', regTime: '2025-01-08 15:35:12', lastLogin: '2026-08-22 20:15', status: '正常' },
  { id: 'U20241668', nickName: '姚慕晴', phone: '188****5533', gender: '女', birthday: '1997-12-30', level: '金卡会员', levelKey: 'gold', points: 4120, orders: 26, spend: 11860.5, channel: 'APP', regTime: '2025-01-15 11:28:48', lastLogin: '2026-08-26 08:20', status: '正常' }
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function pad(n, w) {
  let s = String(n);
  while (s.length < w) s = '0' + s;
  return s;
}

function formatHome(addr) {
  const parts = [addr.province, addr.city, addr.district, addr.detail];
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    if (out.length && out[out.length - 1] === parts[i]) continue;
    out.push(parts[i]);
  }
  return out.join('');
}

function maskPhone(idx) {
  const prefix = ['138', '139', '135', '137', '186', '158', '133', '159', '188', '152'][idx % 10];
  const suffix = pad((idx * 7919) % 10000, 4);
  return prefix + '****' + suffix;
}

function makeBirthday(idx) {
  const year = 1985 + (idx % 20);
  const month = pad(1 + (idx % 12), 2);
  const day = pad(1 + (idx % 28), 2);
  return year + '-' + month + '-' + day;
}

function makeStamp(base, idx, hourOffset) {
  const y = 2024 + ((idx % 24) > 18 ? 1 : 0);
  const m = pad(1 + (idx % 12), 2);
  const d = pad(1 + (idx % 27), 2);
  const h = pad((8 + hourOffset + (idx % 12)) % 24, 2);
  const mi = pad((idx * 7) % 60, 2);
  const s = pad((idx * 13) % 60, 2);
  return y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
}

function enrich(u, idx) {
  const addr = pick(ADDRS, idx);
  const levelInfo = LEVELS.find((l) => l.level === u.level) || pick(LEVELS, idx);
  const age = u.birthday ? Math.max(1, 2026 - parseInt(String(u.birthday).slice(0, 4), 10)) : 25 + (idx % 20);
  const nick = u.nickName || pick(SURNAMES, idx) + pick(GIVEN, idx);
  const realName = u.realName || nick;
  const homeAddress = formatHome(addr);
  const avatarFile = 'u' + pad((idx % 25) + 1, 2) + '.jpg';
  return {
    id: u.id,
    nickName: nick,
    realName: realName,
    phone: u.phone || maskPhone(idx),
    wechat: u.wechat || ('wx_' + String(u.id).replace(/\D/g, '').slice(-6)),
    email: (nick.replace(/\s/g, '') || 'user') + (100 + idx) + '@beautymail.cn',
    gender: u.gender || pick(GENDERS, idx),
    birthday: u.birthday || makeBirthday(idx),
    age: age,
    province: addr.province,
    city: addr.city,
    district: addr.district,
    addressDetail: addr.detail + (idx > 24 ? ('·' + (100 + (idx % 80)) + '室') : ''),
    zipCode: addr.zip,
    homeAddress: homeAddress + (idx > 24 ? ('·' + (100 + (idx % 80)) + '室') : ''),
    receiverName: realName,
    receiverPhone: u.phone || maskPhone(idx),
    skinType: pick(SKINS, idx),
    occupation: pick(JOBS, idx),
    tags: pick(TAGS, idx),
    userType: pick(TYPES, idx),
    level: levelInfo.level,
    levelKey: levelInfo.levelKey,
    status: u.status || pick(STATUSES, idx),
    points: u.points != null ? u.points : (idx * 37) % 20000,
    orders: u.orders != null ? u.orders : (idx * 3) % 90,
    spend: u.spend != null ? Number(Number(u.spend).toFixed(2)) : Number((((idx * 173) % 80000) + 50).toFixed(2)),
    channel: u.channel || pick(CHANNELS, idx),
    inviteCode: 'YJ' + pad(100000 + ((idx * 137) % 900000), 6),
    device: pick(DEVICES, idx),
    regTime: u.regTime || makeStamp(2024, idx, 0),
    lastLogin: u.lastLogin || makeStamp(2026, idx, 3),
    viewCount: 80 + ((idx * 37) % 920),
    favCount: 5 + ((idx * 13) % 95),
    likeCount: 12 + ((idx * 19) % 280),
    followCount: 3 + ((idx * 7) % 68),
    fansCount: 6 + ((idx * 11) % 160),
    remark: idx % 17 === 0 ? '重点维护客户' : '-',
    syncAvatar: './avatars/' + avatarFile,
    seedVersion: SEED_VERSION
  };
}

function buildUsers(n) {
  const list = [];
  for (let i = 0; i < Math.min(n, SEED25.length); i++) {
    list.push(enrich(SEED25[i], i));
  }
  for (let i = SEED25.length; i < n; i++) {
    const nick = pick(SURNAMES, i) + pick(GIVEN, i * 3 + 1);
    const lv = pick(LEVELS, i);
    list.push(
      enrich(
        {
          id: 'U2025' + pad(i + 1, 4),
          nickName: nick,
          gender: pick(GENDERS, i),
          birthday: makeBirthday(i),
          level: lv.level,
          levelKey: lv.levelKey,
          channel: pick(CHANNELS, i),
          status: pick(STATUSES, i)
        },
        i
      )
    );
  }
  return list;
}

async function ensureDb(conn) {
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.mysql.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.changeUser({ database: config.mysql.database });
  await conn.query(`
    CREATE TABLE IF NOT EXISTS app_store (
      store_key VARCHAR(128) NOT NULL PRIMARY KEY,
      store_value LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function seedYhgl(conn, list) {
  await conn.query('DROP TABLE IF EXISTS yhgl');
  await conn.query(`
    CREATE TABLE yhgl (
      yhid   VARCHAR(32)  NOT NULL COMMENT '用户ID',
      nc     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '昵称',
      xm     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '真实姓名',
      sjh    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '手机号',
      wxh    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '微信号',
      yx     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '邮箱',
      xb     VARCHAR(8)   NOT NULL DEFAULT '' COMMENT '性别',
      nl     INT NOT NULL DEFAULT 0 COMMENT '年龄',
      sr     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '生日',
      sf     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '省',
      cs     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '市',
      qx     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '区县',
      xxdz   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '详细地址',
      yb     VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '邮编',
      jtdz   VARCHAR(512) NOT NULL DEFAULT '' COMMENT '家庭地址',
      shr    VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '收货人',
      shdh   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '收货电话',
      fz     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '肤质',
      zy     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '职业',
      bq     VARCHAR(128) NOT NULL DEFAULT '' COMMENT '兴趣标签',
      yhlx   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '用户类型',
      dj     VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '会员等级',
      zt     VARCHAR(16)  NOT NULL DEFAULT '' COMMENT '账号状态',
      zcqd   VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '注册渠道',
      yqm    VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '邀请码',
      sb     VARCHAR(64)  NOT NULL DEFAULT '' COMMENT '常用设备',
      zcsj   VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '注册时间',
      zjdll  VARCHAR(32)  NOT NULL DEFAULT '' COMMENT '最近登录',
      jf     INT NOT NULL DEFAULT 0 COMMENT '积分',
      dds    INT NOT NULL DEFAULT 0 COMMENT '订单数',
      xfje   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '累计消费',
      lll    INT NOT NULL DEFAULT 0 COMMENT '浏览量',
      scl    INT NOT NULL DEFAULT 0 COMMENT '收藏量',
      dzl    INT NOT NULL DEFAULT 0 COMMENT '点赞量',
      gzl    INT NOT NULL DEFAULT 0 COMMENT '关注量',
      fsl    INT NOT NULL DEFAULT 0 COMMENT '粉丝量',
      bz     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '备注',
      tx     VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像',
      PRIMARY KEY (yhid),
      KEY idx_sf_cs (sf, cs),
      KEY idx_zt (zt),
      KEY idx_dj (dj)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户管理'
  `);

  const cols = [
    'yhid', 'nc', 'xm', 'sjh', 'wxh', 'yx', 'xb', 'nl', 'sr',
    'sf', 'cs', 'qx', 'xxdz', 'yb', 'jtdz', 'shr', 'shdh',
    'fz', 'zy', 'bq', 'yhlx', 'dj', 'zt', 'zcqd', 'yqm', 'sb',
    'zcsj', 'zjdll', 'jf', 'dds', 'xfje', 'lll', 'scl', 'dzl', 'gzl', 'fsl', 'bz', 'tx'
  ];
  const placeholders = '(' + cols.map(() => '?').join(',') + ')';
  const sql = `INSERT INTO yhgl (${cols.join(',')}) VALUES ${placeholders}`;

  const batchSize = 100;
  for (let i = 0; i < list.length; i += batchSize) {
    const chunk = list.slice(i, i + batchSize);
    const connBatch = conn;
    for (const u of chunk) {
      await connBatch.query(sql, [
        u.id, u.nickName, u.realName, u.phone, u.wechat, u.email, u.gender, u.age, u.birthday,
        u.province, u.city, u.district, u.addressDetail, u.zipCode, u.homeAddress,
        u.receiverName, u.receiverPhone, u.skinType, u.occupation, u.tags, u.userType,
        u.level, u.status, u.channel, u.inviteCode, u.device, u.regTime, u.lastLogin,
        u.points, u.orders, u.spend, u.viewCount, u.favCount, u.likeCount, u.followCount, u.fansCount,
        u.remark, u.syncAvatar
      ]);
    }
    process.stdout.write(`  yhgl 已写入 ${Math.min(i + batchSize, list.length)} / ${list.length}\r`);
  }
  process.stdout.write('\n');
  return list.length;
}

async function seedAppStore(conn, list) {
  const json = JSON.stringify(list);
  await conn.query(
    `INSERT INTO app_store (store_key, store_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)`,
    [STORE_KEY, json]
  );
  // 清理旧 key，避免桥接回写冲掉
  await conn.query(`DELETE FROM app_store WHERE store_key IN (?, ?)`, [
    'yueji_user_list_v2_feminine',
    'yueji_user_list_v3'
  ]);
  return list.length;
}

async function main() {
  console.log('生成 ' + TARGET + ' 条用户测试数据...');
  const users = buildUsers(TARGET);
  console.log('实际生成: ' + users.length + ' 条');

  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    charset: 'utf8mb4',
    multipleStatements: true
  });

  try {
    await ensureDb(conn);
    console.log('写入 yhgl ...');
    const n1 = await seedYhgl(conn, users);
    console.log('写入 app_store.' + STORE_KEY + ' ...');
    const n2 = await seedAppStore(conn, users);

    const [c1] = await conn.query('SELECT COUNT(*) AS c FROM yhgl');
    const [c2] = await conn.query(
      'SELECT CHAR_LENGTH(store_value) AS len FROM app_store WHERE store_key = ?',
      [STORE_KEY]
    );
    console.log('完成:');
    console.log('  yhgl: ' + n1 + ' 条 (库内 ' + c1[0].c + ')');
    console.log('  app_store.' + STORE_KEY + ': ' + n2 + ' 条 JSON (' + c2[0].len + ' 字符)');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
