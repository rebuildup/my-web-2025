import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import HandleCardPage from "../handle/page";
import RealCardPage from "../real/page";

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

// Mock QRCode library
jest.mock("qrcode", () => ({
  toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,mockqrcode"),
}));

// Mock canvas operations
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: jest.fn(() => ({
    fillStyle: "",
    fillRect: jest.fn(),
    font: "",
    fillText: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  })),
});

Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
  value: jest.fn(() => "data:image/png;base64,mockcanvas"),
});

describe("Digital Business Card Pages", () => {
  describe("Real Name Card Page", () => {
    it("renders the real name card with main elements", async () => {
      render(<RealCardPage />);

      // Check for main heading
      expect(screen.getByText("Digital Card (Real)")).toBeInTheDocument();
      expect(
        screen.getByText(/正式なビジネス用デジタル名刺/),
      ).toBeInTheDocument();

      // Check for card content
      expect(screen.getByText("木村友亮")).toBeInTheDocument();
      expect(screen.getByText("Yusuke Kimura")).toBeInTheDocument();
      expect(screen.getByText("Webデザイナー・開発者")).toBeInTheDocument();
      expect(
        screen.getByText("rebuild.up.up(at)gmail.com"),
      ).toBeInTheDocument();

      // Check for skills - using more flexible text matching
      expect(screen.getByText(/Web開発/)).toBeInTheDocument();
      expect(screen.getByText(/UI\/UXデザイン/)).toBeInTheDocument();

      // Wait for QR code to load
      await waitFor(() => {
        const qrImages = screen.getAllByAltText("連絡先QRコード");
        expect(qrImages.length).toBeGreaterThan(0);
      });
    });

    it("has proper navigation links", () => {
      render(<RealCardPage />);

      // Navigation links are available through breadcrumbs
      const profileLink = screen.getByText("Profile").closest("a");
      expect(profileLink).toHaveAttribute("href", "/about/profile/real");

      const handleCardLink = screen.getByText("Handle Card").closest("a");
      expect(handleCardLink).toHaveAttribute("href", "/about/card/handle");
    });

    it("has download functionality", () => {
      render(<RealCardPage />);

      const pngButton = screen.getByText("PNG形式でダウンロード");
      const pdfButton = screen.getByText("PDF形式でダウンロード");

      expect(pngButton).toBeInTheDocument();
      expect(pdfButton).toBeInTheDocument();

      // Test download button click (should not throw error)
      fireEvent.click(pngButton);
      fireEvent.click(pdfButton);
    });

    it("displays achievements and contact information", () => {
      render(<RealCardPage />);

      // Check for achievements
      expect(screen.getByText("主要実績")).toBeInTheDocument();
      expect(
        screen.getByText(/中国地区高専コンピュータフェスティバル2024/),
      ).toBeInTheDocument();

      // Check for contact info
      expect(screen.getByText("@361do_sleep")).toBeInTheDocument();
      expect(screen.getByText("https://yusuke-kim.com")).toBeInTheDocument();
    });
  });

  describe("Handle Name Card Page", () => {
    it("renders the handle name card with main elements", async () => {
      render(<HandleCardPage />);

      // Check for main heading
      expect(screen.getByText("Digital Card (Handle)")).toBeInTheDocument();
      expect(
        screen.getByText(/クリエイティブ活動用のカジュアル名刺/),
      ).toBeInTheDocument();

      // Check for card content
      expect(screen.getByText("samuido")).toBeInTheDocument();
      expect(
        screen.getByText("クリエイティブ・デベロッパー"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("やる気になれば何でもできる"),
      ).toBeInTheDocument();

      // Check for contact information - using more flexible text matching
      expect(
        screen.getByText(/rebuild\.up\.up.*gmail\.com/),
      ).toBeInTheDocument();
      expect(screen.getByText(/361do\.sleep.*gmail\.com/)).toBeInTheDocument();

      // Wait for QR code to load
      await waitFor(() => {
        const qrImages = screen.getAllByAltText("連絡先QRコード");
        expect(qrImages.length).toBeGreaterThan(0);
      });
    });

    it("has proper navigation links", () => {
      render(<HandleCardPage />);

      // Navigation links are available through breadcrumbs
      const profileLink = screen.getByText("Profile").closest("a");
      expect(profileLink).toHaveAttribute("href", "/about/profile/handle");

      const realCardLink = screen.getByText("Real Card").closest("a");
      expect(realCardLink).toHaveAttribute("href", "/about/card/real");
    });

    it("displays skills and personality traits", () => {
      render(<HandleCardPage />);

      // Check for skills
      expect(screen.getByText("できること")).toBeInTheDocument();
      expect(screen.getByText("できること")).toBeInTheDocument();
      // Check for skills section specifically
      const skillsSection = screen.getByText("できること").parentElement;
      expect(skillsSection).toHaveTextContent("デザイン");
      expect(skillsSection).toHaveTextContent("開発");

      // Check for personality
      expect(screen.getByText("性格")).toBeInTheDocument();
      // Use more flexible text matching for personality traits
      expect(screen.getByText(/好奇心旺盛/)).toBeInTheDocument();
      expect(screen.getByText(/完璧主義/)).toBeInTheDocument();
      expect(screen.getByText(/コーヒー好き/)).toBeInTheDocument();
    });

    it("shows current projects", () => {
      render(<HandleCardPage />);

      expect(screen.getByText("現在の取り組み")).toBeInTheDocument();
      expect(screen.getByText("個人サイトリニューアル")).toBeInTheDocument();
      expect(screen.getByText("便利ツール集開発")).toBeInTheDocument();
      expect(screen.getByText("映像作品制作")).toBeInTheDocument();
    });

    it("has download functionality", () => {
      render(<HandleCardPage />);

      const pngButton = screen.getByText("PNG形式でダウンロード");
      const pdfButton = screen.getByText("PDF形式でダウンロード");

      expect(pngButton).toBeInTheDocument();
      expect(pdfButton).toBeInTheDocument();

      // Test download button click
      fireEvent.click(pngButton);
      fireEvent.click(pdfButton);
    });

    it("displays social media information", () => {
      render(<HandleCardPage />);

      expect(screen.getByText(/@361do_sleep.*技術/)).toBeInTheDocument();
      expect(screen.getByText(/@361do_design.*デザイン/)).toBeInTheDocument();
      expect(screen.getByText("https://yusuke-kim.com")).toBeInTheDocument();
    });
  });
});
