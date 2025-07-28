import { PortfolioContentItem } from "@/types/portfolio";
import { PortfolioDataManager } from "../data-manager";

export interface Skill {
  name: string;
  category: "development" | "design" | "video" | "tool";
  level: number; // 1-5
  projectCount: number;
  examples: string[]; // portfolio item IDs
  description?: string;
  yearsOfExperience?: number;
}

export interface ClientProject {
  id: string;
  title: string;
  client: string;
  category: string;
  thumbnail: string;
  url: string;
  technologies: string[];
  completedAt: Date;
  description: string;
}

export interface TechnologyExperience {
  technology: string;
  category: string;
  projectCount: number;
  firstUsed: Date;
  lastUsed: Date;
  proficiencyLevel: number; // 1-5
  projects: string[]; // portfolio item IDs
}

/**
 * About/Commissionページとの連携機能を提供するクラス
 * ポートフォリオプロジェクトからスキルや経験を抽出する機能を実装
 */
export class AboutIntegration {
  private dataManager: PortfolioDataManager;

  constructor(dataManager: PortfolioDataManager) {
    this.dataManager = dataManager;
  }

  /**
   * プロジェクトから使用技術を自動抽出してスキル情報を生成
   */
  async extractSkillsFromProjects(): Promise<Skill[]> {
    try {
      const allItems = await this.dataManager.getAllItems();
      const publishedItems = allItems.filter(
        (item) => item.status === "published",
      );

      const skillMap = new Map<
        string,
        {
          category: string;
          projects: string[];
          technologies: string[];
        }
      >();

      // プロジェクトから技術を抽出
      publishedItems.forEach((item) => {
        if (item.technologies) {
          item.technologies.forEach((tech: string) => {
            if (!skillMap.has(tech)) {
              skillMap.set(tech, {
                category: this.getTechnologyCategory(tech, item.category),
                projects: [],
                technologies: [],
              });
            }

            const skill = skillMap.get(tech)!;
            if (!skill.projects.includes(item.id)) {
              skill.projects.push(item.id);
            }
          });
        }
      });

      // スキル情報を生成
      const skills: Skill[] = [];

      for (const [techName, skillData] of skillMap.entries()) {
        const projectCount = skillData.projects.length;
        const level = this.calculateSkillLevel(
          projectCount,
          skillData.projects,
          publishedItems,
        );
        const yearsOfExperience = this.calculateYearsOfExperience(
          skillData.projects,
          publishedItems,
        );

        skills.push({
          name: techName,
          category: skillData.category as
            | "development"
            | "design"
            | "video"
            | "tool",
          level,
          projectCount,
          examples: skillData.projects.slice(0, 3), // 最大3つの例
          description: this.generateSkillDescription(techName, projectCount),
          yearsOfExperience,
        });
      }

      return skills.sort((a, b) => {
        // レベルが高い順、同じ場合はプロジェクト数が多い順
        if (a.level !== b.level) {
          return b.level - a.level;
        }
        return b.projectCount - a.projectCount;
      });
    } catch (error) {
      console.error("Error extracting skills from projects:", error);
      return [];
    }
  }

  /**
   * クライアントワークの実例を取得
   */
  async getClientWorkExamples(): Promise<ClientProject[]> {
    try {
      const allItems = await this.dataManager.getAllItems();

      const clientProjects = allItems
        .filter(
          (item) => item.status === "published" && item.client && item.client,
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          client: item.client!,
          category: item.category,
          thumbnail:
            item.thumbnail ||
            item.images?.[0] ||
            "/default-portfolio-thumb.jpg",
          url: `/portfolio/${item.id}`,
          technologies: item.technologies || [],
          completedAt: new Date(item.updatedAt || item.createdAt),
          description: item.description,
        }))
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

