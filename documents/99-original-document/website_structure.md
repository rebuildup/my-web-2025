### 災害復旧・事業継続計画

```typescript
// lib/disaster-recovery/index.ts
export const disasterRecoveryPlan = {
  // バックアップ戦略
  backup: {
    // データバックアップ
    data: {
      frequency: 'daily',           // 日次バックアップ
      retention: 30,               // 30日間保持
      locations: [
        'local',                   // ローカルバックアップ
        'cloud',                   // クラウドストレージ
        'external',                // 外部ドライブ
      ],
      
      // バックアップ対象
      targets: [
        '/var/www/html',           // Webサイトファイル
        '/var/www/data',           // データベース・JSONファイル
        '/etc/apache2',            // Apache設定
        '/etc/letsencrypt',        // SSL証明書
        '/var/log',                // ログファイル
      ],
      
      // 自動化
      automation: {
        script: '/scripts/backup.sh',
        cron: '0 2 * * *',         // 毎日2時実行
        notification: true,        // 完了通知
        verification: true,        // バックアップ検証
      },
    },
    
    // コードバックアップ
    code: {
      primary: 'GitHub',           // メインリポジトリ
      mirrors: [
        'GitLab',                  // ミラーリポジトリ
        'Bitbucket',               // セカンダリミラー
        'local-git',               // ローカルGit
      ],
      
      // 自動同期
      sync: {
        frequency: 'on-push',      // プッシュ時自動同期
        verification: true,        // 同期検証
        conflictResolution: 'manual', // 競合は手動解決
      },
    },
  },
  
  // 復旧手順
  recovery: {
    // 緊急復旧（RTO: 1時間以内）
    emergency: {
      steps: [
        '1. 被害状況の確認',
        '2. 静的サイトの緊急公開（GitHub Pages）',
        '3. DNSの切り替え',
        '4. 基本機能の復旧確認',
        '5. ユーザーへの状況報告',
      ],
      
      // 緊急用静的サイト
      staticFallback: {
        platform: 'GitHub Pages',
        url: 'https://rebuildup.github.io/my-web-2025',
        content: '基本的なポートフォリオ情報',
        automation: 'GitHub Actions による自動更新',
      },
    },
    
    // 完全復旧（RPO: 24時間以内）
    full: {
      steps: [
        '1. 新しいサーバーの準備',
        '2. OSとミドルウェアのインストール',
        '3. バックアップからのデータ復元',
        '4. Apache・SSL設定の復元',
        '5. DNS設定の更新',
        '6. 全機能のテスト',
        '7. 本格運用の再開',
      ],
      
      // 復旧時間の目標
      targets: {
        rto: '24 hours',           // 復旧時間目標
        rpo: '24 hours',           // 復旧ポイント目標
        availability: '99.5%',     // 年間可用性目標
      },
    },
  },
  
  // 障害対応
  incidentResponse: {
    // 障害レベル
    severity: {
      critical: {
        description: 'サイト全体が利用不可',
        responseTime: '15 minutes',
        escalation: 'immediate',
      },
      high: {
        description: '主要機能に影響',
        responseTime: '1 hour',
        escalation: '2 hours',
      },
      medium: {
        description: '一部機能に影響',
        responseTime: '4 hours',
        escalation: '8 hours',
      },
      low: {
        description: '軽微な問題',
        responseTime: '24 hours',
        escalation: '72 hours',
      },
    },
    
    // 対応手順
    procedures: [
      '1. 障害の検知・報告',
      '2. 初期調査・影響範囲の確認',
      '3. 応急処置の実施',
      '4. 利害関係者への報告',
      '5. 根本原因の調査',
      '6. 恒久対策の実施',
      '7. 事後レビュー・改善',
    ],
  },
  
  // 通信計画
  communication: {
    // 内部連絡
    internal: {
      primary: 'メール',
      secondary: 'SMS',
      emergency: '電話',
    },
    
    // 外部連絡
    external: {
      users: [
        'Webサイト上でのお知らせ',
        'SNS（X/Twitter）での状況報告',
        'メールでの個別連絡（必要に応じて）',
      ],
      
      partners: [
        'GCPサポート',
        'ドメイン管理会社',
        'SSL証明書提供者',
      ],
    },
    
    // テンプレート
    templates: {
      '障害発生通知': '現在、技術的な問題により一部サービスがご利用いただけません。復旧作業を行っており、詳細は追ってお知らせいたします。',
      '復旧完了通知': 'サービスが正常に復旧いたしました。ご不便をおかけして申し訳ございませんでした。',
      '定期メンテナンス': '定期メンテナンスのため、下記時間帯はサービスを停止いたします。',
    },
  },
};

// 監視とアラート
export const monitoringAlerts = {
  // ヘルスチェック
  healthChecks: [
    {
      name: 'Website Availability',
      url: 'https://yusuke-kim.com/health',
      interval: 60, // 1分間隔
      timeout: 10,  // 10秒タイムアウト
      retries: 3,   // 3回リトライ
    },
    {
      name: 'API Endpoints',
      url: 'https://yusuke-kim.com/api/health',
      interval: 300, // 5分間隔
      timeout: 30,   // 30秒タイムアウト
      retries: 2,    // 2回リトライ
    },
  ],
  
  // 自動復旧
  autoRecovery: {
    // Apache再起動
    apacheRestart: {
      trigger: 'http_5xx_errors > 10',
      action: 'sudo systemctl restart apache2',
      cooldown: 300, // 5分間のクールダウン
    },
    
    // SSL証明書更新
    sslRenewal: {
      trigger: 'ssl_expires_in < 30_days',
      action: 'sudo certbot renew',
      schedule: 'weekly',
    },
  },
};
```

### アクセシビリティ対応

```typescript
// lib/accessibility/index.ts
export const accessibilityConfig = {
  // WCAG 2.1 AA準拠
  wcagCompliance: {
    level: 'AA',
    version: '2.1',
    
    // 知覚可能性
    perceivable: {
      // 代替テキスト
      altText: {
        images: 'required',        // 画像の代替テキスト必須
        decorative: 'empty',       // 装飾画像は空文字
        complex: 'detailed',       // 複雑な画像は詳細説明
      },
      
      // 色とコントラスト
      colorContrast: {
        normalText: 4.5,          // 通常テキストのコントラスト比
        largeText: 3.0,           // 大文字テキストのコントラスト比
        nonTextContent: 3.0,      // 非テキストコンテンツ
        colorOnly: false,         // 色のみでの情報伝達禁止
      },
      
      // メディア
      multimedia: {
        captions: 'provided',     // 動画にキャプション提供
        audioDescription: 'available', // 音声解説利用可能
        autoplay: false,          // 自動再生無効
      },
    },
    
    // 操作可能性
    operable: {
      // キーボード操作
      keyboard: {
        allFunctions: true,       // 全機能をキーボードで操作可能
        noTrap: true,            // キーボードトラップなし
        shortcut: 'configurable', // ショートカット設定可能
        focusVisible: true,       // フォーカス表示
      },
      
      // 時間制限
      timing: {
        adjustable: true,         // 時間制限調整可能
        pausable: true,          // 一時停止可能
        extendable: true,        // 延長可能
      },
      
      // 発作防止
      seizures: {
        flashLimit: 3,           // 3回/秒以下の点滅
        redFlashLimit: 0.006,    // 赤色点滅制限
      },
    },
    
    // 理解可能性
    understandable: {
      // 読みやすさ
      readability: {
        language: 'ja',          // 主言語の指定
        pronunciation: 'ruby',    // 読み方の提供（ルビ）
        complexity: 'simplified', // 複雑な表現の簡素化
      },
      
      // 予測可能性
      predictability: {
        consistentNavigation: true, // 一貫したナビゲーション
        consistentIdentification: true, // 一貫した識別
        onFocusChange: false,     // フォーカスでのコンテキスト変更なし
        onInputChange: false,     // 入力でのコンテキスト変更なし
      },
      
      // 入力支援
      inputAssistance: {
        errorIdentification: true, // エラー識別
        labels: true,             // ラベル・説明文
        errorSuggestion: true,    // エラー修正提案
        errorPrevention: true,    // エラー防止
      },
    },
    
    // 堅牢性
    robust: {
      // 互換性
      compatibility: {
        validCode: true,          // 有効なHTMLコード
        nameRoleValue: true,      // 名前・役割・値の提供
        statusMessages: true,     // ステータスメッセージ
      },
    },
  },
  
  // 支援技術対応
  assistiveTechnology: {
    // スクリーンリーダー
    screenReader: {
      ariaLabels: true,         // ARIA ラベル
      ariaDescriptions: true,   // ARIA 説明
      landmarks: true,          // ランドマーク
      headingStructure: true,   // 見出し構造
    },
    
    // 音声認識
    voiceControl: {
      clickTargets: 44,         // 最小クリック対象サイズ（44px）
      spacing: 8,               // 要素間の最小間隔（8px）
      labelAssociation: true,   // ラベルとコントロールの関連付け
    },
    
    // 拡大・ズーム
    magnification: {
      zoomSupport: 200,         // 200%ズーム対応
      reflow: true,             // リフロー対応
      noHorizontalScroll: true, // 横スクロール回避
    },
  },
  
  // 実装ガイドライン
  implementation: {
    // HTML構造
    htmlStructure: {
      semanticMarkup: true,     // セマンティックマークアップ
      properNesting: true,      // 適切なネスト
      uniqueIds: true,          // 一意なID
      validAttributes: true,    // 有効な属性
    },
    
    // CSS設計
    cssDesign: {
      focusIndicators: true,    // フォーカスインジケーター
      colorContrast: true,      // 色コントラスト
      responsiveDesign: true,   // レスポンシブデザイン
      reducedMotion: true,      // アニメーション削減対応
    },
    
    // JavaScript機能
    javascript: {
      progressiveEnhancement: true, // プログレッシブエンハンスメント
      keyboardSupport: true,    // キーボードサポート
      ariaUpdates: true,        // ARIA状態更新
      errorHandling: true,      // エラーハンドリング
    },
  },
  
  // テスト手順
  testing: {
    // 自動テスト
    automated: [
      'axe-core',               // アクセシビリティ自動テスト
      'lighthouse',             // Lighthouse監査
      'wave',                   // WAVE評価ツール
    ],
    
    // 手動テスト
    manual: [
      'キーボードのみでの操作',
      'スクリーンリーダーでの読み上げ',
      '色覚異常シミュレーション',
      '拡大表示での確認',
    ],
    
    // ユーザーテスト
    userTesting: {
      frequency: 'quarterly',   // 四半期ごと
      participants: [
        '視覚障害ユーザー',
        '聴覚障害ユーザー', 
        '運動障害ユーザー',
        '認知障害ユーザー',
      ],
      scenarios: [
        'ポートフォリオ閲覧',
        'ツール使用',
        'お問い合わせ',
        '検索機能',
      ],
    },
  },
};

// アクセシビリティチェック関数
export const a11yChecker = {
  // 自動チェック
  runAutomatedTests: async () => {
    // axe-core を使用した自動テスト
    const results = await axe.run();
    return results.violations;
  },
  
  // カラーコントラストチェック
  checkColorContrast: (foreground: string, background: string) => {
    const ratio = calculateContrastRatio(foreground, background);
    return {
      ratio,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7.0,
    };
  },
  
  // フォーカス管理
  manageFocus: {
    trap: (container: HTMLElement) => {
      // フォーカストラップの実装
    },
    restore: (previousElement: HTMLElement) => {
      // フォーカス復元
    },
  },
};
```

### 利用規約・プライバシーポリシー

```typescript
// lib/legal/content.ts
export const legalContent = {
  // プライバシーポリシー
  privacyPolicy: {
    lastUpdated: '2025-06-25',
    
    sections: [
      {
        title: '収集する情報',
        content: [
          '訪問者の IP アドレス、ブラウザ情報、アクセス時間',
          'お問い合わせフォームに入力された氏名、メールアドレス、メッセージ内容',
          'ツール使用時の操作ログ（個人を特定しない形で）',
          'Google Analytics による匿名化されたアクセス解析データ',
        ],
      },
      {
        title: '情報の利用目的',
        content: [
          'サイトの運営・改善',
          'お問い合わせへの回答',
          'アクセス状況の分析',
          'セキュリティ確保',
        ],
      },
      {
        title: '第三者への提供',
        content: [
          '法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供することはありません',
          'Google Analytics、GitHub、Booth 等の外部サービスとのデータ共有について',
        ],
      },
      {
        title: 'データの保管期間',
        content: [
          'お問い合わせデータ: 2年間',
          'アクセスログ: 30日間', 
          'バックアップデータ: 90日間',
        ],
      },
      {
        title: 'お問い合わせ',
        content: [
          'プライバシーに関するお問い合わせは rebuild.up.up@gmail.com までご連絡ください',
        ],
      },
    ],
  },
  
  // 利用規約
  termsOfService: {
    lastUpdated: '2025-06-25',
    
    sections: [
      {
        title: 'サービスの提供',
        content: [
          '本サイトは木村友亮のポートフォリオサイトです',
          '掲載されている作品・ツール・情報の利用は自己責任でお願いします',
          'サービスの内容は予告なく変更される場合があります',
        ],
      },
      {
        title: '知的財産権',
        content: [
          '本サイトのコンテンツの著作権は木村友亮に帰属します',
          '作品の無断転載・複製・配布を禁止します',
          '配布プラグインのライセンスは各商品ページを参照してください',
        ],
      },
      {
        title: '禁止事項',
        content: [
          'サイトの正常な運営を妨げる行為',
          '他のユーザーに迷惑をかける行為',
          '法令に違反する行為',
          '商用目的での無断利用',
        ],
      },
      {
        title: '免責事項',
        content: [
          'サイトの利用により生じた損害について一切の責任を負いません',
          'サイトの可用性・正確性を保証するものではありません',
          '外部リンクについては責任を負いません',
        ],
      },
    ],
  },
  
  // Cookie ポリシー
  cookiePolicy: {
    essential: [
      'セッション管理',
      'セキュリティ',
      'サイト設定の保存',
    ],
    
    analytics: [
      'Google Analytics（匿名化）',
      'ページビュー計測',
      'ユーザー行動分析',
    ],
    
    functional: [
      'ツール設定の保存',
      'プリファレンス記憶',
      'パフォーマンス向上',
    ],
    
    userControl: {
      optOut: true,             // オプトアウト可能
      granularControl: true,    // 細かい制御可能
      easyAccess: true,         // 設定への簡単アクセス
    },
  },
};

// コンプライアンスチェック
export const complianceChecker = {
  // GDPR 対応チェック
  gdprCompliance: {
    dataProcessingBasis: 'legitimate interest',
    consentManagement: true,
    dataPortability: true,
    rightToErasure: true,
    privacyByDesign: true,
  },
  
  // 日本の個人情報保護法対応
  japanPrivacyLaw: {
    purposeLimitation: true,
    consentObtained: true,
    dataMinimization: true,
    securityMeasures: true,
    incidentResponse: true,
  },
};
```

