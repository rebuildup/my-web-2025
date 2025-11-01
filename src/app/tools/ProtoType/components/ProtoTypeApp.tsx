"use client";

import dynamic from "next/dynamic";
import type React from "react";
import { useLayoutEffect, useState } from "react";

// ProtoTypeのコンポーネントを動的インポート
const Game = dynamic(() => import("../prototype-src/components/004_Game"), {
	ssr: false,
});
const PlayRecord = dynamic(
	() => import("../prototype-src/components/008_PlayRecord"),
	{ ssr: false },
);
const Ranking = dynamic(
	() => import("../prototype-src/components/005_Ranking"),
	{ ssr: false },
);
const Setting = dynamic(
	() => import("../prototype-src/components/007_Setting"),
	{ ssr: false },
);
const WebGLPopup = dynamic(
	() => import("../prototype-src/components/009_WebGLPopup"),
	{ ssr: false },
);
const Header = dynamic(() => import("../prototype-src/components/002_Header"), {
	ssr: false,
});
const Tab = dynamic(() => import("../prototype-src/components/001_Tab"), {
	ssr: false,
});
const Footer = dynamic(() => import("../prototype-src/components/003_footer"), {
	ssr: false,
});
const BGAnim = dynamic(() => import("../prototype-src/components/015_BGAnim"), {
	ssr: false,
	loading: () => (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: -1,
			}}
		/>
	),
});

import { themes } from "../prototype-src/components/010_ColorPalette";
import { fonts } from "../prototype-src/components/011_FontSelector";
import { initializeFrameEffect } from "../prototype-src/gamesets/024_FrameEffect";
import { initializeSquareEffect } from "../prototype-src/gamesets/025_SquareEffect";
import { initializeGitHubIntegration } from "../prototype-src/gamesets/027_github_integration";
// ProtoTypeのユーティリティ関数
import { loadFromCache, updateSetting } from "../prototype-src/SiteInterface";

// ProtoTypeのスタイルを読み込み
import "../prototype-src/index.css";
import "../prototype-src/styles/001_tab.css";
import "../prototype-src/styles/002_header.css";
import "../prototype-src/styles/004_game.css";
import "../prototype-src/styles/007_setting.css";
import "../prototype-src/styles/008_playrecord.css";
import "../prototype-src/styles/009_webglPopup.css";
import "../prototype-src/styles/010_colorpalette.css";
import "../prototype-src/styles/011_rankingtable.css";
import "../prototype-src/styles/012_footer.css";
import "../prototype-src/styles/013_BGAnim.css";
import "../prototype-src/styles/014_animation-setting.css";
import "../prototype-src/styles/015_RankingLoad.css";

const ProtoTypeApp: React.FC = () => {
	const [showPopup, setShowPopup] = useState(false);
	const [currentTab, setCurrentTab] = useState<string>("Game");
	const [isInitialized, setIsInitialized] = useState(false);

	const handleOpenPopup = () => {
		setShowPopup(true);
	};

	const handleClosePopup = () => {
		setShowPopup(false);
	};

	useLayoutEffect(() => {
		// テーマの初期化
		const cachedTheme = loadFromCache<(typeof themes)[0]>(
			"colorTheme",
			themes[0],
		);
		let colorIndex = 0;
		for (let i = 0; i < themes.length; i++) {
			if (themes[i].name === cachedTheme.name) colorIndex = i;
		}
		Object.entries(themes[colorIndex].colors).forEach(([key, value]) => {
			document.documentElement.style.setProperty(key, value);
		});

		// bodyの背景色も明示的に更新
		document.body.style.backgroundColor =
			themes[colorIndex].colors["--ProtoTypeMainBG"];
		updateSetting("colorTheme", {
			name: cachedTheme.name,
			colors: {
				MainBG: themes[colorIndex].colors["--ProtoTypeMainBG"],
				MainColor: themes[colorIndex].colors["--ProtoTypeMainColor"],
				MainAccent: themes[colorIndex].colors["--ProtoTypeMainAccent"],
				SecondAccent: themes[colorIndex].colors["--ProtoTypeSecondAccent"],
			},
		});

		// フォントの初期化
		const cachedFont = loadFromCache<{ fontFamily: string }>("fontTheme", {
			fontFamily: fonts[0].value,
		});
		document.documentElement.style.setProperty(
			"--First-font",
			cachedFont.fontFamily,
		);
		updateSetting("fontTheme", {
			fontFamily: cachedFont.fontFamily,
			fontSize: 16,
		});

		// キーレイアウトの初期化
		const cachedLayout = loadFromCache<string>("keyLayout", "QWERTY");
		updateSetting("keyLayout", cachedLayout);

		// アニメーション設定の初期化
		updateSetting("animationSettings", {
			enabled: true,
			reducedMotion: false,
		});

		// エフェクトの初期化
		initializeFrameEffect();
		initializeSquareEffect();

		// GitHub統合の初期化
		initializeGitHubIntegration();

		// 初期化完了
		setIsInitialized(true);
	}, []);

	const renderCurrentComponent = () => {
		switch (currentTab) {
			case "Game":
				return <Game onOpenPopup={handleOpenPopup} />;
			case "PlayRecord":
				return <PlayRecord />;
			case "Ranking":
				return <Ranking />;
			case "Setting":
				return <Setting />;
			default:
				return <div>タブが見つかりません。</div>;
		}
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				width: "100vw",
				overflow: "hidden",
				backgroundColor: "var(--ProtoTypeMainBG)",
				position: "fixed",
				top: 0,
				left: 0,
			}}
		>
			{isInitialized && <BGAnim />}
			<Header />
			<Tab onTabChange={setCurrentTab} />
			<div className="Components" style={{ zIndex: 1 }}>
				{renderCurrentComponent()}
			</div>
			{showPopup && <WebGLPopup onClose={handleClosePopup} />}
			<Footer />
		</div>
	);
};

export default ProtoTypeApp;
