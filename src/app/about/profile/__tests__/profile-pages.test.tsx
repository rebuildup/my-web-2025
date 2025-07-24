import { render, screen } from "@testing-library/react";
import RealProfilePage from "../real/page";
import HandleProfilePage from "../handle/page";
import AIProfilePage from "../AI/page";

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
      expect(screen.getByText("木村友亮")).toBeInTheDocument();
      expect(screen.getByText("Webデザイナー・開発者")).toBeInTheDocument();

      // Check for basic information
      expect(screen.getByText("平成19年10月生（17歳）")).toBeInTheDocument();
      expect(screen.getByText("現役高専生")).toBeInTheDocument();

      // Check for sections
      expect(screen.getByText("Education")).toBeInTheDocument();
      expect(screen.getByText("Awards")).toBeInTheDocument();
      expect(screen.getByText("Skills")).toBeInTheDocument();

      // Check for achievements
      expect(
        screen.getByText("中国地区高専コンピュータフェスティバル2024")
      ).toBeInTheDocument();
      expect(screen.getByText("ゲーム部門 1位")).toBeInTheDocument();
    });

    it("has proper navigation links", () => {
      render(<RealProfilePage />);

      const backLink = screen.getByText("← About に戻る").closest("a");
      expect(backLink).toHaveAttribute("href", "/about");

      const cardLink = screen.getByText("Digital Card").closest("a");
      expect(cardLink).toHaveAttribute("href", "/about/card/real");
    });

    it("displays contact information", () => {
      render(<RealProfilePage />);

      expect(
        screen.getByText(/rebuild\.up\.up.*gmail\.com/)
      ).toBeInTheDocument();
      expect(screen.getByText(/@361do_sleep/)).toBeInTheDocument();
    });
  });

  describe("Handle Profile Page", () => {
    it("renders the handle profile page with main elements", () => {
      render(<HandleProfilePage />);

      // Check for main heading
      expect(screen.getByText("samuido")).toBeInTheDocument();
      expect(
        screen.getByText("クリエイティブ・デベロッパー")
      ).toBeInTheDocument();

      // Check for personality section
      expect(screen.getByText("Personality")).toBeInTheDocument();
      expect(screen.getByText("好奇心旺盛")).toBeInTheDocument();
      expect(screen.getByText("完璧主義")).toBeInTheDocument();

      // Check for skills section
      expect(screen.getByText("Creative Skills")).toBeInTheDocument();
      expect(screen.getByText("デザイン")).toBeInTheDocument();
      expect(screen.getByText("開発")).toBeInTheDocument();

      // Check for current projects
      expect(screen.getByText("Current Projects")).toBeInTheDocument();
    });

    it("has proper navigation links", () => {
      render(<HandleProfilePage />);

      const backLink = screen.getByText("← About に戻る").closest("a");
      expect(backLink).toHaveAttribute("href", "/about");

      const cardLink = screen.getByText("Digital Card").closest("a");
      expect(cardLink).toHaveAttribute("href", "/about/card/handle");
    });

    it("displays contact information", () => {
      render(<HandleProfilePage />);

      expect(screen.getByText(/@361do_sleep.*技術系/)).toBeInTheDocument();
      expect(screen.getByText(/@361do_design.*デザイン系/)).toBeInTheDocument();
    });
  });

  describe("AI Profile Page", () => {
    it("renders the AI profile page with main elements", () => {
      render(<AIProfilePage />);

      // Check for main heading
      expect(screen.getByText("samuido AI Assistant")).toBeInTheDocument();
      expect(
        screen.getByText("あなたの創作活動をサポートするAIパートナー")
      ).toBeInTheDocument();

      // Check for AI characteristics
      expect(screen.getByText("AI Personality")).toBeInTheDocument();
      expect(screen.getByText("好奇心旺盛")).toBeInTheDocument();
      expect(screen.getByText("論理的思考")).toBeInTheDocument();

      // Check for capabilities
      expect(screen.getByText("Support Areas")).toBeInTheDocument();
      expect(screen.getByText("技術相談")).toBeInTheDocument();
      expect(screen.getByText("デザイン相談")).toBeInTheDocument();

      // Check for conversation topics
      expect(screen.getByText("Conversation Topics")).toBeInTheDocument();
      expect(screen.getByText("技術トレンド")).toBeInTheDocument();
    });

    it("has proper navigation links", () => {
      render(<AIProfilePage />);

      const backLink = screen.getByText("← About に戻る").closest("a");
      expect(backLink).toHaveAttribute("href", "/about");

      const contactLink = screen.getByText("Contact Form").closest("a");
      expect(contactLink).toHaveAttribute("href", "/contact");
    });

    it("displays usage tips", () => {
      render(<AIProfilePage />);

      expect(screen.getByText("Usage Tips")).toBeInTheDocument();
      expect(screen.getByText("具体的に質問する")).toBeInTheDocument();
      expect(screen.getByText("コードや画像を共有")).toBeInTheDocument();
    });
  });
});
