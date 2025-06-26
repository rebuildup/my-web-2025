import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | samuido",
  description: "samuidoが制作した実用ツール集",
};

export default function ToolsPage() {
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
            marginBottom: "1rem",
          }}
        >
          Tools
        </h1>
        <p
          style={{
            color: "#ffffff",
            fontSize: "1.125rem",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          Web上で利用できる実用的なツール集
        </p>
        <ul
          style={{
            display: "grid",
            gap: "1rem",
            listStyle: "none",
          }}
        >
          <li>
            <a
              href="/tools/estimate"
              style={{
                display: "block",
                color: "#0000ff",
                fontSize: "1.125rem",
                padding: "1rem",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: "rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              見積り計算機
            </a>
          </li>
          <li>
            <a
              href="/tools/qr-generator"
              style={{
                display: "block",
                color: "#0000ff",
                fontSize: "1.125rem",
                padding: "1rem",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: "rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              QRコード生成
            </a>
          </li>
          <li>
            <a
              href="/tools/color-palette"
              style={{
                display: "block",
                color: "#0000ff",
                fontSize: "1.125rem",
                padding: "1rem",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                textDecoration: "none",
                backgroundColor: "rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              カラーパレット
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
