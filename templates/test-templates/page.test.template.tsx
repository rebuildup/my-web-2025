import { createMockRouter } from "@/test-utils/mock-factories";
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import PageComponent from "../page";

// Next.js routerのモック
jest.mock("next/navigation", () => ({
  useRouter: () => createMockRouter(),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/test-page",
}));

// Next.js metadataのモック
jest.mock("../page", () => {
  const actual = jest.requireActual("../page");
  return {
    ...actual,
    metadata: {
      title: "Expected Page Title",
      description: "Expected description",
    },
  };
});

describe("PageComponent", () => {
  // メタデータテスト
  describe("Metadata", () => {
    it("should have correct page title", () => {
      render(<PageComponent />);

      // Next.js App Routerでは、metadataはコンポーネント外で定義される
      const titleElement = document.querySelector("title");
      expect(titleElement?.textContent).toBe("Expected Page Title");
    });

    it("should have proper meta tags", () => {
      render(<PageComponent />);

      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      expect(metaDescription).toHaveAttribute(
        "content",
        "Expected description",
      );

      const metaViewport = document.querySelector('meta[name="viewport"]');
      expect(metaViewport).toHaveAttribute(
        "content",
        "width=device-width, initial-scale=1",
      );
    });

    it("should have Open Graph meta tags", () => {
      render(<PageComponent />);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector(
        'meta[property="og:description"]',
      );
      const ogType = document.querySelector('meta[property="og:type"]');

      expect(ogTitle).toHaveAttribute("content", "Expected Page Title");
      expect(ogDescription).toHaveAttribute("content", "Expected description");
      expect(ogType).toHaveAttribute("content", "website");
    });

    it("should have Twitter Card meta tags", () => {
      render(<PageComponent />);

      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');

      expect(twitterCard).toHaveAttribute("content", "summary_large_image");
      expect(twitterTitle).toHaveAttribute("content", "Expected Page Title");
    });
  });

  // レンダリングテスト
  describe("Rendering", () => {
    it("should render main content", () => {
      render(<PageComponent />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByText("Page Content")).toBeInTheDocument();
    });

    it("should render navigation elements", () => {
      render(<PageComponent />);

      const navigation = screen.getByRole("navigation");
      expect(navigation).toBeInTheDocument();

      // ナビゲーションリンクの確認
      expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    });

    it("should render header and footer", () => {
      render(<PageComponent />);

      const header = screen.getByRole("banner");
      const footer = screen.getByRole("contentinfo");

      expect(header).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });

    it("should render with proper document structure", () => {
      render(<PageComponent />);

      // HTML5 semantic elements
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
  });

  // SEOテスト
  describe("SEO", () => {
    it("should have proper heading structure", () => {
      render(<PageComponent />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent("Main Page Title");

      // h1は1つだけであることを確認
      const allH1s = screen.getAllByRole("heading", { level: 1 });
      expect(allH1s).toHaveLength(1);
    });

    it("should have hierarchical heading structure", () => {
      render(<PageComponent />);

      const headings = screen.getAllByRole("heading");
      const headingLevels = headings.map((heading) =>
        parseInt(heading.tagName.charAt(1)),
      );

      // 見出しレベルが適切な階層になっていることを確認
      expect(headingLevels[0]).toBe(1); // 最初は h1

      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];

        // 見出しレベルが1つ以上飛ばないことを確認
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    it("should have structured data", () => {
      render(<PageComponent />);

      const structuredData = document.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(structuredData).toBeInTheDocument();

      if (structuredData) {
        const jsonData = JSON.parse(structuredData.textContent || "{}");
        expect(jsonData["@context"]).toBe("https://schema.org");
        expect(jsonData["@type"]).toBeDefined();
      }
    });

    it("should have canonical URL", () => {
      render(<PageComponent />);

      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink).toBeInTheDocument();
      expect(canonicalLink).toHaveAttribute("href");
    });

    it("should have proper language attributes", () => {
      render(<PageComponent />);

      const htmlElement = document.documentElement;
      expect(htmlElement).toHaveAttribute("lang");

      // 日本語サイトの場合
      expect(htmlElement.getAttribute("lang")).toBe("ja");
    });
  });

  // アクセシビリティテスト
  describe("Accessibility", () => {
    it("should have proper landmark roles", () => {
      render(<PageComponent />);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("should have skip links", () => {
      render(<PageComponent />);

      const skipLink = screen.getByText("Skip to main content");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    it("should have proper focus management", () => {
      render(<PageComponent />);

      const mainContent = screen.getByRole("main");
      expect(mainContent).toHaveAttribute("tabindex", "-1");
      expect(mainContent).toHaveAttribute("id", "main-content");
    });

    it("should have sufficient color contrast", () => {
      render(<PageComponent />);

      // 色のコントラスト比をテスト（実際の実装では色の値を確認）
      const textElements = screen.getAllByText(/./);
      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // コントラスト比の計算は複雑なので、ここでは基本的なチェックのみ
        expect(color).not.toBe(backgroundColor);
      });
    });

    it("should support keyboard navigation", () => {
      render(<PageComponent />);

      const interactiveElements = [
        ...screen.getAllByRole("link"),
        ...screen.getAllByRole("button"),
        ...screen.getAllByRole("textbox"),
      ];

      interactiveElements.forEach((element) => {
        // フォーカス可能な要素はtabindex属性を持つか、デフォルトでフォーカス可能
        const tabIndex = element.getAttribute("tabindex");
        const isFocusable =
          tabIndex !== "-1" &&
          (tabIndex !== null ||
            ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(
              element.tagName,
            ));

        expect(isFocusable).toBe(true);
      });
    });

    it("should have proper ARIA labels", () => {
      render(<PageComponent />);

      const navigation = screen.getByRole("navigation");
      expect(navigation).toHaveAttribute("aria-label", "Main navigation");

      const searchButton = screen.queryByRole("button", { name: /search/i });
      if (searchButton) {
        expect(searchButton).toHaveAttribute("aria-label");
      }
    });
  });

  // レスポンシブデザインテスト
  describe("Responsive Design", () => {
    it("should adapt to mobile viewport", () => {
      // モバイルビューポートをシミュレート
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<PageComponent />);

      // モバイル用のナビゲーションメニューが表示される
      const mobileMenu = screen.queryByRole("button", { name: /menu/i });
      expect(mobileMenu).toBeInTheDocument();
    });

    it("should adapt to tablet viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<PageComponent />);

      // タブレット用のレイアウトが適用される
      const container = screen.getByRole("main");
      // const styles = window.getComputedStyle(container);

      // CSSクラスやスタイルの確認
      expect(container).toHaveClass("tablet-layout");
    });

    it("should adapt to desktop viewport", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<PageComponent />);

      // デスクトップ用のナビゲーションが表示される
      const desktopNav = screen.getByRole("navigation");
      expect(desktopNav).toHaveClass("desktop-nav");
    });
  });

  // パフォーマンステスト
  describe("Performance", () => {
    it("should load critical resources", () => {
      render(<PageComponent />);

      // 重要なリソースがプリロードされている
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      expect(preloadLinks.length).toBeGreaterThan(0);
    });

    it("should lazy load non-critical images", () => {
      render(<PageComponent />);

      const images = screen.getAllByRole("img");
      const nonCriticalImages = images.slice(1); // 最初の画像以外

      nonCriticalImages.forEach((img) => {
        expect(img).toHaveAttribute("loading", "lazy");
      });
    });

    it("should have optimized images", () => {
      render(<PageComponent />);

      const images = screen.getAllByRole("img");

      images.forEach((img) => {
        // Next.js Image componentを使用している場合
        expect(img).toHaveAttribute("sizes");
        expect(img).toHaveAttribute("srcset");
      });
    });
  });

  // エラーハンドリングテスト
  describe("Error Handling", () => {
    it("should handle missing data gracefully", () => {
      // データが不足している状態をシミュレート
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<PageComponent data={null} />);

      // エラーが発生してもページが表示される
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByText("Content not available")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should display error boundary when component crashes", () => {
      const ThrowError = () => {
        throw new Error("Test error");
      };

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(
        <PageComponent>
          <ThrowError />
        </PageComponent>,
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  // 統合テスト
  describe("Integration", () => {
    it("should work with routing", () => {
      const mockPush = jest.fn();
      const mockRouter = createMockRouter({ push: mockPush });

      jest
        .mocked(useRouter)
        .mockReturnValue(mockRouter as ReturnType<typeof useRouter>);

      render(<PageComponent />);

      const link = screen.getByRole("link", { name: "Go to About" });
      expect(link).toHaveAttribute("href", "/about");
    });

    it("should handle search parameters", () => {
      const searchParams = new URLSearchParams("?query=test&category=blog");
      jest
        .mocked(useSearchParams)
        .mockReturnValue(searchParams as ReturnType<typeof useSearchParams>);

      render(<PageComponent />);

      expect(screen.getByText("Search: test")).toBeInTheDocument();
      expect(screen.getByText("Category: blog")).toBeInTheDocument();
    });

    it("should work with authentication state", () => {
      // 認証状態をモック
      const mockUser = { id: 1, name: "Test User", role: "user" };

      render(<PageComponent user={mockUser} />);

      expect(screen.getByText("Welcome, Test User")).toBeInTheDocument();
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });
  });
});
