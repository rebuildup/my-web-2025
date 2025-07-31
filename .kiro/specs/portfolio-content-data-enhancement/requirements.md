# Requirements Document

## Introduction

このプロジェクトは、現在のポートフォリオシステムのコンテンツデータ管理方式を大幅に改善するものです。データマネージャーの機能拡張、カテゴリーシステムの柔軟化、タグ管理の改善、日付設定の手動化、画像アップロード機能の拡張、マークダウンコンテンツの外部ファイル化、そしてvideo&designページの表示問題修正を含む包括的な改善を行います。

## Requirements

### Requirement 1

**User Story:** 管理者として、ポートフォリオアイテムに複数のカテゴリーを設定できるようにしたい。そうすることで、一つの作品をdevelopとdesignの両方のギャラリーに表示できる。

#### Acceptance Criteria

1. WHEN ポートフォリオアイテムを作成・編集する時 THEN システムは複数のカテゴリーを選択できるインターフェースを提供する SHALL
2. WHEN カテゴリーを複数選択する時 THEN システムは選択されたカテゴリーを配列として保存する SHALL
3. WHEN ギャラリーページでフィルタリングする時 THEN システムは該当するカテゴリーを含むアイテムを全て表示する SHALL
4. WHEN データを保存する時 THEN システムはカテゴリー配列の形式でデータを正しく保存する SHALL
5. IF 既存のデータが単一カテゴリー形式の場合 THEN システムは自動的に配列形式に変換する SHALL

### Requirement 2

**User Story:** 管理者として、新しい「Other」カテゴリーを追加したい。そうすることで、特定のカテゴリーに分類されない作品をAllギャラリーにのみ表示できる。

#### Acceptance Criteria

1. WHEN カテゴリー選択画面を表示する時 THEN システムはOtherカテゴリーを選択肢として表示する SHALL
2. WHEN Otherカテゴリーが選択された時 THEN システムはそのアイテムをAllギャラリーにのみ表示する SHALL
3. WHEN develop、video、video&designギャラリーを表示する時 THEN システムはOtherカテゴリーのアイテムを除外する SHALL
4. WHEN Allギャラリーを表示する時 THEN システムはOtherカテゴリーのアイテムも含めて表示する SHALL
5. WHEN フィルター機能を使用する時 THEN システムはOtherカテゴリーでのフィルタリングを提供する SHALL

### Requirement 3

**User Story:** 管理者として、タグ管理を改善したい。そうすることで、既存のタグを一覧表示し、新しいタグを簡単に作成できる。

#### Acceptance Criteria

1. WHEN タグ入力フィールドを表示する時 THEN システムは既存のタグ一覧を表示する SHALL
2. WHEN 既存のタグをクリックする時 THEN システムはそのタグを選択状態にする SHALL
3. WHEN 新しいタグを入力する時 THEN システムは新しいタグの作成を許可する SHALL
4. WHEN タグを保存する時 THEN システムは新しいタグをタグ一覧に追加する SHALL
5. WHEN タグ一覧を表示する時 THEN システムは使用頻度順またはアルファベット順でソートする SHALL

### Requirement 4

**User Story:** 管理者として、日付を手動で設定できるようにしたい。そうすることで、実際の制作日や公開日を正確に記録できる。

#### Acceptance Criteria

1. WHEN ポートフォリオアイテムを作成・編集する時 THEN システムは日付入力フィールドを提供する SHALL
2. WHEN 日付を手動で設定する時 THEN システムは日付ピッカーまたは手動入力を許可する SHALL
3. WHEN 日付が設定されていない時 THEN システムはデフォルトで現在日時を設定する SHALL
4. WHEN 日付を保存する時 THEN システムは設定された日付を正しい形式で保存する SHALL
5. WHEN 日付を表示する時 THEN システムは設定された日付を適切な形式で表示する SHALL

### Requirement 5

**User Story:** 管理者として、画像を変換せずにそのままアップロードできる項目を追加したい。そうすることで、オリジナルの画像品質を保持できる。

#### Acceptance Criteria

