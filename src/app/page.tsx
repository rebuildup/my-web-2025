import Link from "next/link";
import siteConfig from "@/../data/site-config.json";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#222222",
        color: "#ffffff",
        padding: "2rem",
      }}
    >
      <div
        className="container"
        style={{ textAlign: "center", paddingTop: "4rem" }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "1rem",
            color: "#ffffff",
          }}
        >
          samuido
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            marginBottom: "3rem",
            color: "#ffffff",
            opacity: 0.9,
          }}
        >
          Web開発者・デザイナーのポートフォリオサイト
        </p>
        <nav
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/about"
            style={{
              color: "#0000ff",
              fontSize: "1.125rem",
              padding: "0.75rem 1.5rem",
              border: "2px solid #0000ff",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
          >
            About
          </Link>
          <Link
            href="/portfolio"
            style={{
              color: "#0000ff",
              fontSize: "1.125rem",
              padding: "0.75rem 1.5rem",
              border: "2px solid #0000ff",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
          >
            Portfolio
          </Link>
          <Link
            href="/tools"
            style={{
              color: "#0000ff",
              fontSize: "1.125rem",
              padding: "0.75rem 1.5rem",
              border: "2px solid #0000ff",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
          >
            Tools
          </Link>
          <Link
            href="/workshop"
            style={{
              color: "#0000ff",
              fontSize: "1.125rem",
              padding: "0.75rem 1.5rem",
              border: "2px solid #0000ff",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
          >
            Workshop
          </Link>
          <Link
            href="/contact"
            style={{
              color: "#0000ff",
              fontSize: "1.125rem",
              padding: "0.75rem 1.5rem",
              border: "2px solid #0000ff",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
          >
            Contact
          </Link>
        </nav>
      </div>
    </div>
  );
}
