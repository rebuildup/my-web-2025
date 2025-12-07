import { Suspense } from "react";
import { getContentDbStats } from "@/cms/lib/content-db-manager";
import { getStatsSummary } from "@/lib/stats";
import AboutClient from "./AboutClient";

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
			ja: "現在、制御情報工学科に在籍中。",
			en: "Currently enrolled in Department of Intelligent System Engineering.",
		},
		tags: ["Computer Science", "Engineering"],
	},
	{
		date: "2023.04",
		title: { ja: "宇部高等専門学校 入学", en: "Enrolled in Ube Kosen" },
		subtitle: { ja: "入学", en: "Enrolled" },
		description: {
			ja: "制御情報工学科での学習を開始。",
			en: "Started journey in Intelligent System Engineering.",
		},
		tags: ["Freshman"],
	},
	{
		date: "2023.03",
		title: { ja: "公立中学校 卒業", en: "Graduated from Junior High School" },
		subtitle: { ja: "卒業", en: "Graduated" },
		description: {
			ja: "義務教育課程を修了。",
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
			ja: "ゲーム開発部門にて優勝。",
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
			ja: "技術賞およびプライムゲート企業賞を受賞。",
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
			ja: "ユニークな発想と創造性が評価されました。",
			en: "Recognized for unique concept and creativity.",
		},
		tags: ["Idea", "Creativity"],
	},
	{
		date: "~2023",
		title: { ja: "学校美術展覧会", en: "School Art Exhibitions" },
		subtitle: { ja: "複数回受賞", en: "Various Awards" },
		description: {
			ja: "市区学校美術展覧会にて入選・特選を複数回受賞。",
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
		ja: "Web制作/映像制作/ツール制作 などをしている高専生。日々、有意義に時間を溶かしています。",
		en: "A technical college student engaged in web development, video production, tool creation, and more. I spend my days meaningfully melting away the hours.",
	},
	interests: {
		ja: ["Web", "映像", "デザイン", "睡眠"],
		en: ["Web", "Video", "Design", "Sleep"],
	},
};

async function getSystemStats() {
	try {
		const [viewStats, contentStats] = await Promise.all([
			getStatsSummary(),
			getContentDbStats(),
		]);

		return {
			totalContents: contentStats.totalContents,
			totalViews: viewStats.totalViews,
			lastUpdated: new Date().toISOString(),
			dbSize: contentStats.totalSize,
			totalComponents: 150, // Approximate count or could be fetched dynamically if wanted
		};
	} catch (error) {
		console.error("Failed to fetch system stats:", error);
		// Fallback
		return {
			totalContents: 0,
			totalViews: 0,
			lastUpdated: new Date().toISOString(),
			dbSize: 0,
			totalComponents: 0,
		};
	}
}

import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import type { PortfolioContentItem } from "@/types/portfolio";

async function getLatestProject() {
	try {
		const items = await portfolioDataManager.getPortfolioData();
		if (!items || items.length === 0) return null;

		// Helper to get effective date
		const getEffectiveDate = (item: PortfolioContentItem) =>
			item.updatedAt || item.publishedAt || item.createdAt || "";

		// Sort by date desc
		const latest = [...items].sort((a, b) => {
			const dateA = new Date(getEffectiveDate(a)).getTime();
			const dateB = new Date(getEffectiveDate(b)).getTime();
			return dateB - dateA;
		})[0];

		if (!latest) return null;

		return {
			id: latest.id,
			title: latest.title,
			date: getEffectiveDate(latest).split("T")[0], // YYYY-MM-DD
			type: latest.category || "Project",
		};
	} catch (error) {
		console.warn("Failed to fetch latest project:", error);
		return null;
	}
}

export const revalidate = 3600; // Revalidate every hour

export default async function AboutPage() {
	const stats = await getSystemStats();
	const latestProject = await getLatestProject();

	return (
		<main>
			<Suspense
				fallback={
					<div className="min-h-screen flex items-center justify-center text-main">
						Loading System...
					</div>
				}
			>
				<AboutClient
					stats={stats}
					profile={profileData}
					education={educationData}
					achievements={achievementsData}
					skills={skillsData}
					latestProject={latestProject}
				/>
			</Suspense>
		</main>
	);
}
