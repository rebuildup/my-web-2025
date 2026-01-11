# Design Document

## Overview

このドキュメントでは、ポートフォリオコンテンツデータ管理システムの大幅な改善のための設計を詳述します.現在の実装を基盤として、複数カテゴリー対応、Otherカテゴリー追加、タグ管理改善、日付手動設定、画像アップロード機能拡張、マークダウン外部ファイル化、そしてvideo&designページの表示問題修正を行います.

### 現在の実装状況

- ✅ 基本的なContentItem型定義 - 実装済み
- ✅ ポートフォリオデータマネージャー - 実装済み
- ✅ ファイルアップロード機能 - 実装済み
- ❌ 複数カテゴリー対応 - 未実装（単一カテゴリーのみ）
- ❌ Otherカテゴリー - 未実装
- ❌ 改善されたタグ管理 - 未実装（基本的な配列のみ）
- ❌ 日付手動設定 - 未実装（自動設定のみ）
- ❌ 変換なし画像アップロード - 未実装
- ❌ マークダウン外部ファイル管理 - 未実装
- ❌ video&designページの複数カテゴリー表示 - 部分実装

## Architecture

### システム構成

```
Enhanced Portfolio Data System
├── Data Layer
│   ├── Enhanced ContentItem (複数カテゴリー対応)
│   ├── Tag Management System (タグ一覧・作成機能)
│   ├── Date Management System (手動日付設定)
│   ├── Enhanced File Upload (変換なしオプション)
│   └── Markdown File Management (.mdファイル管理)
├── API Layer
│   ├── Enhanced Content API (複数カテゴリー対応)
│   ├── Tag Management API (タグCRUD操作)
│   ├── File Upload API (拡張オプション)
│   └── Markdown File API (ファイル読み書き)
├── UI Layer
│   ├── Enhanced Data Manager (改善されたUI)
│   ├── Multi-Category Selector (複数カテゴリー選択)
│   ├── Tag Management UI (タグ管理インターフェース)
│   ├── Date Picker Component (日付選択)
│   └── Enhanced File Upload UI (拡張アップロード)
└── Gallery Layer
    ├── Enhanced Gallery Filtering (複数カテゴリー対応)
    ├── Other Category Handling (Other専用処理)
    └── Fixed Video&Design Display (表示問題修正)
```

### データフロー

```
User Input → Enhanced Data Manager → API Layer → Enhanced Data Processing → Storage
                                         ↓
Gallery Display ← Enhanced Filtering ← Enhanced Data Retrieval ← Enhanced Data Layer
```

## Components and Interfaces

### 1. 拡張データ型定義

#### Enhanced ContentItem

```typescript
// 既存のContentItem型を拡張
interface EnhancedContentItem extends Omit<ContentItem, "category"> {
  // 複数カテゴリー対応
  categories: CategoryType[]; // 単一のcategoryから複数のcategoriesに変更

  // Otherカテゴリー対応
  isOtherCategory?: boolean; // Otherカテゴリーフラグ

  // 日付手動設定対応
  manualDate?: string; // 手動設定された日付
  useManualDate?: boolean; // 手動日付使用フラグ

  // 変換なし画像対応
  originalImages?: string[]; // 変換なしでアップロードされた画像
  processedImages?: string[]; // 処理済み画像（既存のimagesを置き換え）

  // マークダウン外部ファイル対応
  markdownPath?: string; // .mdファイルのパス
  markdownContent?: string; // キャッシュされたマークダウンコンテンツ
}

// カテゴリー型の拡張
type EnhancedCategoryType =
  | "develop"
  | "video"
  | "design"
  | "video&design"
  | "other";

// タグ管理型
interface TagInfo {
  name: string;
  count: number; // 使用回数
  createdAt: string;
  lastUsed: string;
}

interface TagManagementSystem {
  getAllTags(): Promise<TagInfo[]>;
  createTag(name: string): Promise<TagInfo>;
  updateTagUsage(name: string): Promise<void>;
  deleteTag(name: string): Promise<boolean>;
  searchTags(query: string): Promise<TagInfo[]>;
}
```

