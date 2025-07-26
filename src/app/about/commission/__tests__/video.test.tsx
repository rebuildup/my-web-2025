import { render, screen } from "@testing-library/react";
import VideoCommissionPage from "../video/page";

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

describe("VideoCommissionPage", () => {
  it("renders the page title and description", () => {
    render(<VideoCommissionPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "映像依頼" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /MV制作・アニメーション・プロモーション映像の制作を承ります/,
      ),
    ).toBeInTheDocument();
  });

  it("displays video service types", () => {
    render(<VideoCommissionPage />);

    expect(screen.getByText("MV制作")).toBeInTheDocument();
    expect(screen.getByText("リリックモーション")).toBeInTheDocument();
    expect(screen.getByText("イラストアニメーション")).toBeInTheDocument();
    expect(screen.getByText("プロモーション映像")).toBeInTheDocument();
  });

  it("shows the video production process", () => {
    render(<VideoCommissionPage />);

    expect(screen.getByText("お問い合わせ")).toBeInTheDocument();
    expect(screen.getByText("要件確認")).toBeInTheDocument();
    expect(screen.getByText("見積もり")).toBeInTheDocument();
    expect(screen.getByText("制作開始")).toBeInTheDocument();
    expect(screen.getByText("レビュー・修正")).toBeInTheDocument();
    expect(screen.getByText("納品")).toBeInTheDocument();
  });

  it("displays pricing information", () => {
    render(<VideoCommissionPage />);

    expect(screen.getByText("歌ってみたMV制作")).toBeInTheDocument();
    expect(screen.getByText("5,000円〜")).toBeInTheDocument();
    expect(screen.getByText("オリジナルMV制作")).toBeInTheDocument();
    expect(screen.getByText("6,000円〜")).toBeInTheDocument();
  });

  it("shows software and tools used", () => {
    render(<VideoCommissionPage />);

    expect(screen.getByText("AfterEffects")).toBeInTheDocument();
    expect(screen.getByText("Premiere Pro")).toBeInTheDocument();
    expect(screen.getByText("Blender")).toBeInTheDocument();
    expect(screen.getByText("Photoshop")).toBeInTheDocument();
  });

  it("displays estimate requirements", () => {
    render(<VideoCommissionPage />);

    expect(screen.getByText("見積もりに必要な情報")).toBeInTheDocument();
    expect(
      screen.getByText(/何を作るか.*歌ってみたのMV制作など/),
    ).toBeInTheDocument();
    expect(screen.getByText(/納期.*目安は1ヶ月です/)).toBeInTheDocument();
  });

  it("shows contact information", () => {
    render(<VideoCommissionPage />);

    expect(screen.getByText("361do.sleep(at)gmail.com")).toBeInTheDocument();
    expect(screen.getByText("@361do_design")).toBeInTheDocument();
    expect(screen.getByText("平日 9:00-18:00")).toBeInTheDocument();
  });

  it("includes navigation links", () => {
    render(<VideoCommissionPage />);

    expect(
      screen.getByRole("link", { name: "← About に戻る" }),
    ).toHaveAttribute("href", "/about");
    expect(
      screen.getByRole("link", { name: "お問い合わせフォーム" }),
    ).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "料金計算機" })).toHaveAttribute(
      "href",
      "/about/commission/estimate",
    );
  });

  it("displays warning notices", () => {
    render(<VideoCommissionPage />);

    expect(
      screen.getByText(
        /このページに記載した料金設定.*今後変更される可能性が高いです/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/通話などでのミーティングの対応は致しかねます/),
    ).toBeInTheDocument();
  });

  it("has proper accessibility structure", () => {
    render(<VideoCommissionPage />);

    // Check for proper heading hierarchy
    const headings = screen.getAllByRole("heading");
    expect(headings[0]).toHaveTextContent("映像依頼");

    // Check for structured data script
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    expect(scripts.length).toBeGreaterThan(0);
  });
});
