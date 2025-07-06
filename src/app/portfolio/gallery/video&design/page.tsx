'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Palette, Filter, Search, Calendar, ExternalLink, X, Eye } from 'lucide-react';
import type { ContentItem } from '@/types/content';

interface VideoDesignFilters {
  subcategory: string;
  year: string;
  tag: string;
  sizeType: string;
  sort: 'newest' | 'oldest' | 'popular' | 'sizeType';
}

const initialFilters: VideoDesignFilters = {
  subcategory: '',
  year: '',
  tag: '',
  sizeType: '',
  sort: 'newest'
};

interface GridItem extends ContentItem {
  gridSpan: string;
}

export default function VideoDesignGalleryPage() {
  const [portfolioItems, setPortfolioItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GridItem[]>([]);
  const [filters, setFilters] = useState<VideoDesignFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Fetch video&design portfolio data
  useEffect(() => {
    const fetchVideoDesignData = async () => {
      try {
        const response = await fetch('/api/content/portfolio?category=video%26design&status=published');
        const data = await response.json();
        const items = data.items || [];
        
        setPortfolioItems(items);
        
        // Extract filter options
        const subcategorySet = new Set<string>();
        const yearSet = new Set<string>();
        const tagSet = new Set<string>();
        
        items.forEach((item: ContentItem) => {
          if (item.tags) item.tags.forEach(tag => tagSet.add(tag));
          
          // Subcategories
          if (item.customFields?.subcategory) {
            subcategorySet.add(item.customFields.subcategory);
          }
          
          if (item.createdAt) {
            const year = new Date(item.createdAt).getFullYear().toString();
            yearSet.add(year);
          }
        });
        
        // Add default categories
        ['映像', 'デザイン', '映像・デザイン複合'].forEach(cat => subcategorySet.add(cat));
        
        setSubcategories(Array.from(subcategorySet).sort());
        setYears(Array.from(yearSet).sort().reverse());
        setTags(Array.from(tagSet).sort());
        
      } catch (error) {
        console.error('Error fetching video&design data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDesignData();
  }, []);

  // Generate dynamic grid layout
  const generateGridLayout = (items: ContentItem[]): GridItem[] => {
    return items.map((item, index) => {
      // Determine grid span based on aspect ratio and content type
      let gridSpan = 'col-span-1 row-span-1'; // Default 1x1
      
      const aspectRatio = item.customFields?.aspectRatio || '1:1';
      const sizeType = item.customFields?.sizeType || 'auto';
      
      // Dynamic sizing based on content and index
      if (sizeType === '2x2' || aspectRatio === '1:1') {
        gridSpan = 'col-span-2 row-span-2'; // 2x2 square
      } else if (sizeType === '1x2' || aspectRatio === '9:16') {
        gridSpan = 'col-span-1 row-span-2'; // 1x2 tall
      } else if (sizeType === '2x1' || aspectRatio === '16:9') {
        gridSpan = 'col-span-2 row-span-1'; // 2x1 wide
      } else if (sizeType === '1x3') {
        gridSpan = 'col-span-1 row-span-3'; // 1x3 very tall
      } else {
        // Automatic sizing based on index for variety
        const patterns = [
          'col-span-1 row-span-1', // Standard
          'col-span-2 row-span-1', // Wide
          'col-span-1 row-span-2', // Tall
          'col-span-2 row-span-2', // Large square
        ];
        gridSpan = patterns[index % patterns.length];
      }
      
      return {
        ...item,
        gridSpan
      };
    });
  };

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

    // Apply size type filter
    if (filters.sizeType) {
      filtered = filtered.filter(item => {
        const sizeType = item.customFields?.sizeType || 'auto';
        return sizeType === filters.sizeType;
      });
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
      case 'sizeType':
        filtered.sort((a, b) => {
          const aSize = a.customFields?.sizeType || 'auto';
          const bSize = b.customFields?.sizeType || 'auto';
          return aSize.localeCompare(bSize);
        });
        break;
    }

    setFilteredItems(generateGridLayout(filtered));
  }, [portfolioItems, filters, searchQuery]);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      '映像': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'デザイン': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      '映像・デザイン複合': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    };
    return colorMap[category] || 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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
    "name": "samuido Video & Design Works Gallery",
    "description": "映像&デザイン作品ギャラリー",
    "url": "https://yusuke-kim.com/portfolio/gallery/video&design",
    "mainEntity": {
      "@type": "ItemList",
      "name": "映像&デザイン作品一覧",
      "description": "映像とデザインを組み合わせた作品の一覧"
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
              <Palette size={20} className="text-yellow-500" />
              <span className="neue-haas-grotesk-display text-lg text-foreground">
                Video & Design
              </span>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
              Video & Design Gallery
            </h1>
            <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
              サムネイル画像を縦3列のグリッドで表示し、コンテンツに応じたサイズで独特な一覧表示を実現。
              映像とデザインを組み合わせた作品をクリエイティブに紹介します。
            </p>
            <div className="mt-6 h-1 w-24 bg-yellow-500 mx-auto"></div>
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
                  placeholder="映像・デザイン作品名、説明、タグで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray border border-foreground/20 text-foreground placeholder-foreground/60 focus:outline-none focus:border-yellow-500"
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
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-yellow-500"
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
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-yellow-500"
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
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="">すべて</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  サイズ
                </label>
                <select
                  value={filters.sizeType}
                  onChange={(e) => setFilters({...filters, sizeType: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="">すべて</option>
                  <option value="1x2">縦長</option>
                  <option value="2x1">横長</option>
                  <option value="2x2">正方形</option>
                  <option value="1x3">超縦長</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  並び順
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value as VideoDesignFilters['sort']})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                  <option value="popular">人気順</option>
                  <option value="sizeType">サイズ順</option>
                </select>
              </div>
            </div>

            {/* Active Filters and Reset */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && key !== 'sort' && (
                    <span key={key} className="inline-flex items-center px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                      {value}
                      <button
                        onClick={() => setFilters({...filters, [key]: ''})}
                        className="ml-1 hover:text-yellow-300"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded border border-yellow-500/30">
                    検索: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-yellow-300"
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

        {/* Dynamic 3-Column Grid */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4 auto-rows-[200px]">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`animate-pulse bg-foreground/20 rounded-lg ${
                  i % 4 === 0 ? 'col-span-2 row-span-2' :
                  i % 6 === 0 ? 'col-span-1 row-span-2' :
                  i % 8 === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'
                }`}></div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Palette size={48} className="mx-auto text-foreground/40 mb-4" />
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                映像・デザイン作品が見つかりませんでした
              </h3>
              <p className="noto-sans-jp text-foreground/60 mb-6">
                検索条件を変更するか、フィルターをリセットしてください。
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 auto-rows-[200px]">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`group cursor-pointer bg-gray/50 border border-foreground/20 hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-lg overflow-hidden relative ${item.gridSpan}`}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-full">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-yellow-500/10 to-pink-500/10">
                        <Palette size={48} className="text-yellow-500/40" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 opacity-0 group-hover:opacity-100">
                      <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                        <h3 className="neue-haas-grotesk-display text-lg mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="noto-sans-jp text-sm opacity-90 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        
                        {/* External Links */}
                        {item.externalLinks && item.externalLinks.length > 0 && (
                          <div className="flex gap-2 mb-2">
                            {item.externalLinks.slice(0, 2).map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors text-xs rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={12} className="mr-1" />
                                {link.title}
                              </a>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-yellow-400 text-sm font-medium">
                          詳細を見る →
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    {(item.customFields?.subcategory || item.tags[0]) && (
                      <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${getCategoryColor(item.customFields?.subcategory || item.tags[0])}`}>
                        {item.customFields?.subcategory || item.tags[0]}
                      </div>
                    )}

                    {/* View Count */}
                    <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/20 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                      <Eye size={12} />
                      <span>{item.stats?.views || 0}</span>
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
                </div>

                {/* Design Concept */}
                {selectedItem.customFields?.designConcept && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      デザインコンセプト
                    </h3>
                    <p className="noto-sans-jp text-foreground/80">
                      {selectedItem.customFields.designConcept}
                    </p>
                  </div>
                )}

                {/* Images */}
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      作品画像
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedItem.images.map((image, index) => (
                        <div key={index} className="aspect-video bg-foreground/20 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${selectedItem.title} image ${index + 1}`}
                            width={400}
                            height={300}
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
                          className="inline-flex items-center px-4 py-2 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors rounded border border-yellow-500/30"
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
                      <span key={tag} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded border border-yellow-500/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/portfolio/detail/${selectedItem.id}`}
                    className="flex-1 bg-yellow-500 text-white text-center py-3 hover:bg-yellow-600 transition-colors rounded"
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