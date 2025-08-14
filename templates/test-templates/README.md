# テストテンプレート集

このディレクトリには、新しいテストを作成する際に使用できるテンプレートが含まれています。各テンプレートは、特定の種類のコードに対する包括的なテスト戦略を提供します。

## 利用可能なテンプレート

### 1. React Component テスト (`component.test.template.tsx`)

Reactコンポーネントの包括的なテストテンプレート

**含まれるテストカテゴリ:**

- 基本レンダリングテスト
- プロパティテスト
- イベントハンドリングテスト
- 状態管理テスト
- 副作用テスト
- アクセシビリティテスト
- エラーハンドリングテスト

**使用方法:**

```bash
cp templates/test-templates/component.test.template.tsx src/components/__tests__/MyComponent.test.tsx
```

### 2. Utility Function テスト (`utility.test.template.ts`)

ユーティリティ関数・ライブラリ関数のテストテンプレート

**含まれるテストカテゴリ:**

- 正常系テスト
- 境界値テスト
- 異常系テスト
- 非同期処理テスト
- パフォーマンステスト
- 型安全性テスト
- 副作用テスト

**使用方法:**

```bash
cp templates/test-templates/utility.test.template.ts src/lib/__tests__/myUtility.test.ts
```

### 3. API Route テスト (`api.test.template.ts`)

Next.js API ルートの包括的なテストテンプレート

**含まれるテストカテゴリ:**

- HTTPメソッド別テスト（GET, POST, PUT, DELETE）
- 認証・認可テスト
- レート制限テスト
- エラーハンドリングテスト
- CORSテスト

**使用方法:**

```bash
cp templates/test-templates/api.test.template.ts src/app/api/my-route/__tests__/route.test.ts
```

### 4. Custom Hook テスト (`hook.test.template.ts`)

Reactカスタムフックのテストテンプレート

**含まれるテストカテゴリ:**

- 基本動作テスト
- プロバイダーとの統合テスト
- 非同期処理テスト
- 依存関係テスト
- クリーンアップテスト
- エラーハンドリングテスト
- パフォーマンステスト

**使用方法:**

```bash
cp templates/test-templates/hook.test.template.ts src/hooks/__tests__/useMyHook.test.ts
```

### 5. Page Component テスト (`page.test.template.tsx`)

Next.js ページコンポーネントのテストテンプレート

**含まれるテストカテゴリ:**

- メタデータテスト
- レンダリングテスト
- SEOテスト
- アクセシビリティテスト
- レスポンシブデザインテスト
- パフォーマンステスト
- エラーハンドリングテスト
- 統合テスト

**使用方法:**

```bash
cp templates/test-templates/page.test.template.tsx src/app/my-page/__tests__/page.test.tsx
```

## テンプレートの使用手順

### 1. テンプレートのコピー

適切なテンプレートを選択し、テスト対象のファイルに対応する場所にコピーします。

### 2. テンプレートのカスタマイズ

以下の項目を実際のコードに合わせて修正します：

- `ComponentName` → 実際のコンポーネント名
- `utilityFunction` → 実際の関数名
- `useCustomHook` → 実際のフック名
- `PageComponent` → 実際のページコンポーネント名
- インポートパス
- テストデータ
- 期待値

### 3. 不要なテストの削除

テスト対象に該当しない機能のテストは削除します。

### 4. 追加テストの実装

テンプレートでカバーされていない特殊な機能があれば、追加のテストを実装します。

## テンプレートカスタマイズ例

### Component テンプレートのカスタマイズ例

```typescript
// Before (テンプレート)
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  const defaultProps = createMockProps();

  it('should render without crashing', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
});

// After (カスタマイズ後)
import { Button } from '../Button';

describe('Button', () => {
  const defaultProps = { children: 'Click me', onClick: jest.fn() };

  it('should render without crashing', () => {
    render(<Button {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Utility テンプレートのカスタマイズ例

```typescript
// Before (テンプレート)
import { utilityFunction } from "../utility-function";

describe("utilityFunction", () => {
  it("should return expected result for valid input", () => {
    const input = createTestData();
    const result = utilityFunction(input);
    expect(result).toBe(expectedOutput);
  });
});

// After (カスタマイズ後)
import { formatDate } from "../date-utils";

describe("formatDate", () => {
  it("should return expected result for valid input", () => {
    const input = new Date("2024-01-01");
    const result = formatDate(input, "YYYY-MM-DD");
    expect(result).toBe("2024-01-01");
  });
});
```

## ベストプラクティス

### 1. テンプレートの選択

- **Component**: UIコンポーネント、レイアウトコンポーネント
- **Utility**: 純粋関数、ヘルパー関数、ライブラリ関数
- **API**: Next.js API routes、サーバーサイド処理
- **Hook**: カスタムフック、状態管理ロジック
- **Page**: ページコンポーネント、ルートレベルコンポーネント

### 2. テストの優先順位

1. **必須テスト**: 基本動作、正常系
2. **重要テスト**: エラーハンドリング、境界値
3. **推奨テスト**: アクセシビリティ、パフォーマンス
4. **オプション**: 統合テスト、視覚的回帰テスト

### 3. テストデータの管理

```typescript
// テストファクトリーを活用
const createMockUser = (overrides = {}) => ({
  id: 1,
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});

// テスト内で使用
const user = createMockUser({ name: "Custom Name" });
```

### 4. モックの管理

```typescript
// ファイルレベルでのモック
jest.mock("@/lib/api", () => ({
  fetchData: jest.fn(),
}));

// テストレベルでのモック設定
beforeEach(() => {
  jest.mocked(fetchData).mockResolvedValue(mockData);
});
```

## トラブルシューティング

### よくある問題

1. **インポートエラー**: パスマッピングの確認
2. **モックエラー**: モックの設定と型定義の確認
3. **非同期テストエラー**: `waitFor` や `findBy*` の使用
4. **アクセシビリティテストエラー**: `jest-axe` の設定確認

### デバッグ方法

```typescript
// DOM構造の確認
screen.debug();

// 特定要素の確認
screen.debug(screen.getByRole("button"));

// Testing Playground URL生成
screen.logTestingPlaygroundURL();
```

## 関連ドキュメント

- [テスト戦略とベストプラクティス](../../docs/test-strategy-and-best-practices.md)
- [新規テスト作成ガイドライン](../../docs/test-creation-guidelines.md)
- [テストトラブルシューティングガイド](../../docs/test-troubleshooting-guide.md)
- [テスト FAQ](../../docs/test-faq.md)

## 貢献

新しいテンプレートの追加や既存テンプレートの改善提案は、プルリクエストまたはイシューでお知らせください。
