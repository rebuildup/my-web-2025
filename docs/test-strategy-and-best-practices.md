# テスト戦略とベストプラクティス

## 概要

このドキュメントは、プロジェクトにおけるテスト戦略、ベストプラクティス、および品質保証のガイドラインを定義します。100%テストカバレッジを維持し、高品質なコードベースを確保するための包括的な指針を提供します。

## テスト戦略

### テストピラミッド

```
    /\
   /  \
  / E2E \     <- 少数の重要なユーザージャーニー
 /______\
/        \
| 統合テスト |   <- コンポーネント間の連携
|________|
|        |
| ユニット |   <- 個別の関数・コンポーネント（最多）
|  テスト  |
|________|
```

### テスト種別と責任範囲

#### 1. ユニットテスト (Unit Tests)

- **対象**: 個別の関数、コンポーネント、クラス
- **目的**: 最小単位の動作検証
- **カバレッジ目標**: 100%
- **実行頻度**: 開発中・CI/CD

#### 2. 統合テスト (Integration Tests)

- **対象**: コンポーネント間の連携、API統合
- **目的**: システム間の相互作用検証
- **カバレッジ目標**: 主要フロー100%
- **実行頻度**: CI/CD・リリース前

#### 3. エンドツーエンドテスト (E2E Tests)

- **対象**: ユーザージャーニー全体
- **目的**: 実際の使用シナリオ検証
- **カバレッジ目標**: クリティカルパス100%
- **実行頻度**: リリース前・定期実行

## ベストプラクティス

### 1. テストコードの品質

#### 命名規則

```typescript
// ✅ Good: 明確で理解しやすい
describe("UserProfile component", () => {
  it("should display user name when provided", () => {
    // test implementation
  });

  it("should show loading state while fetching data", () => {
    // test implementation
  });

  it("should handle error state gracefully", () => {
    // test implementation
  });
});

// ❌ Bad: 曖昧で理解しにくい
describe("UserProfile", () => {
  it("works", () => {
    // test implementation
  });
});
```

#### テスト構造 (AAA Pattern)

```typescript
it("should calculate total price with tax", () => {
  // Arrange - テストデータの準備
  const items = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ];
  const taxRate = 0.1;

  // Act - テスト対象の実行
  const result = calculateTotalWithTax(items, taxRate);

  // Assert - 結果の検証
  expect(result).toBe(275); // (200 + 50) * 1.1
});
```

### 2. モック戦略

#### 外部依存関係のモック

```typescript
// API呼び出しのモック
jest.mock("@/lib/api", () => ({
  fetchUserData: jest.fn(),
  updateUserProfile: jest.fn(),
}));

// Next.js routerのモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));
```

#### モックの適切な使用

```typescript
// ✅ Good: 必要最小限のモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ✅ Good: 具体的な戻り値設定
mockFetch.mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ id: 1, name: "Test User" }),
});

// ❌ Bad: 過度なモック
jest.mock("entire-library"); // ライブラリ全体をモック
```

### 3. テストデータ管理

#### ファクトリーパターンの使用

```typescript
// test-factories.ts
export const createUser = (overrides = {}) => ({
  id: 1,
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

export const createPost = (overrides = {}) => ({
  id: 1,
  title: "Test Post",
  content: "Test content",
  authorId: 1,
  publishedAt: new Date("2024-01-01"),
  ...overrides,
});
```

### 4. 非同期テストのベストプラクティス

```typescript
// ✅ Good: async/awaitの使用
it("should fetch user data successfully", async () => {
  const userData = { id: 1, name: "Test User" };
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(userData),
  });

  const result = await fetchUser(1);
  expect(result).toEqual(userData);
});

// ✅ Good: エラーハンドリングのテスト
it("should handle fetch errors gracefully", async () => {
  mockFetch.mockRejectedValue(new Error("Network error"));

  await expect(fetchUser(1)).rejects.toThrow("Network error");
});
```

### 5. Reactコンポーネントテスト

#### レンダリングテスト

```typescript
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

it('should render user information correctly', () => {
  const user = createUser({ name: 'John Doe', email: 'john@example.com' });

  render(<UserProfile user={user} />);

  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});
```

#### イベントハンドリングテスト

