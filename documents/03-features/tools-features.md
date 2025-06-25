# Tools カテゴリー機能仕様

## 📋 概要

Tools カテゴリーは、Web 上で動作する実用的なツール群を提供し、ユーザーの作業効率化を支援するセクションです。

## 🎯 主要ツール

### 1. 依頼費用計算機 (`/tools/estimate`)

#### 機能概要

- **プロジェクト規模算出**: 要件から工数・費用を自動計算
- **見積書生成**: PDF 形式での見積書出力
- **料金体系表示**: 透明性のある料金設定

#### データ構造

```typescript
interface ProjectEstimate {
  projectType: "website" | "webapp" | "mobile" | "system";
  complexity: "simple" | "medium" | "complex";
  features: FeatureOption[];
  timeline: "normal" | "urgent";
  maintenance: boolean;

  // 計算結果
  basePrice: number;
  featurePrice: number;
  urgencyMultiplier: number;
  maintenancePrice: number;
  totalPrice: number;
  estimatedDays: number;
}
```

### 2. QR コード生成器 (`/tools/qr-generator`)

#### 機能

- **URL・テキスト QR 化**: 任意の文字列を QR コード化
- **カスタマイズ**: 色・サイズ・エラー訂正レベル調整
- **ダウンロード**: PNG・SVG 形式での保存

### 3. カラーパレット生成器 (`/tools/color-palette`)

#### 機能

- **自動配色**: 基準色から調和色を自動生成
- **アクセシビリティチェック**: コントラスト比の確認
- **エクスポート**: CSS・JSON・Adobe Swatch 形式

## 🎨 デザイン仕様

### 統一 UI コンポーネント

```css
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.tool-form {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.tool-result {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}
```

## 🚀 実装優先度

### Phase 4 (高優先度)

- ✅ 依頼費用計算機
- ✅ QR コード生成器
- ✅ カラーパレット生成器

### Phase 6 (中優先度)

- 🔄 画像リサイズツール
- 🔄 テキスト整形ツール
- 🔄 URL 短縮サービス

---

**最終更新**: 2025-01-01
