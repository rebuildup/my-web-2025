import { Metadata } from 'next';
import Link from 'next/link';
import { ContentItem } from '@/types/content';

export const metadata: Metadata = {
  title: 'Downloads - samuido | ファイルダウンロード',
  description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
  keywords: 'ダウンロード, 素材, ツール, テンプレート, 無償配布, ファイル',
  openGraph: {
    title: 'Downloads - samuido | ファイルダウンロード',
    description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop/downloads',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/downloads-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Downloads - samuido',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads - samuido | ファイルダウンロード',
    description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
    images: ['https://yusuke-kim.com/workshop/downloads-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

async function getDownloads() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/download`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch downloads');
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch downloads:', error);
    return [];
  }
}

async function getDownloadCategories(downloads: ContentItem[]) {
  const categories = new Set<string>();
  downloads.forEach(download => {
    if (download.category) categories.add(download.category);
  });
  return Array.from(categories);
}

export default async function DownloadsPage() {
  const downloads = await getDownloads();
  const categories = await getDownloadCategories(downloads);

  const popularDownloads = downloads
    .filter((download: ContentItem) => download.downloadInfo?.downloadCount && download.downloadInfo.downloadCount > 0)
    .sort((a: ContentItem, b: ContentItem) => 
      (b.downloadInfo?.downloadCount || 0) - (a.downloadInfo?.downloadCount || 0)
    )
    .slice(0, 6);

  const recentDownloads = downloads.slice(0, 6);

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
            Downloads
          </h1>
          <p className="text-xl mb-6 noto-sans-jp-light">
            無償配布ファイル・素材・ツール
          </p>
          <p className="text-lg max-w-2xl mx-auto noto-sans-jp-light text-gray-400">
            テンプレート、素材集、ツールなど、クリエイティブワークで使用できるファイルを無償配布しています。
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="ファイルを検索..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-none focus:outline-none focus:border-blue-500 noto-sans-jp-light"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-blue-500 text-white noto-sans-jp-light hover:bg-blue-600 transition-colors">
                全て
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white noto-sans-jp-light hover:bg-gray-600 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Downloads */}
      {popularDownloads.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
              人気のダウンロード
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDownloads.map((download: ContentItem) => (
                <div key={download.id} className="border border-gray-700 hover:border-blue-500 transition-colors group">
                  {download.thumbnail && (
                    <div className="aspect-video bg-gray-800 overflow-hidden">
                      <img
                        src={download.thumbnail}
                        alt={download.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                        {download.category}
                      </span>
                      {download.downloadInfo?.fileType && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          {download.downloadInfo.fileType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                      {download.title}
                    </h3>
                    <p className="text-gray-400 mb-4 noto-sans-jp-light line-clamp-3">
                      {download.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span className="noto-sans-jp-light">
                        {download.downloadInfo?.fileSize ? formatFileSize(download.downloadInfo.fileSize) : '不明'}
                      </span>
                      <span className="noto-sans-jp-light">
                        {download.downloadInfo?.downloadCount || 0} downloads
                      </span>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors noto-sans-jp-light">
                      ダウンロード
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Downloads */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            最新のダウンロード
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDownloads.map((download: ContentItem) => (
              <div key={download.id} className="border border-gray-700 hover:border-blue-500 transition-colors group">
                {download.thumbnail && (
                  <div className="aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={download.thumbnail}
                      alt={download.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                      {download.category}
                    </span>
                    {download.downloadInfo?.fileType && (
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                        {download.downloadInfo.fileType}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                    {download.title}
                  </h3>
                  <p className="text-gray-400 mb-4 noto-sans-jp-light line-clamp-3">
                    {download.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span className="noto-sans-jp-light">
                      {download.downloadInfo?.fileSize ? formatFileSize(download.downloadInfo.fileSize) : '不明'}
                    </span>
                    <span className="noto-sans-jp-light">
                      {download.downloadInfo?.downloadCount || 0} downloads
                    </span>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 hover:bg-blue-600 transition-colors noto-sans-jp-light">
                    ダウンロード
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Downloads */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            全てのダウンロード
          </h2>
          <div className="space-y-4">
            {downloads.map((download: ContentItem) => (
              <div key={download.id} className="border border-gray-700 hover:border-blue-500 transition-colors group p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {download.thumbnail && (
                    <div className="w-full md:w-48 aspect-video bg-gray-800 overflow-hidden">
                      <img
                        src={download.thumbnail}
                        alt={download.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                        {download.category}
                      </span>
                      {download.downloadInfo?.fileType && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          {download.downloadInfo.fileType}
                        </span>
                      )}
                      {download.downloadInfo?.version && (
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          v{download.downloadInfo.version}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                      {download.title}
                    </h3>
                    <p className="text-gray-400 mb-4 noto-sans-jp-light">
                      {download.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <div className="flex gap-4">
                        <span className="noto-sans-jp-light">
                          {download.downloadInfo?.fileSize ? formatFileSize(download.downloadInfo.fileSize) : '不明'}
                        </span>
                        <span className="noto-sans-jp-light">
                          {download.downloadInfo?.downloadCount || 0} downloads
                        </span>
                      </div>
                      <span className="noto-sans-jp-light">
                        {new Date(download.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <button className="bg-blue-500 text-white px-6 py-2 hover:bg-blue-600 transition-colors noto-sans-jp-light">
                      ダウンロード
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* File Type Categories */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            ファイル種類別
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['素材ファイル', 'ツール', 'テンプレート', 'その他'].map((type) => (
              <div key={type} className="p-6 border border-gray-700 hover:border-blue-500 transition-colors text-center">
                <div className="text-2xl mb-2">
                  {type === '素材ファイル' && '🎨'}
                  {type === 'ツール' && '🔧'}
                  {type === 'テンプレート' && '📄'}
                  {type === 'その他' && '📦'}
                </div>
                <h3 className="font-bold mb-2 noto-sans-jp-light">{type}</h3>
                <p className="text-sm text-gray-400 noto-sans-jp-light">
                  {downloads.filter(d => d.category === type).length} 件
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* License Information */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            ライセンス情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 noto-sans-jp-light">
                無償配布ファイル
              </h3>
              <p className="text-gray-400 noto-sans-jp-light">
                個人・商用問わず自由にご利用いただけます。
                再配布や改変も可能です。
              </p>
            </div>
            <div className="p-6 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 noto-sans-jp-light">
                注意事項
              </h3>
              <p className="text-gray-400 noto-sans-jp-light">
                ファイルの使用により生じた問題については、
                責任を負いかねます。
              </p>
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
            "name": "samuido Downloads",
            "description": "無償配布するファイルのダウンロード",
            "url": "https://yusuke-kim.com/workshop/downloads",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Download List",
              "description": "ダウンロードファイルの一覧"
            }
          })
        }}
      />
    </div>
  );
}