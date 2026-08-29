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
- 依赖：新增可选 peer `@deepseek-ai/dsh-credentials`。

## [0.1.0] - 2026-08-25
### Added
- 模型座左侧的提供商徽章（显示名称优先，回退 Provider ID）。
- 悬浮信息浮层：提供商 + 当前模型全量信息，缺失显示「未提供」。
- 服务端 `providerBadge/modelInfo` 端点（读取上下文窗口 / 最大 token / 输入模态）。
