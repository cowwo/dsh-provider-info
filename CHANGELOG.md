# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2026-09-10

### Changed
- 徽章样式改为**「键帽（kbd）」**：`4px` 圆角 + 浅底（`bg-layer-3`）+ `0.5px` 描边 + `0 1px 0` 底部阴影；`10px` 字号、`14px` 行高、`1px 5px` 内边距、`17px` 最小高、字重 `600`，文字色 `label-secondary`，去掉原来的 `letterSpacing`。
  - 几何自洽：`14px` 行高 + `1px×2` 内边距 + `0.5px×2` 描边 = `17px`，正好等于 `minHeight`，盒子不虚高。
  - 描边取 `0.5px`、圆角取 `4px`：前者是 DSH 自身惯例（主题包内多处 `.5px solid`），后者落在 DSH 的「小标签档」（2–6px）内，与旁边 `8px` 的模型座同属一个体系 —— 原来的 `999px` 胶囊其实是用错了档位。
  - 字重提到 `600` 是补偿字号缩小：`10px` 下 `500` 会发虚，`600` 才能保持笔画清晰。
  - 相比原样式层级更正确：原样式的描边 + 底色配合 `10px` 字号，使这个「配角」比纯文字的模型座视觉重量更重。
  - **两条承载路径同步更新**：官方槽位徽章（`makeSlotBadge`）与旧版 DOM 注入回退（`installProviderBadge`）使用同一套样式，避免旧版 DSH 回退时观感不一致。
  - 徽章与模型选择器间距由 `4px` 进一步收紧到 `2px`（`BADGE_GAP_PULL` 8 → 10）：DSH 的 `.trailing` 容器为 `gap: 12px`，用负 `margin-right` 抵消 `10px` 得到 `2px`。
  - 选型来自 `badge-styles.html` 预览页的 16 个候选（圆角系 / 非圆角系 / 其他方向三组）。
- 余量区块行顺序调整为 **`5h` → `7d` → `30d` → `到期`**：月度额度行（`30d`）的数据仍先算好，但延后到所有窗口行之后再渲染。
- 月度额度行（`30d`）改为显示**已用百分比**，与 `5h` / `7d` 行同口径（`已用% + （$已用/$总额）`），不再只列剩余金额。
  - 已用 = `总额 − 剩余`，百分比由客户端计算（host 侧不提供 percent 字段）。
  - host 侧的 `remaining` 会把赠送/购买额度一并累加，可能超过 `total`（`total` 仅由 `weeklyCap × 2` 推出）→ 百分比**夹到 `[0,100]`**，避免出现负数或 >100%。
  - `total` 缺失或 ≤0 时算不出百分比，退回只显示剩余金额，避免 `NaN` / `Infinity`。
- 月度额度行末尾由**套餐名**（如 `goat`）改为**本周期剩余时间倒计时**，与 `5h` / `7d` 行的写法一致（复用同一个 `countdownStr`，以 `periodEnd` 为周期结束时间）。
- 「到期」时间从月度额度行里拆出，**独立成一行**并放在所有窗口行之后（订阅周期信息收尾）；日期非法时不渲染该行，`daysLeft` 缺失时只显示日期。
- 悬浮浮层的窗口标签改用**紧凑写法**（`5h` / `7d` / `30d`），不再用 host 硬编码的 `5小时` / `7天`。
  - 新增浮层专用 i18n 键 `quota.win.*`（zh / en 均为紧凑形式），**与设置页表格表头的 `quota.col.*` 分开**：中文环境下表格表头保持 `5小时 | 7天 | 30天`，仅浮层用紧凑标签。
  - 浮层标签缺键时回退到 host 提供的 label，不会显示成键名。

## [0.8.1] - 2026-09-10

