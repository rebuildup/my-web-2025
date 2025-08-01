"use client";

import { ContentItem } from "@/types/content";
import { EnhancedContentItem } from "@/types/enhanced-content";

interface ContentListProps {
  items: ContentItem[];
  selectedItem: ContentItem | EnhancedContentItem | null;
  onSelectItem: (item: ContentItem | EnhancedContentItem) => void;
  onDeleteItem: (id: string) => void;
  isLoading: boolean;
}

export function ContentList({
  items,
  selectedItem,
  onSelectItem,
  onDeleteItem,
  isLoading,
}: ContentListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-600";
      case "draft":
        return "text-yellow-600";
      case "archived":
        return "text-gray-500";
      case "scheduled":
        return "text-blue-600";
      default:
        return "text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-300 p-3 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // itemsが配列でない場合の安全性チェック
  if (!Array.isArray(items)) {
    return (
      <div className="text-center py-8">
        <p className="noto-sans-jp-light text-sm text-red-500">
          Error: Invalid data format
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="noto-sans-jp-light text-sm text-gray-500">
          No items found. Create your first item!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className={`border p-3 cursor-pointer transition-colors ${
            selectedItem?.id === item.id
              ? "border-primary bg-primary bg-opacity-10"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => onSelectItem(item)}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="noto-sans-jp-regular text-sm font-medium truncate flex-1">
              {item.title || "Untitled"}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              className="text-red-500 hover:text-red-700 text-xs ml-2"
              title="Delete item"
            >
              ×
            </button>
          </div>

          <div className="space-y-1">
            <p className="noto-sans-jp-light text-xs text-gray-600 truncate">
              {item.description || "No description"}
            </p>

            <div className="flex justify-between items-center text-xs">
              <span className={`${getStatusColor(item.status)} font-medium`}>
                {item.status}
              </span>
              <span className="text-gray-500">
                {formatDate(item.createdAt)}
              </span>
            </div>

            {item.category && (
              <div className="text-xs text-gray-500">
                Category: {item.category}
              </div>
            )}

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-200 text-gray-700 px-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