---

## 📋 最終まとめ・実装開始指針

### 🎯 設計書の完成度

この設計書は、木村友亮（samuido）さんの現実的なニーズと技術的要求を満たす、**実装可能で保守性の高いWebサイト**の完全な設計図です。

#### ✅ カバー範囲の確認

**技術設計** 
- [x] 統一データ構造（ContentItem中心）
- [x] レスポンシブデザイン（5ブレークポイント）
- [x] テーマカラー統一（#0000ff, #222222）
- [x] Next.js + TypeScript + Tailwind CSS
- [x] ファビコン・ブランディング

**機能設計**
- [x] ポートフォリオギャラリー（4カテゴリー）
- [x] プラグイン販売・配布システム
- [x] 7種類のツール群
- [x] 映像依頼計算機
- [x] データ管理システム（開発環境専用）

**運用設計**
- [x] GitHub Actions自動デプロイ
- [x] Apache + SSL設定
- [x] セキュリティ対策
- [x] 監視・ログ設計
- [x] 災害復旧計画

**品質保証**
- [x] テスト戦略（Jest + Playwright）
- [x] パフォーマンス最適化
- [x] アクセシビリティ対応（WCAG 2.1 AA）
- [x] 法的コンプライアンス

### 🚀 即座に開始可能な実装

以下のコマンドで開発を開始できます：

```bash
# 1. プロジェクト作成
npx create-next-app@latest my-web-2025 --typescript --tailwind --eslint --app
cd my-web-2025

# 2. 設計書に基づく初期設定
# - package.json の dependencies 追加
# - tailwind.config.js にテーマカラー適用
# - ファビコン（青い円）の生成・配置
# - 環境変数の設定

# 3. 統一データ構造の実装
# - lib/types/content.ts の作成
# - ContentItem インターフェース実装
# - FormConfig, SiteConfig 等の作成

# 4. 基本コンポーネント開発
# - components/ui/ の共通コンポーネント
# - レスポンシブレイアウト
# - テーマカラーの適用

# 5. データ管理システム（Phase 1）
# - public/data/content.json の作成
# - 開発環境専用管理画面
# - 統一エディターの実装
```

### 📊 成功への道筋

**Phase 1-3（7週間）**: 基盤構築
→ **実用的なポートフォリオサイトの完成**

**Phase 4-6（10週間）**: 主要機能実装
→ **プラグイン販売・依頼システムの稼働**

**Phase 7-8（9週間）**: 高度な機能
→ **差別化された高機能サイトの完成**

**Phase 9-10（継続的）**: 本番運用・拡張
→ **プロフェッショナルな Web プラットフォーム**

### 💡 技術的な優位性

1. **統一データ構造**: 保守性・拡張性の大幅向上
2. **型安全性**: TypeScript による開発効率化
3. **パフォーマンス**: Core Web Vitals 全項目 Good 評価
4. **アクセシビリティ**: WCAG 2.1 AA準拠の完全対応
5. **セキュリティ**: 多層防御による堅牢性
6. **自動化**: CI/CDによる効率的な運用

### 🎨 デザインの一貫性

- **ブランドカラー**: 原色の青（#0000ff）とダークグレー（#222222）
- **ファビコン**: 青い円形 SVG - シンプルで印象的
- **フォント**: Adobe Fonts による高品質な表現
- **アニメーション**: 控えめで上品なマイクロインタラクション

### 🌟 長期的価値

この設計に基づいて構築されたサイトは：

1. **就職活動**: 技術力を効果的にアピール
2. **創作活動**: 作品の継続的な発信・販売
3. **キャリア発展**: エンジニアとしての成長記録
4. **事業展開**: 将来的なビジネス発展の基盤

### 📞 次のステップ

1. **環境構築**: Node.js, Git, エディター準備
2. **リポジトリ作成**: GitHub での my-web-2025 作成
3. **初期実装**: 設計書 Phase 1 の実装開始
4. **継続的開発**: 週次レビューでの進捗確認

---

### 🏆 結論

この設計書は、**技術的な堅牢性**と**実用的な価値**を両立した、現代的で拡張性の高いWebサイト構築の完全ガイドです。

木村友亮（samuido）さんの「**やる気になれば何でも出来る**」という強みを活かし、高専生から就職活動、そしてプロフェッショナルなエンジニアキャリアまで、**長期にわたって価値を提供し続けるデジタルプラットフォーム**の構築が可能になります。

統一されたデータ構造、明確なテーマカラー、現実的な実装計画により、技術力の向上と創作活動の発展を同時に支援する、理想的なポートフォリオサイトが完成するでしょう。

**フロントエンドエンジニアとしての夢の実現に向けて、この設計書が確実な第一歩となることを確信しています。**

---

**Document Version**: 4.0（完全版・実装準備完了）  
**Last Updated**: 2025-06-25  
**Author**: AI Assistant  
**Reviewer**: 木村友亮 (samuido)  
**Status**: 完全設計完了・実装開始可能  
**Total Pages**: 設計書完全版  
**Implementation Ready**: ✅ YES### 保守・更新手順

