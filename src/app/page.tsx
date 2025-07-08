'use client';

import Link from 'next/link';
import { Briefcase, Wrench, BookOpen, User, Mail, Settings } from 'lucide-react';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';

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
    <GridLayout>
      {/* Header */}
      <GridSection spacing="lg">
        <div className="text-center">
          <h1 className="font-display text-foreground mb-10 text-6xl xs:text-7xl md:text-8xl">
            My Web 2025
          </h1>
          <p className="text-foreground/80 mx-auto mb-10 max-w-2xl text-xl md:text-2xl">
            クリエイティブツール・ポートフォリオ・ワークショップコンテンツ
          </p>
          
          {/* サイト内検索 */}
          <div className="mb-12">
            <h2 className="font-display text-foreground mb-6 text-2xl">
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
          
          <div className="bg-primary mx-auto h-1 w-32"></div>
        </div>
      </GridSection>

      {/* Main Content */}
      <GridSection spacing="lg">
        <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }}>
          {categories.map(category => (
            <Link
              key={category.title}
              href={category.href}
              className={`block border-2 p-6 xs:p-8 ${category.color} bg-background h-full rounded shadow transition-shadow hover:shadow-lg`}
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">{category.icon()}</div>
                <h2 className="font-display text-foreground mb-4 text-2xl">{category.title}</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">{category.description}</p>
                <div className="text-foreground mt-auto pt-4 text-sm font-medium">詳細を見る →</div>
              </div>
            </Link>
          ))}
        </GridContent>
      </GridSection>

      {/* Footer */}
      <footer className="border-foreground/20 border-t">
        <GridContainer className="py-10">
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
        </GridContainer>
      </footer>
    </GridLayout>
  );
}
