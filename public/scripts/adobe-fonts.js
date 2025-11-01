/* global Typekit */
(function loadAdobeFonts(documentRef) {
	const config = {
		kitId: "blm5pmr",
		scriptTimeout: 3000,
		async: true,
	};

	const { documentElement } = documentRef;
	const timeoutId = setTimeout(() => {
		documentElement.className = documentElement.className.replace(
			/\bwf-loading\b/g,
			"",
		);
		documentElement.className += " wf-inactive";
	}, config.scriptTimeout);
	const scriptEl = documentRef.createElement("script");
	let isLoaded = false;
	const firstScript = documentRef.getElementsByTagName("script")[0];

	documentElement.className += " wf-loading";
	scriptEl.src = `https://use.typekit.net/${config.kitId}.js`;
	scriptEl.async = true;
	const isDebug =
		typeof window !== "undefined" &&
		new URLSearchParams(window.location.search).get("debugFonts") === "1";

	function logDebug(...args) {
		if (isDebug) {
			// eslint-disable-next-line no-console
			console.log("[Fonts][Typekit]", ...args);
		}
	}

	scriptEl.onload = scriptEl.onreadystatechange = function handleLoad() {
		const readyState = this.readyState;
		if (
			isLoaded ||
			(readyState && readyState !== "complete" && readyState !== "loaded")
		) {
			return;
		}

		isLoaded = true;
		clearTimeout(timeoutId);
		try {
			Typekit.load(config);
			logDebug("Typekit.load called", { kit: config.kitId });
			// 検証: CSS/フォントのスタイルシートと FontFaceSet 状態を出力
			setTimeout(() => {
				try {
					const styleSheets = Array.from(document.styleSheets)
						.map((ss) => {
							try {
								return ss.href || "inline";
							} catch (_) {
								return "<inaccessible>";
							}
						})
						.filter(Boolean);
					logDebug("StyleSheets", styleSheets);
					if (document.fonts && document.fonts.check) {
						const checks = [
							{
								label: "Neue Haas Grotesk Display 700 italic",
								query: "italic 700 16px 'neue-haas-grotesk-display'",
							},
							{
								label: "Noto Sans JP 300",
								query: "normal 300 16px 'Noto Sans JP'",
							},
							{
								label: "Shippori Antique B1 400",
								query: "normal 400 16px 'Shippori Antique B1'",
							},
						];
						const results = checks.map((c) => ({
							label: c.label,
							available: document.fonts.check(c.query),
						}));
						logDebug("document.fonts.check", results);
					}
				} catch (e) {
					logDebug("debug check failed", e);
				}
			}, 800);
		} catch (error) {
			console.error("Failed to load Typekit fonts", error);
		}
	};
	firstScript.parentNode?.insertBefore(scriptEl, firstScript);
})(document);
