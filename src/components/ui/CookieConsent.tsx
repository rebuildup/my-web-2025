/**
 * Cookie Consent Component
 * Simple banner-style cookie consent
 */

"use client";

import { m } from "framer-motion";
import { useEffect, useState } from "react";
import { useAnalytics } from "@/components/providers/AnalyticsProvider";

interface CookieConsentProps {
	className?: string;
}

export function CookieConsent({ className = "" }: CookieConsentProps) {
	const [showBanner, setShowBanner] = useState(false);
	const { consentGiven: _consentGiven, setConsent } = useAnalytics();

	useEffect(() => {
		if (
			process.env.NODE_ENV === "test" ||
			process.env.PLAYWRIGHT_TEST === "true"
		) {
			return;
		}

		const savedConsent = localStorage.getItem("analytics-consent");
		if (savedConsent === null) {
			setShowBanner(true);
		}
	}, []);

	const handleAccept = () => {
		setConsent(true);
		setShowBanner(false);
	};

	const handleReject = () => {
		setConsent(false);
		setShowBanner(false);
	};

	if (!showBanner) {
		return null;
	}

	return (
		<m.div
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: 50,
				padding: "16px",
			}}
			className={className}
			role="dialog"
			aria-label="クッキー同意"
		>
			<div
				style={{
					maxWidth: "800px",
					margin: "0 auto",
					background: "#fff",
					border: "1px solid #ddd",
					borderRadius: "6px",
					padding: "16px",
					boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
				}}
			>
				<p
					style={{
						fontSize: "0.875rem",
						color: "#333",
						margin: "0 0 12px 0",
						lineHeight: 1.5,
					}}
				>
					このサイトではウェブサイトの利用状況を分析するためCookieを使用しています.
					詳細は
					<a
						href="/privacy-policy"
						style={{ color: "#0066cc", textDecoration: "underline" }}
					>
						プライバシーポリシー
					</a>
					をご覧ください.
				</p>
				<div
					style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
				>
					<button
						type="button"
						onClick={handleReject}
						style={{
							padding: "8px 16px",
							fontSize: "0.875rem",
							cursor: "pointer",
						}}
					>
						拒否
					</button>
					<button
						type="button"
						onClick={handleAccept}
						style={{
							padding: "8px 16px",
							fontSize: "0.875rem",
							cursor: "pointer",
						}}
					>
						許可
					</button>
				</div>
			</div>
		</m.div>
	);
}

// Cookie settings component for privacy policy page
function CookieSettings() {
	const { consentGiven, setConsent } = useAnalytics();
	const [analyticsEnabled, setAnalyticsEnabled] = useState(consentGiven);

	const handleSave = () => {
		setConsent(analyticsEnabled);
		alert("クッキー設定を保存しました！");
	};

	return (
		<div
			style={{
				maxWidth: "640px",
				margin: "0 auto",
				padding: "24px",
				border: "1px solid #ddd",
				borderRadius: "6px",
			}}
		>
			<h2
				style={{
					fontSize: "1.5rem",
					fontWeight: 700,
					marginBottom: "16px",
					color: "#000",
				}}
			>
				クッキー設定
			</h2>

			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				<div
					style={{
						border: "1px solid #eee",
						padding: "16px",
						borderRadius: "4px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "8px",
						}}
					>
						<h3
							style={{
								fontSize: "1rem",
								fontWeight: 600,
								color: "#000",
								margin: 0,
							}}
						>
							必須クッキー
						</h3>
						<span
							style={{
								fontSize: "0.75rem",
								color: "#666",
								background: "#f0f0f0",
								padding: "2px 8px",
								borderRadius: "10px",
							}}
						>
							常に有効
						</span>
					</div>
					<p style={{ fontSize: "0.875rem", color: "#555", margin: 0 }}>
						基本的なウェブサイト機能に必要です.無効にすることはできません.
					</p>
				</div>

				<div
					style={{
						border: "1px solid #eee",
						padding: "16px",
						borderRadius: "4px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "8px",
						}}
					>
						<h3
							style={{
								fontSize: "1rem",
								fontWeight: 600,
								color: "#000",
								margin: 0,
							}}
						>
							分析クッキー
						</h3>
						<input
							type="checkbox"
							checked={analyticsEnabled}
							onChange={(e) => setAnalyticsEnabled(e.target.checked)}
							aria-label="分析クッキー"
						/>
					</div>
					<p style={{ fontSize: "0.875rem", color: "#555", margin: 0 }}>
						利用パターンを分析することで、ウェブサイトの改善に役立ちます.
					</p>
				</div>
			</div>

			<div
				style={{
					marginTop: "24px",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<button
					type="button"
					onClick={handleSave}
					style={{
						padding: "8px 16px",
						fontSize: "0.875rem",
						cursor: "pointer",
					}}
				>
					設定を保存
				</button>
			</div>
		</div>
	);
}
