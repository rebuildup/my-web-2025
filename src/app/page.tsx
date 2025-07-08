'use client';

import Link from 'next/link';
import { Briefcase, Wrench, BookOpen, User, Mail, Settings } from 'lucide-react';

interface CategoryCard {
  title: string;
  description: string;
  href: string;
  icon: () => React.ReactNode;
  color: string;
}

const categories: CategoryCard[] = [
  {
    title: 'Portfolio',
    description: '作品集・プロジェクト・制作実績',
    href: '/portfolio',
    icon: () => <Briefcase size={32} />,
    color: 'border-blue-500',
  },
  {
    title: 'Tools',
    description: '便利ツール・ジェネレーター・計算機',
    href: '/tools',
    icon: () => <Wrench size={32} />,
    color: 'border-green-500',
  },
  {
    title: 'Workshop',
    description: 'ブログ・プラグイン・ダウンロード',
    href: '/workshop',
    icon: () => <BookOpen size={32} />,
    color: 'border-purple-500',
  },
  {
    title: 'About',
    description: 'プロフィール・経歴・スキル・連絡先',
    href: '/about',
    icon: () => <User size={32} />,
    color: 'border-yellow-500',
  },
  {
    title: 'Contact',
    description: 'お問い合わせ・依頼・相談',
    href: '/contact',
    icon: () => <Mail size={32} />,
    color: 'border-red-500',
  },
  {
    title: 'Admin',
    description: '管理画面・データ管理（開発用）',
    href: '/admin',
    icon: () => <Settings size={32} />,
    color: 'border-gray-500',
  },
];

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-foreground mb-10 text-center text-6xl md:text-8xl">
            My Web 2025
          </h1>
          <p className="text-foreground/80 mx-auto mb-10 max-w-2xl text-center text-xl md:text-2xl">
            クリエイティブツール・ポートフォリオ・ワークショップコンテンツ
          </p>
          {/* サイト内検索をヘッダーに移動 */}
          <div className="mb-12 flex justify-center">
            <div className="mx-auto w-full max-w-5xl">
              <h2 className="font-display text-foreground mb-6 text-center text-2xl">
                サイト内検索
              </h2>
              <div className="mx-auto max-w-md">
                <input
                  type="text"
                  placeholder="キーワードで検索..."
                  className="border-foreground/30 bg-background text-foreground focus:border-foreground mb-4 w-full rounded border-2 px-4 py-3 focus:outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const query = (e.target as HTMLInputElement).value;
                      if (query.trim()) {
                        window.location.href = `/search?q=${encodeURIComponent(query)}`;
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="bg-primary mx-auto mt-10 h-1 w-32"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        {/* Site Map Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <Link
              key={category.title}
              href={category.href}
              className={`block border-2 p-8 ${category.color} bg-background h-full rounded shadow transition-shadow hover:shadow-lg`}
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">{category.icon()}</div>
                <h2 className="font-display text-foreground mb-4 text-2xl">{category.title}</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">{category.description}</p>
                <div className="text-foreground mt-auto pt-4 text-sm font-medium">詳細を見る →</div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-foreground/20 container mx-auto mt-10 border-t px-4 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-foreground/60 mb-2 text-sm">
            © 2025 My Web 2025. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6">
            <Link href="/privacy-policy" className="text-foreground/60 text-sm">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-foreground/60 text-sm">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
