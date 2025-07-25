import { render, screen } from "@testing-library/react";
import DevelopCommissionPage from "../develop/page";

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

describe("DevelopCommissionPage", () => {
  it("renders the page title and description", () => {
    render(<DevelopCommissionPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "開発依頼" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Web開発・アプリケーション開発・プラグイン開発の依頼を承ります/
      )
    ).toBeInTheDocument();
  });

  it("displays service overview sections", () => {
    render(<DevelopCommissionPage />);

    expect(screen.getByText("Web開発")).toBeInTheDocument();
    expect(screen.getByText("アプリケーション開発")).toBeInTheDocument();
    expect(screen.getAllByText("プラグイン開発")[0]).toBeInTheDocument();
    expect(screen.getByText("技術サポート")).toBeInTheDocument();
  });

  it("shows the development process steps", () => {
    render(<DevelopCommissionPage />);

    expect(screen.getByText("お問い合わせ")).toBeInTheDocument();
    expect(screen.getByText("要件確認")).toBeInTheDocument();
    expect(screen.getByText("見積もり")).toBeInTheDocument();
    expect(screen.getByText("開発開始")).toBeInTheDocument();
    expect(screen.getByText("テスト・修正")).toBeInTheDocument();
    expect(screen.getByText("納品")).toBeInTheDocument();
  });

  it("displays technical skills", () => {
    render(<DevelopCommissionPage />);

    expect(screen.getByText("フロントエンド")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("NextJS")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows contact information", () => {
    render(<DevelopCommissionPage />);

    expect(screen.getByText("rebuild.up.up(at)gmail.com")).toBeInTheDocument();
    expect(screen.getByText("@361do_sleep")).toBeInTheDocument();
    expect(screen.getByText("平日 9:00-18:00")).toBeInTheDocument();
  });

  it("includes navigation links", () => {
    render(<DevelopCommissionPage />);

    expect(
      screen.getByRole("link", { name: "← About に戻る" })
    ).toHaveAttribute("href", "/about");
    expect(
      screen.getByRole("link", { name: "お問い合わせフォーム" })
    ).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "料金計算機" })).toHaveAttribute(
      "href",
      "/about/commission/estimate"
    );
  });

  it("has proper accessibility structure", () => {
    render(<DevelopCommissionPage />);

    // Check for proper heading hierarchy
    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent("開発依頼");

    // Check for structured data script
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    expect(scripts.length).toBeGreaterThan(0);
  });
});
