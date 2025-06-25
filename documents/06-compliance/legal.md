# 利用規約・プライバシーポリシー

## プライバシーポリシー

### 基本情報

- **最終更新**: 2025-01-01
- **適用開始**: サイト公開時
- **管理者**: samuido (rebuild.up.up@gmail.com)

### 収集する情報

#### 1. 自動収集情報

```typescript
// 自動収集される情報
const automaticData = {
  // アクセス情報
  ipAddress: "string", // IPアドレス（匿名化処理済み）
  userAgent: "string", // ブラウザ情報
  accessTime: "datetime", // アクセス時間
  referrer: "string", // 参照元URL

  // 技術情報
  screenResolution: "string", // 画面解像度
  language: "string", // 言語設定
  timezone: "string", // タイムゾーン

  // パフォーマンス情報
  loadTime: "number", // ページ読み込み時間
  errorLogs: "string[]", // エラーログ（個人情報除外）
};
```

#### 2. ユーザー入力情報

- **お問い合わせフォーム**: 氏名、メールアドレス、メッセージ内容
- **ツール使用時**: 操作ログ（個人を特定しない形で）
- **見積もり計算機**: プロジェクト内容（保存されません）

#### 3. 第三者サービス経由の情報

- **Google Analytics**: 匿名化されたアクセス解析データ
- **GitHub**: 公開リポジトリ情報
- **Booth**: 販売実績情報（購入者情報は含まない）

### 情報の利用目的

#### 1. サイト運営・改善

```typescript
const usagePurposes = {
  siteOperation: [
    "サイトの安定運営",
    "パフォーマンス最適化",
    "セキュリティ確保",
    "エラー監視・修正",
  ],

  improvement: [
    "ユーザビリティ向上",
    "コンテンツ最適化",
    "機能追加・改善",
    "デザイン改善",
  ],

  communication: ["お問い合わせへの回答", "技術サポート", "重要なお知らせ"],
};
```

#### 2. 分析・統計

- アクセス状況の分析
- 人気コンテンツの把握
- ユーザー行動の理解（匿名化）

### 第三者への提供

#### 提供しない原則

法令に基づく場合を除き、**ご本人の同意なく第三者に個人情報を提供することはありません**。

#### 外部サービスとのデータ共有

```typescript
const thirdPartyServices = {
  googleAnalytics: {
    purpose: "アクセス解析",
    dataType: "匿名化済みアクセスデータ",
    retention: "14ヶ月",
    optOut: "https://tools.google.com/dlpage/gaoptout",
  },

  github: {
    purpose: "ソースコード管理",
    dataType: "パブリックリポジトリ情報",
    retention: "アカウント存続期間",
    privacy: "https://docs.github.com/ja/site-policy/privacy-policies",
  },

  booth: {
    purpose: "デジタル商品販売",
    dataType: "販売実績データ（購入者情報除外）",
    retention: "会計年度終了後7年間",
    privacy: "https://booth.pm/privacy",
  },
};
```

### データの保管期間

#### 保管期間一覧

| データ種別           | 保管期間 | 理由                                 |
| -------------------- | -------- | ------------------------------------ |
| お問い合わせデータ   | 2 年間   | サポート履歴管理                     |
| アクセスログ         | 30 日間  | セキュリティ・トラブルシューティング |
| バックアップデータ   | 90 日間  | 災害復旧対応                         |
| 分析データ（匿名化） | 無期限   | サイト改善・研究目的                 |

#### 自動削除機能

```typescript
// データ自動削除スケジュール
const dataRetentionPolicy = {
  contactForms: {
    retention: "2 years",
    autoDelete: true,
    schedule: "monthly",
  },

  accessLogs: {
    retention: "30 days",
    autoDelete: true,
    schedule: "daily",
  },

  backups: {
    retention: "90 days",
    autoDelete: true,
    schedule: "weekly",
  },
};
```

### ユーザーの権利

#### 個人情報に関する権利

1. **アクセス権**: 保存されている個人情報の確認
2. **訂正権**: 個人情報の修正要求
3. **削除権**: 個人情報の削除要求
4. **データポータビリティ**: データの移行要求

#### 権利行使の方法

