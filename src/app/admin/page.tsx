"use client";

import { useState, useEffect } from "react";
import {
  ContentItem,
  ContentType,
  Category,
  DataManagementState,
} from "@/types/data-management";

export default function AdminPage() {
  const [state, setState] = useState<DataManagementState>({
    items: [],
    categories: [],
    selectedType: "all",
    selectedCategory: "all",
    searchQuery: "",
    editingItem: null,
    isEditing: false,
  });

  // サンプルデータ
  useEffect(() => {
    const sampleCategories: Category[] = [
      {
        id: "web-dev",
        name: "Web開発",
        description: "Webサイト・アプリケーション開発",
        color: "#3b82f6",
      },
      {
        id: "ui-design",
        name: "UIデザイン",
        description: "ユーザーインターフェースデザイン",
        color: "#8b5cf6",
      },
      {
        id: "tools",
        name: "ツール",
        description: "開発・業務効率化ツール",
        color: "#10b981",
      },
      {
        id: "blog",
        name: "ブログ",
        description: "技術記事・知見共有",
        color: "#f59e0b",
      },
    ];

    const sampleItems: ContentItem[] = [
      {
        id: "1",
        type: "portfolio",
        title: "個人ポートフォリオサイト",
        description: "Next.js + TailwindCSSで構築したレスポンシブサイト",
        category: "web-dev",
        tags: ["Next.js", "TailwindCSS", "TypeScript"],
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "blog",
        title: "React Hooksの実践的な使い方",
        description: "useStateからuseContextまで、実例で学ぶReact Hooks",
        category: "blog",
        tags: ["React", "JavaScript", "フロントエンド"],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setState((prev) => ({
      ...prev,
      categories: sampleCategories,
      items: sampleItems,
    }));
  }, []);

  const addNewItem = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      type: "blog",
      title: "新しいアイテム",
      description: "",
      category: state.categories[0]?.id || "",
      tags: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      editingItem: newItem,
      isEditing: true,
    }));
  };

  const saveItem = (item: ContentItem) => {
    setState((prev) => {
      const existingIndex = prev.items.findIndex((i) => i.id === item.id);
      const updatedItem = { ...item, updatedAt: new Date().toISOString() };

      let newItems;
      if (existingIndex >= 0) {
        newItems = [...prev.items];
        newItems[existingIndex] = updatedItem;
      } else {
        newItems = [...prev.items, updatedItem];
      }

      return {
        ...prev,
        items: newItems,
        editingItem: null,
        isEditing: false,
      };
    });
  };

  const deleteItem = (id: string) => {
    if (confirm("このアイテムを削除しますか？")) {
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const editItem = (item: ContentItem) => {
    setState((prev) => ({
      ...prev,
      editingItem: { ...item },
      isEditing: true,
    }));
  };

  const filteredItems = state.items.filter((item) => {
    const typeMatch =
      state.selectedType === "all" || item.type === state.selectedType;
    const categoryMatch =
      state.selectedCategory === "all" ||
      item.category === state.selectedCategory;
    const searchMatch =
      state.searchQuery === "" ||
      item.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(state.searchQuery.toLowerCase());

    return typeMatch && categoryMatch && searchMatch;
  });

  const exportData = () => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      data: {
        items: state.items,
        categories: state.categories,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const contentTypes: ContentType[] = [
    "portfolio",
    "blog",
    "plugin",
    "tool",
    "profile",
    "page",
    "project",
    "resource",
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}
        >
          データ管理システム
        </h1>
        <p style={{ marginBottom: "1.5rem" }}>
          コンテンツの作成、編集、管理を行います
        </p>

        {/* コントロールパネル */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            onClick={addNewItem}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "var(--accent-color)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            + 新規作成
          </button>

          <button
            onClick={exportData}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            エクスポート
          </button>

          {/* 検索 */}
          <input
            type="text"
            placeholder="タイトル・説明で検索..."
            value={state.searchQuery}
            onChange={(e) =>
              setState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            style={{
              padding: "0.5rem",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "var(--text-color)",
              minWidth: "200px",
            }}
          />

          {/* タイプフィルター */}
          <select
            value={state.selectedType}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                selectedType: e.target.value as ContentType | "all",
              }))
            }
            style={{
              padding: "0.5rem",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "var(--text-color)",
            }}
          >
            <option value="all">すべてのタイプ</option>
            {contentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* カテゴリフィルター */}
          <select
            value={state.selectedCategory}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                selectedCategory: e.target.value,
              }))
            }
            style={{
              padding: "0.5rem",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "var(--text-color)",
            }}
          >
            <option value="all">すべてのカテゴリ</option>
            {state.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 統計 */}
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
            <h3>総アイテム数</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {state.items.length}
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
              {state.items.filter((item) => item.status === "published").length}
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            <h3>下書き</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {state.items.filter((item) => item.status === "draft").length}
            </p>
          </div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          >
            <h3>フィルター結果</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {filteredItems.length}
            </p>
          </div>
        </div>
      </div>

      {/* アイテムリスト */}
      <div style={{ display: "grid", gap: "1rem" }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "1.5rem",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ marginBottom: "0.5rem", opacity: 0.8 }}>
                  {item.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.875rem",
                    opacity: 0.7,
                  }}
                >
                  <span>タイプ: {item.type}</span>
                  <span>
                    カテゴリ:{" "}
                    {state.categories.find((c) => c.id === item.category)
                      ?.name || item.category}
                  </span>
                  <span>ステータス: {item.status}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => editItem(item)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  編集
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  削除
                </button>
              </div>
            </div>

            {item.tags.length > 0 && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "rgba(59, 130, 246, 0.3)",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {state.isEditing && state.editingItem && (
        <EditModal
          item={state.editingItem}
          categories={state.categories}
          onSave={saveItem}
          onCancel={() =>
            setState((prev) => ({
              ...prev,
              isEditing: false,
              editingItem: null,
            }))
          }
          onUpdate={(item) =>
            setState((prev) => ({ ...prev, editingItem: item }))
          }
        />
      )}
    </div>
  );
}

