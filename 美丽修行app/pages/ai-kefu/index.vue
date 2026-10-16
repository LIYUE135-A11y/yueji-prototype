<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">{{ cfgName }}</text>
        <text class="nav-sub">7×24 · 订单物流售后咨询</text>
      </view>
      <view class="nav-btn right" @tap="() => clearChat(true)" @click="() => clearChat(true)">
        <text class="nav-clear">清空</text>
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
        <view class="hero-avatar"><text class="hero-emoji">💬</text></view>
        <view class="hero-copy">
          <text class="hero-title">{{ cfgName }}</text>
          <text class="hero-desc">{{ welcome }}</text>
        </view>
      </view>

      <view class="scene-row">
        <view
          v-for="(s, i) in quickList"
          :key="i"
          class="scene-chip"
          @tap="ask(s)"
          @click="ask(s)"
        >
          <text class="scene-text">{{ s }}</text>
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
          <view v-if="msg.role === 'ai'" class="msg-avatar"><text>客</text></view>
          <view class="bubble">
            <text class="bubble-text">{{ msg.text }}</text>
            <view v-if="msg.products && msg.products.length" class="prod-cards">
              <view
                v-for="(p, pi) in msg.products"
                :key="'pd-' + msg.id + '-' + pi"
                class="prod-card"
              >
                <view class="prod-top">
                  <image v-if="p.img" class="prod-img" :src="p.img" mode="aspectFill" />
                  <view v-else class="prod-img-ph"><text>暂无图</text></view>
                  <view class="prod-meta">
                    <text class="prod-name">{{ p.title || p.name || '商品' }}</text>
                    <text class="prod-sub">{{ p.sub || '' }}</text>
                    <text v-if="p.price != null && p.price !== ''" class="prod-price">¥{{ p.price }}</text>
                  </view>
                </view>
                <view v-if="shortIngredients(p)" class="prod-ing">
                  <text class="prod-ing-b">关键成分</text>
                  <text class="prod-ing-t"> · {{ shortIngredients(p) }}</text>
                </view>
              </view>
            </view>
            <view v-if="msg.aftersales && msg.aftersales.length" class="af-cards">
              <view
                v-for="(af, ai) in msg.aftersales"
                :key="'af-' + msg.id + '-' + ai"
                class="af-card"
              >
                <view class="af-head">
                  <text class="af-no">售后单 {{ af.id || af.aftersaleId || '—' }}</text>
                  <text class="af-status">{{ af.status || '处理中' }}</text>
                </view>
                <view class="af-body">
                  <image v-if="af.img" class="af-img" :src="af.img" mode="aspectFill" />
                  <view v-else class="af-img-ph"><text>暂无图</text></view>
                  <view class="af-meta">
                    <text class="af-title">{{ af.prodName || '商品' }}</text>
                    <text class="af-sub">{{ afSubLine(af) }}</text>
                    <view class="af-row">
                      <text class="af-type">{{ af.afterType || '售后' }}</text>
                      <text v-if="Number(af.amount) > 0" class="af-amount">¥{{ fmtMoney(af.amount) }}</text>
                    </view>
                  </view>
                </view>
                <view v-if="af.remark" class="af-remark">
                  <text>{{ shortRemark(af.remark) }}</text>
                </view>
                <view class="af-foot">
                  <text>关联订单 {{ af.orderId || '—' }}</text>
                  <text>处理人 {{ af.handler || '待分配' }}</text>
                </view>
              </view>
            </view>
            <view v-if="msg.orders && msg.orders.length" class="order-cards">
              <view
                v-for="(od, oi) in msg.orders"
                :key="'od-' + msg.id + '-' + oi"
                class="order-card"
                @tap="ask('查询订单 ' + (od.id || od.orderNo || ''))"
                @click="ask('查询订单 ' + (od.id || od.orderNo || ''))"
              >
                <view class="order-head">
                  <text class="order-no">订单号 {{ od.orderNo || od.id || '—' }}</text>
                  <text class="order-status">{{ od.status || '处理中' }}</text>
                </view>
                <view
                  v-for="(it, ii) in (od.items || [])"
                  :key="'it-' + oi + '-' + ii"
                  class="order-item"
                >
                  <image v-if="it.img" class="order-img" :src="it.img" mode="aspectFill" />
                  <view v-else class="order-img-ph"><text>暂无图</text></view>
                  <view class="order-body">
                    <text class="order-title">{{ it.title || '商品' }}</text>
                    <text class="order-spec">规格：{{ it.spec || '—' }}</text>
                    <view class="order-meta">
                      <text class="order-price">¥{{ fmtMoney(it.price) }}</text>
                      <text class="order-qty">×{{ it.quantity || 1 }}</text>
                    </view>
                    <text class="order-line">小计 ¥{{ fmtMoney(it.lineTotal != null ? it.lineTotal : (Number(it.price)||0)*(Number(it.quantity)||1)) }}</text>
                  </view>
                </view>
                <view class="order-foot">
                  <text class="order-foot-l">{{ msg.pickable ? '点击发送此订单' : ('共 ' + ((od.items && od.items.length) || 0) + ' 种商品') }}</text>
                  <text class="order-total">合计 <text class="order-total-em">¥{{ fmtMoney(od.payAmount != null ? od.payAmount : od.totalPrice) }}</text></text>
                </view>
              </view>
            </view>
            <view v-if="msg.tips && msg.tips.length" class="tip-row">
              <text
                v-for="(t, ti) in msg.tips"
                :key="ti"
                class="tip-chip"
                @tap="ask(t)"
                @click="ask(t)"
              >{{ t }}</text>
            </view>
          </view>
        </view>
        <view v-if="typing" id="msg-typing" class="msg-row ai">
          <view class="msg-avatar"><text>客</text></view>
          <view class="bubble typing-bubble">
            <view class="dot"></view><view class="dot"></view><view class="dot"></view>
          </view>
        </view>
      </view>
      <view id="msg-bottom" class="scroll-pad"></view>
    </scroll-view>

    <view class="composer">
      <view class="tag-row" v-if="tagList.length">
        <text
          v-for="(t, i) in tagList"
          :key="'tag-' + i"
          class="foot-tag"
          @tap="ask(t)"
          @click="ask(t)"
        >{{ t }}</text>
      </view>
      <view class="composer-inner">
        <input
          class="composer-input"
          v-model="inputText"
          type="text"
          confirm-type="send"
          placeholder="描述问题，如：查物流 / 怎么退款"
          @confirm="send"
        />
        <view class="send-btn" :class="{ disabled: !canSend }" @tap="send" @click="send">
          <text class="send-text">发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const inputText = ref('')
