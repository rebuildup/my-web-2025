import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge, Code, Palette, Video, Coffee, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'samuido - ハンドルネームプロフィール',
  description: 'samuido（さむいど）のカジュアルなプロフィール。クリエイティブな活動、趣味、制作秘話など気軽にご紹介。',
  keywords: ['samuido', 'さむいど', 'ハンドルネーム', 'クリエイター', 'デザイナー', 'エンジニア'],
  openGraph: {
    title: 'samuido - ハンドルネームプロフィール',
    description: 'samuido（さむいど）のカジュアルなプロフィール。クリエイティブな活動、趣味、制作秘話など気軽にご紹介。',
    type: 'profile',
    url: '/about/profile/handle',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'samuido - ハンドルネームプロフィール',
    description: 'samuido（さむいど）のカジュアルなプロフィール。クリエイティブな活動、趣味、制作秘話など気軽にご紹介。',
    creator: '@361do_sleep',
  },
};

const activities = [
  {
    icon: <Code size={32} />,
    title: '個人開発',
    description: 'Webアプリ、ツール、プラグインなど思いついたものを片っ端から作る',
    details: ['React/Next.js', 'TypeScript', 'Tailwind CSS'],
    color: 'border-blue-500',
  },
  {
    icon: <Palette size={32} />,
    title: 'デザイン',
    description: 'UI/UX、グラフィック、ロゴ制作など視覚的な表現全般',
    details: ['Figma', 'Adobe Creative Suite', 'UI/UX'],
    color: 'border-purple-500',
  },
  {
    icon: <Video size={32} />,
    title: '映像制作',
    description: 'モーショングラフィックス、編集、エフェクト制作',
    details: ['After Effects', 'Premiere Pro', 'Blender'],
    color: 'border-red-500',
  },
];

const personality = [
  {
    emoji: '🎯',
    title: '完璧主義',
    description: '納得いくまで作り込む性格。時間がかかっても妥協しない',
  },
  {
    emoji: '🚀',
    title: '新しいもの好き',
    description: '最新技術やトレンドを追いかけるのが好き。すぐ試したくなる',
  },
  {
    emoji: '🔥',
    title: 'やる気スイッチ',
    description: 'やる気になったら何でもできる。逆に興味がないと…',
  },
  {
    emoji: '🎨',
    title: 'クリエイティブ',
    description: '0から1を作るのが好き。既存のものを改良するのも好き',
  },
];

const currentStatus = [
  {
    title: '今ハマっていること',
    content: 'Next.js 15とReact 19の新機能を使った開発',
  },
  {
    title: '最近の悩み',
    content: '時間が足りない...やりたいことが多すぎる',
  },
  {
    title: '今度やりたいこと',
    content: '3Dモデリングとか、AR/VRとか、新しい分野にも挑戦したい',
  },
  {
    title: '好きな言葉',
    content: '「やる気になれば何でもできる」（自分で言うのもアレですが）',
  },
];

