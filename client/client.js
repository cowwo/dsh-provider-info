window.__ModuleLoader__.load({
	id: "dsh-provider-info",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let React = require("react");

		// ---- 插件设置（持久化于 host 侧 json 文件）----
		const QSettings = { hoverRefresh: true, autoRefreshOn: false, autoRefreshMin: 5, fontSize: 'middle' };
		function loadSettings(rpc) {
			try {
				rpc.call("/api", "providerBadge/settings", { args: { request: { op: "get" } } }).then((resp) => {
					if (resp && resp.ok && resp.value && resp.value.settings) {
						const s = resp.value.settings;
						if (typeof s.hoverRefresh === "boolean") QSettings.hoverRefresh = s.hoverRefresh;
						if (typeof s.autoRefreshOn === "boolean") QSettings.autoRefreshOn = s.autoRefreshOn;
						if (typeof s.autoRefreshMin === "number") QSettings.autoRefreshMin = s.autoRefreshMin;
						if (s.fontSize === "large" || s.fontSize === "middle" || s.fontSize === "small") QSettings.fontSize = s.fontSize;
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
					return true;
				}
				return false;
			}).catch((e) => { console.warn("[provider-badge] 保存设置失败", e); return false; });
		}

		//#region 提供商徽章 + 悬浮信息浮层
		function installProviderBadge(sessions, api, rpc) {
			const SLOT = '[data-slot="conversation.input.model"]';
			const SHOW_DELAY = 250;
			const HIDE_DELAY = 100;
			const UNKNOWN = "未提供";
			let badge = null;
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
				const tw = t.offsetWidth || 0;
				const th = t.offsetHeight || 0;
				let left = r.left + r.width / 2 - tw / 2;
				let top = r.top - th - 8;
				left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
				if (top < 8) top = r.bottom + 8; // 放不下就放到下方
				if (top + th > window.innerHeight) top = Math.max(8, window.innerHeight - th - 8);
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
			const balanceCache = { key: null, value: null };
			const resolveBalance = async (provider, cfg, force) => {
				const key = provider;
				// 只缓存「成功且有数据」的结果；错误/未识别结果不缓存，避免临时故障被长期记住。
				// force=true（手动刷新）时绕过 client 缓存，并把 force 透传给 host 以绕过其 5 分钟缓存。
				const cacheable = !force && balanceCache.key === key && balanceCache.value && balanceCache.value.recognized && balanceCache.value.supported && !balanceCache.value.error;
				if (cacheable) return balanceCache.value;
				try {
					const resp = await rpc.call("/api", "providerBadge/balance", {
						args: { request: { provider, baseURL: cfg && cfg.baseURL || null, apiKeyEnv: cfg && cfg.apiKeyEnv || null, force: !!force } }
					});
					const b = resp && resp.ok ? (resp.value || null) : null;
					if (b && b.recognized && b.supported && !b.error) {
						balanceCache.key = key;
						balanceCache.value = b;
					} else {
						balanceCache.key = null;
						balanceCache.value = null;
					}
					return b;
				} catch (e) {
					console.warn("[provider-badge] balance 失败", e);
					balanceCache.key = null;
					balanceCache.value = null;
					return null;
				}
			};
			// 余量浮层区块：仅 DeepSeek（余额）与 OpenCode Go（5h/周/月限额）查询，
			// 已识别但不支持的厂商显示「暂不支持该供应商查询」，未识别的不展示。
			const balanceRows = (b) => {
				if (!b) return null;
				// 已识别但暂不支持查询的厂商。
				if (!b.supported) {
					if (b.error === "not-supported") return [row("余量", "暂不支持该供应商查询")];
					return null;
				}
				// 支持查询但出错：细分错误原因。
				if (b.error) {
					var errText = "查询失败";
					if (b.error === "no-api-key") errText = "未配置 API Key";
					else if (b.error === "subscription-required") errText = "订阅权限不足";
					else if (b.error === "unauthorized") errText = "密钥无效";
					else if (b.error === "http-404") errText = "接口地址错误";
					else if (b.error === "missing-usage" || b.error === "missing-windows") errText = "接口无用量数据";
					return [row("余量", errText)];
				}
				// balance 家族（DeepSeek）：余额金额。
				if (b.kind === "balance" && b.family === "deepseek") {
					var bal = b.balance;
					var infos = (bal && bal.balance_infos) || [];
					// DeepSeek 接口 balance_infos 币种顺序不稳定，按币种字母升序稳定显示（CNY 在 USD 前）。
					infos = infos.slice().sort((a, b2) => String(a.currency || "").localeCompare(String(b2.currency || "")));
					var parts = infos.map((i) => currencySymbol(i.currency) + fmtNum2(i.total_balance));
					var suffix = bal && bal.is_available === false ? "（余额不足）" : "";
					return [row("余额", parts.length ? parts.join(" · ") + suffix : "—" + suffix)];
				}
				// limits 家族（OpenCode Go）：各窗口已用百分比 + 重置倒计时。
				if (b.kind === "limits") {
					var wins = b.windows || [];
					if (!wins.length) return [row("余量", "无数据")];
					var rows = [];
					for (var i = 0; i < wins.length; i++) {
						var w = wins[i];
						var title = w.label || w.key || "窗口";
						var pct = (w.percent !== null && w.percent !== undefined) ? fmtPct(w.percent) : null;
						var detail = pct || "";
						// 仅当 percent 有效时才折算金额，避免 null 时拼出误导的 $0.00。
						if (pct && w.limitUsd !== null && w.limitUsd !== undefined) detail += "（$" + fmtNum2(w.percent / 100 * w.limitUsd) + "/$" + fmtNum2(w.limitUsd) + "）";
						if (w.rateLimited) detail += " 已限流";
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
				if (btn) btn.textContent = "刷新中…";
				try {
					const bal = await resolveBalance(ctx2.provider, ctx2.cfg, true);
					lastBalanceBox.body.innerHTML = "";
					const els = bal && bal.recognized ? buildRowEls(bal) : null;
					if (els && els.length) {
						for (var i = 0; i < els.length; i++) lastBalanceBox.body.appendChild(els[i]);
					} else {
						lastBalanceBox.body.appendChild(row("余量", "查询失败"));
					}
				} catch (e) {
					console.warn("[provider-badge] 刷新余量失败", e);
					lastBalanceBox.body.innerHTML = "";
					lastBalanceBox.body.appendChild(row("余量", "查询失败"));
				} finally {
					if (btn) btn.textContent = "刷新";
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
				label.textContent = "余量";
				const btn = document.createElement("button");
				btn.textContent = "刷新";
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
					t.appendChild(heading("提供商"));
					t.appendChild(row("显示名称", (group && group.name) || provider));
					t.appendChild(row("Provider ID", provider));
					t.appendChild(row("API 协议", cfg && cfg.api || null));
					t.appendChild(row("API 地址", cfg && cfg.baseURL || null));
					t.appendChild(row("密钥环境变量", cfg && cfg.apiKeyEnv || null));
					t.appendChild(heading("当前模型"));
					t.appendChild(row("模型 ID", model));
					t.appendChild(row("模型展示名", (modelEntry && modelEntry.name) || model));
					t.appendChild(row("模型描述", modelEntry && modelEntry.description || null));
					t.appendChild(row("推理等级", efforts.map((e) => e && e.name || e.id).join(" / ") || null));
					t.appendChild(row("当前推理等级", effortLabel));
					t.appendChild(row("上下文窗口", mi && mi.contextWindow != null ? String(mi.contextWindow) : null));
					t.appendChild(row("最大 token", mi && mi.maxTokens != null ? String(mi.maxTokens) : null));
					t.appendChild(row("输入模态", mi && mi.input && mi.input.length ? mi.input.join(" / ") : null));
					t.appendChild(row("兼容信息", compatText));
					// ---- 余量（余额/限额）：已识别厂商才展示 ----
					// 悬停立即刷新：开启时每次悬停都强制重查（绕缓存）；否则走默认 5 分钟缓存。
					const bal = await resolveBalance(provider, cfg, QSettings.hoverRefresh);
					if (bal && bal.recognized) {
						const mb = mountBalanceBlock(t);
						lastBalanceBox = mb;
						lastBalanceCtx = { provider, cfg };
						const els = buildRowEls(bal);
						if (els && els.length) {
							for (var bi = 0; bi < els.length; bi++) mb.body.appendChild(els[bi]);
						}
					}

					// 字体大小：大 = 放大整体，小 = 缩小整体，中 = 原样（zoom 均匀缩放，视觉随内容自适应）。
					t.style.zoom = QSettings.fontSize === "large" ? "1.15" : QSettings.fontSize === "small" ? "0.85" : "1";
					t.style.display = "block";
					position(badge);
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
			const [hoverRefresh, setHoverRefresh] = React.useState(QSettings.hoverRefresh);
			const [autoRefreshOn, setAutoRefreshOn] = React.useState(QSettings.autoRefreshOn);
			const [min, setMin] = React.useState(String(QSettings.autoRefreshMin));
			const [fontSize, setFontSize] = React.useState(QSettings.fontSize || "middle");
			const [busy, setBusy] = React.useState(false);
			const [status, setStatus] = React.useState(null);
			const styleBase = { background: "var(--dsw-alias-bg-layer-1)", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 12, padding: "14px" };
			const save = () => {
				let m = Number(min);
				if (!Number.isFinite(m) || m < 1) m = 5;
				m = Math.round(m);
				setMin(String(m));
				setBusy(true); setStatus(null);
				saveSettings(rpc, { hoverRefresh: !!hoverRefresh, autoRefreshOn: !!autoRefreshOn, autoRefreshMin: m, fontSize }).then((ok) => {
					setBusy(false);
					setStatus(ok ? "已保存" : "保存失败");
				});
			};
			return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 } },
				React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
					React.createElement("h2", { style: { margin: 0, fontSize: 17, fontWeight: 600, color: "var(--dsw-alias-label-primary)" } }, "提供商余量"),
					React.createElement("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, "调整悬浮浮层里「余量」的刷新行为")
				),
				React.createElement("div", { style: { ...styleBase, display: "flex", flexDirection: "column", gap: 12 } },
					React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
						React.createElement("input", { type: "checkbox", checked: hoverRefresh, onChange: (e) => setHoverRefresh(e.target.checked) }),
						React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
							React.createElement("span", null, "显示悬浮窗自动刷新"),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, "开启后每次鼠标移入浮窗就重新查询最新余量（绕缓存）")
						)
					),
					React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--dsw-alias-label-primary)", cursor: "pointer" } },
						React.createElement("input", { type: "checkbox", checked: autoRefreshOn, onChange: (e) => setAutoRefreshOn(e.target.checked) }),
						React.createElement("div", { style: { display: "flex", flexDirection: "column" } },
							React.createElement("span", null, "定时刷新"),
							React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)" } }, "浮窗打开时按设定间隔定时重新查询余量")
						)
					),
					React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, opacity: autoRefreshOn ? 1 : 0.5 } },
						React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, "定时刷新间隔(分钟)"),
						React.createElement("input", { type: "number", min: 1, step: 1, value: min, disabled: !autoRefreshOn, onChange: (e) => setMin(e.target.value), style: { width: 90, padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none", opacity: autoRefreshOn ? 1 : 0.55 } }),
						React.createElement("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", opacity: autoRefreshOn ? 1 : 0.6 } }, "（最低 1）")
					)
				),
				React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
					React.createElement("span", { style: { fontSize: 13, color: "var(--dsw-alias-label-primary)", whiteSpace: "nowrap" } }, "字体大小"),
					React.createElement("select", { value: fontSize, onChange: (e) => setFontSize(e.target.value), style: { padding: "6px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", outline: "none" } },
						React.createElement("option", { value: "small" }, "小"),
						React.createElement("option", { value: "middle" }, "中"),
						React.createElement("option", { value: "large" }, "大")
					)
				),
				React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
					React.createElement("button", { type: "button", onClick: save, disabled: busy, style: { background: "var(--dsw-alias-label-primary)", color: "var(--dsw-alias-bg-layer-3)", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500, opacity: busy ? 0.5 : 1 } }, busy ? "保存中…" : "保存"),
					status ? React.createElement("span", { style: { fontSize: 13, color: status === "已保存" ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" } }, status) : null
				)
			);
		}

		function apply(ctx) {
			ctx.inject(["sessions", "connection", "slots"], (scoped) => {
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
							label: "提供商余量"
						}, (props) => React.createElement(ProviderSettingsPage, { ...props, rpc: scoped.connection.rpc })));
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
