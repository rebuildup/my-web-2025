/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import HandleProfilePage from "../page";

// Mock all external dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/about/profile/handle",
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const imgProps = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} alt={imgProps.alt || ""} />;
  },
}));

interface MockLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

jest.mock("@/components/ui/Breadcrumbs", () => ({
  Breadcrumbs: ({ items }: BreadcrumbsProps) => (
    <nav data-testid="breadcrumbs">
      {items.map((item: BreadcrumbItem, index: number) => (
        <span key={index}>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  ),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  Code: ({ className }: { className?: string }) => (
    <svg data-testid="code-icon" className={className} />
  ),
  Coffee: ({ className }: { className?: string }) => (
    <svg data-testid="coffee-icon" className={className} />
  ),
  Gamepad2: ({ className }: { className?: string }) => (
    <svg data-testid="gamepad-icon" className={className} />
  ),
  Music: ({ className }: { className?: string }) => (
    <svg data-testid="music-icon" className={className} />
  ),
  Palette: ({ className }: { className?: string }) => (
    <svg data-testid="palette-icon" className={className} />
  ),
  Video: ({ className }: { className?: string }) => (
    <svg data-testid="video-icon" className={className} />
  ),
}));

describe("HandleProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<HandleProfilePage />);
    }).not.toThrow();
  });

  it("should render the page title", () => {
    render(<HandleProfilePage />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Handle Profile");
  });

  it("should render breadcrumbs navigation", () => {
    render(<HandleProfilePage />);

    const breadcrumbs = screen.getByTestId("breadcrumbs");
    expect(breadcrumbs).toBeInTheDocument();
  });

  it("should render structured data script", () => {
    render(<HandleProfilePage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(structuredDataScript).toBeInTheDocument();

    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );
    expect(structuredData["@context"]).toBe("https://schema.org");
    expect(structuredData["@type"]).toBe("Person");
    expect(structuredData.name).toBe("samuido");
    expect(structuredData.alternateName).toBe("木村友亮");
  });

  it("should render page description", () => {
    render(<HandleProfilePage />);

    const description = screen.getByText(
      /ハンドルネーム「samuido」としてのクリエイティブ活動について/,
    );
    expect(description).toBeInTheDocument();
  });

  it("should render About samuido section", () => {
    render(<HandleProfilePage />);

    const aboutHeading = screen.getByRole("heading", {
      level: 2,
      name: "About samuido",
    });
    expect(aboutHeading).toBeInTheDocument();
  });

  it("should render introduction content", () => {
    render(<HandleProfilePage />);

    const introText = screen.getByText(
      /「samuido」は、技術とクリエイティビティの境界を探求するハンドルネームです/,
    );
    expect(introText).toBeInTheDocument();

    const studentText = screen.getByText(/現在は高専生として学習を続けながら/);
    expect(studentText).toBeInTheDocument();
  });

  it("should render Creative Areas section", () => {
    render(<HandleProfilePage />);

    const creativeAreasHeading = screen.getByRole("heading", {
      level: 2,
      name: "Creative Areas",
    });
    expect(creativeAreasHeading).toBeInTheDocument();
  });

  it("should render all creative area categories", () => {
    render(<HandleProfilePage />);

    const creativeCoding = screen.getByText("Creative Coding");
    expect(creativeCoding).toBeInTheDocument();

    const motionGraphics = screen.getByText("Motion Graphics");
    expect(motionGraphics).toBeInTheDocument();

    const gameDevelopment = screen.getByText("Game Development");
    expect(gameDevelopment).toBeInTheDocument();

    const uiuxDesign = screen.getByText("UI/UX Design");
    expect(uiuxDesign).toBeInTheDocument();

    const soundDesign = screen.getByText("Sound Design");
    expect(soundDesign).toBeInTheDocument();

    const toolDevelopment = screen.getByText("Tool Development");
    expect(toolDevelopment).toBeInTheDocument();
  });

  it("should render creative area icons", () => {
    render(<HandleProfilePage />);

    const codeIcon = screen.getByTestId("code-icon");
    expect(codeIcon).toBeInTheDocument();

    const videoIcon = screen.getByTestId("video-icon");
    expect(videoIcon).toBeInTheDocument();

    const gamepadIcon = screen.getByTestId("gamepad-icon");
    expect(gamepadIcon).toBeInTheDocument();

    const paletteIcon = screen.getByTestId("palette-icon");
    expect(paletteIcon).toBeInTheDocument();

    const musicIcon = screen.getByTestId("music-icon");
    expect(musicIcon).toBeInTheDocument();

    const coffeeIcon = screen.getByTestId("coffee-icon");
    expect(coffeeIcon).toBeInTheDocument();
  });

  it("should render creative area descriptions", () => {
    render(<HandleProfilePage />);

    const creativeCodingDesc = screen.getByText(
      /p5.js、PIXI.js、Three.jsを使ったインタラクティブ作品制作/,
    );
    expect(creativeCodingDesc).toBeInTheDocument();

    const motionGraphicsDesc = screen.getByText(
      /After Effectsを中心とした映像表現とアニメーション制作/,
    );
    expect(motionGraphicsDesc).toBeInTheDocument();
  });

  it("should render creative area projects", () => {
    render(<HandleProfilePage />);

    const generativeArt = screen.getByText(/ジェネラティブアート/);
    expect(generativeArt).toBeInTheDocument();

    const mvProduction = screen.getByText(/MV制作/);
    expect(mvProduction).toBeInTheDocument();

    const browserGame = screen.getByText(/ブラウザゲーム/);
    expect(browserGame).toBeInTheDocument();
  });

  it("should render Creative Philosophy section", () => {
    render(<HandleProfilePage />);

    const philosophyHeading = screen.getByRole("heading", {
      level: 2,
      name: "Creative Philosophy",
    });
    expect(philosophyHeading).toBeInTheDocument();
  });

  it("should render all philosophy categories", () => {
    render(<HandleProfilePage />);

    const creativityApproach = screen.getByText("創造性への取り組み");
    expect(creativityApproach).toBeInTheDocument();

    const continuousLearning = screen.getByText("継続的な学習");
    expect(continuousLearning).toBeInTheDocument();

    const knowledgeSharing = screen.getByText("知識の共有");
    expect(knowledgeSharing).toBeInTheDocument();

    const collaborationElements = screen.getAllByText("コラボレーション");
    expect(collaborationElements.length).toBeGreaterThan(0);
  });

  it("should render philosophy content", () => {
    render(<HandleProfilePage />);

    const creativityContent = screen.getByText(
      /技術とアートの境界を曖昧にし、新しい表現方法を模索する/,
    );
    expect(creativityContent).toBeInTheDocument();

    const learningContent = screen.getByText(
      /技術の進歩は早く、常に新しいツールや手法が生まれています/,
    );
    expect(learningContent).toBeInTheDocument();
  });

  it("should render Current Focus section", () => {
    render(<HandleProfilePage />);

    const currentFocusHeading = screen.getByRole("heading", {
      level: 2,
      name: "Current Focus",
    });
    expect(currentFocusHeading).toBeInTheDocument();
  });

  it("should render current focus areas", () => {
    render(<HandleProfilePage />);

    const webglFocus = screen.getByText("WebGL & Three.js");
    expect(webglFocus).toBeInTheDocument();

    const generativeAIFocus = screen.getByText("Generative AI");
    expect(generativeAIFocus).toBeInTheDocument();

    const realtimeGraphics = screen.getByText("Real-time Graphics");
    expect(realtimeGraphics).toBeInTheDocument();

    const accessibility = screen.getByText("Accessibility");
    expect(accessibility).toBeInTheDocument();
  });

  it("should render focus status tags", () => {
    render(<HandleProfilePage />);

    const learningStatus = screen.getByText("学習中");
    expect(learningStatus).toBeInTheDocument();

    const experimentingStatus = screen.getByText("実験中");
    expect(experimentingStatus).toBeInTheDocument();

    const researchingStatus = screen.getByText("研究中");
    expect(researchingStatus).toBeInTheDocument();

    const emphasizedStatus = screen.getByText("重視");
    expect(emphasizedStatus).toBeInTheDocument();
  });

  it("should render Work Style section", () => {
    render(<HandleProfilePage />);

    const workStyleHeading = screen.getByRole("heading", {
      level: 2,
      name: "Work Style",
    });
    expect(workStyleHeading).toBeInTheDocument();
  });

  it("should render development environment details", () => {
    render(<HandleProfilePage />);

    const developmentEnv = screen.getByText("開発環境");
    expect(developmentEnv).toBeInTheDocument();

    const vscodeEditor = screen.getByText(/エディタ: Visual Studio Code/);
    expect(vscodeEditor).toBeInTheDocument();

    const gitVersion = screen.getByText(/バージョン管理: Git \/ GitHub/);
    expect(gitVersion).toBeInTheDocument();
  });

  it("should render workflow details", () => {
    render(<HandleProfilePage />);

    const workflow = screen.getByText("ワークフロー");
    expect(workflow).toBeInTheDocument();

    const prototypeApproach = screen.getByText(/プロトタイプ重視の開発/);
    expect(prototypeApproach).toBeInTheDocument();

    const continuousImprovement = screen.getByText(/継続的な実験と改善/);
    expect(continuousImprovement).toBeInTheDocument();
  });

  it("should render collaboration section", () => {
    render(<HandleProfilePage />);

    const collaborationHeadings = screen.getAllByText("コラボレーション");
    expect(collaborationHeadings.length).toBeGreaterThan(0);

    const collaborationText = screen.getByText(
      /異なる専門分野の方との協働を大切にしています/,
    );
    expect(collaborationText).toBeInTheDocument();
  });

  it("should render Connect section", () => {
    render(<HandleProfilePage />);

    const connectHeading = screen.getByRole("heading", {
      level: 2,
      name: "Connect",
    });
    expect(connectHeading).toBeInTheDocument();
  });

  it("should render social media categories", () => {
    render(<HandleProfilePage />);

    const techDevelopment = screen.getByText("技術・開発");
    expect(techDevelopment).toBeInTheDocument();

    const videoDesign = screen.getByText("映像・デザイン");
    expect(videoDesign).toBeInTheDocument();

    const worksPortfolio = screen.getByText("作品・ポートフォリオ");
    expect(worksPortfolio).toBeInTheDocument();
  });

  it("should render social media handles", () => {
    render(<HandleProfilePage />);

    const twitterTech = screen.getByText("Twitter: @361do_sleep");
    expect(twitterTech).toBeInTheDocument();

    const github = screen.getByText("GitHub: @361do");
    expect(github).toBeInTheDocument();

    const youtube = screen.getByText("YouTube: @361do");
    expect(youtube).toBeInTheDocument();
  });

  it("should render navigation CTA section", () => {
    render(<HandleProfilePage />);

    const realProfileLink = screen.getByRole("link", { name: "Real Profile" });
    expect(realProfileLink).toBeInTheDocument();
    expect(realProfileLink).toHaveAttribute("href", "/about/profile/real");

    const portfolioLink = screen.getByRole("link", { name: "Portfolio" });
    expect(portfolioLink).toBeInTheDocument();
    expect(portfolioLink).toHaveAttribute("href", "/portfolio");

    const linksLink = screen.getByRole("link", { name: "Links" });
    expect(linksLink).toBeInTheDocument();
    expect(linksLink).toHaveAttribute("href", "/about/links");
  });

  it("should render footer", () => {
    render(<HandleProfilePage />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    const copyright = screen.getByText("© 2025 samuido - Handle Profile");
    expect(copyright).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<HandleProfilePage />);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Profile navigation",
    });
    expect(navigation).toBeInTheDocument();
  });

  it("should render all required headings in proper hierarchy", () => {
    render(<HandleProfilePage />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Handle Profile");

    const h2Elements = screen.getAllByRole("heading", { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);

    const h3Elements = screen.getAllByRole("heading", { level: 3 });
    expect(h3Elements.length).toBeGreaterThan(0);
  });

  it("should contain proper meta information in structured data", () => {
    render(<HandleProfilePage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );

    expect(structuredData.url).toBe(
      "https://yusuke-kim.com/about/profile/handle",
    );
    expect(structuredData.description).toBe(
      "クリエイティブコーダー・デザイナー・映像制作者",
    );
    expect(structuredData.sameAs).toBeInstanceOf(Array);
    expect(structuredData.knowsAbout).toBeInstanceOf(Array);
  });

  it("should render focus area descriptions", () => {
    render(<HandleProfilePage />);

    const webglDescription = screen.getByText(
      /ブラウザ上での3D表現とインタラクティブ体験の探求/,
    );
    expect(webglDescription).toBeInTheDocument();

    const aiDescription = screen.getByText(
      /AIを活用したクリエイティブワークフローの研究/,
    );
    expect(aiDescription).toBeInTheDocument();
  });

  it("should render design tools information", () => {
    render(<HandleProfilePage />);

    const figmaAdobe = screen.getByText(
      /デザイン: Figma, Adobe Creative Suite/,
    );
    expect(figmaAdobe).toBeInTheDocument();

    const afterEffects = screen.getByText(/映像: After Effects, Premiere Pro/);
    expect(afterEffects).toBeInTheDocument();
  });
});
