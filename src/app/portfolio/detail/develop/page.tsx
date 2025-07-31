import type { ContentItem } from "@/types";
import { Calendar, Code, ExternalLink, Github, Star } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Dynamic metadata generation
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;

  if (id) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/portfolio?category=develop`,
        {
          cache: "force-cache",
        },
      );

      if (response.ok) {
        const data = await response.json();
        const project = data.data.find((item: ContentItem) => item.id === id);

        if (project) {
          return {
            title: `${project.title} - Development Detail | samuido`,
            description: project.description,
            keywords: ["開発詳細", "技術実装", project.title, ...project.tags],
            robots: "index, follow",
            alternates: {
              canonical: `https://yusuke-kim.com/portfolio/detail/develop?id=${id}`,
            },
            openGraph: {
              title: `${project.title} - Development Detail | samuido`,
              description: project.description,
              type: "article",
              url: `https://yusuke-kim.com/portfolio/detail/develop?id=${id}`,
              images: [
                {
                  url:
                    project.thumbnail ||
                    "https://yusuke-kim.com/portfolio/detail-develop-og-image.png",
                  width: 1200,
                  height: 630,
                  alt: project.title,
                },
              ],
              siteName: "samuido",
              locale: "ja_JP",
            },
            twitter: {
              card: "summary_large_image",
              title: `${project.title} - Development Detail | samuido`,
              description: project.description,
              images: [
                project.thumbnail ||
                  "https://yusuke-kim.com/portfolio/detail-develop-twitter-image.jpg",
              ],
              creator: "@361do_sleep",
            },
          };
        }
      }
    } catch (error) {
      console.error("Error generating metadata:", error);
    }
  }

  // Default metadata
  return {
    title: "Development Detail - Portfolio | samuido 開発プロジェクト詳細",
    description:
      "samuidoの開発プロジェクトの詳細ページ。技術実装の詳細、使用技術、開発プロセス、ソースコードを含む包括的な情報。",
    keywords: [
      "開発詳細",
      "技術実装",
      "プロジェクト詳細",
      "ソースコード",
      "開発プロセス",
      "技術スタック",
    ],
    robots: "index, follow",
    alternates: {
      canonical: "https://yusuke-kim.com/portfolio/detail/develop",
    },
    openGraph: {
      title: "Development Detail - Portfolio | samuido 開発プロジェクト詳細",
      description:
        "samuidoの開発プロジェクトの詳細ページ。技術実装の詳細、使用技術、開発プロセス、ソースコードを含む包括的な情報。",
      type: "article",
      url: "https://yusuke-kim.com/portfolio/detail/develop",
      images: [
        {
          url: "https://yusuke-kim.com/portfolio/detail-develop-og-image.png",
          width: 1200,
          height: 630,
          alt: "Development Detail - Portfolio",
        },
      ],
      siteName: "samuido",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: "Development Detail - Portfolio | samuido 開発プロジェクト詳細",
      description:
        "samuidoの開発プロジェクトの詳細ページ。技術実装の詳細、使用技術、開発プロセス、ソースコードを含む包括的な情報。",
      images: [
        "https://yusuke-kim.com/portfolio/detail-develop-twitter-image.jpg",
      ],
      creator: "@361do_sleep",
    },
  };
}

// Fetch portfolio data
async function getPortfolioData(): Promise<ContentItem[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/portfolio?category=develop`,
      {
        cache: "force-cache",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch portfolio data");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
}

// Generate structured data for a specific project
function generateStructuredData(project: ContentItem) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    url: `https://yusuke-kim.com/portfolio/detail/develop?id=${project.id}`,
    author: {
      "@type": "Person",
      name: "木村友亮",
      alternateName: "samuido",
    },
    programmingLanguage: project.tags,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
  };
}

// Extract technologies from tags and external links
function extractTechnologies(project: ContentItem): string[] {
  const technologies = new Set<string>();

  // Add tags as technologies
  project.tags.forEach((tag) => technologies.add(tag));

  // Add common development technologies based on description
  const description = project.description.toLowerCase();
  const commonTechs = [
    "javascript",
    "typescript",
    "react",
    "next.js",
    "node.js",
    "python",
    "unity",
    "c++",
    "c#",
    "html",
    "css",
    "tailwind",
    "vue",
    "angular",
    "after effects",
    "premiere pro",
    "photoshop",
    "illustrator",
    "webgl",
    "three.js",
    "pixi.js",
    "canvas",
    "svg",
  ];

  commonTechs.forEach((tech) => {
    if (
      description.includes(tech.toLowerCase()) ||
      description.includes(tech.replace(".", "").toLowerCase())
    ) {
      technologies.add(tech);
    }
  });

  return Array.from(technologies);
}

