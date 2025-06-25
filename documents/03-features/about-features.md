# About カテゴリー機能仕様

## 📋 概要

About カテゴリーは、samuido（木村友亮）の個人情報、スキル、経歴を体系的に紹介するセクションです。

## 🎯 主要機能

### 1. プロフィールページ (`/about/profile`)

#### 基本情報

```typescript
interface ProfileData {
  personalInfo: {
    name: string; // samuido
    handleName: string; // samuido
    title: string; // フロントエンドエンジニア
    location: string; // 東京, 日本
    avatar: string; // プロフィール画像
    bio: string; // 自己紹介文
  };

  contact: {
    email: string;
    website: string;
    github: string;
    twitter: string;
    linkedin?: string;
  };

  skills: {
    frontend: string[]; // HTML, CSS, JavaScript, TypeScript, React, Next.js
    backend: string[]; // Node.js, Python, PHP
    tools: string[]; // Git, Docker, Figma, Photoshop
    languages: string[]; // 日本語, 英語
  };

  experience: ExperienceItem[];
  education: EducationItem[];
}
```

#### デザイン仕様

- **レイアウト**: 左右分割（PC）、縦積み（モバイル）
- **アニメーション**: スクロール連動のフェードイン
- **カラーテーマ**: プライマリーブルー (#2563eb) をアクセント
- **タイポグラフィ**: 見出しは Geist Sans、本文は system-ui

### 2. デジタル名刺 (`/about/card`)

#### 機能仕様

```typescript
interface DigitalCard {
  design: "business" | "casual" | "creative";
  content: {
    name: string;
    title: string;
    company?: string;
    contact: ContactInfo;
    qrCode: string; // サイト URL の QR コード
    avatar: string;
  };

  features: {
    printOptimized: boolean; // 印刷対応 CSS
    downloadable: boolean; // PNG/PDF ダウンロード
    shareable: boolean; // SNS シェア機能
  };
}
```

#### 表示パターン

1. **ビジネス版**: シンプル、モノクロ基調
2. **カジュアル版**: カラフル、アイコン多用
3. **クリエイティブ版**: グラデーション、アニメーション

### 3. リンクマップ (`/about/links`)

#### リンク分類

```typescript
interface LinkCategory {
  category: "social" | "professional" | "creative" | "other";
  title: string;
  description?: string;
  links: LinkItem[];
}

interface LinkItem {
  name: string;
  url: string;
  icon: string; // アイコンファイル名
  description?: string;
  isPrimary?: boolean; // 主要リンク
}
```

#### 表示内容

- **Social**: X(Twitter), GitHub, note, Zenn
- **Professional**: LinkedIn, Wantedly, Portfolio
- **Creative**: Booth, pixiv, DeviantArt
- **Other**: Blog, YouTube, Podcast

## 🎨 UI/UX 仕様

### レスポンシブ対応

```css
/* モバイル (320px-768px) */
.about-container {
  padding: 1rem;
  flex-direction: column;
}

/* タブレット (768px-1024px) */
.about-container {
  padding: 2rem;
  flex-direction: row;
  flex-wrap: wrap;
}

/* デスクトップ (1024px+) */
.about-container {
  padding: 3rem;
  flex-direction: row;
  max-width: 1200px;
  margin: 0 auto;
}
```

### アクセシビリティ

- **ARIA ラベル**: 全ての対話要素に適切な ARIA 属性
- **キーボードナビゲーション**: Tab キーで全要素にアクセス可能
- **スクリーンリーダー**: セマンティックな HTML 構造
- **カラーコントラスト**: WCAG 2.1 AA レベル準拠

## 📊 データ管理

### JSON データ構造

```json
{
  "profile": {
    "personal": { ... },
    "professional": { ... },
    "skills": { ... }
  },

  "socialLinks": [
    {
      "category": "social",
      "name": "GitHub",
      "url": "https://github.com/samuido",
      "icon": "github.svg",
      "primary": true
    }
  ],

  "experience": [
    {
      "company": "会社名",
      "position": "職位",
      "period": "2020-2024",
      "description": "業務内容"
    }
  ]
}
```

### データファイル場所

- `/data/profile.json`: プロフィール基本情報
- `/data/social-links.json`: SNS・外部リンク
- `/data/experience.json`: 経歴・実績

## 🚀 実装優先度

### 高優先度 (Phase 2)

- ✅ プロフィールページ基本版
- ✅ デジタル名刺
- ✅ リンクマップ

### 中優先度 (Phase 4)

- 🔄 詳細経歴ページ
- 🔄 スキルチャート可視化
- 🔄 実績タイムライン

### 低優先度 (Phase 6+)

- ⏳ インタラクティブ履歴書
- ⏳ 3D プロフィール表示
- ⏳ 多言語対応

## 📈 成功指標

### ユーザビリティ

- **ページ滞在時間**: 平均 2 分以上
- **バウンス率**: 30% 以下
- **モバイル体験**: Core Web Vitals すべて Good

### エンゲージメント

- **名刺ダウンロード数**: 月 10 件以上
- **SNS リンククリック**: 月 50 クリック以上
- **お問い合わせ転換**: 月 2 件以上

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [プロジェクト概要](../01-project-overview/basic-info.md)
- [データ構造](../02-architecture/data-structure.md)
- [開発フェーズ](../04-development/phase-planning.md)