1. WHEN 画像アップロード画面を表示する時 THEN システムは「変換なし」オプションを提供する SHALL
2. WHEN 変換なしオプションを選択する時 THEN システムは画像を元の形式・品質のまま保存する SHALL
3. WHEN 変換なし画像をアップロードする時 THEN システムは適切なファイル名とパスで保存する SHALL
4. WHEN 変換なし画像を表示する時 THEN システムは元の品質で画像を表示する SHALL
5. WHEN ファイルサイズが大きい時 THEN システムは警告を表示するが、アップロードは許可する SHALL

### Requirement 6

**User Story:** 管理者として、マークダウンコンテンツを外部ファイルとして管理したい。そうすることで、長いコンテンツを効率的に編集・管理できる。

#### Acceptance Criteria

1. WHEN マークダウンコンテンツを作成する時 THEN システムは.mdファイルとして保存する SHALL
2. WHEN コンテンツデータを保存する時 THEN システムは.mdファイルのパスのみを保存する SHALL
3. WHEN マークダウンコンテンツを表示する時 THEN システムは.mdファイルを読み込んで表示する SHALL
4. WHEN .mdファイルを編集する時 THEN システムは適切なマークダウンエディターを提供する SHALL
5. WHEN .mdファイルが見つからない時 THEN システムは適切なエラーメッセージを表示する SHALL

### Requirement 7

**User Story:** ユーザーとして、video&designページでvideoとdesignの両方のカテゴリーの全ての画像が表示されることを期待する。そうすることで、映像とデザイン作品を統合して閲覧できる。

#### Acceptance Criteria

1. WHEN video&designページにアクセスする時 THEN システムはvideoカテゴリーのアイテムを表示する SHALL
2. WHEN video&designページにアクセスする時 THEN システムはdesignカテゴリーのアイテムを表示する SHALL
3. WHEN video&designページにアクセスする時 THEN システムはvideo&designカテゴリーのアイテムを表示する SHALL
4. WHEN 複数カテゴリーを持つアイテムがある時 THEN システムは重複を避けて一度だけ表示する SHALL
5. WHEN フィルター機能を使用する時 THEN システムは3つのカテゴリー全てに対してフィルタリングを適用する SHALL

### Requirement 8

**User Story:** 開発者として、データマネージャーの改善が既存の機能に影響を与えないことを確認したい。そうすることで、システムの安定性を保てる。

#### Acceptance Criteria

1. WHEN データ形式を変更する時 THEN システムは既存データとの後方互換性を保つ SHALL
2. WHEN 新機能を追加する時 THEN システムは既存のAPI呼び出しを正常に処理する SHALL
3. WHEN データを移行する時 THEN システムは既存データを新形式に正しく変換する SHALL
4. WHEN エラーが発生する時 THEN システムは適切なエラーハンドリングを行う SHALL
5. WHEN テストを実行する時 THEN システムは全ての既存テストが成功することを保証する SHALL

### Requirement 9

**User Story:** 開発者として、改善されたデータマネージャーが高いパフォーマンスを維持することを確認したい。そうすることで、ユーザーエクスペリエンスを向上できる。

#### Acceptance Criteria

1. WHEN 大量のデータを処理する時 THEN システムは適切なパフォーマンスを維持する SHALL
2. WHEN 画像ファイルを処理する時 THEN システムは効率的なファイル操作を行う SHALL
3. WHEN マークダウンファイルを読み込む時 THEN システムはキャッシュ機能を活用する SHALL
4. WHEN タグ検索を行う時 THEN システムは高速な検索結果を提供する SHALL
5. WHEN データベース操作を行う時 THEN システムは最適化されたクエリを実行する SHALL

### Requirement 10

**User Story:** 管理者として、改善されたデータマネージャーが使いやすいインターフェースを提供することを期待する。そうすることで、効率的にコンテンツを管理できる。

#### Acceptance Criteria

1. WHEN データマネージャーを開く時 THEN システムは直感的なユーザーインターフェースを表示する SHALL
2. WHEN 複数カテゴリーを選択する時 THEN システムは視覚的に分かりやすい選択インターフェースを提供する SHALL
3. WHEN タグを管理する時 THEN システムはドラッグ&ドロップまたはクリック操作を提供する SHALL
4. WHEN 日付を設定する時 THEN システムはカレンダーピッカーを提供する SHALL
5. WHEN エラーが発生する時 THEN システムは分かりやすいエラーメッセージを表示する SHALL
