import { Metadata } from 'next';
import Link from 'next/link';

export default function RealProfilePage() {
  const skills = {
    design: {
      label: 'デザイン',
      color: 'bg-pink-100 text-pink-800',
      items: [
        { name: 'Photoshop', level: 90 },
        { name: 'Illustrator', level: 85 },
        { name: 'Adobe XD', level: 80 },
        { name: 'Figma', level: 75 }
      ]
    },
    programming: {
      label: 'プログラミング',
      color: 'bg-blue-100 text-blue-800',
      items: [
        { name: 'TypeScript', level: 90 },
        { name: 'JavaScript', level: 95 },
        { name: 'C++', level: 85 },
        { name: 'C#', level: 80 },
        { name: 'HTML/CSS', level: 95 }
      ]
    },
    framework: {
      label: '技術スタック',
      color: 'bg-green-100 text-green-800',
      items: [
        { name: 'React', level: 90 },
        { name: 'Next.js', level: 85 },
        { name: 'Tailwind CSS', level: 90 },
        { name: 'p5.js', level: 75 },
        { name: 'PIXI.js', level: 70 },
        { name: 'GSAP', level: 80 }
      ]
    },
    video: {
      label: '映像制作',
      color: 'bg-purple-100 text-purple-800',
      items: [
        { name: 'After Effects', level: 95 },
        { name: 'Aviutl', level: 90 },
        { name: 'Premiere Pro', level: 85 },
        { name: 'Blender', level: 70 }
      ]
    },
    other: {
      label: 'その他',
      color: 'bg-gray-100 text-gray-800',
      items: [
        { name: 'Unity', level: 75 },
        { name: 'Cubase', level: 60 }
      ]
    }
  };

  const timeline = [
    {
      date: '2024年3月',
      type: 'award',
      title: '中国地区高専コンピュータフェスティバル2024',
      description: 'ゲーム部門 1位',
      icon: '🏆',
      color: 'bg-yellow-100 border-yellow-400 text-yellow-800'
    },
    {
      date: '2023年10月',
      type: 'award',
      title: 'U-16プログラミングコンテスト山口大会2023',
      description: '技術賞・企業(プライムゲート)賞',
      icon: '🏆',
      color: 'bg-yellow-100 border-yellow-400 text-yellow-800'
    },
    {
      date: '2023年4月',
      type: 'education',
      title: '高専入学',
      description: '現在在学中',
      icon: '🎓',
      color: 'bg-blue-100 border-blue-400 text-blue-800'
    },
    {
      date: '2023年3月',
      type: 'education',
      title: '公立中学卒業',
      description: '美術展覧会などで受賞多数',
      icon: '🎓',
      color: 'bg-blue-100 border-blue-400 text-blue-800'
    },
    {
      date: '2022年10月',
      type: 'award',
      title: 'U-16プログラミングコンテスト山口大会2022',
      description: 'アイデア賞',
      icon: '🏆',
      color: 'bg-yellow-100 border-yellow-400 text-yellow-800'
    },
    {
      date: '~2023年',
      type: 'award',
      title: '市区学校美術展覧会',
      description: '受賞多数',
      icon: '🎨',
      color: 'bg-pink-100 border-pink-400 text-pink-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
              👨‍💻
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              木村友亮
            </h1>
            <p className="text-xl text-indigo-200 mb-6">
              Webデザイナー・開発者
            </p>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed">
              グラフィックデザイン、映像制作、個人開発など幅広く活動しています。<br />
              やる気になれば何でもできるのが強みです。
            </p>
          </div>

          {/* Basic Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-white font-semibold">平成19年10月生</div>
              <div className="text-indigo-200 text-sm">Born in 2007</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🎓</div>
              <div className="text-white font-semibold">現役高専生</div>
              <div className="text-indigo-200 text-sm">2025年7月現在</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl mb-2">🚀</div>
              <div className="text-white font-semibold">多分野活動</div>
              <div className="text-indigo-200 text-sm">何でもできる</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-900 transition-all duration-200"
            >
              ← About に戻る
            </Link>
            <Link
              href="/about/profile/handle"
              className="px-6 py-3 bg-white text-indigo-900 rounded-lg hover:bg-indigo-50 transition-all duration-200"
            >
              ハンドルネーム版 →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Skills Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            スキル・技術
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {Object.entries(skills).map(([key, category]) => (
              <SkillCategory key={key} category={category} />
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            経歴・学歴・受賞歴
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-purple-400"></div>
              
              {/* Timeline Items */}
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <TimelineItem key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            連絡先・SNS
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <ContactCard
                icon="📧"
                title="Email"
                subtitle="開発・技術関連"
                value="rebuild.up.up@gmail.com"
                href="mailto:rebuild.up.up@gmail.com"
                gradient="from-blue-500 to-cyan-500"
              />
              <ContactCard
                icon="📧"
                title="Email"
                subtitle="映像・デザイン関連"
                value="361do.sleep@gmail.com"
                href="mailto:361do.sleep@gmail.com"
                gradient="from-purple-500 to-pink-500"
              />
              <ContactCard
                icon="🐦"
                title="X (Twitter)"
                subtitle="開発関連"
                value="@361do_sleep"
                href="https://twitter.com/361do_sleep"
                gradient="from-gray-700 to-gray-900"
              />
              <ContactCard
                icon="🎨"
                title="X (Twitter)"
                subtitle="映像・デザイン関連"
                value="@361do_design"
                href="https://twitter.com/361do_design"
                gradient="from-pink-500 to-red-500"
              />
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            関連ページ
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/about/profile/handle"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">😊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                ハンドルネーム版
              </h3>
              <p className="text-gray-600 text-sm">
                カジュアルな自己紹介ページ
              </p>
            </Link>
            <Link
              href="/about/card/real"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                デジタル名刺
              </h3>
              <p className="text-gray-600 text-sm">
                プロフェッショナル名刺
              </p>
            </Link>
            <Link
              href="/about/commission/develop"
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                開発依頼
              </h3>
              <p className="text-gray-600 text-sm">
                開発案件のご相談
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Skill Category Component
interface SkillCategoryProps {
  category: {
    label: string;
    color: string;
    items: { name: string; level: number }[];
  };
}

function SkillCategory({ category }: SkillCategoryProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${category.color}`}>
        {category.label}
      </div>
      <div className="space-y-4">
        {category.items.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">{skill.name}</span>
              <span className="text-sm text-gray-600">{skill.level}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${skill.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Timeline Item Component
interface TimelineItemProps {
  item: {
    date: string;
    type: string;
    title: string;
    description: string;
    icon: string;
    color: string;
  };
}

function TimelineItem({ item }: TimelineItemProps) {
  return (
    <div className="relative flex items-start">
      {/* Icon */}
      <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 ${item.color} flex items-center justify-center z-10 bg-white`}>
        <span className="text-xl">{item.icon}</span>
      </div>
      
      {/* Content */}
      <div className="ml-6 flex-1 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
          <span className="text-sm text-gray-500 mt-1 md:mt-0">{item.date}</span>
        </div>
        <p className="text-gray-600">{item.description}</p>
      </div>
    </div>
  );
}

// Contact Card Component
interface ContactCardProps {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  href: string;
  gradient: string;
}

function ContactCard({ icon, title, subtitle, value, href, gradient }: ContactCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`h-16 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </a>
  );
}

// SEO Metadata
export const metadata: Metadata = {
  title: 'Profile - samuido | 木村友亮の詳細プロフィール',
  description: 'Webデザイナー・開発者木村友亮の詳細プロフィール。学歴、職歴、スキル、受賞歴を時系列でご紹介。',
  keywords: ['木村友亮', 'プロフィール', '経歴', '学歴', 'スキル', '職歴', '受賞歴', '高専生'],
  robots: 'index, follow',
  openGraph: {
    title: 'Profile - samuido | 木村友亮の詳細プロフィール',
    description: 'Webデザイナー・開発者木村友亮の詳細プロフィール。学歴、職歴、スキル、受賞歴を時系列でご紹介。',
    type: 'profile',
    url: 'https://yusuke-kim.com/about/profile/real',
    images: [
      {
        url: 'https://yusuke-kim.com/about/profile-real-og-image.jpg',
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
    title: 'Profile - samuido | 木村友亮の詳細プロフィール',
    description: 'Webデザイナー・開発者木村友亮の詳細プロフィール。学歴、職歴、スキル、受賞歴を時系列でご紹介。',
    images: ['https://yusuke-kim.com/about/profile-real-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/about/profile/real'
  }
};