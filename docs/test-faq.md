# テスト FAQ（よくある質問）

## 基本的な質問

### Q1: なぜテストカバレッジ100%を目指すのですか？

**A:** 以下の理由から100%カバレッジを目標としています：

**品質保証の観点:**

- すべてのコードパスが実行され、バグの早期発見が可能
- リファクタリング時の安全性が向上
- 新機能追加時の既存機能への影響を検出

**開発効率の観点:**

- 自信を持ってコード変更ができる
- デバッグ時間の短縮
- ドキュメントとしての役割

**チーム開発の観点:**

- コードの意図が明確になる
- 新しいメンバーの理解促進
- 品質基準の統一

### Q2: テストの種類はどのように使い分けるべきですか？

**A:** テストピラミッドに従って使い分けます：

```
        E2E Tests (少数)
       ↗ ユーザージャーニー全体
      ↗  ブラウザ自動化
     ↗   実際の環境に近い
    ↗
   Integration Tests (中程度)
  ↗ コンポーネント間の連携
 ↗  API統合テスト
↗   データフローの検証
Unit Tests (多数)
個別の関数・コンポーネント
高速実行
詳細な動作検証
```

**具体的な使い分け:**

- **ユニットテスト**: 関数、コンポーネントの個別動作
- **統合テスト**: API連携、状態管理、コンポーネント間通信
- **E2Eテスト**: ログイン→操作→結果確認の完全フロー

### Q3: どのファイルをテスト対象にすべきですか？

**A:** 以下の基準で判断します：

**テスト必須:**

- ビジネスロジックを含む関数
- Reactコンポーネント
- APIルート
- カスタムフック
- ユーティリティ関数

**テスト不要（除外対象）:**

- 型定義ファイル（.d.ts）
- 設定ファイル
- 単純なre-exportファイル
- Storybookファイル
- テストユーティリティ

```javascript
// jest.config.js での除外設定例
collectCoverageFrom: [
  "src/**/*.{ts,tsx}",
  "!src/**/*.d.ts",
  "!src/**/*.stories.{ts,tsx}",
  "!src/**/index.ts",
  "!src/test-utils/**",
];
```

## テスト作成に関する質問

### Q4: テストケースはどのように設計すべきですか？

**A:** 以下の観点でテストケースを設計します：

**機能的観点:**

- 正常系（Happy Path）
- 異常系（Error Cases）
- 境界値（Boundary Values）
- エッジケース（Edge Cases）

**具体例:**

```typescript
describe("calculateAge function", () => {
  // 正常系
  it("should calculate age correctly for valid birth date", () => {
    expect(calculateAge("1990-01-01")).toBe(34);
  });

  // 境界値
  it("should handle today as birth date", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(calculateAge(today)).toBe(0);
  });

  // 異常系
  it("should throw error for invalid date format", () => {
    expect(() => calculateAge("invalid-date")).toThrow();
  });

  // エッジケース
  it("should handle leap year correctly", () => {
    expect(calculateAge("2000-02-29")).toBe(24);
  });
});
```

### Q5: モックはどの程度使用すべきですか？

**A:** 必要最小限の原則に従います：

**モックすべき対象:**

- 外部API呼び出し
- データベースアクセス
- ファイルシステム操作
- 時間依存の処理
- 重い計算処理

**モックしない方が良い対象:**

- テスト対象の内部ロジック
- 単純なユーティリティ関数
- 標準ライブラリの基本機能

```typescript
// ✅ 適切なモック
jest.mock("@/lib/api", () => ({
  fetchUserData: jest.fn(),
}));

// ❌ 過度なモック
jest.mock("lodash"); // ライブラリ全体をモック
```

### Q6: 非同期処理のテストはどう書くべきですか？

**A:** async/awaitとTesting Libraryの非同期ユーティリティを使用します：