const typing = ref(false)
const scrollInto = ref('')
const msgSeq = ref(1)
const messages = ref([])
const history = ref([])

const cfgName = ref('AI智能客服')
const welcome = ref('你好！我是智能客服小助手，很高兴为您服务！')
const fallback = ref('感谢您的咨询，客服正在为您查询，请稍候。')
const systemPrompt = ref('你是美妆电商平台的 AI 智能客服，负责解答订单、物流、售后、优惠券与会员问题，语气耐心专业。用简洁中文；不要编造未提供的订单号；深度选购请引导用户使用 AI 导购。')
const quickList = ref(['查询订单物流', '如何申请退款', '优惠券怎么用', '会员折扣说明'])
const baseTagList = ref(['发送订单', '查看物流', '常见问题'])
const tagList = ref(['发送订单', '查看物流', '常见问题'])
const askCounts = ref({})
const showHumanTag = ref(false)

const canSend = computed(() => !!String(inputText.value || '').trim() && !typing.value)

function isHumanTag(t) {
  return /转人工|人工客服|联系人工/.test(String(t || ''))
}

function stripHumanTags(list) {
  return (list || []).filter((t) => !isHumanTag(t))
}

function refreshTagList() {
  const base = stripHumanTags(baseTagList.value).slice(0, 5)
  tagList.value = showHumanTag.value ? ['转人工客服', ...base] : base
}

