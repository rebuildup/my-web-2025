'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Download, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';

interface ContentItem {
  id: string;
  type: 'portfolio' | 'blog' | 'plugin' | 'download';
  title: string;
  description: string;
  content?: string;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  author: string;
  mediaUrl?: string;
  downloadUrl?: string;
  fileSize?: string;
  downloadCount?: number;
}

export default function AdminContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedType, setSelectedType] = useState<'all' | 'portfolio' | 'blog' | 'plugin' | 'download'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    category: '',
    type: 'blog' as ContentItem['type'],
    status: 'draft' as ContentItem['status']
  });

  useEffect(() => {
    loadContentItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [contentItems, selectedType, searchQuery]);

  const loadContentItems = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockItems: ContentItem[] = [
      {
        id: '1',
        type: 'portfolio',
        title: 'React Dashboard Project',
        description: 'A comprehensive dashboard built with React and TypeScript',
        content: '# React Dashboard\n\nThis project showcases...',
        tags: ['React', 'TypeScript', 'Dashboard'],
        category: 'Web Development',
        status: 'published',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-16T14:20:00Z',
        author: 'Admin',
        mediaUrl: '/portfolio/react-dashboard.jpg'
      },
      {
        id: '2',
        type: 'blog',
        title: 'Modern JavaScript Patterns',
        description: 'Exploring advanced JavaScript patterns and best practices',
        content: '# JavaScript Patterns\n\nIn this article, we explore...',
        tags: ['JavaScript', 'Patterns', 'Best Practices'],
        category: 'Programming',
        status: 'published',
        createdAt: '2024-01-14T09:15:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        author: 'Admin'
      },
      {
        id: '3',
        type: 'plugin',
        title: 'Color Palette Generator Plugin',
        description: 'Generate beautiful color palettes for your designs',
        tags: ['Design', 'Colors', 'Tools'],
        category: 'Design Tools',
        status: 'published',
        createdAt: '2024-01-13T11:20:00Z',
        updatedAt: '2024-01-13T11:20:00Z',
        author: 'Admin',
        downloadUrl: '/downloads/color-palette-plugin.zip',
        fileSize: '2.1 MB',
        downloadCount: 847
      },
      {
        id: '4',
        type: 'download',
        title: 'Icon Pack - Essential UI',
        description: 'A collection of 200+ essential UI icons',
        tags: ['Icons', 'UI', 'Design Assets'],
        category: 'Design Resources',
        status: 'published',
        createdAt: '2024-01-12T15:30:00Z',
        updatedAt: '2024-01-12T15:30:00Z',
        author: 'Admin',
        downloadUrl: '/downloads/essential-ui-icons.zip',
        fileSize: '15.4 MB',
        downloadCount: 1263
      }
    ];

    setContentItems(mockItems);
    setIsLoading(false);
  };

  const filterItems = () => {
    let filtered = contentItems;

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const handleCreateNew = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      tags: '',
      category: '',
      type: 'blog',
      status: 'draft'
    });
    setSelectedTab('create');
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content || '',
      tags: item.tags.join(', '),
      category: item.category,
      type: item.type,
      status: item.status
    });
    setSelectedTab('edit');
  };

  const handleSave = async () => {
    // Simulate save operation
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSelectedTab('list');
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setContentItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'portfolio': return '💼';
      case 'blog': return '📝';
      case 'plugin': return '🔌';
      case 'download': return '📦';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-900';
      case 'draft': return 'text-yellow-400 bg-yellow-900';
      case 'archived': return 'text-gray-400 bg-gray-700';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  return (
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer padding={false} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-xl"
            >
              ← Admin Dashboard
            </a>
          </div>
          <div className="text-foreground/60 text-sm">Content Management</div>
        </GridContainer>
      </nav>

      {/* Header */}
      <GridSection spacing="md">
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-3xl md:text-4xl">
            Content Manager
          </h1>
          <p className="noto-sans-jp text-foreground/80">
            Create, edit, and manage all website content
          </p>
      </GridSection>

      {/* Main Content */}
      <main>
        <GridContainer className="pb-16">
        {selectedTab === 'list' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search size={20} className="text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-foreground/20 bg-gray/50 text-foreground placeholder:text-foreground/50 border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                  className="border-foreground/20 bg-gray/50 text-foreground border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Types</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="blog">Blog</option>
                  <option value="plugin">Plugins</option>
                  <option value="download">Downloads</option>
                </select>
              </div>

              <button
                onClick={handleCreateNew}
                className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-4 py-2 text-white transition-colors"
              >
                <Plus size={20} />
                Create New
              </button>
            </div>

            {/* Content List */}
            {isLoading ? (
              <div className="border-foreground/20 bg-gray/50 border p-8 text-center">
                <div className="animate-pulse">
                  <div className="bg-foreground/20 mx-auto mb-4 h-16 w-16"></div>
                  <p className="text-foreground/60">Loading content...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="border-foreground/20 bg-gray/50 border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-2xl">{getTypeIcon(item.type)}</span>
                          <div>
                            <h3 className="neue-haas-grotesk-display text-foreground text-lg font-medium">
                              {item.title}
                            </h3>
                            <p className="text-foreground/70 text-sm">{item.description}</p>
                          </div>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-primary/20 text-primary px-2 py-1 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-foreground/60">
                          <span>Category: {item.category}</span>
                          <span>Updated: {formatDate(item.updatedAt)}</span>
                          {item.downloadCount && (
                            <span>Downloads: {item.downloadCount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-400 p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="border-foreground/20 bg-gray/50 border p-8 text-center">
                    <FileText size={48} className="text-foreground/40 mx-auto mb-4" />
                    <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                      No content found
                    </h3>
                    <p className="text-foreground/60 mb-4">
                      {searchQuery || selectedType !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Create your first content item to get started'
                      }
                    </p>
                    <button
                      onClick={handleCreateNew}
                      className="bg-primary hover:bg-primary/90 px-4 py-2 text-white transition-colors"
                    >
                      Create Content
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(selectedTab === 'create' || selectedTab === 'edit') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                {selectedTab === 'create' ? 'Create New Content' : 'Edit Content'}
              </h2>
              <button
                onClick={() => setSelectedTab('list')}
                className="text-foreground/60 hover:text-foreground flex items-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
            </div>

            <div className="border-foreground/20 bg-gray/50 border p-6">
              <GridContent cols={{ xs: 1, md: 2, xl: 2, '2xl': 2 }}>
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Content Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as ContentItem['type']})}
                      className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="blog">Blog Post</option>
                      <option value="portfolio">Portfolio Item</option>
                      <option value="plugin">Plugin</option>
                      <option value="download">Download</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="border-foreground/20 bg-gray text-foreground placeholder:text-foreground/50 w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter content title"
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="border-foreground/20 bg-gray text-foreground placeholder:text-foreground/50 w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter content description"
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="border-foreground/20 bg-gray text-foreground placeholder:text-foreground/50 w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Web Development, Design"
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="border-foreground/20 bg-gray text-foreground placeholder:text-foreground/50 w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="React, TypeScript, Design"
                    />
                  </div>

                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as ContentItem['status']})}
                      className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Content and Media */}
                <div className="space-y-4">
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Content (Markdown)
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={10}
                      className="border-foreground/20 bg-gray text-foreground placeholder:text-foreground/50 w-full border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="# Your Content Title&#10;&#10;Write your content in Markdown format..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Media Upload
                    </label>
                    <div className="border-foreground/20 border-2 border-dashed p-6 text-center">
                      <Upload size={48} className="text-foreground/40 mx-auto mb-4" />
                      <p className="text-foreground/60 mb-2">
                        Drag and drop files here, or click to select
                      </p>
                      <p className="text-foreground/40 text-sm">
                        Supports: Images, Videos, Documents (Max 10MB)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                        className="mt-4"
                      />
                    </div>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div>
                      <div className="text-foreground mb-2 flex items-center justify-between text-sm">
                        <span>Upload Progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="bg-foreground/20 h-2 w-full">
                        <div 
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </GridContent>

              <div className="mt-6 flex items-center justify-end gap-4">
                <button
                  onClick={() => setSelectedTab('list')}
                  className="border-foreground/20 text-foreground hover:bg-foreground/5 border px-6 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-6 py-2 text-white transition-colors"
                >
                  <Save size={20} />
                  {selectedTab === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
        </GridContainer>
      </main>
    </GridLayout>
  );
}