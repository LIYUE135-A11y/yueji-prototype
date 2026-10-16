<template>
  <view class="llm-manage">
    <view class="llm-layout">
      <view class="llm-sider">
        <view
          v-for="item in subMenus"
          :key="item.id"
          class="llm-sider-item"
          :class="{ active: activeSub === item.id }"
          @click="activeSub = item.id"
        >
          <text class="llm-sider-label">{{ item.name }}</text>
        </view>
      </view>

      <view class="llm-main">
        <!-- 全局配置 -->
        <view v-if="activeSub === 'global'" class="llm-section">
          <text class="section-title">全局配置</text>
          <view class="llm-tabs">
            <view
              v-for="tab in globalTabs"
              :key="tab.id"
              class="llm-tab"
              :class="{ active: activeGlobalTab === tab.id }"
              @click="activeGlobalTab = tab.id"
            >
              <text>{{ tab.name }}</text>
            </view>
          </view>

          <!-- 通用大模型 -->
          <view v-if="activeGlobalTab === 'chat'" class="global-pane">
            <text class="section-desc">配置大模型服务商、API 密钥与对话参数，供运营端智能助手及文章编辑「AI帮我写」调用</text>
            <view class="form-card">
              <view class="form-row with-enable">
                <view class="form-field">
                  <text class="form-label">配置名称</text>
                  <input class="form-input" v-model="chatForm.name" />
                </view>
                <view class="form-field">
                  <text class="form-label">服务商</text>
                  <picker :range="chatProviders" @change="onChatProvider">
                    <view class="form-input picker"><text>{{ chatForm.provider }}</text></view>
                  </picker>
                </view>
                <label class="enable-check" @click="toggleEnable('chat')">
                  <checkbox :checked="chatForm.enabled" color="#8B7CF6" style="transform:scale(0.8);" />
                  <text>{{ chatForm.enabled ? '已启用' : '未启用' }}</text>
                </label>
              </view>
              <view class="form-row">
                <text class="form-label">API 地址</text>
                <input class="form-input" v-model="chatForm.apiUrl" />
              </view>
              <view class="form-row">
                <text class="form-label">模型名称</text>
                <input class="form-input" v-model="chatForm.model" placeholder="如 deepseek-chat / qwen2.5:7b" />
              </view>
              <view class="form-row">
                <text class="form-label">API Key</text>
                <view class="key-wrap">
                  <input class="form-input" :password="!showChatKey" v-model="chatForm.apiKey" placeholder="云端 sk-...；本地可留空" />
                  <text class="key-toggle" @click="showChatKey = !showChatKey">{{ showChatKey ? '隐藏' : '显示' }}</text>
                </view>
              </view>
              <view class="form-row half-wrap">
                <view class="form-half">
                  <text class="form-label">超时 (秒)</text>
                  <input class="form-input" type="number" v-model="chatForm.timeout" />
                </view>
                <view class="form-half">
                  <text class="form-label">温度</text>
                  <input class="form-input" type="digit" v-model="chatForm.temperature" />
                </view>
              </view>
              <view class="form-row">
                <text class="form-label">最大 Token</text>
                <input class="form-input narrow" type="number" v-model="chatForm.maxTokens" />
              </view>
              <view class="form-actions">
                <view class="btn btn-default" @click="resetChat"><text>恢复默认</text></view>
                <view class="btn btn-primary" @click="saveChat"><text>保存配置</text></view>
                <view class="btn btn-outline" @click="testChat"><text>测试大模型</text></view>
              </view>
            </view>
          </view>

          <!-- 嵌入模型 -->
          <view v-else-if="activeGlobalTab === 'embed'" class="global-pane">
            <text class="section-desc">配置文本向量嵌入模型，供知识库检索、相似商品推荐等场景调用</text>
            <view class="form-card">
              <view class="form-row with-enable">
                <view class="form-field">
                  <text class="form-label">配置名称</text>
                  <input class="form-input" v-model="embedForm.name" />
                </view>
                <view class="form-field">
                  <text class="form-label">服务商</text>
                  <picker :range="embedProviders" @change="onEmbedProvider">
                    <view class="form-input picker"><text>{{ embedForm.provider }}</text></view>
                  </picker>
                </view>
                <label class="enable-check" @click="toggleEnable('embed')">
                  <checkbox :checked="embedForm.enabled" color="#8B7CF6" style="transform:scale(0.8);" />
                  <text>{{ embedForm.enabled ? '已启用' : '未启用' }}</text>
                </label>
              </view>
              <view class="form-row">
                <text class="form-label">API 地址</text>
                <input class="form-input" v-model="embedForm.apiUrl" />
              </view>
              <view class="form-row">
                <text class="form-label">API Key</text>
                <view class="key-wrap">
                  <input class="form-input" :password="!showEmbedKey" v-model="embedForm.apiKey" placeholder="sk-..." />
                  <text class="key-toggle" @click="showEmbedKey = !showEmbedKey">{{ showEmbedKey ? '隐藏' : '显示' }}</text>
                </view>
              </view>
              <view class="form-row">
                <text class="form-label">模型名称</text>
                <input class="form-input" v-model="embedForm.model" />
              </view>
              <view class="form-row half-wrap">
                <view class="form-half">
                  <text class="form-label">超时 (秒)</text>
                  <input class="form-input" type="number" v-model="embedForm.timeout" />
                </view>
                <view class="form-half">
                  <text class="form-label">维度</text>
                  <input class="form-input" type="number" v-model="embedForm.dim" />
                </view>
              </view>
              <view class="form-actions">
                <view class="btn btn-default" @click="resetEmbed"><text>恢复默认</text></view>
                <view class="btn btn-primary" @click="saveEmbed"><text>保存配置</text></view>
                <view class="btn btn-outline" @click="testEmbed"><text>测试嵌入</text></view>
              </view>
            </view>
          </view>

          <!-- 视觉大模型 -->
          <view v-else-if="activeGlobalTab === 'vision'" class="global-pane">
            <view class="desc-row">
              <text class="section-desc">配置视觉大模型服务商、API 密钥与对话参数，供图片识别、多模态场景及运营端文章编辑「AI文生图」调用</text>
              <label class="enable-check" @click="toggleEnable('vision')">
                <checkbox :checked="visionForm.enabled" color="#8B7CF6" style="transform:scale(0.8);" />
                <text>{{ visionForm.enabled ? '已启用' : '未启用' }}</text>
              </label>
            </view>
            <view class="form-card">
              <view class="form-row half-wrap">
                <view class="form-half">
                  <text class="form-label">配置名称</text>
                  <input class="form-input" v-model="visionForm.name" />
                </view>
                <view class="form-half">
                  <text class="form-label">服务商</text>
                  <picker :range="visionProviders" @change="onVisionProvider">
                    <view class="form-input picker"><text>{{ visionForm.provider }}</text></view>
                  </picker>
                </view>
              </view>
              <view class="form-row">
                <text class="form-label">API 地址</text>
                <input class="form-input" v-model="visionForm.apiUrl" />
              </view>
              <view class="form-row">
                <text class="form-label">API Key</text>
                <view class="key-wrap">
                  <input class="form-input" :password="!showVisionKey" v-model="visionForm.apiKey" placeholder="sk-..." />
                  <text class="key-toggle" @click="showVisionKey = !showVisionKey">{{ showVisionKey ? '隐藏' : '显示' }}</text>
                </view>
              </view>
              <view class="form-row half-wrap">
                <view class="form-half">
                  <text class="form-label">超时 (秒)</text>
                  <input class="form-input" type="number" v-model="visionForm.timeout" />
                </view>
                <view class="form-half">
                  <text class="form-label">温度</text>
                  <input class="form-input" type="digit" v-model="visionForm.temperature" />
                </view>
              </view>
              <view class="form-row">
                <text class="form-label">最大 Token</text>
                <input class="form-input narrow" type="number" v-model="visionForm.maxTokens" />
              </view>
              <view class="form-actions">
                <view class="btn btn-default" @click="resetVision"><text>恢复默认</text></view>
                <view class="btn btn-primary" @click="saveVision"><text>保存配置</text></view>
                <view class="btn btn-outline" @click="testVision"><text>测试大模型</text></view>
              </view>
            </view>
          </view>

          <!-- 数据库配置 -->
          <view v-else class="global-pane">
            <view class="db-alert">
              <text class="alert-title">中间 API 未连接（端口 3001）：</text>
              <text class="alert-warn">当前配置的端口 {{ dbForm.port || '3306' }} 是 MySQL 本身，浏览器不能直接连 MySQL。需要先连接本机 3001 端口的「AI 数据库 API」，再由该服务去访问 MySQL。请在项目根目录执行 npm run dev 启动后刷新。</text>
              <text class="alert-arch">架构说明：浏览器 → 3001（AI 数据库 API）→ {{ dbForm.port || '3306' }}（MySQL / {{ dbForm.database || 'guojimami' }}）。下方填写的是 MySQL 地址；若出现 Failed to fetch，说明 3001 服务未启动，不是 {{ dbForm.port || '3306' }} 填错。</text>
            </view>
            <view class="form-card">
              <view class="db-grid">
                <view class="form-field">
                  <text class="form-label">数据库类型</text>
                  <picker :range="dbTypes" @change="e => dbForm.type = dbTypes[e.detail.value]">
                    <view class="form-input picker"><text>{{ dbForm.type }}</text></view>
                  </picker>
                </view>
                <view class="form-field">
                  <text class="form-label">数据库地址</text>
                  <input class="form-input" v-model="dbForm.host" />
                </view>
                <view class="form-field">
                  <text class="form-label">端口</text>
                  <input class="form-input" v-model="dbForm.port" />
                </view>
                <view class="form-field">
                  <text class="form-label">用户名</text>
                  <input class="form-input" v-model="dbForm.user" />
                </view>
                <view class="form-field">
                  <text class="form-label">密码</text>
                  <view class="key-wrap">
                    <input class="form-input" :password="!showDbPass" v-model="dbForm.password" />
                    <text class="key-toggle" @click="showDbPass = !showDbPass">{{ showDbPass ? '隐藏' : '显示' }}</text>
                  </view>
                </view>
                <view class="form-field">
                  <text class="form-label">数据库名</text>
                  <input class="form-input" v-model="dbForm.database" />
                </view>
              </view>
              <view class="form-actions db-actions">
                <view class="btn btn-primary" @click="saveDb"><text>保存配置</text></view>
                <view class="btn btn-outline" @click="testDb"><text>测试数据库</text></view>
              </view>
            </view>
          </view>
        </view>

        <!-- AI配置 -->
        <view v-else-if="activeSub === 'ai'" class="llm-section">
          <view class="section-head">
            <text class="section-title">AI 配置</text>
            <text class="section-desc">配置 AI 导购、内容生成等业务的模型接入信息</text>
          </view>
          <view class="form-card ai-card">
            <view class="form-row">
              <text class="form-label">服务商</text>
              <picker :range="providerOptions" @change="e => aiForm.provider = providerOptions[e.detail.value]">
                <view class="form-input picker"><text>{{ aiForm.provider || '请选择' }}</text></view>
              </picker>
            </view>
            <view class="form-row">
              <text class="form-label">模型名称</text>
              <input class="form-input" v-model="aiForm.modelName" placeholder="例如 gpt-4o-mini / qwen-plus" />
            </view>
            <view class="form-row">
              <text class="form-label">API Base URL</text>
              <input class="form-input" v-model="aiForm.baseUrl" placeholder="https://api.example.com/v1" />
            </view>
            <view class="form-row">
              <text class="form-label">API Key</text>
              <view class="key-wrap">
                <input class="form-input" :password="!showAiKey" v-model="aiForm.apiKey" placeholder="请输入 API Key" />
                <text class="key-toggle" @click="showAiKey = !showAiKey">{{ showAiKey ? '隐藏' : '显示' }}</text>
              </view>
            </view>
            <view class="form-row">
              <text class="form-label">启用 AI 导购</text>
              <switch :checked="aiForm.guideEnabled" color="#8B7CF6" @change="e => aiForm.guideEnabled = !!(e.detail && e.detail.value)" />
            </view>
            <view class="form-row">
              <text class="form-label">启用页面生成</text>
              <switch :checked="aiForm.pageGenEnabled" color="#8B7CF6" @change="e => aiForm.pageGenEnabled = !!(e.detail && e.detail.value)" />
            </view>
            <view class="form-row top">
              <text class="form-label">导购人设</text>
              <textarea class="form-textarea" v-model="aiForm.guidePersona" :maxlength="1000" />
            </view>
            <view class="form-actions left">
              <view class="btn btn-outline" @click="testAiConn"><text>测试连接</text></view>
              <view class="btn btn-primary" @click="saveAi"><text>保存配置</text></view>
            </view>
          </view>
        </view>

        <!-- MCP 服务管理 -->
        <view v-else class="llm-section">
          <view class="section-head row">
            <view>
              <text class="section-title">MCP 服务管理</text>
              <text class="section-desc">管理可被大模型调用的 MCP 工具服务</text>
            </view>
            <view class="btn btn-primary" @click="onAddMcp"><text>添加服务</text></view>
          </view>
          <view class="mcp-list">
            <view v-if="!mcpList.length" class="mcp-empty">
              <text class="mcp-empty-title">暂无 MCP 服务</text>
              <text class="mcp-empty-tip">点击右上角「添加服务」接入工具能力</text>
            </view>
            <view v-for="item in mcpList" :key="item.id" class="mcp-card">
              <view class="mcp-card-top">
                <view class="mcp-name-wrap">
                  <text class="mcp-name">{{ item.name }}</text>
                  <text class="mcp-status" :class="item.statusKey">{{ item.status }}</text>
                </view>
                <view class="mcp-ops">
                  <text class="op-link" @click="onEditMcp(item)">编辑</text>
                  <text class="op-sep">|</text>
                  <text class="op-link" @click="toggleMcp(item)">{{ item.enabled ? '停用' : '启用' }}</text>
                  <text class="op-sep">|</text>
                  <text class="op-link danger" @click="onDeleteMcp(item)">删除</text>
                </view>
              </view>
              <text class="mcp-url">{{ item.url }}</text>
              <view class="mcp-meta">
                <text class="mcp-tag">{{ item.transport }}</text>
                <text class="mcp-tag">工具 {{ item.toolCount }} 个</text>
                <text class="mcp-time">更新 {{ item.updateTime }}</text>
              </view>
              <text v-if="item.desc" class="mcp-desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="mcpFormVisible" class="modal-mask" @click="closeMcpForm">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ mcpFormMode === 'edit' ? '编辑 MCP 服务' : '添加 MCP 服务' }}</text>
          <text class="modal-close" @click="closeMcpForm">×</text>
        </view>
        <view class="modal-body">
          <view class="form-row">
            <text class="form-label">服务名称</text>
            <input class="form-input" v-model="mcpForm.name" placeholder="请输入服务名称" />
          </view>
          <view class="form-row">
            <text class="form-label">服务地址</text>
            <input class="form-input" v-model="mcpForm.url" placeholder="例如 http://127.0.0.1:3100/sse" />
          </view>
          <view class="form-row">
            <text class="form-label">传输方式</text>
            <picker :range="transportOptions" @change="e => mcpForm.transport = transportOptions[e.detail.value]">
              <view class="form-input picker"><text>{{ mcpForm.transport || '请选择' }}</text></view>
            </picker>
          </view>
          <view class="form-row">
            <text class="form-label">工具数量</text>
            <input class="form-input" type="number" v-model="mcpForm.toolCount" placeholder="0" />
          </view>
          <view class="form-row top">
            <text class="form-label">备注说明</text>
            <textarea class="form-textarea" v-model="mcpForm.desc" placeholder="可选" :maxlength="300" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-default" @click="closeMcpForm"><text>取消</text></view>
          <view class="btn btn-primary" @click="submitMcpForm"><text>确定</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const LLM_STORAGE_KEY = 'zhuangyan_llm_settings_v2'

