# テストトラブルシューティングガイド

## 概要

このドキュメントは、テスト実行中に発生する一般的な問題とその解決策を提供します。効率的な問題解決とテスト品質の向上を支援します。

## よくある問題と解決策

### 1. テスト実行エラー

#### 問題: テストが実行されない

```bash
No tests found, exiting with code 1
```

**原因と解決策:**

```bash
# 原因1: テストファイルの命名規則が間違っている
# 解決策: 正しい命名規則を使用
# ✅ 正しい: component.test.tsx, utils.spec.ts
# ❌ 間違い: component.testing.tsx, utils.tests.ts

# 原因2: Jest設定でテストファイルパターンが間違っている
# 解決策: jest.config.js を確認
{
  "testMatch": [
    "**/__tests__/**/*.(ts|tsx|js|jsx)",
    "**/*.(test|spec).(ts|tsx|js|jsx)"
  ]
}

# 原因3: TypeScript設定の問題
# 解決策: tsconfig.json の include に test files を追加
{
  "include": [
    "src/**/*",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

#### 問題: モジュールが見つからない

```bash
Cannot find module '@/components/Button' from 'src/components/__tests__/Button.test.tsx'
```

**解決策:**

```javascript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
  },
};
```

### 2. React Testing Library エラー

#### 問題: 要素が見つからない

```bash
TestingLibraryElementError: Unable to find an element with the role "button"
```

**デバッグ手順:**

```typescript
import { screen } from "@testing-library/react";

// 1. 現在のDOM構造を確認
screen.debug();

// 2. 利用可能なロールを確認
screen.logTestingPlaygroundURL();

// 3. より柔軟なクエリを使用
// ❌ 厳密すぎる
screen.getByRole("button", { name: "Exact Text" });

// ✅ 柔軟
screen.getByRole("button", { name: /submit/i });
screen.getByText(/submit/i);
```

#### 問題: 非同期要素が見つからない

```bash
TestingLibraryElementError: Unable to find an element
```

**解決策:**

```typescript
import { waitFor, screen } from "@testing-library/react";

// ❌ 間違い: 非同期要素を同期的に取得
expect(screen.getByText("Loaded Data")).toBeInTheDocument();

// ✅ 正しい: waitForを使用
await waitFor(() => {
  expect(screen.getByText("Loaded Data")).toBeInTheDocument();
});

// または findBy* クエリを使用
const element = await screen.findByText("Loaded Data");
expect(element).toBeInTheDocument();
```

### 3. モックの問題

#### 問題: モックが期待通りに動作しない

```typescript
// モックが呼ばれない、または間違った値を返す
```

**デバッグと解決策:**

```typescript
// 1. モックの状態を確認
console.log("Mock calls:", mockFunction.mock.calls);
console.log("Mock results:", mockFunction.mock.results);

// 2. モックのリセットを確認
beforeEach(() => {
  jest.clearAllMocks(); // 呼び出し履歴をクリア
  // または
  jest.resetAllMocks(); // 実装もリセット
});

// 3. モックの実装を確認
const mockFetch = jest.fn();
mockFetch.mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: "test" }),
  }),
);

// 4. 条件付きモック
mockFetch.mockImplementation((url) => {
  if (url.includes("error")) {
    return Promise.reject(new Error("Network error"));
  }
  return Promise.resolve({ ok: true });
});
```

#### 問題: Next.js routerのモックエラー

```bash
Error: useRouter() should be used inside <Router>
```

**解決策:**

```typescript
// 1. useRouter のモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => "/test-path",
}));

// 2. 動的なモック値
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// テスト内で使用
expect(mockPush).toHaveBeenCalledWith("/expected-path");
```

### 4. カバレッジの問題

#### 問題: カバレッジが100%にならない

```bash
Uncovered Line #s: 25-30
Uncovered Functions: handleError
Uncovered Branches: if (condition)
```

**解決策:**

```typescript
// 1. 未カバーの行を特定
// HTML カバレッジレポートを確認
npm run test:coverage
open coverage/lcov-report/index.html

