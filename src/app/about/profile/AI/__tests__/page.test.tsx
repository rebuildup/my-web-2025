/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import AIProfilePage from "../page";

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
  usePathname: () => "/about/profile/AI",
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
  Bot: ({ className }: { className?: string }) => (
    <svg data-testid="bot-icon" className={className} />
  ),
  Brain: ({ className }: { className?: string }) => (
    <svg data-testid="brain-icon" className={className} />
  ),
  Heart: ({ className }: { className?: string }) => (
    <svg data-testid="heart-icon" className={className} />
  ),
  MessageCircle: ({ className }: { className?: string }) => (
    <svg data-testid="message-circle-icon" className={className} />
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <svg data-testid="sparkles-icon" className={className} />
  ),
  Zap: ({ className }: { className?: string }) => (
    <svg data-testid="zap-icon" className={className} />
  ),
}));

describe("AIProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<AIProfilePage />);
    }).not.toThrow();
  });

  it("should render the page title", () => {
    render(<AIProfilePage />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("AI Profile");
  });

  it("should render breadcrumbs navigation", () => {
    render(<AIProfilePage />);

    const breadcrumbs = screen.getByTestId("breadcrumbs");
    expect(breadcrumbs).toBeInTheDocument();
  });

  it("should render structured data script", () => {
    render(<AIProfilePage />);

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
    render(<AIProfilePage />);

    const description =
      screen.getByText(/AIチャット対話用のプロフィール設定です/);
    expect(description).toBeInTheDocument();
  });

  it("should render AI Persona Overview section", () => {
    render(<AIProfilePage />);

    const overviewHeading = screen.getByRole("heading", {
      level: 2,
      name: "AI Persona Overview",
    });
    expect(overviewHeading).toBeInTheDocument();

    const botIcon = screen.getByTestId("bot-icon");
    expect(botIcon).toBeInTheDocument();

    const assistantTitle = screen.getByText("samuido AI Assistant");
    expect(assistantTitle).toBeInTheDocument();
  });

  it("should render Personality Traits section", () => {
    render(<AIProfilePage />);

    const personalityHeading = screen.getByRole("heading", {
      level: 2,
      name: "Personality Traits",
    });
    expect(personalityHeading).toBeInTheDocument();
  });

  it("should render all personality traits", () => {
    render(<AIProfilePage />);

    const curiosityTrait = screen.getByText("好奇心旺盛");
    expect(curiosityTrait).toBeInTheDocument();

    const logicalTrait = screen.getByText("論理的思考");
    expect(logicalTrait).toBeInTheDocument();

    const creativityTrait = screen.getByText("創造性重視");
    expect(creativityTrait).toBeInTheDocument();

    const collaborationTrait = screen.getByText("協調性");
    expect(collaborationTrait).toBeInTheDocument();
  });

  it("should render personality trait icons", () => {
    render(<AIProfilePage />);

    const sparklesIcon = screen.getByTestId("sparkles-icon");
    expect(sparklesIcon).toBeInTheDocument();

    const brainIcon = screen.getByTestId("brain-icon");
    expect(brainIcon).toBeInTheDocument();

    const heartIcon = screen.getByTestId("heart-icon");
    expect(heartIcon).toBeInTheDocument();

    const messageCircleIcon = screen.getByTestId("message-circle-icon");
    expect(messageCircleIcon).toBeInTheDocument();
  });

  it("should render Interests & Knowledge Areas section", () => {
    render(<AIProfilePage />);

    const interestsHeading = screen.getByRole("heading", {
      level: 2,
      name: "Interests & Knowledge Areas",
    });
    expect(interestsHeading).toBeInTheDocument();
  });

  it("should render all interest categories", () => {
    render(<AIProfilePage />);

    const technologyCategory = screen.getByText("技術分野");
    expect(technologyCategory).toBeInTheDocument();

    const creativeCategory = screen.getByText("クリエイティブ");
    expect(creativeCategory).toBeInTheDocument();

    const learningCategory = screen.getByText("学習・研究");
    expect(learningCategory).toBeInTheDocument();

    const cultureCategory = screen.getByText("文化・趣味");
    expect(cultureCategory).toBeInTheDocument();
  });

  it("should render technology interests", () => {
    render(<AIProfilePage />);

    const reactInterest = screen.getByText(
      /Web開発（React, Next.js, TypeScript）/,
    );
    expect(reactInterest).toBeInTheDocument();

    const creativeCodeInterest = screen.getByText(
      /クリエイティブコーディング（p5.js, Three.js）/,
    );
    expect(creativeCodeInterest).toBeInTheDocument();
  });

  it("should render Conversation Style section", () => {
    render(<AIProfilePage />);

    const conversationHeading = screen.getByRole("heading", {
      level: 2,
      name: "Conversation Style",
    });
    expect(conversationHeading).toBeInTheDocument();
  });

  it("should render conversation style aspects", () => {
    render(<AIProfilePage />);

    const communicationAspect = screen.getByText("コミュニケーション");
    expect(communicationAspect).toBeInTheDocument();

    const problemSolvingAspect = screen.getByText("問題解決");
    expect(problemSolvingAspect).toBeInTheDocument();

    const creativityAspect = screen.getByText("創造性");
    expect(creativityAspect).toBeInTheDocument();

    const learningSupportAspect = screen.getByText("学習支援");
    expect(learningSupportAspect).toBeInTheDocument();
  });

  it("should render AI Capabilities section", () => {
    render(<AIProfilePage />);

    const capabilitiesHeading = screen.getByRole("heading", {
      level: 2,
      name: "AI Capabilities",
    });
    expect(capabilitiesHeading).toBeInTheDocument();
  });

  it("should render all AI capability categories", () => {
    render(<AIProfilePage />);

    const technicalConsultation = screen.getByText("技術相談");
    expect(technicalConsultation).toBeInTheDocument();

    const learningSupport = screen.getByText("学習サポート");
    expect(learningSupport).toBeInTheDocument();

    const creativeSupport = screen.getByText("創作支援");
    expect(creativeSupport).toBeInTheDocument();

    const careerConsultation = screen.getByText("キャリア相談");
    expect(careerConsultation).toBeInTheDocument();
  });

  it("should render zap icons for capabilities", () => {
    render(<AIProfilePage />);

    const zapIcons = screen.getAllByTestId("zap-icon");
    expect(zapIcons.length).toBeGreaterThan(0);
  });

  it("should render Usage Guidelines section", () => {
    render(<AIProfilePage />);

    const guidelinesHeading = screen.getByRole("heading", {
      level: 2,
      name: "Usage Guidelines",
    });
    expect(guidelinesHeading).toBeInTheDocument();

    const guidelinesSubheading =
      screen.getByText("このAIプロフィールの使用について");
    expect(guidelinesSubheading).toBeInTheDocument();
  });

  it("should render usage guidelines content", () => {
    render(<AIProfilePage />);

    const chatbotUsage = screen.getByText(
      /このプロフィールは、AIチャットボットやアシスタントの性格設定として使用できます/,
    );
    expect(chatbotUsage).toBeInTheDocument();

    const supportUsage = screen.getByText(
      /技術的な質問、創作活動のサポート、学習支援などに活用してください/,
    );
    expect(supportUsage).toBeInTheDocument();
  });

  it("should render navigation CTA section", () => {
    render(<AIProfilePage />);

    const realProfileLink = screen.getByRole("link", { name: "Real Profile" });
    expect(realProfileLink).toBeInTheDocument();
    expect(realProfileLink).toHaveAttribute("href", "/about/profile/real");

    const handleProfileLink = screen.getByRole("link", {
      name: "Handle Profile",
    });
    expect(handleProfileLink).toBeInTheDocument();
    expect(handleProfileLink).toHaveAttribute("href", "/about/profile/handle");

    const contactLink = screen.getByRole("link", { name: "Contact" });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("should render footer", () => {
    render(<AIProfilePage />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();

    const copyright = screen.getByText("© 2025 samuido - AI Profile");
    expect(copyright).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<AIProfilePage />);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Profile navigation",
    });
    expect(navigation).toBeInTheDocument();
  });

  it("should render all required headings in proper hierarchy", () => {
    render(<AIProfilePage />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("AI Profile");

    const h2Elements = screen.getAllByRole("heading", { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);

    const h3Elements = screen.getAllByRole("heading", { level: 3 });
    expect(h3Elements.length).toBeGreaterThan(0);
  });

  it("should contain proper meta information in structured data", () => {
    render(<AIProfilePage />);

    const structuredDataScript = document.querySelector(
      'script[type="application/ld+json"]',
    );
    const structuredData = JSON.parse(
      structuredDataScript?.textContent || "{}",
    );

    expect(structuredData.url).toBe("https://yusuke-kim.com/about/profile/AI");
    expect(structuredData.description).toBe("AIチャット対話用プロフィール設定");
    expect(structuredData.interactionStatistic).toBeDefined();
  });

  it("should render personality trait descriptions", () => {
    render(<AIProfilePage />);

    const curiosityDescription = screen.getByText(
      /新しい技術やアイデアに対して常に興味を持ち/,
    );
    expect(curiosityDescription).toBeInTheDocument();

    const logicalDescription = screen.getByText(
      /問題を体系的に分析し、効率的な解決策を見つける/,
    );
    expect(logicalDescription).toBeInTheDocument();
  });

  it("should render personality trait examples", () => {
    render(<AIProfilePage />);

    const frameworkExample = screen.getByText(/最新のフレームワークを試す/);
    expect(frameworkExample).toBeInTheDocument();

    const optimizationExample = screen.getByText(/コードの最適化/);
    expect(optimizationExample).toBeInTheDocument();
  });

  it("should render capability topics as tags", () => {
    render(<AIProfilePage />);

    const codeReviewTopic = screen.getByText("コードレビュー");
    expect(codeReviewTopic).toBeInTheDocument();

    const learningRoadmapTopic = screen.getByText("学習ロードマップ");
    expect(learningRoadmapTopic).toBeInTheDocument();
  });

  it("should render conversation style examples as tags", () => {
    render(<AIProfilePage />);

    const technicalQuestionExample =
      screen.getByText("技術的な質問に丁寧に回答");
    expect(technicalQuestionExample).toBeInTheDocument();

    const debuggingExample = screen.getByText("デバッグの手順を整理");
    expect(debuggingExample).toBeInTheDocument();
  });
});