### Fixed
- **修复切换模型导致浏览器卡死（页面无响应、CPU 占满一核、内存涨到 GB 级）**。根因：徽章订阅模型目录 store 后，在订阅回调里调用门面 `models()`，而该门面在状态 ≠ `ready` 时会 `await directory.load()`；`load()` 又必然重新发布 store 状态，且核心 `syncInputs()` 会把 `selecting` 原样写回 —— 于是「store 通知 → load → 再通知」形成**纯微任务的自持循环**，饿死事件循环，`selectModel` 的 RPC 回包永远无法送达，状态永远停在 `selecting`。
- 修复方式：订阅回调改为**只读快照**，不再触发任何写操作。
  - 新增门面方法 `modelsSnapshot(sessionId)`：直接 `directoryFor(sessionId).store.getSnapshot()`，**绝不**调用 `load()`、绝不写 store、绝不通知订阅者。
  - 徽章 `read()` 改用 `modelsSnapshot`（同步、只读）；旧版数据源没有该入口时仍退回异步读取，且只用于 2s 轮询兜底（宏任务，不会重入）。
  - 保留 `models()` 原有「确保已加载」语义不变 —— 悬停浮层首次打开仍需要它来触发加载。
  - 追加防重入闸门（重入直接丢弃），作为对未来改动的纯防御。
- 修复 i18n 字典注册时的 `cannot get property "locale" without inject`：改用 `ctx.inject(["locale"], …)` 注册，`resolveLang` 改用可选读取 `ctx.get("locale")`。此前该错误每次加载都会打印，且字典实际并未注册成功。

### Changed
- 徽章与模型选择器的间距由 12px 收紧到 **4px**，视觉上更贴近模型座。DSH 的 `InputBar .trailing` 容器（徽章与模型座的共同父级）是 `gap: 12px`，槽位锚点为 `display:contents` 因而不产生盒子 —— 徽章即该 flex 行的直接子项，故用 `marginRight: -8px` 抵消多余间距。数值集中在 `BADGE_GAP_PULL` 常量，改 2px 只需把 8 改成 10。

### Verified
- 用还原真实 store 语义（同步通知、无等值去重、`selecting` 原样写回）的仿真脚本对照三种实现：0.8.0 现状在 20 万次读 / 20 万次 `load()` 后仍未收敛且 RPC 回包始终未送达；修复后在 4 次读、**0 次 `load()`** 内收敛，回包正常送达。

## [0.8.0] - 2026-09-10

### Changed
- **徽章承载方式改为官方槽位 `conversation.input.right`**（模型座左侧的官方空槽）：标签由 DSH 布局系统排列，与模型选择器是**兄弟关系**，不再是塞进原生 `<button>` 里的外来节点。由此去掉：按钮语义/点击污染、React 重挂导致的徽章丢失、300ms 存在性看护轮询、以及“移到按钮本体”的特判。
- 徽章文本改为**订阅模型目录 store**（切模型/换提供商即时更新），仅旧版数据源退回 2s 轮询。
- 浮层逻辑抽成共享控制器 `createTipController`（渐进渲染 + 代际取消 + 唤起/收起延迟 + 点击外部收起），两种承载方式（官方槽位 / DOM 注入）共用，行为一致。
- 点击浮层与徽章之外的位置（如模型座）立即收起；浮层卸载时自动清理 DOM。

### Added
- 旧版 DSH（没有该槽位）自动回退到原有 DOM 注入：槽位 1.2s 内未就绪即回退，读取失败/槽位注册失败也会回退并给出「provider 装饰失效」显式提示。

## [0.7.7] - 2026-09-09

### Fixed
- 悬浮浮窗“时灵时不灵 / 移开后忽然弹出”：给每次悬停加**代际号**，`showTip` 的每个 `await` 之后校验（悬停已结束/已取消就丢弃结果），不再出现“悬停没反应、移开后请求回来才弹出”。
- 悬浮卡顿：面板改为**渐进渲染**——悬停立即用内存缓存同步显示（余量未就绪时先显示「刷新中…」占位），慢数据（首次 provider 配置 / 目录真值 / 余量）在后台补齐后重绘；不再等网络才 `display`。
- 性能：host 端 Command Code 两个查询接口改 **Promise.all 并行**（冷启动实测 2575ms → 1338ms）；host 与 client 都加了**同 provider 在途请求合并**，快速反复悬停不再堆请求。
- 手感：悬停唤起延迟 250ms → **120ms**；从标签移向按钮本体改为 **120ms 宽限**（短暂擦边不丢悬停；模型下拉已展开或点击按钮时仍立即收起）；标签热区各方向**透明外扩 6px**（视觉不变、更耐悬停）。
- 徽章挂载：新增 **300ms 存在性看护**（替代只靠 2s 轮询），React 重挂/会话切换后尽快补挂徽章，减少“悬停完全没反应”的窗口。

