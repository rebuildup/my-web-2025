import Link from 'next/link';
import siteConfig from '@/../data/site-config.json';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/50 border-t border-white/20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              {siteConfig.site.name}
            </h3>
            <p className="text-sm text-white/70">
              {siteConfig.author.bio}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">ナビゲーション</h4>
            <ul className="space-y-2">
              {siteConfig.navigation.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">ソーシャル</h4>
            <ul className="space-y-2">
              {Object.entries(siteConfig.social).map(([platform, username]) => (
                <li key={platform}>
                  <a
                    href={platform === 'twitter' ? `https://twitter.com/${username.replace('@', '')}` : 
                          platform === 'github' ? `https://github.com/${username}` :
                          platform === 'booth' ? `https://${username}.booth.pm/` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-blue-400 transition-colors capitalize"
                  >
                    {platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">お問い合わせ</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/70 hover:text-blue-400 transition-colors"
                >
                  お仕事のご依頼
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.author.email}`}
                  className="text-sm text-white/70 hover:text-blue-400 transition-colors"
                >
                  メールでお問い合わせ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-sm text-white/60">
            © {currentYear} {siteConfig.site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}