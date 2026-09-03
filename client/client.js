window.__ModuleLoader__.load({
	id: "dsh-provider-info",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		// ---- i18n：以中文为 key 源、英文对照；跟随系统时用 DSH 当前界面语言 ----
		const LOCALE_NS = "providerInfo";
		const zh = {
			// 弹窗
			"provider": "提供商",
			"displayName": "显示名称",
			"apiProtocol": "API 协议",
			"apiAddress": "API 地址",
			"apiKeyEnv": "密钥环境变量",
			"currentModel": "当前模型",
			"modelId": "模型 ID",
			"modelDisplayName": "模型展示名",
			"modelDescription": "模型描述",
			"reasoningLevel": "推理等级",
			"currentReasoningLevel": "当前推理等级",
			"contextWindow": "上下文窗口",
			"maxToken": "最大 token",
			"inputModes": "输入模态",
			"compatInfo": "兼容信息",
			"balance": "余量",
			"balanceName": "余额",
			"refresh": "刷新",
			"refreshing": "刷新中…",
			"unknown": "未提供",
			"window": "窗口",
			"noSupport": "暂不支持该供应商查询",
			"queryFailed": "查询失败",
			"noApiKey": "未配置 API Key",
			"subscriptionRequired": "订阅权限不足",
			"unauthorized": "密钥无效",
			"http404": "接口地址错误",
			"missingUsage": "接口无用量数据",
			"noData": "无数据",
			"insufficient": "（余额不足）",
			"rateLimited": "已限流",
			// 设置页
			"settings.entry": "提供商信息",
			"settings.title": "提供商信息与余量",
			"settings.subtitle": "管理悬浮面板的余量查询、字体大小与界面语言",
			"settings.hoverRefresh": "显示悬浮窗自动刷新",
			"settings.hoverRefreshDesc": "开启后每次鼠标移入浮窗就重新查询最新余量（绕缓存）",
			"settings.autoRefresh": "定时刷新",
			"settings.autoRefreshDesc": "浮窗打开时按设定间隔定时重新查询余量",
			"settings.interval": "定时刷新间隔(分钟)",
			"settings.intervalMin": "（最低 1）",
			"settings.fontSize": "字体大小",
			"settings.fontSmall": "小",
			"settings.fontMiddle": "中",
			"settings.fontLarge": "大",
			"settings.language": "界面语言",
			"settings.langSystem": "跟随系统(dsh)",
			"settings.langEn": "English",
			"settings.langZh": "中文",
			"settings.saving": "保存中…",
			"settings.save": "保存",
			"settings.saved": "已保存",
			"settings.saveFailed": "保存失败",
			// 余量表
			"quota.title": "全部提供商余量",
			"quota.subtitle": "汇总所有已配置提供商的余额/限额，复用悬浮窗查询结果",
			"quota.col.provider": "提供商",
			"quota.col.rolling": "5小时",
			"quota.col.weekly": "7天",
			"quota.col.monthly": "30天",
			"quota.col.balance": "余额",
			"quota.col.action": "操作",
			"quota.refreshAll": "全部刷新",
			"quota.refreshAllBusy": "刷新中…",
			"quota.empty": "暂无提供商配置",
			"quota.loading": "加载中…",
			"quota.expandAll": "展开全部",
			"quota.collapse": "收起"
		};
		const en = {
			// 弹窗
			"provider": "Provider",
			"displayName": "Display name",
			"apiProtocol": "API protocol",
			"apiAddress": "API address",
			"apiKeyEnv": "Key env var",
			"currentModel": "Current model",
			"modelId": "Model ID",
			"modelDisplayName": "Model display name",
			"modelDescription": "Model description",
			"reasoningLevel": "Reasoning level",
			"currentReasoningLevel": "Current reasoning level",
			"contextWindow": "Context window",
			"maxToken": "Max tokens",
			"inputModes": "Input modes",
			"compatInfo": "Compat info",
			"balance": "Balance",
			"balanceName": "Balance",
			"refresh": "Refresh",
			"refreshing": "Refreshing…",
			"unknown": "Not provided",
			"window": "Window",
			"noSupport": "Queries not supported for this provider",
			"queryFailed": "Query failed",
			"noApiKey": "No API Key configured",
			"subscriptionRequired": "Subscription not sufficient",
			"unauthorized": "Invalid key",
			"http404": "Wrong API address",
			"missingUsage": "No usage data",
			"noData": "No data",
			"insufficient": "(insufficient balance)",
			"rateLimited": "Rate limited",
			// 设置页
			"settings.entry": "Provider info",
			"settings.title": "Provider info & balance",
			"settings.subtitle": "Manage the hover panel: balance queries, font size, and language",
			"settings.hoverRefresh": "Auto refresh on hover",
			"settings.hoverRefreshDesc": "Re-fetch latest balance every time the mouse enters the box (bypasses cache)",
			"settings.autoRefresh": "Scheduled refresh",
			"settings.autoRefreshDesc": "Re-query the balance at the set interval while the box is open",
			"settings.interval": "Refresh interval (minutes)",
			"settings.intervalMin": "(min 1)",
			"settings.fontSize": "Font size",
			"settings.fontSmall": "Small",
			"settings.fontMiddle": "Medium",
			"settings.fontLarge": "Large",
			"settings.language": "Language",
			"settings.langSystem": "Follow system (dsh)",
			"settings.langEn": "English",
			"settings.langZh": "Chinese",
			"settings.saving": "Saving…",
			"settings.save": "Save",
			"settings.saved": "Saved",
			"settings.saveFailed": "Save failed",
			// 余量表
			"quota.title": "All provider quotas",
			"quota.subtitle": "Summarize balance/limits of all configured providers, reusing hover query results",
			"quota.col.provider": "Provider",
			"quota.col.rolling": "5h",
			"quota.col.weekly": "7d",
			"quota.col.monthly": "30d",
			"quota.col.balance": "Balance",
			"quota.col.action": "Action",
			"quota.refreshAll": "Refresh all",
			"quota.refreshAllBusy": "Refreshing…",
			"quota.empty": "No providers configured",
			"quota.loading": "Loading…",
			"quota.expandAll": "Show all",
			"quota.collapse": "Collapse"
		};
		/** 当前生效语言："system"（跟随 DSH）时读 DSH 当前语言；"en"/"zh" 为手动强制。 */
		let resolveLang = () => "zh";
		/** 按当前生效语言取词；key 缺失时原样返回（fail loud，不显示空白）。 */
		function tx(key) {
			const lang = resolveLang();
			const dict = lang === "en" ? en : zh;
			return dict[key] != null ? dict[key] : key;
		}

		// ---- 插件设置（持久化于 host 侧 json 文件）----
		const QSettings = { hoverRefresh: true, autoRefreshOn: false, autoRefreshMin: 5, fontSize: 'middle', language: 'system' };
		function loadSettings(rpc) {
			try {
				rpc.call("/api", "providerBadge/settings", { args: { request: { op: "get" } } }).then((resp) => {
					if (resp && resp.ok && resp.value && resp.value.settings) {
						const s = resp.value.settings;
						if (typeof s.hoverRefresh === "boolean") QSettings.hoverRefresh = s.hoverRefresh;
						if (typeof s.autoRefreshOn === "boolean") QSettings.autoRefreshOn = s.autoRefreshOn;
						if (typeof s.autoRefreshMin === "number") QSettings.autoRefreshMin = s.autoRefreshMin;
						if (s.fontSize === "large" || s.fontSize === "middle" || s.fontSize === "small") QSettings.fontSize = s.fontSize;
						if (s.language === "system" || s.language === "en" || s.language === "zh") QSettings.language = s.language;
					}
				}).catch(() => {});
			} catch (e) { console.warn("[provider-badge] 读取设置失败", e); }
		}
		function saveSettings(rpc, patch) {
			return rpc.call("/api", "providerBadge/settings", { args: { request: { op: "set", patch } } }).then((resp) => {
				if (resp && resp.ok && resp.value && resp.value.settings) {
					const s = resp.value.settings;
					QSettings.hoverRefresh = !!s.hoverRefresh;
					QSettings.autoRefreshOn = !!s.autoRefreshOn;
					QSettings.autoRefreshMin = Number(s.autoRefreshMin) || 5;
					if (s.fontSize === "large" || s.fontSize === "middle" || s.fontSize === "small") QSettings.fontSize = s.fontSize;
					if (s.language === "system" || s.language === "en" || s.language === "zh") QSettings.language = s.language;
					return true;
				}
				return false;
			}).catch((e) => { console.warn("[provider-badge] 保存设置失败", e); return false; });
		}

		//#region 共享余量存储：悬浮窗与设置页共用同一份查询结果
		// 悬浮窗查过的 provider 余量会被写入这里，设置页直接复用（不重复打厂商接口）。
		// host 端 providerBadge/balance 另有 5 分钟缓存，二者叠加避免频繁请求。
		const quotaShared = { api: null, rpc: null };
		const quotaCache = new Map(); // key: provider 路由键 -> { fetchedAt, value }
		/** 读取/枚举所有可查询余量的提供商（官方 + 自定义，host 端 providerBadge/providers 合并）。 */
		async function fetchProviderList() {
			const rpc = quotaShared.rpc;
			if (!rpc) return [];
			try {
				const resp = await rpc.call("/api", "providerBadge/providers", { args: { request: {} } });
				const list = resp && resp.ok && resp.value && Array.isArray(resp.value.providers) ? resp.value.providers : [];
				// 规整字段，确保每条都有 provider 键。
				return list.filter((p) => p && p.provider).map((p) => ({
					provider: p.provider,
					displayName: p.displayName || null,
					baseURL: p.baseURL || null,
					apiKeyEnv: p.apiKeyEnv || null
				}));
			} catch (e) {
				console.warn("[provider-badge] 枚举提供商失败", e);
				return [];
			}
		}
		/** 查询单个 provider 余量；命中 client 缓存直接回，命中后回写缓存。 */
		async function fetchProviderQuota(provider, cfg, force) {
			if (!quotaShared.rpc) return null;
			const cached = quotaCache.get(provider);
			if (!force && cached && cached.value && cached.value.recognized && cached.value.supported && !cached.value.error) {
				return cached.value;
			}
			try {
				const resp = await quotaShared.rpc.call("/api", "providerBadge/balance", {
					args: { request: { provider, baseURL: cfg && cfg.baseURL || null, apiKeyEnv: cfg && cfg.apiKeyEnv || null, force: !!force } }
				});
				const b = resp && resp.ok ? (resp.value || null) : null;
				if (b && b.recognized && b.supported && !b.error) {
					quotaCache.set(provider, { fetchedAt: Date.now(), value: b });
				} else {
					quotaCache.delete(provider);
				}
				return b;
			} catch (e) {
				console.warn("[provider-badge] 余量查询失败", e);
				quotaCache.delete(provider);
				return null;
			}
		}
		// ---- 余量结果 → 表格单元格归一化（供设置页表格使用，自包含不依赖悬浮闭包）----
		const _num2 = (n) => { var v = Number(n); return v === v ? v.toFixed(2) : ""; };
		const _pct = (n) => { var v = Number(n); return v === v ? Math.round(v) + "%" : ""; };
		const _sym = (code) => code === "CNY" ? "¥" : code === "USD" ? "$" : code === "EUR" ? "€" : (code || "") + " ";
		/** 把 balance 结果归一化成表格五列要显示的纯文本；无数据的维度返回空串。 */
		function quotaCells(b) {
			const cells = { rolling: "", weekly: "", monthly: "", balance: "" };
			if (!b) return cells;
			// 未识别：不展示任何数据（表格保留空行）。
			if (b.recognized === false) return cells;
			// 已识别但不支持查询 / 出错：只在「余额」列给出状态文案。
			if (!b.supported || b.error) {
				cells.balance = quotaErrorText(b);
				return cells;
			}
			// balance 家族（DeepSeek）：余额列放金额。
			if (b.kind === "balance" && b.family === "deepseek") {
				const infos = ((b.balance && b.balance.balance_infos) || []).slice()
					.sort((a, c) => String(a.currency || "").localeCompare(String(c.currency || "")));
				const parts = infos.map((i) => _sym(i.currency) + _num2(i.total_balance));
				cells.balance = parts.length ? parts.join(" / ") : "";
				return cells;
			}
			// limits 家族（OpenCode Go / 其它 percent 型）：三窗口各放百分比。
			if (b.kind === "limits") {
				const wins = b.windows || [];
				for (const w of wins) {
					const k = w.key;
					const pct = (w.percent !== null && w.percent !== undefined) ? _pct(w.percent) : "";
					if (k === "rolling" || k === "5小时") cells.rolling = pct;
					else if (k === "weekly" || k === "7天") cells.weekly = pct;
					else if (k === "monthly" || k === "30天") cells.monthly = pct;
				}
			}
			return cells;
		}
		/** 余量错误/不支持状态 → 文案（复用 tx 词条，与悬浮窗一致）。 */
		function quotaErrorText(b) {
			if (!b) return "";
			if (!b.supported && b.error === "not-supported") return tx("noSupport");
			if (b.error === "no-api-key") return tx("noApiKey");
			if (b.error === "subscription-required") return tx("subscriptionRequired");
			if (b.error === "unauthorized") return tx("unauthorized");
			if (b.error === "http-404") return tx("http404");
			if (b.error === "missing-usage" || b.error === "missing-windows" || b.error === "no-data") return tx("missingUsage");
			return tx("queryFailed");
		}
		//#endregion

		//#region 提供商徽章 + 悬浮信息浮层
		function installProviderBadge(sessions, api, rpc) {
			const SLOT = '[data-slot="conversation.input.model"]';
			const SHOW_DELAY = 250;
			const HIDE_DELAY = 100;
			const UNKNOWN = "未提供"; // 兼容外部引用（实际显示走 tx("unknown")）
			let badge = null;
			let seatBtnEl = null;
			let noticed = false;
			let lastText = null;
			// 缓存：provider 配置（settings.describe 的 llm-pi-ai.providers[provider]）与目录真值（rpc modelInfo）
			let providerCfgCache = null;
			let providerCfgKey = null;
			let modelInfoCache = null;
			let modelInfoKey = null;

			const noticeOnce = () => {
				if (noticed) return;
				noticed = true;
				const el = document.createElement("div");
				el.textContent = "provider 装饰失效";
				Object.assign(el.style, {
					position: "fixed", right: "16px", bottom: "16px", zIndex: 9999,
					padding: "6px 10px", borderRadius: "8px", fontSize: 12,
					color: "var(--dsw-alias-label-secondary)",
					background: "var(--dsw-alias-bg-layer-3)",
					border: "1px solid var(--dsw-alias-border-l2)"
				});
				document.body.appendChild(el);
			};

			const labelFor = (value) => {
				const current = value && value.current;
				const provider = current && current.provider;
				if (!provider) return null;
				const group = (value.groups || []).find((g) => g && g.id === provider);
				return (group && group.name) || provider;
			};

			// ---- 悬浮浮层 ----
			let tip = null;
			let showTimer = null;
			let hideTimer = null;
			// 方案1：记录鼠标是否在浮窗/按钮上（悬停区）。在悬停区内时滚动不隐藏浮窗。
			let hovering = false;
			// 手动刷新：当前余量区块容器与其上下文（provider/cfg），刷新时只重绘数据行。
			let lastBalanceBox = null;
			let lastBalanceCtx = null;

			const row = (label, value) => {
				const r = document.createElement("div");
				Object.assign(r.style, {
					display: "flex", justifyContent: "space-between", gap: "16px",
					padding: "2px 0", fontSize: 12, lineHeight: "18px",
					fontFamily: "var(--dsw-font-family-mono, monospace)"
				});
				const l = document.createElement("span");
				l.textContent = label;
				Object.assign(l.style, { color: "#8a93a5", flex: "none" });
				const v = document.createElement("span");
				v.textContent = value || UNKNOWN;
				Object.assign(v.style, { color: "#e6e9f0", flex: "1 1 auto", minWidth: "0", whiteSpace: "pre-wrap", wordBreak: "break-word", textAlign: "right" });
				r.appendChild(l);
				r.appendChild(v);
				return r;
			};
			const heading = (text) => {
				const h = document.createElement("div");
				h.textContent = text;
				Object.assign(h.style, {
					margin: "6px 0 4px", fontSize: 11, fontWeight: 600,
					color: "#aab2c0", letterSpacing: ".02em"
				});
				return h;
			};
			const ensureTip = () => {
				if (tip) return tip;
				tip = document.createElement("div");
				tip.setAttribute("data-provider-badge-tip", "");
				Object.assign(tip.style, {
					position: "fixed", zIndex: 99999, display: "none",
					minWidth: "220px", maxWidth: "360px", padding: "8px 12px",
					borderRadius: "10px", fontSize: 12, lineHeight: "18px",
					color: "#e6e9f0",
					background: "#1f2430",
					border: "1px solid #2c3242",
					boxShadow: "0 6px 24px rgba(0,0,0,.28)",
					maxHeight: "calc(100vh - 120px)", overflowY: "auto", overflowX: "hidden"
				});
				document.body.appendChild(tip);
				// 浮窗自身也监听鼠标：悬停到浮窗上时保持显示（可停留、可点刷新）。
				tip.addEventListener("mouseenter", () => {
					hovering = true;
					if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
				});
				tip.addEventListener("mouseleave", () => {
					hovering = false;
					if (hideTimer) clearTimeout(hideTimer);
					hideTimer = setTimeout(() => { if (!hovering) hideTip(); }, HIDE_DELAY);
				});
				return tip;
			};
			const position = (anchor) => {
				const r = anchor.getBoundingClientRect();
				const t = ensureTip();
				const vw = window.innerWidth, vh = window.innerHeight;
				const m = /scale\((\d+(?:\.\d+)?)\)/.exec(t.style.transform || "");
				const scale = m ? parseFloat(m[1]) : 1;
				const GAP = 8;
				const aboveSpace = r.top - GAP;          // 选择器上方可用高度
				const belowSpace = vh - r.bottom - GAP;  // 选择器下方可用高度
				let top, origin;
				if (aboveSpace >= 140) {
					// 上方优先：面板永远贴选择器上方 —— 限高=上方可用÷缩放系数（保证视觉高度不超），
					// 底边贴选择器顶（transform-origin: bottom center → 大中小的视觉底边都贴在选择器上），
					// 面板放不下就在面板内滚动，绝不挪到别处。
					// 视觉顶/底都留 8px：th*scale ≤ aboveSpace-16，保证缩放后视觉完全不超屏
					const capH = Math.max(60, Math.min(vh - 16, Math.floor((aboveSpace - 16) / scale)));
					t.style.maxHeight = capH + "px";
					const th = t.offsetHeight || 0;
					top = r.top - th - GAP;
					origin = "bottom center";
				} else {
					// 选择器几乎贴屏顶：才放选择器下方，同样限高+贴边
					const capH = Math.max(60, Math.min(vh - 16, Math.floor((belowSpace - 16) / scale)));
					t.style.maxHeight = capH + "px";
					const th = t.offsetHeight || 0;
					top = r.bottom + GAP;
					origin = "top center";
				}
				const tw = t.offsetWidth || 0;
				let left = r.left + r.width / 2 - tw / 2;
				left = Math.max(8, Math.min(left, vw - tw - 8));
				t.style.transformOrigin = origin;
				t.style.left = left + "px";
				t.style.top = top + "px";
			};

			const resolveProviderCfg = async (provider) => {
				if (providerCfgCache && providerCfgKey === provider) return providerCfgCache;
				try {
					const { result } = await api.settings.describe({});
					const cfg = result && result.ok
						? (result.value.namespaces || []).find((n) => n && n.ns === "llm-pi-ai")?.value?.providers?.[provider]
						: null;
					providerCfgCache = cfg || null;
					providerCfgKey = provider;
					return providerCfgCache;
				} catch (e) {
					console.warn("[provider-badge] describe 失败", e);
					return null;
				}
			};
			const resolveModelInfo = async (provider, model) => {
				const key = provider + "/" + model;
				if (modelInfoCache && modelInfoKey === key) return modelInfoCache;
				try {
					const resp = await rpc.call("/api", "providerBadge/modelInfo", { args: { request: { provider, model } } });
					const mi = resp && resp.ok ? (resp.value || null) : null;
					modelInfoCache = mi;
					modelInfoKey = key;
					return mi;
				} catch (e) {
					console.warn("[provider-badge] modelInfo 失败", e);
					return null;
				}
			};

			// ---- 余量（余额/限额）----
			const fmtNum2 = (n) => {
				var v = Number(n);
				return v === v ? v.toFixed(2) : "—";
			};
			const currencySymbol = (code) => {
				if (code === "CNY") return "¥";
				if (code === "USD") return "$";
				if (code === "EUR") return "€";
				return (code || "") + " ";
			};
			const fmtPct = (u) => {
				var v = Number(u);
				return v === v ? Math.round(v) + "%" : "—";
			};
			const countdownStr = (resetsAt) => {
				if (!resetsAt) return null;
				var t = Date.parse(resetsAt);
				if (t !== t) return null;
				var diffMs = t - Date.now();
				if (diffMs <= 0) return null;
				var hours = Math.floor(diffMs / 3600000);
				var minutes = Math.floor((diffMs % 3600000) / 60000);
				if (hours > 24) return Math.floor(hours / 24) + "d" + (hours % 24) + "h";
				if (hours > 0) return hours + "h" + minutes + "m";
				return minutes + "m";
			};
			// 识图开启时，`value.current.provider` 会被 DSH 分流成一个合成 provider（如 `ocgo-02-vision`），
			// 它在 `llm-pi-ai.providers` 里没有配置条目（baseURL 取不到），导致家族识别失败、余量不展示。
			// 余量识别应始终基于「主模型座选中的主 provider」，而不是识图分流出的 vision provider：
			// 剥掉 `-vision` 等后缀还原主 provider，用主 provider 的配置去识别厂商 + 查询余量。
			// 注意：仅用于余量查询，不影响浮层里 Provider ID / 显示名称 / API 地址等任何页面显示。
			const bareProvider = (provider) => {
				if (typeof provider !== "string" || !provider) return provider;
				return provider.replace(/(?:-vision|-vision-exp|-vision-preview|-vision-latest)$/i, "");
			};
			// 悬浮窗余量查询：直接走模块级共享存储，供设置页复用同一份结果。
			const resolveBalance = (provider, cfg, force) => fetchProviderQuota(provider, cfg, force);
			// 余量浮层区块：仅 DeepSeek（余额）与 OpenCode Go（5h/周/月限额）查询，
			// 已识别但不支持的厂商显示「暂不支持该供应商查询」，未识别的不展示。
			const balanceRows = (b) => {
				if (!b) return null;
				// 已识别但暂不支持查询的厂商。
				if (!b.supported) {
					if (b.error === "not-supported") return [row(tx("balance"), tx("noSupport"))];
					return null;
				}
				// 支持查询但出错：细分错误原因。
				if (b.error) {
					var errText = tx("queryFailed");
					if (b.error === "no-api-key") errText = tx("noApiKey");
					else if (b.error === "subscription-required") errText = tx("subscriptionRequired");
					else if (b.error === "unauthorized") errText = tx("unauthorized");
					else if (b.error === "http-404") errText = tx("http404");
					else if (b.error === "missing-usage" || b.error === "missing-windows") errText = tx("missingUsage");
					return [row(tx("balance"), errText)];
				}
				// balance 家族（DeepSeek）：余额金额。
				if (b.kind === "balance" && b.family === "deepseek") {
					var bal = b.balance;
					var infos = (bal && bal.balance_infos) || [];
					// DeepSeek 接口 balance_infos 币种顺序不稳定，按币种字母升序稳定显示（CNY 在 USD 前）。
					infos = infos.slice().sort((a, b2) => String(a.currency || "").localeCompare(String(b2.currency || "")));
					var parts = infos.map((i) => currencySymbol(i.currency) + fmtNum2(i.total_balance));
					var suffix = bal && bal.is_available === false ? tx("insufficient") : "";
					return [row(tx("balanceName"), parts.length ? parts.join(" · ") + suffix : "—" + suffix)];
				}
				// limits 家族（OpenCode Go）：各窗口已用百分比 + 重置倒计时。
				if (b.kind === "limits") {
					var wins = b.windows || [];
					if (!wins.length) return [row(tx("balance"), tx("noData"))];
					var rows = [];
					for (var i = 0; i < wins.length; i++) {
						var w = wins[i];
						var title = w.label || w.key || tx("window");
						var pct = (w.percent !== null && w.percent !== undefined) ? fmtPct(w.percent) : null;
						var detail = pct || "";
						// 仅当 percent 有效时才折算金额，避免 null 时拼出误导的 $0.00。
						if (pct && w.limitUsd !== null && w.limitUsd !== undefined) detail += "（$" + fmtNum2(w.percent / 100 * w.limitUsd) + "/$" + fmtNum2(w.limitUsd) + "）";
						if (w.rateLimited) detail += " " + tx("rateLimited");
						var cd = countdownStr(w.resetsAt);
						rows.push(row(title, detail + (cd ? " · " + cd : "")));
					}
					return rows;
				}
				return null;
			};

			// 把 balanceRows 的结果映射为 DOM 行元素。
			// balanceRows 已经返回现成的 DOM 行元素（每个是 row() 的结果），直接透传即可。
			const buildRowEls = (b) => balanceRows(b);
			// 点「刷新」：绕过 client + host 缓存，强制重新查询，并只重绘余量数据行。
			const onRefreshBalance = async () => {
				const ctx2 = lastBalanceCtx;
				if (!ctx2 || !lastBalanceBox) return;
				const btn = lastBalanceBox.btn;
				if (btn) btn.textContent = tx("refreshing");
				try {
					const bal = await resolveBalance(ctx2.provider, ctx2.cfg, true);
					lastBalanceBox.body.innerHTML = "";
					const els = bal && bal.recognized ? buildRowEls(bal) : null;
					if (els && els.length) {
						for (var i = 0; i < els.length; i++) lastBalanceBox.body.appendChild(els[i]);
					} else {
						lastBalanceBox.body.appendChild(row(tx("balance"), tx("queryFailed")));
					}
				} catch (e) {
					console.warn("[provider-badge] 刷新余量失败", e);
					lastBalanceBox.body.innerHTML = "";
					lastBalanceBox.body.appendChild(row(tx("balance"), tx("queryFailed")));
				} finally {
					if (btn) btn.textContent = tx("refresh");
				}
			};
			// 在浮窗里挂载「余量」区块：标题行（含刷新按钮）+ 数据行。
			// 返回容器元素，刷新时可只重绘数据行、不扰动浮窗其它内容。
			const mountBalanceBlock = (t) => {
				const box = document.createElement("div");
				const head = document.createElement("div");
				Object.assign(head.style, {
					display: "flex", alignItems: "center", gap: "2px",
					margin: "6px 0 4px", fontSize: 11, fontWeight: 600, color: "#aab2c0", letterSpacing: ".02em"
				});
				const label = document.createElement("span");
				label.textContent = tx("balance");
				const btn = document.createElement("button");
				btn.textContent = tx("refresh");
				// 刷新按钮紧跟「余量」文字（红框位置），不再右对齐。
				Object.assign(btn.style, {
					marginLeft: "0", padding: "0 4px", fontSize: 10, lineHeight: "14px", cursor: "pointer",
					color: "var(--dsw-alias-label-secondary)", background: "transparent",
					border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6
				});
				btn.addEventListener("click", onRefreshBalance);
				head.appendChild(label);
				head.appendChild(btn);
				const body = document.createElement("div");
				Object.assign(body.style, { display: "block" });
				box.appendChild(head);
				box.appendChild(body);
				t.appendChild(box);
				return { box, body, btn };
			};
			const showTip = async () => {
				if (!badge) return;
				try {
					const sessionId = sessions.list.getSnapshot().current;
					if (typeof sessionId !== "string") return;
					const { result } = await api.sessions.models({ sessionId });
					const value = result && result.ok ? result.value : null;
					if (!value || !value.current) return;
					const provider = value.current.provider;
					const model = value.current.model;
					const group = (value.groups || []).find((g) => g && g.id === provider);
					const modelEntry = group && group.models
						? (group.models || []).find((m) => m && m.id === model)
						: null;
					const cfg = await resolveProviderCfg(provider);
					const mi = await resolveModelInfo(provider, model);

					const efforts = (modelEntry && modelEntry.reasoning && modelEntry.reasoning.efforts) || [];
					const currentEffortId = value.current.reasoningEffort || (modelEntry && modelEntry.reasoning && modelEntry.reasoning.defaultEffort);
					const currentEffort = efforts.find((e) => e && e.id === currentEffortId);
					const effortLabel = (currentEffort && currentEffort.name) || currentEffortId || "Default";
					const compatObj = (cfg && cfg.models && cfg.models.find && cfg.models.find((m) => m && m.id === model)?.compat);
					const compatText = compatObj && typeof compatObj === "object" && Object.keys(compatObj).length > 0
						? JSON.stringify(compatObj)
						: null;

					const t = ensureTip();
					t.innerHTML = "";
					t.appendChild(heading(tx("provider")));
					t.appendChild(row(tx("displayName"), (group && group.name) || provider));
					t.appendChild(row("Provider ID", provider));
					t.appendChild(row(tx("apiProtocol"), cfg && cfg.api || null));
					t.appendChild(row(tx("apiAddress"), cfg && cfg.baseURL || null));
					t.appendChild(row(tx("apiKeyEnv"), cfg && cfg.apiKeyEnv || null));
					t.appendChild(heading(tx("currentModel")));
					t.appendChild(row(tx("modelId"), model));
					t.appendChild(row(tx("modelDisplayName"), (modelEntry && modelEntry.name) || model));
					t.appendChild(row(tx("modelDescription"), modelEntry && modelEntry.description || null));
					t.appendChild(row(tx("reasoningLevel"), efforts.map((e) => e && e.name || e.id).join(" / ") || null));
					t.appendChild(row(tx("currentReasoningLevel"), effortLabel));
					t.appendChild(row(tx("contextWindow"), mi && mi.contextWindow != null ? String(mi.contextWindow) : null));
					t.appendChild(row(tx("maxToken"), mi && mi.maxTokens != null ? String(mi.maxTokens) : null));
					t.appendChild(row(tx("inputModes"), mi && mi.input && mi.input.length ? mi.input.join(" / ") : null));
					t.appendChild(row(tx("compatInfo"), compatText));
					// ---- 余量（余额/限额）：已识别厂商才展示 ----
					// 识别用 provider 与展示用 provider 解耦：识图开启时 current.provider 是 `xxx-vision`，
					// 这里剥掉 -vision 后缀还原主 provider，用主 provider 的配置（baseURL/密钥）去识别厂商并查余量；
					// 浮层上方的 Provider ID / 显示名称 / API 地址 / 密钥等展示字段仍用原始 provider，不受影响。
					const balanceProvider = bareProvider(provider);
					const balanceCfg = balanceProvider === provider ? cfg : await resolveProviderCfg(balanceProvider);
					// 悬停立即刷新：开启时每次悬停都强制重查（绕缓存）；否则走默认 5 分钟缓存。
					const bal = await resolveBalance(balanceProvider, balanceCfg, QSettings.hoverRefresh);
					if (bal && bal.recognized) {
						const mb = mountBalanceBlock(t);
						lastBalanceBox = mb;
						lastBalanceCtx = { provider: balanceProvider, cfg: balanceCfg };
						const els = buildRowEls(bal);
						if (els && els.length) {
							for (var bi = 0; bi < els.length; bi++) mb.body.appendChild(els[bi]);
						}
					}

					// 字体大小：大/中/小。用 transform scale + transform-origin: bottom center —— 缩放以「底边中心」（贴住模型选择器的那条边）为原点，
					// 这样无论大中小，面板底边都始终贴着选择器，不会像 zoom（左上角为原点）一样切换时位置飘移。
					t.style.transform = QSettings.fontSize === "large" ? "scale(1.15)" : QSettings.fontSize === "small" ? "scale(0.85)" : "scale(1)";
					t.style.display = "block";
					// 锚定整个模型选择器（而非小徽章）：弹窗永远紧贴选择器上方，水平与它中心对齐。
					position(seatBtnEl || badge);
				} catch (e) {
					console.warn("[provider-badge] 浮层刷新失败", e);
				}
			};
			const hideTip = () => {
				if (tip) tip.style.display = "none";
			};
			// 把悬浮热区绑到整个模型选择按钮（而不只是徽章那块）
			const onEnter = () => {
				hovering = true;
				if (hideTimer) clearTimeout(hideTimer);
				hideTimer = null;
				if (showTimer) clearTimeout(showTimer);
				showTimer = setTimeout(showTip, SHOW_DELAY);
			};
			const onLeave = () => {
				hovering = false;
				if (showTimer) clearTimeout(showTimer);
				showTimer = null;
				if (hideTimer) clearTimeout(hideTimer);
				// 延迟隐藏：若鼠标在 HIDE_DELAY 内移入浮窗，浮窗的 mouseenter 会重置 hovering 并取消。
				hideTimer = setTimeout(() => { if (!hovering) hideTip(); }, HIDE_DELAY);
			};
			let boundBtn = null;
			const attachHover = (btn) => {
				if (boundBtn === btn) return;
				if (boundBtn) {
					boundBtn.removeEventListener("mouseenter", onEnter);
					boundBtn.removeEventListener("mouseleave", onLeave);
				}
				boundBtn = btn;
				btn.addEventListener("mouseenter", onEnter);
				btn.addEventListener("mouseleave", onLeave);
			};

			// ---- 徽章 + 悬停挂载 ----
			const tick = async () => {
				try {
					const seatBtn = document.querySelector(SLOT + " button");
					if (!seatBtn) return;
					seatBtnEl = seatBtn;
					if (!badge) {
						badge = document.createElement("span");
						Object.assign(badge.style, {
							display: "inline-flex", alignItems: "center", flex: "none",
							padding: "0 5px", borderRadius: 999, fontSize: 10, lineHeight: "14px",
							color: "var(--dsw-alias-label-tertiary)",
							background: "var(--dsw-alias-bg-layer-3)",
							border: "1px solid var(--dsw-alias-border-l2)",
							fontWeight: 400, letterSpacing: ".01em",
							whiteSpace: "nowrap"
						});
						// 滚动：仅在鼠标不在悬停区（浮窗/按钮）时才隐藏，避免浮层错位；
						// 鼠标停在浮窗/按钮上时（正在查看/点击刷新）滚动不打断。尺寸变化时始终隐藏。
						window.addEventListener("scroll", () => { if (!hovering) hideTip(); }, { passive: true, capture: true });
						window.addEventListener("resize", hideTip);
					}
					if (badge.parentNode !== seatBtn) seatBtn.insertBefore(badge, seatBtn.firstChild);
					attachHover(seatBtn);
					const sessionId = sessions.list.getSnapshot().current;
					if (typeof sessionId !== "string") return;
					const { result } = await api.sessions.models({ sessionId });
					const text = result && result.ok ? labelFor(result.value) : null;
					badge.textContent = text || "";
					if ((text || null) !== lastText) {
						lastText = text || null;
						if (!text) noticeOnce();
					}
				} catch (e) {
					console.warn("[provider-badge] tick 失败", e);
					noticeOnce();
				}
			};
			// 2s 轮询（最简形态，不耦合 React 生命周期）
			setInterval(tick, 2000);
			tick();
			// 读取持久化设置（悬停立即刷新 / 自动刷新间隔），并开启自动刷新调度。
			loadSettings(rpc);
			// 自调度 setTimeout：每次循环重新读取当前间隔与开关，改设置后无需重启即生效。
			const scheduleAutoRefresh = () => {
				const minutes = Math.max(1, QSettings.autoRefreshMin || 5);
				setTimeout(() => {
					try {
						if (QSettings.autoRefreshOn && tip && tip.style.display === "block" && lastBalanceCtx && lastBalanceBox) onRefreshBalance();
					} catch (e) { console.warn("[provider-badge] 自动刷新失败", e); }
					scheduleAutoRefresh();
				}, minutes * 60 * 1000);
			};
			scheduleAutoRefresh();
		}
		//#endregion

		const inject = ["sessions", "connection", "slots"];
		// ----「提供商余量」设置页 ----
		function ProviderSettingsPage(props) {
			const rpc = props.rpc;
			const api = props.api;
			const [hoverRefresh, setHoverRefresh] = React.useState(QSettings.hoverRefresh);
			const [autoRefreshOn, setAutoRefreshOn] = React.useState(QSettings.autoRefreshOn);
			const [min, setMin] = React.useState(String(QSettings.autoRefreshMin));
			const [fontSize, setFontSize] = React.useState(QSettings.fontSize || "middle");
			const [language, setLanguage] = React.useState(QSettings.language || "system");
			const [busy, setBusy] = React.useState(false);
			const [status, setStatus] = React.useState(null);
			// ---- 余量表状态 ----
			const [providers, setProviders] = React.useState([]);       // [{provider, displayName, baseURL, apiKeyEnv}]
			const [quotaRow, setQuotaRow] = React.useState({});        // provider -> { result }（balance 归一前原始）
			const [quotaLoaded, setQuotaLoaded] = React.useState(false);
			const [refreshing, setRefreshing] = React.useState({});    // provider -> true（单行刷新中）
			const [refreshAllBusy, setRefreshAllBusy] = React.useState(false);
			const [showAllQuota, setShowAllQuota] = React.useState(false); // 是否展开全部（含无数据/未识别厂商）
			const styleBase = { background: "var(--dsw-alias-bg-layer-1)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 12, padding: "14px" };
			// 该 provider 是否有「可展示的数据」（余额/限额已查得，或有明确状态文案），
			// 无数据/未识别的官方厂商在收起态下隐藏，展开全部才显示。
			// 「尚未查询到结果」的行先当作有数据显示，避免逐项查询期间表格闪烁空白。
			const quotaHasData = (p) => {
				const row = quotaRow[p.provider];
				if (row === undefined) return true;    // 尚未查到，先显示
				if (row === null) return true;         // 查询失败，先显示
				if (row.recognized === false) return false; // 未识别厂商
				const c = quotaCells(row);
				if (c.balance || c.rolling || c.weekly || c.monthly) return true; // 有余额或限额或状态文案
				return false;
			};
			const visibleProviders = showAllQuota ? providers : providers.filter(quotaHasData);
			const hiddenCount = providers.length - visibleProviders.length;
			// 载入：枚举 provider 列表，然后逐个取余量（复用模块级 quotaCache，命中即不请求）。
			React.useEffect(() => {
				let alive = true;
				if (api) quotaShared.api = api;
				(async () => {
					const list = await fetchProviderList();
					if (!alive) return;
					setProviders(list);
					setQuotaLoaded(true);
					const next = {};
					for (const p of list) {
						const b = await fetchProviderQuota(p.provider, p, false);
						next[p.provider] = b;
					}
					if (!alive) return;
					// 合并已有（避免覆盖手工刷新结果）
					setQuotaRow((prev) => ({ ...prev, ...next }));
				})();
				return () => { alive = false; };
			}, []);
			// 单行刷新：绕过缓存强查。
			const refreshRow = async (p) => {
				setRefreshing((r) => ({ ...r, [p.provider]: true }));
				try {
					const b = await fetchProviderQuota(p.provider, p, true);
					setQuotaRow((prev) => ({ ...prev, [p.provider]: b }));
				} finally {
					setRefreshing((r) => ({ ...r, [p.provider]: false }));
				}
			};
			// 全部刷新：并发强查所有。
			const refreshAll = async () => {
				setRefreshAllBusy(true);
				try {
					const list = providers.length ? providers : await fetchProviderList();
					setProviders(list);
					const next = {};
					await Promise.all(list.map(async (p) => {
						const b = await fetchProviderQuota(p.provider, p, true);
						next[p.provider] = b;
					}));
					setQuotaRow((prev) => ({ ...prev, ...next }));
				} finally {
					setRefreshAllBusy(false);
				}
			};
			const save = () => {
				let m = Number(min);
				if (!Number.isFinite(m) || m < 1) m = 5;
				m = Math.round(m);
				setMin(String(m));
				setBusy(true); setStatus(null);
				saveSettings(rpc, { hoverRefresh: !!hoverRefresh, autoRefreshOn: !!autoRefreshOn, autoRefreshMin: m, fontSize, language }).then((ok) => {
					setBusy(false);
					setStatus(ok ? tx("settings.saved") : tx("settings.saveFailed"));
				});
			};
			// 表头单元格样式辅助（含竖线分隔）。
			const th = (text, opt) => React.createElement("th", {
				style: {
					padding: "6px 8px", fontSize: 11, fontWeight: 600, color: "var(--dsw-alias-label-secondary)",
					borderBottom: "1px solid var(--dsw-alias-border-l2)", whiteSpace: "nowrap",
					borderLeft: opt && opt.first ? "none" : "1px solid var(--dsw-alias-border-l2)",
					textAlign: opt && opt.left ? "left" : "right"
				}
			}, text);
			return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 } },
				React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
					React.createElement("h2", { style: { margin: 0, fontSize: 17, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, tx("settings.title")),
					React.createElement("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("settings.subtitle"))
				),
				React.createElement("div", { style: { ...styleBase, display: "flex", flexDirection: "column", gap: 12 } },
					React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
						React.createElement("input", { type: "checkbox", checked: hoverRefresh, onChange: (e) => setHoverRefresh(e.target.checked) }),
						React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
							React.createElement("span", null, tx("settings.hoverRefresh")),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("settings.hoverRefreshDesc"))
						)
					),
					React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
						React.createElement("input", { type: "checkbox", checked: autoRefreshOn, onChange: (e) => setAutoRefreshOn(e.target.checked) }),
						React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
							React.createElement("span", null, tx("settings.autoRefresh")),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("settings.autoRefreshDesc"))
						)
					),
					React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, opacity: autoRefreshOn ? 1 : 0.5 } },
						React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, tx("settings.interval")),
						React.createElement("input", { type: "number", min: 1, step: 1, value: min, disabled: !autoRefreshOn, onChange: (e) => setMin(e.target.value), style: { width: 90, padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none", opacity: autoRefreshOn ? 1 : 0.55 } }),
						React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", opacity: autoRefreshOn ? 1 : 0.6 } }, tx("settings.intervalMin"))
					)
				),
				React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
					React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, tx("settings.fontSize")),
					React.createElement("select", { value: fontSize, onChange: (e) => setFontSize(e.target.value), style: { padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none" } },
						React.createElement("option", { value: "small" }, tx("settings.fontSmall")),
						React.createElement("option", { value: "middle" }, tx("settings.fontMiddle")),
						React.createElement("option", { value: "large" }, tx("settings.fontLarge"))
					)
				),
				React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
					React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, tx("settings.language")),
					React.createElement("select", { value: language, onChange: (e) => setLanguage(e.target.value), style: { padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none" } },
						React.createElement("option", { value: "system" }, tx("settings.langSystem")),
						React.createElement("option", { value: "en" }, tx("settings.langEn")),
						React.createElement("option", { value: "zh" }, tx("settings.langZh"))
					)
				),
				// ---- 余量表卡片 ----
				React.createElement("div", { style: { ...styleBase, display: "flex", flexDirection: "column", gap: 10 } },
					React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
						React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } },
							React.createElement("span", { style: { fontSize: 14, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, tx("quota.title")),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("quota.subtitle"))
						),
						React.createElement("button", { type: "button", onClick: refreshAll, disabled: refreshAllBusy || !providers.length, style: { border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: providers.length && !refreshAllBusy ? "pointer" : "default", background: "transparent", color: "var(--dsw-alias-label-primary)", opacity: (refreshAllBusy || !providers.length) ? 0.55 : 1 } }, refreshAllBusy ? tx("quota.refreshAllBusy") : tx("quota.refreshAll"))
					),
					providers.length === 0
						? React.createElement("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, quotaLoaded ? tx("quota.empty") : tx("quota.loading"))
						: React.createElement("div", { style: { overflowX: "auto", maxWidth: "100%" } },
							React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 460 } },
								React.createElement("thead", null,
									React.createElement("tr", { style: { borderBottom: "1px solid var(--dsw-alias-border-l2)" } },
										th(tx("quota.col.provider"), { left: true, first: true }),
										th(tx("quota.col.rolling")),
										th(tx("quota.col.weekly")),
										th(tx("quota.col.monthly")),
										th(tx("quota.col.balance")),
										th(tx("quota.col.action"))
									)
								),
								React.createElement("tbody", null,
									visibleProviders.map((p) => {
										const row = quotaRow[p.provider];
										const c = row ? quotaCells(row) : { rolling: "", weekly: "", monthly: "", balance: "" };
										const cellStyle = { padding: "6px 8px", borderBottom: "1px solid var(--dsw-alias-border-l2)", color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" };
										const nameStyle = { ...cellStyle, color: "var(--dsw-alias-label-secondary)", fontWeight: 500, borderLeft: "none" };
										const numStyle = { ...cellStyle, textAlign: "right", borderLeft: "1px solid var(--dsw-alias-border-l2)" };
										const balStyle = { ...numStyle, color: row && (row.error || !row.supported) ? "var(--dsw-alias-label-tertiary)" : "var(--dsw-alias-label-primary)" };
										const isRefreshing = !!refreshing[p.provider];
										return React.createElement("tr", { key: p.provider, style: { borderBottom: "1px solid var(--dsw-alias-border-l2)" } },
											React.createElement("td", { style: nameStyle }, p.displayName || p.provider),
											React.createElement("td", { style: numStyle }, c.rolling),
											React.createElement("td", { style: numStyle }, c.weekly),
											React.createElement("td", { style: numStyle }, c.monthly),
											React.createElement("td", { style: balStyle }, c.balance),
											React.createElement("td", { style: { ...numStyle, textAlign: "right" } },
												React.createElement("button", { type: "button", onClick: () => refreshRow(p), disabled: isRefreshing, style: { padding: "2px 8px", fontSize: 11, cursor: isRefreshing ? "default" : "pointer", background: "transparent", color: "var(--dsw-alias-label-secondary)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, opacity: isRefreshing ? 0.55 : 1 } }, isRefreshing ? tx("refreshing") : tx("refresh"))
											)
										);
									})
								)
							)
						),
					// 展开/收起切换：只要有「无数据的官方厂商」就一直显示（展开后仍可收起）。
					providers.length > 0 && hiddenCount > 0
						? React.createElement("button", { type: "button", onClick: () => setShowAllQuota((v) => !v), style: { alignSelf: "flex-start", padding: "3px 10px", fontSize: 12, cursor: "pointer", background: "transparent", color: "var(--dsw-alias-label-secondary)", border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 6 } }, showAllQuota ? tx("quota.collapse") : (tx("quota.expandAll") + "（" + hiddenCount + "）"))
						: null
				),
				React.createElement("div", { style: { position: "sticky", bottom: 0, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", marginTop: 2, background: "var(--dsw-alias-bg-base)", borderTop: "1px solid var(--dsw-alias-border-l2)", boxShadow: "0 -8px 16px -12px rgba(0,0,0,0.5)", zIndex: 2 } },
					React.createElement("button", { type: "button", onClick: save, disabled: busy, style: { background: "var(--dsw-alias-label-primary)", color: "var(--dsw-alias-bg-layer-3)", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500, opacity: busy ? 0.5 : 1 } }, busy ? tx("settings.saving") : tx("settings.save")),
					status ? React.createElement("span", { style: { fontSize: 13, color: status === "已保存" ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" } }, status) : null
				)
			);
		}

		function apply(ctx) {
			// 注册 i18n 字典（跟随系统时由 DSH locale 决定语言）
			try {
				if (ctx.locale && typeof ctx.locale.register === "function") {
					ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), "provider-info: locales");
				}
			} catch (e) { console.warn("[provider-badge] 注册字典失败", e); }
			// resolveLang：手动 language 优先；system 时跟随 DSH 当前界面语言
			resolveLang = () => {
				const pref = QSettings.language;
				if (pref === "en" || pref === "zh") return pref;
				try {
					const active = ctx.locale && ctx.locale.getLocale ? ctx.locale.getLocale().active : null;
					return (active === "zh" || active === "en") ? active : "zh";
				} catch (e) { return "zh"; }
			};
			ctx.inject(["sessions", "connection", "slots"], (scoped) => {
				quotaShared.api = scoped.connection.api;
				quotaShared.rpc = scoped.connection.rpc;
				try {
					installProviderBadge(scoped.sessions, scoped.connection.api, scoped.connection.rpc);
				} catch (e) {
					console.warn("[provider-badge] 安装失败", e);
				}
				const slots = scoped.slots;
				if (slots && slots.inject) {
					try {
						slots.inject("settings.section", () => slots.register({
							name: "settings.section",
							id: "provider-info",
							order: 13,
							label: tx("settings.entry")
						}, (props) => React.createElement(ProviderSettingsPage, { ...props, rpc: scoped.connection.rpc, api: scoped.connection.api })));
					} catch (e) {
						console.warn("[provider-badge] 注册设置页失败", e);
					}
				}
			});
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