const PROVIDER_URLS = {
  DeepSeek: 'https://api.deepseek.com/v1',
  '本地大模型': 'http://127.0.0.1:11434/v1',
  OpenAI: 'https://api.openai.com/v1',
  'OpenAI 兼容': 'https://api.openai.com/v1',
  '通义千问': 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  '智谱AI': 'https://open.bigmodel.cn/api/paas/v4',
  '自定义': ''
}

const PROVIDER_MODELS = {
  DeepSeek: 'deepseek-chat',
  '本地大模型': 'qwen3.8:latest',
  OpenAI: 'gpt-4o-mini',
  '通义千问': 'qwen-plus',
  '智谱AI': 'glm-4-flash',
  '自定义': 'gpt-4o-mini'
}

const DEFAULT_CHAT = {
  name: '默认大模型',
  provider: 'DeepSeek',
  enabled: false,
  apiUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  timeout: '60',
  temperature: '0.7',
  maxTokens: '2048'
}

const DEFAULT_EMBED = {
  name: '默认嵌入模型',
  provider: 'OpenAI',
  enabled: false,
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'text-embedding-3-small',
  timeout: '60',
  dim: '1536'
}

const DEFAULT_VISION = {
  name: '默认视觉大模型',
  provider: 'OpenAI 兼容',
  enabled: false,
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  timeout: '60',
  temperature: '0.7',
  maxTokens: '2048'
}

