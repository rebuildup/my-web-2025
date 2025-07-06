import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Github, Calendar, User, Tag, Eye, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio Detail - samuido | 作品詳細",
  description: "samuidoの作品詳細ページ。プロジェクトの詳細情報、制作過程、技術スタック、関連リンクを掲載。",
  keywords: ["作品詳細", "ポートフォリオ", "プロジェクト", "制作過程", "技術スタック", "Webデザイン", "開発"],
  robots: "index, follow",
  openGraph: {
    title: "Portfolio Detail - samuido | 作品詳細",
    description: "samuidoの作品詳細ページ。プロジェクトの詳細情報、制作過程、技術スタック、関連リンクを掲載。",
    type: "website",
    url: "/portfolio/detail",
    images: [
      {
        url: "/portfolio-detail-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Portfolio Detail samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Detail - samuido | 作品詳細",
    description: "samuidoの作品詳細ページ。プロジェクトの詳細情報、制作過程、技術スタック、関連リンクを掲載。",
    images: ["/portfolio-detail-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  technologies: string[];
  tags: string[];
  year: number;
  client?: string;
  role: string;
  duration: string;
  status: "completed" | "in-progress" | "concept";
  images: string[];
  videos?: string[];
  links: {
    type: "github" | "demo" | "website" | "download";
    url: string;
    title: string;
  }[];
  stats: {
    views: number;
    downloads?: number;
    likes?: number;
  };
  challenges: string[];
  solutions: string[];
  learnings: string[];
  nextSteps?: string[];
}

// Sample project data (in a real app, this would come from API/database)
const projectData: ProjectDetail = {
  id: "react-portfolio-2025",
  title: "React Portfolio Website",
  description: "Modern portfolio website built with React and Next.js featuring responsive design and interactive animations.",
  longDescription: `This project represents a complete redesign and rebuild of my personal portfolio website using modern web technologies. The site features a clean, minimal design with a focus on performance and accessibility. Built with React 18 and Next.js 14, it leverages server-side rendering for optimal performance and SEO. The design system follows a strict blue and dark gray color scheme with golden ratio spacing throughout.

Key features include a dynamic content management system, advanced search functionality, interactive animations, and a responsive design that works seamlessly across all devices. The project also includes a complete testing suite with 100% code coverage and automated deployment pipeline.`,
  category: "Web Development",
  technologies: ["React", "Next.js", "TypeScript", "TailwindCSS", "Framer Motion", "Vercel"],
  tags: ["portfolio", "react", "nextjs", "typescript", "responsive", "modern"],
  year: 2025,
  client: "Personal Project",
  role: "Full Stack Developer, UI/UX Designer",
  duration: "3 months",
  status: "completed",
  images: [
    "/portfolio-detail-1.jpg",
    "/portfolio-detail-2.jpg",
    "/portfolio-detail-3.jpg",
    "/portfolio-detail-4.jpg",
  ],
  videos: [
    "/portfolio-demo-video.mp4",
  ],
  links: [
    {
      type: "github",
      url: "https://github.com/samuido/portfolio-2025",
      title: "GitHub Repository",
    },
    {
      type: "demo",
      url: "https://portfolio-2025.vercel.app",
      title: "Live Demo",
    },
    {
      type: "website",
      url: "https://yusuke-kim.com",
      title: "Official Website",
    },
  ],
  stats: {
    views: 1250,
    downloads: 45,
    likes: 89,
  },
  challenges: [
    "Implementing server-side rendering while maintaining interactive client-side features",
    "Creating a flexible content management system that supports multiple content types",
    "Achieving 100% test coverage across all components and utilities",
    "Optimizing performance for various device capabilities and network conditions",
  ],
  solutions: [
    "Used Next.js App Router for hybrid rendering strategy with static generation where possible",
    "Developed a TypeScript-first content system with strict type definitions",
    "Implemented comprehensive testing with Jest, React Testing Library, and Playwright",
    "Applied performance optimization techniques including lazy loading and code splitting",
  ],
  learnings: [
    "Advanced Next.js 14 App Router patterns and best practices",
    "TypeScript advanced types and generics for better type safety",
    "Performance optimization strategies for React applications",
    "Accessibility implementation following WCAG 2.1 guidelines",
  ],
  nextSteps: [
    "Implement dark mode support with system preference detection",
    "Add internationalization support for Japanese and English",
    "Integrate with headless CMS for easier content management",
    "Add analytics and performance monitoring",
  ],
};

export default function PortfolioDetailPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": projectData.title,
    "description": projectData.description,
    "url": `https://yusuke-kim.com/portfolio/detail/${projectData.id}`,
    "dateCreated": `${projectData.year}-01-01`,
    "creator": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "about": projectData.category,
    "keywords": projectData.tags.join(", "),
    "additionalType": "Software",
    "isPartOf": {
      "@type": "CollectionPage",
      "name": "Portfolio",
      "url": "https://yusuke-kim.com/portfolio"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/portfolio" 
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="neue-haas-grotesk-display text-xl">Portfolio</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/portfolio/gallery/all" 
                className="noto-sans-jp text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                全作品
              </Link>
              <Link 
                href="/search?type=portfolio" 
                className="noto-sans-jp text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                検索
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded">
                {projectData.category}
              </span>
              <span className="px-3 py-1 bg-foreground/10 text-foreground/70 text-sm rounded">
                {projectData.year}
              </span>
              <span className={`px-3 py-1 text-sm rounded ${
                projectData.status === 'completed' 
                  ? 'bg-green-500/20 text-green-400' 
                  : projectData.status === 'in-progress'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {projectData.status === 'completed' ? '完成' : 
                 projectData.status === 'in-progress' ? '進行中' : 'コンセプト'}
              </span>
            </div>
            
            <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-foreground mb-6">
              {projectData.title}
            </h1>
            
            <p className="noto-sans-jp text-xl text-foreground/80 leading-relaxed mb-8">
              {projectData.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {projectData.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-foreground transition-colors"
                >
                  {link.type === 'github' && <Github size={16} />}
                  {link.type === 'demo' && <ExternalLink size={16} />}
                  {link.type === 'website' && <ExternalLink size={16} />}
                  {link.type === 'download' && <Download size={16} />}
                  <span className="noto-sans-jp text-sm">{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Images */}
              <section>
                <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
                  プロジェクト画像
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectData.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 rounded border border-foreground/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-foreground/40 mb-2">
                          <Eye size={48} />
                        </div>
                        <p className="noto-sans-jp text-sm text-foreground/60">
                          画像 {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Project Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
                  プロジェクト概要
                </h2>
                <div className="prose prose-invert max-w-none">
                  <div className="noto-sans-jp text-foreground/80 leading-relaxed whitespace-pre-line">
                    {projectData.longDescription}
                  </div>
                </div>
              </section>

              {/* Challenges & Solutions */}
              <section>
                <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
                  課題と解決策
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                      主な課題
                    </h3>
                    <ul className="space-y-2">
                      {projectData.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-primary text-sm mt-1">•</span>
                          <span className="noto-sans-jp text-sm text-foreground/80">
                            {challenge}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                      解決策
                    </h3>
                    <ul className="space-y-2">
                      {projectData.solutions.map((solution, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-green-400 text-sm mt-1">✓</span>
                          <span className="noto-sans-jp text-sm text-foreground/80">
                            {solution}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Learnings */}
              <section>
                <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
                  学んだこと
                </h2>
                <ul className="space-y-3">
                  {projectData.learnings.map((learning, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-yellow-400 text-sm mt-1">→</span>
                      <span className="noto-sans-jp text-sm text-foreground/80">
                        {learning}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Next Steps */}
              {projectData.nextSteps && (
                <section>
                  <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-6">
                    今後の展開
                  </h2>
                  <ul className="space-y-3">
                    {projectData.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="text-purple-400 text-sm mt-1">→</span>
                        <span className="noto-sans-jp text-sm text-foreground/80">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  プロジェクト情報
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-primary" />
                    <div>
                      <span className="noto-sans-jp text-xs text-foreground/60">制作年</span>
                      <p className="noto-sans-jp text-sm text-foreground">{projectData.year}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User size={16} className="text-primary" />
                    <div>
                      <span className="noto-sans-jp text-xs text-foreground/60">役割</span>
                      <p className="noto-sans-jp text-sm text-foreground">{projectData.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar size={16} className="text-primary" />
                    <div>
                      <span className="noto-sans-jp text-xs text-foreground/60">期間</span>
                      <p className="noto-sans-jp text-sm text-foreground">{projectData.duration}</p>
                    </div>
                  </div>
                  
                  {projectData.client && (
                    <div className="flex items-center space-x-3">
                      <User size={16} className="text-primary" />
                      <div>
                        <span className="noto-sans-jp text-xs text-foreground/60">クライアント</span>
                        <p className="noto-sans-jp text-sm text-foreground">{projectData.client}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technologies */}
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  技術スタック
                </h3>
                <div className="flex flex-wrap gap-2">
                  {projectData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary text-sm rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center space-x-2">
                  <Tag size={16} />
                  <span>タグ</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {projectData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-foreground/10 text-foreground/70 text-sm rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  統計情報
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="noto-sans-jp text-sm text-foreground/70">ビュー数</span>
                    <span className="noto-sans-jp text-sm text-foreground">{projectData.stats.views.toLocaleString()}</span>
                  </div>
                  {projectData.stats.downloads && (
                    <div className="flex justify-between items-center">
                      <span className="noto-sans-jp text-sm text-foreground/70">ダウンロード数</span>
                      <span className="noto-sans-jp text-sm text-foreground">{projectData.stats.downloads.toLocaleString()}</span>
                    </div>
                  )}
                  {projectData.stats.likes && (
                    <div className="flex justify-between items-center">
                      <span className="noto-sans-jp text-sm text-foreground/70">いいね数</span>
                      <span className="noto-sans-jp text-sm text-foreground">{projectData.stats.likes.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Projects */}
              <div className="p-6 border border-foreground/20 bg-gray/50">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4">
                  関連プロジェクト
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/portfolio/detail/next-ecommerce"
                    className="block p-3 border border-foreground/20 hover:border-primary/50 transition-colors"
                  >
                    <h4 className="noto-sans-jp text-sm text-foreground mb-1">
                      Next.js Ecommerce Site
                    </h4>
                    <p className="noto-sans-jp text-xs text-foreground/60">
                      フルスタックECサイト構築
                    </p>
                  </Link>
                  
                  <Link
                    href="/portfolio/detail/react-dashboard"
                    className="block p-3 border border-foreground/20 hover:border-primary/50 transition-colors"
                  >
                    <h4 className="noto-sans-jp text-sm text-foreground mb-1">
                      React Admin Dashboard
                    </h4>
                    <p className="noto-sans-jp text-xs text-foreground/60">
                      管理者向けダッシュボード
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm mb-4">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/portfolio" className="text-foreground/60 hover:text-primary text-sm">
              Portfolio
            </Link>
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
              About
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}