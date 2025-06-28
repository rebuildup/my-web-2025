'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import siteConfig from '@/../data/site-config.json';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-xl font-bold text-white hover:text-blue-400 transition-colors"
        >
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {siteConfig.site.name}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-400',
                pathname === item.href 
                  ? 'text-blue-400' 
                  : 'text-white/80'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button - placeholder for now */}
        <button className="md:hidden p-2 text-white/80 hover:text-white">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}