interface EditModalProps {
  item: ContentItem;
  categories: Category[];
  onSave: (item: ContentItem) => void;
  onCancel: () => void;
  onUpdate: (item: ContentItem) => void;
}

function EditModal({
  item,
  categories,
  onSave,
  onCancel,
  onUpdate,
}: EditModalProps) {
  const contentTypes: ContentType[] = [
    "portfolio",
    "blog",
    "plugin",
    "tool",
    "profile",
    "page",
    "project",
    "resource",
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--background-color)",
          padding: "2rem",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <h2
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          アイテム編集
        </h2>

        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              タイトル *
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "var(--text-color)",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              説明
            </label>
            <textarea
              value={item.description}
              onChange={(e) =>
                onUpdate({ ...item, description: e.target.value })
              }
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "var(--text-color)",
                resize: "vertical",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                タイプ
              </label>
              <select
                value={item.type}
                onChange={(e) =>
                  onUpdate({ ...item, type: e.target.value as ContentType })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "var(--text-color)",
                }}
              >
                {contentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                カテゴリ
              </label>
              <select
                value={item.category}
                onChange={(e) =>
                  onUpdate({ ...item, category: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "var(--text-color)",
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={item.tags.join(", ")}
              onChange={(e) =>
                onUpdate({
                  ...item,
                  tags: e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                })
              }
              placeholder="React, TypeScript, Web開発"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "var(--text-color)",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              ステータス
            </label>
            <select
              value={item.status}
              onChange={(e) =>
                onUpdate({
                  ...item,
                  status: e.target.value as "draft" | "published" | "archived",
                })
              }
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "var(--text-color)",
              }}
            >
              <option value="draft">下書き</option>
              <option value="published">公開</option>
              <option value="archived">アーカイブ</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
              }}
            >
              コンテンツ（Markdown）
            </label>
            <textarea
              value={item.content || ""}
              onChange={(e) => onUpdate({ ...item, content: e.target.value })}
              rows={8}
              placeholder="Markdownでコンテンツを記述..."
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "var(--text-color)",
                resize: "vertical",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
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
            onClick={() => onSave(item)}
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
    </div>
  );
}
