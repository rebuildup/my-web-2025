import { Suspense } from "react";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import type { PortfolioContentItem } from "@/types/portfolio";
import AboutStitchClient from "./AboutStitchClient";

// Static Data Restoration
const educationData = [
	{
		date: "2028.03 (Exp)",
		title: {
			ja: "宇部高等専門学校 制御情報工学科",
			en: "Department of Intelligent System Engineering, Ube Kosen",
		},
		subtitle: { ja: "卒業予定", en: "Graduate (Expected)" },
		description: {
			ja: "現在、制御情報工学科に在籍中.",
			en: "Currently enrolled in Department of Intelligent System Engineering.",
		},
		tags: ["Computer Science", "Engineering"],
	},
	{
		date: "2023.04",
		title: { ja: "宇部高等専門学校 入学", en: "Enrolled in Ube Kosen" },
		subtitle: { ja: "入学", en: "Enrolled" },
		description: {
			ja: "制御情報工学科での学習を開始.",
			en: "Started journey in Intelligent System Engineering.",
		},
		tags: ["Freshman"],
	},
	{
		date: "2023.03",
		title: { ja: "公立中学校 卒業", en: "Graduated from Junior High School" },
		subtitle: { ja: "卒業", en: "Graduated" },
		description: {
			ja: "義務教育課程を修了.",
			en: "Completed compulsory education.",
		},
	},
];

const achievementsData = [
	{
		date: "2024.03",
		title: {
			ja: "中国地区高専コンピュータフェスティバル2024",
			en: "Chugoku Region Kosen Computer Festival 2024",
		},
		subtitle: { ja: "ゲーム部門 1位", en: "1st Place - Game Division" },
		description: {
			ja: "ゲーム開発部門にて優勝.",
			en: "Won first prize in the game development category.",
		},
		tags: ["Unity", "C#", "GameDev"],
	},
	{
		date: "2023.10",
		title: {
			ja: "U-16プログラミングコンテスト山口大会2023",
			en: "U-16 Programming Contest Yamaguchi 2023",
		},
		subtitle: { ja: "技術賞・企業賞", en: "Technical Award & Corporate Award" },
		description: {
			ja: "技術賞およびプライムゲート企業賞を受賞.",
			en: "Received Technical Award and PrimeGate Corporate Award.",
		},
		tags: ["Programming", "Contest"],
	},
	{
		date: "2022.10",
		title: {
			ja: "U-16プログラミングコンテスト山口大会2022",
			en: "U-16 Programming Contest Yamaguchi 2022",
		},
		subtitle: { ja: "アイデア賞", en: "Idea Award" },
		description: {
			ja: "ユニークな発想と創造性が評価されました.",
			en: "Recognized for unique concept and creativity.",
		},
		tags: ["Idea", "Creativity"],
	},
	{
		date: "~2023",
		title: { ja: "学校美術展覧会", en: "School Art Exhibitions" },
		subtitle: { ja: "複数回受賞", en: "Various Awards" },
		description: {
			ja: "市区学校美術展覧会にて入選・特選を複数回受賞.",
			en: "Multiple selections and special awards at city school art exhibitions.",
		},
		tags: ["Art", "Design"],
	},
];

const skillsData = [
	{
		title: "Design",
		items: ["Photoshop", "Illustrator", "AdobeXD", "Figma"],
	},
	{
		title: "Programming",
		items: ["C", "C++", "C#", "HTML", "JavaScript", "TypeScript", "CSS"],
	},
	{
		title: "Frameworks & Libs",
		items: ["React", "Next.js", "Tailwind CSS", "p5.js", "PIXI.js", "GSAP"],
	},
	{
		title: "Video & 3D",
		items: ["After Effects", "Premiere Pro", "Aviutl", "Blender"],
	},
	{
		title: "Tools",
		items: ["Unity", "Cubase", "VS Code", "Visual Studio", "Cursor", "Git"],
	},
];

const profileData = {
	name: "Yusuke Kimura",
	role: {
		ja: "高専生 / 開発者 / クリエイター",
		en: "Student / Developer / Creator",
	},
	bio: {
		ja: "Web制作/映像制作/ツール制作 などをしている高専生.日々、有意義に時間を溶かしています.",
		en: "A technical college student engaged in web development, video production, tool creation, and more. I spend my days meaningfully melting away the hours.",
	},
	interests: {
		ja: ["Web", "映像", "デザイン", "睡眠"],
		en: ["Web", "Video", "Design", "Sleep"],
	},
};

async function loadPortfolioItems(): Promise<PortfolioContentItem[]> {
	try {
		let items = await portfolioDataManager.getPortfolioData();
		if (items && items.length > 0) return items;

		const rows = getAllFromIndex();
		type ThumbnailVariant =
			| string
			| {
					src?: string;
					poster?: string;
			  }
			| undefined;
		type NormalizedThumbnails = {
			image?: ThumbnailVariant;
			gif?: ThumbnailVariant;
			webm?: ThumbnailVariant;
			[key: string]: ThumbnailVariant;
		};

		return rows
			.filter((row) => row.status === "published")
			.map((row) => {
				const thumbs = row.thumbnails as NormalizedThumbnails | undefined;
				const extractSrc = (
					variant: ThumbnailVariant,
					key: "src" | "poster",
				) => {
					if (!variant) return undefined;
					if (typeof variant === "string") return variant;
					if (key === "src" && typeof variant.src === "string")
						return variant.src;
					if (key === "poster" && typeof variant.poster === "string")
						return variant.poster;
					return undefined;
				};
				const pickThumb =
					extractSrc(thumbs?.image, "src") ||
					extractSrc(thumbs?.gif, "src") ||
					extractSrc(thumbs?.webm, "poster") ||
					"/images/portfolio/default-thumb.jpg";

				const tags: string[] = Array.isArray(row.tags)
					? row.tags.filter((tag): tag is string => typeof tag === "string")
					: [];
				const fallbackDate =
					row.publishedAt ||
					row.updatedAt ||
					row.createdAt ||
					new Date().toISOString();
				const description =
					typeof row.summary === "string" && row.summary.length > 0
						? row.summary
						: `${row.title}の作品詳細`;
				const rowPriority =
					typeof (row as { priority?: unknown }).priority === "number"
						? ((row as { priority?: number }).priority as number)
						: 0;

				return {
					id: row.id,
					type: "portfolio",
					title: row.title,
					description,
					category: "all",
					tags,
					status: row.status as PortfolioContentItem["status"],
					priority: rowPriority,
					createdAt: row.createdAt ?? fallbackDate,
					updatedAt: row.updatedAt ?? fallbackDate,
					publishedAt: row.publishedAt ?? fallbackDate,
					thumbnail: pickThumb,
					images: [],
					technologies: [],
					seo: {
						title: row.title,
						description,
						keywords: tags,
						ogImage: pickThumb,
						twitterImage: pickThumb,
						canonical: `https://yusuke-kim.com/portfolio/${row.id}`,
						structuredData: {},
					},
				} satisfies PortfolioContentItem;
			});
	} catch (error) {
		console.warn("Failed to load portfolio items:", error);
		return [];
	}
}

export const revalidate = 3600; // Revalidate every hour

export default async function AboutPage() {
	const items = await loadPortfolioItems();

	return (
		<main>
			<Suspense
				fallback={
					<div className="min-h-screen flex items-center justify-center text-main">
						Loading System...
					</div>
				}
			>
				<AboutStitchClient
					profile={profileData}
					education={educationData}
					achievements={achievementsData}
					skills={skillsData}
					portfolioItems={items}
				/>
			</Suspense>
		</main>
	);
}
