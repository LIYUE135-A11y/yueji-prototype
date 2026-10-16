<template>
  <view class="page">
    <view class="status-bar" :style="{ paddingTop: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-btn" @tap="goBack" @click="goBack">
        <text class="nav-back">‹</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">AI 导购</text>
        <text class="nav-sub">妆小妍 · 智能选品顾问</text>
      </view>
      <view class="nav-btn right" @tap="clearChat" @click="clearChat">
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
        <view class="hero-avatar">
          <text class="hero-emoji">👧</text>
        </view>
        <view class="hero-copy">
          <text class="hero-title">你好，我是妆小妍</text>
          <text class="hero-desc">告诉我肤质、预算或场景，帮你挑到更适合的美妆好物</text>
        </view>
      </view>

      <view class="scene-row">
        <view
          v-for="s in scenes"
          :key="s.key"
          class="scene-chip"
          :class="{ active: activeScene === s.key }"
          @tap="onScene(s)"
          @click="onScene(s)"
        >
          <text class="scene-icon">{{ s.icon }}</text>
          <text class="scene-text">{{ s.label }}</text>
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
            <text>AI</text>
          </view>
          <view class="bubble">
            <image v-if="msg.img" class="upload-preview" :src="msg.img" mode="aspectFill" />
            <text v-if="msg.fileName" class="upload-file">📎 {{ msg.fileName }}</text>
            <text class="bubble-text">{{ msg.text }}</text>
            <view v-if="msg.products && msg.products.length" class="prod-list">
              <view
                v-for="p in msg.products"
                :key="p.id"
                class="prod-card"
                @tap="goProduct(p)"
                @click="goProduct(p)"
              >
                <image class="prod-img" :src="p.img" mode="aspectFill" />
                <view class="prod-info">
                  <text class="prod-name">{{ p.title }}</text>
                  <text class="prod-sub">{{ p.subTitle }}</text>
                  <view class="prod-meta">
                    <text class="prod-price">¥{{ p.price }}</text>
                    <text class="prod-score">{{ p.score }}分</text>
                  </view>
                  <text class="prod-reason">{{ p.reason }}</text>
                </view>
                <text class="prod-go">去看 ›</text>
              </view>
            </view>
            <view v-if="msg.tips && msg.tips.length" class="tip-row">
              <text v-if="msg.mode === 'clarify'" class="clarify-hint">点选继续，或直接输入更具体的需求</text>
              <text
                v-for="(t, i) in msg.tips"
                :key="i"
                class="tip-chip"
                :class="{ guide: msg.mode === 'clarify' }"
                @tap="ask(t)"
                @click="ask(t)"
              >{{ (msg.tipLabels && msg.tipLabels[i]) || t }}</text>
            </view>
          </view>
        </view>

        <view v-if="typing" id="msg-typing" class="msg-row ai">
          <view class="msg-avatar"><text>AI</text></view>
          <view class="bubble typing-bubble">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>

      <view id="msg-bottom" class="scroll-pad"></view>
    </scroll-view>

    <view class="composer">
      <view class="composer-inner" :class="{ 'has-attach': !!pendingImg }">
        <view v-if="pendingImg" class="attach-chip">
          <image class="attach-img" :src="pendingImg" mode="aspectFill" />
          <view class="attach-clear" @tap="clearPendingImg" @click="clearPendingImg">
            <text>×</text>
          </view>
        </view>
        <input
          class="composer-input"
          v-model="inputText"
          type="text"
          confirm-type="send"
          placeholder="描述肤质/需求，如：干皮补水精华"
          @confirm="send"
        />
        <view
          v-if="visionReady"
          class="upload-btn"
          @tap="pickFile"
          @click="pickFile"
        >
          <text class="upload-icon">⬆</text>
        </view>
        <view class="send-btn" :class="{ disabled: !canSend }" @tap="send" @click="send">
          <text class="send-text">发送</text>
        </view>
      </view>
    </view>

    <!-- 商品卡反馈：出卡后 30s，同会话只弹 1 次 -->
    <view v-if="fbVisible" class="fb-mask" @tap="skipFeedback" @click="skipFeedback">
      <view class="fb-sheet" @tap.stop @click.stop>
        <text class="fb-title">推荐反馈</text>
        <text class="fb-desc">刚才的商品推荐对你有帮助吗？你的反馈会让妆小妍更懂你。</text>
        <view class="fb-scores">
          <view
            v-for="s in fbScoreOpts"
            :key="s.key"
            class="fb-score"
            :class="{ on: fbScore === s.key }"
            @tap="fbScore = s.key"
            @click="fbScore = s.key"
          >
            <text>{{ s.label }}</text>
          </view>
        </view>
        <textarea
          class="fb-input"
          v-model="fbNote"
          maxlength="200"
          placeholder="可选：补充一句想法"
        />
        <view class="fb-actions">
          <view class="fb-btn ghost" @tap="skipFeedback" @click="skipFeedback"><text>跳过</text></view>
          <view class="fb-btn primary" @tap="submitFeedback" @click="submitFeedback"><text>提交</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { productCatalog } from '../../common/product-data.js'
import { getProductImage } from '../../common/product-image.js'