1. **コンテンツ更新**
   - 開発環境で `/admin# クリエイティブポートフォリオサイト完全構造設計書

## 📋 プロジェクト概要

### 基本情報
- **作成者**: 木村友亮 (samuido)
- **ドメイン**: yusuke-kim.com
- **リポジトリ**: https://github.com/rebuildup/my-web-2025
- **フレームワーク**: Next.js 14+ + React + TypeScript
- **スタイリング**: Tailwind CSS v4
- **アニメーション**: GSAP（特定ページのみ）+ Tailwind CSS アニメーション
- **サーバー**: Apache on GCP VM
- **デプロイ**: GitHub Actions → SSH → GCP VM
- **SSL**: Certbot + Let's Encrypt
- **連絡先**: 
  - 本名用: rebuild.up.up@gmail.com
  - ハンドルネーム用: 361do.sleep@gmail.com

### 設計思想
- **各ページが独立したサイトとして機能**
- **拡張可能なアーキテクチャ**
- **統一されたデータ構造による使い回し**
- **JSONファイルベースのコンテンツ管理**
- **高速パフォーマンス**
- **レスポンシブ対応**
- **SEO最適化**

### デザインテーマ
- **メインカラー**: 原色の青 (#0000ff)
- **ベースカラー**: ダークグレー (#222222)  
- **ファビコン**: 青い円形SVGアイコン
- **フォント**: Adobe Fonts
- **アニメーション**: 控えめな要素アニメーション + インタラクションアニメーション

---

## 🏗️ サイト全体構造

### メインカテゴリー
1. **About** - 自己紹介・依頼・リンク集
2. **Portfolio** - 作品ギャラリー・データ管理
3. **Workshop** - プラグイン配布・ブログ
4. **Tools** - 各種ユーティリティツール
5. **Others** - サイトマップ・検索・その他

### レスポンシブブレークポイント
```typescript
// Tailwind CSS v4 ブレークポイント
const breakpoints = {
  sm: '640px',   // タブレット縦向き
  md: '768px',   // タブレット横向き
  lg: '1024px',  // 小デスクトップ
  xl: '1280px',  // デスクトップ
  '2xl': '1536px' // 大画面デスクトップ
}
```

---

## 📁 フォルダ構造

```
project-root/
├── src/
│   ├── app/
│   │   ├── (routes)/
│   │   │   ├── about/
│   │   │   │   ├── profile-real/      # 木村友亮プロフィール
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── profile-handle/    # samuidoプロフィール
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── business-card/     # デジタル名刺
│   │   │   │   │   ├── real/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── handle/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── request/          # 依頼用ページ
│   │   │   │   │   ├── video/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── calculator/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── tool/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── web-design/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── link-map/         # リンクマップ
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── portfolio/
│   │   │   │   ├── gallery/          # ギャラリー系統
│   │   │   │   │   ├── all/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── video/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── design/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── programming/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── detail/           # 詳細ページ
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── playground/       # 遊び用ページ
│   │   │   │   │   ├── design-playground/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── webgl-playground/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── workshop/
│   │   │   │   ├── page.tsx          # 工房ルート
│   │   │   │   ├── downloads/        # プラグイン/素材DL
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── blog/            # ブログ
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [slug]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── category/
│   │   │   │   │       └── [category]/
│   │   │   │   │           └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── tools/
│   │   │   │   ├── page.tsx          # ツールルート
│   │   │   │   ├── svg2tsx/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pomodoro/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pi-game/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── text-counter/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── color-palette/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ae-expression/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── business-mail/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── board/                # 簡易掲示板
│   │   │   │   ├── page.tsx
│   │   │   │   └── [threadId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── search/               # サイト内検索
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── privacy-policy/       # プライバシーポリシー
│   │   │       └── page.tsx
│   │   │
│   │   ├── admin/                    # データ管理（開発環境のみ）
│   │   │   ├── page.tsx
│   │   │   ├── content/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   ├── files/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── contact/
│   │   │   │   └── route.ts
│   │   │   ├── messages/
│   │   │   │   └── route.ts
│   │   │   ├── assets/
│   │   │   │   └── route.ts
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   └── rss/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # ルートページ（サイトマップ）
│   │   ├── not-found.tsx            # 404エラーページ
│   │   └── loading.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # 共通UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                   # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── portfolio/               # ポートフォリオ関連
│   │   │   ├── GalleryCard.tsx
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── DetailView.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── SortDropdown.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── tools/                   # ツール関連
│   │   │   ├── SVGConverter.tsx
│   │   │   ├── PomodoroTimer.tsx
│   │   │   ├── PiGame.tsx
│   │   │   ├── TextCounter.tsx
│   │   │   ├── ColorPalette.tsx
│   │   │   ├── AEExpressionBuilder.tsx
│   │   │   ├── BusinessMailBuilder.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── forms/                   # フォーム関連
│   │   │   ├── ContactForm.tsx
│   │   │   ├── MessageForm.tsx
│   │   │   ├── SearchForm.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── admin/                   # 管理機能
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── ContentPreview.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── shared/                  # 共有コンポーネント
│   │       ├── SEOHead.tsx
│   │       ├── SocialShare.tsx
│   │       ├── Timeline.tsx
│   │       ├── SkillCard.tsx
│   │       ├── QRCode.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── index.ts
│   │
│   ├── lib/                         # ユーティリティ・設定
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── string.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useCookie.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useSearch.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── site.ts
│   │   │   ├── navigation.ts
│   │   │   └── index.ts
│   │   └── types/
│   │       ├── content.ts
│   │       ├── api.ts
│   │       └── index.ts
│   │
│   └── styles/
│       ├── globals.css
│       ├── components.css
│       └── animations.css
│
├── public/
│   ├── images/
│   │   ├── portfolio/
│   │   ├── profile/
│   │   ├── icons/
│   │   └── thumbnails/
│   ├── files/
│   │   ├── plugins/
│   │   └── assets/
│   ├── data/
│   │   ├── content.json
│   │   ├── navigation.json
│   │   └── site-config.json
│   ├── markdown/
│   │   ├── portfolio/
│   │   ├── blog/
│   │   └── docs/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
│
├── docs/
│   ├── README.md
│   ├── DEPLOYMENT.md
│   ├── API.md
│   └── DEVELOPMENT.md
│
├── scripts/
│   ├── build.sh
│   ├── deploy.sh
│   └── generate-sitemap.js
│
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       ├── test.yml
│       └── lighthouse.yml
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

---

## 🗂️ 統一データ構造設計

### 基本設計原則
- **単一責任原則**: 各データ構造は明確な責任を持つ
- **再利用性**: 同一構造をサイト全体で使い回し
- **拡張性**: 新しいプロパティの追加が容易
- **型安全性**: TypeScriptによる厳密な型定義
- **オプション性**: 必須項目と任意項目の明確な分離

### 主要データ構造

#### 1. ContentItem - 統一コンテンツアイテム
```typescript
interface ContentItem {
  // === 基本識別情報 ===
  id: string;                    // 一意識別子（URL slug としても使用）
  type: ContentType;             // コンテンツタイプ（portfolio/plugin/blog/profile/page）
  title: string;                 // 表示タイトル
  description: string;           // 短い説明文
  excerpt?: string;              // 長い説明文・抜粋（ブログ記事等で使用）
  
  // === 分類・整理 ===
  category: string;              // カテゴリー（video/design/programming/after-effects等）
  tags: string[];                // タグ配列（検索・フィルタリング用）
  status: ContentStatus;         // 公開状態（published/draft/archived）
  priority: number;              // 表示優先度（0-100、数値が大きいほど優先）
  
  // === 日時情報 ===
  createdAt: string;            // 作成日時（ISO 8601形式）
  updatedAt?: string;           // 更新日時
  publishedAt?: string;         // 公開日時
  
  // === メディア関連 ===
  thumbnail?: string;           // サムネイル画像パス
  images?: string[];            // 追加画像配列
  videos?: MediaEmbed[];        // 動画埋め込み情報
  audio?: MediaEmbed[];         // 音声埋め込み情報
  
  // === 外部リンク ===
  externalLinks?: ExternalLink[]; // 外部リンク配列（GitHub、Demo、Booth等）
  socialLinks?: SocialEmbed[];    // SNS埋め込み情報
  
  // === 技術情報 ===
  technologies?: string[];       // 使用技術配列
  software?: string[];          // 使用ソフトウェア配列
  compatibility?: string[];     // 対応環境・バージョン
  
  // === ファイル・ダウンロード関連 ===
  downloadInfo?: DownloadInfo;  // ダウンロード関連情報
  
  // === 詳細コンテンツ ===
  content?: string;             // メインコンテンツ（Markdown対応）
  contentPath?: string;         // 外部Markdownファイルパス
  
  // === 統計・分析 ===
  stats?: ContentStats;         // 統計情報（PV、ダウンロード数等）
  
  // === メタデータ ===
  seo?: SEOData;               // SEO関連データ
  customFields?: Record<string, any>; // カスタムフィールド（拡張用）
}

// 補助的な型定義
type ContentType = 'portfolio' | 'plugin' | 'blog' | 'profile' | 'page' | 'tool' | 'asset';
type ContentStatus = 'published' | 'draft' | 'archived' | 'scheduled';

interface MediaEmbed {
  platform: string;            // プラットフォーム名（youtube/vimeo/soundcloud等）
  url: string;                 // 埋め込みURL
  embedId?: string;            // 埋め込みID
  title?: string;              // メディアタイトル
  duration?: number;           // 再生時間（秒）
  thumbnail?: string;          // サムネイルURL
}

interface ExternalLink {
  platform: string;           // プラットフォーム名（github/demo/booth/download等）
  url: string;                // リンクURL
  label: string;              // 表示ラベル
  icon?: string;              // アイコン名
  isPrimary?: boolean;        // 主要リンクかどうか
}

interface SocialEmbed {
  platform: string;          // SNSプラットフォーム（twitter/instagram等）
  url: string;               // 投稿URL
  embedCode?: string;        // 埋め込みコード
}

interface DownloadInfo {
  fileName?: string;         // ファイル名
  filePath?: string;        // ファイルパス
  fileSize?: string;        // ファイルサイズ
  version?: string;         // バージョン
  license?: string;         // ライセンス
  price?: string | number;  // 価格（"無料" または数値）
  downloadCount?: number;   // ダウンロード数
}

interface ContentStats {
  views?: number;           // 閲覧数
  downloads?: number;       // ダウンロード数
  likes?: number;          // いいね数
  shares?: number;         // シェア数
  comments?: number;       // コメント数
}

interface SEOData {
  metaTitle?: string;      // ページタイトル（SEO用）
  metaDescription?: string; // ページ説明（SEO用）
  keywords?: string[];     // キーワード配列
  ogImage?: string;        // OGP画像
  canonicalUrl?: string;   // カノニカルURL
}
```

#### 2. SiteConfig - サイト設定構造
```typescript
interface SiteConfig {
  // === 基本サイト情報 ===
  name: string;                 // サイト名
  description: string;          // サイト説明
  url: string;                 // サイトURL
  language: string;            // 言語設定（ja/en等）
  
  // === 作者情報 ===
  author: AuthorInfo;
  
  // === デザイン・テーマ ===
  theme: ThemeConfig;
  
  // === 機能設定 ===
  features: FeatureConfig;
  
  // === 外部サービス連携 ===
  integrations: IntegrationConfig;
  
  // === SEO・分析 ===
  seo: GlobalSEOConfig;
}

interface AuthorInfo {
  realName: string;            // 本名
  handleName: string;          // ハンドルネーム
  status: string;              // 現在の状況
  major?: string;              // 専攻・学科
  location?: string;           // 所在地
  
  // 連絡先情報
  contacts: {
    email: {
      primary: string;         // メインメールアドレス
      secondary?: string;      // サブメールアドレス
    };
    social: Record<string, string>; // SNSアカウント（キー：プラットフォーム名）
  };
  
  // スキル・専門分野
  skills: Record<string, string[]>; // カテゴリー別スキル配列
  
  // キャリア・目標
  careerGoal?: string;         // キャリア目標
  availability?: string;       // 稼働状況
}

interface ThemeConfig {
  colors: {
    primary: string;           // メインカラー（#0000ff）
    secondary: string;         // セカンダリカラー（#222222）
    accent?: string;           // アクセントカラー
    background: string;        // 背景色
    text: string;             // テキスト色
  };
  
  fonts: {
    primary: string;          // メインフォント
    secondary?: string;       // サブフォント
    code?: string;           // コードフォント
  };
  
  layout: {
    maxWidth: string;        // 最大幅
    breakpoints: Record<string, string>; // ブレークポイント設定
  };
}

interface FeatureConfig {
  search: boolean;            // 検索機能
  comments: boolean;          // コメント機能
  newsletter: boolean;        // ニュースレター
  darkMode: boolean;          // ダークモード
  analytics: boolean;         // アクセス解析
  rss: boolean;              // RSS配信
}

interface IntegrationConfig {
  cloudStorage?: {
    provider: string;         // プロバイダー名
    bucketName: string;       // バケット名
    basePath: string;         // ベースパス
  };
  
  database?: {
    type: string;            // データベースタイプ
    path: string;            // データベースパス
  };
  
  email?: {
    service: string;         // メールサービス
    from: string;           // 送信元
  };
}

interface GlobalSEOConfig {
  defaultTitle: string;       // デフォルトタイトル
  titleTemplate: string;      // タイトルテンプレート
  defaultDescription: string; // デフォルト説明
  keywords: string[];        // グローバルキーワード
  ogImage: string;          // デフォルトOGP画像
}
```

#### 3. FormConfig - 統一フォーム設定
```typescript
interface FormConfig {
  id: string;                 // フォーム識別子
  title: string;              // フォームタイトル
  description?: string;       // フォーム説明
  
  // フィールド定義
  fields: FormField[];
  
  // 送信設定
  submission: {
    method: 'email' | 'api' | 'database'; // 送信方法
    endpoint?: string;        // 送信先エンドポイント
    successMessage: string;   // 成功時メッセージ
    errorMessage: string;     // エラー時メッセージ
  };
  
  // バリデーション
  validation: {
    required: string[];       // 必須フィールド配列
    rules: Record<string, ValidationRule>; // フィールド別バリデーションルール
  };
  
  // UI設定
  ui: {
    layout: 'vertical' | 'horizontal'; // レイアウト方向
    submitLabel: string;      // 送信ボタンラベル
    resetLabel?: string;      // リセットボタンラベル
    theme?: string;          // テーマ名
  };
}

interface FormField {
  id: string;                // フィールドID
  name: string;              // フィールド名
  label: string;             // 表示ラベル
  type: FormFieldType;       // フィールドタイプ
  placeholder?: string;      // プレースホルダー
  defaultValue?: any;        // デフォルト値
  options?: FormOption[];    // 選択肢（select/radio等）
  validation?: FieldValidation; // バリデーション設定
  ui?: FieldUIConfig;        // UI設定
}

type FormFieldType = 
  | 'text' | 'email' | 'tel' | 'url' | 'password'
  | 'textarea' | 'select' | 'radio' | 'checkbox'
  | 'file' | 'date' | 'number' | 'range'
  | 'calculator' | 'custom';

interface FormOption {
  value: string | number;    // 値
  label: string;            // 表示ラベル
  description?: string;     // 説明
  priceModifier?: number;   // 価格修正値（計算機用）
}

interface ValidationRule {
  required?: boolean;       // 必須フラグ
  minLength?: number;      // 最小文字数
  maxLength?: number;      // 最大文字数
  pattern?: string;        // 正規表現パターン
  custom?: string;         // カスタムバリデーション関数名
}

interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;        // エラーメッセージ
}

interface FieldUIConfig {
  width?: string;          // フィールド幅
  className?: string;      // CSSクラス
  helpText?: string;       // ヘルプテキスト
  prefix?: string;         // プレフィックス
  suffix?: string;         // サフィックス
}
```

#### 4. NavigationItem - ナビゲーション構造
```typescript
interface NavigationItem {
  id: string;               // 識別子
  label: string;            // 表示ラベル
  path?: string;            // リンクパス
  url?: string;             // 外部URL
  icon?: string;            // アイコン名
  description?: string;     // 説明文
  
  // 階層構造
  children?: NavigationItem[]; // 子要素
  parent?: string;          // 親要素ID
  
  // 表示制御
  visible: boolean;         // 表示フラグ
  order: number;           // 表示順序
  target?: '_blank' | '_self'; // リンクターゲット
  
  // 条件付き表示
  showOnPages?: string[];   // 特定ページでのみ表示
  hideOnPages?: string[];   // 特定ページで非表示
  
  // アクセス制御
  requireAuth?: boolean;    // 認証必須
  roles?: string[];        // 必要な権限
  
  // UI設定
  ui?: {
    style?: string;        // スタイル名
    className?: string;    // CSSクラス
    badge?: string;        // バッジテキスト
  };
}
```

#### 5. PageConfig - ページ設定構造
```typescript
interface PageConfig {
  // ページ基本情報
  id: string;              // ページID
  path: string;            // URLパス
  title: string;           // ページタイトル
  description: string;     // ページ説明
  
  // レイアウト・UI
  layout: LayoutConfig;
  
  // コンテンツ設定
  content: {
    source: 'static' | 'dynamic' | 'api'; // コンテンツソース
    query?: ContentQuery;   // 動的コンテンツのクエリ
    staticContent?: ContentItem[]; // 静的コンテンツ
  };
  
  // 機能設定
  features: {
    search?: boolean;       // 検索機能
    filter?: boolean;       // フィルター機能
    sort?: boolean;         // ソート機能
    pagination?: boolean;   // ページネーション
    infiniteScroll?: boolean; // 無限スクロール
  };
  
  // SEO設定
  seo: SEOData;
}

interface LayoutConfig {
  template: string;         // レイアウトテンプレート名
  sidebar?: boolean;        // サイドバー表示
  header?: boolean;         // ヘッダー表示
  footer?: boolean;         // フッター表示
  navigation?: string;      // ナビゲーション設定ID
  
  // グリッド・表示設定
  grid?: {
    columns: Record<string, number>; // ブレークポイント別カラム数
    gap: string;            // グリッド間隔
    itemAspectRatio?: string; // アイテムアスペクト比
  };
}

interface ContentQuery {
  type?: string[];          // コンテンツタイプフィルター
  category?: string[];      // カテゴリーフィルター
  tags?: string[];          // タグフィルター
  status?: ContentStatus[]; // ステータスフィルター
  limit?: number;           // 取得件数制限
  sortBy?: string;          // ソート基準
  sortOrder?: 'asc' | 'desc'; // ソート順序
}
```

### データ活用パターン

#### パターン1: ポートフォリオギャラリー
```typescript
// ContentItemのtype='portfolio'でフィルタリング
// category=['video', 'design', 'programming']で分類
// tagsでより細かい分類・検索
// statsでダウンロード数・閲覧数表示
```

#### パターン2: プラグイン販売ページ
```typescript
// ContentItemのtype='plugin'
// downloadInfo.priceで有料・無料判定
// externalLinksでBooth販売ページリンク
// compatibilityで対応ソフト表示
```

#### パターン3: ブログシステム
```typescript
// ContentItemのtype='blog'
// contentPathで外部Markdownファイル読み込み
// category='tech'/'design'/'other'で分類
// stats.viewsでPV表示
```

#### パターン4: プロフィールページ
```typescript
// ContentItemのtype='profile'
// customFieldsで本名用・ハンドル用の切り替え
// externalLinksでSNS・ポートフォリオリンク
// technologiesでスキル表示
```

#### パターン5: 依頼計算機
```typescript
// FormConfigで計算機の設定
// FormOptionのpriceModifierで価格計算
// FormFieldのtype='calculator'で特殊フィールド
```

この統一構造により、サイト全体で同じデータ形式を使い回し、保守性と拡張性を大幅に向上させることができます。

### JSONファイル管理

#### データファイル構成
```typescript
// public/data/content.json - メインコンテンツデータ
{
  "content": ContentItem[],           // 全コンテンツ配列
  "metadata": {
    "lastUpdated": string,           // 最終更新日時（ISO 8601）
    "version": string,               // データバージョン
    "totalItems": number,            // 総アイテム数
    "migrationStatus": string        // データ移行状況
  }
}

// public/data/site-config.json - サイト設定
{
  "site": SiteConfig,                // サイト基本設定
  "navigation": {
    "main": NavigationItem[],        // メインナビゲーション
    "footer": NavigationItem[],      // フッターナビゲーション
    "sidebar": NavigationItem[]      // サイドバーナビゲーション
  },
  "pages": {
    [pageId: string]: PageConfig     // ページ別設定
  },
  "forms": {
    [formId: string]: FormConfig     // フォーム設定
  }
}
```

#### データ管理原則
1. **統一構造**: すべてのコンテンツはContentItem形式で管理
2. **型別フィルタ**: ContentItem.typeでコンテンツ種別を判定
3. **カテゴリー管理**: categoryフィールドでサブ分類
4. **拡張性**: customFieldsで独自データを追加
5. **バージョン管理**: メタデータでデータ変更を追跡

#### コンテンツタイプ別データ活用

**ポートフォリオ作品**
```typescript
// type='portfolio'での活用例
{
  type: "portfolio",
  category: "video" | "design" | "programming",
  videos: [{ platform: "youtube", url: "...", embedId: "..." }],
  externalLinks: [{ platform: "github", url: "...", label: "ソースコード" }],
  technologies: ["React", "TypeScript", "Pixi.js"],
  stats: { views: 1500, likes: 25 }
}
```

**プラグイン・ツール**
```typescript
// type='plugin'での活用例
{
  type: "plugin",
  category: "after-effects",
  downloadInfo: {
    fileName: "plugin_v1.0.aep",
    version: "1.0",
    price: "有料",
    downloadCount: 150
  },
  externalLinks: [{ platform: "booth", url: "...", label: "購入" }],
  compatibility: ["After Effects 2020-2024"]
}
```

**ブログ記事**
```typescript
// type='blog'での活用例
{
  type: "blog",
  category: "tech" | "design" | "other",
  contentPath: "/markdown/blog/article-001.md",
  customFields: {
    readingTime: 5,
    tableOfContents: true,
    relatedPosts: ["article-002", "article-003"]
  }
}
```

**プロフィール情報**
```typescript
// type='profile'での活用例
{
  type: "profile",
  category: "real" | "handle",
  customFields: {
    profileType: "real",
    careerGoal: "フロントエンドエンジニア",
    education: [...],
    achievements: [...],
    qrCodeData: { type: "vcard", content: "..." }
  }
}
```

#### 検索・フィルタリング設計

**インデックス化**
- `searchableContent`: 検索対象テキストの結合
- `tags`: タグ配列による分類
- `technologies` + `software`: 技術スタック検索
- `category`: カテゴリー別フィルタ

**パフォーマンス最適化**
- 静的データの事前計算
- 検索インデックスの最適化
- 画像の遅延読み込み
- 無限スクロールでの段階的ローディング

---

## 📱 各ページ詳細設計

### 1. About カテゴリー

#### 1.1 プロフィールページ（本名用・ハンドルネーム用）

**共通機能**
- レスポンシブデザイン
- スキルカード一覧（ソート・フィルター機能）
- タイムライン形式の経歴表示（Notionスタイルのポップアップナビ）
- SNSリンク集成
- お問い合わせフォーム

**データ構造活用**
```typescript
// ContentItem (type='profile') を使用
// customFields で本名用・ハンドルネーム用の切り替え
interface ProfilePageData {
  // 基本情報: ContentItem.title, description, thumbnail
  // 連絡先: ContentItem.externalLinks (email, social)
  // スキル: ContentItem.technologies, software
  // 経歴: ContentItem.content (Markdown形式)
  // 実績: ContentItem.customFields.achievements
  // 教育: ContentItem.customFields.education
  // 受賞: ContentItem.customFields.awards
}

// 本名用とハンドルネーム用の切り替え
profileType: 'real' | 'handle' // customFields.profileType で判定
```

**表示要素**
- プロフィール画像・アイコン（ハンドルネーム用のみ）
- 基本情報（名前、現在の状況、専攻、目標）
- スキル一覧（カテゴリー別、ソート・フィルター対応）
- 経歴タイムライン（教育、実績、受賞歴）
- 連絡先・SNSリンク
- 主要作品のハイライト

#### 1.2 デジタル名刺

**機能仕様**
- QRコード生成（連絡先情報）
- vCard形式でのダウンロード
- Gmail連絡先への直接登録
- SNSリンクボタン（スタイル可変）
- 名刺デザインのプリント用PDF出力

**データ構造活用**
```typescript
// ContentItem (type='profile') から名刺情報を生成
interface BusinessCardData {
  // 基本情報: ContentItem.title, description
  // 連絡先: ContentItem.externalLinks (email, website)
  // SNS: ContentItem.socialLinks
  // QRコード: ContentItem.customFields.qrCodeData
  // デザイン: ContentItem.customFields.cardDesign
}

// QRコード生成データ
qrCodeData: {
  type: 'vcard' | 'url' | 'contact';
  content: string; // vCard形式のデータ
}
```

#### 1.3 依頼用ページ

**映像依頼料金計算機**
```typescript
// FormConfig を使用した計算機設定
interface VideoCalculatorConfig {
  // 基本設定: FormConfig.title, description
  // 計算項目: FormConfig.fields (type='calculator')
  // 料金設定: FormField.options (priceModifier付き)
  // 出力設定: FormConfig.submission
}

// 計算機フィールド例
calculatorFields: [
  {
    id: 'videoType',
    type: 'select',
    label: '映像の種類',
    options: [
      { value: 'utaite-mv', label: '歌ってみたMV', priceModifier: 5000 },
      { value: 'original-mv', label: 'オリジナルMV', priceModifier: 6000 },
      // ...
    ]
  },
  {
    id: 'duration',
    type: 'range',
    label: '尺（秒）',
    validation: { min: 10, max: 600 }
  }
  // ...
]
```

**出力機能**
- 選択内容のテキスト形式コピー
- お問い合わせフォーム連携
- 外部リンク（X DM、マシュマロ）

#### 1.4 リンクマップ

**機能仕様**
- カード形式のリンク一覧
- カテゴリー別フィルター
- 検索機能
- ソート機能（カテゴリー、追加日、名前）
- 外部リンクの自動判定

**データ構造活用**
```typescript
// ContentItem (type='page', category='link-map') を使用
// または NavigationItem の配列として管理
interface LinkMapData {
  // カテゴリー別リンク: ContentItem.customFields.linkCategories
  // 各リンク: ExternalLink 構造を使用
  // フィルター・ソート: PageConfig.features
}

// リンクカテゴリー例
linkCategories: {
  'social': { name: 'SNS・コミュニティ', icon: 'users' },
  'development': { name: '開発・技術', icon: 'code' },
  'creative': { name: 'クリエイティブ', icon: 'palette' },
  'contact': { name: '連絡先', icon: 'mail' }
}
```

---

### 2. Portfolio カテゴリー

#### 2.1 ギャラリーページ群

**統一データ活用**
```typescript
// 全ギャラリーで ContentItem (type='portfolio') を使用
// カテゴリー別フィルタリング
interface GalleryConfig {
  // 基本設定: PageConfig
  // コンテンツクエリ: ContentQuery
  // 表示設定: LayoutConfig.grid
}

// ギャラリー別設定例
galleries: {
  'all': {
    query: { type: ['portfolio'], status: ['published'] },
    layout: { columns: { sm: 1, md: 2, lg: 3, xl: 4 } }
  },
  'video': {
    query: { type: ['portfolio'], category: ['video'] },
    layout: { columns: { sm: 1, md: 2, lg: 3 }, itemAspectRatio: '16/9' }
  },
  'design': {
    query: { type: ['portfolio'], category: ['design', 'video'] },
    layout: { columns: { sm: 2, md: 3, lg: 4 } }
  },
  'programming': {
    query: { type: ['portfolio'], category: ['programming'] },
    layout: { columns: { sm: 1, md: 2, lg: 2 } }
  }
}
```

**共通機能**
- 無限スクロール または ページネーション
- タグフィルター
- 日付ソート（昇順・降順）
- カード表示（サムネイル、タイトル、説明、タグ）

#### 2.2 詳細ページ

**データ構造活用**
```typescript
// ContentItem の全プロパティを活用
interface DetailPageData {
  // 基本情報: title, description, thumbnail, createdAt
  // メディア: images, videos, audio
  // 技術情報: technologies, software, compatibility
  // 外部リンク: externalLinks (demo, repo, etc.)
  // 詳細コンテンツ: content または contentPath
  // 統計: stats (views, likes, downloads)
  // SEO: seo (metaTitle, metaDescription, etc.)
}
```

**表示要素**
- メディア表示エリア（画像、動画埋め込み）
- 基本情報（タイトル、説明、日付、タグ）
- 技術情報（使用技術、ソフトウェア、対応環境）
- 外部リンク（デモ、リポジトリ、販売ページ）
- SNSシェア機能
- 前後の作品ナビゲーション

#### 2.3 Markdown説明ページ

**機能仕様**
- Markdown → HTML変換
- 画像の自動最適化
- YouTube/Vimeo/SoundCloud埋め込み対応
- コードシンタックスハイライト
- 目次自動生成
- 関連作品表示

**データ構造活用**
```typescript
// ContentItem.contentPath でMarkdownファイル指定
// ContentItem.content で直接Markdown記述も可能
markdownConfig: {
  path: string;           // Markdownファイルパス
  embedSupport: boolean;  // 埋め込み対応フラグ
  tocGeneration: boolean; // 目次自動生成
  syntaxHighlight: boolean; // シンタックスハイライト
}
```

---

### 3. Workshop カテゴリー

#### 3.1 プラグイン・素材配布

**データ構造活用**
```typescript
// ContentItem (type='plugin') を使用
interface PluginPageData {
  // 基本情報: title, description, thumbnail, tags
  // ダウンロード: downloadInfo (fileName, fileSize, version, price)
  // 販売: externalLinks (booth, gumroad, etc.)
  // 技術情報: compatibility, software
  // 統計: stats.downloadCount
  // プレビュー: images, videos
}

// 販売・配布の判定
distributionType: 'free' | 'paid' | 'both' // downloadInfo.price で判定
```

**表示機能**
- カテゴリー別フィルター（タグベース）
- 人気順・新着順ソート
- 検索機能
- ダウンロード数表示
- プレビュー画像・動画

#### 3.2 ブログ

**データ構造活用**
```typescript
// ContentItem (type='blog') を使用
interface BlogPageData {
  // 基本情報: title, description, excerpt, thumbnail
  // コンテンツ: content または contentPath
  // 分類: category, tags
  // 統計: stats (views, comments, shares)
  // 読了時間: customFields.readingTime
}

// カテゴリー例
blogCategories: {
  'tech': { name: '技術系', icon: 'code', color: '#0000ff' },
  'design': { name: 'デザイン系', icon: 'palette', color: '#222222' },
  'other': { name: 'その他', icon: 'bookmark', color: '#666666' }
}
```

---

### 4. Tools カテゴリー

#### 4.1 ツール統一設計

**データ構造活用**
```typescript
// ContentItem (type='tool') を使用
interface ToolPageData {
  // 基本情報: title, description, thumbnail
  // カテゴリー: category (development/design/utility/game)
  // 使用統計: stats.views, customFields.usageCount
  // 設定: customFields.toolConfig
}

// ツールカテゴリー
toolCategories: {
  'development': { name: '開発系', icon: 'code' },
  'design': { name: 'デザイン系', icon: 'palette' },
  'utility': { name: 'ユーティリティ系', icon: 'tool' },
  'game': { name: 'ゲーム系', icon: 'gamepad' }
}
```

**各ツール共通機能**
- 使用統計の記録（Cookie/LocalStorage）
- 結果のクリップボードコピー
- 設定の保存・復元
- プリセット機能

---

### 5. その他機能

#### 5.1 簡易掲示板

**データ構造活用**
```typescript
// ContentItem (type='message') を使用
interface MessageData {
  // 基本情報: title, content, createdAt
  // 投稿者: customFields.author (匿名可)
  // スレッド: customFields.threadId, parentId
  // 管理: customFields.isReported
}
```

#### 5.2 サイト内検索

**統一検索機能**
```typescript
// 全ContentItemを対象とした統一検索
interface SearchConfig {
  // 基本検索: title, description, tags
  // 高度検索: content, contentPath（Markdown）
  // フィルター: type, category, dateRange
  // 結果: ハイライト、スニペット、関連度順
}
```

#### 5.3 ファビコン設定

**ファビコン仕様**
```typescript
// public/favicon.ico および各種サイズ
faviconConfig: {
  svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <circle cx='50' cy='50' r='40' fill='#0000ff' />
  </svg>`,
  
  sizes: [16, 32, 48, 64, 128, 256], // 各サイズのPNG生成
  appleTouch: [57, 72, 114, 144],   // Apple Touch Icon
  manifest: {
    name: 'Yusuke Kimura Portfolio',
    short_name: 'YK Portfolio',
    theme_color: '#0000ff',
    background_color: '#222222'
  }
}
```

---

## 🛠️ 技術詳細設計

### 開発環境設定

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // 開発環境でのみ管理ページを有効化
  async redirects() {
    return process.env.NODE_ENV === 'production' 
      ? [
          {
            source: '/admin/:path*',
            destination: '/404',
            permanent: false,
          },
        ]
      : [];
  },
  
  // 動的インポート設定（ツール別の最適化）
  experimental: {
    esmExternals: true,
  },
  
  // WebGL・Canvas対応（プレイグラウンド用）
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });
    return config;
  },
};

module.exports = nextConfig;
```