## [0.7.6] - 2026-09-09

### Changed
- Command Code 余量：月度总额度改为 **周窗 cap × 2** 动态推导（如 GOAT 35×2=$70），不再本地硬编码套餐表——官方调整窗口额度后接口实时返回、显示自动跟随；月度剩余计入 freeCredits（口径对齐官方 CLI 的 totalRemaining）。
- 百分比统一精确到小数点后两位（如 `7.17%`）。
- Command Code 月度行新增**周期到期时间**（计费周期结束日期 + 剩余天数）。
- 不支持查询的提供商（含未识别厂商）：浮窗余量区块照常显示，明确提示「当前暂不支持查询当前提供商」，不再整体不显示。

## [0.7.5] - 2026-09-09

### Added
- 余量查询新增 **Command Code** 家族（GOAT / Pro / Max 等套餐，`baseURL` 含 `commandcode.ai` 即命中）：读取官方 CLI 同款内部接口 `GET /alpha/billing/credits` + `/alpha/billing/subscriptions`（只读、不计费），悬浮浮层与设置页「全部提供商余量」表格展示：月度剩余 credits（按套餐映射月额度，如 GOAT $70）+ 5小时/每周窗口已用百分比、折算金额与重置倒计时。

## [0.7.4] - 2026-09-09

### Changed
- 悬浮浮窗热区收窄：只有鼠标悬停在提供商徽章小标签上才弹出浮窗；鼠标移向模型选择按钮本体/下拉区域时立即收起，点击按钮打开模型下拉时也主动收起并取消待触发的弹出，不再遮挡模型选择。

## [0.7.3] - 2026-09-09

### Fixed
- 修复 DSH ≥ 0.1.2（0.1.2-rc.1 起）下徽章与悬浮浮层失效：dsh-client-connection 不再在 `connection` 服务上暴露旧版 `api`（`api.sessions.models` / `api.settings.describe`），取数改为走当前 DSH 的 `modelDirectories` 目录服务（与模型座同源）与 `ctx.remote.settings.describe()`。旧版 DSH（connection 仍带 `api`）自动走原路径，无需改动配置。

## [Unreleased]

### Added
- 「提供商信息」设置页新增「全部提供商余量」表格：汇总所有可查询余额/限额的提供商，表头为 `提供商 | 5小时 | 7天 | 30天 | 余额 | 操作`，无数据的维度留空；支持单行刷新与全部刷新；复用悬浮窗查询结果（模块级共享缓存 + host 5 分钟缓存），provider 数量多时表格横向溢出自动滚动。
- 服务端 `providerBadge/providers` 端点：合并「自定义提供方」（`llm-pi-ai.providers`）与「官方/内置提供方」（`ctx.llm.listConfigurableProviders()`，如 DeepSeek 官方），逐项解析 baseURL/apiKeyEnv，使「模型」面板里的官方提供方也进入余量表。

### Fixed
- 修复：开启识图后悬浮不显示余量。识图会把 `current.provider` 分流成无配置的合成 provider（如 `ocgo-02-vision`），余量识别改为剥掉 `-vision` 后缀还原主 provider，用主 provider 的 `baseURL`/密钥去识别厂商并查余量；浮层的 Provider ID / 显示名称 / API 地址等展示字段不受影响。