```typescript
// API呼び出しのテスト
it('should fetch and display user data', async () => {
  const mockData = { id: 1, name: 'Test User' };
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
  });

  render(<UserProfile userId={1} />);

  // 非同期でレンダリングされる要素を待機
  const userName = await screen.findByText('Test User');
  expect(userName).toBeInTheDocument();
});

// エラーハンドリングのテスト
it('should handle fetch errors', async () => {
  mockFetch.mockRejectedValue(new Error('Network error'));

  render(<UserProfile userId={1} />);

  const errorMessage = await screen.findByText('Failed to load user');
  expect(errorMessage).toBeInTheDocument();
});
```

## React Testing Libraryに関する質問

### Q7: 要素の取得方法はどれを使うべきですか？

**A:** 優先順位に従って選択します：

**優先順位（高→低）:**

1. `getByRole` - アクセシビリティ重視
2. `getByLabelText` - フォーム要素
3. `getByText` - 表示テキスト
4. `getByDisplayValue` - フォームの現在値
5. `getByAltText` - 画像のalt属性
6. `getByTitle` - title属性
7. `getByTestId` - 最後の手段

```typescript
// ✅ 推奨: アクセシビリティを考慮
screen.getByRole("button", { name: "Submit" });
screen.getByLabelText("Email Address");

// ⚠️ 使用可能だが推奨度低い
screen.getByTestId("submit-button");

// ❌ 避けるべき: 実装詳細に依存
screen.getByClassName("btn-primary");
```

### Q8: イベントのテストはどう書くべきですか？

**A:** `fireEvent`よりも`userEvent`を推奨します：

```typescript
import userEvent from '@testing-library/user-event';

it('should handle user interactions', async () => {
  const user = userEvent.setup();
  const mockSubmit = jest.fn();

  render(<ContactForm onSubmit={mockSubmit} />);

  // ✅ 推奨: userEvent（より実際のユーザー操作に近い）
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(mockSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
  });
});
```

### Q9: カスタムフックのテストはどう書くべきですか？

**A:** `renderHook`を使用します：

```typescript
import { renderHook, act } from '@testing-library/react';

it('should manage state correctly', () => {
  const { result } = renderHook(() => useCounter(0));

  // 初期状態の確認
  expect(result.current.count).toBe(0);

  // 状態更新のテスト
  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});

// プロバイダーが必要な場合
it('should work with context provider', () => {
  const wrapper = ({ children }) => (
    <ThemeProvider theme="dark">{children}</ThemeProvider>
  );

  const { result } = renderHook(() => useTheme(), { wrapper });
  expect(result.current.theme).toBe('dark');
});
```

## パフォーマンスに関する質問

### Q10: テスト実行が遅い場合の対処法は？

**A:** 以下の最適化を段階的に適用します：

**レベル1: 設定の最適化**

```javascript
// jest.config.js
module.exports = {
  maxWorkers: "50%", // 並列実行
  cache: true, // キャッシュ有効化
  testTimeout: 10000, // タイムアウト調整
};
```

**レベル2: テストコードの最適化**

```typescript
// ❌ 遅い: 毎回重いセットアップ
beforeEach(() => {
  setupLargeDataset();
});

// ✅ 速い: 一度だけセットアップ
beforeAll(() => {
  setupLargeDataset();
});
```

**レベル3: モックの最適化**

```typescript
// 必要最小限のモックのみ使用
jest.mock("@/lib/heavy-library", () => ({
  heavyFunction: jest.fn(() => "mocked result"),
}));
```

### Q11: メモリリークを防ぐには？

**A:** 適切なクリーンアップを実装します：

```typescript
// タイマーのクリーンアップ
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// イベントリスナーのクリーンアップ
afterEach(() => {
  document.removeEventListener("click", mockHandler);
});

// モックのクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
});

// リソースのクリーンアップ
afterAll(() => {
  // データベース接続のクローズなど
});
```

## CI/CDに関する質問

