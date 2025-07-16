'use client';

import { searchContent } from '@/lib/search';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ContentType, SearchResult } from '@/types/content';

// Note: metadata export needs to be in a separate component or moved to layout
// For now, we'll handle SEO in the component itself using useEffect and document

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  // SEO設定
  useEffect(() => {
    document.title = 'Search - samuido | サイト内検索';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。'
      );
    }
  }, []);

  const categories = [
    { id: 'all', name: '全て' },
    { id: 'about', name: 'About' },
    { id: 'portfolio', name: 'Portfolio' },
    { id: 'workshop', name: 'Workshop' },
    { id: 'tools', name: 'Tools' },
  ];

  const types: { id: ContentType | 'all'; name: string }[] = [
    { id: 'all', name: '全て' },
    { id: 'page', name: 'ページ' },
    { id: 'blog', name: 'ブログ記事' },
    { id: 'plugin', name: 'プラグイン' },
    { id: 'tool', name: 'ツール' },
    { id: 'portfolio', name: '作品' },
  ];

  const handleSearch = async (query?: string) => {
    const finalQuery = query !== undefined ? query : searchQuery;
    if (!finalQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await searchContent(finalQuery, {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        type: selectedType === 'all' ? undefined : selectedType,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'samuido',
    description: 'フロントエンドエンジニアsamuidoの個人サイト',
    url: 'https://yusuke-kim.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://yusuke-kim.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* ヒーローヘッダー */}
        <section className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">Search</h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">サイト内検索</p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            プロフィール、ポートフォリオ、ワークショップ、ツールから
            <br />
            必要な情報を素早く見つけられます
          </p>
        </section>

        {/* 検索フォーム */}
        <section className="py-12">
          <div className="card">
            <div className="space-y-6">
              {/* 検索入力 */}
              <div>
                <label className="neue-haas-grotesk-display mb-3 block text-sm text-white">
                  キーワード検索
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="検索キーワードを入力..."
                    className="noto-sans-jp-regular flex-1 border border-gray-600 bg-gray-700 px-4 py-3 text-white"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={() => handleSearch()}
                    disabled={!searchQuery.trim() || isLoading}
                    className="bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? '検索中...' : '検索'}
                  </button>
                </div>
              </div>

              {/* フィルター */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category-select"
                    className="neue-haas-grotesk-display mb-3 block text-sm text-white"
                  >
                    カテゴリー
                  </label>
                  <select
                    id="category-select"
                    className="noto-sans-jp-regular w-full border border-gray-600 bg-gray-700 px-4 py-3 text-white"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="type-select"
                    className="neue-haas-grotesk-display mb-3 block text-sm text-white"
                  >
                    タイプ
                  </label>
                  <select
                    id="type-select"
                    className="noto-sans-jp-regular w-full border border-gray-600 bg-gray-700 px-4 py-3 text-white"
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value as ContentType | 'all')}
                  >
                    {types.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 検索結果 */}
        {hasSearched && (
          <section className="py-12">
            <div className="mb-6">
              <h2 className="neue-haas-grotesk-display mb-3 text-2xl text-white">検索結果</h2>
              <div className="noto-sans-jp-regular text-sm text-gray-400">
                {isLoading ? '検索中...' : `"${searchQuery}" の検索結果: ${searchResults.length}件`}
              </div>
            </div>

            {isLoading ? (
              <div className="card py-12 text-center">
                <div className="text-gray-400">検索中...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-6">
                {searchResults.map(result => (
                  <div key={result.id} className="card transition-colors hover:border-blue-500">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 px-2 py-1 text-xs text-white">
                          {categories.find(c => c.id === result.category)?.name}
                        </span>
                        <span className="bg-gray-600 px-2 py-1 text-xs text-white">
                          {types.find(t => t.id === result.type)?.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{result.score}</div>
                    </div>

                    <Link href={result.url} className="group block">
                      <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white transition-colors group-hover:text-blue-400">
                        {result.title}
                      </h3>
                      <p className="noto-sans-jp-regular text-sm leading-relaxed text-gray-300">
                        {result.description}
                      </p>
                      <div className="mt-2 text-xs text-blue-400 group-hover:underline">
                        {result.url} →
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card py-12 text-center">
                <div className="mb-3 text-gray-400">検索結果が見つかりませんでした</div>
                <div className="text-sm text-gray-500">別のキーワードでお試しください</div>
              </div>
            )}
          </section>
        )}

        {/* 検索のヒント */}
        {!hasSearched && (
          <section className="py-12">
            <div className="card">
              <h2 className="neue-haas-grotesk-display mb-4 text-xl text-white">検索のヒント</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">検索対象</h3>
                  <ul className="noto-sans-jp-regular space-y-2 text-sm text-gray-300">
                    <li>• プロフィールページ</li>
                    <li>• ポートフォリオ作品</li>
                    <li>• ブログ記事</li>
                    <li>• プラグイン・ツール</li>
                    <li>• ページタイトル・内容</li>
                  </ul>
                </div>
                <div>
                  <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">検索のコツ</h3>
                  <ul className="noto-sans-jp-regular space-y-2 text-sm text-gray-300">
                    <li>• 具体的なキーワードを使用</li>
                    <li>• カテゴリー・タイプフィルターを活用</li>
                    <li>• 複数のキーワードで絞り込み</li>
                    <li>• 英語・日本語どちらでも検索可能</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 人気の検索キーワード */}
        <section className="py-12">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-4 text-xl text-white">
              人気の検索キーワード
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                'React',
                'Next.js',
                'カラーパレット',
                'QRコード',
                'After Effects',
                'プラグイン',
                'ポートフォリオ',
                'プロフィール',
                'ツール',
                'ブログ',
              ].map(keyword => (
                <button
                  key={keyword}
                  onClick={() => {
                    setSearchQuery(keyword);
                    handleSearch(keyword);
                  }}
                  className="noto-sans-jp-regular bg-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Home
            </Link>
            <div className="flex gap-4">
              <Link href="/01_about" className="text-sm text-blue-400 hover:text-blue-300">
                About →
              </Link>
              <Link href="/02_portfolio" className="text-sm text-blue-400 hover:text-blue-300">
                Portfolio →
              </Link>
              <Link href="/00_global/contact" className="text-sm text-blue-400 hover:text-blue-300">
                Contact →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
