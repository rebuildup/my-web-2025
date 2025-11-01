"use client";

import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const cardData = {
	name: "木村友亮",
	nameEn: "Yusuke Kimura",
	title: "Webデザイナー・開発者",
	titleEn: "Web Designer & Developer",
	company: "高等専門学校 在学中",
	email: "rebuild.up.up(at)gmail.com",
	twitter: "@361do_sleep",
	website: "https://yusuke-kim.com",
	location: "日本",
	skills: ["Web開発", "UI/UXデザイン", "映像制作", "グラフィックデザイン"],
	achievements: [
		"中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位",
		"U-16プログラミングコンテスト山口大会2023 技術賞・企業賞",
		"U-16プログラミングコンテスト山口大会2022 アイデア賞",
	],
};

export default function RealCardPage() {
	const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
	const cardRef = useRef<HTMLDivElement>(null);

	const Global_title = "noto-sans-jp-regular text-base leading-snug";

	useEffect(() => {
		const generateQRCode = async () => {
			try {
				const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.name}
N:${cardData.name};;;;
ORG:${cardData.company}
TITLE:${cardData.title}
EMAIL:${cardData.email}
URL:${cardData.website}
NOTE:${cardData.skills.join(", ")}
END:VCARD`;

				const qrUrl = await QRCode.toDataURL(vCard, {
					width: 200,
					margin: 2,
					color: {
						dark: "#ffffff",
						light: "#181818",
					},
				});
				setQrCodeUrl(qrUrl);
			} catch (error) {
				console.error("QR Code generation failed:", error);
			}
		};

		generateQRCode();
	}, []);

	const downloadCard = async (format: "png" | "pdf") => {
		if (!cardRef.current) return;

		try {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (ctx) {
				canvas.width = 800;
				canvas.height = 500;

				// Simple card rendering
				ctx.fillStyle = "#181818";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 24px Arial";
				ctx.fillText(cardData.name, 50, 100);

				ctx.font = "16px Arial";
				ctx.fillText(cardData.title, 50, 130);
				ctx.fillText(cardData.email, 50, 160);
				ctx.fillText(cardData.website, 50, 190);

				// Download
				const link = document.createElement("a");
				link.download = `${cardData.name}-business-card.${format}`;
				link.href = canvas.toDataURL();
				link.click();
			}
		} catch (error) {
			console.error("Card download failed:", error);
		}
	};

	return (
		<div className="min-h-screen bg-base text-main">
			<main className="flex items-center py-10">
				<div className="container-system">
					<div className="space-y-10">
						{/* Breadcrumbs */}
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "About", href: "/about" },
								{ label: "Card", href: "/about/card" },
								{ label: "Real", isCurrent: true },
							]}
							className="pt-4"
						/>

						{/* ヘッダー */}
						<header className="space-y-12">
							<h1 className="neue-haas-grotesk-display text-6xl text-main">
								Digital Card (Real)
							</h1>

							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								正式なビジネス用デジタル名刺.
								<br />
								QRコードをスキャンして連絡先を保存できます.
							</p>
						</header>

						<div className="grid-system grid-1 lg:grid-2 gap-8">
							{/* デジタル名刺 */}
							<div>
								<div ref={cardRef} className="bg-base border border-main p-8">
									{/* ヘッダー部分 */}
									<div className="border-b border-main pb-6 mb-6">
										<div className="flex items-start justify-between">
											<div>
												<h2 className="neue-haas-grotesk-display text-2xl text-main mb-1">
													{cardData.name}
												</h2>
												<p className="noto-sans-jp-light text-sm text-main mb-2">
													{cardData.nameEn}
												</p>
												<p className="zen-kaku-gothic-new text-lg text-accent mb-1">
													{cardData.title}
												</p>
												<p className="noto-sans-jp-light text-sm text-main">
													{cardData.titleEn}
												</p>
											</div>
										</div>
									</div>

									{/* 連絡先情報 */}
									<div className="space-y-3 mb-6">
										<div className="flex items-center gap-3">
											<span className="noto-sans-jp-light text-sm text-main">
												Email:
											</span>
											<span className="noto-sans-jp-light text-sm text-accent">
												{cardData.email}
											</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="noto-sans-jp-light text-sm text-main">
												Twitter:
											</span>
											<span className="noto-sans-jp-light text-sm text-accent">
												{cardData.twitter}
											</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="noto-sans-jp-light text-sm text-main">
												Website:
											</span>
											<span className="noto-sans-jp-light text-sm text-accent">
												{cardData.website}
											</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="noto-sans-jp-light text-sm text-main">
												Education:
											</span>
											<span className="noto-sans-jp-light text-sm text-main">
												{cardData.company}
											</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="noto-sans-jp-light text-sm text-main">
												Location:
											</span>
											<span className="noto-sans-jp-light text-sm text-main">
												{cardData.location}
											</span>
										</div>
									</div>

									{/* スキル */}
									<div className="mb-6">
										<h3 className="zen-kaku-gothic-new text-base text-main mb-2">
											専門分野
										</h3>
										<div className="space-y-1">
											{cardData.skills.map((skill) => (
												<div
													key={skill}
													className="noto-sans-jp-light text-xs text-main"
												>
													• {skill}
												</div>
											))}
										</div>
									</div>

									{/* 主要実績 */}
									<div className="mb-6">
										<h3 className="zen-kaku-gothic-new text-base text-main mb-2">
											主要実績
										</h3>
										<div className="space-y-1">
											{cardData.achievements.slice(0, 2).map((achievement) => (
												<p
													key={achievement}
													className="noto-sans-jp-light text-xs text-main"
												>
													• {achievement}
												</p>
											))}
										</div>
									</div>

									{/* QRコード */}
									<div className="flex justify-center pt-4 border-t border-main">
										{qrCodeUrl && (
											<div className="text-center">
												<Image
													src={qrCodeUrl}
													alt="連絡先QRコード"
													width={80}
													height={80}
													className="mx-auto mb-2"
												/>
												<p className="noto-sans-jp-light text-xs text-main">
													連絡先情報
												</p>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* 操作パネル */}
							<div className="space-y-6">
								{/* QRコード詳細 */}
								<div className="bg-base border border-main p-4">
									<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
										QRコード
									</h3>
									<p className="noto-sans-jp-light text-sm text-main mb-4">
										スマートフォンでスキャンして連絡先を保存
									</p>
									{qrCodeUrl && (
										<div className="text-center">
											<Image
												src={qrCodeUrl}
												alt="連絡先QRコード"
												width={192}
												height={192}
												className="mx-auto border border-main"
											/>
											<p className="noto-sans-jp-light text-sm text-main mt-4">
												このQRコードには以下の情報が含まれています：
											</p>
											<div className="noto-sans-jp-light text-xs text-main mt-2 space-y-1">
												<div>• 氏名・肩書き</div>
												<div>• メールアドレス</div>
												<div>• ウェブサイト</div>
												<div>• 専門分野</div>
											</div>
										</div>
									)}
								</div>

								{/* ダウンロード */}
								<div className="bg-base border border-main p-4">
									<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
										ダウンロード
									</h3>
									<p className="noto-sans-jp-light text-sm text-main mb-4">
										名刺を画像ファイルとして保存
									</p>
									<div className="space-y-3">
										<button
											type="button"
											onClick={() => downloadCard("png")}
											className="w-full border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
										>
											<span className={Global_title}>
												PNG形式でダウンロード
											</span>
										</button>
										<button
											type="button"
											onClick={() => downloadCard("pdf")}
											className="w-full border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
										>
											<span className={Global_title}>
												PDF形式でダウンロード
											</span>
										</button>
										<p className="noto-sans-jp-light text-xs text-main text-center">
											※ 実際の印刷には高解像度版をご利用ください
										</p>
									</div>
								</div>

								{/* 使用方法 */}
								<div className="bg-base border border-main p-4">
									<h3 className="zen-kaku-gothic-new text-lg text-main mb-4">
										使用方法
									</h3>
									<div className="space-y-3 noto-sans-jp-light text-sm text-main">
										<div>
											<h4 className="zen-kaku-gothic-new text-base text-main">
												デジタル共有
											</h4>
											<p>QRコードをスクリーンショットして共有</p>
										</div>
										<div>
											<h4 className="zen-kaku-gothic-new text-base text-main">
												印刷利用
											</h4>
											<p>PNG/PDF形式でダウンロードして印刷</p>
										</div>
										<div>
											<h4 className="zen-kaku-gothic-new text-base text-main">
												連絡先登録
											</h4>
											<p>QRコードをスキャンして連絡先に追加</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* アクション */}
						<nav aria-label="Card actions">
							<h3 className="sr-only">名刺関連アクション</h3>
							<div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
								<Link
									href="/about/profile/real"
									className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className={Global_title}>Profile</span>
								</Link>

								<Link
									href="/about/card/handle"
									className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className={Global_title}>Handle Card</span>
								</Link>

								<Link
									href="/contact"
									className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className={Global_title}>Contact</span>
								</Link>
							</div>
						</nav>

						{/* フッター */}
						<footer className="pt-4 border-t border-main">
							<div className="text-center">
								<p className="shippori-antique-b1-regular text-sm inline-block">
									© 2025 samuido - Real Digital Card
								</p>
							</div>
						</footer>
					</div>
				</div>
			</main>
		</div>
	);
}
