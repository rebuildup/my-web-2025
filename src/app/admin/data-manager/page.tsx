"use client";

import { ContentItem, ContentType } from "@/types/content";
import { EnhancedContentItem } from "@/types/enhanced-content";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContentList } from "./components/ContentList";
import { DataManagerForm } from "./components/DataManagerForm";
import { PreviewPanel } from "./components/PreviewPanel";

export default function DataManagerPage() {
  const router = useRouter();

  // Check development environment on client side
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      router.push("/");
    }
  }, [router]);

  const [selectedContentType, setSelectedContentType] =
    useState<ContentType>("portfolio");
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"form" | "preview">("form");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // Load content items for selected type
  useEffect(() => {
    loadContentItems(selectedContentType);
  }, [selectedContentType]);

  const loadContentItems = async (type: ContentType) => {
    setIsLoading(true);
    try {
      console.log(`Loading content items for type: ${type}`);
      // キャッシュを回避するためにタイムスタンプを追加
      const timestamp = Date.now();
      const response = await fetch(
        `/api/content/${type}?limit=100&_t=${timestamp}&status=all`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      );
      console.log(`Response status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        console.log(`Loaded content:`, result);
        // APIは { data: ContentItem[] } の形式で返すので、dataプロパティを取得
        const items = result.data || [];
        console.log(`Setting ${items.length} items`);
        setContentItems(items);
      } else {
        console.error("Failed to load content items", response.status);
        setContentItems([]);
      }
    } catch (error) {
      console.error("Error loading content items:", error);
      setContentItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    const newItem: ContentItem = {
      id: `${selectedContentType}-${Date.now()}`,
      type: selectedContentType,
      title: "",
      description: "",
      category: "",
      tags: [],
      status: "published",
      priority: 50,
      createdAt: new Date().toISOString(),
    };
    setSelectedItem(newItem);
    setPreviewMode("form");
  };

  const handleEditItem = (item: ContentItem) => {
    setSelectedItem(item);
    setPreviewMode("form");
  };

  const handleSaveItem = async (item: ContentItem | EnhancedContentItem) => {
    setIsLoading(true);
    setSaveStatus("saving");

    try {
      console.log("=== Saving item ===");
      console.log("Item data:", JSON.stringify(item, null, 2));

      const response = await fetch(`/api/admin/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      const result = await response.json();
      console.log("Save response:", JSON.stringify(result, null, 2));

      if (response.ok) {
        console.log("Save successful!");
        setSaveStatus("success");

        // 保存されたアイテムでselectedItemを更新
        const savedItem = result.data || item;
        setSelectedItem(savedItem);

        // データを即座に再読み込み
        console.log("Reloading content items...");
        await loadContentItems(selectedContentType);

        // リストの中で更新されたアイテムを選択状態に保つ
        setSelectedItem(savedItem);

        // ポートフォリオの場合、ギャラリーページのキャッシュを無効化するためのヒント
        if (selectedContentType === "portfolio") {
          console.log(
            "Portfolio item saved - gallery cache should be invalidated",
          );

          // オプション: ギャラリーページを新しいタブで開いて確認を促す
          // window.open('/portfolio/gallery/all', '_blank');
        }

        // 成功メッセージを3秒後にリセット
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        console.error("Failed to save item:", result);
        setSaveStatus("error");
        alert(
          `Failed to save item: ${result.error || "Unknown error"}\nDetails: ${result.details || "No details"}`,
        );
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      setSaveStatus("error");
      alert(
        `Error saving item: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/content?id=${id}&type=${selectedContentType}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        await loadContentItems(selectedContentType);
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        console.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setPreviewMode("form");
  };

  // Design system classes matching admin layout
  const CardStyle = "bg-base border border-foreground p-4 space-y-4";
  const ButtonStyle =
    "border border-foreground px-4 py-2 text-sm hover:bg-foreground hover:text-background transition-colors";
  const ActiveButtonStyle =
    "border border-foreground px-4 py-2 text-sm bg-foreground text-background";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="py-10">
        <div className="container-system">
          <div className="space-y-8">
            {/* Header */}
            <header className="space-y-6">
              <h1 className="neue-haas-grotesk-display text-4xl text-primary">
                Data Manager
              </h1>
              <p className="noto-sans-jp-light text-sm max-w-2xl leading-loose">
                コンテンツデータの作成・編集・管理を行います。
                <br />
                動画、画像、埋め込み要素、Markdownファイルなどを統合管理できます。
              </p>
            </header>

            {/* Content Type Selector */}
            <section className="space-y-4">
              <h2 className="neue-haas-grotesk-display text-xl text-primary">
                Content Type
              </h2>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "portfolio",
                    "blog",
                    "plugin",
                    "download",
                    "tool",
                    "profile",
                  ] as ContentType[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedContentType(type)}
                    className={
                      selectedContentType === type
                        ? ActiveButtonStyle
                        : ButtonStyle
                    }
                    disabled={isLoading}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </section>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Content List */}
              <div className="lg:col-span-1">
                <div className={CardStyle}>
                  <div className="flex justify-between items-center">
                    <h3 className="neue-haas-grotesk-display text-lg text-primary">
                      {selectedContentType.charAt(0).toUpperCase() +
                        selectedContentType.slice(1)}{" "}
                      Items
                    </h3>
                    <button
                      onClick={handleCreateNew}
                      className={ButtonStyle}
                      disabled={isLoading}
                    >
                      + New
                    </button>
                  </div>

                  <ContentList
                    items={contentItems}
                    selectedItem={selectedItem}
                    onSelectItem={handleEditItem}
                    onDeleteItem={handleDeleteItem}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Form/Preview Area */}
              <div className="lg:col-span-2">
                {selectedItem ? (
                  <div className="space-y-4">
                    {/* Form/Preview Toggle and Status */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewMode("form")}
                          className={
                            previewMode === "form"
                              ? ActiveButtonStyle
                              : ButtonStyle
                          }
                        >
                          Edit Form
                        </button>
                        <button
                          onClick={() => setPreviewMode("preview")}
                          className={
                            previewMode === "preview"
                              ? ActiveButtonStyle
                              : ButtonStyle
                          }
                        >
                          Preview
                        </button>
                      </div>

                      {/* Save Status */}
                      {saveStatus !== "idle" && (
                        <div className="flex items-center gap-2">
                          {saveStatus === "saving" && (
                            <span className="text-blue-600 text-sm">
                              Saving...
                            </span>
                          )}
                          {saveStatus === "success" && (
                            <span className="text-green-600 text-sm">
                              ✓ Saved
                            </span>
                          )}
                          {saveStatus === "error" && (
                            <span className="text-red-600 text-sm">
                              ✗ Error
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={CardStyle}>
                      {previewMode === "form" ? (
                        <DataManagerForm
                          item={selectedItem}
                          onSave={handleSaveItem}
                          onCancel={handleCancel}
                          isLoading={isLoading}
                          saveStatus={saveStatus}
                        />
                      ) : (
                        <PreviewPanel
                          item={selectedItem}
                          onEdit={() => setPreviewMode("form")}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={CardStyle}>
                    <div className="text-center py-12">
                      <p className="noto-sans-jp-light text-sm text-gray-500">
                        Select an item to edit or create a new one
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-background border border-foreground p-6 rounded">
                  <p className="noto-sans-jp-regular text-sm">Processing...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