const statusBarHeight = ref(20)
const scrollHeight = ref('100vh')
const inputText = ref('')
const typing = ref(false)
const scrollInto = ref('')
const activeScene = ref('')
const msgSeq = ref(1)
const messages = ref([])
const visionReady = ref(false)
const pendingImg = ref('')
const pendingName = ref('')
const pendingCategory = ref('')
const pendingDim = ref('')
const fbVisible = ref(false)
const fbShown = ref(false)
const fbScore = ref('')
const fbNote = ref('')
const fbTimer = ref(null)
const fbScoreOpts = [
  { key: 'good', label: '有帮助' },
  { key: 'ok', label: '一般' },
  { key: 'bad', label: '没帮助' }
]

function scheduleCardFeedback(hasProducts) {
  if (!hasProducts || fbShown.value || fbTimer.value) return
  fbTimer.value = setTimeout(() => {
    fbTimer.value = null
    if (fbShown.value) return
    fbShown.value = true
    fbScore.value = ''
    fbNote.value = ''
    fbVisible.value = true
  }, 30000)
}

function saveCardFeedback(payload) {
  try {
    const raw = (typeof localStorage !== 'undefined' && localStorage.getItem('ai_guide_card_feedback_v1')) || '[]'
    const list = JSON.parse(raw)
    const arr = Array.isArray(list) ? list : []
    let nickName = '美妆用户'
    let realName = '—'
    let phone = ''
    try {
      if (typeof window !== 'undefined' && window.UserStore && window.UserStore.loadProfile) {
        const profile = window.UserStore.loadProfile() || {}
        nickName = profile.nickName || profile.nickname || nickName
        realName = profile.realName || profile.name || realName
        phone = profile.phone || profile.mobile || phone
      }
    } catch (e) {}
    arr.unshift(Object.assign({
      id: 'AGF' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      at: new Date().toISOString(),
      source: 'ai-guide-vue',
      status: 'pending',
      nickName,
      realName,
      phone,
      handler: '',
      solution: '',
      sessionImage: ''
    }, payload))
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ai_guide_card_feedback_v1', JSON.stringify(arr.slice(0, 50)))
    }
  } catch (e) {}
}

function skipFeedback() {
  fbVisible.value = false
  saveCardFeedback({ score: '', note: '', skipped: true })
}

function submitFeedback() {
  const note = String(fbNote.value || '').trim()
  if (!fbScore.value && !note) {
    uni.showToast({ title: '请先选评价或填写想法', icon: 'none' })
    return
  }
  saveCardFeedback({ score: fbScore.value || 'note', note, skipped: false })
  fbVisible.value = false
  uni.showToast({ title: '感谢反馈', icon: 'none' })
}

function readVisionReady() {
  try {
    if (typeof window !== 'undefined' && window.LlmChat && typeof window.LlmChat.isVisionReady === 'function') {
      return !!window.LlmChat.isVisionReady()
    }
  } catch (e) {}
  try {
    const raw = (typeof localStorage !== 'undefined' && localStorage.getItem('zhuangyan_llm_settings_v2')) || ''
    if (!raw) return false
    const parsed = JSON.parse(raw)
    const v = (parsed && parsed.vision) || {}
    return !!(v.enabled && v.apiUrl && v.apiKey)
  } catch (e2) {
    return false
  }
}

function syncVisionReady() {
  visionReady.value = readVisionReady()
}

const scenes = [
  { key: 'dry', icon: '💧', label: '干皮补水', ask: '我是干皮，想买补水保湿产品' },
  { key: 'sensitive', icon: '🌿', label: '敏感修护', ask: '敏感肌怎么挑温和修护单品' },
  { key: 'base', icon: '✨', label: '底妆推荐', ask: '帮我推荐适合日常的底妆' },
  { key: 'lip', icon: '💄', label: '口红试色', ask: '想要显白又日常的口红' },
  { key: 'antiage', icon: '🌙', label: '抗初老', ask: '抗初老精华有什么推荐' }
]

const catalogList = Object.keys(productCatalog).map((id) => {
  const p = productCatalog[id]
  return {
    id: p.id || id,
    title: p.title,
    subTitle: p.subTitle || [p.brand, p.cat3].filter(Boolean).join(' · '),
    img: p.img || getProductImage(id, p.title),
    price: p.price,
    score: p.score,
    tags: p.tags || [],
    cat1: p.cat1 || '',
    cat2: p.cat2 || '',
    cat3: p.cat3 || '',
    desc: p.desc || ''
  }
})

