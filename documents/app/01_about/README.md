# /about ルート仕様

`/about` は著者プロフィールやリンク集など、自己紹介関連のページで構成されます。

## ページ構成

| パス                        | 役割                       | 対応ファイル                 |
| --------------------------- | -------------------------- | ---------------------------- |
| `/about`                    | About トップページ (概要)  | `page.md`                    |
| `/about/profile/real`       | 本名プロフィール           | `profile/real/page.md`       |
| `/about/profile/handle`     | ハンドルネームプロフィール | `profile/handle/page.md`     |
| `/about/profile/AI`         | AIチャットプロフィール     | `profile/AI/page.md`         |
| `/about/card/real`          | 本名デジタル名刺           | `card/real/page.md`          |
| `/about/card/handle`        | ハンドルネームデジタル名刺 | `card/handle/page.md`        |
| `/about/links`              | リンクマップ               | `links/page.md`              |
| `/about/comission/develop`  | 開発依頼ページ             | `comission/develop/page.md`  |
| `/about/comission/video`    | 映像依頼ページ             | `comission/video/page.md`    |
| `/about/comission/estimate` | 料金計算機                 | `comission/estimate/page.md` |

## 共通仕様

### プロフィール情報

- **スキル**: デザイン(Photoshop, Illustrator, AdobeXD, Figma)、プログラミング言語(C, C++, C#, HTML, JavaScript, TypeScript, CSS)、技術スタック(React, NextJS, Tailwind CSS, p5js, PIXIjs, GSAP)、映像(AfterEffects, Aviult, PremierePro, Blender)、その他(Unity, Cubase)
- **基本情報**: 平成19年10月生、現役高専生(2025年7月現在)
- **自己紹介**: グラフィックデザイン、映像制作、個人開発など幅広く活動。やる気になれば何でもできるのが強み

### 本名プロフィール専用情報

- **経歴・学歴**: 2023/3 公立中学卒業、2023/4 高専入学、現在在学中
- **受賞歴**:
  - ~2023 市区学校美術展覧会 受賞多数
  - 2022/10 U-16プログラミングコンテスト山口大会2022 アイデア賞
  - 2023/10 U-16プログラミングコンテスト山口大会2023 技術賞 企業(プライムゲート)賞
  - 2024/3 中国地区高専コンピュータフェスティバル2024 ゲーム部門 1位

### 依頼関連

- **連絡方法**: メール(361do.sleep@gmail.com)またはXのDM
  - 開発依頼: @361do_sleep
  - 映像・デザイン依頼: @361do_design
- **料金体系**: 各依頼ページで公開

> サブページごとの詳細仕様はそれぞれの `page.md` を参照してください。
