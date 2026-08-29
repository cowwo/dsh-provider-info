window.__ModuleLoader__.load({
	id: "dsh-provider-info",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

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
					boxShadow: "0 6px 24px rgba(0,0,0,.28)"
				});
				document.body.appendChild(tip);
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
			const UNSUPPORTED = "无法查询";
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
			const resolveBalance = async (provider, cfg) => {
				const key = provider;
				if (balanceCache.key === key) return balanceCache.value;
				try {
					const resp = await rpc.call("/api", "providerBadge/balance", {
						args: { request: { provider, baseURL: cfg && cfg.baseURL || null, apiKeyEnv: cfg && cfg.apiKeyEnv || null } }
					});
					const b = resp && resp.ok ? (resp.value || null) : null;
					balanceCache.key = key;
					balanceCache.value = b;
					return b;
				} catch (e) {
					console.warn("[provider-badge] balance 失败", e);
					return null;
				}
			};
			// 余量浮层区块：balance 家族展示金额，limits 家族展示各窗口百分比 + 重置倒计时。
			const balanceRows = (b) => {
				if (!b || !b.supported) return null;
				if (b.error) {
					if (b.error === "no-api-key") return row("余量", "未配置 API Key");
					return row("余量", "查询失败");
				}
				if (b.kind === "balance") {
					var bal = b.balance;
					if (b.family === "deepseek") {
						var infos = (bal && bal.balance_infos) || [];
						var parts = infos.map((i) => currencySymbol(i.currency) + fmtNum2(i.total_balance));
						return row("余额", parts.length ? parts.join(" · ") : "—" + (bal && bal.is_available === false ? "（余额不足）" : ""));
					}
					if (b.family === "openrouter") {
						var rem = bal && bal.remaining;
						return row("余额", bal && rem !== null ? "$" + fmtNum2(rem) : "查询失败");
					}
					return null;
				}
				if (b.kind === "limits") {
					var wins = b.windows || [];
					if (!wins.length) return null;
					var rows = [];
					for (var i = 0; i < wins.length; i++) {
						var w = wins[i];
						var title = w.label || w.key || "窗口";
						var pct = w.kind === "tier"
							? (w.utilization !== null && w.utilization !== undefined ? fmtPct(w.utilization) : null)
							: (w.percent !== null && w.percent !== undefined ? fmtPct(w.percent) : (w.utilization !== null && w.utilization !== undefined ? fmtPct(w.utilization) : null));
						var detail = "";
						if (w.kind === "tier" && w.limit !== null && w.limit !== undefined) {
							detail = pct + "（剩 " + fmtNum2(w.remaining) + "）";
						} else {
							detail = pct || "";
							if (w.limitUsd !== null && w.limitUsd !== undefined) detail += "（$" + fmtNum2(w.percent / 100 * w.limitUsd) + "/$" + fmtNum2(w.limitUsd) + "）";
						}
						var cd = countdownStr(w.resetsAt);
						rows.push(row(title, detail + (cd ? " · " + cd : "")));
					}
					return rows;
				}
				return null;
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
					// ---- 余量（余额/限额）：仅在支持查询时展示 ----
					const bal = await resolveBalance(provider, cfg);
					if (bal && bal.supported) {
						const bRows = balanceRows(bal);
						t.appendChild(heading("余量"));
						if (bal.error) {
							t.appendChild(row("余量状态", bal.error === "no-api-key" ? "未配置 API Key" : "查询失败"));
						} else if (bRows && bRows.length) {
							for (var bi = 0; bi < bRows.length; bi++) t.appendChild(bRows[bi]);
						} else {
							t.appendChild(row("余量状态", "无数据"));
						}
					}

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
				if (hideTimer) clearTimeout(hideTimer);
				hideTimer = null;
				if (showTimer) clearTimeout(showTimer);
				showTimer = setTimeout(showTip, SHOW_DELAY);
			};
			const onLeave = () => {
				if (showTimer) clearTimeout(showTimer);
				showTimer = null;
				if (hideTimer) clearTimeout(hideTimer);
				hideTimer = setTimeout(hideTip, HIDE_DELAY);
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
						// 滚动/尺寸变化时隐藏，避免浮层错位
						window.addEventListener("scroll", hideTip, { passive: true, capture: true });
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
		}
		//#endregion

		const inject = ["sessions", "connection"];
		function apply(ctx) {
			ctx.inject(["sessions", "connection"], (scoped) => {
				try {
					installProviderBadge(scoped.sessions, scoped.connection.api, scoped.connection.rpc);
				} catch (e) {
					console.warn("[provider-badge] 安装失败", e);
				}
			});
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
