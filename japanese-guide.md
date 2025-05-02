# Next.js ウェブサイト開発総合マニュアル

このマニュアルは、Next.js、Tailwind CSS、GSAP アニメーションを使用した静的ウェブサイトの構築についてのガイドです。プロジェクトの開発を進める際の参考資料として設計されています。

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [フォルダ構造](#フォルダ構造)
3. [プロジェクトのセットアップと実行](#プロジェクトのセットアップと実行)
4. [Tailwind CSS ガイド](#tailwind-cssガイド)
5. [ページルーティングとナビゲーション](#ページルーティングとナビゲーション)
6. [GSAP アニメーションの実装](#gsapアニメーションの実装)
7. [コンポーネント設計パターン](#コンポーネント設計パターン)
8. [静的エクスポートとデプロイ](#静的エクスポートとデプロイ)
9. [一般的な問題と解決策](#一般的な問題と解決策)

---

## プロジェクト概要

このプロジェクトは、Next.js 15.3.1、React 19.0.0、TypeScript を使用して構築された静的ウェブサイトです。GSAP アニメーションと Tailwind CSS によるスタイリングを特徴としています。このサイトは、Apache サーバーでのホスティング用に静的な HTML/CSS/JS ファイルとしてエクスポートされるように設計されています。

ウェブサイトには 4 つの主要セクションがあります：

- **About**：サイト所有者に関する情報
- **Portfolio**：作品やプロジェクトのショーケース
- **Workshop**：インタラクティブなデモや実験
- **Tools**：ユーティリティやリソース

---

## フォルダ構造

プロジェクト構造を理解することは効果的な開発に不可欠です。以下にプロジェクトの構成を説明します：

```
project-my-web/
├── public/               # 静的アセット（画像、フォントなど）
│   ├── fonts/            # Adobeフォント
│   └── images/           # サイト画像
├── src/                  # ソースコード
│   ├── components/       # 再利用可能なReactコンポーネント
│   │   ├── about/        # Aboutセクション専用コンポーネント
│   │   ├── common/       # 共有コンポーネント（ヘッダー、フッターなど）
│   │   ├── layout/       # レイアウトコンポーネント
│   │   ├── portfolio/    # Portfolioセクション専用コンポーネント
│   │   ├── tools/        # Toolsセクション専用コンポーネント
│   │   ├── ui/           # UIコンポーネントライブラリ
│   │   └── workshop/     # Workshopセクション専用コンポーネント
│   ├── lib/              # ユーティリティ関数、フックなど
│   │   └── animations/   # GSAPアニメーション設定
│   ├── pages/            # Next.jsページ（ファイルベースのルーティング）
│   │   ├── about/        # Aboutページ
│   │   ├── portfolio/    # Portfolioページ
│   │   ├── tools/        # Toolsページ
│   │   ├── workshop/     # Workshopページ
│   │   ├── _app.tsx      # カスタムAppコンポーネント
│   │   ├── _document.tsx # カスタムDocumentコンポーネント
│   │   ├── index.tsx     # ホームページ
│   │   └── 404.tsx       # 404ページ
│   ├── styles/           # グローバルスタイル
│   │   └── globals.css   # Tailwindディレクティブを含むグローバルCSS
│   └── types/            # TypeScript型定義
├── .gitignore            # Gitで無視するファイル
├── .htaccess             # Apacheサーバー設定
├── next.config.js        # Next.js設定
├── package.json          # プロジェクト依存関係とスクリプト
├── postcss.config.mjs    # PostCSS設定
├── tailwind.config.js    # Tailwind CSS設定
└── tsconfig.json         # TypeScript設定
```

### 主要フォルダの説明：

1. **public/**：処理せずに直接提供される静的アセットを含みます。

2. **src/components/**：より良いメンテナンス性のために機能/セクションごとに整理されています。

   - **ui/**：Button、Card などの汎用 UI コンポーネント。
   - **layout/**：Header、Footer などのサイト構造のコンポーネント。
   - 機能特有のフォルダ（about/、portfolio/など）にはそれらのセクションでのみ使用されるコンポーネントが含まれています。

3. **src/lib/**：ユーティリティ関数とカスタムフックを含みます。

   - **animation.ts**と**animationUtils.ts**：GSAP アニメーションのヘルパー関数。
   - **hooks/**：特定の機能のためのカスタム React フック。

4. **src/pages/**：Next.js はファイルベースのルーティングを使用するため、このディレクトリの各ファイルは自動的にルートになります。

   - **index.tsx**：ホームページ（/）
   - **\_app.tsx**：すべてのページのラッパーコンポーネント、レイアウトに似ています。
   - **\_document.tsx**：HTML 文書構造を変更するためのカスタム Document。
   - サブディレクトリはネストされたルートを作成します（例：/about/contact）。

5. **src/styles/**：Tailwind CSS のインポートを含むグローバル CSS ファイルを含みます。

---

## プロジェクトのセットアップと実行

### 前提条件

- Node.js 18.x 以降
- npm または yarn

### インストール

1. 依存関係をインストールします：

```bash
npm install
```

2. 開発サーバーを実行します：

```bash
npm run dev
```

3. [http://localhost:3000](http://localhost:3000)を開いてサイトを表示します。

### 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用にプロジェクトをビルド
- `npm run export` - 静的 HTML としてエクスポート（先にビルドを実行）
- `npm run serve-static` - エクスポートされた静的ファイルをローカルで提供
- `npm run lint` - ESLint を実行してコード品質をチェック
- `npm run clean` - ビルドディレクトリ（.next と out）を削除
- `npm run deploy` - ビルドしてデプロイの準備

---

## Tailwind CSS ガイド

Tailwind CSS はユーティリティファーストの CSS フレームワークで、マークアップ内で直接デザインを構築できます。プロジェクトでの効果的な使用方法を説明します：

### 基本的な使用法

Tailwind クラスは予測可能なパターンに従い、HTML 要素に直接適用されます：

```jsx
<div className="bg-white rounded-lg shadow-md p-6 mb-4">
  <h2 className="text-2xl font-bold text-gray-800 mb-2">タイトル</h2>
  <p className="text-gray-600">説明文がここに入ります。</p>
</div>
```

これにより、丸い角、影、パディングを持つ白いカードが作成され、適切なスタイリングを施したタイトルと説明が含まれます。

### 一般的なユーティリティクラス

#### レイアウト

- `container` - 画面サイズに基づいて最大幅を設定
- `flex`, `grid` - 表示モード
- `justify-center`, `items-center` - フレックス/グリッド内の配置
- `space-x-4`, `space-y-4` - 子要素間の水平/垂直間隔を追加

#### スペーシング

- `p-4` - すべての側面にパディング（1rem）
- `px-4` - 水平方向のパディング（左/右）
- `py-4` - 垂直方向のパディング（上/下）
- `pt-4`, `pr-4`, `pb-4`, `pl-4` - 上、右、下、左のパディング
- `m-4`, `mx-4`, `my-4`, `mt-4`など - マージン（パディングと同じパターン）

#### タイポグラフィ

- `text-sm`, `text-base`, `text-lg`, `text-xl`など - フォントサイズ
- `font-normal`, `font-medium`, `font-bold` - フォントの太さ
- `text-gray-500`, `text-primary-600` - テキストカラー
- `text-center`, `text-left`, `text-right` - テキストの配置

#### 背景と境界線

- `bg-white`, `bg-gray-100`, `bg-primary-500` - 背景色
- `rounded`, `rounded-lg`, `rounded-full` - 境界線の半径
- `border`, `border-2` - 境界線の幅
- `border-gray-200` - 境界線の色

#### インタラクティブ性

- `hover:bg-blue-600` - ホバー時にスタイルを適用
- `focus:ring` - フォーカス時にスタイルを適用
- `active:bg-blue-700` - アクティブ状態でスタイルを適用
- `transition` - CSS トランジションを有効にする
- `duration-300` - トランジションの持続時間を設定

### レスポンシブデザイン

Tailwind には異なる画面サイズ用の組み込みレスポンシブプレフィックスがあります：

- `sm:` - 640px 以上
- `md:` - 768px 以上
- `lg:` - 1024px 以上
- `xl:` - 1280px 以上
- `2xl:` - 1536px 以上

例：

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* コンテンツ */}
</div>
```

これにより、モバイルでは 1 列、中サイズの画面では 2 列、大きな画面では 3 列のグリッドが作成されます。

### カスタム設定

プロジェクトには`tailwind.config.js`にカスタマイズされた Tailwind 設定があります。主なカスタマイズには以下が含まれます：

1. **カスタムカラー**：

   ```js
   colors: {
     primary: {
       500: "#0075ff", // プライマリブルー
       // 他の色調...
     },
     // 他のカラーパレット...
   }
   ```

2. **カスタムフォントファミリー**：

   ```js
   fontFamily: {
     sans: ['"adobe-clean"', /* フォールバック... */],
     serif: ['"adobe-caslon-pro"', /* フォールバック... */],
     mono: ['"source-code-pro"', /* フォールバック... */],
   }
   ```

3. **カスタムアニメーション**：
   ```js
   animation: {
     "fade-in": "fadeIn 0.5s ease-out",
     "slide-up": "slideUp 0.5s ease-out",
     // 他のアニメーション...
   }
   ```

### コンポーネントでの Tailwind の使用

再利用可能なコンポーネントを作成する際、カスタマイズを許可するために`className`プロップを受け入れることができます：

```jsx
function Button({ children, className = "" }) {
  const baseClasses = "px-4 py-2 rounded-md font-medium";
  return <button className={`${baseClasses} ${className}`}>{children}</button>;
}

// 使用例
<Button className="bg-primary-500 text-white">クリック</Button>;
```

このパターンにより、コンポーネントはデフォルトのスタイリングを持ち、それを拡張または上書きすることができます。

### コンポーネントスタイル用の@apply

多くのクラスを持つ複雑なコンポーネントには、CSS で`@apply`を使用できます：

```css
/* CSSファイル内 */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600;
}
```

ただし、このプロジェクトでは主に`@apply`アプローチではなく、JSX 内での直接ユーティリティクラスを使用しています。

---

## ページルーティングとナビゲーション

Next.js はファイルベースのルーティングシステムを使用しており、`pages`ディレクトリ内のファイルは自動的にルートになります。

### 基本的なルーティング

- `pages/index.tsx` → `/` (ホームページ)
- `pages/about.tsx` → `/about`
- `pages/about/index.tsx` → `/about` (代替方法)
- `pages/about/contact.tsx` → `/about/contact`

### ページ間のリンク作成

ページ間を移動するには Next.js の`Link`コンポーネントを使用します：

```jsx
import Link from 'next/link';

// 基本的なリンク
<Link href="/about">About</Link>

// 追加のスタイリングを持つリンク
<Link href="/portfolio" className="text-primary-500 hover:text-primary-700">
  Portfolio
</Link>

// ネストされた子要素を持つリンク
<Link href="/tools" className="flex items-center">
  <Icon />
  <span>Tools</span>
</Link>
```

`<a>`タグの代わりに`Link`を使用する利点：

- クライアントサイドナビゲーション（より速いページ遷移）
- リンクされたページの自動プリフェッチ
- ページの完全な再読み込みなし

### プログラムによるナビゲーション

プログラムによるナビゲーションには`useRouter`フックを使用します：

```jsx
import { useRouter } from "next/router";

function BackButton() {
  const router = useRouter();

  return <button onClick={() => router.back()}>戻る</button>;
}

// 特定のルートに移動
function NavigateButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/about");
    // またはクエリパラメータを使用：
    // router.push('/search?q=nextjs');
  };

  return <button onClick={handleClick}>Aboutに移動</button>;
}
```

### 動的ルート

ポートフォリオアイテムなどの動的ページには、角括弧付きのファイルを作成します：

```
pages/portfolio/[slug].tsx
```

その後、動的パラメータにアクセスします：

```jsx
import { useRouter } from "next/router";

export default function PortfolioItem() {
  const router = useRouter();
  const { slug } = router.query;

  return <div>ポートフォリオアイテム: {slug}</div>;
}
```

### レイアウトパターン

このプロジェクトでは、各ページが共通レイアウトでラップされるレイアウトパターンを使用しています：

```jsx
// src/components/layout/Layout.tsx
export default function Layout({ children, title, description }) {
  return (
    <>
      <Meta title={title} description={description} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container-custom mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

// ページでの使用
export default function AboutPage() {
  return (
    <Layout
      title="About Me"
      description="私についての詳細"
    >
      {/* ページコンテンツ */}
    </Layout>
  );
}
```

### ナビゲーションメニューの作成

Header コンポーネントにはナビゲーションリンクが含まれています：

```jsx
const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Workshop", href: "/workshop" },
  { name: "Tools", href: "/tools" },
];

// リンクがアクティブかどうかを判断
const isActive = (path) => {
  if (path === "/") {
    return router.pathname === "/";
  }
  return router.pathname.startsWith(path);
};

// ナビゲーションリンクをレンダリング
{
  navigation.map((item) => (
    <Link
      key={item.name}
      href={item.href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive(item.href)
          ? "text-primary-500 bg-primary-50"
          : "text-gray-700 hover:text-primary-500 hover:bg-gray-50"
      }`}
      aria-current={isActive(item.href) ? "page" : undefined}
    >
      {item.name}
    </Link>
  ));
}
```

---

## GSAP アニメーションの実装

GSAP（GreenSock Animation Platform）は、このプロジェクトで使用されている強力なアニメーションライブラリで、滑らかなクロスブラウザアニメーションを提供します。

### 基本的な GSAP セットアップ

GSAP はコンポーネントでインポートおよび初期化されます：

```jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// GSAPプラグインを登録（クライアントサイドのみ）
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function AnimatedComponent() {
  const elementRef = useRef(null);

  useEffect(() => {
    // 要素をターゲットにしてアニメーション
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: 20 }, // 開始プロパティ
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" } // 終了プロパティ
      );
    }
  }, []);

  return <div ref={elementRef}>アニメーションします！</div>;
}
```

### 一般的な GSAP アニメーションパターン

#### 1. シンプルなフェードインアニメーション

```jsx
useEffect(() => {
  if (elementRef.current) {
    gsap.fromTo(
      elementRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }
}, []);
```

#### 2. 複数要素のスタガーアニメーション

```jsx
useEffect(() => {
  if (containerRef.current) {
    gsap.fromTo(
      containerRef.current.children, // すべての子要素をターゲット
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15, // 各子要素のアニメーションをずらす
        duration: 0.6,
        ease: "power2.out",
      }
    );
  }
}, []);
```

#### 3. スクロールトリガーアニメーション

```jsx
useEffect(() => {
  if (sectionRef.current) {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 80%", // 要素の上部がビューポートの上部から80%の位置に達したとき
      onEnter: () => {
        gsap.fromTo(
          sectionRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      },
      once: true, // アニメーションを一度だけ再生
    });
  }
}, []);
```

#### 4. ホバーアニメーション

```jsx
useEffect(() => {
  if (buttonRef.current) {
    // ホバータイムラインを作成
    const tl = gsap.timeline({ paused: true });
    tl.to(buttonRef.current, {
      scale: 1.05,
      boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      duration: 0.2,
      ease: "power2.out",
    });

    // イベントリスナーを追加
    const handleMouseEnter = () => tl.play();
    const handleMouseLeave = () => tl.reverse();

    buttonRef.current.addEventListener("mouseenter", handleMouseEnter);
    buttonRef.current.addEventListener("mouseleave", handleMouseLeave);

    // クリーンアップ
    return () => {
      if (buttonRef.current) {
        buttonRef.current.removeEventListener("mouseenter", handleMouseEnter);
        buttonRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }
}, []);
```

### アニメーションユーティリティライブラリ

このプロジェクトには再利用可能な関数を持つアニメーションユーティリティファイル（`src/lib/animation.ts`と`src/lib/animationUtils.ts`）が含まれています：

```jsx
// src/lib/animation.tsからの例
export const fadeIn = (
  element: HTMLElement,
  delay: number = 0,
  duration: number = 0.6
) => {
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: "power2.out",
    }
  );
};

// コンポーネントでの使用
import { fadeIn } from "@/lib/animation";

useEffect(() => {
  if (elementRef.current) {
    fadeIn(elementRef.current, 0.2, 0.8);
  }
}, []);
```

### カスタムアニメーションフック

このプロジェクトにはアニメーション用のカスタムフックが含まれています：

```jsx
// src/lib/hooks/useScrollAnimation.ts
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export const useScrollAnimation = (options = {}) => {
  const {
    type = "fadeIn",
    duration = 0.6,
    delay = 0,
    once = true,
    start = "top bottom-=100",
  } = options;

  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // アニメーションの実装...

    return () => {
      // クリーンアップ...
    };
  }, [type, duration, delay, once, start]);

  return ref;
};

// コンポーネントでの使用
function AnimatedSection() {
  const sectionRef = useScrollAnimation({
    type: "fadeInUp",
    delay: 0.2,
  });

  return <div ref={sectionRef}>スクロール時にアニメーションするコンテンツ</div>;
}
```

### AnimatedSection コンポーネント

このプロジェクトには簡単なアニメーション実装のための再利用可能な`AnimatedSection`コンポーネントが含まれています：

```jsx
// AnimatedSectionコンポーネントの使用
<AnimatedSection animation="fadeInUp" delay={0.3} className="mb-8">
  <h2>このコンテンツはアニメーションします</h2>
  <p>この段落もアニメーションします！</p>
</AnimatedSection>
```

### グローバルなアニメーションの初期化

`_app.tsx`ファイルでは、アニメーションがグローバルに初期化されています：

```jsx
import { useEffect } from "react";
import { initAnimations } from "@/lib/animation";

export default function MyApp({ Component, pageProps }) {
  // クライアントサイドでGSAPアニメーションを初期化
  useEffect(() => {
    initAnimations();
  }, []);

  return <Component {...pageProps} />;
}
```

`initAnimations`関数は、ボタンのホバー効果やスクロールトリガーアニメーションなどのグローバルアニメーションを設定します。

---

## コンポーネント設計パターン

このプロジェクトは、保守性と再利用性のためのいくつかのコンポーネント設計パターンに従っています。

### 再利用可能な UI コンポーネント

プロジェクトには`src/components/ui/`に再利用可能な UI コンポーネントのライブラリがあります：

#### Button コンポーネント

```jsx
// src/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  href?: string;
  onClick?: () => void;
  // その他のプロップ...
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  // その他のプロップ...
}) => {
  // 実装...
};

// 使用例
<Button
  variant="primary"
  size="lg"
  onClick={handleClick}
>
  クリック
</Button>

// またはリンクとして
<Button
  variant="outline"
  href="/about"
>
  詳細を見る
</Button>
```

#### Card コンポーネント

```jsx
// src/components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hoverable?: boolean;
  // その他のプロップ...
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  animate = true,
  hoverable = false,
  // その他のプロップ...
}) => {
  // GSAPアニメーションを使用した実装...
};

// 使用例
<Card hoverable={true} className="p-6">
  <h3>カードタイトル</h3>
  <p>カードコンテンツがここに入ります。</p>
</Card>;
```

### レイアウトコンポーネント

`src/components/layout/`のレイアウトコンポーネントがサイト構造を定義しています：

#### Layout コンポーネント

```jsx
// src/components/layout/Layout.tsx
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  // その他のSEOプロップ...
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  // その他のプロップ...
}) => {
  return (
    <>
      <Meta title={title} description={description} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container-custom mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};
```

#### Meta コンポーネント

```jsx
// src/components/layout/Meta.tsx
interface MetaProps {
  title?: string;
  description?: string;
  // その他のSEOプロップ...
}

const Meta: React.FC<MetaProps> = ({
  title = "My Site",
  description = "個人のウェブサイト",
  // その他のプロップ...
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* その他のメタタグ */}
    </Head>
  );
};
```

### 機能特有のコンポーネント

機能特有のコンポーネントは専用のフォルダに整理されています：

#### ProfileCard コンポーネント（About セクション）

```jsx
// src/components/about/ProfileCard.tsx
interface ProfileCardProps {
  name: string;
  title: string;
  image?: string;
  bio: string;
  // その他のプロップ...
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  title,
  image = "/images/profile-placeholder.jpg",
  bio,
  // その他のプロップ...
}) => {
  // 実装...
};

// 使用例
<ProfileCard
  name="山田太郎"
  title="ウェブ開発者"
  bio="熱心なウェブ開発者..."
  email="taro@example.com"
/>;
```

#### ProjectCard コンポーネント（Portfolio セクション）

```jsx
// src/components/portfolio/ProjectCard.tsx
interface ProjectCardProps {
  title: string;
  description: string;
  category: string;
  image?: string;
  // その他のプロップ...
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  category,
  image,
  // その他のプロップ...
}) => {
  // ホバーアニメーションを含む実装...
};

// グリッドでの使用
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {projects.map((project) => (
    <ProjectCard
      key={project.id}
      title={project.title}
      description={project.description}
      category={project.category}
      image={project.image}
    />
  ))}
</div>;
```

### 高度なコンポーネントパターン

#### エラー境界

```jsx
// src/components/ui/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // エラーログレポートサービスにエラーを記録
    console.error("ErrorBoundaryによってキャッチされたエラー:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg shadow">
          <h3>問題が発生しました</h3>
          <button onClick={() => this.setState({ hasError: false })}>
            再試行
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// _app.tsxでの使用
<ErrorBoundary>
  <Component {...pageProps} />
</ErrorBoundary>;
```

#### コンポジションパターン

```jsx
// CardとのSectionコンポーネントのコンポジション
<Section title="特集プロジェクト">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>プロジェクト1</Card>
    <Card>プロジェクト2</Card>
    <Card>プロジェクト3</Card>
  </div>
</Section>
```

#### カスタムフック

```jsx
// src/lib/hooks/useScrollAnimation.ts
export const useScrollAnimation = (options = {}) => {
  const ref = useRef(null);
  // 実装...
  return ref;
};

// 使用例
function SomeComponent() {
  const elementRef = useScrollAnimation({
    type: "fadeInLeft",
    delay: 0.2,
  });

  return <div ref={elementRef}>これはアニメーションします</div>;
}
```

---

## 静的エクスポートとデプロイ

このプロジェクトは静的エクスポート用に設定されており、任意の静的ホスティングサービスや Apache サーバーにデプロイできる HTML/CSS/JS ファイルを生成します。

### 静的エクスポートプロセス

1. **静的エクスポート用にプロジェクトをビルド**：

```bash
npm run build
```

このコマンドは、`next.config.js`の`output: "export"`設定でプロジェクトをビルドします。静的ファイルを含む`out`ディレクトリが作成されます。

2. **Apache ホスティングの準備**：

このプロジェクトには、URL リライティングやその他のサーバー設定を処理する Apache 設定用の`.htaccess`ファイルが含まれています。

3. **提供されているデプロイスクリプトを使用**：

```bash
npm run deploy
```

これにより、`static-build.sh`スクリプトが実行され、以下の処理が行われます：

- 以前のビルドをクリーンアップ
- 静的サイトをビルド
- Apache 設定ファイルをコピー
- sitemap.xml を作成/更新
- 静的アセットを最適化

### Next.js 静的エクスポート設定

エクスポートは`next.config.js`で設定されています：

```js
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true, // 静的エクスポートに必要
  },
  trailingSlash: true, // Apacheとの互換性向上
};
```

### .htaccess 設定

`.htaccess`ファイルには以下の設定が含まれています：

1. **URL リライティング**：拡張子なしの URL を処理します。
2. **MIME タイプ**：正しいファイルタイプを確保します。
3. **GZIP 圧縮**：パフォーマンスを向上させます。
4. **キャッシュヘッダー**：適切なキャッシュ期間を設定します。
5. **カスタムエラーページ**：404 エラーページを定義します。
6. **セキュリティヘッダー**：セキュリティ関連の HTTP ヘッダーを追加します。

### 手動デプロイオプション

`deployment.md`に記載されているように、複数のデプロイオプションがあります：

#### オプション 1：ウェブサーバーへの直接コピー

```bash
scp -r out/* user@your-server:/path/to/web/root/
```

#### オプション 2：FTP/SFTP アップロード

FTP クライアントを使用して、`out`ディレクトリからすべてのファイルをウェブサーバーにアップロードします。

#### GitHub Actions を使用した自動デプロイ

このプロジェクトにはサンプルの GitHub Actions ワークフローが含まれており、以下を行います：

1. 静的サイトをビルド
2. 設定ファイルをコピー
3. SSH を介してサーバーにデプロイ

---

## 一般的な問題と解決策

### Tailwind CSS 問題

1. **Tailwind クラスが見つからない**：

   - クラスを含むファイルが`tailwind.config.js`の`content`セクションに含まれていることを確認します。
   - 正しいクラス命名を使用していることを確認します（例：`bg-primary`ではなく`bg-primary-500`）。

2. **Tailwind のカスタム設定**：
   - カスタムカラーやテーマを追加する場合は、開発サーバーを再起動します。
   - カスタム値が`tailwind.config.js`で正しくフォーマットされていることを確認します。

### Next.js ルーティング問題

1. **ページが見つからない**：

   - `pages`ディレクトリ内のファイル名と場所を確認します。
   - ファイル名は大文字と小文字を区別することに注意してください。

2. **エクスポート後に API ルートが機能しない**：
   - 静的エクスポートは API ルートをサポートしていません。クライアントサイドの状態または外部 API の使用を検討してください。

### GSAP アニメーション問題

1. **アニメーションが機能しない**：

   - GSAP が適切にインポートされ、プラグインが登録されていることを確認します。
   - `useEffect`依存配列が正しく設定されていることを確認します。
   - ref が DOM 要素に正しく接続されていることを確認します。

2. **サーバーサイドレンダリングエラー**：
   - ブラウザ API にアクセスする前に`typeof window !== "undefined"`チェックを使用します。
   - クライアントサイドで GSAP プラグインを条件付きで登録します。

### 静的エクスポート問題

1. **画像が表示されない**：

   - `next.config.js`の`images`セクションで`unoptimized: true`を設定します。
   - 画像ソースに相対パスを使用します。

2. **デプロイ後のリンク切れ**：

   - `next.config.js`で`trailingSlash: true`が設定されていることを確認します。
   - `.htaccess`が適切に設定されていることを確認します。

3. **カスタムフォントが読み込まれない**：
   - フォントファイルが`public`ディレクトリに含まれていることを確認します。
   - `_document.tsx`またはカスタム CSS でのフォント読み込みを確認します。

---

このマニュアルは、Next.js ウェブサイトの構築と拡張を続ける際の包括的なリファレンスとして役立つでしょう。提供されたパターンと例はプロジェクトの構造と技術に合致しており、開発全体を通して一貫性とベストプラクティスを維持しやすくします。
