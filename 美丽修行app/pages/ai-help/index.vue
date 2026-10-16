<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">AI帮助中心</text>
        <text class="nav-sub">{{ navSub }}</text>
      </view>
      <view class="nav-right" @tap="clearChat">
        <text class="nav-regen">清空</text>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="scroll"
      :style="{ height: scrollHeight }"
      :scroll-into-view="scrollInto"
      :scroll-with-animation="true"
      :show-scrollbar="false"
    >
      <view class="hero">
        <view class="hero-avatar">
          <image v-if="heroAvatar" class="hero-avatar-img" :src="heroAvatar" mode="aspectFill" />
          <text v-else class="hero-avatar-emoji">💡</text>
        </view>
        <view class="hero-text">
          <text class="hero-title">{{ heroTitle }}</text>
          <text class="hero-desc">{{ heroDesc }}</text>
        </view>
      </view>

      <scroll-view scroll-x class="topics-scroll" :show-scrollbar="false">
        <view class="topics">
          <view
            v-for="(t, i) in chips"
            :key="i"
            class="topic"
            :class="{ active: activeChip === i }"
            @tap="askChip(t, i)"
          >
            <text class="topic-text">{{ t.label }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="quick-row">
        <view class="quick-item" @tap="goQuick('ai-guide')">
          <text class="quick-ico">✨</text>
          <text class="quick-label">AI导购</text>
        </view>
        <view class="quick-item" @tap="goQuick('ai-kefu')">
          <text class="quick-ico">💬</text>
          <text class="quick-label">AI客服</text>
        </view>
        <view class="quick-item" @tap="goQuick('skin')">
          <text class="quick-ico">📷</text>
          <text class="quick-label">去测肤</text>
        </view>
        <view class="quick-item" @tap="goQuick('order')">
          <text class="quick-ico">📦</text>
          <text class="quick-label">我的订单</text>
        </view>
      </view>

      <view class="chat-list">
        <view
          v-for="msg in messages"
          :id="'msg-' + msg.id"
          :key="msg.id"
          class="msg-row"
          :class="msg.role"
        >
          <view v-if="msg.role === 'ai'" class="msg-avatar">
            <text>助</text>
          </view>
          <view class="bubble">
            <text class="bubble-text">{{ msg.text }}</text>
            <view v-if="msg.tips && msg.tips.length" class="tip-row">
              <text
                v-for="(tip, ti) in msg.tips"
                :key="ti"
                class="tip-chip"
                @tap="ask(tip)"
              >{{ tip }}</text>
            </view>
          </view>
        </view>

        <view v-if="typing" id="msg-typing" class="msg-row ai">
          <view class="msg-avatar"><text>助</text></view>
          <view class="bubble">
            <text class="bubble-text">正在整理操作说明…</text>
          </view>
        </view>
      </view>

      <view id="msg-bottom" class="bottom-space"></view>
    </scroll-view>

    <view class="composer">
      <view class="composer-inner">
        <input
          class="composer-input"
          v-model="inputText"
          type="text"
          confirm-type="send"
          :placeholder="inputPlaceholder"
          @confirm="send"
        />
        <view class="send-btn" :class="{ disabled: !canSend }" @tap="send">
          <text class="send-text">发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { calcScrollHeightStyle } from '../../common/scroll-layout.js'

const CHAT_KEY = 'yueji_ai_help_chat_v1'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const scrollInto = ref('')
const inputText = ref('')
const typing = ref(false)
const messages = ref([])
const msgSeq = ref(1)
const activeChip = ref(-1)
const heroTitle = ref('你好，我是妆小妍帮助助手')
const heroDesc = ref('有不会用的地方直接问我，或点下方快捷问题')
const heroAvatar = ref('')
const helpName = ref('')
const helpPrompt = ref('')
const helpFallback = ref('暂时无法连上助手，我先按本地说明回答；也可换个问法，或去 AI 客服。')
const helpTemp = ref(0.6)
const helpMaxTokens = ref(900)
const history = ref([])

const DEFAULT_CHIPS = [
  { label: '测肤护肤', ask: '怎么完成一次 AI 测肤？' },
  { label: '订单售后', ask: '下单、查物流和申请售后怎么操作？' },
  { label: 'AI能力', ask: 'AI 导购和 AI 客服分别怎么用？' },
  { label: '会员积分', ask: '积分怎么攒、怎么花？' },
  { label: '社区种草', ask: '发现页怎么浏览和发布种草？' },
  { label: '常用入口', ask: 'App 常用入口有哪些？请简要介绍' }
]

const LOCAL_KB = [
  { tag: '测肤护肤', keys: ['测肤', '肤质', '拍照', '报告', '梳妆台'], title: '如何完成一次 AI 测肤？', body: '测肤会分析正脸肤质并生成报告，可继续生成定制方案。', steps: ['打开底部「测肤」或首页「AI测肤」', '选择测自己 / 帮朋友测', '按引导正脸拍照', '查看肤质报告 → 进入 AI 定制方案'] },
  { tag: '订单售后', keys: ['下单', '购物车', '支付', '物流', '订单'], title: '下单到收货怎么走？', body: '商品详情加购或立即买 → 选券结算 → 支付密码 → 我的订单跟进物流。', steps: ['商品详情加入购物车或立即购买', '购物车勾选商品并选择优惠券', '确认支付并输入密码', '在「我的订单」查看状态与物流'] },
  { tag: '订单售后', keys: ['售后', '退款', '退货'], title: '如何申请售后与查看进度？', body: '符合条件的订单可在订单详情申请退款/售后。', steps: ['打开「我的订单」找到对应订单', '点击申请售后并填写原因', '在订单内查看售后进度时间线'] },
  { tag: 'AI能力', keys: ['导购', '客服', '选品'], title: 'AI 导购 / 客服分别做什么？', body: '导购侧重选品推荐；客服侧重订单、售后与权益问答，必要时可转人工。', steps: ['首页顶栏进入 AI 导购描述需求', '点推荐卡片进商品', '订单问题优先找 AI 客服'] },
  { tag: 'AI能力', keys: ['帮我写', '撰写', '种草文案'], title: '发现页如何用 AI 帮我写？', body: '发布种草/动态/文章时可调用「AI帮我写」。', steps: ['发现页点「+」选择体裁', '点击「AI帮我写」填写框架', '生成后微调并发布'] },
  { tag: '会员积分', keys: ['积分', '签到', '兑换', '商城'], title: '积分怎么攒、怎么花？', body: '首页顶栏进入积分商城，可签到、做任务并兑换奖品。', steps: ['打开积分商城查看余额', '完成每日签到与任务', '在兑换区选择奖品'] },
  { tag: '社区种草', keys: ['发现', '发布', '种草', '动态', '文章'], title: '如何浏览与发布内容？', body: '发现页可看种草/动态/文章；发布后进入对应列表。', steps: ['打开「发现」浏览内容流', '点「+」选择种草/动态/文章', '编辑并发布'] },
  { tag: '入口', keys: ['入口', '怎么用', '不会用', '介绍', '帮助'], title: 'App 常用入口', body: '底部 Tab：首页 / 发现 / 测肤 / 阅己盒 / 我的；顶栏常见：AI导购、积分、消息等。', steps: ['首页：逛商品与活动', '发现：社区内容与发布', '测肤 / 阅己盒：护肤能力', '我的：订单、帮助、设置'] }
]

const chips = ref(DEFAULT_CHIPS.slice())
const navSub = computed(() => (helpName.value ? helpName.value + ' · 使用指引' : '妆小妍 · 使用指引'))
const inputPlaceholder = computed(() =>
  helpName.value ? '向「' + helpName.value + '」提问，如：怎么测肤？' : '描述你不会用的地方，如：怎么测肤？'
)
const canSend = computed(() => !!String(inputText.value || '').trim() && !typing.value)
const defaultTips = () => ['怎么测肤？', '怎么查订单？', '积分怎么用？']

function shortLabel(ask, fallback) {
  const s = String(fallback || ask || '').trim()
  if (/测肤/.test(s)) return '测肤护肤'
  if (/订单|售后|物流|退款/.test(s)) return '订单售后'
  if (/导购|客服|AI/.test(s)) return 'AI能力'
  if (/积分|会员/.test(s)) return '会员积分'
  if (/种草|发现|发布/.test(s)) return '社区种草'
  if (/入口|怎么用|介绍/.test(s)) return '常用入口'
  if (s.length > 8) return s.slice(0, 8) + '…'
  return s || '快捷问'
}

function loadBangzhuCfg() {
  try {
    if (typeof window !== 'undefined' && window.AiConfigStore && typeof window.AiConfigStore.requestSync === 'function') {
      window.AiConfigStore.requestSync()
    }
    if (typeof window !== 'undefined' && window.AiHelpArticlesStore && typeof window.AiHelpArticlesStore.requestSync === 'function') {
      window.AiHelpArticlesStore.requestSync()
    }
    if (typeof window !== 'undefined' && window.AiConfigStore && typeof window.AiConfigStore.getModule === 'function') {
      const m = window.AiConfigStore.getModule('bangzhu') || {}
      const welcome = String(m.welcome || '').trim()
      const lines = welcome ? welcome.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : []
      heroTitle.value = lines[0] || (m.name ? '你好，我是' + m.name : '你好，我是妆小妍帮助助手')
      heroDesc.value = lines[1] || '有不会用的地方直接问我，或点下方快捷问题'
      helpName.value = m.name ? String(m.name) : ''
      heroAvatar.value = m.avatar ? String(m.avatar).trim() : ''
      if (m.prompt) helpPrompt.value = String(m.prompt)
      if (m.fallback) helpFallback.value = String(m.fallback)
      const t = Number(m.temp)
      if (!Number.isNaN(t)) helpTemp.value = t
      const mt = Number(m.maxTokens)
      if (!Number.isNaN(mt) && mt > 0) helpMaxTokens.value = mt

      const legacyMap = {
        全部: 'App 常用入口有哪些？请简要介绍',
        全部场景: 'App 常用入口有哪些？请简要介绍',
        测肤护肤: '怎么完成一次 AI 测肤？',
        订单售后: '下单、查物流和申请售后怎么操作？',
        AI能力: 'AI 导购和 AI 客服分别怎么用？',
        会员积分: '积分怎么攒、怎么花？',
        社区种草: '发现页怎么浏览和发布种草？'
      }
      const linesQ = String(m.quick || '')
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (linesQ.length) {
        chips.value = linesQ.map((line) => {
          const ask = legacyMap[line] || line
          let label = legacyMap[line] ? line : shortLabel(ask, line)
          if (line === '全部' || line === '全部场景') label = '常用入口'
          return { label, ask }
        })
      } else {
        chips.value = DEFAULT_CHIPS.slice()
      }
    }
  } catch (e) {}
}

function formatArticle(art) {
  if (!art) return ''
  const lines = []
  if (art.title) lines.push(art.title)
  if (art.body) lines.push(String(art.body))
  const steps = art.steps || []
  if (steps.length) {
    lines.push('')
    steps.forEach((s, i) => lines.push(i + 1 + '. ' + s))
  }
  return lines.join('\n')
}

function scoreHit(q, art) {
  let s = 0
  const text = String(q || '').toLowerCase()
  if (!text) return 0
  const pool = [art.title || '', art.body || '', art.tag || '', (art.steps || []).join(' ')].join(' ').toLowerCase()
  ;(art.keys || []).forEach((k) => {
    if (text.indexOf(String(k).toLowerCase()) >= 0) s += 3
  })
  text.replace(/[？?！!，,。.\s]+/g, ' ').split(' ').forEach((tok) => {
    if (tok.length >= 2 && pool.indexOf(tok) >= 0) s += 1
  })
  if (art.tag && text.indexOf(String(art.tag).toLowerCase()) >= 0) s += 2
  return s
}

function collectKb() {
  const list = []
  try {
    if (typeof window !== 'undefined' && window.AiHelpArticlesStore && typeof window.AiHelpArticlesStore.loadEnabled === 'function') {
      window.AiHelpArticlesStore.loadEnabled().forEach((x) => {
        list.push({
          tag: x.tag,
          title: x.title,
          body: x.body,
          steps: x.steps || [],
          keys: [x.tag, x.title].concat(x.steps || [])
        })
      })
    }
  } catch (e) {}
  return list.concat(LOCAL_KB)
}

function matchLocal(q) {
  const arts = collectKb()
  let best = null
  let bestScore = 0
  arts.forEach((art) => {
    const sc = scoreHit(q, art)
    if (sc > bestScore) {
      bestScore = sc
      best = art
    }
  })
  if (best && bestScore >= 2) {
    return { text: formatArticle(best), tips: defaultTips() }
  }
  return null
}

function buildKbContext(q) {
  const scored = collectKb()
    .map((art) => ({ art, sc: scoreHit(q, art) }))
    .filter((x) => x.sc >= 1)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 3)
  if (!scored.length) return ''
  return ['【可参考的运营/本地帮助条目】']
    .concat(scored.map((x) => formatArticle(x.art) + '\n---'))
    .join('\n')
}