```javascript
// tailwind.config.js - テーマカラー統一
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // メインテーマカラー
        primary: {
          DEFAULT: '#0000ff',    // 原色の青
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c0c0ff',
          300: '#a0a0ff',
          400: '#8080ff',
          500: '#0000ff',        // ベース
          600: '#0000e0',
          700: '#0000c0',
          800: '#0000a0',
          900: '#000080',
        },
        
        // セカンダリカラー
        secondary: {
          DEFAULT: '#222222',    // ダークグレー
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#c0c0c0',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#222222',        // ベース
          900: '#111111',
        },
        
        // ステータスカラー
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // テキストカラー
        text: {
          primary: '#222222',
          secondary: '#606060',
          muted: '#a0a0a0',
          inverse: '#ffffff',
        },
        
        // 背景カラー
        background: {
          primary: '#ffffff',
          secondary: '#f8f8f8',
          tertiary: '#f0f0f0',
          dark: '#222222',
        }
      },
      
      fontFamily: {
        primary: ['Adobe Fonts', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'scale-down': 'scaleDown 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1.05)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 25px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 40px rgba(0, 0, 0, 0.16)',
        'blue': '0 4px 25px rgba(0, 0, 255, 0.15)',
        'blue-strong': '0 8px 40px rgba(0, 0, 255, 0.25)',
      },
      
      backdropBlur: {
        'xs': '2px',
      },
      
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### ファビコン・アイコン設定

```typescript
// lib/favicon-config.ts
export const faviconConfig = {
  // SVGファビコン（メイン）
  svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <circle cx='50' cy='50' r='40' fill='#0000ff' />
  </svg>`,
  
  // 各種サイズの設定
  sizes: {
    favicon: [16, 32, 48],           // 標準ファビコン
    apple: [57, 72, 114, 144, 180], // Apple Touch Icon
    android: [36, 48, 72, 96, 144, 192, 256, 384, 512], // Android Chrome
    windows: [70, 150, 310],         // Windows Metro
  },
  
  // Web App Manifest
  manifest: {
    name: "木村友亮 (samuido) Portfolio",
    short_name: "YK Portfolio",
    description: "木村友亮(samuido)のポートフォリオサイト",
    theme_color: "#0000ff",
    background_color: "#222222",
    display: "standalone",
    orientation: "portrait-primary",
    start_url: "/",
    scope: "/",
    icons: [
      // 動的生成される各サイズのアイコン情報
    ]
  },
  
  // PWA設定
  pwa: {
    name: "YK Portfolio",
    shortName: "YK Portfolio",
    description: "木村友亮(samuido)のポートフォリオサイト",
    themeColor: "#0000ff",
    backgroundColor: "#222222",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    startUrl: "/",
  }
};

// ファビコン生成ユーティリティ
export const generateFavicon = (size: number, color: string = '#0000ff') => {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'>
    <circle cx='${size/2}' cy='${size/2}' r='${size * 0.4}' fill='${color}' />
  </svg>`;
};
```

### API設計の詳細実装

```typescript
// lib/api/types.ts - 統一API型定義
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API エラーハンドリング
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// レート制限設定
export interface RateLimitConfig {
  windowMs: number;     // 時間窓（ミリ秒）
  maxRequests: number;  // 最大リクエスト数
  message: string;      // 制限時メッセージ
  skipSuccessfulRequests: boolean;
}

