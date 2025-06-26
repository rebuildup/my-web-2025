import portfolioData from "@/../data/portfolio.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio | samuido",
  description: "samuidoのポートフォリオ・作品集",
};

export default function PortfolioPage() {
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
          Portfolio
        </h1>
        <p
          style={{
            color: "#ffffff",
            fontSize: "1.125rem",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          Web開発・デザイン・ツール制作のプロジェクト事例
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {portfolioData.projects.map((item: any) => (
            <div
              key={item.id}
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "1.5rem",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <h3
                style={{
                  color: "#0000ff",
                  marginBottom: "0.75rem",
                  fontSize: "1.25rem",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  color: "#ffffff",
                  marginBottom: "1rem",
                  opacity: 0.9,
                }}
              >
                {item.description}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {item.tags.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "rgba(0,0,255,0.2)",
                      color: "#ffffff",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  opacity: 0.7,
                }}
              >
                {item.projectPeriod}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