function saveChat() {
  try {
    uni.setStorageSync(CHAT_KEY, history.value.slice(-40))
  } catch (e) {}
}

function loadChat() {
  try {
    const raw = uni.getStorageSync(CHAT_KEY)
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(list) ? list : []
  } catch (e) {
    return []
  }
}

function nextId() {
  msgSeq.value += 1
  return msgSeq.value
}

async function scrollToBottom() {
  await nextTick()
  scrollInto.value = ''
  await nextTick()
  scrollInto.value = 'msg-bottom'
}

function pushMsg(role, text, tips) {
  messages.value.push({
    id: nextId(),
    role,
    text: String(text || ''),
    tips: tips || []
  })
  scrollToBottom()
}

function clearChat() {
  history.value = []
  messages.value = []
  activeChip.value = -1
  try {
    uni.removeStorageSync(CHAT_KEY)
  } catch (e) {}
  const text = heroTitle.value + '\n' + heroDesc.value
  pushMsg('ai', text, defaultTips())
}

function hydrate() {
  const hist = loadChat()
  history.value = []
  messages.value = []
  if (!hist.length) {
    clearChat()
    return
  }
  hist.forEach((m) => {
    if (!m || !m.content) return
    if (m.role === 'user') {
      pushMsg('user', m.content)
      history.value.push({ role: 'user', content: m.content })
    } else {
      pushMsg('ai', m.content)
      history.value.push({ role: 'assistant', content: m.content })
    }
  })
  if (!messages.value.length) clearChat()
}

