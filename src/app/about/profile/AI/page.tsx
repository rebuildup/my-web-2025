import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AIチャットプロフィール - samuido AI Assistant",
  description:
    "samuido AIアシスタントのプロフィール。AIとしての特徴や機能、できることをご紹介。",
  keywords: [
    "samuido",
    "AI",
    "アシスタント",
    "チャット",
    "人工知能",
    "プロフィール",
  ],
  robots: "index, follow",
  openGraph: {
    title: "AIチャットプロフィール - samuido AI Assistant",
    description:
      "samuido AIアシスタントのプロフィール。AIとしての特徴や機能をご紹介。",
    type: "profile",
    url: "https://yusuke-kim.com/about/profile/AI",
    images: [
      {
        url: "https://yusuke-kim.com/profile-ai-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "samuido AI Assistant",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIチャットプロフィール - samuido AI Assistant",
    description:
      "samuido AIアシスタントのプロフィール。AIとしての特徴や機能をご紹介。",
    images: ["https://yusuke-kim.com/profile-ai-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
  alternates: {
    canonical: "https://yusuke-kim.com/about/profile/AI",
  },
};

const aiCapabilities = [
  {
    category: "技術相談",
    description: "プログラミングや開発に関する質問にお答えします",
    examples: [
      "コードレビュー",
      "技術選定",
      "アーキテクチャ設計",
      "デバッグ支援",
    ],
  },
  {
    category: "デザイン相談",
    description: "UI/UXやグラフィックデザインについてアドバイスします",
    examples: ["色彩理論", "レイアウト", "ユーザビリティ", "ブランディング"],
  },
  {
    category: "映像制作",
    description: "動画編集やモーショングラフィックスについて",
    examples: ["編集技法", "エフェクト", "ストーリーテリング", "ワークフロー"],
  },
  {
    category: "アイデア発想",
    description: "創作活動やプロジェクトのアイデア出しをお手伝い",
    examples: ["ブレインストーミング", "企画立案", "問題解決", "創造性向上"],
  },
];

const aiPersonality = [
  {
    trait: "好奇心旺盛",
    description: "新しい技術や表現方法について一緒に探求します",
  },
  {
    trait: "論理的思考",
    description: "複雑な問題を整理して分かりやすく説明します",
  },
  {
    trait: "クリエイティブ",
    description: "既存の枠にとらわれない発想を大切にします",
  },
  {
    trait: "サポート精神",
    description: "あなたの創作活動を全力でサポートします",
  },
];

const conversationTopics = [
  {
    topic: "技術トレンド",
    description: "最新の開発技術やツールについて",
    examples: ["Next.js 15の新機能", "AI開発ツール", "Webパフォーマンス"],
  },
  {
    topic: "クリエイティブワーク",
    description: "デザインや映像制作のテクニック",
    examples: ["UI/UXトレンド", "モーションデザイン", "カラーパレット"],
  },
  {
    topic: "学習・成長",
    description: "スキルアップや学習方法について",
    examples: ["効率的な学習法", "ポートフォリオ作成", "キャリア相談"],
  },
  {
    topic: "雑談・趣味",
    description: "気軽な話題や趣味について",
    examples: ["ゲーム", "音楽", "映画", "日常の出来事"],
  },
];

export default function AIProfilePage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex items-center py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* ナビゲーション */}
            <nav className="mb-8">
              <Link
                href="/about"
                className="noto-sans-jp-light text-sm text-accent border border-accent px-4 py-2 inline-block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                ← About に戻る
              </Link>
            </nav>

            {/* ヘッダー */}
            <header className="space-y-12">
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                samuido AI Assistant
              </h1>

              <div className="space-y-4">
                <p className="zen-kaku-gothic-new text-xl text-primary">
                  あなたの創作活動をサポートするAIパートナー
                </p>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  こんにちは！私はsamuido AI Assistantです 🤖
                  <br />
                  samuidoの知識と経験をベースに、あなたの創作活動やプロジェクトをサポートするために生まれました.
                  <br />
                  技術的な質問からクリエイティブなアイデア出しまで、幅広くお手伝いできます.
                  <br />
                  気軽に話しかけてください. 一緒に素晴らしいものを作りましょう！
                  ✨
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    AI Assistant
                  </span>
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    Creative Support
                  </span>
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    24/7 Available
                  </span>
                </div>
              </div>
            </header>

            {/* AI特性 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                AI Personality
              </h2>
              <div className="grid-system grid-1 xs:grid-2 gap-4">
                {aiPersonality.map((trait, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                      {trait.trait}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      {trait.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* サポート分野 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Support Areas
              </h2>
              <div className="grid-system grid-1 xs:grid-2 gap-6">
                {aiCapabilities.map((capability, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <h3 className="zen-kaku-gothic-new text-lg text-primary mb-2">
                      {capability.category}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground mb-3">
                      {capability.description}
                    </p>
                    <div className="space-y-1">
                      {capability.examples.map((example) => (
                        <div
                          key={example}
                          className="noto-sans-jp-light text-xs text-accent"
                        >
                          • {example}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 会話トピック */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Conversation Topics
              </h2>
              <div className="space-y-4">
                {conversationTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-base border border-foreground p-4"
                  >
                    <h3 className="zen-kaku-gothic-new text-base text-primary mb-2">
                      {topic.topic}
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground mb-2">
                      {topic.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {topic.examples.map((example) => (
                        <span
                          key={example}
                          className="noto-sans-jp-light text-xs text-accent"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 使い方のコツ */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Usage Tips
              </h2>
              <div className="space-y-3">
                <div className="bg-base border border-foreground p-4">
                  <div className="flex items-start gap-3">
                    <div className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 w-fit">
                      1
                    </div>
                    <div>
                      <h4 className="zen-kaku-gothic-new text-base text-primary mb-1">
                        具体的に質問する
                      </h4>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        「React
                        Hooksの使い方」より「useEffectでAPIを呼ぶ方法」の方が詳しく答えられます
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-base border border-foreground p-4">
                  <div className="flex items-start gap-3">
                    <div className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 w-fit">
                      2
                    </div>
                    <div>
                      <h4 className="zen-kaku-gothic-new text-base text-primary mb-1">
                        コードや画像を共有
                      </h4>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        実際のコードやデザインを見せてもらえると、より的確なアドバイスができます
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-base border border-foreground p-4">
                  <div className="flex items-start gap-3">
                    <div className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 w-fit">
                      3
                    </div>
                    <div>
                      <h4 className="zen-kaku-gothic-new text-base text-primary mb-1">
                        気軽に雑談も
                      </h4>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        技術的な話だけでなく、創作の悩みや日常の話も大歓迎です
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* チャット開始 */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Start Chat
              </h2>
              <div className="bg-base border border-foreground p-4 text-center">
                <p className="noto-sans-jp-light text-sm text-foreground mb-4">
                  ※ 現在、AIチャット機能は開発中です.
                  <br />
                  実装完了まで、お問い合わせフォームをご利用ください.
                </p>
                <div className="grid-system grid-1 xs:grid-2 gap-4">
                  <Link
                    href="/contact"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Contact Form</span>
                  </Link>
                  <Link
                    href="/about/profile/handle"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Creator Profile</span>
                  </Link>
                </div>
              </div>
            </section>

            {/* フッター */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - AI Assistant Profile
                </p>
                <p className="noto-sans-jp-light text-xs text-foreground mt-2">
                  💡
                  このAIアシスタントは、samuidoの知識と経験をベースに作られています
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
