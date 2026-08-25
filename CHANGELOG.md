# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-25
### Added
- 模型座左侧的提供商徽章（显示名称优先，回退 Provider ID）。
- 悬浮信息浮层：提供商 + 当前模型全量信息，缺失显示「未提供」。
- 服务端 `providerBadge/modelInfo` 端点（读取上下文窗口 / 最大 token / 输入模态）。
