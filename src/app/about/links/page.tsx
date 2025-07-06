import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  ExternalLink, 
  MapPin, 
  Twitter, 
  Github, 
  Mail, 
  Globe, 
  Youtube, 
  Instagram,
  Monitor,
  Palette,
  Video,
  Code,
  Download,
  MessageCircle,
  Users,
  BookOpen,
  Gamepad2,
  Music,
  Coffee
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'リンク集 - samuido | SNS・作品・プラットフォーム',
  description: 'samuidoの全SNSアカウント、作品プラットフォーム、外部リンクを一覧でご紹介。',
  keywords: ['samuido', 'リンク集', 'SNS', 'Twitter', 'GitHub', 'ポートフォリオ', 'プラットフォーム'],
  openGraph: {
    title: 'リンク集 - samuido | SNS・作品・プラットフォーム',
    description: 'samuidoの全SNSアカウント、作品プラットフォーム、外部リンクを一覧でご紹介。',
    type: 'profile',
    url: '/about/links',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'リンク集 - samuido | SNS・作品・プラットフォーム',
    description: 'samuidoの全SNSアカウント、作品プラットフォーム、外部リンクを一覧でご紹介。',
    creator: '@361do_sleep',
  },
};

interface LinkCategory {
  title: string;
  icon: React.ReactNode;
  description: string;
  links: {
    name: string;
    url: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    isActive: boolean;
  }[];
}

const linkCategories: LinkCategory[] = [
  {
    title: 'SNS・コミュニケーション',
    icon: <MessageCircle size={24} />,
    description: '日常的な活動やコミュニケーション',
    links: [
      {
        name: 'Twitter - Tech',
        url: 'https://twitter.com/361do_sleep',
        description: '開発・技術系のツイート、日常',
        icon: <Twitter size={20} />,
        color: 'border-blue-500 hover:bg-blue-50',
        isActive: true,
      },
      {
        name: 'Twitter - Design',
        url: 'https://twitter.com/361do_design',
        description: 'デザイン・映像制作系のツイート',
        icon: <Twitter size={20} />,
        color: 'border-pink-500 hover:bg-pink-50',
        isActive: true,
      },
      {
        name: 'Discord',
        url: '#',
        description: 'コミュニティ参加時のアカウント',
        icon: <MessageCircle size={20} />,
        color: 'border-purple-500 hover:bg-purple-50',
        isActive: false,
      },
    ],
  },
  {
    title: '開発・コード',
    icon: <Code size={24} />,
    description: 'プログラミング関連のプラットフォーム',
    links: [
      {
        name: 'GitHub',
        url: 'https://github.com/samuido',
        description: 'ソースコード、個人プロジェクト',
        icon: <Github size={20} />,
        color: 'border-gray-700 hover:bg-gray-50',
        isActive: false,
      },
      {
        name: 'CodePen',
        url: 'https://codepen.io/samuido',
        description: 'Web実験、プロトタイプ',
        icon: <Code size={20} />,
        color: 'border-green-500 hover:bg-green-50',
        isActive: false,
      },
      {
        name: 'Qiita',
        url: 'https://qiita.com/samuido',
        description: '技術記事の投稿',
        icon: <BookOpen size={20} />,
        color: 'border-green-600 hover:bg-green-50',
        isActive: false,
      },
    ],
  },
  {
    title: 'デザイン・クリエイティブ',
    icon: <Palette size={24} />,
    description: 'デザイン作品の投稿・共有',
    links: [
      {
        name: 'Behance',
        url: 'https://behance.net/samuido',
        description: 'グラフィックデザイン作品',
        icon: <Palette size={20} />,
        color: 'border-blue-600 hover:bg-blue-50',
        isActive: false,
      },
      {
        name: 'Dribbble',
        url: 'https://dribbble.com/samuido',
        description: 'UI/UXデザイン、アイコン',
        icon: <Palette size={20} />,
        color: 'border-pink-600 hover:bg-pink-50',
        isActive: false,
      },
      {
        name: 'Figma Community',
        url: 'https://figma.com/@samuido',
        description: 'Figmaテンプレート、プラグイン',
        icon: <Monitor size={20} />,
        color: 'border-purple-600 hover:bg-purple-50',
        isActive: false,
      },
    ],
  },
  {
    title: '映像・動画',
    icon: <Video size={24} />,
    description: '映像作品、チュートリアル',
    links: [
      {
        name: 'YouTube',
        url: 'https://youtube.com/@samuido',
        description: 'チュートリアル、作品紹介',
        icon: <Youtube size={20} />,
        color: 'border-red-500 hover:bg-red-50',
        isActive: false,
      },
      {
        name: 'Vimeo',
        url: 'https://vimeo.com/samuido',
        description: '高品質な映像作品',
        icon: <Video size={20} />,
        color: 'border-blue-700 hover:bg-blue-50',
        isActive: false,
      },
      {
        name: 'Instagram',
        url: 'https://instagram.com/samuido_design',
        description: '制作過程、ビハインド・ザ・シーン',
        icon: <Instagram size={20} />,
        color: 'border-pink-700 hover:bg-pink-50',
        isActive: false,
      },
    ],
  },
  {
    title: '学習・教育',
    icon: <BookOpen size={24} />,
    description: '学習記録、知識共有',
    links: [
      {
        name: 'Zenn',
        url: 'https://zenn.dev/samuido',
        description: '技術記事、学習ログ',
        icon: <BookOpen size={20} />,
        color: 'border-blue-400 hover:bg-blue-50',
        isActive: false,
      },
      {
        name: 'Note',
        url: 'https://note.com/samuido',
        description: '制作ノート、思考の記録',
        icon: <BookOpen size={20} />,
        color: 'border-green-400 hover:bg-green-50',
        isActive: false,
      },
      {
        name: 'Speaker Deck',
        url: 'https://speakerdeck.com/samuido',
        description: '勉強会・LT資料',
        icon: <Monitor size={20} />,
        color: 'border-orange-500 hover:bg-orange-50',
        isActive: false,
      },
    ],
  },
  {
    title: 'その他・趣味',
    icon: <Coffee size={24} />,
    description: 'ゲーム、音楽、その他の活動',
    links: [
      {
        name: 'Steam',
        url: 'https://steamcommunity.com/id/samuido',
        description: 'ゲームプロフィール',
        icon: <Gamepad2 size={20} />,
        color: 'border-gray-800 hover:bg-gray-50',
        isActive: false,
      },
      {
        name: 'SoundCloud',
        url: 'https://soundcloud.com/samuido',
        description: '音楽制作（たまに）',
        icon: <Music size={20} />,
        color: 'border-orange-600 hover:bg-orange-50',
        isActive: false,
      },
      {
        name: 'Last.fm',
        url: 'https://last.fm/user/samuido',
        description: '音楽試聴履歴',
        icon: <Music size={20} />,
        color: 'border-red-600 hover:bg-red-50',
        isActive: false,
      },
    ],
  },
];