#### 日付管理システム

```typescript
interface DateManagementSystem {
  setManualDate(itemId: string, date: string): Promise<void>;
  getEffectiveDate(item: EnhancedContentItem): Date;
  validateDate(date: string): boolean;
  formatDateForDisplay(date: string): string;
  formatDateForStorage(date: Date): string;
}

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  useManualDate: boolean;
  onToggleManualDate: (use: boolean) => void;
  placeholder?: string;
}
```

### 2. 拡張ファイルアップロードシステム

#### Enhanced File Upload

```typescript
interface EnhancedFileUploadOptions extends FileProcessingOptions {
  skipProcessing?: boolean; // 変換なしオプション
  preserveOriginal?: boolean; // オリジナル保持オプション
  generateVariants?: boolean; // 複数サイズ生成オプション
  customProcessing?: {
    watermark?: boolean;
    resize?: { width: number; height: number };
    format?: "original" | "webp" | "jpeg" | "png";
  };
}

interface FileUploadResult {
  originalUrl?: string; // 変換なしファイルのURL
  processedUrl?: string; // 処理済みファイルのURL
  thumbnailUrl?: string; // サムネイルURL
  variants?: { [key: string]: string }; // 各種サイズのURL
  metadata: FileMetadata;
}

interface EnhancedFileUploadSectionProps {
  images: string[];
  originalImages?: string[];
  thumbnail?: string;
  onImagesChange: (images: string[]) => void;
  onOriginalImagesChange: (images: string[]) => void;
  onThumbnailChange: (thumbnail: string | undefined) => void;
  uploadOptions: EnhancedFileUploadOptions;
  onUploadOptionsChange: (options: EnhancedFileUploadOptions) => void;
}
```

### 3. マークダウンファイル管理システム

#### Markdown File Management

```typescript
interface MarkdownFileManager {
  createMarkdownFile(itemId: string, content: string): Promise<string>; // ファイルパスを返す
  updateMarkdownFile(filePath: string, content: string): Promise<void>;
  readMarkdownFile(filePath: string): Promise<string>;
  deleteMarkdownFile(filePath: string): Promise<void>;
  getMarkdownFilePath(itemId: string): string;
  validateMarkdownPath(path: string): boolean;
}

interface MarkdownEditorProps {
  content: string;
  filePath?: string;
  onChange: (content: string) => void;
  onSave: (content: string, filePath: string) => Promise<void>;
  preview?: boolean;
  toolbar?: boolean;
}

// マークダウンファイルの保存構造
// public/data/content/markdown/portfolio/{itemId}.md
// または
// public/data/content/markdown/portfolio/{category}/{itemId}.md
```

### 4. 拡張データマネージャーUI

#### Enhanced Data Manager Components

```typescript
interface MultiCategorySelectorProps {
  selectedCategories: EnhancedCategoryType[];
  onChange: (categories: EnhancedCategoryType[]) => void;
  availableCategories: EnhancedCategoryType[];
  maxSelections?: number;
  showOtherOption?: boolean;
}

interface TagManagementUIProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  tagManager: TagManagementSystem;
  allowNewTags?: boolean;
  maxTags?: number;
}

interface EnhancedDataManagerProps {
  item?: EnhancedContentItem;
  onSave: (item: EnhancedContentItem) => Promise<void>;
  onCancel: () => void;
  mode: "create" | "edit";
  tagManager: TagManagementSystem;
  markdownManager: MarkdownFileManager;
  dateManager: DateManagementSystem;
}
```

### 5. 拡張ギャラリーシステム

#### Enhanced Gallery Filtering

```typescript
interface EnhancedGalleryFilterProps {
  items: EnhancedContentItem[];
  targetCategories: EnhancedCategoryType[]; // 表示対象カテゴリー
  includeOther?: boolean; // Otherカテゴリーを含むか
  onFilteredItemsChange: (items: EnhancedContentItem[]) => void;
}

interface VideoDesignGalleryProps {
  items: EnhancedContentItem[];
  showVideoItems?: boolean; // videoカテゴリーを表示
  showDesignItems?: boolean; // designカテゴリーを表示
  showVideoDesignItems?: boolean; // video&designカテゴリーを表示
  deduplication?: boolean; // 重複除去
}
```