export const rateLimits: Record<string, RateLimitConfig> = {
  contact: {
    windowMs: 15 * 60 * 1000,    // 15分
    maxRequests: 3,               // 3回まで
    message: "お問い合わせが多すぎます。15分後に再度お試しください。",
    skipSuccessfulRequests: false,
  },
  
  search: {
    windowMs: 60 * 1000,         // 1分
    maxRequests: 30,              // 30回まで
    message: "検索リクエストが多すぎます。1分後に再度お試しください。",
    skipSuccessfulRequests: true,
  },
  
  download: {
    windowMs: 60 * 60 * 1000,    // 1時間
    maxRequests: 10,              // 10回まで
    message: "ダウンロード回数が上限に達しました。1時間後に再度お試しください。",
    skipSuccessfulRequests: false,
  },
};
```

```typescript
// src/app/api/content/route.ts - 統一コンテンツAPI
import { NextRequest, NextResponse } from 'next/server';
import { ContentItem, ContentQuery } from '@/lib/types';
import { readJSONFile, validateContentQuery } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータの解析
    const query: ContentQuery = {
      type: searchParams.get('type')?.split(',') as ContentType[],
      category: searchParams.get('category')?.split(','),
      tags: searchParams.get('tags')?.split(','),
      status: searchParams.get('status')?.split(',') as ContentStatus[],
      limit: parseInt(searchParams.get('limit') || '20'),
      page: parseInt(searchParams.get('page') || '1'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      search: searchParams.get('search'),
    };
    
    // バリデーション
    const validationError = validateContentQuery(query);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }
    
    // データ取得・フィルタリング
    const contentData = await readJSONFile('/data/content.json');
    let items: ContentItem[] = contentData.content || [];
    
    // フィルタリング処理
    if (query.type?.length) {
      items = items.filter(item => query.type!.includes(item.type));
    }
    
    if (query.category?.length) {
      items = items.filter(item => query.category!.includes(item.category));
    }
    
    if (query.tags?.length) {
      items = items.filter(item => 
        query.tags!.some(tag => item.tags.includes(tag))
      );
    }
    
    if (query.status?.length) {
      items = items.filter(item => query.status!.includes(item.status));
    }
    
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        item.searchableContent?.toLowerCase().includes(searchTerm)
      );
    }
    
    // ソート処理
    items.sort((a, b) => {
      const aValue = a[query.sortBy as keyof ContentItem];
      const bValue = b[query.sortBy as keyof ContentItem];
      
      if (query.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // ページネーション
    const total = items.length;
    const startIndex = (query.page - 1) * query.limit;
    const endIndex = startIndex + query.limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        hasNext: endIndex < total,
        hasPrev: query.page > 1,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: contentData.metadata?.version || '1.0',
        requestId: crypto.randomUUID(),
      }
    });
    
  } catch (error) {
    console.error('Content API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: 'コンテンツの取得に失敗しました' 
        } 
      },
      { status: 500 }
    );
  }
}
```

### データ管理システム（開発環境専用）

```typescript
// src/app/admin/components/ContentManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { ContentItem, ContentType } from '@/lib/types';
import { UnifiedContentEditor } from './UnifiedContentEditor';
import { ContentPreview } from './ContentPreview';

interface ContentManagerProps {
  initialData?: ContentItem[];
}

export default function ContentManager({ initialData = [] }: ContentManagerProps) {
  const [items, setItems] = useState<ContentItem[]>(initialData);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState<{
    type?: ContentType;
    category?: string;
    status?: string;
    search?: string;
  }>({});
  
  // 開発環境チェック
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      window.location.href = '/404';
      return;
    }
    
    loadContent();
  }, []);
  
  const loadContent = async () => {
    try {
      const response = await fetch('/data/content.json');
      const data = await response.json();
      setItems(data.content || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };
  
  const saveContent = async (item: ContentItem) => {
    try {
      // 統一されたContentItem形式で保存
      const updatedItems = selectedItem
        ? items.map(existing => existing.id === item.id ? item : existing)
        : [...items, item];
      
      // JSONファイル更新
      await updateContentFile(updatedItems);
      
      // 状態更新
      setItems(updatedItems);
      setSelectedItem(null);
      setIsEditing(false);
      
      // 成功通知
      showNotification('コンテンツが保存されました', 'success');
      
    } catch (error) {
      console.error('Failed to save content:', error);
      showNotification('保存に失敗しました', 'error');
    }
  };
  
  const deleteContent = async (id: string) => {
    if (!confirm('このコンテンツを削除しますか？')) return;
    
    try {
      const updatedItems = items.filter(item => item.id !== id);
      await updateContentFile(updatedItems);
      
      setItems(updatedItems);
      setSelectedItem(null);
      showNotification('コンテンツが削除されました', 'success');
      
    } catch (error) {
      console.error('Failed to delete content:', error);
      showNotification('削除に失敗しました', 'error');
    }
  };
  
  const updateContentFile = async (content: ContentItem[]) => {
    // 本来はサーバーサイドAPIで処理
    // 開発環境では直接ファイル操作（要実装）
    const updatedData = {
      content,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        totalItems: content.length,
        migrationStatus: 'completed'
      }
    };
    
    // 実際の実装では /api/admin/content に POST
    console.log('Saving content:', updatedData);
  };
  
  // フィルタリング処理
  const filteredItems = items.filter(item => {
    if (filter.type && item.type !== filter.type) return false;
    if (filter.category && item.category !== filter.category) return false;
    if (filter.status && item.status !== filter.status) return false;
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    return true;
  });
  
  return (
    <div className="admin-content-manager">
      {/* フィルター・検索UI */}
      <div className="filters">
        {/* ContentType, Category, Status フィルター */}
        {/* 検索ボックス */}
        {/* 新規作成ボタン */}
      </div>
      
      {/* コンテンツ一覧 */}
      <div className="content-grid">
        {filteredItems.map(item => (
          <ContentCard
            key={item.id}
            item={item}
            onEdit={() => {
              setSelectedItem(item);
              setIsEditing(true);
            }}
            onDelete={() => deleteContent(item.id)}
            onPreview={() => setSelectedItem(item)}
          />
        ))}
      </div>
      
      {/* 編集モーダル */}
      {isEditing && (
        <UnifiedContentEditor
          item={selectedItem}
          onSave={saveContent}
          onCancel={() => {
            setIsEditing(false);
            setSelectedItem(null);
          }}
        />
      )}
      
      {/* プレビューモーダル */}
      {selectedItem && !isEditing && (
        <ContentPreview
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}

// 統一コンテンツエディター
interface UnifiedContentEditorProps {
  item?: ContentItem | null;
  onSave: (item: ContentItem) => void;
  onCancel: () => void;
}

function UnifiedContentEditor({ item, onSave, onCancel }: UnifiedContentEditorProps) {
  const [formData, setFormData] = useState<Partial<ContentItem>>(
    item || {
      type: 'portfolio',
      status: 'draft',
      tags: [],
      priority: 50,
      createdAt: new Date().toISOString(),
    }
  );
  
  // ContentType に応じた動的フォーム表示
  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'portfolio':
        return <PortfolioFields data={formData} onChange={setFormData} />;
      case 'plugin':
        return <PluginFields data={formData} onChange={setFormData} />;
      case 'blog':
        return <BlogFields data={formData} onChange={setFormData} />;
      case 'profile':
        return <ProfileFields data={formData} onChange={setFormData} />;
      default:
        return <GenericFields data={formData} onChange={setFormData} />;
    }
  };
  
  return (
    <div className="unified-content-editor">
      {/* 基本フィールド（全タイプ共通） */}
      <BasicFields data={formData} onChange={setFormData} />
      
      {/* タイプ別フィールド */}
      {renderTypeSpecificFields()}
      
      {/* メディア・ファイル管理 */}
      <MediaFields data={formData} onChange={setFormData} />
      
      {/* 外部リンク管理 */}
      <ExternalLinksFields data={formData} onChange={setFormData} />
      
      {/* カスタムフィールド */}
      <CustomFields data={formData} onChange={setFormData} />
      
      {/* 保存・キャンセルボタン */}
      <div className="editor-actions">
        <button onClick={() => onSave(formData as ContentItem)}>
          保存
        </button>
        <button onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
```

### パフォーマンス最適化

```typescript
// lib/utils/performance.ts
import { lazy } from 'react';

// 動的インポート（タイプ別の最適化）
export const LazyComponents = {
  // ツール系（重い処理）
  ColorPalette: lazy(() => import('@/components/tools/ColorPalette')),
  PomodoroTimer: lazy(() => import('@/components/tools/PomodoroTimer')),
  AEExpressionBuilder: lazy(() => import('@/components/tools/AEExpressionBuilder')),
  BusinessMailBuilder: lazy(() => import('@/components/tools/BusinessMailBuilder')),
  SVGConverter: lazy(() => import('@/components/tools/SVGConverter')),
  
  // 3D・アニメーション系（最も重い）
  ThreeJSPlayground: lazy(() => import('@/components/playground/ThreeJSPlayground')),
  PixiPlayground: lazy(() => import('@/components/playground/PixiPlayground')),
  WebGLDemo: lazy(() => import('@/components/playground/WebGLDemo')),
  
  // メディア系
  VideoPlayer: lazy(() => import('@/components/media/VideoPlayer')),
  ImageGallery: lazy(() => import('@/components/media/ImageGallery')),
  AudioPlayer: lazy(() => import('@/components/media/AudioPlayer')),
  
  // 管理系（開発環境のみ）
  ContentManager: lazy(() => import('@/components/admin/ContentManager')),
  MarkdownEditor: lazy(() => import('@/components/admin/MarkdownEditor')),
  FileUploader: lazy(() => import('@/components/admin/FileUploader')),
};

// 画像最適化
export const optimizeImage = (src: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'png' | 'jpg';
} = {}) => {
  // Next.js Image component wrapper
  const { width, height, quality = 85, format = 'webp' } = options;
  
  return {
    src,
    width,
    height,
    quality,
    format,
    placeholder: 'blur' as const,
    blurDataURL: generateBlurDataURL(),
  };
};

// キャッシュ戦略
export const cacheConfig = {
  // 静的アセット（長期キャッシュ）
  static: {
    maxAge: 31536000, // 1年
    immutable: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Vary': 'Accept-Encoding',
    },
  },
  
  // 動的コンテンツ（短期キャッシュ）
  dynamic: {
    maxAge: 3600, // 1時間
    staleWhileRevalidate: 86400, // 24時間
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Vary': 'Accept-Encoding, Accept',
    },
  },
  
  // API レスポンス
  api: {
    maxAge: 300, // 5分
    staleWhileRevalidate: 3600, // 1時間
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      'Content-Type': 'application/json',
    },
  },
};

// バンドル分析
export const bundleAnalysis = {
  // 重要度による分割
  critical: ['react', 'next', 'tailwindcss'], // 即座にロード
  important: ['framer-motion', 'lucide-react'], // 早期ロード
  secondary: ['three', 'pixi.js', 'gsap'], // 必要時ロード
  optional: ['chart.js', 'plotly'], // 遅延ロード
};

