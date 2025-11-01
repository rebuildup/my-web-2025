import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { ContentItem } from "@/types/content";

export const metadata: Metadata = {
	title: "Downloads - Workshop | samuido",
	description:
		"テンプレート・素材集・サンプルファイルの配布。クリエイティブ制作に役立つ素材を無料で提供。",
	keywords: [
		"テンプレート",
		"素材集",
		"サンプル",
		"ダウンロード",
		"無料",
		"クリエイティブ",
	],
	robots: "index, follow",
	openGraph: {
		title: "Downloads - Workshop | samuido",
		description:
			"テンプレート・素材集・サンプルファイルの配布。クリエイティブ制作に役立つ素材を無料で提供。",
		type: "website",
		url: "https://yusuke-kim.com/workshop/downloads",
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Downloads - Workshop | samuido",
		description:
			"テンプレート・素材集・サンプルファイルの配布。クリエイティブ制作に役立つ素材を無料で提供。",
		creator: "@361do_sleep",
	},
};

async function getDownloads(): Promise<ContentItem[]> {
	try {
		// Skip API calls during build if no base URL is set
		if (
			!process.env.NEXT_PUBLIC_BASE_URL &&
			process.env.NODE_ENV === "production"
		) {
			return [];
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/by-type/download`,
			{
				next: { revalidate: 300 },
			},
		);
		if (!response.ok) {
			throw new Error("Failed to fetch downloads");
		}
		const data = await response.json();
		return data.data || [];
	} catch {
		// Silently handle API connection errors during build time
		return [];
	}
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export default async function DownloadsPage() {
	const downloads = await getDownloads();
	const publishedDownloads = downloads.filter(
		(download) => download.status === "published",
	);

	const CardStyle =
		"bg-base border border-main block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";
	const Card_title = "neue-haas-grotesk-display text-xl text-main leading-snug";
	const Card_description = "noto-sans-jp-light text-xs pb-2";
	const Card_meta = "noto-sans-jp-light text-xs text-accent";

	return (
		<div className="min-h-screen bg-base text-main">
			<main className="py-10">
				<div className="container-system">
					<div className="space-y-10">
						{/* Breadcrumbs */}
						<div className="mb-6">
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Workshop", href: "/workshop" },
									{ label: "Downloads", isCurrent: true },
								]}
							/>
						</div>
						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main">
								Downloads
							</h1>
							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								テンプレート・素材集・サンプルファイルを無料で配布しています。
								<br />
								クリエイティブ制作にお役立てください。
							</p>
						</header>

						<section aria-labelledby="stats-heading">
							<h2 id="stats-heading" className="sr-only">
								統計情報
							</h2>
							<div className="bg-base border border-main p-4 text-center">
								<div className="neue-haas-grotesk-display text-2xl text-accent">
									{publishedDownloads.length}
								</div>
								<div className="noto-sans-jp-light text-xs">素材</div>
							</div>
						</section>

						<section aria-labelledby="downloads-heading">
							<h2
								id="downloads-heading"
								className="neue-haas-grotesk-display text-2xl text-main mb-6"
							>
								素材一覧
							</h2>

							{publishedDownloads.length > 0 ? (
								<div className="grid-system grid-1 sm:grid-2 gap-6">
									{publishedDownloads.map((download) => (
										<Link
											key={download.id}
											href={`/workshop/downloads/${download.id}`}
											className={CardStyle}
											aria-describedby={`download-${download.id}-description`}
										>
											{download.thumbnail && (
												<div className="aspect-video bg-base border border-main relative">
													<Image
														src={download.thumbnail}
														alt={download.title}
														fill
														className="object-cover"
														sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
													/>
												</div>
											)}
											<div className="space-y-2">
												<h3 className={Card_title}>{download.title}</h3>
												<p
													id={`download-${download.id}-description`}
													className={Card_description}
												>
													{download.description}
												</p>
												{download.downloadInfo && (
													<div className="flex justify-between items-center">
														<span className={Card_meta}>
															{download.downloadInfo.fileType.toUpperCase()} •{" "}
															{formatFileSize(download.downloadInfo.fileSize)}
														</span>
														<span className={Card_meta}>
															{download.downloadInfo.downloadCount} ダウンロード
														</span>
													</div>
												)}
												{download.tags.length > 0 && (
													<div className="flex flex-wrap gap-2">
														{download.tags.map((tag) => (
															<span
																key={tag}
																className="bg-base border border-main px-2 py-1 text-xs noto-sans-jp-light"
															>
																{tag}
															</span>
														))}
													</div>
												)}
											</div>
										</Link>
									))}
								</div>
							) : (
								<div className="bg-base border border-main p-6">
									<p className="noto-sans-jp-light text-sm text-center">
										素材はまだ公開されていません
									</p>
								</div>
							)}
						</section>

						<nav aria-label="Site navigation">
							<Link
								href="/workshop"
								className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
							>
								<span className="noto-sans-jp-regular text-base leading-snug">
									← Workshop
								</span>
							</Link>
						</nav>
					</div>
				</div>
			</main>
		</div>
	);
}
