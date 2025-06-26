"use client";

import { useState, useEffect } from "react";

export default function DataManagementPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [blogData, setBlogData] = useState<any>(null);
  const [siteConfigData, setSiteConfigData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<
    "portfolio" | "blog" | "site-config"
  >("portfolio");
  const [editingData, setEditingData] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<string>("");

  // 既存のJSONファイルをロード
  useEffect(() => {
    loadStaticData();
  }, []);

  const loadStaticData = async () => {
    try {
      const portfolioModule = await import("@/../data/portfolio.json");
      const blogModule = await import("@/../data/blog.json");
      const siteConfigModule = await import("@/../data/site-config.json");

      setPortfolioData(portfolioModule.default);
      setBlogData(blogModule.default);
      setSiteConfigData(siteConfigModule.default);
    } catch (error) {
      console.error("静的ファイルの読み込みに失敗しました:", error);
    }
  };

  const getCurrentData = () => {
    switch (selectedFile) {
      case "portfolio":
        return portfolioData;
      case "blog":
        return blogData;
      case "site-config":
        return siteConfigData;
      default:
        return null;
    }
  };

  const startEditing = () => {
    const currentData = getCurrentData();
    if (currentData) {
      setEditingData(JSON.stringify(currentData, null, 2));
      setIsEditing(true);
    }
  };

  const saveData = () => {
    try {
      const parsedData = JSON.parse(editingData);

      switch (selectedFile) {
        case "portfolio":
          setPortfolioData(parsedData);
          break;
        case "blog":
          setBlogData(parsedData);
          break;
        case "site-config":
          setSiteConfigData(parsedData);
          break;
      }

      setIsEditing(false);
      setMessage(`${selectedFile}.jsonを更新しました（メモリ内のみ）`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("JSONの構文エラーです。確認してください。");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const exportData = () => {
    const currentData = getCurrentData();
    if (currentData) {
      const blob = new Blob([JSON.stringify(currentData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedFile}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportAllData = () => {
    const allData = {
      portfolio: portfolioData,
      blog: blogData,
      siteConfig: siteConfigData,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all-data-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addNewItem = () => {
    const currentData = getCurrentData();
    if (!currentData) return;

    let newItem: any;

    if (selectedFile === "portfolio") {
      newItem = {
        id: `item-${Date.now()}`,
        title: "新しいプロジェクト",
        description: "",
        category: "web-development",
        tags: [],
        featuredImage: "",
        client: "",
        projectPeriod: new Date().toISOString().split("T")[0],
        technologies: [],
        status: "draft",
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedData = {
        ...currentData,
        projects: [...(currentData.projects || []), newItem],
      };
      setPortfolioData(updatedData);
    } else if (selectedFile === "blog") {
      newItem = {
        id: `post-${Date.now()}`,
        type: "blog",
        title: "新しい記事",
        description: "",
        slug: `new-post-${Date.now()}`,
        category: "blog",
        tags: [],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        content: "",
      };

      const updatedData = {
        ...currentData,
        items: [...(currentData.items || []), newItem],
      };
      setBlogData(updatedData);
    }

    setMessage("新しいアイテムを追加しました");
    setTimeout(() => setMessage(""), 3000);
  };

  const currentData = getCurrentData();
  const dataStats = currentData
    ? {
        totalItems:
          selectedFile === "portfolio"
            ? currentData.projects?.length || 0
            : selectedFile === "blog"
            ? currentData.items?.length || 0
            : Object.keys(currentData).length,
        publishedItems:
          selectedFile === "portfolio"
            ? currentData.projects?.filter((p: any) => p.status === "published")
                .length || 0
            : selectedFile === "blog"
            ? currentData.items?.filter((i: any) => i.status === "published")
                .length || 0
            : 0,
      }
    : { totalItems: 0, publishedItems: 0 };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
        >
          データ管理システム
        </h1>
        <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>
          既存のJSONファイルを読み込み、編集、エクスポートできます
        </p>

        {message && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: message.includes("エラー")
                ? "#ef4444"
                : "#10b981",
              color: "white",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            {message}
          </div>
        )}

        {/* ファイル選択とコントロール */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["portfolio", "blog", "site-config"].map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file as any)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    selectedFile === file
                      ? "var(--accent-color)"
                      : "rgba(255,255,255,0.1)",
                  color: selectedFile === file ? "white" : "var(--text-color)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {file}.json
              </button>
            ))}
          </div>

          <button
            onClick={startEditing}
            disabled={!currentData}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentData ? "pointer" : "not-allowed",
              opacity: currentData ? 1 : 0.5,
            }}
          >
            JSONを編集
          </button>

          <button
            onClick={addNewItem}
            disabled={!currentData || selectedFile === "site-config"}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                currentData && selectedFile !== "site-config"
                  ? "pointer"
                  : "not-allowed",
              opacity: currentData && selectedFile !== "site-config" ? 1 : 0.5,
            }}
          >
            + アイテム追加
          </button>

          <button
            onClick={exportData}
            disabled={!currentData}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: currentData ? "pointer" : "not-allowed",
              opacity: currentData ? 1 : 0.5,
            }}
          >
            エクスポート
          </button>

          <button
            onClick={exportAllData}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            全データエクスポート
          </button>
        </div>

        {/* 統計情報 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            <h3>選択ファイル</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {selectedFile}.json
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            <h3>総アイテム数</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {dataStats.totalItems}
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            <h3>公開済み</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {dataStats.publishedItems}
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            <h3>ファイルサイズ</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {currentData
                ? Math.round(JSON.stringify(currentData).length / 1024)
                : 0}
              KB
            </p>
          </div>
        </div>
      </div>

      {/* JSON編集エリア */}
      {isEditing && (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
              JSON編集 - {selectedFile}.json
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "var(--text-color)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={saveData}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                保存
              </button>
            </div>
          </div>

          <textarea
            value={editingData}
            onChange={(e) => setEditingData(e.target.value)}
            style={{
              width: "100%",
              height: "500px",
              padding: "1rem",
              backgroundColor: "rgba(0,0,0,0.3)",
              color: "var(--text-color)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              resize: "vertical",
            }}
            placeholder="JSONデータを編集..."
          />

          <p
            style={{ marginTop: "0.5rem", fontSize: "0.875rem", opacity: 0.7 }}
          >
            ⚠️ JSON構文に注意してください。無効なJSONは保存できません。
          </p>
        </div>
      )}

      {/* データプレビューとアイテム一覧 */}
      {currentData && !isEditing && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* プレビュー */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                marginBottom: "1rem",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              データプレビュー
            </h2>
            <pre
              style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: "1rem",
                borderRadius: "4px",
                overflow: "auto",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono)",
                maxHeight: "400px",
                whiteSpace: "pre-wrap",
              }}
            >
              {JSON.stringify(currentData, null, 2).slice(0, 2000)}
              {JSON.stringify(currentData, null, 2).length > 2000 &&
                "\\n\\n... (省略)"}
            </pre>
          </div>

          {/* アイテム一覧 */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                marginBottom: "1rem",
                fontSize: "1.125rem",
                fontWeight: "bold",
              }}
            >
              {selectedFile === "portfolio" && "プロジェクト一覧"}
              {selectedFile === "blog" && "ブログ記事一覧"}
              {selectedFile === "site-config" && "設定項目"}
            </h3>
            <div
              style={{
                display: "grid",
                gap: "0.5rem",
                maxHeight: "400px",
                overflow: "auto",
              }}
            >
              {selectedFile === "portfolio" &&
                currentData.projects &&
                currentData.projects.map((project: any) => (
                  <div
                    key={project.id}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{project.title}</div>
                    <div style={{ opacity: 0.7 }}>
                      {project.category} • {project.status}
                    </div>
                  </div>
                ))}

              {selectedFile === "blog" &&
                currentData.items &&
                currentData.items.map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{item.title}</div>
                    <div style={{ opacity: 0.7 }}>
                      {item.category} • {item.status}
                    </div>
                  </div>
                ))}

              {selectedFile === "site-config" &&
                Object.entries(currentData).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{key}</div>
                    <div style={{ opacity: 0.7 }}>
                      {typeof value === "object"
                        ? JSON.stringify(value).slice(0, 50) + "..."
                        : String(value)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