const DEFAULT_DB = {
  type: 'MySQL',
  host: '127.0.0.1',
  port: '3306',
  user: 'root',
  password: 'password',
  database: 'guojimami'
}

const DEFAULT_AI = {
  provider: 'OpenAI 兼容',
  modelName: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  guideEnabled: true,
  pageGenEnabled: true,
  guidePersona: '你是美妆顾问妆小妍，根据肤质与场景推荐合适单品，语气亲切专业。'
}

const DEFAULT_MCP = [
  {
    id: 'MCP10001',
    name: '商品检索服务',
    url: 'http://127.0.0.1:3101/sse',
    transport: 'SSE',
    toolCount: 4,
    enabled: true,
    status: '已启用',
    statusKey: 'on',
    desc: '提供商品搜索、库存查询等工具',
    updateTime: '2026-08-20 10:20'
  },
  {
    id: 'MCP10002',
    name: '知识库检索',
    url: 'http://127.0.0.1:3102/sse',
    transport: 'SSE',
    toolCount: 2,
    enabled: false,
    status: '已停用',
    statusKey: 'off',
    desc: '对接内部成分与护肤知识库',
    updateTime: '2026-08-18 16:05'
  }
]

function nowStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
    + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

function loadStore() {
  try {
    if (typeof uni !== 'undefined' && uni.getStorageSync) {
      const raw = uni.getStorageSync(LLM_STORAGE_KEY)
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (parsed && typeof parsed === 'object') return parsed
      }
    }
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LLM_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') return parsed
      }
    }
  } catch (e) { /* ignore */ }
  return null
}