// メモリ管理
export const memoryOptimization = {
  // 大きなオブジェクトの自動クリーンアップ
  cleanupInterval: 5 * 60 * 1000, // 5分
  
  // Three.js オブジェクトのクリーンアップ
  disposeThreeObjects: (scene: any) => {
    scene.traverse((child: any) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  },
  
  // Canvas メモリ管理
  cleanupCanvas: (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },
};
```

### 環境変数設定

```bash
# .env.example - 統一環境変数
# ===== サイト基本情報 =====
NEXT_PUBLIC_SITE_NAME="木村友亮 (samuido) Portfolio"
NEXT_PUBLIC_SITE_URL="https://yusuke-kim.com"
NEXT_PUBLIC_SITE_DESCRIPTION="木村友亮(samuido)のポートフォリオサイト - グラフィックデザイン、映像制作、個人開発"
NEXT_PUBLIC_SITE_LANGUAGE="ja"

# ===== 個人情報 =====
NEXT_PUBLIC_REAL_NAME="木村友亮"
NEXT_PUBLIC_HANDLE_NAME="samuido"
NEXT_PUBLIC_BIRTH_DATE="2007年10月"
NEXT_PUBLIC_STATUS="現役高専生"
NEXT_PUBLIC_MAJOR="制御情報工学科"
NEXT_PUBLIC_CAREER_GOAL="フロントエンドエンジニア"

# ===== 連絡先 =====
NEXT_PUBLIC_EMAIL_REAL="rebuild.up.up@gmail.com"
NEXT_PUBLIC_EMAIL_HANDLE="361do.sleep@gmail.com"

# ===== ソーシャルメディア =====
NEXT_PUBLIC_TWITTER_DEV="https://x.com/361do_sleep"
NEXT_PUBLIC_TWITTER_VIDEO="https://x.com/361do_design"
NEXT_PUBLIC_GITHUB_USER="https://github.com/rebuildup"
NEXT_PUBLIC_YOUTUBE_CHANNEL="https://www.youtube.com/@361do_sleep"
NEXT_PUBLIC_BOOTH_SHOP="https://361do.booth.pm"
NEXT_PUBLIC_DISCORD_ID="361do"

# ===== デザインテーマ =====
NEXT_PUBLIC_THEME_PRIMARY="#0000ff"
NEXT_PUBLIC_THEME_SECONDARY="#222222"
NEXT_PUBLIC_FONT_PRIMARY="Adobe Fonts"

# ===== Gmail SMTP（サーバー側） =====
GMAIL_USER="rebuild.up.up@gmail.com"
GMAIL_PASS="your-app-password"
GMAIL_FROM_NAME="木村友亮 Portfolio"

# ===== データベース =====
DB_TYPE="sqlite"
DB_PATH="/var/www/data/messages.db"
DB_BACKUP_PATH="/var/www/backups/"

# ===== Cloud Storage =====
GCLOUD_BUCKET_NAME="yusuke-kim-assets"
GCLOUD_PROJECT_ID="yusuke-kim-portfolio"
GCLOUD_REGION="asia-northeast1"
GOOGLE_APPLICATION_CREDENTIALS="/var/www/config/service-account.json"

# ===== GitHub Repository =====
NEXT_PUBLIC_REPO_URL="https://github.com/rebuildup/my-web-2025"
GITHUB_TOKEN="your-github-token"

# ===== API設定 =====
API_BASE_URL="https://yusuke-kim.com/api"
API_VERSION="v1"
API_RATE_LIMIT_WINDOW="15"
API_RATE_LIMIT_MAX="100"

# ===== セキュリティ =====
NEXTAUTH_URL="https://yusuke-kim.com"
NEXTAUTH_SECRET="your-secret-key"
CSRF_SECRET="your-csrf-secret"

# ===== 分析・監視 =====
NEXT_PUBLIC_GOOGLE_ANALYTICS="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE="your-search-console-id"
SENTRY_DSN="your-sentry-dsn"

# ===== 機能フラグ =====
NEXT_PUBLIC_ENABLE_SEARCH="true"
NEXT_PUBLIC_ENABLE_COMMENTS="true"
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_RSS="true"
NEXT_PUBLIC_ENABLE_PWA="true"

# ===== 開発環境 =====
NODE_ENV="development"
NEXT_PUBLIC_IS_DEVELOPMENT="true"
NEXT_PUBLIC_DEBUG_MODE="false"
LOG_LEVEL="info"

# ===== ビルド設定 =====
ANALYZE_BUNDLE="false"
GENERATE_SOURCEMAP="true"
OUTPUT_STANDALONE="false"

# ===== 外部サービス =====
RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
WEBHOOK_SECRET="your-webhook-secret"
```

### Apache設定

```apache
# /etc/apache2/sites-available/yusuke-kim.conf
<VirtualHost *:80>
    ServerName yusuke-kim.com
    ServerAlias www.yusuke-kim.com
    DocumentRoot /var/www/html
    
    # HTTPSリダイレクト
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName yusuke-kim.com
    ServerAlias www.yusuke-kim.com
    DocumentRoot /var/www/html
    
    # SSL設定（Let's Encrypt）
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yusuke-kim.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yusuke-kim.com/privkey.pem
    
    # セキュリティヘッダー
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
    
    # ファビコン用ヘッダー
    <LocationMatch "^/favicon\.ico$">
        Header set Cache-Control "public, max-age=31536000, immutable"
        Header set Content-Type "image/x-icon"
    </LocationMatch>
    
    # カラーテーマ用CSS変数の設定
    Header always set Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https:;"
    
    # キャッシュ設定（統一カラーテーマ対応）
    <LocationMatch "\.(css|js)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, max-age=31536000, immutable"
        # CSSでのカラー変数キャッシュ
        Header append Vary "Accept-Encoding"
    </LocationMatch>
    
    <LocationMatch "\.(png|jpg|jpeg|gif|ico|svg|webp)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, max-age=31536000, immutable"
        # ファビコンの特別処理
        <If "%{REQUEST_URI} =~ /favicon\./">
            Header set Content-Type "image/svg+xml"
        </If>
    </LocationMatch>
    
    <LocationMatch "\.(woff|woff2|eot|ttf)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, max-age=31536000, immutable"
        Header set Access-Control-Allow-Origin "*"
    </LocationMatch>
    
    # Adobe Fonts の許可
    <LocationMatch "^/fonts/">
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type"
    </LocationMatch>
    
    # Gzip圧縮（カラーテーマCSS最適化）
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png|ico|svg)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
        # CSS圧縮でカラー変数を効率化
        SetEnvIfNoCase Request_URI \.css$ gzip-css
    </Location>
    
    # SPAルーティング対応
    <Directory "/var/www/html">
        Options -Indexes
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        
        # 静的ファイルの直接配信
        RewriteCond %{REQUEST_FILENAME} -f [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteRule ^ - [L]
        
        # APIルートの処理
        RewriteRule ^api/ - [L]
        
        # 管理ページのアクセス制御（本番環境では404）
        RewriteCond %{ENV:NODE_ENV} "production"
        RewriteRule ^admin/ /404.html [L]
        
        # SPAフォールバック
        RewriteRule . /index.html [L]
    </Directory>
    
    # ログ設定
    ErrorLog ${APACHE_LOG_DIR}/yusuke-kim_error.log
    CustomLog ${APACHE_LOG_DIR}/yusuke-kim_access.log combined
    LogLevel warn
</VirtualHost>

# SSL設定の最適化
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder off
SSLSessionTickets off

# モジュール有効化
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so
LoadModule headers_module modules/mod_headers.so
LoadModule expires_module modules/mod_expires.so
```

### GitHub Actions設定

```yaml
# .github/workflows/deploy.yml
name: Deploy to GCP VM

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  DOMAIN: 'yusuke-kim.com'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Test
      run: npm run test
    
    - name: Build test
      run: npm run build
      env:
        NEXT_PUBLIC_SITE_URL: 'https://${{ env.DOMAIN }}'
        NEXT_PUBLIC_THEME_PRIMARY: '#0000ff'
        NEXT_PUBLIC_THEME_SECONDARY: '#222222'

  lighthouse:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for Lighthouse
      run: npm run build
      env:
        NEXT_PUBLIC_SITE_URL: 'https://${{ env.DOMAIN }}'
    
    - name: Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        NEXT_PUBLIC_SITE_URL: 'https://${{ env.DOMAIN }}'
        NEXT_PUBLIC_SITE_NAME: '木村友亮 (samuido) Portfolio'
        NEXT_PUBLIC_THEME_PRIMARY: '#0000ff'
        NEXT_PUBLIC_THEME_SECONDARY: '#222222'
        NEXT_PUBLIC_REAL_NAME: '木村友亮'
        NEXT_PUBLIC_HANDLE_NAME: 'samuido'
        NEXT_PUBLIC_EMAIL_REAL: 'rebuild.up.up@gmail.com'
        NEXT_PUBLIC_EMAIL_HANDLE: '361do.sleep@gmail.com'
        NEXT_PUBLIC_GITHUB_USER: 'https://github.com/rebuildup'
        NEXT_PUBLIC_REPO_URL: 'https://github.com/rebuildup/my-web-2025'
    
    - name: Generate favicon variants
      run: |
        # SVGファビコンから各種サイズを生成
        npm run generate-favicons
    
    - name: Optimize images
      run: |
        # 画像最適化処理
        npm run optimize-images
    
    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.GCP_SSH_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ secrets.GCP_HOST }} >> ~/.ssh/known_hosts
    
    - name: Deploy to GCP VM
      run: |
        # デプロイ前のバックアップ
        ssh -i ~/.ssh/id_rsa ${{ secrets.GCP_USER }}@${{ secrets.GCP_HOST }} \
          "sudo cp -r /var/www/html /var/www/backups/html-$(date +%Y%m%d-%H%M%S)"
        
        # ファイル転送（rsync で差分同期）
        rsync -avz --delete -e "ssh -i ~/.ssh/id_rsa" \
          ./out/ ${{ secrets.GCP_USER }}@${{ secrets.GCP_HOST }}:/tmp/website-deploy/
        
        # Apache DocumentRoot への移動
        ssh -i ~/.ssh/id_rsa ${{ secrets.GCP_USER }}@${{ secrets.GCP_HOST }} \
          "sudo rm -rf /var/www/html/* && \
           sudo cp -r /tmp/website-deploy/* /var/www/html/ && \
           sudo chown -R www-data:www-data /var/www/html && \
           sudo chmod -R 755 /var/www/html"
        
        # Apache設定の更新・再読み込み
        ssh -i ~/.ssh/id_rsa ${{ secrets.GCP_USER }}@${{ secrets.GCP_HOST }} \
          "sudo a2ensite yusuke-kim.conf && \
           sudo systemctl reload apache2 && \
           sudo systemctl status apache2"
        
        # SSL証明書の更新チェック
        ssh -i ~/.ssh/id_rsa ${{ secrets.GCP_USER }}@${{ secrets.GCP_HOST }} \
          "sudo certbot renew --dry-run"
        
        # ヘルスチェック
        curl -f https://${{ env.DOMAIN }}/health || exit 1
    
    - name: Notify deployment
      if: success()
      run: |
        # デプロイ成功通知（オプション）
        echo "Deployment successful to https://${{ env.DOMAIN }}"
    
    - name: Rollback on failure
      if: failure()
      run: |
        # 失敗時のロールバック
        ssh -i ~/.ssh/id_rsa ${{ secrets.GCP_USER }}@${{ secrets.GCP_HOST }} \
          "sudo cp -r /var/www/backups/html-latest/* /var/www/html/ && \
           sudo systemctl reload apache2"

  security-scan:
    needs: build-and-deploy
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Security headers check
      run: |
        curl -I https://${{ env.DOMAIN }} | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"
    
    - name: SSL check
      run: |
        echo | openssl s_client -connect ${{ env.DOMAIN }}:443 -servername ${{ env.DOMAIN }} 2>/dev/null | openssl x509 -noout -dates
