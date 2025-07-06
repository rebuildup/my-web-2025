'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Database, 
  FileText, 
  Image,
  Video,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  ExternalLink,
  Save,
  X,
  Check,
  AlertCircle,
  Upload,
  RefreshCw
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: 'portfolio' | 'tool' | 'blog' | 'plugin' | 'download';
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
  author: string;
  views: number;
  tags: string[];
  featured: boolean;
}

export default function DataManagerPage() {
  const [isDevMode, setIsDevMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastModified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Mock data - in real implementation, this would come from an API
  const mockData: ContentItem[] = [
    {
      id: '1',
      title: 'React Portfolio Site',
      type: 'portfolio',
      status: 'published',
      lastModified: '2024-01-15T10:30:00Z',
      author: 'samuido',
      views: 1245,
      tags: ['React', 'TypeScript', 'Next.js'],
      featured: true,
    },
    {
      id: '2',
      title: 'Color Palette Generator',
      type: 'tool',
      status: 'published',
      lastModified: '2024-01-14T15:45:00Z',
      author: 'samuido',
      views: 867,
      tags: ['CSS', 'Design', 'Color Theory'],
      featured: false,
    },
    {
      id: '3',
      title: 'Next.js 14 Guide',
      type: 'blog',
      status: 'draft',
      lastModified: '2024-01-13T09:15:00Z',
      author: 'samuido',
      views: 0,
      tags: ['Next.js', 'React', 'Tutorial'],
      featured: false,
    },
    {
      id: '4',
      title: 'AE Expression Helper',
      type: 'plugin',
      status: 'published',
      lastModified: '2024-01-12T14:20:00Z',
      author: 'samuido',
      views: 432,
      tags: ['After Effects', 'Plugin', 'Animation'],
      featured: true,
    },
    {
      id: '5',
      title: 'Brand Identity Kit',
      type: 'download',
      status: 'published',
      lastModified: '2024-01-11T11:30:00Z',
      author: 'samuido',
      views: 298,
      tags: ['Design', 'Branding', 'Resources'],
      featured: false,
    },
  ];

  useEffect(() => {
    // Check if running in development mode
    setIsDevMode(process.env.NODE_ENV === 'development');
    
    // Load content items (mock data)
    setContentItems(mockData);
    setLoading(false);
  }, []);

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortBy as keyof ContentItem];
    const bValue = b[sortBy as keyof ContentItem];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === sortedItems.length 
        ? [] 
        : sortedItems.map(item => item.id)
    );
  };

  const handleBulkAction = (action: 'delete' | 'publish' | 'archive') => {
    console.log(`Bulk action: ${action} for items:`, selectedItems);
    // In real implementation, this would make API calls
    setSelectedItems([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-500';
      case 'draft': return 'text-yellow-500';
      case 'archived': return 'text-gray-500';
      default: return 'text-foreground/70';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'portfolio': return <Image size={16} />;
      case 'tool': return <Database size={16} />;
      case 'blog': return <FileText size={16} />;
      case 'plugin': return <Download size={16} />;
      case 'download': return <Download size={16} />;
      default: return <FileText size={16} />;
    }
  };

  if (!isDevMode) {
    return (
      <div className="min-h-screen bg-gray flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-primary mx-auto mb-6" />
          <h1 className="neue-haas-grotesk-display text-4xl text-primary mb-4">
            Access Denied
          </h1>
          <p className="noto-sans-jp text-foreground/70 mb-6">
            Data Manager access is only available in development mode.
          </p>
          <Link 
            href="/admin"
            className="inline-block px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray">
      {/* Navigation */}
      <nav className="border-b border-foreground/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin" 
              className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="neue-haas-grotesk-display">Admin Dashboard</span>
            </Link>
            <span className="text-foreground/40">|</span>
            <span className="neue-haas-grotesk-display text-foreground">Data Manager</span>
          </div>
          <div className="text-sm text-foreground/60">
            Development Mode Only
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="neue-haas-grotesk-display text-3xl md:text-4xl text-primary mb-2">
                Data Manager
              </h1>
              <p className="noto-sans-jp text-foreground/80">
                Manage and organize all content items
              </p>
            </div>
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              <span>New Item</span>
            </button>
          </div>
          <div className="h-1 w-16 bg-primary"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search size={20} className="text-foreground/60" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground placeholder-foreground/50 focus:outline-none focus:border-primary w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-foreground/60" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Types</option>
                <option value="portfolio">Portfolio</option>
                <option value="tool">Tools</option>
                <option value="blog">Blog</option>
                <option value="plugin">Plugins</option>
                <option value="download">Downloads</option>
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-foreground/60">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="lastModified">Last Modified</option>
                <option value="title">Title</option>
                <option value="views">Views</option>
                <option value="type">Type</option>
              </select>
              
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-foreground/20 bg-gray/50 hover:border-primary transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-primary/10 border border-primary/20">
              <span className="text-sm text-foreground">
                {selectedItems.length} items selected
              </span>
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-3 py-1 bg-green-500 text-white hover:bg-green-600 transition-colors text-sm"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 bg-yellow-500 text-white hover:bg-yellow-600 transition-colors text-sm"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="border border-foreground/20 bg-gray/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/20">
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === sortedItems.length && sortedItems.length > 0}
                      onChange={handleSelectAll}
                      className="accent-primary"
                    />
                  </th>
                  <th className="p-4 text-left neue-haas-grotesk-display text-foreground">Title</th>
                  <th className="p-4 text-left neue-haas-grotesk-display text-foreground">Type</th>
                  <th className="p-4 text-left neue-haas-grotesk-display text-foreground">Status</th>
                  <th className="p-4 text-left neue-haas-grotesk-display text-foreground">Views</th>
                  <th className="p-4 text-left neue-haas-grotesk-display text-foreground">Modified</th>
                  <th className="p-4 text-left neue-haas-grotesk-display text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <RefreshCw size={24} className="text-primary animate-spin mx-auto mb-2" />
                      <span className="text-foreground/70">Loading content...</span>
                    </td>
                  </tr>
                ) : sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-foreground/70">
                      No items found matching your criteria
                    </td>
                  </tr>
                ) : (
                  sortedItems.map(item => (
                    <tr key={item.id} className="border-b border-foreground/10 hover:bg-gray/70 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="accent-primary"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-sm text-foreground/60 flex items-center space-x-2">
                              <span>by {item.author}</span>
                              {item.featured && (
                                <span className="px-2 py-1 bg-primary text-white text-xs">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-foreground/40 mt-1">
                              {item.tags.map(tag => (
                                <span key={tag} className="inline-block mr-2">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize text-foreground/70">{item.type}</span>
                      </td>
                      <td className="p-4">
                        <span className={`capitalize ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-foreground/70">
                        {item.views.toLocaleString()}
                      </td>
                      <td className="p-4 text-foreground/70 text-sm">
                        {formatDate(item.lastModified)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => console.log('View', item.id)}
                            className="p-2 text-foreground/60 hover:text-primary transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowEditor(true);
                            }}
                            className="p-2 text-foreground/60 hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => console.log('Delete', item.id)}
                            className="p-2 text-foreground/60 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 border border-foreground/20 bg-gray/50">
            <div className="text-sm text-foreground/60 mb-1">Total Items</div>
            <div className="neue-haas-grotesk-display text-2xl text-foreground">
              {contentItems.length}
            </div>
          </div>
          <div className="p-4 border border-foreground/20 bg-gray/50">
            <div className="text-sm text-foreground/60 mb-1">Published</div>
            <div className="neue-haas-grotesk-display text-2xl text-green-500">
              {contentItems.filter(item => item.status === 'published').length}
            </div>
          </div>
          <div className="p-4 border border-foreground/20 bg-gray/50">
            <div className="text-sm text-foreground/60 mb-1">Draft</div>
            <div className="neue-haas-grotesk-display text-2xl text-yellow-500">
              {contentItems.filter(item => item.status === 'draft').length}
            </div>
          </div>
          <div className="p-4 border border-foreground/20 bg-gray/50">
            <div className="text-sm text-foreground/60 mb-1">Total Views</div>
            <div className="neue-haas-grotesk-display text-2xl text-foreground">
              {contentItems.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </main>

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray border border-foreground/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-foreground/20">
              <div className="flex items-center justify-between">
                <h2 className="neue-haas-grotesk-display text-xl text-foreground">
                  {editingItem ? 'Edit Item' : 'New Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingItem(null);
                  }}
                  className="text-foreground/60 hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    defaultValue={editingItem?.title || ''}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
                    placeholder="Enter item title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    defaultValue={editingItem?.type || 'portfolio'}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="portfolio">Portfolio</option>
                    <option value="tool">Tool</option>
                    <option value="blog">Blog</option>
                    <option value="plugin">Plugin</option>
                    <option value="download">Download</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    defaultValue={editingItem?.status || 'draft'}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    defaultValue={editingItem?.tags?.join(', ') || ''}
                    className="w-full px-3 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
                    placeholder="React, TypeScript, Next.js"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={editingItem?.featured || false}
                    className="accent-primary"
                  />
                  <label className="text-sm text-foreground">
                    Featured item
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-foreground/20">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Save item');
                    setShowEditor(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  Save Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}