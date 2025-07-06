import { Metadata } from 'next';
import Link from 'next/link';
import { ContentItem } from '@/types/content';

export const metadata: Metadata = {
  title: 'Plugins - samuido | プラグイン一覧',
  description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
  keywords: 'プラグイン, AfterEffects, Premiere Pro, エクスプレッション, エフェクト, ダウンロード',
  openGraph: {
    title: 'Plugins - samuido | プラグイン一覧',
    description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop/plugins',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/plugins-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Plugins - samuido',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plugins - samuido | プラグイン一覧',
    description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
    images: ['https://yusuke-kim.com/workshop/plugins-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

async function getPlugins() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/plugin`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plugins');
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch plugins:', error);
    return [];
  }
}

async function getPluginCategories(plugins: ContentItem[]) {
  const categories = new Set<string>();
  plugins.forEach(plugin => {
    if (plugin.category) categories.add(plugin.category);
  });
  return Array.from(categories);
}

export default async function PluginsPage() {
  const plugins = await getPlugins();
  const categories = await getPluginCategories(plugins);

  const popularPlugins = plugins
    .filter((plugin: ContentItem) => plugin.downloadInfo?.downloadCount && plugin.downloadInfo.downloadCount > 0)
    .sort((a: ContentItem, b: ContentItem) => 
      (b.downloadInfo?.downloadCount || 0) - (a.downloadInfo?.downloadCount || 0)
    )
    .slice(0, 6);

  const recentPlugins = plugins.slice(0, 6);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <section className="py-16 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/workshop" className="text-blue-500 hover:text-blue-400 transition-colors noto-sans-jp-light mb-4 inline-block">
            ← Workshop
          </Link>
          <h1 className="text-4xl font-bold mb-4 neue-haas-grotesk-display" style={{ color: '#0000ff' }}>
            Plugins
          </h1>
          <p className="text-xl mb-6 noto-sans-jp-light">
            プラグイン一覧・配布
          </p>
          <p className="text-lg max-w-2xl mx-auto noto-sans-jp-light text-gray-400">
            AfterEffects、Premiere Pro、Web用のプラグインを作成・配布しています。
            各プラグインの詳細情報、使用方法、ダウンロードリンクを提供しています。
          </p>
        </div>
      </section>

      {/* Software Category Filter */}
      <section className="py-8 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="プラグインを検索..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-none focus:outline-none focus:border-blue-500 noto-sans-jp-light"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-blue-500 text-white noto-sans-jp-light hover:bg-blue-600 transition-colors">
                全て
              </button>
              <button className="px-4 py-2 bg-gray-700 border border-gray-600 text-white noto-sans-jp-light hover:bg-gray-600 transition-colors">
                AfterEffects
              </button>
              <button className="px-4 py-2 bg-gray-700 border border-gray-600 text-white noto-sans-jp-light hover:bg-gray-600 transition-colors">
                Premiere Pro
              </button>
              <button className="px-4 py-2 bg-gray-700 border border-gray-600 text-white noto-sans-jp-light hover:bg-gray-600 transition-colors">
                Web
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Plugins */}
      {popularPlugins.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
              人気のプラグイン
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPlugins.map((plugin: ContentItem) => (
                <div key={plugin.id} className="border border-gray-700 hover:border-blue-500 transition-colors group">
                  {plugin.thumbnail && (
                    <div className="aspect-video bg-gray-800 overflow-hidden">
                      <img
                        src={plugin.thumbnail}
                        alt={plugin.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                        {plugin.category}
                      </span>
                      {plugin.downloadInfo?.version && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          v{plugin.downloadInfo.version}
                        </span>
                      )}
                      {plugin.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                      {plugin.title}
                    </h3>
                    <p className="text-gray-400 mb-4 noto-sans-jp-light line-clamp-3">
                      {plugin.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span className="noto-sans-jp-light">
                        {plugin.downloadInfo?.fileSize ? formatFileSize(plugin.downloadInfo.fileSize) : '不明'}
                      </span>
                      <span className="noto-sans-jp-light">
                        {plugin.downloadInfo?.downloadCount || 0} downloads
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors noto-sans-jp-light">
                        ダウンロード
                      </button>
                      {plugin.externalLinks?.find(link => link.type === 'github') && (
                        <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors noto-sans-jp-light">
                          GitHub
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Plugins */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            最新のプラグイン
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPlugins.map((plugin: ContentItem) => (
              <div key={plugin.id} className="border border-gray-700 hover:border-blue-500 transition-colors group">
                {plugin.thumbnail && (
                  <div className="aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={plugin.thumbnail}
                      alt={plugin.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                      {plugin.category}
                    </span>
                    {plugin.downloadInfo?.version && (
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                        v{plugin.downloadInfo.version}
                      </span>
                    )}
                    {plugin.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                    {plugin.title}
                  </h3>
                  <p className="text-gray-400 mb-4 noto-sans-jp-light line-clamp-3">
                    {plugin.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span className="noto-sans-jp-light">
                      {plugin.downloadInfo?.fileSize ? formatFileSize(plugin.downloadInfo.fileSize) : '不明'}
                    </span>
                    <span className="noto-sans-jp-light">
                      {plugin.downloadInfo?.downloadCount || 0} downloads
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors noto-sans-jp-light">
                      ダウンロード
                    </button>
                    {plugin.externalLinks?.find(link => link.type === 'github') && (
                      <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors noto-sans-jp-light">
                        GitHub
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Plugins */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            全てのプラグイン
          </h2>
          <div className="space-y-4">
            {plugins.map((plugin: ContentItem) => (
              <div key={plugin.id} className="border border-gray-700 hover:border-blue-500 transition-colors group p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {plugin.thumbnail && (
                    <div className="w-full md:w-48 aspect-video bg-gray-800 overflow-hidden">
                      <img
                        src={plugin.thumbnail}
                        alt={plugin.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                        {plugin.category}
                      </span>
                      {plugin.downloadInfo?.version && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          v{plugin.downloadInfo.version}
                        </span>
                      )}
                      {plugin.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                      {plugin.title}
                    </h3>
                    <p className="text-gray-400 mb-4 noto-sans-jp-light">
                      {plugin.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <div className="flex gap-4">
                        <span className="noto-sans-jp-light">
                          {plugin.downloadInfo?.fileSize ? formatFileSize(plugin.downloadInfo.fileSize) : '不明'}
                        </span>
                        <span className="noto-sans-jp-light">
                          {plugin.downloadInfo?.downloadCount || 0} downloads
                        </span>
                      </div>
                      <span className="noto-sans-jp-light">
                        {new Date(plugin.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors noto-sans-jp-light">
                        ダウンロード
                      </button>
                      {plugin.externalLinks?.find(link => link.type === 'github') && (
                        <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors noto-sans-jp-light">
                          GitHub
                        </button>
                      )}
                      {plugin.externalLinks?.find(link => link.type === 'demo') && (
                        <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors noto-sans-jp-light">
                          デモ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plugin Categories */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            プラグインカテゴリ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-700 hover:border-blue-500 transition-colors text-center">
              <div className="text-3xl mb-4">🎬</div>
              <h3 className="text-lg font-bold mb-3 noto-sans-jp-light">AfterEffects</h3>
              <p className="text-gray-400 mb-4 noto-sans-jp-light">
                エクスプレッション、エフェクト、スクリプト、パネル
              </p>
              <p className="text-sm text-gray-500 noto-sans-jp-light">
                {plugins.filter(p => p.category?.includes('AfterEffects')).length} 件
              </p>
            </div>
            <div className="p-6 border border-gray-700 hover:border-blue-500 transition-colors text-center">
              <div className="text-3xl mb-4">🎞️</div>
              <h3 className="text-lg font-bold mb-3 noto-sans-jp-light">Premiere Pro</h3>
              <p className="text-gray-400 mb-4 noto-sans-jp-light">
                エフェクト、トランジション、スクリプト、エクステンション
              </p>
              <p className="text-sm text-gray-500 noto-sans-jp-light">
                {plugins.filter(p => p.category?.includes('Premiere')).length} 件
              </p>
            </div>
            <div className="p-6 border border-gray-700 hover:border-blue-500 transition-colors text-center">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-lg font-bold mb-3 noto-sans-jp-light">Web</h3>
              <p className="text-gray-400 mb-4 noto-sans-jp-light">
                Webアプリケーション、ブラウザ拡張機能
              </p>
              <p className="text-sm text-gray-500 noto-sans-jp-light">
                {plugins.filter(p => p.category?.includes('Web')).length} 件
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            インストール方法
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 noto-sans-jp-light">
                AfterEffects プラグイン
              </h3>
              <ol className="space-y-2 text-gray-400 noto-sans-jp-light">
                <li>1. プラグインファイルをダウンロード</li>
                <li>2. AfterEffectsのPluginsフォルダに配置</li>
                <li>3. AfterEffectsを再起動</li>
                <li>4. Effectsメニューから選択</li>
              </ol>
            </div>
            <div className="p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 noto-sans-jp-light">
                Premiere Pro プラグイン
              </h3>
              <ol className="space-y-2 text-gray-400 noto-sans-jp-light">
                <li>1. プラグインファイルをダウンロード</li>
                <li>2. Premiere ProのPluginsフォルダに配置</li>
                <li>3. Premiere Proを再起動</li>
                <li>4. Effectsパネルから選択</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "samuido Plugins",
            "description": "作成したプラグインの一覧",
            "url": "https://yusuke-kim.com/workshop/plugins",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Plugin List",
              "description": "プラグインの一覧"
            }
          })
        }}
      />
    </div>
  );
}