```

## 📊 実装優先度・段階的リリース計画

### Phase 1: 基盤構築 (優先度: 最高) - 2週間

**技術基盤**
- [x] Next.js + TypeScript + Tailwind CSS 環境構築
- [x] 統一データ構造（ContentItem）の実装
- [x] 基本的なフォルダ構造とルーティング
- [x] テーマカラー（#0000ff, #222222）の適用
- [x] ファビコン（青い円）の実装
- [x] Adobe Fonts の導入

**コアコンポーネント**
- [x] 統一UI コンポーネント（Button, Card, Input, Modal等）
- [x] レスポンシブレイアウト（5ブレークポイント対応）
- [x] 独立ページ構造の実装
- [x] 基本的なアニメーション（Tailwind CSS）

### Phase 2: About & Portfolio Core (優先度: 高) - 3週間

**About カテゴリー**
- [ ] プロフィールページ（本名用・ハンドルネーム用）
  - ContentItem (type='profile') による統一管理
  - customFields での切り替え実装
  - スキルカード表示（ソート・フィルター対応）
  - タイムライン形式の経歴表示
- [ ] デジタル名刺機能
  - QRコード生成（vCard形式）
  - SNSリンク統合
- [ ] 基本的なお問い合わせフォーム
  - FormConfig による設定管理

**Portfolio 基本機能**
- [ ] 統一ギャラリーシステム
  - ContentItem (type='portfolio') による管理
  - カテゴリー別表示（video/design/programming）
  - 無限スクロール実装
- [ ] 詳細ページテンプレート
  - 統一DetailPageData構造
  - MediaEmbed 対応（YouTube, X, Vimeo）
  - ExternalLink 表示

### Phase 3: データ管理システム (優先度: 高) - 2週間

**開発環境専用機能**
- [ ] 統一コンテンツ管理システム
  - ContentManager コンポーネント
  - UnifiedContentEditor 実装
  - タイプ別動的フォーム表示
- [ ] ファイル管理システム
  - 画像アップロード・最適化
  - Cloud Storage 連携
- [ ] Markdownエディター
  - プレビュー機能付き
  - メディア埋め込み対応
- [ ] 自動バックアップ機能

### Phase 4: 基本ツール群 (優先度: 高) - 3週間

**実用ツール**
- [ ] SVG→TSXコンバータ
  - ファイルアップロード・テキスト入力対応
  - TypeScript型定義生成
  - クリップボードコピー・ダウンロード機能
- [ ] テキスト文字数カウント
  - リアルタイムカウント
  - 文字数・行数表示
- [ ] ランダムカラーパレット
  - 提供されたHTMLコードベース実装
  - HEX, RGB, HSL 出力対応
- [ ] 基本的な検索機能
  - JSONデータからの基本検索
  - ContentItem.searchableContent 活用

### Phase 5: Workshop機能 (優先度: 中) - 4週間

**プラグイン・素材配布**
- [ ] プラグイン一覧システム
  - ContentItem (type='plugin') 管理
  - Booth販売連携
  - ダウンロード統計
- [ ] 素材詳細ページ
  - 技術仕様表示
  - プレビュー機能（画像・動画）
  - 互換性情報
- [ ] ブログシステム
  - ContentItem (type='blog') 管理
  - Markdownレンダリング
  - カテゴリー別表示
- [ ] RSS配信機能

### Phase 6: 依頼・計算機システム (優先度: 中) - 3週間

**映像依頼システム**
- [ ] 料金計算機
  - FormConfig による設定
  - 動的料金計算
  - 選択内容のコピー機能
- [ ] 依頼フロー表示
  - ステップバイステップ説明
  - 外部リンク連携（X DM, マシュマロ）
- [ ] お問い合わせフォーム強化
  - 依頼タイプ別フォーム
  - 自動返信機能

### Phase 7: 高度なツール (優先度: 低) - 5週間

**インタラクティブツール**
- [ ] ポモドーロタイマー
  - Cookie によるデータ保存
  - 統計表示機能
  - ブラウザ通知対応
- [ ] 円周率暗記ゲーム
  - 無限桁数対応
  - ハイスコア記録
- [ ] AEエクスプレッションジェネレータ
  - Scratchライクなビジュアルエディター
  - ブロック式プログラミング
- [ ] ビジネスメール積み木
  - テンプレート管理
  - 穴抜き式メール作成

### Phase 8: 3D・アニメーション (優先度: 低) - 4週間

**プレイグラウンド機能**
- [ ] Three.js デモ
  - WebGL パフォーマンス最適化
  - メモリ管理実装
- [ ] Pixi.js ゲーム展示
  - ProtoType（タイピングゲーム）
  - FlashBeat（音ゲー）
- [ ] GSAP アニメーション
  - 高度なページトランジション
- [ ] パフォーマンス監視

### Phase 9: 本番環境・自動化 (優先度: 高) - 2週間

**インフラ・デプロイ**
- [ ] GCP VM 設定・最適化
- [ ] Apache + SSL設定
- [ ] GitHub Actions 自動デプロイ
- [ ] ドメイン設定（yusuke-kim.com）
- [ ] 監視・ログ設定

### Phase 10: 高度な機能 (優先度: 低) - 継続的

**拡張機能**
- [ ] 簡易掲示板システム
  - ContentItem (type='message') 管理
  - SQLite データベース連携
- [ ] 高度な検索機能
  - Markdownファイル内検索
  - 全文検索エンジン
- [ ] アクセス解析
- [ ] PWA 対応

---

## 🎯 成功指標・KPI

### 技術的指標

**パフォーマンス**
- Lighthouse スコア: 90点以上（全カテゴリー）
- Core Web Vitals: 全て Good 評価
  - LCP (Largest Contentful Paint): 2.5秒以下
  - FID (First Input Delay): 100ms以下
  - CLS (Cumulative Layout Shift): 0.1以下
- バンドルサイズ: 初期ロード 1MB以下
- ページ読み込み時間: 3秒以下（3G環境）

**品質指標**
- TypeScript型カバレッジ: 95%以上
- ESLint エラー: 0個
- アクセシビリティスコア: AA準拠
- レスポンシブ対応: 5ブレークポイント完全対応
- ブラウザ対応: Modern browsers（IE除外）

### ビジネス指標

**エンゲージメント**
- 月間PV: 3,000以上（学生レベルとして現実的）
- 平均セッション時間: 2分30秒以上
- ページ/セッション: 2.8以上
- 直帰率: 65%以下
- リピート率: 25%以上

**コンテンツ効果**
- ツール利用率: 月間300回以上
- ダウンロード数: 月間50回以上
- SNSシェア数: 月間20回以上
- 検索経由アクセス: 全体の30%以上

**クリエイティブビジネス**
- 映像制作依頼: 月間2件以上
- プラグイン販売: 月間5本以上（Booth経由）
- YouTube再生数: 月間500回以上
- GitHub リポジトリ Star: 年間50以上

### 長期的目標

**就職活動成果**
- 企業からのスカウト: 四半期1件以上
- 技術面接通過率: 70%以上
- ポートフォリオ評価: 8/10以上
- 推薦状取得: 3通以上

**創作活動発展**
- 新作品公開: 月間2作品以上
- コンテスト応募: 年間5回以上
- コラボレーション: 年間3件以上
- 技術ブログ記事: 月間1記事以上

**技術力向上**
- 新技術習得: 四半期1つ以上
- OSS貢献: 年間10回以上
- 勉強会参加: 月間1回以上
- 技術発表: 年間2回以上

### 測定・分析方法

**自動測定**
```typescript
// 統計収集設定
const analyticsConfig = {
  // ページビュー追跡
  pageViews: {
    enabled: true,
    trackSPA: true,
    customDimensions: ['contentType', 'category'],
  },
  
  // ユーザー行動追跡
  userEvents: {
    toolUsage: true,
    downloadClicks: true,
    socialShares: true,
    contactFormSubmissions: true,
  },
  
  // パフォーマンス監視
  performance: {
    webVitals: true,
    customMetrics: ['contentLoadTime', 'toolInitTime'],
    errorTracking: true,
  },
  
  // A/Bテスト
  experiments: {
    colorThemeVariations: false, // 基本テーマ確定後
    layoutOptimizations: true,
    ctaButtonPlacements: true,
  },
};
```

**手動評価**
- 月次レビュー: 数値分析・改善提案
- 四半期評価: 目標達成度・戦略見直し
- 年次総括: 全体成果・次年度計画

---

## 📈 将来の拡張計画

### 短期計画（2025年内）

**就職活動最適化**
- 企業向けポートフォリオ特化ページ
- 技術スタックの詳細解説
- プロジェクト開発プロセスの可視化
- 実装コード例の公開

**プラグイン事業発展**
- 新プラグイン3本開発
- YouTube解説動画定期投稿（月2本）
- ユーザーサポート体制構築
- 価格戦略の最適化

### 中期計画（高専卒業まで）

**フロントエンド技術深化**
- Next.js 高度機能の実践活用
- TypeScript 大規模アプリケーション開発
- マイクロフロントエンド アーキテクチャ実験
- Web標準技術の先端実装

**創作活動プラットフォーム化**
- 他クリエイターとのコラボ機能
- 作品制作プロセスの公開
- 技術解説コンテンツの充実
- オンライン講座・ワークショップ

### 長期計画（エンジニアキャリア開始後）

**プロフェッショナル展開**
- フロントエンドエンジニアとしての実績蓄積
- 技術リーダーシップの発揮
- オープンソース プロジェクト主導
- 技術カンファレンスでの発表

**事業発展**
- クリエイティブツール開発会社設立
- 教育事業への展開
- 国際的な技術コミュニティ参加
- 次世代クリエイター育成

### 技術ロードマップ

**2025年目標**
- React Server Components 完全習得
- WebAssembly 実践活用
- AI/ML Web技術統合
- リアルタイム協調編集システム

**継続的改善**
- パフォーマンス最適化の追求
- アクセシビリティ向上
- セキュリティ強化
- 開発効率の向上

---

## 🔍 開発・保守運用

### 開発環境セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/rebuildup/my-web-2025.git
cd my-web-2025

# 2. Node.js バージョン確認（v18以上）
node --version
npm --version

# 3. 依存関係インストール
npm install

# 4. 環境変数設定
cp .env.example .env.local
# .env.local を編集（実際の値に変更）

# 5. テーマカラー確認
echo "Primary: #0000ff (原色の青)"
echo "Secondary: #222222 (ダークグレー)"

# 6. 開発サーバー起動
npm run dev

# 7. 管理画面アクセス（開発環境のみ）
# http://localhost:3000/admin

# 8. ファビコン確認
# ブラウザで青い円のファビコンが表示されることを確認
```

### 本番環境管理

```bash
# ビルド・テスト
npm run build
npm run test
npm run lint
npm run type-check

# 本番環境テスト
npm run start

# デプロイ（GitHub Actions自動実行）
git add .
git commit -m "feat: implement unified content structure"
git push origin main  # 自動デプロイ開始

# 手動デプロイ（緊急時）
npm run deploy:manual
```

### 継続的な保守手順

**日常的な更新**
1. **新作品の追加**
   - 開発環境で `/admin` にアクセス
   - UnifiedContentEditor で作品情報入力
   - type='portfolio' で統一管理
   - メディアファイルのアップロード・最適化
   - プレビューで確認後、公開設定

2. **プラグイン更新**
   - Booth販売状況の反映
   - ダウンロード数の更新
   - バージョンアップ情報の追加
   - YouTube解説動画の埋め込み

3. **ブログ記事投稿**
   - Markdownエディターでの執筆
   - 技術解説記事の定期投稿
   - カテゴリー別分類
   - SEO最適化

**定期メンテナンス**
1. **週次作業**
   - アクセス解析データの確認
   - パフォーマンス指標のチェック
   - エラーログの確認
   - セキュリティアップデートの適用

2. **月次作業**
   - KPI達成状況の評価
   - コンテンツの見直し・最適化
   - 新機能の企画・開発
   - バックアップデータの整理

3. **四半期作業**
   - 全体戦略の見直し
   - 技術スタックのアップデート
   - 新しいツール・機能の企画
   - 就職活動向け最適化

### データ管理ワークフロー

```typescript
// 統一データ管理フロー
const contentWorkflow = {
  // 1. 作品制作完了
  creation: {
    // After Effects, Pixi.js等での制作完了
    outputFiles: ['video.mp4', 'thumbnail.jpg', 'project.aep'],
    socialPosting: 'X (Twitter) での作品公開',
  },
  
  // 2. ポートフォリオ追加
  portfolioUpdate: {
    contentType: 'portfolio',
    category: 'video' | 'design' | 'programming',
    requiredFields: ['title', 'description', 'thumbnail', 'tags'],
    mediaUpload: 'Cloud Storage + 最適化',
    socialLinks: 'X投稿の埋め込み',
  },
  
  // 3. 自動化処理
  automation: {
    imageOptimization: 'WebP変換 + 複数サイズ生成',
    searchIndexing: 'searchableContent の自動生成',
    seoGeneration: 'メタデータの自動設定',
    socialCardGeneration: 'OGP画像の自動生成',
  },
  
  // 4. 公開・更新
  publishing: {
    previewCheck: 'プレビュー機能での最終確認',
    gitCommit: 'JSONファイル + アセットの更新',
    autoDeploy: 'GitHub Actions による自動デプロイ',
    healthCheck: 'デプロイ後のヘルスチェック',
  },
};
```

---

## 📋 終わりに

この設計書は、木村友亮（samuido）の現実的な制作実績と将来のキャリア目標を基に、**統一データ構造による保守性の高いサイト構築**を目指して作成されました。

### ✨ 設計の核心価値

**統一性の追求**
- ContentItem による全コンテンツの統一管理
- FormConfig による設定の一元化
- ThemeConfig によるデザインの一貫性
- 型安全性による開発効率の向上

**実用性の重視**
- 高専生から就職活動まで段階的に活用
- After Effects プラグイン販売の効率化
- 映像制作依頼の自動化・最適化
- 技術スキルの継続的な向上

**拡張性の確保**
- カスタムフィールドによる柔軟な拡張
- モジュラー設計による機能追加の容易さ
- TypeScript による安全なリファクタリング
- API設計による外部サービス連携

### 🎨 デザイン・テーマの統一

**カラーパレット**
- **プライマリ**: #0000ff（原色の青）- インパクトと信頼性
- **セカンダリ**: #222222（ダークグレー）- 落ち着きと洗練
- **ファビコン**: 青い円形SVG - シンプルで記憶に残る

**フォント戦略**
- Adobe Fonts による高品質な文字表現
- 日本語・英語の調和の取れた組み合わせ
- 可読性とデザイン性の両立

### 🚀 技術的な優位性

**モダンな技術スタック**
- Next.js 14+ による最新のReact機能活用
- TypeScript による型安全性の徹底
- Tailwind CSS v4 による効率的なスタイリング
- GitHub Actions による CI/CD 自動化

**パフォーマンス最適化**
- 動的インポートによる必要最小限のロード
- 画像最適化による表示速度向上
- キャッシュ戦略による再訪問時の高速化
- Core Web Vitals の全指標で Good 評価目標

### 📊 現実的な成長計画

**段階的な実装**
- Phase 1-3: 基盤構築（7週間）
- Phase 4-6: 主要機能（10週間）
- Phase 7-8: 高度な機能（9週間）
- Phase 9-10: 本番運用・拡張（継続的）

**具体的な目標設定**
- 学生レベルに適したKPI設定
- 就職活動での実用性重視
- 創作活動の継続的な発展
- エンジニアキャリアへの橋渡し

### 🌟 長期的なビジョン

