/**
 * AI 帮助卡片库 · 运营「知识库管理 → AI帮助」↔ App「AI帮助中心」兜底
 * localStorage: zhuangyan_ai_help_articles_v1
 * 种子内容来源：docs/美丽修行-用户小白操作手册.md（V3）
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_ai_help_articles_v1';
  var SEED_VERSION_KEY = 'zhuangyan_ai_help_articles_seed_ver';
  /* 升级此版本号会清空旧列表并灌入新 SEED（用户手册内容） */
  var SEED_VERSION = 'manual-v3-20260908';
  var SYNC_MSG = 'ai-help-articles-sync';
  var REQUEST_MSG = 'ai-help-articles-request-sync';
  var memoryList = null;

  var TAG_TOPIC = {
    '入门导航': 'ai',
    '首页逛逛': 'ai',
    '测肤护肤': 'skin',
    '订单售后': 'order',
    'AI能力': 'ai',
    '会员积分': 'member',
    '社区种草': 'community',
    '工具能力': 'ai'
  };

  var SEED = [
    { id: 'HELP20001', tag: '入门导航', title: '如何打开美丽修行 App 预览？', body: '演示环境用电脑浏览器打开预览页；产品对外名「美丽修行」，界面常显示「阅己美妆」。', steps: ['用 Chrome / Edge 打开项目里的 美丽修行app/preview.html', '或从根目录 index.html 点进 C 端 App', '建议窗口拉大，看清手机外框', '联调时固定同一浏览器，避免无痕导致演示数据「消失」'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20002', tag: '入门导航', title: '底部五个 Tab 分别是什么？', body: '底部导航是定位全 App 的锚点：首页逛买、发现社区、测肤、阅己盒、我的。', steps: ['底部从左到右：首页 / 发现 / 测肤 / 阅己盒 / 我的', '点一次即可切换，高亮表示当前页', '迷路时先点「首页」或「我的」再找入口', '演示时建议每个 Tab 都点一遍建立方位感'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20003', tag: '入门导航', title: '第一次用建议怎么学？', body: '按「先定位 → 再购物 → 再 AI → 再社区」建立心智，比东点西点更快上手。', steps: ['先认底部 5 个 Tab（约 3 分钟）', '走一遍：搜商品 → 详情 → 加购 → 支付 → 我的订单', '再试用：AI测肤 / AI导购 / AI客服 / 我的→帮助', '最后练：发现浏览、点赞评论、发种草'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20004', tag: '首页逛逛', title: '首页顶栏四个入口怎么用？', body: '首页顶部右侧快捷：AI导购、AI客服、消息、积分。', steps: ['点「AI导购」：用自然语言问选品（如油皮要清爽防晒）', '点「AI客服」：问订单、售后、权益规则', '点「消息」：看通知 / 精选 / 回复 / 赞藏，可全部已读', '点「积分」：进积分商城签到、做任务、兑换'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20005', tag: '首页逛逛', title: '首页如何搜索商品？', body: '搜索卡片有「搜索」和「提问」两种模式，别混用。', steps: ['在搜索卡片点「搜索」Tab（放大镜）', '输入关键词如「防晒霜」「精华」', '回车或确认，打开商品结果列表', '点某条结果进入商品详情，可继续加购'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20006', tag: '首页逛逛', title: '首页「提问」模式和搜索有什么区别？', body: '提问走自然语言 / AI 导购意图；搜索是关键词找商品。', steps: ['在搜索卡片点「提问」Tab', '输入自然语言问题，如「敏感肌能用酒精吗」', '按提示提交，进入 AI 相关回答或导购', '要找具体商品时请切回「搜索」模式'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20007', tag: '首页逛逛', title: '从热门推荐开始买东西', body: '首页下滑热门推荐是主购买入口；活动名不等于商品名。', steps: ['首页向下滑动到热门推荐商品流', '点商品卡片进入详情，看主图、价格、评价', '选好规格/数量后点「加入购物车」或「立即购买」', '【注意】活动名≠商品标题，以下单页商品名为准'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20008', tag: '首页逛逛', title: '首页功能入口有哪些？', body: '中部图标默认常见：AI测肤、阅己榜单、批号查询、试用中心（运营可改装修）。', steps: ['点「AI测肤」进入测肤流程', '点「阅己榜单」按分类看排行并可进商品', '点「批号查询」选品牌+输入批号查效期等信息', '点「试用中心」申请试用、看往期与我的试用'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20009', tag: '社区种草', title: '发现页怎么浏览与互动？', body: '发现=社区。子 Tab：动态 / 推荐 / 活动 / 发现；可点赞评论。', steps: ['底部点「发现」进入', '在「动态」上下滑浏览，可点赞、评论、分享', '在「推荐」看圈子、用户、话题、种草、问答，可「换一批」', '在「活动」看讨论标签与活动列表'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20010', tag: '社区种草', title: '如何发布种草/动态/文章？', body: '发现右下角「+」是发布入口；动态可能需审核通过才展示。', steps: ['发现页点「+」', '选择种草 / 动态 / 文章等体裁', '填写标题与正文，可加标签或关联商品', '点发布；动态请等待审核通过后再在列表查看'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20011', tag: '社区种草', title: '发现页如何用 AI帮我写？', body: '编辑器内可调用「AI帮我写」生成草稿，务必人工改后再发。', steps: ['发现 → + → 选择种草/文章/动态', '点「✨ AI帮我写」，填写场景、产品、感受、适合谁', '选择风格与篇幅（若有）后点生成', '把结果拷入正文，删夸大、补真实体验后再发布'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20012', tag: '社区种草', title: '订单评价后如何去种草？', body: '完成「买→评→晒」闭环：已评价订单可点「去种草」。', steps: ['我的 → 我的订单 → 找到已完成订单', '先点「评价」提交星级与文字', '再点「去种草」打开发布', '写体验（可用 AI帮我写）并发布，在发现/个人种草查看'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20013', tag: '会员积分', title: '阅己盒上新、秒杀、新人怎么逛？', body: '底部「阅己盒」含每周上新、大牌秒杀、猜你喜欢、新人专区。', steps: ['底部点「阅己盒」', '在「每周上新」浏览新品并可进详情', '在「大牌秒杀 / 1元抢」参与闪购（与首页秒杀互通）', '新人可进「新人专区」看新人价与领券'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20014', tag: '会员积分', title: '积分怎么攒、怎么花？', body: '首页顶栏「积分」进积分商城：签到、任务、兑换。', steps: ['首页顶栏点「积分」打开积分商城', '先点每日签到拿积分', '完成任务区任务增加余额', '在兑换区选择奖品并按提示兑换'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20015', tag: '会员积分', title: '优惠券怎么领、结算怎么用？', body: '领券中心领取后，须在结算页勾选才会减实付。', steps: ['我的 → 优惠券（领券中心）查看可领列表', '点领取，券进入已领取', '加购后进购物车/结算，选择这张券', '也可从阅己盒新人专区领新人券再买'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20016', tag: '会员积分', title: '试用中心怎么申请？', body: '首页「试用中心」或试用卡片可申请试用、查看往期与我的试用。', steps: ['首页点「试用中心」或试用相关卡片', '浏览可申请试用商品', '按页面填写并提交申请', '在「我的试用」查看进度与往期'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20017', tag: '会员积分', title: '每日防护指南怎么用？', body: '首页防护卡片可看天气/肤质记录，并进入防护建议与搭配。', steps: ['首页找到「每日防护」相关卡片', '可授权定位看天气（不开也能看演示）', '可记录肤质信息', '点实时预报 / 防护建议 / 搭配进入防护页三块内容'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20018', tag: '会员积分', title: '新手任务和会员卡怎么找？', body: '「我的」页有会员卡、新手任务；可联动测肤与定制方案。', steps: ['进入「我的」查看会员卡区域', '可点开通 AI 畅爽用 / 定制方案（演示）', '打开「新手任务」完成指引项拿积分', '测肤或下单等动作常与任务联动'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20019', tag: '订单售后', title: '加购到支付怎么走？（推荐新手）', body: '详情加购 → 购物车勾选选券 → 确认支付 → 密码 → 成功 → 我的订单。', steps: ['商品详情选规格后点「加入购物车」', '我的 → 购物车（或浮层购物车），勾选商品并选优惠券', '点去结算，确认地址与实付后去支付', '输入支付密码；成功后可在「我的订单」查看'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20020', tag: '订单售后', title: '立即购买怎么走？', body: '详情点「立即购买」通常不经过购物车列表，后续支付相同。', steps: ['进入商品详情并选好规格/数量', '点「立即购买」', '进入确认支付 → 核对地址与实付', '输入支付密码完成，到「我的订单」查找'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20021', tag: '订单售后', title: '购物车结算前要核对什么？', body: '勾选、规格、券、地址、合计都核对后再支付，避免漏勾或忘用券。', steps: ['确认要买的商品都已勾选', '检查规格数量与小计', '有券则在结算选择优惠券', '确认收货地址无误后再点支付'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20022', tag: '订单售后', title: '支付三页：确认 → 密码 → 成功', body: '演示支付分三页；输错密码按提示重试；成功后记得去订单列表。', steps: ['确认支付页：核对商品、地址、优惠、实付', '支付密码页：按提示输入演示密码', '支付成功页：可点去订单列表', '若中断：回购物车或详情重新结算，勿重复盲点'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20023', tag: '订单售后', title: '我的订单各状态能做什么？', body: '入口：我的 → 我的订单。把状态 Tab 当成进度条。', steps: ['待付款：去付款或取消', '待发货：等待；演示可让运营发货', '待收货：看物流，确认收货', '已完成：评价、去种草；售后中：看进度时间线，勿重复提交'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20024', tag: '订单售后', title: '如何评价订单？', body: '已完成订单可评价；评价后通常可继续「去种草」。', steps: ['我的 → 我的订单 → 已完成（或可评价单）', '点「评价」', '选星级、写文字，可附图（若支持）', '提交；需要晒单时再点「去种草」'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20025', tag: '订单售后', title: '如何申请售后与查看进度？', body: '符合条件的订单可申请退款/售后；进度与运营售后管理同步。', steps: ['打开「我的订单」找到对应订单', '点「申请售后/退款」，选择原因并说明', '提交后订单进售后中', '在订单内查看售后进度时间线，勿反复提交'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20026', tag: '订单售后', title: '收货地址怎么管理？', body: '确认支付或地址相关入口可维护收货地址；演示可先用默认地址。', steps: ['在确认支付页检查收货地址', '需要时点改地址 / 新增地址', '填写姓名、电话、详细地址并保存', '回到结算页确认地址无误再支付'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20027', tag: 'AI能力', title: 'AI 导购怎么用？', body: '导购偏「帮我选」：首页顶栏进入，描述肤质/场景/预算。', steps: ['首页顶栏点「AI导购」', '输入如：敏感肌，预算200内，要修护精华', '查看回复与推荐商品卡，可点进详情加购', '可继续追问成分/季节；不满意可反馈（若有）'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20028', tag: 'AI能力', title: 'AI 客服怎么用？如何转人工？', body: '客服偏查单/售后/规则；复杂问题可转人工排队。', steps: ['首页顶栏点「AI客服」', '先下单再问更易查到你的订单', '问物流、退款、券规则、会员权益等', '需要人工时点转人工，在会话中继续留言等待接待'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20029', tag: 'AI能力', title: '导购和客服怎么选？', body: '选品找导购，查单售后找客服；别把两件事混在一句里说不清。', steps: ['不知道买什么 → AI导购', '查物流/退款/券规则 → AI客服', '又想选又想查单：先导购选品下单，再用客服', '未开大模型时仍有本地演示回复，可完成路径演示'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20030', tag: 'AI能力', title: 'AI帮助中心怎么用？', body: '我的右上角「帮助」可对话提问「怎么用 App」，也可点快捷提问。', steps: ['进入「我的」，点右上角紫色「帮助」', '看欢迎气泡，点快捷提问或底部输入问题', '按回复中的步骤去其它页面操作', '可点快捷入口去导购/客服/测肤/订单；右上角「清空」可重置会话'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20031', tag: '测肤护肤', title: '如何完成一次 AI 测肤？', body: '入口：底部「测肤」或首页「AI测肤」。按正脸拍照生成报告与方案。', steps: ['打开测肤，选择「测自己」或「帮朋友测」', '阅读光线、正脸等须知后继续', '对准正脸拍照或上传，等待分析', '查看肤质报告 → 进入 AI 定制方案'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20032', tag: '测肤护肤', title: '测自己和帮朋友测有什么区别？', body: '测自己写入个人护肤轨迹；帮朋友偏本次报告，不写入你的长期档案。', steps: ['测肤入口选择「测自己」：适合长期跟踪', '选择「帮朋友测」：适合现场帮朋友玩一玩', '测完可把结论拿去 AI导购要产品清单', '测自己后可在「我的」查看方案与梳妆台'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20033', tag: '测肤护肤', title: '报告与梳妆台怎么配合？', body: '测肤结果可配合「我的梳妆台」管理未开封/使用中/已用完产品。', steps: ['完成测肤并保存/查看报告', '我的 → 我的梳妆台', '按未开封 / 使用中 / 已用完标记产品', '对照定制方案调整在用单品'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20034', tag: '测肤护肤', title: 'AI定制方案在哪里看？', body: '报告页可进方案；我的页也有定制方案入口，可跳转商品。', steps: ['测肤报告页点生成/查看 AI定制方案', '或「我的」页打开 AI定制方案卡片', '阅读护肤步骤与产品建议', '需要时跳转商品详情购买'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20035', tag: '测肤护肤', title: '收藏清单（想用/用过/过敏）怎么用？', body: '收藏分三类，过敏类建议认真维护，避免误用。', steps: ['在「我的」打开收藏清单相关入口', '将产品归入想用 / 用过 / 过敏不适', '过敏不适类务必写清原因', '买新东西前先翻收藏对照'], status: '已启用', updateTime: '2026-09-08 20:00' },

    { id: 'HELP20036', tag: '工具能力', title: '批号查询怎么用？', body: '首页「批号查询」：选品牌并输入批号，查效期等信息。', steps: ['首页点「批号查询」', '选择品牌', '输入包装上的批号', '查看效期/说明；查不到可核对批号或换品牌'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20037', tag: '工具能力', title: '阅己榜单怎么看？', body: '首页「阅己榜单」按分类看排行，可点进商品详情。', steps: ['首页点「阅己榜单」', '切换分类查看排行', '点感兴趣的商品进详情', '可继续加购或收藏'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20038', tag: '工具能力', title: '消息中心与设置在哪？', body: '消息看通知互动；设置在我的竖三点，含账号、推送、协议等。', steps: ['首页顶栏「消息」或我的信封打开消息中心', '切换通知 / 内容精选 / 回复了我 / 赞和收藏', '我的 → 右上角竖三点进入设置', '可改推送、看协议、清除缓存、退出登录等'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20039', tag: '工具能力', title: '小问答 / 专题会场怎么进？', body: '发现推荐区或首页活动可进小问答与专题；答题常与积分联动。', steps: ['发现 → 推荐，找卷王挑战/小问答入口', '按题作答，关注积分提示', '活动或装修入口可进专题/自定义会场', '在会场内点商品进详情购买'], status: '已启用', updateTime: '2026-09-08 20:00' },
    { id: 'HELP20040', tag: '入门导航', title: '一页纸速查：我想…怎么走？', body: '常用路径速查，可直接照着点。', steps: ['买东西：首页热门推荐 → 详情 → 加购/立即买 → 支付', '看订单 / 退款：我的 → 我的订单（售后在订单内申请）', '问选品 / 问售后：首页 AI导购 / AI客服', '测肤 / 帮助 / 发种草：底部测肤；我的→帮助；发现→+'], status: '已启用', updateTime: '2026-09-08 20:00' }
  ];

  function safeParse(raw) {
    try {
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function normalize(item, idx) {
    if (!item || typeof item !== 'object') return null;
    var steps = item.steps;
    if (typeof steps === 'string') {
      steps = steps.split(/\n|；|;/).map(function (s) {
        return String(s || '').replace(/^\s+|\s+$/g, '');
      }).filter(Boolean);
    }
    if (!Array.isArray(steps)) steps = [];
    var status = (item.status === '已停用' || item.status === '停用') ? '已停用' : '已启用';
    return {
      id: String(item.id || ('HELP' + (20000 + (idx || 0)))),
      tag: String(item.tag || 'AI能力'),
      title: String(item.title || ''),
      body: String(item.body || ''),
      steps: steps,
      status: status,
      updateTime: String(item.updateTime || ''),
      topic: TAG_TOPIC[String(item.tag || '')] || 'ai'
    };
  }

  function readRaw() {
    var list = safeParse(localStorage.getItem(STORAGE_KEY));
    if (list.length) return list;
    return SEED.slice();
  }

  function needForceSeed() {
    try {
      return localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION;
    } catch (e) {
      return true;
    }
  }

  function markSeedVersion() {
    try {
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    } catch (e) { /* ignore */ }
  }

  function load() {
    if (memoryList && !needForceSeed()) return memoryList.slice();
    /* 手册版种子升级：清空原有列表，整库替换 */
    if (needForceSeed()) {
      var forced = SEED.map(normalize).filter(Boolean);
      memoryList = forced;
      try {
        persist(forced, true);
        markSeedVersion();
      } catch (eForce) { /* ignore */ }
      return forced.slice();
    }
    var fromLs = safeParse(localStorage.getItem(STORAGE_KEY));
    var list = (fromLs.length ? fromLs : SEED.slice()).map(normalize).filter(Boolean);
    if (!list.length) list = SEED.map(normalize).filter(Boolean);
    memoryList = list;
    if (!fromLs.length) {
      try {
        persist(list, true);
        markSeedVersion();
      } catch (eSeed) { /* ignore */ }
    }
    return list.slice();
  }

  function persist(list, broadcast) {
    var next = (list || []).map(normalize).filter(Boolean);
    memoryList = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map(function (x) {
        return {
          id: x.id,
          tag: x.tag,
          title: x.title,
          body: x.body,
          steps: x.steps,
          status: x.status,
          updateTime: x.updateTime
        };
      })));
    } catch (e) { /* ignore */ }
    if (broadcast !== false) {
      try {
        var payload = { type: SYNC_MSG, articles: next };
        window.postMessage(payload, '*');
        if (window.parent && window.parent !== window) window.parent.postMessage(payload, '*');
      } catch (e2) { /* ignore */ }
      try {
        if (typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('ai-help-articles-updated', { detail: next }));
        }
      } catch (e3) { /* ignore */ }
    }
    return next;
  }

  function save(list) {
    markSeedVersion();
    return persist(list, true);
  }

  function loadEnabled() {
    return load().filter(function (x) { return x.status === '已启用' && x.title; });
  }

  /** 按 App 主题 id 取兜底卡片（匹配用，不随机摇全库） */
  function cardsForTopic(topicId, limit) {
    var all = loadEnabled();
    var tid = topicId || 'all';
    var filtered = tid === 'all' ? all.slice() : all.filter(function (x) {
      return x.topic === tid || x.tag === tid;
    });
    var max = limit != null ? limit : (tid === 'all' ? 5 : 3);
    return filtered.slice(0, max).map(function (x) {
      return { tag: x.tag, title: x.title, body: x.body, steps: (x.steps || []).slice() };
    });
  }

  function topicIdFromLabel(label) {
    var s = String(label || '').replace(/^\s+|\s+$/g, '');
    if (!s || s === '全部' || s === '全部场景') return 'all';
    if (TAG_TOPIC[s]) return TAG_TOPIC[s];
    var map = { skin: 'skin', order: 'order', ai: 'ai', member: 'member', community: 'community' };
    return map[s] || 'all';
  }

  function topicsFromQuick(quickText) {
    var lines = String(quickText || '')
      .split(/\r?\n/)
      .map(function (s) { return s.replace(/^\s+|\s+$/g, ''); })
      .filter(Boolean);
    if (!lines.length) {
      lines = ['全部', '测肤护肤', '订单售后', 'AI能力', '会员积分', '社区种草'];
    }
    var seen = {};
    var out = [];
    lines.forEach(function (name) {
      var id = topicIdFromLabel(name);
      var key = id + '::' + name;
      if (seen[key]) return;
      seen[key] = true;
      out.push({ id: id, name: name });
    });
    return out.length ? out : [{ id: 'all', name: '全部' }];
  }

  function requestSync() {
    try {
      var payload = { type: REQUEST_MSG };
      window.postMessage(payload, '*');
      if (window.parent && window.parent !== window) window.parent.postMessage(payload, '*');
    } catch (e) { /* ignore */ }
  }

  function applyRemote(list) {
    if (!Array.isArray(list)) return load();
    return persist(list, false);
  }

  function forceReseed() {
    memoryList = null;
    try {
      localStorage.removeItem(SEED_VERSION_KEY);
    } catch (e) { /* ignore */ }
    return load();
  }

  function bindSyncListeners() {
    if (typeof window === 'undefined' || !window.addEventListener) return;
    try {
      window.addEventListener('message', function (ev) {
        if (!ev || !ev.data) return;
        if (ev.data.type === SYNC_MSG && Array.isArray(ev.data.articles)) {
          applyRemote(ev.data.articles);
          markSeedVersion();
        }
        if (ev.data.type === REQUEST_MSG) {
          try {
            window.postMessage({ type: SYNC_MSG, articles: load() }, '*');
          } catch (e) { /* ignore */ }
        }
      }, false);
      window.addEventListener('storage', function (ev) {
        if (ev.key === STORAGE_KEY || ev.key === SEED_VERSION_KEY) {
          memoryList = null;
          load();
        }
      }, false);
    } catch (e) { /* ignore */ }
  }

  bindSyncListeners();

  /* 库拉取后清空内存缓存，下次 load 以 localStorage（已由 DbBridge 写入）为准 */
  try {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('db-bridge-ready', function () {
        memoryList = null;
      });
    }
  } catch (eDb) { /* ignore */ }

  var api = {
    KEY: STORAGE_KEY,
    SEED_VERSION_KEY: SEED_VERSION_KEY,
    SEED_VERSION: SEED_VERSION,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    TAG_TOPIC: TAG_TOPIC,
    SEED: SEED,
    /** 灌库用：纯 JSON 列表（无 topic 派生字段） */
    listForDb: function () {
      return SEED.map(function (item) {
        return {
          id: item.id,
          tag: item.tag,
          title: item.title,
          body: item.body,
          steps: (item.steps || []).slice(),
          status: item.status || '已启用',
          updateTime: item.updateTime || ''
        };
      });
    },
    load: load,
    save: save,
    loadEnabled: loadEnabled,
    cardsForTopic: cardsForTopic,
    topicsFromQuick: topicsFromQuick,
    topicIdFromLabel: topicIdFromLabel,
    normalize: normalize,
    requestSync: requestSync,
    applyRemote: applyRemote,
    forceReseed: forceReseed
  };

  global.AiHelpArticlesStore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