## Data Models

### 1. データ変換・移行戦略

#### Backward Compatibility Handler

```typescript
interface DataMigrationHandler {
  migrateContentItem(oldItem: ContentItem): EnhancedContentItem;
  validateMigratedData(item: EnhancedContentItem): ValidationResult;
  createBackup(items: ContentItem[]): Promise<string>; // バックアップファイルパス
  rollbackMigration(backupPath: string): Promise<void>;
}

class ContentItemMigrator implements DataMigrationHandler {
  migrateContentItem(oldItem: ContentItem): EnhancedContentItem {
    return {
      ...oldItem,
      // 単一カテゴリーを配列に変換
      categories: [oldItem.category as EnhancedCategoryType],

      // Otherカテゴリーの判定
      isOtherCategory: oldItem.category === "other",

      // 日付設定（既存の日付を手動日付として設定）
      manualDate: oldItem.createdAt,
      useManualDate: false, // デフォルトは自動

      // 画像の分類（既存は処理済みとして扱う）
      processedImages: oldItem.images || [],
      originalImages: [],

      // マークダウンの処理
      markdownPath: oldItem.content
        ? this.createMarkdownFile(oldItem.id, oldItem.content)
        : undefined,
      markdownContent: oldItem.content,
    };
  }

  private createMarkdownFile(itemId: string, content: string): string {
    // マークダウンファイルを作成し、パスを返す
    const filePath = `public/data/content/markdown/portfolio/${itemId}.md`;
    // ファイル作成処理...
    return filePath;
  }
}
```

### 2. 拡張データ処理パイプライン

#### Enhanced Data Processor

```typescript
class EnhancedPortfolioDataProcessor extends PortfolioDataProcessor {
  async processRawData(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<EnhancedContentItem[]> {
    const migrator = new ContentItemMigrator();

    // データ移行処理
    const migratedData = rawData.map((item) => {
      if (this.isEnhancedContentItem(item)) {
        return item as EnhancedContentItem;
      } else {
        return migrator.migrateContentItem(item as ContentItem);
      }
    });

    // 拡張処理
    const processedData = await Promise.all(
      migratedData.map((item) => this.processEnhancedItem(item)),
    );

    return processedData;
  }

  private async processEnhancedItem(
    item: EnhancedContentItem,
  ): Promise<EnhancedContentItem> {
    // マークダウンコンテンツの読み込み
    if (item.markdownPath && !item.markdownContent) {
      try {
        item.markdownContent = await this.markdownManager.readMarkdownFile(
          item.markdownPath,
        );
      } catch (error) {
        console.warn(`Failed to load markdown for ${item.id}:`, error);
      }
    }

    // 有効日付の計算
    const effectiveDate = this.dateManager.getEffectiveDate(item);

    // タグ使用回数の更新
    await Promise.all(
      item.tags.map((tag) => this.tagManager.updateTagUsage(tag)),
    );

    return {
      ...item,
      // 計算された値を追加
      effectiveDate: effectiveDate.toISOString(),
    };
  }

  private isEnhancedContentItem(item: any): boolean {
    return "categories" in item && Array.isArray(item.categories);
  }
}
```

### 3. ギャラリーフィルタリング拡張

#### Enhanced Gallery Filtering Logic