function buildLlmMessages(q) {
  let system = String(helpPrompt.value || '').trim()
  if (!system || /只输出 JSON 数组|JSON 数组/.test(system)) {
    system =
      '你是「美丽修行」（阅己美妆）App 的帮助中心对话助手。用简洁步骤回答「怎么用 App」，不要输出 JSON。只使用真实入口名；选品引导 AI 导购，售后引导 AI 客服。'
  }
  const kb = buildKbContext(q)
  if (kb) system += '\n\n' + kb
  const msgs = [{ role: 'system', content: system }]
  history.value.forEach((m) => msgs.push(m))
  msgs.push({ role: 'user', content: q })
  return msgs
}

function askChip(t, i) {
  activeChip.value = i
  ask(t.ask)
}

function ask(text) {
  inputText.value = String(text || '')
  send()
}

function send() {
  const q = String(inputText.value || '').trim()
  if (!q || typing.value) return
  inputText.value = ''
  pushMsg('user', q)
  typing.value = true
  scrollToBottom()
  loadBangzhuCfg()

  const localHit = matchLocal(q)
  const llm = typeof window !== 'undefined' ? window.LlmChat : null
  const llmCfg = llm && llm.getChatConfig ? llm.getChatConfig() : null
  const useLlm = !!(llm && llm.chat && llmCfg && llmCfg.enabled && llmCfg.apiKey && llmCfg.apiUrl)

  function finish(text, tips) {
    typing.value = false
    const out = String(text || helpFallback.value || '暂时无法回答，请稍后重试。')
    pushMsg('ai', out, tips || defaultTips())
    history.value.push({ role: 'user', content: q })
    history.value.push({ role: 'assistant', content: out })
    if (history.value.length > 24) history.value = history.value.slice(-24)
    saveChat()
  }

  if (!useLlm) {
    setTimeout(() => {
      finish(
        (localHit && localHit.text) ||
          helpFallback.value ||
          '我可以帮你说明：测肤、下单售后、AI 导购/客服、积分、发现发布等。请换个更具体的问题试试。',
        (localHit && localHit.tips) || defaultTips()
      )
    }, 220)
    return
  }

  Promise.resolve(llm.chat(buildLlmMessages(q), { temperature: helpTemp.value, maxTokens: helpMaxTokens.value }))
    .then((r) => {
      let textOut = r && r.text ? String(r.text).trim() : ''
      if (textOut && /^\s*\[/.test(textOut)) {
        try {
          const arr = JSON.parse(textOut.match(/\[[\s\S]*\]/)[0])
          if (Array.isArray(arr) && arr.length) {
            textOut = arr
              .map((it, idx) =>
                formatArticle({
                  title: (it && (it.title || it.tag)) || '说明' + (idx + 1),
                  body: (it && (it.body || it.content)) || '',
                  steps: (it && it.steps) || []
                })
              )
              .join('\n\n')
          }
        } catch (e) {}
      }
      if (textOut) finish(textOut, defaultTips())
      else finish((localHit && localHit.text) || helpFallback.value, defaultTips())
    })
    .catch(() => {
      finish((localHit && localHit.text) || helpFallback.value, defaultTips())
    })
}

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/profile/index' }) })
}

