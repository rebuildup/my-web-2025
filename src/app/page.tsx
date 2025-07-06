'use client';

import Link from 'next/link';
import { Briefcase, Wrench, BookOpen, User, Mail, Settings } from 'lucide-react';

interface CategoryCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const categories: CategoryCard[] = [
  {
    title: 'Portfolio',
    description: '作品集・プロジェクト・制作実績',
    href: '/portfolio',
    icon: <Briefcase size={32} />,
    color: 'border-blue-500',
  },
  {
    title: 'Tools',
    description: '便利ツール・ジェネレーター・計算機',
    href: '/tools',
    icon: <Wrench size={32} />,
    color: 'border-green-500',
  },
  {
    title: 'Workshop',
    description: 'ブログ・プラグイン・ダウンロード',
    href: '/workshop',
    icon: <BookOpen size={32} />,
    color: 'border-purple-500',
  },
  {
    title: 'About',
    description: 'プロフィール・経歴・スキル・連絡先',
    href: '/about',
    icon: <User size={32} />,
    color: 'border-yellow-500',
  },
  {
    title: 'Contact',
    description: 'お問い合わせ・依頼・相談',
    href: '/contact',
    icon: <Mail size={32} />,
    color: 'border-red-500',
  },
  {
    title: 'Admin',
    description: '管理画面・データ管理（開発用）',
    href: '/admin',
    icon: <Settings size={32} />,
    color: 'border-gray-500',
  },
];

export default function Home() {
  return (
    <div className="bg-gray min-h-screen">
      {/* Header */}
      <header className="px-4 py-16 text-center">
        <h1 className="neue-haas-grotesk-display text-primary mb-4 text-6xl md:text-8xl">
          My Web 2025
        </h1>
        <p className="noto-sans-jp text-foreground/80 mx-auto max-w-2xl text-xl md:text-2xl">
          クリエイティブツール・ポートフォリオ・ワークショップコンテンツ
        </p>
        <div className="bg-primary mx-auto mt-8 h-1 w-32"></div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-16">
        {/* Site Map Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <Link
              key={category.title}
              href={category.href}
              className={`group block border-2 p-8 ${category.color} bg-gray transition-all duration-300 hover:scale-105 hover:shadow-lg`}
            >
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="text-primary transition-transform duration-300 group-hover:scale-110">
                  {category.icon}
                </div>

                <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                  {category.title}
                </h2>

                <p className="noto-sans-jp text-foreground/70 leading-relaxed">
                  {category.description}
                </p>

                <div className="text-primary mt-4 text-sm font-medium group-hover:underline">
                  詳細を見る →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Search Section */}
        <section className="mt-16 text-center">
          <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-3xl">サイト内検索</h2>

          <div className="mx-auto max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="キーワードで検索..."
                className="border-primary/30 bg-gray text-foreground focus:border-primary noto-sans-jp w-full rounded-none border-2 px-4 py-3 focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value;
                    if (query.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(query)}`;
                    }
                  }
                }}
              />
              <button
                className="text-primary hover:text-primary/80 absolute top-1/2 right-2 -translate-y-1/2 transform"
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  const query = input?.value;
                  if (query?.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }}
              >
                検索
              </button>
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="mt-16">
          <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
            最新の更新
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="border-foreground/20 bg-gray/50 border p-6">
              <h3 className="neue-haas-grotesk-display text-primary mb-2 text-lg">Portfolio</h3>
              <p className="noto-sans-jp text-foreground/70 text-sm">
                React Portfolio Website - モダンなポートフォリオサイトを追加
              </p>
              <p className="text-foreground/50 mt-2 text-xs">2024.12.01</p>
            </div>

            <div className="border-foreground/20 bg-gray/50 border p-6">
              <h3 className="neue-haas-grotesk-display text-primary mb-2 text-lg">Tools</h3>
              <p className="noto-sans-jp text-foreground/70 text-sm">
                Color Palette Generator - カラーパレット生成ツールを公開
              </p>
              <p className="text-foreground/50 mt-2 text-xs">2024.12.01</p>
            </div>

            <div className="border-foreground/20 bg-gray/50 border p-6">
              <h3 className="neue-haas-grotesk-display text-primary mb-2 text-lg">Workshop</h3>
              <p className="noto-sans-jp text-foreground/70 text-sm">
                Next.js 15 & React 19 - 最新技術の解説記事を投稿
              </p>
              <p className="text-foreground/50 mt-2 text-xs">2024.12.10</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-foreground/20 border-t py-8 text-center">
        <p className="noto-sans-jp text-foreground/60 text-sm">
          © 2025 My Web 2025. All rights reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link href="/privacy-policy" className="text-foreground/60 hover:text-primary text-sm">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