const extraGuideProducts = [
  {
    id: 'guide-essence',
    title: '水光维稳修护精华',
    subTitle: '补水保湿 · 干皮友好',
    img: getProductImage('essence', '水光维稳修护精华'),
    price: '259',
    score: '4.8',
    tags: ['精华', '补水', '修护'],
    cat3: '精华',
    desc: '补水保湿修护精华'
  },
  {
    id: 'guide-mask',
    title: '急救补水面膜 5片',
    subTitle: '密集补水 · 睡前急救',
    img: getProductImage('mask', '急救补水面膜'),
    price: '89',
    score: '4.6',
    tags: ['面膜', '补水'],
    cat3: '面膜',
    desc: '补水面膜'
  },
  {
    id: 'guide-foundation',
    title: '花兰槿养肤粉底液',
    subTitle: '养肤底妆 · 自然服帖',
    img: getProductImage('foundation', '花兰槿养肤粉底液'),
    price: '289',
    score: '4.7',
    tags: ['底妆', '粉底'],
    cat3: '粉底液',
    desc: '轻薄养肤粉底液'
  },
  {
    id: 'guide-sensitive',
    title: '薇诺娜特护霜',
    subTitle: '敏感肌 · 温和舒缓',
    img: getProductImage('skincare', '薇诺娜特护霜舒敏'),
    price: '198',
    score: '4.9',
    tags: ['敏感', '温和', '修护'],
    cat3: '面霜',
    desc: '敏感肌温和修护'
  }
]

const allGuideProducts = catalogList.concat(extraGuideProducts)

const canSend = computed(() => (!!(inputText.value || '').trim() || !!pendingImg.value) && !typing.value)

const pendingSameStyle = ref(null)

onLoad((query) => {
  if (!query || String(query.sameStyle || '') !== '1') return
  pendingSameStyle.value = {
    img: decodeURIComponent(String(query.img || '')),
    title: decodeURIComponent(String(query.title || '')),
    brand: decodeURIComponent(String(query.brand || '')),
    excludeId: decodeURIComponent(String(query.excludeId || '')),
    cat3: decodeURIComponent(String(query.cat3 || query.cat || ''))
  }
})

onMounted(() => {
  try {
    const info = uni.getSystemInfoSync()
    statusBarHeight.value = info.statusBarHeight || 20
    const composerH = 72
    const navH = 56
    scrollHeight.value = `${info.windowHeight - (info.statusBarHeight || 20) - navH - composerH}px`
  } catch (e) {}
  syncVisionReady()
  try {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (ev) => {
        if (!ev) return
        if (ev.key === 'zhuangyan_llm_settings_v2' || ev.key === 'zhuangyan_llm_vision_ping') {
          syncVisionReady()
        }
      })
      window.addEventListener('message', (ev) => {
        const data = ev && ev.data
        if (data && data.type === 'llm-vision-sync') syncVisionReady()
      })
      window.addEventListener('llm-vision-updated', syncVisionReady)
    }
  } catch (eListen) {}
  resetWelcome()
  const same = pendingSameStyle.value
  if (same && same.img) {
    nextTick(() => {
      const ask = '请根据这张商品主图搜索站内同款或包装高度相近的商品'
        + (same.brand ? `，品牌倾向「${same.brand}」` : '')
        + (same.title ? `，参考商品名「${same.title}」` : '')
        + '。请识别品牌、品类与包装特征。'
      messages.value.push({
        id: nextId(),
        role: 'user',
        text: ask,
        img: same.img,
        fileName: '商品主图·搜同款'
      })
      scrollToBottom()
      replyWithVision(ask, same.img, {
        sameStyle: true,
        excludeId: same.excludeId,
        brandHint: same.brand,
        seedQuery: [same.brand, same.cat3, same.title].filter(Boolean).join(' ')
      })
    })
  }
})

function goBack() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function clearPendingImg() {
  pendingImg.value = ''
  pendingName.value = ''
}

function clearChat() {
  activeScene.value = ''
  clearPendingImg()
  pendingCategory.value = ''
  pendingDim.value = ''
  resetWelcome()
}

function resetWelcome() {
  messages.value = [{
    id: nextId(),
    role: 'ai',
    text: '今天想解决哪类护肤/彩妆问题？可以直接点上方场景，或告诉我肤质、预算与使用场景。',
    tips: ['干皮补水精华', '敏感肌面霜', '显白口红', '轻薄粉底']
  }]
  scrollToBottom()
}

function nextId() {
  msgSeq.value += 1
  return msgSeq.value
}

function onScene(s) {
  activeScene.value = s.key
  ask(s.ask)
}

function ask(text) {
  inputText.value = text
  send()
}

function send() {
  const text = (inputText.value || '').trim()
  const img = pendingImg.value
  const fileName = pendingName.value || '已上传图片'
  if ((!text && !img) || typing.value) return

  if (img) {
    const askText = text || '请根据我上传的图片帮我选品或分析成分/色号'
    inputText.value = ''
    clearPendingImg()
    messages.value.push({
      id: nextId(),
      role: 'user',
      text: askText,
      img,
      fileName
    })
    scrollToBottom()
    replyWithVision(askText, img)
    return
  }

  messages.value.push({ id: nextId(), role: 'user', text })
  inputText.value = ''
  scrollToBottom()
  replyWithAi(text)
}

function pickFile() {
  syncVisionReady()
  if (!visionReady.value) {
    uni.showToast({ title: '请先启用运营端视觉大模型', icon: 'none' })
    return
  }
  try {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const path = (res.tempFilePaths && res.tempFilePaths[0]) || ''
        if (!path) return
        /* 先挂在输入框预览，点发送再进对话 */
        pendingImg.value = path
        pendingName.value = '已选图片'
      },
      fail() {
        uni.showToast({ title: '无法打开相册', icon: 'none' })
      }
    })
  } catch (e) {
    uni.showToast({ title: '当前环境不支持上传', icon: 'none' })
  }
}

