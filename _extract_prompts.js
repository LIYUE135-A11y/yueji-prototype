const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const html = fs.readFileSync(path.join(root, '运营管理系统', 'preview.html'), 'utf8');
const store = fs.readFileSync(path.join(root, 'common', 'ai-config-store.js'), 'utf8');

function fromQuoted(src, key) {
  // match prompt: '....' after key block - take longest prompt near key
  const idx = src.indexOf(key + ':');
  if (idx < 0) return '';
  const slice = src.slice(idx, idx + 8000);
  const m = slice.match(/prompt:\s*'((?:\\'|[^'])*)'/);
  if (!m) return '';
  return m[1]
    .replace(/\\n/g, '\n')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
}

function fromTextarea(html, id) {
  const re = new RegExp('<textarea[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)</textarea>');
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

const mods = [
  { key: 'kefu', name: 'AI客服', file: '01-AI客服.md', ta: 'aiKefuPrompt' },
  { key: 'daogou', name: 'AI导购', file: '02-AI导购.md', ta: 'aiDaogouPrompt' },
  { key: 'shitu', name: 'AI识图', file: '03-AI识图.md', ta: 'aiShituPrompt' },
  { key: 'zhuanxie', name: 'AI撰写', file: '04-AI撰写.md', ta: 'aiZhuanxiePrompt' },
  { key: 'shenhe', name: 'AI商品审核', file: '05-AI商品审核.md', ta: 'aiShenhePrompt' },
  { key: 'nrsh', name: 'ai内容审核', file: '06-ai内容审核.md', ta: 'aiNrshPrompt' },
  { key: 'wenst', name: 'ai文生图', file: '07-ai文生图.md', ta: 'aiWenstPrompt' },
  { key: 'cefu', name: 'AI测肤', file: '08-AI测肤.md', ta: 'aiCefuPrompt' },
  { key: 'bangzhu', name: 'AI帮助', file: '09-AI帮助.md', ta: 'aiBangzhuPrompt' }
];

const outDir = path.join(root, '10提示词工程');
fs.mkdirSync(outDir, { recursive: true });

const indexRows = [];

mods.forEach((mod) => {
  let prompt = fromTextarea(html, mod.ta);
  if (!prompt || prompt.length < 80) {
    prompt = fromQuoted(html, mod.key) || fromQuoted(store, mod.key);
  }
  // prefer longer of textarea vs defaults
  const qHtml = fromQuoted(html, mod.key);
  const qStore = fromQuoted(store, mod.key);
  [qHtml, qStore, prompt].forEach((p) => {
    if (p && p.length > (prompt || '').length) prompt = p;
  });

  const meta = {
    kefu: { temp: '0.5', maxTokens: '2048', source: 'common/ai-config-store.js → DEFAULTS.kefu.prompt' },
    daogou: { temp: '0.7', maxTokens: '2048', source: 'DEFAULTS.daogou.prompt' },
    shitu: { temp: '0.4', maxTokens: '2048', source: 'DEFAULTS.shitu.prompt' },
    zhuanxie: { temp: '0.7', maxTokens: '2048', source: 'DEFAULTS.zhuanxie.prompt' },
    shenhe: { temp: '0.2', maxTokens: '2048', source: '运营 preview AICFG_DEFAULTS / textarea' },
    nrsh: { temp: '0.2', maxTokens: '2048', source: 'DEFAULTS.nrsh.prompt' },
    wenst: { temp: '0.8', maxTokens: '2048', source: '运营 preview AICFG_DEFAULTS / textarea' },
    cefu: { temp: '0.4', maxTokens: '2048', source: 'DEFAULTS.cefu.prompt' },
    bangzhu: { temp: '0.6', maxTokens: '900', source: 'DEFAULTS.bangzhu.prompt' }
  }[mod.key];

  const body = [
    `# ${mod.name} · 系统提示词`,
    '',
    '| 项 | 内容 |',
    '|---|---|',
    `| 模块名称 | ${mod.name} |`,
    `| 配置键 | \`${mod.key}\` |`,
    `| 默认温度 | ${meta.temp} |`,
    `| 默认 maxTokens | ${meta.maxTokens} |`,
    `| 提取来源 | ${meta.source}；运营「AI配置 → ${mod.name}」可覆盖 |`,
    `| 提取日期 | 2026-09-08 |`,
    '',
    '---',
    '',
    '## 系统提示词（默认）',
    '',
    '```text',
    prompt.trim(),
    '```',
    '',
    '---',
    '',
    '## 使用说明',
    '',
    '- 运行时以运营端保存后的 `zhuangyan_ai_config_v1` 中该模块 `prompt` 为准。',
    '- 本文件为仓库默认基线，便于提示词工程评审与版本对比。',
    ''
  ].join('\n');

  fs.writeFileSync(path.join(outDir, mod.file), body, 'utf8');
  indexRows.push(`| ${mod.file} | ${mod.name} | \`${mod.key}\` | ${prompt.trim().length} 字 |`);
  console.log(mod.key, 'chars=', prompt.trim().length);
});

const readme = [
  '# 10 · 提示词工程',
  '',
  '> 美丽修行九大 AI 模块 **系统提示词（默认基线）** 提取归档。  ',
  '> 真相源：`common/ai-config-store.js` + 运营 `preview.html` AI配置表单；运行时以 localStorage 已保存配置为准。',
  '',
  '## 模块索引',
  '',
  '| 文件 | 模块 | 配置键 | 提示词长度 |',
  '|------|------|--------|------------|',
  ...indexRows,
  '',
  '## 工程约定',
  '',
  '1. 改提示词优先在运营「大模型配置 → AI配置」保存，或同步改 `ai-config-store.js` DEFAULTS。  ',
  '2. `shenhe` / `nrsh` 必须保持 prompt 分离，禁止混用。  ',
  '3. 事实类模块（客服/导购）配合检索约束；审核类强制首行「通过/驳回」。  ',
  '4. 版本迭代时在本目录追加变更记录（日期 + 改动摘要）。',
  '',
  '## 变更记录',
  '',
  '| 日期 | 说明 |',
  '|------|------|',
  '| 2026-09-08 | 首版：从工程默认配置提取九大模块系统提示词 |',
  ''
].join('\n');

fs.writeFileSync(path.join(outDir, 'README.md'), readme, 'utf8');
console.log('done', outDir);
