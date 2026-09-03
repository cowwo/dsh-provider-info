# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