function goQuick(key) {
  if (key === 'ai-guide') uni.navigateTo({ url: '/pages/ai-guide/index' })
  else if (key === 'ai-kefu') uni.navigateTo({ url: '/pages/ai-kefu/index' })
  else if (key === 'skin') uni.switchTab({ url: '/pages/skin-test/index' })
  else if (key === 'order') uni.navigateTo({ url: '/pages/order/index' })
}

onLoad(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
  } catch (e) {}
  scrollHeight.value = calcScrollHeightStyle(88 + statusBarHeight.value + 112)
})

onMounted(() => {
  loadBangzhuCfg()
  hydrate()
})
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f3ff 0%, #ffffff 42%, #fce8f3 100%);
}

.status-bar {
  background: transparent;
  flex-shrink: 0;
}

.nav-bar {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  flex-shrink: 0;
}

.nav-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-back {
  font-size: 56rpx;
  color: #111;
  line-height: 1;
}

.nav-center {
  flex: 1;
  min-width: 0;
  text-align: center;
  padding: 0 8rpx;
}

.nav-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #111;
}

.nav-sub {
  display: block;
  font-size: 20rpx;
  color: #888;
  margin-top: 4rpx;
}

.nav-right {
  min-width: 112rpx;
  text-align: right;
  flex-shrink: 0;
}

