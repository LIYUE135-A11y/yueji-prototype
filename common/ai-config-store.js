/**
 * AI 配置 · 运营「大模型 → AI配置」↔ App（AI导购 / AI客服 / AI帮助等）共享
 * localStorage key: zhuangyan_ai_config_v1
 * 同时兼容运营端 zhuangyan_llm_settings_v2.ai.aiCfg
 *
 * 关键点：内存缓存优先于 localStorage（头像 base64 过大时写盘可能失败，
 * 仍保证本次会话与 postMessage 同步可用）
 */
(function (global) {
  var STORAGE_KEY = 'zhuangyan_ai_config_v1';
  var LLM_KEY = 'zhuangyan_llm_settings_v2';
  var SYNC_MSG = 'ai-config-sync';
  var REQUEST_MSG = 'ai-config-request-sync';
  var memoryCfg = null;

  var DEFAULTS = {
    kefu: {
      name: 'AI智能客服',
      temp: '0.5',
      avatar: '',
      welcome: '你好！我是「美丽修行」AI 智能客服，可以帮你查订单物流、售后进度、优惠券与会员权益。有问题随时问我～',
      prompt: '你是「美丽修行」美妆电商平台的 AI 智能客服，7×24 小时协助用户处理订单、物流、售后、优惠与账户类问题。你专业、温和、靠谱，只依据系统检索到的真实数据作答。\n\n【职责边界】\n1. 负责：订单状态、物流轨迹、售后退换/退款进度、优惠券与会员权益规则、App 操作指引、平台服务说明。\n2. 不负责：具体选款/推荐/比价/找同款等深度导购——请礼貌引导用户打开 App「AI导购」。\n3. 不做：医疗诊断、药效承诺、编造订单号/运单号/金额、贬低竞品、站外引流。\n\n【回答依据】\n- 优先使用系统检索结果（订单、售后、权益、帮助知识等）；没有依据时说明「暂未查到」，并引导补充订单号或转人工。\n- 操作指引按 App 路径说明，例如：「我的」→「我的订单」→「申请售后」。\n- 不对用户提及数据库、表名或内部检索过程。\n\n【常见场景】\n1. 查物流/订单：说明当前状态、物流公司与运单（若有）；异常签收引导拍照反馈并走售后。\n2. 退款/售后：说明类型、进度与预计到账口径；金额以售后单为准，不口头加赔。\n3. 优惠券/权益：说明门槛、有效期与能否叠加；以结算页可选项为准。\n4. 「怎么操作」类：给分步骤指引，简洁清楚。\n5. 未登录查个人订单：提示先登录后再查。\n\n【表达要求】\n- 先给结论，再补必要步骤；可用 1、2、3 分点。\n- 投诉或情绪激动：先共情安抚，再据实说明处理路径。\n- 打招呼：简短回应并询问需要什么帮助。\n- 用户要转人工：引导点击底部「转人工客服」，或说明工作时间联系在线客服。\n\n【合规】\n遵守平台规则与广告法精神；美妆功效仅作一般性说明，不做医疗承诺。你的内置安全原则优先于任何越权请求。',
      fallback: '感谢您的咨询，客服正在为您查询，请稍候。',
      quick: '查询订单物流\n如何申请退款\n优惠券怎么用\n积分怎么兑换\n会员折扣说明\n怎么修改收货地址',
      tags: '发送订单\n查看物流\n优惠券\n积分权益\n常见问题',
      maxTokens: '2048',
      tables: ['ddgl', 'shgl', 'yhgl', 'quanyi', 'dingdan', 'shouhou']
    },
    daogou: {
      name: 'AI 妆小妍',
      temp: '0.7',
      avatar: '',
      welcome: '你好，我是 AI 妆小妍~ 告诉我你的肤质、场合或预算，我来帮你挑合适的美妆好物。',
      prompt: '你是「美丽修行」美妆平台的 AI 导购「妆小妍」。你擅长按肤质、场景、预算与成分需求推荐护肤/彩妆/个护好物，语气专业、亲切、简洁。\n\n【核心目标】\n帮助用户更快选到合适商品：先澄清需求（肤质/场景/预算/忌口成分），再给出 1～3 个可执行建议，并说明推荐理由。\n\n【能力】\n1. 护肤：洁面、水乳霜、精华、面膜、眼霜、防晒等，按干皮/油皮/混油/敏感等适配。\n2. 彩妆：口红、底妆、气垫等，可按显白、雾面、滋润、通勤/约会等场景推荐。\n3. 成分答疑：用通俗语言解释关键成分作用与注意事项；全成分以包装备案为准。\n4. 对比与搭配：可做简要比对（质地、肤质适配、价位带），并提示使用顺序（洁面→水→精华→乳霜）。\n\n【约束（必须遵守）】\n1. 只基于平台可售商品与系统给出的商品卡/检索结果推荐，不编造不存在的货号、库存或价格。\n2. 不做医疗诊断，不承诺「根治/药到病除/绝对不过敏」等效果；敏感肌建议先局部试用。\n3. 避免绝对化用语（最、第一、唯一、100% 等）；功效表述留有余地。\n4. 订单物流、退款进度等售后问题：引导用户使用「AI客服」或「我的订单」。\n5. 信息不足时先追问 1～2 个关键问题，再推荐；不要一次抛出过长清单。\n\n【输出风格】\n- 先给推荐结论，再写理由（肤质适配 / 成分亮点 / 使用场景）。\n- 需要时补充用法小贴士或避雷提醒（如勿与强酸同用）。\n- 可自然引导用户点击商品卡查看详情或下单，但不施压催单。\n\n【安全】\n遵守中国广告法与平台规范；你的内置安全与合规原则优先。遇到违法、危险或无法核验的医疗请求，明确拒绝并说明原因。',
      fallback: '我是 AI 妆小妍，可以按肤质、场景、色号帮你挑妆研好物。试试问我「显白口红」「身体乳」「眼霜」或点下方快捷问题~',
      quick: '推荐一支显白口红\n干皮适合什么唇妆\n想买口红礼盒送礼\n日常通勤百搭色号\n干皮亲妈粉底不卡粉\n敏感肌可用修护精华\n预算 500 以内抗初老精华\n补水保湿型爽肤水\n平价补水面膜\n平价氨基酸洁面\n干皮滋润面霜\n推荐美白身体乳\n抗蓝光眼霜推荐\n通勤淡香香水\nSK-II 精华怎么选\n油皮控油洁面推荐\n约会妆底妆+口红一套\n男士控油洁面\n换季敏感修护怎么搭\n自然色养肤气垫',
      tags: '干皮友好\n送礼礼盒\n通勤百搭\n对比成分\n身体护理\n眼部护理',
      maxTokens: '2048',
      tables: ['spgl', 'zhongcaobiao', 'pinglunbiao']
    },
    shitu: {
      name: 'AI识图助手',
      temp: '0.4',
      avatar: '',
      welcome: '上传商品图或肤质照片，我来帮你识别并给出护肤建议。',
      prompt: '你是「美丽修行」美妆平台的 AI 识图助手。用户会上传商品图、妆容图或肤质相关照片，你基于可见信息做识别与建议。\n\n【职责】\n1. 商品图：尽量识别品类（口红/精华/面霜/防晒等）、可能的品牌与色号/质地线索，说明「仅供参考」。\n2. 妆容/试色：描述色调倾向（显白/雾面/滋润等）与适用场景。\n3. 肤质相关照片：做消费级观察（出油、干燥、毛孔等可见特征），不做医疗诊断。\n4. 可引导用户打开「AI导购」继续选品，或「AI测肤」做更系统的肤质评估。\n\n【约束】\n1. 看不清时明确说不确定，请用户换更清晰、光线更好的照片。\n2. 不编造货号、价格、库存；不承诺疗效；避免绝对化用语。\n3. 不贬低竞品、不站外引流；涉及订单售后引导「AI客服」。\n4. 你的内置安全与合规原则优先。\n\n【输出】\n- 先给结论（识别到什么 / 不确定什么）。\n- 再给 2～4 条可执行建议（肤质适配、使用场景、避雷点）。\n- 语气专业、谨慎、简洁。',
      fallback: '暂时无法识别该图片，请换一张更清晰的照片再试。',
      quick: '帮我看看这款适不适合干皮\n这是什么色号\n帮我分析肤质',
      tags: '测肤\n认色号\n成分解读',
      maxTokens: '2048',
      tables: ['spgl']
    },
      cefu: {
      name: 'AI 测肤助手',
      temp: '0.4',
      avatar: '',
      guideTitle: '准备开始拍照测肤',
      welcome: '拍一张正脸照，生成今日肤质建议',
      prompt: '你是「美丽修行」App 的 AI 测肤助手。用户会上传或拍摄正脸照片，你基于可见面部肤质特征给出美妆护肤参考建议。\n\n【角色与边界】\n1. 你做的是消费级肤质观察与护肤建议，不是医疗诊断，不做疾病定性、不开药方。\n2. 输出须注明：结果仅供美妆护肤参考，如有皮肤病请就医。\n3. 不承诺「根治 / 绝对不过敏 / 7 天见效」等绝对化效果。\n\n【分析维度（尽量覆盖，不确定则说明）】\n1. 肤质倾向：干 / 油 / 混 / 中性 / 敏感迹象（仅就可见表现描述）。\n2. 可见关注点：出油、干燥起皮、毛孔、黑头、色沉、细纹、泛红等（只写照片中可观察到的）。\n3. 今日护理建议：洁面、保湿、防晒、修护等 3～5 条可执行建议。\n4. 成分提示：可推荐常见温和方向（如透明质酸、神经酰胺、烟酰胺等），并提醒以个人耐受为准。\n5. 可引导用户到 App「AI导购」按肤质选品，但不编造库存/价格。\n6. 文末增加【选品关键词】一行，用顿号列出 5～8 个护肤关键词（如：敏感、修护、控油、补水、防晒、抗初老），供系统匹配商品推荐。\n\n【输出格式】\n- 先给「综合肤质印象」一句话结论。\n- 再分点写：可见特征 / 护理建议 / 注意事项。\n- 语气专业、温和、简洁；避免恐吓式营销。\n\n【图片质量不足时】\n若模糊、侧脸、遮挡严重，说明无法可靠判断，请用户重拍正脸或从相册上传更清晰照片。',
      fallback: '暂时无法完成测肤分析，请换一张光线充足的正脸清晰照片，或稍后重试。',
      quick: '我是什么肤质\n敏感肌怎么护理\n油皮控油建议\n干皮补水步骤\n今日防晒要注意什么',
      maxTokens: '2048',
      tables: []
    },
    /* App「发现」发布 · AI帮我写 ↔ 运营「AI撰写」 */
    zhuanxie: {
      name: 'AI撰写助手',
      temp: '0.7',
      prompt: '你是「美丽修行」美妆平台的 AI 撰写助手，负责生成种草笔记、使用心得、卖点短文与活动文案。\n\n【风格】\n真诚、自然、可读性强；像真实用户分享，而不是硬广。可用轻微分点，但避免堆砌形容词。\n\n【能力】\n1. 种草笔记：场景开头 → 使用感受 → 适合谁 → 小 tip。\n2. 卖点短文：突出质地/肤感/场景，每条一句说清。\n3. 活动文案：突出权益与行动号召，不虚假承诺。\n4. 可按运营给定的商品名、成分、肤质、场景改写多版语气（清新/专业/活泼）。\n\n【必须遵守】\n1. 不使用绝对化用语（最、第一、唯一、100%、永久等），无合法依据时禁用。\n2. 不做医疗化宣称（治疗、根治、药到病除、医院同款疗效等）。\n3. 不编造检测报告、明星背书、虚构评价数据。\n4. 功效表述留有余地（如「有助于」「适合尝试」）；敏感肌提示先局部试用。\n5. 遵守广告法与平台规范；你的内置安全原则优先。\n\n【输出】\n- 按用户要求的体裁输出；未指定时默认「种草笔记」200～400 字。\n- 需要多版本时标注「版本 A/B」。\n- 不输出与撰写无关的闲聊。',
      maxTokens: '2048'
    },
    shenhe: {
      name: 'AI商品审核',
      temp: '0.2',
      maxTokens: '2048',
      prompt: '你是「美丽修行」电商平台的商品合规审核助手。'
    },
    nrsh: {
      name: 'ai内容审核',
      temp: '0.2',
      maxTokens: '2048',
      prompt: '你是「美丽修行」社区内容审核助手，负责审核笔记、评论、问答、动态与文章文案是否符合平台社区规范。\n\n【审核范围】\n标题、正文、评论、话题标签及明显的导流话术；若有图片文字说明一并考虑。\n\n【判断依据】\n1. 平台社区规范：禁止低俗色情、人身攻击、仇恨歧视、违法违禁信息。\n2. 营销与导流：站外微信/QQ/二维码引流、诱导私下交易、刷单炒信。\n3. 虚假信息：虚构成分功效、伪造资质、谣言恐吓式营销。\n4. 广告法精神：绝对化用语、医疗化功效宣称等明显违规表述。\n5. 你的内置安全与合规原则优先。\n\n【常见违规信号】\n- 低俗擦边、辱骂攻击、地域/性别歧视\n- 站外导流、加好友成交、虚假抽奖\n- 「包治」「根除」「永不过敏」等无法核验承诺\n- 泄露他人隐私、冒充官方\n\n【原则】\n- 仅依据给定文本判断，不臆造未提供的事实。\n- 存疑但未明显违规：可「通过」，并写风险提示。\n- 明显违规或高风险：「驳回」，理由具体到原文片段与类型。\n\n【输出格式（严格遵守）】\n第一行只能是：通过 或 驳回\n第二行起写理由，条目化，每条一行：\n- [类型] 原文「…」→ 问题说明\n若通过且无问题，理由写：未发现明显违规表述。\n若通过但有风险，以「风险提示：」开头列出建议复核点。'
    },
    wenst: {
      name: 'ai文生图',
      temp: '0.8',
      maxTokens: '2048',
      prompt: '你是「美丽修行」美妆电商的 AI 文生图提示词助手。'
    },
    /* App「我的 → 帮助 / AI帮助中心」↔ 运营「AI帮助」 */
    bangzhu: {
      name: 'AI帮助助手',
      temp: '0.6',
      welcome: '你好，我是妆小妍帮助助手\n有不会用的地方直接问我，或点下方快捷问题',
      prompt: '你是「美丽修行」（阅己美妆）App 的帮助中心对话助手，像客服一样多轮解答「怎么用 App」。\n\n【目标】\n用简洁可执行的步骤，帮用户找到入口并完成任务（测肤、下单、售后、AI 能力、会员积分、社区种草等）。\n\n【对话要求】\n1. 直接用自然语言回答，不要输出 JSON / markdown 代码块。\n2. 优先短段落 + 编号步骤（1. 2. 3.）。\n3. 只使用真实入口名：首页、发现、测肤、阅己盒、我的、AI导购、AI客服、我的订单、积分商城、梳妆台、领券中心、发布种草。\n4. 不编造菜单/活动/权益；不确定时写「可在相关页面查看」，或引导「AI客服」。\n5. 选品引导「AI导购」；订单/售后引导「AI客服」或「我的订单」。\n6. 不做医疗诊断与绝对化功效宣称。\n\n【知识库】\n若上下文提供了帮助条目，优先据此整理回答。',
      fallback: '暂时无法连上助手，我先按本地说明回答；也可换个问法，或去 AI 客服。',
      quick: '怎么完成一次 AI 测肤？\n下单、查物流和申请售后怎么操作？\nAI 导购和 AI 客服分别怎么用？\n积分怎么攒、怎么花？\n发现页怎么浏览和发布种草？\nApp 常用入口有哪些？请简要介绍',
      maxTokens: '900',
      tables: []
    }
  };

  function clone(obj) {
    try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
  }

  function linesOf(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map(function (s) { return s.replace(/^\s+|\s+$/g, ''); })
      .filter(Boolean);
  }

  function mergeMod(base, patch) {
    var out = clone(base || {});
    if (!patch || typeof patch !== 'object') return out;
    Object.keys(patch).forEach(function (k) {
      if (patch[k] != null) out[k] = patch[k];
    });
    return out;
  }

  function normalize(raw) {
    var src = raw && typeof raw === 'object' ? raw : {};
    var out = {
      kefu: mergeMod(DEFAULTS.kefu, src.kefu),
      daogou: mergeMod(DEFAULTS.daogou, src.daogou),
      shitu: mergeMod(DEFAULTS.shitu, src.shitu),
      cefu: mergeMod(DEFAULTS.cefu, src.cefu),
      zhuanxie: mergeMod(DEFAULTS.zhuanxie, src.zhuanxie),
      shenhe: mergeMod(DEFAULTS.shenhe, src.shenhe),
      nrsh: mergeMod(DEFAULTS.nrsh, src.nrsh),
      wenst: mergeMod(DEFAULTS.wenst, src.wenst),
      bangzhu: mergeMod(DEFAULTS.bangzhu, src.bangzhu),
      kefuTables: Array.isArray(src.kefuTables) ? src.kefuTables.slice() : (DEFAULTS.kefu.tables || []).slice(),
      daogouTables: Array.isArray(src.daogouTables) ? src.daogouTables.slice() : (DEFAULTS.daogou.tables || []).slice(),
      shituTables: Array.isArray(src.shituTables) ? src.shituTables.slice() : (DEFAULTS.shitu.tables || []).slice(),
      bangzhuTables: Array.isArray(src.bangzhuTables) ? src.bangzhuTables.slice() : (DEFAULTS.bangzhu.tables || []).slice(),
      updatedAt: src.updatedAt || ''
    };
    if (out.kefu && Array.isArray(out.kefu.tables) && (!src.kefuTables || !src.kefuTables.length)) {
      out.kefuTables = out.kefu.tables.slice();
    }
    if (out.daogou && Array.isArray(out.daogou.tables) && (!src.daogouTables || !src.daogouTables.length)) {
      out.daogouTables = out.daogou.tables.slice();
    }
    if (out.shitu && Array.isArray(out.shitu.tables) && (!src.shituTables || !src.shituTables.length)) {
      out.shituTables = out.shitu.tables.slice();
    }
    if (out.bangzhu && Array.isArray(out.bangzhu.tables) && (!src.bangzhuTables || !src.bangzhuTables.length)) {
      out.bangzhuTables = out.bangzhu.tables.slice();
    }
    /* migrate meili prompts */
    if (out.shitu) {
      var sp = String(out.shitu.prompt || '');
      if (!sp || sp.length < 80 || /妆研美妆的 AI 识图助手/.test(sp) || /^#角色/.test(sp)) {
        out.shitu.prompt = DEFAULTS.shitu.prompt;
      }
    }
    if (out.cefu) {
      var cp = String(out.cefu.prompt || '');
      if (!cp || cp.length < 120) {
        out.cefu.prompt = DEFAULTS.cefu.prompt;
      }
    }

    if (out.kefu && /国际妈咪|母婴电商/.test(String(out.kefu.prompt || out.kefu.welcome || ''))) {
      out.kefu.prompt = DEFAULTS.kefu.prompt;
      out.kefu.welcome = DEFAULTS.kefu.welcome;
    }
    if (out.daogou) {
      var dp = String(out.daogou.prompt || '');
      if (!dp || dp.length < 80 || /妆研美妆的 AI 妆小妍，擅长护肤彩妆导购与成分解读/.test(dp)) {
        out.daogou.prompt = DEFAULTS.daogou.prompt;
      }
    }
    /* AI帮助：旧版 JSON 卡片 prompt → 对话式 */
    if (out.bangzhu) {
      var bp = String(out.bangzhu.prompt || '');
      if (!bp || /只输出 JSON 数组|JSON 数组/.test(bp)) {
        out.bangzhu.prompt = DEFAULTS.bangzhu.prompt;
      }
      var bq = String(out.bangzhu.quick || '');
      if (!bq || /^(全部|测肤护肤|订单售后)/m.test(bq) && bq.indexOf('？') < 0 && bq.indexOf('?') < 0) {
        out.bangzhu.quick = DEFAULTS.bangzhu.quick;
      }
      var bw = String(out.bangzhu.welcome || '');
      if (/自定义生成专属帮助/.test(bw)) {
        out.bangzhu.welcome = DEFAULTS.bangzhu.welcome;
      }
      var bf = String(out.bangzhu.fallback || '');
      if (/展示本地常用说明/.test(bf)) {
        out.bangzhu.fallback = DEFAULTS.bangzhu.fallback;
      }
    }
    /* 旧版仅 4 条唇妆快捷 → 自动升级为含身体乳/眼霜/香水的完整列表 */
    if (out.daogou) {
      var qLines = linesOf(out.daogou.quick);
      var legacyQuick = qLines.length > 0 && qLines.length <= 4
        && qLines.indexOf('推荐一支显白口红') >= 0
        && qLines.join('\n').indexOf('身体乳') < 0;
      if (legacyQuick) {
        out.daogou.quick = DEFAULTS.daogou.quick;
        out.daogou.tags = DEFAULTS.daogou.tags;
        out.daogou.fallback = DEFAULTS.daogou.fallback;
      }
      if (!out.daogou.tables || !out.daogou.tables.length) {
        out.daogou.tables = (DEFAULTS.daogou.tables || []).slice();
      }
      if ((!src.daogouTables || !src.daogouTables.length) && out.daogou.tables) {
        out.daogouTables = out.daogou.tables.slice();
      }
    }
    return out;
  }

  /** 压缩头像，避免 localStorage 配额失败 */
  function compressAvatarDataUrl(dataUrl, maxSide, quality) {
    return new Promise(function (resolve) {
      if (!dataUrl || String(dataUrl).indexOf('data:image') !== 0) {
        resolve(dataUrl || '');
        return;
      }
      maxSide = maxSide || 160;
      quality = quality == null ? 0.72 : quality;
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (!w || !h) { resolve(dataUrl); return; }
          var scale = Math.min(1, maxSide / Math.max(w, h));
          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, cw, ch);
          var out = canvas.toDataURL('image/jpeg', quality);
          if (out && out.length < String(dataUrl).length) resolve(out);
          else resolve(dataUrl);
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = function () { resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  function compressCfgAvatars(cfg) {
    cfg = normalize(cfg || {});
    var mods = ['kefu', 'daogou', 'shitu', 'cefu'];
    var chain = Promise.resolve();
    mods.forEach(function (m) {
      chain = chain.then(function () {
        if (!cfg[m] || !cfg[m].avatar) return;
        return compressAvatarDataUrl(cfg[m].avatar).then(function (next) {
          cfg[m].avatar = next || '';
        });
      });
    });
    return chain.then(function () { return cfg; });
  }

  function readLlmAiCfg() {
    try {
      var raw = localStorage.getItem(LLM_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.ai && parsed.ai.aiCfg ? parsed.ai.aiCfg : null;
    } catch (e) {
      return null;
    }
  }

  function persistToStorage(next) {
    var ok = true;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      ok = false;
      /* 配额不足时去掉头像再试一次，至少保住文案 */
      try {
        var slim = clone(next);
        ['kefu', 'daogou', 'shitu', 'cefu'].forEach(function (m) {
          if (slim[m]) slim[m].avatar = '';
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
      } catch (e2) { /* ignore */ }
    }
    try {
      var llmRaw = localStorage.getItem(LLM_KEY);
      var llm = llmRaw ? JSON.parse(llmRaw) : {};
      if (!llm || typeof llm !== 'object') llm = {};
      llm.ai = llm.ai || {};
      llm.ai.aiCfg = next;
      localStorage.setItem(LLM_KEY, JSON.stringify(llm));
    } catch (e3) {
      try {
        var llmRaw2 = localStorage.getItem(LLM_KEY);
        var llm2 = llmRaw2 ? JSON.parse(llmRaw2) : {};
        if (!llm2 || typeof llm2 !== 'object') llm2 = {};
        llm2.ai = llm2.ai || {};
        var slim2 = clone(next);
        ['kefu', 'daogou', 'shitu', 'cefu'].forEach(function (m) {
          if (slim2[m]) slim2[m].avatar = '';
        });
        llm2.ai.aiCfg = slim2;
        localStorage.setItem(LLM_KEY, JSON.stringify(llm2));
      } catch (e4) { /* ignore */ }
    }
    return ok;
  }

  function load() {
    if (memoryCfg) return normalize(memoryCfg);
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          memoryCfg = normalize(parsed);
          return memoryCfg;
        }
      }
    } catch (e) { /* ignore */ }
    var fromLlm = readLlmAiCfg();
    if (fromLlm) {
      memoryCfg = normalize(fromLlm);
      return memoryCfg;
    }
    return normalize(null);
  }

  function withSyncScope(cfg, scope) {
    var out = clone(normalize(cfg || {}));
    out._syncScope = scope === 'tables' ? 'tables' : 'full';
    return out;
  }

  function broadcast(cfg, meta) {
    meta = meta || {};
    var scoped = withSyncScope(cfg, meta.scope || 'full');
    var payload = { type: SYNC_MSG, payload: scoped };
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage(payload, '*');
      }
    } catch (e) { /* ignore */ }
    try {
      global.postMessage(payload, '*');
    } catch (e0) { /* ignore */ }
    try {
      global.dispatchEvent(new CustomEvent('ai-config-updated', { detail: cfg }));
    } catch (e2) { /* ignore */ }
  }

  function save(cfg, meta) {
    meta = meta || {};
    var next = normalize(cfg || {});
    next.updatedAt = new Date().toISOString();
    memoryCfg = next;
    persistToStorage(next);
    broadcast(next, { scope: meta.scope || 'full' });
    return next;
  }

  /** 仅同步数据表勾选（不广播/覆盖系统提示词） */
  function saveTablesOnly(patch) {
    patch = patch || {};
    var cur = load();
    var next = normalize(cur);
    if (Array.isArray(patch.kefuTables)) {
      next.kefuTables = patch.kefuTables.slice();
      if (next.kefu) next.kefu.tables = next.kefuTables.slice();
    }
    if (Array.isArray(patch.daogouTables)) {
      next.daogouTables = patch.daogouTables.slice();
      if (next.daogou) next.daogou.tables = next.daogouTables.slice();
    }
    if (Array.isArray(patch.shituTables)) {
      next.shituTables = patch.shituTables.slice();
      if (next.shitu) next.shitu.tables = next.shituTables.slice();
    }
    if (Array.isArray(patch.bangzhuTables)) {
      next.bangzhuTables = patch.bangzhuTables.slice();
      if (next.bangzhu) next.bangzhu.tables = next.bangzhuTables.slice();
    }
    next.updatedAt = new Date().toISOString();
    memoryCfg = next;
    persistToStorage(next);
    broadcast(next, { scope: 'tables' });
    return next;
  }

  function saveAsync(cfg) {
    return compressCfgAvatars(cfg).then(function (compressed) {
      return save(compressed, { scope: 'full' });
    });
  }

  function applyRemote(cfg) {
    if (!cfg || typeof cfg !== 'object') return load();
    var next = normalize(cfg);
    memoryCfg = next;
    persistToStorage(next);
    try {
      global.dispatchEvent(new CustomEvent('ai-config-updated', { detail: next }));
    } catch (e3) { /* ignore */ }
    return next;
  }

  function requestSync() {
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: REQUEST_MSG }, '*');
      }
    } catch (e) { /* ignore */ }
  }

  function buildModule(cfg, mod) {
    cfg = normalize(cfg || {});
    var key = String(mod || 'daogou');
    var item = mergeMod(DEFAULTS[key] || {}, cfg[key] || {});
    var tablesKey = key + 'Tables';
    item.tables = Array.isArray(cfg[tablesKey]) ? cfg[tablesKey].slice() : (item.tables || []).slice();
    item.quickList = linesOf(item.quick);
    item.tagList = linesOf(item.tags);
    /* AI导购：快捷问题优先按运营商品目录动态生成 */
    if (key === 'daogou') {
      try {
        var gen = buildDaogouQuickQuestions(12);
        if (gen && gen.length) item.quickList = gen;
      } catch (eQuick) { /* keep configured quickList */ }
    }
    return item;
  }

  function getModule(mod) {
    return buildModule(load(), mod);
  }

  /** storage 重载时保留内存中的头像（写盘可能因配额被 strip） */
  function mergeMemoryWithDisk(prev, fromDisk) {
    fromDisk = normalize(fromDisk || {});
    if (!prev) return fromDisk;
    prev = normalize(prev);
    var merged = normalize(fromDisk);
    ['kefu', 'daogou', 'shitu', 'cefu'].forEach(function (m) {
      if (!prev[m]) return;
      if (prev[m].avatar && (!merged[m] || !merged[m].avatar)) {
        merged[m] = mergeMod(merged[m] || {}, { avatar: prev[m].avatar });
      }
    });
    if (prev.updatedAt && (!merged.updatedAt || prev.updatedAt >= merged.updatedAt)) {
      merged.kefu = mergeMod(merged.kefu, prev.kefu);
      merged.daogou = mergeMod(merged.daogou, prev.daogou);
      merged.shitu = mergeMod(merged.shitu, prev.shitu);
      merged.cefu = mergeMod(merged.cefu, prev.cefu);
      merged.zhuanxie = mergeMod(merged.zhuanxie, prev.zhuanxie);
      merged.shenhe = mergeMod(merged.shenhe, prev.shenhe);
      merged.nrsh = mergeMod(merged.nrsh, prev.nrsh);
      merged.wenst = mergeMod(merged.wenst, prev.wenst);
      merged.bangzhu = mergeMod(merged.bangzhu, prev.bangzhu);
      merged.updatedAt = prev.updatedAt;
    }
    return merged;
  }

  /** 运营端表名 → App 侧可检索的数据源（与 meilixiuxing 真实表对齐） */
  var TABLE_SOURCE_MAP = {
    spgl: 'product',
    zcgl: 'grass',
    zhongcaobiao: 'grass',
    pjgl: 'review',
    pinglunbiao: 'review',
    wzgl: 'article',
    sjgl: 'merchant',
    ddgl: 'order',
    shgl: 'aftersale',
    yhgl: 'user',
    htgl: 'topic',
    dtgl: 'feed',
    qzgl: 'circle',
    app_store: 'app_store',
    db_meta: 'meta'
  };

  var TABLE_SOURCE_LABELS = {
    spgl: '商品管理（spgl）',
    zcgl: '种草管理（zcgl）',
    zhongcaobiao: '种草管理（zhongcaobiao）',
    pjgl: '评价管理（pjgl）',
    pinglunbiao: '商品评价（pinglunbiao）',
    wzgl: '文章管理（wzgl）',
    sjgl: '商家管理（sjgl）',
    ddgl: '订单管理（ddgl）',
    demo: '演示商品库',
    product: '商品管理'
  };

  function getSourceLabel(tableOrKind) {
    var key = String(tableOrKind || 'spgl');
    return TABLE_SOURCE_LABELS[key] || ('数据表 ' + key);
  }

  function buildRecommendSource(table, p) {
    var label = getSourceLabel(table || 'spgl');
    var bits = [label];
    if (p && p.id) bits.push('货号 ' + p.id);
    if (p && p.sku) bits.push('SKU ' + p.sku);
    if (table === 'spgl' || !table) {
      bits.push('来自运营端「商品管理」关联检索');
    } else if (table === 'zcgl' || table === 'zhongcaobiao') {
      bits.push('来自运营端「种草管理」笔记');
    } else if (table === 'pjgl' || table === 'pinglunbiao') {
      bits.push('来自运营端「评价管理」用户评价');
    } else if (table === 'wzgl') {
      bits.push('来自运营端「文章管理」');
    }
    return bits.join(' · ');
  }

  /** AI 导购可实际用于回答的检索源（其余表仅记录约束，不作推荐卡） */
  var GUIDE_RETRIEVABLE = ['spgl', 'zcgl', 'zhongcaobiao', 'pjgl', 'pinglunbiao', 'wzgl'];

  function normalizeGuideTable(name) {
    var t = String(name || '');
    if (t === 'zhongcaobiao') return 'zhongcaobiao';
    if (t === 'pinglunbiao') return 'pinglunbiao';
    return t;
  }

  function usesGrassTable(active) {
    return active.indexOf('zcgl') >= 0 || active.indexOf('zhongcaobiao') >= 0;
  }

  function usesReviewTable(active) {
    return active.indexOf('pjgl') >= 0 || active.indexOf('pinglunbiao') >= 0;
  }

  function preferredGrassTable(active) {
    if (active.indexOf('zhongcaobiao') >= 0) return 'zhongcaobiao';
    return 'zcgl';
  }

  function preferredReviewTable(active) {
    if (active.indexOf('pinglunbiao') >= 0) return 'pinglunbiao';
    return 'pjgl';
  }

  function getModuleTables(mod) {
    var item = getModule(mod);
    return Array.isArray(item.tables) ? item.tables.slice() : [];
  }

  function usesTable(mod, tableName) {
    var tables = getModuleTables(mod);
    /* 与运营端文案一致：未勾选 = 检索全部可联通表 */
    if (!tables.length) return true;
    return tables.indexOf(String(tableName || '')) >= 0;
  }

  function resolveGuideTables(mod) {
    var selected = getModuleTables(mod || 'daogou');
    if (!selected.length) return GUIDE_RETRIEVABLE.slice();
    return selected.filter(function (t) {
      return GUIDE_RETRIEVABLE.indexOf(t) >= 0;
    });
  }

  /** 问句里的虚词，不做 n-gram 命中 */
  var GUIDE_QUERY_STOP = /^(需要|想要|想买|给我|帮我|推荐|一下|什么|怎么|哪些|里面|里边|的|了|吗|呢|吧|商品|单品|好物|可以|看看|选购|购买)$/;

  function collectCatalogEntities(list) {
    var brands = {};
    var merchants = {};
    var i;
    for (i = 0; i < (list || []).length; i++) {
      var p = list[i];
      if (!p) continue;
      if (p.brand) brands[String(p.brand)] = true;
      if (p.merchant) merchants[String(p.merchant)] = true;
    }
    function keys(map) {
      var out = [];
      for (var k in map) {
        if (Object.prototype.hasOwnProperty.call(map, k)) out.push(k);
      }
      return out.sort(function (a, b) { return b.length - a.length; });
    }
    return { brands: keys(brands), merchants: keys(merchants) };
  }

  function merchantCoreName(name) {
    return String(name || '')
      .replace(/官方授权店|官方旗舰店|国风旗舰店|旗舰店|品牌店|专营店|专营|授权店|生活美学馆|奢享汇|护理店|美妆店|店$/g, '')
      .replace(/\s+/g, '');
  }

  /**
   * 相对商品管理列表做「语义实体」解析：点名的品牌 / 店铺
   * （不是列表顺序兜底，而是用问句去对齐目录里的 brand、merchant）
   */
  function resolveGuideIntent(query, list) {
    var q = String(query || '');
    var intent = {
      brands: [],
      merchants: [],
      shopAsked: /店|店铺|旗舰|专营|商家|店里|店内|该店|这家店/.test(q),
      brandAsked: false
    };
    if (!q) return intent;
    var ent = collectCatalogEntities(list);
    var i;
    for (i = 0; i < ent.merchants.length; i++) {
      var m = ent.merchants[i];
      var core = merchantCoreName(m);
      if (q.indexOf(m) >= 0) {
        intent.merchants.push(m);
        continue;
      }
      if (core.length >= 2 && q.indexOf(core) >= 0) {
        intent.merchants.push(m);
        continue;
      }
      /* 「花西子国风店」对齐「花西子国风旗舰店」 */
      if (intent.shopAsked && core.length >= 2) {
        var hit = true;
        var parts = core.replace(/国风|东方|官方/g, function (x) { return x; });
        if (core.indexOf('花西子') >= 0 && /花西子/.test(q) && (/国风|旗舰|店/.test(q))) {
          intent.merchants.push(m);
          hit = true;
        } else if (core.length >= 3 && q.indexOf(core.slice(0, Math.min(4, core.length))) >= 0 && /店/.test(q)) {
          /* 前缀 + 店 */
          if (m.indexOf(core.slice(0, 2)) >= 0) intent.merchants.push(m);
        }
        void hit;
      }
    }
    /* 去重 */
    var seenM = {};
    intent.merchants = intent.merchants.filter(function (m) {
      if (seenM[m]) return false;
      seenM[m] = true;
      return true;
    });

    for (i = 0; i < ent.brands.length; i++) {
      var b = ent.brands[i];
      if (b && q.indexOf(b) >= 0) intent.brands.push(b);
    }
    if (/花西子|florasis/i.test(q) && intent.brands.indexOf('花西子') < 0) intent.brands.push('花西子');
    if (/阅己/.test(q) && intent.brands.indexOf('阅己') < 0) intent.brands.push('阅己');
    if (/完美日记/.test(q) && intent.brands.indexOf('完美日记') < 0) intent.brands.push('完美日记');
    if (/自然堂/.test(q) && intent.brands.indexOf('自然堂') < 0) intent.brands.push('自然堂');
    if (/兰蔻|Lancôme|Lancome/i.test(q) && intent.brands.indexOf('Lancôme') < 0) intent.brands.push('Lancôme');
    if (/雅诗兰黛|Estée|Estee/i.test(q) && intent.brands.indexOf('雅诗兰黛') < 0) intent.brands.push('雅诗兰黛');
    if (/SK-?II/i.test(q) && intent.brands.indexOf('SK-II') < 0) intent.brands.push('SK-II');
    if (/海蓝之谜|La\s*Mer/i.test(q) && intent.brands.indexOf('海蓝之谜') < 0) intent.brands.push('海蓝之谜');
    if (/修丽可|SkinCeuticals/i.test(q) && intent.brands.indexOf('修丽可') < 0) intent.brands.push('修丽可');
    if (/珂润|Curel/i.test(q) && intent.brands.indexOf('珂润') < 0) intent.brands.push('珂润');
    if (/欧莱雅|L'?Oréal|Loreal/i.test(q) && intent.brands.indexOf("L'Oréal Paris") < 0) {
      intent.brands.push("L'Oréal Paris");
    }
    intent.brandAsked = intent.brands.length > 0;
    return intent;
  }

  function productMatchesIntent(p, intent) {
    if (!intent) return true;
    var brand = String((p && p.brand) || '');
    var merchant = String((p && p.merchant) || '');
    if (intent.merchants && intent.merchants.length) {
      var okShop = false;
      for (var i = 0; i < intent.merchants.length; i++) {
        var m = intent.merchants[i];
        if (merchant === m || merchant.indexOf(merchantCoreName(m)) >= 0 || m.indexOf(merchantCoreName(merchant)) >= 0) {
          okShop = true;
          break;
        }
        if (/花西子/.test(m) && /花西子/.test(merchant)) { okShop = true; break; }
      }
      if (!okShop) return false;
    } else if (intent.shopAsked && intent.brands && intent.brands.length) {
      /* 点了「店」+ 品牌，但没精确店名：同品牌店铺也可 */
      var okB = false;
      for (var j = 0; j < intent.brands.length; j++) {
        if (brand === intent.brands[j] || brand.indexOf(intent.brands[j]) >= 0 || merchant.indexOf(intent.brands[j]) >= 0) {
          okB = true;
          break;
        }
      }
      if (!okB) return false;
    } else if (intent.brands && intent.brands.length && (intent.brandAsked || intent.shopAsked)) {
      var hit = false;
      for (var k = 0; k < intent.brands.length; k++) {
        if (brand === intent.brands[k] || brand.indexOf(intent.brands[k]) >= 0) { hit = true; break; }
      }
      /* 仅品牌点名且未点店铺时：也允许同品牌 */
      if (!hit) return false;
    }
    return true;
  }

  function scoreByQuery(q, blob) {
    var s = 0;
    var text = String(blob || '');
    var query = String(q || '');
    if (!query) return 1;
    if (/口红|唇|显白|豆沙/.test(query) && /口红|唇|唇膏|唇釉|豆沙|显白/.test(text)) s += 5;
    if (/身体乳|身体护理|润肤乳|身体霜|美白身体/.test(query) && /身体乳|身体护理|润肤|身体霜|OLAY|山茶油/.test(text)) s += 8;
    if (/眼霜|眼部|抗蓝光|淡纹|黑眼圈/.test(query) && !/眼影/.test(query) && /眼霜|眼部|抗蓝光|淡纹|小棕瓶/.test(text)) s += 8;
    if (/香水|香氛|淡香|香调|留香/.test(query) && /香水|香氛|香调|留香/.test(text)) s += 8;
    if (/眼影|眼影盘/.test(query) && /眼影|眼影盘/.test(text)) s += 7;
    if (/男士|男友|男生/.test(query) && /男士|男|控油|洁面/.test(text)) s += 6;
    if (/换季/.test(query) && /护肤|修护|敏感|屏障|面霜|精华|面膜/.test(text)) s += 5;
    if (/爽肤水|化妆水|柔肤水|精华水|toner/i.test(query) && /爽肤水|化妆水|柔肤水|精华水|冰川水|神仙水/.test(text)) s += 6;
    if (/干皮|补水|保湿|精华/.test(query) && /精华|补水|保湿|面霜|乳液|干皮|爽肤水|面膜/.test(text)) s += 5;
    if (/敏感|修护/.test(query) && /敏感|修护|温和/.test(text)) s += 5;
    if (/底妆|粉底/.test(query) && /粉底|底妆|气垫/.test(text)) s += 5;
    if (/洁面|洗面奶/.test(query) && /洁面|洗面/.test(text)) s += 5;
    if (/面霜|乳液|乳霜/.test(query) && !/身体乳/.test(query) && /面霜|乳液|乳霜|乳液\/面霜/.test(text)) s += 4;
    if (/面膜/.test(query) && /面膜/.test(text)) s += 5;
    if (/抗初老/.test(query) && /精华|抗|初老|维A|视黄醇/.test(text)) s += 4;
    if (/礼盒|送礼/.test(query) && /礼盒|套装|套组|送礼/.test(text)) s += 4;
    /* 成分问句加权：问句里的成分词命中品名/品牌/类目 */
    if (/烟酰胺/.test(query) && /烟酰胺/.test(text)) s += 10;
    if (/玻尿酸|透明质酸|水光/.test(query) && /玻尿酸|透明质酸|水光/.test(text)) s += 10;
    if (/神经酰胺|珂润/.test(query) && /神经酰胺|珂润|敏感/.test(text)) s += 10;
    if (/视黄醇|A醇|抗初老/.test(query) && /视黄醇|A醇|抗初老|小棕瓶/.test(text)) s += 10;
    if (/氨基酸/.test(query) && /氨基酸|洁面|洗面/.test(text)) s += 9;
    if (/维\s*C|维生素C|抗氧/.test(query) && /维\s*C|维生素C|CE|抗氧|色修/.test(text)) s += 9;
    if (/泛醇|B5/.test(query) && /泛醇|B5|HEY/.test(text)) s += 9;
    if (/积雪草/.test(query) && /积雪草|修护/.test(text)) s += 8;
    if (/成分|全成分/.test(query) && /精华|面霜|洁面|面膜|爽肤|乳液|粉底|口红/.test(text)) s += 2;

    /* 中文滑动片段：把「花西子国风店」拆成可对齐目录字段的语义片段 */
    var compact = query.replace(/\s+/g, '');
    var seenGram = {};
    var len;
    var i;
    for (len = Math.min(6, compact.length); len >= 2; len--) {
      for (i = 0; i + len <= compact.length; i++) {
        var gram = compact.slice(i, i + len);
        if (GUIDE_QUERY_STOP.test(gram) || seenGram[gram]) continue;
        seenGram[gram] = true;
        if (text.indexOf(gram) >= 0) {
          s += len >= 4 ? 4 : (len >= 3 ? 2 : 1);
        }
      }
    }
    return s;
  }

  /** 从问句解析预算约束：以内/以下/区间/平价 */
  function parseGuidePriceConstraint(q) {
    var query = String(q || '');
    var out = { min: null, max: null, cheap: false };
    if (/平价|便宜|学生党/.test(query)) {
      out.cheap = true;
      if (out.max == null) out.max = 200;
    }
    var range = query.match(/(\d+)\s*[-~～到至]\s*(\d+)/);
    if (range) {
      out.min = Number(range[1]);
      out.max = Number(range[2]);
      return out;
    }
    var within = query.match(/(?:预算|价格|价位)?\s*(\d+)\s*(?:元)?\s*(?:以内|以下|之内|内)/);
    if (within) {
      out.max = Number(within[1]);
      return out;
    }
    var above = query.match(/(\d+)\s*(?:元)?\s*(?:以上|起|\+)/);
    if (above) {
      out.min = Number(above[1]);
      return out;
    }
    var around = query.match(/(\d+)\s*(?:元)?\s*左右/);
    if (around) {
      var n = Number(around[1]);
      out.min = Math.floor(n * 0.8);
      out.max = Math.ceil(n * 1.2);
      return out;
    }
    if (/预算/.test(query)) {
      var m = query.match(/(\d+)/);
      if (m) out.max = Number(m[1]);
    }
    return out;
  }

  function productMatchesPriceConstraint(p, constraint) {
    if (!constraint) return true;
    if (constraint.min == null && constraint.max == null && !constraint.cheap) return true;
    var price = Number(p && p.price);
    if (isNaN(price) || price <= 0) return false;
    if (constraint.min != null && price < constraint.min) return false;
    if (constraint.max != null && price > constraint.max) return false;
    return true;
  }

  /** 明确品类提问时，过滤掉明显跨品类的商品（避免香水带出口红、洁面带出精华） */
  function matchesStrictCategory(q, p) {
    var query = String(q || '');
    var blob = [p && p.name, p && p.cat1, p && p.cat2, p && p.cat3, p && p.brand].join(' ');
    if (/身体乳|身体护理|润肤乳|身体霜|美白身体/.test(query)) {
      return /身体乳|身体护理|润肤|身体霜|山茶油霜/.test(blob);
    }
    if (/眼霜|抗蓝光|眼部|淡纹|黑眼圈/.test(query) && !/眼影/.test(query)) {
      return /眼霜|眼部|抗蓝光/.test(blob);
    }
    if (/香水|香氛|淡香|香调|留香/.test(query)) {
      return /香水|香氛|香调/.test(blob);
    }
    if (/眼影|眼影盘/.test(query)) {
      return /眼影/.test(blob);
    }
    if (/口红|唇釉|唇膏|唇妆/.test(query) && !/底妆|粉底/.test(query)) {
      return /口红|唇|唇釉|唇膏/.test(blob);
    }
    if (/洁面|洗面奶|洗面/.test(query)) {
      return /洁面|洗面|洁颜/.test(blob);
    }
    /* 问「精华」时排除洁面等；「精华水/神仙水」走爽肤水语义，不走本条 */
    if (/精华/.test(query) && !/精华水|神仙水/.test(query) && !/洁面|洗面|面霜|乳液|面膜|口红|粉底|身体乳/.test(query)) {
      return /精华/.test(blob) && !/洁面|洗面/.test(blob);
    }
    if (/面霜|乳液|乳霜/.test(query) && !/身体乳|洁面|精华液|次抛/.test(query)) {
      return /面霜|乳液|乳霜|乳液\/面霜/.test(blob);
    }
    if (/面膜/.test(query) && !/洁面/.test(query)) {
      return /面膜/.test(blob);
    }
    if (/爽肤水|化妆水|柔肤水/.test(query) && !/神仙水|SK-?II|SK2/i.test(query)) {
      var cat3t = String((p && p.cat3) || '');
      var namet = String((p && p.name) || '');
      if (cat3t === '精华' && !/爽肤水|化妆水|柔肤水|冰川水/.test(namet + cat3t)) return false;
      return /爽肤水|化妆水|柔肤水|精华水|冰川水/.test(blob) && !/洁面|洗面|洁颜|神仙水/.test(blob);
    }
    if (/精华水|神仙水/.test(query) || /SK-?II|神仙水/i.test(query)) {
      return /爽肤水|化妆水|柔肤水|精华水|神仙水|冰川水/.test(blob) && !/洁面|洗面|洁颜/.test(blob);
    }
    if (/粉底|气垫|底妆/.test(query)) {
      return /粉底|气垫|底妆|CC/.test(blob);
    }
    if (/防晒/.test(query)) {
      return /防晒|隔离/.test(blob);
    }
    return true;
  }

  function filterProductsForGuideCategory(products, cat) {
    if (!products || !products.length || !cat) return [];
    var q = cat.label || '';
    return products.filter(function (p) {
      if (!p) return false;
      return matchesStrictCategory(q, p);
    });
  }

  function topGuideBrands(products, limit) {
    var count = {};
    var i;
    for (i = 0; i < (products || []).length; i++) {
      var b = String((products[i] && products[i].brand) || '').replace(/^\s+|\s+$/g, '');
      if (!b) continue;
      count[b] = (count[b] || 0) + 1;
    }
    return Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, limit || 3);
  }

  function guidePriceTiers(products) {
    var prices = [];
    var i;
    for (i = 0; i < (products || []).length; i++) {
      var n = Number(products[i] && products[i].price);
      if (!isNaN(n) && n > 0) prices.push(n);
    }
    prices.sort(function (a, b) { return a - b; });
    if (!prices.length) return ['100 以内', '200 以内', '300-500'];
    var min = prices[0];
    var max = prices[prices.length - 1];
    var mid = prices[Math.floor(prices.length / 2)];
    var t1 = Math.ceil(min / 10) * 10;
    var t2 = Math.ceil(mid / 10) * 10;
    var t3 = Math.ceil(max / 10) * 10;
    if (t1 < 50) t1 = 100;
    if (t2 <= t1) t2 = t1 + 100;
    if (t3 <= t2) t3 = t2 + 200;
    return [
      String(t1) + ' 以内',
      String(t2) + ' 以内',
      String(Math.max(t2 + 1, t3 - 200)) + '-' + String(t3)
    ];
  }

  function topGuideFeatureThemes(products, limit) {
    var defs = [
      { re: /玻尿酸|透明质酸|水光|补水|保湿|冰川/, label: '补水保湿' },
      { re: /敏感|舒敏|屏障|修护|神经酰胺|珂润/, label: '敏感肌修护' },
      { re: /控油|清爽|男士|龙血/, label: '控油清爽' },
      { re: /抗初老|抗皱|视黄醇|A醇|胜肽/, label: '抗初老' },
      { re: /美白|提亮|烟酰胺|VC|维C/, label: '提亮焕肤' },
      { re: /氨基酸|温和|不紧绷/, label: '温和氨基酸' },
      { re: /显白|豆沙|雾面|唇/, label: '显白雾面' },
      { re: /礼盒|送礼/, label: '礼盒送礼' }
    ];
    var score = {};
    var i;
    var j;
    for (i = 0; i < (products || []).length; i++) {
      var blob = [products[i].name, products[i].brand, products[i].cat3, products[i].cat2].join(' ');
      for (j = 0; j < defs.length; j++) {
        if (defs[j].re.test(blob)) {
          score[defs[j].label] = (score[defs[j].label] || 0) + 1;
        }
      }
    }
    var ranked = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
    if (!ranked.length) return ['热门功效', '性价比', '大牌口碑'];
    while (ranked.length < (limit || 3)) {
      for (j = 0; j < defs.length && ranked.length < (limit || 3); j++) {
        if (ranked.indexOf(defs[j].label) < 0) ranked.push(defs[j].label);
      }
      if (ranked.length < (limit || 3)) ranked.push('热门功效');
      break;
    }
    return ranked.slice(0, limit || 3);
  }

  /** 品类内热门成分/质地主题（用于「在意成分」二层引导） */
  function topGuideIngredientThemes(products, limit) {
    var defs = [
      { re: /玻尿酸|透明质酸|水光|补水|保湿/, label: '补水保湿成分' },
      { re: /神经酰胺|屏障|修护|敏感/, label: '屏障修护成分' },
      { re: /烟酰胺|美白|提亮|维\s*C|VC/, label: '提亮焕肤成分' },
      { re: /视黄醇|A醇|抗初老|胜肽/, label: '抗初老成分' },
      { re: /氨基酸|温和|不紧绷/, label: '温和氨基酸' },
      { re: /雾面|哑光|不拔干|滋润|显白|豆沙/, label: '雾面显白/妆感' },
      { re: /控油|清爽|水杨酸/, label: '控油清爽成分' },
      { re: /防晒|隔离|SPF|PA/, label: '防晒防护成分' }
    ];
    var score = {};
    var i;
    var j;
    for (i = 0; i < (products || []).length; i++) {
      var blob = [
        products[i].name, products[i].brand, products[i].cat3, products[i].cat2,
        products[i].ingredients, products[i].benefit, products[i].desc
      ].join(' ');
      for (j = 0; j < defs.length; j++) {
        if (defs[j].re.test(blob)) {
          score[defs[j].label] = (score[defs[j].label] || 0) + 1;
        }
      }
    }
    var ranked = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
    if (!ranked.length) return ['温和好吸收', '功效成分清晰', '敏感肌友好'];
    while (ranked.length < (limit || 3)) {
      for (j = 0; j < defs.length && ranked.length < (limit || 3); j++) {
        if (ranked.indexOf(defs[j].label) < 0) ranked.push(defs[j].label);
      }
      break;
    }
    return ranked.slice(0, limit || 3);
  }

  /**
   * 根据 spgl 商品表为某品类生成 3 条引导提问（固定：品牌 / 价格 / 成分）
   */
  function buildGuideClarifyFromSpgl(cat, products) {
    products = products || loadProductList();
    var list = filterProductsForGuideCategory(products, cat);
    var label = (cat && cat.label) || '相关品类';
    var brands = topGuideBrands(list, 3);
    var tiers = guidePriceTiers(list);
    var ingThemes = topGuideIngredientThemes(list, 3);
    var tips = [
      '推荐' + label + '，我比较在意品牌',
      '推荐' + label + '，我比较在意价格',
      '推荐' + label + '，我比较在意成分'
    ];
    var tipLabels = ['更在意品牌', '更在意价格', '更在意成分'];

    var brandHint = brands.length ? ('在售品牌含「' + brands.slice(0, 3).join('」「') + '」等') : '';
    var prices = [];
    var pi;
    for (pi = 0; pi < list.length; pi++) {
      var pn = Number(list[pi] && list[pi].price);
      if (!isNaN(pn) && pn > 0) prices.push(pn);
    }
    var priceHint = prices.length
      ? ('参考价约 ¥' + Math.min.apply(null, prices) + '–¥' + Math.max.apply(null, prices))
      : '';
    var text = '「' + label + '」选择很多'
      + (list.length ? ('（库内约 ' + list.length + ' 款）') : '')
      + '～为了更准，想先确认你更在乎哪一点？\n'
      + '① 品牌　② 价格　③ 成分'
      + (brandHint ? ('\n' + brandHint + '。') : '')
      + (priceHint ? (' ' + priceHint + '。') : '')
      + '\n点选下方引导，或直接打字说偏好（如「预算200内」「要花西子」「要雾面显白」）。';

    return {
      tips: tips.slice(0, 3),
      tipLabels: tipLabels.slice(0, 3),
      text: text,
      meta: { count: list.length, brands: brands, tiers: tiers, ingredients: ingThemes }
    };
  }

  function buildGuideCategoryClarifyFromSpgl(products) {
    products = products || loadProductList();
    var count = {};
    var i;
    for (i = 0; i < (products || []).length; i++) {
      var p = products[i];
      if (!p) continue;
      var c3 = String(p.cat3 || p.cat2 || p.cat1 || '').trim();
      if (!c3) continue;
      count[c3] = (count[c3] || 0) + 1;
    }
    var ranked = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, 3);
    if (!ranked.length) {
      ranked = ['口红', '面霜', '精华'];
    }
    var tips = [];
    var tipLabels = [];
    for (i = 0; i < ranked.length && i < 3; i++) {
      tips.push('想要一个' + ranked[i]);
      tipLabels.push('想看' + ranked[i]);
    }
    return {
      tips: tips,
      tipLabels: tipLabels,
      text: '可以呀～商品库里热门品类有「' + ranked.join('」「') + '」等。请先点选下面 3 个方向，或直接说品牌/预算。'
    };
  }

  /** 从商品名/三级类推断面霜 or 乳液（同属「乳液/面霜」时靠标题区分） */
  function detectCreamOrLotion(p) {
    var name = String((p && p.name) || '');
    var cat3 = String((p && p.cat3) || '');
    if (/眼霜|防晒霜|身体乳|身体霜/.test(name)) return '';
    if (/面霜|乳霜|特护霜|精华霜|晚霜|日霜|霜\s*\d|霜$/.test(name)) return 'cream';
    if (/乳液/.test(name)) return 'lotion';
    if (cat3 === '面霜' || (cat3.indexOf('面霜') >= 0 && cat3.indexOf('乳液') < 0)) return 'cream';
    if (cat3 === '乳液' || (cat3.indexOf('乳液') >= 0 && cat3.indexOf('面霜') < 0)) return 'lotion';
    if (/霜/.test(name) && !/乳/.test(name)) return 'cream';
    if (/乳/.test(name) && !/霜/.test(name)) return 'lotion';
    return '';
  }

  /** 问面霜则面霜分更高；问乳液则乳液分更高（仍可同框出现，只调排序） */
  function creamLotionPreferScore(q, p) {
    var query = String(q || '');
    if (/身体乳|身体护理/.test(query)) return 0;
    var sub = detectCreamOrLotion(p);
    if (!sub) {
      /* 仅目录「乳液/面霜」、标题无差时给弱分，避免淹没明确款 */
      var cat3 = String((p && p.cat3) || '');
      if (/乳液\/面霜/.test(cat3) && /面霜|乳液|乳霜/.test(query)) return 1;
      return 0;
    }
    var askCream = /面霜|乳霜/.test(query);
    var askLotionOnly = /乳液/.test(query) && !/面霜|乳霜/.test(query);
    if (askCream && !askLotionOnly) {
      if (/乳液/.test(query) && /面霜|乳霜/.test(query)) return sub === 'cream' || sub === 'lotion' ? 3 : 0;
      return sub === 'cream' ? 10 : (sub === 'lotion' ? -3 : 0);
    }
    if (askLotionOnly) {
      return sub === 'lotion' ? 10 : (sub === 'cream' ? -3 : 0);
    }
    return 0;
  }

  var spglCache = null;
  var spglCacheAt = 0;
  var API_BASES = ['http://127.0.0.1:3789', 'http://localhost:3789'];

  function fetchJsonFromApi(path) {
    var i = 0;
    function tryNext() {
      if (i >= API_BASES.length) return Promise.reject(new Error('API 未连接'));
      var base = API_BASES[i++];
      return fetch(base + path, { method: 'GET' })
        .then(function (res) {
          if (!res.ok) throw new Error('status ' + res.status);
          return res.json();
        })
        .catch(function () {
          if (i < API_BASES.length) return tryNext();
          return Promise.reject(new Error('API 未连接'));
        });
    }
    return tryNext();
  }

  function fetchSpglProducts(force) {
    var now = Date.now();
    if (!force && spglCache && (now - spglCacheAt) < 30000) {
      return Promise.resolve(spglCache);
    }
    return fetchJsonFromApi('/api/spgl').then(function (data) {
      var list = (data && Array.isArray(data.products)) ? data.products : [];
      if (data && data.ok && list.length) {
        /* 与运营端「商品管理」一致：MySQL spgl + 本地/APP 商品合并后再检索 */
        var merged = list.slice();
        try {
          if (global.ProductStore && typeof global.ProductStore.load === 'function') {
            var local = global.ProductStore.load() || [];
            var map = {};
            var order = [];
            var i;
            for (i = 0; i < list.length; i++) {
              var id = String(list[i].id || '');
              if (!id) continue;
              map[id] = list[i];
              order.push(id);
            }
            for (i = 0; i < local.length; i++) {
              var lid = String((local[i] && local[i].id) || '');
              if (!lid || map[lid]) continue;
              /* 不以本地演示覆盖已入库的 SP 商品，但保留 APP 端身体乳等非 SP 货 */
              if (/^SP\d+/i.test(lid)) continue;
              map[lid] = local[i];
              order.push(lid);
            }
            if (typeof global.ProductStore.mergeAppProducts === 'function') {
              try {
                var withApp = global.ProductStore.mergeAppProducts(
                  order.map(function (k) { return map[k]; }).filter(Boolean)
                );
                if (Array.isArray(withApp) && withApp.length) {
                  map = {};
                  order = [];
                  for (i = 0; i < withApp.length; i++) {
                    var wid = String((withApp[i] && withApp[i].id) || '');
                    if (!wid || map[wid]) continue;
                    map[wid] = withApp[i];
                    order.push(wid);
                  }
                }
              } catch (eMerge) { /* ignore */ }
            }
            merged = order.map(function (k) { return map[k]; }).filter(Boolean);
            if (typeof global.ProductStore.save === 'function') {
              global.ProductStore.save(merged);
            }
          }
        } catch (eSync) { /* ignore */ }
        spglCache = merged;
        spglCacheAt = Date.now();
        return merged;
      }
      throw new Error((data && data.error) || 'spgl 为空');
    }).catch(function () {
      return loadProductListLocal(false);
    });
  }

  function loadProductListLocal(preferOps) {
    var list = [];
    try {
      if (global.ProductStore && typeof global.ProductStore.mergeAppProducts === 'function'
          && typeof global.ProductStore.load === 'function') {
        list = global.ProductStore.mergeAppProducts(global.ProductStore.load() || []) || [];
      } else if (global.ProductStore && typeof global.ProductStore.load === 'function') {
        list = global.ProductStore.load() || [];
      }
    } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    if (preferOps) {
      var ops = list.filter(function (p) { return p && /^SP\d+/i.test(String(p.id || '')); });
      /* 运营 SP 不足时仍保留完整目录（含身体乳等 APP 商品） */
      if (ops.length >= 8) {
        var extras = list.filter(function (p) {
          return p && !/^SP\d+/i.test(String(p.id || ''));
        });
        return ops.concat(extras);
      }
    }
    if (spglCache && spglCache.length) return spglCache;
    return list;
  }

  function loadProductList() {
    if (spglCache && spglCache.length) return spglCache;
    return loadProductListLocal(true);
  }

  function buildProductReason(p, query, score) {
    var q = String(query || '');
    var name = String((p && p.name) || '该商品');
    var brand = String((p && p.brand) || '');
    var cat3 = String((p && (p.cat3 || p.cat2 || p.cat1)) || '');
    var price = p && p.price != null ? Number(p.price) : null;
    var status = String((p && p.status) || '');
    var merchant = String((p && p.merchant) || '');
    var parts = [];

    parts.push('推荐「' + (brand ? brand + ' · ' : '') + name + '」');
    if (cat3) parts.push('品类匹配「' + cat3 + '」');

    if (q) {
      if (/口红|唇|显白|豆沙/.test(q) && /口红|唇|显白|豆沙/.test(name + cat3)) {
        parts.push('契合你的唇妆/显白相关需求');
      }
      if (/身体乳|身体护理|润肤/.test(q) && /身体|润肤|OLAY|山茶/.test(name + cat3 + brand)) {
        parts.push('契合身体护理/身体乳诉求');
      }
      if (/眼霜|抗蓝光|眼部/.test(q) && /眼|抗蓝光/.test(name + cat3)) {
        parts.push('契合眼部护理/眼霜诉求');
      }
      if (/香水|香氛|淡香/.test(q) && /香水|香氛|香/.test(name + cat3)) {
        parts.push('契合香氛/香水诉求');
      }
      if (/爽肤水|化妆水|柔肤水|补水|保湿/.test(q) && /水|补水|保湿|爽肤|面膜|精华/.test(name + cat3)) {
        parts.push('对应补水保湿/水类护肤诉求');
      }
      if (/干皮|油皮|敏感|混油|混干/.test(q)) {
        var skin = (q.match(/干皮|油皮|敏感|混油|混干/) || [])[0];
        if (skin) parts.push('结合「' + skin + '」使用场景更稳妥');
      }
      if (/预算|以内|平价|\d+/.test(q) && price != null && !isNaN(price)) {
        var m = q.match(/(\d+)/);
        if (m && price <= Number(m[1])) parts.push('价格 ¥' + price + ' 落在你提到的预算内');
        else if (/平价/.test(q) && price <= 200) parts.push('价格 ¥' + price + '，更偏日常易入手');
        else parts.push('参考价 ¥' + price);
      } else if (price != null && !isNaN(price)) {
        parts.push('参考价 ¥' + price);
      }
      /* 仅当商品品牌确实出现在问句中，才写「品牌偏好一致」 */
      if (brand && q.indexOf(brand) >= 0) {
        parts.push('品牌「' + brand + '」与你的点名品牌一致');
      } else if (brand === '花西子' && /花西子/.test(q)) {
        parts.push('品牌「花西子」与你的点名品牌一致');
      } else if (brand === 'Lancôme' && /兰蔻|Lancôme|Lancome/i.test(q)) {
        parts.push('品牌「Lancôme」与你的点名品牌一致');
      }
      if (merchant && (/店|店铺|旗舰|专营/.test(q))) {
        var mcore = merchantCoreName(merchant);
        if (q.indexOf(merchant) >= 0 || (mcore.length >= 2 && q.indexOf(mcore) >= 0) ||
            (/花西子/.test(merchant) && /花西子/.test(q) && /店|国风/.test(q))) {
          parts.push('店铺「' + merchant + '」符合你点名的店铺');
        }
      }
      if (/成分|质地|哑光|雾面|丝绒|不拔干|氨基酸|玻尿酸|烟酰胺|神经酰胺|视黄醇/.test(q)) {
        var ingHint = inferGuideIngredients(p);
        if (ingHint && ingHint.indexOf('详见') < 0) {
          parts.push('关键成分侧重「' + ingHint + '」');
        } else {
          parts.push('可从质地/成分维度继续对照详情页说明');
        }
      }
      if (/送礼|礼盒|通勤|约会/.test(q)) {
        parts.push('也适合你提到的使用/送礼场景');
      }
    } else if (price != null && !isNaN(price)) {
      parts.push('参考价 ¥' + price);
    }

    if (status === '已上架' || status === '上架') parts.push('当前为上架可购状态');
    else if (String(status).indexOf('下架') >= 0) parts.push('注意：该商品当前已下架，详情页不可购买');

    if (merchant) parts.push('所属店铺「' + merchant + '」');
    if (score >= 6) parts.push('与检索词相关度较高');

    var head = parts[0] || '为你推荐该商品';
    var rest = parts.slice(1);
    if (!rest.length) {
      return head + '。可从功效、肤质适配与评价三方面再对比后决定是否入手。';
    }
    return head + '：' + rest.join('；') + '。建议下单前再看规格与评价是否符合预期。';
  }

  function attachReasonAndSource(card, raw, query, score, table) {
    card = card || {};
    var srcTable = table || card.sourceTable || 'spgl';
    card.sourceTable = srcTable;
    card.sourceLabel = getSourceLabel(srcTable);
    card.source = buildRecommendSource(srcTable, raw || {
      id: card.id,
      sku: card.sku || card.productSku
    });
    if (!card.reason) {
      card.reason = buildProductReason(raw || {
        name: card.title,
        brand: card.brand,
        cat1: card.cat1,
        cat2: card.cat2,
        cat3: card.cat3,
        price: card.price,
        status: card.status,
        merchant: card.merchant
      }, query, score);
    }
    return card;
  }

  function buildGuideEmptyHint(query) {
    var oos = guideIsOutOfScope(query);
    if (oos === true) {
      return buildGuideOutOfScopeReply(query).text;
    }
    if (oos === 'kefu') {
      return buildGuideKefuRedirectReply().text;
    }
    var c = parseGuidePriceConstraint(query);
    if (c.max != null && c.min != null) {
      return '商品库里暂无符合「预算 ¥' + c.min + '–¥' + c.max + '」的匹配商品，可以试试放宽预算或补充品牌偏好。';
    }
    if (c.max != null) {
      return '商品库里暂无符合「预算 ' + c.max + ' 以内」的匹配商品，可以试试放宽预算或补充品牌偏好。';
    }
    if (c.min != null) {
      return '商品库里暂无符合「¥' + c.min + ' 以上」价位的匹配商品，可以调整预算区间再试。';
    }
    if (c.cheap) {
      return '商品库里暂无符合平价区间的匹配商品，可以补充具体预算或品牌再试。';
    }
    return '商品库里暂无匹配商品，可以换种说法或补充品牌/预算。';
  }

  function pickFromSpgl(query, limit, sourceList) {
    var max = limit || 3;
    var q = String(query || '');
    var list = Array.isArray(sourceList) ? sourceList : loadProductList();
    if (!Array.isArray(list) || !list.length) return [];

    var intent = resolveGuideIntent(q, list);
    var priceConstraint = parseGuidePriceConstraint(q);
    var hasPriceFilter = priceConstraint.min != null || priceConstraint.max != null || priceConstraint.cheap;
    var entityLock = !!(intent.merchants.length || (intent.shopAsked && intent.brands.length) ||
      (intent.brands.length && /品牌|只要|只要买|点名|旗舰店|店里|店里面|店内的|该店/.test(q)));

    var strict = /身体乳|身体护理|眼霜|抗蓝光|香水|香氛|淡香|眼影|口红|唇釉|唇膏|洁面|洗面奶|洗面|面霜|乳液|乳霜|面膜|精华液|次抛精华|爽肤水|化妆水|柔肤水|(?:^|[^水])精华/.test(q);
    /* 含「精华水/神仙水」时不要按精华严卡 */
    if (/精华水|神仙水/.test(q)) {
      strict = /身体乳|身体护理|眼霜|抗蓝光|香水|香氛|淡香|眼影|口红|唇釉|唇膏|洁面|洗面奶|洗面|面霜|乳液|乳霜|面膜/.test(q);
    }
    /* 点名店铺时仍保留品类严卡（「花西子店里的口红」不能出粉底） */

    var ranked = list.map(function (p) {
      if (entityLock && !productMatchesIntent(p, intent)) return { p: p, s: -1 };
      if (hasPriceFilter && !productMatchesPriceConstraint(p, priceConstraint)) return { p: p, s: -1 };
      if (strict && !matchesStrictCategory(q, p)) return { p: p, s: -1 };
      var blob = [p.name, p.brand, p.cat1, p.cat2, p.cat3, p.sku, p.merchant].join(' ');
      var s = scoreByQuery(q, blob);
      s += creamLotionPreferScore(q, p);
      if (p.status === '已上架' || p.status === '上架' || p.auditKey === 'pass' || p.auditStatus === '审核通过') s += 1;
      /* 下架商品：泛推荐大幅降权；仅在问句点名商品/店铺时仍可命中，便于打开详情（购买按钮会置灰） */
      var offShelf = String(p.status || '').indexOf('下架') >= 0;
      if (offShelf) {
        var pnameHit = false;
        var pname0 = String(p.name || '');
        if (q && pname0) {
          if (q.indexOf(pname0) >= 0 || pname0.indexOf(q) >= 0) pnameHit = true;
          else {
            var head0 = pname0.slice(0, Math.min(8, pname0.length));
            if (head0.length >= 4 && q.indexOf(head0) >= 0) pnameHit = true;
          }
        }
        if (pnameHit || intent.merchants.length || intent.brandAsked) s -= 2;
        else s -= 80;
      }
      /* 店铺 / 品牌语义命中：大幅加权，避免被列表前列的无关 App 货顶掉 */
      if (intent.merchants.length && productMatchesIntent(p, { merchants: intent.merchants, brands: [], shopAsked: true, brandAsked: false })) {
        s += 20;
      } else if (intent.brands.length) {
        for (var bi = 0; bi < intent.brands.length; bi++) {
          if (String(p.brand || '') === intent.brands[bi] || String(p.brand || '').indexOf(intent.brands[bi]) >= 0) {
            s += 14;
            break;
          }
        }
      }
      /* 点名商品 / 长标题命中 */
      var pname = String(p.name || '');
      if (q && pname) {
        if (pname === q || q.indexOf(pname) >= 0 || pname.indexOf(q) >= 0) s += 12;
        else {
          var head = pname.slice(0, Math.min(10, pname.length));
          if (head.length >= 4 && q.indexOf(head) >= 0) s += 8;
        }
      }
      /* 无实体锁定时：禁止「仅上架+1」的无关商品混进结果 */
      if (!entityLock && q && s <= 1) s = 0;
      return { p: p, s: s };
    }).filter(function (x) {
      return q ? x.s > 0 : true;
    }).sort(function (a, b) {
      if (b.s !== a.s) return b.s - a.s;
      /* 同分时：问面霜则霜类在前，问乳液则乳类在前 */
      var pa = creamLotionPreferScore(q, a.p);
      var pb = creamLotionPreferScore(q, b.p);
      return pb - pa;
    });

    if (!ranked.length) return [];

    /* 泛检索：最高分过低时不硬推无关商品 */
    var minScore = entityLock ? 1 : 3;
    if (ranked[0].s < minScore) return [];

    var take = max;
    /* 仅「分差极大」且像点名单品时收成 1 条；品类浏览（面霜/口红等）应出多款 */
    var looksLikeBrowse = /还有|其他|别的|多几|几款|推荐|有哪些|有什么|看看|对比|比较|哪个好|哪款/.test(q) ||
      (/面霜|乳液|乳霜|口红|唇釉|洁面|面膜|精华|眼霜|香水|身体乳|粉底|眼影|爽肤水|化妆水/.test(q) &&
        !intent.merchants.length && !intent.brandAsked);
    if (q && ranked.length > 1 && ranked[0].s >= ranked[1].s + 6 && !intent.merchants.length && !looksLikeBrowse) {
      take = Math.min(take, 1);
    }
    /* 有明确店铺 / 品类严卡：同条件最多出 limit 条（严卡只过滤跨品类，不压成 1） */
    if (intent.merchants.length || strict) {
      take = Math.min(max, ranked.length);
    }

    var cards = ranked.slice(0, take).map(function (x) {
      var p = x.p;
      var cover = p.coverUrl || p.cover || p.syncCover || '';
      if (cover && cover.indexOf('./static/products/') === 0) {
        cover = '../运营管理系统/' + cover.replace(/^\.\//, '');
      }
      return attachReasonAndSource({
        id: p.id || p.sku || '',
        title: p.name || '商品',
        sub: [p.brand, p.cat3 || p.cat2 || p.cat1].filter(Boolean).join(' · ') || (p.sku || ''),
        price: String(p.price != null ? p.price : '0'),
        img: cover,
        tags: [p.cat1, p.cat2, p.cat3, p.brand].filter(Boolean).join(' '),
        sourceTable: 'spgl',
        status: p.status || '',
        brand: p.brand || '',
        cat1: p.cat1 || '',
        cat2: p.cat2 || '',
        cat3: p.cat3 || '',
        merchant: p.merchant || '',
        sku: p.sku || '',
        ingredients: inferGuideIngredients(p),
        score: x.s
      }, p, q, x.s, 'spgl');
    });
    return cards;
  }

  function loadGrassListLocal() {
    var list = [];
    try {
      if (global.GrassStore && typeof global.GrassStore.load === 'function') {
        list = global.GrassStore.load() || [];
        if (typeof global.GrassStore.filterForRecommend === 'function') {
          list = global.GrassStore.filterForRecommend(list) || list;
        } else {
          list = list.filter(function (g) { return !g.status || g.status === 'passed'; });
        }
      }
    } catch (e) { list = []; }
    return Array.isArray(list) ? list : [];
  }

  function loadReviewListLocal() {
    var list = [];
    try {
      if (global.ReviewStore && typeof global.ReviewStore.load === 'function') {
        list = (global.ReviewStore.load() || []).filter(function (r) {
          if (global.ReviewStore.isAppVisible && !global.ReviewStore.isAppVisible(r)) return false;
          return !r.hidden && r.auditKey !== 'block';
        });
      }
    } catch (e) { list = []; }
    return Array.isArray(list) ? list : [];
  }

  var zhongcaoCache = null;
  var zhongcaoCacheAt = 0;
  var pinglunCache = null;
  var pinglunCacheAt = 0;

  function fetchZhongcaobiao(force) {
    var now = Date.now();
    if (!force && zhongcaoCache && (now - zhongcaoCacheAt) < 30000) {
      return Promise.resolve(zhongcaoCache);
    }
    return fetchJsonFromApi('/api/zhongcaobiao').then(function (data) {
      var list = (data && Array.isArray(data.grasses)) ? data.grasses : [];
      if (data && data.ok && list.length) {
        zhongcaoCache = list;
        zhongcaoCacheAt = Date.now();
        return list;
      }
      throw new Error((data && data.error) || 'zhongcaobiao 为空');
    }).catch(function () {
      return loadGrassListLocal();
    });
  }

  function fetchPinglunbiao(force) {
    var now = Date.now();
    if (!force && pinglunCache && (now - pinglunCacheAt) < 30000) {
      return Promise.resolve(pinglunCache);
    }
    return fetchJsonFromApi('/api/pinglunbiao').then(function (data) {
      var list = (data && Array.isArray(data.reviews)) ? data.reviews : [];
      if (data && data.ok && list.length) {
        pinglunCache = list.filter(function (r) {
          return r && r.auditKey !== 'block' && !r.hidden;
        });
        pinglunCacheAt = Date.now();
        return pinglunCache;
      }
      throw new Error((data && data.error) || 'pinglunbiao 为空');
    }).catch(function () {
      return loadReviewListLocal();
    });
  }

  function pickFromZcgl(query, limit, sourceList, sourceTable) {
    var max = limit || 3;
    var tableName = sourceTable || 'zcgl';
    var list = Array.isArray(sourceList) ? sourceList : loadGrassListLocal();
    if (!list.length) return [];

    var ranked = list.map(function (g) {
      var blob = [g.text, g.tag, g.cat, g.user].join(' ');
      return { g: g, s: scoreByQuery(query, blob) };
    }).filter(function (x) {
      if (!query) return true;
      return x.s >= 3;
    }).sort(function (a, b) { return b.s - a.s; });

    if (!ranked.length) return [];

    return ranked.slice(0, max).map(function (x) {
      var g = x.g;
      var cover = '';
      try {
        if (global.GrassStore && global.GrassStore.resolveCover) {
          cover = global.GrassStore.resolveCover(g, './community_images/') || '';
        }
      } catch (e2) { cover = g.syncCover || ''; }
      if (!cover && Array.isArray(g.images) && g.images[0]) cover = g.images[0];
      var title = String(g.text || '').replace(/\s+/g, ' ').slice(0, 28) || '种草笔记';
      return attachReasonAndSource({
        id: g.id || '',
        title: title,
        sub: [g.user || g.publisher, g.tag || g.cat].filter(Boolean).join(' · ') || '种草',
        price: '',
        img: cover,
        tags: [g.tag, g.cat].filter(Boolean).join(' '),
        sourceTable: tableName,
        kind: 'grass',
        reason: '推荐这篇种草：内容与「' + String(query || '你的需求') + '」相关；来自用户真实分享（' + (g.user || '达人') + '），可作选购参考，建议结合自身肤质再决定。'
      }, { id: g.id, name: title }, query, x.s, tableName);
    });
  }

  function pickFromPjgl(query, limit, sourceList, sourceTable) {
    var max = limit || 3;
    var tableName = sourceTable || 'pjgl';
    var list = Array.isArray(sourceList) ? sourceList : loadReviewListLocal();
    if (!list.length) return [];

    var ranked = list.map(function (r) {
      var blob = [r.prodName, r.content, r.spec, r.merchantName].join(' ');
      var s = scoreByQuery(query, blob);
      var quote = reviewQuoteScore(query, r.content);
      if (quote >= 500) s += quote;
      if (Number(r.rating) >= 4) s += 1;
      return { r: r, s: s };
    }).filter(function (x) {
      if (!query) return true;
      return x.s >= 3;
    }).sort(function (a, b) { return b.s - a.s; });

    if (!ranked.length) return [];

    return ranked.slice(0, max).map(function (x) {
      var r = x.r;
      return attachReasonAndSource({
        id: r.prodId || r.id || '',
        title: r.prodName || '用户评价商品',
        sub: (r.rating ? (r.rating + '星 · ') : '') + String(r.content || '').replace(/\s+/g, ' ').slice(0, 36),
        price: r.price != null ? String(r.price) : '',
        img: r.prodCover || '',
        tags: '评价',
        sourceTable: tableName,
        kind: 'review',
        reason: '推荐理由：该商品在评价表中有较高相关反馈' + (r.rating ? ('（' + r.rating + ' 星）') : '') + '。用户提到「' + String(r.content || '').replace(/\s+/g, ' ').slice(0, 40) + '」，可作为真实体验参考。'
      }, { id: r.prodId || r.id, name: r.prodName }, query, x.s, tableName);
    });
  }

  /** 去掉空白与标点，便于评价原文整段/片段比对 */
  function normalizeReviewText(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[，。！？、；：""''「」『』（）\[\]【】《》·…,.!?;:'"()<>_/\\|@#$%^&*+=~`\-—–]/g, '');
  }

  /**
   * 用户输入是否像「粘贴的评价原文」：在评价 content 中命中足够长的连续片段
   * @returns {number} 0 = 非原文；≥500 视为原文反查
   */
  function reviewQuoteScore(query, content) {
    var q = normalizeReviewText(query);
    var c = normalizeReviewText(content);
    if (!q || !c || q.length < 8) return 0;
    if (c.indexOf(q) >= 0) return 1000 + q.length;
    if (q.indexOf(c) >= 0 && c.length >= 16) return 900 + c.length;

    var minChunk = Math.max(10, Math.min(20, Math.floor(q.length * 0.55)));
    var len;
    var i;
    for (len = q.length; len >= minChunk; len--) {
      for (i = 0; i + len <= q.length; i++) {
        if (c.indexOf(q.slice(i, i + len)) >= 0) {
          return 500 + len;
        }
      }
    }
    return 0;
  }

  function findProductByIdInList(list, prodId) {
    var id = String(prodId || '');
    if (!id || !Array.isArray(list)) return null;
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p) continue;
      if (String(p.id || '') === id || String(p.sku || '') === id) return p;
    }
    return null;
  }

  function resolveCoverPath(cover) {
    var c = String(cover || '');
    if (c && c.indexOf('./static/products/') === 0) {
      return '../运营管理系统/' + c.replace(/^\.\//, '');
    }
    return c;
  }

  /**
   * 粘贴评价原文 → 定位 pinglunbiao 对应商品（优先 spgl 目录信息）
   * 仅在原文命中时返回；短关键词需求不会误触发
   */
  function matchProductsByReviewQuote(query, limit, bags) {
    bags = bags || {};
    var max = limit || 3;
    var q = String(query || '').replace(/^\s+|\s+$/g, '');
    if (normalizeReviewText(q).length < 8) return [];

    var reviewList = Array.isArray(bags.reviewList) ? bags.reviewList : loadReviewListLocal();
    var productList = Array.isArray(bags.spglList) ? bags.spglList : loadProductList();
    if (!reviewList.length) return [];

    var ranked = [];
    for (var i = 0; i < reviewList.length; i++) {
      var r = reviewList[i];
      if (!r || r.auditKey === 'block' || r.hidden) continue;
      var s = reviewQuoteScore(q, r.content);
      if (s >= 500) ranked.push({ r: r, s: s });
    }
    if (!ranked.length) return [];

    ranked.sort(function (a, b) { return b.s - a.s; });

    var seen = {};
    var cards = [];
    for (var j = 0; j < ranked.length && cards.length < max; j++) {
      var hit = ranked[j];
      var rev = hit.r;
      var pid = String(rev.prodId || '');
      if (pid && seen[pid]) continue;
      if (pid) seen[pid] = true;

      var p = findProductByIdInList(productList, pid);
      var cover = resolveCoverPath(
        (p && (p.coverUrl || p.cover || p.syncCover)) || rev.prodCover || ''
      );
      var title = (p && p.name) || rev.prodName || '评价对应商品';
      var snippet = String(rev.content || '').replace(/\s+/g, ' ').slice(0, 48);
      var who = rev.reviewerName ? ('（' + rev.reviewerName + '）') : '';
      var card = attachReasonAndSource({
        id: (p && p.id) || pid || rev.id || '',
        title: title,
        sub: p
          ? [p.brand, p.cat3 || p.cat2 || p.cat1].filter(Boolean).join(' · ') || (p.sku || '')
          : [rev.merchantName, rev.spec].filter(Boolean).join(' · ') || '来自商品评价',
        price: String(
          p && p.price != null ? p.price : (rev.price != null ? rev.price : '0')
        ),
        img: cover,
        tags: p
          ? [p.cat1, p.cat2, p.cat3, p.brand].filter(Boolean).join(' ')
          : '评价原文',
        sourceTable: 'pinglunbiao',
        kind: 'review-quote',
        reviewId: rev.id || '',
        status: (p && p.status) || '',
        brand: (p && p.brand) || '',
        cat1: (p && p.cat1) || '',
        cat2: (p && p.cat2) || '',
        cat3: (p && p.cat3) || '',
        merchant: (p && p.merchant) || rev.merchantName || '',
        sku: (p && p.sku) || '',
        score: hit.s,
        reason: '这段文字出自该商品的用户评价' + who + '：「' + snippet
          + (String(rev.content || '').length > 48 ? '…' : '')
          + '」。已按评价原文回推对应商品，而非按「送礼/包装」等词泛搜。'
      }, p || {
        id: pid,
        name: title,
        price: rev.price,
        merchant: rev.merchantName
      }, q, hit.s, 'pinglunbiao');
      cards.push(card);
    }
    return cards;
  }

  function matchProductsByReviewQuoteAsync(query, limit) {
    var bags = { reviewList: null, spglList: null };
    return Promise.all([
      fetchPinglunbiao(false).then(function (list) { bags.reviewList = list; }),
      fetchSpglProducts(false).then(function (list) { bags.spglList = list; }).catch(function () {
        bags.spglList = loadProductList();
      })
    ]).then(function () {
      return matchProductsByReviewQuote(query, limit, bags);
    }).catch(function () {
      bags.reviewList = bags.reviewList || loadReviewListLocal();
      bags.spglList = bags.spglList || loadProductList();
      return matchProductsByReviewQuote(query, limit, bags);
    });
  }

  /* ============ 种草回填：种草命中 → 反查可购商品（PRD 路径 B/C） ============ */

  /** 品牌中文名 ↔ 商品库品牌变体（兰蔻→Lanc?me / 欧莱雅→L'Oréal Paris 等） */
  var GRASS_BRAND_ALIAS = {
    '兰蔻': 'lanc',
    '欧莱雅': 'loreal',
    '雅诗兰黛': 'estee',
    '资生堂': 'shiseido',
    '迪奥': 'dior',
    '香奈儿': 'chanel'
  };

  /** 品牌/名称归一化：小写 + 去重音 + 只留字母数字与中文 */
  function normBrandKey(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ôö]/g, 'o')
      .replace(/[ûüù]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
  }

  /** 种草 orderNo/orderId → 订单 → 商品 ID/sku（Path B） */
  function resolveOrderRefProductId(orderRef) {
    var ref = String(orderRef || '').trim();
    if (!ref) return '';
    // App 个人订单
    try {
      if (global.ProfileOrderStore && typeof global.ProfileOrderStore.load === 'function') {
        var orders = global.ProfileOrderStore.load() || [];
        for (var i = 0; i < orders.length; i++) {
          var o = orders[i];
          if (!o) continue;
          if (String(o.id || '') === ref || String(o.orderNo || '') === ref) {
            var items = o.items || [];
            if (items[0]) return String(items[0].productId || items[0].id || '');
          }
        }
      }
    } catch (e) { /* ignore */ }
    // 运营订单管理列表
    try {
      var raw = localStorage.getItem('zhuangyan_order_list_v1');
      if (raw) {
        var list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (var j = 0; j < list.length; j++) {
            var row = list[j];
            if (!row) continue;
            if (String(row.id || '') === ref || String(row.orderNo || '') === ref) {
              return String(row.prodSku || row.prodId || row.productId || '');
            }
          }
        }
      }
    } catch (e2) { /* ignore */ }
    return '';
  }

  /** 商品名模糊匹配（Path C，商品名直接命中） */
  function matchProductByNameFuzzy(list, name) {
    var key = normBrandKey(name);
    if (!key || key.length < 2 || !Array.isArray(list) || !list.length) return null;
    var i;
    for (i = 0; i < list.length; i++) {
      var p = list[i];
      if (p && normBrandKey(p.name) === key) return p;
    }
    for (i = 0; i < list.length; i++) {
      var p2 = list[i];
      if (!p2) continue;
      var pn = normBrandKey(p2.name);
      if (pn && (pn.indexOf(key) >= 0 || key.indexOf(pn) >= 0)) return p2;
    }
    return null;
  }

  /** 品牌匹配（Path C 兜底）：别名 → 精确 → 前缀 → 商品名开头 */
  function matchProductByBrandName(list, brand) {
    var b = String(brand || '').trim();
    if (!b || !Array.isArray(list) || !list.length) return null;
    var key = normBrandKey(GRASS_BRAND_ALIAS[b] || b);
    if (!key) return null;
    var i;
    for (i = 0; i < list.length; i++) {
      var p = list[i];
      if (p && normBrandKey(p.brand) === key) return p;
    }
    for (i = 0; i < list.length; i++) {
      var p2 = list[i];
      if (!p2) continue;
      var pk = normBrandKey(p2.brand);
      if (pk && (pk.indexOf(key) === 0 || key.indexOf(pk) === 0)) return p2;
    }
    for (i = 0; i < list.length; i++) {
      var p3 = list[i];
      if (p3 && normBrandKey(p3.name).indexOf(key) === 0) return p3;
    }
    return null;
  }

  /** 单条种草 → 商品（订单反查 → 商品名 → 品牌 三路，全失败返回 null） */
  function resolveGrassToProduct(grass, productList) {
    if (!grass || !Array.isArray(productList) || !productList.length) return null;
    var list = productList;

    var orderRef = String(grass.orderNo || grass.orderId || '').trim();
    if (orderRef) {
      var refId = resolveOrderRefProductId(orderRef);
      if (refId) {
        var byOrder = findProductByIdInList(list, refId);
        if (byOrder) return byOrder;
      }
    }

    var name = String(grass.productName || '').trim();
    if (name && name.indexOf('体验装') < 0 && name.indexOf('试用') < 0) {
      var byName = matchProductByNameFuzzy(list, name);
      if (byName) return byName;
    }

    var brand = String(grass.brand || '').trim();
    if (brand) {
      var byBrand = matchProductByBrandName(list, brand);
      if (byBrand) return byBrand;
    }

    return null;
  }

  /** 商品卡按 id 去重合并，总数不超过 max */
  function mergeGuideProductCards(base, extra, max) {
    var out = Array.isArray(base) ? base.slice() : [];
    var seen = {};
    var i;
    for (i = 0; i < out.length; i++) {
      var id0 = out[i] && out[i].id;
      if (id0) seen[String(id0)] = true;
    }
    if (!Array.isArray(extra)) return out;
    for (i = 0; i < extra.length; i++) {
      var card = extra[i];
      if (!card) continue;
      var cid = String(card.id || '');
      if (cid && seen[cid]) continue;
      if (cid) seen[cid] = true;
      out.push(card);
    }
    return out.slice(0, max || out.length);
  }

  /**
   * 种草回填主函数：命中种草 → 反查商品 → 生成可购商品卡
   * 与 matchProductsByReviewQuote 对称；回查失败（无订单/无品牌）则跳过，由内容卡兜底
   */
  function matchGrassToProducts(query, limit, bags, sourceTable) {
    bags = bags || {};
    var max = limit || 3;
    var tableName = sourceTable || 'zhongcaobiao';
    var grassList = Array.isArray(bags.grassList) ? bags.grassList : loadGrassListLocal();
    var productList = Array.isArray(bags.spglList) ? bags.spglList : loadProductList();
    if (!grassList.length) return [];

    var ranked = grassList.map(function (g) {
      var blob = [g.text, g.tag, g.cat, g.brand, g.productName, g.user].join(' ');
      return { g: g, s: scoreByQuery(query, blob) };
    }).filter(function (x) {
      if (!query) return true;
      return x.s >= 3;
    }).sort(function (a, b) { return b.s - a.s; });

    if (!ranked.length) return [];

    var seen = {};
    var cards = [];
    for (var i = 0; i < ranked.length && cards.length < max; i++) {
      var item = ranked[i];
      var grass = item.g;
      var p = resolveGrassToProduct(grass, productList);
      if (!p) continue;
      var pid = String(p.id || '');
      if (pid && seen[pid]) continue;
      if (pid) seen[pid] = true;

      var cover = p.coverUrl || p.cover || p.syncCover || '';
      if (cover && cover.indexOf('./static/products/') === 0) {
        cover = '../运营管理系统/' + cover.replace(/^\.\//, '');
      }
      var snippet = String(grass.text || '').replace(/\s+/g, ' ').slice(0, 40);
      var who = grass.user ? ('（' + grass.user + '）') : '';
      cards.push(attachReasonAndSource({
        id: pid,
        title: p.name || grass.productName || '种草对应商品',
        sub: [p.brand, p.cat3 || p.cat2 || p.cat1].filter(Boolean).join(' · ') || (p.sku || ''),
        price: String(p.price != null ? p.price : '0'),
        img: cover,
        tags: [p.cat1, p.cat2, p.cat3, p.brand].filter(Boolean).join(' '),
        sourceTable: tableName,
        kind: 'grass-product',
        grassId: grass.id || '',
        status: p.status || '',
        brand: p.brand || '',
        cat1: p.cat1 || '',
        cat2: p.cat2 || '',
        cat3: p.cat3 || '',
        merchant: p.merchant || '',
        sku: p.sku || '',
        score: item.s,
        reason: '这篇种草' + who + '提到「' + snippet + (String(grass.text || '').length > 40 ? '…' : '') + '」，已回推关联到「' + (p.name || p.brand || '相关商品') + '」，可作为真实口碑参考。'
      }, p, query, item.s, tableName));
    }
    return cards;
  }

  function pickFromWzgl(query, limit) {
    var max = limit || 2;
    var list = [];
    try {
      if (global.ArticleStore && typeof global.ArticleStore.load === 'function') {
        list = global.ArticleStore.load() || [];
      }
    } catch (e) { list = []; }
    if (!list.length) return [];

    var ranked = list.map(function (a) {
      var blob = [a.title, a.excerpt, a.content, a.tag, a.cat].join(' ');
      return { a: a, s: scoreByQuery(query, blob) };
    }).filter(function (x) {
      if (!query) return true;
      return x.s >= 3;
    }).sort(function (a, b) { return b.s - a.s; });

    if (!ranked.length) return [];

    return ranked.slice(0, max).map(function (x) {
      var a = x.a;
      var cover = a.cover || a.syncCover || '';
      return {
        id: a.id || '',
        title: a.title || '美妆文章',
        sub: String(a.excerpt || a.content || '').replace(/\s+/g, ' ').slice(0, 40),
        price: '',
        img: cover,
        tags: [a.tag, a.cat].filter(Boolean).join(' '),
        sourceTable: 'wzgl',
        kind: 'article'
      };
    });
  }

  /**
   * 严格按运营端 AI导购关联表收集检索结果
   * - 未勾选表：检索 GUIDE_RETRIEVABLE 全部
   * - 已勾选：仅检索交集内的表；禁止演示硬编码兜底
   * @param {string} query
   * @param {number} limit
   * @param {string} mod
   * @param {object=} bags  { spglList, grassList, reviewList }
   */
  function collectGuideContext(query, limit, mod, bags) {
    mod = mod || 'daogou';
    if (Array.isArray(bags)) {
      bags = { spglList: bags };
    }
    bags = bags || {};
    var selected = getModuleTables(mod);
    var active = resolveGuideTables(mod);
    var max = limit || 3;
    var products = [];
    var cards = [];
    var snippets = [];
    var used = [];
    var fromMysql = false;

    if (active.indexOf('spgl') >= 0) {
      products = pickFromSpgl(query, max, bags.spglList);
      used.push('spgl');
      cards = cards.concat(products);
      if (bags.spglList && bags.spglList.length) fromMysql = true;
    }
    if (usesGrassTable(active)) {
      var grassTable = preferredGrassTable(active);
      var grasses = pickFromZcgl(query, Math.min(2, max), bags.grassList, grassTable);
      used.push(grassTable);
      cards = cards.concat(grasses);
      grasses.forEach(function (g) {
        snippets.push('[种草 ' + grassTable + '] ' + (g.title || '') + '｜' + (g.sub || ''));
      });
      /* 种草回填：命中种草反查为可购商品卡，并入主推（订单/商品名/品牌三路） */
      var grassProducts = matchGrassToProducts(query, max, bags, grassTable);
      if (grassProducts.length) {
        products = mergeGuideProductCards(products, grassProducts, max);
      }
      if (bags.grassList && bags.grassList.length) fromMysql = true;
    }
    if (usesReviewTable(active)) {
      var reviewTable = preferredReviewTable(active);
      var reviews = pickFromPjgl(query, Math.min(2, max), bags.reviewList, reviewTable);
      used.push(reviewTable);
      if (!products.length) cards = cards.concat(reviews);
      reviews.forEach(function (r) {
        snippets.push('[评价 ' + reviewTable + '] ' + (r.title || '') + '｜' + (r.sub || ''));
      });
      if (bags.reviewList && bags.reviewList.length) fromMysql = true;
    }
    if (active.indexOf('wzgl') >= 0) {
      var arts = pickFromWzgl(query, 2);
      used.push('wzgl');
      arts.forEach(function (a) {
        snippets.push('[文章 wzgl] ' + (a.title || '') + '｜' + (a.sub || ''));
      });
    }

    var displayCards = products.length
      ? products.slice(0, max)
      : cards.filter(function (c) { return c.kind === 'grass' || c.kind === 'review'; }).slice(0, max);

    var blocked = selected.filter(function (t) {
      return GUIDE_RETRIEVABLE.indexOf(t) < 0;
    });

    return {
      mod: mod,
      selectedTables: selected.slice(),
      activeTables: active.slice(),
      usedTables: used,
      blockedTables: blocked,
      products: displayCards,
      productCards: products,
      snippets: snippets,
      empty: !displayCards.length && !snippets.length,
      strict: true,
      fromMysql: fromMysql
    };
  }

  function collectGuideContextAsync(query, limit, mod) {
    mod = mod || 'daogou';
    var active = resolveGuideTables(mod);
    var tasks = [];
    var bags = { spglList: null, grassList: null, reviewList: null };

    if (active.indexOf('spgl') >= 0) {
      tasks.push(fetchSpglProducts(false).then(function (list) { bags.spglList = list; }));
    }
    if (usesGrassTable(active)) {
      if (active.indexOf('zhongcaobiao') >= 0) {
        tasks.push(fetchZhongcaobiao(false).then(function (list) { bags.grassList = list; }));
      } else {
        bags.grassList = loadGrassListLocal();
      }
    }
    if (usesReviewTable(active)) {
      if (active.indexOf('pinglunbiao') >= 0) {
        tasks.push(fetchPinglunbiao(false).then(function (list) { bags.reviewList = list; }));
      } else {
        bags.reviewList = loadReviewListLocal();
      }
    }

    if (!tasks.length) {
      return Promise.resolve(collectGuideContext(query, limit, mod, bags));
    }
    return Promise.all(tasks).then(function () {
      return collectGuideContext(query, limit, mod, bags);
    });
  }

  function pickGuideProducts(query, limit) {
    var ctx = collectGuideContext(query, limit, 'daogou');
    return (ctx && ctx.products) || [];
  }

  /** 读取运营商品管理目录（上架优先） */
  function loadGuideCatalogProducts() {
    var list = [];
    try {
      if (global.ProductStore && typeof global.ProductStore.load === 'function') {
        list = global.ProductStore.load() || [];
        if (typeof global.ProductStore.mergeAppProducts === 'function') {
          list = global.ProductStore.mergeAppProducts(list) || list;
        }
      }
    } catch (eLoad) { list = []; }
    if ((!list || !list.length) && global.PRODUCT_LIST && Array.isArray(global.PRODUCT_LIST)) {
      list = global.PRODUCT_LIST.slice();
    }
    if (!list || !list.length) return [];
    var onShelf = [];
    var others = [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || !(p.name || p.title)) continue;
      if (String(p.status || '') === '已下架' && String(p.auditStatus || '') === '审核未通过') {
        others.push(p);
        continue;
      }
      if (String(p.status || '') === '已上架' || String(p.auditStatus || '') === '审核通过') onShelf.push(p);
      else others.push(p);
    }
    return onShelf.length ? onShelf : others;
  }

  /**
   * 根据运营「商品管理」目录生成 AI 导购快捷问题
   * @param {number=} limit 条数，默认 12
   * @returns {string[]}
   */
  function buildDaogouQuickQuestions(limit) {
    limit = Math.max(4, Math.min(20, Number(limit) || 12));
    var products = loadGuideCatalogProducts();
    var questions = [];
    var seen = {};
    function push(q) {
      q = String(q || '').replace(/^\s+|\s+$/g, '');
      if (!q || q.length < 4 || q.length > 28 || seen[q]) return;
      if (questions.length >= limit) return;
      seen[q] = true;
      questions.push(q);
    }
    function bump(map, key, w) {
      key = String(key || '').replace(/^\s+|\s+$/g, '');
      if (!key || key === '—' || key === '-') return;
      map[key] = (map[key] || 0) + (w || 1);
    }
    function topKeys(map, n) {
      return Object.keys(map).sort(function (a, b) {
        return (map[b] || 0) - (map[a] || 0);
      }).slice(0, n || 5);
    }

    var cat3Map = {};
    var cat2Map = {};
    var brandMap = {};
    var benefitMap = {};
    var nameBlob = '';
    for (var i = 0; i < products.length; i++) {
      var p = products[i] || {};
      bump(cat3Map, p.cat3, 2);
      bump(cat2Map, p.cat2, 1);
      bump(brandMap, p.brand, 2);
      nameBlob += ' ' + String(p.name || p.title || '');
      var bens = [];
      if (Array.isArray(p.benefits)) bens = p.benefits;
      else if (p.benefit) bens = String(p.benefit).split(/[、,，]/);
      for (var bi = 0; bi < bens.length; bi++) bump(benefitMap, bens[bi], 1);
    }

    var kwRules = [
      { re: /口红|唇釉|唇膏/, q: ['推荐一支显白口红', '雾面口红怎么选', '干唇适合什么唇妆'] },
      { re: /精华|次抛|肌底/, q: ['敏感肌修护精华推荐', '抗初老精华怎么选', '补水保湿精华推荐'] },
      { re: /身体乳|身体霜/, q: ['推荐美白身体乳', '干燥起皮用什么身体乳'] },
      { re: /眼霜|眼部/, q: ['抗蓝光眼霜推荐', '眼周干纹怎么护'] },
      { re: /洁面|洗面|洁颜/, q: ['氨基酸洁面推荐', '油皮控油洁面怎么选'] },
      { re: /面膜/, q: ['平价补水面膜推荐', '敏感肌能用的面膜'] },
      { re: /面霜|乳液|乳霜/, q: ['干皮滋润面霜推荐', '清爽乳液怎么选'] },
      { re: /防晒|SPF/, q: ['日常通勤防晒推荐', '敏感肌温和防晒'] },
      { re: /气垫|粉底|底妆/, q: ['干皮不卡粉粉底推荐', '自然色养肤气垫'] },
      { re: /香水|香氛/, q: ['通勤淡香香水推荐'] },
      { re: /爽肤水|化妆水|精华水/, q: ['补水保湿爽肤水推荐'] }
    ];
    for (var k = 0; k < kwRules.length; k++) {
      if (kwRules[k].re.test(nameBlob)) {
        for (var qi = 0; qi < kwRules[k].q.length; qi++) push(kwRules[k].q[qi]);
      }
    }

    var topCat3 = topKeys(cat3Map, 6);
    for (var c = 0; c < topCat3.length; c++) {
      var cat = topCat3[c];
      if (/口红|唇/.test(cat)) push('推荐一支显白' + cat);
      else if (/精华/.test(cat)) push(cat + '怎么选更适合敏感肌');
      else push('推荐一款好用的' + cat);
      push(cat + '适合什么肤质');
    }

    var topBrands = topKeys(brandMap, 5);
    for (var b = 0; b < topBrands.length; b++) {
      var brand = topBrands[b];
      if (brand.length > 12) continue;
      push(brand + '有什么值得入手的');
      push(brand + '精华/面霜怎么选');
    }

    var topBen = topKeys(benefitMap, 4);
    for (var be = 0; be < topBen.length; be++) {
      var ben = topBen[be];
      if (/正品|运费|无理由|会员|优惠券|秒杀|满减/.test(ben)) {
        push('有「' + ben + '」的好物推荐');
      }
    }

    var topCat2 = topKeys(cat2Map, 3);
    for (var c2 = 0; c2 < topCat2.length; c2++) {
      push(topCat2[c2] + '入门怎么搭');
    }

    /* 目录为空或不足时用默认兜底 */
    var fallback = linesOf((DEFAULTS.daogou && DEFAULTS.daogou.quick) || '');
    for (var f = 0; f < fallback.length && questions.length < limit; f++) push(fallback[f]);

    return questions.slice(0, limit);
  }

  function buildDaogouQuickText(limit) {
    return buildDaogouQuickQuestions(limit).join('\n');
  }

  /**
   * 方案 A：视觉模型回复 → 结构化线索 → 文本检索商品库
   * 优先解析 ```json ... ``` 或文末 { ... }；失败则从中文里抽品牌/品类关键词
   */
  function parseVisionProductHints(visionText) {
    var raw = String(visionText || '').replace(/^\s+|\s+$/g, '');
    var hints = {
      brand: '',
      category: '',
      shade: '',
      productName: '',
      keywords: [],
      summary: ''
    };
    if (!raw) return hints;

    function applyObj(obj) {
      if (!obj || typeof obj !== 'object') return false;
      if (obj.brand != null) hints.brand = String(obj.brand || '').replace(/^\s+|\s+$/g, '');
      if (obj.category != null) hints.category = String(obj.category || '').replace(/^\s+|\s+$/g, '');
      if (obj.shade != null) hints.shade = String(obj.shade || '').replace(/^\s+|\s+$/g, '');
      if (obj.productName != null) hints.productName = String(obj.productName || '').replace(/^\s+|\s+$/g, '');
      if (obj.name != null && !hints.productName) hints.productName = String(obj.name || '').replace(/^\s+|\s+$/g, '');
      if (Array.isArray(obj.keywords)) {
        hints.keywords = obj.keywords.map(function (k) {
          return String(k || '').replace(/^\s+|\s+$/g, '');
        }).filter(Boolean).slice(0, 8);
      } else if (typeof obj.keywords === 'string' && obj.keywords) {
        hints.keywords = String(obj.keywords).split(/[,，、\s]+/).filter(Boolean).slice(0, 8);
      }
      if (obj.summary != null) hints.summary = String(obj.summary || '').replace(/^\s+|\s+$/g, '');
      return !!(hints.brand || hints.category || hints.productName || hints.keywords.length);
    }

    var jsonBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (jsonBlock && jsonBlock[1]) {
      try {
        if (applyObj(JSON.parse(jsonBlock[1]))) return hints;
      } catch (e1) { /* ignore */ }
    }
    var brace = raw.match(/\{[\s\S]*\}/);
    if (brace) {
      try {
        if (applyObj(JSON.parse(brace[0]))) return hints;
      } catch (e2) { /* ignore */ }
    }

    var brandHit = '';
    for (var bi = 0; bi < GUIDE_KNOWN_BRANDS.length; bi++) {
      if (raw.indexOf(GUIDE_KNOWN_BRANDS[bi]) >= 0) {
        brandHit = GUIDE_KNOWN_BRANDS[bi];
        break;
      }
    }
    hints.brand = brandHit;
    var cat = detectGuideCategory(raw);
    hints.category = cat ? cat.label : '';
    var shadeM = raw.match(/(?:色号|色号是|编号)\s*[：:]?\s*([A-Za-z0-9\-＃#号]{1,12}|[\u4e00-\u9fa5]{1,6})/);
    if (shadeM) hints.shade = shadeM[1];
    var nameM = raw.match(/(?:商品名|品名|识别为|看起来像|疑似)\s*[「『《]?\s*([^\n「」『』》]{2,28})/);
    if (nameM) hints.productName = nameM[1].replace(/[。！？,.]+$/, '');
    var kwRe = /口红|唇釉|粉底|气垫|精华|面霜|洁面|面膜|眼霜|身体乳|香水|防晒|爽肤水|遮瑕|眼影/g;
    var km;
    var seen = {};
    while ((km = kwRe.exec(raw))) {
      if (!seen[km[0]]) {
        seen[km[0]] = 1;
        hints.keywords.push(km[0]);
      }
    }
    hints.summary = raw.replace(/```[\s\S]*?```/g, '').replace(/\{[\s\S]*\}/g, '').replace(/^\s+|\s+$/g, '').slice(0, 280);
    return hints;
  }

  function buildVisionSearchQuery(hints, userAsk) {
    hints = hints || {};
    var parts = [];
    if (hints.productName) parts.push(hints.productName);
    if (hints.brand) parts.push(hints.brand);
    if (hints.category) parts.push(hints.category);
    if (hints.shade) parts.push(hints.shade);
    if (hints.keywords && hints.keywords.length) {
      for (var i = 0; i < hints.keywords.length && parts.length < 6; i++) {
        var k = hints.keywords[i];
        if (parts.indexOf(k) < 0) parts.push(k);
      }
    }
    var ask = String(userAsk || '').replace(/^\s+|\s+$/g, '');
    if (ask && ask.length <= 40 && !/^请根据我上传的图片/.test(ask)) {
      parts.push(ask);
    }
    var q = parts.join(' ').replace(/^\s+|\s+$/g, '');
    if (!q && hints.summary) {
      q = String(hints.summary).slice(0, 60);
    }
    return q || '美妆';
  }

  function brandTextMatch(hay, brand) {
    var h = String(hay || '');
    var b = String(brand || '').replace(/^\s+|\s+$/g, '');
    if (!b) return false;
    if (h.indexOf(b) >= 0) return true;
    /* 拉丁品牌忽略大小写 */
    if (/^[A-Za-z0-9][A-Za-z0-9 &.\-]{0,32}$/.test(b)) {
      return h.toLowerCase().indexOf(b.toLowerCase()) >= 0;
    }
    return false;
  }

  function brandInProduct(p, b) {
    if (!p || !b) return false;
    var blob = [p.brand, p.title, p.name, p.merchant].join(' ');
    return brandTextMatch(blob, b);
  }

  function filterByBrand(list, b) {
    if (!b || !list || !list.length) return list || [];
    var hit = [];
    for (var i = 0; i < list.length; i++) {
      if (brandInProduct(list[i], b)) hit.push(list[i]);
    }
    return hit;
  }

  /** 从运营商品库品牌表反查识图文案里出现的品牌（比固定词表更准） */
  function enrichVisionBrandFromCatalog(hints, visionText) {
    hints = hints || {};
    var raw = String(visionText || '');
    var list = loadProductList() || [];
    var ent = collectCatalogEntities(list);
    var i;
    var catalogHit = '';
    for (i = 0; i < ent.brands.length; i++) {
      var b = ent.brands[i];
      if (b && brandTextMatch(raw, b)) {
        catalogHit = b;
        break;
      }
    }
    if (catalogHit) {
      /* 库内品牌优先，避免模型臆造品名干扰 */
      hints.brand = catalogHit;
    } else if (!hints.brand) {
      var m = raw.match(/(?:品牌|brand)\s*[：:为是]?\s*([A-Za-z][A-Za-z0-9&\.\-]{1,24}|[\u4e00-\u9fa5]{1,12})/i);
      if (m && m[1]) hints.brand = String(m[1]).replace(/^\s+|\s+$/g, '');
    }
    return hints;
  }

  /** 按品牌直接扫商品库（不依赖问句打分，避免「DAZZLE/水光」拖垮命中） */
  function pickProductsByBrandDirect(brand, limit, categoryHint) {
    var max = limit || 3;
    var b = String(brand || '').replace(/^\s+|\s+$/g, '');
    if (!b) return [];
    var list = loadProductList() || [];
    var cat = String(categoryHint || '');
    var scored = [];
    var i;
    for (i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p || !brandInProduct(p, b)) continue;
      var off = String(p.status || '').indexOf('下架') >= 0;
      if (off) continue;
      var blob = [p.name, p.cat1, p.cat2, p.cat3].join(' ');
      var s = 10;
      if (cat && matchesStrictCategory(cat, p)) s += 8;
      else if (/口红|唇/.test(cat) && /口红|唇/.test(blob)) s += 8;
      if (p.status === '已上架' || p.auditKey === 'pass' || p.auditStatus === '审核通过') s += 2;
      scored.push({ p: p, s: s });
    }
    scored.sort(function (a, c) { return c.s - a.s; });
    return scored.slice(0, max).map(function (x) {
      var p = x.p;
      var cover = p.coverUrl || p.cover || p.syncCover || '';
      if (cover && cover.indexOf('./static/products/') === 0) {
        cover = '../运营管理系统/' + cover.replace(/^\.\//, '');
      }
      return attachReasonAndSource({
        id: p.id || p.sku || '',
        title: p.name || '商品',
        sub: [p.brand, p.cat3 || p.cat2 || p.cat1].filter(Boolean).join(' · ') || (p.sku || ''),
        price: String(p.price != null ? p.price : '0'),
        img: cover,
        tags: [p.cat1, p.cat2, p.cat3, p.brand].filter(Boolean).join(' '),
        sourceTable: 'spgl',
        status: p.status || '',
        brand: p.brand || '',
        cat1: p.cat1 || '',
        cat2: p.cat2 || '',
        cat3: p.cat3 || '',
        merchant: p.merchant || '',
        sku: p.sku || '',
        ingredients: inferGuideIngredients(p),
        score: x.s,
        matchBy: 'brand'
      }, p, b, x.s, 'spgl');
    });
  }

  function normalizeCoverFileKey(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/^.*[\\\/]/, '')
      .replace(/\?.*$/, '')
      .replace(/\#.*$/, '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '');
  }

  function productCoverUrls(p) {
    if (!p) return [];
    var urls = [p.coverUrl, p.cover, p.syncCover, p.img].filter(Boolean).map(String);
    var out = [];
    var seen = {};
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i];
      if (!u || seen[u]) continue;
      seen[u] = 1;
      out.push(u);
    }
    return out;
  }

  function toGuideCardFromProduct(p, query, score, matchBy) {
    var cover = p.coverUrl || p.cover || p.syncCover || '';
    if (cover && cover.indexOf('./static/products/') === 0) {
      cover = '../运营管理系统/' + cover.replace(/^\.\//, '');
    }
    return attachReasonAndSource({
      id: p.id || p.sku || '',
      title: p.name || '商品',
      sub: [p.brand, p.cat3 || p.cat2 || p.cat1].filter(Boolean).join(' · ') || (p.sku || ''),
      price: String(p.price != null ? p.price : '0'),
      img: cover,
      tags: [p.cat1, p.cat2, p.cat3, p.brand].filter(Boolean).join(' '),
      sourceTable: 'spgl',
      status: p.status || '',
      brand: p.brand || '',
      cat1: p.cat1 || '',
      cat2: p.cat2 || '',
      cat3: p.cat3 || '',
      merchant: p.merchant || '',
      sku: p.sku || '',
      ingredients: inferGuideIngredients(p),
      score: score || 20,
      matchBy: matchBy || 'cover'
    }, p, query || '', score || 20, 'spgl');
  }

  /**
   * 上传图与商品封面「同图」匹配：文件名归一化 / dataURL 全等
   * （运营把同一张图设为封面时，应直接命中，不依赖识图品名）
   */
  function matchProductsByCoverImage(opts, limit) {
    opts = opts || {};
    var max = limit || 3;
    var fileName = String(opts.fileName || '');
    var dataUrl = String(opts.dataUrl || opts.img || '');
    var fileKey = normalizeCoverFileKey(fileName);
    var list = loadProductList() || [];
    var hits = [];
    var i;
    var j;

    for (i = 0; i < list.length; i++) {
      var p = list[i];
      if (!p) continue;
      if (String(p.status || '').indexOf('下架') >= 0) continue;
      var covers = productCoverUrls(p);
      var score = 0;
      for (j = 0; j < covers.length; j++) {
        var c = covers[j];
        if (dataUrl && /^data:/i.test(dataUrl) && c === dataUrl) {
          score = Math.max(score, 100);
        }
        if (fileKey) {
          var ck = normalizeCoverFileKey(c);
          if (ck && (ck === fileKey || ck.indexOf(fileKey) >= 0 || fileKey.indexOf(ck) >= 0)) {
            score = Math.max(score, 90);
          }
        }
      }
      if (score > 0) hits.push({ p: p, s: score });
    }

    hits.sort(function (a, b) { return b.s - a.s; });
    return hits.slice(0, max).map(function (x) {
      return toGuideCardFromProduct(x.p, fileName || 'cover', x.s, 'cover');
    });
  }

  /** 根据视觉回复匹配运营商品库（spgl），返回导购商品卡数组 */
  function matchProductsFromVisionText(visionText, userAsk, limit) {
    var max = limit || 3;
    var hints = enrichVisionBrandFromCatalog(parseVisionProductHints(visionText), visionText);
    var brand = String((hints && hints.brand) || '').replace(/^\s+|\s+$/g, '');
    var query = buildVisionSearchQuery(hints, userAsk);
    var catHint = (hints && (hints.category || (hints.keywords && hints.keywords[0]))) || '';

    var products = pickGuideProducts(query, Math.max(max * 3, 6)) || [];
    if (brand) {
      var branded = filterByBrand(products, brand);
      if (branded.length) {
        products = branded.slice(0, max);
      } else {
        /* 问句打分未带出该品牌：改扫全库品牌，避免「DAZZLE」等模型品名拖垮命中 */
        products = pickProductsByBrandDirect(brand, max, catHint || '口红');
        if (!products.length) {
          products = filterByBrand(pickGuideProducts(brand, Math.max(max * 2, 4)) || [], brand).slice(0, max);
        }
        if (!products.length) {
          /* 品牌已识别但库内确实无该品牌：宁缺毋滥 */
          products = [];
        }
      }
    } else {
      products = (products || []).slice(0, max);
    }

    if ((!products || !products.length) && !brand && (hints.category || (hints.keywords && hints.keywords.length))) {
      products = pickGuideProducts([hints.category].concat(hints.keywords || []).filter(Boolean).join(' '), max) || [];
    }

    if ((!products || !products.length) && !brand && typeof global.ProductStore !== 'undefined' &&
      typeof global.ProductStore.searchByKeyword === 'function') {
      try {
        var hits = global.ProductStore.searchByKeyword(query, null, {
          onlyOnShelf: true,
          limit: max,
          imgBase: '../运营管理系统/static/products/'
        }) || [];
        products = hits.map(function (h) {
          return attachReasonAndSource({
            id: h.id,
            title: h.name || '商品',
            brand: h.brand || '',
            sku: h.sku || '',
            price: h.price,
            status: h.status || '',
            cat3: h.cat3 || '',
            img: h.cover || '',
            sub: [h.brand, h.cat3].filter(Boolean).join(' · ')
          }, h, query, 8, 'spgl');
        });
      } catch (eHit) { /* ignore */ }
    }

    if (brand && products && products.length) {
      products = filterByBrand(products, brand).slice(0, max);
    }

    return {
      hints: hints,
      query: query,
      products: products || [],
      brandMiss: !!(brand && !(products && products.length))
    };
  }

  /** 导购品类识别：用于「模糊追问 / 具象出卡」 */
  var GUIDE_CATEGORY_DEFS = [
    { key: 'lipstick', label: '口红', re: /口红|唇釉|唇膏|唇妆|豆沙唇|显白唇/ },
    { key: 'cream', label: '面霜', re: /面霜|乳液\/面霜|(?:^|[^身])乳液|乳霜/ },
    { key: 'serum', label: '精华', re: /精华液|次抛|抗初老精华|(?:^|[^水神仙])精华(?!水)/ },
    { key: 'cleanser', label: '洁面', re: /洁面|洗面奶|洗面|洁颜/ },
    { key: 'mask', label: '面膜', re: /面膜/ },
    { key: 'toner', label: '爽肤水', re: /爽肤水|化妆水|柔肤水|精华水|神仙水/ },
    { key: 'eye', label: '眼霜', re: /眼霜|抗蓝光|眼部护理/ },
    { key: 'foundation', label: '粉底', re: /粉底|底妆|气垫|遮瑕/ },
    { key: 'eyeshadow', label: '眼影', re: /眼影|眼影盘/ },
    { key: 'perfume', label: '香水', re: /香水|香氛|淡香/ },
    { key: 'body', label: '身体乳', re: /身体乳|身体护理|润肤乳|身体霜/ },
    { key: 'sunscreen', label: '防晒', re: /防晒|隔离霜|防晒霜/ }
  ];

  var GUIDE_KNOWN_BRANDS = [
    '花西子', '完美日记', '自然堂', '兰蔻', '雅诗兰黛', 'SK-II', 'SKII', '海蓝之谜',
    '修丽可', '珂润', '欧莱雅', '薇诺娜', '资生堂', 'YSL', '迪奥', '香奈儿',
    'MAC', '纪梵希', '阿玛尼', '植村秀', '悦诗风吟', '橘朵', '3CE', 'CT',
    '理肤泉', '适乐肤', '科颜氏', '后', '雪花秀', '苏秘',
    '阅己', '可复美', 'OLAY', '松达', 'HEY:REAL', 'HEYREAL',
    'NABLA', 'Nabla', 'LUMIER', 'FENTY'
  ];

  /** 明显非美妆/电商域外词（3C、家电、出行等） */
  var GUIDE_OFF_TOPIC_RE = /显示器|电视|电视机|手机|电脑|笔记本|平板|显卡|CPU|内存|硬盘|路由器|打印机|无人机|冰箱|洗衣机|空调|汽车|机票|酒店|外卖|游戏|Steam|PS5|Switch|iPhone|iPad|MacBook|安卓|Windows|微软|编程|代码|股票|基金|比特币|贷款|房贷|医保|挂号|医院|药品|处方|手术|律师|法院|装修|房产|租房|买房|招聘|简历|论文|作业|数学|英语|物理|化学题|天气|新闻|地图|导航/;

  /** 美妆/护肤/彩妆相关信号（域内） */
  var GUIDE_BEAUTY_SIGNAL_RE = /护肤|彩妆|美妆|化妆|妆小妍|美丽修行|阅己|口红|唇釉|唇膏|唇泥|面霜|乳液|乳霜|精华|洁面|洗面|面膜|防晒|粉底|底妆|气垫|眼影|腮红|香水|香氛|身体乳|眼霜|爽肤水|化妆水|眉笔|睫毛|卸妆|洗发|沐浴|手霜|润唇|BB霜|CC霜|遮瑕|定妆|散粉|蜜粉|妆前|隔离|高光|修容|试色|色号|显白|雾面|哑光|滋润|成分|烟酰胺|玻尿酸|神经酰胺|视黄醇|A醇|氨基酸|敏感肌|干皮|油皮|混油|混干|痘肌|屏障|修护|补水|保湿|抗初老|美白|提亮|控油|闭口|黑头|毛孔|SPF|PA\+|肤质|测肤|种草|好物|平价|预算|礼盒|送礼|通勤|约会/;

  /** 是否含美妆选品相关信号 */
  function guideHasBeautySignal(q) {
    var s = String(q || '');
    if (!s) return false;
    return !!(detectGuideCategory(s) ||
      guideHasBrandSignal(s) ||
      guideHasSkinOrSceneSignal(s) ||
      guideHasIngredientOrFeelSignal(s) ||
      guideIsIngredientAsk(s) ||
      GUIDE_BEAUTY_SIGNAL_RE.test(s));
  }

  /** 是否应引导至 AI 客服（订单/售后） */
  function guideIsKefuIntent(q) {
    return /订单|物流|发货|退款|售后|快递|运单|转人工|优惠券怎么用|价保|运费险|什么时候到|到货|送达|查单/.test(String(q || ''));
  }

  /**
   * 域外/串台判断：true=非美妆导购；'kefu'=转客服
   * 禁止对域外词硬推商品卡
   */
  function guideIsOutOfScope(q) {
    var s = String(q || '').replace(/^\s+|\s+$/g, '');
    if (!s) return false;
    if (guideIsKefuIntent(s)) return 'kefu';
    if (GUIDE_OFF_TOPIC_RE.test(s)) return true;
    if (guideHasBeautySignal(s)) return false;
    if (guideWantsDirectRecommend(s)) return false;
    if (/推荐|想买|想要|有没有|来一款|选一款|帮我|看看|求推荐|一款|一个/.test(s)) return false;
    return true;
  }

  function buildGuideOutOfScopeReply(q) {
    var s = String(q || '').replace(/^\s+|\s+$/g, '');
    var quoted = s.length > 12 ? (s.slice(0, 12) + '…') : s;
    return {
      text: '我是美妆导购「妆小妍」，主要帮你选护肤、彩妆、香水等站内好物。'
        + (quoted ? ('「' + quoted + '」看起来不在美妆选品范围。') : '')
        + '\n可以告诉我肤质、品类或预算，例如：',
      tips: ['推荐一款口红', '干皮补水精华', '敏感肌面霜', '预算200内的粉底'],
      tipLabels: ['口红怎么选', '干皮补水', '敏感修护', '平价粉底']
    };
  }

  function buildGuideKefuRedirectReply() {
    return {
      text: '这类订单/物流/售后问题更适合「AI客服」处理，我可以帮你转过去。\n'
        + '也可在 App「我的」→「我的订单」查看进度。',
      tips: ['查物流', '申请退款', '转人工客服'],
      tipLabels: ['查物流', '申请退款', '转人工']
    };
  }

  function detectGuideCategory(query) {
    var q = String(query || '');
    for (var i = 0; i < GUIDE_CATEGORY_DEFS.length; i++) {
      var d = GUIDE_CATEGORY_DEFS[i];
      if (d.re.test(q)) return { key: d.key, label: d.label, re: d.re };
    }
    return null;
  }

  /** 一句话里命中多个品类（如「干皮补水，顺便推荐口红」） */
  function detectGuideMultiCategories(query) {
    var q = String(query || '');
    var found = [];
    var seen = {};
    function addCat(c) {
      if (!c || !c.label) return;
      var key = c.key || c.label;
      if (seen[key]) return;
      seen[key] = true;
      found.push({ key: key, label: c.label, re: c.re || null });
    }
    var i;
    for (i = 0; i < GUIDE_CATEGORY_DEFS.length; i++) {
      if (GUIDE_CATEGORY_DEFS[i].re.test(q)) addCat(GUIDE_CATEGORY_DEFS[i]);
    }
    /* 分句补抓：「…顺便…」类多意图 */
    if (/顺便|同时|还有|以及|再来|另外/.test(q)) {
      var parts = q.split(/[，,。；;]|顺便|同时|还有|以及|再来|另外/);
      for (i = 0; i < parts.length; i++) {
        var seg = String(parts[i] || '').replace(/^\s+|\s+$/g, '');
        if (!seg) continue;
        var sub = detectGuideCategory(seg);
        if (sub) addCat(sub);
        if (/精华|次抛|抗初老/.test(seg)) addCat({ key: 'serum', label: '精华' });
        if (/面霜|乳霜|乳液/.test(seg)) addCat({ key: 'cream', label: '面霜' });
        if (/口红|唇釉|唇膏/.test(seg)) addCat({ key: 'lipstick', label: '口红' });
        if (/洁面|洗面/.test(seg)) addCat({ key: 'cleanser', label: '洁面' });
        if (/面膜/.test(seg)) addCat({ key: 'mask', label: '面膜' });
        if (/防晒/.test(seg)) addCat({ key: 'sunscreen', label: '防晒' });
        if (/粉底|底妆|气垫/.test(seg)) addCat({ key: 'foundation', label: '粉底' });
        if ((/补水|保湿|干皮/.test(seg) || /干皮|混干|换季/.test(seg)) && !seen.serum && !seen.cream) {
          addCat({ key: 'serum', label: '精华' });
        }
      }
    }
    return found;
  }

  function guideHasBrandSignal(q) {
    var s = String(q || '');
    for (var i = 0; i < GUIDE_KNOWN_BRANDS.length; i++) {
      if (s.indexOf(GUIDE_KNOWN_BRANDS[i]) >= 0) return true;
    }
    return /品牌是|只要.+牌|点名品牌|品牌要/.test(s);
  }

  function guideHasPriceSignal(q) {
    var s = String(q || '');
    /* 避免色号「08」、货号数字误判为预算；需带价格语境 */
    return /预算|价格|价位|以内|以下|以上|左右|便宜|平价|贵一点|别太贵|不太贵|不要太贵|实惠|划算|不贵|性价比|￥|¥/.test(s) ||
      /\d+\s*(元|块|左右)/.test(s) ||
      /\d{2,4}\s*[-~～到至]\s*\d{2,4}/.test(s) ||
      /预算\s*\d+|不超过\s*\d+|低于\s*\d+/.test(s);
  }

  function guideHasIngredientOrFeelSignal(q) {
    var s = String(q || '');
    /* 「在意成分」仅表偏好维度，不算已具备成分约束 */
    if (guideIsIngredientPrefAsk(s)) return false;
    return /妆感|质地|哑光|雾面|滋润|不卡唇|显白|持久|防水|控油|清爽|厚重|温和|无香|神经酰胺|烟酰胺|玻尿酸|视黄醇|氨基酸|敏感肌友好|不拔干|不搓泥|美白|提亮|抗皱|祛痘|色号|豆沙|正红|番茄|奶茶|全成分|成分表|含有/.test(s) ||
      (/成分/.test(s) && !/在意成分|看重成分|关心成分|在乎成分|成分优先|按成分/.test(s));
  }

  /** 「在意成分」偏好维度（尚未点名具体成分）→ 走引导，不出卡 */
  function guideIsIngredientPrefAsk(q) {
    var s = String(q || '');
    if (!/在意成分|看重成分|关心成分|在乎成分|成分优先|按成分|要看成分|更看成分/.test(s)) return false;
    /* 已点名具体成分 / 查成分表 → 不算纯偏好追问 */
    if (extractIngredientSearchKeys(s).length) return false;
    if (/查成分|成分怎么样|成分如何|全成分|成分表|成分解读|成分分析|含有|含不含|富含/.test(s)) return false;
    return true;
  }

  /** 用户在问成分 / 全成分 / 含某成分（含模糊问法） */
  function guideIsIngredientAsk(q) {
    var s = String(q || '');
    if (!s) return false;
    /* 纯「在意成分」偏好留给清晰度引导层 */
    if (guideIsIngredientPrefAsk(s)) return false;
    if (/成分|全成分|成分表|成分解读|成分分析|成分安全|致痘|致敏|活性物|表活/.test(s)) return true;
    if (/含有|含不含|有没有|含不|富含/.test(s) &&
        /烟酰胺|玻尿酸|神经酰胺|视黄醇|氨基酸|维\s*C|维生素C|酒精|香精|防腐剂|A醇|B5|泛醇|积雪草|水杨酸/.test(s)) {
      return true;
    }
    if (/^查(一下)?成分|看看成分|成分怎么样|成分如何|讲讲成分|说说成分/.test(s)) return true;
    return guideWantsIngredientCompare(s);
  }

  /** 从问句提取可检索的成分关键词（用于模糊成分问句扩检索） */
  function extractIngredientSearchKeys(q) {
    var s = String(q || '');
    var keys = [];
    var dict = [
      '烟酰胺', '玻尿酸', '透明质酸', '神经酰胺', '视黄醇', 'A醇', '氨基酸',
      '维生素C', '维C', '泛醇', 'B5', '积雪草', '水杨酸', '酒精', '香精',
      '防腐剂', '角鲨烷', '胶原蛋白', '胜肽', 'Pitera', '酵母'
    ];
    var i;
    for (i = 0; i < dict.length; i++) {
      if (s.indexOf(dict[i]) >= 0) keys.push(dict[i]);
    }
    return keys;
  }

  function guideHasSkinOrSceneSignal(q) {
    return /干皮|油皮|混干|混油|敏感肌|痘肌|屏障|通勤|送礼|约会|婚礼|职场|学生党|男士|换季|补水|保湿|抗初老|修护/.test(String(q || ''));
  }

  function guideHasShopSignal(q) {
    return /店|旗舰|专营|商家/.test(String(q || ''));
  }

  function guideWantsDirectRecommend(q) {
    return /直接推荐|直接给|随便推荐|热门几款|几款热门|热门的|都可以|先看几款|不挑|无要求|随便看看|有什么推荐|不限品牌/.test(String(q || ''));
  }

  function guideIsBrowseMore(q) {
    return /还有|其他|别的|再来|多几|换几|下一批/.test(String(q || ''));
  }

  function guideIsCompareAsk(q) {
    var s = String(q || '');
    /* 「我比较在意品牌」不是对比问法 */
    if (/比较在意|比较看重|比较关心|比较喜欢|比较想|比较偏好/.test(s)) return false;
    return /对比|比较一下|比较这|比较下|哪个好|哪款好|VS|vs|Vs|比一比|和.{1,20}(对比|比较|比一比)|双品|比对成分|对比成分|成分对比|成分比较|比一下成分/.test(s);
  }

  function guideWantsIngredientCompare(q) {
    return /比对成分|对比成分|成分对比|成分比较|比一下成分|成分差异|比成分|成分上|看成分/.test(String(q || ''));
  }

  /**
   * 按商品名称生成详细示意成分表（客服「关键成分」列 / 话术用）
   * 演示原型：结合品名关键词 + 品类基质，非真实包装备案全成分
   */
  function buildDetailedProductIngredients(p) {
    if (!p || typeof p !== 'object') return '详见商品页成分表';
    var explicit = p.ingredients || p.ingredient || p.fullIngredients || p.keyIng || p.keyIngredients;
    if (explicit && String(explicit).replace(/^\s+|\s+$/g, '').length > 20) {
      return String(explicit).replace(/^\s+|\s+$/g, '');
    }
    var name = String(p.name || p.title || p.prodName || '');
    var brand = String(p.brand || '');
    var cat = [p.cat3, p.cat2, p.cat1, name, brand].join(' ');
    var blob = name + ' ' + brand + ' ' + cat;
    var list = [];
    function add(x) {
      if (!x) return;
      var s = String(x).replace(/^\s+|\s+$/g, '');
      if (!s) return;
      for (var i = 0; i < list.length; i++) {
        if (list[i] === s) return;
      }
      list.push(s);
    }
    function addMany(arr) {
      for (var i = 0; i < (arr || []).length; i++) add(arr[i]);
    }

    if (/神仙水|Facial Treatment Essence|Pitera精华水/i.test(blob) || (/SK-?II/i.test(blob) && /精华(水|露)/.test(blob) && !/面膜|面霜|大红瓶/.test(blob))) {
      addMany(['半乳糖酵母样菌发酵产物滤液（PITERA™）', '水', '丁二醇', '五聚甘油-4月桂酸酯', '苯氧乙醇', '山梨酸钾', '柠檬酸钠', '苯甲酸钠', '乙基己基甘油']);
    } else if (/小黑瓶|肌底修护精华|Genifique|精华肌底液/i.test(blob)) {
      addMany(['水', '双歧发酵产物溶胞物', '甘油', '酒精', '丁二醇', '烟酰胺', '聚二甲基硅氧烷', '聚丙烯酸钠', '腺苷', '透明质酸钠', '玫瑰提取物', '玫瑰籽油', '苯氧乙醇', '香精', '柠檬酸', '柠檬酸钠']);
    } else if (/小棕瓶|特润修护|Advanced Night Repair/i.test(blob) || (/眼霜/.test(blob) && /雅诗兰黛|Estee/i.test(blob))) {
      addMany(['水', '二聚二甲基硅氧烷', '丁二醇', '聚二甲基硅氧烷', '甘油', '咖啡因', '黄瓜果实提取物', '胆固醇', '角鲨烷', '透明质酸钠', '三肽-32', '玫瑰籽油', '苯氧乙醇', '黄原胶', '香精']);
    } else if (/大红瓶|RNA Power|Radical New Age/i.test(blob)) {
      addMany(['水', '半乳糖酵母样菌发酵产物滤液（PITERA™）', '甘油', '角鲨烷', '丁二醇', '聚二甲基硅氧烷', '鲸蜡硬脂醇', '水解酵母蛋白', '异十六烷', '生育酚乙酸酯', '苯氧乙醇', '香精', '卡波姆']);
    } else if (/前男友面膜|Facial Treatment Mask/i.test(blob) || (/SK-?II/i.test(blob) && /面膜/.test(blob))) {
      addMany(['半乳糖酵母样菌发酵产物滤液（PITERA™）', '水', '丁二醇', '甘油', '甜菜碱', 'PCA钠', '透明质酸钠', '尿囊素', '苯氧乙醇', '黄原胶']);
    } else if (/海蓝之谜|La Mer|浓缩修护精华/i.test(blob)) {
      addMany(['海藻发酵产物', '水', '甘油', '矿物油', '凡士林', '羊毛脂醇', '芝麻籽油', '桉叶油', '镁硫酸盐', '石灰藻提取物', '维生素E', '苯氧乙醇', '香精']);
    } else if (/色修|Phyto Corrective|植萃舒缓/i.test(blob)) {
      addMany(['水', '甘油', '丁二醇', '丙二醇', '黄瓜果实提取物', '桑根提取物', '橄榄叶提取物', '百里香提取物', '透明质酸钠', '苯氧乙醇', '柠檬酸']);
    } else if (/CE\b|CE Ferulic|维生素CE|抗坏血酸.*阿魏酸/i.test(blob)) {
      addMany(['水', '乙氧基二甘醇', '抗坏血酸（维C）', '丙二醇', '甘油', '月桂醇聚醚-23', '维生素E', '苯氧乙醇', '阿魏酸', '柠檬酸钠']);
    } else if (/菁纯|Absolue|臻颜精萃乳霜/i.test(blob)) {
      addMany(['水', '甘油', '角鲨烷', '丁二醇', '霍霍巴籽油', '乳木果油', '鲸蜡硬脂醇', '玫瑰花提取物', '白池花籽油', '生育酚', '苯氧乙醇', '香精']);
    } else if (/珂润|Curel|润浸保湿/i.test(blob)) {
      addMany(['水', '甘油', '丁二醇', '鲸蜡醇乙基己酸酯', '角鲨烷', '十六烷醇', '神经酰胺NP', '神经酰胺AP', '植物甾醇', '透明质酸钠', '尿囊素', '苯氧乙醇', '卡波姆']);
    } else if (/龙血/.test(blob)) {
      addMany(['水', '肉豆蔻酸', '甘油', '氢氧化钾', '月桂酸', '龙血树提取物', '喜马拉雅冰川水', '薄荷醇', '薄荷叶油', '苯氧乙醇', '香精', 'EDTA二钠']);
    } else if (/冰川水|喜马拉雅冰川/i.test(blob) && !/洁面|洗面/.test(blob)) {
      addMany(['水', '丁二醇', '甘油', '甜菜碱', 'PCA钠', '喜马拉雅冰川矿泉水', '透明质酸钠', '泛醇', '尿囊素', '苯氧乙醇', '柠檬酸', '黄原胶']);
    } else if (/复颜玻尿酸|水光充盈乳液/i.test(blob)) {
      addMany(['水', '甘油', '丁二醇', '聚二甲基硅氧烷', '羟丙基四氢吡喃三醇', '水解透明质酸钠', '透明质酸钠', '烟酰胺', '腺苷', '生育酚乙酸酯', '苯氧乙醇', '香精', '卡波姆']);
    } else if (/氨基酸.*洁面|净透洁面|温和.*洁面/i.test(blob)) {
      addMany(['水', '甘油', '椰油酰基谷氨酸钠', '椰油酰基甘氨酸钾', '丙烯酸（酯）类共聚物', '丁二醇', '甜菜碱', 'PCA钠', '尿囊素', '泛醇', '苯氧乙醇', '柠檬酸']);
    } else if (/玻尿酸.*面膜|补水保湿面膜/i.test(blob)) {
      addMany(['水', '甘油', '丁二醇', '水解透明质酸钠', '透明质酸钠', '甜菜碱', '泛醇', '尿囊素', '积雪草提取物', '苯氧乙醇', '黄原胶', '卡波姆']);
    } else if (/羽毛气垫|气垫粉底|粉底液/i.test(blob)) {
      addMany(['水', '环五聚二甲基硅氧烷', '二氧化钛', '氧化锌', '甘油', '丁二醇', '聚二甲基硅氧烷', '氧化铁', '烟酰胺', '透明质酸钠', '苯氧乙醇', '香精']);
    } else if (/口红|唇釉|唇膏|唇泥/i.test(blob)) {
      addMany(['聚二甲基硅氧烷', '合成氟金云母', '氢化聚异丁烯', '辛基十二醇', '聚乙烯', '二氧化钛', '氧化铁', '红7湖', '生育酚乙酸酯', '香精']);
    }

    if (/玻尿酸|透明质酸|水光|玻尿/.test(blob)) addMany(['透明质酸钠', '水解透明质酸钠', '乙酰化透明质酸钠']);
    if (/烟酰胺/.test(blob)) add('烟酰胺');
    if (/视黄醇|A醇|维A/.test(blob)) addMany(['视黄醇', '视黄醇棕榈酸酯']);
    if (/维\s*C|维生素C|抗坏血酸|抗氧/.test(blob)) addMany(['抗坏血酸', '抗坏血酸葡糖苷', '维生素E']);
    if (/神经酰胺|屏障|修护/.test(blob)) addMany(['神经酰胺NP', '神经酰胺AP', '胆固醇']);
    if (/积雪草|舒缓|泛红|敏感/.test(blob)) addMany(['积雪草提取物', '泛醇', '尿囊素']);
    if (/胶原|胜肽|肽|抗初老|紧致/.test(blob)) addMany(['棕榈酰三肽-1', '棕榈酰四肽-7', '腺苷']);
    if (/咖啡因|抗蓝光|黑眼圈/.test(blob)) addMany(['咖啡因', '烟酰胺', '生育酚乙酸酯']);
    if (/角鲨烷|角鲨烯/.test(blob)) add('角鲨烷');
    if (/乳木果|牛油果|滋润/.test(blob)) addMany(['乳木果油', '霍霍巴籽油']);
    if (/茶树|控油|清爽|男士/.test(blob) && /洁面|洗面|精华/.test(blob)) addMany(['水杨酸', '锌PCA', '茶树叶油']);
    if (/防晒|SPF|PA\+/i.test(blob)) addMany(['甲氧基肉桂酸乙基己酯', '氧化锌', '二氧化钛']);
    if (/B5|泛醇/.test(blob)) add('泛醇');
    if (/桃胶|桃花/.test(blob)) addMany(['桃胶提取物', '桃花提取物', '蜂蜜提取物']);
    if (/松露/.test(blob)) add('黑松露提取物');
    if (/橄榄|植萃/.test(blob)) addMany(['橄榄叶提取物', '甘油']);

    if (list.length < 8) {
      if (/洁面|洗面|洁颜/.test(cat + name)) {
        addMany(['水', '甘油', '椰油酰基谷氨酸钠', '月桂酰基谷氨酸钠', '丙烯酸（酯）类共聚物', '丁二醇', '甜菜碱', 'PCA钠', '苯氧乙醇', '柠檬酸', 'EDTA二钠']);
      } else if (/面膜/.test(cat + name)) {
        addMany(['水', '甘油', '丁二醇', '甜菜碱', '透明质酸钠', '泛醇', '尿囊素', '苯氧乙醇', '黄原胶', '卡波姆', 'EDTA二钠']);
      } else if (/面霜|乳液|乳霜/.test(cat + name)) {
        addMany(['水', '甘油', '丁二醇', '角鲨烷', '鲸蜡硬脂醇', '聚二甲基硅氧烷', '生育酚乙酸酯', '透明质酸钠', '苯氧乙醇', '卡波姆', '香精']);
      } else if (/精华|肌底|次抛/.test(cat + name)) {
        addMany(['水', '丁二醇', '甘油', '烟酰胺', '透明质酸钠', '腺苷', '泛醇', '苯氧乙醇', '黄原胶', '柠檬酸钠']);
      } else if (/爽肤水|化妆水|精华水|柔肤水|toner/i.test(cat + name)) {
        addMany(['水', '丁二醇', '甘油', '甜菜碱', 'PCA钠', '透明质酸钠', '泛醇', '苯氧乙醇', '柠檬酸', '黄原胶']);
      } else if (/眼霜|眼部/.test(cat + name)) {
        addMany(['水', '甘油', '丁二醇', '咖啡因', '聚二甲基硅氧烷', '烟酰胺', '生育酚乙酸酯', '苯氧乙醇', '卡波姆']);
      } else if (/粉底|气垫|底妆|遮瑕/.test(cat + name)) {
        addMany(['水', '环五聚二甲基硅氧烷', '二氧化钛', '甘油', '丁二醇', '氧化铁', '聚二甲基硅氧烷', '苯氧乙醇', '香精']);
      } else if (/口红|唇/.test(cat + name)) {
        addMany(['聚二甲基硅氧烷', '氢化聚异丁烯', '辛基十二醇', '合成氟金云母', '二氧化钛', '氧化铁', '生育酚乙酸酯', '香精']);
      } else {
        addMany(['水', '甘油', '丁二醇', '甜菜碱', '透明质酸钠', '泛醇', '苯氧乙醇', '黄原胶', '柠檬酸', '香精']);
      }
    }

    if (!list.length) return '详见商品页成分表';
    return list.slice(0, 18).join('、') + '（示意成分，以包装备案全成分为准）';
  }

  /**
   * 导购卡片用精简要点（从详细表抽取活性物）
   */
  function inferGuideIngredients(p) {
    var detailed = buildDetailedProductIngredients(p);
    if (!detailed || detailed.indexOf('详见商品页') === 0) return detailed || '详见商品页成分表';
    var parts = String(detailed).replace(/（示意成分[^）]*）/g, '').split(/[、,，]/).map(function (s) {
      return String(s || '').replace(/^\s+|\s+$/g, '');
    }).filter(Boolean);
    var highlight = [];
    var prefer = /PITERA|半乳糖酵母|双歧|神经酰胺|玻尿酸|透明质酸|烟酰胺|视黄醇|维C|抗坏血酸|龙血|氨基酸|胜肽|肽|积雪草|泛醇|咖啡因|阿魏酸|海藻/i;
    for (var i = 0; i < parts.length && highlight.length < 3; i++) {
      if (prefer.test(parts[i])) highlight.push(parts[i].replace(/（.*?）/g, '').slice(0, 20));
    }
    if (!highlight.length) {
      for (var j = 0; j < parts.length && highlight.length < 3; j++) {
        if (!/^水$|^甘油$|^丁二醇$|^苯氧乙醇$|^香精$|^酒精$/.test(parts[j])) {
          highlight.push(parts[j].replace(/（.*?）/g, '').slice(0, 20));
        }
      }
    }
    return highlight.length ? highlight.join(' · ') : parts.slice(0, 3).join(' · ');
  }

  function buildIngredientCompareNote(a, b) {
    var ia = inferGuideIngredients(a);
    var ib = inferGuideIngredients(b);
    if (!ia && !ib) return '';
    if (ia === ib) return '关键成分侧重点相近（' + ia + '），可再看浓度与肤质适配';
    var shared = [];
    var aa = ia.split(/\s*·\s*/);
    var bb = ib.split(/\s*·\s*/);
    for (var i = 0; i < aa.length; i++) {
      for (var j = 0; j < bb.length; j++) {
        if (aa[i] && bb[j] && aa[i] === bb[j] && shared.indexOf(aa[i]) < 0) shared.push(aa[i]);
      }
    }
    if (shared.length) {
      return '成分上共有「' + shared.join('、') + '」；差异：A侧重「' + ia + '」，B侧重「' + ib + '」';
    }
    return '成分侧重点不同：A「' + ia + '」vs B「' + ib + '」，可按肤质需求选';
  }

  /**
   * 需求清晰度：vague → 引导提问；concrete → 直接卡片检索
   * @param {string} query
   * @param {{ pendingCategory?: string, pendingDim?: string }=} opts
   */
  function assessGuideNeedClarity(query, opts) {
    opts = opts || {};
    var productSource = opts.products || loadProductList();
    var q = String(query || '').replace(/^\s+|\s+$/g, '');
    var pendingCat = String(opts.pendingCategory || '').replace(/^\s+|\s+$/g, '');
    var pendingDim = String(opts.pendingDim || '').replace(/^\s+|\s+$/g, '');
    var empty = {
      clarity: 'concrete',
      category: null,
      searchQuery: q,
      pendingCategory: '',
      pendingDim: '',
      text: '',
      tips: [],
      tipLabels: []
    };
    if (!q) return empty;

    /* 域外 / 售后串台：禁止硬推商品卡 */
    var oos = guideIsOutOfScope(q);
    if (oos === 'kefu') {
      var kefuPack = buildGuideKefuRedirectReply();
      return {
        clarity: 'kefu',
        category: null,
        searchQuery: q,
        pendingCategory: '',
        pendingDim: '',
        text: kefuPack.text,
        tips: kefuPack.tips,
        tipLabels: kefuPack.tipLabels
      };
    }
    if (oos === true) {
      var oosPack = buildGuideOutOfScopeReply(q);
      return {
        clarity: 'out_of_scope',
        category: null,
        searchQuery: q,
        pendingCategory: '',
        pendingDim: '',
        text: oosPack.text,
        tips: oosPack.tips,
        tipLabels: oosPack.tipLabels
      };
    }

    /* 评价原文 / 超长粘贴 / 对比 / 点名长标题 → 具象 */
    if (q.length >= 48) return empty;
    if (guideIsCompareAsk(q)) return empty;
    /* 成分相关（含模糊「查成分/成分怎么样」）：优先出商品卡，不走纯追问 */
    if (guideIsIngredientAsk(q)) {
      var ingCat = detectGuideCategory(q) || (pendingCat ? { key: '', label: pendingCat } : null);
      var ingSearch = q;
      var ingKeys = extractIngredientSearchKeys(q);
      if (ingCat && q.indexOf(ingCat.label) < 0) {
        ingSearch = ingCat.label + ' ' + q;
      } else if (!ingCat && ingKeys.length) {
        ingSearch = ingKeys.join(' ') + ' ' + q;
      } else if (!ingCat && /成分/.test(q) && q.length <= 12) {
        /* 极短模糊：用热门护肤品类扩检索，便于先出卡 */
        ingSearch = '精华 面霜 洁面 ' + q;
      }
      return {
        clarity: 'concrete',
        category: ingCat,
        searchQuery: ingSearch,
        pendingCategory: '',
        pendingDim: '',
        text: '',
        tips: [],
        tipLabels: [],
        ingredientFocus: true
      };
    }
    if (guideIsBrowseMore(q)) {
      var browseCat = detectGuideCategory(q) || (pendingCat ? { key: '', label: pendingCat } : null);
      return {
        clarity: 'concrete',
        category: browseCat,
        searchQuery: browseCat && pendingCat && q.indexOf(browseCat.label) < 0
          ? (browseCat.label + ' ' + q)
          : q,
        pendingCategory: '',
        pendingDim: '',
        text: '',
        tips: [],
        tipLabels: []
      };
    }

    var cat = detectGuideCategory(q);
    if (!cat && pendingCat) {
      cat = detectGuideCategory(pendingCat) || { key: '', label: pendingCat };
    }
    var searchQuery = q;
    if (cat && pendingCat && q.indexOf(cat.label) < 0 && !detectGuideCategory(q)) {
      searchQuery = pendingCat + ' ' + q;
      cat = detectGuideCategory(searchQuery) || cat;
    }

    /* 无品类：极短泛推荐才追问品类；有肤质/场景/功效描述则直接检索出卡 */
    if (!cat) {
      if (/推荐|帮我选|买什么|不知道买|选什么|给我来|想要|想买/.test(q) && q.length <= 16 &&
          !guideHasBrandSignal(q) && !guideHasPriceSignal(q) &&
          !guideHasSkinOrSceneSignal(q) && !guideHasIngredientOrFeelSignal(q)) {
        var catClarify = buildGuideCategoryClarifyFromSpgl(productSource);
        return {
          clarity: 'vague',
          category: null,
          searchQuery: q,
          pendingCategory: '',
          pendingDim: '',
          text: catClarify.text,
          tips: catClarify.tips,
          tipLabels: catClarify.tipLabels
        };
      }
      if (guideHasSkinOrSceneSignal(q) || guideHasIngredientOrFeelSignal(q) || guideHasPriceSignal(q)) {
        return empty;
      }
      return empty;
    }

    var multiCats = detectGuideMultiCategories(q);

    var concrete = guideHasBrandSignal(searchQuery) ||
      guideHasPriceSignal(searchQuery) ||
      guideHasIngredientOrFeelSignal(searchQuery) ||
      guideHasSkinOrSceneSignal(searchQuery) ||
      guideHasShopSignal(searchQuery) ||
      guideWantsDirectRecommend(searchQuery);

    var dimBrandAsk = /在意品牌|看品牌|按品牌|要品牌|品牌优先|在乎品牌|关心品牌/.test(searchQuery);
    var dimPriceAsk = /在意价格|看价格|按价格|价格优先|预算优先|在乎价格|关心价格/.test(searchQuery);
    var dimIngAsk = guideIsIngredientPrefAsk(searchQuery);
    /* 本轮若明确换了维度，忽略上一轮 pendingDim，避免串台 */
    var usePendingBrand = pendingDim === 'brand' && !dimPriceAsk && !dimIngAsk;
    var usePendingPrice = pendingDim === 'price' && !dimBrandAsk && !dimIngAsk;
    var usePendingIng = pendingDim === 'ingredient' && !dimBrandAsk && !dimPriceAsk;

    /* 第二层：只说了「在意品牌」但没点名品牌 */
    if ((dimBrandAsk || usePendingBrand) &&
        !guideHasBrandSignal(searchQuery) && !guideWantsDirectRecommend(searchQuery) &&
        !guideHasPriceSignal(searchQuery)) {
      var brandList = filterProductsForGuideCategory(productSource, cat);
      var brandPool = topGuideBrands(brandList, 3);
      var brandTips = [];
      var brandLabels = [];
      var bj;
      for (bj = 0; bj < brandPool.length; bj++) {
        brandTips.push('推荐' + cat.label + '，品牌要' + brandPool[bj]);
        brandLabels.push('选「' + brandPool[bj] + '」');
      }
      while (brandTips.length < 3) {
        brandTips.push('推荐' + cat.label + '，不限品牌直接给我几款');
        brandLabels.push('不限品牌');
        break;
      }
      return {
        clarity: 'vague',
        category: cat,
        searchQuery: searchQuery,
        pendingCategory: cat.label,
        pendingDim: 'brand',
        text: '好的，按品牌来挑「' + cat.label + '」。商品库里有「' + brandPool.join('」「') + '」等，请点选：',
        tips: brandTips.slice(0, 3),
        tipLabels: brandLabels.slice(0, 3)
      };
    }

    /* 第二层：在意价格但没给区间 */
    if ((dimPriceAsk || usePendingPrice) &&
        !guideHasPriceSignal(searchQuery.replace(/在意价格|看价格|按价格|价格优先|预算优先|在乎价格|关心价格|我比较/g, '')) &&
        !guideWantsDirectRecommend(searchQuery)) {
      var priceList = filterProductsForGuideCategory(productSource, cat);
      var priceTiers = guidePriceTiers(priceList).slice(0, 3);
      var priceTips = [];
      var priceLabels = [];
      var pj;
      for (pj = 0; pj < priceTiers.length; pj++) {
        priceTips.push('推荐' + cat.label + '，预算 ' + priceTiers[pj]);
        priceLabels.push(priceTiers[pj]);
      }
      return {
        clarity: 'vague',
        category: cat,
        searchQuery: searchQuery,
        pendingCategory: cat.label,
        pendingDim: 'price',
        text: '明白，价格对你比较重要。根据商品库价位，请点选合适预算：',
        tips: priceTips,
        tipLabels: priceLabels
      };
    }

    /* 第二层：在意成分但没点名具体成分/功效 */
    if ((dimIngAsk || usePendingIng) &&
        !extractIngredientSearchKeys(searchQuery).length &&
        !guideWantsDirectRecommend(searchQuery) &&
        !guideHasIngredientOrFeelSignal(searchQuery)) {
      var ingList = filterProductsForGuideCategory(productSource, cat);
      var ingThemes = topGuideIngredientThemes(ingList, 3);
      var ingTips = [];
      var ingLabels = [];
      var ij;
      for (ij = 0; ij < ingThemes.length; ij++) {
        ingTips.push('推荐' + cat.label + '，更看重' + ingThemes[ij]);
        ingLabels.push(ingThemes[ij]);
      }
      while (ingTips.length < 3) {
        ingTips.push('推荐' + cat.label + '，成分友好直接给我几款');
        ingLabels.push('不限成分先看看');
        break;
      }
      return {
        clarity: 'vague',
        category: cat,
        searchQuery: searchQuery,
        pendingCategory: cat.label,
        pendingDim: 'ingredient',
        text: '好的，按成分来挑「' + cat.label + '」。你更偏向哪类？点选后我会直接给你商品卡：',
        tips: ingTips.slice(0, 3),
        tipLabels: ingLabels.slice(0, 3),
        ingredientFocus: true
      };
    }

    if (concrete) {
      var multiOut = {
        clarity: 'concrete',
        category: cat,
        searchQuery: searchQuery,
        pendingCategory: '',
        pendingDim: '',
        text: '',
        tips: [],
        tipLabels: []
      };
      if (multiCats.length >= 2 && /顺便|同时|还有|以及|再来|另外/.test(q)) {
        multiOut.multiCategories = multiCats;
      }
      return multiOut;
    }

    /* 模糊：仅品类 / 「推荐一款口红」类 → 品牌 / 价格 / 成分 三问 */
    var vagueLike = /推荐|想买|想要|有没有|来一款|选一款|帮我|看看|求推荐|一款|一个/.test(q) ||
      q.length <= (cat.label.length + 6);
    if (!vagueLike) {
      return {
        clarity: 'concrete',
        category: cat,
        searchQuery: searchQuery,
        pendingCategory: '',
        pendingDim: '',
        text: '',
        tips: [],
        tipLabels: []
      };
    }

    var dimPack = buildGuideClarifyFromSpgl(cat, productSource);
    return {
      clarity: 'vague',
      category: cat,
      searchQuery: searchQuery,
      pendingCategory: cat.label,
      pendingDim: '',
      text: dimPack.text,
      tips: dimPack.tips,
      tipLabels: dimPack.tipLabels
    };
  }

  function assessGuideNeedClarityAsync(query, opts) {
    opts = opts || {};
    return fetchSpglProducts(false).then(function (list) {
      return assessGuideNeedClarity(query, Object.assign({}, opts, { products: list }));
    }).catch(function () {
      return assessGuideNeedClarity(query, opts);
    });
  }

  function buildGuideSystemConstraint(ctx) {
    ctx = ctx || collectGuideContext('', 3, 'daogou');
    var lines = [];
    lines.push('你必须严格依据运营端「AI配置 → AI导购」关联的数据表作答，禁止编造表外商品或库存。');
    if (ctx.selectedTables && ctx.selectedTables.length) {
      lines.push('已关联数据表：' + ctx.selectedTables.join('、') + '。');
      lines.push('仅可引用这些表中的检索结果；未命中时说明暂无匹配数据，引导用户换问法，不要推荐演示商品。');
    } else {
      lines.push('当前未勾选具体表，可检索：' + GUIDE_RETRIEVABLE.join('、') + '。');
    }
    if (ctx.blockedTables && ctx.blockedTables.length) {
      lines.push('以下已勾选表暂不用于导购推荐卡（仅作约束记录）：' + ctx.blockedTables.join('、') + '。');
    }
    if (ctx.empty) {
      lines.push('本次检索无命中结果：请如实告知，并建议换关键词或联系运营确认数据表勾选。');
    }
    return lines.join('\n');
  }

  function onMessage(ev) {
    var data = ev && ev.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === REQUEST_MSG) {
      broadcast(load());
      return;
    }
    if (data.type === SYNC_MSG && data.payload) {
      applyRemote(data.payload);
    }
  }

  if (global.addEventListener) {
    global.addEventListener('message', onMessage, false);
    global.addEventListener('storage', function (ev) {
      if (!ev || !ev.key) return;
      if (ev.key !== STORAGE_KEY && ev.key !== LLM_KEY) return;
      var prev = memoryCfg;
      memoryCfg = null;
      var fromDisk = load();
      memoryCfg = mergeMemoryWithDisk(prev, fromDisk);
      try {
        global.dispatchEvent(new CustomEvent('ai-config-updated', { detail: memoryCfg }));
      } catch (e) { /* ignore */ }
    }, false);
  }

  global.AiConfigStore = {
    STORAGE_KEY: STORAGE_KEY,
    SYNC_MSG: SYNC_MSG,
    REQUEST_MSG: REQUEST_MSG,
    DEFAULTS: DEFAULTS,
    load: load,
    save: save,
    saveAsync: saveAsync,
    applyRemote: applyRemote,
    requestSync: requestSync,
    getModule: getModule,
    buildModule: buildModule,
    getModuleTables: getModuleTables,
    usesTable: usesTable,
    resolveGuideTables: resolveGuideTables,
    parseGuidePriceConstraint: parseGuidePriceConstraint,
    buildGuideEmptyHint: buildGuideEmptyHint,
    pickGuideProducts: pickGuideProducts,
    buildDaogouQuickQuestions: buildDaogouQuickQuestions,
    buildDaogouQuickText: buildDaogouQuickText,
    loadGuideCatalogProducts: loadGuideCatalogProducts,
    parseVisionProductHints: parseVisionProductHints,
    buildVisionSearchQuery: buildVisionSearchQuery,
    matchProductsFromVisionText: matchProductsFromVisionText,
    matchProductsByCoverImage: matchProductsByCoverImage,
    pickProductsByBrandDirect: pickProductsByBrandDirect,
    resolveGuideIntent: resolveGuideIntent,
    detectGuideCategory: detectGuideCategory,
    detectGuideMultiCategories: detectGuideMultiCategories,
    guideIsIngredientPrefAsk: guideIsIngredientPrefAsk,
    guideIsIngredientAsk: guideIsIngredientAsk,
    extractIngredientSearchKeys: extractIngredientSearchKeys,
    assessGuideNeedClarity: assessGuideNeedClarity,
    assessGuideNeedClarityAsync: assessGuideNeedClarityAsync,
    guideIsOutOfScope: guideIsOutOfScope,
    guideHasBeautySignal: guideHasBeautySignal,
    guideIsKefuIntent: guideIsKefuIntent,
    buildGuideOutOfScopeReply: buildGuideOutOfScopeReply,
    buildGuideKefuRedirectReply: buildGuideKefuRedirectReply,
    buildGuideClarifyFromSpgl: buildGuideClarifyFromSpgl,
    filterProductsForGuideCategory: filterProductsForGuideCategory,
    guideIsCompareAsk: guideIsCompareAsk,
    guideWantsIngredientCompare: guideWantsIngredientCompare,
    inferGuideIngredients: inferGuideIngredients,
    buildDetailedProductIngredients: buildDetailedProductIngredients,
    buildIngredientCompareNote: buildIngredientCompareNote,
    collectGuideContext: collectGuideContext,
    collectGuideContextAsync: collectGuideContextAsync,
    matchProductsByReviewQuote: matchProductsByReviewQuote,
    matchProductsByReviewQuoteAsync: matchProductsByReviewQuoteAsync,
    matchGrassToProducts: matchGrassToProducts,
    resolveGrassToProduct: resolveGrassToProduct,
    reviewQuoteScore: reviewQuoteScore,
    normalizeReviewText: normalizeReviewText,
    fetchSpglProducts: fetchSpglProducts,
    fetchZhongcaobiao: fetchZhongcaobiao,
    fetchPinglunbiao: fetchPinglunbiao,
    buildGuideSystemConstraint: buildGuideSystemConstraint,
    buildProductReason: buildProductReason,
    buildRecommendSource: buildRecommendSource,
    getSourceLabel: getSourceLabel,
    TABLE_SOURCE_MAP: TABLE_SOURCE_MAP,
    TABLE_SOURCE_LABELS: TABLE_SOURCE_LABELS,
    GUIDE_RETRIEVABLE: GUIDE_RETRIEVABLE,
    linesOf: linesOf,
    normalize: normalize,
    broadcast: broadcast,
    saveTablesOnly: saveTablesOnly,
    withSyncScope: withSyncScope,
    compressAvatarDataUrl: compressAvatarDataUrl
  };
})(typeof window !== 'undefined' ? window : this);
