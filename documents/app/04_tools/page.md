# Toolsトップページ (/tools)

## 目的

実用的なWebツールのコレクションを提供し、ユーザーの作業効率向上を支援する。

## 主な要素

- ヒーローヘッダー (Tools概要)
- ツール一覧カード (各ツールへの導線)
- 人気ツールのハイライト
- 統計情報 (利用回数、人気ランキングなど)

## ツール仕様

### ae-expression

- **エクスプレッション一覧**: AfterEffects公式・有名サイトからネット検索で自動取得・更新可能な設計
- **UI**: Scratch風ブロックUIでパラメータ編集
- **用途例**: ループ、イージング、ランダム、物理演算、テキストアニメーション等
- **拡張性**: 新しいエクスプレッションをdata-managerから追加可能

### business-mail-block

- **用途**: 依頼メール、問い合わせメール、謝罪メール、納品連絡、見積もり依頼など
- **テンプレート**: ネット上のビジネスメール例文を調査し、カテゴリごとに複数用意
- **UI**: Scratch風ブロックで件名・宛名・本文・署名を組み合わせ
- **拡張性**: テンプレートの追加・編集・削除が可能

### 料金計算機

#### 基本料金体系

**開発依頼**

- 基本料金: 50,000円
- 期間延長: 1ヶ月超ごとに10,000円〜30,000円上乗せ
- 維持管理: 非対応

**映像制作**

- 1分以下: 5,000円
- 1分超2分未満: 10,000円
- 2分超4分未満: 20,000円
- 4分超: 1分ごとに10,000円加算

**イラスト追加料金**

- なし: +0円
- 半身背景なし: +2,000円
- 半身背景あり: +4,000円
- 全身背景なし: +5,000円
- 全身背景あり: +4,000円
- 体一部背景なし: +6,000円
- 体一部背景あり: +5,000円
- イラスト発注込: +20,000円
- 4K解像度: +10,000円

#### 計算ロジック

```typescript
// lib/utils/price-calculator.ts
export interface PriceCalculation {
  basePrice: number;
  durationPrice: number;
  illustrationPrice: number;
  resolutionPrice: number;
  totalPrice: number;
  breakdown: string[];
}

export const calculatePrice = (options: {
  type: 'development' | 'video';
  duration?: number; // 分単位
  illustration?:
    | 'none'
    | 'half_no_bg'
    | 'half_with_bg'
    | 'full_no_bg'
    | 'full_with_bg'
    | 'partial_no_bg'
    | 'partial_with_bg'
    | 'outsourced';
  resolution?: 'hd' | '4k';
  months?: number; // 開発期間（月）
}): PriceCalculation => {
  let basePrice = 0;
  let durationPrice = 0;
  let illustrationPrice = 0;
  let resolutionPrice = 0;
  const breakdown: string[] = [];

  if (options.type === 'development') {
    basePrice = 50000;
    breakdown.push('開発基本料金: 50,000円');

    if (options.months && options.months > 1) {
      const extraMonths = options.months - 1;
      const extraPrice = extraMonths * 20000; // 平均20,000円
      durationPrice = extraPrice;
      breakdown.push(`期間延長料金 (${extraMonths}ヶ月): ${extraPrice.toLocaleString()}円`);
    }
  } else if (options.type === 'video') {
    if (!options.duration) {
      throw new Error('動画の長さを指定してください');
    }

    if (options.duration <= 1) {
      basePrice = 5000;
      breakdown.push('動画制作料金 (1分以下): 5,000円');
    } else if (options.duration <= 2) {
      basePrice = 10000;
      breakdown.push('動画制作料金 (1-2分): 10,000円');
    } else if (options.duration <= 4) {
      basePrice = 20000;
      breakdown.push('動画制作料金 (2-4分): 20,000円');
    } else {
      basePrice = 20000;
      const extraMinutes = options.duration - 4;
      const extraPrice = extraMinutes * 10000;
      durationPrice = extraPrice;
      breakdown.push(
        `動画制作料金 (4分超): 20,000円 + ${extraMinutes}分 × 10,000円 = ${extraPrice.toLocaleString()}円`
      );
    }
  }

  // イラスト追加料金
  if (options.illustration && options.illustration !== 'none') {
    const illustrationPrices = {
      half_no_bg: 2000,
      half_with_bg: 4000,
      full_no_bg: 5000,
      full_with_bg: 4000,
      partial_no_bg: 6000,
      partial_with_bg: 5000,
      outsourced: 20000,
    };
    illustrationPrice = illustrationPrices[options.illustration];
    breakdown.push(`イラスト追加料金: ${illustrationPrice.toLocaleString()}円`);
  }

  // 4K解像度追加料金
  if (options.resolution === '4k') {
    resolutionPrice = 10000;
    breakdown.push('4K解像度追加料金: 10,000円');
  }

  const totalPrice = basePrice + durationPrice + illustrationPrice + resolutionPrice;

  return {
    basePrice,
    durationPrice,
    illustrationPrice,
    resolutionPrice,
    totalPrice,
    breakdown,
  };
};
```

