# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
  - **鼠标悬停立即刷新**（默认开）：开启后每次鼠标移入浮窗就绕过缓存强制拉取最新余量；关闭则走 5 分钟缓存兜底。
  - **自动刷新**（默认关）+ **自动刷新间隔(分钟)**（默认 5，最低 1）：开启后浮窗打开时按设定间隔自动重新查询余量。
- 服务端 `providerBadge/settings` 端点（读取/写入插件设置，持久化于 `$DSH_HOME/dsh-provider-info.json`，`chmod 600`）。

## [0.1.0] - 2026-08-25
### Added
- 模型座左侧的提供商徽章（显示名称优先，回退 Provider ID）。
- 悬浮信息浮层：提供商 + 当前模型全量信息，缺失显示「未提供」。
- 服务端 `providerBadge/modelInfo` 端点（读取上下文窗口 / 最大 token / 输入模态）。
