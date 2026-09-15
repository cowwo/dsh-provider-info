# dsh-provider-info

A [DeepSeek Harness](https://github.com/deepseek-ai/DeepSeek-Harness) plugin.

> [中文说明](README.zh.md)

It does exactly one thing: **next to where you pick a model, it shows a small line of text saying which provider (company) is serving the currently selected model.**

Move your mouse over that text and a small dark panel pops up with full details about the provider and the current model.

## The problem it solves

DeepSeek Harness can be configured with several AI providers at once, and each provider has many models underneath. Just looking at a model name, it's hard to tell whose API it actually goes through. This plugin shows you at a glance: **which provider is serving the model I'm using right now.**

## What it does

- **Adds a small label next to the model selector** showing the provider's display name for the current model. If the provider has no display name, it falls back to the provider's ID.
- **Hover the label to open a small panel** with two sections:
  - **Provider info**: display name, provider ID, API protocol (e.g. OpenAI-compatible, Anthropic, etc.), API base URL, and the environment variable name for the API key.
  - **Current model info**: model ID, display name, description, available reasoning efforts, the current reasoning effort, context window, max tokens, supported input modalities, and compat info.
- Missing values are shown as `未提供`; long values wrap.
- The label updates automatically as you switch models.
- **Instant on hover**: the panel renders immediately from local caches (the quota block shows a `刷新中…` placeholder until data arrives, then fills in the background), so it never "ignores your hover and pops up after you leave".
- **Separate from the selector**: the label is contributed to DSH's official slot `conversation.input.right` (the official empty slot left of the model seat), so DSH lays it out automatically and the native model selector is never modified; older DSH versions without that slot fall back to the compatible path.
- **Never touches your keys**: it only shows the *environment variable name* for the credential — it never reads or shows the actual secret.
- **Quota section**: for providers that support it, the hover panel also shows the provider's quota. **Both kinds of provider follow the same presentation rules**:
  - **Balance type** (e.g. **DeepSeek**): a single `余额` row with the account balance (multi-currency, e.g. `¥20.38 / $0.00`).
  - **Plan type** (e.g. **OpenCode Go**, **Command Code**): one row per window, labelled with the window period (`5小时 / 周 / 月`, i.e. `5h / wk / mo` in English), each showing `used% · used $/total $ · reset countdown`; in the hover panel these rows sit on a **four-column grid** (label | percent | amount | countdown — no parentheses, `·` between segments, right edges aligned, so `4.00%` and `77.00%` never shift the amounts); when the provider also exposes a subscription billing period, an `到期` (expires) row is appended (e.g. `2026-10-08 · 剩 27 天`) as a plain row, outside that grid.
    - **OpenCode Go**: three rolling windows (`5小时 / 周 / 月`). Its API returns only percentages plus reset times, so the money amounts are derived from official plan-price constants; it has **no dedicated subscription fields**, but the monthly window's reset time *is* the billing-period end (weekly is anchored to Monday 00:00, monthly to the subscription start + 1 month), so it doubles as the expires row; the monthly row still shows its own reset countdown so all three window rows stay aligned (the expires row gives the date, plus “N days left” when “Show more details” is on).
    - **Command Code** (GOAT / Pro / Max plans, e.g. `https://api.commandcode.ai/provider/v1`): `5小时 / 周` windows plus the monthly pool (normalized into the `月` window; total pool derived as weekly cap × 2) and a subscription `到期` row (the same read-only internal endpoints the official CLI uses).
    - Window durations come from the provider: common periods render as `5小时 / 周 / 月`, anything else renders as its real duration (e.g. `5天`), with no code change needed.
  - Providers that can't be queried (including unrecognized ones) still show a quota row: `当前暂不支持查询当前提供商`; missing keys or query failures show `未配置 API Key` / `查询失败`.
  - All these queries are **read-only**: they never charge you and never burn tokens.
  - The **Settings → 提供商信息** "all provider quotas" table uses the same data and the same column names as the hover panel: `Provider | 5小时 | 周 | 月 | 余额 | 到期 | Action`, filled per available dimension; for providers that can't be queried the status text follows the provider name instead of occupying a data column.
  - The host caches the result per provider for 5 minutes, so hovering repeatedly doesn't hammer the provider API.
  - The quota block has a **Refresh** button: click it to bypass the cache and immediately pull the latest quota (still read-only). Hovering normally uses the 5-minute cache.
  - While your mouse is over the panel/button, message-stream scrolling won't hide the panel, so you can read it comfortably; it only hides on scroll after you move away.
  - **Refresh behavior** is adjustable from **Settings → 提供商信息**: enable *显示悬浮窗自动刷新* (default on) to re-query the latest quota whenever you hover (bypassing the cache), or enable *定时刷新* (default off) with an interval in minutes (default 5, minimum 1) to periodically re-query while the panel is open. Settings persist in `$DSH_HOME/dsh-provider-info.json` (mode 0600).

## Screenshots

The small label next to the model selector (here showing the provider `opencode-go`):

![Provider label next to the model selector](docs/model-selector.png)

The detail panel that appears when you hover over it:

![Hover panel with provider and model details](docs/provider-panel.png)

## Installation

This plugin is loaded through the DSH profile mechanism (for example the `web` profile).

### Option 1: Install via command

```bash
dsh plugin --profile web add dsh-provider-info
```

### Option 2: Configure manually

Add it to your profile's dependencies:

```json
// profile package.json
"dependencies": { "dsh-provider-info": "^0.1.0" }
```

Then declare the bundle in your profile config:

```yaml
# profile config
dsh:
  profile:
    bundles:
      - dsh-provider-info
```

After installing, restart `dsh web` once and refresh the page.

## Settings

Open **设置 → 提供商信息** to configure the quota refresh behavior:

- **显示悬浮窗自动刷新** (default checked): when you hover the badge and the panel opens, re-query the latest quota immediately (bypassing the 5-minute cache).
- **定时刷新** (default unchecked) + **定时刷新间隔(分钟)** (default 5, minimum 1): while the hover panel is open, periodically re-query the remaining quota on the configured interval. When 定时刷新 is off, the interval input is disabled and greyed.
- **显示更多信息 / Show more details** (default unchecked): when off, the quota shows only **percentages** and the **expiry date** (a cleaner view); when on, windows also show `(used/total)` amounts, the hover panel shows reset countdowns, and expiry shows days left. It applies to both the hover panel and the settings table at once.
- **界面语言** (default 跟随系统(dsh)): choose the UI language of the hover panel and this settings page — 跟随系统(dsh) follows the DSH interface language (Chinese UI → Chinese, English UI → English), 中文 forces Chinese, English forces English. Forcing a language only affects this plugin, never DSH's own language settings.

Changes are saved to `$DSH_HOME/dsh-provider-info.json` and apply immediately.


## Usage

There's nothing to do. Open the chat interface and the small label appears next to the model selector automatically. Hover over it to see the details.

## Privacy

This plugin only reads provider configuration from the running DSH instance on your machine to display it. All data is shown in your own browser and **is never sent anywhere**. The API key value is never read or displayed — only its environment variable name.

## License

[MIT](LICENSE)
