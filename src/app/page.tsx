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
          <h1 className="font-display text-foreground xs:text-7xl mb-10 text-6xl md:text-8xl">
            Welcome to My Digital Workspace
          </h1>
          <p className="text-foreground/80 mx-auto mb-10 max-w-2xl text-xl md:text-2xl">
            Creative tools, portfolio, and workshop content
          </p>
          {/* サイト内検索 */}
          <div className="mb-12">
            <h2 className="font-display text-foreground mb-6 text-2xl">Site Search</h2>
            <div className="mx-auto max-w-md">
              <input
                type="text"
                placeholder="Search by keyword..."
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
        <main>
          <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }}>
            {/* Portfolio */}
            <Link
              href="/portfolio"
              className="xs:p-8 bg-background block h-full rounded border-2 border-blue-500 p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">
                  <Briefcase size={32} />
                </div>
                <h2 className="font-display text-foreground mb-4 text-2xl">Portfolio</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">Projects and works</p>
                <button className="mt-auto font-bold text-blue-600">View Portfolio</button>
              </div>
            </Link>
            {/* Tools */}
            <Link
              href="/tools"
              className="xs:p-8 bg-background block h-full rounded border-2 border-green-500 p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">
                  <Wrench size={32} />
                </div>
                <h2 className="font-display text-foreground mb-4 text-2xl">Tools</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  Generators and calculators
                </p>
                <button className="mt-auto font-bold text-green-600">Explore Tools</button>
              </div>
            </Link>
            {/* Workshop */}
            <Link
              href="/workshop"
              className="xs:p-8 bg-background block h-full rounded border-2 border-purple-500 p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">
                  <BookOpen size={32} />
                </div>
                <h2 className="font-display text-foreground mb-4 text-2xl">Workshop</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">Blog, plugins, downloads</p>
              </div>
            </Link>
            {/* About */}
            <Link
              href="/about"
              className="xs:p-8 bg-background block h-full rounded border-2 border-yellow-500 p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">
                  <User size={32} />
                </div>
                <h2 className="font-display text-foreground mb-4 text-2xl">About</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">Profile, skills, contact</p>
              </div>
            </Link>
            {/* Contact */}
            <Link
              href="/contact"
              className="xs:p-8 bg-background block h-full rounded border-2 border-red-500 p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">
                  <Mail size={32} />
                </div>
                <h2 className="font-display text-foreground mb-4 text-2xl">Contact</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">Contact and requests</p>
              </div>
            </Link>
            {/* Admin */}
            <Link
              href="/admin"
              className="xs:p-8 bg-background block h-full rounded border-2 border-gray-500 p-6 shadow transition-shadow hover:shadow-lg"
            >
              <div className="flex h-full flex-col">
                <div className="text-foreground mb-6">
                  <Settings size={32} />
                </div>
                <h2 className="font-display text-foreground mb-4 text-2xl">Admin</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  Admin dashboard (dev only)
                </p>
              </div>
            </Link>
          </GridContent>
        </main>
      </GridSection>

      {/* Feature Sections */}
      <GridSection spacing="lg">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <h3 className="font-display text-foreground mb-4 text-xl">Creative Development</h3>
            <p className="text-foreground/70">Web, design, and creative coding projects.</p>
          </div>
          <div className="text-center">
            <h3 className="font-display text-foreground mb-4 text-xl">Digital Tools</h3>
            <p className="text-foreground/70">Useful generators and calculators for creators.</p>
          </div>
          <div className="text-center">
            <h3 className="font-display text-foreground mb-4 text-xl">Open Source</h3>
            <p className="text-foreground/70">Plugins, libraries, and open resources.</p>
          </div>
        </div>
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