function saveStore(data) {
  try {
    const raw = JSON.stringify(data)
    if (typeof uni !== 'undefined' && uni.setStorageSync) uni.setStorageSync(LLM_STORAGE_KEY, raw)
    if (typeof localStorage !== 'undefined') localStorage.setItem(LLM_STORAGE_KEY, raw)
  } catch (e) { /* ignore */ }
}

export default {
  name: 'LlmManage',
  data() {
    const cached = loadStore() || {}
    return {
      activeSub: 'global',
      activeGlobalTab: 'chat',
      subMenus: [
        { id: 'global', name: '全局配置' },
        { id: 'ai', name: 'AI配置' },
        { id: 'mcp', name: 'MCP服务管理' }
      ],
      globalTabs: [
        { id: 'chat', name: '通用大模型' },
        { id: 'embed', name: '嵌入模型' },
        { id: 'vision', name: '视觉大模型' },
        { id: 'db', name: '数据库配置' }
      ],
      chatProviders: ['DeepSeek', '本地大模型', 'OpenAI', '通义千问', '智谱AI', '自定义'],
      embedProviders: ['OpenAI', '通义千问', '智谱AI', '自定义'],
      visionProviders: ['OpenAI 兼容', 'DeepSeek', '通义千问', '智谱AI', '自定义'],
      dbTypes: ['MySQL', 'PostgreSQL', 'MariaDB'],
      providerOptions: ['OpenAI 兼容', '通义千问', 'DeepSeek', '智谱 AI', '自定义'],
      transportOptions: ['SSE', 'stdio', 'WebSocket'],
      chatForm: { ...DEFAULT_CHAT, ...(cached.chat || {}) },
      embedForm: { ...DEFAULT_EMBED, ...(cached.embed || {}) },
      visionForm: { ...DEFAULT_VISION, ...(cached.vision || {}) },
      dbForm: { ...DEFAULT_DB, ...(cached.db || {}) },
      aiForm: { ...DEFAULT_AI, ...(cached.ai || {}) },
      showChatKey: false,
      showEmbedKey: false,
      showVisionKey: false,
      showDbPass: false,
      showAiKey: false,
      mcpList: Array.isArray(cached.mcp) ? cached.mcp : DEFAULT_MCP.map((x) => ({ ...x })),
      mcpFormVisible: false,
      mcpFormMode: 'add',
      mcpFormEditId: '',
      mcpForm: { name: '', url: '', transport: 'SSE', toolCount: '0', desc: '' }
    }
  },
  methods: {
    persist() {
      saveStore({
        chat: { ...this.chatForm },
        embed: { ...this.embedForm },
        vision: { ...this.visionForm },
        db: { ...this.dbForm },
        ai: { ...this.aiForm },
        mcp: this.mcpList.map((x) => ({ ...x }))
      })
    },
    toggleEnable(kind) {
      if (kind === 'chat') this.chatForm.enabled = !this.chatForm.enabled
      else if (kind === 'embed') this.embedForm.enabled = !this.embedForm.enabled
      else if (kind === 'vision') this.visionForm.enabled = !this.visionForm.enabled
    },
    applyProviderUrl(form, provider) {
      const url = PROVIDER_URLS[provider]
      if (url) form.apiUrl = url
    },
    onChatProvider(e) {
      const p = this.chatProviders[e.detail.value]
      this.chatForm.provider = p
      this.applyProviderUrl(this.chatForm, p)
      if (PROVIDER_MODELS[p]) this.chatForm.model = PROVIDER_MODELS[p]
      if (p === '本地大模型') {
        if (!this.chatForm.apiKey) this.chatForm.apiKey = 'ollama'
        if (!this.chatForm.name || this.chatForm.name === '默认大模型') this.chatForm.name = '本地大模型'
      }
    },
    onEmbedProvider(e) {
      const p = this.embedProviders[e.detail.value]
      this.embedForm.provider = p
      this.applyProviderUrl(this.embedForm, p)
    },
    onVisionProvider(e) {
      const p = this.visionProviders[e.detail.value]
      this.visionForm.provider = p
      this.applyProviderUrl(this.visionForm, p)
    },
    resetChat() {
      this.chatForm = { ...DEFAULT_CHAT }
      uni.showToast({ title: '已恢复默认', icon: 'none' })
    },
    saveChat() {
      if (!(this.chatForm.name || '').trim()) return uni.showToast({ title: '请填写配置名称', icon: 'none' })
      this.persist()
      uni.showToast({ title: '通用大模型配置已保存', icon: 'success' })
    },
    testChat() {
      if (!(this.chatForm.apiUrl || '').trim()) return uni.showToast({ title: '请先填写 API 地址', icon: 'none' })
      uni.showToast({ title: '大模型测试已发起（模拟成功）', icon: 'none' })
    },
    resetEmbed() {
      this.embedForm = { ...DEFAULT_EMBED }
      uni.showToast({ title: '已恢复默认', icon: 'none' })
    },
    saveEmbed() {
      this.persist()
      uni.showToast({ title: '嵌入模型配置已保存', icon: 'success' })
    },
    testEmbed() {
      if (!(this.embedForm.apiUrl || '').trim()) return uni.showToast({ title: '请先填写 API 地址', icon: 'none' })
      uni.showToast({ title: '嵌入模型测试已发起（模拟成功）', icon: 'none' })
    },
    resetVision() {
      this.visionForm = { ...DEFAULT_VISION }
      uni.showToast({ title: '已恢复默认', icon: 'none' })
    },
    saveVision() {
      this.persist()
      uni.showToast({ title: '视觉大模型配置已保存', icon: 'success' })
    },
    testVision() {
      if (!(this.visionForm.apiUrl || '').trim()) return uni.showToast({ title: '请先填写 API 地址', icon: 'none' })
      uni.showToast({ title: '视觉模型测试已发起（模拟成功）', icon: 'none' })
    },
    resetDb() {
      this.dbForm = { ...DEFAULT_DB }
      uni.showToast({ title: '已恢复默认', icon: 'none' })
    },
    saveDb() {
      if (!(this.dbForm.host || '').trim()) return uni.showToast({ title: '请先填写数据库地址', icon: 'none' })
      this.persist()
      uni.showToast({ title: '数据库配置已保存', icon: 'success' })
    },
    testDb() {
      if (!(this.dbForm.host || '').trim()) return uni.showToast({ title: '请先填写数据库地址', icon: 'none' })
      uni.request({
        url: 'http://127.0.0.1:3001/health',
        method: 'GET',
        success: () => {
          uni.showToast({ title: '中间 API 已连通', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '中间 API 未连接（3001）', icon: 'none' })
        }
      })
    },
    saveAi() {
      if (!this.aiForm.provider) return uni.showToast({ title: '请选择服务商', icon: 'none' })
      if (!(this.aiForm.modelName || '').trim()) return uni.showToast({ title: '请输入模型名称', icon: 'none' })
      this.persist()
      uni.showToast({ title: 'AI配置已保存', icon: 'success' })
    },
    testAiConn() {
      if (!(this.aiForm.baseUrl || '').trim()) {
        return uni.showToast({ title: '请先填写 API Base URL', icon: 'none' })
      }
      uni.showToast({ title: '连接测试已发起（模拟成功）', icon: 'none' })
    },
    onAddMcp() {
      this.mcpFormMode = 'add'
      this.mcpFormEditId = ''
      this.mcpForm = { name: '', url: '', transport: 'SSE', toolCount: '0', desc: '' }
      this.mcpFormVisible = true
    },
    onEditMcp(item) {
      this.mcpFormMode = 'edit'
      this.mcpFormEditId = item.id
      this.mcpForm = {
        name: item.name,
        url: item.url,
        transport: item.transport || 'SSE',
        toolCount: String(item.toolCount || 0),
        desc: item.desc || ''
      }
      this.mcpFormVisible = true
    },
    closeMcpForm() {
      this.mcpFormVisible = false
    },
    submitMcpForm() {
      const name = (this.mcpForm.name || '').trim()
      const url = (this.mcpForm.url || '').trim()
      if (!name) return uni.showToast({ title: '请输入服务名称', icon: 'none' })
      if (!url) return uni.showToast({ title: '请输入服务地址', icon: 'none' })
      const toolCount = Math.max(0, parseInt(this.mcpForm.toolCount, 10) || 0)
      if (this.mcpFormMode === 'edit' && this.mcpFormEditId) {
        const idx = this.mcpList.findIndex((x) => x.id === this.mcpFormEditId)
        if (idx >= 0) {
          const prev = this.mcpList[idx]
          this.$set(this.mcpList, idx, {
            ...prev,
            name,
            url,
            transport: this.mcpForm.transport || 'SSE',
            toolCount,
            desc: (this.mcpForm.desc || '').trim(),
            updateTime: nowStr()
          })
        }
        uni.showToast({ title: '已更新', icon: 'success' })
      } else {
        this.mcpList.unshift({
          id: 'MCP' + String(Date.now()).slice(-8),
          name,
          url,
          transport: this.mcpForm.transport || 'SSE',
          toolCount,
          enabled: true,
          status: '已启用',
          statusKey: 'on',
          desc: (this.mcpForm.desc || '').trim(),
          updateTime: nowStr()
        })
        uni.showToast({ title: '已添加', icon: 'success' })
      }
      this.persist()
      this.closeMcpForm()
    },
    toggleMcp(item) {
      const idx = this.mcpList.findIndex((x) => x.id === item.id)
      if (idx < 0) return
      const enabled = !item.enabled
      this.$set(this.mcpList, idx, {
        ...item,
        enabled,
        status: enabled ? '已启用' : '已停用',
        statusKey: enabled ? 'on' : 'off',
        updateTime: nowStr()
      })
      this.persist()
      uni.showToast({ title: enabled ? '已启用' : '已停用', icon: 'none' })
    },
    onDeleteMcp(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除「' + item.name + '」吗？',
        success: (res) => {
          if (!res.confirm) return
          this.mcpList = this.mcpList.filter((x) => x.id !== item.id)
          this.persist()
          uni.showToast({ title: '已删除', icon: 'success' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.llm-manage { min-height: 640rpx; }

.llm-layout {
  display: flex;
  min-height: 720rpx;
  background: #fff;
}

.llm-sider {
  width: 260rpx;
  flex-shrink: 0;
  padding: 16rpx 20rpx;
  border-right: 1px solid #F0ECF8;
}

.llm-sider-item {
  padding: 22rpx 28rpx;
  margin-bottom: 8rpx;
  border-radius: 16rpx;
  cursor: pointer;
}

.llm-sider-item:hover { background: rgba(139, 124, 246, 0.06); }

.llm-sider-item.active {
  background: #F0EBFF;
}

.llm-sider-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.llm-sider-item.active .llm-sider-label {
  color: #8B7CF6;
  font-weight: 600;
}

.llm-main {
  flex: 1;
  min-width: 0;
  padding: 16rpx 40rpx 40rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 16rpx;
}

.section-desc {
  display: block;
  margin: 16rpx 0 28rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.desc-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  margin: 16rpx 0 28rpx;
}

.desc-row .section-desc {
  margin: 0;
  flex: 1;
  min-width: 0;
}

.desc-row .enable-check {
  flex-shrink: 0;
  padding-left: 0;
  margin-top: 0;
}

.db-alert {
  margin: 16rpx 0 28rpx;
  padding: 24rpx 28rpx;
  background: #F5F0FF;
  border: 1px solid #E8E0FA;
  border-radius: 16rpx;
}

.db-alert .alert-title {
  display: block;
  color: #C45C8A;
  font-size: 24rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.db-alert .alert-warn {
  display: block;
  color: #C45C8A;
  font-size: 22rpx;
  line-height: 1.7;
  margin-bottom: 12rpx;
}

.db-alert .alert-arch {
  display: block;
  color: #444;
  font-size: 22rpx;
  line-height: 1.7;
}

.db-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx 32rpx;
  max-width: 980rpx;
}

.db-grid .form-field {
  width: calc(50% - 16rpx);
  flex: 0 0 calc(50% - 16rpx);
}

.form-actions.db-actions {
  padding-left: 170rpx;
  margin-top: 36rpx;
}

.section-head {
  margin-bottom: 24rpx;
  &.row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
  }
}

.llm-tabs {
  display: flex;
  align-items: center;
  gap: 48rpx;
  border-bottom: 1px solid #F0ECF8;
  margin-bottom: 8rpx;
}

.llm-tab {
  position: relative;
  padding: 18rpx 4rpx 22rpx;
  font-size: 28rpx;
  color: #666;
  cursor: pointer;
}

.llm-tab.active {
  color: #8B7CF6;
  font-weight: 600;
}

.llm-tab.active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 4rpx;
  background: #8B7CF6;
  border-radius: 4rpx;
}

.form-card { max-width: 980rpx; }
.form-card.ai-card {
  background: #FAFAFC;
  border: 1px solid #EEEAF5;
  border-radius: 16rpx;
  padding: 8rpx 28rpx 28rpx;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 16rpx 0;
  &.top { align-items: flex-start; }
}

.form-row.with-enable {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24rpx;
}

.form-row.half-wrap {
  display: flex;
  gap: 32rpx;
}

.form-field, .form-half {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.form-label {
  width: 150rpx;
  flex-shrink: 0;
  font-size: 26rpx;
  color: #555;
  text-align: right;
  line-height: 72rpx;
}

.form-input {
  flex: 1;
  height: 72rpx;
  padding: 0 28rpx;
  background: #F5F3FA;
  border: none;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #222;
  box-sizing: border-box;
  &.picker {
    display: flex;
    align-items: center;
  }
  &.narrow { max-width: 420rpx; }
}

.form-textarea {
  flex: 1;
  min-height: 160rpx;
  padding: 16rpx 28rpx;
  background: #F5F3FA;
  border: none;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #222;
  box-sizing: border-box;
  width: 100%;
}

.key-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  align-items: center;
}

.key-wrap .form-input { padding-right: 90rpx; width: 100%; }

.key-toggle {
  position: absolute;
  right: 28rpx;
  font-size: 26rpx;
  color: #8B7CF6;
}

.enable-check {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  padding-left: 8rpx;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 20rpx;
  margin-top: 40rpx;
  padding-left: 170rpx;
  &.left { padding-left: 0; }
}

.btn {
  min-width: 180rpx;
  height: 72rpx;
  padding: 0 36rpx;
  border-radius: 999rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}
.btn-primary { background: #8B7CF6; color: #fff; }
.btn-default {
  background: #F3F4F6;
  color: #555;
}
.btn-outline {
  background: #fff;
  color: #8B7CF6;
  border: 1px solid #8B7CF6;
}

.mcp-list { display: flex; flex-direction: column; gap: 20rpx; }
.mcp-empty {
  min-height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: #FAFAFC;
  border-radius: 16rpx;
  border: 1px dashed #E5E0F0;
}
.mcp-empty-title { font-size: 30rpx; font-weight: 600; color: #333; }
.mcp-empty-tip { font-size: 24rpx; color: #AAA; }
.mcp-card {
  padding: 24rpx 28rpx;
  background: #FAFAFC;
  border: 1px solid #EEEAF5;
  border-radius: 16rpx;
}
.mcp-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}
.mcp-name-wrap { display: flex; align-items: center; gap: 12rpx; min-width: 0; }
.mcp-name { font-size: 28rpx; font-weight: 600; color: #222; }
.mcp-status {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  &.on { color: #059669; background: #ECFDF5; }
  &.off { color: #9CA3AF; background: #F3F4F6; }
}
.mcp-ops { display: flex; align-items: center; gap: 8rpx; flex-shrink: 0; }
.op-link {
  font-size: 24rpx;
  color: #4A3CB0;
  &.danger { color: #FF5B6B; }
}
.op-sep { color: #D1D5DB; font-size: 22rpx; }
.mcp-url {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
}
.mcp-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}
.mcp-tag {
  font-size: 20rpx;
  color: #6B5CAD;
  background: #F0EBFF;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.mcp-time { font-size: 20rpx; color: #AAA; }
.mcp-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #888;
  line-height: 1.5;
}

.modal-mask {
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  width: 680rpx;
  max-width: 92vw;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1px solid #F0ECF8;
}
.modal-title { font-size: 30rpx; font-weight: 700; color: #222; }
.modal-close { font-size: 40rpx; color: #999; line-height: 1; }
.modal-body { padding: 12rpx 32rpx 8rpx; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 32rpx 28rpx;
}
</style>