```typescript
const rightsExercise = {
  contact: "rebuild.up.up@gmail.com",
  subject: "個人情報に関するお問い合わせ",
  requiredInfo: [
    "氏名",
    "メールアドレス",
    "要求内容（アクセス/訂正/削除等）",
    "本人確認書類（必要に応じて）",
  ],
  responseTime: "1週間以内",
};
```

## 利用規約

### 基本情報

- **最終更新**: 2025-01-01
- **適用範囲**: yusuke-kim.com 全体

### サービスの提供

#### サイトの目的

```typescript
const siteDescription = {
  type: "個人ポートフォリオサイト",
  owner: "samuido",
  purposes: [
    "作品・プロジェクトの展示",
    "技術情報・知識の共有",
    "デジタル商品の販売",
    "実用ツールの提供",
  ],
};
```

#### サービス内容

- ポートフォリオ作品の展示
- 技術ブログ・記事の公開
- プラグイン・素材の配布
- Web ツールの提供
- お問い合わせ・依頼受付

#### 免責事項

```typescript
const disclaimers = {
  contentAccuracy: "掲載情報の正確性は保証いたしません",
  serviceAvailability: "サービスの継続性は保証いたしません",
  userResponsibility: "利用は自己責任でお願いします",
  damageExclusion: "利用による損害の責任は負いません",
};
```

### 知的財産権

#### コンテンツの著作権

- **著作権者**: samuido (木村友亮)
- **対象**: サイト内の全オリジナルコンテンツ
- **禁止行為**: 無断転載・複製・配布

#### ライセンス別対応

```typescript
const intellectualProperty = {
  originalWorks: {
    copyright: "samuido (木村友亮)",
    rights: "All Rights Reserved",
    permission: "contact required",
  },

  distributedPlugins: {
    licenseType: "商品ページ参照",
    usage: "購入者のみ",
    redistribution: "禁止",
  },

  blogPosts: {
    copyright: "samuido (木村友亮)",
    quotation: "出典明記で部分引用可",
    fullCopy: "禁止",
  },

  sourceCode: {
    license: "repository specific",
    reference: "GitHub リポジトリ参照",
  },
};
```

### 禁止事項

#### 利用時の禁止行為

1. **技術的妨害行為**

   - サーバーへの過度な負荷
   - セキュリティホールの悪用
   - 不正アクセス・クラッキング

2. **コンテンツの不正利用**

   - 無断転載・複製・配布
   - 商用目的での無断利用
   - 著作権侵害行為

3. **迷惑行為**

   - スパム送信
   - 不適切なコメント・メッセージ
   - 他ユーザーへの迷惑行為

4. **法令違反**
   - 日本国の法令に違反する行為
   - 公序良俗に反する行為

### サービス変更・停止

#### 予告なく変更される場合

```typescript
const serviceChanges = {
  content: "予告なく変更される場合があります",
  features: "機能の追加・削除・変更",
  design: "デザイン・レイアウトの変更",

  majorChanges: {
    notification: "重要な変更は事前告知",
    method: "サイト上での告知・SNS",
    period: "原則1週間前",
  },

  serviceTermination: {
    notification: "30日前告知",
    dataBackup: "ユーザーデータのバックアップ機会提供",
    migration: "可能な限り移行支援",
  },
};
```

### 準拠法・管轄

#### 法的事項

- **準拠法**: 日本国法
- **管轄裁判所**: 東京地方裁判所
- **言語**: 日本語

### お問い合わせ

#### 利用規約・プライバシーポリシーに関する質問

```typescript
const contactInfo = {
  email: "rebuild.up.up@gmail.com",
  subject: "利用規約・プライバシーポリシーについて",
  responseTime: "1週間以内",

  businessHours: {
    timezone: "JST (UTC+9)",
    days: "平日（土日祝日除く）",
    hours: "9:00-18:00",
  },
};
```

### 更新履歴

#### 変更管理

```typescript
const changeLog = [
  {
    date: "2025-01-01",
    version: "1.0",
    changes: ["初版作成", "GDPR準拠対応", "個人情報保護法対応"],
  },
  // 将来の更新履歴
];
```

---

**最終更新**: 2025-01-01  
**関連ドキュメント**:

- [アクセシビリティ対応](./accessibility.md)
- [セキュリティ設計](../05-operations/security.md)