```typescript
class EnhancedGalleryFilter {
  filterItemsForGallery(
    items: EnhancedContentItem[],
    galleryType:
      | "all"
      | "develop"
      | "video"
      | "design"
      | "video&design"
      | "other",
  ): EnhancedContentItem[] {
    switch (galleryType) {
      case "all":
        // 全てのアイテムを表示（Otherも含む）
        return items.filter((item) => item.status === "published");

      case "other":
        // Otherカテゴリーのみ
        return items.filter(
          (item) =>
            item.status === "published" &&
            (item.isOtherCategory || item.categories.includes("other")),
        );

      case "video&design":
        // video、design、video&designカテゴリーを含むアイテム
        // Otherは除外
        return items.filter(
          (item) =>
            item.status === "published" &&
            !item.isOtherCategory &&
            (item.categories.includes("video") ||
              item.categories.includes("design") ||
              item.categories.includes("video&design")),
        );

      default:
        // 特定カテゴリー（develop、video、design）
        // Otherは除外
        return items.filter(
          (item) =>
            item.status === "published" &&
            !item.isOtherCategory &&
            item.categories.includes(galleryType),
        );
    }
  }

  // 重複除去（複数カテゴリーを持つアイテム用）
  deduplicateItems(items: EnhancedContentItem[]): EnhancedContentItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
  }
}
```

## Error Handling

### エラー処理戦略

#### 1. データ移行エラー

```typescript
interface MigrationError {
  type: "validation" | "file_creation" | "data_corruption";
  itemId: string;
  message: string;
  originalData: any;
  suggestedFix?: string;
}

class MigrationErrorHandler {
  handleMigrationError(error: MigrationError): void {
    // エラーログ記録
    console.error(`Migration error for item ${error.itemId}:`, error);

    // エラー種別に応じた処理
    switch (error.type) {
      case "validation":
        this.handleValidationError(error);
        break;
      case "file_creation":
        this.handleFileCreationError(error);
        break;
      case "data_corruption":
        this.handleDataCorruptionError(error);
        break;
    }
  }

  private handleValidationError(error: MigrationError): void {
    // バリデーションエラーの場合、デフォルト値で補完
    // ユーザーに警告表示
  }

  private handleFileCreationError(error: MigrationError): void {
    // ファイル作成エラーの場合、インラインコンテンツとして保持
    // 後でリトライ可能にする
  }

  private handleDataCorruptionError(error: MigrationError): void {
    // データ破損の場合、バックアップから復旧
    // 手動確認が必要な場合は管理者に通知
  }
}
```

#### 2. ファイル操作エラー

```typescript
interface FileOperationError {
  operation: "upload" | "read" | "write" | "delete";
  filePath: string;
  error: Error;
  retryable: boolean;
}

class FileOperationErrorHandler {
  async handleFileError(error: FileOperationError): Promise<void> {
    if (error.retryable) {
      // リトライ可能なエラーの場合
      await this.retryOperation(error);
    } else {
      // リトライ不可能なエラーの場合
      await this.fallbackOperation(error);
    }
  }

  private async retryOperation(error: FileOperationError): Promise<void> {
    // 指数バックオフでリトライ
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.executeOperation(error.operation, error.filePath);
        return;
      } catch (retryError) {
        if (i === maxRetries - 1) {
          throw retryError;
        }
        await this.delay(Math.pow(2, i) * 1000);
      }
    }
  }

  private async fallbackOperation(error: FileOperationError): Promise<void> {
    // フォールバック処理
    switch (error.operation) {
      case "upload":
        // アップロード失敗時は一時的にURLを保存
        break;
      case "read":
        // 読み込み失敗時はキャッシュまたはデフォルト値を使用
        break;
      case "write":
        // 書き込み失敗時は次回保存時にリトライ
        break;
      case "delete":
        // 削除失敗時は削除予定リストに追加
        break;
    }
  }
}
```

## Testing Strategy

### テスト戦略

#### 1. データ移行テスト

