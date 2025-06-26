export interface ContentItem {
  // 基本情報
  id: string;
  type: ContentType;
  title: string;
  description: string;
  slug?: string;

  // メタデータ
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  status: "draft" | "published" | "archived";

  // 分類・タグ
  category: string;
  tags: string[];

  // メディア
  featuredImage?: string;
  images?: string[];

  // コンテンツ
  content?: string;
  excerpt?: string;

  // 拡張フィールド
  metadata?: Record<string, any>;

  // SEO
  seo?: SEOData;
}

export type ContentType =
  | "portfolio"
  | "blog"
  | "plugin"
  | "tool"
  | "profile"
  | "page"
  | "project"
  | "resource";

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface DataManagementState {
  items: ContentItem[];
  categories: Category[];
  selectedType: ContentType | "all";
  selectedCategory: string | "all";
  searchQuery: string;
  editingItem: ContentItem | null;
  isEditing: boolean;
}

export interface FormField {
  id: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "multiselect"
    | "date"
    | "number"
    | "checkbox"
    | "image"
    | "url";
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface DataExport {
  version: string;
  exportDate: string;
  data: {
    items: ContentItem[];
    categories: Category[];
  };
}
