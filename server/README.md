# 美丽修行 · 数据库 API

连接本地 MySQL，为运营后台与 App 预览提供数据持久化。

## 连接信息

| 项 | 值 |
|---|---|
| 主机 | `localhost` |
| 端口 | `3306` |
| 用户 | `root` |
| 密码 | `123456` |
| 数据库 | `meilixiuxing` |
| API | `http://localhost:3789` |

## 启动

```bash
cd server
npm start
```

启动成功后打开项目根目录 `index.html`，运营各模块数据会经 `db-bridge` 自动读写 MySQL 表 `app_store`。

## 一键灌入运营模块（推荐）

将商品 / 商家 / 订单 / 评价 / 售后 / 用户 / 活动 / 社区 / 客服 / 装修页写入 `app_store` + 对应结构化表：

```bash
cd server
npm run seed:all-ops
```

仅商家·订单·评价·售后·装修页：

```bash
cd server
npm run seed:ops
```

| 模块 | app_store key | 结构化表 |
|------|---------------|----------|
| 商品管理 | `zhuangyan_product_list_v2` | `spgl`（另见 seed:spgl） |
| 商家管理 | `zhuangyan_merchant_list_v1` | `sjgl` |
| 订单管理 | `zhuangyan_order_list_v1` | `ddgl` |
| 评价管理 | `zhuangyan_review_list_v1` | `pjgl` |
| 售后管理 | `zhuangyan_aftersale_list_v1` | `shgl` |
| 用户管理 | `yueji_user_list_v4` | `yhgl` |
| 活动管理 | `zhuangyan_activity_list_v2` | `hdgl` |
| 店铺装修 | `zhuangyan_decor_pages_v1` / `zhuangyan_decor_entries_v1` | `dpzx` |
| 社区管理 | `yueji_*_list_v2` | `wzgl`/`zcgl`/`qzgl`/`htgl`/`dtgl` |
| 知识库·AI帮助 | `zhuangyan_ai_help_articles_v1` | `AIBANGZHUAI` |
| 人工客服接待台 | `zhuangyan_kefu_sessions_v2` | `kfgl` + 知识表 |

运营端改列表会经 localStorage → `db-bridge` 写回 MySQL，刷新后以库为准同步。

## 用户管理测试数据（100 条）

写入 `yhgl` 表 + `app_store.yueji_user_list_v4`（含省市区家庭地址等完整字段）：

```bash
cd server
npm run seed:users
```

启动 API 后硬刷新运营端「用户管理」，即可从数据库同步出 100 条。若本地仍是旧的 1001 条缓存，刷新后会自动裁剪到 100，或清一次 `yueji_user_list_v4`。

## 商品管理测试数据（100 条美妆）

写入 `app_store.zhuangyan_product_list_v2`（含规格/色号/肤质/成分/备案等扩展字段）：

```bash
cd server
npm run seed:products
```

启动 API 后硬刷新运营端「商品管理」。若本地仍是旧缓存，清一次该站点 `zhuangyan_product_list_v1/v2` 或再刷新。

## 活动管理测试数据（每类型 100 条，共 600）

写入 `app_store.zhuangyan_activity_list_v2`（同步写 v1）+ 结构化表 `hdgl`：

```bash
cd server
npm run seed:activities
```

启动 API 后硬刷新运营端「活动管理」。种子版本为 `v3-100-per-type`（满减/满折/秒杀/拼团/优惠券/满赠各 100 条），旧缓存会自动覆盖。

## 知识库管理会话测试数据（每类型 100 条，共 300）

写入 `app_store.zhuangyan_kefu_sessions_v2`（同步写 v1）+ 结构化表 `kfgl`：

```bash
cd server
npm run seed:kefu-sessions
```

启动 API 后硬刷新运营端「知识库管理 · 会话」。种子版本 `v2-100-per-type`（AI智能客服 / 人工客服 / 转人工各 100）。

## AI 导购问题管理测试数据（每评价 100 条，共 400）

写入 `app_store.ai_guide_card_feedback_v2`（同步写 v1）+ 结构化表 `dgwt`：

```bash
cd server
npm run seed:aiguide-feedback
```

启动 API 后硬刷新运营端「AI导购问题管理」。种子版本 `v2-100-per-score`（满意/一般/不满意/跳过各 100）。旧缓存不足会自动重灌。

## 知识库 · AI帮助（用户小白操作手册）

写入 `app_store.zhuangyan_ai_help_articles_v1` + 版本 key + 结构化表 `AIBANGZHUAI`（库 `meilixiuxing`）：

```bash
cd server
npm run seed:ai-help
```

启动 API 后硬刷新运营端「知识库管理 → AI帮助」。运营改列表会经 `db-bridge` 自动写回 MySQL；点「同步刷新」会按手册 SEED 重置并推库。

## 知识库管理表（一次性灌库）

从运营端「知识库管理」四页列表写入独立表（字段为中文列名拼音首字母）：

```bash
cd server
npm run seed:kefu
```

| 表名 | 对应页签 | 主要字段 |
|------|----------|----------|
| `chanpinjieda` | 产品解答 | hh/sp/pp/pl/syfz/yfyd/gjcf/kfjeyd |
| `dingdan` | 订单 | ddh/mj/sp/sf/ddzt/wl/kfgjhs |
| `shouhou` | 售后 | shdh/ddh/lx/mj/sp/zt/clr/kfcljy |
| `quanyi` | 权益 | qylx/yh/gldh/glnr/yhje/sygz/djsm/kfdyd |

查询接口：`GET /api/kefu/knowledge`（App AI 客服会拉取到本地缓存）。

## 接口

- `GET /api/health` — 连通性检查
- `GET /api/stores` — 拉取全部业务数据
- `GET /api/stores/:key` — 按 key 读取
- `PUT /api/stores/:key` — 保存单组数据 `{ "value": ... }`
- `POST /api/stores/sync` — 批量同步 `{ "stores": { key: value } }`