function normalizeAsk(s) {
  return String(s || '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, '')
    .replace(/[？?！!。.，,、：:；;…·\-—_（）()【】\[\]“”"']/g, '')
    .toLowerCase()
}

function loadCfg() {
  try {
    if (typeof window !== 'undefined' && window.AiConfigStore && typeof window.AiConfigStore.getModule === 'function') {
      const m = window.AiConfigStore.getModule('kefu') || {}
      if (m.name) cfgName.value = m.name
      if (m.welcome) welcome.value = m.welcome
      if (m.fallback) fallback.value = m.fallback
      if (m.prompt) systemPrompt.value = m.prompt
      if (m.quickList && m.quickList.length) quickList.value = stripHumanTags(m.quickList).slice(0, 8)
      else if (m.quick && window.AiConfigStore.linesOf) quickList.value = stripHumanTags(window.AiConfigStore.linesOf(m.quick)).slice(0, 8)
      let tags = []
      if (m.tagList && m.tagList.length) tags = m.tagList.slice(0, 6)
      else if (m.tags && window.AiConfigStore.linesOf) tags = window.AiConfigStore.linesOf(m.tags).slice(0, 6)
      if (tags.length) baseTagList.value = stripHumanTags(tags)
      refreshTagList()
    }
  } catch (e) {}
}

const sessionId = ref('')

function ensureStoreSession(forceNew) {
  try {
    if (typeof window === 'undefined' || !window.KefuStore || !window.KefuStore.ensureSession) return
    const ses = window.KefuStore.ensureSession({
      userId: 'U20240076',
      userName: '野稗子',
      agent: cfgName.value || 'AI牛牛',
      type: 'AI智能客服',
      forceNew: !!forceNew
    })
    if (ses && ses.id) sessionId.value = ses.id
  } catch (e) {}
}

function syncMsg(role, text, extra) {
  try {
    if (typeof window === 'undefined' || !window.KefuStore || !sessionId.value) return
    window.KefuStore.appendMessage(sessionId.value, role, text, extra || {})
  } catch (e) {}
}

function goBack() {
  uni.navigateBack({ fail() { uni.switchTab({ url: '/pages/home/index' }) } })
}

function clearChat(forceNew) {
  messages.value = []
  history.value = []
  askCounts.value = {}
  showHumanTag.value = false
  refreshTagList()
  ensureStoreSession(forceNew !== false)
  pushAi(welcome.value, quickList.value.slice(0, 4))
  syncMsg('assistant', welcome.value, { source: 'welcome', status: '接待中' })
}

function pushUser(text) {
  messages.value.push({ id: msgSeq.value++, role: 'user', text })
  scrollToBottom()
}

function pushAi(text, tips, extra) {
  extra = extra || {}
  messages.value.push({
    id: msgSeq.value++,
    role: 'ai',
    text,
    tips: tips || [],
    orders: extra.orders || (extra.order ? [extra.order] : []),
    products: extra.products || [],
    aftersales: extra.aftersales || (extra.aftersale ? [extra.aftersale] : []),
    highlightIngredients: !!(extra.highlightIngredients || extra.ingredientFocus),
    pickable: !!extra.pickable
  })
  scrollToBottom()
}

function fmtMoney(n) {
  const v = Number(n)
  return isNaN(v) ? '0.00' : v.toFixed(2)
}

function shortIngredients(p) {
  if (!p) return ''
  let ing = String(p.ingredients || '')
  if (!ing) return ''
  ing = ing.replace(/（示意成分[^）]*）/g, '')
  const parts = ing.split(/[、,，]/)
  const short = []
  for (let i = 0; i < parts.length && short.length < 4; i++) {
    const t = String(parts[i] || '').trim()
    if (t && t.indexOf('详见') < 0) short.push(t)
  }
  return short.length ? short.join(' · ') : ''
}

function afSubLine(af) {
  const bits = []
  if (af && af.prodSpec) bits.push(af.prodSpec)
  if (af && af.reason) bits.push('原因：' + af.reason)
  return bits.length ? bits.join(' · ') : '—'
}

function shortRemark(text) {
  const s = String(text || '')
  return s.length > 120 ? (s.slice(0, 120) + '…') : s
}

function scrollToBottom() {
  nextTick(() => { scrollInto.value = 'msg-bottom' })
}

function ask(text) {
  inputText.value = String(text || '')
  send()
}

function send() {
  const q = String(inputText.value || '').trim()
  if (!q || typing.value) return
  if (!sessionId.value) ensureStoreSession(false)
  inputText.value = ''
  pushUser(q)
  history.value.push({ role: 'user', content: q })
  syncMsg('user', q, { source: 'app' })
  typing.value = true
  scrollToBottom()

  /* 主动点「转人工」可立即转；同一问题问满 2 次才露出底部转人工按钮 */
  if (/转人工|人工客服|联系人工|转接人工/.test(q)) {
    typing.value = false
    const human = '已为你登记转人工客服。工作时间客服将尽快接入；也可先说明订单号，方便人工更快处理。'
    history.value.push({ role: 'assistant', content: human })
    pushAi(human, [])
    syncMsg('assistant', human, { source: 'human', type: '转人工', status: '待接入', agent: '未分配' })
    return
  }
  const askKey = normalizeAsk(q)
  if (askKey) {
    askCounts.value[askKey] = (askCounts.value[askKey] || 0) + 1
    if (askCounts.value[askKey] >= 2 && !showHumanTag.value) {
      showHumanTag.value = true
      refreshTagList()
      typing.value = false
      const tip = '这个问题我已回答过多次。若仍未解决，可点下方「转人工客服」。'
      history.value.push({ role: 'assistant', content: tip })
      pushAi(tip, ['转人工客服', ...quickList.value.slice(0, 3)])
      syncMsg('assistant', tip, { source: 'human-offer' })
      return
    }
  }

  function proceedAfterDbRefresh() {
    typing.value = false
    let knowledge = null
    try {
      if (typeof window !== 'undefined' && window.KefuStore && window.KefuStore.answerFromKnowledge) {
        knowledge = window.KefuStore.answerFromKnowledge(q)
      }
    } catch (e) {}
    if (knowledge && (knowledge.text
        || (knowledge.products && knowledge.products.length)
        || (knowledge.orders && knowledge.orders.length)
        || (knowledge.aftersales && knowledge.aftersales.length))) {
      const replyText = knowledge.text
        || (knowledge.aftersales && knowledge.aftersales.length
          ? '已为你查到相关售后进度：'
          : (knowledge.orders && knowledge.orders.length
            ? '以下为你在「我的订单」中的相关订单：'
            : '以下为相关商品，点卡片可看详情与关键成分。'))
      history.value.push({ role: 'assistant', content: replyText })
      pushAi(replyText, quickList.value.slice(0, 4), {
        order: knowledge.order,
        orders: knowledge.orders || [],
        products: knowledge.products || [],
        aftersale: knowledge.aftersale,
        aftersales: knowledge.aftersales || [],
        highlightIngredients: !!knowledge.highlightIngredients,
        pickable: !!knowledge.pickable
      })
      syncMsg('assistant', replyText, {
        source: knowledge.pickable ? 'order-pick' : 'knowledge',
        orderId: knowledge.orderId,
        type: knowledge.type,
        status: knowledge.status,
        agent: knowledge.agent,
        order: knowledge.order,
        orders: knowledge.orders || [],
        products: knowledge.products || [],
        aftersale: knowledge.aftersale,
        aftersales: knowledge.aftersales || [],
        highlightIngredients: !!knowledge.highlightIngredients
      })
      return
    }

    /* 兜底：模糊品类/成分优先商品卡 */
    try {
      if (typeof window !== 'undefined' && window.KefuStore
          && typeof window.KefuStore.isVagueProductCardAsk === 'function'
          && window.KefuStore.isVagueProductCardAsk(q)
          && typeof window.KefuStore.pickProductCardsForKefu === 'function') {
        const vagueCards = window.KefuStore.pickProductCardsForKefu(q, null, 3) || []
        if (vagueCards.length) {
          const tip = '目前可查询到以下相关商品（优先以卡片展示）。点卡片可看详情与关键成分。'
          history.value.push({ role: 'assistant', content: tip })
          pushAi(tip, quickList.value.slice(0, 4), {
            products: vagueCards,
            highlightIngredients: true
          })
          syncMsg('assistant', tip, {
            source: 'product-cards',
            products: vagueCards,
            highlightIngredients: true
          })
          return
        }
      }
    } catch (e) {}

    typing.value = true
    scrollToBottom()

    const llm = (typeof window !== 'undefined' && window.LlmChat) ? window.LlmChat : null
    const llmCfg = llm && llm.getChatConfig ? llm.getChatConfig() : null
    const canLlm = !!(llmCfg && llmCfg.enabled && llmCfg.apiKey && llmCfg.apiUrl && llm && llm.chat)

    if (!canLlm) {
      typing.value = false
      const fb = fallback.value || '请先在运营端配置通用大模型后再试。'
      history.value.push({ role: 'assistant', content: fb })
      pushAi(fb, quickList.value.slice(0, 4))
      syncMsg('assistant', fb, { source: 'fallback' })
      return
    }

    const msgs = [{ role: 'system', content: systemPrompt.value }]
      .concat(history.value.slice(-20))

    llm.chat(msgs, {}).then((r) => {
      typing.value = false
      const reply = (r && r.text) ? String(r.text) : fallback.value
      history.value.push({ role: 'assistant', content: reply })
      if (history.value.length > 24) history.value = history.value.slice(-24)
      pushAi(reply, quickList.value.slice(0, 4))
      syncMsg('assistant', reply, { source: 'llm' })
    }).catch((err) => {
      typing.value = false
      const errText = (fallback.value || '客服暂时繁忙') + '\n（' + ((err && err.message) || '请稍后重试') + '）'
      pushAi(errText, quickList.value.slice(0, 4))
      syncMsg('assistant', errText, { source: 'llm-error' })
    })
  }

  /* 每次回答前实时重载数据库 */
  try {
    if (typeof window !== 'undefined' && window.KefuStore && typeof window.KefuStore.refreshLive === 'function') {
      window.KefuStore.refreshLive(function () { proceedAfterDbRefresh() }, 2500)
      return
    }
    if (typeof window !== 'undefined' && window.KefuStore && window.KefuStore.pullKnowledgeFromApi) {
      window.KefuStore.pullKnowledgeFromApi(false)
    }
  } catch (e) {}
  proceedAfterDbRefresh()
}

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const h = (info.windowHeight || 667) - statusBarHeight.value - 52 - 64
    scrollHeight.value = h + 'px'
  } catch (e) {}
  loadCfg()
  clearChat(false)
})
</script>

