/* Adobe Fonts (Typekit) - Optimized for performance */
(function loadAdobeFonts(d) {
	const config = {
		kitId: "blm5pmr",
		scriptTimeout: 2000, // Reduced from 3000ms for faster fallback
		async: true,
	};

	const h = d.documentElement;
	const t = setTimeout(function () {
		h.className = `${h.className.replace(/\bwf-loading\b/g, "")} wf-inactive`;
	}, config.scriptTimeout);

	const tk = d.createElement("script");
	const f = false;
	const s = d.getElementsByTagName("script")[0];

	h.className += " wf-loading";
	tk.src = `https://use.typekit.net/${config.kitId}.js`;
	tk.async = true;
	tk.crossOrigin = "anonymous";

	tk.onload = tk.onreadystatechange = function () {
		const a = this.readyState;
		if (f || (a && a !== "complete" && a !== "loaded")) return;
		f = true;
		clearTimeout(t);
		try {
			if (window.Typekit) {
				window.Typekit.load(config);
			}
		} catch (_e) {
			// Silent fail - fonts will use system fallback
		}
	};
	s.parentNode.insertBefore(tk, s);
})(document);
