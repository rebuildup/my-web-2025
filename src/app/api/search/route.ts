import { type NextRequest, NextResponse } from "next/server";

// テスト用の検索データ
const searchData = [
	{
		id: "portfolio-1",
		title: "React Dashboard Application",
		description: "モダンなReactダッシュボードアプリケーションの開発",
		type: "portfolio" as const,
		category: "開発",
		url: "/portfolio/portfolio-1753615145862",
		content: "React TypeScript Tailwind CSS Next.js ダッシュボード",
		tags: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
	},
	{
		id: "portfolio-2",
		title: "Unity Game Development",
		description: "3Dアクションゲームの開発とリリース",
		type: "portfolio" as const,
		category: "開発",
		url: "/portfolio/portfolio-1753615145863",
		content: "Unity C# 3D Game Development ゲーム開発",
		tags: ["Unity", "C#", "3D", "Game Development"],
	},
	{
		id: "portfolio-3",
		title: "Motion Graphics Video",
		description: "企業プロモーション用モーショングラフィックス",
		type: "portfolio" as const,
		category: "映像",
		url: "/portfolio/portfolio-1753615145864",
		content: "After Effects Motion Graphics Animation 映像制作",
		tags: ["After Effects", "Motion Graphics", "Animation"],
	},
	{
		id: "tool-1",
		title: "Color Palette Generator",
		description: "カラーパレット生成ツール",
		type: "tool" as const,
		category: "ツール",
		url: "/tools/color-palette",
		content: "カラーパレット 色 デザイン ツール",
		tags: ["Color", "Design", "Tool"],
	},
	{
		id: "tool-2",
		title: "Text Counter",
		description: "文字数カウントツール",
		type: "tool" as const,
		category: "ツール",
		url: "/tools/text-counter",
		content: "文字数 カウント テキスト ツール",
		tags: ["Text", "Counter", "Tool"],
	},
	{
		id: "page-1",
		title: "About",
		description: "プロフィールとスキル情報",
		type: "page" as const,
		category: "プロフィール",
		url: "/about",
		content: "プロフィール スキル 経歴 自己紹介",
		tags: ["Profile", "Skills", "About"],
	},
];

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q") || "";
		const type = searchParams.get("type");
		const category = searchParams.get("category");
		const mode = searchParams.get("mode") || "simple";

		if (!query.trim()) {
			return NextResponse.json({
				success: true,
				results: [],
				total: 0,
				query: "",
			});
		}

		let filteredData = [...searchData];

		// タイプフィルター
		if (type) {
			filteredData = filteredData.filter((item) => item.type === type);
		}

		// カテゴリフィルター
		if (category && category !== "すべて") {
			filteredData = filteredData.filter((item) => item.category === category);
		}

		// 検索実行
		const searchResults = filteredData.filter((item) => {
			const searchText =
				`${item.title} ${item.description} ${item.content} ${item.tags.join(" ")}`.toLowerCase();
			const searchQuery = query.toLowerCase();

			return searchText.includes(searchQuery);
		});

		// スコアリング（簡単な実装）
		const scoredResults = searchResults.map((item) => {
			let score = 0;
			const searchQuery = query.toLowerCase();

			// タイトルマッチは高スコア
			if (item.title.toLowerCase().includes(searchQuery)) {
				score += 10;
			}

			// 説明マッチは中スコア
			if (item.description.toLowerCase().includes(searchQuery)) {
				score += 5;
			}

			// タグマッチは中スコア
			if (item.tags.some((tag) => tag.toLowerCase().includes(searchQuery))) {
				score += 5;
			}

			// コンテンツマッチは低スコア
			if (item.content.toLowerCase().includes(searchQuery)) {
				score += 1;
			}

			return {
				...item,
				score,
				highlight: {
					title: item.title,
					description: item.description,
				},
			};
		});

		// スコア順でソート
		scoredResults.sort((a, b) => b.score - a.score);

		return NextResponse.json({
			success: true,
			results: scoredResults,
			total: scoredResults.length,
			query,
			mode,
		});
	} catch (error) {
		console.error("Search API error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
