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
			"monthlyQuota": "月度额度",
			"refresh": "刷新",
			"refreshing": "刷新中…",
			"unknown": "未提供",
			"window": "窗口",
			"noSupport": "暂不支持该供应商查询",
			"noSupportProvider": "当前暂不支持查询当前提供商",
			"expiresOn": "到期",
			"daysUnit": "天",
			"leftDays": "剩",
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
			// 悬浮浮层专用的紧凑窗口标签（与设置页表格表头分开，见 quota.col.*）。
			"quota.win.rolling": "5h",
			"quota.win.weekly": "7d",
			"quota.win.monthly": "30d",
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
			"monthlyQuota": "Monthly quota",
			"refresh": "Refresh",
			"refreshing": "Refreshing…",
			"unknown": "Not provided",
			"window": "Window",
			"noSupport": "Queries not supported for this provider",
			"noSupportProvider": "Queries are not supported for this provider yet",
			"expiresOn": "Expires",
			"daysUnit": "d",
			"leftDays": "left",
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
			// Compact window labels for the hover popover (separate from the settings table's quota.col.*).
			"quota.win.rolling": "5h",
			"quota.win.weekly": "7d",
			"quota.win.monthly": "30d",
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
		const quotaShared = { rpc: null };
		const quotaCache = new Map(); // key: provider 路由键 -> { fetchedAt, value }
		// 并发去重：同一 provider 的查询在途时就复用同一个 Promise，快速反复悬停不会堆请求。
		const quotaInflight = new Map(); // key: provider + '|' + force -> Promise
		/** 读当前缓存里的余量（不触发网络）——悬浮窗先据此立即渲染，避免“面板等网络”。 */
		const peekQuota = (provider) => {
			const c = quotaCache.get(provider);
			return c && c.value ? c.value : null;
		};
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
		/** 查询单个 provider 余量；命中 client 缓存直接回，命中后回写缓存；同键并发复用同一 Promise。 */
		async function fetchProviderQuota(provider, cfg, force) {
			if (!quotaShared.rpc) return null;
			const cached = quotaCache.get(provider);
			if (!force && cached && cached.value && cached.value.recognized && cached.value.supported && !cached.value.error) {
				return cached.value;
			}
			const inflightKey = provider + "|" + (force ? "force" : "cached");
			const running = quotaInflight.get(inflightKey);
			if (running) return running;
			const task = (async () => {
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
				} finally {
					quotaInflight.delete(inflightKey);
				}
			})();
			quotaInflight.set(inflightKey, task);
			return task;
		}
		// ---- 余量结果 → 表格单元格归一化（供设置页表格使用，自包含不依赖悬浮闭包）----
		const _num2 = (n) => { var v = Number(n); return v === v ? v.toFixed(2) : ""; };
		const _pct = (n) => { var v = Number(n); return v === v ? v.toFixed(2) + "%" : ""; };
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
			// limits 家族（OpenCode Go / Command Code / 其它 percent 型）：三窗口各放百分比。
			if (b.kind === "limits") {
				const wins = b.windows || [];
				for (const w of wins) {
					const k = w.key;
					const pct = (w.percent !== null && w.percent !== undefined) ? _pct(w.percent) : "";
					if (k === "rolling" || k === "5小时") cells.rolling = pct;
					else if (k === "weekly" || k === "7天") cells.weekly = pct;
					else if (k === "monthly" || k === "30天") cells.monthly = pct;
				}
				// Command Code：月度剩余 credits 放进「余额」列（无查询窗口时表格仍有数据可见）。
				if (b.family === "commandcode" && b.monthly && b.monthly.remaining != null) {
					const mCur = b.monthly.currency === "USD" ? "$" : (b.monthly.currency || "") + " ";
					cells.balance = mCur + _num2(b.monthly.remaining) + (b.monthly.total != null ? " / " + mCur + _num2(b.monthly.total) : "");
				}
			}
			return cells;
		}
		/** 余量错误/不支持状态 → 文案（复用 tx 词条，与悬浮窗一致）。 */
		function quotaErrorText(b) {
			if (!b) return "";
			// 未识别厂商 / 已识别但暂不支持查询 → 统一提示「暂不支持查询当前提供商」。
			if (!b.supported || b.recognized === false) return tx("noSupportProvider");
			if (b.error === "no-api-key") return tx("noApiKey");
			if (b.error === "subscription-required") return tx("subscriptionRequired");
			if (b.error === "unauthorized") return tx("unauthorized");
			if (b.error === "http-404") return tx("http404");
			if (b.error === "missing-usage" || b.error === "missing-windows" || b.error === "no-data") return tx("missingUsage");
			return tx("queryFailed");
		}
		//#endregion

		//#region 提供商徽章 + 悬浮信息浮层
		/** 徽章文本：显示名称优先，回退 Provider ID（提供商路由键）。 */
		function labelFor(value) {
			const current = value && value.current;
			const provider = current && current.provider;
			if (!provider) return null;
			const group = (value.groups || []).find((g) => g && g.id === provider);
			return (group && group.name) || provider;
		}
		let decoratorNoticeShown = false;
		/** 装饰失效的显式提示（ADR-0001：显式失败，不静默）。两种承载方式共用。 */
		function noticeDecoratorFailure() {
			if (decoratorNoticeShown) return;
			decoratorNoticeShown = true;
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
		}

		/**
		 * 悬浮浮层控制器：拥有浮层 DOM、悬停状态机（唤起延迟 / 收起宽限 / 代际取消）、
		 * 渐进渲染与后台刷新。热区（徽章）与定位锚点由调用方提供，两种承载方式共用同一套逻辑：
		 *   ① 官方槽位 conversation.input.right 里的 React 徽章（推荐，见 makeSlotBadge）
		 *   ② 旧版 DSH 回退：往模型座按钮内注入 DOM 徽章（seatAnchorMode）
		 */
		function createTipController(opts) {
			const sessions = opts.sessions;
			const api = opts.api;
			const rpc = opts.rpc;
			const fixedSessionId = typeof opts.sessionId === "string" ? opts.sessionId : null;
			const getAnchor = opts.getAnchor || (() => null);   // 浮层定位锚点（模型座容器）
			const getHotzone = opts.getHotzone || (() => null); // 悬停热区（徽章元素）
			const seatAnchorMode = !!opts.seatAnchorMode;       // 徽章是否嵌在模型座按钮内（旧版回退路径）
			const SHOW_DELAY = 120;      // 悬停唤起延迟（数据已缓存时几乎无感）
			const HIDE_DELAY = 100;      // 移出后的宽限，便于顺势挪进浮窗
			const LEAVE_GRACE = 120;     // 旧版回退路径：从徽章移入按钮本体时的宽限
			const UNKNOWN = "未提供"; // 兼容外部引用（实际显示走 tx("unknown")）
			// 悬停会话代际：enter/leave/点击时自增；showTip 的每个 await 后校验，过期结果直接丢弃，
			// 从而避免“悬停时没反应、移开后请求回来才忽然弹出”。
			let showSeq = 0;
			// 缓存：provider 配置（settings.describe 的 llm-pi-ai.providers[provider]）与目录真值（rpc modelInfo）
			let providerCfgCache = null;
			let providerCfgKey = null;
			let modelInfoCache = null;
			let modelInfoKey = null;
			/** 只读缓存（不发请求）：悬浮窗先用缓存同步渲染，慢数据后台补齐。 */
			const peekProviderCfg = (provider) => (providerCfgCache && providerCfgKey === provider ? providerCfgCache : null);
			const peekModelInfo = (provider, model) => (modelInfoCache && modelInfoKey === provider + "/" + model ? modelInfoCache : null);

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
				return v === v ? v.toFixed(2) + "%" : "—";
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
				// 已识别但暂不支持查询 / 完全未识别的厂商：浮窗照常显示该行，明确告知不支持。
				if (!b.supported) {
					return [row(tx("balance"), tx("noSupportProvider"))];
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
				// limits 家族（OpenCode Go / Command Code）：各窗口已用百分比 + 重置倒计时。
				if (b.kind === "limits") {
					var wins = b.windows || [];
					// Command Code：月度额度行（30d）的数据先算好，但**延后到最后**再 push ——
					// 行顺序为「5h → 7d → 30d → 到期」，到期行收尾。
					var ccMonthly = (b.family === "commandcode" && b.monthly && b.monthly.remaining != null)
						? b.monthly : null;
					if (!wins.length && !ccMonthly) return [row(tx("balance"), tx("noData"))];
					var rows = [];
					var ccMonthlyText = null;
					var ccExpiry = null;
					if (ccMonthly) {
						var mCur = ccMonthly.currency === "USD" ? "$" : (ccMonthly.currency || "") + " ";
						var mText;
						// 已用 = 总额 − 剩余。host 侧 remaining 把赠送/购买额度也累加进来，可能超过
						// total，故百分比必须夹到 [0,100]，否则会算出负数或 >100%。total 缺失或 ≤0
						// 时算不出百分比，退回只显示剩余金额（避免 NaN / Infinity）。
						var mTotal = (ccMonthly.total != null && ccMonthly.total > 0) ? ccMonthly.total : null;
						if (mTotal !== null) {
							var mUsed = Math.min(Math.max(mTotal - ccMonthly.remaining, 0), mTotal);
							mText = fmtPct((mUsed / mTotal) * 100)
								+ "（" + mCur + fmtNum2(mUsed) + "/" + mCur + fmtNum2(mTotal) + "）";
						} else {
							mText = mCur + fmtNum2(ccMonthly.remaining);
						}
						// 与 5h / 7d 行写法一致：末尾跟本周期剩余时间的倒计时。
						// 周期结束时间即 periodEnd，复用同一个 countdownStr，格式与窗口行完全统一。
						// （原先这里显示套餐名，如 goat。）
						var cdMonthly = countdownStr(ccMonthly.periodEnd);
						if (cdMonthly) mText += " · " + cdMonthly;
						ccMonthlyText = mText;
						// 到期时间（订阅计费周期结束）：2026-10-08 · 剩 28 天
						var pd = ccMonthly.periodEnd ? new Date(ccMonthly.periodEnd) : null;
						if (pd && pd.getTime() === pd.getTime()) {
							var pad2 = (n) => String(n).padStart(2, "0");
							ccExpiry = pd.getFullYear() + "-" + pad2(pd.getMonth() + 1) + "-" + pad2(pd.getDate());
							if (ccMonthly.daysLeft != null && ccMonthly.daysLeft >= 0) {
								ccExpiry += " · " + tx("leftDays") + " " + ccMonthly.daysLeft + tx("daysUnit");
							}
						}
					}
					for (var i = 0; i < wins.length; i++) {
						var w = wins[i];
						// 标签走浮层专用的紧凑键（5h / 7d / 30d）；缺键时回退到 host 给的 label。
						var wk = w.key ? tx("quota.win." + w.key) : null;
						var title = (wk && wk !== "quota.win." + w.key) ? wk : (w.label || w.key || tx("window"));
						var pct = (w.percent !== null && w.percent !== undefined) ? fmtPct(w.percent) : null;
						var detail = pct || "";
						// 仅当 percent 有效时才折算金额，避免 null 时拼出误导的 $0.00。
						if (pct && w.limitUsd !== null && w.limitUsd !== undefined) detail += "（$" + fmtNum2(w.percent / 100 * w.limitUsd) + "/$" + fmtNum2(w.limitUsd) + "）";
						if (w.rateLimited) detail += " " + tx("rateLimited");
						var cd = countdownStr(w.resetsAt);
						rows.push(row(title, detail + (cd ? " · " + cd : "")));
					}
					if (ccMonthlyText !== null) rows.push(row(tx("quota.win.monthly"), ccMonthlyText));
					if (ccExpiry) rows.push(row(tx("expiresOn"), ccExpiry));
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
					const els = bal ? buildRowEls(bal) : null;
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
			// 同步渲染面板：只用手上已有的数据（内存缓存），不发任何请求 —— 保证悬停立刻可见。
			// bal 为 null 且 balancePending 时，余量区块先渲染「刷新中…」占位，后台查询回来再重绘。
			const renderTip = (value, cfg, mi, bal, balancePending, balanceProvider, balanceCfg) => {
				const provider = value.current.provider;
				const model = value.current.model;
				const group = (value.groups || []).find((g) => g && g.id === provider);
				const modelEntry = group && group.models
					? (group.models || []).find((m) => m && m.id === model)
					: null;
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
				// ---- 余量（余额/限额）----
				// 识别用 provider 与展示用 provider 解耦：识图开启时 current.provider 是 `xxx-vision`，
				// 这里剥掉 -vision 后缀还原主 provider，用主 provider 的配置（baseURL/密钥）去识别厂商并查余量；
				// 浮层上方的 Provider ID / 显示名称 / API 地址 / 密钥等展示字段仍用原始 provider，不受影响。
				if (bal || balancePending) {
					const mb = mountBalanceBlock(t);
					lastBalanceBox = mb;
					lastBalanceCtx = { provider: balanceProvider, cfg: balanceCfg };
					if (bal) {
						const els = buildRowEls(bal);
						if (els && els.length) {
							for (var bi = 0; bi < els.length; bi++) mb.body.appendChild(els[bi]);
						} else {
							mb.body.appendChild(row(tx("balance"), tx("queryFailed")));
						}
					} else {
						// 首次查询/后台强刷尚未回来：先给占位，回来后再重绘，避免“悬停没反应”。
						mb.body.appendChild(row(tx("balance"), tx("refreshing")));
					}
				}

				// 字体大小：大/中/小。用 transform scale + transform-origin: bottom center —— 缩放以「底边中心」（贴住模型选择器的那条边）为原点，
				// 这样无论大中小，面板底边都始终贴着选择器，不会像 zoom（左上角为原点）一样切换时位置飘移。
				t.style.transform = QSettings.fontSize === "large" ? "scale(1.15)" : QSettings.fontSize === "small" ? "scale(0.85)" : "scale(1)";
				t.style.display = "block";
				// 锚定模型选择器容器（无则退化为徽章本身）：弹窗紧贴选择器上方，水平与它中心对齐。
				position(getAnchor() || getHotzone());
			};

			/**
			 * 悬停唤起浮层：先同步渲染（缓存命中即时可见），慢数据（首次的 provider 配置 / 目录真值 /
			 * 余量）在后台补齐后重绘。每个 await 后都用 seq 校验悬停会话是否仍有效，过期即丢弃。
			 */
			const showTip = async (seq) => {
				if (!getHotzone()) return;
				const live = () => seq === showSeq && hovering;
				try {
					const sessionId = fixedSessionId || sessions.list.getSnapshot().current;
					if (typeof sessionId !== "string") return;
					const { result } = await api.sessions.models({ sessionId });
					if (!live()) return;
					const value = result && result.ok ? result.value : null;
					if (!value || !value.current) return;
					const provider = value.current.provider;
					const model = value.current.model;
					const balanceProvider = bareProvider(provider);

					// 1) 先渲染：全部来自内存缓存，不发请求（首次未缓存的行显示“未提供”，余量显示“刷新中…”）。
					const cfgCached = peekProviderCfg(provider);
					const miCached = peekModelInfo(provider, model);
					const balCached = peekQuota(balanceProvider);
					const needCfg = !cfgCached;
					const needMi = !miCached;
					// 开了「悬停自动刷新」时即使有缓存也要后台强刷一次（不阻塞显示）。
					const needBal = !balCached || !!QSettings.hoverRefresh;
					renderTip(value, cfgCached, miCached, balCached, needBal, balanceProvider,
						balanceProvider === provider ? cfgCached : null);
					if (!needCfg && !needMi && !needBal) return; // 全命中：到此为止（丝滑路径）

					// 2) 后台补齐/刷新；任何一个 await 之后鼠标已离开就丢弃，绝不“移出后忽然弹出”。
					const cfg = cfgCached || await resolveProviderCfg(provider);
					if (!live()) return;
					const mi = miCached || await resolveModelInfo(provider, model);
					if (!live()) return;
					const balanceCfg = balanceProvider === provider ? cfg : await resolveProviderCfg(balanceProvider);
					if (!live()) return;
					let bal = balCached;
					if (needBal) {
						bal = await resolveBalance(balanceProvider, balanceCfg, !!QSettings.hoverRefresh);
						if (!live()) return;
					}
					renderTip(value, cfg, mi, bal, false, balanceProvider, balanceCfg);
				} catch (e) {
					console.warn("[provider-badge] 浮层刷新失败", e);
				}
			};
			const hideTip = () => {
				if (tip) tip.style.display = "none";
			};
			// 悬浮热区只绑在提供商徽章小标签上：悬停标签才弹浮窗；
			// 移向按钮本体短暂宽限（LEAVE_GRACE）后收起——避免标签小、擦边就丢悬停；
			// 若模型下拉已展开（aria-expanded=true）则立即收起，绝不遮挡正在选的菜单。
			const onEnter = () => {
				hovering = true;
				if (hideTimer) clearTimeout(hideTimer);
				hideTimer = null;
				if (showTimer) clearTimeout(showTimer);
				const seq = ++showSeq; // 本次悬停会话的代际
				showTimer = setTimeout(() => { showTimer = null; showTip(seq); }, SHOW_DELAY);
			};
			const onLeave = (e) => {
				const next = e && e.relatedTarget;
				const intoTip = !!(tip && next && (next === tip || (tip.contains && tip.contains(next))));
				hovering = false;
				if (showTimer) clearTimeout(showTimer);
				showTimer = null;
				if (hideTimer) clearTimeout(hideTimer);
				hideTimer = null;
				// 只要不是挪进浮窗，就结束本次悬停会话：在途的 showTip 结果一律作废，
				// 这样不会出现“悬停时没反应、移开后请求回来才忽然弹出”。
				if (!intoTip) showSeq++;
				const anchorEl = getAnchor();
				const stayingOnSeat = seatAnchorMode && anchorEl && next && (next === anchorEl || (anchorEl.contains && anchorEl.contains(next)));
				if (stayingOnSeat) {
					const menuOpen = !!(anchorEl.getAttribute && anchorEl.getAttribute("aria-expanded") === "true");
					if (menuOpen) { hideTip(); return; }
					hideTimer = setTimeout(() => { if (!hovering) hideTip(); }, LEAVE_GRACE);
					return;
				}
				hideTimer = setTimeout(() => { if (!hovering) hideTip(); }, HIDE_DELAY);
			};
			// 滚动/尺寸变化：鼠标不在悬停区（浮窗/徽章）时隐藏，避免浮层错位；停在浮窗上时滚动不打断。
			const onWindowScroll = () => { if (!hovering) hideTip(); };
			const safeAdd = (target, type, fn, opts) => { try { target.addEventListener(type, fn, opts); return true; } catch (e) { return false; } };
			const safeRemove = (target, type, fn, opts) => { try { target.removeEventListener(type, fn, opts); } catch (e) { /* 忽略 */ } };
			safeAdd(window, "scroll", onWindowScroll, { passive: true, capture: true });
			safeAdd(window, "resize", hideTip);
			// 点击浮窗与“正在操作的模型座”之外的任何位置 → 立即收起。
			// 注意：旧版回退路径里徽章嵌在按钮内部，点它也会冒泡打开模型下拉，所以点锚点内一律收起。
			const onDocMouseDown = (ev) => {
				const target = ev && ev.target;
				const hot = getHotzone();
				const anchorEl = getAnchor();
				const inTip = !!(tip && target && tip.contains && tip.contains(target));
				if (inTip) return;
				const inHot = !!(hot && target && (hot === target || (hot.contains && hot.contains(target))));
				const inSeat = !!(seatAnchorMode && anchorEl && target && (target === anchorEl || (anchorEl.contains && anchorEl.contains(target))));
				if (inHot && !inSeat) return;
				hovering = false;
				showSeq++;
				if (showTimer) { clearTimeout(showTimer); showTimer = null; }
				if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
				hideTip();
			};
			safeAdd(document, "mousedown", onDocMouseDown, true);
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
			return {
				onEnter,
				onLeave,
				hide: () => {
					hovering = false;
					showSeq++;
					if (showTimer) { clearTimeout(showTimer); showTimer = null; }
					if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
					hideTip();
				},
				isVisible: () => !!(tip && tip.style.display === "block"),
				dispose: () => {
					if (showTimer) clearTimeout(showTimer);
					if (hideTimer) clearTimeout(hideTimer);
					showSeq++;
					safeRemove(document, "mousedown", onDocMouseDown, true);
					safeRemove(window, "scroll", onWindowScroll, true);
					safeRemove(window, "resize", hideTip);
					if (tip && tip.parentNode) tip.parentNode.removeChild(tip);
					tip = null;
				}
			};
		}

		/**
		 * 旧版 DSH 回退承载：往模型座按钮内注入 DOM 徽章 + 轮询文本。
		 * 新版走官方槽位（makeSlotBadge）；仅当槽位不可用（旧版没有该槽）时才走这里。
		 */
		function installProviderBadge(sessions, api, rpc) {
			const SLOT = '[data-slot="conversation.input.model"]';
			const ATTACH_CHECK_MS = 300;
			let badge = null;
			let badgeLabel = null;
			let seatBtnEl = null;
			let lastText = null;
			const controller = createTipController({
				sessions, api, rpc,
				seatAnchorMode: true,
				getAnchor: () => seatBtnEl,
				getHotzone: () => badge
			});
			const onEnter = () => controller.onEnter();
			const onLeave = (e) => controller.onLeave(e);
			let boundEl = null;
			const attachHover = (el) => {
				if (boundEl === el) return;
				if (boundEl) {
					boundEl.removeEventListener("mouseenter", onEnter);
					boundEl.removeEventListener("mouseleave", onLeave);
				}
				boundEl = el;
				el.addEventListener("mouseenter", onEnter);
				el.addEventListener("mouseleave", onLeave);
			};
			// ---- 徽章 + 悬停挂载 ----
			const tick = async () => {
				try {
					const seatBtn = document.querySelector(SLOT + " button");
					if (!seatBtn) return;
					seatBtnEl = seatBtn;
					if (!badge) {
						badge = document.createElement("span");
						// 与官方槽位徽章（makeSlotBadge）保持同一套 V14「键帽」样式，
						// 避免旧版 DSH 回退到本路径时观感不一致。
						Object.assign(badge.style, {
							display: "inline-flex", alignItems: "center", flex: "none",
							position: "relative", boxSizing: "border-box",
							padding: "1px 5px", minHeight: "17px", borderRadius: 4, fontSize: 10, lineHeight: "14px",
							color: "var(--dsw-alias-label-secondary)",
							background: "var(--dsw-alias-bg-layer-3)",
							border: "0.5px solid var(--dsw-alias-border-l2)",
							boxShadow: "0 1px 0 var(--dsw-alias-border-l3)",
							fontWeight: 600,
							whiteSpace: "nowrap"
						});
						// 透明外扩热区：视觉不变、命中范围各方向 +6px，避免标签太小“擦边即丢悬停”。
						const hit = document.createElement("span");
						Object.assign(hit.style, { position: "absolute", left: "-6px", right: "-6px", top: "-6px", bottom: "-6px" });
						badge.appendChild(hit);
						// 文本单独一个子节点：tick 只改它的内容，不会把热区节点一起清掉。
						badgeLabel = document.createElement("span");
						Object.assign(badgeLabel.style, { position: "relative", pointerEvents: "none" });
						badge.appendChild(badgeLabel);
					}
					if (badge.parentNode !== seatBtn) seatBtn.insertBefore(badge, seatBtn.firstChild);
					attachHover(badge);
					const sessionId = sessions.list.getSnapshot().current;
					if (typeof sessionId !== "string") return;
					const { result } = await api.sessions.models({ sessionId });
					const text = result && result.ok ? labelFor(result.value) : null;
					if (badgeLabel) badgeLabel.textContent = text || ""; else badge.textContent = text || "";
					if ((text || null) !== lastText) {
						lastText = text || null;
						if (!text) noticeDecoratorFailure();
					}
				} catch (e) {
					console.warn("[provider-badge] tick 失败", e);
					noticeDecoratorFailure();
				}
			};
			// 徽章存在性轻量看护：React 重挂/会话切换会把外来节点摘掉，尽快补回。
			const ensureBadgeAttached = () => {
				try {
					const seatBtn = document.querySelector(SLOT + " button");
					if (!seatBtn || !badge) return;
					if (seatBtnEl !== seatBtn) seatBtnEl = seatBtn;
					if (badge.parentNode !== seatBtn) seatBtn.insertBefore(badge, seatBtn.firstChild);
				} catch (e) { /* 忽略：下一轮再看护 */ }
			};
			setInterval(ensureBadgeAttached, ATTACH_CHECK_MS);
			// 2s 轮询（最简形态，不耦合 React 生命周期）：刷新徽章文本 + 兜底补挂。
			setInterval(tick, 2000);
			tick();
		}

		/**
		 * 徽章与模型座的实际间距。
		 * DSH 的 InputBar `.trailing` 容器（徽章与模型座的共同父级）是 `gap: 12px`；
		 * 槽位锚点 `<div data-slot=… style="display:contents">` 不产生盒子，所以徽章就是该
		 * flex 行的直接子项 —— 用负 margin-right 抵消掉多余部分，把 12px 压到 2px。
		 * 改成其他值：目标间距 = 12 - BADGE_GAP_PULL（2px → 10，4px → 8，6px → 6）。
		 */
		const BADGE_GAP_PULL = 10;

		/**
		 * 官方槽位承载（推荐）：徽章作为 conversation.input.right 的贡献项 —— 模型座左侧的官方空槽。
		 * 位置与排列完全交给 DSH（槽位锚点是 display:contents，徽章成为 trailing flex 行里的一项），
		 * 徽章不再是模型按钮的一部分；文本订阅模型目录 store 变化，浮层复用 createTipController。
		 */
		function makeSlotBadge(sessions, api, rpc) {
			return function ProviderBadge(props) {
				const sessionId = props && props.sessionId;
				const hostRef = React.useRef(null);
				const controllerRef = React.useRef(null);
				const [text, setText] = React.useState("");
				React.useEffect(() => {
					const controller = createTipController({
						sessions, api, rpc, sessionId,
						// 锚点优先用模型座（保持“紧贴选择器上方”的观感），取不到时退化为徽章自身。
						getAnchor: () => document.querySelector('[data-slot="conversation.input.model"] button') || hostRef.current,
						getHotzone: () => hostRef.current
					});
					controllerRef.current = controller;
					return () => { controllerRef.current = null; controller.dispose(); };
				}, []);
				React.useEffect(() => {
					let alive = true;
					let reading = false;
					const currentId = () => (typeof sessionId === "string" ? sessionId : sessions.list.getSnapshot().current);
					const apply = (result) => {
						if (!alive) return;
						setText(result && result.ok ? (labelFor(result.value) || "") : "");
					};
					// 订阅回调必须**只读**：绝不能调用会写 store 的 models()（它在状态 ≠ ready 时会
					// await directory.load()，而 load() 必然重新发布状态且把 selecting 原样写回），
					// 否则「通知 → load → 再通知」会形成纯微任务的自持循环，饿死事件循环。
					// reading 闸门是纯防御：被通知期间 store 可能再次发布，重入直接丢弃。
					const read = () => {
						if (reading) return;
						reading = true;
						const id = currentId();
						if (typeof id !== "string") { reading = false; return; }
						if (typeof api.modelsSnapshot === "function") {
							try { apply(api.modelsSnapshot({ sessionId: id }).result); }
							catch (e) { /* 目录尚未就绪：保持现状，等下一次通知 */ }
							reading = false;
							return;
						}
						// 旧版数据源没有只读入口：异步读取，只用于 2s 轮询兜底（宏任务，不会重入）。
						api.sessions.models({ sessionId: id }).then(
							({ result }) => { apply(result); reading = false; },
							() => { reading = false; }
						);
					};
					read();
					// 目录 store 变化即刷新（比轮询即时）；旧版数据源没有 subscribe 时退回 2s 轮询。
					let unsubscribe = null;
					try { if (api.subscribe) unsubscribe = api.subscribe(currentId(), read); } catch (e) { unsubscribe = null; }
					const timer = unsubscribe ? null : setInterval(read, 2000);
					return () => { alive = false; if (unsubscribe) unsubscribe(); if (timer) clearInterval(timer); };
				}, [sessionId]);
				if (!text) return null;
				return React.createElement("span", {
					ref: hostRef,
					"data-provider-badge": "",
					title: text,
					// 样式候选 V14「键帽（kbd）」，按反馈收紧一档：整体更小、描边更细、字重更强。
					// 几何：14px 行高 + 1px×2 内边距 + 0.5px×2 描边 = 17px，正好等于 minHeight，盒子不虚高。
					// 描边 0.5px 是 DSH 自己的惯例（主题包内多处 .5px solid），比 1px 更轻、不抢模型座。
					// 字重 600 用于补偿缩小后的字号：10px 下 500 会发虚，600 才能保持笔画清晰。
					style: {
						display: "inline-flex", alignItems: "center", flex: "none",
						marginRight: -BADGE_GAP_PULL,
						padding: "1px 5px", minHeight: "17px", borderRadius: 4, fontSize: 10, lineHeight: "14px",
						color: "var(--dsw-alias-label-secondary)",
						background: "var(--dsw-alias-bg-layer-3)",
						border: "0.5px solid var(--dsw-alias-border-l2)",
						boxShadow: "0 1px 0 var(--dsw-alias-border-l3)",
						fontWeight: 600,
						whiteSpace: "nowrap", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis",
						cursor: "default"
					},
					onMouseEnter: () => { if (controllerRef.current) controllerRef.current.onEnter(); },
					onMouseLeave: (e) => { if (controllerRef.current) controllerRef.current.onLeave(e); }
				}, text);
			};
		}
		//#endregion

		const inject = ["sessions", "connection", "slots"];
		// ----「提供商余量」设置页 ----
		function ProviderSettingsPage(props) {
			const rpc = props.rpc;
			const [hoverRefresh, setHoverRefresh] = React.useState(QSettings.hoverRefresh);
			const [autoRefreshOn, setAutoRefreshOn] = React.useState(QSettings.autoRefreshOn);
			const [min, setMin] = React.useState(String(QSettings.autoRefreshMin));
			const [fontSize, setFontSize] = React.useState(QSettings.fontSize || "middle");
			const [language, setLanguage] = React.useState(QSettings.language || "system");
			// 即时保存：不再有「保存」按钮，改动即持久化。
			// status 为 null | "saved" | "failed"；成功提示自动消失，失败常驻。
			const [status, setStatus] = React.useState(null);
			const statusTimer = React.useRef(null);
			React.useEffect(() => () => { if (statusTimer.current) clearTimeout(statusTimer.current); }, []);
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
			// 即时保存：只提交变更字段（host 侧 `set` 是 `{...已存, ...patch}` 合并语义，
			// 因此不会覆盖别处的改动）。成功提示 1.8s 后自动消失；失败常驻
			// （遵循本插件的 ADR-0001：显式失败，不静默）。
			const persist = (patch) => {
				saveSettings(rpc, patch).then((ok) => {
					setStatus(ok ? "saved" : "failed");
					if (statusTimer.current) { clearTimeout(statusTimer.current); statusTimer.current = null; }
					if (ok) statusTimer.current = setTimeout(() => setStatus(null), 1800);
				});
			};
			// 「定时刷新间隔」是数字输入框：**失焦 / 回车**时才提交。
			// 逐击键保存会把 "12" 先存成 1（并可能触发一次真实的定时刷新周期），故不即时提交。
			const commitMin = () => {
				let m = Number(min);
				if (!Number.isFinite(m) || m < 1) m = 5;
				m = Math.round(m);
				if (String(m) !== min) setMin(String(m));
				if (m !== QSettings.autoRefreshMin) persist({ autoRefreshMin: m });
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
				React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 } },
					React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
						React.createElement("h2", { style: { margin: 0, fontSize: 17, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, tx("settings.title")),
						React.createElement("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("settings.subtitle"))
					),
					// 即时保存的状态：改动即写入，这里只给反馈（成功短暂、失败常驻）。
					status
						? React.createElement("span", {
							style: {
								flex: "none", marginTop: 3, fontSize: 12, whiteSpace: "nowrap",
								color: status === "saved" ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)"
							}
						}, status === "saved" ? tx("settings.saved") : tx("settings.saveFailed"))
						: null
				),
				React.createElement("div", { style: { ...styleBase, display: "flex", flexDirection: "column", gap: 12 } },
					React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
						React.createElement("input", { type: "checkbox", checked: hoverRefresh, onChange: (e) => { const v = e.target.checked; setHoverRefresh(v); persist({ hoverRefresh: v }); } }),
						React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
							React.createElement("span", null, tx("settings.hoverRefresh")),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("settings.hoverRefreshDesc"))
						)
					),
					React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
						React.createElement("input", { type: "checkbox", checked: autoRefreshOn, onChange: (e) => { const v = e.target.checked; setAutoRefreshOn(v); persist({ autoRefreshOn: v }); } }),
						React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
							React.createElement("span", null, tx("settings.autoRefresh")),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, tx("settings.autoRefreshDesc"))
						)
					),
					React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, opacity: autoRefreshOn ? 1 : 0.5 } },
						React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, tx("settings.interval")),
						React.createElement("input", { type: "number", min: 1, step: 1, value: min, disabled: !autoRefreshOn, onChange: (e) => setMin(e.target.value), onBlur: commitMin, onKeyDown: (e) => { if (e.key === "Enter") { e.preventDefault(); commitMin(); } }, style: { width: 90, padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none", opacity: autoRefreshOn ? 1 : 0.55 } }),
						React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", opacity: autoRefreshOn ? 1 : 0.6 } }, tx("settings.intervalMin"))
					)
				),
				React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
					React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, tx("settings.fontSize")),
					React.createElement("select", { value: fontSize, onChange: (e) => { const v = e.target.value; setFontSize(v); persist({ fontSize: v }); }, style: { padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none" } },
						React.createElement("option", { value: "small" }, tx("settings.fontSmall")),
						React.createElement("option", { value: "middle" }, tx("settings.fontMiddle")),
						React.createElement("option", { value: "large" }, tx("settings.fontLarge"))
					)
				),
				React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
					React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, tx("settings.language")),
					React.createElement("select", { value: language, onChange: (e) => { const v = e.target.value; setLanguage(v); persist({ language: v }); }, style: { padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none" } },
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
				)
			);
		}

		//#region DSH ≥ 0.1.2（connection.api 已移除）的数据门面
		// 0.1.2-rc.1 起 dsh-client-connection 的 connection 服务不再暴露旧版 `api`
		// （sessions.models / settings.describe 曾挂在上面），高层取数改为：
		//   当前会话模型/提供商/分组  → modelDirectories 目录服务（每会话 ModelDirectory.store：
		//      快照 { current:{provider,model,reasoningEffort?}, groups:[{id,name,models:[…]}], … }，
		//      与旧 sessions.models 的 { current, groups } 语义一致，也是模型座自身渲染所依赖的数据）
		//   提供商配置（llm-pi-ai.providers）→ ctx.remote.settings.describe()
		// 这里把它们适配回 installProviderBadge 内部原有的 api.sessions.models /
		// api.settings.describe 形状，徽章/浮层/余量逻辑无需改动。
		function createModernDataFacade(dirs, remote) {
			return {
				sessions: {
					models: async (arg) => {
						const sessionId = arg && arg.sessionId;
						if (typeof sessionId !== "string") return { result: { ok: false } };
						let directory = null;
						try {
							directory = dirs.directoryFor(sessionId);
						} catch (e) {
							// 会话作用域尚未就绪（如刚打开/子代理会话）→ 下次轮询再试，不报错。
							return { result: { ok: false } };
						}
						let snap = directory.store.getSnapshot();
						if (snap.status !== "ready") {
							// 目录加载失败（如模型目录不可用）→ 抛出让调用方按“装饰失效”显式提示，
							// 与旧版 api 调用出错时一致；仅“作用域/目录未就绪”属瞬时态，静默等下次轮询。
							await directory.load();
							snap = directory.store.getSnapshot();
						}
						// 目录已就绪但还没有当前选择（如无模型可用的会话）→ ok，调用方按“无提供商”处理。
						return { result: { ok: true, value: snap } };
					},
					/**
					 * **只读**读取目录快照：绝不触发 load()、绝不写 store、绝不通知订阅者。
					 * 专供订阅回调使用 —— 在 store 通知期间调用任何会写 store 的方法都会形成自持循环。
					 * @returns { result: { ok: true, value: snapshot } }，或目录/作用域未就绪时的 { ok: false }。
					 */
					modelsSnapshot: (arg) => {
						const sessionId = arg && arg.sessionId;
						if (typeof sessionId !== "string") return { result: { ok: false } };
						try {
							return { result: { ok: true, value: dirs.directoryFor(sessionId).store.getSnapshot() } };
						} catch (e) {
							// 会话作用域尚未就绪（如刚打开/子代理会话）→ 静默，等下一次通知。
							return { result: { ok: false } };
						}
					}
				},
				settings: {
					describe: async () => {
						try {
							const resp = await remote.settings.describe();
							return { result: resp };
						} catch (e) {
							console.warn("[provider-badge] settings.describe 失败", e);
							return { result: null };
						}
					}
				},
				/**
				 * 订阅该会话的模型目录变化（切模型/换提供商即时回调），供槽位徽章替代轮询。
				 * @returns 退订函数；目录尚未就绪时返回 null（调用方退回轮询）。
				 */
				subscribe: (sessionId, cb) => {
					if (typeof sessionId !== "string") return null;
					try {
						const directory = dirs.directoryFor(sessionId);
						return directory.store.subscribe(() => { try { cb(); } catch (e) { console.warn("[provider-badge] 订阅回调失败", e); } });
					} catch (e) {
						return null;
					}
				}
			};
		}
		//#endregion

		function apply(ctx) {
			// 注册 i18n 字典（跟随系统时由 DSH locale 决定语言）
			// 必须走 ctx.inject(["locale"])：直接读 ctx.locale 会抛
			// "cannot get property locale without inject"，且不会有任何注册效果。
			try {
				ctx.inject(["locale"], (loc) => {
					if (loc.locale && typeof loc.locale.register === "function") {
						loc.effect(() => loc.locale.register(LOCALE_NS, { zh, en }), "provider-info: locales");
					}
				});
			} catch (e) { console.warn("[provider-badge] 注册字典失败", e); }
			// resolveLang：手动 language 优先；system 时跟随 DSH 当前界面语言
			resolveLang = () => {
				const pref = QSettings.language;
				if (pref === "en" || pref === "zh") return pref;
				try {
					// 可选读取：locale 未就绪时为 undefined，回退 "zh"。
					const locale = ctx.get("locale");
					const active = locale && locale.getLocale ? locale.getLocale().active : null;
					return (active === "zh" || active === "en") ? active : "zh";
				} catch (e) { return "zh"; }
			};
			ctx.inject(["sessions", "connection", "slots"], (scoped) => {
				quotaShared.rpc = scoped.connection && scoped.connection.rpc || null;
				const sessions = scoped.sessions;
				const slots = scoped.slots;
				// 数据路径选择：
				//  - 旧版 DSH（connection 服务还带 api 字段，如 0.1.1-rc.x）→ 原逻辑直用 connection.api。
				//  - 新版 DSH（0.1.2+，connection.api 已移除）→ 等 modelDirectories / remote 服务
				//    就绪后，用门面把目录 store + remote.settings.describe 适配回相同形状。
				const legacyApi = scoped.connection && scoped.connection.api;
				// 徽章承载：优先官方槽位 conversation.input.right（模型座左侧的官方空槽，结构上与选择器分离）；
				// 若槽位在 1.2s 内仍未就绪（旧版 DSH 没有该槽），回退到“往模型座按钮内注入 DOM”。
				const FALLBACK_AFTER_MS = 1200;
				const mountBadge = (dataApi) => {
					let mounted = false;
					let fallbackTimer = null;
					const installFallback = () => {
						if (mounted) return;
						try { installProviderBadge(sessions, dataApi, quotaShared.rpc); }
						catch (e) { console.warn("[provider-badge] 安装失败", e); noticeDecoratorFailure(); }
					};
					try {
						if (slots && slots.inject && slots.register) {
							slots.inject("conversation.input.right", () => {
								try {
									slots.register({
										name: "conversation.input.right",
										id: "provider-info",
										order: 15,
										locale: LOCALE_NS,
										inject: (sessionId) => ({ sessionId })
									}, makeSlotBadge(sessions, dataApi, quotaShared.rpc));
									mounted = true;
									if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
								} catch (e) {
									console.warn("[provider-badge] 注册官方槽位失败", e);
								}
							});
						}
					} catch (e) {
						console.warn("[provider-badge] 槽位不可用", e);
					}
					fallbackTimer = setTimeout(() => { fallbackTimer = null; installFallback(); }, FALLBACK_AFTER_MS);
				};
				if (legacyApi) {
					mountBadge(legacyApi);
				} else {
					ctx.inject(["modelDirectories", "remote", "remote.settings"], (scoped2) => {
						mountBadge(createModernDataFacade(scoped2.modelDirectories, scoped2.remote));
					});
				}
				if (slots && slots.inject) {
					try {
						slots.inject("settings.section", () => slots.register({
							name: "settings.section",
							id: "provider-info",
							order: 13,
							label: tx("settings.entry")
						}, (props) => React.createElement(ProviderSettingsPage, { ...props, rpc: quotaShared.rpc })));
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