const directContacts = [
  {
    name: '開発・技術相談',
    email: 'rebuild.up.up@gmail.com',
    description: 'プログラミング、Web開発関連',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'デザイン・映像相談',
    email: '361do.sleep@gmail.com',
    description: 'UI/UX、グラフィック、映像制作関連',
    color: 'bg-purple-100 text-purple-800',
  },
];

export default function LinksPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'samuido',
    sameAs: linkCategories
      .flatMap(category => category.links)
      .filter(link => link.isActive)
      .map(link => link.url),
    url: 'https://yusuke-kim.com/about/links',
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
          <div className="bg-gradient-to-r from-green-500 to-blue-500 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <MapPin size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            Link Map
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            SNS・作品・プラットフォーム
          </p>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-4 pb-16">
          {/* Quick Contact */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl text-center">
              直接連絡
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {directContacts.map((contact, index) => (
                <a
                  key={index}
                  href={`mailto:${contact.email}`}
                  className={`${contact.color} p-6 rounded-lg hover:scale-105 transition-transform`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Mail size={24} />
                    <h3 className="neue-haas-grotesk-display text-lg font-medium">
                      {contact.name}
                    </h3>
                  </div>
                  <p className="noto-sans-jp mb-2">{contact.email}</p>
                  <p className="noto-sans-jp text-sm opacity-80">{contact.description}</p>
                </a>
              ))}
            </div>
          </section>

          {/* Link Categories */}
          {linkCategories.map((category, categoryIndex) => (
            <section key={categoryIndex} className="mb-12">
              <div className="mb-6 text-center">
                <div className="text-primary mx-auto mb-3">{category.icon}</div>
                <h2 className="neue-haas-grotesk-display text-foreground mb-2 text-2xl">
                  {category.title}
                </h2>
                <p className="noto-sans-jp text-foreground/70">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.links.map((link, linkIndex) => (
                  <div
                    key={linkIndex}
                    className={`border-2 ${link.color} bg-gray/50 p-4 rounded-lg transition-all duration-200 ${
                      link.isActive 
                        ? 'opacity-100' 
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-primary">{link.icon}</div>
                        <h3 className="neue-haas-grotesk-display text-foreground text-lg">
                          {link.name}
                        </h3>
                      </div>
                      {link.isActive ? (
                        <ExternalLink size={16} className="text-primary" />
                      ) : (
                        <span className="text-foreground/50 bg-foreground/10 px-2 py-1 rounded text-xs">
                          準備中
                        </span>
                      )}
                    </div>

                    <p className="noto-sans-jp text-foreground/80 text-sm mb-3 leading-relaxed">
                      {link.description}
                    </p>

                    {link.isActive ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 inline-flex items-center space-x-1 text-sm font-medium"
                      >
                        <span>アクセス</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-foreground/50 text-sm">
                        アカウント作成予定
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Portfolio Links */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl text-center">
              このサイト内のリンク
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/portfolio"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 rounded-lg transition-colors"
              >
                <Monitor size={32} className="text-primary mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Portfolio
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">作品集・実績</p>
              </Link>

              <Link
                href="/tools"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 rounded-lg transition-colors"
              >
                <Code size={32} className="text-primary mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Tools
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">開発ツール集</p>
              </Link>

              <Link
                href="/workshop"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 rounded-lg transition-colors"
              >
                <BookOpen size={32} className="text-primary mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Workshop
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">ブログ・プラグイン</p>
              </Link>

              <Link
                href="/contact"
                className="group border-foreground/20 bg-gray/50 hover:border-primary border p-6 rounded-lg transition-colors"
              >
                <Mail size={32} className="text-primary mb-3" />
                <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg">
                  Contact
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">お問い合わせ</p>
              </Link>
            </div>
          </section>

          {/* Note */}
          <section className="text-center">
            <div className="border-foreground/20 bg-yellow-50 border p-6 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Globe size={20} className="text-yellow-600" />
                <h3 className="neue-haas-grotesk-display text-yellow-800 text-lg">お知らせ</h3>
              </div>
              <p className="noto-sans-jp text-yellow-700 text-sm leading-relaxed">
                「準備中」のアカウントは順次開設予定です。<br />
                最新情報は Twitter (@361do_sleep) でお知らせします。
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. Follow me everywhere! 🌐
          </p>
        </footer>
      </div>
    </>
  );
}