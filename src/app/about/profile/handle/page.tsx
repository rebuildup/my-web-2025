import { Metadata } from 'next';
import Link from 'next/link';

export default function HandleProfilePage() {
  const techStack = {
    frontend: {
      label: 'フロントエンド',
      color: 'bg-blue-100 text-blue-800',
      icon: '⚛️',
      items: [
        { name: 'React', level: 90, years: 3 },
        { name: 'Next.js', level: 85, years: 2 },
        { name: 'TypeScript', level: 90, years: 3 },
        { name: 'Tailwind CSS', level: 95, years: 2 }
      ]
    },
    animation: {
      label: 'アニメーション',
      color: 'bg-purple-100 text-purple-800',
      icon: '✨',
      items: [
        { name: 'GSAP', level: 80, years: 2 },
        { name: 'PIXI.js', level: 70, years: 1 },
        { name: 'p5.js', level: 75, years: 2 },
        { name: 'Three.js', level: 60, years: 1 }
      ]
    },
    backend: {
      label: 'バックエンド',
      color: 'bg-green-100 text-green-800',
      icon: '🔧',
      items: [
        { name: 'Node.js', level: 75, years: 2 },
        { name: 'C++', level: 85, years: 4 },
        { name: 'C#', level: 80, years: 3 },
        { name: 'Unity', level: 75, years: 2 }
      ]
    },
    creative: {
      label: 'クリエイティブ',
      color: 'bg-pink-100 text-pink-800',
      icon: '🎨',
      items: [
        { name: 'After Effects', level: 95, years: 4 },
        { name: 'Photoshop', level: 90, years: 5 },
        { name: 'Illustrator', level: 85, years: 3 },
        { name: 'Figma', level: 75, years: 2 }
      ]
    }
  };

  const activities = [
    {
      category: '個人開発',
      icon: '💻',
      color: 'bg-blue-500',
      items: [
        {
          title: 'Sequential PNG Preview Plugin',
          description: 'After Effects用のPNGシーケンスプレビュープラグイン',
          tech: ['After Effects', 'JavaScript', 'CEP'],
          status: 'リリース済み',
          downloads: '300+'
        },
        {
          title: 'Color Palette Generator',
          description: 'カラー理論に基づいたパレット生成ツール',
          tech: ['React', 'TypeScript', 'Canvas API'],
          status: 'リリース済み',
          downloads: '1.2k+'
        },
        {
          title: 'Web Animation Library',
          description: 'Webアニメーション用の軽量ライブラリ',
          tech: ['TypeScript', 'CSS', 'GSAP'],
          status: '開発中',
          downloads: '-'
        }
      ]
    },
    {
      category: '映像制作',
      icon: '🎬',
      color: 'bg-purple-500',
      items: [
        {
          title: 'Motion Graphics Templates',
          description: 'プロフェッショナル向けテンプレート集',
          tech: ['After Effects', 'Animation', 'Design'],
          status: 'リリース済み',
          downloads: '800+'
        },
        {
          title: 'Music Video Projects',
          description: '楽曲MVやリリックモーション制作',
          tech: ['After Effects', 'Premiere Pro', 'Blender'],
          status: '継続中',
          downloads: '-'
        }
      ]
    },
    {
      category: 'ゲーム開発',
      icon: '🎮',
      color: 'bg-green-500',
      items: [
        {
          title: 'ProtoType Game',
          description: 'PIXI.jsを使ったブラウザゲーム',
          tech: ['PIXI.js', 'TypeScript', 'WebGL'],
          status: '開発中',
          downloads: '-'
        },
        {
          title: 'Unity Game Projects',
          description: '2D/3Dゲームプロトタイプ',
          tech: ['Unity', 'C#', 'Blender'],
          status: '継続中',
          downloads: '-'
        }
      ]
    },
    {
      category: '技術共有',
      icon: '📝',
      color: 'bg-orange-500',
      items: [
        {
          title: 'Technical Blog',
          description: '開発手法やツールの解説記事',
          tech: ['Markdown', 'Next.js', 'Technical Writing'],
          status: '継続中',
          downloads: '-'
        },
        {
          title: 'Tutorial Content',
          description: 'After EffectsやWeb開発のチュートリアル',
          tech: ['Video Production', 'Screen Recording'],
          status: '継続中',
          downloads: '-'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
              😎
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              samuido
            </h1>
            <p className="text-xl text-pink-200 mb-6">
              フロントエンドエンジニア & クリエイター
            </p>
            <p className="text-lg text-pink-100 max-w-2xl mx-auto leading-relaxed">
              Web開発、映像制作、ゲーム開発を軸に幅広く活動中。<br />
              新しい技術を学んで実践するのが好きです 🚀
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🧑‍💻</div>
              <div className="text-white font-semibold">高専3年</div>
              <div className="text-pink-200 text-sm">Student Dev</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-semibold">フルスタック</div>
              <div className="text-pink-200 text-sm">Frontend Focus</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-white font-semibold">クリエイティブ</div>
              <div className="text-pink-200 text-sm">Video & Design</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-white font-semibold">オープンソース</div>
              <div className="text-pink-200 text-sm">OSS Contributor</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-200"
            >
              ← About に戻る
            </Link>
            <Link
              href="/about/profile/real"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-pink-50 transition-all duration-200"
            >
              本名版プロフィール →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Tech Stack Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            技術スタック
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {Object.entries(techStack).map(([key, category]) => (
              <TechStackCard key={key} category={category} />
            ))}
          </div>
        </section>

        {/* Activities Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            制作活動・プロジェクト
          </h2>
          <div className="space-y-12">
            {activities.map((activity, index) => (
              <ActivitySection key={index} activity={activity} />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            連絡先・SNS
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ContactCard
                icon="📧"
                title="Email"
                value="361do.sleep@gmail.com"
                href="mailto:361do.sleep@gmail.com"
                gradient="from-blue-500 to-cyan-500"
              />
              <ContactCard
                icon="🐦"
                title="X (Dev)"
                value="@361do_sleep"
                href="https://twitter.com/361do_sleep"
                gradient="from-gray-700 to-gray-900"
              />
              <ContactCard
                icon="🎨"
                title="X (Design)"
                value="@361do_design"
                href="https://twitter.com/361do_design"
                gradient="from-pink-500 to-red-500"
              />
              <ContactCard
                icon="🐱"
                title="GitHub"
                value="@samuido"
                href="https://github.com/samuido"
                gradient="from-purple-600 to-indigo-600"
              />
            </div>
          </div>
        </section>

        {/* Fun Stats */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            活動統計
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StatCard
              icon="🔌"
              label="プラグイン"
              value="6+"
              subtitle="リリース済み"
            />
            <StatCard
              icon="⬇️"
              label="ダウンロード"
              value="2.3k+"
              subtitle="総ダウンロード数"
            />
            <StatCard
              icon="📝"
              label="記事"
              value="24+"
              subtitle="技術記事"
            />
            <StatCard
              icon="🎬"
              label="プロジェクト"
              value="50+"
              subtitle="制作案件"
            />
          </div>
        </section>

        {/* Related Links */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            関連ページ
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/portfolio"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                ポートフォリオ
              </h3>
              <p className="text-gray-600 text-sm">
                制作実績とプロジェクト
              </p>
            </Link>
            <Link
              href="/workshop"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                Workshop
              </h3>
              <p className="text-gray-600 text-sm">
                プラグインとツール
              </p>
            </Link>
            <Link
              href="/about/commission/develop"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                開発依頼
              </h3>
              <p className="text-gray-600 text-sm">
                お仕事のご相談
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Tech Stack Card Component
interface TechStackCardProps {
  category: {
    label: string;
    color: string;
    icon: string;
    items: { name: string; level: number; years: number }[];
  };
}

function TechStackCard({ category }: TechStackCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{category.icon}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${category.color}`}>
          {category.label}
        </span>
      </div>
      <div className="space-y-4">
        {category.items.map((tech) => (
          <div key={tech.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{tech.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{tech.years}年</span>
                <span className="text-sm text-gray-600">{tech.level}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${tech.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Activity Section Component
interface ActivitySectionProps {
  activity: {
    category: string;
    icon: string;
    color: string;
    items: {
      title: string;
      description: string;
      tech: string[];
      status: string;
      downloads: string;
    }[];
  };
}

function ActivitySection({ activity }: ActivitySectionProps) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <div className={`w-12 h-12 ${activity.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
          {activity.icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{activity.category}</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {activity.items.map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tech.map((tech) => (
                <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.status === 'リリース済み' 
                  ? 'bg-green-100 text-green-800' 
                  : item.status === '開発中'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {item.status}
              </span>
              {item.downloads !== '-' && (
                <span className="text-gray-500">
                  ⬇️ {item.downloads}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Contact Card Component
interface ContactCardProps {
  icon: string;
  title: string;
  value: string;
  href: string;
  gradient: string;
}

function ContactCard({ icon, title, value, href, gradient }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`h-12 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
        <span className="text-xl text-white">{icon}</span>
      </div>
      <div className="p-4 text-center">
        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-sm">
          {title}
        </h3>
        <p className="text-xs text-gray-600 mt-1">{value}</p>
      </div>
    </a>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle: string;
}

function StatCard({ icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

// SEO Metadata
export const metadata: Metadata = {
  title: 'Profile - samuido | samuidoのプロフィール',
  description: 'フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。',
  keywords: ['samuido', 'プロフィール', 'フロントエンド', '技術スタック', '個人開発', '制作活動'],
  robots: 'index, follow',
  openGraph: {
    title: 'Profile - samuido | samuidoのプロフィール',
    description: 'フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。',
    type: 'profile',
    url: 'https://yusuke-kim.com/about/profile/handle',
    images: [
      {
        url: 'https://yusuke-kim.com/about/profile-handle-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Profile - samuido'
      }
    ],
    siteName: 'samuido',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile - samuido | samuidoのプロフィール',
    description: 'フロントエンドエンジニアsamuidoのプロフィール。技術スタック、制作活動、個人開発についてご紹介。',
    images: ['https://yusuke-kim.com/about/profile-handle-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/about/profile/handle'
  }
};