function replyWithVision(askText, imgPath, opts = {}) {
  typing.value = true
  scrollToBottom()
  const excludeId = String(opts.excludeId || '')
  const finish = (text, products) => {
    let display = String(text || '')
      .replace(/```(?:json)?[\s\S]*?```/ig, '')
      .replace(/\n?\s*\{[\s\S]*"brand"[\s\S]*\}\s*$/m, '')
      .trim()
    let list = Array.isArray(products) ? products : []
    if (excludeId) list = list.filter((p) => p && String(p.id) !== excludeId)
    if (list.length) {
      const names = list.map((p) => p.title).filter(Boolean)
      const intro = opts.sameStyle
        ? (list.length === 1
          ? `已根据商品主图搜索同款，找到「${names[0] || '相关商品'}」：`
          : `已根据商品主图搜索同款，找到 ${list.length} 款：`)
        : (list.length === 1
          ? `已根据图片在商品库匹配到「${names[0] || '相关商品'}」：`
          : `已根据图片在商品库匹配到 ${list.length} 款相近单品：`)
      display = (display && !opts.sameStyle ? `${display}\n\n` : '') + intro
    } else if (display) {
      display += opts.sameStyle
        ? '\n\n暂未在站内找到更多同款，可换更清晰包装图或补充品牌/品类。'
        : '\n\n暂未精确匹配到站内同款，可换更清晰包装图或补充品牌/品类。'
    }
    messages.value.push({
      id: nextId(),
      role: 'ai',
      text: display || '暂时无法识别该图片，请换一张更清晰的照片再试。',
      products: list.slice(0, 3),
      tips: ['干皮友好', '显白口红', '敏感肌面霜']
    })
    typing.value = false
    scrollToBottom()
    scheduleCardFeedback(list.length > 0)
  }

  const matchLocal = (visionText) => {
    let list = []
    try {
      if (typeof window !== 'undefined' && window.AiConfigStore && window.AiConfigStore.matchProductsByCoverImage) {
        const coverHits = window.AiConfigStore.matchProductsByCoverImage({
          fileName: opts.fileName || '',
          dataUrl: imgPath
        }, 3) || []
        if (coverHits.length) list = coverHits.slice()
      }
    } catch (e) {}
    try {
      if (typeof window !== 'undefined' && window.AiConfigStore && window.AiConfigStore.matchProductsFromVisionText) {
        const m = window.AiConfigStore.matchProductsFromVisionText(visionText, askText, 4)
        if (m && m.products && m.products.length) {
          const seen = {}
          list.forEach((p) => { if (p && p.id) seen[p.id] = 1 })
          m.products.forEach((p) => {
            if (!p || !p.id || seen[p.id]) return
            seen[p.id] = 1
            list.push(p)
          })
        }
      }
    } catch (e) {}
    const seed = String(opts.seedQuery || '').trim()
    const brandHint = String(opts.brandHint || '').trim()
    if (opts.sameStyle) {
      if (seed) list = list.concat(pickProducts(seed))
      if (brandHint) list = list.concat(pickProducts(brandHint))
    }
    if (!list.length) {
      const hints = String(visionText || '')
      list = pickProducts([askText, hints].join(' '))
    }
    const seen = {}
    const out = []
    for (const p of list) {
      if (!p || !p.id) continue
      if (excludeId && String(p.id) === excludeId) continue
      if (seen[p.id]) continue
      seen[p.id] = 1
      out.push(p)
      if (out.length >= 3) break
    }
    return out
  }

  try {
    if (typeof window !== 'undefined' && window.LlmChat && window.LlmChat.visionChat) {
      const content = window.LlmChat.buildImageUserContent
        ? window.LlmChat.buildImageUserContent(askText, imgPath)
        : [
            { type: 'text', text: askText },
            { type: 'image_url', image_url: { url: imgPath } }
          ]
      const system = '你是美妆 AI 识图导购助手。先用简洁中文说明识别结果，并在末尾附加 JSON：'
        + '{"brand":"","category":"","shade":"","productName":"","keywords":[],"summary":""}'
      window.LlmChat.visionChat([
        { role: 'system', content: system },
        { role: 'user', content }
      ]).then((r) => {
        const raw = (r && r.text) || ''
        finish(raw, matchLocal(raw))
      }).catch((err) => {
        finish('视觉大模型暂不可用：' + (err && err.message ? err.message : '请检查配置'), matchLocal(''))
      })
      return
    }
  } catch (e) {}
  /* 无视觉能力时：仍用品牌/品类在本地商品库兜底 */
  setTimeout(() => {
    const fallback = matchLocal([opts.brandHint, opts.seedQuery, askText].filter(Boolean).join(' '))
    finish(
      fallback.length
        ? '已按商品信息在站内库匹配相近单品（当前环境未连通视觉大模型）。'
        : '已收到图片。请在 H5 预览中打开并确保运营端「视觉大模型」已启用，即可走真实识图匹配。',
      fallback
    )
  }, 400)
}

