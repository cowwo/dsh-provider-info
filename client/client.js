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
