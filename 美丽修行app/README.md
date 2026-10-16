# 阅己美妆

科学美妆助手 App 骨架项目，基于 uni-app (Vue 3) 构建。

## 功能模块

| Tab | 页面 | 说明 |
|-----|------|------|
| 首页 | `pages/home/index` | 应用主页 |
| 发现 | `pages/discover/index` | 内容发现 |
| 测肤 | `pages/skin-test/index` | 肌肤检测 |
| 阅己盒 | `pages/beauty-box/index` | 美妆试用盒 |
| 我的 | `pages/profile/index` | 个人中心 |

当前各页面为空白占位，后续可逐步填充内容。

## 设计风格

- **主色**：`#7B5EA7`（优雅紫）
- **背景**：`#F8F6FC`（淡紫灰）
- **风格**：简约大气，留白充足

## 运行方式

### 方式一：HBuilderX（推荐，无需命令行）

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 文件 → 导入 → 从本地目录导入，选择本项目文件夹
3. 运行 → 运行到浏览器 / 运行到手机模拟器

### 方式二：命令行

需先安装 [Node.js](https://nodejs.org/)，然后在项目目录执行：

```bash
npm install
npm run dev:h5
```

浏览器访问控制台输出的本地地址即可预览。

## 项目结构

```
美丽修行app/          # 项目目录（产品名：阅己美妆）
├── pages/              # 页面
│   ├── home/           # 首页
│   ├── discover/       # 发现
│   ├── skin-test/      # 测肤
│   ├── beauty-box/     # 阅己盒
│   └── profile/        # 我的
├── static/tabbar/      # 底部导航图标
├── App.vue             # 应用入口
├── main.js             # 主入口
├── pages.json          # 页面与 tabBar 配置
├── manifest.json       # 应用配置
└── uni.scss            # 全局主题变量
```

## 重新生成 Tab 图标

```bash
python scripts/generate_icons.py
```