.nav-regen {
  font-size: 24rpx;
  color: #6d5bd0;
  font-weight: 600;
}

.scroll {
  flex: 1;
  min-height: 0;
  padding: 8rpx 28rpx 0;
  box-sizing: border-box;
}

.hero {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(138, 99, 242, 0.14), rgba(244, 114, 182, 0.12));
  margin-bottom: 20rpx;
}

.hero-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 28rpx;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 24rpx rgba(138, 99, 242, 0.16);
}

.hero-avatar-img {
  width: 100%;
  height: 100%;
}

.hero-avatar-emoji {
  font-size: 40rpx;
}

.hero-text {
  flex: 1;
  min-width: 0;
}

.hero-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #111;
}

.hero-desc {
  display: block;
  font-size: 22rpx;
  color: #888;
  line-height: 1.45;
  margin-top: 8rpx;
}

.topics-scroll {
  width: 100%;
  white-space: nowrap;
  margin-bottom: 20rpx;
}

.topics {
  display: inline-flex;
  gap: 12rpx;
}

.topic {
  display: inline-flex;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(138, 99, 242, 0.12);
  flex-shrink: 0;
}

.topic.active {
  background: linear-gradient(115deg, #8a63f2 0%, #f472b6 100%);
  border-color: transparent;
}

.topic-text {
  font-size: 22rpx;
  color: #6d5bd0;
  font-weight: 600;
}

.topic.active .topic-text {
  color: #fff;
}

.quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 20rpx;
}

.quick-item {
  flex: 1 1 0;
  min-width: 140rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx 8rpx;
  text-align: center;
  border: 1rpx solid rgba(138, 99, 242, 0.1);
  box-shadow: 0 8rpx 28rpx rgba(138, 99, 242, 0.06);
  box-sizing: border-box;
}

.quick-ico {
  display: block;
  font-size: 34rpx;
  margin-bottom: 8rpx;
}

.quick-label {
  display: block;
  font-size: 22rpx;
  color: #555;
  font-weight: 600;
}

.chat-list {
  padding-bottom: 8rpx;
}

.msg-row {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
}

.msg-row.user {
  justify-content: flex-end;
}

.msg-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #8a63f2, #f472b6);
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.bubble {
  max-width: 78%;
  padding: 20rpx 22rpx;
  border-radius: 8rpx 24rpx 24rpx 24rpx;
  background: #fff;
  box-shadow: 0 8rpx 28rpx rgba(138, 99, 242, 0.08);
}

.msg-row.user .bubble {
  border-radius: 24rpx 8rpx 24rpx 24rpx;
  background: linear-gradient(135deg, #8a63f2, #a78bfa);
}

.bubble-text {
  font-size: 26rpx;
  color: #333;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}

.msg-row.user .bubble-text {
  color: #fff;
}

.tip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.tip-chip {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #f7f3ff;
  color: #6d5bd0;
  font-size: 22rpx;
  font-weight: 600;
}

.composer {
  flex-shrink: 0;
  padding: 12rpx 20rpx calc(12rpx + env(safe-area-inset-bottom));
}

.composer-inner {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f7f3ff;
  border-radius: 999rpx;
  padding: 8rpx 8rpx 8rpx 28rpx;
}

.composer-input {
  flex: 1;
  min-width: 0;
  height: 68rpx;
  font-size: 26rpx;
  color: #111;
}

.send-btn {
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
}

.send-btn.disabled {
  opacity: 0.45;
}

.send-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 700;
}

.bottom-space {
  height: 24rpx;
}

@media screen and (max-width: 360px) {
  .quick-item {
    flex: 1 1 calc(50% - 8rpx);
    max-width: calc(50% - 8rpx);
  }
}
</style>