```typescript
describe("Data Migration", () => {
  describe("ContentItem Migration", () => {
    it("should migrate single category to multiple categories", () => {
      const oldItem: ContentItem = {
        id: "test-1",
        category: "develop",
        // ... other fields
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.categories).toEqual(["develop"]);
      expect(migrated.isOtherCategory).toBe(false);
    });

    it("should handle Other category migration", () => {
      const oldItem: ContentItem = {
        id: "test-2",
        category: "other",
        // ... other fields
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.categories).toEqual(["other"]);
      expect(migrated.isOtherCategory).toBe(true);
    });

    it("should create markdown files for existing content", async () => {
      const oldItem: ContentItem = {
        id: "test-3",
        content: "# Test Content\n\nThis is test content.",
        // ... other fields
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.markdownPath).toBeDefined();
      expect(migrated.markdownContent).toBe(oldItem.content);

      // ファイルが実際に作成されているかチェック
      const fileExists = await fs
        .access(migrated.markdownPath!)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);
    });
  });

  describe("Backward Compatibility", () => {
    it("should handle mixed old and new data formats", async () => {
      const mixedData = [
        { id: "1", category: "develop" } as ContentItem, // 旧形式
        { id: "2", categories: ["video", "design"] } as EnhancedContentItem, // 新形式
      ];

      const processed = await processor.processRawData(mixedData);

      expect(processed).toHaveLength(2);
      expect(processed[0].categories).toEqual(["develop"]);
      expect(processed[1].categories).toEqual(["video", "design"]);
    });
  });
});
```

#### 2. ギャラリーフィルタリングテスト

```typescript
describe("Enhanced Gallery Filtering", () => {
  const testItems: EnhancedContentItem[] = [
    {
      id: "1",
      categories: ["develop"],
      status: "published",
      isOtherCategory: false,
    },
    {
      id: "2",
      categories: ["video", "design"],
      status: "published",
      isOtherCategory: false,
    },
    {
      id: "3",
      categories: ["other"],
      status: "published",
      isOtherCategory: true,
    },
  ] as EnhancedContentItem[];

  it("should filter items for video&design gallery correctly", () => {
    const filtered = galleryFilter.filterItemsForGallery(
      testItems,
      "video&design",
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });

  it("should include Other category only in all gallery", () => {
    const allFiltered = galleryFilter.filterItemsForGallery(testItems, "all");
    const developFiltered = galleryFilter.filterItemsForGallery(
      testItems,
      "develop",
    );

    expect(allFiltered).toHaveLength(3);
    expect(developFiltered).toHaveLength(1);
    expect(
      developFiltered.find((item) => item.isOtherCategory),
    ).toBeUndefined();
  });

  it("should deduplicate items with multiple categories", () => {
    const duplicatedItems = [
      { id: "1", categories: ["video"] },
      { id: "1", categories: ["design"] }, // 同じIDの重複
    ] as EnhancedContentItem[];

    const deduplicated = galleryFilter.deduplicateItems(duplicatedItems);

    expect(deduplicated).toHaveLength(1);
  });
});
```

#### 3. ファイル操作テスト

```typescript
describe("Enhanced File Operations", () => {
  describe("Markdown File Management", () => {
    it("should create markdown file for new content", async () => {
      const content = "# Test\n\nContent";
      const filePath = await markdownManager.createMarkdownFile(
        "test-item",
        content,
      );

      expect(filePath).toMatch(/\.md$/);

      const readContent = await markdownManager.readMarkdownFile(filePath);
      expect(readContent).toBe(content);
    });

    it("should handle file creation errors gracefully", async () => {
      // ファイルシステムエラーをシミュレート
      jest
        .spyOn(fs, "writeFile")
        .mockRejectedValueOnce(new Error("Permission denied"));

      await expect(
        markdownManager.createMarkdownFile("test-item", "content"),
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("Enhanced File Upload", () => {
    it("should upload files without processing when skipProcessing is true", async () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const options: EnhancedFileUploadOptions = {
        skipProcessing: true,
        preserveOriginal: true,
      };

      const result = await fileUploader.uploadFile(file, options);

      expect(result.originalUrl).toBeDefined();
      expect(result.processedUrl).toBeUndefined();
    });
  });
});
```

## Performance Optimization

### パフォーマンス最適化戦略

#### 1. データ読み込み最適化

