"use client";

import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const cardData = {
	name: "samuido",
	title: "クリエイティブ・デベロッパー",
	tagline: "やる気になれば何でもできる",
	email: {
		tech: "rebuild.up.up(at)gmail.com",
		design: "361do.sleep(at)gmail.com",
	},
	social: {
		tech: "@361do_sleep",
		design: "@361do_design",
	},
	website: "https://yusuke-kim.com",
	skills: ["デザイン", "開発", "映像制作", "音楽制作"],
	personality: ["好奇心旺盛", "完璧主義", "コーヒー好き"],
	currentProjects: [
		"個人サイトリニューアル",
		"便利ツール集開発",
		"映像作品制作",
	],
};

export default function HandleCardPage() {
	const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
	const cardRef = useRef<HTMLDivElement>(null);

	const Global_title = "noto-sans-jp-regular leading-snug";

	useEffect(() => {
		const generateQRCode = async () => {
			try {
				const contactInfo = `samuido - クリエイティブ・デベロッパー
 
Website: ${cardData.website}
Tech: ${cardData.email.tech} | ${cardData.social.tech}
Design: ${cardData.email.design} | ${cardData.social.design}

Skills: ${cardData.skills.join(", ")}
${cardData.tagline}`;

				const qrUrl = await QRCode.toDataURL(contactInfo, {
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

				// Card background
				ctx.fillStyle = "#181818";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				// Card content
				ctx.fillStyle = "#ffffff";
				ctx.font = "bold 32px Arial";
				ctx.fillText(cardData.name, 50, 100);

				ctx.font = "18px Arial";
				ctx.fillText(cardData.title, 50, 140);
				ctx.fillText(cardData.tagline, 50, 170);
				ctx.fillText(cardData.website, 50, 220);

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
		<div className="min-h-screen ">
			<main className="flex items-center py-10">
				<div className="container-system">
					<div className="space-y-10">
						{/* Breadcrumbs */}
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "About", href: "/about" },
								{ label: "Card", href: "/about/card" },
								{ label: "Handle", isCurrent: true },
							]}
							className="pt-4"
						/>

						{/* ヘッダー */}
						<header className="space-y-12">
							<h1 className="neue-haas-grotesk-display text-6xl ">
								Digital Card (Handle)
							</h1>

							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								クリエイティブ活動用のカジュアル名刺.
								<br />
								同業者やクリエイター同士の交流に最適.
							</p>
						</header>

						<div className="grid-system grid-1 lg:grid-2 gap-8">
							{/* デジタル名刺 */}
							<div>
								<div ref={cardRef} className=" border border-accent p-8">
									{/* ヘッダー部分 */}
									<div className="border-b border-accent pb-6 mb-6">
										<div className="flex items-start justify-between">
											<div>
												<h2 className="neue-haas-grotesk-display text-3xl mb-2">
													{cardData.name}
												</h2>
												<p className="zen-kaku-gothic-new text-lg text-accent mb-2">
													{cardData.title}
												</p>
												<p className="noto-sans-jp-light text-sm italic">
													{cardData.tagline}
												</p>
											</div>
										</div>
									</div>

									{/* 連絡先情報 */}
									<div className="space-y-3 mb-6">
										<div className="flex items-center gap-3">
											<span className="noto-sans-jp-light text-sm ">
												Website:
											</span>
											<span className="noto-sans-jp-light text-sm text-accent">
												{cardData.website}
											</span>
										</div>
										<div className="grid grid-cols-1 gap-2">
											<div className="flex items-center gap-3">
												<span className="noto-sans-jp-light text-sm ">
													Email:
												</span>
												<div className="noto-sans-jp-light text-sm text-accent">
													<div>Tech: {cardData.email.tech}</div>
													<div>Design: {cardData.email.design}</div>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<span className="noto-sans-jp-light text-sm ">
													Twitter:
												</span>
												<div className="noto-sans-jp-light text-sm text-accent">
													<div>{cardData.social.tech} (技術)</div>
													<div>{cardData.social.design} (デザイン)</div>
												</div>
											</div>
										</div>
									</div>

									{/* スキル */}
									<div className="mb-6">
										<h3 className="zen-kaku-gothic-new mb-2">
											できること
										</h3>
										<div className="space-y-1">
											{cardData.skills.map((skill) => (
												<div
													key={skill}
													className="noto-sans-jp-light text-xs "
												>
													• {skill}
												</div>
											))}
										</div>
									</div>

									{/* 性格 */}
									<div className="mb-6">
										<h3 className="zen-kaku-gothic-new mb-2">
											性格
										</h3>
										<div className="space-y-1">
											{cardData.personality.map((trait) => (
												<div
													key={trait}
													className="noto-sans-jp-light text-xs "
												>
													• {trait}
												</div>
											))}
										</div>
									</div>

									{/* QRコード */}
									<div className="flex justify-center pt-4 border-t border-accent">
										{qrCodeUrl && (
											<div className="text-center">
												<div className=" p-2 border border-accent">
													<Image
														src={qrCodeUrl}
														alt="連絡先QRコード"
														width={64}
														height={64}
													/>
												</div>
												<p className="noto-sans-jp-light text-xs mt-2">
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
								<div className=" border p-4">
									<h3 className="zen-kaku-gothic-new text-lg mb-4">
										QRコード
									</h3>
									<p className="noto-sans-jp-light text-sm mb-4">
										スマートフォンでスキャンして連絡先を保存
									</p>
									{qrCodeUrl && (
										<div className="text-center">
											<div className=" p-4 border border-accent inline-block">
												<Image
													src={qrCodeUrl}
													alt="連絡先QRコード"
													width={192}
													height={192}
												/>
											</div>
											<p className="noto-sans-jp-light text-sm mt-4">
												このQRコードには以下の情報が含まれています：
											</p>
											<div className="noto-sans-jp-light text-xs mt-2 space-y-1">
												<div>• ハンドルネーム・肩書き</div>
												<div>• 技術・デザイン用メールアドレス</div>
												<div>• SNSアカウント</div>
												<div>• ウェブサイト</div>
												<div>• スキル・専門分野</div>
											</div>
										</div>
									)}
								</div>

								{/* ダウンロード */}
								<div className=" border p-4">
									<h3 className="zen-kaku-gothic-new text-lg mb-4">
										ダウンロード
									</h3>
									<p className="noto-sans-jp-light text-sm mb-4">
										名刺を画像ファイルとして保存
									</p>
									<div className="space-y-3">
										<button
											type="button"
											onClick={() => downloadCard("png")}
											className="w-full border border-accent text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
										>
											<span className={Global_title}>
												PNG形式でダウンロード
											</span>
										</button>
										<button
											type="button"
											onClick={() => downloadCard("pdf")}
											className="w-full border text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base"
										>
											<span className={Global_title}>
												PDF形式でダウンロード
											</span>
										</button>
										<p className="noto-sans-jp-light text-xs text-center">
											※ クリエイティブデザイン
										</p>
									</div>
								</div>

								{/* 現在の取り組み */}
								<div className=" border p-4">
									<h3 className="zen-kaku-gothic-new text-lg mb-4">
										現在の取り組み
									</h3>
									<div className="space-y-2">
										{cardData.currentProjects.map((project) => (
											<div key={project} className="flex items-center gap-2">
												<div className="w-2 h-2 bg-accent"></div>
												<span className="noto-sans-jp-light text-sm ">
													{project}
												</span>
											</div>
										))}
									</div>
								</div>

								{/* 使用方法 */}
								<div className=" border p-4">
									<h3 className="zen-kaku-gothic-new text-lg mb-4">
										使用方法
									</h3>
									<div className="space-y-3 noto-sans-jp-light text-sm ">
										<div>
											<h4 className="zen-kaku-gothic-new ">
												クリエイティブ交流
											</h4>
											<p>同業者やクリエイター同士の交流に最適</p>
										</div>
										<div>
											<h4 className="zen-kaku-gothic-new ">
												SNS共有
											</h4>
											<p>TwitterやInstagramでの自己紹介に</p>
										</div>
										<div>
											<h4 className="zen-kaku-gothic-new ">
												イベント利用
											</h4>
											<p>勉強会やコミュニティイベントで活用</p>
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
									href="/about/profile/handle"
									className="border text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className={Global_title}>Profile</span>
								</Link>

								<Link
									href="/about/card/real"
									className="border text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className={Global_title}>Real Card</span>
								</Link>

								<a
									href="https://links.yusuke-kim.com"
									className="border text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus: focus:ring-offset-2 focus:ring-offset-base"
								>
									<span className={Global_title}>Links</span>
								</a>
							</div>
						</nav>

						{/* フッター */}
						<footer className="pt-4 border-t ">
							<div className="text-center">
								<p className="shippori-antique-b1-regular text-sm inline-block">
									© 2025 samuido - Handle Digital Card
								</p>
							</div>
						</footer>
					</div>
				</div>
			</main>
		</div>
	);
}
