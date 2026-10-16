/**
 * 通用大模型（OpenAI 兼容）· 运营「大模型配置」↔ App AI导购/客服
 * 读取 zhuangyan_llm_settings_v2.chat / .vision
 */
(function (global) {
  var LLM_KEY = 'zhuangyan_llm_settings_v2';
  var VISION_SYNC_MSG = 'llm-vision-sync';
  var PROXY_BASES = ['http://127.0.0.1:3789', 'http://127.0.0.1:3001'];

  var PROVIDER_MODELS = {
    DeepSeek: 'deepseek-chat',
    '本地大模型': 'qwen3.8:latest',
    OpenAI: 'gpt-4o-mini',
    'OpenAI 兼容': 'gpt-4o-mini',
    '通义千问': 'qwen-plus',
    '智谱AI': 'glm-4-flash',
    '自定义': 'gpt-4o-mini'
  };

  var VISION_PROVIDER_MODELS = {
    DeepSeek: 'deepseek-chat',
    OpenAI: 'gpt-4o-mini',
    'OpenAI 兼容': 'gpt-4o-mini',
    '通义千问': 'qwen-vl-plus',
    '智谱AI': 'glm-4v-flash',
    '自定义': 'qwen-vl-plus'
  };

  function loadRaw() {
    try {
      var raw = localStorage.getItem(LLM_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function getChatConfig() {
    var store = loadRaw() || {};
    var chat = store.chat || {};
    var provider = chat.provider || 'DeepSeek';
    return {
      name: chat.name || '默认大模型',
      provider: provider,
      enabled: !!chat.enabled,
      apiUrl: String(chat.apiUrl || '').replace(/\/+$/, ''),
      apiKey: chat.apiKey || '',
      model: chat.model || PROVIDER_MODELS[provider] || 'deepseek-chat',
      timeout: Number(chat.timeout) || 60,
      temperature: chat.temperature != null ? Number(chat.temperature) : 0.7,
      maxTokens: Number(chat.maxTokens) || 2048
    };
  }

  function getVisionConfig() {
    var store = loadRaw() || {};
    var vision = store.vision || {};
    var provider = vision.provider || '通义千问';
    return {
      name: vision.name || '阿里云百炼视觉大模型',
      provider: provider,
      enabled: !!vision.enabled,
      apiUrl: String(vision.apiUrl || '').replace(/\/+$/, ''),
      apiKey: vision.apiKey || '',
      model: vision.model || VISION_PROVIDER_MODELS[provider] || 'qwen-vl-plus',
      timeout: Number(vision.timeout) || 60,
      temperature: vision.temperature != null ? Number(vision.temperature) : 0.7,
      maxTokens: Number(vision.maxTokens) || 2048
    };
  }

  function isVisionReady() {
    var cfg = getVisionConfig();
    return !!(cfg.enabled && cfg.apiUrl && cfg.apiKey);
  }

  function chatCompletionsUrl(apiUrl) {
    var base = String(apiUrl || '').replace(/\/+$/, '');
    if (!base) return '';
    if (/\/chat\/completions$/i.test(base)) return base;
    return base + '/chat/completions';
  }

  function extractText(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    var choice = data.choices && data.choices[0];
    if (choice && choice.message && choice.message.content) {
      var c = choice.message.content;
      if (typeof c === 'string') return c;
      if (Array.isArray(c)) {
        return c.map(function (part) {
          if (!part) return '';
          if (typeof part === 'string') return part;
          if (part.text) return String(part.text);
          if (part.type === 'text' && part.text) return String(part.text);
          return '';
        }).join('');
      }
      return String(c);
    }
    if (choice && choice.text) return String(choice.text);
    if (data.output_text) return String(data.output_text);
    return '';
  }

  function fetchWithTimeout(url, options, timeoutSec) {
    var ms = Math.max(5, Number(timeoutSec) || 60) * 1000;
    if (typeof AbortController === 'undefined') {
      return fetch(url, options);
    }
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    options = options || {};
    options.signal = ctrl.signal;
    return fetch(url, options).finally(function () { clearTimeout(timer); });
  }

  function isLocalLlm(cfg) {
    if (!cfg) return false;
    if (cfg.provider === '本地大模型') return true;
    return /127\.0\.0\.1|localhost/i.test(String(cfg.apiUrl || ''));
  }

  function pingUrl(url, timeoutSec) {
    return fetchWithTimeout(url, { method: 'GET' }, timeoutSec || 3).then(function (res) {
      return res.ok;
    }).catch(function () {
      return false;
    });
  }

  /** 探测本机 LLM 代理是否已启动（3789 / 3001） */
  function pingProxy() {
    function tryNext(idx) {
      if (idx >= PROXY_BASES.length) return Promise.resolve({ ok: false, base: '' });
      var base = PROXY_BASES[idx];
      return pingUrl(base + '/api/health', 2).then(function (ok) {
        if (ok) return { ok: true, base: base };
        return tryNext(idx + 1);
      });
    }
    return tryNext(0);
  }

  /** 探测本地 Ollama 是否在跑（浏览器可能因 CORS 判失败，仅作参考） */
  function pingOllama(apiUrl) {
    var base = String(apiUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '').replace(/\/v1$/i, '');
    return pingUrl(base + '/api/tags', 2);
  }

  function callDirect(cfg, messages, overrides) {
    var url = chatCompletionsUrl(cfg.apiUrl);
    if (!url) return Promise.reject(new Error('未配置 API 地址'));
    var apiKey = cfg.apiKey || (isLocalLlm(cfg) ? 'ollama' : '');
    if (!apiKey) return Promise.reject(new Error('未配置 API Key'));
    var body = {
      model: (overrides && overrides.model) || cfg.model,
      messages: messages,
      temperature: overrides && overrides.temperature != null
        ? Number(overrides.temperature)
        : cfg.temperature,
      max_tokens: overrides && overrides.maxTokens != null
        ? Number(overrides.maxTokens)
        : cfg.maxTokens
    };
    var headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
    return fetchWithTimeout(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    }, cfg.timeout).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var msg = (data && (data.error && data.error.message || data.message)) || ('HTTP ' + res.status);
          throw new Error(msg);
        }
        var text = extractText(data).trim();
        if (!text) throw new Error('大模型返回为空');
        return { text: text, raw: data, via: 'direct' };
      });
    });
  }

  function callProxy(cfg, messages, overrides) {
    var payload = {
      apiUrl: cfg.apiUrl,
      apiKey: cfg.apiKey || (isLocalLlm(cfg) ? 'ollama' : ''),
      model: (overrides && overrides.model) || cfg.model,
      temperature: overrides && overrides.temperature != null
        ? Number(overrides.temperature)
        : cfg.temperature,
      max_tokens: overrides && overrides.maxTokens != null
        ? Number(overrides.maxTokens)
        : cfg.maxTokens,
      messages: messages,
      allowEmptyKey: isLocalLlm(cfg)
    };
    function tryNext(idx) {
      if (idx >= PROXY_BASES.length) {
        return Promise.reject(new Error(
          '本地代理未启动（端口 3789）。\n请打开终端执行：\ncd /d "d:\\微信\\项目1\\server"\nnpm run dev\n启动成功后再点「测试大模型」。'
        ));
      }
      return fetchWithTimeout(PROXY_BASES[idx] + '/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, cfg.timeout).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || (data && data.ok === false)) {
            throw new Error((data && data.error) || ('upstream HTTP ' + res.status));
          }
          var text = (data && data.text) || extractText(data && data.raw);
          text = String(text || '').trim();
          if (!text) throw new Error('大模型返回为空');
          return { text: text, raw: data && data.raw, via: 'proxy' };
        });
      }).catch(function (err) {
        var msg = err && err.message ? String(err.message) : '';
        /* 仅网络连不上时换端口；上游业务错误直接抛出 */
        if (!msg || /Failed to fetch|NetworkError|Aborted|abort|ECONNREFUSED|Load failed/i.test(msg)) {
          return tryNext(idx + 1);
        }
        return Promise.reject(err);
      });
    }
    return tryNext(0);
  }

  function runChat(cfg, messages, overrides) {
    if (!cfg.enabled) {
      return Promise.reject(new Error('大模型未启用，请在运营端勾选「已启用」并保存'));
    }
    if (!cfg.apiUrl) {
      return Promise.reject(new Error('请先在运营端填写 API 地址并保存'));
    }
    if (!cfg.apiKey && !isLocalLlm(cfg)) {
      return Promise.reject(new Error('请先在运营端填写 API 地址与 API Key 并保存'));
    }
    if (overrides && overrides.forceProxy) {
      return callProxy(cfg, messages, overrides);
    }
    /* 本地模型：浏览器直连常被 CORS 拦，优先走代理 */
    if (isLocalLlm(cfg)) {
      return callProxy(cfg, messages, overrides).catch(function (proxyErr) {
        return callDirect(cfg, messages, overrides).catch(function () {
          return Promise.reject(proxyErr);
        });
      });
    }
    /* 云端：直连失败后再走本机代理 */
    return callDirect(cfg, messages, overrides).catch(function () {
      return callProxy(cfg, messages, overrides);
    });
  }

  /**
   * @param {Array<{role:string,content:string|Array}>} messages
   * @param {{temperature?:number,maxTokens?:number,model?:string,forceProxy?:boolean}=} overrides
   */
  function chat(messages, overrides) {
    return runChat(getChatConfig(), messages, overrides);
  }

  /**
   * 视觉/多模态对话（读取运营端「视觉大模型」配置）
   * content 可为字符串，或 OpenAI 兼容的多模态数组（含 image_url）
   */
  function visionChat(messages, overrides) {
    return runChat(getVisionConfig(), messages, overrides);
  }

  function testConnection() {
    return chat([
      { role: 'system', content: '你是连通性测试助手，只回复：ok' },
      { role: 'user', content: 'ping' }
    ], { maxTokens: 16, temperature: 0 });
  }

  function testVisionConnection() {
    return visionChat([
      { role: 'system', content: '你是连通性测试助手，只回复：ok' },
      { role: 'user', content: 'ping' }
    ], { maxTokens: 16, temperature: 0 });
  }

  /** 组装含图片的 user content（dataURL / http URL） */
  function buildImageUserContent(text, imageUrl) {
    var parts = [];
    var t = String(text || '').replace(/^\s+|\s+$/g, '');
    if (t) parts.push({ type: 'text', text: t });
    if (imageUrl) {
      parts.push({
        type: 'image_url',
        image_url: { url: String(imageUrl) }
      });
    }
    if (!parts.length) parts.push({ type: 'text', text: '请描述这张图片' });
    return parts;
  }

  function broadcastVision(visionCfg) {
    var payload = {
      type: VISION_SYNC_MSG,
      payload: visionCfg || getVisionConfig()
    };
    try {
      if (typeof window !== 'undefined') {
        window.postMessage(payload, '*');
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, '*');
        }
        try {
          localStorage.setItem('zhuangyan_llm_vision_ping', String(Date.now()));
        } catch (ePing) { /* ignore */ }
        try {
          window.dispatchEvent(new CustomEvent('llm-vision-updated', { detail: payload.payload }));
        } catch (eEv) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
    return payload;
  }

  global.LlmChat = {
    LLM_KEY: LLM_KEY,
    VISION_SYNC_MSG: VISION_SYNC_MSG,
    getChatConfig: getChatConfig,
    getVisionConfig: getVisionConfig,
    isVisionReady: isVisionReady,
    isLocalLlm: isLocalLlm,
    pingProxy: pingProxy,
    pingOllama: pingOllama,
    chat: chat,
    visionChat: visionChat,
    testConnection: testConnection,
    testVisionConnection: testVisionConnection,
    buildImageUserContent: buildImageUserContent,
    broadcastVision: broadcastVision,
    PROVIDER_MODELS: PROVIDER_MODELS,
    VISION_PROVIDER_MODELS: VISION_PROVIDER_MODELS
  };
})(typeof window !== 'undefined' ? window : this);