// Extract project type from category and description
function extractProjectType(project: ContentItem): string {
  const description = project.description.toLowerCase();

  if (
    description.includes("ゲーム") ||
    description.includes("game") ||
    description.includes("unity")
  ) {
    return "game";
  } else if (
    description.includes("プラグイン") ||
    description.includes("plugin") ||
    description.includes("エフェクト")
  ) {
    return "plugin";
  } else if (
    description.includes("ツール") ||
    description.includes("tool") ||
    description.includes("エディター")
  ) {
    return "tool";
  } else {
    return "web";
  }
}

// Extract GitHub URL from external links
function extractGitHubUrl(project: ContentItem): string | null {
  if (!project.externalLinks) return null;

  const githubLink = project.externalLinks.find(
    (link) =>
      link.url.includes("github.com") ||
      link.title.toLowerCase().includes("github"),
  );

  return githubLink?.url || null;
}

// Extract live demo URL from external links
function extractLiveUrl(project: ContentItem): string | null {
  if (!project.externalLinks) return null;

  const liveLink = project.externalLinks.find(
    (link) =>
      !link.url.includes("github.com") &&
      !link.url.includes("twitter.com") &&
      !link.url.includes("x.com") &&
      (link.title.toLowerCase().includes("demo") ||
        link.title.toLowerCase().includes("live") ||
        link.title.toLowerCase().includes("サイト") ||
        link.url.includes("http")),
  );

  return liveLink?.url || null;
}

// Generate technical details based on project type and technologies
function generateTechnicalDetails(
  project: ContentItem,
  projectType: string,
  technologies: string[],
) {
  const details: Record<
    string,
    { title: string; description: string; details: string[] }
  > = {};

  // Architecture section based on project type
  if (projectType === "web") {
    details.architecture = {
      title: "アーキテクチャ",
      description: "Webアプリケーションの設計と構成",
      details: [
        "モダンなWebフレームワークの活用",
        "レスポンシブデザインの実装",
        "ユーザビリティを重視したUI/UX設計",
        "効率的なコード構成とモジュール化",
      ],
    };
  } else if (projectType === "plugin") {
    details.architecture = {
      title: "プラグイン設計",
      description: "After Effectsプラグインの技術実装",
      details: [
        "C++によるネイティブプラグイン開発",
        "After Effects SDK の活用",
        "効率的なエフェクト処理アルゴリズム",
        "ユーザーフレンドリーなUI設計",
      ],
    };
  } else if (projectType === "game") {
    details.architecture = {
      title: "ゲーム設計",
      description: "ゲームエンジンを使用したゲーム開発",
      details: [
        "Unityエンジンの活用",
        "効率的なゲームループの実装",
        "物理演算とコリジョン検出",
        "ユーザーインタラクションの最適化",
      ],
    };
  } else {
    details.architecture = {
      title: "ツール設計",
      description: "開発ツールの技術実装",
      details: [
        "効率的なアルゴリズムの実装",
        "ユーザビリティを重視したインターフェース",
        "拡張性を考慮した設計",
        "パフォーマンス最適化",
      ],
    };
  }

  // Implementation section based on technologies
  const hasWebTech = technologies.some((tech) =>
    ["javascript", "typescript", "react", "next.js", "html", "css"].includes(
      tech.toLowerCase(),
    ),
  );

  if (hasWebTech) {
    details.implementation = {
      title: "実装技術",
      description: "使用した技術スタックと実装手法",
      details: [
        ...technologies.slice(0, 4).map((tech) => `${tech}による実装`),
        "モダンな開発手法の採用",
        "コードの可読性と保守性の確保",
      ],
    };
  } else {
    details.implementation = {
      title: "実装技術",
      description: "プロジェクトで使用した技術と手法",
      details: [
        ...technologies.slice(0, 3).map((tech) => `${tech}の活用`),
        "効率的な開発プロセスの実践",
        "品質管理とテスト手法",
        "ユーザーフィードバックの反映",
      ],
    };
  }

  // Challenges section
  details.challenges = {
    title: "技術的課題",
    description: "開発過程で直面した課題と解決策",
    details: [
      "パフォーマンスの最適化",
      "ユーザビリティの向上",
      "技術的制約の克服",
      "品質とスピードのバランス",
    ],
  };

  // Learning section
  details.learning = {
    title: "学習・成果",
    description: "プロジェクトを通じて得られた知見",
    details: [
      "新しい技術スタックの習得",
      "問題解決能力の向上",
      "ユーザー視点での開発",
      "継続的な改善プロセス",
    ],
  };

  return details;
}