// 2. 条件分岐のテスト
describe('handleError function', () => {
  it('should handle different error types', () => {
    // 成功ケース
    expect(handleError(null)).toBe(null);

    // エラーケース
    expect(handleError(new Error('test'))).toBe('Error: test');

    // 異なる型のエラー
    expect(handleError('string error')).toBe('string error');
  });
});

// 3. 到達困難なコードの特定
// istanbul ignore next を使用（最後の手段）
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

#### 問題: 除外すべきファイルがカバレッジに含まれる

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts", // 型定義ファイル
    "!src/**/*.stories.{ts,tsx}", // Storybook ファイル
    "!src/**/index.ts", // re-export のみのファイル
    "!src/test-utils/**", // テストユーティリティ
    "!src/**/*.config.{ts,js}", // 設定ファイル
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
```

### 5. パフォーマンスの問題

#### 問題: テスト実行が遅い

```bash
Test Suites: 50 passed, 50 total
Time: 120.5s
```

**最適化手順:**

```javascript
// 1. 並列実行の設定
// jest.config.js
module.exports = {
  maxWorkers: "50%", // CPUコア数の50%を使用
  // または具体的な数値
  maxWorkers: 4,
};

// 2. テストファイルの分割
// 大きなテストファイルを小さく分割
describe.each([
  ["case1", data1],
  ["case2", data2],
  ["case3", data3],
])("Test %s", (name, data) => {
  it("should work", () => {
    // テスト実装
  });
});

// 3. 重いセットアップの最適化
// ❌ 遅い: 各テストでセットアップ
beforeEach(() => {
  heavySetup();
});

// ✅ 速い: 一度だけセットアップ
beforeAll(() => {
  heavySetup();
});

// 4. 不要なモックの削除
// 必要最小限のモックのみ使用
```

#### 問題: メモリリーク

```bash
Jest has detected the following 1 open handle potentially keeping Jest from exiting
```

**解決策:**

```typescript
// 1. タイマーのクリーンアップ
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// 2. イベントリスナーのクリーンアップ
afterEach(() => {
  // DOM イベントリスナーの削除
  document.removeEventListener("click", mockHandler);

  // カスタムイベントの削除
  window.removeEventListener("resize", mockResizeHandler);
});

// 3. 非同期処理の適切な処理
afterEach(async () => {
  // 未完了のPromiseを待機
  await new Promise((resolve) => setTimeout(resolve, 0));
});

// 4. リソースのクリーンアップ
afterAll(() => {
  // データベース接続のクローズ
  // ファイルハンドルのクローズ
  // その他のリソースクリーンアップ
});
```

### 6. TypeScript関連の問題

#### 問題: 型エラーでテストが実行できない

```bash
Type 'string' is not assignable to type 'number'
```

**解決策:**

```typescript
// 1. 適切な型アサーション
const mockData = {
  id: "1" as unknown as number, // 型アサーション
  name: "test",
};

// 2. テスト用の型定義
interface TestProps {
  id?: number;
  name?: string;
}

const createTestProps = (overrides: Partial<TestProps> = {}): TestProps => ({
  id: 1,
  name: "test",
  ...overrides,
});

// 3. モックの型定義
const mockFunction = jest.fn() as jest.MockedFunction<typeof originalFunction>;

// 4. any型の適切な使用（最後の手段）
const testData = {
  complexProperty: "test" as any,
};
```

## デバッグテクニック

### 1. テスト実行の詳細化

```bash
# 詳細なエラー情報
npm test -- --verbose

# 特定のテストファイルのみ実行
npm test -- Button.test.tsx

# パターンマッチでテスト実行
npm test -- --testNamePattern="should render"