      return clientProjects;
    } catch (error) {
      console.error("Error getting client work examples:", error);
      return [];
    }
  }

  /**
   * 特定のスキルタイプに関連するポートフォリオアイテムを取得
   */
  async getRelevantPortfolioItems(
    skillType: string,
  ): Promise<PortfolioContentItem[]> {
    try {
      const allItems = await this.dataManager.getAllItems();

      const relevantItems = allItems.filter(
        (item) =>
          item.status === "published" &&
          (item.technologies?.includes(skillType) ||
            item.category === skillType ||
            item.tags?.includes(skillType)),
      );

      return relevantItems
        .sort((a, b) => {
          // 優先度が高い順、同じ場合は更新日時が新しい順
          if (a.priority !== b.priority) {
            return (b.priority || 0) - (a.priority || 0);
          }
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        })
        .slice(0, 6); // 最大6件
    } catch (error) {
      console.error("Error getting relevant portfolio items:", error);
      return [];
    }
  }

  /**
   * 技術経験の詳細情報を取得
   */
  async getTechnologyExperience(): Promise<TechnologyExperience[]> {
    try {
      const allItems = await this.dataManager.getAllItems();
      const publishedItems = allItems.filter(
        (item) => item.status === "published",
      );

      const techMap = new Map<
        string,
        {
          category: string;
          projects: { id: string; date: Date }[];
        }
      >();

      // 技術ごとにプロジェクトを集計
      publishedItems.forEach((item) => {
        if (item.technologies) {
          item.technologies.forEach((tech: string) => {
            if (!techMap.has(tech)) {
              techMap.set(tech, {
                category: this.getTechnologyCategory(tech, item.category),
                projects: [],
              });
            }

            techMap.get(tech)!.projects.push({
              id: item.id,
              date: new Date(item.createdAt),
            });
          });
        }
      });

      // 技術経験情報を生成
      const experiences: TechnologyExperience[] = [];

      for (const [tech, data] of techMap.entries()) {
        const projects = data.projects.sort(
          (a, b) => a.date.getTime() - b.date.getTime(),
        );
        const firstUsed = projects[0].date;
        const lastUsed = projects[projects.length - 1].date;
        const projectCount = projects.length;
        const proficiencyLevel = this.calculateSkillLevel(
          projectCount,
          projects.map((p) => p.id),
          publishedItems,
        );

        experiences.push({
          technology: tech,
          category: data.category,
          projectCount,
          firstUsed,
          lastUsed,
          proficiencyLevel,
          projects: projects.map((p) => p.id),
        });
      }

      return experiences.sort((a, b) => {
        // 習熟度が高い順、同じ場合はプロジェクト数が多い順
        if (a.proficiencyLevel !== b.proficiencyLevel) {
          return b.proficiencyLevel - a.proficiencyLevel;
        }
        return b.projectCount - a.projectCount;
      });
    } catch (error) {
      console.error("Error getting technology experience:", error);
      return [];
    }
  }

  /**
   * About/Commissionページ用のデータを一括取得
   */
  async getAboutPageData() {
    const [skills, clientWork, techExperience] = await Promise.all([
      this.extractSkillsFromProjects(),
      this.getClientWorkExamples(),
      this.getTechnologyExperience(),
    ]);

    return {
      skills,
      clientWork,
      techExperience,
      summary: {
        totalSkills: skills.length,
        totalProjects: clientWork.length,
        topSkills: skills.slice(0, 5),
        recentWork: clientWork.slice(0, 3),
      },
    };
  }

  /**
   * 技術のカテゴリを判定
   */
  private getTechnologyCategory(tech: string, projectCategory: string): string {
    const developmentTechs = [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Node.js",
      "Python",
      "Unity",
      "C#",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Vue.js",
      "Angular",
    ];

    const designTechs = [
      "Figma",
      "Adobe XD",
      "Sketch",
      "Photoshop",
      "Illustrator",
      "InDesign",
    ];

    const videoTechs = [
      "After Effects",
      "Premiere Pro",
      "Final Cut Pro",
      "DaVinci Resolve",
      "Cinema 4D",
      "Blender",
      "Maya",
    ];

    const toolTechs = [
      "Git",
      "Docker",
      "AWS",
      "Vercel",
      "Firebase",
      "MongoDB",
      "PostgreSQL",
    ];

    if (developmentTechs.includes(tech)) return "development";
    if (designTechs.includes(tech)) return "design";
    if (videoTechs.includes(tech)) return "video";
    if (toolTechs.includes(tech)) return "tool";

    // プロジェクトカテゴリから推測
    if (projectCategory === "develop") return "development";
    if (projectCategory === "video") return "video";
    if (projectCategory === "design") return "design";

    return "development"; // デフォルト
  }

  /**
   * スキルレベルを計算（1-5）
   */
  private calculateSkillLevel(
    projectCount: number,
    projectIds: string[],
    allProjects: PortfolioContentItem[],
  ): number {
    // プロジェクト数ベースの基本レベル
    let level = Math.min(Math.floor(projectCount / 2) + 1, 5);

    // プロジェクトの複雑さや規模を考慮
    const projects = allProjects.filter((p) => projectIds.includes(p.id));
    const avgPriority =
      projects.reduce((sum, p) => sum + (p.priority || 0), 0) / projects.length;

    if (avgPriority > 8) level = Math.min(level + 1, 5);
    if (avgPriority > 5) level = Math.min(level + 0.5, 5);

    return Math.round(level);
  }

  /**
   * 経験年数を計算
   */
  private calculateYearsOfExperience(
    projectIds: string[],
    allProjects: PortfolioContentItem[],
  ): number {
    const projects = allProjects.filter((p) => projectIds.includes(p.id));
    if (projects.length === 0) return 0;

    const dates = projects.map((p) => new Date(p.createdAt));
    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())));

    const diffInYears =
      (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(Math.round(diffInYears * 10) / 10, 0.1); // 最小0.1年
  }

  /**
   * スキルの説明文を生成
   */
  private generateSkillDescription(tech: string, projectCount: number): string {
    const descriptions: Record<string, string> = {
      React: "モダンなWebアプリケーション開発のメインフレームワーク",
      "Next.js": "React ベースのフルスタックフレームワーク",
      TypeScript: "型安全なJavaScript開発",
      Unity: "ゲーム開発とインタラクティブコンテンツ制作",
      "After Effects": "モーショングラフィックスと映像制作",
      Figma: "UI/UXデザインとプロトタイピング",
    };

    const baseDescription = descriptions[tech] || `${tech}を使用した開発・制作`;
    return `${baseDescription}（${projectCount}プロジェクトで使用）`;
  }
}