// Generate code examples based on project type and technologies
function generateCodeExamples(
  project: ContentItem,
  projectType: string,
  technologies: string[],
) {
  const examples = [];

  if (
    projectType === "web" &&
    technologies.some((tech) => tech.toLowerCase().includes("react"))
  ) {
    examples.push({
      title: "React Component Example",
      language: "typescript",
      code: `// ${project.title} - Component Structure
import React from 'react';

interface ${project.title.replace(/[^a-zA-Z0-9]/g, "")}Props {
  // Component props based on project requirements
}

export const ${project.title.replace(/[^a-zA-Z0-9]/g, "")}: React.FC<${project.title.replace(/[^a-zA-Z0-9]/g, "")}Props> = () => {
  return (
    <div className="project-container">
      {/* ${project.description} */}
    </div>
  );
};`,
    });
  }

  if (
    projectType === "plugin" &&
    technologies.some((tech) => tech.toLowerCase().includes("c++"))
  ) {
    examples.push({
      title: "After Effects Plugin Structure",
      language: "cpp",
      code: `// ${project.title} - Plugin Implementation
#include "AEConfig.h"
#include "entry.h"
#include "AE_Effect.h"

// Plugin entry point
PF_Err EffectMain(
    PF_Cmd cmd,
    PF_InData *in_data,
    PF_OutData *out_data,
    PF_ParamDef *params[],
    PF_LayerDef *output
) {
    PF_Err err = PF_Err_NONE;
    
    switch (cmd) {
        case PF_Cmd_ABOUT:
            // Plugin information
            break;
        case PF_Cmd_RENDER:
            // Main rendering logic
            break;
    }
    
    return err;
}`,
    });
  }

  if (
    projectType === "game" &&
    technologies.some((tech) => tech.toLowerCase().includes("unity"))
  ) {
    examples.push({
      title: "Unity Game Logic",
      language: "csharp",
      code: `// ${project.title} - Game Controller
using UnityEngine;

public class ${project.title.replace(/[^a-zA-Z0-9]/g, "")}Controller : MonoBehaviour
{
    [SerializeField] private float gameSpeed = 1.0f;
    
    void Start()
    {
        // Initialize game components
        InitializeGame();
    }
    
    void Update()
    {
        // Game loop logic
        UpdateGameState();
    }
    
    private void InitializeGame()
    {
        // ${project.description}
    }
}`,
    });
  }

  // If no specific examples, add a general implementation example
  if (examples.length === 0) {
    examples.push({
      title: `${project.title} - Implementation Overview`,
      language: "javascript",
      code: `// ${project.title}
// ${project.description}

class ${project.title.replace(/[^a-zA-Z0-9]/g, "")} {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Project initialization
        console.log('${project.title} initialized');
    }
    
    execute() {
        // Main functionality
        // Technologies used: ${technologies.join(", ")}
    }
}

export default ${project.title.replace(/[^a-zA-Z0-9]/g, "")};`,
    });
  }

  return examples;
}

