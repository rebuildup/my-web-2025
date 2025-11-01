"use client";

import { useEffect, useState } from "react";

export function GADebug() {
	const [gaStatus, setGaStatus] = useState({
		gaId: process.env.NEXT_PUBLIC_GA_ID || "G-Q3YWX96WRS", // 直接記述のID
		isInitialized: false,
		dataLayer: false,
		gtag: false,
		consent: false,
		lastEvent: null as string | null,
		eventCount: 0,
	});

	useEffect(() => {
		const checkGAStatus = () => {
			const dataLayer = typeof window !== "undefined" ? window.dataLayer : null;
			const gtag = typeof window !== "undefined" ? window.gtag : null;

			setGaStatus((prev) => ({
				gaId: process.env.NEXT_PUBLIC_GA_ID || "G-Q3YWX96WRS",
				isInitialized: !!gtag,
				dataLayer: !!dataLayer,
				gtag: !!gtag,
				consent: true, // デフォルトでコンセントを与える
				lastEvent: prev.lastEvent,
				eventCount: dataLayer ? dataLayer.length : 0,
			}));
		};

		// dataLayerの変更を監視
		if (typeof window !== "undefined") {
			const originalPush = window.dataLayer?.push;
			if (originalPush) {
				window.dataLayer!.push = function (...args) {
					const result = originalPush.apply(this, args);
					setGaStatus((prev) => ({
						...prev,
						lastEvent: JSON.stringify(args[0]),
						eventCount: window.dataLayer?.length || 0,
					}));
					return result;
				};
			}
		}

		checkGAStatus();
		const interval = setInterval(checkGAStatus, 1000);
		return () => clearInterval(interval);
	}, []);

	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
			<h3 className="font-bold mb-2">Google Analytics Debug</h3>
			<div className="space-y-1">
				<div>GA ID: {gaStatus.gaId}</div>
				<div>Initialized: {gaStatus.isInitialized ? "✅" : "❌"}</div>
				<div>DataLayer: {gaStatus.dataLayer ? "✅" : "❌"}</div>
				<div>Gtag: {gaStatus.gtag ? "✅" : "❌"}</div>
				<div>Consent: {gaStatus.consent ? "✅" : "❌"}</div>
				<div>Events: {gaStatus.eventCount}</div>
				{gaStatus.lastEvent && (
					<div className="text-xs opacity-75 truncate">
						Last: {gaStatus.lastEvent}
					</div>
				)}
			</div>
		</div>
	);
}