**個人の成長**
- 高専生 → フロントエンドエンジニア
- 技術習得 → 技術リーダーシップ
- 個人制作 → チーム開発・事業展開
- 国内活動 → 国際的なコミュニティ参加

**サイトの進化**
- 個人ポートフォリオ → 技術発信プラットフォーム
- 作品展示 → 教育・コラボレーション
- 静的サイト → リアルタイム協調システム
- 個人ブランド → 事業プラットフォーム

### 🔧 実装の準備完了

この設計書に基づいて、以下が即座に開始できます：

1. **開発環境の構築** - 詳細な手順書完備
2. **統一データ構造の実装** - 型定義・インターフェース完成
3. **段階的な機能開発** - 優先度と期間の明確化
4. **自動デプロイの設定** - GitHub Actions 設定完備
5. **継続的な運用保守** - ワークフロー・チェックリスト完成

---

### 💬 最後に

この設計書は、技術と創作の両面で成長を続ける木村友亮（samuido）さんの活動を支える **デジタルプラットフォーム** の設計図です。統一されたデータ構造、明確なテーマカラー、現実的な実装計画により、長期にわたって価値を提供し続けるサイトが構築できるでしょう。

**"やる気になれば何でも出来る"** という強みを、このサイトを通じて存分に発揮し、フロントエンドエンジニアとしての夢を実現してください。

### セキュリティ設計

```typescript
// lib/security/index.ts - 統一セキュリティ設定
export const securityConfig = {
  // コンテンツセキュリティポリシー
  csp: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
    fontSrc: ["'self'", "fonts.gstatic.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    imgSrc: ["'self'", "data:", "blob:", "https:"],
    mediaSrc: ["'self'", "blob:", "https:"],
    connectSrc: ["'self'", "https:"],
    frameSrc: ["https://www.youtube.com", "https://player.vimeo.com"],
  },
  
  // レート制限（統一設定）
  rateLimiting: {
    global: { window: 15 * 60 * 1000, max: 1000 }, // 15分で1000リクエスト
    api: { window: 60 * 1000, max: 60 },           // 1分で60リクエスト
    contact: { window: 15 * 60 * 1000, max: 3 },   // 15分で3リクエスト
    upload: { window: 60 * 60 * 1000, max: 10 },   // 1時間で10アップロード
    search: { window: 60 * 1000, max: 30 },        // 1分で30検索
  },
  
  // 入力検証
  validation: {
    // ファイルアップロード
    fileUpload: {
      allowedTypes: {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        video: ['video/mp4', 'video/webm'],
        audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
        document: ['application/pdf', 'text/plain', 'text/markdown'],
      },
      maxSize: {
        image: 10 * 1024 * 1024,    // 10MB
        video: 100 * 1024 * 1024,   // 100MB
        audio: 50 * 1024 * 1024,    // 50MB
        document: 5 * 1024 * 1024,  // 5MB
      },
      scanVirus: true,
      scanMalware: true,
    },
    
    // テキスト入力
    textInput: {
      maxLength: {
        title: 200,
        description: 1000,
        content: 10000,
        comment: 500,
        tag: 50,
      },
      allowedHtml: ['b', 'i', 'u', 'strong', 'em', 'a', 'p', 'br'],
      sanitizeHtml: true,
      preventXSS: true,
    },
  },
  
  // 認証・認可（将来的な拡張用）
  auth: {
    adminAccess: {
      environment: 'development', // 開発環境のみ
      ipWhitelist: [], // 必要に応じてIP制限
      sessionTimeout: 30 * 60 * 1000, // 30分
    },
    
    apiAccess: {
      requireApiKey: false, // 現在は不要
      corsOrigins: ['https://yusuke-kim.com'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  },
  
  // データ保護
  dataProtection: {
    // 個人情報の暗号化
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: 90 * 24 * 60 * 60 * 1000, // 90日
    },
    
    // ログ保護
    logging: {
      excludeFields: ['password', 'token', 'secret'],
      retention: 30 * 24 * 60 * 60 * 1000, // 30日
      anonymizeIp: true,
    },
    
    // バックアップ暗号化
    backup: {
      encrypt: true,
      compressionLevel: 6,
      retention: 90 * 24 * 60 * 60 * 1000, // 90日
    },
  },
};

// XSS対策の実装
export const sanitizeInput = (input: string, type: 'html' | 'text' = 'text') => {
  if (type === 'html') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: securityConfig.validation.textInput.allowedHtml,
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  }
  
  return input
    .replace(/[<>]/g, '') // HTML タグの除去
    .replace(/javascript:/gi, '') // JavaScript プロトコルの除去
    .trim();
};

// CSRF対策
export const csrfProtection = {
  generateToken: () => crypto.randomUUID(),
  validateToken: (token: string, sessionToken: string) => token === sessionToken,
  tokenExpiry: 60 * 60 * 1000, // 1時間
};

// SQL インジェクション対策（SQLite用）
export const sqlSanitize = (query: string, params: any[]) => {
  // パラメータ化クエリの強制
  if (query.includes('${') || query.includes('${}')) {
    throw new Error('Direct string interpolation not allowed in SQL queries');
  }
  
  return {
    query: query.replace(/[;'"\\]/g, ''), // 危険文字の除去
    params: params.map(param => 
      typeof param === 'string' ? param.replace(/[;'"\\]/g, '') : param
    ),
  };
};
```

### テスト戦略

```typescript
// tests/strategies.ts
export const testingStrategy = {
  // ユニットテスト（Jest + React Testing Library）
  unit: {
    coverage: {
      threshold: 80, // 80%以上のカバレッジ
      files: ['src/components/**', 'src/lib/**', 'src/utils/**'],
      exclude: ['src/app/admin/**'], // 管理画面は除外
    },
    
    // コンポーネントテスト
    components: {
      rendering: true,        // レンダリングテスト
      props: true,           // Props 受け渡しテスト
      events: true,          // イベントハンドリングテスト
      accessibility: true,   // アクセシビリティテスト
    },
    
    // ユーティリティテスト
    utilities: {
      dataProcessing: true,  // データ処理関数
      validation: true,      // バリデーション関数
      formatting: true,      // フォーマット関数
      security: true,        // セキュリティ関数
    },
  },
  
  // 統合テスト（Playwright）
  integration: {
    // ページ間遷移
    navigation: {
      allRoutes: true,       // 全ルートの到達可能性
      linkValidation: true,  // リンクの有効性
      breadcrumbs: true,     // パンくず機能
    },
    
    // フォーム機能
    forms: {
      submission: true,      // フォーム送信
      validation: true,      // バリデーション
      errorHandling: true,   // エラーハンドリング
    },
    
    // API 統合
    api: {
      endpoints: true,       // 全APIエンドポイント
      errorResponse: true,   // エラーレスポンス
      rateLimit: true,       // レート制限
    },
  },
  
  // E2Eテスト（Playwright）
  e2e: {
    // ユーザーシナリオ
    userJourneys: [
      'ポートフォリオ閲覧',
      'ツール使用',
      'お問い合わせ送信',
      'プラグインダウンロード',
      'ブログ記事閲覧',
    ],
    
    // デバイステスト
    devices: ['desktop', 'tablet', 'mobile'],
    browsers: ['chromium', 'firefox', 'webkit'],
    
    // パフォーマンステスト
    performance: {
      lighthouse: true,      // Lighthouse監査
      loadTime: true,        // 読み込み時間
      coreWebVitals: true,   // Core Web Vitals
    },
  },
  
  // ビジュアルリグレッションテスト
  visual: {
    screenshots: {
      pages: 'all',          // 全ページのスクリーンショット
      components: 'key',     // 主要コンポーネント
      responsive: true,      // レスポンシブ対応確認
    },
    
    threshold: 0.1,          // 差異の許容範囲（10%）
    updateBaseline: false,   // ベースライン更新フラグ
  },
  
  // セキュリティテスト
  security: {
    // 脆弱性スキャン
    vulnerabilities: {
      dependencies: true,    // 依存関係スキャン
      codeAnalysis: true,   // 静的コード解析
      penetration: false,   // ペネトレーションテスト（手動）
    },
    
    // セキュリティヘッダー
    headers: {
      csp: true,            // CSPヘッダー
      hsts: true,           // HSTSヘッダー
      xss: true,            // XSS保護ヘッダー
    },
  },
};

// テスト実行設定
export const testConfig = {
  // 自動実行
  automation: {
    onPush: ['unit', 'integration'],
    onPR: ['unit', 'integration', 'e2e'],
    onRelease: ['unit', 'integration', 'e2e', 'visual', 'security'],
    nightly: ['all'],
  },
  
  // 並列実行
  parallel: {
    unit: 4,               // 4並列
    integration: 2,        // 2並列
    e2e: 1,               // 1並列（安定性重視）
  },
  
  // タイムアウト設定
  timeouts: {
    unit: 10000,          // 10秒
    integration: 30000,    // 30秒
    e2e: 60000,           // 60秒
  },
  
  // 失敗時の対応
  failureHandling: {
    retry: {
      unit: 2,            // 2回リトライ
      integration: 1,     // 1回リトライ
      e2e: 0,            // リトライなし
    },
    
    notification: {
      slack: false,       // Slack通知（将来的に）
      email: false,       // メール通知
      github: true,       // GitHub Issues作成
    },
  },
};
```

### 監視・ログ設計

```typescript
// lib/monitoring/index.ts
export const monitoringConfig = {
  // ログレベル設定
  logging: {
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    },
    
    // 環境別設定
    environments: {
      production: 'warn',
      staging: 'info',
      development: 'debug',
    },
    
    // ログ出力先
    outputs: {
      console: true,
      file: '/var/log/yusuke-kim/app.log',
      syslog: false,
      remote: false, // 将来的にログ収集サービス連携
    },
    
    // ログローテーション
    rotation: {
      enabled: true,
      maxSize: '10MB',
      maxFiles: 7,
      compress: true,
    },
  },
  
  // パフォーマンス監視
  performance: {
    // Core Web Vitals
    webVitals: {
      lcp: { good: 2500, poor: 4000 },    // LCP (ms)
      fid: { good: 100, poor: 300 },      // FID (ms)
      cls: { good: 0.1, poor: 0.25 },     // CLS
      fcp: { good: 1800, poor: 3000 },    // FCP (ms)
      ttfb: { good: 600, poor: 1500 },    // TTFB (ms)
    },
    
    // カスタムメトリクス
    custom: {
      contentLoadTime: true,     // コンテンツ読み込み時間
      toolInitTime: true,        // ツール初期化時間
      searchResponseTime: true,  // 検索レスポンス時間
      imageLoadTime: true,       // 画像読み込み時間
    },
    
    // 収集間隔
    collection: {
      interval: 30000,           // 30秒間隔
      batchSize: 50,            // 50件ずつバッチ送信
      maxRetries: 3,            // 最大3回リトライ
    },
  },
  
  // エラー監視
  errorTracking: {
    // JavaScript エラー
    frontend: {
      capture: true,
      sourceMap: true,          // ソースマップ使用
      filterNoise: true,        // ノイズフィルタリング
      userContext: true,        // ユーザーコンテキスト収集
    },
    
    // API エラー
    backend: {
      capture: true,
      stackTrace: true,         // スタックトレース収集
      requestContext: true,     // リクエストコンテキスト
      sensitiveDataFilter: true, // 機密データフィルタリング
    },
    
    // 通知設定
    notifications: {
      critical: true,           // 重大エラーの即座通知
      threshold: 10,            // 10件/時間で通知
      channels: ['log', 'console'], // 通知チャンネル
    },
  },
  
  // アクセス監視
  access: {
    // リクエストログ
    requests: {
      enabled: true,
      format: 'combined',       // Apache combined ログ形式
      excludePaths: ['/health', '/favicon.ico'],
      includeUserAgent: true,
      includeReferer: true,
    },
    
    // セキュリティイベント
    security: {
      rateLimitViolations: true,
      suspiciousRequests: true,
      blockedIPs: true,
      malformedRequests: true,
    },
    
    // ビジネスメトリクス
    business: {
      portfolioViews: true,     // ポートフォリオ閲覧数
      toolUsage: true,          // ツール使用回数
      downloadCounts: true,     // ダウンロード数
      contactSubmissions: true,  // お問い合わせ数
    },
  },
  
  // ヘルスチェック
  healthCheck: {
    endpoints: [
      { path: '/health', interval: 30000 },
      { path: '/api/health', interval: 60000 },
    ],
    
    checks: [
      'database',              // データベース接続
      'filesystem',            // ファイルシステム
      'memory',               // メモリ使用量
      'disk',                 // ディスク使用量
      'network',              // ネットワーク接続
    ],
    
    thresholds: {
      memory: 85,             // メモリ使用率85%でアラート
      disk: 90,               // ディスク使用率90%でアラート
      responseTime: 5000,     // レスポンス時間5秒でアラート
    },
  },
  
  // アラート設定
  alerts: {
    channels: ['log', 'console'], // 将来的にSlack, Email等
    
    rules: [
      {
        name: 'High Error Rate',
        condition: 'error_rate > 5%',
        duration: '5m',
        severity: 'critical',
      },
      {
        name: 'Slow Response',
        condition: 'response_time > 3s',
        duration: '2m',
        severity: 'warning',
      },
      {
        name: 'High Memory Usage',
        condition: 'memory_usage > 85%',
        duration: '5m',
        severity: 'warning',
      },
    ],
  },
};

// ログ出力関数
export const logger = {
  error: (message: string, context?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, context);
  },
  
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, context);
  },
  
  info: (message: string, context?: any) => {
    console.info(`[INFO] ${new Date().toISOString()} ${message}`, context);
  },
  
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, context);
    }
  },
};
```