```typescript
import { fireEvent } from '@testing-library/react';

it('should call onSubmit when form is submitted', () => {
  const mockSubmit = jest.fn();

  render(<ContactForm onSubmit={mockSubmit} />);

  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'John Doe' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'John Doe'
  });
});
```

### 6. アクセシビリティテスト

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## テストカバレッジ管理

### カバレッジ目標

- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### カバレッジ除外ルール

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/index.ts", // re-export only files
    "!src/test-utils/**", // test utilities
  ],
};
```

### カバレッジレポートの活用

1. **HTML レポート**: 詳細な可視化
2. **JSON レポート**: CI/CD統合
3. **LCOV レポート**: 外部ツール連携

## パフォーマンステスト

### Core Web Vitals測定

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

describe("Performance Metrics", () => {
  it("should meet Core Web Vitals thresholds", async () => {
    const metrics = await measurePagePerformance("/");

    expect(metrics.LCP).toBeLessThan(2500); // Good LCP
    expect(metrics.FID).toBeLessThan(100); // Good FID
    expect(metrics.CLS).toBeLessThan(0.1); // Good CLS
  });
});
```

### バンドルサイズテスト

```typescript
import { getBundleSize } from "@/test-utils/bundle-analyzer";

it("should maintain bundle size under threshold", async () => {
  const bundleSize = await getBundleSize();
  expect(bundleSize.main).toBeLessThan(500 * 1024); // 500KB
});
```

## CI/CD統合

### GitHub Actions設定

```yaml
name: Test Coverage
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run test:coverage

      - name: Check coverage threshold
        run: npm run test:coverage:check

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### カバレッジ閾値チェック

```javascript
// scripts/check-coverage.js
const coverage = require("./coverage/coverage-summary.json");

const thresholds = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
};

Object.entries(thresholds).forEach(([metric, threshold]) => {
  const actual = coverage.total[metric].pct;
  if (actual < threshold) {
    console.error(
      `${metric} coverage ${actual}% is below threshold ${threshold}%`,
    );
    process.exit(1);
  }
});
```

## トラブルシューティング

### よくある問題と解決策

#### 1. テストが不安定（フレーキー）

**症状**: 同じテストが成功したり失敗したりする
**原因**:

- 非同期処理の待機不足
- テスト間の状態共有
- 外部依存関係

**解決策**:

```typescript
// ✅ 適切な待機
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// ✅ テスト間のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});
```

#### 2. モックが期待通りに動作しない

**症状**: モックした関数が呼ばれない、または期待と異なる値を返す
**解決策**:

```typescript
// モックの状態確認
console.log(mockFunction.mock.calls);
console.log(mockFunction.mock.results);

// モックのリセット
beforeEach(() => {
  jest.clearAllMocks();
});
```

#### 3. カバレッジが100%にならない

**症状**: 一部のコードがカバレッジに含まれない
**解決策**:

```typescript
// 条件分岐のテスト
it("should handle both success and error cases", () => {
  // 成功ケース
  expect(processData(validData)).toBe(expectedResult);

  // エラーケース
  expect(() => processData(invalidData)).toThrow();
});
```

#### 4. テスト実行が遅い

**症状**: テストスイートの実行に時間がかかる
**解決策**:

```javascript
// jest.config.js
module.exports = {
  maxWorkers: "50%", // 並列実行
  cache: true, // キャッシュ有効化
  testTimeout: 10000, // タイムアウト設定
};
```

## メンテナンス

### 定期的なレビュー項目

1. **テストカバレッジの確認** (週次)
2. **フレーキーテストの特定と修正** (週次)
3. **テスト実行時間の監視** (月次)
4. **テストコードの品質レビュー** (月次)

### テストコードのリファクタリング

- 重複したテストロジックの共通化
- 古いテストパターンの更新
- 不要なモックの削除
- テストデータの整理

## 品質指標

### 測定項目

- **カバレッジ率**: 100%維持
- **テスト実行時間**: 30秒以内
- **フレーキーテスト率**: 0%
- **テストコード品質**: ESLintルール準拠

### 監視とアラート

- カバレッジ低下時の自動アラート
- テスト実行時間の異常検知
- フレーキーテストの自動検出

## 参考資料

- [Jest公式ドキュメント](https://jestjs.io/docs/getting-started)
- [Testing Library公式ドキュメント](https://testing-library.com/docs/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
