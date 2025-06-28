import blogData from "@/../data/blog.json";
import type { Metadata } from "next";
import { BlogPost } from "@/types/content";

export const metadata: Metadata = {
  title: "Workshop | samuido",
  description: "samuidoのワークショップ・技術記事",
};

export default function WorkshopPage() {
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
          Workshop
        </h1>
        <p
          style={{
            color: "#ffffff",
            fontSize: "1.125rem",
            marginBottom: "2rem",
            opacity: 0.9,
          }}
        >
          Web開発に関する技術情報やチュートリアル
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {blogData.items.map((post: BlogPost) => (
            <article
              key={post.id}
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
                {post.title}
              </h3>
              <p
                style={{
                  color: "#ffffff",
                  marginBottom: "1rem",
                  opacity: 0.9,
                }}
              >
                {post.excerpt}
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {post.tags.map((tag: string) => (
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
                {new Date(post.publishedAt).toLocaleDateString("ja-JP")}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}