```typescript
class EnhancedDataCache {
  private markdownCache = new Map<
    string,
    { content: string; lastModified: number }
  >();
  private tagCache = new Map<string, TagInfo[]>();

  async getMarkdownContent(filePath: string): Promise<string> {
    const cached = this.markdownCache.get(filePath);
    const fileStats = await fs.stat(filePath);

    if (cached && cached.lastModified >= fileStats.mtimeMs) {
      return cached.content;
    }

    const content = await fs.readFile(filePath, "utf-8");
    this.markdownCache.set(filePath, {
      content,
      lastModified: fileStats.mtimeMs,
    });

    return content;
  }

  async getTagsWithCache(): Promise<TagInfo[]> {
    const cacheKey = "all-tags";
    const cached = this.tagCache.get(cacheKey);

    if (cached && this.isCacheValid(cacheKey)) {
      return cached;
    }

    const tags = await this.tagManager.getAllTags();
    this.tagCache.set(cacheKey, tags);

    return tags;
  }
}
```

#### 2. ファイル操作最適化

```typescript
class OptimizedFileManager {
  private uploadQueue = new Map<string, Promise<FileUploadResult>>();

  async uploadFileWithDeduplication(
    file: File,
    options: EnhancedFileUploadOptions,
  ): Promise<FileUploadResult> {
    // ファイルハッシュによる重複チェック
    const fileHash = await this.calculateFileHash(file);

    // 既に同じファイルがアップロード中の場合は待機
    if (this.uploadQueue.has(fileHash)) {
      return await this.uploadQueue.get(fileHash)!;
    }

    // アップロード処理を開始
    const uploadPromise = this.performUpload(file, options);
    this.uploadQueue.set(fileHash, uploadPromise);

    try {
      const result = await uploadPromise;
      return result;
    } finally {
      this.uploadQueue.delete(fileHash);
    }
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
}
```

## Security Considerations

### セキュリティ対策

#### 1. ファイルアップロードセキュリティ

```typescript
class SecureFileUploader {
  private readonly ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/markdown",
  ];

  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  validateFile(file: File): ValidationResult {
    // MIMEタイプチェック
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: "Invalid file type" };
    }

    // ファイルサイズチェック
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: "File too large" };
    }

    // ファイル名サニタイゼーション
    const sanitizedName = this.sanitizeFileName(file.name);
    if (sanitizedName !== file.name) {
      return { valid: false, error: "Invalid file name" };
    }

    return { valid: true };
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_{2,}/g, "_")
      .substring(0, 255);
  }
}
```

#### 2. マークダウンコンテンツセキュリティ

```typescript
class SecureMarkdownProcessor {
  private readonly ALLOWED_TAGS = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "strong",
    "em",
    "u",
    "del",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ];

  sanitizeMarkdown(content: string): string {
    // DOMPurifyを使用してHTMLサニタイゼーション
    const cleanHtml = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: this.ALLOWED_TAGS,
      ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
    });

    return cleanHtml;
  }

  validateMarkdownPath(path: string): boolean {
    // パストラバーサル攻撃防止
    const normalizedPath = path.normalize();
    const allowedBasePath = "public/data/content/markdown/";

    return (
      normalizedPath.startsWith(allowedBasePath) &&
      !normalizedPath.includes("..") &&
      normalizedPath.endsWith(".md")
    );
  }
}
```

## Implementation Phases

### 実装フェーズ

#### Phase 1: データ構造拡張

1. EnhancedContentItem型定義
2. データ移行システム実装
3. 後方互換性確保

#### Phase 2: UI拡張

1. 複数カテゴリー選択UI
2. タグ管理UI
3. 日付選択UI
4. 拡張ファイルアップロードUI

#### Phase 3: ファイル管理システム

1. マークダウンファイル管理
2. 変換なしファイルアップロード
3. ファイル操作API拡張

#### Phase 4: ギャラリー表示修正

1. video&designページ修正
2. フィルタリングロジック拡張
3. Otherカテゴリー対応

#### Phase 5: テスト・最適化

1. 包括的テスト実装
2. パフォーマンス最適化
3. セキュリティ強化

各フェーズは独立して実装可能で、段階的にリリースできる設計となっています.