#### UI仕様

```typescript
// src/app/tools/components/PriceCalculator.tsx
'use client';

import { useState } from 'react';
import { calculatePrice, PriceCalculation } from '@/lib/utils/price-calculator';

export default function PriceCalculator() {
  const [type, setType] = useState<'development' | 'video'>('development');
  const [duration, setDuration] = useState<number>(1);
  const [illustration, setIllustration] = useState<'none' | 'half_no_bg' | 'half_with_bg' | 'full_no_bg' | 'full_with_bg' | 'partial_no_bg' | 'partial_with_bg' | 'outsourced'>('none');
  const [resolution, setResolution] = useState<'hd' | '4k'>('hd');
  const [months, setMonths] = useState<number>(1);
  const [calculation, setCalculation] = useState<PriceCalculation | null>(null);

  const handleCalculate = () => {
    try {
      const result = calculatePrice({
        type,
        duration: type === 'video' ? duration : undefined,
        illustration: type === 'video' ? illustration : undefined,
        resolution: type === 'video' ? resolution : undefined,
        months: type === 'development' ? months : undefined
      });
      setCalculation(result);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  return (
    <div className="price-calculator">
      <h2>料金計算機</h2>

      <div className="calculator-form">
        <div className="form-group">
          <label>依頼タイプ</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'development' | 'video')}>
            <option value="development">開発依頼</option>
            <option value="video">映像制作</option>
          </select>
        </div>

        {type === 'development' && (
          <div className="form-group">
            <label>開発期間 (月)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
            />
          </div>
        )}

        {type === 'video' && (
          <>
            <div className="form-group">
              <label>動画の長さ (分)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>イラスト追加</label>
              <select value={illustration} onChange={(e) => setIllustration(e.target.value as any)}>
                <option value="none">なし</option>
                <option value="half_no_bg">半身背景なし</option>
                <option value="half_with_bg">半身背景あり</option>
                <option value="full_no_bg">全身背景なし</option>
                <option value="full_with_bg">全身背景あり</option>
                <option value="partial_no_bg">体一部背景なし</option>
                <option value="partial_with_bg">体一部背景あり</option>
                <option value="outsourced">イラスト発注込</option>
              </select>
            </div>

            <div className="form-group">
              <label>解像度</label>
              <select value={resolution} onChange={(e) => setResolution(e.target.value as 'hd' | '4k')}>
                <option value="hd">HD (1920x1080)</option>
                <option value="4k">4K (3840x2160)</option>
              </select>
            </div>
          </>
        )}

        <button onClick={handleCalculate} className="calculate-btn">
          料金を計算
        </button>
      </div>

      {calculation && (
        <div className="calculation-result">
          <h3>見積もり結果</h3>
          <div className="total-price">
            合計: ¥{calculation.totalPrice.toLocaleString()}
          </div>
          <div className="breakdown">
            <h4>内訳</h4>
            <ul>
              {calculation.breakdown.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="disclaimer">
            <p>※ これは目安の料金です。詳細な要件によって変動する場合があります。</p>
            <p>※ お問い合わせフォームから詳細なご相談を承ります。</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

- **拡張性**: 料金体系はdata-managerから編集可能
- **UI**: 必要項目を選択・入力するだけで自動計算

### color-palette

- **目的**: 色域を指定してランダムに色を生成
- **機能**:
  - 色域指定
  - ランダム色生成
  - パレット保存
- **対象ユーザー**: デザイナー、開発者

### pi-game

- **目的**: 円周率を順番に押し続けるゲーム
- **機能**:
  - テンキー表示
  - 円周率の順番に押下
  - 間違えたらリセット
  - スコア記録
- **対象ユーザー**: 一般ユーザー

### pomodoro

- **目的**: シンプルなポモドーロタイマー
- **機能**:
  - 25分作業 / 5分休憩
  - 通知機能
  - カスタマイズ可能
- **対象ユーザー**: 一般ユーザー

### ProtoType

- **目的**: PIXIjsのタイピングゲーム
- **機能**:
  - GitHubリポジトリ使用 (https://github.com/rebuildup/ProtoType)
  - タイピングゲーム機能
  - スコア記録
- **対象ユーザー**: ゲームユーザー

### qr-generator

- **目的**: URLからQRコードを生成
- **機能**:
  - URL入力
  - QRコード生成
  - ダウンロード機能
- **対象ユーザー**: 一般ユーザー

### sequential-png-preview

- **目的**: 連番PNGをプレビュー
- **機能**:
  - 複数ファイルからプレビュー
  - フォルダからプレビュー
  - ZIPからプレビュー
- **特徴**: ローカル処理、ファイルアップロードなし
- **対象ユーザー**: アニメーター、デザイナー

### svg2tsx

- **目的**: SVG画像をReactコンポーネントに変換
- **機能**:
  - SVG画像またはコードから変換
  - TSX形式でダウンロード
- **特徴**: ローカル処理、ファイルアップロードなし
- **対象ユーザー**: React開発者

### text-counter

- **目的**: テキストの文字数をカウント
- **機能**:
  - 単純な文字数カウント
  - 改行数カウント
  - 1行の文字数設定による行数カウント
- **対象ユーザー**: 一般ユーザー

## 共通仕様

### 技術要件

- **レスポンシブ対応**: 全ツールでレスポンシブデザイン
- **オフライン対応**: 全ツールでオフライン動作
- **エラーハンドリング**: 適切なエラーハンドリングとコンソール出力
- **アクセシビリティ**: 多くの人が使う可能性があるため重視
  - キーボードナビゲーション対応
  - スクリーンリーダー対応

### パフォーマンス

- **読み込み時間**: 1秒以内を目標
- **画像最適化**: WebP形式使用
- **キャッシュ**: 適切なキャッシュ設定

### 無償公開

- **ライセンス**: 全ツール無償公開
- **利用制限**: なし

## データ

- `ContentItem` type: `tool`
- 利用統計: 各ツールの利用回数
- 人気ランキング: 利用回数によるランキング

## Meta情報

### SEO

- **title**: "Tools - samuido | 実用的なWebツール集"
- **description**: "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。"
- **keywords**: "Webツール, カラーパレット, QRコード, ポモドーロ, タイピングゲーム, 実用ツール"
- **robots**: "index, follow"
- **canonical**: "https://yusuke-kim.com/tools"

### Open Graph

- **og:title**: "Tools - samuido | 実用的なWebツール集"
- **og:description**: "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。"
- **og:type**: "website"
- **og:url**: "https://yusuke-kim.com/tools"
- **og:image**: "https://yusuke-kim.com/tools-og-image.jpg"
- **og:site_name**: "samuido"
- **og:locale**: "ja_JP"

### Twitter Card

- **twitter:card**: "summary_large_image"
- **twitter:title**: "Tools - samuido | 実用的なWebツール集"
- **twitter:description**: "カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。"
- **twitter:image**: "https://yusuke-kim.com/tools-twitter-image.jpg"
- **twitter:creator**: "@361do_sleep"

### 構造化データ (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "samuido Tools",
  "description": "実用的なWebツールのコレクション",
  "url": "https://yusuke-kim.com/tools",
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "alternateName": "samuido"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Webツール一覧",
    "description": "カラーパレット、QRコード、タイマーなどの実用ツール"
  }
}
```
