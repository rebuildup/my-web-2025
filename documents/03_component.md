# コンポーネント方針 (Components)

## アーキテクチャ方針

このプロジェクトは **ページごとに独立したサイト** として動作する構造を採用しています。ただし、共通データ構造とユーティリティ関数は共有します。

### 基本方針

- **ページ単位での独立性**: 各ページは独立したサイトとして機能し、他のページへの依存を最小限に抑えます
- **共通データ構造の共有**: 型定義、データ構造、ユーティリティ関数は共有します
- **ページ固有の実装**: 各ページに必要な機能やUIは、そのページ専用として実装します
- **拡張性の確保**: ページ単位でのサイト拡張が容易な構造を維持します

### 実装方針

#### 1. コンポーネント設計

- **ページ固有コンポーネント**: 各ページは `src/app/[page]/components/` 内に独自のコンポーネントを配置
- **共通ユーティリティ**: データ処理、バリデーション、API通信などの共通ロジックは `src/lib/` で共有
- **型定義の共有**: TypeScript型定義は `src/types/` で共通化
- **コードの重複**: UIコンポーネントは各ページで独立実装、ロジックは共通化

#### 2. ユーティリティ関数

- **共通ユーティリティ**: `src/lib/utils/` で基本的なユーティリティ関数を共通化
- **ページ固有ユーティリティ**: 各ページ固有の処理は、そのページ内で実装
- **データ処理**: 検索、統計、バリデーションなどの共通ロジックは共有

#### 3. スタイリング

- **Tailwind CSS**: 全ページで共通のTailwind設定を使用
- **ページ固有スタイル**: 必要に応じて各ページで独自のCSSを追加
- **デザインシステム**: カラー、フォント、スペーシングは共通設定

### 禁止事項

- **共通UIコンポーネント**: Button、Card、Modal等の共通UIコンポーネントは作成しない
- **レイアウトコンポーネント**: Header、Footer、Sidebar等の共通レイアウトは使用しない
- **グローバル状態管理**: Redux、Zustand等のグローバル状態管理は使用しない

### 推奨事項

- **データ構造の共有**: ContentItem、SiteConfig等の型定義は共有
- **API通信の共通化**: 検索、統計更新等のAPI通信ロジックは共有
- **ユーティリティ関数**: 日付処理、文字列処理、画像最適化等は共有
- **バリデーション**: フォームバリデーション、ファイル検証等は共有

## 具体的な実装例

### 1. ページ固有コンポーネント

```typescript
// src/app/portfolio/components/PortfolioGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { ContentItem } from '@/types/content';
import { searchContent } from '@/lib/search';
import { updateViewStats } from '@/lib/stats';

interface PortfolioGalleryProps {
  category?: string;
  initialItems?: ContentItem[];
}

export default function PortfolioGallery({ category, initialItems }: PortfolioGalleryProps) {
  const [items, setItems] = useState<ContentItem[]>(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState(category || 'all');

  useEffect(() => {
    loadPortfolioItems(filter);
  }, [filter]);

  const loadPortfolioItems = async (categoryFilter: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/portfolio?category=${categoryFilter}`);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Failed to load portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: ContentItem) => {
    // 閲覧統計更新
    await updateViewStats(item.id);

    // 詳細ページへ遷移
    window.open(`/portfolio/detail/${item.id}`, '_blank');
  };

  return (
    <div className="portfolio-gallery">
      <div className="filter-controls">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'develop' ? 'active' : ''}
          onClick={() => setFilter('develop')}
        >
          Develop
        </button>
        <button
          className={filter === 'video' ? 'active' : ''}
          onClick={() => setFilter('video')}
        >
          Video
        </button>
        <button
          className={filter === 'video&design' ? 'active' : ''}
          onClick={() => setFilter('video&design')}
        >
          Video & Design
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="gallery-grid">
          {items.map((item) => (
            <div
              key={item.id}
              className="portfolio-item"
              onClick={() => handleItemClick(item)}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="item-thumbnail"
                />
              )}
              <div className="item-info">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="item-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. 共通ユーティリティの使用

```typescript
// src/app/tools/components/ColorPalette.tsx
'use client';

import { useState, useEffect } from 'react';
import { generateRandomColors } from '@/lib/utils/color';
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/utils/storage';
import { optimizeImage } from '@/lib/utils/performance';

interface ColorPaletteProps {
  initialColors?: string[];
}

export default function ColorPalette({ initialColors }: ColorPaletteProps) {
  const [colors, setColors] = useState<string[]>(initialColors || []);
  const [savedPalettes, setSavedPalettes] = useState<string[][]>([]);

  useEffect(() => {
    // 保存されたパレットを読み込み
    const saved = loadFromLocalStorage('color-palettes');
    if (saved) {
      setSavedPalettes(saved);
    }
  }, []);

  const generateNewPalette = () => {
    const newColors = generateRandomColors(5);
    setColors(newColors);
  };

  const savePalette = () => {
    const newSavedPalettes = [...savedPalettes, colors];
    setSavedPalettes(newSavedPalettes);
    saveToLocalStorage('color-palettes', newSavedPalettes);
  };

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      // 成功通知
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  };

  return (
    <div className="color-palette">
      <div className="palette-controls">
        <button onClick={generateNewPalette}>Generate New Palette</button>
        <button onClick={savePalette}>Save Palette</button>
      </div>

      <div className="color-swatches">
        {colors.map((color, index) => (
          <div
            key={index}
            className="color-swatch"
            style={{ backgroundColor: color }}
            onClick={() => copyColor(color)}
          >
            <span className="color-value">{color}</span>
          </div>
        ))}
      </div>

      {savedPalettes.length > 0 && (
        <div className="saved-palettes">
          <h3>Saved Palettes</h3>
          {savedPalettes.map((palette, index) => (
            <div key={index} className="saved-palette">
              {palette.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="saved-color"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. 共通データ構造の使用

```typescript
// src/app/workshop/components/BlogList.tsx
'use client';

import { useState, useEffect } from 'react';
import { ContentItem } from '@/types/content';
import { searchContent } from '@/lib/search';
import { formatDate } from '@/lib/utils/date';

interface BlogListProps {
  category?: string;
  limit?: number;
}

export default function BlogList({ category, limit = 10 }: BlogListProps) {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, [category]);

  const loadBlogPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/blog?limit=${limit}${category ? `&category=${category}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blog-list">
      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="blog-post">
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="post-thumbnail"
                />
              )}
              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <div className="post-meta">
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <a href={`/workshop/blog/${post.id}`} className="read-more">
                  Read More
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
```

## ディレクトリ構造

```
src/
├── app/
│   ├── about/
│   │   ├── components/
│   │   │   ├── ProfileCard.tsx
│   │   │   └── SkillList.tsx
│   │   └── page.tsx
│   ├── portfolio/
│   │   ├── components/
│   │   │   ├── PortfolioGallery.tsx
│   │   │   └── PortfolioDetail.tsx
│   │   └── page.tsx
│   ├── tools/
│   │   ├── components/
│   │   │   ├── ColorPalette.tsx
│   │   │   └── QrGenerator.tsx
│   │   └── page.tsx
│   └── workshop/
│       ├── components/
│       │   ├── BlogList.tsx
│       │   └── PluginList.tsx
│       └── page.tsx
├── lib/
│   ├── search/
│   ├── stats/
│   └── utils/
├── types/
│   └── content.ts
└── components/
    └── (共通ユーティリティのみ)
```

---

> **重要**: この方針により、各ページは独立したサイトとして機能しつつ、共通データ構造とユーティリティを効率的に共有できます。
