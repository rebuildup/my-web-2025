import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "GitHub", href: "https://github.com/samuido", icon: "🐙" },
    { name: "Twitter", href: "https://twitter.com/samuido", icon: "🐦" },
    { name: "BOOTH", href: "https://samuido.booth.pm", icon: "🛍️" },
  ];

  const quickLinks = [
    { name: "About", href: "/about" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Workshop", href: "/workshop" },
    { name: "Tools", href: "/tools" },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight mb-4"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                samuido
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              フルスタック開発者として、創造的で実用的なWebソリューションを提供します。
              技術の力で世界をより良い場所にすることを目指しています。
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                  aria-label={link.name}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    {link.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>🌐 Web Developer</p>
              <p>🎨 Digital Creator</p>
              <p>🛠️ Tool Maker</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {currentYear} samuido. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