### Added
- 悬浮信息浮层新增「余量」区块：展示当前提供商余额或订阅限额。
  - DeepSeek：账户余额金额（多币种）。
  - OpenCode Go：5小时 / 每周 / 每月 已用百分比 + 重置倒计时 + 折算金额。
  - 已识别但暂不支持的厂商显示「暂不支持该供应商查询」。
  - 未配置密钥显示「未配置 API Key」，查询失败显示「查询失败」。
- 服务端 `providerBadge/balance` 端点（读凭据 + 查询厂商接口，host 端按 provider 5 分钟缓存）。
- 余量支持手动「刷新」按钮：点击绕过 5 分钟缓存强制拉取最新；悬停时仍走 5 分钟缓存兜底。
- 悬浮浮层支持鼠标停留：鼠标在浮窗/按钮上时，文字流滚动不再隐藏浮窗（离开悬停区才因滚动隐藏）。
- DeepSeek 余额多币种按币种字母升序稳定排序显示（CNY 在 USD 前），避免接口返回乱序导致刷新时币种顺序来回变。
- 新增「提供商余量」设置页（设置 → 侧边栏「提供商余量」）：
  - **显示悬浮窗自动刷新**（默认开）：开启后每次鼠标移入浮窗就绕过缓存强制拉取最新余量；关闭则走 5 分钟缓存兜底。
  - **定时刷新**（默认关）+ **定时刷新间隔(分钟)**（默认 5，最低 1）：开启后浮窗打开时按设定间隔定时重新查询余量（未开启时下方的间隔输入框禁用变灰）。
- 服务端 `providerBadge/settings` 端点（读取/写入插件设置，持久化于 `$DSH_HOME/dsh-provider-info.json`，`chmod 600`）。
- 修复：悬浮面板向下弹出时超出视口被截断（加面板限高 + 内部滚动，并对方下弹出做视口底部钳制，保证面板始终完整落在屏内）。
- 新增「字体大小」设置项（大 / 中 / 小，默认「中」＝当前大小；通过 zoom 整体缩放悬浮面板，视觉自适应）。
- 余量「刷新」按钮与「余量」文字间距调小（head gap 4px→2px，去掉按钮额外 margin，padding 0 6px→0 4px）。
- 修复：兼容信息长 JSON 不再无限撑高面板（限高 44px + 内部滚动），使大/中/小字体下弹窗都能紧贴模型选择器、不再顶到屏幕中部。
- 修复：弹窗定位改用「以选择器为锚」——字体缩放从老 zoom(左上角原点)改为 transform scale + transform-origin 动态跟随（贴按钮上方用 bottom center、下方用 top center），并按缩放系数换算面板限高，保证大/中/小始终紧贴模型选择器且不超屏。
- 调整：移除「兼容信息」行的局部限高滚动（恢复完整显示）；弹窗仅在整体超出屏幕时整个弹窗滚动，不再出现局部小块滚动条。
- 新增：i18n 多语言支持（中文/English）——设置页新增「界面语言」选项（跟随系统(dsh)/中文/English，默认跟随系统(dsh)）；注册到 DSH locale 命名空间，跟随系统时与 DSH 界面语言一致；强制语言只影响本插件弹窗与设置页，不改 DSH 全局语言。

### Fixed
- `./typert` 清单的 codec schema 改用插件自带的 zod v4 实例：package.json 声明 `zod`（^4.4.3）运行依赖，不再依赖宿主环境解析到的 zod 版本。dsh 0.1.1-rc.2 的 typert-loader 强制校验 zod v4 的 `_zod` 标记，消费方环境命中 v3 时（如 dsh-provider-info / dsh-model-fit / dsh-icon-custom 同时报 “codec is not backed by a zod v4 schema”）插件启动会失败。

## [0.1.0] - 2026-08-25
### Added
- 模型座左侧的提供商徽章（显示名称优先，回退 Provider ID）。
- 悬浮信息浮层：提供商 + 当前模型全量信息，缺失显示「未提供」。
- 服务端 `providerBadge/modelInfo` 端点（读取上下文窗口 / 最大 token / 输入模态）。
