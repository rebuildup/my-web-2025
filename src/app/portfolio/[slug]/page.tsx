import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import portfolioData from "../../../../data/portfolio.json";
import { PortfolioItem } from "../../../types/content";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = portfolioData.projects.find(
    (p) =>
      p.id === params.slug ||
      p.title.toLowerCase().replace(/\s+/g, "-") === params.slug
  );

  if (!project) {
    return {
      title: "プロジェクトが見つかりません | samuido",
    };
  }

  return {
    title: `${project.title} | Portfolio | samuido`,
    description: project.description,
    keywords: [...project.tags, "ポートフォリオ", "samuido"],
  };
}

export default function PortfolioDetailPage({ params }: Props) {
  const project = portfolioData.projects.find(
    (p) =>
      p.id === params.slug ||
      p.title.toLowerCase().replace(/\s+/g, "-") === params.slug
  ) as PortfolioItem;

  if (!project) {
    notFound();
  }

  const category = portfolioData.categories.find(
    (cat) => cat.id === project.category
  );
  const relatedProjects = portfolioData.projects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* パンくずナビ */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/portfolio" className="hover:text-blue-600">
              Portfolio
            </Link>
            <span>/</span>
            <span className="text-gray-900">{project.title}</span>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <section className="text-center mb-16">
            <div className="mb-6">
              <span
                className="inline-block px-4 py-2 rounded-full text-white font-medium"
                style={{ backgroundColor: category?.color || "#6b7280" }}
              >
                {category?.label || project.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {project.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {project.description}
            </p>

            {/* プロジェクトリンク */}
            <div className="flex flex-wrap justify-center gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">🌐</span>
                  ライブデモ
                </a>
              )}
              {project.sourceUrl && (
                <a
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <span className="mr-2">💻</span>
                  ソースコード
                </a>
              )}
            </div>
          </section>

          {/* メイン画像 */}
          <section className="mb-16">
            <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500 text-lg">
                  {project.featuredImage || "プロジェクト画像"}
                </span>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-12">
              {/* プロジェクト概要 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  プロジェクト概要
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      課題・チャレンジ
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {project.challenges}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      解決方法・アプローチ
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {project.solutions}
                    </p>
                  </div>
                  {project.results && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        成果・結果
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {project.results}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* 技術スタック */}
              <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  使用技術
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => {
                    const techData = portfolioData.technologies.find(
                      (t) => t.name === tech
                    );
                    return (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{
                          backgroundColor: techData?.color || "#6b7280",
                        }}
                      >
                        {tech}
                      </span>
                    );
                  })}
                </div>
              </section>

              {/* 画像ギャラリー */}
              {project.images.length > 0 && (
                <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    プロジェクト画像
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video bg-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500">
                            {image || `画像 ${index + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* プロジェクト詳細 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  プロジェクト詳細
                </h3>
                <div className="space-y-4">
                  {project.client && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        クライアント
                      </dt>
                      <dd className="text-gray-900">{project.client}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">期間</dt>
                    <dd className="text-gray-900">{project.projectPeriod}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      カテゴリー
                    </dt>
                    <dd className="text-gray-900">
                      {category?.label || project.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      ステータス
                    </dt>
                    <dd>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          project.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {project.status === "published" ? "公開中" : "ドラフト"}
                      </span>
                    </dd>
                  </div>
                </div>
              </section>

              {/* タグ */}
              <section className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">タグ</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* 共有 */}
              <section className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  このプロジェクトを共有
                </h3>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                    <span className="text-sm">Twitter</span>
                  </button>
                  <button className="flex-1 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors">
                    <span className="text-sm">GitHub</span>
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* 関連プロジェクト */}
          {relatedProjects.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                関連プロジェクト
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProjects.map((relatedProject) => {
                  const relatedCategory = portfolioData.categories.find(
                    (cat) => cat.id === relatedProject.category
                  );

                  return (
                    <Link
                      key={relatedProject.id}
                      href={`/portfolio/${relatedProject.id}`}
                      className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            {relatedProject.featuredImage ||
                              relatedProject.title}
                          </span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span
                          className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                          style={{
                            backgroundColor:
                              relatedCategory?.color || "#6b7280",
                          }}
                        >
                          {relatedCategory?.label || relatedProject.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {relatedProject.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedProject.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