# ウォッチモードでデバッグ
npm test -- --watch --verbose
```

### 2. DOM状態の確認

```typescript
import { screen } from "@testing-library/react";

// 現在のDOM構造を出力
screen.debug();

// 特定の要素のみ出力
const element = screen.getByRole("button");
screen.debug(element);

// Testing Playground URLを生成
screen.logTestingPlaygroundURL();
```

### 3. モックの状態確認

```typescript
// モック関数の呼び出し履歴
console.log("Calls:", mockFunction.mock.calls);
console.log("Results:", mockFunction.mock.results);
console.log("Instances:", mockFunction.mock.instances);

// モック関数がどのように呼ばれたかの詳細
mockFunction.mock.calls.forEach((call, index) => {
  console.log(`Call ${index}:`, call);
});
```

### 4. 非同期処理のデバッグ

```typescript
// Promise の状態確認
const promise = fetchData();
console.log("Promise state:", promise);

// async/await のエラーハンドリング
try {
  const result = await fetchData();
  console.log("Success:", result);
} catch (error) {
  console.log("Error:", error);
}

// タイムアウトの設定
jest.setTimeout(10000); // 10秒
```

## FAQ

### Q1: テストファイルはどこに配置すべきですか？

**A:** 以下の2つのパターンが推奨されます：

```
# パターン1: __tests__ フォルダ
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx

# パターン2: 同じディレクトリ
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
```

### Q2: モックはいつ使うべきですか？

**A:** 以下の場合にモックを使用します：

- 外部API呼び出し
- ファイルシステムアクセス
- データベース操作
- 時間に依存する処理
- 重い計算処理
- 副作用のある処理

### Q3: テストが不安定（フレーキー）になる原因は？

**A:** 主な原因と対策：

- **非同期処理**: `waitFor` や `findBy*` を使用
- **タイミング**: `act()` でReactの更新を待機
- **テスト間の状態共有**: `beforeEach` でクリーンアップ
- **外部依存**: 適切なモックを使用

### Q4: カバレッジ100%は本当に必要ですか？

**A:** プロジェクトの要件によりますが、以下の利点があります：

- バグの早期発見
- リファクタリングの安全性
- コードの品質向上
- 開発者の信頼性向上

### Q5: テストが遅い場合の対処法は？

**A:** 以下の最適化を試してください：

- 並列実行の設定
- 不要なモックの削除
- テストファイルの分割
- 重いセットアップの最適化
- キャッシュの活用

### Q6: E2Eテストとユニットテストの使い分けは？

**A:**

- **ユニットテスト**: 個別の機能、高速、多数
- **統合テスト**: コンポーネント間の連携
- **E2Eテスト**: ユーザージャーニー、低速、少数

### Q7: テストコードのメンテナンスはどうすべきですか？

**A:**

- 定期的なレビュー
- 重複コードの共通化
- 古いパターンの更新
- 不要なテストの削除
- ドキュメントの更新

## トラブルシューティングチェックリスト

### テスト実行前

- [ ] Node.js と npm のバージョンが適切
- [ ] 依存関係がインストール済み
- [ ] Jest設定が正しい
- [ ] TypeScript設定が正しい

### テスト作成時

- [ ] 適切な命名規則を使用
- [ ] 必要なモックを設定
- [ ] 非同期処理を適切に処理
- [ ] エラーケースをテスト

### テスト実行時

- [ ] すべてのテストが独立して実行可能
- [ ] モックが適切にリセットされる
- [ ] メモリリークがない
- [ ] 実行時間が適切

### カバレッジ確認時

- [ ] 100%カバレッジを達成
- [ ] 除外ファイルが適切
- [ ] 到達困難なコードを特定
- [ ] 意味のあるテストケース

## 参考リンク

- [Jest Troubleshooting](https://jestjs.io/docs/troubleshooting)
- [Testing Library Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [React Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Jest Mock Functions](https://jestjs.io/docs/mock-functions)