<style lang="scss" scoped>
$primary: #6366F1;
$page-bg: #F5F7FF;

.page {
  min-height: 100vh;
  background: $page-bg;
  display: flex;
  flex-direction: column;
}
.status-bar { background: #fff; }
.nav-bar {
  height: 96rpx;
  padding: 0 24rpx;
  background: #fff;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid rgba(99, 102, 241, 0.12);
}
.nav-btn { width: 80rpx; }
.nav-btn.right { text-align: right; }
.nav-back { font-size: 48rpx; color: #333; line-height: 1; }
.nav-clear { font-size: 26rpx; color: $primary; }
.nav-center { flex: 1; text-align: center; }
.nav-title { display: block; font-size: 32rpx; font-weight: 700; color: #111; }
.nav-sub { display: block; font-size: 20rpx; color: #888; margin-top: 4rpx; }

.scroll { background: $page-bg; }
.hero {
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #EEF2FF, #E0E7FF);
  display: flex;
  gap: 20rpx;
  align-items: center;
}
.hero-avatar {
  width: 88rpx; height: 88rpx; border-radius: 50%;
  background: #fff; display: flex; align-items: center; justify-content: center;
}
.hero-emoji { font-size: 40rpx; }
.hero-title { display: block; font-size: 30rpx; font-weight: 700; color: #111; }
.hero-desc { display: block; font-size: 22rpx; color: #666; margin-top: 8rpx; line-height: 1.4; }

.scene-row {
  padding: 0 24rpx 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.scene-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #fff;
  border: 1rpx solid rgba(99, 102, 241, 0.2);
}
.scene-text { font-size: 22rpx; color: #4338CA; }

.chat-list { padding: 8rpx 24rpx 24rpx; }
.msg-row { display: flex; margin-bottom: 20rpx; }
.msg-row.user { justify-content: flex-end; }
.msg-avatar {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: $primary; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; margin-right: 12rpx; flex-shrink: 0;
}
.bubble {
  max-width: 75%;
  padding: 18rpx 22rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(79, 70, 229, 0.06);
}
.msg-row.user .bubble {
  background: linear-gradient(135deg, #818CF8, #6366F1);
}
.msg-row.user .bubble-text { color: #fff; }
.bubble-text { font-size: 26rpx; color: #222; line-height: 1.5; white-space: pre-wrap; }
.prod-cards { margin-top: 16rpx; }
.prod-card {
  padding: 16rpx;
  border-radius: 16rpx;
  background: #F5F3FF;
  border: 1rpx solid rgba(99, 102, 241, 0.14);
}
.prod-card + .prod-card { margin-top: 14rpx; }
.prod-top { display: flex; gap: 16rpx; }
.prod-img, .prod-img-ph {
  width: 120rpx; height: 120rpx; border-radius: 12rpx; flex-shrink: 0;
  background: #EDE9FE;
}
.prod-img-ph {
  display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; color: #A5B4FC;
}
.prod-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6rpx; }
.prod-name {
  font-size: 26rpx; font-weight: 700; color: #111; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.prod-sub { font-size: 22rpx; color: #888; }
.prod-price { font-size: 28rpx; font-weight: 700; color: #FF4757; margin-top: 4rpx; }
.prod-ing {
  margin-top: 12rpx; padding-top: 12rpx;
  border-top: 1rpx dashed rgba(99, 102, 241, 0.12);
  font-size: 22rpx; color: #4B5563; line-height: 1.45;
}
.prod-ing-b { font-weight: 700; color: #6366F1; }
.prod-ing-t { color: #6B7280; }
.af-cards { margin-top: 16rpx; }
.af-card {
  padding: 16rpx;
  border-radius: 16rpx;
  background: #F5F3FF;
  border: 1rpx solid rgba(99, 102, 241, 0.14);
}
.af-card + .af-card { margin-top: 14rpx; }
.af-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12rpx;
  padding-bottom: 12rpx; margin-bottom: 12rpx;
  border-bottom: 1rpx solid rgba(99, 102, 241, 0.1);
}
.af-no { font-size: 22rpx; color: #6B7280; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.af-status { font-size: 22rpx; font-weight: 600; color: #6366F1; flex-shrink: 0; }
.af-body { display: flex; gap: 16rpx; }
.af-img, .af-img-ph {
  width: 112rpx; height: 112rpx; border-radius: 12rpx; flex-shrink: 0;
  background: #EDE9FE;
}
.af-img-ph {
  display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; color: #A5B4FC;
}
.af-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4rpx; }
.af-title {
  font-size: 26rpx; font-weight: 700; color: #111; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.af-sub { font-size: 22rpx; color: #888; }
.af-row { display: flex; align-items: baseline; justify-content: space-between; margin-top: 4rpx; }
.af-type { font-size: 22rpx; font-weight: 600; color: #6366F1; }
.af-amount { font-size: 28rpx; font-weight: 700; color: #FF4757; }
.af-remark {
  margin-top: 12rpx; padding-top: 12rpx;
  border-top: 1rpx dashed rgba(99, 102, 241, 0.12);
  font-size: 22rpx; color: #4B5563; line-height: 1.45;
}
.af-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12rpx;
  margin-top: 14rpx; padding-top: 12rpx;
  border-top: 1rpx solid rgba(99, 102, 241, 0.1);
  font-size: 22rpx; color: #6B7280;
}
.order-cards { margin-top: 16rpx; }
.order-card {
  padding: 16rpx;
  border-radius: 16rpx;
  background: #F5F3FF;
  border: 1rpx solid rgba(99, 102, 241, 0.14);
}
.order-card + .order-card { margin-top: 14rpx; }
.order-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12rpx;
  padding-bottom: 12rpx; margin-bottom: 12rpx;
  border-bottom: 1rpx solid rgba(99, 102, 241, 0.1);
}
.order-no { font-size: 22rpx; color: #6B7280; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.order-status { font-size: 22rpx; font-weight: 600; color: #6366F1; flex-shrink: 0; }
.order-item { display: flex; gap: 16rpx; }
.order-item + .order-item {
  margin-top: 14rpx; padding-top: 14rpx;
  border-top: 1rpx dashed rgba(99, 102, 241, 0.12);
}
.order-img, .order-img-ph {
  width: 112rpx; height: 112rpx; border-radius: 12rpx; flex-shrink: 0;
  background: #EDE9FE;
}
.order-img-ph {
  display: flex; align-items: center; justify-content: center;
  font-size: 20rpx; color: #A5B4FC;
}
.order-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4rpx; }
.order-title {
  font-size: 26rpx; font-weight: 700; color: #111; line-height: 1.35;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.order-spec { font-size: 22rpx; color: #888; }
.order-meta { display: flex; align-items: baseline; justify-content: space-between; margin-top: 4rpx; }
.order-price { font-size: 28rpx; font-weight: 700; color: #FF4757; }
.order-qty { font-size: 22rpx; color: #888; }
.order-line { font-size: 22rpx; color: #6B7280; }
.order-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 12rpx;
  margin-top: 14rpx; padding-top: 12rpx;
  border-top: 1rpx solid rgba(99, 102, 241, 0.1);
}
.order-foot-l { font-size: 22rpx; color: #6B7280; }
.order-total { font-size: 24rpx; font-weight: 700; color: #111; }
.order-total-em { color: #FF4757; font-size: 28rpx; }
.tip-row { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.tip-chip {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(99, 102, 241, 0.08);
  color: #4F46E5;
  font-size: 20rpx;
}
.typing-bubble { display: flex; gap: 8rpx; align-items: center; min-width: 80rpx; }
.dot {
  width: 10rpx; height: 10rpx; border-radius: 50%; background: #A5B4FC;
  animation: blink 1.2s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }
@keyframes blink {
  0%, 80%, 100% { opacity: .35; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-4rpx); }
}
.scroll-pad { height: 24rpx; }

.composer {
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid rgba(99, 102, 241, 0.12);
  padding: 12rpx 20rpx calc(12rpx + env(safe-area-inset-bottom));
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 12rpx;
}
.foot-tag {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(99, 102, 241, 0.28);
  background: #F8FAFF;
  color: #4F46E5;
  font-size: 22rpx;
}
.composer-inner {
  display: flex;
  align-items: center;
  background: #EEF2FF;
  border-radius: 999rpx;
  padding: 8rpx 8rpx 8rpx 24rpx;
}
.composer-input { flex: 1; height: 68rpx; font-size: 26rpx; color: #111; }
.send-btn {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(115deg, #818CF8, #6366F1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.send-btn.disabled { opacity: 0.45; }
.send-text { color: #fff; font-size: 26rpx; font-weight: 600; }
</style>
