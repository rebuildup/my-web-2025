import { Metadata } from "next";
import Link from "next/link";
import { Code, Github, ExternalLink, Calendar, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Development Projects - Portfolio | samuido 開発作品集",
  description:
    "samuidoの開発プロジェクト集。Web開発、ゲーム開発、技術実装に重点を置いた作品を技術スタック、GitHubリンクと共に紹介。",
  keywords: [
    "開発",
    "プログラミング",
    "Web開発",
    "ゲーム開発",
    "技術スタック",
    "GitHub",
    "React",
    "Unity",
    "TypeScript",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/gallery/develop",
  },
  openGraph: {
    title: "Development Projects - Portfolio | samuido 開発作品集",
    description:
      "samuidoの開発プロジェクト集。Web開発、ゲーム開発、技術実装に重点を置いた作品を技術スタック、GitHubリンクと共に紹介。",
    type: "website",
    url: "https://yusuke-kim.com/portfolio/gallery/develop",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/gallery-develop-og-image.png",
        width: 1200,
        height: 630,
        alt: "Development Projects - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Development Projects - Portfolio | samuido 開発作品集",
    description:
      "samuidoの開発プロジェクト集。Web開発、ゲーム開発、技術実装に重点を置いた作品を技術スタック、GitHubリンクと共に紹介。",
    images: [
      "https://yusuke-kim.com/portfolio/gallery-develop-twitter-image.jpg",
    ],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "samuido Development Projects",
  description: "Web開発、ゲーム開発、技術実装に重点を置いた開発プロジェクト集",
  url: "https://yusuke-kim.com/portfolio/gallery/develop",
  mainEntity: {
    "@type": "ItemList",
    name: "Development Projects",
    numberOfItems: 12,
  },
};

// 開発プロジェクトデータ（実際の実装では動的に取得）
const developProjects = [
  {
    id: "interactive-portfolio",
    title: "Interactive Portfolio Website",
    description:
      "Next.js 15とTailwind CSSを使用したレスポンシブポートフォリオサイト。アクセシビリティとSEOを重視した設計。",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Vercel"],
    githubUrl: "https://github.com/361do/portfolio-website",
    liveUrl: "https://yusuke-kim.com",
    date: "2025-01",
    status: "completed",
    featured: true,
    highlights: [
      "100% Lighthouse Score",
      "TypeScript Strict Mode",
      "Responsive Design",
    ],
  },
  {
    id: "unity-2d-game",
    title: "Unity 2D Action Game",
    description:
      "2Dアクションゲームのプロトタイプ。物理演算とアニメーションシステムを実装。",
    technologies: ["Unity", "C#", "Photoshop", "Aseprite"],
    githubUrl: "https://github.com/361do/unity-2d-action",
    liveUrl: null,
    date: "2024-11",
    status: "completed",
    featured: true,
    highlights: ["Physics System", "Animation Controller", "Level Editor"],
  },
  {
    id: "react-dashboard",
    title: "React Dashboard Application",
    description:
      "データ可視化ダッシュボード。Chart.jsとReact Queryを使用したリアルタイムデータ表示。",
    technologies: [
      "React",
      "TypeScript",
      "Chart.js",
      "React Query",
      "CSS Modules",
    ],
    githubUrl: "https://github.com/361do/react-dashboard",
    liveUrl: "https://dashboard-demo.yusuke-kim.com",
    date: "2024-09",
    status: "completed",
    featured: false,
    highlights: [
      "Real-time Updates",
      "Data Visualization",
      "Responsive Charts",
    ],
  },
  {
    id: "p5js-generative-art",
    title: "p5.js Generative Art Collection",
    description:
      "p5.jsを使用したジェネラティブアート作品集。アルゴリズムによる視覚表現の探求。",
    technologies: ["p5.js", "JavaScript", "Canvas API", "Web Audio API"],
    githubUrl: "https://github.com/361do/p5js-generative",
    liveUrl: "https://generative.yusuke-kim.com",
    date: "2024-08",
    status: "ongoing",
    featured: false,
    highlights: ["Algorithmic Art", "Interactive Visuals", "Audio Reactive"],
  },
  {
    id: "three-js-experiments",
    title: "Three.js WebGL Experiments",
    description:
      "Three.jsを使用した3D WebGL実験。シェーダーとパーティクルシステムの実装。",
    technologies: ["Three.js", "WebGL", "GLSL", "JavaScript", "Vite"],
    githubUrl: "https://github.com/361do/threejs-experiments",
    liveUrl: "https://webgl.yusuke-kim.com",
    date: "2024-07",
    status: "ongoing",
    featured: true,
    highlights: [
      "Custom Shaders",
      "Particle Systems",
      "Performance Optimization",
    ],
  },
  {
    id: "node-api-server",
    title: "Node.js API Server",
    description:
      "Express.jsとPrismaを使用したRESTful API。JWT認証とデータベース設計を実装。",
    technologies: ["Node.js", "Express.js", "Prisma", "PostgreSQL", "JWT"],
    githubUrl: "https://github.com/361do/node-api-server",
    liveUrl: null,
    date: "2024-06",
    status: "completed",
    featured: false,
    highlights: ["RESTful API", "JWT Authentication", "Database Design"],
  },
  {
    id: "chrome-extension",
    title: "Productivity Chrome Extension",
    description:
      "生産性向上のためのChrome拡張機能。タブ管理とタイムトラッキング機能。",
    technologies: ["JavaScript", "Chrome APIs", "HTML", "CSS", "Manifest V3"],
    githubUrl: "https://github.com/361do/productivity-extension",
    liveUrl: null,
    date: "2024-05",
    status: "completed",
    featured: false,
    highlights: ["Tab Management", "Time Tracking", "Local Storage"],
  },
  {
    id: "vue-todo-app",
    title: "Vue.js Todo Application",
    description:
      "Vue 3とComposition APIを使用したタスク管理アプリ。Pinia状態管理を実装。",
    technologies: ["Vue.js", "TypeScript", "Pinia", "Vite", "Tailwind CSS"],
    githubUrl: "https://github.com/361do/vue-todo-app",
    liveUrl: "https://todo.yusuke-kim.com",
    date: "2024-04",
    status: "completed",
    featured: false,
    highlights: ["Composition API", "State Management", "Local Persistence"],
  },
];

// 技術スタック統計
const techStats = {
  frontend: ["React", "Vue.js", "TypeScript", "Next.js", "Tailwind CSS"],
  backend: ["Node.js", "Express.js", "Prisma", "PostgreSQL"],
  gamedev: ["Unity", "C#", "p5.js", "Three.js", "WebGL"],
  tools: ["Git", "GitHub", "Vite", "Vercel", "Chrome APIs"],
};

export default function DevelopProjectsPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "accent";
      case "ongoing":
        return "primary";
      default:
        return "foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "完成";
      case "ongoing":
        return "進行中";
      default:
        return "未定";
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              {/* Header */}
              <header className="space-y-12">
                <nav className="mb-6">
                  <Link
                    href="/portfolio"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Portfolio に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Development Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  Web開発・ゲーム開発・技術実装に重点を置いた作品集です.
                  <br />
                  技術スタック、GitHubリンク、実装の詳細を含めて紹介しています.
                </p>
              </header>

              {/* Tech Stack Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Technology Stack
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-6">
                  {Object.entries(techStats).map(([category, technologies]) => (
                    <div
                      key={category}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary capitalize">
                        {category === "frontend" && "Frontend"}
                        {category === "backend" && "Backend"}
                        {category === "gamedev" && "Game Dev"}
                        {category === "tools" && "Tools"}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {technologies.map((tech) => (
                          <span
                            key={tech}
                            className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Featured Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Featured Projects
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {developProjects
                    .filter((project) => project.featured)
                    .map((project) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/detail/develop/${project.id}`}
                        className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      >
                        {/* Project Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Code className="w-5 h-5 text-accent mr-2" />
                            <span
                              className={`noto-sans-jp-light text-xs text-${getStatusColor(project.status)} border border-${getStatusColor(project.status)} px-2 py-1`}
                            >
                              {getStatusLabel(project.status)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-accent mr-1" />
                            <span className="noto-sans-jp-light text-xs text-accent">
                              Featured
                            </span>
                          </div>
                        </div>

                        {/* Project Info */}
                        <div className="space-y-3">
                          <h3 className="zen-kaku-gothic-new text-lg text-primary">
                            {project.title}
                          </h3>

                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {project.description}
                          </p>

                          {/* Highlights */}
                          <div className="space-y-2">
                            <h4 className="noto-sans-jp-light text-xs text-accent">
                              Key Features:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {project.highlights.map((highlight) => (
                                <span
                                  key={highlight}
                                  className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Technologies */}
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          {/* Links */}
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center">
                              <Github className="w-4 h-4 text-foreground mr-1" />
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                GitHub
                              </span>
                            </div>
                            {project.liveUrl && (
                              <div className="flex items-center">
                                <ExternalLink className="w-4 h-4 text-foreground mr-1" />
                                <span className="noto-sans-jp-light text-xs text-foreground">
                                  Live Demo
                                </span>
                              </div>
                            )}
                            <div className="flex items-center ml-auto">
                              <Calendar className="w-4 h-4 text-foreground mr-1" />
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {project.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>

              {/* All Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  All Development Projects ({developProjects.length})
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                  {developProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/portfolio/detail/develop/${project.id}`}
                      className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                    >
                      {/* Project Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Code className="w-4 h-4 text-accent mr-2" />
                          <span
                            className={`noto-sans-jp-light text-xs text-${getStatusColor(project.status)} border border-${getStatusColor(project.status)} px-2 py-1`}
                          >
                            {getStatusLabel(project.status)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-foreground mr-1" />
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            {project.date}
                          </span>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="space-y-3">
                        <h3 className="zen-kaku-gothic-new text-base text-primary">
                          {project.title}
                        </h3>

                        <p className="noto-sans-jp-light text-sm text-foreground line-clamp-2">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="noto-sans-jp-light text-xs text-foreground px-2 py-1">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <Github className="w-4 h-4 text-foreground mr-1" />
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              GitHub
                            </span>
                          </div>
                          {project.liveUrl && (
                            <div className="flex items-center">
                              <ExternalLink className="w-4 h-4 text-foreground mr-1" />
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                Live
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Global Functions */}
              <nav aria-label="Development gallery functions">
                <h3 className="sr-only">Development Gallery機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/all"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>All Projects</span>
                  </Link>

                  <Link
                    href="/portfolio/gallery/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Video Projects</span>
                  </Link>

                  <Link
                    href="/about/commission/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Commission</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - Development Projects
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
