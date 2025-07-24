import { render, screen } from "@testing-library/react";
import PrivacyPolicy from "../page";

describe("Privacy Policy Page", () => {
  it("renders the privacy policy page", () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(
      screen.getByText(/samuidoのプライバシーポリシー/)
    ).toBeInTheDocument();
  });

  it("renders all main sections", () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText("基本方針")).toBeInTheDocument();
    expect(screen.getByText("収集する情報")).toBeInTheDocument();
    expect(screen.getByText("利用目的")).toBeInTheDocument();
    expect(screen.getByText("Cookieの使用")).toBeInTheDocument();
    expect(screen.getByText("第三者への提供")).toBeInTheDocument();
    expect(screen.getByText("安全管理措置")).toBeInTheDocument();
    expect(screen.getByText("お問い合わせ")).toBeInTheDocument();
  });

  it("displays contact information", () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText("361do.sleep(at)gmail.com")).toBeInTheDocument();
    expect(screen.getByText("平日 9:00-18:00")).toBeInTheDocument();
    expect(screen.getByText("24時間以内（営業日）")).toBeInTheDocument();
  });

  it("includes back to home link", () => {
    render(<PrivacyPolicy />);

    const homeLink = screen.getByText("← ホームに戻る");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("displays last updated date and version", () => {
    render(<PrivacyPolicy />);

    expect(screen.getByText(/最終更新日:/)).toBeInTheDocument();
    expect(screen.getByText(/バージョン:/)).toBeInTheDocument();
  });
});
