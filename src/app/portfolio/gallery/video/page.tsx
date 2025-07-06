'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Video, Filter, Search, Calendar, Play, ExternalLink, X, Eye } from 'lucide-react';
import type { ContentItem } from '@/types/content';

interface VideoFilters {
  subcategory: string;
  year: string;
  tag: string;
  client: string;
  sort: 'newest' | 'oldest' | 'popular' | 'alphabetical';
}

const initialFilters: VideoFilters = {
  subcategory: '',
  year: '',
  tag: '',
  client: '',
  sort: 'newest'
};

export default function VideoGalleryPage() {
  const [portfolioItems, setPortfolioItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [filters, setFilters] = useState<VideoFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [clients, setClients] = useState<string[]>([]);

  // Fetch video portfolio data
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch('/api/content/portfolio?category=video&status=published');
        const data = await response.json();
        const items = data.items || [];
        
        setPortfolioItems(items);
        setFilteredItems(items);
        
        // Extract filter options
        const subcategorySet = new Set<string>();
        const yearSet = new Set<string>();
        const tagSet = new Set<string>();
        const clientSet = new Set<string>();
        
        items.forEach((item: ContentItem) => {
          if (item.tags) item.tags.forEach(tag => tagSet.add(tag));
          
          // Subcategories from custom fields or tags
          if (item.customFields?.subcategory) {
            subcategorySet.add(item.customFields.subcategory);
          }
          
          // Client from custom fields
          if (item.customFields?.client) {
            clientSet.add(item.customFields.client);
          }
          
          if (item.createdAt) {
            const year = new Date(item.createdAt).getFullYear().toString();
            yearSet.add(year);
          }
        });
        
        // Add default video categories
        ['MV', 'リリックモーション', 'アニメーション', 'プロモーション'].forEach(cat => subcategorySet.add(cat));
        
        setSubcategories(Array.from(subcategorySet).sort());
        setYears(Array.from(yearSet).sort().reverse());
        setTags(Array.from(tagSet).sort());
        setClients(Array.from(clientSet).sort());
        
      } catch (error) {
        console.error('Error fetching video data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...portfolioItems];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(item => 
        item.customFields?.subcategory === filters.subcategory ||
        item.tags.includes(filters.subcategory)
      );
    }

    // Apply year filter
    if (filters.year) {
      filtered = filtered.filter(item => {
        const itemYear = new Date(item.createdAt).getFullYear().toString();
        return itemYear === filters.year;
      });
    }

    // Apply tag filter
    if (filters.tag) {
      filtered = filtered.filter(item => item.tags.includes(filters.tag));
    }

    // Apply client filter
    if (filters.client) {
      filtered = filtered.filter(item => item.customFields?.client === filters.client);
    }

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredItems(filtered);
  }, [portfolioItems, filters, searchQuery]);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'MV': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'リリックモーション': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'アニメーション': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'プロモーション': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colorMap[category] || 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    });
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "samuido Video Works Gallery",
    "description": "映像作品ギャラリー",
    "url": "https://yusuke-kim.com/portfolio/gallery/video",
    "mainEntity": {
      "@type": "ItemList",
      "name": "映像作品一覧",
      "description": "MV、リリックモーション、アニメーション、プロモーション映像などの作品"
    },
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/portfolio" 
                className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80"
              >
                ← Portfolio
              </Link>
              <div className="text-foreground/40">|</div>
              <Link 
                href="/portfolio/gallery/all" 
                className="noto-sans-jp text-foreground/60 hover:text-foreground text-sm"
              >
                All Works
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Video size={20} className="text-purple-500" />
              <span className="neue-haas-grotesk-display text-lg text-foreground">
                Video Production
              </span>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
              Video Works Gallery
            </h1>
            <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
              foriioライクな表示で映像作品をサムネイル画像とタイトルをカードとして表示し、
              詳細パネルで動画とスクリーンショットを表示します。
            </p>
            <div className="mt-6 h-1 w-24 bg-purple-500 mx-auto"></div>
          </div>
        </header>

        {/* Search and Filter Controls */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-gray/50 border border-foreground/20 p-6 rounded-lg">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="映像作品名、説明、タグで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray border border-foreground/20 text-foreground placeholder-foreground/60 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  カテゴリー
                </label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => setFilters({...filters, subcategory: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">すべて</option>
                  {subcategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  年
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">すべて</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  タグ
                </label>
                <select
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">すべて</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  クライアント
                </label>
                <select
                  value={filters.client}
                  onChange={(e) => setFilters({...filters, client: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">すべて</option>
                  {clients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  並び順
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value as VideoFilters['sort']})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                  <option value="popular">人気順</option>
                  <option value="alphabetical">アルファベット順</option>
                </select>
              </div>
            </div>

            {/* Active Filters and Reset */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && key !== 'sort' && (
                    <span key={key} className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                      {value}
                      <button
                        onClick={() => setFilters({...filters, [key]: ''})}
                        className="ml-1 hover:text-purple-300"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30">
                    検索: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-purple-300"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
              
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground border border-foreground/20 hover:border-foreground/40 transition-colors"
              >
                フィルターをリセット
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="noto-sans-jp text-foreground/70 text-sm">
              {filteredItems.length} / {portfolioItems.length} 作品を表示
            </p>
            <div className="flex items-center space-x-2 text-foreground/60 text-sm">
              <Calendar size={16} />
              <span>最終更新: {new Date().toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
        </div>

        {/* Foriio-like Gallery Grid */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="break-inside-avoid animate-pulse">
                  <div className={`aspect-[4/5] bg-foreground/20 rounded-lg mb-4 ${i % 3 === 0 ? 'aspect-[4/6]' : i % 4 === 0 ? 'aspect-[4/4]' : ''}`}></div>
                  <div className="h-4 bg-foreground/20 rounded mb-2"></div>
                  <div className="h-3 bg-foreground/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Video size={48} className="mx-auto text-foreground/40 mb-4" />
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                映像作品が見つかりませんでした
              </h3>
              <p className="noto-sans-jp text-foreground/60 mb-6">
                検索条件を変更するか、フィルターをリセットしてください。
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="break-inside-avoid group cursor-pointer bg-gray/50 border border-foreground/20 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg overflow-hidden"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Thumbnail with varied aspect ratios */}
                  <div className={`
                    relative overflow-hidden
                    ${index % 5 === 0 ? 'aspect-[4/6]' : 
                      index % 7 === 0 ? 'aspect-square' :
                      index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/5]'
                    }
                  `}>
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <Video size={48} className="text-purple-500/40" />
                      </div>
                    )}
                    
                    {/* Video Play Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    {(item.customFields?.subcategory || item.tags[0]) && (
                      <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${getCategoryColor(item.customFields?.subcategory || item.tags[0])}`}>
                        {item.customFields?.subcategory || item.tags[0]}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-purple-500 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="noto-sans-jp text-sm text-foreground/70 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Client */}
                    {item.customFields?.client && (
                      <p className="text-xs text-foreground/60 mb-2">
                        Client: {item.customFields.client}
                      </p>
                    )}
                    
                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-foreground/60">
                      <span>{formatDate(item.createdAt)}</span>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{item.stats?.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray max-w-5xl max-h-[80vh] overflow-auto border border-foreground/20 relative rounded-lg">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-foreground/60 hover:text-foreground z-10 bg-black/20 backdrop-blur-sm rounded-full p-1"
              >
                <X size={24} />
              </button>
              
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="neue-haas-grotesk-display text-3xl text-foreground mb-3">
                    {selectedItem.title}
                  </h2>
                  <p className="noto-sans-jp text-foreground/80 leading-relaxed">
                    {selectedItem.description}
                  </p>
                  {selectedItem.customFields?.client && (
                    <p className="text-sm text-purple-400 mt-2">
                      Client: {selectedItem.customFields.client}
                    </p>
                  )}
                </div>

                {/* Embedded Video */}
                {selectedItem.videos && selectedItem.videos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      映像プレビュー
                    </h3>
                    {selectedItem.videos.map((video, index) => (
                      <div key={index} className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-purple-500/20 backdrop-blur-sm rounded-full p-4 mb-4">
                            <Play size={48} className="text-purple-400 ml-1" />
                          </div>
                          <p className="text-foreground/60">
                            {video.title || '映像プレビュー'}
                          </p>
                          <p className="text-foreground/40 text-sm mt-1">
                            {video.url}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Screenshots */}
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      スクリーンショット
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedItem.images.map((image, index) => (
                        <div key={index} className="aspect-video bg-foreground/20 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${selectedItem.title} screenshot ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Links */}
                {selectedItem.externalLinks && selectedItem.externalLinks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      作品リンク
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedItem.externalLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors rounded border border-purple-500/30"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                    タグ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded border border-purple-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/portfolio/detail/${selectedItem.id}`}
                    className="flex-1 bg-purple-500 text-white text-center py-3 hover:bg-purple-600 transition-colors rounded"
                  >
                    詳細ページを見る
                  </Link>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 border border-foreground/20 text-foreground hover:bg-gray/50 transition-colors rounded"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}