### Q12: CI/CDでテストが失敗する場合の対処法は？

**A:** 環境差異を考慮した設定を行います：

**タイムゾーンの問題:**

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

// jest.setup.js
process.env.TZ = "UTC";
```

**並列実行の問題:**

```javascript
// CI環境では並列実行を制限
module.exports = {
  maxWorkers: process.env.CI ? 1 : "50%",
};
```

**タイムアウトの調整:**

```javascript
// CI環境では長めのタイムアウト
module.exports = {
  testTimeout: process.env.CI ? 30000 : 10000,
};
```

### Q13: カバレッジレポートはどう活用すべきですか？

**A:** 以下の観点で活用します：

**開発時:**

- HTMLレポートで詳細確認
- 未カバー箇所の特定
- テスト追加の優先度決定

**CI/CD:**

- 閾値チェックでビルド制御
- プルリクエストでの差分表示
- 継続的な品質監視

```bash
# HTMLレポート生成
npm run test:coverage
open coverage/lcov-report/index.html

# 閾値チェック
npm run test:coverage:check
```

## トラブルシューティング

### Q14: よくあるエラーとその解決策は？

**A:**

**1. "Cannot find module" エラー**

```javascript
// jest.config.js でパスマッピング設定
moduleNameMapping: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

**2. "useRouter should be used inside Router" エラー**

```typescript
// Next.js routerのモック
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

**3. "Element not found" エラー**

```typescript
// 非同期要素の適切な待機
const element = await screen.findByText("Loading complete");
expect(element).toBeInTheDocument();
```

### Q15: フレーキーテストを防ぐには？

**A:** 以下の原則に従います：

**時間に依存しない:**

```typescript
// ❌ 時間に依存
setTimeout(() => {
  expect(element).toBeInTheDocument();
}, 1000);

// ✅ 条件待ち
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

**テスト間の独立性:**

```typescript
// 各テスト前にクリーンアップ
beforeEach(() => {
  jest.clearAllMocks();
  cleanup();
});
```

**適切なモック:**

```typescript
// 外部依存を確実にモック
jest.mock("@/lib/api");
```

## ベストプラクティス

### Q16: テストコードの品質を保つには？

**A:** 以下のガイドラインに従います：

**命名規則:**

```typescript
// ✅ 明確で理解しやすい
describe("UserProfile component", () => {
  it("should display user name when provided", () => {});
  it("should show loading state while fetching", () => {});
});

// ❌ 曖昧
describe("UserProfile", () => {
  it("works", () => {});
});
```

**テスト構造（AAA Pattern）:**

```typescript
it("should calculate total with tax", () => {
  // Arrange
  const items = [{ price: 100, quantity: 2 }];
  const taxRate = 0.1;

  // Act
  const result = calculateTotal(items, taxRate);

  // Assert
  expect(result).toBe(220);
});
```

### Q17: テストメンテナンスのコツは？

**A:**

**定期的なレビュー:**

- 月次でテストコードレビュー
- 重複テストの統合
- 古いパターンの更新

**共通化:**

```typescript
// テストユーティリティの活用
const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <Router>
        {component}
      </Router>
    </ThemeProvider>
  );
};
```

**ドキュメント化:**

- 複雑なテストロジックにコメント
- テスト戦略の文書化
- トラブルシューティングガイドの更新

## 参考資料

### 公式ドキュメント

- [Jest公式ドキュメント](https://jestjs.io/docs/getting-started)
- [Testing Library公式ドキュメント](https://testing-library.com/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### ベストプラクティス

- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)

### ツールとライブラリ

- [MSW (Mock Service Worker)](https://mswjs.io/)
- [jest-axe (Accessibility Testing)](https://github.com/nickcolley/jest-axe)
- [user-event](https://testing-library.com/docs/user-event/intro/)

---

**このFAQは継続的に更新されます。新しい質問や改善提案があれば、チームまでお知らせください。**