export default function HandleProfilePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'samuido',
    alternateName: 'さむいど',
    jobTitle: 'クリエイター・エンジニア',
    description: 'Web開発、デザイン、映像制作など幅広く活動するクリエイター',
    url: 'https://yusuke-kim.com/about/profile/handle',
    sameAs: ['https://twitter.com/361do_sleep', 'https://twitter.com/361do_design'],
    knowsAbout: [
      'Web Development',
      'UI/UX Design',
      'Motion Graphics',
      'Creative Coding',
      'React',
      'Next.js',
      'After Effects',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray min-h-screen">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/about"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← About
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-12 text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6 h-24 w-24 rounded-full flex items-center justify-center">
            <Badge size={48} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-2 text-4xl md:text-6xl">
            samuido
          </h1>
          <p className="zen-kaku-gothic-new text-foreground/80 mb-4 text-xl md:text-2xl">
            さむいど
          </p>
          <p className="noto-sans-jp text-foreground/60 text-lg">
            クリエイター・エンジニア
          </p>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 pb-16">
          {/* Casual Introduction */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              こんにちは！
            </h2>

            <div className="border-foreground/20 bg-gray/50 border p-8">
              <div className="noto-sans-jp text-foreground/80 space-y-4 text-lg leading-relaxed">
                <p>
                  samuido（さむいど）です！<br />
                  Web開発、デザイン、映像制作など、作ることが好きすぎて
                  気がついたら色々なことに手を出していました。
                </p>
                <p>
                  正式名は木村友亮ですが、同業者の方や仲間内では
                  samuido（さむいど）で呼んでもらっています。
                  どちらでもお気軽にどうぞ！
                </p>
                <p>
                  基本的にはやる気になったら何でもできる性格なので、
                  「これ面白そう！」と思ったものは片っ端から挑戦しています。
                </p>
              </div>
            </div>
          </section>

          {/* What I Do */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              何をやっているの？
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
              {activities.map((activity, index) => (
                <div key={index} className={`border-2 ${activity.color} bg-gray/50 p-6`}>
                  <div className="flex items-start space-x-4">
                    <div className="text-primary">{activity.icon}</div>
                    <div className="flex-1">
                      <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-xl">
                        {activity.title}
                      </h3>
                      <p className="noto-sans-jp text-foreground/80 mb-4 leading-relaxed">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activity.details.map((detail, detailIndex) => (
                          <span
                            key={detailIndex}
                            className="text-primary bg-primary/10 px-3 py-1 rounded text-sm"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Personality */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              性格・特徴
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {personality.map((trait, index) => (
                <div key={index} className="border-foreground/20 bg-gray/50 border p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{trait.emoji}</div>
                    <div>
                      <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                        {trait.title}
                      </h3>
                      <p className="noto-sans-jp text-foreground/80 text-sm leading-relaxed">
                        {trait.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Current Status */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              最近の状況
            </h2>

            <div className="space-y-4">
              {currentStatus.map((status, index) => (
                <div key={index} className="border-foreground/20 bg-gray/50 border p-6">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {status.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/80 leading-relaxed">
                    {status.content}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Fun Facts */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              ちょっとした話
            </h2>

            <div className="border-foreground/20 bg-gray/50 border p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Coffee size={20} className="text-primary mt-1" />
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground mb-1 text-lg">
                      制作のお供
                    </h3>
                    <p className="noto-sans-jp text-foreground/80">
                      夜中に作業することが多いので、コーヒーよりも緑茶派です。
                      音楽を聴きながら作業するのが好きで、ジャンルは問わず色々聴いています。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Sparkles size={20} className="text-primary mt-1" />
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground mb-1 text-lg">
                      インスピレーション
                    </h3>
                    <p className="noto-sans-jp text-foreground/80">
                      普段からいろんなWebサイトやアプリを見て回っています。
                      「これいいな」と思ったデザインやアニメーションは
                      すぐに自分でも試してみたくなります。
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Badge size={20} className="text-primary mt-1" />
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground mb-1 text-lg">
                      名前の由来
                    </h3>
                    <p className="noto-sans-jp text-foreground/80">
                      samuido（さむいど）の由来は...実は特に深い意味はありません。
                      昔から使っているハンドルネームで、今となっては愛着があります。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
              連絡先・SNS
            </h2>

            <div className="border-foreground/20 bg-gray/50 border p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">
                    開発・技術系
                  </h3>
                  <div className="noto-sans-jp text-foreground/80 space-y-2">
                    <div>📧 rebuild.up.up@gmail.com</div>
                    <div>🐦 @361do_sleep</div>
                  </div>
                </div>

                <div>
                  <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg">
                    デザイン・映像系
                  </h3>
                  <div className="noto-sans-jp text-foreground/80 space-y-2">
                    <div>📧 361do.sleep@gmail.com</div>
                    <div>🐦 @361do_design</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-foreground/20">
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  お仕事の依頼、技術的な質問、雑談など、お気軽にどうぞ！
                  同業者の方との交流も大歓迎です。
                </p>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <section className="text-center">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Link
                href="/about/profile/real"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  正式なプロフィール
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">本名・経歴版</p>
              </Link>

              <Link
                href="/about/profile/AI"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  AIチャット版
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">AI風の紹介</p>
              </Link>

              <Link
                href="/about/links"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-4 transition-colors"
              >
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg">
                  リンク集
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">SNS・作品等</p>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}