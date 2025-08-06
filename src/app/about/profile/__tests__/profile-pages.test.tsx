import { render, screen } from "@testing-library/react";
import AIProfilePage from "../AI/page";
import HandleProfilePage from "../handle/page";
import RealProfilePage from "../real/page";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe("Profile Pages", () => {
  describe("Real Profile Page", () => {
    it("renders the real profile page with main elements", () => {
      render(<RealProfilePage />);

      // Check for main heading
      expect(screen.getByText("Real Profile")).toBeInTheDocument();
      expect(
        screen.getByText("木村友亮（きむら ゆうすけ）"),
      ).toBeInTheDocument();

      // Check for basic information
      expect(screen.getByText("2007年10月生まれ（17歳）")).toBeInTheDocument();
      expect(screen.getByText("高等専門学校在学中")).toBeInTheDocument();

      // Check for sections
      expect(screen.getByText("学歴")).toBeInTheDocument();
      expect(screen.getByText("受賞歴・実績")).toBeInTheDocument();
      expect(screen.getByText("技術スキル")).toBeInTheDocument();

      // Check for achievements
      expect(
        screen.getByText("中国地区高専コンピュータフェスティバル2024"),
      ).toBeInTheDocument();
      expect(screen.getByText("ゲーム部門 1位")).toBeInTheDocument();
    });

    it("has proper navigation links", () => {
      render(<RealProfilePage />);

      // Navigation links are available through breadcrumbs
      const cardLink = screen.getByText("Digital Card").closest("a");
      expect(cardLink).toHaveAttribute("href", "/about/card/real");
    });

    it("displays contact information", () => {
      render(<RealProfilePage />);

      // Check for social media links in the structured data or contact section
      expect(screen.getByText("Contact")).toBeInTheDocument();
    });
  });

  describe("Handle Profile Page", () => {
    it("renders the handle profile page with main elements", () => {
      render(<HandleProfilePage />);

      // Check for main heading
      expect(screen.getByText("Handle Profile")).toBeInTheDocument();
      expect(
        screen.getByText(
          /ハンドルネーム「samuido」としてのクリエイティブ活動について/,
        ),
      ).toBeInTheDocument();

      // Check for about section
      expect(screen.getByText("About samuido")).toBeInTheDocument();
      expect(screen.getByText("Creative Areas")).toBeInTheDocument();
      expect(screen.getByText("Creative Philosophy")).toBeInTheDocument();

      // Check for current focus
      expect(screen.getByText("Current Focus")).toBeInTheDocument();
    });

    it("has proper navigation links", () => {
      render(<HandleProfilePage />);

      // Navigation links are available through breadcrumbs
      const realProfileLink = screen.getByText("Real Profile").closest("a");
      expect(realProfileLink).toHaveAttribute("href", "/about/profile/real");
    });

    it("displays contact information", () => {
      render(<HandleProfilePage />);

      expect(screen.getByText("Twitter: @361do_sleep")).toBeInTheDocument();
      expect(screen.getByText("Twitter: @361do_design")).toBeInTheDocument();
    });
  });

  describe("AI Profile Page", () => {
    it("renders the AI profile page with main elements", () => {
      render(<AIProfilePage />);

      // Check for main heading
      expect(screen.getByText("AI Profile")).toBeInTheDocument();
      expect(screen.getByText("samuido AI Assistant")).toBeInTheDocument();
      expect(
        screen.getByText("技術とクリエイティビティの融合を目指すAIペルソナ"),
      ).toBeInTheDocument();

      // Check for AI characteristics
      expect(screen.getByText("Personality Traits")).toBeInTheDocument();
      expect(screen.getByText("好奇心旺盛")).toBeInTheDocument();
      expect(screen.getByText("論理的思考")).toBeInTheDocument();

      // Check for capabilities
      expect(screen.getByText("AI Capabilities")).toBeInTheDocument();
      expect(screen.getByText("技術相談")).toBeInTheDocument();
      expect(screen.getByText("学習サポート")).toBeInTheDocument();

      // Check for conversation style
      expect(screen.getByText("Conversation Style")).toBeInTheDocument();
      expect(screen.getByText("コミュニケーション")).toBeInTheDocument();
    });

    it("has proper navigation links", () => {
      render(<AIProfilePage />);

      // Navigation links are available through breadcrumbs
      const contactLink = screen.getByText("Contact").closest("a");
      expect(contactLink).toHaveAttribute("href", "/contact");
    });

    it("displays usage tips", () => {
      render(<AIProfilePage />);

      expect(screen.getByText("Usage Guidelines")).toBeInTheDocument();
      expect(
        screen.getByText("このAIプロフィールの使用について"),
      ).toBeInTheDocument();
    });
  });
});
