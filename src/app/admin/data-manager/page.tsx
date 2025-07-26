"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentItem, ContentType } from "@/types/content";
import { DataManagerForm } from "./components/DataManagerForm";
import { ContentList } from "./components/ContentList";
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
  const [, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"form" | "preview">("form");

  // Load content items for selected type
  useEffect(() => {
    loadContentItems(selectedContentType);
  }, [selectedContentType]);

  const loadContentItems = async (type: ContentType) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/content/${type}`);
      if (response.ok) {
        const data = await response.json();
        setContentItems(data);
      } else {
        console.error("Failed to load content items");
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
      status: "draft",
      priority: 50,
      createdAt: new Date().toISOString(),
    };
    setSelectedItem(newItem);
    setIsEditing(true);
    setPreviewMode("form");
  };

  const handleEditItem = (item: ContentItem) => {
    setSelectedItem(item);
    setIsEditing(true);
    setPreviewMode("form");
  };

  const handleSaveItem = async (item: ContentItem) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        await loadContentItems(selectedContentType);
        setIsEditing(false);
        setSelectedItem(null);
      } else {
        console.error("Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
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
        }
      );

      if (response.ok) {
        await loadContentItems(selectedContentType);
        if (selectedItem?.id === id) {
          setSelectedItem(null);
          setIsEditing(false);
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
    setIsEditing(false);
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
                    {/* Form/Preview Toggle */}
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

                    {/* Content */}
                    <div className={CardStyle}>
                      {previewMode === "form" ? (
                        <DataManagerForm
                          item={selectedItem}
                          onSave={handleSaveItem}
                          onCancel={handleCancel}
                          isLoading={isLoading}
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
