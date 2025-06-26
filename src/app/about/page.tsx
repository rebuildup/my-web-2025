import type { Metadata } from "next";
import siteConfig from "@/../data/site-config.json";

export const metadata: Metadata = {
  title: "About | samuido",
  description: "samuidoについて",
};

export default function AboutPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#222222",
        color: "#ffffff",
        padding: "2rem",
      }}
    >
      <div className="container">
        <h1
          style={{
            color: "#ffffff",
            marginBottom: "2rem",
          }}
        >
          About
        </h1>
        <h2
          style={{
            color: "#0000ff",
            marginBottom: "1rem",
          }}
        >
          samuido
        </h2>
        <p
          style={{
            color: "#ffffff",
            fontSize: "1.125rem",
            marginBottom: "1rem",
          }}
        >
          Web開発者・デザイナー
        </p>
        <p
          style={{
            color: "#ffffff",
            opacity: 0.9,
          }}
        >
          プロフィールや経歴について
        </p>
      </div>
    </div>
  );
}
