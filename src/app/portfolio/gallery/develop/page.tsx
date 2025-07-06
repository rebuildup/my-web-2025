'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Code, Filter, Search, Calendar, Github, ExternalLink, Play, X, Eye } from 'lucide-react';
import type { ContentItem } from '@/types/content';

interface DevelopFilters {
  technology: string;
  subcategory: string;
  year: string;
  tag: string;
  sort: 'newest' | 'oldest' | 'technology' | 'alphabetical';
}

const initialFilters: DevelopFilters = {
  technology: '',
  subcategory: '',
  year: '',
  tag: '',
  sort: 'newest'
};

export default function DevelopmentGalleryPage() {
  const [portfolioItems, setPortfolioItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [filters, setFilters] = useState<DevelopFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Fetch development portfolio data
  useEffect(() => {
    const fetchDevelopmentData = async () => {
      try {
        const response = await fetch('/api/content/portfolio?category=develop&status=published');
        const data = await response.json();
        const items = data.items || [];
        
        setPortfolioItems(items);
        setFilteredItems(items);
        
        // Extract filter options
        const technologySet = new Set<string>();
        const subcategorySet = new Set<string>();
        const yearSet = new Set<string>();
        const tagSet = new Set<string>();
        
        items.forEach((item: ContentItem) => {
          if (item.tags) item.tags.forEach(tag => {
            tagSet.add(tag);
            // Technology tags (common programming languages/frameworks)
            if (['React', 'Next.js', 'TypeScript', 'JavaScript', 'Unity', 'C#', 'Python', 'Vue.js', 'Node.js'].includes(tag)) {
              technologySet.add(tag);
            }
          });
          
          // Subcategories from custom fields
          if (item.customFields?.subcategory) {
            subcategorySet.add(item.customFields.subcategory);
          }
          
          if (item.createdAt) {
            const year = new Date(item.createdAt).getFullYear().toString();
            yearSet.add(year);
          }
        });
        
        setTechnologies(Array.from(technologySet).sort());
        setSubcategories(Array.from(subcategorySet).sort());
        setYears(Array.from(yearSet).sort().reverse());
        setTags(Array.from(tagSet).sort());
        
      } catch (error) {
        console.error('Error fetching development data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevelopmentData();
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

    // Apply technology filter
    if (filters.technology) {
      filtered = filtered.filter(item => item.tags.includes(filters.technology));
    }

    // Apply subcategory filter
    if (filters.subcategory) {
      filtered = filtered.filter(item => item.customFields?.subcategory === filters.subcategory);
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

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'technology':
        filtered.sort((a, b) => {
          const aTech = a.tags.find(tag => technologies.includes(tag)) || '';
          const bTech = b.tags.find(tag => technologies.includes(tag)) || '';
          return aTech.localeCompare(bTech);
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredItems(filtered);
  }, [portfolioItems, filters, searchQuery, technologies]);

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
  };

  const getTechnologyColor = (technology: string) => {
    const colorMap: { [key: string]: string } = {
      'React': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Next.js': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'TypeScript': 'bg-blue-600/20 text-blue-500 border-blue-600/30',
      'JavaScript': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Unity': 'bg-gray-600/20 text-gray-500 border-gray-600/30',
      'C#': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Python': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Vue.js': 'bg-green-600/20 text-green-500 border-green-600/30',
      'Node.js': 'bg-green-700/20 text-green-600 border-green-700/30',
    };
    return colorMap[technology] || 'bg-primary/20 text-primary border-primary/30';
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
    "name": "samuido Development Works Gallery",
    "description": "開発作品ギャラリー",
    "url": "https://yusuke-kim.com/portfolio/gallery/develop",
    "mainEntity": {
      "@type": "ItemList",
      "name": "開発作品一覧",
      "description": "Webアプリ、ゲーム、ツール、プラグインなどの開発作品"
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
              <Code size={20} className="text-green-500" />
              <span className="neue-haas-grotesk-display text-lg text-foreground">
                Development
              </span>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
              Development Works
            </h1>
            <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
              開発作品を2列で交互に左右に配置し、クリックで詳細パネルを表示します。
              プログラミング関連の制作物を技術詳細と共に紹介します。
            </p>
            <div className="mt-6 h-1 w-24 bg-green-500 mx-auto"></div>
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
                  placeholder="プロジェクト名、技術、説明で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray border border-foreground/20 text-foreground placeholder-foreground/60 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  技術
                </label>
                <select
                  value={filters.technology}
                  onChange={(e) => setFilters({...filters, technology: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">すべて</option>
                  {technologies.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  カテゴリー
                </label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => setFilters({...filters, subcategory: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">すべて</option>
                  <option value="Webアプリ">Webアプリ</option>
                  <option value="ゲーム">ゲーム</option>
                  <option value="ツール">ツール</option>
                  <option value="プラグイン">プラグイン</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  年
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-green-500"
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
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">すべて</option>
                  {tags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  並び順
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value as DevelopFilters['sort']})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                  <option value="technology">技術順</option>
                  <option value="alphabetical">アルファベット順</option>
                </select>
              </div>
            </div>

            {/* Active Filters and Reset */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && key !== 'sort' && (
                    <span key={key} className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                      {value}
                      <button
                        onClick={() => setFilters({...filters, [key]: ''})}
                        className="ml-1 hover:text-green-300"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                    検索: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-green-300"
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

        {/* 2-Column Alternating Layout */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="space-y-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex items-center space-x-8 ${i % 2 === 1 ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="flex-1 animate-pulse">
                    <div className="aspect-video bg-foreground/20 rounded-lg mb-4"></div>
                  </div>
                  <div className="flex-1 animate-pulse">
                    <div className="h-6 bg-foreground/20 rounded mb-3"></div>
                    <div className="h-4 bg-foreground/20 rounded mb-2"></div>
                    <div className="h-4 bg-foreground/20 rounded w-3/4 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-foreground/20 rounded w-16"></div>
                      <div className="h-6 bg-foreground/20 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Code size={48} className="mx-auto text-foreground/40 mb-4" />
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                開発作品が見つかりませんでした
              </h3>
              <p className="noto-sans-jp text-foreground/60 mb-6">
                検索条件を変更するか、フィルターをリセットしてください。
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center space-x-8 lg:space-x-12 ${
                    index % 2 === 1 ? 'flex-row-reverse space-x-reverse lg:space-x-reverse' : ''
                  }`}
                >
                  {/* Image Side */}
                  <div className="flex-1">
                    <div
                      className="group cursor-pointer aspect-video bg-gradient-to-br from-green-500/10 to-blue-500/10 relative overflow-hidden border border-foreground/20 hover:shadow-lg transition-all duration-300"
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Code size={64} className="text-green-500/40" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Play size={32} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="flex-1">
                    <div className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                      <h2 className="neue-haas-grotesk-display text-2xl md:text-3xl text-foreground mb-3 hover:text-green-500 transition-colors">
                        {item.title}
                      </h2>
                      
                      <p className="noto-sans-jp text-foreground/80 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Technology Stack */}
                      <div className="mb-4">
                        <h3 className="neue-haas-grotesk-display text-sm text-foreground/70 mb-2">
                          TECH STACK
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.slice(0, 5).map((tag) => (
                            <span key={tag} className={`px-3 py-1 text-xs rounded border ${getTechnologyColor(tag)}`}>
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 5 && (
                            <span className="px-3 py-1 bg-foreground/20 text-foreground/60 text-xs rounded border border-foreground/30">
                              +{item.tags.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* External Links */}
                      {item.externalLinks && item.externalLinks.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {item.externalLinks.slice(0, 2).map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm rounded border border-green-500/30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {link.type === 'github' ? (
                                  <Github size={14} className="mr-1" />
                                ) : (
                                  <ExternalLink size={14} className="mr-1" />
                                )}
                                {link.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-foreground/60">
                        <span>{formatDate(item.createdAt)}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{item.stats?.views || 0}</span>
                          </div>
                          <div className="text-green-500 font-medium hover:underline">
                            詳細を見る →
                          </div>
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
            <div className="bg-gray max-w-5xl max-h-[80vh] overflow-auto border border-foreground/20 relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-foreground/60 hover:text-foreground z-10"
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

                {/* Preview Video */}
                {selectedItem.videos && selectedItem.videos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      プロダクトプレビュー
                    </h3>
                    {selectedItem.videos.map((video, index) => (
                      <div key={index} className="aspect-video bg-black/20 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <Play size={48} className="text-green-500 mx-auto mb-2" />
                          <p className="text-foreground/60 text-sm">
                            {video.title || 'Product Preview Video'}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedItem.images.map((image, index) => (
                        <div key={index} className="aspect-video bg-foreground/20 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${selectedItem.title} screenshot ${index + 1}`}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repository Links */}
                {selectedItem.externalLinks && selectedItem.externalLinks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      リポジトリ・リンク
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedItem.externalLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors rounded border border-green-500/30"
                        >
                          {link.type === 'github' ? (
                            <Github size={16} className="mr-2" />
                          ) : (
                            <ExternalLink size={16} className="mr-2" />
                          )}
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technology Tags */}
                <div className="mb-6">
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                    使用技術
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} className={`px-3 py-1 text-sm rounded border ${getTechnologyColor(tag)}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/portfolio/detail/${selectedItem.id}`}
                    className="flex-1 bg-green-500 text-white text-center py-3 hover:bg-green-600 transition-colors"
                  >
                    詳細ページを見る
                  </Link>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 border border-foreground/20 text-foreground hover:bg-gray/50 transition-colors"
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