function pickProducts(query) {
  const q = String(query || '').toLowerCase()
  const rules = [
    { keys: ['口红', '唇', '显白', '豆沙', '正红'], match: (p) => p.cat3 === '口红' || /口红|唇/.test(p.title + (p.tags || []).join('')) },
    { keys: ['底妆', '粉底', '妆前', '遮瑕'], match: (p) => /粉底|底妆|遮瑕/.test(p.title + p.subTitle + p.cat3 + (p.tags || []).join('')) },
    { keys: ['精华', '抗初老', '修护', '小棕瓶'], match: (p) => /精华|修护/.test(p.title + p.cat3 + (p.tags || []).join('')) || p.cat3 === '精华' },
    { keys: ['面膜', '补水', '保湿', '干皮'], match: (p) => /面膜|补水|保湿|干皮/.test(p.title + p.desc + p.cat3 + (p.tags || []).join('')) },
    { keys: ['敏感', '温和'], match: (p) => /敏感|温和|修护|特护/.test(p.title + p.desc + (p.tags || []).join('')) }
  ]
  let matched = []
  for (const rule of rules) {
    if (rule.keys.some((k) => q.indexOf(k) >= 0)) {
      matched = allGuideProducts.filter(rule.match)
      if (matched.length) break
    }
  }
  if (!matched.length) return []
  return matched.slice(0, 3).map((p, idx) => ({
    ...p,
    reason: ['成分匹配你的诉求', '口碑稳定 · 回购率高', '同肤质用户偏好'][idx] || '妆小妍精选'
  }))
}

function mapGuideProducts(list) {
  return (list || []).map((p, idx) => ({
    id: p.id,
    title: p.title || p.name || '商品',
    subTitle: p.sub || p.subTitle || [p.brand, p.cat3 || p.cat2].filter(Boolean).join(' · '),
    img: p.img || p.coverUrl || '',
    price: p.price != null ? p.price : '',
    score: p.score || '4.8',
    reason: p.reason || ['成分匹配你的诉求', '口碑稳定 · 回购率高', '同肤质用户偏好'][idx] || '妆小妍精选'
  }))
}

function fetchGuideProducts(searchQuery) {
  const q = String(searchQuery || '')
  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && window.AiConfigStore) {
        const store = window.AiConfigStore
        if (typeof store.collectGuideContextAsync === 'function') {
          store.collectGuideContextAsync(q, 3, 'daogou')
            .then((ctx) => resolve(mapGuideProducts((ctx && ctx.products) || [])))
            .catch(() => {
              if (typeof store.pickGuideProducts === 'function') {
                resolve(mapGuideProducts(store.pickGuideProducts(q, 3)))
              } else {
                resolve(mapGuideProducts(pickProducts(q)))
              }
            })
          return
        }
        if (typeof store.pickGuideProducts === 'function') {
          resolve(mapGuideProducts(store.pickGuideProducts(q, 3)))
          return
        }
      }
    } catch (e) {}
    return []
  })
}

function buildCardReplyText(query, count) {
  const q = String(query || '')
  if (/干皮|补水|保湿/.test(q)) {
    return '干皮优先看保湿膜与锁水精华。下面几款补水力更稳，建议洁面后薄涂，再叠加面霜。'
  }
  if (/敏感/.test(q)) {
    return '敏感肌建议少香精、少刺激酸类。先从温和修护与基础保湿入手，出现刺痛立刻停用观察。'
  }
  if (/口红|唇|显白/.test(q)) {
    return count > 0
      ? '显白日常色更偏正红/豆沙。可先看质地：雾面更持久，丝绒更不拔干。'
      : '显白日常色更偏正红/豆沙。可先看质地：雾面更持久，丝绒更不拔干。以下是热门色号。'
  }
  if (/底妆|粉底/.test(q)) {
    return '日常底妆建议轻薄贴肤、不卡粉。可按肤质选：混油偏哑光控油，干皮选滋润型。'
  }
  if (/抗初老|精华/.test(q)) {
    return '抗初老可从修护精华切入，注意防晒与作息。按浓度循序渐进，避免叠加太多活性成分。'
  }
  if (count === 1) return '根据你的需求，已为你定位到 1 款相关单品：'
  if (count > 1) return `根据你的需求，我为你筛选了 ${count} 款相关单品：`
  return '已根据你的描述筛了一组更匹配的单品，可点进详情对比色号/质地与评价。'
}

function buildReply(query) {
  const q = String(query || '')
  const products = pickProducts(q)
  return {
    text: buildCardReplyText(q, products.length),
    products,
    tips: ['换个预算再挑', '再看看面霜', '去测肤更精准']
  }
}

