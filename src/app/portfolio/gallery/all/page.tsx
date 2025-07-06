'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Grid, Filter, Search, Calendar, Tag, X, Play, ExternalLink, Github, Eye } from 'lucide-react';
import type { ContentItem } from '@/types/content';

interface GalleryFilters {
  category: string;
  technology: string;
  year: string;
  tag: string;
  sort: 'newest' | 'oldest' | 'popular' | 'alphabetical';
}

const initialFilters: GalleryFilters = {
  category: '',
  technology: '',
  year: '',
  tag: '',
  sort: 'newest'
};

export default function AllWorksGalleryPage() {
  const [portfolioItems, setPortfolioItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [filters, setFilters] = useState<GalleryFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('/api/content/portfolio?status=published');
        const data = await response.json();
        const items = data.items || [];
        
        setPortfolioItems(items);
        setFilteredItems(items);
        
        // Extract filter options
        const categorySet = new Set<string>();
        const technologySet = new Set<string>();
        const yearSet = new Set<string>();
        const tagSet = new Set<string>();
        
        items.forEach((item: ContentItem) => {
          if (item.category) categorySet.add(item.category);
          if (item.tags) item.tags.forEach(tag => tagSet.add(tag));
          if (item.createdAt) {
            const year = new Date(item.createdAt).getFullYear().toString();
            yearSet.add(year);
          }
        });
        
        setCategories(Array.from(categorySet).sort());
        setTechnologies(Array.from(technologySet).sort());
        setYears(Array.from(yearSet).sort().reverse());
        setTags(Array.from(tagSet).sort());
        
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
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

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    // Apply technology filter
    if (filters.technology) {
      filtered = filtered.filter(item => item.tags.includes(filters.technology));
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
    switch (category) {
      case 'develop': return 'border-green-500 bg-green-500/10';
      case 'video': return 'border-purple-500 bg-purple-500/10';
      case 'video&design': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
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
    "name": "samuido All Works Gallery",
    "description": "全作品ギャラリー",
    "url": "https://yusuke-kim.com/portfolio/gallery/all",
    "mainEntity": {
      "@type": "ItemList",
      "name": "作品一覧",
      "description": "Web開発、映像制作、デザイン作品の一覧"
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
                href="/" 
                className="noto-sans-jp text-foreground/60 hover:text-foreground text-sm"
              >
                Home
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Grid size={20} className="text-primary" />
              <span className="neue-haas-grotesk-display text-lg text-foreground">
                All Works
              </span>
            </div>
          </div>
        </nav>

        {/* Header */}
        <header className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
              All Works Gallery
            </h1>
            <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
              すべての作品をサムネイル画像のカード一覧で表示し、クリックで詳細パネルを表示します。
            </p>
            <div className="mt-6 h-1 w-24 bg-primary mx-auto"></div>
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
                  placeholder="作品名、説明、タグで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray border border-foreground/20 text-foreground placeholder-foreground/60 focus:outline-none focus:border-primary"
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
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">すべて</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  技術
                </label>
                <select
                  value={filters.technology}
                  onChange={(e) => setFilters({...filters, technology: e.target.value})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">すべて</option>
                  {technologies.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
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
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-primary"
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
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-primary"
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
                  onChange={(e) => setFilters({...filters, sort: e.target.value as GalleryFilters['sort']})}
                  className="w-full p-2 bg-gray border border-foreground/20 text-foreground text-sm focus:outline-none focus:border-primary"
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
                    <span key={key} className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      {value}
                      <button
                        onClick={() => setFilters({...filters, [key]: ''})}
                        className="ml-1 hover:text-primary/80"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                    検索: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-primary/80"
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

        {/* Gallery Grid */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-foreground/20 rounded-lg mb-4"></div>
                  <div className="h-4 bg-foreground/20 rounded mb-2"></div>
                  <div className="h-3 bg-foreground/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-foreground/20 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <Search size={48} className="mx-auto text-foreground/40 mb-4" />
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-2">
                作品が見つかりませんでした
              </h3>
              <p className="noto-sans-jp text-foreground/60 mb-6">
                検索条件を変更するか、フィルターをリセットしてください。
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                フィルターをリセット
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer border border-foreground/20 bg-gray/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/20 relative overflow-hidden">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Grid size={48} className="text-primary/40" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play size={24} className="text-white" />
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="noto-sans-jp text-sm text-foreground/70 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-foreground/20 text-foreground/60 text-xs rounded">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
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
            <div className="bg-gray max-w-4xl max-h-[80vh] overflow-auto border border-foreground/20 relative">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-foreground/60 hover:text-foreground z-10"
              >
                <X size={24} />
              </button>
              
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="neue-haas-grotesk-display text-2xl text-foreground mb-2">
                    {selectedItem.title}
                  </h2>
                  <p className="noto-sans-jp text-foreground/80">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Main Content */}
                <div className="mb-6">
                  {/* Videos */}
                  {selectedItem.videos && selectedItem.videos.length > 0 && (
                    <div className="mb-6">
                      {selectedItem.videos.map((video, index) => (
                        <div key={index} className="aspect-video bg-black/20 rounded-lg mb-4 flex items-center justify-center">
                          <div className="text-center">
                            <Play size={48} className="text-primary mx-auto mb-2" />
                            <p className="text-foreground/60 text-sm">
                              {video.title || 'Video Preview'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
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
                  )}
                </div>

                {/* External Links */}
                {selectedItem.externalLinks && selectedItem.externalLinks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                      External Links
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.externalLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm rounded"
                        >
                          {link.type === 'github' ? (
                            <Github size={16} className="mr-1" />
                          ) : (
                            <ExternalLink size={16} className="mr-1" />
                          )}
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-primary/20 text-primary text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/portfolio/detail/${selectedItem.id}`}
                    className="flex-1 bg-primary text-white text-center py-3 hover:bg-primary/90 transition-colors"
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