export default async function DevelopDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const portfolioData = await getPortfolioData();

  // If no ID is provided, show the first development project or a project list
  let selectedProject: ContentItem | null = null;

  if (id) {
    selectedProject =
      portfolioData.find((project) => project.id === id) || null;
    if (!selectedProject) {
      notFound();
    }
  } else {
    // Show the first available project or a selection interface
    selectedProject = portfolioData[0] || null;
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              <header className="space-y-12">
                <nav className="mb-6">
                  <Link
                    href="/portfolio/gallery/develop"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Development Gallery に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Development Detail
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  開発プロジェクトの詳細を表示するには、プロジェクトを選択してください。
                </p>
              </header>

              {portfolioData.length > 0 && (
                <section>
                  <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                    Available Development Projects
                  </h2>
                  <div className="grid-system grid-1 md:grid-2 lg:grid-3 gap-6">
                    {portfolioData.slice(0, 6).map((project) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/detail/develop?id=${project.id}`}
                        className="bg-base border border-foreground p-4 space-y-4 hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                      >
                        {project.thumbnail && (
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-full h-32 object-cover border border-foreground"
                          />
                        )}
                        <div className="space-y-2">
                          <h3 className="zen-kaku-gothic-new text-lg text-primary">
                            {project.title}
                          </h3>
                          <p className="noto-sans-jp-light text-sm text-foreground line-clamp-3">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="noto-sans-jp-light text-xs text-accent border border-accent px-1 py-0.5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {portfolioData.length > 6 && (
                    <div className="text-center mt-8">
                      <Link
                        href="/portfolio/gallery/develop"
                        className="noto-sans-jp-light text-sm text-accent border border-accent px-4 py-2 inline-block hover:bg-accent hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        View All Development Projects
                      </Link>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Extract project data
  const technologies = extractTechnologies(selectedProject);
  const projectType = extractProjectType(selectedProject);
  const githubUrl = extractGitHubUrl(selectedProject);
  const liveUrl = extractLiveUrl(selectedProject);
  const structuredData = generateStructuredData(selectedProject);
  const technicalDetails = generateTechnicalDetails(
    selectedProject,
    projectType,
    technologies,
  );
  const codeExamples = generateCodeExamples(
    selectedProject,
    projectType,
    technologies,
  );
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

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
                    href="/portfolio/gallery/develop"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Development Gallery に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Development Detail
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  開発プロジェクトの技術実装詳細と開発プロセスを紹介します.
                  <br />
                  使用技術、課題解決、学習内容を含む包括的な情報です.
                </p>
              </header>

              {/* Project Overview */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Project Overview
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-6">
                  <div className="grid-system grid-1 lg:grid-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="zen-kaku-gothic-new text-xl text-primary">
                        {selectedProject.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                        {selectedProject.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Code className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Category: {selectedProject.category}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Created:{" "}
                            {new Date(
                              selectedProject.createdAt,
                            ).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Status: {selectedProject.status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Code className="w-5 h-5 text-accent mr-2" />
                          <span className="noto-sans-jp-light text-sm text-foreground">
                            Type: {projectType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedProject.images &&
                        selectedProject.images.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="zen-kaku-gothic-new text-lg text-primary">
                              Project Images
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {selectedProject.images
                                .slice(0, 2)
                                .map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`${selectedProject.title} - Image ${index + 1}`}
                                    className="w-full h-auto border border-foreground"
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                      <div className="pt-4">
                        <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                          Technologies Used
                        </h4>
                        <div className="flex flex-wrap gap-2">
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
                    </div>
                  </div>

                  {(githubUrl ||
                    liveUrl ||
                    (selectedProject.externalLinks &&
                      selectedProject.externalLinks.length > 0)) && (
                    <div className="pt-4 border-t border-foreground">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {githubUrl && (
                          <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center border border-foreground px-4 py-3 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                          >
                            <Github className="w-5 h-5 mr-2" />
                            <span className={Global_title}>
                              View Source Code
                            </span>
                          </a>
                        )}
                        {liveUrl && (
                          <a
                            href={liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center border border-foreground px-4 py-3 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                          >
                            <ExternalLink className="w-5 h-5 mr-2" />
                            <span className={Global_title}>Live Demo</span>
                          </a>
                        )}
                        {selectedProject.externalLinks &&
                          selectedProject.externalLinks.map(
                            (link, index) =>
                              !link.url.includes("github.com") && (
                                <a
                                  key={index}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center border border-foreground px-4 py-3 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                                >
                                  <ExternalLink className="w-5 h-5 mr-2" />
                                  <span className={Global_title}>
                                    {link.title}
                                  </span>
                                </a>
                              ),
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Technical Implementation */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Technical Implementation
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  {Object.entries(technicalDetails).map(([key, detail]) => (
                    <div
                      key={key}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        {detail.title}
                      </h3>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {detail.description}
                      </p>
                      <div className="space-y-2">
                        {detail.details.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-1 h-1 bg-accent mt-2 mr-3 flex-shrink-0"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Code Examples */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Code Examples
                </h2>
                <div className="space-y-6">
                  {codeExamples.map((example, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          {example.title}
                        </h3>
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                          {example.language}
                        </span>
                      </div>
                      <div className="bg-background border border-foreground p-4 overflow-x-auto">
                        <pre className="text-sm text-foreground">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Challenges & Learnings */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Challenges & Learnings
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      技術的課題
                    </h3>
                    <div className="space-y-3">
                      {technicalDetails.challenges.details.map(
                        (challenge, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-primary mt-2 mr-3 flex-shrink-0"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {challenge}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="bg-base border border-foreground p-4 space-y-4">
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      学習・成果
                    </h3>
                    <div className="space-y-3">
                      {technicalDetails.learning.details.map(
                        (learning, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-accent mt-2 mr-3 flex-shrink-0"></div>
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {learning}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Portfolio detail navigation">
                <h3 className="sr-only">Portfolio Detail機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>More Development</span>
                  </Link>

                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Portfolio Home</span>
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
                    © 2025 samuido - Development Project Detail
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