/** 本地兜底：模糊→引导；域外→说明；具象→出卡 */
function assessClarityLocal(query) {
  const q = String(query || '').trim()
  if (!q) return { clarity: 'concrete', searchQuery: q }

  if (/订单|物流|发货|退款|售后|快递|运单|转人工/.test(q)) {
    return {
      clarity: 'kefu',
      text: '这类订单/物流/售后问题更适合「AI客服」处理。\n也可在「我的」→「我的订单」查看进度。',
      tips: ['查物流', '申请退款', '转人工客服'],
      tipLabels: ['查物流', '申请退款', '转人工']
    }
  }
  if (/显示器|电视|手机|电脑|笔记本|平板|显卡|打印机|游戏|Steam|PS5|iPhone|iPad|MacBook|外卖|股票|基金|招聘|简历|论文|天气|新闻/.test(q)) {
    return {
      clarity: 'out_of_scope',
      text: `我是美妆导购「妆小妍」，主要帮你选护肤、彩妆等站内好物。「${q.length > 12 ? q.slice(0, 12) + '…' : q}」不在美妆选品范围。\n可以告诉我肤质、品类或预算，例如：`,
      tips: ['推荐一款口红', '干皮补水精华', '敏感肌面霜', '预算200内的粉底'],
      tipLabels: ['口红怎么选', '干皮补水', '敏感修护', '平价粉底']
    }
  }

  const catHit = q.match(/口红|唇釉|面霜|精华|洁面|面膜|防晒|粉底|眼影|香水|身体乳|眼霜|爽肤水/)
  const cat = catHit ? catHit[0] : (pendingCategory.value || '')
  const hasBrand = /花西子|完美日记|兰蔻|雅诗兰黛|欧莱雅|SK-?II|3CE|YSL|迪奥|品牌要/.test(q)
  const hasPrice = /预算|价格|价位|以内|以下|便宜|平价|别太贵|不太贵|不要太贵|实惠|划算|￥|¥|\d+\s*元/.test(q)
  const hasIng = /雾面|哑光|滋润|显白|烟酰胺|玻尿酸|神经酰胺|美白|色号|豆沙|正红|全成分|成分表/.test(q)
  const prefBrand = /在意品牌|在乎品牌|看品牌|品牌优先/.test(q)
  const prefPrice = /在意价格|在乎价格|看价格|价格优先/.test(q)
  const prefIng = /在意成分|在乎成分|看重成分|成分优先/.test(q)
  const vagueAsk = /推荐|想买|想要|来一款|选一款|帮我|有没有/.test(q) || q.length <= ((cat || '').length + 6)

  if (prefBrand && cat && !hasBrand) {
    return {
      clarity: 'vague',
      pendingCategory: cat,
      pendingDim: 'brand',
      text: `好的，按品牌来挑「${cat}」。请点选或直接说品牌名：`,
      tips: [`推荐${cat}，品牌要花西子`, `推荐${cat}，品牌要完美日记`, `推荐${cat}，不限品牌直接给我几款`],
      tipLabels: ['选「花西子」', '选「完美日记」', '不限品牌']
    }
  }
  if (prefPrice && cat && !hasPrice) {
    return {
      clarity: 'vague',
      pendingCategory: cat,
      pendingDim: 'price',
      text: '明白，价格对你比较重要。请点选合适预算：',
      tips: [`推荐${cat}，预算 100 以内`, `推荐${cat}，预算 200 以内`, `推荐${cat}，预算 300-500`],
      tipLabels: ['100 以内', '200 以内', '300-500']
    }
  }
  if (prefIng && cat && !hasIng) {
    return {
      clarity: 'vague',
      pendingCategory: cat,
      pendingDim: 'ingredient',
      text: `好的，按成分来挑「${cat}」。你更偏向哪类？`,
      tips: [`推荐${cat}，更看重雾面显白/妆感`, `推荐${cat}，更看重滋润不拔干`, `推荐${cat}，成分友好直接给我几款`],
      tipLabels: ['雾面显白', '滋润不拔干', '不限成分先看看']
    }
  }
  if (cat && vagueAsk && !hasBrand && !hasPrice && !hasIng && !/直接推荐|随便|热门几款|不限品牌/.test(q)) {
    return {
      clarity: 'vague',
      pendingCategory: cat,
      pendingDim: '',
      text: `「${cat}」选择很多～为了更准，想先确认你更在乎哪一点？\n① 品牌　② 价格　③ 成分\n点选下方引导，或直接打字说偏好。`,
      tips: [`推荐${cat}，我比较在意品牌`, `推荐${cat}，我比较在意价格`, `推荐${cat}，我比较在意成分`],
      tipLabels: ['更在意品牌', '更在意价格', '更在意成分']
    }
  }
  const searchQuery = cat && pendingCategory.value && q.indexOf(cat) < 0 && !catHit
    ? `${pendingCategory.value} ${q}`
    : q
  return { clarity: 'concrete', searchQuery, pendingCategory: '', pendingDim: '' }
}

