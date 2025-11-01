import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkshopBlogPage() {
	// Mock blog posts data
	const blogPosts = [
		{
			id: "post-1",
			title: "React Hooks の使い方",
			description: "React Hooksの基本的な使い方と実践的な例を紹介します。",
			publishedAt: "2025-01-15",
		},
		{
			id: "post-2",
			title: "Next.js 15 の新機能",
			description: "Next.js 15で追加された新機能について詳しく解説します。",
			publishedAt: "2025-01-10",
		},
		{
			id: "post-3",
			title: "TypeScript 実践ガイド",
			description: "TypeScriptを使った実践的な開発手法を学びます。",
			publishedAt: "2025-01-05",
		},
	];

	const CardStyle =
		"bg-base border border-main block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";
	const Card_title = "neue-haas-grotesk-display text-xl text-main leading-snug";
	const Card_description = "noto-sans-jp-light text-xs pb-2";

	return (
		<div className="min-h-screen bg-base text-main">
			<main id="main-content" className="py-10" tabIndex={-1}>
				<div className="container-system">
					<div className="space-y-10">
						{/* Breadcrumbs */}
						<div className="mb-6">
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Workshop", href: "/workshop" },
									{ label: "Blog", isCurrent: true },
								]}
							/>
						</div>
						<header className="space-y-12">
							<nav className="mb-6">
								<Link
									href="/workshop"
									className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base"
								>
									← Workshop に戻る
								</Link>
							</nav>
							<h1 className="neue-haas-grotesk-display text-6xl text-main">
								Blog
							</h1>
							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								技術記事・チュートリアル・解説記事を公開しています。
								<br />
								Web開発、ゲーム開発、映像制作に関する知識を共有します。
							</p>
						</header>

						{/* Search functionality placeholder */}
						<section>
							<div className="bg-base border border-main p-4">
								<input
									type="text"
									placeholder="記事を検索..."
									className="w-full p-3 bg-base border border-main text-main focus:outline-none focus:ring-2 focus:ring-accent"
									data-testid="search-input"
								/>
							</div>
						</section>

						{/* Blog posts */}
						<section>
							<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
								Latest Posts
							</h2>
							<div className="space-y-6">
								{blogPosts.map((post) => (
									<Link
										key={post.id}
										href={`/workshop/blog/${post.id}`}
										className={CardStyle}
										data-testid="blog-post"
									>
										<div className="flex justify-between items-start">
											<h3 className={Card_title}>{post.title}</h3>
											<time className="text-xs text-accent">
												{new Date(post.publishedAt).toLocaleDateString("ja-JP")}
											</time>
										</div>
										<p className={Card_description}>{post.description}</p>
									</Link>
								))}
							</div>
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