function replyWithAi(query) {
  typing.value = true
  scrollToBottom()

  const finishClarify = (clarity) => {
    pendingCategory.value = clarity.pendingCategory || pendingCategory.value || ''
    pendingDim.value = clarity.pendingDim || ''
    messages.value.push({
      id: nextId(),
      role: 'ai',
      mode: 'clarify',
      text: clarity.text || '可以再具体一点吗？比如品牌、预算或成分偏好。',
      tips: clarity.tips || [],
      tipLabels: clarity.tipLabels || clarity.tips || []
    })
    typing.value = false
    scrollToBottom()
  }

  const finishCards = (searchQuery, clarity) => {
    pendingCategory.value = ''
    pendingDim.value = ''
    const sq = searchQuery || query

    const pushCardMsg = (products, groups) => {
      if (groups && groups.length >= 2) {
        groups.forEach((g) => {
          messages.value.push({
            id: nextId(),
            role: 'ai',
            mode: 'cards',
            text: `关于「${g.label}」为你筛选了 ${g.products.length} 款：`,
            products: g.products,
            tips: []
          })
        })
      } else {
        if (!products.length) {
          messages.value.push({
            id: nextId(),
            role: 'ai',
            mode: 'clarify',
            text: '暂未在站内商品库找到与描述匹配的美妆单品。可以补充品牌、品类或预算再试～',
            tips: ['推荐一款口红', '干皮补水精华', '预算200内的粉底'],
            tipLabels: ['口红怎么选', '干皮补水', '平价粉底']
          })
          typing.value = false
          scrollToBottom()
          return
        }
        const reply = buildReply(sq)
        reply.text = buildCardReplyText(sq, reply.products.length)
        messages.value.push({
          id: nextId(),
          role: 'ai',
          mode: 'cards',
          text: reply.text,
          products: reply.products,
          tips: reply.tips
        })
        scheduleCardFeedback(reply.products && reply.products.length > 0)
      }
      typing.value = false
      scrollToBottom()
    }

    if (clarity && clarity.multiCategories && clarity.multiCategories.length >= 2 && typeof window !== 'undefined' && window.AiConfigStore) {
      const store = window.AiConfigStore
      const cats = clarity.multiCategories
      if (typeof store.collectGuideContextAsync === 'function') {
        Promise.all(cats.map((c) =>
          store.collectGuideContextAsync(`${c.label} ${query}`, 2, 'daogou')
            .then((ctx) => ({
              label: c.label,
              products: mapGuideProducts((ctx && ctx.products) || []).slice(0, 2)
            }))
            .catch(() => ({ label: c.label, products: [] }))
        )).then((groups) => {
          const valid = groups.filter((g) => g.products.length)
          if (valid.length) pushCardMsg([], valid)
          else fetchGuideProducts(sq).then((products) => pushCardMsg(products))
        })
        return
      }
    }

    fetchGuideProducts(sq).then((products) => pushCardMsg(products))
  }

  const run = (clarity) => {
    if (clarity && clarity.clarity === 'kefu') {
      uni.showToast({ title: '请使用首页「AI客服」处理订单售后', icon: 'none' })
      finishClarify(clarity)
      return
    }
    if (clarity && (clarity.clarity === 'vague' || clarity.clarity === 'out_of_scope')) {
      finishClarify(clarity)
      return
    }
    finishCards((clarity && clarity.searchQuery) || query, clarity)
  }

  try {
    if (typeof window !== 'undefined' && window.AiConfigStore && window.AiConfigStore.assessGuideNeedClarityAsync) {
      window.AiConfigStore.assessGuideNeedClarityAsync(query, {
        pendingCategory: pendingCategory.value,
        pendingDim: pendingDim.value
      }).then(run).catch(() => run(assessClarityLocal(query)))
      return
    }
    if (typeof window !== 'undefined' && window.AiConfigStore && window.AiConfigStore.assessGuideNeedClarity) {
      run(window.AiConfigStore.assessGuideNeedClarity(query, {
        pendingCategory: pendingCategory.value,
        pendingDim: pendingDim.value
      }))
      return
    }
  } catch (e) {}

  setTimeout(() => run(assessClarityLocal(query)), 280)
}

function scrollToBottom() {
  nextTick(() => {
    scrollInto.value = ''
    nextTick(() => {
      scrollInto.value = typing.value ? 'msg-typing' : 'msg-bottom'
    })
  })
}

function goProduct(p) {
  if (!p || !p.id) return
  const id = String(p.id).indexOf('guide-') === 0 ? 'p1' : p.id
  uni.navigateTo({
    url: `/pages/product/detail?id=${encodeURIComponent(id)}&title=${encodeURIComponent(p.title || '')}`,
    fail(err) {
      uni.showToast({
        title: (err && err.errMsg) || '打开商品失败',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
@import '../../uni.scss';

.page {
  @include app-page-shell;
  background: linear-gradient(180deg, #F7F3FF 0%, #FFFFFF 42%, #FCE8F3 100%);
}

.status-bar {
  background: transparent;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 8rpx 24rpx 16rpx;
  flex-shrink: 0;
}

.nav-btn {
  width: 88rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  &.right { justify-content: flex-end; }
}

.nav-back {
  font-size: 52rpx;
  line-height: 1;
  color: $text-primary;
  font-weight: 300;
}

.nav-clear {
  font-size: 24rpx;
  color: $primary-dark;
}

.nav-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.nav-sub {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: $text-hint;
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.hero {
  margin: 8rpx 28rpx 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, rgba(138, 99, 242, 0.14), rgba(244, 114, 182, 0.12));
  display: flex;
  gap: 20rpx;
  align-items: center;
}

.hero-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 28rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(138, 99, 242, 0.16);
  flex-shrink: 0;
}

.hero-emoji { font-size: 44rpx; }

.hero-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hero-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.hero-desc {
  font-size: 22rpx;
  color: $text-hint;
  line-height: 1.45;
}

.scene-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 12rpx;
  padding: 0 28rpx 20rpx;
  overflow-x: auto;
}

.scene-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid $purple-border;
}

.scene-chip.active {
  background: linear-gradient(115deg, #8A63F2 0%, #F472B6 100%);
  border-color: transparent;
  .scene-text { color: #fff; }
}

.scene-icon { font-size: 22rpx; }
.scene-text {
  font-size: 22rpx;
  color: $primary-dark;
  font-weight: 600;
}

.chat-list {
  padding: 0 28rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  &.user {
    justify-content: flex-end;
    .bubble {
      background: linear-gradient(135deg, #8A63F2, #A78BFA);
      border-radius: 24rpx 8rpx 24rpx 24rpx;
      .bubble-text { color: #fff; }
    }
  }
  &.ai {
    justify-content: flex-start;
  }
}

.msg-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #8A63F2, #F472B6);
  color: #fff;
  font-size: 20rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bubble {
  max-width: 78%;
  padding: 20rpx 22rpx;
  background: #fff;
  border-radius: 8rpx 24rpx 24rpx 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(138, 99, 242, 0.08);
}

.bubble-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.55;
  white-space: pre-wrap;
}

.upload-preview {
  width: 240rpx;
  height: 240rpx;
  border-radius: 16rpx;
  display: block;
  margin-bottom: 10rpx;
  background: #EDE9FE;
}
.upload-file {
  display: block;
  font-size: 22rpx;
  color: #6B7280;
  margin-bottom: 6rpx;
}
.msg-row.user .upload-file {
  color: rgba(255, 255, 255, 0.9);
}

.prod-list {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.prod-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 14rpx;
  border-radius: 20rpx;
  background: $purple-surface;
}

.prod-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: $purple-placeholder;
  flex-shrink: 0;
}

.prod-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.prod-name {
  font-size: 24rpx;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prod-sub {
  font-size: 20rpx;
  color: $text-hint;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prod-meta {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
}

.prod-price {
  font-size: 26rpx;
  font-weight: 700;
  color: $tag-red;
}

.prod-score {
  font-size: 20rpx;
  color: $primary-dark;
}

.prod-reason {
  font-size: 20rpx;
  color: $accent-pink;
}

.prod-go {
  font-size: 22rpx;
  color: $primary-dark;
  flex-shrink: 0;
}

.tip-row {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tip-chip {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(138, 99, 242, 0.08);
  font-size: 20rpx;
  color: $primary-dark;
}

.tip-chip.guide {
  background: #fff;
  border: 1rpx solid rgba(138, 99, 242, 0.35);
  color: #5B45C6;
  font-size: 22rpx;
  padding: 10rpx 18rpx;
}

.clarify-hint {
  display: block;
  width: 100%;
  margin-bottom: 8rpx;
  font-size: 22rpx;
  color: #8B7BB8;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 96rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $primary-light;
  animation: blink 1.2s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-4rpx); }
}

.scroll-pad { height: 24rpx; }

.composer {
  flex-shrink: 0;
  padding: 12rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid $purple-border;
}

.composer-inner {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: $purple-surface;
  border-radius: 999rpx;
  padding: 10rpx 10rpx 10rpx 28rpx;
  &.has-attach {
    border-radius: 28rpx;
    padding-left: 12rpx;
  }
}

.attach-chip {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
}
.attach-img {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: #EDE9FE;
  display: block;
}
.attach-clear {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #6B7280;
  color: #fff;
  font-size: 20rpx;
  line-height: 28rpx;
  text-align: center;
}

.composer-input {
  flex: 1;
  height: 64rpx;
  font-size: 26rpx;
  color: $text-primary;
}

.upload-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #8A63F2;
}
.upload-btn:active { background: rgba(138, 99, 242, 0.12); }
.upload-icon {
  font-size: 30rpx;
  line-height: 1;
  font-weight: 600;
}

.send-btn {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(115deg, #8A63F2 0%, #F472B6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  &.disabled { opacity: 0.45; }
}

.send-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: 600;
}

.fb-mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 200;
  background: rgba(17, 17, 17, 0.42);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
.fb-sheet {
  width: 100%;
  background: #fff;
  border-radius: 28rpx;
  padding: 32rpx 28rpx 24rpx;
  box-shadow: 0 24rpx 80rpx rgba(88, 28, 135, 0.18);
}
.fb-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
}
.fb-desc {
  display: block;
  margin: 14rpx 0 24rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: #666;
}
.fb-scores {
  display: flex;
  gap: 14rpx;
  margin-bottom: 20rpx;
}
.fb-score {
  flex: 1;
  height: 72rpx;
  border-radius: 20rpx;
  background: #FAF7FF;
  border: 1rpx solid #EDE4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 600;
  color: #5B3A9E;
  &.on {
    border-color: #A78BFA;
    background: linear-gradient(135deg, #F3E8FF, #FCE7F3);
    color: #7C3AED;
  }
}
.fb-input {
  width: 100%;
  min-height: 140rpx;
  box-sizing: border-box;
  border: 1rpx solid #EEE;
  border-radius: 20rpx;
  padding: 18rpx 20rpx;
  font-size: 26rpx;
  background: #FAFAFC;
}
.fb-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}
.fb-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  &.ghost { background: #F3F4F6; color: #666; }
  &.primary {
    background: linear-gradient(135deg, #A78BFA, #F472B6);
    color: #fff;
  }
}
</style>
